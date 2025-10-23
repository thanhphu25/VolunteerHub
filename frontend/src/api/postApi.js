// src/api/postApi.js
import axiosClient from './axiosClient';

const postApi = {
  // Lấy danh sách bài đăng cho một sự kiện (có phân trang)
  listPosts: (eventId, params = {page: 0, size: 10}) =>
      axiosClient.get(`/events/${eventId}/posts`, {params}),

  // Tạo bài đăng mới
  createPost: (eventId, data) => // data = { content: "...", imageUrl: "..." }
      axiosClient.post(`/events/${eventId}/posts`, data),

  // Lấy danh sách bình luận cho một bài đăng
  listComments: (postId) =>
      axiosClient.get(`/posts/${postId}/comments`),

  // Thêm bình luận mới
  addComment: (postId, data) => // data = { content: "..." }
      axiosClient.post(`/posts/${postId}/comments`, data),

  // Thích một bài đăng
  likePost: (postId) =>
      axiosClient.post(`/posts/${postId}/likes`),

  // Bỏ thích một bài đăng
  unlikePost: (postId) =>
      axiosClient.delete(`/posts/${postId}/likes`),

  // Lấy danh sách người đã thích bài đăng (Nếu cần hiển thị chi tiết)
  listLikes: (postId) =>
      axiosClient.get(`/posts/${postId}/likes`),
};

export default postApi;