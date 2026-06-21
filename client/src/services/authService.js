import api from "./api";

const login = async (data) => {
  const response = await api.post(
    "/auth/login",
    data
  );

  return response.data;
};

const register = async (data) => {
  const response = await api.post(
    "/auth/register",
    data
  );

  return response.data;
};

const refreshSession = async (data = {}) => {
  const response = await api.post("/auth/refresh", data);
  return response.data;
};

const logout = async () => {
  const response = await api.post("/auth/logout");
  return response.data;
};

const forgotPassword = async (data) => {
  const response = await api.post("/auth/forgot-password", data);
  return response.data;
};

const resetPassword = async (data) => {
  const response = await api.post("/auth/reset-password", data);
  return response.data;
};

const googleLogin = async (data) => {
  const response = await api.post("/auth/google", data);
  return response.data;
};

const linkedinLogin = async (data) => {
  const response = await api.post("/auth/linkedin", data);
  return response.data;
};

const getOAuthStartUrl = (provider) => {
  const baseUrl = api.defaults?.baseURL || "/api";
  return `${baseUrl.replace(/\/$/, "")}/auth/${provider}/start`;
};

export default {
  login,
  register,
  refreshSession,
  logout,
  forgotPassword,
  resetPassword,
  googleLogin,
  linkedinLogin,
  getOAuthStartUrl,
};
