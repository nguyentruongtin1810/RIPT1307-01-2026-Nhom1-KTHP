const TOKEN_KEY = "admission_token";
const USER_KEY = "admission_user";
const ROLE_KEY = "admission_role";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeToken() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(ROLE_KEY);
}

export function setUser(user: { id: number; role: string; fullName: string; email: string }) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  localStorage.setItem(ROLE_KEY, user.role);
}

export function getUser() {
  const raw = localStorage.getItem(USER_KEY);
  return raw ? JSON.parse(raw) : null;
}

export function getUserRole() {
  return localStorage.getItem(ROLE_KEY);
}

export function clearAuth() {
  removeToken();
}
