// server/models/Interview.js
const mongoose = require("mongoose");

const interviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    role: { type: String, required: true, trim: true },
    experience: { type: String, trim: true },
    difficulty: { type: String, trim: true },
    questions: [String],
    answers: [String],
    score: Number,
    feedback: {
      technical: Number,
      communication: Number,
      problemSolving: Number,
      confidence: Number,
      relevance: Number,
      completeness: Number,
      overall: Number,
      feedback: String,
      strengths: [String],
      weaknesses: [String],
      suggestions: [String],
      studyTopics: [String],
      questionScores: [
        {
          question: String,
          answer: String,
          score: Number,
          correctnessScore: Number,
          relevanceScore: Number,
          technicalAccuracyScore: Number,
          communicationScore: Number,
          feedback: String,
          correctSignals: [String],
          incorrectSignals: [String],
          whatWasCorrect: [String],
          whatWasIncorrect: [String],
          whyItIsWrong: String,
          correctAnswer: String,
          improvementSuggestion: String,
          studyTopics: [String],
        },
      ],
      improvementTracker: {
        mistakesMade: [String],
        weakTopics: [String],
        learningRecommendations: [String],
        areasToImprove: [String],
      },
    },
    atsScore: {
      score: Number,
      level: String,
      matchedKeywords: [String],
      missingKeywords: [String],
      sectionScores: {
        contact: Number,
        skills: Number,
        experience: Number,
        education: Number,
        projects: Number,
      },
      recommendations: [String],
    },
    resumeText: String,
    deletedAt: {
      type: Date,
      default: null,
      index: true,
    },
  },
  { timestamps: true }
);

interviewSchema.index({ user: 1, createdAt: -1 });
interviewSchema.index({ user: 1, deletedAt: 1, createdAt: -1 });
interviewSchema.index({ score: -1 });
interviewSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Interview", interviewSchema);
