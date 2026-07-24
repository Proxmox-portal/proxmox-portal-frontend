// src/pages/ResetPasswordPage.jsx
import ResetPasswordForm from "../features/auth/components/ResetPasswordForm";
import NetworkBackground from "../components/Networkbackground";

export default function ResetPasswordPage() {
  return (
    <div className="auth-layout">
      <NetworkBackground intensity={0.25} />
      <ResetPasswordForm />
    </div>
  );
}