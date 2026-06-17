const fs = require("fs/promises");
const extractResumeText = require("../utils/resumeParser");
const { scoreResumeForRole } = require("../utils/atsScorer");

const uploadResume = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: "Please upload a PDF resume",
    });
  }

  try {
    const resumeText = await extractResumeText(req.file.path);

    await fs.unlink(req.file.path).catch(() => {});

    res.status(200).json({
      success: true,
      resumeText,
      atsScore: scoreResumeForRole({ resumeText }),
    });
  } catch {
    await fs.unlink(req.file.path).catch(() => {});

    res.status(422).json({
      success: false,
      message: "Unable to read this PDF. Please upload a text-based resume.",
    });
  }
};

module.exports = {
  uploadResume,
  scoreResume: (req, res) => {
    const resumeText = String(req.body.resumeText || "").trim();
    const role = String(req.body.role || "").trim();

    if (!resumeText) {
      return res.status(400).json({
        success: false,
        message: "Resume text is required for ATS scoring",
      });
    }

    res.json({
      success: true,
      atsScore: scoreResumeForRole({ resumeText, role }),
    });
  },
};
