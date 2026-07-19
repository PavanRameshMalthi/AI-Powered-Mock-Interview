import { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { showError, showSuccess } from "../../components/UI/Toast";
import PasswordField, { PasswordStrength } from "../../components/UI/PasswordField";
import { getPasswordChecks } from "../../utils/passwordUtils";
import authService from "../../services/authService";
import { Key, ArrowLeft } from "lucide-react";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [formData, setFormData] = useState({
    token: searchParams.get("token") || "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const checks = useMemo(() => getPasswordChecks(formData.password), [formData.password]);
  const passwordReady = Object.values(checks).every(Boolean);
  const passwordsMatch = formData.password && formData.password === formData.confirmPassword;

  const handleChange = (event) => {
    setFormData({ ...formData, [event.target.name]: event.target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!passwordReady) {
      showError("Use a stronger password");
      return;
    }

    if (!passwordsMatch) {
      showError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      await authService.resetPassword({
        token: formData.token,
        password: formData.password,
      });
      showSuccess("Password reset successfully");
      navigate("/login");
    } catch (error) {
      showError(error.response?.data?.message || "Unable to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main 
      className="min-h-screen bg-[#0B1120] text-slate-100 flex items-center justify-center p-6 relative overflow-hidden"
      style={{ isolation: "isolate" }}
    >
      {/* ── Background Glow Effects ── */}
      <div 
        style={{
          position: "fixed",
          top: "10%",
          left: "10%",
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
          bottom: "10%",
          right: "10%",
          width: "40vw",
          height: "40vw",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(139, 92, 246, 0.06) 0%, transparent 70%)",
          zIndex: -1,
          filter: "blur(60px)",
          pointerEvents: "none"
        }}
      />

      <motion.div
        className="panel"
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        style={{
          width: "100%",
          maxWidth: "440px",
          padding: "40px",
          background: "rgba(30, 41, 59, 0.35)",
          backdropFilter: "blur(18px)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          borderRadius: "20px",
          boxShadow: "0 20px 40px -15px rgba(0, 0, 0, 0.4)"
        }}
      >
        <div className="mb-6">
          <p className="text-[10px] font-black uppercase tracking-wider text-indigo-400 mb-1">
            Secure reset
          </p>
          <h1 style={{ fontSize: "1.8rem", fontWeight: 900, margin: 0, color: "#fff" }}>Reset password</h1>
          <p className="mt-1.5 text-xs text-slate-400">
            Choose a new password for your account.
          </p>
        </div>

        <form className="form-grid" style={{ display: "grid", gap: "18px" }} onSubmit={handleSubmit}>
          <label className="text-xs font-bold text-slate-300" style={{ display: "grid", gap: "6px" }}>
            Reset token
            <div style={{ position: "relative" }}>
              <Key 
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
                name="token"
                onChange={handleChange}
                placeholder="Paste reset token"
                required
                type="text"
                value={formData.token}
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
              placeholder="Enter your password"
              value={formData.password}
            />
          </div>

          <div style={{ display: "grid", gap: "6px" }} className="password-field-wrap">
            <PasswordField
              autoComplete="new-password"
              label="Confirm password"
              name="confirmPassword"
              onChange={handleChange}
              placeholder="Re-enter new password"
              value={formData.confirmPassword}
            />
          </div>

          <PasswordStrength
            confirmPassword={formData.confirmPassword}
            password={formData.password}
          />

          <button
            className="btn btn-primary"
            disabled={loading || !formData.token || !passwordReady || !passwordsMatch}
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
            {loading ? "Resetting..." : "Reset password"}
          </button>
        </form>

        <p className="text-center text-xs text-slate-400 mt-6" style={{ margin: "24px 0 0 0" }}>
          Back to{" "}
          <Link to="/login" style={{ textDecoration: "none" }} className="text-indigo-400 hover:underline font-black inline-flex items-center gap-1">
            <ArrowLeft size={12} /> Login
          </Link>
        </p>
      </motion.div>
    </main>
  );
};

export default ResetPassword;
