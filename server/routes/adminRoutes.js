const express = require("express");
const { param } = require("express-validator");
const authMiddleware = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");
const {
  requireAdmin,
  getAdminSummary,
  deleteUser,
  exportReports,
} = require("../controllers/adminController");

const router = express.Router();

router.use(authMiddleware, requireAdmin);

router.get("/summary", getAdminSummary);
router.get("/export", exportReports);
router.delete(
  "/users/:userId",
  param("userId").isMongoId().withMessage("Valid user id is required"),
  validate,
  deleteUser
);

module.exports = router;
