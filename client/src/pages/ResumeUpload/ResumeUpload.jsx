import { useState, useCallback, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, X, UploadCloud, CheckCircle2 } from "lucide-react";
import {
  dismissToast,
  showError,
  showLoading,
  showSuccess,
} from "../../components/UI/Toast";
import resumeService from "../../services/resumeService";
import api from "../../services/api";
import ATSAnalysisPanel from "./components/ATSAnalysisPanel";
import ResumeHistoryPanel from "./components/ResumeHistoryPanel";

const ALLOWED_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

const ResumeUpload = () => {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // ATS data state — persisted in localStorage for interview setup
  const [atsData, setAtsData] = useState(() => {
    try {
      const stored = localStorage.getItem("atsData");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  // Trigger history panel to refresh after upload
  const [historyRefreshKey, setHistoryRefreshKey] = useState(0);

  // For viewing a history card's ATS data (view-only mode)
  const [viewingVersion, setViewingVersion] = useState(null);

  // Modal and loading states for Saved Resumes list
  const [showBuilderModal, setShowBuilderModal] = useState(false);
  const [builderResumes, setBuilderResumes] = useState([]);
  const [loadingBuilder, setLoadingBuilder] = useState(false);

  const openBuilderModal = async () => {
    setShowBuilderModal(true);
    setLoadingBuilder(true);
    try {
      const response = await api.get("/resume-builder");
      setBuilderResumes(response.data.resumes || []);
    } catch (error) {
      showError("Failed to load saved builder resumes.");
    } finally {
      setLoadingBuilder(false);
    }
  };

  const handleSelectBuilderResume = async (resumeId) => {
    setShowBuilderModal(false);
    setIsUploading(true);
    setUploadProgress(20);
    const toastId = showLoading("Synchronizing builder resume...");

    try {
      setUploadProgress(50);
      const response = await api.post(`/resume-builder/${resumeId}/set-active`);
      setUploadProgress(80);

      const activeAtsData = {
        atsScore:     response.data.atsScore,
        atsAnalysis:  response.data.atsAnalysis,
        sectionsFound: response.data.sectionsFound,
        aiSuggestions: response.data.aiSuggestions,
        resumeStats:  response.data.resumeStats,
        resumeId:     response.data.resumeId,
        version:      response.data.version,
        resumeName:   response.data.resumeName,
      };

      setAtsData(activeAtsData);

      // Persist locally for compatibility
      localStorage.setItem("atsData", JSON.stringify(activeAtsData));
      if (response.data.extractedText) {
        localStorage.setItem("resumeText", response.data.extractedText);
      }
      if (response.data.atsScore) {
        localStorage.setItem("atsScore", JSON.stringify(response.data.atsScore));
      }
      localStorage.setItem("activeResumeId", response.data.resumeId);

      setUploadProgress(100);
      dismissToast(toastId);
      showSuccess("Builder resume synced & analyzed successfully!");
      setHistoryRefreshKey((prev) => prev + 1); // reload history panel list
    } catch (error) {
      dismissToast(toastId);
      showError("Failed to synchronize builder resume.");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  // Fetch active resume from MongoDB on mount to ensure synchronization
  useEffect(() => {
    const fetchActiveResume = async () => {
      // If we don't have local cached data, show skeleton loading
      if (!atsData) {
        setIsAnalyzing(true);
      }
      try {
        const response = await resumeService.getActiveResume();
        if (response.success && response.resume) {
          const res = response.resume;
          const activeAtsData = {
            atsScore:     res.atsScore,
            atsAnalysis:  res.atsAnalysis,
            sectionsFound: res.sectionsFound,
            aiSuggestions: res.aiSuggestions,
            resumeStats:  res.resumeStats,
            resumeId:     res._id,
            version:      res.version,
            resumeName:   res.resumeName,
          };
          setAtsData(activeAtsData);

          // Persist to localStorage for interview flow compatibility
          localStorage.setItem("atsData", JSON.stringify(activeAtsData));
          if (res.extractedText) {
            localStorage.setItem("resumeText", res.extractedText);
          }
          if (res.atsScore) {
            localStorage.setItem("atsScore", JSON.stringify(res.atsScore));
          }
          localStorage.setItem("activeResumeId", res._id);
        }
      } catch (error) {
        console.error("Failed to fetch active resume:", error);
      } finally {
        setIsAnalyzing(false);
      }
    };

    fetchActiveResume();
  }, []);

  // ── File selection ──────────────────────────────────────────────────────────
  const handleFileChange = (event) => {
    const selected = event.target.files?.[0] || null;

    if (selected && !ALLOWED_TYPES.includes(selected.type)) {
      showError("Please select a PDF or DOCX file");
      event.target.value = "";
      setFile(null);
      return;
    }

    if (selected && selected.size > 5 * 1024 * 1024) {
      showError("Resume must be smaller than 5 MB");
      event.target.value = "";
      setFile(null);
      return;
    }

    setFile(selected);
  };

  // ── Drag & drop support ─────────────────────────────────────────────────────
  const handleDrop = (e) => {
    e.preventDefault();
    const dropped = e.dataTransfer.files?.[0];
    if (!dropped) return;

    if (!ALLOWED_TYPES.includes(dropped.type)) {
      showError("Please drop a PDF or DOCX file");
      return;
    }
    if (dropped.size > 5 * 1024 * 1024) {
      showError("Resume must be smaller than 5 MB");
      return;
    }
    setFile(dropped);
  };

  // ── Upload + Auto ATS ──────────────────────────────────────────────────────
  const handleUpload = async () => {
    if (!file) {
      showError("Choose a PDF or DOCX resume first");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setAtsData(null);
    setViewingVersion(null);
    const toastId = showLoading("Uploading & analyzing resume...");

    try {
      const formData = new FormData();
      formData.append("resume", file);

      setIsAnalyzing(true);

      const response = await resumeService.uploadResume(formData, (progressEvent) => {
        const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        setUploadProgress(percent);
      });

      // Persist to localStorage for interview setup
      if (response.resumeText) {
        localStorage.setItem("resumeText", response.resumeText);
      }
      if (response.atsScore) {
        localStorage.setItem("atsScore", JSON.stringify(response.atsScore));
      }
      if (response.resumeId) {
        localStorage.setItem("activeResumeId", response.resumeId);
      }

      // Build unified atsData object
      const newAtsData = {
        atsScore:     response.atsScore,
        atsAnalysis:  response.atsAnalysis,
        sectionsFound: response.sectionsFound,
        aiSuggestions: response.aiSuggestions,
        resumeStats:  response.resumeStats,
        resumeId:     response.resumeId,
        version:      response.version,
        resumeName:   response.resumeName,
      };

      localStorage.setItem("atsData", JSON.stringify(newAtsData));
      setAtsData(newAtsData);

      dismissToast(toastId);
      showSuccess(`Resume v${response.version} uploaded — ATS Score: ${response.atsScore?.score ?? 0}/100`);

      // Refresh history panel
      setHistoryRefreshKey((k) => k + 1);
      setFile(null);
    } catch (error) {
      dismissToast(toastId);
      showError(error.response?.data?.message || "Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      setIsAnalyzing(false);
    }
  };

  // ── Handle restore / view from history panel ────────────────────────────────
  const handleRestoreData = useCallback((data) => {
    if (!data) return;

    const newAtsData = {
      atsScore:     data.atsScore,
      atsAnalysis:  data.atsAnalysis,
      sectionsFound: data.sectionsFound,
      aiSuggestions: data.aiSuggestions,
      resumeStats:  data.resumeStats,
      resumeId:     data.resumeId,
      version:      data.version,
    };

    setAtsData(newAtsData);
    setViewingVersion(data.viewOnly ? data.version : null);

    if (!data.viewOnly) {
      localStorage.setItem("atsData", JSON.stringify(newAtsData));
      if (data.resumeText) localStorage.setItem("resumeText", data.resumeText);
      if (data.atsScore) localStorage.setItem("atsScore", JSON.stringify(data.atsScore));
      if (data.resumeId) localStorage.setItem("activeResumeId", data.resumeId);
    }

    // Scroll to ATS panel
    setTimeout(() => {
      document.getElementById("ats-panel-anchor")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 200);
  }, []);

  const showATS = atsData || isAnalyzing;

  return (
    <main className="app-shell narrow">
      {/* ── Page Header ─────────────────────────────────────────────────────── */}
      <header className="page-header">
        <p className="eyebrow">Resume Context</p>
        <h1>Upload Resume</h1>
        <p className="muted">
          PDF or DOCX, up to 5 MB. Your resume is automatically analyzed for ATS
          compatibility and saved with full version history.
        </p>
      </header>

      {/* ── Upload Card ──────────────────────────────────────────────────────── */}
      <motion.section
        className="panel"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{ padding: "28px" }}
      >
        <label
          className={`file-drop enhanced-drop ${file ? "has-file" : ""}`}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "40px 20px",
            border: "2px dashed var(--border)",
            borderRadius: "16px",
            background: "rgba(255, 255, 255, 0.01)",
            cursor: "pointer",
            transition: "all 0.2s ease",
            position: "relative"
          }}
        >
          <input
            accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            onChange={handleFileChange}
            type="file"
            disabled={isUploading}
            style={{ display: "none" }}
          />
          <span style={{ display: "none" }}>Choose a PDF or DOCX resume</span>
          <div className="drop-zone-content" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", textAlign: "center" }}>
            <div style={{ background: "rgba(99, 102, 241, 0.1)", color: "var(--primary)", padding: "14px", borderRadius: "50%", display: "flex" }}>
              <UploadCloud size={32} />
            </div>
            <span style={{ fontSize: "1rem", fontWeight: 600, color: "var(--text)" }}>
              {file ? file.name : "Drag & drop your resume here or browse files"}
            </span>
            {!file && (
              <span style={{ fontSize: "0.8rem", color: "var(--muted)" }}>PDF or DOCX · Max 5 MB</span>
            )}
            {file && (
              <span style={{ fontSize: "0.8rem", color: "var(--primary)", fontWeight: 600 }}>
                {(file.size / 1024).toFixed(1)} KB · Ready to analyze
              </span>
            )}
          </div>
        </label>

        {/* Upload progress */}
        <AnimatePresence>
          {isUploading && (
            <motion.div
              className="upload-progress-wrap"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              style={{ marginTop: "20px" }}
            >
              <div className="spinner-row" style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px", fontSize: "0.88rem" }}>
                <div className="loading-spinner" style={{ width: "16px", height: "16px", border: "2px solid rgba(255,255,255,0.1)", borderTopColor: "var(--primary)", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                <span>
                  {uploadProgress < 100
                    ? `Uploading... ${uploadProgress}%`
                    : "Running ATS analysis & AI suggestions..."}
                </span>
              </div>
              <div className="upload-progress-container" style={{ height: "6px", background: "rgba(255,255,255,0.05)", borderRadius: "10px", overflow: "hidden" }}>
                <motion.div
                  className="upload-progress-bar"
                  animate={{ width: `${uploadProgress}%` }}
                  transition={{ ease: "easeOut" }}
                  style={{ height: "100%", background: "linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)", borderRadius: "10px" }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action buttons */}
        <div className="button-row" style={{ marginTop: "24px", display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <button
            className="btn btn-primary"
            onClick={handleUpload}
            disabled={isUploading}
            id="upload-resume-btn"
            style={{
              background: "linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)",
              color: "#fff",
              fontWeight: 600,
              fontSize: "0.88rem",
              padding: "10px 20px",
              borderRadius: "10px",
              cursor: "pointer",
              border: "none",
              height: "44px"
            }}
          >
            {isUploading ? "Analyzing..." : "Upload Resume"}
          </button>
          <button
            className="btn btn-secondary"
            onClick={openBuilderModal}
            disabled={isUploading}
            style={{ display: "flex", alignItems: "center", gap: "8px", height: "44px", borderRadius: "10px" }}
          >
            <FileText size={16} /> Use Resume Builder Resume
          </button>
          <Link
            className="btn btn-secondary"
            to="/interview-setup"
            style={{
              pointerEvents: isUploading ? "none" : "auto",
              opacity: isUploading ? 0.6 : 1,
              display: "flex",
              alignItems: "center",
              height: "44px",
              borderRadius: "10px",
              textDecoration: "none"
            }}
          >
            Continue to Interview →
          </Link>
        </div>
      </motion.section>

      {/* ── ATS Analysis Panel ───────────────────────────────────────────────── */}
      <div id="ats-panel-anchor" />
      <AnimatePresence mode="wait">
        {showATS && (
          <motion.section
            className="panel ats-panel-section"
            key="ats-section"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.5 }}
          >
            <div className="section-heading" style={{ marginBottom: "20px" }}>
              <h2>
                {viewingVersion !== null
                  ? `📊 ATS Analysis — Resume v${viewingVersion}`
                  : `📊 ATS Analysis${atsData?.version ? ` — Resume v${atsData.version}` : ""}`}
              </h2>
              {viewingVersion !== null && (
                <span
                  className="viewing-badge"
                  style={{
                    fontSize: "0.78rem",
                    padding: "3px 10px",
                    borderRadius: "20px",
                    background: "rgba(143,180,255,0.15)",
                    color: "var(--accent)",
                    fontWeight: 700,
                  }}
                >
                  View Mode
                </span>
              )}
            </div>

            <ATSAnalysisPanel
              atsData={atsData}
              isLoading={isAnalyzing && !atsData}
            />
          </motion.section>
        )}
      </AnimatePresence>

      {/* ── Resume History Panel ─────────────────────────────────────────────── */}
      <ResumeHistoryPanel
        onRestoreData={handleRestoreData}
        refreshTrigger={historyRefreshKey}
      />

      {/* ── Builder Resumes Modal Overlay ─────────────────────────────── */}
      <AnimatePresence>
        {showBuilderModal && (
          <div 
            style={{ 
              position: "fixed",
              top: 0,
              left: 0,
              width: "100vw",
              height: "100vh",
              background: "rgba(0,0,0,0.6)",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center", 
              zIndex: 100 
            }}
          >
            <motion.div
              className="panel"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              style={{ width: "min(500px, 90%)", maxHeight: "80vh", overflowY: "auto", position: "relative", padding: "24px" }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px", borderBottom: "1px solid var(--border)", paddingBottom: "10px" }}>
                <h2 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 700 }}>Select Builder Resume</h2>
                <button
                  onClick={() => setShowBuilderModal(false)}
                  style={{ background: "transparent", border: "none", color: "var(--muted)", cursor: "pointer", fontSize: "1.1rem" }}
                  aria-label="Close modal"
                >
                  <X size={18} />
                </button>
              </div>

              {loadingBuilder ? (
                <div style={{ textAlign: "center", padding: "20px", color: "var(--muted)" }}>
                  Loading saved resumes...
                </div>
              ) : builderResumes.length === 0 ? (
                <div style={{ textAlign: "center", padding: "20px", color: "var(--muted)" }}>
                  No saved resumes found in Resume Builder. Go to Resume Builder page to create one.
                </div>
              ) : (
                <div style={{ display: "grid", gap: "12px" }}>
                  {builderResumes.map((res) => (
                    <div
                      key={res._id}
                      style={{
                        padding: "14px",
                        border: "1px solid var(--border)",
                        borderRadius: "8px",
                        background: "rgba(255,255,255,0.01)",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <div>
                        <strong style={{ display: "block" }}>{res.name}</strong>
                        <span className="muted" style={{ fontSize: "0.8rem" }}>
                          Template: {res.template} · Score: {res.atsScore}%
                        </span>
                      </div>
                      <button
                        className="btn btn-secondary"
                        onClick={() => handleSelectBuilderResume(res._id)}
                        style={{ padding: "6px 12px", fontSize: "0.85rem" }}
                      >
                        Select
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
};

export default ResumeUpload;
