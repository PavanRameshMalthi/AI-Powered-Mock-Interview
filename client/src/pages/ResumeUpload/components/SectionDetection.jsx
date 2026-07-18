import { motion } from "framer-motion";

const SECTIONS = [
  { key: "contact",        label: "Contact Info",     icon: "📞" },
  { key: "summary",        label: "Summary",          icon: "📝" },
  { key: "education",      label: "Education",        icon: "🎓" },
  { key: "skills",         label: "Skills",           icon: "⚡" },
  { key: "projects",       label: "Projects",         icon: "🚀" },
  { key: "experience",     label: "Experience",       icon: "💼" },
  { key: "certifications", label: "Certifications",   icon: "🏅" },
  { key: "achievements",   label: "Achievements",     icon: "🏆" },
  { key: "languages",      label: "Languages",        icon: "🌐" },
];

const SectionDetection = ({ sectionsFound = {} }) => {
  const found = SECTIONS.filter((s) => sectionsFound[s.key]);
  const missing = SECTIONS.filter((s) => !sectionsFound[s.key]);

  return (
    <motion.div
      className="section-detection-wrap"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <h3 className="ats-subsection-title">📋 Section Detection</h3>

      <div className="section-detection-summary">
        <span className="section-found-count">
          ✔ <strong>{found.length}</strong> of {SECTIONS.length} sections found
        </span>
        {missing.length > 0 && (
          <span className="section-missing-count">
            ❌ {missing.length} missing
          </span>
        )}
      </div>

      <div className="section-detection-grid">
        {SECTIONS.map((section, i) => {
          const isFound = !!sectionsFound[section.key];
          return (
            <motion.div
              key={section.key}
              className={`section-badge ${isFound ? "found" : "missing"}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.35 }}
            >
              <span className="section-badge-icon">{section.icon}</span>
              <span className="section-badge-label">{section.label}</span>
              <span className={`section-badge-status ${isFound ? "found" : "missing"}`}>
                {isFound ? "✔ Found" : "❌ Missing"}
              </span>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default SectionDetection;
