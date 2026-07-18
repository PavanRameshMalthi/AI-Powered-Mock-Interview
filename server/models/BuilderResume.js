const mongoose = require("mongoose");

const builderResumeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: {
      type: String,
      trim: true,
      default: "My Resume",
    },
    template: {
      type: String,
      trim: true,
      default: "professional",
    },
    data: {
      personal: {
        fullName: { type: String, default: "" },
        email: { type: String, default: "" },
        phone: { type: String, default: "" },
        address: { type: String, default: "" },
        linkedin: { type: String, default: "" },
        github: { type: String, default: "" },
        portfolio: { type: String, default: "" },
      },
      summary: { type: String, default: "" },
      education: [
        {
          degree: { type: String, default: "" },
          college: { type: String, default: "" },
          university: { type: String, default: "" },
          startYear: { type: String, default: "" },
          endYear: { type: String, default: "" },
          score: { type: String, default: "" },
        },
      ],
      skills: {
        programming: { type: [String], default: [] },
        frameworks: { type: [String], default: [] },
        databases: { type: [String], default: [] },
        tools: { type: [String], default: [] },
        soft: { type: [String], default: [] },
      },
      projects: [
        {
          title: { type: String, default: "" },
          description: { type: String, default: "" },
          technologies: { type: String, default: "" },
          github: { type: String, default: "" },
          live: { type: String, default: "" },
        },
      ],
      experience: [
        {
          company: { type: String, default: "" },
          role: { type: String, default: "" },
          duration: { type: String, default: "" },
          responsibilities: { type: String, default: "" },
        },
      ],
      certifications: [
        {
          name: { type: String, default: "" },
          organization: { type: String, default: "" },
          issueDate: { type: String, default: "" },
          credentialUrl: { type: String, default: "" },
        },
      ],
      achievements: {
        awards: { type: String, default: "" },
        hackathons: { type: String, default: "" },
        competitions: { type: String, default: "" },
        academic: { type: String, default: "" },
      },
    },
    atsScore: {
      type: Number,
      default: 0,
    },
    atsReport: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    isActive: {
      type: Boolean,
      default: false,
      index: true,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

builderResumeSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model("BuilderResume", builderResumeSchema);
