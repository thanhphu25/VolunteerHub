import axiosClient from './axiosClient'

/**
 * Authentication API service module.
 * Provides user login and registration endpoints.
 */
export default {
  /**
   * Authenticate a user with email and password.
   * @param {object} payload - Login credentials { email: string, password: string }
   * @returns {Promise<AxiosResponse>} Authentication response with tokens
   */
  login: (payload) => axiosClient.post('/auth/login', payload),
  
  /**
   * Register a new user account.
   * @param {object} payload - Registration data { email, password, fullName, phone, role }
   * @returns {Promise<AxiosResponse>} Registration response
   */
  register: (payload) => axiosClient.post('/auth/register', payload)
}
