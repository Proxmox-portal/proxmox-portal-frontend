// src/pages/LoginPage.jsx
import { useLocation } from "react-router-dom";
import LoginForm from "../features/auth/components/LoginForm";
import NetworkBackground from "../components/Networkbackground";

export default function LoginPage() {
  const location = useLocation();
  const registered = location.state?.registered;
  const passwordReset = location.state?.passwordReset;

  return (
    <div className="auth-layout">
      <NetworkBackground intensity={0.25} />
      {registered && (
        <div className="success-box" role="status">
          Compte créé avec succès. Vous pouvez maintenant vous connecter.
        </div>
      )}
      {passwordReset && (
        <div className="success-box" role="status">
          Mot de passe réinitialisé. Connectez-vous avec votre nouveau mot de passe.
        </div>
      )}
      <LoginForm />
    </div>
  );
}