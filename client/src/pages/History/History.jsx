import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  Trash2, 
  RotateCcw, 
  X, 
  Eye, 
  HelpCircle,
} from "lucide-react";
import { showError, showSuccess } from "../../components/UI/Toast";
import historyService from "../../services/historyService";

const History = () => {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [status, setStatus] = useState("active");
  const [sort, setSort] = useState("newest");
  const [selected, setSelected] = useState([]);
  const [lastDeleted, setLastDeleted] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [activeInterview, setActiveInterview] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const loadHistory = () => {
    setLoading(true);
    historyService
      .getHistory({ search, difficulty, status, sort })
      .then((data) => setInterviews(data.interviews || []))
      .catch(() => setInterviews([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const timeoutId = window.setTimeout(loadHistory, 200);
    return () => window.clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, difficulty, status, sort]);

  const toggleSelected = (id) => {
    setSelected((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    );
  };

  const deleteInterview = async (id) => {
    try {
      await historyService.deleteInterview(id);
      setInterviews((current) => current.filter((item) => item._id !== id));
      setLastDeleted({ ids: [id] });
      showSuccess("Interview deleted. Use undo to restore it.");
    } catch (error) {
      showError(error.response?.data?.message || "Unable to delete interview");
    }
  };

  const requestDelete = (ids) => {
    if (!ids.length) {
      showError("Select at least one interview");
      return;
    }

    setPendingDelete({ ids });
  };

  const confirmDelete = async () => {
    if (!pendingDelete?.ids?.length) return;

    if (pendingDelete.ids.length === 1) {
      await deleteInterview(pendingDelete.ids[0]);
    } else {
      await bulkDelete();
    }

    setPendingDelete(null);
  };

  const bulkDelete = async () => {
    if (!selected.length) {
      showError("Select at least one interview");
      return;
    }

    try {
      await historyService.bulkDelete(selected);
      setInterviews((current) =>
        current.filter((item) => !selected.includes(item._id))
      );
      setLastDeleted({ ids: selected });
      setSelected([]);
      showSuccess("Selected interviews deleted. Use undo to restore them.");
    } catch (error) {
      showError(error.response?.data?.message || "Bulk delete failed");
    }
  };

  const restoreInterview = async (id) => {
    try {
      await historyService.restoreInterview(id);
      setInterviews((current) => current.filter((item) => item._id !== id));
      showSuccess("Interview restored");
    } catch (error) {
      showError(error.response?.data?.message || "Unable to restore interview");
    }
  };

  const openDetails = async (id) => {
    setDetailLoading(true);
    setActiveInterview(null);

    try {
      const data = await historyService.getInterview(id);
      setActiveInterview(data.interview);
    } catch (error) {
      showError(error.response?.data?.message || "Unable to load interview details");
    } finally {
      setDetailLoading(false);
    }
  };

  const undoDelete = async () => {
    if (!lastDeleted?.ids?.length) return;

    try {
      await Promise.all(
        lastDeleted.ids.map((id) => historyService.restoreInterview(id))
      );
      setLastDeleted(null);
      loadHistory();
      showSuccess("Deleted interviews restored");
    } catch (error) {
      showError(error.response?.data?.message || "Undo failed");
    }
  };

  const allSelected =
    interviews.length > 0 && interviews.every((item) => selected.includes(item._id));

  const toggleAll = () => {
    setSelected(allSelected ? [] : interviews.map((item) => item._id));
  };

  return (
    <main className="app-shell" style={{ width: "100%" }}>
      {/* Page Header */}
      <header className="page-header" style={{ marginBottom: "24px" }}>
        <p className="eyebrow">Progress Tracker</p>
        <h1 style={{ fontSize: "1.6rem", fontWeight: 700, margin: 0 }}>Interview History</h1>
        <p className="muted" style={{ margin: "4px 0 0 0" }}>Search, filter, delete, and restore interview records.</p>
      </header>

      {/* Toolbar & Filters Card */}
      <section className="panel" style={{ padding: "24px", display: "grid", gap: "20px" }}>
        <div 
          className="history-toolbar"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "16px"
          }}
        >
          <label style={{ display: "grid", gap: "6px", fontSize: "0.8rem", color: "var(--muted)", fontWeight: 600 }}>
            Search Role
            <div style={{ position: "relative" }}>
              <Search size={14} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--muted)" }} />
              <input
                onChange={(event) => setSearch(event.target.value)}
                placeholder="e.g. React Developer"
                value={search}
                style={{ paddingLeft: "36px", height: "42px", fontSize: "0.85rem", borderRadius: "10px" }}
              />
            </div>
          </label>
          
          <label style={{ display: "grid", gap: "6px", fontSize: "0.8rem", color: "var(--muted)", fontWeight: 600 }}>
            Difficulty
            <select
              onChange={(event) => setDifficulty(event.target.value)}
              value={difficulty}
              style={{ height: "42px", fontSize: "0.85rem", borderRadius: "10px" }}
            >
              <option value="">All</option>
              <option>Beginner</option>
              <option>Intermediate</option>
              <option>Advanced</option>
            </select>
          </label>

          <label style={{ display: "grid", gap: "6px", fontSize: "0.8rem", color: "var(--muted)", fontWeight: 600 }}>
            Status
            <select 
              onChange={(event) => setStatus(event.target.value)} 
              value={status}
              style={{ height: "42px", fontSize: "0.85rem", borderRadius: "10px" }}
            >
              <option value="active">Active</option>
              <option value="deleted">Deleted</option>
            </select>
          </label>

          <label style={{ display: "grid", gap: "6px", fontSize: "0.8rem", color: "var(--muted)", fontWeight: 600 }}>
            Sort By
            <select 
              onChange={(event) => setSort(event.target.value)} 
              value={sort}
              style={{ height: "42px", fontSize: "0.85rem", borderRadius: "10px" }}
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="score-high">Best score</option>
              <option value="score-low">Needs work</option>
            </select>
          </label>
        </div>

        {/* Action button row */}
        {(status === "active" && selected.length > 0) || lastDeleted ? (
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", borderTop: "1px solid var(--border)", paddingTop: "16px" }}>
            {status === "active" && selected.length > 0 && (
              <button 
                className="btn btn-secondary compact" 
                onClick={() => requestDelete(selected)} 
                type="button"
                style={{ color: "var(--danger)", borderColor: "rgba(239, 68, 68, 0.2)", height: "38px", borderRadius: "8px" }}
              >
                <Trash2 size={14} /> Delete Selected ({selected.length})
              </button>
            )}
            {lastDeleted && (
              <button 
                className="btn btn-primary compact" 
                onClick={undoDelete} 
                type="button"
                style={{ height: "38px", borderRadius: "8px" }}
              >
                <RotateCcw size={14} /> Undo Delete
              </button>
            )}
          </div>
        ) : null}

        {/* Table Wrap */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <div className="loader" style={{ margin: "0 auto 12px" }} />
            <p className="muted" style={{ fontSize: "0.85rem" }}>Loading interview records...</p>
          </div>
        ) : interviews.length ? (
          <div className="table-wrap" style={{ border: "1px solid var(--border)", borderRadius: "12px", overflow: "hidden" }}>
            <table style={{ borderCollapse: "collapse", width: "100%" }}>
              <thead>
                <tr style={{ background: "rgba(255,255,255,0.02)" }}>
                  {status === "active" && (
                    <th style={{ width: "40px", padding: "14px" }}>
                      <input checked={allSelected} onChange={toggleAll} type="checkbox" style={{ cursor: "pointer" }} />
                    </th>
                  )}
                  <th style={{ textAlign: "left", padding: "14px" }}>Role / Scenario</th>
                  <th style={{ textAlign: "left", padding: "14px" }}>Difficulty</th>
                  <th style={{ textAlign: "left", padding: "14px" }}>Mock Score</th>
                  <th style={{ textAlign: "left", padding: "14px" }}>ATS Score</th>
                  <th style={{ textAlign: "left", padding: "14px" }}>Date</th>
                  <th style={{ textAlign: "right", padding: "14px" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {interviews.map((item) => (
                  <tr 
                    key={item._id}
                    style={{ borderTop: "1px solid var(--border)", transition: "background 0.2s" }}
                    className="interactive-row"
                  >
                    {status === "active" && (
                      <td style={{ padding: "14px" }}>
                        <input
                          aria-label={`Select ${item.role}`}
                          checked={selected.includes(item._id)}
                          onChange={() => toggleSelected(item._id)}
                          type="checkbox"
                          style={{ cursor: "pointer" }}
                        />
                      </td>
                    )}
                    <td style={{ padding: "14px", fontWeight: 600 }}>
                      <span className="table-title" style={{ fontSize: "0.9rem", color: "var(--text)" }}>{item.role}</span>
                    </td>
                    <td style={{ padding: "14px" }}>
                      <span 
                        style={{
                          fontSize: "0.75rem",
                          fontWeight: 700,
                          padding: "4px 8px",
                          borderRadius: "6px",
                          background: item.difficulty === "Advanced" 
                            ? "rgba(239, 68, 68, 0.1)" 
                            : item.difficulty === "Intermediate" 
                              ? "rgba(245, 158, 11, 0.1)" 
                              : "rgba(34, 197, 94, 0.1)",
                          color: item.difficulty === "Advanced" 
                            ? "#EF4444" 
                            : item.difficulty === "Intermediate" 
                              ? "#F59E0B" 
                              : "#22C55E"
                        }}
                      >
                        {item.difficulty || "Beginner"}
                      </span>
                    </td>
                    <td style={{ padding: "14px" }}>
                      <strong 
                        style={{ 
                          fontSize: "0.9rem", 
                          color: item.score >= 80 
                            ? "#22C55E" 
                            : item.score >= 60 
                              ? "#6366F1" 
                              : "#EF4444" 
                        }}
                      >
                        {item.score || 0}%
                      </strong>
                    </td>
                    <td style={{ padding: "14px", color: "var(--muted)", fontSize: "0.85rem" }}>
                      {item.atsScore?.score ?? "N/A"}
                    </td>
                    <td style={{ padding: "14px", color: "var(--muted)", fontSize: "0.85rem" }}>
                      {new Date(item.createdAt).toLocaleDateString()}
                    </td>
                    <td style={{ padding: "14px", textAlign: "right" }}>
                      <div style={{ display: "inline-flex", gap: "8px" }}>
                        <button
                          className="btn btn-ghost compact"
                          onClick={() => openDetails(item._id)}
                          type="button"
                          style={{ height: "32px", padding: "0 10px", borderRadius: "6px" }}
                        >
                          <Eye size={12} /> Details
                        </button>
                        {status === "deleted" ? (
                          <button
                            className="btn btn-secondary compact"
                            onClick={() => restoreInterview(item._id)}
                            type="button"
                            style={{ height: "32px", padding: "0 10px", borderRadius: "6px" }}
                          >
                            Restore
                          </button>
                        ) : (
                          <button
                            className="btn btn-secondary compact"
                            onClick={() => requestDelete([item._id])}
                            type="button"
                            style={{ height: "32px", padding: "0 10px", borderRadius: "6px", color: "var(--danger)", borderColor: "rgba(239, 68, 68, 0.1)" }}
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-panel" style={{ textAlign: "center", padding: "48px 24px" }}>
            <HelpCircle size={40} style={{ color: "var(--muted)", marginBottom: "12px" }} />
            <h2 style={{ fontSize: "1.2rem", fontWeight: 700, margin: "0 0 6px 0" }}>No interviews found</h2>
            <p className="muted" style={{ margin: "0 0 20px 0", fontSize: "0.85rem" }}>
              No matching records discovered. Start a new mock practice.
            </p>
            <Link className="btn btn-primary" to="/interview-setup" style={{ height: "42px", borderRadius: "10px", display: "inline-flex", alignItems: "center" }}>
              Start Interview
            </Link>
          </div>
        )}
      </section>

      {/* Loading Details Spinner Modal */}
      {detailLoading && (
        <div 
          style={{ 
            position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", 
            background: "rgba(0,0,0,0.5)", backdropFilter: "blur(6px)", 
            zIndex: 150, display: "flex", alignItems: "center", justifyContent: "center" 
          }}
        >
          <div className="panel" style={{ padding: "30px", textAlign: "center" }}>
            <div className="loader" style={{ margin: "0 auto 12px" }} />
            <p className="muted" style={{ margin: 0, fontSize: "0.85rem" }}>Loading interview details...</p>
          </div>
        </div>
      )}

      {/* Detailed QA Summary Modal Overlay */}
      <AnimatePresence>
        {activeInterview && (
          <div 
            style={{ 
              position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", 
              background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)", 
              zIndex: 150, display: "flex", alignItems: "center", justifyContent: "center",
              padding: "20px"
            }}
          >
            <motion.section 
              className="panel"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              style={{ 
                width: "min(850px, 95%)", 
                maxHeight: "90vh", 
                overflowY: "auto", 
                position: "relative",
                padding: "28px" 
              }}
            >
              {/* Close Button & Header */}
              <div 
                style={{ 
                  display: "flex", 
                  justifyContent: "space-between", 
                  alignItems: "flex-start", 
                  borderBottom: "1px solid var(--border)", 
                  paddingBottom: "16px",
                  marginBottom: "20px" 
                }}
              >
                <div>
                  <p className="eyebrow" style={{ textTransform: "uppercase" }}>Mock Interview Details</p>
                  <h2 style={{ fontSize: "1.4rem", fontWeight: 700, margin: 0 }}>{activeInterview.role}</h2>
                </div>
                <button 
                  className="btn btn-ghost" 
                  onClick={() => setActiveInterview(null)} 
                  type="button"
                  style={{ borderRadius: "8px", width: "36px", height: "36px", padding: 0 }}
                  aria-label="Close details modal"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Grid of Scores */}
              <div 
                style={{ 
                  display: "grid", 
                  gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", 
                  gap: "14px",
                  marginBottom: "24px"
                }}
              >
                <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)", borderRadius: "10px", padding: "12px", textAlign: "center" }}>
                  <span style={{ fontSize: "0.75rem", color: "var(--muted)", fontWeight: 600 }}>OVERALL SCORE</span>
                  <strong style={{ display: "block", fontSize: "1.4rem", marginTop: "4px", color: "var(--primary)" }}>{activeInterview.score || 0}%</strong>
                </div>
                <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)", borderRadius: "10px", padding: "12px", textAlign: "center" }}>
                  <span style={{ fontSize: "0.75rem", color: "var(--muted)", fontWeight: 600 }}>DIFFICULTY</span>
                  <strong style={{ display: "block", fontSize: "1.1rem", marginTop: "6px" }}>{activeInterview.difficulty || "N/A"}</strong>
                </div>
                <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)", borderRadius: "10px", padding: "12px", textAlign: "center" }}>
                  <span style={{ fontSize: "0.75rem", color: "var(--muted)", fontWeight: 600 }}>DATE CONSTRUCTED</span>
                  <strong style={{ display: "block", fontSize: "0.95rem", marginTop: "6px" }}>{new Date(activeInterview.createdAt).toLocaleDateString()}</strong>
                </div>
              </div>

              {/* Mistakes Panel */}
              {activeInterview.feedback?.improvementTracker?.mistakesMade && (
                <div 
                  className="history-mistakes-panel"
                  style={{
                    background: "rgba(239, 68, 68, 0.05)",
                    border: "1px solid rgba(239, 68, 68, 0.1)",
                    borderRadius: "12px",
                    padding: "16px",
                    marginBottom: "28px"
                  }}
                >
                  <h3 style={{ fontSize: "0.9rem", fontWeight: 700, margin: "0 0 6px 0", color: "#EF4444" }}>Mistakes Made Pattern</h3>
                  <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--text)", lineHeight: 1.4 }}>
                    {activeInterview.feedback.improvementTracker.mistakesMade.join(" ") || "No repeated mistake pattern detected yet."}
                  </p>
                </div>
              )}

              {/* Questions/Answers List */}
              <div style={{ display: "grid", gap: "20px" }}>
                <h3 style={{ fontSize: "1rem", fontWeight: 700, margin: 0 }}>QA Responses ({activeInterview.questions?.length || 0})</h3>
                
                {(activeInterview.feedback?.questionScores || activeInterview.questions || []).map((item, index) => {
                  const question = item.question || activeInterview.questions?.[index];
                  const answer = item.answer || activeInterview.answers?.[index];
                  return (
                    <article 
                      key={index} 
                      style={{ 
                        background: "rgba(255,255,255,0.01)", 
                        border: "1px solid var(--border)", 
                        borderRadius: "14px", 
                        padding: "20px" 
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                        <h4 style={{ margin: 0, fontSize: "0.92rem", fontWeight: 700, color: "var(--muted)" }}>Question {index + 1}</h4>
                        <span style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--primary)" }}>{item.score ?? "—"}% Match</span>
                      </div>

                      {/* Subscores Badges */}
                      <div 
                        style={{ 
                          display: "grid", 
                          gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))", 
                          gap: "8px",
                          marginBottom: "16px" 
                        }}
                      >
                        <div style={{ background: "rgba(255,255,255,0.01)", padding: "8px", borderRadius: "8px", textAlign: "center", fontSize: "0.78rem" }}>
                          <span style={{ display: "block", color: "var(--muted)" }}>Correctness</span>
                          <strong style={{ color: "var(--text)" }}>{item.correctnessScore ?? 0}%</strong>
                        </div>
                        <div style={{ background: "rgba(255,255,255,0.01)", padding: "8px", borderRadius: "8px", textAlign: "center", fontSize: "0.78rem" }}>
                          <span style={{ display: "block", color: "var(--muted)" }}>Relevance</span>
                          <strong style={{ color: "var(--text)" }}>{item.relevanceScore ?? 0}%</strong>
                        </div>
                        <div style={{ background: "rgba(255,255,255,0.01)", padding: "8px", borderRadius: "8px", textAlign: "center", fontSize: "0.78rem" }}>
                          <span style={{ display: "block", color: "var(--muted)" }}>Technical</span>
                          <strong style={{ color: "var(--text)" }}>{item.technicalAccuracyScore ?? 0}%</strong>
                        </div>
                        <div style={{ background: "rgba(255,255,255,0.01)", padding: "8px", borderRadius: "8px", textAlign: "center", fontSize: "0.78rem" }}>
                          <span style={{ display: "block", color: "var(--muted)" }}>Communication</span>
                          <strong style={{ color: "var(--text)" }}>{item.communicationScore ?? 0}%</strong>
                        </div>
                      </div>

                      <p style={{ margin: "0 0 12px 0", fontSize: "0.92rem", fontWeight: 600, color: "var(--text)" }}>
                        {question}
                      </p>

                      <div style={{ display: "grid", gap: "10px", fontSize: "0.82rem", lineHeight: 1.4 }}>
                        <div style={{ paddingLeft: "12px", borderLeft: "3px solid var(--border)" }}>
                          <strong style={{ color: "var(--primary)" }}>Your Answer:</strong>
                          <p style={{ margin: "4px 0 0 0", color: "var(--muted)" }}>{answer || "No answer recorded."}</p>
                        </div>
                        
                        {item.whatWasCorrect?.length > 0 && (
                          <div>
                            <strong style={{ color: "#22C55E" }}>Correct aspects:</strong> {item.whatWasCorrect.join(", ")}
                          </div>
                        )}
                        {item.whatWasIncorrect?.length > 0 && (
                          <div>
                            <strong style={{ color: "#EF4444" }}>Identified gaps:</strong> {item.whatWasIncorrect.join(", ")}
                          </div>
                        )}
                        {item.whyItIsWrong && (
                          <div>
                            <strong style={{ color: "var(--muted)" }}>AI Explanation:</strong> {item.whyItIsWrong || item.feedback}
                          </div>
                        )}
                        {item.correctAnswer && (
                          <div>
                            <strong style={{ color: "var(--primary)" }}>Recommended Outline:</strong> {item.correctAnswer}
                          </div>
                        )}
                        {item.improvementSuggestion && (
                          <div style={{ background: "rgba(99,102,241,0.02)", padding: "10px", borderRadius: "8px", border: "1px dashed rgba(99,102,241,0.15)" }}>
                            <strong style={{ color: "var(--primary)" }}>Improvement recommendation:</strong> {item.improvementSuggestion}
                          </div>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            </motion.section>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal Overlay */}
      <AnimatePresence>
        {pendingDelete && (
          <div 
            style={{ 
              position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", 
              background: "rgba(0,0,0,0.5)", backdropFilter: "blur(6px)", 
              zIndex: 160, display: "flex", alignItems: "center", justify: "center" 
            }}
          >
            <motion.section 
              className="panel"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              style={{ width: "min(400px, 90%)", padding: "24px" }}
            >
              <h2 style={{ fontSize: "1.1rem", fontWeight: 700, margin: "0 0 8px 0" }}>Confirm Delete</h2>
              <p className="muted" style={{ margin: "0 0 20px 0", fontSize: "0.85rem" }}>
                Are you sure you want to delete {pendingDelete.ids.length} interview{pendingDelete.ids.length > 1 ? "s" : ""}? You can restore them from the deleted status filter.
              </p>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                <button className="btn btn-secondary compact" onClick={() => setPendingDelete(null)} type="button">
                  Cancel
                </button>
                <button 
                  className="btn btn-primary compact" 
                  onClick={confirmDelete} 
                  type="button"
                  style={{ background: "var(--danger)", color: "#fff", border: "none" }}
                >
                  Confirm Delete
                </button>
              </div>
            </motion.section>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
};

export default History;
