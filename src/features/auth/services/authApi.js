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
  const response = await instance.get("https://proxmox-portal-backend-production.up.railway.app/hello", {
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
 
export const getProfile = async () => {
  const token = localStorage.getItem("token");
  const response = await instance.get("/profile", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data; // { username, email }
};

export const updateProfile = async (username, email) => {
  const token = localStorage.getItem("token");
  const response = await instance.put(
    "/profile",
    { username, email },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
};
export const changePassword = async (currentPassword, newPassword) => {
  const token = localStorage.getItem("token");
  const response = await instance.put(
    "/profile/password",
    { currentPassword, newPassword },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data.message;
};
export const getRole = () => localStorage.getItem("role");
export const isAdmin = () => getRole() === "ADMIN";
