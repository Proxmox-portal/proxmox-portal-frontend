// src/pages/ResetPasswordPage.jsx
import ForgotPasswordForm from "../features/auth/components/ForgotPasswordForm";
import NetworkBackground from "../components/Networkbackground";

export default function ForgotPasswordPage() {
  return (
    <div className="auth-layout">
      <NetworkBackground intensity={0.25} />
      <ForgotPasswordForm />
    </div>
  );
}