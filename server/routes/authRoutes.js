const express = require("express");
const {
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
  linkedinAuth,
  phoneAuth,
} = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");
const {
  registerRules,
  loginRules,
  changePasswordRules,
  forgotPasswordRules,
  resetPasswordRules,
  verifyEmailRules,
} = require("../validators/authValidators");

const router = express.Router();

router.post("/register", registerRules, validate, registerUser);
router.post("/login", loginRules, validate, loginUser);
router.post("/refresh", refreshSession);
router.post("/logout", authMiddleware, logout);
router.post("/change-password", authMiddleware, changePasswordRules, validate, changePassword);
router.post("/forgot-password", forgotPasswordRules, validate, forgotPassword);
router.post("/reset-password", resetPasswordRules, validate, resetPassword);
router.post("/verify-email", verifyEmailRules, validate, verifyEmail);
router.post("/resend-verification", authMiddleware, resendEmailVerification);
router.post("/google", googleAuth);
router.post("/linkedin", linkedinAuth);
router.post("/phone", phoneAuth);

module.exports = router;
