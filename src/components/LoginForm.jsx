import React, { useState } from 'react';
import { useForm, validators } from '../hooks/useForm.js';
import { login } from '../utils/authService.js';

const EyeIcon = ({ open }) =>
  open ? (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth="2">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8
               a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8
               a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  ) : (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth="2">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );

export default function LoginForm({ onTOTP, onRegister, onForgot }) {
  const [showPwd,   setShowPwd]   = useState(false);
  const [remember,  setRemember]  = useState(true);
  const [loading,   setLoading]   = useState(false);
  const [apiError,  setApiError]  = useState('');

  const { values, errors, touched, handleChange, handleBlur, validateAll } =
    useForm(
      { email: '', password: '' },
      {
        email:    [validators.required, validators.email],
        password: [validators.required],
      }
    );

  async function handleSubmit(e) {
    e.preventDefault();
    setApiError('');
    if (!validateAll()) return;

    setLoading(true);
    try {
      const res = await login({ email: values.email, password: values.password });
      if (res.requires2FA) {
        onTOTP({ userId: res.userId });
      } else {
        // No 2FA — redirect straight to dashboard
        window.location.href = '/dashboard';
      }
    } catch (err) {
      setApiError(err.message || 'Identifiants incorrects. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="screen-enter">
      {/* Header */}
      <div className="form-header">
        <h1>Bon retour 👋</h1>
        <p>Connectez-vous à votre espace ProxPortal</p>
      </div>

      {/* Step indicator */}
      <div className="step-indicator">
        <div className="step-dot active" />
        <div className="step-dot" />
      </div>

      {/* API error */}
      {apiError && (
        <div className="alert alert-error" role="alert">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          {apiError}
        </div>
      )}

      {/* Email */}
      <div className="form-group">
        <label htmlFor="email">Adresse email</label>
        <input
          id="email"
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

      {/* Password */}
      <div className="form-group">
        <label htmlFor="password">Mot de passe</label>
        <div className="input-wrap">
          <input
            id="password"
            type={showPwd ? 'text' : 'password'}
            autoComplete="current-password"
            placeholder="Minimum 8 caractères"
            className={`form-input has-icon${errors.password && touched.password ? ' error' : ''}`}
            value={values.password}
            onChange={(e) => handleChange('password', e.target.value)}
            onBlur={() => handleBlur('password')}
          />
          <button
            type="button"
            className="eye-btn"
            onClick={() => setShowPwd((v) => !v)}
            aria-label={showPwd ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
          >
            <EyeIcon open={showPwd} />
          </button>
        </div>
        {errors.password && touched.password && (
          <span className="input-error">{errors.password}</span>
        )}
      </div>

      {/* Remember + Forgot */}
      <div className="checkbox-row">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
          />
          Se souvenir de moi
        </label>
        <button type="button" className="forgot-link" onClick={onForgot}>
          Mot de passe oublié ?
        </button>
      </div>

      {/* Submit */}
      <button type="submit" className="btn-main" disabled={loading}>
        {loading ? (
          <><div className="btn-spinner" />Connexion…</>
        ) : (
          'Se connecter →'
        )}
      </button>

      {/* Register link */}
      <div className="divider">
        <div className="divider-line" />
        <span className="divider-text">Pas encore de compte ?</span>
        <div className="divider-line" />
      </div>
      <p className="link-row">
        <button type="button" className="link-btn" onClick={onRegister}>
          Créer un compte gratuitement
        </button>
      </p>
    </form>
  );
}
