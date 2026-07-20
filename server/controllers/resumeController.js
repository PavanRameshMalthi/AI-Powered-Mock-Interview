const fs = require("fs/promises");
const path = require("path");
const mongoose = require("mongoose");

const extractResumeText = require("../utils/resumeParser");
const { scoreResumeForRole } = require("../utils/atsScorer");
const {
  detectSections,
  computeResumeStats,
  computeATSAnalysis,
  generateFallbackSuggestions,
} = require("../utils/resumeAnalyzer");
const gemini = require("../utils/gemini");
const AtsReport = require("../models/AtsReport");
const Resume = require("../models/Resume");
const { asyncHandler, AppError } = require("../middleware/errorMiddleware");
const logger = require("../utils/logger");

// ─── File signature validators ─────────────────────────────────────────────────
const assertPdfSignature = async (filePath) => {
  const handle = await fs.open(filePath, "r");
  try {
    const buffer = Buffer.alloc(5);
    await handle.read(buffer, 0, 5, 0);
    if (buffer.toString("utf8") !== "%PDF-") {
      throw new AppError("Resume file appears corrupted.", 400);
    }
  } finally {
    await handle.close();
  }
};

const assertDocxSignature = async (filePath) => {
  const handle = await fs.open(filePath, "r");
  try {
    const buffer = Buffer.alloc(4);
    await handle.read(buffer, 0, 4, 0);
    if (buffer.toString("utf8") !== "PK\u0003\u0004") {
      throw new AppError("Resume file appears corrupted.", 400);
    }
  } finally {
    await handle.close();
  }
};

const validateResumeFile = async (filePath) => {
  const extension = path.extname(filePath).toLowerCase();
  if (extension === ".pdf") {
    await assertPdfSignature(filePath);
    return;
  }
  if (extension === ".docx") {
    await assertDocxSignature(filePath);
    return;
  }
  throw new AppError("Only PDF and DOCX files are supported.", 400);
};

// ─── Persist legacy ATS report ─────────────────────────────────────────────────
const persistAtsReport = async ({ userId, role, resumeText, atsScore }) => {
  if (!userId || !atsScore) return;
  if (!mongoose.Types.ObjectId.isValid(userId)) return;
  try {
    await AtsReport.create({
      user: userId,
      role,
      resumeTextLength: resumeText.length,
      ...atsScore,
    });
  } catch (error) {
    logger.warn({ err: error }, "ATS report persistence failed");
  }
};

