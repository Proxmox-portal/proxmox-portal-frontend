import { instance } from "../../../api/axiosClient";

export const register = async (username, email, password) => {
  const response = await instance.post("/register", { username, email, password });
  return response.data;
};

export const login = async (email, password) => {
  const response = await instance.post("/login", { email, password });
  return response.data; // { accessToken, refreshToken }
};

export const getUserProfile = async () => {
  const token = localStorage.getItem("token");
  const response = await instance.get("http://localhost:8080/hello", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const forgotPassword = async (email) => {
  const response = await instance.post("/forgot-password", { email });
  return response.data.message;
};

export const resetPassword = async (token, newPassword) => {
  const response = await instance.post("/reset-password", { token, newPassword });
  return response.data.message;
};

export const logout = async () => {
  const refreshToken = localStorage.getItem("refreshToken");
  if (refreshToken) {
    await instance.post("/logout", { refreshToken });
  }
  localStorage.removeItem("token");
  localStorage.removeItem("refreshToken");
};
