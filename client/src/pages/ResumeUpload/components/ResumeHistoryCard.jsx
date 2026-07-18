import { motion, AnimatePresence } from "framer-motion";

const formatFileSize = (bytes) => {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getScoreColor = (score) => {
  if (score >= 90) return "#22c55e";
  if (score >= 75) return "#3dd6bd";
  if (score >= 60) return "#f97316";
  return "#fb7185";
};

const ResumeHistoryCard = ({
  resume,
  onRestore,
  onDelete,
  onView,
  isRestoring,
  isDeleting,
  index = 0,
}) => {
  const score = resume?.atsScore?.score ?? 0;
  const scoreColor = getScoreColor(score);
  const isActive = resume.isActive;
  const apiBase = import.meta.env.VITE_API_URL || "";

  const handleDownload = () => {
    if (!resume.fileUrl) return;
    // Build absolute URL
    const url = resume.fileUrl.startsWith("http")
      ? resume.fileUrl
      : `${apiBase}${resume.fileUrl}`;
    const a = document.createElement("a");
    a.href = url;
    a.download = resume.fileName || `Resume_v${resume.version}.pdf`;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <motion.div
      className={`resume-history-card ${isActive ? "active" : ""}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -24, scale: 0.96 }}
      transition={{ delay: index * 0.07, duration: 0.4 }}
      layout
    >
      {/* Active Badge */}
      {isActive && (
        <div className="resume-active-badge">
          <span>✓ Active Resume</span>
        </div>
      )}

      {/* Version badge */}
      <div className="resume-card-top">
        <div className="resume-version-badge">v{resume.version}</div>
        <div className="resume-card-score" style={{ color: scoreColor }}>
          <svg width="38" height="38" viewBox="0 0 38 38">
            <circle cx="19" cy="19" r="15" fill="none" stroke="#223044" strokeWidth="4" />
            <circle
              cx="19"
              cy="19"
              r="15"
              fill="none"
              stroke={scoreColor}
              strokeWidth="4"
              strokeDasharray={`${2 * Math.PI * 15}`}
              strokeDashoffset={`${2 * Math.PI * 15 * (1 - score / 100)}`}
              strokeLinecap="round"
              style={{ transform: "rotate(-90deg)", transformOrigin: "center" }}
            />
          </svg>
          <span className="resume-card-score-value">{score}%</span>
        </div>
      </div>

      {/* Resume info */}
      <div className="resume-card-body">
        <h4 className="resume-card-name">
          📄 {resume.resumeName || "My Resume"}
        </h4>
        <p className="resume-card-meta">
          📅 {formatDate(resume.createdAt)}
        </p>
        <p className="resume-card-meta">
          📁 {formatFileSize(resume.fileSize)}
          {resume.fileName && (
            <span className="resume-filename"> · {resume.fileName}</span>
          )}
        </p>
        {resume.resumeStats && (
          <p className="resume-card-meta">
            📝 {resume.resumeStats.wordCount?.toLocaleString()} words
            · ⚡ {resume.resumeStats.skillsCount} skills
          </p>
        )}
      </div>

      {/* Action buttons */}
      <div className="resume-card-actions">
        <button
          className="resume-action-btn view"
          onClick={() => onView && onView(resume)}
          title="View ATS Analysis"
          disabled={isRestoring || isDeleting}
        >
          👁 View
        </button>

        <button
          className="resume-action-btn download"
          onClick={handleDownload}
          title="Download Resume"
          disabled={!resume.fileUrl}
        >
          ⬇ Download
        </button>

        {!isActive && (
          <button
            className="resume-action-btn restore"
            onClick={() => onRestore && onRestore(resume._id)}
            disabled={isRestoring || isDeleting}
            title="Restore this version"
          >
            {isRestoring ? (
              <span className="btn-spinner" />
            ) : (
              "↩ Restore"
            )}
          </button>
        )}

        <button
          className="resume-action-btn delete"
          onClick={() => onDelete && onDelete(resume._id)}
          disabled={isDeleting || isRestoring}
          title="Delete this version"
        >
          {isDeleting ? <span className="btn-spinner" /> : "🗑 Delete"}
        </button>
      </div>
    </motion.div>
  );
};

export default ResumeHistoryCard;
