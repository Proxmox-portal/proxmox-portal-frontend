import React, { useState } from 'react';
import LeftPanel          from './LeftPanel.jsx';
import LoginForm          from './LoginForm.jsx';
import TOTPForm           from './TOTPForm.jsx';
import RegisterForm       from './RegisterForm.jsx';
import ForgotPasswordForm from './ForgotPasswordForm.jsx';
import '../styles/auth.css';

/**
 * Screens:
 *  'login'    → LoginForm
 *  'totp'     → TOTPForm  (2FA)
 *  'register' → RegisterForm
 *  'forgot'   → ForgotPasswordForm
 */
export default function AuthPage() {
  const [screen, setScreen] = useState('login');
  const [totpCtx, setTotpCtx] = useState({ userId: null });

  function goTOTP(ctx) {
    setTotpCtx(ctx);
    setScreen('totp');
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        {/* Blue left panel — always visible */}
        <LeftPanel />

        {/* Right panel — changes per screen */}
        <div className="auth-right">
          {screen === 'login' && (
            <LoginForm
              onTOTP={goTOTP}
              onRegister={() => setScreen('register')}
              onForgot={() => setScreen('forgot')}
            />
          )}

          {screen === 'totp' && (
            <TOTPForm
              userId={totpCtx.userId}
              onBack={() => setScreen('login')}
            />
          )}

          {screen === 'register' && (
            <RegisterForm
              onLogin={() => setScreen('login')}
            />
          )}

          {screen === 'forgot' && (
            <ForgotPasswordForm
              onBack={() => setScreen('login')}
            />
          )}
        </div>
      </div>
    </div>
  );
}
