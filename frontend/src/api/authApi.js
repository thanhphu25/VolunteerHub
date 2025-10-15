import axiosClient from './axiosClient'

export default {
  login: (payload) => axiosClient.post('/v1/auth/login', payload),
  register: (payload) => axiosClient.post('/v1/auth/register', payload)
}
