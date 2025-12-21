import axiosClient from './axiosClient';

/**
 * Admin API service module.
 * Provides administrative operations for user management, account locking,
 * role changes, and data export functionality.
 */
const adminApi = {
    /**
     * Retrieve a paginated list of all users.
     * @param {object} params - Query parameters (e.g., page: 0, size: 20)
     * @returns {Promise<AxiosResponse>} Paginated user list
     */
    listUsers: (params) =>
        axiosClient.get('/admin/users', { params }),

    /**
     * Lock a user account to prevent access.
     * @param {number|string} userId - The ID of the user to lock
     * @returns {Promise<AxiosResponse>} Lock operation response
     */
    lockUser: (userId) =>
        axiosClient.post(`/admin/users/${userId}/lock`),

    /**
     * Unlock a previously locked user account.
     * @param {number|string} userId - The ID of the user to unlock
     * @returns {Promise<AxiosResponse>} Unlock operation response
     */
    unlockUser: (userId) =>
        axiosClient.post(`/admin/users/${userId}/unlock`),

    /**
     * Change a user's role.
     * @param {number|string} userId - The ID of the user
     * @param {string} role - New role: 'volunteer', 'organizer', or 'admin'
     * @returns {Promise<AxiosResponse>} Role change response
     */
    changeRole: (userId, role) =>
        axiosClient.post(`/admin/users/${userId}/role`, { role }),

    /**
     * Export the user list in specified format.
     * @param {string} [format='csv'] - Export format: 'csv' or 'json'
     * @returns {Promise<AxiosResponse>} Blob response containing exported data
     */
    exportUsers: (format = 'csv') =>
        axiosClient.get(`/admin/export/users?format=${format}`, {
            responseType: 'blob',
        }),

    /**
     * Export the event list in specified format.
     * @param {string} [format='csv'] - Export format: 'csv' or 'json'
     * @returns {Promise<AxiosResponse>} Blob response containing exported data
     */
    exportEvents: (format = 'csv') =>
        axiosClient.get(`/admin/export/events?format=${format}`, {
            responseType: 'blob',
        }),
};

export default adminApi;