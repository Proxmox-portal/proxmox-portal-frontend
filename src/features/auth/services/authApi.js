import { instance } from "../../../api/axiosClient";

export const register = async (username, email, password) => {
  const response = await instance.post("/auth/register", { username, email, password });
  return response.data;
};

export const login = async (email, password) => {
  const response = await instance.post("/auth/login", { email, password });
  return response.data; // { accessToken, refreshToken }
};

export const getUserProfile = async () => {
  const response = await instance.get("/auth/hello");
  return response.data;
};

export const forgotPassword = async (email) => {
  const response = await instance.post("/auth/forgot-password", { email });
  return response.data.message;
};

export const resetPassword = async (token, newPassword) => {
  const response = await instance.post("/auth/reset-password", { token, newPassword });
  return response.data.message;
};

export const logout = async () => {
  const refreshToken = localStorage.getItem("refreshToken");
  if (refreshToken) {
    await instance.post("/auth/logout", { refreshToken });
  }
  localStorage.removeItem("token");
  localStorage.removeItem("refreshToken");
};
