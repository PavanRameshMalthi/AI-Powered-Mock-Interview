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

const uniqueStrings = (items) => [...new Set(items.filter(Boolean).map(String))];

const isClearlyWrongQuestion = (item) =>
  item.isEmpty ||
  item.isIrrelevant ||
  item.score < 40 ||
  (item.correctnessScore < 25 && item.relevanceScore < 25);

const isClearlyWrongEvaluation = (evaluation) =>
  evaluation.overall < 40;

const parseEvaluation = (responseText) => {
  try {
    const cleaned = responseText
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();
    const parsed = JSON.parse(cleaned);

    // Validate required fields
    if (!parsed || typeof parsed !== 'object') {
      logger.warn("Invalid Gemini response format: not an object");
      return null;
    }

    // Validate all required scoring fields exist and are numbers
    const requiredFields = ["technical", "communication", "problemSolving", "overall"];
    for (const field of requiredFields) {
      if (typeof parsed[field] !== 'number' || !Number.isFinite(parsed[field])) {
        logger.warn(`Invalid Gemini response: ${field} is not a valid number`);
        return null;
      }
    }

    // Parse questionScores if present
    const questionScores = Array.isArray(parsed.questionScores)
      ? parsed.questionScores.map((item) => ({
          score: clampScore(item.score),
          correctnessScore: clampScore(item.correctnessScore),
          relevanceScore: clampScore(item.relevanceScore),
          technicalAccuracyScore: clampScore(item.technicalAccuracyScore),
          communicationScore: clampScore(item.communicationScore),
          whatWasCorrect: Array.isArray(item.whatWasCorrect) ? item.whatWasCorrect.map(String) : [],
          whatWasIncorrect: Array.isArray(item.whatWasIncorrect) ? item.whatWasIncorrect.map(String) : [],
          feedback: String(item.feedback || "").trim(),
          improvementSuggestion: String(item.improvementSuggestion || item.howToImprove || "").trim(),
          whyItIsWrong: String(item.whyItIsWrong || "").trim(),
          correctAnswer: String(item.correctAnswer || "").trim(),
          howToImprove: String(item.howToImprove || item.improvementSuggestion || "").trim(),
          suggestedTopicsToLearn: Array.isArray(item.suggestedTopicsToLearn) ? item.suggestedTopicsToLearn.map(String) : [],
        }))
      : null;

    return {
      technical: clampScore(parsed.technical),
      communication: clampScore(parsed.communication),
      problemSolving: clampScore(parsed.problemSolving),
      overall: clampScore(parsed.overall),
      feedback: String(parsed.feedback || "").trim(),
      questionScores,
    };
  } catch (error) {
    logger.warn("Failed to parse Gemini evaluation response", { err: error });
    return null;
  }
};

