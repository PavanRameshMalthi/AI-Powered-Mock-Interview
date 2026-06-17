const Interview = require("../models/Interview");

const getHistory = async (req, res) => {
  try {
    const interviews = await Interview.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .limit(25)
      .select("role difficulty score feedback atsScore createdAt");

    res.json({
      success: true,
      interviews,
    });
  } catch {
    res.status(500).json({
      success: false,
      message: "Failed to load interview history",
    });
  }
};

module.exports = {
  getHistory,
};
