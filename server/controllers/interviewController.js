const model = require("../utils/gemini");
const { scoreResumeForRole } = require("../utils/atsScorer");
const { asyncHandler, AppError } = require("../middleware/errorMiddleware");
const Resume = require("../models/Resume");

const createFallbackQuestions = ({
  role,
  experience,
  difficulty,
  questionCount,
  resumeText,
}) => {
  const resumeQuestion = resumeText
    ? `Walk me through one project from your resume that best matches a ${role} role.`
    : `Describe a project that demonstrates your readiness for a ${role} role.`;

  const pool = [
    `Tell me about your background and why you are interested in this ${role} position.`,
    `What are the most important technical skills for a ${role}, and how have you used them?`,
    `Explain a challenging bug or technical problem you solved recently.`,
    `How would you approach learning a new tool or framework required for this role?`,
    `Describe a time you received feedback and improved your work.`,
    `How do you prioritize tasks when deadlines are tight?`,
    resumeQuestion,
    `For a ${difficulty} ${role} interview, explain one concept you expect to be tested on.`,
    `How would you communicate a technical tradeoff to a non-technical stakeholder?`,
    `What would you improve in one of your past projects if you had more time?`,
  ];

  if (experience && experience !== "Entry level") {
    pool.splice(
      2,
      0,
      `Based on your ${experience} experience, what impact are you most proud of?`
    );
  }

  return pool.slice(0, questionCount);
};

const parseQuestions = (responseText) => {
  const cleaned = responseText
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

  try {
    const parsed = JSON.parse(cleaned);
    if (Array.isArray(parsed)) {
      return parsed
        .map((item) => (typeof item === "string" ? item : item.question))
        .filter(Boolean);
    }
  } catch {
    // Fall back to line parsing below.
  }

  return cleaned
    .split(/\r?\n/)
    .map((line) => line.replace(/^[-*\d.)\s]+/, "").trim())
    .filter(Boolean);
};

const generateQuestions = asyncHandler(async (req, res) => {
    const role = String(req.body.role || req.body.jobRole || "").trim();
    const experience = String(req.body.experience || "Entry level").trim();
    const difficulty = String(req.body.difficulty || "Beginner").trim();
    let resumeText = String(req.body.resumeText || "").slice(0, 12000);
    const questionCount = Math.min(
      Math.max(Number(req.body.questionCount) || 5, 1),
      10
    );

    if (!role) {
      throw new AppError("Job role is required", 400);
    }

    // 1. If resumeText is not provided in body, load the user's active resume from MongoDB
    let activeResume = null;
    if (!resumeText && req.user?.id) {
      activeResume = await Resume.findOne({ user: req.user.id, isActive: true, deletedAt: null });
      if (activeResume) {
        resumeText = (activeResume.extractedText || "").slice(0, 12000);
      }
    }

    // 2. Adapt the questions based on skills detected in the resume text or active resume record
    let skillAdaptationInstructions = "";
    if (resumeText || activeResume) {
      const lowerText = resumeText.toLowerCase();

      // Extract skills list from database record if available
      let skillsList = [];
      if (activeResume && activeResume.atsScore && activeResume.atsScore.skillsDetected) {
        skillsList = activeResume.atsScore.skillsDetected.map((s) => s.toLowerCase());
      }

      const detected = [];

      // Check for MERN Stack skills
      const hasReact = skillsList.some((s) => s.includes("react")) || lowerText.includes("react");
      const hasNode = skillsList.some((s) => s.includes("node")) || lowerText.includes("node");
      const hasMongo = skillsList.some((s) => s.includes("mongodb") || s.includes("mongo")) || lowerText.includes("mongodb") || lowerText.includes("mongo");
      const hasExpress = skillsList.some((s) => s.includes("express")) || lowerText.includes("express");

      if (hasReact || hasNode || hasMongo || hasExpress) {
        detected.push("React and MERN stack (MongoDB, Express, React, Node.js)");
      }

      // Check for Python skills
      const hasPython = skillsList.some((s) => s.includes("python")) || lowerText.includes("python");
      if (hasPython) {
        detected.push("Python");
      }

      // Check for Java skills
      const hasJava = skillsList.some((s) => s.includes("java") && !s.includes("javascript") && !s.includes("js")) ||
                      (lowerText.includes("java") && !lowerText.includes("javascript") && !lowerText.includes("js"));
      if (hasJava) {
        detected.push("Java");
      }

      // Check for general JavaScript skills
      const hasJS = skillsList.some((s) => s.includes("javascript") || s.includes("js")) || lowerText.includes("javascript") || lowerText.includes("js");
      if (hasJS && !detected.includes("React and MERN stack (MongoDB, Express, React, Node.js)")) {
        detected.push("JavaScript");
      }

      if (detected.length > 0) {
        skillAdaptationInstructions = `
CRITICAL ADAPTATION: The candidate's resume highlights experience with: ${detected.join(", ")}.
You MUST tailor technical questions specifically to these skills. For example:
- If React/MERN is detected, ask questions on React components, state management, hooks, Node.js event loop, MongoDB indexing, or Express middleware.
- If Python is detected, ask questions on Python-specific features (decorators, generators, GIL, or frameworks like Django/FastAPI).
- If Java is detected, ask questions on Java OOP concepts, JVM memory structure, multithreading, or Spring Boot.
Align the difficulty of these technical questions with the candidate's experience level (${experience}) and difficulty setting (${difficulty}).`;
      }
    }

    const prompt = `
You are an expert technical interviewer.

Create ${questionCount} concise mock interview questions for this candidate.

Role: ${role}
Experience: ${experience}
Difficulty: ${difficulty}
Resume context:
${resumeText || "No resume context provided"}
${skillAdaptationInstructions}

Return only a JSON array of strings. Include technical, behavioral, project, and resume-based questions where relevant.
`;

    let questions = [];

    try {
      const result = await model.generateContent(prompt);
      questions = parseQuestions(result.response.text()).slice(
        0,
        questionCount
      );
    } catch {
      questions = createFallbackQuestions({
        role,
        experience,
        difficulty,
        questionCount,
        resumeText,
      });
    }

    if (!questions.length) {
      questions = createFallbackQuestions({
        role,
        experience,
        difficulty,
        questionCount,
        resumeText,
      });
    }

    res.json({
      success: true,
      questions,
      atsScore: resumeText
        ? scoreResumeForRole({ resumeText, role })
        : null,
    });
});

module.exports = {
  generateQuestions,
};
