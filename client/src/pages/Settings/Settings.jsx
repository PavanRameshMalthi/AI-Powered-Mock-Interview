import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FaUser, FaLock, FaBell, FaPalette } from "react-icons/fa";

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
    <main className="app-shell narrow">
      <header className="page-header">
        <p className="eyebrow">User Settings</p>
        <h1>Settings</h1>
        <p className="muted">Manage your credentials, themes, and account preferences.</p>
      </header>

      {successMsg && (
        <div style={{ background: "rgba(61,214,189,0.1)", border: "1px solid var(--primary)", color: "var(--primary)", padding: "12px", borderRadius: "8px", marginBottom: "20px", fontWeight: "600" }}>
          {successMsg}
        </div>
      )}

      <div className="settings-grid" style={{ display: "grid", gap: "24px" }}>
        <section className="panel">
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "18px", borderBottom: "1px solid var(--border)", paddingBottom: "10px" }}>
            <FaUser style={{ color: "var(--primary)", fontSize: "1.2rem" }} />
            <h2 style={{ margin: 0, fontSize: "1.25rem" }}>Profile Information</h2>
          </div>
          <form onSubmit={handleSave} style={{ display: "grid", gap: "16px" }}>
            <div style={{ display: "grid", gap: "6px" }}>
              <label style={{ fontWeight: "600", fontSize: "0.9rem" }}>Full Name</label>
              <input
                type="text"
                defaultValue={user?.name || ""}
                disabled
                style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--border)", background: "rgba(255,255,255,0.02)", color: "var(--text)" }}
              />
            </div>
            <div style={{ display: "grid", gap: "6px" }}>
              <label style={{ fontWeight: "600", fontSize: "0.9rem" }}>Email Address</label>
              <input
                type="email"
                defaultValue={user?.email || ""}
                disabled
                style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--border)", background: "rgba(255,255,255,0.02)", color: "var(--text)" }}
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ justifySelf: "start" }}>
              Save Profile Settings
            </button>
          </form>
        </section>

        <section className="panel">
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "18px", borderBottom: "1px solid var(--border)", paddingBottom: "10px" }}>
            <FaPalette style={{ color: "var(--accent)", fontSize: "1.2rem" }} />
            <h2 style={{ margin: 0, fontSize: "1.25rem" }}>Preferences</h2>
          </div>
          <div style={{ display: "grid", gap: "12px" }}>
            <p className="muted" style={{ margin: 0, fontSize: "0.9rem" }}>
              Theme selection is managed globally via the floating theme selector at the top-right corner.
            </p>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0" }}>
              <div>
                <strong style={{ display: "block" }}>Notification Alerts</strong>
                <span className="muted" style={{ fontSize: "0.8rem" }}>Enable sound prompts for speaking questions</span>
              </div>
              <input type="checkbox" defaultChecked style={{ width: "20px", height: "20px", accentColor: "var(--primary)" }} />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
};

export default Settings;
