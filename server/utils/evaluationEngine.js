const { clampScore, normalizeText, tokenize, unique } = require("./textAnalysis");

const LOW_QUALITY_PATTERNS = [
  /\b(as an ai|lorem ipsum|i don't know|idk|no idea|asdf|qwerty)\b/i,
  /(.)\1{7,}/,
];

const HARMFUL_PATTERNS = [
  /don't worry|not important|doesn't matter|skip|ignore|avoid|never use/i,
  /shouldn't|shouldn't be|bad practice|wrong way/i,
];

const CORRECTNESS_INDICATORS = {
  strong: ["correct", "accurate", "properly", "well-designed", "best practice", "standard", "industry"],
  weak: ["wrong", "incorrect", "bad practice", "avoid", "never", "don't", "not recommended"],
};

const COMMUNICATION_INDICATORS = {
  excellent: ["first", "second", "third", "for example", "specifically", "in summary", "therefore", "because"],
  good: ["example", "result", "impact", "benefit", "advantage"],
  poor: ["vague", "unclear", "confusing"],
};

const QUESTION_BANK = {
  frontend: {
    expectedAnswer:
      "A strong answer should explain UI architecture, React or JavaScript fundamentals, accessibility, state management, responsive design, testing, and performance tradeoffs with examples.",
    keywords: ["react", "javascript", "accessibility", "state", "component", "performance", "testing", "responsive"],
    category: "Frontend",
  },
  backend: {
    expectedAnswer:
      "A strong answer should explain APIs, data models, authentication, validation, database design, error handling, security, scalability, and testing with implementation tradeoffs.",
    keywords: ["api", "database", "authentication", "validation", "security", "scalability", "testing", "error"],
    category: "Backend",
  },
  data: {
    expectedAnswer:
      "A strong answer should cover data cleaning, SQL or Python analysis, metrics, model or dashboard choices, validation, and business impact.",
    keywords: ["python", "sql", "metrics", "analysis", "model", "dashboard", "validation", "statistics"],
    category: "Data",
  },
  default: {
    expectedAnswer:
      "A strong answer should directly address the question, use relevant technical vocabulary, explain tradeoffs, and include a concrete example or result.",
    keywords: ["example", "tradeoff", "result", "implemented", "tested", "improved"],
    category: "General",
  },
};

const inferRoleProfile = (role = "") => {
  const normalized = normalizeText(role);
  if (normalized.includes("front")) return QUESTION_BANK.frontend;
  if (normalized.includes("back")) return QUESTION_BANK.backend;
  if (normalized.includes("data") || normalized.includes("ml")) return QUESTION_BANK.data;
  return QUESTION_BANK.default;
};

const inferQuestionMetadata = (questionInput, role, difficulty = "Intermediate") => {
  if (questionInput && typeof questionInput === "object") {
    return {
      question: String(questionInput.question || "").trim(),
      expectedAnswer: String(questionInput.expectedAnswer || "").trim(),
      keywords: Array.isArray(questionInput.keywords)
        ? questionInput.keywords.map((item) => String(item).toLowerCase())
        : [],
      difficulty: String(questionInput.difficulty || difficulty).trim(),
      category: String(questionInput.category || "General").trim(),
    };
  }

  const question = String(questionInput || "").trim();
  const profile = inferRoleProfile(role);
  const questionTokens = tokenize(question, 4).slice(0, 8);
  const keywords = unique([...profile.keywords, ...questionTokens]).slice(0, 10);

  return {
    question,
    expectedAnswer: profile.expectedAnswer,
    keywords,
    difficulty,
    category: profile.category,
  };
};

const getAnswerQualityFlag = (answer) => {
  const normalized = normalizeText(answer);
  const words = tokenize(answer);

  if (!normalized) return "empty";
  if (normalized.length < 8 || words.length < 2) return "empty";
  if (LOW_QUALITY_PATTERNS.some((pattern) => pattern.test(answer))) return "random";
  if (HARMFUL_PATTERNS.some((pattern) => pattern.test(answer))) return "harmful";

  const uniqueWords = new Set(words);
  if (words.length >= 8 && uniqueWords.size / words.length < 0.35) return "random";
  if (normalized.length > 40 && !/[aeiou]/i.test(normalized)) return "random";

  return "valid";
};

const buildQuestionFeedback = (score, matchedKeywords, missingKeywords, qualityFlag, correctness, relevance, technicalAccuracy) => {
  if (qualityFlag === "empty") return "No usable answer was provided, so this question receives minimal credit.";
  if (qualityFlag === "random") return "The answer appears unrelated or low quality. Restate the concept and support it with a concrete example.";
  if (score < 40) return `The answer does not address the expected concept strongly enough. Add: ${missingKeywords.join(", ") || "role-specific details"}.`;
  if (score < 70) return `Partial answer. Good signals: ${matchedKeywords.join(", ") || "some relevance"}. Add more depth around ${missingKeywords.join(", ") || "tradeoffs and examples"}.`;
  if (score < 90) return "Mostly correct. Make it stronger with sharper examples, measurable impact, and explicit tradeoffs.";
  return "Excellent answer with strong relevance, completeness, and keyword coverage.";
};

const calculateCorrectness = (normalizedAnswer, keywords, matchedKeywords) => {
  if (matchedKeywords.length === 0) return 0;
  return Math.round((matchedKeywords.length / keywords.length) * 100);
};

const calculateRelevance = (answer, questionTokens, answerTokens, normalizedAnswer) => {
  if (questionTokens.length === 0 || answerTokens.size === 0) return 0;
  const matchesAnswerToken = (token) =>
    answerTokens.has(token) ||
    (token.endsWith("s") && answerTokens.has(token.slice(0, -1))) ||
    answerTokens.has(`${token}s`);
  const relevanceHits = questionTokens.filter(matchesAnswerToken).length;
  const relevanceScore = (relevanceHits / Math.max(questionTokens.length, 1)) * 100;
  const topicAligned = /\b(explain|describe|discuss|detail|implement|design|build|architecture|approach)\b/i.test(answer) ? 10 : 0;
  return Math.min(relevanceScore + topicAligned, 100);
};

const calculateTechnicalAccuracy = (normalizedAnswer, expectedTokens, answerTokens, keywords, matchedKeywords) => {
  if (expectedTokens.size === 0) return 50;
  const overlap = [...expectedTokens].filter((token) => answerTokens.has(token)).length;
  const accuracyHits = overlap / Math.max(expectedTokens.size * 0.3, 1);
  const keywordCoverage = (matchedKeywords.length / Math.max(keywords.length, 1)) * 100;
  const depthBonus = normalizedAnswer.split(" ").length > 50 ? 10 : 0;
  return Math.min(Math.round(accuracyHits * 50 + (keywordCoverage * 0.5) + depthBonus), 100);
};

const calculateCommunicationScore = (answer, normalizedAnswer) => {
  const answerTokens = tokenize(answer);
  const wordCount = answerTokens.length;
  const wordCountScore = Math.min((wordCount / 40) * 30, 30);
  const hasStructure = /\b(first|second|third|finally|therefore|thus|because|specifically)\b/i.test(answer) ? 25 : 0;
  const hasPunctuation = /[.!?]/.test(String(answer)) ? 15 : 0;
  const hasExample = /\b(example|for instance|e\.g|case|project|built|implemented|deployed)\b/i.test(String(answer)) ? 30 : 0;
  return Math.round(Math.min(wordCountScore + hasStructure + hasPunctuation + hasExample, 100));
};

const scoreQuestion = ({ questionInput, answer, role, difficulty }) => {
  const metadata = inferQuestionMetadata(questionInput, role, difficulty);
  const normalizedAnswer = normalizeText(answer);
  const answerTokens = new Set(tokenize(answer));
  const expectedTokens = new Set(tokenize(metadata.expectedAnswer));
  const qualityFlag = getAnswerQualityFlag(answer);
  const keywords = unique(metadata.keywords.map((keyword) => normalizeText(keyword)));
  const matchedKeywords = keywords.filter((keyword) => normalizedAnswer.includes(keyword));
  const questionTokens = tokenize(metadata.question, 4);
  
  let correctnessScore = calculateCorrectness(normalizedAnswer, keywords, matchedKeywords);
  let relevanceScore = calculateRelevance(answer, questionTokens, answerTokens, normalizedAnswer);
  let technicalAccuracyScore = calculateTechnicalAccuracy(normalizedAnswer, expectedTokens, answerTokens, keywords, matchedKeywords);
  let communicationScore = calculateCommunicationScore(answer, normalizedAnswer);

  if (qualityFlag === "empty") {
    correctnessScore = 0;
    relevanceScore = 0;
    technicalAccuracyScore = 0;
    communicationScore = 0;
  }

  // Comprehensive score: weighted average of 4 categories
  let rawScore = 
    correctnessScore * 0.3 +
    relevanceScore * 0.25 +
    technicalAccuracyScore * 0.25 +
    communicationScore * 0.2;

  // Identify what was correct/incorrect
  const whatWasCorrect = matchedKeywords.slice(0, 5);
  const whatWasIncorrect = keywords
    .filter((keyword) => !matchedKeywords.includes(keyword))
    .slice(0, 5);

  // Determine if irrelevant
  const isIrrelevantAnswer = qualityFlag === "random" || qualityFlag === "harmful" || (relevanceScore < 15 && correctnessScore < 15);

  // Apply strict quality penalties and scoring bands
  const numMatched = matchedKeywords.length;
  const strongKeywordCoverage = numMatched >= Math.ceil(keywords.length * 0.75);
  
  if (qualityFlag === "empty") {
    rawScore = 0;
  } else if (qualityFlag === "random") {
    rawScore = Math.min(rawScore, 15);
  } else if (qualityFlag === "harmful") {
    rawScore = Math.min(rawScore, 20);
  } else if (isIrrelevantAnswer) {
    rawScore = Math.min(rawScore, 25);
  } else if (numMatched <= 1 || (correctnessScore < 25 && relevanceScore < 25)) {
    // Wrong Answer -> Low Score (0-35)
    rawScore = Math.min(rawScore, 35);
  } else if (strongKeywordCoverage && correctnessScore >= 65 && relevanceScore >= 15) {
    // Correct Answer -> High Score (71-100)
    rawScore = Math.max(rawScore, 75);
  } else {
    // Partial Answer -> Medium Score (40-70)
    rawScore = Math.min(Math.max(rawScore, 40), 69);
  }

  const score = clampScore(rawScore);
  const missingKeywords = keywords.filter((keyword) => !matchedKeywords.includes(keyword)).slice(0, 6);

  // Generate detailed feedback
  const improvementSuggestion = generateImprovementSuggestion(score, missingKeywords, whatWasIncorrect, metadata);

  return {
    ...metadata,
    answer: String(answer || ""),
    score,
    correctnessScore: clampScore(correctnessScore),
    relevanceScore: clampScore(relevanceScore),
    technicalAccuracyScore: clampScore(technicalAccuracyScore),
    communicationScore: clampScore(communicationScore),
    matchedKeywords,
    missingKeywords,
    whatWasCorrect,
    whatWasIncorrect,
    correctAnswer: metadata.expectedAnswer,
    isEmpty: qualityFlag === "empty",
    isIrrelevant: isIrrelevantAnswer,
    feedback: buildQuestionFeedback(score, matchedKeywords, missingKeywords, qualityFlag, correctnessScore, relevanceScore, technicalAccuracyScore),
    improvementSuggestion,
  };
};

const evaluateAnswers = ({ role, questions, answers, difficulty = "Intermediate" }) => {
  const questionScores = questions.map((questionInput, index) =>
    scoreQuestion({
      questionInput,
      answer: answers[index] || "",
      role,
      difficulty,
    })
  );

  const average = (selector) =>
    questionScores.length
      ? clampScore(questionScores.reduce((sum, item) => sum + selector(item), 0) / questionScores.length)
      : 0;

  // Calculate scores using new categories
  const technical = average((item) => item.technicalAccuracyScore);
  const communication = average((item) => item.communicationScore);
  const problemSolving = average((item) => item.correctnessScore);
  const overall = average((item) => item.score);
  const weakQuestions = questionScores.filter((item) => item.score < 70).slice(0, 2);

  return {
    technical,
    communication,
    problemSolving,
    overall,
    feedback: buildOverallFeedback(overall, weakQuestions),
    questionScores,
  };
};

const generateImprovementSuggestion = (score, missingKeywords, whatWasIncorrect, metadata) => {
  if (score >= 85) {
    return "Excellent! To reach mastery, add specific metrics or business impact measurements to your answer.";
  }
  if (score >= 70) {
    return `Good foundation. Strengthen by covering: ${missingKeywords.slice(0, 2).join(", ")}. Add a concrete project example.`;
  }
  if (score >= 40) {
    const topicsToAdd = missingKeywords.slice(0, 3).join(", ");
    return `Partial answer. You need to add more about: ${topicsToAdd}. Structure: concept -> implementation -> tradeoffs -> impact.`;
  }
  if (score > 0) {
    return `The answer does not directly address the question. Start over with: "${metadata.question}". Review: ${missingKeywords.join(", ") || "core concepts"}.`;
  }
  return "No answer provided. Please provide a substantive response addressing all aspects of the question.";
};

const buildOverallFeedback = (overall, weakQuestions) => {
  if (overall < 25) {
    return "Most answers were empty, irrelevant, or too thin. Re-answer each question directly, define the core concept, and add one project example.";
  }
  if (overall < 40) {
    return "Several answers missed the expected concepts. Focus on role-specific terminology, explain why your approach works, and avoid generic responses.";
  }
  if (overall < 70) {
    const gaps = weakQuestions.flatMap((item) => item.missingKeywords).slice(0, 5);
    return `You have partial coverage, but need more depth. Strengthen answers with ${gaps.join(", ") || "specific keywords"}, examples, and measurable outcomes.`;
  }
  if (overall < 90) {
    return "Strong performance. To reach excellent, make each answer more structured: concept, implementation detail, tradeoff, and impact.";
  }
  return "Excellent performance. Answers were relevant, complete, and well aligned with the expected role concepts.";
};

module.exports = {
  evaluateAnswers,
  inferQuestionMetadata,
  scoreQuestion,
};
