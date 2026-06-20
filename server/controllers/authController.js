const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { AppError, asyncHandler } = require("../middleware/errorMiddleware");

const ACCESS_TOKEN_TTL = process.env.ACCESS_TOKEN_TTL || "15m";
const REFRESH_TOKEN_TTL_DAYS = Number(process.env.REFRESH_TOKEN_TTL_DAYS || 7);
const PHONE_OTP_TTL_MINUTES = Number(process.env.PHONE_OTP_TTL_MINUTES || 10);
const PASSWORD_RESET_TTL_MINUTES = Number(process.env.PASSWORD_RESET_TTL_MINUTES || 30);

const sanitizeUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  profilePicture: user.profilePicture,
  authProvider: user.authProvider,
  isEmailVerified: user.isEmailVerified,
  isPhoneVerified: user.isPhoneVerified,
  role: user.role,
});

const requireJwtSecret = () => {
  if (!process.env.JWT_SECRET) {
    throw new AppError("Authentication is not configured", 500);
  }
};

const hashToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");

const createAccessToken = (user) => {
  requireJwtSecret();

  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: ACCESS_TOKEN_TTL,
  });
};

const createRefreshToken = () => crypto.randomBytes(48).toString("hex");
const createOtp = () => String(crypto.randomInt(100000, 1000000));

const getClientUrl = () =>
  (process.env.CLIENT_URL || process.env.FRONTEND_URL || "http://localhost:5173").split(",")[0];

const getServerUrl = (req) =>
  (process.env.SERVER_URL || `${req.protocol}://${req.get("host")}`).replace(/\/$/, "");

const getOAuthRedirectUri = (provider, req) => {
  const envKey = provider === "google" ? "GOOGLE_REDIRECT_URI" : "LINKEDIN_REDIRECT_URI";
  return process.env[envKey] || `${getServerUrl(req)}/api/auth/${provider}/callback`;
};

const appendQuery = (url, params) => {
  const target = new URL(url);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) target.searchParams.set(key, value);
  });
  return target.toString();
};

const deliverMessage = async ({ to, subject, text }) => {
  if (process.env.NODE_ENV !== "test") {
    // Replace this with a transactional email/SMS provider in production.
    console.info(JSON.stringify({ channel: "auth-delivery", to, subject, text }));
  }

  return true;
};

const redirectWithSession = async (user, res) => {
  const session = await issueSession(user, res);
  res.redirect(
    appendQuery(`${getClientUrl().replace(/\/$/, "")}/login`, {
      token: session.token,
      user: Buffer.from(JSON.stringify(session.user)).toString("base64url"),
      auth: "success",
    })
  );
};

const findUserByEmailWithSecrets = async (email) => {
  const query = User.findOne({ email });
  if (query && typeof query.select === "function") {
    return query.select(
      "+password +refreshTokenHash +emailVerificationTokenHash +passwordResetTokenHash"
    );
  }

  return query;
};

const setRefreshCookie = (res, refreshToken, rememberMe = true) => {
  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  };

  if (rememberMe) {
    options.maxAge = REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000;
  }

  res.cookie("refreshToken", refreshToken, options);
};

const issueSession = async (user, res, options = {}) => {
  const token = createAccessToken(user);
  const refreshToken = createRefreshToken();
  user.refreshTokenHash = hashToken(refreshToken);
  await user.save?.();
  setRefreshCookie(res, refreshToken, options.rememberMe !== false);
  return { token, user: sanitizeUser(user) };
};

const upsertProviderUser = async ({
  provider,
  providerId,
  email,
  name,
  phone,
  profilePicture,
  extra = {},
}) => {
  const normalizedEmail = String(email || "").trim().toLowerCase();
  const normalizedPhone = String(phone || "").replace(/[^\d+]/g, "");
  const providerField = provider === "google" ? "googleId" : "linkedinId";
  const providerValue = String(providerId || normalizedEmail || normalizedPhone).trim();

  if (!providerValue) {
    throw new AppError(`${provider} login requires a verified profile identifier`, 400);
  }

  const providerQuery =
    provider === "phone"
      ? { phone: normalizedPhone, authProvider: "phone" }
      : { [providerField]: providerValue };
  let user = await User.findOne(providerQuery);

  if (!user && normalizedEmail) {
    user = await User.findOne({ email: normalizedEmail });
  }

  if (user) {
    user.name = user.name || name || "Candidate";
    user.phone = user.phone || normalizedPhone || undefined;
    user.profilePicture = user.profilePicture || profilePicture || undefined;
    user.authProvider = user.authProvider === "local" ? "local" : provider;
    if (provider !== "phone") user[providerField] = user[providerField] || providerValue;
    if (provider === "google") user.isEmailVerified = true;
    if (provider === "phone") user.isPhoneVerified = true;
    Object.assign(user, extra);
    await user.save?.();
    return user;
  }

  return User.create({
    name: name || (provider === "phone" ? `Phone user ${normalizedPhone.slice(-4)}` : "Candidate"),
    email: normalizedEmail || `${normalizedPhone.replace(/\D/g, "")}@phone.local`,
    phone: normalizedPhone || undefined,
    profilePicture,
    authProvider: provider,
    [providerField]: provider === "phone" ? undefined : providerValue,
    isEmailVerified: provider !== "phone",
    isPhoneVerified: provider === "phone",
    ...extra,
  });
};

