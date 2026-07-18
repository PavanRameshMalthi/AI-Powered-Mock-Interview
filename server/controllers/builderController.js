const mongoose = require("mongoose");
const BuilderResume = require("../models/BuilderResume");
const Resume = require("../models/Resume");
const { scoreResumeForRole } = require("../utils/atsScorer");
const { detectSections, computeResumeStats, computeATSAnalysis } = require("../utils/resumeAnalyzer");
const { asyncHandler, AppError } = require("../middleware/errorMiddleware");

// Helper to convert builder resume data into plain text
const generatePlainTextResume = (data) => {
  const parts = [];

  if (data.personal) {
    const p = data.personal;
    parts.push(p.fullName || "");
    parts.push(`Email: ${p.email || ""} | Phone: ${p.phone || ""} | Address: ${p.address || ""}`);
    parts.push(`LinkedIn: ${p.linkedin || ""} | GitHub: ${p.github || ""} | Portfolio: ${p.portfolio || ""}`);
  }

  const cleanSummary = (data.summary || "").replace(/<[^>]*>/g, "").trim();
  if (cleanSummary) {
    parts.push(`\nSUMMARY\n${cleanSummary}`);
  }

  if (data.skills) {
    parts.push("\nSKILLS");
    Object.entries(data.skills).forEach(([category, list]) => {
      if (Array.isArray(list) && list.length) {
        parts.push(`${category}: ${list.join(", ")}`);
      }
    });
  }

  if (data.experience && data.experience.length) {
    parts.push("\nEXPERIENCE");
    data.experience.forEach((exp) => {
      if (exp.company || exp.role) {
        parts.push(`${exp.role || "Role"} at ${exp.company || "Company"} (${exp.duration || "Duration"})`);
        const cleanResp = (exp.responsibilities || "").replace(/<[^>]*>/g, "").trim();
        if (cleanResp) parts.push(cleanResp);
      }
    });
  }

  if (data.projects && data.projects.length) {
    parts.push("\nPROJECTS");
    data.projects.forEach((proj) => {
      if (proj.title) {
        parts.push(`${proj.title} | Technologies: ${proj.technologies || "None"}`);
        const cleanDesc = (proj.description || "").replace(/<[^>]*>/g, "").trim();
        if (cleanDesc) parts.push(cleanDesc);
        if (proj.github || proj.live) {
          parts.push(`Links: ${proj.github || ""} ${proj.live || ""}`);
        }
      }
    });
  }

  if (data.education && data.education.length) {
    parts.push("\nEDUCATION");
    data.education.forEach((edu) => {
      if (edu.degree || edu.college || edu.university) {
        parts.push(`${edu.degree || "Degree"} from ${edu.college || edu.university || "Institution"} (${edu.startYear || ""} - ${edu.endYear || ""})`);
        if (edu.score) parts.push(`Score: ${edu.score}`);
      }
    });
  }

  if (data.certifications && data.certifications.length) {
    parts.push("\nCERTIFICATIONS");
    data.certifications.forEach((cert) => {
      if (cert.name || cert.organization) {
        parts.push(`${cert.name || "Certificate"} by ${cert.organization || "Organization"} (${cert.issueDate || ""})`);
      }
    });
  }

  if (data.achievements) {
    const a = data.achievements;
    if (a.awards || a.hackathons || a.competitions || a.academic) {
      parts.push("\nACHIEVEMENTS");
      if (a.awards) parts.push(`Awards: ${a.awards}`);
      if (a.hackathons) parts.push(`Hackathons: ${a.hackathons}`);
      if (a.competitions) parts.push(`Competitions: ${a.competitions}`);
      if (a.academic) parts.push(`Academic Achievements: ${a.academic}`);
    }
  }

  return parts.join("\n");
};

