import api from "./api";

const uploadResume = async (formData) => {
  const response = await api.post(
    "/resume/upload",
    formData,
    {
      headers: {
        "Content-Type":
          "multipart/form-data",
      },
    }
  );

  return response.data;
};

const scoreResume = async ({ resumeText, role }) => {
  const response = await api.post("/resume/ats-score", {
    resumeText,
    role,
  });

  return response.data;
};

export default {
  uploadResume,
  scoreResume,
};
