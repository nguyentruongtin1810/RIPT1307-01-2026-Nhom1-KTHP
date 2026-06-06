// frontend/src/api/authApi.ts

import api from "./axiosConfig";

export interface AuthResponse {
  token: string;
  user: {
    id: number;
    role: string;
    email: string;
    fullName: string;
  };
}

export interface LoginPayload {
  identifier: string;
  password: string;
}

export interface RegisterPayload {
  fullName: string;
  username: string;
  email: string;
  password: string;
}

export async function login(payload: LoginPayload) {
  const response = await api.post<AuthResponse>(
    "/auth/login",
    payload
  );

  return response.data;
}

export async function register(payload: RegisterPayload) {
  const response = await api.post(
    "/auth/register",
    payload
  );

  return response.data;
}

export async function getMe() {
  const response = await api.get(
    "/auth/me"
  );

  return response.data;
}