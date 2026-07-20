import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { showError, showSuccess } from "../../components/UI/Toast";
import PasswordField, { PasswordStrength } from "../../components/UI/PasswordField";
import { getPasswordChecks } from "../../utils/passwordUtils";
import authService from "../../services/authService";
import { Mail, User, CheckCircle, Award } from "lucide-react";

const Register = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const checks = getPasswordChecks(formData.password);
  const passwordReady = Object.values(checks).every(Boolean);
  const passwordsMatch =
    formData.password && formData.password === formData.confirmPassword;
  const canSubmit =
    formData.name.trim() &&
    formData.email.trim() &&
    passwordReady &&
    passwordsMatch &&
    !loading;

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!passwordReady) {
      showError(
        "Password must include uppercase, lowercase, number, and special character"
      );
      return;
    }

    if (!passwordsMatch) {
      showError("Passwords do not match");
      return;
    }

    if (!emailPattern.test(formData.email.trim())) {
      showError("Enter a valid email address");
      return;
    }

    setLoading(true);

    try {
      const response = await authService.register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        rememberMe: true,
      });
      if (response.token) {
        storeSession(response);
        showSuccess("Account created");
        navigate("/dashboard");
        return;
      }

      showSuccess("Account created. Please sign in.");
      navigate("/login");
    } catch (error) {
      showError(error.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const storeSession = (response) => {
    localStorage.setItem("token", response.token);
    localStorage.setItem("user", JSON.stringify(response.user));
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
  };

  return (
    <main 
      className="min-h-screen bg-[#0B1120] text-slate-100 flex relative overflow-hidden"
      style={{ isolation: "isolate" }}
    >
      {/* ── Background Glow Effects ── */}
      <div 
        style={{
          position: "fixed",
          top: "-10%",
          left: "-10%",
          width: "40vw",
          height: "40vw",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(99, 102, 241, 0.08) 0%, transparent 70%)",
          zIndex: -1,
          filter: "blur(60px)",
          pointerEvents: "none"
        }}
      />
      <div 
        style={{
          position: "fixed",
          bottom: "-10%",
          right: "40%",
          width: "40vw",
          height: "40vw",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(139, 92, 246, 0.06) 0%, transparent 70%)",
          zIndex: -1,
          filter: "blur(60px)",
          pointerEvents: "none"
        }}
      />

      {/* ── Left Side: Interactive Branding Visual ── */}
      <section 
        className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative overflow-hidden"
        style={{
          background: "radial-gradient(circle at 0% 0%, rgba(30, 41, 59, 0.5) 0%, rgba(15, 23, 42, 0.8) 100%)",
          borderRight: "1px solid rgba(255, 255, 255, 0.05)"
        }}
      >
        <div 
          style={{
            position: "absolute",
            inset: 0,
            backgroundSize: "30px 30px",
            backgroundImage: "linear-gradient(to right, rgba(255, 255, 255, 0.01) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.01) 1px, transparent 1px)",
            pointerEvents: "none"
          }}
        />

        <div className="z-10">
          <Link to="/" style={{ textDecoration: "none" }} className="text-lg font-black tracking-tight text-white transition hover:text-indigo-400">
            AI Career Platform
          </Link>
        </div>

        <div className="z-10 max-w-md my-auto flex flex-col gap-6">
          <h2 className="text-4xl font-black leading-tight tracking-normal text-white">
            Accelerate your career readiness with AI.
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed">
            Configure tailored mock interview rounds, track ATS gaps for target roles, and practice until you explanation flows perfectly.
          </p>

          <div className="flex flex-col gap-4 mt-4">
            <div className="panel" style={{ padding: "16px", display: "flex", gap: "14px", alignItems: "center", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
              <div style={{ background: "rgba(99, 102, 241, 0.15)", color: "#6366F1", padding: "8px", borderRadius: "8px" }}>
                <CheckCircle size={16} />
              </div>
              <div>
                <strong className="block text-xs text-slate-200">Real-Time ATS Audits</strong>
                <span className="block text-[11px] text-slate-500">Scan and align resume keywords against jobs</span>
              </div>
            </div>

            <div className="panel" style={{ padding: "16px", display: "flex", gap: "14px", alignItems: "center", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
              <div style={{ background: "rgba(139, 92, 246, 0.15)", color: "#8B5CF6", padding: "8px", borderRadius: "8px" }}>
                <Award size={16} />
              </div>
              <div>
                <strong className="block text-xs text-slate-200">AI Guided Role Scenarios</strong>
                <span className="block text-[11px] text-slate-500">Practice questions requiring non-empty answers</span>
              </div>
            </div>
          </div>
        </div>

        <div className="z-10 flex gap-4 text-xs text-slate-500">
          <span>Secure AES encryption</span>
          <span>•</span>
          <span>Fast API endpoints</span>
        </div>
      </section>

      {/* ── Right Side: Register Glass Card ── */}
      <section className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 overflow-y-auto">
        <motion.div
          className="panel"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          style={{
            width: "100%",
            maxWidth: "460px",
            padding: "40px 36px",
            background: "rgba(30, 41, 59, 0.35)",
            backdropFilter: "blur(18px)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: "20px",
            boxShadow: "0 20px 40px -15px rgba(0, 0, 0, 0.4)",
            margin: "20px 0"
          }}
        >
          {/* Logo fallback for mobile */}
          <div className="mb-8 text-center lg:hidden">
            <Link to="/" style={{ textDecoration: "none" }} className="text-base font-black tracking-tight text-white">
              AI Career Platform
            </Link>
          </div>

          <div className="mb-6">
            <p className="text-[10px] font-black uppercase tracking-wider text-indigo-400 mb-1">
              Get interview ready
            </p>
            <h1 style={{ fontSize: "1.8rem", fontWeight: 900, margin: 0, color: "#fff" }}>Signup</h1>
            <p className="mt-1.5 text-xs text-slate-400">
              Use a work email or personal email you trust.
            </p>
          </div>

          <form className="form-grid" style={{ display: "grid", gap: "16px" }} onSubmit={handleSubmit}>
            <label className="text-xs font-bold text-slate-300" style={{ display: "grid", gap: "6px" }}>
              Full name
              <div style={{ position: "relative" }}>
                <User 
                  size={14} 
                  style={{
                    position: "absolute",
                    left: "14px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "var(--muted)"
                  }}
                />
                <input
                  autoComplete="name"
                  name="name"
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  required
                  type="text"
                  value={formData.name}
                  style={{
                    paddingLeft: "38px",
                    height: "44px",
                    fontSize: "0.85rem",
                    borderRadius: "10px",
                    background: "rgba(11, 17, 32, 0.6)",
                    border: "1px solid rgba(255, 255, 255, 0.06)",
                    color: "#fff"
                  }}
                  className="w-full focus:outline-none focus:border-indigo-500"
                />
              </div>
            </label>

            <label className="text-xs font-bold text-slate-300" style={{ display: "grid", gap: "6px" }}>
              Email
              <div style={{ position: "relative" }}>
                <Mail 
                  size={14} 
                  style={{
                    position: "absolute",
                    left: "14px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "var(--muted)"
                  }}
                />
                <input
                  autoComplete="email"
                  name="email"
                  onChange={handleChange}
                  placeholder="Enter your email address"
                  required
                  type="email"
                  value={formData.email}
                  style={{
                    paddingLeft: "38px",
                    height: "44px",
                    fontSize: "0.85rem",
                    borderRadius: "10px",
                    background: "rgba(11, 17, 32, 0.6)",
                    border: "1px solid rgba(255, 255, 255, 0.06)",
                    color: "#fff"
                  }}
                  className="w-full focus:outline-none focus:border-indigo-500"
                />
              </div>
            </label>

            <div style={{ display: "grid", gap: "6px" }} className="password-field-wrap">
              <PasswordField
                autoComplete="new-password"
                onChange={handleChange}
                placeholder="Create a password"
                value={formData.password}
              />
            </div>

            <div style={{ display: "grid", gap: "6px" }} className="password-field-wrap">
              <PasswordField
                autoComplete="new-password"
                label="Confirm password"
                name="confirmPassword"
                onChange={handleChange}
                placeholder="Confirm your password"
                value={formData.confirmPassword}
              />
            </div>

            <PasswordStrength
              confirmPassword={formData.confirmPassword}
              password={formData.password}
            />

            <button 
              className="btn btn-primary" 
              disabled={!canSubmit}
              style={{
                background: "linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)",
                color: "#fff",
                fontWeight: 700,
                fontSize: "0.88rem",
                height: "44px",
                borderRadius: "10px",
                border: "none",
                marginTop: "6px",
                boxShadow: "0 4px 15px rgba(99, 102, 241, 0.2)",
                cursor: "pointer"
              }}
            >
              {loading ? "Signing up..." : "Signup"}
            </button>
          </form>

          <p className="text-center text-xs text-slate-400 mt-6" style={{ margin: "24px 0 0 0" }}>
            Already have an account?{" "}
            <Link to="/login" style={{ textDecoration: "none" }} className="text-indigo-400 hover:underline font-black">
              Login
            </Link>
          </p>
        </motion.div>
      </section>
    </main>
  );
};

export default Register;
