import apiClient from "./client";

export const getPaymentsApi = (params) => apiClient.get("/payments", { params });
export const payBorrowApi = (borrowRecordId) => apiClient.put(`/borrow-requests/${borrowRecordId}/pay`);
export const renewBorrowApi = (borrowRecordId) => apiClient.put(`/borrow-requests/${borrowRecordId}/renew`);

export const getFinesApi = (params) => apiClient.get("/fines", { params });
export const markFinePaidApi = (fineId) => apiClient.put(`/fines/${fineId}/mark-paid`);
