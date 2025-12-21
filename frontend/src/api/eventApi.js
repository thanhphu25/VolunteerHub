import axiosClient from "./axiosClient";

/**
 * Event API service module.
 * Provides full CRUD operations, status filtering, and event management.
 */
const eventApi = {
  /**
   * Retrieve all events with optional filters and pagination.
   * @param {object} params - Query parameters
   * @returns {Promise<AxiosResponse>} Paginated list of events
   */
  getAll: (params) => axiosClient.get("/events", { params }),
  
  /**
   * Retrieve a specific event by ID.
   * @param {number|string} id - Event ID
   * @returns {Promise<AxiosResponse>} Event details
   */
  getById: (id) => axiosClient.get(`/events/${id}`),
  
  /**
   * Create a new event.
   * @param {object} data - Event data
   * @returns {Promise<AxiosResponse>} Created event response
   */
  create: (data) => axiosClient.post("/events", data),
  
  /**
   * Update an existing event.
   * @param {number|string} id - Event ID
   * @param {object} data - Updated event data
   * @returns {Promise<AxiosResponse>} Updated event response
   */
  update: (id, data) => axiosClient.put(`/events/${id}`, data),
  
  /**
   * Delete an event.
   * @param {number|string} id - Event ID
   * @returns {Promise<AxiosResponse>} Deletion response
   */
  delete: (id) => axiosClient.delete(`/events/${id}`),
  
  /**
   * Approve a pending event.
   * @param {number|string} id - Event ID
   * @returns {Promise<AxiosResponse>} Approval response
   */
  approve: (id) => axiosClient.post(`/events/${id}/approve`),
  
  /**
   * Reject an event with optional reason.
   * @param {number|string} id - Event ID
   * @param {object} payload - Rejection data (e.g., reason)
   * @returns {Promise<AxiosResponse>} Rejection response
   */
  reject: (id, payload) => axiosClient.post(`/events/${id}/reject`, payload),
  
  /**
   * Cancel an ongoing or scheduled event.
   * @param {number|string} id - Event ID
   * @returns {Promise<AxiosResponse>} Cancellation response
   */
  cancel: (id) => axiosClient.post(`/events/${id}/cancel`),
  
  /**
   * Get events created by the current user.
   * @param {object} params - Query parameters
   * @returns {Promise<AxiosResponse>} Paginated list of user's events
   */
  getMyEvents: (params) => axiosClient.get("/events/my-events", { params }),
  
  /**
   * Get events filtered by status.
   * @param {string} status - Event status filter
   * @param {object} params - Additional query parameters
   * @returns {Promise<AxiosResponse>} Paginated list of events with status filter
   */
  getByStatus: (status, params) => axiosClient.get("/events", { params: { ...params, status } }),
};

export default eventApi;
