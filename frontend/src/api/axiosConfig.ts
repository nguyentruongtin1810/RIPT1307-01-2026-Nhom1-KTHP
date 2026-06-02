import axios from "axios";
import { getToken } from "../utils/auth";

const api = axios.create({
  // Kiểm tra lại port 4000 hay 5000 theo cấu hình thực tế của Backend nhóm bạn nhé
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api",
  headers: {
    "Content-Type": "application/json"
  }
});

// Request Interceptor: Giữ nguyên logic lấy token từ utils của bạn
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// BỔ SUNG THÊM: Response Interceptor để xử lý data và lỗi tập trung
api.interceptors.response.use(
  (response) => {
    // Trả về trực tiếp response.data để các hàm call API gọn hơn
    return response.data;
  },
  (error) => {
    // Gom lỗi từ backend trả về (từ các file errorHandler.js bên BE)
    const message = error.response?.data?.message || "Đã có lỗi hệ thống xảy ra!";
    return Promise.reject(new Error(message));
  }
);

export default api;