const registerUser = asyncHandler(async (req, res) => {
  const name = String(req.body.name || "").trim();
  const email = String(req.body.email || "").trim().toLowerCase();
  const password = String(req.body.password || "");

  const userExists = await User.findOne({ email });

  if (userExists) {
    throw new AppError("An account already exists for this email", 409);
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  const emailVerificationToken = createRefreshToken();
  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    authProvider: "local",
    emailVerificationTokenHash: hashToken(emailVerificationToken),
    emailVerificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000),
  });

  const session = await issueSession(user, res, {
    rememberMe: req.body.rememberMe !== false,
  });

  const payload = {
    success: true,
    message: "User registered successfully",
    ...session,
  };

  if (process.env.NODE_ENV !== "production") {
    payload.emailVerificationToken = emailVerificationToken;
  }

  res.status(201).json(payload);
});

const loginUser = asyncHandler(async (req, res) => {
  const email = String(req.body.email || "").trim().toLowerCase();
  const password = String(req.body.password || "");

  const user = await findUserByEmailWithSecrets(email);
  const isMatch = user && user.password && (await bcrypt.compare(password, user.password));

  if (!isMatch) {
    throw new AppError("Invalid email or password", 401);
  }

  res.status(200).json({
    success: true,
    ...(await issueSession(user, res, { rememberMe: req.body.rememberMe !== false })),
  });
});

const refreshSession = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies?.refreshToken;

  if (!refreshToken) {
    throw new AppError("Refresh token is required", 401);
  }

  const user = await User.findOne({
    refreshTokenHash: hashToken(refreshToken),
  }).select("+refreshTokenHash");

  if (!user) {
    throw new AppError("Invalid refresh token", 401);
  }

  res.json({
    success: true,
    ...(await issueSession(user, res, { rememberMe: req.body.rememberMe !== false })),
  });
});

const logout = asyncHandler(async (req, res) => {
  if (req.user?.id) {
    await User.findByIdAndUpdate(req.user.id, { $unset: { refreshTokenHash: "" } });
  }

  res.clearCookie("refreshToken");
  res.json({ success: true, message: "Logged out successfully" });
});

const changePassword = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select("+password");

  if (!user || !(await bcrypt.compare(req.body.currentPassword, user.password || ""))) {
    throw new AppError("Current password is incorrect", 401);
  }

  user.password = await bcrypt.hash(req.body.password, 12);
  user.refreshTokenHash = undefined;
  await user.save();
  res.clearCookie("refreshToken");

  res.json({ success: true, message: "Password changed successfully" });
});

const forgotPassword = asyncHandler(async (req, res) => {
  const email = String(req.body.email || "").trim().toLowerCase();
  const user = await User.findOne({ email }).select("+passwordResetTokenHash");

  if (user) {
    const resetToken = createRefreshToken();
    user.passwordResetTokenHash = hashToken(resetToken);
    user.passwordResetExpires = new Date(Date.now() + PASSWORD_RESET_TTL_MINUTES * 60 * 1000);
    await user.save();

    const resetUrl = appendQuery(`${getClientUrl().replace(/\/$/, "")}/reset-password`, {
      token: resetToken,
    });
    await deliverMessage({
      to: email,
      subject: "Reset your AI Mock Interview password",
      text: `Use this secure link within ${PASSWORD_RESET_TTL_MINUTES} minutes: ${resetUrl}`,
    });

    if (process.env.NODE_ENV !== "production" || process.env.ALLOW_DEV_AUTH_SECRETS === "true") {
      return res.json({
        success: true,
        message: "Password reset instructions have been sent.",
        resetLink: resetUrl,
        resetToken,
      });
    }
  }

  res.json({
    success: true,
    message: "If an account exists, password reset instructions have been sent.",
  });
});

