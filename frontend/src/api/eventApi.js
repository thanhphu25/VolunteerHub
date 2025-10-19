import axiosClient from "./axiosClient";

const eventApi = {
  getAll: (params) => axiosClient.get("/events", { params }),
  getById: (id) => axiosClient.get(`/events/${id}`),
  create: (data) => axiosClient.post("/events", data),
  update: (id, data) => axiosClient.put(`/events/${id}`, data),
  delete: (id) => axiosClient.delete(`/events/${id}`),
  approve: (id) => axiosClient.post(`/events/${id}/approve`),
  reject: (id) => axiosClient.post(`/events/${id}/reject`),
  cancel: (id) => axiosClient.post(`/events/${id}/cancel`),
  getMyEvents: (params) => axiosClient.get("/events/my-events", { params }),
  getByStatus: (status, params) => axiosClient.get("/events", { params: { ...params, status } }),
};

export default eventApi;
