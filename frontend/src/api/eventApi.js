import axiosClient from "./axiosClient";

const eventApi = {
  getAll: () => axiosClient.get("/events"),
  getById: (id) => axiosClient.get(`/events/${id}`),
  create: (data) => axiosClient.post("/events", data),
  update: (id, data) => axiosClient.put(`/events/${id}`, data),
  delete: (id) => axiosClient.delete(`/events/${id}`),
};

export default eventApi;