const exchangeOAuthCode = async ({ provider, code, redirectUri }) => {
  const config =
    provider === "google"
      ? {
          tokenUrl: "https://oauth2.googleapis.com/token",
          profileUrl: "https://www.googleapis.com/oauth2/v3/userinfo",
          clientId: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        }
      : {
          tokenUrl: "https://www.linkedin.com/oauth/v2/accessToken",
          profileUrl: "https://api.linkedin.com/v2/userinfo",
          clientId: process.env.LINKEDIN_CLIENT_ID,
          clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
        };

  if (!config.clientId || !config.clientSecret) {
    throw new AppError(`${provider} OAuth is not configured`, 500);
  }

  const tokenResponse = await fetch(config.tokenUrl, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
      client_id: config.clientId,
      client_secret: config.clientSecret,
    }),
  });

  if (!tokenResponse.ok) {
    throw new AppError(`${provider} OAuth token exchange failed`, 401);
  }

  const tokenPayload = await tokenResponse.json();
  const profileResponse = await fetch(config.profileUrl, {
    headers: { Authorization: `Bearer ${tokenPayload.access_token}` },
  });

  if (!profileResponse.ok) {
    throw new AppError(`${provider} profile lookup failed`, 401);
  }

  return profileResponse.json();
};

const startOAuth = (provider, req, res) => {
  const isGoogle = provider === "google";
  const clientId = isGoogle ? process.env.GOOGLE_CLIENT_ID : process.env.LINKEDIN_CLIENT_ID;

  if (!clientId) {
    throw new AppError(`${provider} OAuth client ID is not configured`, 500);
  }

  const redirectUri = getOAuthRedirectUri(provider, req);
  const state = createRefreshToken();
  res.cookie(`${provider}OAuthState`, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 10 * 60 * 1000,
  });

  const authUrl = new URL(
    isGoogle
      ? "https://accounts.google.com/o/oauth2/v2/auth"
      : "https://www.linkedin.com/oauth/v2/authorization"
  );
  authUrl.searchParams.set("client_id", clientId);
  authUrl.searchParams.set("redirect_uri", redirectUri);
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("state", state);
  authUrl.searchParams.set("scope", isGoogle ? "openid email profile" : "openid profile email");
  authUrl.searchParams.set("prompt", "select_account");

  res.redirect(authUrl.toString());
};

const googleStart = asyncHandler((req, res) => startOAuth("google", req, res));

const linkedinStart = asyncHandler((req, res) => startOAuth("linkedin", req, res));

const googleCallback = asyncHandler(async (req, res) => {
  if (!req.query.code || req.query.state !== req.cookies?.googleOAuthState) {
    throw new AppError("Google OAuth state is invalid", 401);
  }

  const redirectUri = getOAuthRedirectUri("google", req);
  const profile = await exchangeOAuthCode({
    provider: "google",
    code: req.query.code,
    redirectUri,
  });
  const user = await upsertProviderUser({
    provider: "google",
    providerId: profile.sub,
    email: profile.email,
    name: profile.name,
    profilePicture: profile.picture,
  });

  res.clearCookie("googleOAuthState");
  await redirectWithSession(user, res);
});

const linkedinCallback = asyncHandler(async (req, res) => {
  if (!req.query.code || req.query.state !== req.cookies?.linkedinOAuthState) {
    throw new AppError("LinkedIn OAuth state is invalid", 401);
  }

  const redirectUri = getOAuthRedirectUri("linkedin", req);
  const profile = await exchangeOAuthCode({
    provider: "linkedin",
    code: req.query.code,
    redirectUri,
  });
  const user = await upsertProviderUser({
    provider: "linkedin",
    providerId: profile.sub,
    email: profile.email,
    name: profile.name,
    profilePicture: profile.picture,
    extra: { linkedinHeadline: profile.localizedHeadline },
  });

  res.clearCookie("linkedinOAuthState");
  await redirectWithSession(user, res);
});

const resetPassword = asyncHandler(async (req, res) => {
  const tokenHash = hashToken(String(req.body.token || ""));
  const user = await User.findOne({
    passwordResetTokenHash: tokenHash,
    passwordResetExpires: { $gt: new Date() },
  });

  if (!user) {
    throw new AppError("Reset token is invalid or expired", 400);
  }

  user.password = await bcrypt.hash(req.body.password, 12);
  user.passwordResetTokenHash = undefined;
  user.passwordResetExpires = undefined;
  user.refreshTokenHash = undefined;
  await user.save();

  res.clearCookie("refreshToken");
  res.json({ success: true, message: "Password reset successfully" });
});

