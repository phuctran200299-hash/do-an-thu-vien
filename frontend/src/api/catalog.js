import apiClient from "./client";

// Tác giả
export const getAuthorsApi = (params) => apiClient.get("/authors", { params });
export const createAuthorApi = (data) => apiClient.post("/authors", data);
export const updateAuthorApi = (id, data) => apiClient.put(`/authors/${id}`, data);
export const deleteAuthorApi = (id) => apiClient.delete(`/authors/${id}`);

// Thể loại
export const getCategoriesApi = () => apiClient.get("/categories");
export const createCategoryApi = (data) => apiClient.post("/categories", data);
export const updateCategoryApi = (id, data) => apiClient.put(`/categories/${id}`, data);
export const deleteCategoryApi = (id) => apiClient.delete(`/categories/${id}`);
