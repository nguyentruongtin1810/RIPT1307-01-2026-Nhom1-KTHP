import { Navigate } from "react-router-dom";
import { getToken, getUserRole } from "../utils/auth";

type AuthGuardProps = {
  children: JSX.Element;
  role: "student" | "admin";
};

export default function AuthGuard({ children, role }: AuthGuardProps) {
  const token = getToken();
  const currentRole = getUserRole();

  if (!token || currentRole !== role) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
