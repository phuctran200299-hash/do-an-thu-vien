import apiClient from "./client";

export const getFavoritesApi = () => apiClient.get("/favorites");
export const addFavoriteApi = (bookId) => apiClient.post("/favorites", { book_id: bookId });
export const removeFavoriteApi = (bookId) => apiClient.delete(`/favorites/${bookId}`);
