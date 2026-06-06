import axios from "axios";
import { getToken } from "../utils/auth";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api",
  headers: {
    "Content-Type": "application/json"
  }
});

// Request Interceptor: Giữ nguyên của nhóm để đính kèm token
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response Interceptor tối ưu: KHÔNG tự ý bóc tách data, chỉ gom lỗi tập trung
api.interceptors.response.use(
  (response) => {
    // Trả về nguyên vẹn cấu trúc đối tượng response gốc của Axios để các bạn khác không bị lỗi .data
    return response;
  },
  (error) => {
    // Giúp xử lý thông báo lỗi từ backend (errorHandler) hiển thị mượt mà hơn
    const message = error.response?.data?.message || "Đã có lỗi hệ thống xảy ra!";
    return Promise.reject(new Error(message));
  }
);

export default api;