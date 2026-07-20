const mongoose = require("mongoose");
const logger = require("../utils/logger");

const connectDB = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is not configured. Add it to server/.env or your deployment environment.");
  }

  if (mongoose.connection.readyState >= 1) {
    return;
  }

  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: Number(process.env.MONGO_SERVER_SELECTION_TIMEOUT_MS || 5000),
    });
    logger.info(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    throw new Error(`MongoDB connection failed: ${error.message}`);
  }
};

mongoose.connection.on("error", (err) => {
  logger.error({ err }, "MongoDB error");
});

module.exports = connectDB;

