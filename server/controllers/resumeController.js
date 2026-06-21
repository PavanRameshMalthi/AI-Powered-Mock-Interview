const fs = require("fs/promises");
const mongoose = require("mongoose");
const path = require("path");
const extractResumeText = require("../utils/resumeParser");
const { scoreResumeForRole } = require("../utils/atsScorer");
const AtsReport = require("../models/AtsReport");
const { asyncHandler, AppError } = require("../middleware/errorMiddleware");
const logger = require("../utils/logger");

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

const uploadResume = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new AppError("Please upload a PDF or DOCX resume", 400);
  }

  if (req.file.size === 0) {
    throw new AppError("No readable text found in resume.", 422);
  }

  // Debug logging: PDF uploaded successfully & buffer received correctly
  console.log("File Name:", req.file?.originalname);
  console.log("File Size:", req.file?.size);

  try {
    await validateResumeFile(req.file.path);
  } catch (error) {
    await fs.unlink(req.file.path).catch(() => {});
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError("Resume file appears corrupted.", 400);
  }

  let resumeText;
  try {
    resumeText = await extractResumeText(req.file.path);
  } catch (error) {
    await fs.unlink(req.file.path).catch(() => {});
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError("Resume file appears corrupted.", 400);
  }

  // Debug logging: Text extracted successfully
  console.log("Extracted Text Length:", resumeText?.length);
  console.log("Text Preview:", resumeText?.substring(0, 300));

  let atsScore;
  try {
    // Debug logging: ATS analysis starts
    console.log("ATS analysis starts");
    atsScore = scoreResumeForRole({ resumeText });
  } catch (error) {
    await fs.unlink(req.file.path).catch(() => {});
    throw new AppError("Resume parsed successfully but ATS analysis failed.", 500);
  }

  try {
    await persistAtsReport({
      userId: req.user.id,
      role: "",
      resumeText,
      atsScore,
    });
  } catch (error) {
    logger.warn({ err: error }, "ATS report persistence failed");
  }

  await fs.unlink(req.file.path).catch(() => {});

  res.status(200).json({
    success: true,
    resumeText,
    atsScore,
  });
});

module.exports = {
  uploadResume,
  scoreResume: asyncHandler(async (req, res) => {
    const resumeText = String(req.body.resumeText || "").trim();
    const role = String(req.body.role || "").trim();

    const atsScore = scoreResumeForRole({ resumeText, role });
    await persistAtsReport({
      userId: req.user.id,
      role,
      resumeText,
      atsScore,
    });

    res.json({
      success: true,
      atsScore,
    });
  }),
};
