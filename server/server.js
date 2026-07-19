const path = require("path");

require("dotenv").config({ path: path.resolve(__dirname, ".env"), quiet: true });

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

const PORT = process.env.PORT || 5000;
const app = express();
if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", true);
}
const validateRuntimeConfig = () => {
  const warnings = [];

  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    warnings.push("JWT_SECRET is missing or shorter than 32 characters.");
  }

  if (!process.env.GEMINI_API_KEY) {
    warnings.push("GEMINI_API_KEY is missing. AI routes will use local fallbacks.");
  }

  if (process.env.NODE_ENV === "production") {
    const frontendOrigin = process.env.CLIENT_URL || process.env.FRONTEND_URL || "";

    if (!frontendOrigin || frontendOrigin.includes("localhost")) {
      warnings.push("CLIENT_URL or FRONTEND_URL should be set to the deployed frontend origin in production.");
    }

    if (!process.env.SERVER_URL || process.env.SERVER_URL.includes("localhost")) {
      warnings.push("SERVER_URL should be set to the deployed API origin in production.");
    }
  }

  warnings.forEach((warning) => logger.warn(warning));
};

const allowedOrigins = [
  ...(process.env.CLIENT_URL || process.env.FRONTEND_URL || "").split(","),
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
]
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);
app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin || process.env.NODE_ENV !== "production" || allowedOrigins.includes(origin)) {
        return cb(null, true);
      }

      cb(new Error("Not allowed by CORS"));
    },
    credentials: true,
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

app.get("/", (req, res) =>
  res.json({ success: true, message: "AI Career Platform API Running" })
);

app.use(notFound);
app.use(errorHandler);

const startServer = async () => {
  try {
    validateRuntimeConfig();
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
