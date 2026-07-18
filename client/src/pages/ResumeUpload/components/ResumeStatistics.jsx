import { motion } from "framer-motion";

const STAT_ITEMS = [
  { key: "wordCount",           label: "Words",          icon: "📝" },
  { key: "charCount",           label: "Characters",     icon: "🔤" },
  { key: "estimatedPages",      label: "Est. Pages",     icon: "📄" },
  { key: "estimatedReadingTime",label: "Read Time (min)",icon: "⏱️" },
  { key: "skillsCount",         label: "Skills",         icon: "⚡" },
  { key: "projectsCount",       label: "Projects",       icon: "🚀" },
  { key: "experienceCount",     label: "Experience",     icon: "💼" },
];

const ResumeStatistics = ({ stats = {} }) => {
  if (!stats || Object.keys(stats).length === 0) return null;

  return (
    <motion.div
      className="resume-stats-wrap"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <h3 className="ats-subsection-title">📊 Resume Statistics</h3>

      <div className="resume-stats-grid">
        {STAT_ITEMS.map((item, i) => {
          const value = stats[item.key];
          if (value === undefined || value === null) return null;

          return (
            <motion.div
              key={item.key}
              className="resume-stat-card"
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.06, duration: 0.35 }}
            >
              <span className="stat-icon">{item.icon}</span>
              <strong className="stat-value">
                {item.key === "estimatedReadingTime" ? `${value} min` : value.toLocaleString()}
              </strong>
              <span className="stat-label">{item.label}</span>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default ResumeStatistics;
