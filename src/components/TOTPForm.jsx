import React, { useEffect, useState } from 'react';
import { useOtp } from '../hooks/useOtp.js';
import { verify2FA } from '../utils/authService.js';

export default function TOTPForm({ userId, onBack }) {
  const {
    digits, hasError, isComplete, isExpired, isUrgent,
    seconds, inputRefs, startTimer,
    handleKeyDown, handleInput, handlePaste,
    reset, triggerError, code,
  } = useOtp(30);

  const [loading,  setLoading]  = useState(false);
  const [apiError, setApiError] = useState('');
  const [resent,   setResent]   = useState(false);

  // Start timer when screen mounts
  useEffect(() => { startTimer(); }, [startTimer]);
  // Auto-focus first box
  useEffect(() => { inputRefs.current[0]?.focus(); }, [inputRefs]);

  async function handleVerify(e) {
    e?.preventDefault();
    if (!isComplete || loading || isExpired) return;
    setApiError('');
    setLoading(true);
    try {
      await verify2FA({ userId, code });
      window.location.href = '/dashboard';
    } catch (err) {
      triggerError();
      setApiError(err.message || 'Code incorrect. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  }

  // Auto-submit when all 6 digits filled
  useEffect(() => {
    if (isComplete && !loading) handleVerify();
  }, [isComplete]); // eslint-disable-line

  function handleResend() {
    reset();
    startTimer();
    setResent(true);
    setApiError('');
    setTimeout(() => setResent(false), 4000);
  }

  const timerLabel = isExpired
    ? 'Code expiré'
    : `Code valide encore ${seconds}s`;

  return (
    <form onSubmit={handleVerify} noValidate className="screen-enter">
      {/* Icon + titles */}
      <div className="totp-header">
        <div className="totp-icon">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
               stroke="#2D5BE3" strokeWidth="2">
            <rect x="5" y="2" width="14" height="20" rx="2" />
            <line x1="12" y1="18" x2="12.01" y2="18" strokeWidth="3" />
          </svg>
        </div>
        <div className="totp-title">Vérification en 2 étapes</div>
        <p className="totp-sub">
          Entrez le code à 6 chiffres généré par<br />
          Google Authenticator ou Authy
        </p>
      </div>

      {/* Step indicator */}
      <div className="step-indicator centered">
        <div className="step-dot active" />
        <div className="step-dot active" />
      </div>

      {/* Timer badge */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <div className="timer-badge">
          <div className={`timer-dot${isUrgent ? ' urgent' : ''}`} />
          {timerLabel}
        </div>
      </div>

      {/* API / validation error */}
      {apiError && (
        <div className="alert alert-error" role="alert" style={{ marginTop: 12 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          {apiError}
        </div>
      )}

      {resent && (
        <div className="alert alert-success" role="alert" style={{ marginTop: 12 }}>
          Un nouveau code a été renvoyé par email.
        </div>
      )}

      {/* OTP boxes */}
      <div className="otp-row" onPaste={handlePaste}>
        {digits.map((digit, i) => (
          <input
            key={i}
            ref={(el) => (inputRefs.current[i] = el)}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            className={`otp-input${digit ? ' filled' : ''}${hasError ? ' error' : ''}`}
            onChange={(e) => handleInput(i, e)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            disabled={loading}
            aria-label={`Chiffre ${i + 1}`}
          />
        ))}
      </div>

      {/* Submit */}
      <button
        type="submit"
        className="btn-main"
        disabled={!isComplete || loading || isExpired}
      >
        {loading ? (
          <><div className="btn-spinner" />Vérification…</>
        ) : (
          'Valider et accéder →'
        )}
      </button>

      {/* Resend */}
      <p className="link-row" style={{ marginTop: 14 }}>
        Code expiré ?{' '}
        <button type="button" className="link-btn" onClick={handleResend}>
          Renvoyer un email
        </button>
      </p>

      {/* Back */}
      <p className="link-row" style={{ marginTop: 8 }}>
        <button type="button" className="link-btn" onClick={onBack}>
          ← Retour à la connexion
        </button>
      </p>
    </form>
  );
}
