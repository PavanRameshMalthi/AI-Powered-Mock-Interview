import axios from "axios";

const normalizeApiBaseUrl = (value) => {
  const baseUrl = (value || "/api").replace(/\/+$/, "");
  return baseUrl.endsWith("/api") ? baseUrl : `${baseUrl}/api`;
};

const api = axios.create({
  baseURL: normalizeApiBaseUrl(import.meta.env.VITE_API_URL),
  timeout: 30000,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token") || sessionStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config || {};

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/auth/refresh") &&
      !originalRequest.url?.includes("/auth/login")
    ) {
      originalRequest._retry = true;

      try {
        const storage = localStorage.getItem("user") ? localStorage : sessionStorage;
        const refreshResponse = await api.post("/auth/refresh", {
          rememberMe: storage === localStorage,
        });
        storage.setItem("token", refreshResponse.data.token);
        storage.setItem("user", JSON.stringify(refreshResponse.data.user));
        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization = `Bearer ${refreshResponse.data.token}`;
        return api(originalRequest);
      } catch {
        // Fall through to clear stale local auth state.
      }
    }

    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("user");
    }

    return Promise.reject(error);
  }
);

export default api;
