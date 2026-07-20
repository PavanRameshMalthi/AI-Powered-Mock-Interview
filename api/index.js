const connectDB = require("../server/config/db");
const { app } = require("../server/server");

let isConnected = false;

module.exports = async (req, res) => {
  if (req.url && !req.url.startsWith("/api")) {
    req.url = `/api${req.url === "/" ? "" : req.url}`;
  }

  if (!isConnected) {
    await connectDB();
    isConnected = true;
  }
  return app(req, res);
};
