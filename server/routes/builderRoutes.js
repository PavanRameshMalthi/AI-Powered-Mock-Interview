const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const {
  getResumes,
  getResume,
  createResume,
  updateResume,
  deleteResume,
  duplicateResume,
  setActiveResume,
  getBuilderStats,
} = require("../controllers/builderController");

// Protect all routes with JWT auth
router.use(authMiddleware);

router.get("/stats", getBuilderStats);
router.get("/", getResumes);
router.post("/", createResume);

router.get("/:id", getResume);
router.put("/:id", updateResume);
router.delete("/:id", deleteResume);
router.post("/:id/duplicate", duplicateResume);
router.post("/:id/set-active", setActiveResume);

module.exports = router;
