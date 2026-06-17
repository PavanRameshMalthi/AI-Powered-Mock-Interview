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
      overall: Number,
      feedback: String,
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
  },
  { timestamps: true }
);

module.exports = mongoose.model("Interview", interviewSchema);