const verifyEmail = asyncHandler(async (req, res) => {
  const tokenHash = hashToken(String(req.body.token || ""));
  const user = await User.findOne({
    emailVerificationTokenHash: tokenHash,
    emailVerificationExpires: { $gt: new Date() },
  }).select("+emailVerificationTokenHash");

  if (!user) {
    throw new AppError("Verification token is invalid or expired", 400);
  }

  user.isEmailVerified = true;
  user.emailVerificationTokenHash = undefined;
  user.emailVerificationExpires = undefined;
  await user.save();

  res.json({ success: true, message: "Email verified successfully" });
});

const resendEmailVerification = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select("+emailVerificationTokenHash");

  if (!user) {
    throw new AppError("User not found", 404);
  }

  if (user.isEmailVerified) {
    return res.json({ success: true, message: "Email is already verified" });
  }

  const emailVerificationToken = createRefreshToken();
  user.emailVerificationTokenHash = hashToken(emailVerificationToken);
  user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
  await user.save();

  const payload = {
    success: true,
    message: "Verification instructions have been sent.",
  };

  if (process.env.NODE_ENV !== "production") {
    payload.emailVerificationToken = emailVerificationToken;
  }

  res.json(payload);
});

const googleAuth = asyncHandler(async (req, res) => {
  const user = await upsertProviderUser({
    provider: "google",
    providerId: req.body.googleId || req.body.idToken,
    email: req.body.email,
    name: req.body.name,
    profilePicture: req.body.profilePicture,
  });

  res.json({ success: true, ...(await issueSession(user, res)) });
});

const linkedinAuth = asyncHandler(async (req, res) => {
  const user = await upsertProviderUser({
    provider: "linkedin",
    providerId: req.body.linkedinId || req.body.accessToken,
    email: req.body.email,
    name: req.body.name,
    profilePicture: req.body.profilePicture,
    extra: { linkedinHeadline: req.body.headline },
  });

  res.json({ success: true, ...(await issueSession(user, res)) });
});

const sendPhoneOtp = asyncHandler(async (req, res) => {
  const phone = String(req.body.phone || "").replace(/[^\d+]/g, "");
  const otp = process.env.NODE_ENV === "production" ? createOtp() : "123456";
  const phoneEmail = `${phone.replace(/\D/g, "")}@phone.local`;
  let user = await User.findOne({ phone }).select("+phoneOtpHash +phoneOtpAttempts");

  if (!user) {
    user = await User.create({
      name: `Phone user ${phone.slice(-4)}`,
      email: phoneEmail,
      phone,
      authProvider: "phone",
      isEmailVerified: false,
      isPhoneVerified: false,
    });
  }

  user.phoneOtpHash = hashToken(otp);
  user.phoneOtpExpires = new Date(Date.now() + PHONE_OTP_TTL_MINUTES * 60 * 1000);
  user.phoneOtpAttempts = 0;
  await user.save?.();

  await deliverMessage({
    to: phone,
    subject: "AI Mock Interview OTP",
    text: `Your OTP is ${otp}. It expires in ${PHONE_OTP_TTL_MINUTES} minutes.`,
  });

  res.json({
    success: true,
    message: "OTP sent successfully",
    ...(process.env.NODE_ENV !== "production" ? { otp } : {}),
  });
});

const phoneAuth = asyncHandler(async (req, res) => {
  const phone = String(req.body.phone || "").replace(/[^\d+]/g, "");
  const otp = String(req.body.otp || "").trim();
  const user = await User.findOne({ phone }).select("+phoneOtpHash +phoneOtpAttempts");

  if (!user?.phoneOtpHash || !user.phoneOtpExpires || user.phoneOtpExpires <= new Date()) {
    throw new AppError("OTP is invalid or expired. Request a new OTP.", 401);
  }

  if ((user.phoneOtpAttempts || 0) >= 5) {
    throw new AppError("Too many OTP attempts. Request a new OTP.", 429);
  }

  if (user.phoneOtpHash !== hashToken(otp)) {
    user.phoneOtpAttempts = (user.phoneOtpAttempts || 0) + 1;
    await user.save?.();
    throw new AppError("Invalid OTP", 401);
  }

  user.phoneOtpHash = undefined;
  user.phoneOtpExpires = undefined;
  user.phoneOtpAttempts = 0;
  user.isPhoneVerified = true;
  await user.save?.();

  const sessionUser = await upsertProviderUser({
    provider: "phone",
    phone,
    name: req.body.name,
  });

  res.json({ success: true, ...(await issueSession(sessionUser, res)) });
});

module.exports = {
  registerUser,
  loginUser,
  refreshSession,
  logout,
  changePassword,
  forgotPassword,
  resetPassword,
  verifyEmail,
  resendEmailVerification,
  googleAuth,
  googleStart,
  googleCallback,
  linkedinAuth,
  linkedinStart,
  linkedinCallback,
  sendPhoneOtp,
  phoneAuth,
};
