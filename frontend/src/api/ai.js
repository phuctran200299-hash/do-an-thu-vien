import apiClient from "./client";

export const aiSearchApi = (query) => apiClient.post("/ai/search", { query });
export const aiRecommendationsApi = () => apiClient.get("/ai/recommendations");
export const aiSimilarApi = (bookId) => apiClient.get(`/books/${bookId}/similar`);
export const aiAdminLogsApi = () => apiClient.get("/admin/ai-logs");
