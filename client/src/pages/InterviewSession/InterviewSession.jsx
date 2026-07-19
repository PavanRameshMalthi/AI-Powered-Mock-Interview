import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Volume2, 
  Mic, 
  Pause, 
  Play, 
  ArrowLeft, 
  ArrowRight, 
  SkipForward,
  Bot, 
  Sparkles, 
  Check, 
  CircleDot 
} from "lucide-react";
import { showError } from "../../components/UI/Toast";

const InterviewSession = () => {
  const navigate = useNavigate();
  const questions = useMemo(
    () => JSON.parse(localStorage.getItem("questions") || "[]"),
    []
  );
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState(
    () => JSON.parse(localStorage.getItem("answers") || "[]")
  );
  const [answer, setAnswer] = useState(answers[0] || "");
  const [listening, setListening] = useState(false);
  const [paused, setPaused] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState("");
  const recognitionRef = useRef(null);
  const finalTranscriptRef = useRef(answer);

  const current = questions[currentQuestion];
  const hasAnswer = answer.trim().length > 0;
  const progress = questions.length
    ? Math.round(((currentQuestion + 1) / questions.length) * 100)
    : 0;

  const saveCurrentAnswer = () => {
    const updatedAnswers = [...answers];
    updatedAnswers[currentQuestion] = answer.trim();
    setAnswers(updatedAnswers);
    localStorage.setItem("answers", JSON.stringify(updatedAnswers));
    return updatedAnswers;
  };

  useEffect(() => {
    finalTranscriptRef.current = answer;
    const timeoutId = window.setTimeout(() => {
      const updatedAnswers = [...answers];
      updatedAnswers[currentQuestion] = answer.trim();
      localStorage.setItem("answers", JSON.stringify(updatedAnswers));
    }, 600);

    return () => window.clearTimeout(timeoutId);
  }, [answer, answers, currentQuestion]);

  useEffect(
    () => () => {
      recognitionRef.current?.stop?.();
    },
    []
  );

  const nextQuestion = () => {
    const updatedAnswers = saveCurrentAnswer();

    if (currentQuestion < questions.length - 1) {
      const nextIndex = currentQuestion + 1;
      setCurrentQuestion(nextIndex);
      setAnswer(updatedAnswers[nextIndex] || "");
      return;
    }

    navigate("/results");
  };

  const handleSkipQuestion = () => {
    setAnswer("");
    const updatedAnswers = [...answers];
    updatedAnswers[currentQuestion] = "";
    setAnswers(updatedAnswers);
    localStorage.setItem("answers", JSON.stringify(updatedAnswers));

    if (currentQuestion < questions.length - 1) {
      const nextIndex = currentQuestion + 1;
      setCurrentQuestion(nextIndex);
      setAnswer(updatedAnswers[nextIndex] || "");
      return;
    }

    navigate("/results");
  };

  const previousQuestion = () => {
    const updatedAnswers = saveCurrentAnswer();
    const previousIndex = currentQuestion - 1;
    setCurrentQuestion(previousIndex);
    setAnswer(updatedAnswers[previousIndex] || "");
  };

  const readQuestion = () => {
    if (!window.speechSynthesis || !current) {
      showError("Speech playback is not supported in this browser");
      return;
    }

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(new SpeechSynthesisUtterance(current));
  };

  const startVoiceAnswer = ({ append = false } = {}) => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      showError("Speech-to-text is not supported in this browser");
      return;
    }

    recognitionRef.current?.stop?.();

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = true;
    recognition.continuous = true;
    finalTranscriptRef.current = append ? answer : "";
    setLiveTranscript("");
    setPaused(false);
    setListening(true);
    recognitionRef.current = recognition;

    recognition.onresult = (event) => {
      let interimTranscript = "";
      let finalTranscript = finalTranscriptRef.current;

      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const transcript = event.results[index][0].transcript;
        if (event.results[index].isFinal) {
          finalTranscript = `${finalTranscript} ${transcript}`.trim();
        } else {
          interimTranscript = `${interimTranscript} ${transcript}`.trim();
        }
      }

      finalTranscriptRef.current = finalTranscript;
      setLiveTranscript(interimTranscript);
      setAnswer([finalTranscript, interimTranscript].filter(Boolean).join(" "));
    };
    recognition.onerror = () => {
      setListening(false);
      setPaused(false);
      showError("Unable to capture voice answer");
    };
    recognition.onend = () => {
      setListening(false);
      recognitionRef.current = null;
    };
    recognition.start();
  };

  const pauseVoiceAnswer = () => {
    recognitionRef.current?.stop?.();
    setPaused(true);
    setListening(false);
    setLiveTranscript("");
    saveCurrentAnswer();
  };

  const resumeVoiceAnswer = () => {
    startVoiceAnswer({ append: true });
  };

  if (!questions.length) {
    return (
      <main className="app-shell narrow" style={{ maxWidth: "600px", margin: "40px auto" }}>
        <section className="panel" style={{ textAlign: "center", padding: "40px 20px" }}>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "12px" }}>No interview questions found</h1>
          <p className="muted" style={{ marginBottom: "24px" }}>
            Generate an interview first so the session has questions to show.
          </p>
          <Link className="btn btn-primary" to="/interview-setup" style={{ borderRadius: "10px" }}>
            Go to setup
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="app-shell" style={{ width: "100%" }}>
      {/* ── Progress Header ── */}
      <header className="page-header" style={{ marginBottom: "28px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
          <div>
            <p className="eyebrow" style={{ textTransform: "uppercase", letterSpacing: "0.05em" }}>Session In Progress</p>
            <h1 style={{ fontSize: "1.6rem", fontWeight: 700, margin: 0 }}>Question {currentQuestion + 1} of {questions.length}</h1>
          </div>
          <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--primary)" }}>
            {progress}% Completed
          </span>
        </div>
        <div className="progress-track" style={{ height: "6px", background: "rgba(255,255,255,0.05)", borderRadius: "10px", overflow: "hidden" }}>
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4 }}
            style={{ height: "100%", background: "linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)", borderRadius: "10px" }}
          />
        </div>
      </header>

      {/* ── Split Layout Workspace ── */}
      <div 
        className="interview-workspace-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1.6fr",
          gap: "28px",
          alignItems: "start"
        }}
      >
        {/* Left Column: AI Avatar */}
        <section 
          className="panel" 
          style={{ 
            display: "flex", 
            flexDirection: "column", 
            alignItems: "center", 
            padding: "32px 20px", 
            textAlign: "center", 
            position: "sticky", 
            top: "90px" 
          }}
        >
          {/* Glowing Avatar */}
          <div 
            style={{ 
              width: "120px", 
              height: "120px", 
              borderRadius: "50%", 
              background: "linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
              boxShadow: "0 0 30px rgba(99,102,241,0.4)",
              marginBottom: "24px"
            }}
          >
            <Bot size={48} color="#fff" />
            
            {/* Pulsating Ring (active when listening) */}
            {listening && (
              <motion.div
                animate={{ scale: [1, 1.25, 1], opacity: [0.6, 0, 0.6] }}
                transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  borderRadius: "50%",
                  border: "2px solid #8B5CF6",
                }}
              />
            )}
          </div>

          <h2 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "4px" }}>AI Career Coach</h2>
          <div 
            style={{ 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center", 
              gap: "6px",
              fontSize: "0.78rem",
              fontWeight: 700,
              padding: "4px 10px",
              borderRadius: "20px",
              background: listening ? "rgba(34,197,94,0.1)" : "rgba(255,255,255,0.03)",
              color: listening ? "#22C55E" : "var(--muted)",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              marginBottom: "20px"
            }}
          >
            <CircleDot size={12} className={listening ? "pulse-animation" : ""} />
            {listening ? "Interviewer Listening" : "AI Idle"}
          </div>

          {/* Voice Wave Animation */}
          <div style={{ height: "40px", display: "flex", alignItems: "center", gap: "4px", marginBottom: "20px" }}>
            {listening ? (
              Array.from({ length: 9 }).map((_, i) => (
                <motion.span
                  key={i}
                  animate={{ height: [10, Math.floor(Math.random() * 25) + 12, 10] }}
                  transition={{ repeat: Infinity, duration: 0.6 + i * 0.05, ease: "easeInOut" }}
                  style={{
                    width: "3px",
                    background: "var(--primary)",
                    borderRadius: "4px",
                  }}
                />
              ))
            ) : (
              Array.from({ length: 9 }).map((_, i) => (
                <span
                  key={i}
                  style={{
                    width: "3px",
                    height: "10px",
                    background: "var(--border)",
                    borderRadius: "4px",
                  }}
                />
              ))
            )}
          </div>

          <p style={{ fontSize: "0.8rem", color: "var(--muted)", lineHeight: 1.5, margin: 0 }}>
            {listening 
              ? "Speak clearly into your microphone. You can edit your response in the editor at any time."
              : "Review the question on the right, play it aloud, or click the mic button to answer."}
          </p>
        </section>

        {/* Right Column: Question & Editor */}
        <div style={{ display: "grid", gap: "24px" }}>
          
          {/* Question panel */}
          <section className="panel" style={{ padding: "28px" }}>
            <h3 style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--primary)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "12px" }}>
              Question Scenario
            </h3>
            <p className="question-text" style={{ fontSize: "1.1rem", fontWeight: 600, lineHeight: 1.5, margin: "0 0 20px 0", color: "var(--text)" }}>
              {current}
            </p>

            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              <button 
                className="btn btn-secondary compact" 
                onClick={readQuestion} 
                style={{ display: "flex", alignItems: "center", gap: "8px", borderRadius: "8px" }}
              >
                <Volume2 size={16} /> Read Scenario Aloud
              </button>

              {listening ? (
                <button 
                  className="btn btn-secondary compact" 
                  onClick={pauseVoiceAnswer}
                  style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--warning)", borderColor: "rgba(245,158,11,0.2)", borderRadius: "8px" }}
                >
                  <Pause size={16} /> Pause Recording
                </button>
              ) : (
                <button
                  className="btn btn-primary compact"
                  onClick={paused ? resumeVoiceAnswer : () => startVoiceAnswer()}
                  style={{ 
                    display: "flex", 
                    alignItems: "center", 
                    gap: "8px", 
                    background: "linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)", 
                    color: "#fff", 
                    border: "none",
                    borderRadius: "8px"
                  }}
                >
                  <Mic size={16} /> {paused ? "Resume Mic" : "Answer with Mic"}
                </button>
              )}
            </div>
          </section>

          {/* Transcript overlay */}
          {liveTranscript && (
            <div 
              className="panel" 
              style={{ 
                padding: "16px 20px", 
                background: "rgba(99,102,241,0.03)", 
                borderLeft: "4px solid var(--primary)", 
                borderRadius: "8px" 
              }}
            >
              <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--primary)", textTransform: "uppercase", display: "block", marginBottom: "4px" }}>
                Live Captions
              </span>
              <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--text)", fontStyle: "italic" }}>
                "{liveTranscript}"
              </p>
            </div>
          )}

          {/* Answer Pane */}
          <section className="panel" style={{ padding: "28px", display: "grid", gap: "18px" }}>
            <label style={{ display: "grid", gap: "8px", fontWeight: 700, fontSize: "0.9rem" }}>
              Your answer
              <textarea
                aria-describedby={!hasAnswer ? "answer-required-message" : undefined}
                aria-invalid={!hasAnswer}
                onChange={(event) => setAnswer(event.target.value)}
                placeholder="Type or dictate your answer here. Provide background, metrics, and technical considerations..."
                rows="8"
                value={answer}
                style={{
                  fontFamily: "inherit",
                  fontSize: "0.92rem",
                  lineHeight: 1.5,
                  padding: "14px",
                  borderRadius: "12px",
                  resize: "vertical"
                }}
              />
            </label>

            {/* Bottom Actions */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "10px" }}>
              <button
                className="btn btn-secondary compact"
                disabled={currentQuestion === 0}
                onClick={previousQuestion}
                style={{ display: "flex", alignItems: "center", gap: "8px", borderRadius: "8px" }}
              >
                <ArrowLeft size={16} /> Back
              </button>

              <div style={{ display: "flex", gap: "10px" }}>
                {!hasAnswer && (
                  <button
                    className="btn btn-secondary compact"
                    onClick={handleSkipQuestion}
                    style={{ display: "flex", alignItems: "center", gap: "8px", borderRadius: "8px" }}
                  >
                    <SkipForward size={16} /> Skip question
                  </button>
                )}
                <button 
                  className="btn btn-primary compact" 
                  onClick={nextQuestion}
                  style={{
                    background: "linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)",
                    color: "#fff",
                    border: "none",
                    borderRadius: "8px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px"
                  }}
                >
                  {currentQuestion === questions.length - 1 ? (
                    <>Finish interview <Check size={16} /></>
                  ) : (
                    <>Next question <ArrowRight size={16} /></>
                  )}
                </button>
              </div>
            </div>
          </section>

        </div>
      </div>
    </main>
  );
};

export default InterviewSession;
