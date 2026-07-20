 
import { Navigate, Outlet } from "react-router-dom";
import { isAdmin } from "../features/auth/services/authApi";

export default function AdminRoute() {
  return isAdmin() ? <Outlet /> : <Navigate to="/home" replace />;
}