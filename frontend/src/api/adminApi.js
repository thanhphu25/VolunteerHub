// src/api/adminApi.js
import axiosClient from './axiosClient';

const adminApi = {
  /**
   * Lấy danh sách user (có phân trang)
   * @param {object} params - Ví dụ: { page: 0, size: 20 }
   * @returns Promise<AxiosResponse<any>>
   */
  listUsers: (params) =>
      axiosClient.get('/admin/users', {params}), //

  /**
   * Khóa tài khoản user
   * @param {number|string} userId - ID của user cần khóa
   * @returns Promise<AxiosResponse<any>>
   */
  lockUser: (userId) =>
      axiosClient.post(`/admin/users/${userId}/lock`), //

  /**
   * Mở khóa tài khoản user
   * @param {number|string} userId - ID của user cần mở khóa
   * @returns Promise<AxiosResponse<any>>
   */
  unlockUser: (userId) =>
      axiosClient.post(`/admin/users/${userId}/unlock`), //

  /**
   * (Tùy chọn) Thay đổi vai trò user
   * @param {number|string} userId - ID của user
   * @param {string} role - Vai trò mới ('volunteer', 'organizer', 'admin')
   * @returns Promise<AxiosResponse<any>>
   */
  changeRole: (userId, role) =>
      axiosClient.post(`/admin/users/${userId}/role`, {role}), //

  /**
   * (Tùy chọn) Xuất danh sách user
   * @param {string} format - 'csv' hoặc 'json'
   * @returns Promise<AxiosResponse<Blob>>
   */
  exportUsers: (format = 'csv') =>
      axiosClient.get(`/admin/export/users?format=${format}`, { //
        responseType: 'blob', // Yêu cầu trả về dữ liệu dạng file (Blob)
      }),

  /**
   * (Tùy chọn) Xuất danh sách sự kiện
   * @param {string} format - 'csv' hoặc 'json'
   * @returns Promise<AxiosResponse<Blob>>
   */
  exportEvents: (format = 'csv') =>
      axiosClient.get(`/admin/export/events?format=${format}`, { //
        responseType: 'blob', // Yêu cầu trả về dữ liệu dạng file (Blob)
      }),
};

export default adminApi;