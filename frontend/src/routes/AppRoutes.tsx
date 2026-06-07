import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import AuthContainer from "../pages/AuthContainer";
import ApplyPage from "../pages/candidate/ApplyPage";
import StudentDashboard from "../pages/candidate/StudentDashboard";
import CandidateTrackingPage from "../pages/candidate/CandidateTrackingPage";
import AdminDashboard from "../pages/admin/AdminDashboard";
import AdminApplications from "../pages/admin/AdminApplications";
import AdminCategories from "../pages/admin/AdminCategories";
import AuthGuard from "./AuthGuard";
import StudentLayout from "../layouts/StudentLayout";
import AdminLayout from "../layouts/AdminLayout";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<AuthContainer />} />
        <Route path="/admin/login" element={<Navigate to="/login" replace />} />

        <Route
          path="/student/dashboard"
          element={
            <AuthGuard role="student">
              <StudentLayout breadcrumbItems={[{ title: "Dashboard" }]}> 
                <StudentDashboard />
              </StudentLayout>
            </AuthGuard>
          }
        />
        <Route
          path="/student/apply"
          element={
            <AuthGuard role="student">
              <StudentLayout breadcrumbItems={[{ title: "Nộp hồ sơ" }]}> 
                <ApplyPage />
              </StudentLayout>
            </AuthGuard>
          }
        />
        <Route
          path="/student/status"
          element={
            <AuthGuard role="student">
              <StudentLayout breadcrumbItems={[{ title: "Trạng thái" }]}> 
                <CandidateTrackingPage />
              </StudentLayout>
            </AuthGuard>
          }
        />

        <Route
          path="/admin/dashboard"
          element={
            <AuthGuard role="admin">
              <AdminLayout breadcrumbItems={[{ title: "Thống kê" }]}> 
                <AdminDashboard />
              </AdminLayout>
            </AuthGuard>
          }
        />
        <Route
          path="/admin/applications"
          element={
            <AuthGuard role="admin">
              <AdminLayout breadcrumbItems={[{ title: "Duyệt hồ sơ" }]}> 
                <AdminApplications />
              </AdminLayout>
            </AuthGuard>
          }
        />
        <Route
          path="/admin/categories"
          element={
            <AuthGuard role="admin">
              <AdminLayout breadcrumbItems={[{ title: "Trường/Ngành" }]}> 
                <AdminCategories />
              </AdminLayout>
            </AuthGuard>
          }
        />

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
