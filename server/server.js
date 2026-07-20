const fs = require("fs");
const path = require("path");
const { assertRuntimeConfig } = require("./config/env");

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const resumeRoutes = require("./routes/resumeRoutes");
const builderRoutes = require("./routes/builderRoutes");
const interviewRoutes = require("./routes/interviewRoutes");
const evaluationRoutes = require("./routes/evaluationRoutes");
const historyRoutes = require("./routes/historyRoutes");
const adminRoutes = require("./routes/adminRoutes");
const sanitizeRequest = require("./middleware/sanitizeMiddleware");
const { errorHandler, notFound } = require("./middleware/errorMiddleware");
const logger = require("./utils/logger");

const PORT = process.env.PORT || 5001;
const clientDistPath = path.resolve(__dirname, "..", "dist");
const app = express();
if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", true);
}
const allowedOrigins = (
  process.env.NODE_ENV === "production"
    ? (process.env.CLIENT_URL || process.env.FRONTEND_URL || "").split(",")
    : [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
      ]
)
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);
app.use(
  cors((req, cb) => {
    const origin = req.header("Origin");
    const host = req.header("Host");

    let isAllowed =
      !origin || process.env.NODE_ENV !== "production" || allowedOrigins.includes(origin);

    if (!isAllowed && origin && host) {
      const originHost = origin.replace(/^https?:\/\//, "");
      if (originHost === host) {
        isAllowed = true;
      }
    }

    if (isAllowed) {
      cb(null, { origin: true, credentials: true });
    } else {
      cb(new Error("Not allowed by CORS"));
    }
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use(cookieParser());
app.use(sanitizeRequest);
app.use((req, res, next) => {
  req.log = logger.child({ requestId: req.headers["x-request-id"] });
  next();
});

app.use(
  "/api/",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

app.use(
  "/api/auth/login",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      message: "Too many login attempts. Try again in 15 minutes.",
    },
  })
);

app.use("/api/auth", authRoutes);
app.use("/api/resume", resumeRoutes);
app.use("/api/resume-builder", builderRoutes);
app.use("/api/interview", interviewRoutes);
app.use("/api/interviews", historyRoutes);
app.use("/api/evaluation", evaluationRoutes);
app.use("/api/history", historyRoutes);
app.use("/api/admin", adminRoutes);

app.get("/api/health", (req, res) =>
  res.json({ success: true, message: "AI Career Platform API Running" })
);

app.get("/", (req, res) =>
  res.json({ success: true, message: "AI Career Platform API Running" })
);

if (process.env.NODE_ENV === "production" && fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath, { index: false, maxAge: "1d" }));
  app.get(/^\/(?!api(?:\/|$)).*/, (req, res) => {
    res.sendFile(path.join(clientDistPath, "index.html"));
  });
}

app.use(notFound);
app.use(errorHandler);

const startServer = async () => {
  try {
    assertRuntimeConfig();
    await connectDB();
    app.listen(PORT, () => logger.info(`Server running on port ${PORT}`));
  } catch (error) {
    logger.error({ err: error }, "Failed to start server");
    process.exit(1);
  }
};

if (require.main === module) {
  startServer();
}

module.exports = { app, startServer };

