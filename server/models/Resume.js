const mongoose = require("mongoose");

const resumeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // ── Identity ──────────────────────────────────────────────────────────────
    resumeName: {
      type: String,
      trim: true,
      default: "My Resume",
    },
    version: {
      type: Number,
      required: true,
      min: 1,
    },
    isActive: {
      type: Boolean,
      default: false,
      index: true,
    },

    // ── File metadata ─────────────────────────────────────────────────────────
    fileName: {
      type: String,
      trim: true,
    },
    fileSize: {
      type: Number, // bytes
      default: 0,
    },
    fileUrl: {
      type: String, // relative path stored in uploads/
      trim: true,
    },
    extractedText: {
      type: String,
      default: "",
    },

    // ── ATS Core ──────────────────────────────────────────────────────────────
    atsScore: {
      score: { type: Number, min: 0, max: 100, default: 0 },
      level: { type: String, default: "Needs work" },
      matchedKeywords: [String],
      missingKeywords: [String],
      skillsDetected: [String],
      strengths: [String],
      weaknesses: [String],
      recommendations: [String],
      sectionScores: {
        contact: Number,
        skills: Number,
        experience: Number,
        education: Number,
        projects: Number,
        technicalSkills: Number,
        certifications: Number,
        completeness: Number,
      },
    },

    // ── Enhanced ATS Analysis (12 categories) ─────────────────────────────────
    atsAnalysis: {
      formatting: { score: Number, explanation: String },
      keywordMatch: { score: Number, explanation: String },
      skillsMatch: { score: Number, explanation: String },
      education: { score: Number, explanation: String },
      projects: { score: Number, explanation: String },
      experience: { score: Number, explanation: String },
      contactInfo: { score: Number, explanation: String },
      grammar: { score: Number, explanation: String },
      readability: { score: Number, explanation: String },
      professionalSummary: { score: Number, explanation: String },
      actionVerbs: { score: Number, explanation: String },
      achievements: { score: Number, explanation: String },
    },

    // ── Section Detection ─────────────────────────────────────────────────────
    sectionsFound: {
      contact: { type: Boolean, default: false },
      summary: { type: Boolean, default: false },
      education: { type: Boolean, default: false },
      skills: { type: Boolean, default: false },
      projects: { type: Boolean, default: false },
      experience: { type: Boolean, default: false },
      certifications: { type: Boolean, default: false },
      achievements: { type: Boolean, default: false },
      languages: { type: Boolean, default: false },
    },

    // ── AI Suggestions ────────────────────────────────────────────────────────
    aiSuggestions: [
      {
        title: String,
        detail: String,
        priority: { type: String, enum: ["high", "medium", "low"], default: "medium" },
      },
    ],

    // ── Resume Statistics ─────────────────────────────────────────────────────
    resumeStats: {
      wordCount: { type: Number, default: 0 },
      charCount: { type: Number, default: 0 },
      estimatedPages: { type: Number, default: 1 },
      estimatedReadingTime: { type: Number, default: 0 }, // minutes
      skillsCount: { type: Number, default: 0 },
      projectsCount: { type: Number, default: 0 },
      experienceCount: { type: Number, default: 0 },
    },

    // ── Future compatibility ───────────────────────────────────────────────────
    jobMatchScore: {
      type: Number,
      min: 0,
      max: 100,
      default: null,
    },

    // ── Soft delete ───────────────────────────────────────────────────────────
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Compound indexes for efficient querying
resumeSchema.index({ user: 1, version: -1 });
resumeSchema.index({ user: 1, isActive: 1 });
resumeSchema.index({ user: 1, createdAt: -1 });
resumeSchema.index({ user: 1, deletedAt: 1 });

module.exports = mongoose.model("Resume", resumeSchema);
