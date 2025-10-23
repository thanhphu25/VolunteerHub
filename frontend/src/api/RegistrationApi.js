// src/api/registrationApi.js
import axiosClient from './axiosClient';

const registrationApi = {
  /**
   * Volunteer registers for an event.
   * @param {number|string} eventId - The ID of the event.
   * @param {object} data - Optional data, e.g., { note: 'My registration note' }.
   * @returns Promise<AxiosResponse<any>>
   */
  register: (eventId, data = {}) => {
    return axiosClient.post(`/events/${eventId}/register`, data);
  },

  /**
   * Volunteer cancels their registration.
   * @param {number|string} registrationId - The ID of the registration record.
   * @param {number|string} eventId - (Required by backend route structure) The ID of the event.
   * @returns Promise<AxiosResponse<any>>
   */
  cancel: (eventId, registrationId) => {
    // Backend endpoint seems to require eventId in the path as well
    return axiosClient.post(
        `/events/${eventId}/registrations/${registrationId}/cancel`);
  },

  /**
   * Get registrations for the currently logged-in volunteer.
   * @returns Promise<AxiosResponse<any>>
   */
  getMyRegistrations: () => {
    return axiosClient.get('/me/registrations');
  },

  /**
   * Get volunteer's registration for a specific event.
   * @param {number|string} eventId - The ID of the event.
   * @returns Promise<AxiosResponse<any>>
   */
  getMyRegistrationForEvent: (eventId) => {
    return axiosClient.get(`/events/${eventId}/my-registration`);
  },

  /**
   * Organizer/Admin gets registrations for a specific event.
   * @param {number|string} eventId - The ID of the event.
   * @returns Promise<AxiosResponse<any>>
   */
  getRegistrationsForEvent: (eventId) => {
    return axiosClient.get(`/events/${eventId}/registrations`);
  },

  /**
   * Organizer/Admin approves a registration.
   * @param {number|string} eventId
   * @param {number|string} registrationId
   * @returns Promise<AxiosResponse<any>>
   */
  approve: (eventId, registrationId) => {
    return axiosClient.post(
        `/events/${eventId}/registrations/${registrationId}/approve`);
  },

  /**
   * Organizer/Admin rejects a registration.
   * @param {number|string} eventId
   * @param {number|string} registrationId
   * @returns Promise<AxiosResponse<any>>
   */
  reject: (eventId, registrationId) => {
    return axiosClient.post(
        `/events/${eventId}/registrations/${registrationId}/reject`);
  },

  /**
   * Organizer/Admin marks a registration as completed (attended/absent).
   * @param {number|string} eventId
   * @param {number|string} registrationId
   * @param {boolean} present - Whether the volunteer was present.
   * @param {string} [note] - Optional completion note.
   * @returns Promise<AxiosResponse<any>>
   */
  markCompleted: (eventId, registrationId, present, note = '') => {
    // Backend uses query parameters for 'present' and 'note'
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