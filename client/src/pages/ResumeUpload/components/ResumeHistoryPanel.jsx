import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import resumeService from "../../../services/resumeService";
import ResumeHistoryCard from "./ResumeHistoryCard";
import { showError, showSuccess } from "../../../components/UI/Toast";

// ── Loading skeleton for history cards ─────────────────────────────────────────
const HistoryCardSkeleton = () => (
  <div className="resume-history-card-skeleton">
    <div className="skeleton-block" style={{ width: "48px", height: "48px", borderRadius: "8px", marginBottom: "12px" }} />
    <div className="skeleton-block" style={{ width: "70%", height: "16px", marginBottom: "8px" }} />
    <div className="skeleton-block" style={{ width: "50%", height: "12px", marginBottom: "6px" }} />
    <div className="skeleton-block" style={{ width: "40%", height: "12px" }} />
  </div>
);

const ResumeHistoryPanel = ({ onRestoreData, refreshTrigger }) => {
  const [resumes, setResumes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [restoringId, setRestoringId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const LIMIT = 6;

  // ── Load history ──────────────────────────────────────────────────────────────
  const loadHistory = useCallback(async (pageNum = 1) => {
    setIsLoading(true);
    try {
      const data = await resumeService.getResumeHistory(pageNum, LIMIT);
      setResumes(data.resumes || []);
      setPagination(data.pagination || null);
      setPage(pageNum);
    } catch {
      // silently handle — not critical
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadHistory(1);
  }, [loadHistory, refreshTrigger]);

  // ── Restore ───────────────────────────────────────────────────────────────────
  const handleRestore = async (id) => {
    setRestoringId(id);
    try {
      const data = await resumeService.restoreResume(id);
      showSuccess(`Resume v${data.version} restored as active resume!`);

      // Update active state locally (optimistic)
      setResumes((prev) =>
        prev.map((r) => ({ ...r, isActive: r._id === id }))
      );

      // Notify parent to update ATS display
      if (onRestoreData) {
        onRestoreData(data);
      }

      // Also persist to localStorage for interview
      if (data.resumeText) {
        localStorage.setItem("resumeText", data.resumeText);
      }
      if (data.atsScore) {
        localStorage.setItem("atsScore", JSON.stringify(data.atsScore));
      }
      if (data.resumeId) {
        localStorage.setItem("activeResumeId", data.resumeId);
      }
    } catch (err) {
      showError(err?.response?.data?.message || "Failed to restore resume");
    } finally {
      setRestoringId(null);
    }
  };

  // ── Delete ────────────────────────────────────────────────────────────────────
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this resume version? This cannot be undone.")) return;
    setDeletingId(id);
    try {
      await resumeService.deleteResume(id);
      showSuccess("Resume version deleted.");
      // Remove from local list
      setResumes((prev) => prev.filter((r) => r._id !== id));
      // If last item on page, go back a page
      if (resumes.length === 1 && page > 1) {
        loadHistory(page - 1);
      }
    } catch (err) {
      showError(err?.response?.data?.message || "Failed to delete resume");
    } finally {
      setDeletingId(null);
    }
  };

  // ── View (open ATS panel for that version) ────────────────────────────────────
  const handleView = (resume) => {
    if (onRestoreData && resume) {
      onRestoreData({
        resumeText: resume.extractedText,
        atsScore: resume.atsScore,
        atsAnalysis: resume.atsAnalysis,
        sectionsFound: resume.sectionsFound,
        aiSuggestions: resume.aiSuggestions,
        resumeStats: resume.resumeStats,
        resumeId: resume._id,
        version: resume.version,
        viewOnly: true,
      });
    }
  };

  // ── Empty state ────────────────────────────────────────────────────────────────
  if (!isLoading && resumes.length === 0) {
    return (
      <motion.section
        className="panel resume-history-panel"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="section-heading">
          <h2>📂 Resume History</h2>
        </div>
        <div className="empty-panel" style={{ padding: "32px 0" }}>
          <span style={{ fontSize: "2.5rem" }}>📄</span>
          <p>No resumes uploaded yet.</p>
          <p className="muted">Upload your first resume to start tracking versions.</p>
        </div>
      </motion.section>
    );
  }

  return (
    <motion.section
      className="panel resume-history-panel"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      <div className="section-heading">
        <h2>
          📂 Resume History
          {pagination && (
            <span style={{ marginLeft: "10px", fontSize: "0.85rem", fontWeight: 400, color: "var(--muted)" }}>
              ({pagination.total} {pagination.total === 1 ? "version" : "versions"})
            </span>
          )}
        </h2>
        <button
          className="btn btn-ghost compact"
          onClick={() => loadHistory(1)}
          disabled={isLoading}
        >
          ↻ Refresh
        </button>
      </div>

      {isLoading ? (
        <div className="resume-history-grid">
          {Array.from({ length: 3 }).map((_, i) => (
            <HistoryCardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <>
          <AnimatePresence mode="popLayout">
            <div className="resume-history-grid">
              {resumes.map((resume, i) => (
                <ResumeHistoryCard
                  key={resume._id}
                  resume={resume}
                  index={i}
                  onRestore={handleRestore}
                  onDelete={handleDelete}
                  onView={handleView}
                  isRestoring={restoringId === resume._id}
                  isDeleting={deletingId === resume._id}
                />
              ))}
            </div>
          </AnimatePresence>

          {/* Pagination */}
          {pagination && pagination.pages > 1 && (
            <div className="history-pagination">
              <button
                className="btn btn-ghost compact"
                disabled={!pagination.hasPrev || isLoading}
                onClick={() => loadHistory(page - 1)}
              >
                ← Prev
              </button>
              <span className="pagination-info">
                Page {pagination.page} of {pagination.pages}
              </span>
              <button
                className="btn btn-ghost compact"
                disabled={!pagination.hasNext || isLoading}
                onClick={() => loadHistory(page + 1)}
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </motion.section>
  );
};

export default ResumeHistoryPanel;