const mergeEvaluations = (geminiEvaluation, localEvaluation) => {
  // If Gemini evaluation is invalid, use local evaluation
  if (!geminiEvaluation) {
    return localEvaluation;
  }

  // Safety check: if local evaluation clearly identifies a wrong answer (< 40),
  // don't let Gemini override with a high score
  const isClearlyWrong = isClearlyWrongEvaluation(localEvaluation);
  const weightGemini = isClearlyWrong ? 0 : 0.6;
  const weightLocal = 1 - weightGemini;

  // Merge overall scores
  const merged = {
    ...localEvaluation,
    technical: clampScore(geminiEvaluation.technical * weightGemini + localEvaluation.technical * weightLocal),
    communication: clampScore(geminiEvaluation.communication * weightGemini + localEvaluation.communication * weightLocal),
    problemSolving: clampScore(geminiEvaluation.problemSolving * weightGemini + localEvaluation.problemSolving * weightLocal),
    overall: clampScore(geminiEvaluation.overall * weightGemini + localEvaluation.overall * weightLocal),
    feedback: isClearlyWrong
      ? localEvaluation.feedback
      : geminiEvaluation.feedback || localEvaluation.feedback,
  };

  if (isClearlyWrong) {
    merged.technical = Math.min(merged.technical, localEvaluation.technical);
    merged.communication = Math.min(merged.communication, localEvaluation.communication);
    merged.problemSolving = Math.min(merged.problemSolving, localEvaluation.problemSolving);
    merged.overall = Math.min(merged.overall, localEvaluation.overall, 35);
  }

  // Merge questionScores if present and matching in length
  if (Array.isArray(geminiEvaluation.questionScores) && geminiEvaluation.questionScores.length === localEvaluation.questionScores.length) {
    merged.questionScores = localEvaluation.questionScores.map((localQ, idx) => {
      const geminiQ = geminiEvaluation.questionScores[idx];
      const qIsClearlyWrong = isClearlyWrongQuestion(localQ);
      const qWeightGemini = qIsClearlyWrong ? 0 : 0.6;
      const qWeightLocal = 1 - qWeightGemini;

      const mergedQuestion = {
        ...localQ,
        score: clampScore(geminiQ.score * qWeightGemini + localQ.score * qWeightLocal),
        correctnessScore: clampScore(geminiQ.correctnessScore * qWeightGemini + localQ.correctnessScore * qWeightLocal),
        relevanceScore: clampScore(geminiQ.relevanceScore * qWeightGemini + localQ.relevanceScore * qWeightLocal),
        technicalAccuracyScore: clampScore(geminiQ.technicalAccuracyScore * qWeightGemini + localQ.technicalAccuracyScore * qWeightLocal),
        communicationScore: clampScore(geminiQ.communicationScore * qWeightGemini + localQ.communicationScore * qWeightLocal),
        whatWasCorrect: uniqueStrings([...(geminiQ.whatWasCorrect || []), ...(localQ.whatWasCorrect || [])]),
        whatWasIncorrect: uniqueStrings([...(geminiQ.whatWasIncorrect || []), ...(localQ.whatWasIncorrect || [])]),
        feedback: geminiQ.feedback || localQ.feedback,
        improvementSuggestion: geminiQ.improvementSuggestion || localQ.improvementSuggestion,
        whyItIsWrong: geminiQ.whyItIsWrong || localQ.whyItIsWrong,
        correctAnswer: geminiQ.correctAnswer || localQ.correctAnswer,
        howToImprove: geminiQ.howToImprove || localQ.howToImprove,
        suggestedTopicsToLearn: uniqueStrings([...(geminiQ.suggestedTopicsToLearn || []), ...(localQ.suggestedTopicsToLearn || [])]),
      };

      const isWrongAnswer = geminiQ.score < 40 || localQ.score < 40 || qIsClearlyWrong;
      if (isWrongAnswer) {
        mergedQuestion.score = Math.min(mergedQuestion.score, geminiQ.score, localQ.score, 35);
        mergedQuestion.correctnessScore = Math.min(mergedQuestion.correctnessScore, localQ.correctnessScore);
        mergedQuestion.relevanceScore = Math.min(mergedQuestion.relevanceScore, localQ.relevanceScore);
        mergedQuestion.technicalAccuracyScore = Math.min(
          mergedQuestion.technicalAccuracyScore,
          localQ.technicalAccuracyScore
        );
        mergedQuestion.feedback = localQ.feedback || geminiQ.feedback;
        mergedQuestion.improvementSuggestion = localQ.improvementSuggestion || geminiQ.improvementSuggestion;

        if (localQ.isEmpty || !localQ.answer?.trim()) {
          mergedQuestion.score = 0;
          mergedQuestion.correctnessScore = 0;
          mergedQuestion.relevanceScore = 0;
          mergedQuestion.technicalAccuracyScore = 0;
          mergedQuestion.communicationScore = 0;
        }
      }

      return mergedQuestion;
    });
  }

  return merged;
};

const enrichEvaluation = (evaluation) => {
  const questionScores = evaluation.questionScores || [];
  const missing = questionScores.flatMap((item) => item.whatWasIncorrect || []);
  const weakQuestions = questionScores.filter((item) => item.score < 70);
  const weaknesses = uniqueStrings(missing).slice(0, 6);
  const studyTopics = weaknesses.length
    ? weaknesses
    : ["role fundamentals", "structured examples", "technical tradeoffs"];

  return {
    ...evaluation,
    confidence: clampScore(evaluation.communication),
    relevance: clampScore(evaluation.problemSolving),
    completeness: clampScore((evaluation.technical + evaluation.communication) / 2),
    studyTopics,
    questionScores: questionScores.map((item) => {
      const qStudyTopics = uniqueStrings([...(item.suggestedTopicsToLearn || []), ...(item.whatWasIncorrect || [])]).slice(0, 4);
      return {
        question: item.question,
        answer: item.answer,
        score: item.score,
        correctnessScore: item.correctnessScore,
        relevanceScore: item.relevanceScore,
        technicalAccuracyScore: item.technicalAccuracyScore,
        communicationScore: item.communicationScore,
        feedback: item.feedback,
        whatWasCorrect: item.whatWasCorrect || [],
        whatWasIncorrect: item.whatWasIncorrect || [],
        whyItIsWrong:
          item.score === 0 || !item.answer?.trim()
            ? "No answer was provided for this question."
            : item.score < 70
            ? item.whyItIsWrong || item.feedback
            : "No critical issue detected; the answer can still be improved with sharper detail.",
        correctAnswer: item.correctAnswer || "See role expected guidelines.",
        improvementSuggestion:
          item.score === 0 || !item.answer?.trim()
            ? "Answer the question next time. Cover the expected keywords and structure your response with examples."
            : item.improvementSuggestion || item.howToImprove || (
                item.score < 70
                  ? `Review ${studyTopics.slice(0, 3).join(", ")} and re-answer with a concrete example.`
                  : "Polish this answer with measurable impact and a clear tradeoff."
              ),
        studyTopics: qStudyTopics.length ? qStudyTopics : studyTopics.slice(0, 3),
        isEmpty: item.isEmpty || false,
        isIrrelevant: item.isIrrelevant || false,
      };
    }),
    improvementTracker: {
      mistakesMade: weakQuestions.map((item) => item.feedback).slice(0, 5),
    },
  };
};

