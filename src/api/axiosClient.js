import axios from "axios";

export const instance = axios.create({
  baseURL: "http://localhost:8080/api/auth",
  headers: { "Content-Type": "application/json" },
});

// Intercepteur de réponse : gestion automatique du refresh token
instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Si 401 et pas déjà une tentative de retry
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) {
        _clearSessionAndRedirect();
        return Promise.reject(error);
      }

      try {
        const res = await axios.post("http://localhost:8080/api/auth/refresh", {
          refreshToken,
        });
        const { accessToken, refreshToken: newRefresh } = res.data;

        localStorage.setItem("token", accessToken);
        localStorage.setItem("refreshToken", newRefresh);

        // Relance la requête initiale avec le nouveau token
        originalRequest.headers["Authorization"] = `Bearer ${accessToken}`;
        return instance(originalRequest);
      } catch {
        _clearSessionAndRedirect();
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

function _clearSessionAndRedirect() {
  localStorage.removeItem("token");
  localStorage.removeItem("refreshToken");
  window.location.href = "/login";
}
