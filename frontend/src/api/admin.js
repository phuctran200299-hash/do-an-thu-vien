import apiClient from "./client";

export const getUsersApi = (params) => apiClient.get("/admin/users", { params });
export const createUserApi = (data) => apiClient.post("/admin/users", data);
export const updateUserApi = (id, data) => apiClient.put(`/admin/users/${id}`, data);
export const toggleUserActiveApi = (id) => apiClient.put(`/admin/users/${id}/toggle-active`);
