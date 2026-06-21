import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
      <main className="app-shell narrow">
        <section className="panel empty-panel">
          <h1>No interview questions found</h1>
          <p className="muted">
            Generate an interview first so the session has questions to show.
          </p>
          <Link className="btn btn-primary" to="/interview-setup">
            Go to setup
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="app-shell narrow">
      <header className="page-header">
        <p className="eyebrow">Interview session</p>
        <h1>Question {currentQuestion + 1}</h1>
        <div className="progress-track" aria-label={`${progress}% complete`}>
          <span style={{ width: `${progress}%` }} />
        </div>
      </header>

      <section className="panel">
        <p className="question-text">{current}</p>
        <div className="button-row">
          <button className="btn btn-secondary" onClick={readQuestion} type="button">
            Read question aloud
          </button>
          {listening ? (
            <button className="btn btn-secondary" onClick={pauseVoiceAnswer} type="button">
              Pause recording
            </button>
          ) : (
            <button
              className="btn btn-secondary"
              onClick={paused ? resumeVoiceAnswer : () => startVoiceAnswer()}
              type="button"
            >
              {paused ? "Resume recording" : "Answer with microphone"}
            </button>
          )}
        </div>
        {listening || liveTranscript ? (
          <div className="transcript-panel" role="status">
            <span>{listening ? "Live transcript" : "Transcript paused"}</span>
            <p>{liveTranscript || answer || "Listening for your answer..."}</p>
          </div>
        ) : null}
        <label>
          Your answer
          <textarea
            aria-describedby={!hasAnswer ? "answer-required-message" : undefined}
            aria-invalid={!hasAnswer}
            onChange={(event) => setAnswer(event.target.value)}
            placeholder="Answer with examples, tradeoffs, and outcomes..."
            rows="9"
            value={answer}
          />
        </label>
        <div className="button-row split">
          <button
            className="btn btn-secondary"
            disabled={currentQuestion === 0}
            onClick={previousQuestion}
            type="button"
          >
            Previous
          </button>
          {!hasAnswer ? (
            <button
              className="btn btn-secondary"
              onClick={handleSkipQuestion}
              type="button"
            >
              Skip question
            </button>
          ) : null}
          <button className="btn btn-primary" onClick={nextQuestion} type="button">
            {currentQuestion === questions.length - 1
              ? "Finish interview"
              : "Next question"}
          </button>
        </div>
      </section>
    </main>
  );
};

export default InterviewSession;
