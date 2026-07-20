import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronDown, User, Settings, LogOut, Menu } from "lucide-react";
import authService from "../services/authService";

const Topbar = ({ toggleSidebar }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const user = JSON.parse(
    localStorage.getItem("user") || sessionStorage.getItem("user") || "null"
  );

  const logout = async () => {
    try { await authService.logout(); } catch { /* Fallback */ }
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    navigate("/login");
  };

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header 
      className="topbar-container"
      style={{
        height: "70px",
        padding: "0 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        borderBottom: "1px solid var(--border)",
        background: "rgba(11, 17, 32, 0.7)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        position: "sticky",
        top: 0,
        zIndex: 20,
      }}
    >
      {/* Left: Mobile Sidebar Toggle */}
      <div className="mobile-toggle-wrap">
        <button 
          onClick={toggleSidebar} 
          className="btn-mobile-toggle"
          style={{
            background: "transparent",
            border: "none",
            color: "var(--muted)",
            cursor: "pointer",
            display: "none", // Managed by CSS media query
            padding: "8px",
            borderRadius: "8px"
          }}
          aria-label="Toggle Navigation Sidebar"
        >
          <Menu size={20} />
        </button>
      </div>

      {/* Right: Notifications & Profile */}
      {/* Right: Profile Dropdown */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        {/* Profile Dropdown Trigger */}
        <div ref={dropdownRef} style={{ position: "relative" }}>
          <button
            onClick={() => setDropdownOpen((prev) => !prev)}
            style={{
              background: "transparent",
              border: "none",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              cursor: "pointer",
              padding: "4px"
            }}
            aria-expanded={dropdownOpen}
          >
            <div 
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #6366F1, #8B5CF6)",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
                fontSize: "0.9rem",
                boxShadow: "0 0 10px rgba(99,102,241,0.2)"
              }}
            >
              {user?.name ? user.name[0].toUpperCase() : "U"}
            </div>
            <div className="profile-name-section" style={{ textAlign: "left" }}>
              <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text)" }}>
                {user?.name || "User"}
              </div>
            </div>
            <ChevronDown size={14} style={{ color: "var(--muted)", transform: dropdownOpen ? "rotate(180deg)" : "rotate(0)" }} />
          </button>

          {/* Dropdown Menu */}
          {dropdownOpen && (
            <div
              style={{
                position: "absolute",
                right: 0,
                marginTop: "8px",
                width: "180px",
                background: "rgba(30, 41, 59, 0.95)",
                backdropFilter: "blur(16px)",
                WebkitBackdropFilter: "blur(16px)",
                border: "1px solid var(--border)",
                borderRadius: "12px",
                padding: "6px",
                boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.4)",
                zIndex: 30,
                display: "grid",
                gap: "2px"
              }}
            >
              <Link
                to="/profile"
                onClick={() => setDropdownOpen(false)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "10px 12px",
                  fontSize: "0.85rem",
                  color: "var(--text)",
                  textDecoration: "none",
                  borderRadius: "8px",
                  transition: "background 0.2s ease"
                }}
                className="dropdown-item"
              >
                <User size={14} /> Profile
              </Link>
              <Link
                to="/settings"
                onClick={() => setDropdownOpen(false)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "10px 12px",
                  fontSize: "0.85rem",
                  color: "var(--text)",
                  textDecoration: "none",
                  borderRadius: "8px",
                  transition: "background 0.2s ease"
                }}
                className="dropdown-item"
              >
                <Settings size={14} /> Settings
              </Link>
              <div style={{ height: "1px", background: "var(--border)", margin: "4px 6px" }} />
              <button
                onClick={logout}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "10px 12px",
                  fontSize: "0.85rem",
                  color: "var(--danger)",
                  background: "transparent",
                  border: "none",
                  width: "100%",
                  textAlign: "left",
                  cursor: "pointer",
                  borderRadius: "8px",
                  transition: "background 0.2s ease"
                }}
                className="dropdown-item dropdown-logout"
              >
                <LogOut size={14} /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Topbar;
