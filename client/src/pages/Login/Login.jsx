import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { showError, showSuccess } from "../../components/UI/Toast";
import PasswordField from "../../components/UI/PasswordField";
import authService from "../../services/authService";
import { Mail, CheckCircle, Award } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: true,
  });
  const [loading, setLoading] = useState(false);
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isValid = emailPattern.test(formData.email.trim()) && formData.password;

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
        {/* Subtle grid layout overlay */}
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

          {/* Floating visual cards list */}
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

      {/* ── Right Side: Glassmorphic Auth Card Form ── */}
      <section className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <motion.div
          className="panel"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          style={{
            width: "100%",
            maxWidth: "420px",
            padding: "40px",
            background: "rgba(30, 41, 59, 0.35)",
            backdropFilter: "blur(18px)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: "20px",
            boxShadow: "0 20px 40px -15px rgba(0, 0, 0, 0.4)"
          }}
        >
          {/* Logo fallback for mobile header link */}
          <div className="mb-8 text-center lg:hidden">
            <Link to="/" style={{ textDecoration: "none" }} className="text-base font-black tracking-tight text-white">
              AI Career Platform
            </Link>
          </div>

          <div className="mb-6">
            <p className="text-[10px] font-black uppercase tracking-wider text-indigo-400 mb-1">
              Welcome back
            </p>
            <h1 style={{ fontSize: "1.8rem", fontWeight: 900, margin: 0, color: "#fff" }}>Login</h1>
            <p className="mt-1.5 text-xs text-slate-400">
              Continue your interview practice dashboard.
            </p>
          </div>

          <form className="form-grid" style={{ display: "grid", gap: "18px" }} onSubmit={handleLogin}>
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
                autoComplete="current-password"
                onChange={handleChange}
                placeholder="Enter your password"
                value={formData.password}
              />
            </div>

            <div className="flex items-center justify-between mt-1 text-xs">
              <label className="flex items-center gap-2 text-slate-400 cursor-pointer select-none">
                <input
                  checked={formData.rememberMe}
                  name="rememberMe"
                  onChange={(event) =>
                    setFormData({ ...formData, rememberMe: event.target.checked })
                  }
                  type="checkbox"
                  style={{
                    width: "14px",
                    height: "14px",
                    borderRadius: "4px",
                    background: "rgba(11, 17, 32, 0.6)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    cursor: "pointer"
                  }}
                />
                Remember me
              </label>
              <Link to="/forgot-password" style={{ textDecoration: "none" }} className="text-indigo-400 font-bold hover:underline">
                Forgot password?
              </Link>
            </div>

            <button 
              className="btn btn-primary" 
              disabled={loading || !isValid}
              style={{
                background: "linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)",
                color: "#fff",
                fontWeight: 700,
                fontSize: "0.88rem",
                height: "44px",
                borderRadius: "10px",
                border: "none",
                marginTop: "10px",
                boxShadow: "0 4px 15px rgba(99, 102, 241, 0.2)",
                cursor: "pointer"
              }}
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <p className="text-center text-xs text-slate-400 mt-6" style={{ margin: "24px 0 0 0" }}>
            New here?{" "}
            <Link to="/register" style={{ textDecoration: "none" }} className="text-indigo-400 hover:underline font-black">
              Signup
            </Link>
          </p>
        </motion.div>
      </section>
    </main>
  );
};

export default Login;