// ─── Generate AI suggestions via Gemini ───────────────────────────────────────
const generateAISuggestions = async (resumeText, atsScore, sections) => {
  try {
    const skillsList = (atsScore.skillsDetected || []).slice(0, 10).join(", ");
    const missingList = (atsScore.missingKeywords || []).slice(0, 6).join(", ");

    const prompt = `You are an expert resume coach and ATS optimization specialist. Analyze this resume and provide exactly 8 actionable improvement suggestions.

Resume ATS Score: ${atsScore.score}/100 (${atsScore.level})
Skills Detected: ${skillsList || "None detected"}
Missing Keywords: ${missingList || "None"}
Sections Found: ${Object.entries(sections).filter(([,v]) => v).map(([k]) => k).join(", ") || "None"}
Sections Missing: ${Object.entries(sections).filter(([,v]) => !v).map(([k]) => k).join(", ") || "None"}

Resume Text (first 1200 characters):
${resumeText.substring(0, 1200)}

Return ONLY a valid JSON array with exactly 8 objects in this format (no markdown, no extra text):
[
  {
    "title": "Short title (5-8 words)",
    "detail": "Specific actionable advice (2-3 sentences)",
    "priority": "high"
  }
]

Priority must be one of: "high", "medium", "low"
Make suggestions specific to this resume's actual content and gaps.`;

    const result = await gemini.generateContent(prompt);
    const responseText = result.response.text().trim();

    // Extract JSON from response (handle markdown code blocks if present)
    const jsonMatch = responseText.match(/\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error("No JSON array found in response");

    const parsed = JSON.parse(jsonMatch[0]);
    if (!Array.isArray(parsed)) throw new Error("Response is not an array");

    return parsed
      .filter((s) => s.title && s.detail)
      .map((s) => ({
        title: String(s.title).substring(0, 100),
        detail: String(s.detail).substring(0, 500),
        priority: ["high", "medium", "low"].includes(s.priority) ? s.priority : "medium",
      }))
      .slice(0, 8);
  } catch (err) {
    logger.warn({ err }, "Gemini AI suggestions failed, using fallback");
    // Return fallback rule-based suggestions
    const atsAnalysis = computeATSAnalysis(resumeText, atsScore, sections);
    return generateFallbackSuggestions(atsAnalysis, sections, atsScore);
  }
};

// ─── Main upload handler ───────────────────────────────────────────────────────
const uploadResume = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new AppError("Please upload a PDF or DOCX resume", 400);
  }

  if (req.file.size === 0) {
    throw new AppError("No readable text found in resume.", 422);
  }

  logger.info({ file: req.file?.originalname, size: req.file?.size }, "Resume upload started");

  // 1. Validate file signature
  try {
    await validateResumeFile(req.file.path);
  } catch (error) {
    await fs.unlink(req.file.path).catch(() => {});
    if (error instanceof AppError) throw error;
    throw new AppError("Resume file appears corrupted.", 400);
  }

  // 2. Extract text
  let resumeText;
  try {
    resumeText = await extractResumeText(req.file.path);
  } catch (error) {
    await fs.unlink(req.file.path).catch(() => {});
    if (error instanceof AppError) throw error;
    throw new AppError("Could not extract text from resume.", 400);
  }

  // 3. ATS scoring
  let atsScore;
  try {
    atsScore = scoreResumeForRole({ resumeText });
  } catch (error) {
    await fs.unlink(req.file.path).catch(() => {});
    throw new AppError("Resume parsed but ATS analysis failed.", 500);
  }

  // 4. Enhanced analysis
  const sections = detectSections(resumeText);
  const atsAnalysis = computeATSAnalysis(resumeText, atsScore, sections);
  const resumeStats = computeResumeStats(resumeText, atsScore.skillsDetected || []);

  // 5. AI Suggestions (async, non-blocking if it fails)
  const aiSuggestions = await generateAISuggestions(resumeText, atsScore, sections);

  // 6. Database operations (only run if we have a valid ObjectId user ID)
  let version = 1;
  let resumeName = "My Resume";
  let fileUrl = "";
  let savedResume = null;

  const baseName = path.basename(req.file.originalname, path.extname(req.file.originalname));
  resumeName = baseName.replace(/[_-]+/g, " ").replace(/\s+/g, " ").trim() || "My Resume";
  fileUrl = `/api/resume/files/${req.file.filename}`;

  const hasValidUserId = req.user?.id && mongoose.Types.ObjectId.isValid(req.user.id);

  if (hasValidUserId) {
    try {
      // Determine version number for this user
      const existingCount = await Resume.countDocuments({
        user: req.user.id,
        deletedAt: null,
      });
      version = existingCount + 1;

      // Deactivate all previous versions
      await Resume.updateMany(
        { user: req.user.id, deletedAt: null },
        { $set: { isActive: false } }
      );

      // Save to Resume collection
      savedResume = await Resume.create({
        user: req.user.id,
        resumeName,
        version,
        isActive: true,
        fileName: req.file.originalname,
        fileSize: req.file.size,
        fileUrl,
        extractedText: resumeText,
        atsScore,
        atsAnalysis,
        sectionsFound: sections,
        aiSuggestions,
        resumeStats,
      });
    } catch (error) {
      logger.warn({ err: error }, "Failed to save Resume document");
    }
  }

  // 11. Persist legacy AtsReport (backward compat)
  await persistAtsReport({
    userId: req.user.id,
    role: "",
    resumeText,
    atsScore,
  }).catch(() => {});

  // NOTE: file is NOT deleted — kept for download

  res.status(200).json({
    success: true,
    resumeText,
    atsScore,
    atsAnalysis,
    sectionsFound: sections,
    aiSuggestions,
    resumeStats,
    resumeId: savedResume?._id || null,
    version,
    resumeName,
    fileUrl,
  });
});

