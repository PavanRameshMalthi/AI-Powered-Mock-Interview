const fs = require("fs");
const multer = require("multer");
const path = require("path");

const uploadDir = path.join(__dirname, "..", "uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(
      Math.random() * 1e9
    )}${path.extname(file.originalname).toLowerCase()}`;

    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 1,
  },
  fileFilter: (req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();
    const isPdf = file.mimetype === "application/pdf" && extension === ".pdf";
    const isDocx =
      file.mimetype ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document" &&
      extension === ".docx";

    if (!isPdf && !isDocx) {
      return cb(new Error("Only PDF and DOCX files are supported."));
    }

    cb(null, true);
  },
});

module.exports = upload;
