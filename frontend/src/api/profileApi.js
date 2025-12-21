import axiosClient from "./axiosClient";

/**
 * Profile API service module.
 * Provides user profile management and organizer follow management.
 */
const profileApi = {
  /**
   * Get the profile summary for the current user.
   * @returns {Promise<AxiosResponse>} User profile data
   */
  getProfileSummary: () => axiosClient.get("/me/profile"),
  
  /**
   * Update the current user's profile information.
   * @param {object} payload - Updated profile data
   * @returns {Promise<AxiosResponse>} Updated profile response
   */
  updateProfile: (payload) => axiosClient.put("/me/profile", payload),
  
  /**
   * Get list of organizers followed by the current user.
   * @returns {Promise<AxiosResponse>} List of followed organizers
   */
  getFollowedOrganizers: () => axiosClient.get("/me/following"),
  
  /**
   * Follow an organizer.
   * @param {number|string} organizerId - The organizer's ID
   * @returns {Promise<AxiosResponse>} Follow response
   */
  followOrganizer: (organizerId) => axiosClient.post(`/me/following/${organizerId}`),
  
  /**
   * Unfollow an organizer.
   * @param {number|string} organizerId - The organizer's ID
   * @returns {Promise<AxiosResponse>} Unfollow response
   */
  unfollowOrganizer: (organizerId) => axiosClient.delete(`/me/following/${organizerId}`)
};

export default profileApi;