// ─── Score resume (legacy endpoint, unchanged) ─────────────────────────────────
const scoreResume = asyncHandler(async (req, res) => {
  const resumeText = String(req.body.resumeText || "").trim();
  const role = String(req.body.role || "").trim();

  const atsScore = scoreResumeForRole({ resumeText, role });
  await persistAtsReport({
    userId: req.user.id,
    role,
    resumeText,
    atsScore,
  });

  res.json({ success: true, atsScore });
});

// ─── Get active resume ────────────────────────────────────────────────────────
const getActiveResume = asyncHandler(async (req, res) => {
  const resume = await Resume.findOne({ user: req.user.id, isActive: true, deletedAt: null });
  res.json({
    success: true,
    resume,
  });
});

// ─── Get resume history (paginated) ───────────────────────────────────────────
const getResumeHistory = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(20, parseInt(req.query.limit, 10) || 10);
  const skip = (page - 1) * limit;

  const filter = { user: req.user.id, deletedAt: null };

  const [resumes, total] = await Promise.all([
    Resume.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select("-extractedText") // exclude large text field for list view
      .lean(),
    Resume.countDocuments(filter),
  ]);

  res.json({
    success: true,
    resumes,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1,
    },
  });
});

// ─── Restore a resume version ──────────────────────────────────────────────────
const restoreResume = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError("Invalid resume ID.", 400);
  }

  const resume = await Resume.findOne({ _id: id, user: req.user.id, deletedAt: null });
  if (!resume) {
    throw new AppError("Resume not found.", 404);
  }

  // Deactivate all, then activate this one
  await Resume.updateMany(
    { user: req.user.id, deletedAt: null },
    { $set: { isActive: false } }
  );
  resume.isActive = true;
  await resume.save();

  // Update localStorage hint on the client side — send back the resume data needed
  res.json({
    success: true,
    message: `Resume v${resume.version} restored as active.`,
    resumeId: resume._id,
    version: resume.version,
    resumeText: resume.extractedText,
    atsScore: resume.atsScore,
    atsAnalysis: resume.atsAnalysis,
    sectionsFound: resume.sectionsFound,
    aiSuggestions: resume.aiSuggestions,
    resumeStats: resume.resumeStats,
  });
});

// ─── Soft-delete a resume version ─────────────────────────────────────────────
const deleteResume = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError("Invalid resume ID.", 400);
  }

  const resume = await Resume.findOne({ _id: id, user: req.user.id, deletedAt: null });
  if (!resume) {
    throw new AppError("Resume not found.", 404);
  }

  // If this was the active resume, activate the latest remaining one
  const wasActive = resume.isActive;
  resume.deletedAt = new Date();
  resume.isActive = false;
  await resume.save();

  if (wasActive) {
    const next = await Resume.findOne({ user: req.user.id, deletedAt: null }).sort({ createdAt: -1 });
    if (next) {
      next.isActive = true;
      await next.save();
    }
  }

  // Also try to delete the physical file (best effort)
  if (resume.fileUrl) {
    const filename = path.basename(resume.fileUrl);
    const uploadsDir = require("../utils/uploadsDir");
    const filePath = path.join(uploadsDir, filename);
    await fs.unlink(filePath).catch(() => {});
  }

  res.json({ success: true, message: "Resume deleted." });
});

module.exports = {
  uploadResume,
  scoreResume,
  getActiveResume,
  getResumeHistory,
  restoreResume,
  deleteResume,
};
