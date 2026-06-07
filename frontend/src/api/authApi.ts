import api from "./axiosClient";

export type AuthPayload = {
  emailOrUsername: string;
  password: string;
};

export type RegisterPayload = {
  email: string;
  password: string;
  fullName: string;
};

export type AuthResponse = {
  token: string;
  user: {
    id: number;
    role: string;
    fullName: string;
    email: string;
  };
};

export async function login(payload: AuthPayload) {
  const response = await api.post<AuthResponse>("/auth/login", {
    identifier: payload.emailOrUsername,
    password: payload.password
  });
  return response.data;
}

export async function register(payload: RegisterPayload) {
  const response = await api.post<AuthResponse>("/auth/register", {
    username: payload.email,
    email: payload.email,
    password: payload.password,
    fullName: payload.fullName
  });
  return response.data;
}

export async function getMe() {
  const response = await api.get<{ id: number; role: string; fullName: string; email: string }>("/auth/me");
  return response.data;
}
