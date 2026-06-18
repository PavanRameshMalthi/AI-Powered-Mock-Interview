const User = require("../models/User");
const Interview = require("../models/Interview");
const AtsReport = require("../models/AtsReport");
const { asyncHandler, AppError } = require("../middleware/errorMiddleware");

const requireAdmin = (req, res, next) => {
  if (req.user?.role !== "admin") {
    return next(new AppError("Admin access required", 403));
  }

  next();
};

const getAdminSummary = asyncHandler(async (req, res) => {
  const [totalUsers, totalInterviews, totalAtsReports, users, recentInterviews] =
    await Promise.all([
      User.countDocuments(),
      Interview.countDocuments(),
      AtsReport.countDocuments(),
      User.find()
        .sort({ createdAt: -1 })
        .limit(25)
        .select("name email phone authProvider role isEmailVerified isPhoneVerified createdAt"),
      Interview.find()
        .sort({ createdAt: -1 })
        .limit(25)
        .populate("user", "name email")
        .select("user role difficulty score createdAt"),
    ]);

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const activeUsers = await Interview.distinct("user", {
    createdAt: { $gte: sevenDaysAgo },
  });

  res.json({
    success: true,
    summary: {
      totalUsers,
      totalInterviews,
      totalAtsReports,
      activeUsers: activeUsers.length,
    },
    users,
    recentInterviews,
  });
});

const deleteUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (userId === req.user.id) {
    throw new AppError("Admins cannot delete their own account", 400);
  }

  const user = await User.findByIdAndDelete(userId);
  if (!user) {
    throw new AppError("User not found", 404);
  }

  await Promise.all([
    Interview.deleteMany({ user: userId }),
    AtsReport.deleteMany({ user: userId }),
  ]);

  res.json({ success: true, message: "User and related reports deleted" });
});

const exportReports = asyncHandler(async (req, res) => {
  const [interviews, atsReports] = await Promise.all([
    Interview.find()
      .sort({ createdAt: -1 })
      .limit(500)
      .populate("user", "name email")
      .select("user role difficulty score feedback atsScore createdAt"),
    AtsReport.find()
      .sort({ createdAt: -1 })
      .limit(500)
      .populate("user", "name email")
      .select("user role score level matchedKeywords missingKeywords createdAt"),
  ]);

  res.json({
    success: true,
    generatedAt: new Date().toISOString(),
    interviews,
    atsReports,
  });
});

module.exports = {
  requireAdmin,
  getAdminSummary,
  deleteUser,
  exportReports,
};
