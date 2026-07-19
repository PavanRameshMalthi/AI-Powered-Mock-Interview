const mongoose = require("mongoose");

const atsReportSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    role: {
      type: String,
      trim: true,
      default: "",
    },
    resumeTextLength: {
      type: Number,
      default: 0,
    },
    score: {
      type: Number,
      min: 0,
      max: 100,
      required: true,
      index: true,
    },
    level: String,
    matchedKeywords: [String],
    missingKeywords: [String],
    skillsDetected: [String],
    sectionScores: {
      contact: Number,
      skills: Number,
      experience: Number,
      education: Number,
      projects: Number,
    },
  },
  { timestamps: true }
);

atsReportSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model("AtsReport", atsReportSchema);
