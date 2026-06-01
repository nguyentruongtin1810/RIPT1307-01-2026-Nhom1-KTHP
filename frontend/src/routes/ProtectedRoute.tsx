import { Navigate } from "react-router-dom";
import { getToken, getUserRole } from "../utils/auth";

type ProtectedRouteProps = {
  children: JSX.Element;
  role: "student" | "admin";
};

export default function ProtectedRoute({ children, role }: ProtectedRouteProps) {
  const token = getToken();
  const currentRole = getUserRole();

  if (!token || currentRole !== role) {
    return <Navigate to={`/${role}/login`} replace />;
  }

  return children;
}
