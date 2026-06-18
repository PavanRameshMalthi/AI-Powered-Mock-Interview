const model = require("../utils/gemini");
const mongoose = require("mongoose");
const Interview = require("../models/Interview");
const AtsReport = require("../models/AtsReport");
const { scoreResumeForRole } = require("../utils/atsScorer");
const { evaluateAnswers } = require("../utils/evaluationEngine");
const { asyncHandler, AppError } = require("../middleware/errorMiddleware");
const logger = require("../utils/logger");

const clampScore = (value) => {
  const score = Number(value);
  if (!Number.isFinite(score)) return 0;
  return Math.min(Math.max(Math.round(score), 0), 100);
};

const parseEvaluation = (responseText) => {
  const cleaned = responseText
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();
  const parsed = JSON.parse(cleaned);

  return {
    technical: clampScore(parsed.technical),
    communication: clampScore(parsed.communication),
    problemSolving: clampScore(parsed.problemSolving),
    overall: clampScore(parsed.overall),
    feedback: String(parsed.feedback || "").trim(),
  };
};

const getBandCeiling = (score) => {
  if (score <= 25) return 25;
  if (score <= 60) return 60;
  if (score <= 85) return 85;
  return 100;
};

const reconcileEvaluation = (aiEvaluation, localEvaluation) => {
  const ceiling = getBandCeiling(localEvaluation.overall);
  const cap = (value) => clampScore(Math.min(value, ceiling));

  return {
    technical: cap(aiEvaluation.technical),
    communication: cap(aiEvaluation.communication),
    problemSolving: cap(aiEvaluation.problemSolving),
    overall: cap(aiEvaluation.overall),
    feedback: aiEvaluation.feedback || localEvaluation.feedback,
    questionScores: localEvaluation.questionScores,
  };
};

const evaluateInterview = asyncHandler(async (req, res) => {
    const role = String(req.body.role || "").trim();
    const difficulty = String(req.body.difficulty || "Beginner").trim();
    const questions = Array.isArray(req.body.questions)
      ? req.body.questions.map(String)
      : [];
    const answers = Array.isArray(req.body.answers)
      ? req.body.answers.map(String)
      : [];
    const resumeText = String(req.body.resumeText || "").trim();

    if (!role || !questions.length || !answers.length) {
      throw new AppError("Role, questions, and answers are required", 400);
    }

    const localEvaluation = evaluateAnswers({
      role,
      difficulty,
      questions,
      answers,
    });

    const prompt = `
Evaluate this mock interview objectively and strictly.

Role: ${role}
Questions: ${JSON.stringify(questions)}
Answers: ${JSON.stringify(answers)}

Scoring bands:
- Wrong, empty, irrelevant, hallucinated, or nonsensical answers: 0-25
- Partially correct answers: 26-60
- Mostly correct answers: 61-85
- Correct, complete, role-specific answers: 86-100

Do not award high scores for incorrect or irrelevant answers. Penalize answers that do not directly answer the question even if they are long.

Return only JSON in this shape:
{
 "technical": 85,
 "communication": 80,
 "problemSolving": 90,
 "overall": 85,
 "feedback": "Actionable feedback in 3-5 sentences"
}
`;

    let evaluation = localEvaluation;

    try {
      const result = await model.generateContent(prompt);
      evaluation = reconcileEvaluation(
        parseEvaluation(result.response.text()),
        localEvaluation
      );
    } catch {
      evaluation = localEvaluation;
    }

    const atsScore = resumeText
      ? scoreResumeForRole({ resumeText, role })
      : null;

    if (atsScore) {
      evaluation.overall = clampScore(evaluation.overall * 0.85 + atsScore.score * 0.15);
    }

    await Interview.create({
      user: req.user.id,
      role,
      difficulty,
      questions,
      answers,
      score: evaluation.overall,
      feedback: evaluation,
      atsScore,
      resumeText,
    });

    if (atsScore && mongoose.Types.ObjectId.isValid(req.user.id)) {
      AtsReport.create({
        user: req.user.id,
        role,
        resumeTextLength: resumeText.length,
        ...atsScore,
      }).catch((error) => logger.warn({ err: error }, "ATS report persistence failed"));
    }

    res.json({
      success: true,
      ...evaluation,
      atsScore,
    });
});

module.exports = {
  evaluateInterview,
};
