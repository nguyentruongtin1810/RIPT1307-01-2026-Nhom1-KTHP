import React from "react";
import { Navigate } from "react-router-dom";
import { getToken, getUserRole } from "../utils/auth";

// Định nghĩa interface chuẩn để TypeScript nhận diện đúng prop
interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[]; // Đổi từ role sang allowedRoles
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const token = getToken();
  const role = getUserRole();

  // Nếu chưa đăng nhập -> đá về login
  if (!token) {
    return <Navigate to="/candidate/login" replace />;
  }

  // Nếu đã đăng nhập nhưng không có quyền trong danh sách cho phép
  if (allowedRoles && !allowedRoles.includes(role)) {
    if (role === "admin") {
      return <Navigate to="/admin/dashboard" replace />;
    } else {
      return <Navigate to="/student/dashboard" replace />;
    }
  }

  return <>{children}</>;
}