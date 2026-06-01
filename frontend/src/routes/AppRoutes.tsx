import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import CandidateAuthPage from "../pages/candidate/CandidateAuthPage";
import CandidateApplicationForm from "../pages/candidate/CandidateApplicationForm";
import CandidateTrackingPage from "../pages/candidate/CandidateTrackingPage";
import AdminAuthPage from "../pages/admin/AdminAuthPage";
import AdminDashboardPage from "../pages/admin/AdminDashboardPage";
import ProtectedRoute from "./ProtectedRoute";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/candidate/login" replace />} />
        <Route path="/candidate/login" element={<CandidateAuthPage />} />
        <Route path="/candidate/register" element={<CandidateAuthPage />} />
        <Route
          path="/candidate/application"
          element={
            <ProtectedRoute role="student">
              <CandidateApplicationForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/candidate/tracking"
          element={
            <ProtectedRoute role="student">
              <CandidateTrackingPage />
            </ProtectedRoute>
          }
        />
        <Route path="/admin/login" element={<AdminAuthPage />} />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute role="admin">
              <AdminDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/candidate/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
