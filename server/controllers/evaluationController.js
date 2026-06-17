const model = require("../utils/gemini");
const Interview = require("../models/Interview");
const { scoreResumeForRole } = require("../utils/atsScorer");

const clampScore = (value) => {
  const score = Number(value);
  if (!Number.isFinite(score)) return 0;
  return Math.min(Math.max(Math.round(score), 0), 100);
};

const buildFallbackEvaluation = ({ answers }) => {
  const joinedAnswers = answers.join(" ");
  const wordCount = joinedAnswers.split(/\s+/).filter(Boolean).length;
  const exampleSignals = (joinedAnswers.match(
    /\b(example|because|result|impact|tradeoff|built|improved|measured|tested)\b/gi
  ) || []).length;
  const answeredRatio = answers.filter((answer) => answer.trim().length >= 12).length / answers.length;
  const base = clampScore(45 + answeredRatio * 25 + Math.min(wordCount / 8, 20) + Math.min(exampleSignals * 3, 10));

  return {
    technical: base,
    communication: clampScore(base + (wordCount > 80 ? 5 : -4)),
    problemSolving: clampScore(base + (exampleSignals > 2 ? 6 : -3)),
    overall: base,
    feedback:
      "Evaluation used the local scoring fallback. Strengthen answers with role-specific examples, measurable outcomes, and clear tradeoffs.",
  };
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

const evaluateInterview = async (req, res) => {
  try {
    const role = String(req.body.role || "").trim();
    const questions = Array.isArray(req.body.questions)
      ? req.body.questions.map(String)
      : [];
    const answers = Array.isArray(req.body.answers)
      ? req.body.answers.map(String)
      : [];
    const resumeText = String(req.body.resumeText || "").trim();

    if (!role || !questions.length || !answers.length) {
      return res.status(400).json({
        success: false,
        message: "Role, questions, and answers are required",
      });
    }

    const prompt = `
Evaluate this mock interview objectively.

Role: ${role}
Questions: ${JSON.stringify(questions)}
Answers: ${JSON.stringify(answers)}

Return only JSON in this shape:
{
 "technical": 85,
 "communication": 80,
 "problemSolving": 90,
 "overall": 85,
 "feedback": "Actionable feedback in 3-5 sentences"
}
`;

    let evaluation = buildFallbackEvaluation({ answers });

    try {
      const result = await model.generateContent(prompt);
      evaluation = parseEvaluation(result.response.text());
    } catch {
      evaluation = buildFallbackEvaluation({ answers });
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
      questions,
      answers,
      score: evaluation.overall,
      feedback: evaluation,
      atsScore,
      resumeText,
    });

    res.json({
      success: true,
      ...evaluation,
      atsScore,
    });
  } catch {
    res.status(500).json({
      success: false,
      message: "Failed to evaluate interview",
    });
  }
};

module.exports = {
  evaluateInterview,
};
