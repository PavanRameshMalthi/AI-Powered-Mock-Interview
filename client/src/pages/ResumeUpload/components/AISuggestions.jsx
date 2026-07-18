import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const PRIORITY_CONFIG = {
  high:   { label: "High Priority", color: "#fb7185", bg: "rgba(251,113,133,0.12)" },
  medium: { label: "Important",     color: "#f97316", bg: "rgba(249,115,22,0.12)" },
  low:    { label: "Nice to Have",  color: "#3dd6bd", bg: "rgba(61,214,189,0.12)" },
};

const SuggestionCard = ({ suggestion, index }) => {
  const [isOpen, setIsOpen] = useState(false);
  const priority = PRIORITY_CONFIG[suggestion.priority] || PRIORITY_CONFIG.medium;

  return (
    <motion.div
      className="ai-suggestion-card"
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.07, duration: 0.4 }}
    >
      <button
        className="ai-suggestion-header"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
      >
        <div className="suggestion-header-left">
          <span
            className="suggestion-priority-badge"
            style={{ color: priority.color, background: priority.bg }}
          >
            {priority.label}
          </span>
          <span className="suggestion-title">{suggestion.title}</span>
        </div>
        <span
          className="suggestion-chevron"
          style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}
        >
          ▾
        </span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="ai-suggestion-body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            style={{ overflow: "hidden" }}
          >
            <p className="suggestion-detail">{suggestion.detail}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const AISuggestions = ({ suggestions = [] }) => {
  if (!suggestions.length) return null;

  return (
    <motion.div
      className="ai-suggestions-wrap"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <h3 className="ats-subsection-title">
        🤖 AI Improvement Suggestions
        <span className="suggestions-count-badge">{suggestions.length}</span>
      </h3>
      <p className="suggestions-intro">
        Click each suggestion to see detailed advice tailored to your resume.
      </p>

      <div className="ai-suggestions-list">
        {suggestions.map((suggestion, i) => (
          <SuggestionCard key={i} suggestion={suggestion} index={i} />
        ))}
      </div>
    </motion.div>
  );
};

export default AISuggestions;
