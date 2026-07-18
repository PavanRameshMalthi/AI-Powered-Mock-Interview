import { motion } from "framer-motion";

const KeywordAnalysis = ({ matchedKeywords = [], missingKeywords = [], skillsDetected = [] }) => {
  return (
    <motion.div
      className="keyword-analysis-section"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <h3 className="ats-subsection-title">🔍 Keyword Analysis</h3>

      <div className="keyword-analysis-grid">
        {/* Matched Skills */}
        <div className="keyword-column">
          <div className="keyword-column-header matched">
            <span className="keyword-dot matched" />
            <strong>Matched Skills ({matchedKeywords.length})</strong>
          </div>
          <div className="keyword-pills-wrap">
            {matchedKeywords.length > 0 ? (
              matchedKeywords.map((kw, i) => (
                <motion.span
                  key={i}
                  className="kw-pill matched"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.04, duration: 0.3 }}
                >
                  ✓ {kw}
                </motion.span>
              ))
            ) : (
              <p className="keyword-empty">No keywords matched yet</p>
            )}
          </div>
        </div>

        {/* Missing Skills */}
        <div className="keyword-column">
          <div className="keyword-column-header missing">
            <span className="keyword-dot missing" />
            <strong>Missing Skills ({missingKeywords.length})</strong>
          </div>
          <div className="keyword-pills-wrap">
            {missingKeywords.length > 0 ? (
              missingKeywords.map((kw, i) => (
                <motion.span
                  key={i}
                  className="kw-pill missing"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05, duration: 0.3 }}
                >
                  + {kw}
                </motion.span>
              ))
            ) : (
              <p className="keyword-empty">All key skills found! 🎉</p>
            )}
          </div>
        </div>
      </div>

      {/* Detected Skills */}
      {skillsDetected.length > 0 && (
        <div className="detected-skills-wrap">
          <p className="detected-skills-label">
            ⚡ <strong>{skillsDetected.length}</strong> technical skills detected
          </p>
          <div className="keyword-pills-wrap">
            {skillsDetected.map((skill, i) => (
              <motion.span
                key={i}
                className="kw-pill detected"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.03 }}
              >
                {skill}
              </motion.span>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default KeywordAnalysis;
