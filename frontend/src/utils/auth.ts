// --- QUẢN LÝ ACCESS TOKEN ---
export const getToken = (): string | null => {
  return localStorage.getItem("token");
};

export const setToken = (token: string): void => {
  localStorage.setItem("token", token);
};

export const removeToken = (): void => {
  localStorage.removeItem("token");
};

// --- QUẢN LÝ QUYỀN HẠN (USER ROLE) ---
export const getUserRole = (): string => {
  return localStorage.getItem("role") || "";
};

export const setUserRole = (role: string): void => {
  localStorage.setItem("role", role);
};

export const removeUserRole = (): void => {
  localStorage.removeItem("role");
};

// --- SỬA DỨT ĐIỂM TẠI ĐÂY ---
// Chuyển kiểu dữ liệu nhận vào thành 'any' để chấp nhận cả Object User từ CandidateAuthPage gửi sang
export const setUser = (user: any): void => {
  if (user && typeof user === "object") {
    localStorage.setItem("user", JSON.stringify(user));
    if (user.role) {
      localStorage.setItem("role", user.role);
    }
  } else if (typeof user === "string") {
    localStorage.setItem("user", user);
  }
};

// Hàm bổ sung giúp lấy thông tin User ra khi cần (ví dụ hiển thị tên ở Dashboard)
export const getUser = (): any => {
  const user = localStorage.getItem("user");
  try {
    return user ? JSON.parse(user) : null;
  } catch {
    return null;
  }
};