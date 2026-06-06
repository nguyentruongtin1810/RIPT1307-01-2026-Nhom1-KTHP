import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Card, Typography } from "antd";
import Login from "../pages/Login";
import ApplyPage from "../pages/candidate/ApplyPage";
import StudentDashboard from "../pages/candidate/StudentDashboard";
import CandidateTrackingPage from "../pages/candidate/CandidateTrackingPage";
import AdminAuthPage from "../pages/admin/AdminAuthPage";
import AdminDashboard from "../pages/admin/AdminDashboard";
import AdminApplications from "../pages/admin/AdminApplications";
import AuthGuard from "./AuthGuard";
import StudentLayout from "../layouts/StudentLayout";
import AdminLayout from "../layouts/AdminLayout";

const { Title } = Typography;

function StudentDashboardPage() {
  return (
    <Card className="page-card" title={<Title level={4}>Student Dashboard</Title>}>
      <p>Welcome to the student dashboard.</p>
    </Card>
  );
}

function AdminCategoriesPage() {
  return (
    <Card className="page-card" title={<Title level={4}>Admin Categories</Title>}>
      <p>Manage categories here.</p>
    </Card>
  );
}

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin/login" element={<AdminAuthPage />} />

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
                <AdminCategoriesPage />
              </AdminLayout>
            </AuthGuard>
          }
        />

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
