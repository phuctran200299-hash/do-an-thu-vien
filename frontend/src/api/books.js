import apiClient from "./client";

export const getBooksApi = (params) => apiClient.get("/books", { params });
export const getFeaturedBooksApi = () => apiClient.get("/books/featured");
export const getBookApi = (id) => apiClient.get(`/books/${id}`);
export const createBookApi = (data) => apiClient.post("/books", data);
export const updateBookApi = (id, data) => apiClient.put(`/books/${id}`, data);
export const deleteBookApi = (id) => apiClient.delete(`/books/${id}`);
export const toggleFeaturedApi = (id) => apiClient.put(`/books/${id}/toggle-featured`);
export const updateBookStatusApi = (id, status) => apiClient.put(`/books/${id}/status`, { status });

export const getReviewsApi = (bookId) => apiClient.get(`/books/${bookId}/reviews`);
export const createReviewApi = (bookId, data) => apiClient.post(`/books/${bookId}/reviews`, data);
export const deleteReviewApi = (bookId) => apiClient.delete(`/books/${bookId}/reviews`);
export const getHomeOverviewApi = () => apiClient.get("/home/overview");
