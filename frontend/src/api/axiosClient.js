import axios from "axios";
import {toast} from "react-toastify";

const axiosClient = axios.create({
  baseURL: "http://localhost:8080/api",
  headers: {
    "Content-Type": "application/json",
  },
});

axiosClient.interceptors.response.use(
    (response) => response,
    (error) => {
      const {response} = error;
      if (!response) {
        toast.error("⚠️ Không thể kết nối tới server.");
        throw error;
      }

      const {status, data} = response;

      switch (status) {
        case 400:
          toast.warning(data.message || "❌ Dữ liệu không hợp lệ.");
          break;
        case 401:
          toast.info("🔐 Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
          break;
        case 403:
          toast.error("🚫 Bạn không có quyền thực hiện hành động này.");
          break;
        case 404:
          toast.warning("❓ Không tìm thấy tài nguyên được yêu cầu.");
          break;
        case 409:
          toast.warning(
              data.message || "⚠️ Email hoặc số điện thoại đã tồn tại.");
          break;
        case 500:
          toast.error("💥 Lỗi hệ thống. Vui lòng thử lại sau.");
          break;
        default:
          toast.error(data.message || "⚠️ Có lỗi xảy ra. Vui lòng thử lại.");
      }

      throw error;
    }
);

export default axiosClient;
