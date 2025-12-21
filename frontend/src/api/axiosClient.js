import axios from "axios";
import { toast } from "react-toastify";

/**
 * Configured Axios client instance for API communication.
 * Base URL: http://localhost:8080/api
 * Includes interceptors for:
 * - Automatic Authorization header injection
 * - JWT token refresh on 401 responses
 * - Error handling and user notifications
 */
const axiosClient = axios.create({
  baseURL: "http://localhost:8080/api",
  headers: { "Content-Type": "application/json" },
});

let isRefreshing = false;
let refreshSubscribers = [];

function onRefreshed(token) {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
}

function subscribeTokenRefresh(cb) {
  refreshSubscribers.push(cb);
}

axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const { response } = error;

    if (!response) {
      toast.error("⚠️ Không thể kết nối đến server.");
      return Promise.reject(error);
    }

    const { status } = response;

    if (status === 401 && !originalRequest._retry) {
      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) {
        toast.info("Bạn chưa đăng nhập hoặc phiên đã hết hạn!");
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          subscribeTokenRefresh((token) => {
            if (token) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(axiosClient(originalRequest));
            } else {
              reject(error);
            }
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const res = await axios.post("http://localhost:8080/api/auth/refresh",
          {
            refreshToken,
          });
        const { accessToken, refreshToken: newRefreshToken } = res.data;

        if (accessToken) {
          localStorage.setItem("accessToken", accessToken);
        }
        if (newRefreshToken) {
          localStorage.setItem("refreshToken", newRefreshToken);
        }

        isRefreshing = false;
        onRefreshed(accessToken);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return axiosClient(originalRequest);
      } catch (err) {
        isRefreshing = false;
        onRefreshed(null);
        toast.info("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại!");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        return Promise.reject(err);
      }
    }

    const { data } = response;
    if (status >= 500) {
      toast.error("Lỗi hệ thống. Vui lòng thử lại sau!");
    } else if (status === 404) {
      if (
        !error.config?.url?.includes('/my-registration') &&
        !error.config?.url?.includes('/me/registrations')
      ) {
        toast.warn('API không tồn tại hoặc đường dẫn sai!');
      }
    } else if (status === 403) {
      toast.warning("Bạn không có quyền truy cập!");
    }

    return Promise.reject(error);
  }
);

export default axiosClient;
