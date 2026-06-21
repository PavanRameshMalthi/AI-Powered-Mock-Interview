import { useState } from "react";
import { Link } from "react-router-dom";
import {
  dismissToast,
  showError,
  showLoading,
  showSuccess,
} from "../../components/UI/Toast";
import resumeService from "../../services/resumeService";

const ResumeUpload = () => {
  const allowedTypes = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [resumeText, setResumeText] = useState(
    localStorage.getItem("resumeText") || ""
  );
  const [atsScore, setAtsScore] = useState(() => {
    const stored = localStorage.getItem("atsScore");
    return stored ? JSON.parse(stored) : null;
  });

  const handleFileChange = (event) => {
    const selected = event.target.files?.[0] || null;

    if (selected && !allowedTypes.includes(selected.type)) {
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

  const handleUpload = async () => {
    if (!file) {
      showError("Choose a PDF or DOCX resume first");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    const toastId = showLoading("Reading resume...");

    try {
      const formData = new FormData();
      formData.append("resume", file);

      const response = await resumeService.uploadResume(formData, (progressEvent) => {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        setUploadProgress(percentCompleted);
      });

      localStorage.setItem("resumeText", response.resumeText);
      localStorage.setItem("atsScore", JSON.stringify(response.atsScore));
      setResumeText(response.resumeText);
      setAtsScore(response.atsScore);
      dismissToast(toastId);
      showSuccess("Resume uploaded successfully");
    } catch (error) {
      dismissToast(toastId);
      showError(error.response?.data?.message || "Upload failed");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <main className="app-shell narrow">
      <header className="page-header">
        <p className="eyebrow">Resume context</p>
        <h1>Upload resume</h1>
        <p className="muted">
          PDF or DOCX, up to 5 MB. The extracted text stays in this browser for
          the next interview setup.
        </p>
      </header>

      <section className="panel">
        <label className="file-drop">
          <input
            accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            onChange={handleFileChange}
            type="file"
            disabled={isUploading}
          />
          <span>{file ? file.name : "Choose a PDF or DOCX resume"}</span>
        </label>

        {isUploading && (
          <div style={{ marginTop: "16px" }}>
            <div className="spinner-row">
              <div className="loading-spinner" />
              <span>Extracting & Analyzing... {uploadProgress}%</span>
            </div>
            <div className="upload-progress-container">
              <div
                className="upload-progress-bar"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        <div className="button-row" style={{ marginTop: "20px" }}>
          <button className="btn btn-primary" onClick={handleUpload} disabled={isUploading}>
            Upload resume
          </button>
          <Link className="btn btn-secondary" to="/interview-setup" style={{ pointerEvents: isUploading ? "none" : "auto", opacity: isUploading ? 0.6 : 1 }}>
            Continue to setup
          </Link>
        </div>
      </section>

      {resumeText ? (
        <section className="panel">
          <div className="section-heading">
            <h2>Extracted preview</h2>
            <span>{resumeText.length} characters</span>
          </div>
          <p className="resume-preview">{resumeText.slice(0, 900)}</p>

          {atsScore ? (
            <div className="ats-dashboard">
              <div className="ats-score-gauge-container">
                <div className="ats-score-circle">
                  {atsScore.score}%
                </div>
                <div className="ats-score-info">
                  <h3>{atsScore.score}% ATS readiness</h3>
                  <p>Analyzed Match Level: <strong>{atsScore.level}</strong></p>
                </div>
              </div>

              <div className="ats-sections-grid">
                {atsScore.matchedKeywords && atsScore.matchedKeywords.length > 0 && (
                  <div className="ats-detail-card">
                    <h3>Matched Keywords ({atsScore.matchedKeywords.length})</h3>
                    <div className="ats-pills-list">
                      {atsScore.matchedKeywords.map((kw, i) => (
                        <span key={i} className="ats-pill matched">{kw}</span>
                      ))}
                    </div>
                  </div>
                )}

                {atsScore.missingKeywords && atsScore.missingKeywords.length > 0 && (
                  <div className="ats-detail-card">
                    <h3>Missing Skills ({atsScore.missingKeywords.length})</h3>
                    <div className="ats-pills-list">
                      {atsScore.missingKeywords.map((kw, i) => (
                        <span key={i} className="ats-pill missing">{kw}</span>
                      ))}
                    </div>
                  </div>
                )}

                {atsScore.skillsDetected && atsScore.skillsDetected.length > 0 && (
                  <div className="ats-detail-card">
                    <h3>Skills Detected ({atsScore.skillsDetected.length})</h3>
                    <div className="ats-pills-list">
                      {atsScore.skillsDetected.map((skill, i) => (
                        <span key={i} className="ats-pill detected">{skill}</span>
                      ))}
                    </div>
                  </div>
                )}

                {atsScore.strengths && atsScore.strengths.length > 0 && (
                  <div className="ats-detail-card">
                    <h3>Key Strengths</h3>
                    <ul className="ats-list-items strengths">
                      {atsScore.strengths.map((str, i) => (
                        <li key={i}>{str}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {atsScore.weaknesses && atsScore.weaknesses.length > 0 && (
                  <div className="ats-detail-card">
                    <h3>Key Weaknesses</h3>
                    <ul className="ats-list-items weaknesses">
                      {atsScore.weaknesses.map((weak, i) => (
                        <li key={i}>{weak}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {atsScore.recommendations && atsScore.recommendations.length > 0 && (
                  <div className="ats-detail-card">
                    <h3>Suggestions</h3>
                    <ul className="ats-list-items recommendations">
                      {atsScore.recommendations.map((rec, i) => (
                        <li key={i}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </section>
      ) : (
        <p className="empty-state">
          No resume text yet. You can still generate general interview
          questions without uploading a resume.
        </p>
      )}
    </main>
  );
};

export default ResumeUpload;
