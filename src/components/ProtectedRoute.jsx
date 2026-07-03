// src/components/ProtectedRoute.jsx
import { Navigate, Outlet } from "react-router-dom";

/**
 * Protège les routes qui nécessitent une session active.
 * Si aucun token n'est présent, redirige vers /login.
 */
export default function ProtectedRoute() {
  const token = localStorage.getItem("token");
  return token ? <Outlet /> : <Navigate to="/login" replace />;
}
