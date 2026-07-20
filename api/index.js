const connectDB = require("../server/config/db");
const { assertRuntimeConfig } = require("../server/config/env");
const { app } = require("../server/server");

let isConnected = false;
let isConfigChecked = false;

module.exports = async (req, res) => {
  try {
    if (!isConfigChecked) {
      assertRuntimeConfig();
      isConfigChecked = true;
    }

    if (req.url && !req.url.startsWith("/api")) {
      req.url = `/api${req.url === "/" ? "" : req.url}`;
    }

    if (!isConnected) {
      await connectDB();
      isConnected = true;
    }

    return app(req, res);
  } catch (error) {
    console.error("Serverless API startup failed", error);

    if (!res.headersSent) {
      return res.status(500).json({
        success: false,
        message:
          process.env.NODE_ENV === "production"
            ? "API is not configured correctly"
            : error.message,
      });
    }

    throw error;
  }
};
