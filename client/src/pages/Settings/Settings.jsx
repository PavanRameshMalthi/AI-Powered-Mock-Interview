import { useState } from "react";
import { motion } from "framer-motion";
import { User, Palette, CheckCircle2 } from "lucide-react";

const Settings = () => {
  const user = JSON.parse(
    localStorage.getItem("user") || sessionStorage.getItem("user") || "null"
  );
  const [successMsg, setSuccessMsg] = useState("");

  const handleSave = (e) => {
    e.preventDefault();
    setSuccessMsg("Settings updated successfully!");
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  return (
    <motion.main 
      className="app-shell"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      style={{ display: "grid", gap: "24px", maxWidth: "800px", width: "100%" }}
    >
      {/* Page Header */}
      <header className="page-header">
        <p className="eyebrow">User Customizations</p>
        <h1 style={{ fontSize: "1.6rem", fontWeight: 700, margin: 0 }}>Settings</h1>
        <p className="muted" style={{ margin: "4px 0 0 0" }}>Manage your credentials, themes, and account preferences.</p>
      </header>

      {successMsg && (
        <div 
          style={{ 
            background: "rgba(34,197,94,0.08)", 
            border: "1px solid rgba(34,197,94,0.2)", 
            color: "#22C55E", 
            padding: "14px 18px", 
            borderRadius: "12px", 
            display: "flex",
            alignItems: "center",
            gap: "10px",
            fontSize: "0.9rem",
            fontWeight: "600" 
          }}
        >
          <CheckCircle2 size={16} /> {successMsg}
        </div>
      )}

      <div className="settings-grid" style={{ display: "grid", gap: "24px" }}>
        
        {/* Profile Info Section */}
        <section className="panel" style={{ padding: "28px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px", borderBottom: "1px solid var(--border)", paddingBottom: "12px" }}>
            <User style={{ color: "var(--primary)" }} size={20} />
            <h2 style={{ margin: 0, fontSize: "1.15rem", fontWeight: 700 }}>Profile Information</h2>
          </div>
          
          <form onSubmit={handleSave} style={{ display: "grid", gap: "20px" }}>
            <div style={{ display: "grid", gap: "6px" }}>
              <label style={{ fontWeight: "600", fontSize: "0.85rem", color: "var(--muted)" }}>Full Name</label>
              <input
                type="text"
                defaultValue={user?.name || ""}
                disabled
                style={{ 
                  width: "100%", 
                  padding: "12px 14px", 
                  borderRadius: "12px", 
                  border: "1px solid var(--border)", 
                  background: "rgba(255,255,255,0.02)", 
                  color: "var(--muted)",
                  cursor: "not-allowed"
                }}
              />
              <span style={{ fontSize: "0.75rem", color: "var(--muted)", fontStyle: "italic" }}>Contact your administrator to change profile names.</span>
            </div>
            
            <div style={{ display: "grid", gap: "6px" }}>
              <label style={{ fontWeight: "600", fontSize: "0.85rem", color: "var(--muted)" }}>Email Address</label>
              <input
                type="email"
                defaultValue={user?.email || ""}
                disabled
                style={{ 
                  width: "100%", 
                  padding: "12px 14px", 
                  borderRadius: "12px", 
                  border: "1px solid var(--border)", 
                  background: "rgba(255,255,255,0.02)", 
                  color: "var(--muted)",
                  cursor: "not-allowed"
                }}
              />
            </div>
            
            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ 
                justifySelf: "start",
                background: "linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)",
                color: "#fff",
                border: "none",
                fontWeight: 600,
                borderRadius: "10px",
                height: "42px",
                padding: "0 20px"
              }}
            >
              Save Profile Settings
            </button>
          </form>
        </section>

        {/* Preferences Section */}
        <section className="panel" style={{ padding: "28px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px", borderBottom: "1px solid var(--border)", paddingBottom: "12px" }}>
            <Palette style={{ color: "var(--accent)" }} size={20} />
            <h2 style={{ margin: 0, fontSize: "1.15rem", fontWeight: 700 }}>System Preferences</h2>
          </div>
          
          <div style={{ display: "grid", gap: "16px" }}>
            <p className="muted" style={{ margin: 0, fontSize: "0.88rem", lineHeight: 1.5 }}>
              Theme selection is managed globally via the floating theme selector at the top-right corner.
            </p>
            
            <div 
              style={{ 
                display: "flex", 
                justifyContent: "space-between", 
                alignItems: "center", 
                padding: "12px 0",
                borderTop: "1px solid var(--border)"
              }}
            >
              <div>
                <strong style={{ display: "block", fontSize: "0.9rem" }}>Voice-Synthesized Reading</strong>
                <span className="muted" style={{ fontSize: "0.78rem" }}>Activate voice reading prompts automatically for question cycles.</span>
              </div>
              <label className="switch" style={{ position: "relative", display: "inline-block", width: "44px", height: "24px" }}>
                <input 
                  type="checkbox" 
                  defaultChecked 
                  style={{ opacity: 0, width: 0, height: 0 }} 
                  onChange={() => {}}
                />
                <span 
                  className="slider"
                  style={{
                    position: "absolute",
                    cursor: "pointer",
                    top: 0, left: 0, right: 0, bottom: 0,
                    background: "var(--primary)",
                    borderRadius: "34px",
                    transition: "0.4s"
                  }}
                />
              </label>
            </div>
          </div>
        </section>
      </div>
    </motion.main>
  );
};

export default Settings;
