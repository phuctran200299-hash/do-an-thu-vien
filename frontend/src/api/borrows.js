import apiClient from "./client";

// Độc giả
export const createBorrowRequestApi = (bookId) => apiClient.post("/borrow-requests", { book_id: bookId });
export const getMyBorrowsApi = (params) => apiClient.get("/my-borrows", { params });
export const cancelBorrowApi = (id) => apiClient.put(`/borrow-requests/${id}/cancel`);

// Nhân viên / Admin
export const getBorrowRequestsApi = (params) => apiClient.get("/borrow-requests", { params });
export const getOverdueBorrowsApi = (params) => apiClient.get("/borrow-requests/overdue", { params });
export const approveBorrowApi = (id) => apiClient.put(`/borrow-requests/${id}/approve`);
export const rejectBorrowApi = (id) => apiClient.put(`/borrow-requests/${id}/reject`);
export const returnBorrowApi = (id) => apiClient.put(`/borrow-requests/${id}/return`);
