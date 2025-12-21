import axiosClient from "./axiosClient";

/**
 * Notification API service module.
 * Provides notification feed retrieval and read status management.
 */
const notificationApi = {
  /**
   * Retrieve the notification feed for the current user.
   * @returns {Promise<AxiosResponse>} List of notifications
   */
  list: () => axiosClient.get("/me/notifications/feed"),
  
  /**
   * Mark a specific notification as read.
   * @param {number|string} id - Notification ID
   * @returns {Promise<AxiosResponse>} Read status update response
   */
  markRead: (id) => axiosClient.post(`/me/notifications/${id}/read`),
  
  /**
   * Mark all notifications as read for the current user.
   * @returns {Promise<AxiosResponse>} Bulk read update response
   */
  markAllRead: () => axiosClient.post("/me/notifications/read-all")
};

export default notificationApi;
