// frontend/src/utils/auth.ts
export const getToken = (): string | null => {
  return localStorage.getItem("token");
};

export const setToken = (token: string): void => {
  localStorage.setItem("token", token);
};

export const removeToken = (): void => {
  localStorage.removeItem("token");
};

export const getUserRole = (): string | null => {
  return localStorage.getItem("role");
};

export const setUserRole = (role: string): void => {
  localStorage.setItem("role", role);
};

export const removeUserRole = (): void => {
  localStorage.removeItem("role");
};

export const isAuthenticated = (): boolean => {
  return !!getToken();
};

export const isAdmin = (): boolean => {
  return getUserRole() === "admin";
};

export const isStudent = (): boolean => {
  return getUserRole() === "student";
};

export const clearAuth = (): void => {
  removeToken();
  removeUserRole();

  localStorage.removeItem("fullName");
  localStorage.removeItem("email");
};

// Hàm lấy thông tin user từ localStorage
export const getUser = () => {
  return {
    fullName: localStorage.getItem("fullName") || "Thí sinh",
    email: localStorage.getItem("email") || "student@example.com",
    role: getUserRole() || "student"
  };
};

// Hàm bổ sung cho AdminAuthPage
export const setUser = (userData: any): void => {
  if (userData?.token) setToken(userData.token);
  if (userData?.role) setUserRole(userData.role);
  if (userData?.fullName) localStorage.setItem("fullName", userData.fullName);
  if (userData?.email) localStorage.setItem("email", userData.email);
};