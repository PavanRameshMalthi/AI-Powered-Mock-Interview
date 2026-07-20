const { GoogleGenerativeAI } = require("@google/generative-ai");
let model = null;

if (process.env.GEMINI_API_KEY) {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  model = genAI.getGenerativeModel({
    model: process.env.GEMINI_MODEL || "gemini-2.0-flash",
  });
}

module.exports = {
  generateContent: async (prompt) => {
    if (!model) {
      throw new Error("Gemini API is not configured");
    }

    return model.generateContent(prompt);
  },
};

