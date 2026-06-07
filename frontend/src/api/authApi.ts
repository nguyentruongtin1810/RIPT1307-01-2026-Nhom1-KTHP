import api from "./axiosClient";

export type AuthPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = AuthPayload & {
  username: string;
  fullName: string;
  phone?: string;
  address?: string;
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
    identifier: payload.email,
    password: payload.password
  });
  return response.data;
}

export async function register(payload: RegisterPayload) {
<<<<<<< HEAD
  const response = await api.post<AuthResponse>("/auth/register", {
=======
  // backend expects exact keys: username, email, password, fullName
  const body = {
>>>>>>> 65b015988b0d45524a3979bb03819e9012e8979e
    username: payload.email,
    email: payload.email,
    password: payload.password,
    fullName: payload.fullName
<<<<<<< HEAD
  });
=======
  };
  const response = await api.post<AuthResponse>("/auth/register", body);
>>>>>>> 65b015988b0d45524a3979bb03819e9012e8979e
  return response.data;
}

export async function getMe() {
  const response = await api.get<{ id: number; role: string; fullName: string; email: string }>("/auth/me");
  return response.data;
}
