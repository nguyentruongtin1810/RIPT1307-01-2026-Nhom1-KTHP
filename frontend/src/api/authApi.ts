import api from "./axiosConfig";

// 1. Định nghĩa kiểu dữ liệu Đăng nhập (Khớp với tài liệu: cần 'identifier' và 'password')
export type AuthPayload = {
  identifier: string; // Có thể nhập email hoặc username tùy ý
  password: string;
};

// 2. Định nghĩa kiểu dữ liệu Đăng ký (Khớp với tài liệu Payload mẫu của Backend)
export type RegisterPayload = {
  username: string; 
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  address?: string;
};

// 3. Định nghĩa kiểu dữ liệu Phản hồi từ máy chủ sau khi xác thực thành công
export type AuthResponse = {
  token: string;
  user: {
    id: number;
    username?: string; 
    role: string;
    fullName: string;
    email: string;
  };
};

// Hàm xử lý gọi API Đăng nhập
export async function login(payload: AuthPayload) {
  // Trả về trực tiếp vì interceptor của axiosConfig đã tự động bóc tách .data rồi
  return await api.post<AuthResponse>("/auth/login", payload);
}

// Hàm xử lý gọi API Đăng ký
export async function register(payload: RegisterPayload) {
  // Trả về trực tiếp để tránh bị lặp hai lần .data dẫn đến lỗi undefined
  return await api.post<AuthResponse>("/auth/register", payload);
}

// Hàm lấy thông tin tài khoản hiện tại
export async function getMe() {
  return await api.get<{ id: number; role: string; fullName: string; email: string }>("/auth/me");
}