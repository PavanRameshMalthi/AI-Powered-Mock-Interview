import React from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  FileText, 
  UploadCloud, 
  Gauge, 
  Video, 
  History, 
  User, 
  Settings, 
  LogOut, 
  ChevronLeft, 
  ChevronRight,
  X 
} from "lucide-react";
import authService from "../services/authService";

const Sidebar = ({ isOpen, setIsOpen, isCollapsed, setIsCollapsed }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(
    localStorage.getItem("user") || sessionStorage.getItem("user") || "null"
  );

  const logout = async () => {
    try { await authService.logout(); } catch (e) { /* Safe fallback */ }
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    navigate("/login");
  };

  const menuGroups = [
    {
      title: "MAIN",
      items: [
        { name: "Dashboard", path: "/dashboard", icon: <LayoutDashboard size={20} /> }
      ],
    },
    {
      title: "CAREER",
      items: [
        { name: "Resume Builder", path: "/resume-builder", icon: <FileText size={20} /> },
        { name: "Upload Resume", path: "/resume-upload", icon: <UploadCloud size={20} /> },
        { name: "ATS Analysis", path: "/resume-upload?view=ats", icon: <Gauge size={20} /> },
      ],
    },
    {
      title: "INTERVIEW",
      items: [
        { name: "Mock Interview", path: "/interview-setup", icon: <Video size={20} /> },
        { name: "Interview History", path: "/history", icon: <History size={20} /> },
      ],
    },
    {
      title: "ACCOUNT",
      items: [
        { name: "Profile", path: "/profile", icon: <User size={20} /> },
        { name: "Settings", path: "/settings", icon: <Settings size={20} /> },
      ],
    },
  ];

  if (user?.role === "admin") {
    menuGroups.push({
      title: "ADMIN",
      items: [
        { name: "Admin Panel", path: "/admin", icon: <Settings size={20} /> }
      ]
    });
  }

  const toggleCollapse = () => {
    setIsCollapsed((prev) => !prev);
  };

  return (
    <>
      {/* Sidebar drawer container */}
      <aside 
        className={`app-sidebar ${isCollapsed ? "collapsed" : ""} ${isOpen ? "mobile-open" : ""}`}
        style={{
          width: isCollapsed ? "72px" : "260px",
          height: "100vh",
          background: "rgba(17, 24, 39, 0.65)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderRight: "1px solid var(--border)",
          position: "sticky",
          top: 0,
          zIndex: 100,
          display: "flex",
          flexDirection: "column",
          padding: "20px 14px",
          transition: "width 0.3s cubic-bezier(0.4, 0, 0.2, 1), transform 0.3s ease",
        }}
      >
        {/* Header / Logo */}
        <div 
          style={{ 
            display: "flex", 
            alignItems: "center", 
            justifyContent: isCollapsed ? "center" : "space-between",
            marginBottom: "30px",
            position: "relative"
          }}
        >
          {!isCollapsed && (
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div 
                style={{ 
                  background: "linear-gradient(135deg, #6366F1, #8B5CF6)", 
                  padding: "8px", 
                  borderRadius: "10px", 
                  display: "flex",
                  boxShadow: "0 0 15px rgba(99,102,241,0.3)"
                }}
              >
                <Video size={18} color="#fff" />
              </div>
              <span style={{ fontSize: "1.1rem", fontWeight: 700, letterSpacing: "-0.02em", color: "var(--text)" }}>
                AI Career
              </span>
            </div>
          )}
          {isCollapsed && (
            <div 
              style={{ 
                background: "linear-gradient(135deg, #6366F1, #8B5CF6)", 
                padding: "8px", 
                borderRadius: "10px", 
                display: "flex",
                boxShadow: "0 0 15px rgba(99,102,241,0.3)",
                cursor: "pointer"
              }}
              onClick={toggleCollapse}
            >
              <Video size={18} color="#fff" />
            </div>
          )}
          
          {/* Close mobile drawer */}
          <button 
            className="mobile-close-btn"
            onClick={() => setIsOpen(false)}
            style={{
              background: "transparent",
              border: "none",
              color: "var(--muted)",
              cursor: "pointer",
              padding: "4px",
              display: "none"
            }}
            aria-label="Close Sidebar"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation list */}
        <nav 
          style={{ 
            flexGrow: 1, 
            overflowY: "auto", 
            overflowX: "hidden", 
            display: "grid", 
            gap: "24px",
            paddingRight: isCollapsed ? "0" : "4px" 
          }}
          className="sidebar-scrollbar"
        >
          {menuGroups.map((group) => (
            <div key={group.title} style={{ display: "grid", gap: "6px" }}>
              {!isCollapsed && (
                <span 
                  style={{ 
                    fontSize: "0.7rem", 
                    fontWeight: 700, 
                    color: "var(--muted)", 
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    paddingLeft: "10px",
                    marginBottom: "4px"
                  }}
                >
                  {group.title}
                </span>
              )}
              {isCollapsed && <div style={{ height: "1px", background: "var(--border)", margin: "4px 8px" }} />}
              
              <div style={{ display: "grid", gap: "4px" }}>
                {group.items.map((item) => {
                  // Handle exact active match, specially for view query params
                  const isActive = item.path.includes("?") 
                    ? location.pathname + location.search === item.path
                    : location.pathname === item.path && !location.search.includes("view=ats");

                  return (
                    <NavLink
                      key={item.name}
                      to={item.path}
                      className={`sidebar-link-item ${isActive ? "active-saas" : ""}`}
                      onClick={() => setIsOpen(false)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: isCollapsed ? "center" : "flex-start",
                        gap: isCollapsed ? "0" : "12px",
                        padding: "10px 14px",
                        borderRadius: "10px",
                        color: isActive ? "var(--text)" : "var(--muted)",
                        textDecoration: "none",
                        fontSize: "0.88rem",
                        fontWeight: isActive ? 600 : 500,
                        background: isActive 
                          ? "linear-gradient(135deg, rgba(99,102,241,0.18) 0%, rgba(139,92,246,0.18) 100%)" 
                          : "transparent",
                        border: isActive ? "1px solid rgba(139,92,246,0.2)" : "1px solid transparent",
                        transition: "all 0.2s ease",
                      }}
                      title={isCollapsed ? item.name : undefined}
                    >
                      <span style={{ 
                        display: "flex", 
                        color: isActive ? "var(--primary)" : "inherit",
                        transition: "color 0.2s" 
                      }}>
                        {item.icon}
                      </span>
                      {!isCollapsed && <span>{item.name}</span>}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer actions */}
        <div style={{ display: "grid", gap: "10px", marginTop: "20px" }}>
          {/* Collapse sidebar button (desktop only) */}
          <button
            onClick={toggleCollapse}
            className="btn-collapse-toggle"
            style={{
              background: "rgba(255,255,255,0.02)",
              border: "1px solid var(--border)",
              borderRadius: "10px",
              color: "var(--muted)",
              padding: "10px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.2s"
            }}
            aria-label="Toggle Collapse Sidebar"
          >
            {isCollapsed ? <ChevronRight size={16} /> : <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.8rem" }}><ChevronLeft size={16} /> Collapse Sidebar</div>}
          </button>

          <button 
            className="sidebar-logout-btn-saas" 
            onClick={logout}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: isCollapsed ? "center" : "flex-start",
              gap: isCollapsed ? "0" : "12px",
              padding: "12px 14px",
              borderRadius: "10px",
              color: "var(--danger)",
              background: "rgba(239, 68, 68, 0.05)",
              border: "1px solid rgba(239, 68, 68, 0.08)",
              cursor: "pointer",
              fontWeight: 600,
              fontSize: "0.88rem",
              transition: "all 0.2s"
            }}
          >
            <LogOut size={20} />
            {!isCollapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Backdrop for mobile drawer */}
      {isOpen && (
        <div 
          className="sidebar-backdrop-saas" 
          onClick={() => setIsOpen(false)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.5)",
            backdropFilter: "blur(4px)",
            WebkitBackdropFilter: "blur(4px)",
            zIndex: 99,
          }}
        />
      )}
    </>
  );
};

export default Sidebar;
