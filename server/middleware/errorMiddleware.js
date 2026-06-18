const logger = require("../utils/logger");

class AppError extends Error {
  constructor(message, statusCode = 500, details = undefined) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = true;
  }
}

const asyncHandler = (handler) => (req, res, next) =>
  Promise.resolve(handler(req, res, next)).catch(next);

const notFound = (req, res) =>
  res.status(404).json({
    success: false,
    message: "Route not found",
  });

const errorHandler = (error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  const statusCode =
    error.statusCode ||
    (error.code === 11000 ? 409 : undefined) ||
    (error.name === "MulterError" || error.name === "ValidationError" ? 400 : undefined) ||
    (error.message === "Only PDF resumes are allowed" ? 400 : 500);

  if (statusCode >= 500) {
    logger.error(
      {
        err: error,
        method: req.method,
        path: req.originalUrl,
      },
      "Request failed"
    );
  }

  res.status(statusCode).json({
    success: false,
    message:
      error.code === 11000
        ? "Duplicate record already exists"
        :
      error.name === "MulterError" && error.code === "LIMIT_FILE_SIZE"
        ? "Resume must be smaller than 5 MB"
        :
      statusCode >= 500 && process.env.NODE_ENV === "production"
        ? "Something went wrong"
        : error.message || "Something went wrong",
    errors: error.details,
  });
};

module.exports = {
  AppError,
  asyncHandler,
  notFound,
  errorHandler,
};
