import axios from "axios";
import {toast} from "react-toastify";

// =======================================
// 🔧 Tạo instance axios
// =======================================
const axiosClient = axios.create({
  baseURL: "http://localhost:8080/api",
  headers: {"Content-Type": "application/json"},
  // withCredentials: true, // bật nếu bạn dùng cookie httpOnly
});

// =======================================
// 🧩 Biến trạng thái refresh token
// =======================================
let isRefreshing = false;
let refreshSubscribers = [];

function onRefreshed(token) {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
}

function subscribeTokenRefresh(cb) {
  refreshSubscribers.push(cb);
}

// =======================================
// 🔐 Request interceptor — luôn gửi Authorization
// =======================================
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

// =======================================
// 🚨 Response interceptor — xử lý lỗi & refresh token
// =======================================
axiosClient.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;
      const {response} = error;

      // ⚠️ Nếu không có response (mất kết nối)
      if (!response) {
        toast.error("⚠️ Không thể kết nối đến server.");
        return Promise.reject(error);
      }

      const {status} = response;

      // Nếu 401 (token hết hạn)
      if (status === 401 && !originalRequest._retry) {
        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) {
          toast.info("Bạn chưa đăng nhập hoặc phiên đã hết hạn!");
          return Promise.reject(error);
        }

        // Nếu đang refresh, chờ đến khi refresh xong
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

        // Bắt đầu refresh
        originalRequest._retry = true;
        isRefreshing = true;

        try {
          const res = await axios.post("http://localhost:8080/api/auth/refresh",
              {
                refreshToken,
              });
          const {accessToken, refreshToken: newRefreshToken} = res.data;

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
          // Xóa token cũ
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          // Tùy bạn: có thể redirect về trang login
          return Promise.reject(err);
        }
      }

      // Các lỗi hệ thống chung khác
      const {data} = response;
      if (status >= 500) {
        toast.error("Lỗi hệ thống. Vui lòng thử lại sau!");
      } else if (status === 404) {
        toast.warning("API không tồn tại hoặc đường dẫn sai!");
      } else if (status === 403) {
        toast.warning("Bạn không có quyền truy cập!");
      }

      return Promise.reject(error);
    }
);

export default axiosClient;
