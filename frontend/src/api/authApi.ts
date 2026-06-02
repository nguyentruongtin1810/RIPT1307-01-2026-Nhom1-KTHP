import api from "./axiosConfig";

// SỬA TẠI ĐÂY: Đổi trường 'email' thành 'identifier' để khớp với yêu cầu Backend khi Đăng nhập
export type AuthPayload = {
  identifier: string; // Có thể là Email hoặc Username tùy người dùng nhập
  password: string;
};

export type RegisterPayload = {
  username: string; 
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  address?: string;
};

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

export async function login(payload: AuthPayload) {
  // Trả về trực tiếp response từ api.post (bỏ .data thừa nếu interceptor của bạn đã bóc tách lớp đầu)
  const response = await api.post<AuthResponse>("/auth/login", payload);
  return response;
}

export async function register(payload: RegisterPayload) {
  // Trả về trực tiếp response để tránh bị lặp hai lần .data dẫn đến undefined khi Đăng ký
  const response = await api.post<AuthResponse>("/auth/register", payload);
  return response;
}

export async function getMe() {
  const response = await api.get<{ id: number; role: string; fullName: string; email: string }>("/auth/me");
  return response;
}