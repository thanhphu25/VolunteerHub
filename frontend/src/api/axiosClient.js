import axios from 'axios'

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'

const axiosClient = axios.create({
  baseURL,
  headers: {'Content-Type': 'application/json'}
})

// request interceptor: attach token
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('vh_token')
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default axiosClient
