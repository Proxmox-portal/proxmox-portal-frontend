// src/components/ProtectedRoute.jsx
import { Navigate, Outlet, useLocation } from "react-router-dom";

/**
 * Protège les routes qui nécessitent une session active.
 * Si aucun token n'est présent, redirige vers /login en conservant
 * la route d'origine (state.from) et les données déjà saisies (state.data),
 * pour que LoginForm puisse renvoyer l'utilisateur exactement là où il allait
 * une fois connecté (cinématique de redirection gardée, guide section 5).
 */
export default function ProtectedRoute() {
  const token = localStorage.getItem("token");
  const location = useLocation();

  if (!token) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname, data: location.state }}
      />
    );
  }

  return <Outlet />;
}
