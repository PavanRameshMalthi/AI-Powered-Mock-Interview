import { motion } from "framer-motion";

const CATEGORY_ICONS = {
  formatting:          "🖋️",
  keywordMatch:        "🔑",
  skillsMatch:         "⚡",
  education:           "🎓",
  projects:            "🚀",
  experience:          "💼",
  contactInfo:         "📞",
  grammar:             "✏️",
  readability:         "📖",
  professionalSummary: "📝",
  actionVerbs:         "💥",
  achievements:        "🏆",
};

const CATEGORY_LABELS = {
  formatting:          "Resume Formatting",
  keywordMatch:        "Keyword Match",
  skillsMatch:         "Skills Match",
  education:           "Education",
  projects:            "Projects",
  experience:          "Experience",
  contactInfo:         "Contact Information",
  grammar:             "Grammar",
  readability:         "Readability",
  professionalSummary: "Professional Summary",
  actionVerbs:         "Action Verbs",
  achievements:        "Achievements",
};

const getBarColor = (score) => {
  if (score >= 80) return "var(--ats-green, #22c55e)";
  if (score >= 60) return "var(--primary, #3dd6bd)";
  if (score >= 40) return "#f97316";
  return "#fb7185";
};

const CategoryScoreCard = ({ category, score = 0, explanation = "", index = 0 }) => {
  const icon = CATEGORY_ICONS[category] || "📊";
  const label = CATEGORY_LABELS[category] || category;
  const barColor = getBarColor(score);

  return (
    <motion.div
      className="ats-category-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.4 }}
    >
      <div className="ats-category-header">
        <span className="ats-category-icon">{icon}</span>
        <span className="ats-category-name">{label}</span>
        <span
          className="ats-category-score"
          style={{ color: barColor }}
        >
          {score}
        </span>
      </div>

      <div className="ats-category-bar-track">
        <motion.div
          className="ats-category-bar-fill"
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ delay: index * 0.06 + 0.3, duration: 0.8, ease: "easeOut" }}
          style={{ background: barColor }}
        />
      </div>

      <p className="ats-category-explanation">{explanation}</p>
    </motion.div>
  );
};

export default CategoryScoreCard;
