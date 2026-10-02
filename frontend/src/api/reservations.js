import apiClient from "./client";

export const createReservationApi = (bookId) => apiClient.post("/reservations", { book_id: bookId });
export const getMyReservationsApi = () => apiClient.get("/my-reservations");
export const cancelReservationApi = (id) => apiClient.put(`/reservations/${id}/cancel`);
export const getReservationsApi = (params) => apiClient.get("/reservations", { params });
