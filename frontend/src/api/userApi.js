import axiosClient from './axiosClient'

export default {
  me: () => axiosClient.get('/user/me')
}
