import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";

const Results = () => {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const evaluateInterview = useCallback(async () => {
    try {
      const questions = JSON.parse(localStorage.getItem("questions") || "[]");
      const answers = JSON.parse(localStorage.getItem("answers") || "[]");
      const config = JSON.parse(
        localStorage.getItem("interviewConfig") || "{}"
      );
      const resumeText = localStorage.getItem("resumeText") || "";
      const completeAnswers =
        questions.length > 0 &&
        answers.length === questions.length &&
        questions.every((_, index) => String(answers[index] || "").trim().length > 0);

      if (!config.role || !completeAnswers) {
        setError("Complete an interview before viewing results.");
        return;
      }

      const response = await api.post("/evaluation/evaluate", {
        role: config.role,
        difficulty: config.difficulty,
        questions,
        answers,
        resumeText,
      });

      setResult(response.data);
      localStorage.setItem("latestResult", JSON.stringify(response.data));
      if (response.data.atsScore) {
        localStorage.setItem("atsScore", JSON.stringify(response.data.atsScore));
      }
    } catch (err) {
      setError(err.response?.data?.message || "Unable to evaluate interview");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      evaluateInterview();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [evaluateInterview]);

  const downloadPDF = async () => {
    if (!result) return;

    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF();
    const user = JSON.parse(localStorage.getItem("user") || "null");
    const config = JSON.parse(localStorage.getItem("interviewConfig") || "{}");
    const lines = [
      "AI Mock Interview Report",
      `Candidate: ${user?.name || "Candidate"}`,
      `Date: ${new Date().toLocaleDateString()}`,
      `Interview Role: ${config.role || "N/A"}`,
      `Difficulty: ${config.difficulty || "N/A"}`,
      `Interview Score: ${result.overall}/100`,
      `Technical: ${result.technical}/100`,
      `Communication: ${result.communication}/100`,
      `Problem Solving: ${result.problemSolving}/100`,
      `Confidence: ${result.confidence || result.communication}/100`,
      `Relevance: ${result.relevance || result.problemSolving}/100`,
      `Completeness: ${result.completeness || result.technical}/100`,
    ];

    doc.setFontSize(18);
    doc.text(lines[0], 20, 20);
    doc.setFontSize(12);
    lines.slice(1).forEach((line, index) => doc.text(line, 20, 38 + index * 10));
    let y = 128;
    if (result.atsScore) {
      doc.text(`ATS Score: ${result.atsScore.score}/100 (${result.atsScore.level})`, 20, y);
      y += 12;
      doc.text(`Weak Areas: ${(result.atsScore.weaknesses || result.atsScore.missingKeywords || []).slice(0, 4).join(", ") || "N/A"}`, 20, y, { maxWidth: 170 });
      y += 18;
      doc.text(`Strong Areas: ${(result.atsScore.strengths || result.atsScore.matchedKeywords || []).slice(0, 4).join(", ") || "N/A"}`, 20, y, { maxWidth: 170 });
      y += 18;
    }
    doc.text("AI Feedback:", 20, y);
    y += 10;
    doc.text(result.feedback || "No feedback provided.", 20, y, { maxWidth: 170 });
    y += 34;
    doc.text("Suggestions:", 20, y);
    y += 10;
    doc.text(
      (result.suggestions || result.atsScore?.recommendations || [
        "Practice concise STAR stories with measurable outcomes.",
        "Add stronger role-specific project examples.",
      ]).join(" "),
      20,
      y,
      { maxWidth: 170 }
    );
    (result.questionScores || []).slice(0, 3).forEach((item, index) => {
      y += 24;
      doc.text(`Q${index + 1}: ${item.question}`, 20, y, { maxWidth: 170 });
      y += 10;
      doc.text(`Answer: ${item.answer || "No answer recorded."}`, 20, y, { maxWidth: 170 });
      y += 14;
      doc.text(`Expected: ${item.correctAnswer || "See feedback."}`, 20, y, { maxWidth: 170 });
    });
    doc.save("Interview_Report.pdf");
  };

  const downloadCertificate = async () => {
    if (!result) return;

    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF({ orientation: "landscape" });
    const user = JSON.parse(
      localStorage.getItem("user") || sessionStorage.getItem("user") || "null"
    );
    const config = JSON.parse(localStorage.getItem("interviewConfig") || "{}");
    const score = Number(result.overall || 0);
    const level = score >= 85 ? "Excellent" : score >= 70 ? "Strong" : "Completed";

    doc.setDrawColor(61, 214, 189);
    doc.setLineWidth(2);
    doc.rect(12, 12, 273, 186);
    doc.setFontSize(28);
    doc.text("Certificate of Mock Interview Completion", 148, 48, {
      align: "center",
    });
    doc.setFontSize(14);
    doc.text("This certifies that", 148, 72, { align: "center" });
    doc.setFontSize(24);
    doc.text(user?.name || "Candidate", 148, 92, { align: "center" });
    doc.setFontSize(14);
    doc.text(
      `completed a ${config.difficulty || "targeted"} ${config.role || "AI"} mock interview`,
      148,
      112,
      { align: "center" }
    );
    doc.setFontSize(18);
    doc.text(`${level} Performance - Score ${score}/100`, 148, 134, {
      align: "center",
    });
    doc.setFontSize(11);
    doc.text(`Issued on ${new Date().toLocaleDateString()}`, 148, 160, {
      align: "center",
    });
    doc.text(`Verification: AI-MOCK-${Date.now().toString(36).toUpperCase()}`, 148, 170, {
      align: "center",
    });
    doc.text("AI Mock Interview Platform", 148, 178, { align: "center" });
    doc.save("Interview_Certificate.pdf");
  };

  if (loading) {
    return (
      <main className="app-shell narrow">
        <section className="panel empty-panel">
          <div className="loader" aria-hidden="true" />
          <h1>Evaluating your interview</h1>
          <p className="muted">This usually takes a few seconds.</p>
        </section>
      </main>
    );
  }

  if (error) {
    return (
      <main className="app-shell narrow">
        <section className="panel empty-panel">
          <h1>Results unavailable</h1>
          <p className="muted">{error}</p>
          <Link className="btn btn-primary" to="/interview-setup">
            Start a new interview
          </Link>
        </section>
      </main>
    );
  }

  const scores = [
    ["Technical", result.technical],
    ["Communication", result.communication],
    ["Problem solving", result.problemSolving],
    ["Confidence", result.confidence || result.communication],
    ["Relevance", result.relevance || result.problemSolving],
    ["Completeness", result.completeness || result.technical],
  ];
  const atsScore = result.atsScore;
  const badges = [
    result.overall >= 85 ? "Interview ready" : null,
    result.technical >= 75 ? "Technical signal" : null,
    result.communication >= 75 ? "Clear communicator" : null,
    atsScore?.score >= 75 ? "Resume aligned" : null,
  ].filter(Boolean);

  return (
    <main className="app-shell">
      <header className="page-header">
        <p className="eyebrow">Scorecard</p>
        <h1>Interview results</h1>
        <p className="muted">
          Use this feedback to tune your examples before the next practice run.
        </p>
      </header>

      <section className="results-grid">
        <article className="result-score">
          <span>Overall</span>
          <strong>{result.overall}</strong>
          <small>/100</small>
          <div className="badge-list">
            {(badges.length ? badges : ["Practice mode"]).map((badge) => (
              <span key={badge}>{badge}</span>
            ))}
          </div>
        </article>

        <article className="panel">
          <h2>Skill breakdown</h2>
          <div className="score-list">
            {scores.map(([label, score]) => (
              <div className="score-row" key={label}>
                <span>{label}</span>
                <div className="meter">
                  <span style={{ width: `${score}%` }} />
                </div>
                <strong>{score}</strong>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="panel">
        <h2>Feedback</h2>
        <p className="feedback-text">{result.feedback}</p>
        <div className="career-grid">
          <div>
            <h3>Recommended skills</h3>
            <p>{result.studyTopics?.slice(0, 5).join(", ") || atsScore?.missingKeywords?.slice(0, 5).join(", ") || "Role-specific examples, communication, and tradeoff analysis."}</p>
          </div>
          <div>
            <h3>Suggested projects</h3>
            <p>Build one deployable project that demonstrates the target role, measurable impact, and testing discipline.</p>
          </div>
          <div>
            <h3>Career roadmap</h3>
            <p>{result.suggestions?.join(" ") || "Improve weak keywords, practice two more interviews, then update your resume with quantified outcomes."}</p>
          </div>
        </div>
        <div className="button-row">
          <button className="btn btn-primary" onClick={downloadPDF}>
            Download PDF
          </button>
          <button className="btn btn-secondary" onClick={downloadCertificate}>
            Download Certificate
          </button>
          <Link className="btn btn-secondary" to="/certificate">
            Certificate Preview
          </Link>
          <Link className="btn btn-secondary" to="/interview-setup">
            Practice again
          </Link>
        </div>
      </section>

      {result.questionScores?.length ? (
        <section className="panel">
          <h2>Question-level feedback</h2>
          <div className="qa-list">
            {result.questionScores.map((item, index) => (
              <article className="qa-card" key={`${item.question}-${index}`}>
                <div className="section-heading">
                  <h3>Question {index + 1}</h3>
                  <strong>{item.score}%</strong>
                </div>

                <div className="question-subscores">
                  <div className="subscore-badge">
                    <span>Correctness</span>
                    <strong>{item.correctnessScore ?? 0}%</strong>
                  </div>
                  <div className="subscore-badge">
                    <span>Relevance</span>
                    <strong>{item.relevanceScore ?? 0}%</strong>
                  </div>
                  <div className="subscore-badge">
                    <span>Technical Accuracy</span>
                    <strong>{item.technicalAccuracyScore ?? 0}%</strong>
                  </div>
                  <div className="subscore-badge">
                    <span>Communication</span>
                    <strong>{item.communicationScore ?? 0}%</strong>
                  </div>
                </div>

                <p className="question-text">{item.question}</p>
                <p className="muted"><strong>Your answer:</strong> {item.answer || "No answer recorded."}</p>
                <p className="muted"><strong>What was correct:</strong> {item.whatWasCorrect?.join(", ") || "No correct keywords identified."}</p>
                <p className="muted"><strong>What was incorrect:</strong> {item.whatWasIncorrect?.join(", ") || "No critical gaps identified."}</p>
                <p className="muted"><strong>Why it is wrong:</strong> {item.whyItIsWrong || item.feedback}</p>
                <p className="muted"><strong>Correct answer:</strong> {item.correctAnswer}</p>
                <p className="muted"><strong>Improvement Suggestions:</strong> {item.improvementSuggestion}</p>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {atsScore ? (
        <section className="panel ats-panel">
          <div className="section-heading">
            <div>
              <h2>ATS resume fit</h2>
              <p className="muted">How closely your resume matches this target role.</p>
            </div>
            <strong>{atsScore.score}%</strong>
          </div>
          <div className="score-row ats-row">
            <span>{atsScore.level}</span>
            <div className="meter">
              <span style={{ width: `${atsScore.score}%` }} />
            </div>
            <strong>{atsScore.score}</strong>
          </div>
          <div className="keyword-grid">
            <div>
              <h3>Matched keywords</h3>
              <p>{atsScore.matchedKeywords?.join(", ") || "No strong matches yet."}</p>
            </div>
            <div>
              <h3>Missing keywords</h3>
              <p>{atsScore.missingKeywords?.join(", ") || "No critical gaps detected."}</p>
            </div>
          </div>
          <ul className="recommendation-list">
            {(atsScore.recommendations || []).map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      ) : null}
    </main>
  );
};

export default Results;
