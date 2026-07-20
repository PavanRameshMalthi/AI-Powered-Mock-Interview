import api from "./api";

const login = async (data) => {
  const response = await api.post(
    "/api/auth/login",
    data
  );

  return response.data;
};

const register = async (data) => {
  const response = await api.post(
    "/api/auth/register",
    data
  );

  return response.data;
};

const refreshSession = async (data = {}) => {
  const response = await api.post("/api/auth/refresh", data);
  return response.data;
};

const logout = async () => {
  const response = await api.post("/api/auth/logout");
  return response.data;
};

const forgotPassword = async (data) => {
  const response = await api.post("/api/auth/forgot-password", data);
  return response.data;
};

const resetPassword = async (data) => {
  const response = await api.post("/api/auth/reset-password", data);
  return response.data;
};

export default {
  login,
  register,
  refreshSession,
  logout,
  forgotPassword,
  resetPassword,
};
