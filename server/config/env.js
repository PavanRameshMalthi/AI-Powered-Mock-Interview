const path = require("path");
const dotenv = require("dotenv");

const rootEnvPath = path.resolve(__dirname, "..", "..", ".env");
const serverEnvPath = path.resolve(__dirname, "..", ".env");

dotenv.config({ path: rootEnvPath, quiet: true });
dotenv.config({ path: serverEnvPath, override: true, quiet: true });

const isProduction = process.env.NODE_ENV === "production";

const applyDefault = (key, value) => {
  if (!process.env[key]) {
    process.env[key] = value;
  }
};

if (!isProduction) {
  applyDefault("NODE_ENV", "development");
  applyDefault("PORT", "5001");
  applyDefault("MONGO_URI", "mongodb://127.0.0.1:27017/ai_mock_interview");
  applyDefault("JWT_SECRET", "local-development-jwt-secret-change-me-32chars");
  applyDefault("CLIENT_URL", "http://localhost:5173");
  applyDefault("FRONTEND_URL", process.env.CLIENT_URL);
  applyDefault("SERVER_URL", `http://127.0.0.1:${process.env.PORT}`);
  applyDefault("ACCESS_TOKEN_TTL", "15m");
  applyDefault("REFRESH_TOKEN_TTL_DAYS", "7");
}

applyDefault("GEMINI_MODEL", "gemini-2.0-flash");

const getRuntimeIssues = () => {
  const issues = [];

  if (!process.env.MONGO_URI) {
    issues.push("MONGO_URI is required. Set it in server/.env or the deployment environment.");
  }

  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    issues.push("JWT_SECRET must be at least 32 characters.");
  }

  if (isProduction) {
    const frontendOrigin = process.env.CLIENT_URL || process.env.FRONTEND_URL || "";
    if (!frontendOrigin || frontendOrigin.includes("localhost") || frontendOrigin.includes("127.0.0.1")) {
      issues.push("CLIENT_URL or FRONTEND_URL must be the deployed frontend origin in production.");
    }
  }

  return issues;
};

const assertRuntimeConfig = () => {
  const issues = getRuntimeIssues();
  if (issues.length) {
    throw new Error(`Invalid runtime configuration: ${issues.join(" ")}`);
  }
};

module.exports = {
  assertRuntimeConfig,
  getRuntimeIssues,
  isProduction,
};
