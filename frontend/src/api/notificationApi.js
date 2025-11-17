// src/api/notificationApi.js
import axiosClient from "./axiosClient";

const notificationApi = {
  list: () => axiosClient.get("/me/notifications/feed"),
  markRead: (id) => axiosClient.post(`/me/notifications/${id}/read`),
  markAllRead: () => axiosClient.post("/me/notifications/read-all")
};

export default notificationApi;
