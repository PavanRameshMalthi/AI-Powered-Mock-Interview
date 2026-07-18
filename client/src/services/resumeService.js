import api from "./api";

const uploadResume = async (formData, onProgress) => {
  const response = await api.post("/resume/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress: onProgress,
    timeout: 120000, // 2 min for large files + Gemini call
  });
  return response.data;
};

const scoreResume = async ({ resumeText, role }) => {
  const response = await api.post("/resume/ats-score", { resumeText, role });
  return response.data;
};

const getActiveResume = async () => {
  const response = await api.get("/resume/active");
  return response.data;
};

const getResumeHistory = async (page = 1, limit = 10) => {
  const response = await api.get("/resume/history", { params: { page, limit } });
  return response.data;
};

const restoreResume = async (id) => {
  const response = await api.patch(`/resume/${id}/restore`);
  return response.data;
};

const deleteResume = async (id) => {
  const response = await api.delete(`/resume/${id}`);
  return response.data;
};

export default {
  uploadResume,
  scoreResume,
  getActiveResume,
  getResumeHistory,
  restoreResume,
  deleteResume,
};
