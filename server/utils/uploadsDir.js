const path = require("path");
const os = require("os");
const fs = require("fs");

const uploadsDir = process.env.UPLOADS_DIR || path.join(os.tmpdir(), "ai-mock-interview-uploads");

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

module.exports = uploadsDir;
