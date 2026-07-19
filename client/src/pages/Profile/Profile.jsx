import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Award, 
  BookOpen, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  TrendingUp, 
  User 
} from "lucide-react";
import dashboardService from "../../services/dashboardService";

const Profile = () => {
  const user = JSON.parse(
    localStorage.getItem("user") || sessionStorage.getItem("user") || "null"
  );
  const [summary, setSummary] = useState({
    completed: 0,
    averageScore: 0,
    recent: [],
  });
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    Promise.all([
      dashboardService.getDashboardSummary().catch(() => summary),
      dashboardService.getAnalytics().catch(() => null),
    ]).then(([summaryData, analyticsData]) => {
      setSummary(summaryData);
      setAnalytics(analyticsData);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const initials = (user?.name || user?.email || "AI")
    .split(/\s|@/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return (
    <motion.main 
      className="app-shell"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      style={{ display: "grid", gap: "28px", width: "100%" }}
    >
      {/* Profile Hero Block */}
      <section 
        className="panel"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          padding: "32px",
          gap: "24px"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "24px", flexWrap: "wrap" }}>
          {/* Custom Avatar Banner */}
          <div 
            style={{
              width: "80px",
              height: "80px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #6366F1, #8B5CF6)",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "2rem",
              fontWeight: 800,
              boxShadow: "0 0 20px rgba(99, 102, 241, 0.3)"
            }}
          >
            {initials}
          </div>
          <div>
            <span style={{ fontSize: "0.8rem", color: "var(--primary)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>Candidate Profile</span>
            <h1 style={{ fontSize: "1.8rem", fontWeight: 800, margin: "4px 0" }}>{user?.name || "Interview Candidate"}</h1>
            <p className="muted" style={{ margin: 0, display: "flex", alignItems: "center", gap: "6px", fontSize: "0.9rem" }}>
              <User size={14} /> {user?.email || "No email available"}
            </p>
          </div>
        </div>
        
        <Link 
          className="btn btn-primary" 
          to="/interview-setup"
          style={{
            background: "linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)",
            color: "#fff",
            fontWeight: 600,
            borderRadius: "10px",
            border: "none"
          }}
        >
          Start Practice Interview
        </Link>
      </section>

      {/* Stats Cards Row */}
      <section 
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "20px"
        }}
      >
        <article className="panel" style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "6px" }}>
          <span style={{ fontSize: "0.85rem", color: "var(--muted)" }}>Interviews Completed</span>
          <strong style={{ fontSize: "2rem", color: "var(--text)" }}>{summary.completed}</strong>
        </article>

        <article className="panel" style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "6px" }}>
          <span style={{ fontSize: "0.85rem", color: "var(--muted)" }}>Average Score</span>
          <strong style={{ fontSize: "2rem", color: "var(--primary)" }}>{summary.averageScore}%</strong>
        </article>

        <article className="panel" style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "6px" }}>
          <span style={{ fontSize: "0.85rem", color: "var(--muted)" }}>Best Score</span>
          <strong style={{ fontSize: "2rem", color: "var(--text)" }}>{analytics?.summary?.bestScore || 0}%</strong>
        </article>

        <article className="panel" style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "6px" }}>
          <span style={{ fontSize: "0.85rem", color: "var(--muted)" }}>Certificates Earned</span>
          <strong style={{ fontSize: "2rem", color: "var(--text)" }}>{summary.completed ? 1 : 0}</strong>
        </article>
      </section>

      {/* Bottom Grid content */}
      <section 
        style={{
          display: "grid",
          gridTemplateColumns: "1.4fr 1fr",
          gap: "24px",
          alignItems: "start"
        }}
        className="analytics-grid"
      >
        {/* Recent Interviews list */}
        <article className="panel" style={{ padding: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <h2 style={{ fontSize: "1.1rem", fontWeight: 700, margin: 0 }}>Recent Interviews</h2>
            <Link to="/history" style={{ fontSize: "0.82rem", color: "var(--primary)", fontWeight: 600, textDecoration: "none" }}>View history →</Link>
          </div>
          {summary.recent.length ? (
            <div style={{ display: "grid", gap: "12px" }}>
              {summary.recent.map((item) => (
                <div 
                  key={item._id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "12px 16px",
                    background: "rgba(255,255,255,0.01)",
                    border: "1px solid var(--border)",
                    borderRadius: "10px"
                  }}
                >
                  <span style={{ fontWeight: 600, fontSize: "0.9rem" }}>{item.role}</span>
                  <strong style={{ color: "var(--primary)" }}>{item.score || 0}%</strong>
                </div>
              ))}
            </div>
          ) : (
            <p className="empty-state" style={{ margin: 0, fontSize: "0.85rem", color: "var(--muted)", padding: "10px 0" }}>No interviews completed yet.</p>
          )}
        </article>

        {/* Readiness Profile */}
        <article className="panel" style={{ padding: "24px" }}>
          <h2 style={{ fontSize: "1.1rem", fontWeight: 700, margin: "0 0 16px 0" }}>Readiness Profile</h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }} className="tag-list">
            {(analytics?.strongSkillAreas?.length
              ? analytics.strongSkillAreas.map((item) => item.name)
              : ["Communication", "Problem Solving", "Role Fit"]
            ).map((item) => (
              <span 
                key={item}
                style={{
                  fontSize: "0.78rem",
                  fontWeight: 700,
                  padding: "6px 12px",
                  borderRadius: "20px",
                  background: "rgba(99, 102, 241, 0.1)",
                  color: "var(--primary)",
                  border: "1px solid rgba(99, 102, 241, 0.15)"
                }}
              >
                {item}
              </span>
            ))}
          </div>
        </article>
      </section>
    </motion.main>
  );
};

// Simple motion wrapper component for fallback in case motion isn't imported correctly.
const motionWrapper = (Component) => {
  return Component;
};

// Check if motion is available (it is in our environment)
const motionAvailable = typeof motion !== "undefined";
const profileExport = motionAvailable ? Profile : Profile;
export default Profile;
