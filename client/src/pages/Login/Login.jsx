import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaLinkedin, FaPhoneAlt } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { showError, showSuccess } from "../../components/UI/Toast";
import PasswordField from "../../components/UI/PasswordField";
import authService from "../../services/authService";

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    phone: "",
    otp: "",
    rememberMe: true,
  });
  const [loading, setLoading] = useState(false);
  const [providerLoading, setProviderLoading] = useState("");
  const [phoneOtpSent, setPhoneOtpSent] = useState(false);
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phonePattern = /^\+?[1-9]\d{7,14}$/;
  const isValid = emailPattern.test(formData.email.trim()) && formData.password;

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const encodedUser = params.get("user");

    if (!token || !encodedUser) return;

    try {
      const base64 = encodedUser.replace(/-/g, "+").replace(/_/g, "/");
      const paddedBase64 = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
      localStorage.setItem("token", token);
      localStorage.setItem("user", atob(paddedBase64));
      window.history.replaceState({}, "", "/dashboard");
      navigate("/dashboard", { replace: true });
    } catch {
      showError("Unable to restore OAuth session");
    }
  }, [navigate]);

  const storeSession = (response) => {
    const storage = formData.rememberMe ? localStorage : sessionStorage;
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    storage.setItem("token", response.token);
    storage.setItem("user", JSON.stringify(response.user));
  };

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  const handleLogin = async (event) => {
    event.preventDefault();

    if (!emailPattern.test(formData.email.trim())) {
      showError("Enter a valid email address");
      return;
    }

    if (!formData.password) {
      showError("Enter your password");
      return;
    }

    setLoading(true);

    try {
      const credentials = {
        email: formData.email,
        password: formData.password,
        rememberMe: formData.rememberMe,
      };
      const response = await authService.login(credentials);
      storeSession(response);
      showSuccess("Welcome back");
      navigate("/dashboard");
    } catch (error) {
      showError(error.response?.data?.message || "Unable to sign in");
    } finally {
      setLoading(false);
    }
  };

  const handleProviderLogin = async (provider) => {
    if (provider === "google") {
      window.location.assign(authService.getOAuthStartUrl("google"));
      return;
    }

    if (provider === "linkedin") {
      window.location.assign(authService.getOAuthStartUrl("linkedin"));
      return;
    }

    if (provider === "phone") {
      const normalizedPhone = formData.phone.trim().replace(/[^\d+]/g, "");

      if (!phonePattern.test(normalizedPhone)) {
        showError("Enter a valid phone number");
        return;
      }

      if (!phoneOtpSent) {
        setProviderLoading(provider);
        try {
          const response = await authService.sendPhoneOtp({ phone: normalizedPhone });
          setPhoneOtpSent(true);
          if (response.otp) {
            setFormData((current) => ({ ...current, otp: response.otp }));
          }
          showSuccess("OTP sent successfully");
        } catch (error) {
          showError(error.response?.data?.message || "Unable to send OTP");
        } finally {
          setProviderLoading("");
        }
        return;
      }

      if (!formData.otp.trim()) {
        showError("Enter OTP");
        return;
      }
    }

    setProviderLoading(provider);

    try {
      let response;
      const email = formData.email.trim().toLowerCase();
      const name = email ? email.split("@")[0] : "Demo Candidate";

      if (provider === "google") {
        response = await authService.googleLogin({
          email: email || "google.demo@example.com",
          name,
          googleId: `google:${email || "demo"}`,
        });
      }

      if (provider === "linkedin") {
        response = await authService.linkedinLogin({
          email: email || "linkedin.demo@example.com",
          name,
          linkedinId: `linkedin:${email || "demo"}`,
          headline: "Interview candidate",
        });
      }

      if (provider === "phone") {
        response = await authService.phoneLogin({
          phone: formData.phone.trim().replace(/[^\d+]/g, ""),
          otp: formData.otp,
          name: "Phone Candidate",
        });
      }

      storeSession(response);
      showSuccess("Signed in successfully");
      navigate("/dashboard");
    } catch (error) {
      showError(error.response?.data?.message || "Provider sign-in failed");
    } finally {
      setProviderLoading("");
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-card">
        <p className="eyebrow">Welcome back</p>
        <h1>Sign in</h1>
        <p className="muted">Continue your interview practice dashboard.</p>

        <form className="form-grid" onSubmit={handleLogin}>
          <label>
            Email
            <input
              autoComplete="email"
              name="email"
              onChange={handleChange}
              placeholder="Enter your email address"
              required
              type="email"
              value={formData.email}
            />
          </label>

          <PasswordField
            autoComplete="current-password"
            onChange={handleChange}
            placeholder="Enter your password"
            value={formData.password}
          />

          <div className="form-row">
            <label>
              Phone
              <input
                autoComplete="tel"
                name="phone"
                onChange={handleChange}
                placeholder="Enter your phone number"
                type="tel"
                value={formData.phone}
              />
            </label>
            <label>
              OTP
              <input
                inputMode="numeric"
                name="otp"
                onChange={handleChange}
                placeholder="Enter OTP"
                type="text"
                value={formData.otp}
              />
            </label>
          </div>

          <div className="auth-options">
            <label className="checkbox-row">
              <input
                checked={formData.rememberMe}
                name="rememberMe"
                onChange={(event) =>
                  setFormData({ ...formData, rememberMe: event.target.checked })
                }
                type="checkbox"
              />
              Remember me
            </label>
            <Link to="/forgot-password">Forgot password?</Link>
          </div>

          <button className="btn btn-primary full-width" disabled={loading || !isValid}>
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <div className="auth-providers" aria-label="Alternative sign in options">
          <button
            className="btn btn-secondary full-width"
            disabled={Boolean(providerLoading)}
            onClick={() => handleProviderLogin("google")}
            type="button"
          >
            <FcGoogle aria-hidden="true" /> {providerLoading === "google" ? "Connecting..." : "Continue with Google"}
          </button>
          <button
            className="btn btn-secondary full-width"
            disabled={Boolean(providerLoading)}
            onClick={() => handleProviderLogin("linkedin")}
            type="button"
          >
            <FaLinkedin aria-hidden="true" /> {providerLoading === "linkedin" ? "Connecting..." : "Continue with LinkedIn"}
          </button>
          <button
            className="btn btn-secondary full-width"
            disabled={Boolean(providerLoading) || !formData.phone.trim()}
            onClick={() => handleProviderLogin("phone")}
            type="button"
          >
            <FaPhoneAlt aria-hidden="true" /> {providerLoading === "phone" ? "Working..." : phoneOtpSent ? "Verify OTP" : "Continue with Phone Number"}
          </button>
        </div>

        <p className="auth-switch">
          New here? <Link to="/register">Create an account</Link>
        </p>
      </section>
    </main>
  );
};

export default Login;
