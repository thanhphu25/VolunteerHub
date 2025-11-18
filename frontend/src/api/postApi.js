// src/api/postApi.js
import axiosClient from './axiosClient';

const postApi = {
  /**
   * Fetch paginated posts for an event.
   * @param {number|string} eventId
   * @param {{page?: number, size?: number}} options
   */
  listPosts: (eventId, options = {}) => {
    const {page = 0, size = 10} = options;
    return axiosClient.get(`/events/${eventId}/posts`, {
      params: {page, size}
    });
  },

  /**
   * Create a new post inside an event discussion.
   * @param {number|string} eventId
   * @param {{content: string, imageUrl?: string}} data
   */
  createPost: (eventId, data) => {
    return axiosClient.post(`/events/${eventId}/posts`, data);
  },

  /**
   * Add a comment to a post.
   * @param {number|string} postId
   * @param {{content: string}} data
   */
  addComment: (postId, data) => {
    return axiosClient.post(`/posts/${postId}/comments`, data);
  },

  /**
   * List comments for a post.
   * @param {number|string} postId
   */
  listComments: (postId) => {
    return axiosClient.get(`/posts/${postId}/comments`);
  },

  /**
   * Like a post.
   * @param {number|string} postId
   */
  likePost: (postId) => {
    return axiosClient.post(`/posts/${postId}/likes`);
  },

  /**
   * Unlike a post.
   * @param {number|string} postId
   */
  unlikePost: (postId) => {
    return axiosClient.delete(`/posts/${postId}/likes`);
  },

  /**
   * List users who liked a post.
   * @param {number|string} postId
   */
  listLikes: (postId) => {
    return axiosClient.get(`/posts/${postId}/likes`);
  }
};

export default postApi;
