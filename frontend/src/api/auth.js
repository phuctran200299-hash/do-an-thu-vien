import apiClient from "./client";

export const registerApi = (data) => apiClient.post("/register", data);
export const loginApi = (data) => apiClient.post("/login", data);
export const logoutApi = () => apiClient.post("/logout");
export const meApi = () => apiClient.get("/me");
export const updateProfileApi = (data) => apiClient.put("/me", data);
export const changePasswordApi = (data) => apiClient.put("/me/password", data);
