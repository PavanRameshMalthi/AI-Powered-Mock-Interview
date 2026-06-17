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
  const [file, setFile] = useState(null);
  const [resumeText, setResumeText] = useState(
    localStorage.getItem("resumeText") || ""
  );
  const [atsScore, setAtsScore] = useState(() => {
    const stored = localStorage.getItem("atsScore");
    return stored ? JSON.parse(stored) : null;
  });

  const handleFileChange = (event) => {
    const selected = event.target.files?.[0] || null;

    if (selected && selected.type !== "application/pdf") {
      showError("Please select a PDF file");
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
      showError("Choose a PDF resume first");
      return;
    }

    const toastId = showLoading("Reading resume...");

    try {
      const formData = new FormData();
      formData.append("resume", file);

      const response = await resumeService.uploadResume(formData);
      localStorage.setItem("resumeText", response.resumeText);
      localStorage.setItem("atsScore", JSON.stringify(response.atsScore));
      setResumeText(response.resumeText);
      setAtsScore(response.atsScore);
      dismissToast(toastId);
      showSuccess("Resume uploaded");
    } catch (error) {
      dismissToast(toastId);
      showError(error.response?.data?.message || "Upload failed");
    }
  };

  return (
    <main className="app-shell narrow">
      <header className="page-header">
        <p className="eyebrow">Resume context</p>
        <h1>Upload resume</h1>
        <p className="muted">
          PDF only, up to 5 MB. The extracted text stays in this browser for
          the next interview setup.
        </p>
      </header>

      <section className="panel">
        <label className="file-drop">
          <input accept=".pdf,application/pdf" onChange={handleFileChange} type="file" />
          <span>{file ? file.name : "Choose a PDF resume"}</span>
        </label>
        <div className="button-row">
          <button className="btn btn-primary" onClick={handleUpload}>
            Upload resume
          </button>
          <Link className="btn btn-secondary" to="/interview-setup">
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
          {atsScore ? (
            <div className="ats-summary">
              <strong>{atsScore.score}% ATS readiness</strong>
              <span>{atsScore.level}</span>
            </div>
          ) : null}
          <p className="resume-preview">{resumeText.slice(0, 900)}</p>
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
