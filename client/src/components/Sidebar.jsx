import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  FaChartLine,
  FaHistory,
  FaFileUpload,
  FaUser,
  FaCog,
  FaFileAlt,
  FaSignOutAlt,
  FaShieldAlt,
  FaBars,
  FaTimes,
} from "react-icons/fa";
import authService from "../services/authService";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const user = JSON.parse(
    localStorage.getItem("user") || sessionStorage.getItem("user") || "null"
  );

  const logout = async () => {
    try {
      await authService.logout();
    } catch (e) {
      // safe fallback
    }
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    navigate("/login");
  };

  const menuGroups = [
    {
      title: "MAIN",
      items: [{ name: "Dashboard", path: "/dashboard", icon: <FaChartLine /> }],
    },
    {
      title: "INTERVIEW",
      items: [
        { name: "Mock Interview", path: "/interview-setup", icon: <FaFileUpload /> },
        { name: "Interview History", path: "/history", icon: <FaHistory /> },
      ],
    },
    {
      title: "RESUME",
      items: [
        { name: "Upload Resume", path: "/resume-upload", icon: <FaFileUpload /> },
        { name: "Resume Builder", path: "/resume-builder", icon: <FaFileAlt /> },
      ],
    },
    {
      title: "ACCOUNT",
      items: [
        { name: "Profile", path: "/profile", icon: <FaUser /> },
        { name: "Settings", path: "/settings", icon: <FaCog /> },
      ],
    },
  ];

  if (user?.role === "admin") {
    menuGroups.push({
      title: "ADMIN",
      items: [{ name: "Admin Panel", path: "/admin", icon: <FaShieldAlt /> }],
    });
  }

  const toggleSidebar = () => setIsOpen(!isOpen);

  return (
    <>
      {/* Mobile Header Menu Bar */}
      <div className="mobile-header">
        <button className="mobile-menu-btn" onClick={toggleSidebar} aria-label="Toggle menu">
          <FaBars />
        </button>
        <span className="mobile-logo-text">AI Mock Interview</span>
      </div>

      {/* Sidebar navigation */}
      <aside className={`app-sidebar ${isOpen ? "open" : ""}`}>
        <div className="sidebar-logo">
          <FaFileAlt className="sidebar-logo-icon" />
          <span>AI Interview</span>
          <button className="mobile-close-btn" onClick={toggleSidebar} aria-label="Close menu">
            <FaTimes />
          </button>
        </div>

        <nav className="sidebar-nav" style={{ overflowY: "auto", flexGrow: 1, paddingRight: "4px" }}>
          {menuGroups.map((group, gIdx) => (
            <div key={group.title} className="sidebar-group" style={{ marginBottom: "16px" }}>
              {gIdx > 0 && <hr className="sidebar-divider" style={{ border: "none", borderTop: "1px solid var(--border)", margin: "12px 0 16px 0", opacity: 0.4 }} />}
              <span className="sidebar-group-title" style={{ fontSize: "0.72rem", fontWeight: "800", color: "var(--muted)", letterSpacing: "0.08em", paddingLeft: "16px", display: "block", marginBottom: "8px", textTransform: "uppercase" }}>
                {group.title}
              </span>
              <div className="sidebar-group-items" style={{ display: "grid", gap: "4px" }}>
                {group.items.map((item) => (
                  <NavLink
                    key={item.name}
                    to={item.path}
                    className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}
                    onClick={() => setIsOpen(false)}
                  >
                    {item.icon}
                    <span>{item.name}</span>
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="sidebar-logout-btn" onClick={logout}>
            <FaSignOutAlt />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile Drawer Backdrop */}
      {isOpen && <div className="sidebar-backdrop" onClick={toggleSidebar} />}
    </>
  );
};

export default Sidebar;