// Helper to compute ATS Score and Analysis
const computeBuilderAts = (builderData) => {
  let ruleScore = 0;
  const missing = [];
  const p = builderData.personal || {};
  if (p.fullName) ruleScore += 10; else missing.push("Full Name");
  if (p.email) ruleScore += 10; else missing.push("Email");
  if (p.phone) ruleScore += 10; else missing.push("Phone");

  const cleanSummary = (builderData.summary || "").replace(/<[^>]*>/g, "").trim();
  if (cleanSummary.length >= 100) ruleScore += 15; else missing.push("Summary (100+ chars)");

  if (builderData.education && builderData.education.some((e) => e.degree)) ruleScore += 15; else missing.push("Education");

  const allSkills = Object.values(builderData.skills || {}).flat().filter(Boolean);
  if (allSkills.length >= 5) ruleScore += 15; else missing.push("At least 5 Skills");

  if (builderData.projects && builderData.projects.some((proj) => proj.title && proj.description)) ruleScore += 15; else missing.push("Project with Description");

  if (builderData.experience && builderData.experience.some((e) => e.company || e.role)) ruleScore += 10; else missing.push("Experience");

  const scoreVal = Math.min(ruleScore, 100);

  // Generate plain text and run full backend score/analyzer
  const text = generatePlainTextResume(builderData);
  const atsScore = scoreResumeForRole({ resumeText: text });
  const sections = detectSections(text);
  const atsAnalysis = computeATSAnalysis(text, atsScore, sections);
  const resumeStats = computeResumeStats(text, atsScore.skillsDetected || []);

  return {
    score: scoreVal,
    missing,
    text,
    fullAnalysis: {
      atsScore,
      atsAnalysis,
      sectionsFound: sections,
      resumeStats,
    },
  };
};

// Sync Active Builder Resume to Resume Collection
const syncToResumeCollection = async (userId, builderResume) => {
  const atsInfo = computeBuilderAts(builderResume.data);

  // Determine version number
  const existingCount = await Resume.countDocuments({
    user: userId,
    deletedAt: null,
  });
  const version = existingCount + 1;

  // Deactivate all previous versions
  await Resume.updateMany(
    { user: userId, deletedAt: null },
    { $set: { isActive: false } }
  );

  // Create the Resume record
  const savedResume = await Resume.create({
    user: userId,
    resumeName: builderResume.name,
    version,
    isActive: true,
    fileName: `${builderResume.name.replace(/[^\w\s-]/g, "").replace(/\s+/g, "_")}_v${version}.pdf`,
    fileSize: 0,
    fileUrl: `/api/resume-builder/download-placeholder`, // special indicator
    extractedText: atsInfo.text,
    atsScore: atsInfo.fullAnalysis.atsScore,
    atsAnalysis: atsInfo.fullAnalysis.atsAnalysis,
    sectionsFound: atsInfo.fullAnalysis.sectionsFound,
    aiSuggestions: [], // fallback rule suggestions are handled in frontend panels
    resumeStats: atsInfo.fullAnalysis.resumeStats,
  });

  return savedResume;
};

// --- CRUD Controllers ---

const getResumes = asyncHandler(async (req, res) => {
  const resumes = await BuilderResume.find({ user: req.user.id, deletedAt: null })
    .sort({ updatedAt: -1 })
    .lean();
  res.json({ success: true, resumes });
});

const getResume = asyncHandler(async (req, res) => {
  const resume = await BuilderResume.findOne({
    _id: req.params.id,
    user: req.user.id,
    deletedAt: null,
  });

  if (!resume) {
    throw new AppError("Resume not found", 404);
  }

  res.json({ success: true, resume });
});

const createResume = asyncHandler(async (req, res) => {
  const { name, template, data } = req.body;

  const defaultData = {
    personal: { fullName: "", email: "", phone: "", address: "", linkedin: "", github: "", portfolio: "" },
    summary: "",
    education: [],
    skills: { programming: [], frameworks: [], databases: [], tools: [], soft: [] },
    projects: [],
    experience: [],
    certifications: [],
    achievements: { awards: "", hackathons: "", competitions: "", academic: "" },
  };

  const finalData = data || defaultData;
  const atsInfo = computeBuilderAts(finalData);

  const resume = await BuilderResume.create({
    user: req.user.id,
    name: name || "My Resume",
    template: template || "professional",
    data: finalData,
    atsScore: atsInfo.score,
    atsReport: {
      missing: atsInfo.missing,
      fullAnalysis: atsInfo.fullAnalysis,
    },
    isActive: false,
  });

  res.status(201).json({ success: true, resume });
});

