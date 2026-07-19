const Interview = require("../models/Interview");
const AtsReport = require("../models/AtsReport");
const { asyncHandler, AppError } = require("../middleware/errorMiddleware");

// ── Human-readable label map for raw ATS keyword tokens ──────────────────────
const SKILL_LABEL_MAP = {
  javascript:     "JavaScript Development",
  typescript:     "TypeScript",
  react:          "React Development",
  angular:        "Angular",
  vue:            "Vue.js",
  next:           "Next.js",
  redux:          "State Management (Redux)",
  node:           "Node.js Backend",
  express:        "Express.js",
  mongodb:        "MongoDB",
  sql:            "SQL Database Knowledge",
  postgresql:     "PostgreSQL",
  mysql:          "MySQL",
  redis:          "Redis",
  firebase:       "Firebase",
  html:           "HTML & CSS",
  css:            "HTML & CSS",
  python:         "Python",
  java:           "Java",
  docker:         "Docker",
  kubernetes:     "Kubernetes",
  aws:            "AWS Cloud",
  azure:          "Microsoft Azure",
  gcp:            "Google Cloud Platform",
  git:            "Git & GitHub",
  github:         "Git & GitHub",
  api:            "REST API Development",
  graphql:        "GraphQL",
  testing:        "Testing Frameworks",
  jest:           "Testing Frameworks (Jest)",
  ci:             "CI/CD Pipelines",
  cd:             "CI/CD Pipelines",
  linux:          "Linux / Unix",
  agile:          "Agile / Scrum",
  scrum:          "Agile / Scrum",
  accessibility:  "Web Accessibility (a11y)",
  responsive:     "Responsive Web Design",
  deployment:     "Deployment & DevOps",
  security:       "Security Best Practices",
  authentication: "Authentication & Auth",
  analytics:      "Data Analytics",
  pandas:         "Pandas / Data Science",
  machine:        "Machine Learning",
  vite:           "Vite / Build Tools",
  rest:           "REST API Development",
  database:       "Database Design",
  frontend:       "Frontend Development",
  backend:        "Backend Development",
  fullstack:      "Full Stack Development",
};

