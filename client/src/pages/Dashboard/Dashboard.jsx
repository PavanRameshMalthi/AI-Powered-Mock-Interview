import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaChartLine, FaFileUpload, FaHistory, FaShieldAlt, FaSignOutAlt, FaTrophy, FaCalendarCheck, FaFire, FaTimesCircle, FaCheckCircle } from "react-icons/fa";
import ChartPanel from "../../components/UI/ChartPanel";
import dashboardService from "../../services/dashboardService";
import authService from "../../services/authService";

const Dashboard = () => {
  const navigate = useNavigate();
  const user = JSON.parse(
    localStorage.getItem("user") || sessionStorage.getItem("user") || "null"
  );
  const [summary, setSummary] = useState({
    completed: 0,
    averageScore: 0,
    recent: [],
  });
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

  const logout = async () => {
    try {
      await authService.logout();
    } catch {
      // Local session cleanup still signs the user out if the API is unavailable.
    }
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    navigate("/login");
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 15 } },
  };

  return (
    <motion.main 
      className="app-shell"
      initial="hidden"
      animate="show"
      variants={containerVariants}
    >
      <motion.header className="topbar" variants={itemVariants}>
        <div>
          <p className="eyebrow">Dashboard</p>
          <h1 className="text-3xl font-extrabold tracking-tight">
            Welcome{user?.name ? `, ${user.name}` : ""}
          </h1>
          <p className="muted">{user?.email || "Plan your next practice round."}</p>
        </div>
        <div className="flex gap-3">
          <Link className="btn btn-secondary" to="/profile">
            Profile
          </Link>
          <button className="btn btn-ghost" onClick={logout}>
            <FaSignOutAlt aria-hidden="true" /> Logout
          </button>
        </div>
      </motion.header>

      {/* Main Metrics Stats Grid */}
      <motion.section className="stats-grid" variants={itemVariants}>
        <article className="stat-card">
          <div className="flex justify-between items-start">
            <span>Total Interviews</span>
            <FaCalendarCheck className="text-emerald-400/80 text-lg" />
          </div>
          <strong>{loading ? "..." : summary.completed}</strong>
        </article>
        <article className="stat-card">
          <div className="flex justify-between items-start">
            <span>Average Score</span>
            <FaChartLine className="text-sky-400/80 text-lg" />
          </div>
          <strong>{loading ? "..." : `${summary.averageScore}%`}</strong>
        </article>
        <article className="stat-card">
          <div className="flex justify-between items-start">
            <span>Best Score</span>
            <FaTrophy className="text-amber-400/80 text-lg" />
          </div>
          <strong>{analytics?.summary?.bestScore ? `${analytics.summary.bestScore}%` : loading ? "..." : "0%"}</strong>
        </article>
        <article className="stat-card">
          <div className="flex justify-between items-start">
            <span>Interview Streak</span>
            <FaFire className="text-rose-500/80 text-lg" />
          </div>
          <strong>{analytics?.summary?.interviewStreak ? `${analytics.summary.interviewStreak}d` : "0d"}</strong>
        </article>
      </motion.section>

      {/* Strong / Weak Areas Section */}
      <motion.section className="grid grid-cols-1 md:grid-cols-2 gap-6 my-6" variants={itemVariants}>
        <article className="panel">
          <div className="flex items-center gap-2 mb-4">
            <FaCheckCircle className="text-emerald-400" />
            <h2 className="text-lg font-bold">Strong Areas</h2>
          </div>
          {analytics?.strongSkillAreas?.length ? (
            <div className="flex flex-wrap gap-2">
              {analytics.strongSkillAreas.map((item) => (
                <span className="px-3 py-1.5 rounded-lg border border-emerald-500/20 bg-emerald-500/5 text-emerald-400 text-xs font-semibold tracking-wide" key={item.name}>
                  {item.name}
                </span>
              ))}
            </div>
          ) : (
            <p className="empty-state">Complete interviews to identify your strengths.</p>
          )}
        </article>

        <article className="panel">
          <div className="flex items-center gap-2 mb-4">
            <FaTimesCircle className="text-rose-400" />
            <h2 className="text-lg font-bold">Weak Areas</h2>
          </div>
          {analytics?.weakSkillAreas?.length ? (
            <div className="flex flex-wrap gap-2">
              {analytics.weakSkillAreas.map((item) => (
                <span className="px-3 py-1.5 rounded-lg border border-rose-500/20 bg-rose-500/5 text-rose-400 text-xs font-semibold tracking-wide" key={item.name}>
                  {item.name}
                </span>
              ))}
            </div>
          ) : (
            <p className="empty-state">No critical skill gaps identified yet.</p>
          )}
        </article>
      </motion.section>

      {/* Quick Actions Grid */}
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

      {/* Recent Interviews */}
      <motion.section className="panel my-6" variants={itemVariants}>
        <div className="section-heading flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">Recent interviews</h2>
          <Link className="text-sm text-emerald-400 hover:text-emerald-300 font-semibold" to="/history">View all</Link>
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

      {/* Charts Grid */}
      <motion.section className="analytics-grid" variants={itemVariants}>
        {/* Score Trend (Line Chart) */}
        <article className="panel">
          <h2 className="text-base font-bold mb-4">Score Trend</h2>
          {analytics?.trends?.interviewScores?.length ? (
            <ChartPanel
              label="Score Trend"
              labels={analytics.trends.interviewScores.slice(-8).map((item) => item.role)}
              values={analytics.trends.interviewScores.slice(-8).map((item) => item.score)}
              type="line"
            />
          ) : (
            <p className="empty-state">No score trend data available.</p>
          )}
        </article>

        {/* Weekly Progress (Bar Chart) */}
        <article className="panel">
          <h2 className="text-base font-bold mb-4">Weekly Progress</h2>
          {analytics?.trends?.weeklyProgress?.length ? (
            <ChartPanel
              label="Weekly Progress"
              labels={analytics.trends.weeklyProgress.slice(-8).map((item) => item.week)}
              values={analytics.trends.weeklyProgress.slice(-8).map((item) => item.averageScore)}
              type="bar"
            />
          ) : (
            <p className="empty-state">No weekly progress data available.</p>
          )}
        </article>

        {/* Monthly Progress (Bar Chart) */}
        <article className="panel">
          <h2 className="text-base font-bold mb-4">Monthly Progress</h2>
          {analytics?.trends?.monthlyProgress?.length ? (
            <ChartPanel
              label="Monthly Progress"
              labels={analytics.trends.monthlyProgress.slice(-6).map((item) => item.month)}
              values={analytics.trends.monthlyProgress.slice(-6).map((item) => item.averageScore)}
              type="bar"
            />
          ) : (
            <p className="empty-state">No monthly progress data available.</p>
          )}
        </article>

        {/* Skill Growth (Bar Chart) */}
        <article className="panel">
          <h2 className="text-base font-bold mb-4">Skill Growth</h2>
          {analytics?.skillGrowth?.length ? (
            <ChartPanel
              label="Skill Growth"
              labels={analytics.skillGrowth.map((item) => item.skill)}
              values={analytics.skillGrowth.map((item) => item.score)}
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
