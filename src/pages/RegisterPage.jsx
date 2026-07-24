// src/pages/RegisterPage.jsx
import RegisterForm from "../features/auth/components/RegisterForm";
import NetworkBackground from "../components/Networkbackground";

export default function RegisterPage() {
  return (
    <div className="auth-layout">
      <NetworkBackground intensity={0.25} />
      <RegisterForm />
    </div>
  );
}