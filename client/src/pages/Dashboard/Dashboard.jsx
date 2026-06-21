import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FaChartLine, FaFileUpload, FaHistory, FaShieldAlt, FaSignOutAlt,
  FaTrophy, FaCalendarCheck, FaFire, FaCheckCircle, FaTimesCircle,
  FaLightbulb, FaArrowUp,
} from "react-icons/fa";
import ChartPanel from "../../components/UI/ChartPanel";
import dashboardService from "../../services/dashboardService";
import authService from "../../services/authService";

const Dashboard = () => {
  const navigate = useNavigate();
  const user = JSON.parse(
    localStorage.getItem("user") || sessionStorage.getItem("user") || "null"
  );
  const [summary, setSummary] = useState({ completed: 0, averageScore: 0, recent: [] });
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  // Also pull last ATS score from localStorage for the resume skill widget
  const storedAts = (() => {
    try { return JSON.parse(localStorage.getItem("atsScore") || "null"); }
    catch { return null; }
  })();

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

  const logout = async () => {
    try { await authService.logout(); } catch { /* Local cleanup is sufficient */ }
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    navigate("/login");
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.08 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 15 } },
  };

  // Merge strong/weak areas from analytics + stored ATS report
  const strongAreas = (() => {
    const fromAnalytics = (analytics?.strongSkillAreas || []).map((a) => a.name);
    const fromAts = storedAts?.strongAreas || [];
    const merged = [...new Set([...fromAnalytics, ...fromAts])];
    return merged.slice(0, 8);
  })();

  const weakAreas = (() => {
    const fromAnalytics = (analytics?.weakSkillAreas || []).map((a) => a.name);
    const fromAts = storedAts?.weakAreas || [];
    const merged = [...new Set([...fromAnalytics, ...fromAts])];
    return merged.filter((a) => !strongAreas.includes(a)).slice(0, 8);
  })();

  const skillScores = analytics?.skillScores || [];
  const recommendations = analytics?.improvementRecommendations || [];

  return (
    <motion.main
      className="app-shell"
      initial="hidden"
      animate="show"
      variants={containerVariants}
    >
      {/* ── Header ────────────────────────────────────────────── */}
      <motion.header className="topbar" variants={itemVariants}>
        <div>
          <p className="eyebrow">Dashboard</p>
          <h1>Welcome{user?.name ? `, ${user.name}` : ""}</h1>
          <p className="muted">{user?.email || "Plan your next practice round."}</p>
        </div>
        <div className="dash-header-actions">
          <Link className="btn btn-secondary" to="/profile">Profile</Link>
          <button className="btn btn-ghost" onClick={logout}>
            <FaSignOutAlt aria-hidden="true" /> Logout
          </button>
        </div>
      </motion.header>

      {/* ── Stats Grid ────────────────────────────────────────── */}
      <motion.section className="stats-grid" variants={itemVariants}>
        <article className="stat-card">
          <div className="stat-card-top">
            <span>Total Interviews</span>
            <FaCalendarCheck className="stat-icon stat-icon-green" aria-hidden="true" />
          </div>
          <strong>{loading ? "…" : summary.completed}</strong>
        </article>
        <article className="stat-card">
          <div className="stat-card-top">
            <span>Average Score</span>
            <FaChartLine className="stat-icon stat-icon-blue" aria-hidden="true" />
          </div>
          <strong>{loading ? "…" : `${summary.averageScore}%`}</strong>
        </article>
        <article className="stat-card">
          <div className="stat-card-top">
            <span>Best Score</span>
            <FaTrophy className="stat-icon stat-icon-amber" aria-hidden="true" />
          </div>
          <strong>
            {analytics?.summary?.bestScore ? `${analytics.summary.bestScore}%` : loading ? "…" : "0%"}
          </strong>
        </article>
        <article className="stat-card">
          <div className="stat-card-top">
            <span>Interview Streak</span>
            <FaFire className="stat-icon stat-icon-rose" aria-hidden="true" />
          </div>
          <strong>
            {analytics?.summary?.interviewStreak ? `${analytics.summary.interviewStreak}d` : "0d"}
          </strong>
        </article>
      </motion.section>

      {/* ── Strong & Weak Areas ───────────────────────────────── */}
      <motion.section className="dash-sw-section" variants={itemVariants}>
        {/* Strong Areas */}
        <article className="panel dash-sw-col dash-strong-col">
          <div className="dash-sw-heading">
            <FaCheckCircle className="dash-sw-icon dash-icon-green" aria-hidden="true" />
            <h2>Strong Areas</h2>
          </div>
          {strongAreas.length ? (
            <ul className="dash-area-list">
              {strongAreas.map((item, idx) => (
                <li key={idx} className="dash-area-item dash-strong-item">
                  <span className="dash-area-check" aria-hidden="true">✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="empty-state">
              {loading
                ? "Loading your skills…"
                : "Complete interviews to identify your strengths."}
            </p>
          )}
        </article>

        {/* Weak Areas */}
        <article className="panel dash-sw-col dash-weak-col">
          <div className="dash-sw-heading">
            <FaTimesCircle className="dash-sw-icon dash-icon-rose" aria-hidden="true" />
            <h2>Weak Areas</h2>
          </div>
          {weakAreas.length ? (
            <ul className="dash-area-list">
              {weakAreas.map((item, idx) => (
                <li key={idx} className="dash-area-item dash-weak-item">
                  <span className="dash-area-warn" aria-hidden="true">⚠</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="empty-state">
              {loading ? "Analysing your gaps…" : "No critical skill gaps identified yet."}
            </p>
          )}
        </article>
      </motion.section>

      {/* ── Skill Scores + Recommendations ───────────────────── */}
      <motion.section className="dash-insights-section" variants={itemVariants}>
        {/* Skill Scores */}
        {skillScores.length > 0 && (
          <article className="panel dash-skill-scores">
            <div className="dash-sw-heading">
              <FaArrowUp className="dash-sw-icon dash-icon-blue" aria-hidden="true" />
              <h2>Skill Scores</h2>
            </div>
            <div className="dash-score-list">
              {skillScores.map(({ label, score }) => (
                <div className="dash-score-row" key={label}>
                  <span className="dash-score-label">{label}</span>
                  <div className="dash-score-bar-track">
                    <div
                      className="dash-score-bar-fill"
                      style={{ width: `${score}%` }}
                    />
                  </div>
                  <span className="dash-score-pct">{score}%</span>
                </div>
              ))}
            </div>
          </article>
        )}

        {/* Improvement Recommendations */}
        {recommendations.length > 0 && (
          <article className="panel dash-recommendations">
            <div className="dash-sw-heading">
              <FaLightbulb className="dash-sw-icon dash-icon-amber" aria-hidden="true" />
              <h2>Improvement Recommendations</h2>
            </div>
            <ul className="dash-rec-list">
              {recommendations.map((rec, i) => (
                <li key={i} className="dash-rec-item">
                  <span className="dash-rec-bullet" aria-hidden="true">→</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </article>
        )}
      </motion.section>

      {/* ── Quick Actions ─────────────────────────────────────── */}
      <motion.section className="action-grid" variants={itemVariants}>
        <Link className="action-card" to="/resume-upload">
          <FaFileUpload aria-hidden="true" />
          <div>
            <h2>Upload resume</h2>
            <p>Use resume context for sharper interview questions.</p>
          </div>
        </Link>
        <Link className="action-card" to="/interview-setup">
          <FaChartLine aria-hidden="true" />
          <div>
            <h2>Start interview</h2>
            <p>Generate questions and begin a role-specific session.</p>
          </div>
        </Link>
        <Link className="action-card" to="/history">
          <FaHistory aria-hidden="true" />
          <div>
            <h2>View history</h2>
            <p>Review recent results and track progress over time.</p>
          </div>
        </Link>
        {user?.role === "admin" ? (
          <Link className="action-card" to="/admin">
            <FaShieldAlt aria-hidden="true" />
            <div>
              <h2>Admin panel</h2>
              <p>Monitor users, interviews, ATS reports, and exports.</p>
            </div>
          </Link>
        ) : null}
      </motion.section>

      {/* ── Recent Interviews ─────────────────────────────────── */}
      <motion.section className="panel dash-recent-section" variants={itemVariants}>
        <div className="section-heading">
          <h2>Recent interviews</h2>
          <Link className="dash-view-all-link" to="/history">View all</Link>
        </div>
        {summary.recent.length ? (
          <div className="list">
            {summary.recent.map((item) => (
              <Link className="list-row interactive-row" key={item._id} to="/history">
                <span>{item.role}</span>
                <strong>{item.score || 0}%</strong>
              </Link>
            ))}
          </div>
        ) : (
          <p className="empty-state">
            No interviews yet. Start a mock interview to create your first scorecard.
          </p>
        )}
      </motion.section>

      {/* ── Charts ───────────────────────────────────────────── */}
      <motion.section className="analytics-grid" variants={itemVariants}>
        <article className="panel">
          <h2>Score Trend</h2>
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
        </article>

        <article className="panel">
          <h2>Weekly Progress</h2>
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
        </article>

        <article className="panel">
          <h2>Monthly Progress</h2>
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
        </article>

        <article className="panel">
          <h2>Skill Growth</h2>
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
        </article>
      </motion.section>
    </motion.main>
  );
};

export default Dashboard;
