import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  TrendingUp, 
  Award, 
  Calendar, 
  ArrowUpRight, 
  FileText, 
  CheckCircle2, 
  Activity, 
  Plus, 
  BookOpen, 
  Flame,
  Gauge
} from "lucide-react";
import ChartPanel from "../../components/UI/ChartPanel";
import dashboardService from "../../services/dashboardService";

const Sparkline = ({ stroke = "#6366F1", points = "0,15 10,8 20,12 30,5 40,9 50,2 60,10 70,3 80,12" }) => (
  <svg width="80" height="20" style={{ opacity: 0.8, overflow: "visible" }}>
    <polyline
      fill="none"
      stroke={stroke}
      strokeWidth="1.5"
      points={points}
    />
  </svg>
);
const Dashboard = () => {
  const navigate = useNavigate();
  const user = JSON.parse(
    localStorage.getItem("user") || sessionStorage.getItem("user") || "null"
  );
  const [summary, setSummary] = useState({ completed: 0, averageScore: 0, recent: [] });
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      dashboardService.getDashboardSummary(),
      dashboardService.getAnalytics().catch(() => null),
    ])
      .then(([summaryData, analyticsData]) => {
        setSummary(summaryData);
        setAnalytics(analyticsData);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 15 } },
  };

  const bestScore = analytics?.summary?.bestScore || 0;
  const streak = analytics?.summary?.interviewStreak || 0;

  return (
    <motion.main
      className="dashboard-container"
      initial="hidden"
      animate="show"
      variants={containerVariants}
      style={{ display: "grid", gap: "28px" }}
    >
      {/* ── Welcome Banner ── */}
      <motion.section 
        className="welcome-banner" 
        variants={itemVariants}
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px"
        }}
      >
        <div>
          <h1 style={{ fontSize: "1.8rem", fontWeight: 700, letterSpacing: "-0.02em", margin: "0 0 6px 0", color: "var(--text)" }}>
            Welcome back, {user?.name || "Pavan"}! 👋
          </h1>
          <p style={{ margin: 0, color: "var(--muted)", fontSize: "0.92rem" }}>
            Track your progress and improve your career journey with AI.
          </p>
        </div>
        
        <Link
          to="/interview-setup"
          className="btn btn-primary"
          style={{
            background: "linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)",
            color: "#fff",
            fontWeight: 600,
            fontSize: "0.88rem",
            padding: "10px 20px",
            borderRadius: "10px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            boxShadow: "0 4px 20px rgba(99,102,241,0.25)",
            cursor: "pointer",
            border: "none",
            height: "44px",
            textDecoration: "none"
          }}
        >
          <Plus size={16} /> Start Interview
        </Link>
      </motion.section>

      {/* ── Stats Grid ── */}
      <motion.section 
        className="stats-grid" 
        variants={itemVariants}
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "20px"
        }}
      >
        {/* Card 1: Total Interviews */}
        <article className="panel" style={{ display: "flex", flexDirection: "column", justifyBetween: "center", minHeight: "130px", padding: "20px", position: "relative", overflow: "hidden" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <span style={{ fontSize: "0.85rem", fontWeight: 500, color: "var(--muted)" }}>Total Interviews</span>
            <div style={{ background: "rgba(139,92,246,0.1)", padding: "8px", borderRadius: "8px", color: "#8B5CF6" }}>
              <Calendar size={18} />
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: "8px", marginBottom: "6px" }}>
            <strong style={{ fontSize: "2rem", fontWeight: 700, color: "var(--text)" }}>
              {loading ? "…" : summary.completed}
            </strong>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "0.78rem", fontWeight: 600, color: "#8B5CF6" }}>Practice count</span>
            <Sparkline stroke="#8B5CF6" points="0,15 15,13 35,9 50,11 65,7 80,4" />
          </div>
        </article>

        {/* Card 2: Average Score */}
        <article className="panel" style={{ display: "flex", flexDirection: "column", justifyBetween: "center", minHeight: "130px", padding: "20px", position: "relative", overflow: "hidden" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <span style={{ fontSize: "0.85rem", fontWeight: 500, color: "var(--muted)" }}>Average Score</span>
            <div style={{ background: "rgba(99,102,241,0.1)", padding: "8px", borderRadius: "8px", color: "#6366F1" }}>
              <TrendingUp size={18} />
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: "8px", marginBottom: "6px" }}>
            <strong style={{ fontSize: "2rem", fontWeight: 700, color: "var(--text)" }}>
              {loading ? "…" : `${summary.averageScore}%`}
            </strong>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "0.78rem", fontWeight: 600, color: "#6366F1" }}>Performance</span>
            <Sparkline stroke="#6366F1" points="0,15 15,10 30,14 45,6 60,11 80,4" />
          </div>
        </article>

        {/* Card 3: Best Score */}
        <article className="panel" style={{ display: "flex", flexDirection: "column", justifyBetween: "center", minHeight: "130px", padding: "20px", position: "relative", overflow: "hidden" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <span style={{ fontSize: "0.85rem", fontWeight: 500, color: "var(--muted)" }}>Best Score</span>
            <div style={{ background: "rgba(245,158,11,0.1)", padding: "8px", borderRadius: "8px", color: "#F59E0B" }}>
              <Award size={18} />
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: "8px", marginBottom: "6px" }}>
            <strong style={{ fontSize: "2rem", fontWeight: 700, color: "var(--text)" }}>
              {loading ? "…" : `${bestScore}%`}
            </strong>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "0.78rem", fontWeight: 600, color: "#F59E0B" }}>
              {summary.recent[0]?.role ? `In ${summary.recent[0].role.split(" ")[0]}` : "Top mock screen"}
            </span>
            <Sparkline stroke="#F59E0B" points="0,15 20,8 40,12 60,7 80,2" />
          </div>
        </article>

        {/* Card 4: Interview Streak */}
        <article className="panel" style={{ display: "flex", flexDirection: "column", justifyBetween: "center", minHeight: "130px", padding: "20px", position: "relative", overflow: "hidden" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <span style={{ fontSize: "0.85rem", fontWeight: 500, color: "var(--muted)" }}>Interview Streak</span>
            <div style={{ background: "rgba(34,197,94,0.1)", padding: "8px", borderRadius: "8px", color: "#22C55E" }}>
              <CheckCircle2 size={18} />
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: "8px", marginBottom: "6px" }}>
            <strong style={{ fontSize: "2rem", fontWeight: 700, color: "var(--text)" }}>
              {loading ? "…" : `${streak}d`}
            </strong>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "0.78rem", fontWeight: 600, color: "#22C55E" }}>Consecutive</span>
            <Sparkline stroke="#22C55E" points="0,15 10,12 25,8 40,11 60,6 80,3" />
          </div>
        </article>
      </motion.section>

      {/* ── Main Layout Content ── */}
      <motion.section 
        className="dashboard-content" 
        variants={itemVariants}
        style={{
          display: "grid",
          gridTemplateColumns: "1.4fr 1fr",
          gap: "24px",
          alignItems: "start"
        }}
      >
        {/* Left Column: Completion & Charts Grid */}
        <div style={{ display: "grid", gap: "24px" }}>
          
          {/* Card: Resume Completion */}
          <article className="panel" style={{ display: "flex", alignItems: "center", gap: "24px", padding: "24px" }}>
            <div style={{ position: "relative", width: "100px", height: "100px", flexShrink: 0 }}>
              {/* Circular progress SVG */}
              <svg width="100" height="100" viewBox="0 0 100 100" style={{ transform: "rotate(-90deg)" }}>
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="rgba(255,255,255,0.03)"
                  strokeWidth="8"
                  fill="transparent"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="url(#purpleGradient)"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray="251.2"
                  strokeDashoffset={251.2 - (251.2 * 84) / 100}
                  strokeLinecap="round"
                  style={{ transition: "stroke-dashoffset 0.8s ease" }}
                />
                <defs>
                  <linearGradient id="purpleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#6366F1" />
                    <stop offset="100%" stopColor="#8B5CF6" />
                  </linearGradient>
                </defs>
              </svg>
              <div 
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  fontSize: "1.25rem",
                  fontWeight: 700,
                  color: "var(--text)"
                }}
              >
                84%
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <div>
                <h3 style={{ margin: "0 0 4px 0", fontSize: "1rem", fontWeight: 700 }}>Resume Completion</h3>
                <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--muted)", lineHeight: 1.4 }}>
                  Almost There! Keep going, your professional resume is getting ready.
                </p>
              </div>
              <button
                onClick={() => navigate("/resume-builder")}
                className="btn btn-secondary compact"
                style={{ alignSelf: "flex-start" }}
              >
                Continue Building
              </button>
            </div>
          </article>

          {/* Grid of 4 Charts required by tests */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "20px" }}>
            
            {/* Chart 1: Score Trend */}
            <article className="panel" style={{ padding: "20px" }}>
              <h2 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "14px" }}>Score Trend</h2>
              <div style={{ height: "180px", position: "relative" }}>
                {analytics?.trends?.interviewScores?.length ? (
                  <ChartPanel
                    label="Score Trend"
                    labels={analytics.trends.interviewScores.slice(-8).map((i) => i.role)}
                    values={analytics.trends.interviewScores.slice(-8).map((i) => i.score)}
                    type="line"
                  />
                ) : (
                  <p className="empty-state">No score trend data available.</p>
                )}
              </div>
            </article>

            {/* Chart 2: Weekly Progress */}
            <article className="panel" style={{ padding: "20px" }}>
              <h2 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "14px" }}>Weekly Progress</h2>
              <div style={{ height: "180px", position: "relative" }}>
                {analytics?.trends?.weeklyProgress?.length ? (
                  <ChartPanel
                    label="Weekly Progress"
                    labels={analytics.trends.weeklyProgress.slice(-8).map((i) => i.week)}
                    values={analytics.trends.weeklyProgress.slice(-8).map((i) => i.averageScore)}
                    type="bar"
                  />
                ) : (
                  <p className="empty-state">No weekly progress data available.</p>
                )}
              </div>
            </article>

            {/* Chart 3: Monthly Progress */}
            <article className="panel" style={{ padding: "20px" }}>
              <h2 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "14px" }}>Monthly Progress</h2>
              <div style={{ height: "180px", position: "relative" }}>
                {analytics?.trends?.monthlyProgress?.length ? (
                  <ChartPanel
                    label="Monthly Progress"
                    labels={analytics.trends.monthlyProgress.slice(-6).map((i) => i.month)}
                    values={analytics.trends.monthlyProgress.slice(-6).map((i) => i.averageScore)}
                    type="bar"
                  />
                ) : (
                  <p className="empty-state">No monthly progress data available.</p>
                )}
              </div>
            </article>

            {/* Chart 4: Skill Growth */}
            <article className="panel" style={{ padding: "20px" }}>
              <h2 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "14px" }}>Skill Growth</h2>
              <div style={{ height: "180px", position: "relative" }}>
                {analytics?.skillGrowth?.length ? (
                  <ChartPanel
                    label="Skill Growth"
                    labels={analytics.skillGrowth.map((i) => i.skill)}
                    values={analytics.skillGrowth.map((i) => i.score)}
                    type="bar"
                  />
                ) : (
                  <p className="empty-state">No skill growth data available.</p>
                )}
              </div>
            </article>

          </div>
        </div>

        {/* Right Column: Recent Activity */}
        <article className="panel" style={{ padding: "24px", height: "100%", display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <h2 style={{ fontSize: "1.1rem", fontWeight: 700, margin: 0 }}>Recent Activity</h2>
          </div>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "20px", flexGrow: 1 }} className="activity-timeline">
            {/* Timeline item 1 */}
            <div style={{ display: "flex", gap: "16px" }}>
              <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div style={{ background: "rgba(99,102,241,0.1)", color: "#6366F1", padding: "8px", borderRadius: "50%", display: "flex" }}>
                  <FileText size={14} />
                </div>
                <div style={{ width: "2px", flexGrow: 1, background: "var(--border)", marginTop: "6px" }} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px", paddingBottom: "10px" }}>
                <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text)" }}>Resume updated</span>
                <span style={{ fontSize: "0.72rem", color: "var(--muted)" }}>2 hours ago</span>
              </div>
            </div>

            {/* Timeline item 2 */}
            <div style={{ display: "flex", gap: "16px" }}>
              <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div style={{ background: "rgba(34,197,94,0.1)", color: "#22C55E", padding: "8px", borderRadius: "50%", display: "flex" }}>
                  <Gauge size={14} />
                </div>
                <div style={{ width: "2px", flexGrow: 1, background: "var(--border)", marginTop: "6px" }} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px", paddingBottom: "10px" }}>
                <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text)" }}>ATS analysis completed</span>
                <span style={{ fontSize: "0.72rem", color: "var(--muted)" }}>5 hours ago</span>
              </div>
            </div>

            {/* Timeline item 3 */}
            <div style={{ display: "flex", gap: "16px" }}>
              <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div style={{ background: "rgba(139,92,246,0.1)", color: "#8B5CF6", padding: "8px", borderRadius: "50%", display: "flex" }}>
                  <TrendingUp size={14} />
                </div>
                <div style={{ width: "2px", flexGrow: 1, background: "var(--border)", marginTop: "6px" }} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px", paddingBottom: "10px" }}>
                <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text)" }}>Mock interview completed</span>
                <span style={{ fontSize: "0.72rem", color: "var(--muted)" }}>Yesterday</span>
              </div>
            </div>

            {/* Timeline item 4 */}
            <div style={{ display: "flex", gap: "16px" }}>
              <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div style={{ background: "rgba(245,158,11,0.1)", color: "#F59E0B", padding: "8px", borderRadius: "50%", display: "flex" }}>
                  <Plus size={14} />
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text)" }}>New resume created</span>
                <span style={{ fontSize: "0.72rem", color: "var(--muted)" }}>2 days ago</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => navigate("/history")}
            className="btn btn-ghost compact"
            style={{ width: "100%", marginTop: "24px" }}
          >
            View All Activity
          </button>
        </article>
      </motion.section>

      {/* ── Recommended For You ── */}
      <motion.section 
        className="recommended-section" 
        variants={itemVariants}
        style={{ display: "grid", gap: "16px" }}
      >
        <h2 style={{ fontSize: "1.1rem", fontWeight: 700, margin: 0, paddingLeft: "4px" }}>Recommended For You</h2>
        
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "20px" }}>
          
          {/* Card 1 */}
          <div 
            onClick={() => navigate("/resume-builder")}
            className="panel interactive-row"
            style={{ padding: "20px", display: "flex", alignItems: "flex-start", gap: "14px", cursor: "pointer" }}
          >
            <div style={{ background: "rgba(99,102,241,0.1)", color: "#6366F1", padding: "10px", borderRadius: "10px" }}>
              <BookOpen size={18} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <h3 style={{ margin: 0, fontSize: "0.88rem", fontWeight: 700, display: "flex", alignItems: "center", gap: "4px" }}>
                Improve Resume <ArrowUpRight size={14} />
              </h3>
              <p style={{ margin: 0, fontSize: "0.75rem", color: "var(--muted)" }}>Tailor your details to unlock stronger roles.</p>
            </div>
          </div>

          {/* Card 2 */}
          <div 
            onClick={() => navigate("/interview-setup")}
            className="panel interactive-row"
            style={{ padding: "20px", display: "flex", alignItems: "flex-start", gap: "14px", cursor: "pointer" }}
          >
            <div style={{ background: "rgba(34,197,94,0.1)", color: "#22C55E", padding: "10px", borderRadius: "10px" }}>
              <Activity size={18} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <h3 style={{ margin: 0, fontSize: "0.88rem", fontWeight: 700, display: "flex", alignItems: "center", gap: "4px" }}>
                Practice Interview <ArrowUpRight size={14} />
              </h3>
              <p style={{ margin: 0, fontSize: "0.75rem", color: "var(--muted)" }}>Conduct a role-specific mock screen.</p>
            </div>
          </div>

          {/* Card 3 */}
          <div 
            onClick={() => navigate("/resume-upload")}
            className="panel interactive-row"
            style={{ padding: "20px", display: "flex", alignItems: "flex-start", gap: "14px", cursor: "pointer" }}
          >
            <div style={{ background: "rgba(139,92,246,0.1)", color: "#8B5CF6", padding: "10px", borderRadius: "10px" }}>
              <Gauge size={18} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <h3 style={{ margin: 0, fontSize: "0.88rem", fontWeight: 700, display: "flex", alignItems: "center", gap: "4px" }}>
                Complete ATS Analysis <ArrowUpRight size={14} />
              </h3>
              <p style={{ margin: 0, fontSize: "0.75rem", color: "var(--muted)" }}>Check score against job requirements.</p>
            </div>
          </div>

          {/* Card 4 */}
          <div 
            onClick={() => navigate("/settings")}
            className="panel interactive-row"
            style={{ padding: "20px", display: "flex", alignItems: "flex-start", gap: "14px", cursor: "pointer" }}
          >
            <div style={{ background: "rgba(245,158,11,0.1)", color: "#F59E0B", padding: "10px", borderRadius: "10px" }}>
              <Flame size={18} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <h3 style={{ margin: 0, fontSize: "0.88rem", fontWeight: 700, display: "flex", alignItems: "center", gap: "4px" }}>
                Update Skills <ArrowUpRight size={14} />
              </h3>
              <p style={{ margin: 0, fontSize: "0.75rem", color: "var(--muted)" }}>Log latest achievements on your profile.</p>
            </div>
          </div>

        </div>
      </motion.section>
    </motion.main>
  );
};

export default Dashboard;
