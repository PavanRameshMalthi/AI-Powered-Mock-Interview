const mongoose = require("mongoose");
const logger = require("../utils/logger");

const connectDB = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is not configured");
  }

  const conn = await mongoose.connect(process.env.MONGO_URI);
  logger.info(`MongoDB connected: ${conn.connection.host}`);
};

mongoose.connection.on("error", (err) => {
  logger.error({ err }, "MongoDB error");
});

module.exports = connectDB;
