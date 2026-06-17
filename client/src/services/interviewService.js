import api from "./api";

const generateQuestions = async (
  interviewData
) => {
  try {
    const response = await api.post(
      "/interview/generate",
      interviewData
    );

    return response.data;
  } catch (error) {
    if (error.response?.status !== 404) {
      throw error;
    }

    const response = await api.post(
      "/interview/generate-questions",
      interviewData
    );

    return response.data;
  }
};

export default {
  generateQuestions,
};
