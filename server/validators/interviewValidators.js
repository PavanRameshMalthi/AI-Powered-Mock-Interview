const { body } = require("express-validator");

const roles = [
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "React Developer",
  "Node.js Developer",
  "Java Developer",
  "Python Developer",
  "Data Analyst",
  "HR Interview",
];

const difficulties = ["Beginner", "Intermediate", "Advanced"];

const generateRules = [
  body("role")
    .trim()
    .isLength({ min: 2, max: 80 })
    .withMessage("Job role is required"),
  body("experience").optional().trim().isLength({ max: 80 }).withMessage("Experience is too long"),
  body("difficulty").optional().isIn(difficulties).withMessage("Choose a valid difficulty"),
  body("questionCount").optional().isInt({ min: 1, max: 10 }).withMessage("Question count must be 1-10"),
  body("resumeText").optional().isString().isLength({ max: 20000 }).withMessage("Resume text is too long"),
];

const evaluationRules = [
  body("role").trim().isLength({ min: 2, max: 80 }).withMessage("Role is required"),
  body("difficulty").optional().isIn(difficulties).withMessage("Choose a valid difficulty"),
  body("questions").isArray({ min: 1, max: 10 }).withMessage("Questions are required"),
  body("answers")
    .isArray({ min: 1, max: 10 })
    .withMessage("Answers are required")
    .custom((answers, { req }) => {
      const questions = Array.isArray(req.body.questions) ? req.body.questions : [];
      if (answers.length !== questions.length) {
        throw new Error("Every question must have an answer slot");
      }
      if (answers.some((answer) => typeof answer !== "string")) {
        throw new Error("Answers must be an array of strings");
      }
      return true;
    }),
  body("resumeText").optional().isString().isLength({ max: 20000 }).withMessage("Resume text is too long"),
];

module.exports = {
  roles,
  difficulties,
  generateRules,
  evaluationRules,
};
