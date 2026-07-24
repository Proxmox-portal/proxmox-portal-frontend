import React, { useState } from 'react';
import { useForm, validators } from '../hooks/useForm.js';
import { forgotPassword } from '../utils/authService.js';

export default function ForgotPasswordForm({ onBack }) {
  const [loading, setLoading]   = useState(false);
  const [apiError, setApiError] = useState('');
  const [sent, setSent]         = useState(false);

  const { values, errors, touched, handleChange, handleBlur, validateAll } =
    useForm(
      { email: '' },
      { email: [validators.required, validators.email] }
    );

  async function handleSubmit(e) {
    e.preventDefault();
    setApiError('');
    if (!validateAll()) return;
    setLoading(true);
    try {
      await forgotPassword({ email: values.email });
      setSent(true);
    } catch (err) {
      // Réponse générique pour ne pas révéler si l'email existe
      setSent(true);
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="screen-enter">
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <div style={{
            width: 64, height: 64,
            background: '#EEF3FF', borderRadius: 16,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px',
          }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
                 stroke="#2D5BE3" strokeWidth="2">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4
                       c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
          </div>
          <div className="totp-title">Vérifiez votre boîte mail</div>
          <p className="totp-sub" style={{ marginTop: 8 }}>
            Si un compte existe pour <strong>{values.email}</strong>,<br />
            vous recevrez un lien de réinitialisation.<br />
            Le lien expire dans <strong>15 minutes</strong>.
          </p>
          <button
            className="btn-main"
            style={{ marginTop: 24 }}
            onClick={onBack}
          >
            ← Retour à la connexion
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="screen-enter">
      <div className="form-header">
        <h1>Mot de passe oublié</h1>
        <p>Entrez votre email pour recevoir un lien de réinitialisation</p>
      </div>

      <div className="forgot-info">
        Le lien envoyé sera valide <strong>15 minutes</strong>. Pensez à
        vérifier votre dossier spam si vous ne recevez rien.
      </div>

      {apiError && (
        <div className="alert alert-error">{apiError}</div>
      )}

      <div className="form-group">
        <label htmlFor="forgot-email">Adresse email</label>
        <input
          id="forgot-email"
          type="email"
          autoComplete="email"
          placeholder="email@domaine.com"
          className={`form-input${errors.email && touched.email ? ' error' : ''}`}
          value={values.email}
          onChange={(e) => handleChange('email', e.target.value)}
          onBlur={() => handleBlur('email')}
        />
        {errors.email && touched.email && (
          <span className="input-error">{errors.email}</span>
        )}
      </div>

      <button type="submit" className="btn-main" disabled={loading}>
        {loading ? (
          <><div className="btn-spinner" />Envoi en cours…</>
        ) : (
          'Envoyer le lien →'
        )}
      </button>

      <p className="link-row" style={{ marginTop: 16 }}>
        <button type="button" className="link-btn" onClick={onBack}>
          ← Retour à la connexion
        </button>
      </p>
    </form>
  );
}
