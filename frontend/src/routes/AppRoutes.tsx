import React from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import CandidateAuthPage from "../pages/candidate/CandidateAuthPage";
import CandidateApplicationForm from "../pages/candidate/CandidateApplicationForm";
import CandidateTrackingPage from "../pages/candidate/CandidateTrackingPage";
import CandidateDashboard from "../pages/candidate/CandidateDashboard";
import StudentLayout from "../pages/layouts/StudentLayout";
import AdminAuthPage from "../pages/admin/AdminAuthPage";
import AdminDashboardPage from "../pages/admin/AdminDashboardPage";
import ProtectedRoute from "./ProtectedRoute";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 1. Tuyến đường công khai */}
        <Route path="/" element={<Navigate to="/candidate/login" replace />} />
        <Route path="/candidate/login" element={<CandidateAuthPage />} />
        <Route path="/candidate/register" element={<CandidateAuthPage />} />
        <Route path="/admin/login" element={<AdminAuthPage />} />

        {/* 2. Phân hệ Học sinh (Đã bọc chung vào StudentLayout để hiện Sidebar) */}
        <Route
          path="/student"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <StudentLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/student/dashboard" replace />} />
          <Route path="dashboard" element={<CandidateDashboard />} />
          <Route path="apply" element={<CandidateApplicationForm />} />
          <Route path="tracking" element={<CandidateTrackingPage />} />
        </Route>

        {/* Tự động hướng các link cũ về link cấu trúc Layout mới */}
        <Route path="/candidate/application" element={<Navigate to="/student/apply" replace />} />
        <Route path="/candidate/tracking" element={<Navigate to="/student/tracking" replace />} />

        {/* 3. Phân hệ Admin */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminDashboardPage />
            </ProtectedRoute>
          }
        />

        {/* 4. Khắc phục link lỗi */}
        <Route path="*" element={<Navigate to="/candidate/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}