const updateResume = asyncHandler(async (req, res) => {
  const { name, template, data } = req.body;
  const resume = await BuilderResume.findOne({
    _id: req.params.id,
    user: req.user.id,
    deletedAt: null,
  });

  if (!resume) {
    throw new AppError("Resume not found", 404);
  }

  if (name !== undefined) resume.name = name;
  if (template !== undefined) resume.template = template;
  if (data !== undefined) resume.data = data;

  // Re-run ATS scoring
  const atsInfo = computeBuilderAts(resume.data);
  resume.atsScore = atsInfo.score;
  resume.atsReport = {
    missing: atsInfo.missing,
    fullAnalysis: atsInfo.fullAnalysis,
  };

  await resume.save();

  // If active, sync to Resume collection
  if (resume.isActive) {
    await syncToResumeCollection(req.user.id, resume);
  }

  res.json({ success: true, resume });
});

const deleteResume = asyncHandler(async (req, res) => {
  const resume = await BuilderResume.findOne({
    _id: req.params.id,
    user: req.user.id,
    deletedAt: null,
  });

  if (!resume) {
    throw new AppError("Resume not found", 404);
  }

  const wasActive = resume.isActive;
  resume.deletedAt = new Date();
  resume.isActive = false;
  await resume.save();

  // If active, mark the latest remaining one as active
  if (wasActive) {
    const latestRemaining = await BuilderResume.findOne({
      user: req.user.id,
      deletedAt: null,
    }).sort({ updatedAt: -1 });

    if (latestRemaining) {
      latestRemaining.isActive = true;
      await latestRemaining.save();
      await syncToResumeCollection(req.user.id, latestRemaining);
    }
  }

  res.json({ success: true, message: "Resume deleted successfully" });
});

const duplicateResume = asyncHandler(async (req, res) => {
  const original = await BuilderResume.findOne({
    _id: req.params.id,
    user: req.user.id,
    deletedAt: null,
  });

  if (!original) {
    throw new AppError("Resume not found", 404);
  }

  const duplicated = await BuilderResume.create({
    user: req.user.id,
    name: `${original.name} (Copy)`,
    template: original.template,
    data: original.data,
    atsScore: original.atsScore,
    atsReport: original.atsReport,
    isActive: false,
  });

  res.status(201).json({ success: true, resume: duplicated });
});

const setActiveResume = asyncHandler(async (req, res) => {
  const resume = await BuilderResume.findOne({
    _id: req.params.id,
    user: req.user.id,
    deletedAt: null,
  });

  if (!resume) {
    throw new AppError("Resume not found", 404);
  }

  // Deactivate all builder resumes for this user
  await BuilderResume.updateMany(
    { user: req.user.id, deletedAt: null },
    { $set: { isActive: false } }
  );

  // Activate selected one
  resume.isActive = true;
  await resume.save();

  // Synchronize to the central Resume collection for mock interview integration
  const syncRes = await syncToResumeCollection(req.user.id, resume);

  res.json({
    success: true,
    message: `Resume v${syncRes.version} set as active.`,
    resumeId: syncRes._id,
    version: syncRes.version,
    resumeName: syncRes.resumeName,
    atsScore: syncRes.atsScore,
    atsAnalysis: syncRes.atsAnalysis,
    sectionsFound: syncRes.sectionsFound,
    aiSuggestions: syncRes.aiSuggestions,
    resumeStats: syncRes.resumeStats,
    fileUrl: syncRes.fileUrl,
    extractedText: syncRes.extractedText,
  });
});

const getBuilderStats = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const [totalResumes, latest, active, avgScoreData] = await Promise.all([
    BuilderResume.countDocuments({ user: userId, deletedAt: null }),
    BuilderResume.findOne({ user: userId, deletedAt: null }).sort({ updatedAt: -1 }).select("name updatedAt"),
    BuilderResume.findOne({ user: userId, isActive: true, deletedAt: null }).select("name atsScore"),
    BuilderResume.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(userId), deletedAt: null } },
      { $group: { _id: null, avgScore: { $avg: "$atsScore" } } },
    ]),
  ]);

  const avgATS = avgScoreData.length ? Math.round(avgScoreData[0].avgScore) : 0;

  res.json({
    success: true,
    stats: {
      totalResumes,
      latestResume: latest ? { name: latest.name, updatedAt: latest.updatedAt } : null,
      activeResume: active ? { name: active.name, atsScore: active.atsScore } : null,
      averageAtsScore: avgATS,
    },
  });
});

module.exports = {
  getResumes,
  getResume,
  createResume,
  updateResume,
  deleteResume,
  duplicateResume,
  setActiveResume,
  getBuilderStats,
};
