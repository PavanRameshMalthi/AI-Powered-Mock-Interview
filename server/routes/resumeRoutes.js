const express = require("express");
const router = express.Router();

const upload = require("../middleware/uploadMiddleware");
const authMiddleware = require("../middleware/authMiddleware");

const {
  uploadResume,
  scoreResume,
} = require("../controllers/resumeController");

router.post(
  "/upload",
  authMiddleware,
  upload.single("resume"),
  uploadResume
);

router.post(
  "/ats-score",
  authMiddleware,
  scoreResume
);

module.exports = router;
