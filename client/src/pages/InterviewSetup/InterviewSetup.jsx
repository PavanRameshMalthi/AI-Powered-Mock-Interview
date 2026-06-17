import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  dismissToast,
  showError,
  showLoading,
  showSuccess,
} from "../../components/UI/Toast";
import interviewService from "../../services/interviewService";

const InterviewSetup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    role: "",
    experience: "Entry level",
    difficulty: "Beginner",
    questionCount: 5,
  });

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  const generateInterview = async (event) => {
    event.preventDefault();

    if (!formData.role.trim()) {
      showError("Enter the role you are interviewing for");
      return;
    }

    const toastId = showLoading("Generating questions...");

    try {
      const response = await interviewService.generateQuestions({
        ...formData,
        questionCount: Number(formData.questionCount),
        resumeText: localStorage.getItem("resumeText") || "",
      });

      localStorage.setItem("questions", JSON.stringify(response.questions));
      localStorage.setItem("answers", JSON.stringify([]));
      localStorage.setItem("interviewConfig", JSON.stringify(formData));
      if (response.atsScore) {
        localStorage.setItem("atsScore", JSON.stringify(response.atsScore));
      }
      dismissToast(toastId);
      showSuccess("Interview generated");
      navigate("/interview-session");
    } catch (error) {
      dismissToast(toastId);
      showError(error.response?.data?.message || "Failed to generate questions");
    }
  };

  return (
    <main className="app-shell narrow">
      <header className="page-header">
        <p className="eyebrow">Interview setup</p>
        <h1>Build a focused practice round</h1>
        <p className="muted">
          Choose a target role and difficulty. Resume context is included when
          available.
        </p>
      </header>

      <form className="panel form-grid" onSubmit={generateInterview}>
        <label>
          Target role
          <input
            name="role"
            onChange={handleChange}
            placeholder="Frontend Developer"
            required
            value={formData.role}
          />
        </label>

        <label>
          Experience level
          <input
            name="experience"
            onChange={handleChange}
            placeholder="2 years, internships, senior..."
            value={formData.experience}
          />
        </label>

        <div className="form-row">
          <label>
            Difficulty
            <select
              name="difficulty"
              onChange={handleChange}
              value={formData.difficulty}
            >
              <option>Beginner</option>
              <option>Intermediate</option>
              <option>Advanced</option>
            </select>
          </label>

          <label>
            Questions
            <input
              max="10"
              min="1"
              name="questionCount"
              onChange={handleChange}
              type="number"
              value={formData.questionCount}
            />
          </label>
        </div>

        <button className="btn btn-primary full-width">
          Generate interview
        </button>
      </form>
    </main>
  );
};

export default InterviewSetup;
