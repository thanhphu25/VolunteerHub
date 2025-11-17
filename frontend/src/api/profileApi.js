// src/api/profileApi.js
import axiosClient from "./axiosClient";

const profileApi = {
  getProfileSummary: () => axiosClient.get("/me/profile"),
  updateProfile: (payload) => axiosClient.put("/me/profile", payload),
  getFollowedOrganizers: () => axiosClient.get("/me/following"),
  followOrganizer: (organizerId) => axiosClient.post(`/me/following/${organizerId}`),
  unfollowOrganizer: (organizerId) => axiosClient.delete(`/me/following/${organizerId}`)
};

export default profileApi;
