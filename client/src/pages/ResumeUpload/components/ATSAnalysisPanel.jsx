import { motion, AnimatePresence } from "framer-motion";
import CircularScoreGauge from "./CircularScoreGauge";
import CategoryScoreCard from "./CategoryScoreCard";
import KeywordAnalysis from "./KeywordAnalysis";
import SectionDetection from "./SectionDetection";
import AISuggestions from "./AISuggestions";
import ResumeStatistics from "./ResumeStatistics";

// ── Loading Skeleton ────────────────────────────────────────────────────────────
const SkeletonBlock = ({ width = "100%", height = "16px", style = {} }) => (
  <div
    className="skeleton-block"
    style={{ width, height, borderRadius: "6px", ...style }}
  />
);

const ATSLoadingSkeleton = () => (
  <div className="ats-loading-panel">
    <div className="ats-loading-header">
      <div className="ats-loading-spinner-wrap">
        <div className="ats-analyzing-spinner" />
        <div>
          <p className="ats-analyzing-title">Analyzing Resume...</p>
          <p className="ats-analyzing-sub">Running ATS check & generating AI suggestions</p>
        </div>
      </div>
    </div>

    <div className="ats-skeleton-gauge">
      <SkeletonBlock width="160px" height="160px" style={{ borderRadius: "50%" }} />
    </div>

    <div className="ats-skeleton-grid">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="ats-skeleton-card">
          <SkeletonBlock width="60%" height="14px" style={{ marginBottom: "8px" }} />
          <SkeletonBlock width="100%" height="8px" style={{ marginBottom: "6px" }} />
          <SkeletonBlock width="80%" height="12px" />
        </div>
      ))}
    </div>
  </div>
);

// ── Category order for display ──────────────────────────────────────────────────
const CATEGORY_ORDER = [
  "keywordMatch", "skillsMatch", "experience", "projects",
  "education", "achievements", "actionVerbs", "professionalSummary",
  "formatting", "contactInfo", "readability", "grammar",
];

// ── Main ATS Panel ──────────────────────────────────────────────────────────────
const ATSAnalysisPanel = ({ atsData, isLoading }) => {
  if (isLoading) {
    return <ATSLoadingSkeleton />;
  }

  if (!atsData) return null;

  const {
    atsScore = {},
    atsAnalysis = {},
    sectionsFound = {},
    aiSuggestions = [],
    resumeStats = {},
  } = atsData;

  const overallScore = atsScore.score || 0;

  return (
    <AnimatePresence>
      <motion.div
        className="ats-full-panel"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -16 }}
        transition={{ duration: 0.5 }}
      >
        {/* ── Hero: Overall Score ─────────────────────────────────────────── */}
        <div className="ats-hero-row">
          <div className="ats-gauge-area">
            <CircularScoreGauge score={overallScore} size={180} />
            <div className="ats-gauge-meta">
              <h2 className="ats-panel-title">ATS Score</h2>
              <p className="ats-panel-subtitle">
                Overall ATS Readiness — <strong>{atsScore.level || "Analyzed"}</strong>
              </p>
              <div className="ats-score-legend">
                <span className="legend-dot" style={{ background: "#22c55e" }} /> 90–100 Excellent
                <span className="legend-dot" style={{ background: "#3dd6bd" }} /> 75–89 Strong
                <span className="legend-dot" style={{ background: "#f97316" }} /> 60–74 Moderate
                <span className="legend-dot" style={{ background: "#fb7185" }} /> &lt;60 Needs Work
              </div>
            </div>
          </div>
        </div>

        {/* ── Resume Statistics ───────────────────────────────────────────── */}
        <ResumeStatistics stats={resumeStats} />

        {/* ── 12 Category Score Cards ─────────────────────────────────────── */}
        <div className="ats-categories-section">
          <h3 className="ats-subsection-title">📈 Category Breakdown</h3>
          <div className="ats-category-grid">
            {CATEGORY_ORDER.map((key, i) => {
              const cat = atsAnalysis[key];
              if (!cat) return null;
              return (
                <CategoryScoreCard
                  key={key}
                  category={key}
                  score={cat.score}
                  explanation={cat.explanation}
                  index={i}
                />
              );
            })}
          </div>
        </div>

        {/* ── Keyword Analysis ────────────────────────────────────────────── */}
        <KeywordAnalysis
          matchedKeywords={atsScore.matchedKeywords || []}
          missingKeywords={atsScore.missingKeywords || []}
          skillsDetected={atsScore.skillsDetected || []}
        />

        {/* ── Section Detection ───────────────────────────────────────────── */}
        <SectionDetection sectionsFound={sectionsFound} />

        {/* ── AI Suggestions ──────────────────────────────────────────────── */}
        <AISuggestions suggestions={aiSuggestions} />
      </motion.div>
    </AnimatePresence>
  );
};

export default ATSAnalysisPanel;
