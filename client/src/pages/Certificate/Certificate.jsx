import { useState } from "react";
import { Link } from "react-router-dom";

const Certificate = () => {
  const user = JSON.parse(
    localStorage.getItem("user") || sessionStorage.getItem("user") || "null"
  );
  const config = JSON.parse(localStorage.getItem("interviewConfig") || "{}");
  const result = JSON.parse(localStorage.getItem("latestResult") || "null");
  const score = result?.overall || 0;
  const [issuedDate] = useState(() => new Date().toLocaleDateString());
  const [verification] = useState(
    () =>
      `AI-MOCK-${String(user?.email || "candidate")
        .replace(/[^a-z0-9]/gi, "")
        .slice(0, 8)
        .toUpperCase()}-${Date.now().toString(36).toUpperCase()}`
  );

  const printCertificate = () => window.print();

  return (
    <main className="app-shell">
      <header className="page-header">
        <p className="eyebrow">Certificate</p>
        <h1>Certificate of Completion</h1>
        <p className="muted">Preview, print, or export proof of your mock interview completion.</p>
      </header>

      <section className="certificate-shell">
        <div className="certificate-preview">
          <p className="eyebrow">AI Career Platform</p>
          <h2>Certificate of Completion</h2>
          <p>This certifies that</p>
          <strong>{user?.name || "Candidate"}</strong>
          <p>
            completed a {config.difficulty || "targeted"} interview for{" "}
            <b>{config.role || "a selected role"}</b>
          </p>
          <span>Score {score}/100</span>
          <small>Issued {issuedDate} - Verification {verification}</small>
        </div>
        <div className="panel certificate-actions">
          <h2>Certificate actions</h2>
          <button className="btn btn-primary" onClick={printCertificate} type="button">Print</button>
          <Link className="btn btn-secondary" to="/results">Download from results</Link>
          <button
            className="btn btn-secondary"
            onClick={() => navigator.clipboard?.writeText(verification)}
            type="button"
          >
            Copy verification
          </button>
        </div>
      </section>
    </main>
  );
};

export default Certificate;