const toReadableLabel = (token) =>
  SKILL_LABEL_MAP[String(token).toLowerCase()] ||
  String(token)
    .split(/[_\s-]+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const buildHistoryQuery = (req) => {
  const query = { user: req.user.id };
  const status = String(req.query.status || "active");
  const search = String(req.query.search || "").trim();
  const difficulty = String(req.query.difficulty || "").trim();

  if (status === "deleted") {
    query.deletedAt = { $ne: null };
  } else {
    query.deletedAt = null;
  }

  if (search) {
    query.role = { $regex: escapeRegex(search).slice(0, 80), $options: "i" };
  }

  if (difficulty) {
    query.difficulty = difficulty;
  }

  return query;
};

const buildHistorySort = (req) => {
  const sort = String(req.query.sort || "newest");
  if (sort === "oldest") return { createdAt: 1 };
  if (sort === "score-high") return { score: -1, createdAt: -1 };
  if (sort === "score-low") return { score: 1, createdAt: -1 };
  return { createdAt: -1 };
};

const getHistory = asyncHandler(async (req, res) => {
    const interviews = await Interview.find(buildHistoryQuery(req))
      .sort(buildHistorySort(req))
      .limit(50)
      .select("role difficulty score feedback atsScore createdAt deletedAt");

    res.json({
      success: true,
      interviews,
    });
});

const getHistoryItem = asyncHandler(async (req, res) => {
  const interview = await Interview.findOne({
    _id: req.params.interviewId,
    user: req.user.id,
  }).select("role difficulty questions answers score feedback atsScore resumeText createdAt deletedAt");

  if (!interview) {
    throw new AppError("Interview not found", 404);
  }

  res.json({
    success: true,
    interview,
  });
});

const getAnalytics = asyncHandler(async (req, res) => {
  const [interviews, atsReports] = await Promise.all([
    Interview.find({ user: req.user.id, deletedAt: null })
      .sort({ createdAt: 1 })
      .limit(100)
      .select("role difficulty score feedback atsScore createdAt"),
    AtsReport.find({ user: req.user.id })
      .sort({ createdAt: 1 })
      .limit(100)
      .select("role score level matchedKeywords missingKeywords createdAt"),
  ]);

  const totalInterviews = interviews.length;
  const averageScore = totalInterviews
    ? Math.round(
        interviews.reduce((sum, item) => sum + (item.score || 0), 0) /
          totalInterviews
      )
    : 0;

  const firstScore = interviews[0]?.score || 0;
  const latestScore = interviews[interviews.length - 1]?.score || 0;
  const bestScore = interviews.reduce(
    (best, item) => Math.max(best, item.score || 0),
    0
  );
  const improvementPercentage =
    firstScore > 0 ? Math.round(((latestScore - firstScore) / firstScore) * 100) : 0;

  // ── Build keyword frequency maps ─────────────────────────────────────────
  const matchedCounts = new Map();
  const missingCounts = new Map();

  interviews.forEach((item) => {
    (item.atsScore?.matchedKeywords || []).forEach((kw) => {
      matchedCounts.set(kw, (matchedCounts.get(kw) || 0) + 1);
    });
    (item.atsScore?.missingKeywords || []).forEach((kw) => {
      missingCounts.set(kw, (missingCounts.get(kw) || 0) + 1);
    });
  });

  atsReports.forEach((report) => {
    (report.missingKeywords || []).forEach((kw) => {
      missingCounts.set(kw, (missingCounts.get(kw) || 0) + 1);
    });
  });

  // keep keywordCounts alias for skillGrowth below
  const keywordCounts = matchedCounts;

  const monthlyMap = interviews.reduce((map, item) => {
    const key = new Date(item.createdAt).toISOString().slice(0, 7);
    const current = map.get(key) || { month: key, count: 0, totalScore: 0 };
    current.count += 1;
    current.totalScore += item.score || 0;
    map.set(key, current);
    return map;
  }, new Map());

  const monthlyProgress = [...monthlyMap.values()].map((item) => ({
    month: item.month,
    interviews: item.count,
    averageScore: item.count ? Math.round(item.totalScore / item.count) : 0,
  }));

  const weeklyMap = interviews.reduce((map, item) => {
    const date = new Date(item.createdAt);
    const weekStart = new Date(date);
    weekStart.setDate(date.getDate() - date.getDay());
    const key = weekStart.toISOString().slice(0, 10);
    const current = map.get(key) || { week: key, count: 0, totalScore: 0 };
    current.count += 1;
    current.totalScore += item.score || 0;
    map.set(key, current);
    return map;
  }, new Map());

  const roleMap = interviews.reduce((map, item) => {
    const key = item.role || "General";
    const current = map.get(key) || { role: key, count: 0, totalScore: 0, bestScore: 0 };
    current.count += 1;
    current.totalScore += item.score || 0;
    current.bestScore = Math.max(current.bestScore, item.score || 0);
    map.set(key, current);
    return map;
  }, new Map());

  const dayKeys = new Set(
    interviews.map((item) => new Date(item.createdAt).toISOString().slice(0, 10))
  );
  let streak = 0;
  const cursor = new Date();
  while (dayKeys.has(cursor.toISOString().slice(0, 10))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  const skillGrowth = [
    ["React",          "react"],
    ["JavaScript",     "javascript"],
    ["Node.js",        "node"],
    ["Express.js",     "express"],
    ["MongoDB",        "mongodb"],
    ["Communication",  "communication"],
    ["Problem Solving","problemSolving"],
    ["Confidence",     "confidence"],
  ].map(([label, key]) => {
    const feedbackAverage = interviews.length
      ? Math.round(
          interviews.reduce((sum, item) => {
            if (key === "communication") return sum + (item.feedback?.communication || 0);
            if (key === "problemSolving") return sum + (item.feedback?.problemSolving || 0);
            if (key === "confidence") return sum + (item.feedback?.confidence || 0);
            return sum + ((item.atsScore?.matchedKeywords || []).includes(key) ? 100 : 0);
          }, 0) / interviews.length
        )
      : 0;

    return {
      skill: label,
      score: feedbackAverage || Math.min((keywordCounts.get(key) || 0) * 20, 100),
    };
  });

  // ── Skill scores for dashboard panel ─────────────────────────────────────
  const skillScores = [
    { label: "Technical",    key: "technical" },
    { label: "Communication",key: "communication" },
    { label: "Problem Solving", key: "problemSolving" },
    { label: "Confidence",   key: "confidence" },
  ].map(({ label, key }) => {
    const avg = interviews.length
      ? Math.round(
          interviews.reduce((sum, item) => sum + (item[key] || item.score || 0), 0) /
          interviews.length
        )
      : 0;
    return { label, score: avg };
  });



  res.json({
    success: true,
    summary: {
      totalInterviews,
      averageScore,
      bestScore,
      latestScore,
      improvementPercentage,
      interviewStreak: streak,
      totalAtsReports: atsReports.length,
      averageAtsScore: atsReports.length
        ? Math.round(
            atsReports.reduce((sum, item) => sum + (item.score || 0), 0) /
              atsReports.length
          )
        : 0,
    },
    trends: {
      interviewScores: interviews.map((item) => ({
        date: item.createdAt,
        role: item.role,
        score: item.score || 0,
      })),
      atsScores: atsReports.map((item) => ({
        date: item.createdAt,
        role: item.role,
        score: item.score || 0,
      })),
      monthlyProgress,
      weeklyProgress: [...weeklyMap.values()].map((item) => ({
        week: item.week,
        interviews: item.count,
        averageScore: item.count ? Math.round(item.totalScore / item.count) : 0,
      })),
      roleBasedProgress: [...roleMap.values()].map((item) => ({
        role: item.role,
        interviews: item.count,
        averageScore: item.count ? Math.round(item.totalScore / item.count) : 0,
        bestScore: item.bestScore,
      })),
    },
    skillGrowth,
    skillScores,
  });
});

const softDeleteInterview = asyncHandler(async (req, res) => {
  const interview = await Interview.findOneAndUpdate(
    { _id: req.params.interviewId, user: req.user.id, deletedAt: null },
    { deletedAt: new Date() },
    { new: true }
  ).select("role deletedAt");

  if (!interview) {
    throw new AppError("Interview not found", 404);
  }

  res.json({ success: true, message: "Interview moved to deleted history", interview });
});

const bulkDeleteInterviews = asyncHandler(async (req, res) => {
  const ids = Array.isArray(req.body.interviewIds) ? req.body.interviewIds : [];

  if (!ids.length) {
    throw new AppError("Select at least one interview", 400);
  }

  const result = await Interview.updateMany(
    { _id: { $in: ids }, user: req.user.id, deletedAt: null },
    { deletedAt: new Date() }
  );

  res.json({
    success: true,
    message: `${result.modifiedCount || 0} interviews moved to deleted history`,
    deletedCount: result.modifiedCount || 0,
  });
});

const restoreInterview = asyncHandler(async (req, res) => {
  const interview = await Interview.findOneAndUpdate(
    { _id: req.params.interviewId, user: req.user.id, deletedAt: { $ne: null } },
    { deletedAt: null },
    { new: true }
  ).select("role deletedAt");

  if (!interview) {
    throw new AppError("Deleted interview not found", 404);
  }

  res.json({ success: true, message: "Interview restored", interview });
});

module.exports = {
  getHistory,
  getHistoryItem,
  getAnalytics,
  softDeleteInterview,
  bulkDeleteInterviews,
  restoreInterview,
};
