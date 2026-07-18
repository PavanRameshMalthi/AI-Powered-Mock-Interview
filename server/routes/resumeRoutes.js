const express = require("express");
const path = require("path");
const router = express.Router();

const upload = require("../middleware/uploadMiddleware");
const authMiddleware = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");
const { atsScoreRules } = require("../validators/resumeValidators");

const {
  uploadResume,
  scoreResume,
  getResumeHistory,
  getActiveResume,
  restoreResume,
  deleteResume,
} = require("../controllers/resumeController");

// ── Serve uploaded resume files statically ─────────────────────────────────────
const uploadsDir = path.join(__dirname, "..", "uploads");
router.use("/files", express.static(uploadsDir, {
  dotfiles: "deny",
  // Allow only PDF and DOCX
  setHeaders: (res, filePath) => {
    if (filePath.endsWith(".pdf")) {
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", "inline");
    } else if (filePath.endsWith(".docx")) {
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      );
      res.setHeader("Content-Disposition", "attachment");
    }
  },
}));

// ── Resume upload ──────────────────────────────────────────────────────────────
router.post("/upload", authMiddleware, upload.single("resume"), uploadResume);

// ── Legacy ATS score endpoint ──────────────────────────────────────────────────
router.post("/ats-score", authMiddleware, atsScoreRules, validate, scoreResume);

// ── Active Resume ──────────────────────────────────────────────────────────────
router.get("/active", authMiddleware, getActiveResume);

// ── Resume History ─────────────────────────────────────────────────────────────
router.get("/history", authMiddleware, getResumeHistory);

// ── Restore a version ──────────────────────────────────────────────────────────
router.patch("/:id/restore", authMiddleware, restoreResume);

// ── Delete a version ───────────────────────────────────────────────────────────
router.delete("/:id", authMiddleware, deleteResume);

module.exports = router;
