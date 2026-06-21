const {
  evaluateAnswers,
  scoreQuestion,
  inferQuestionMetadata,
} = require("../utils/evaluationEngine");

describe("Evaluation Engine - Score Calculation", () => {
  const testQuestion = {
    question: "Explain how you would design a React component architecture for a large-scale application",
    expectedAnswer:
      "A strong answer should explain UI architecture, React components, state management, performance optimization, testing strategy, and scalability with real examples.",
    keywords: ["react", "components", "state", "performance", "testing", "scalability"],
    difficulty: "Intermediate",
    category: "Frontend",
  };

  describe("CORRECT ANSWER", () => {
    test("should score 85-100 for comprehensive correct answer", () => {
      const answer =
        "I would design a component-based architecture using React hooks and context API for state management. " +
        "Break the UI into reusable components with clear responsibilities. " +
        "For performance, use React.memo, useMemo for expensive calculations, and code splitting with lazy loading. " +
        "Implement testing with Jest and React Testing Library. " +
        "For scalability, organize components in a modular folder structure, document prop types, and use error boundaries. " +
        "Example: Built a dashboard with 50+ components where we saw 40% faster load times after optimizing re-renders.";

      const result = scoreQuestion({
        questionInput: testQuestion,
        answer,
        role: "Frontend Developer",
        difficulty: "Intermediate",
      });

      console.log("CORRECT ANSWER RESULT:", {
        score: result.score,
        correctnessScore: result.correctnessScore,
        relevanceScore: result.relevanceScore,
        technicalAccuracyScore: result.technicalAccuracyScore,
        communicationScore: result.communicationScore,
        matchedKeywords: result.matchedKeywords,
      });

      expect(result.score).toBeGreaterThanOrEqual(80);
      expect(result.isEmpty).toBe(false);
      expect(result.isIrrelevant).toBe(false);
      expect(result.matchedKeywords.length).toBeGreaterThan(4);
    });

    test("should have low missing keywords for correct answer", () => {
      const answer =
        "I would design a modular React component architecture with clear separation of concerns. " +
        "Use hooks and context API for state management. " +
        "Optimize performance with React.memo, useMemo, and code splitting. " +
        "Implement comprehensive testing with Testing Library and Jest. " +
        "Ensure scalability through responsive design, folder structure, and error boundaries. " +
        "Example: Built a dashboard with 50+ components where performance optimization reduced load time by 40%.";

      const result = scoreQuestion({
        questionInput: testQuestion,
        answer,
        role: "Frontend Developer",
        difficulty: "Intermediate",
      });

      expect(result.missingKeywords.length).toBeLessThan(3);
      expect(result.score).toBeGreaterThanOrEqual(75);
    });
  });

  describe("WRONG ANSWER", () => {
    test("should score 0-30 for completely wrong answer", () => {
      const answer = "You should use jQuery for everything. Avoid components because they are slow.";

      const result = scoreQuestion({
        questionInput: testQuestion,
        answer,
        role: "Frontend Developer",
        difficulty: "Intermediate",
      });

      console.log("WRONG ANSWER RESULT:", {
        score: result.score,
        matchedKeywords: result.matchedKeywords,
        feedback: result.feedback,
      });

      expect(result.score).toBeLessThanOrEqual(35);
      expect(result.isIrrelevant).toBe(true);
    });

    test("should score low for technically incorrect answer", () => {
      const answer =
        "Just put all your React code in one big component. " +
        "Don't worry about state management, it's not important. " +
        "Performance doesn't matter for modern browsers.";

      const result = scoreQuestion({
        questionInput: testQuestion,
        answer,
        role: "Frontend Developer",
        difficulty: "Intermediate",
      });

      expect(result.score).toBeLessThanOrEqual(40);
    });

    test("should give negative feedback for wrong answers", () => {
      const answer = "Use inline styles everywhere and no testing needed";

      const result = scoreQuestion({
        questionInput: testQuestion,
        answer,
        role: "Frontend Developer",
        difficulty: "Intermediate",
      });

      expect(result.feedback).toBeTruthy();
      expect(result.score).toBeLessThanOrEqual(40);
    });
  });

  describe("PARTIAL ANSWER", () => {
    test("should score 40-70 for partial answer with some correct elements", () => {
      const answer =
        "React components should be modular and reusable. " +
        "You need proper state management and consider performance optimization.";

      const result = scoreQuestion({
        questionInput: testQuestion,
        answer,
        role: "Frontend Developer",
        difficulty: "Intermediate",
      });

      console.log("PARTIAL ANSWER RESULT:", {
        score: result.score,
        matchedKeywords: result.matchedKeywords,
        missingKeywords: result.missingKeywords,
      });

      expect(result.score).toBeGreaterThanOrEqual(40);
      expect(result.score).toBeLessThanOrEqual(75);
    });

    test("should identify missing concepts in partial answers", () => {
      const answer = 
        "Design React components using hooks and context for state. " +
        "Optimize performance through memoization and code splitting. " +
        "Write tests to ensure components work correctly.";

      const result = scoreQuestion({
        questionInput: testQuestion,
        answer,
        role: "Frontend Developer",
        difficulty: "Intermediate",
      });

      console.log("PARTIAL ANSWER 2 RESULT:", {
        score: result.score,
        correctnessScore: result.correctnessScore,
        relevanceScore: result.relevanceScore,
        technicalAccuracyScore: result.technicalAccuracyScore,
        communicationScore: result.communicationScore,
        matchedKeywords: result.matchedKeywords,
        missingKeywords: result.missingKeywords,
        feedback: result.feedback,
      });

      expect(result.missingKeywords.length).toBeGreaterThan(1);
      expect(result.feedback).toContain("Partial");
    });
  });

  describe("EMPTY / SKIPPED ANSWER", () => {
    test("should score exactly 0 for empty answer", () => {
      const result = scoreQuestion({
        questionInput: testQuestion,
        answer: "",
        role: "Frontend Developer",
        difficulty: "Intermediate",
      });

      console.log("EMPTY ANSWER RESULT:", {
        score: result.score,
        isEmpty: result.isEmpty,
        feedback: result.feedback,
      });

      expect(result.score).toBe(0);
      expect(result.correctnessScore).toBe(0);
      expect(result.relevanceScore).toBe(0);
      expect(result.technicalAccuracyScore).toBe(0);
      expect(result.communicationScore).toBe(0);
      expect(result.isEmpty).toBe(true);
    });

    test("should score exactly 0 for whitespace-only answer", () => {
      const result = scoreQuestion({
        questionInput: testQuestion,
        answer: "   ",
        role: "Frontend Developer",
        difficulty: "Intermediate",
      });

      expect(result.score).toBe(0);
      expect(result.isEmpty).toBe(true);
    });

    test("should score minimal for single word", () => {
      const result = scoreQuestion({
        questionInput: testQuestion,
        answer: "React",
        role: "Frontend Developer",
        difficulty: "Intermediate",
      });

      expect(result.score).toBeLessThanOrEqual(10);
    });
  });

  describe("RANDOM/NONSENSE ANSWER", () => {
    test("should score 0-25 for AI placeholder answer", () => {
      const result = scoreQuestion({
        questionInput: testQuestion,
        answer: "As an AI, I cannot provide specific implementation details about React components.",
        role: "Frontend Developer",
        difficulty: "Intermediate",
      });

      console.log("RANDOM ANSWER (AI PLACEHOLDER) RESULT:", {
        score: result.score,
        isIrrelevant: result.isIrrelevant,
        feedback: result.feedback,
      });

      expect(result.score).toBeLessThanOrEqual(25);
      expect(result.isIrrelevant).toBe(true);
    });

    test("should score 0-25 for repeated characters", () => {
      const result = scoreQuestion({
        questionInput: testQuestion,
        answer: "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
        role: "Frontend Developer",
        difficulty: "Intermediate",
      });

      expect(result.score).toBeLessThanOrEqual(25);
      expect(result.isIrrelevant).toBe(true);
    });

    test("should score 0-25 for 'I don't know' response", () => {
      const result = scoreQuestion({
        questionInput: testQuestion,
        answer: "I don't know, sorry.",
        role: "Frontend Developer",
        difficulty: "Intermediate",
      });

      expect(result.score).toBeLessThanOrEqual(25);
    });

    test("should score 0-25 for lorem ipsum", () => {
      const result = scoreQuestion({
        questionInput: testQuestion,
        answer: "Lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor",
        role: "Frontend Developer",
        difficulty: "Intermediate",
      });

      expect(result.score).toBeLessThanOrEqual(25);
    });
  });

  describe("SCORE DISTRIBUTION", () => {
    test("should have clear separation between score bands", () => {
      const correctAnswer = scoreQuestion({
        questionInput: testQuestion,
        answer:
          "Design with modular React components using hooks and context API. " +
          "Implement performance optimization through memoization and code splitting. " +
          "Establish testing with Jest and React Testing Library. " +
          "Structure for scalability with organized folders and error boundaries. " +
          "Example: Optimized component rendering reduced load time by 35%.",
        role: "Frontend Developer",
        difficulty: "Intermediate",
      });

      const partialAnswer = scoreQuestion({
        questionInput: testQuestion,
        answer: "Use React components and manage state properly.",
        role: "Frontend Developer",
        difficulty: "Intermediate",
      });

      const wrongAnswer = scoreQuestion({
        questionInput: testQuestion,
        answer: "Don't use React, use jQuery instead.",
        role: "Frontend Developer",
        difficulty: "Intermediate",
      });

      const emptyAnswer = scoreQuestion({
        questionInput: testQuestion,
        answer: "",
        role: "Frontend Developer",
        difficulty: "Intermediate",
      });

      console.log("SCORE DISTRIBUTION:", {
        correct: correctAnswer.score,
        partial: partialAnswer.score,
        wrong: wrongAnswer.score,
        empty: emptyAnswer.score,
      });

      expect(correctAnswer.score).toBeGreaterThan(partialAnswer.score);
      expect(partialAnswer.score).toBeGreaterThan(wrongAnswer.score);
      expect(wrongAnswer.score).toBeGreaterThan(emptyAnswer.score);
    });
  });

  describe("NEW SCORE CATEGORIES", () => {
    test("should calculate correctnessScore based on technical accuracy", () => {
      const answer =
        "React components with hooks, context for state, memoization for performance, " +
        "Testing Library for testing, modular structure for scalability.";

      const result = scoreQuestion({
        questionInput: testQuestion,
        answer,
        role: "Frontend Developer",
        difficulty: "Intermediate",
      });

      expect(result.correctnessScore).toBeDefined();
      expect(result.correctnessScore).toBeGreaterThan(0);
      expect(result.correctnessScore).toBeLessThanOrEqual(100);
    });

    test("should calculate relevanceScore based on topic alignment", () => {
      const answer =
        "React components should be designed for reusability and maintainability. " +
        "Consider performance optimization and proper testing strategies.";

      const result = scoreQuestion({
        questionInput: testQuestion,
        answer,
        role: "Frontend Developer",
        difficulty: "Intermediate",
      });

      expect(result.relevanceScore).toBeDefined();
      expect(result.relevanceScore).toBeGreaterThan(0);
    });

    test("should calculate technicalAccuracyScore for correct technical details", () => {
      const answer =
        "Use React.memo for optimization, context API for state, lazy loading for code splitting, " +
        "and error boundaries for resilience.";

      const result = scoreQuestion({
        questionInput: testQuestion,
        answer,
        role: "Frontend Developer",
        difficulty: "Intermediate",
      });

      expect(result.technicalAccuracyScore).toBeDefined();
      expect(result.technicalAccuracyScore).toBeGreaterThan(0);
    });

    test("should calculate communicationScore based on clarity", () => {
      const answer =
        "First, design modular components. Second, implement state management with context. " +
        "Third, optimize performance with React.memo. Fourth, ensure testing with React Testing Library. " +
        "Finally, structure for scalability.";

      const result = scoreQuestion({
        questionInput: testQuestion,
        answer,
        role: "Frontend Developer",
        difficulty: "Intermediate",
      });

      expect(result.communicationScore).toBeDefined();
    });
  });

  describe("FEEDBACK QUALITY", () => {
    test("should show what was correct for good answers", () => {
      const answer =
        "Use React hooks and context API for state management. Optimize with React.memo. " +
        "Use Testing Library for tests. Structure with modular architecture.";

      const result = scoreQuestion({
        questionInput: testQuestion,
        answer,
        role: "Frontend Developer",
        difficulty: "Intermediate",
      });

      expect(result.whatWasCorrect).toBeDefined();
      expect(result.whatWasCorrect.length).toBeGreaterThan(0);
    });

    test("should identify what was incorrect", () => {
      const answer = "Use only global state and skip testing for performance.";

      const result = scoreQuestion({
        questionInput: testQuestion,
        answer,
        role: "Frontend Developer",
        difficulty: "Intermediate",
      });

      expect(result.whatWasIncorrect).toBeDefined();
    });

    test("should provide correct answer reference", () => {
      const answer = "React is good.";

      const result = scoreQuestion({
        questionInput: testQuestion,
        answer,
        role: "Frontend Developer",
        difficulty: "Intermediate",
      });

      expect(result.correctAnswer).toBe(testQuestion.expectedAnswer);
    });

    test("should provide improvement suggestions", () => {
      const answer = "React components are important.";

      const result = scoreQuestion({
        questionInput: testQuestion,
        answer,
        role: "Frontend Developer",
        difficulty: "Intermediate",
      });

      expect(result.improvementSuggestion).toBeDefined();
      expect(result.improvementSuggestion).not.toBeEmpty;
    });
  });

  describe("BATCH EVALUATION", () => {
    test("should evaluate multiple answers correctly", () => {
      const questions = [
        {
          question: "Explain React hooks",
          expectedAnswer: "React hooks are functions that let you use state in functional components",
          keywords: ["hooks", "state", "functional", "components"],
        },
        {
          question: "What is state management?",
          expectedAnswer: "State management is managing application data across components",
          keywords: ["state", "data", "components", "management"],
        },
      ];

      const answers = [
        "Hooks are React functions like useState and useEffect for state and side effects in functional components",
        "Wrong, state is just for class components",
      ];

      const result = evaluateAnswers({
        role: "Frontend Developer",
        questions,
        answers,
        difficulty: "Intermediate",
      });

      expect(result.questionScores).toHaveLength(2);
      expect(result.questionScores[0].score).toBeGreaterThan(result.questionScores[1].score);
    });
  });
});
