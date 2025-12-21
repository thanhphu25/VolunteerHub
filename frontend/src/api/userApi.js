import axiosClient from './axiosClient'

/**
 * User API service module.
 * Provides endpoints for retrieving current user information.
 */
export default {
  /**
   * Get the profile information of the currently authenticated user.
   * @returns {Promise<AxiosResponse>} Current user details
   */
  me: () => axiosClient.get('/user/me')
}
