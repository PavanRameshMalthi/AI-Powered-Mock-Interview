import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { showError, showSuccess } from "../../components/UI/Toast";
import authService from "../../services/authService";
import { Mail, ArrowLeft, Key } from "lucide-react";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetToken, setResetToken] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setResetToken("");

    try {
      const response = await authService.forgotPassword({ email });
      setResetToken(response.resetToken || "");
      showSuccess("Password reset instructions are ready");
    } catch (error) {
      showError(error.response?.data?.message || "Unable to start password reset");
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
          maxWidth: "420px",
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
            Account recovery
          </p>
          <h1 style={{ fontSize: "1.8rem", fontWeight: 900, margin: 0, color: "#fff" }}>Forgot password</h1>
          <p className="mt-1.5 text-xs text-slate-400">
            Enter your account email to receive reset instructions.
          </p>
        </div>

        <form className="form-grid" style={{ display: "grid", gap: "18px" }} onSubmit={handleSubmit}>
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
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Enter your email address"
                required
                type="email"
                value={email}
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

          <button 
            className="btn btn-primary" 
            disabled={loading || !email.trim()}
            style={{
              background: "linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)",
              color: "#fff",
              fontWeight: 700,
              fontSize: "0.88rem",
              height: "44px",
              borderRadius: "10px",
              border: "none",
              marginTop: "8px",
              boxShadow: "0 4px 15px rgba(99, 102, 241, 0.2)",
              cursor: "pointer"
            }}
          >
            {loading ? "Sending..." : "Send reset link"}
          </button>
        </form>

        {resetToken ? (
          <div 
            className="panel" 
            style={{ 
              marginTop: "20px", 
              padding: "16px", 
              background: "rgba(99,102,241,0.05)", 
              border: "1px solid rgba(99,102,241,0.15)",
              borderRadius: "10px",
              display: "flex",
              flexDirection: "column",
              gap: "8px"
            }}
          >
            <strong style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.75rem", color: "#8B5CF6" }}>
              <Key size={12} /> Development reset link
            </strong>
            <Link 
              to={`/reset-password?token=${encodeURIComponent(resetToken)}`}
              style={{ textDecoration: "none", fontSize: "0.75rem" }}
              className="text-indigo-400 font-bold hover:underline"
            >
              Continue to reset password
            </Link>
          </div>
        ) : null}

        <p className="text-center text-xs text-slate-400 mt-6" style={{ margin: "24px 0 0 0" }}>
          Remembered it?{" "}
          <Link to="/login" style={{ textDecoration: "none" }} className="text-indigo-400 hover:underline font-black inline-flex items-center gap-1">
            <ArrowLeft size={12} /> Login
          </Link>
        </p>
      </motion.div>
    </main>
  );
};

export default ForgotPassword;
