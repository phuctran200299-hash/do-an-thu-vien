import apiClient from "./client";

export const getStatisticsApi = (params) => apiClient.get("/admin/statistics", { params });

export const getAdminReviewsApi = (params) => apiClient.get("/admin/reviews", { params });
export const adminDeleteReviewApi = (id) => apiClient.delete(`/admin/reviews/${id}`);

export const searchStaffUsersApi = (params) => apiClient.get("/staff/users", { params });
export const getUserBorrowHistoryApi = (userId) => apiClient.get(`/staff/users/${userId}/borrow-history`);
