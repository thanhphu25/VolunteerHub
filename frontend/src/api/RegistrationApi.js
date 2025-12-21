import axiosClient from './axiosClient';

/**
 * Registration API service module.
 * Manages volunteer event registrations, approvals, rejections, and attendance tracking.
 */
const registrationApi = {
  /**
   * Register a volunteer for an event.
   * @param {number|string} eventId - The ID of the event
   * @param {object} [data={}] - Optional registration data (e.g., note)
   * @returns {Promise<AxiosResponse>} Registration response
   */
  register: (eventId, data = {}) => {
    return axiosClient.post(`/events/${eventId}/register`, data);
  },

  /**
   * Cancel a volunteer's event registration.
   * @param {number|string} eventId - The ID of the event
   * @param {number|string} registrationId - The ID of the registration record
   * @returns {Promise<AxiosResponse>} Cancellation response
   */
  cancel: (eventId, registrationId) => {
    return axiosClient.post(
      `/events/${eventId}/registrations/${registrationId}/cancel`);
  },

  /**
   * Get all registrations for the current volunteer.
   * @returns {Promise<AxiosResponse>} List of volunteer registrations
   */
  getMyRegistrations: () => {
    return axiosClient.get('/me/registrations');
  },

  /**
   * Get the current volunteer's registration for a specific event.
   * @param {number|string} eventId - The ID of the event
   * @returns {Promise<AxiosResponse>} Registration details
   */
  getMyRegistrationForEvent: (eventId) => {
    return axiosClient.get(`/events/${eventId}/my-registration`);
  },

  /**
   * Get all registrations for an event (organizer/admin only).
   * @param {number|string} eventId - The ID of the event
   * @returns {Promise<AxiosResponse>} List of registrations for the event
   */
  getRegistrationsForEvent: (eventId) => {
    return axiosClient.get(`/events/${eventId}/registrations`);
  },

  /**
   * Approve a volunteer's registration (organizer/admin only).
   * @param {number|string} eventId - The ID of the event
   * @param {number|string} registrationId - The ID of the registration
   * @returns {Promise<AxiosResponse>} Approval response
   */
  approve: (eventId, registrationId) => {
    return axiosClient.post(
      `/events/${eventId}/registrations/${registrationId}/approve`);
  },

  /**
   * Reject a volunteer's registration (organizer/admin only).
   * @param {number|string} eventId - The ID of the event
   * @param {number|string} registrationId - The ID of the registration
   * @returns {Promise<AxiosResponse>} Rejection response
   */
  reject: (eventId, registrationId) => {
    return axiosClient.post(
      `/events/${eventId}/registrations/${registrationId}/reject`);
  },

  /**
   * Mark a registration as completed with attendance status (organizer/admin only).
   * @param {number|string} eventId - The ID of the event
   * @param {number|string} registrationId - The ID of the registration
   * @param {boolean} present - Whether the volunteer attended
   * @param {string} [note=''] - Optional completion notes
   * @returns {Promise<AxiosResponse>} Completion response
   */
  markCompleted: (eventId, registrationId, present, note = '') => {
    const params = new URLSearchParams();
    params.append('present', present);
    if (note) {
      params.append('note', note);
    }
    return axiosClient.post(
      `/events/${eventId}/registrations/${registrationId}/complete?${params.toString()}`);
  }

};

export default registrationApi;