// frontend/src/routes/AppRoutes.tsx
import React from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import CandidateAuthPage from "../pages/candidate/CandidateAuthPage";
import CandidateDashboard from "../pages/candidate/CandidateDashboard";
import CandidateApplicationForm from "../pages/candidate/CandidateApplicationForm";
import CandidateTrackingPage from "../pages/candidate/CandidateTrackingPage";

import StudentLayout from "../pages/layouts/StudentLayout";   // ← Đường dẫn đúng
import AdminDashboardPage from "../pages/admin/AdminDashboardPage";
import ProtectedRoute from "./ProtectedRoute";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Navigate to="/candidate/login" replace />} />
        <Route path="/candidate/login" element={<CandidateAuthPage />} />

        {/* Student Routes - Có Layout */}
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

        {/* Admin Routes */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminDashboardPage />
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/candidate/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}