const evaluateInterview = asyncHandler(async (req, res) => {
    const role = String(req.body.role || "").trim();
    const difficulty = String(req.body.difficulty || "Beginner").trim();
    const questions = Array.isArray(req.body.questions)
      ? req.body.questions.map((question) =>
          question && typeof question === "object" ? question : String(question || "")
        )
      : [];
    const answers = Array.isArray(req.body.answers)
      ? req.body.answers.map(String)
      : [];
    const resumeText = String(req.body.resumeText || "").trim();

    if (!role || !questions.length || !answers.length) {
      throw new AppError("Role, questions, and answers are required", 400);
    }

    const questionText = questions.map((question) =>
      question && typeof question === "object"
        ? String(question.question || "").trim()
        : String(question || "").trim()
    );

    const localEvaluation = evaluateAnswers({
      role,
      difficulty,
      questions,
      answers,
    });

    const prompt = `
Evaluate this mock interview objectively and strictly.

Role: ${role}
Difficulty: ${difficulty}

Evaluate each question and answer pair below. For each question, compare the candidate's answer with the expected answer and keywords.

Questions & Answers:
${JSON.stringify(
  localEvaluation.questionScores.map((q, i) => ({
    question: q.question,
    answer: q.answer,
    expectedAnswer: q.expectedAnswer,
    keywords: q.keywords,
  })),
  null,
  2
)}

Scoring bands:
- Wrong, empty, irrelevant, or nonsensical answers: 0-25 score. Examples of wrong answers include answers that do not address the question, recommend bad practices, or contain gibberish.
- Partially correct answers: 26-60 score.
- Mostly correct answers: 61-85 score.
- Correct, complete, role-specific answers: 86-100 score.

For each question, compute:
1. score: Overall score (0-100) based on the above bands. A wrong answer MUST receive a score <= 25. An empty/skipped answer MUST receive a score of 0.
2. correctnessScore: How correct the technical details are (0-100).
3. relevanceScore: How directly and relevantly the answer addresses the question (0-100).
4. technicalAccuracyScore: How technically accurate and correct the answer is (0-100).
5. communicationScore: How clear, structured, and professional the communication is (0-100).
6. whatWasCorrect: An array of key technical terms/concepts from the keywords/expected answer that the candidate correctly mentioned and explained (up to 5 items).
7. whatWasIncorrect: An array of key technical terms/concepts from the keywords/expected answer that the candidate missed or got wrong (up to 5 items).
8. correctAnswer: A concise (1-2 sentences) explanation of what the correct answer should be.
9. whyItIsWrong: A concise explanation of why the answer is wrong or incomplete, or "No critical issues detected" if it is correct.
10. howToImprove: Concrete advice on how the candidate can improve this answer.
11. suggestedTopicsToLearn: An array of up to 4 specific topics or keywords the user should study to improve.

Also compute the overall interview scores:
- overall: Weighted average of the individual question scores.
- technical: Overall technical score (0-100).
- communication: Overall communication score (0-100).
- problemSolving: Overall correctness/problem solving score (0-100).
- feedback: A high-level overall summary feedback of the entire interview (3-5 sentences).

Return ONLY a JSON object in this format:
{
  "overall": 85,
  "technical": 80,
  "communication": 82,
  "problemSolving": 88,
  "feedback": "...",
  "questionScores": [
    {
      "score": 85,
      "correctnessScore": 88,
      "relevanceScore": 90,
      "technicalAccuracyScore": 85,
      "communicationScore": 80,
      "whatWasCorrect": ["React hooks", "functional components"],
      "whatWasIncorrect": ["testing strategy"],
      "correctAnswer": "...",
      "whyItIsWrong": "...",
      "howToImprove": "...",
      "suggestedTopicsToLearn": ["..."]
    }
  ]
}
`;

    let evaluation = enrichEvaluation(localEvaluation);

    try {
      const result = await model.generateContent(prompt);
      const geminiEvaluation = parseEvaluation(result.response.text());
      const mergedEvaluation = mergeEvaluations(geminiEvaluation, localEvaluation);
      evaluation = enrichEvaluation(mergedEvaluation);
    } catch (error) {
      logger.warn("Gemini evaluation failed, using local evaluation only", { err: error });
      evaluation = enrichEvaluation(localEvaluation);
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
      questions: questionText,
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
