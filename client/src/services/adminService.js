import api from "./api";

const getSummary = async () => {
  const response = await api.get("/admin/summary");
  return response.data;
};

const exportReports = async () => {
  const response = await api.get("/admin/export");
  return response.data;
};

const deleteUser = async (userId) => {
  const response = await api.delete(`/admin/users/${userId}`);
  return response.data;
};

export default {
  getSummary,
  exportReports,
  deleteUser,
};
