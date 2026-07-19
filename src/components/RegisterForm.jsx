import React, { useState } from 'react';
import { useForm, validators, getPasswordStrength } from '../hooks/useForm.js';
import { register } from '../utils/authService.js';

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

function PasswordStrengthBar({ password }) {
  const { level, label } = getPasswordStrength(password);
  if (!password) return null;
  const filled = level === 'weak' ? 1 : level === 'medium' ? 2 : 3;

  return (
    <div className="pwd-strength">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={`pwd-bar${i < filled ? ` ${level}` : ''}`}
        />
      ))}
      <span className={`pwd-label ${level}`}>{label}</span>
    </div>
  );
}

export default function RegisterForm({ onLogin }) {
  const [showPwd,    setShowPwd]    = useState(false);
  const [showConf,   setShowConf]   = useState(false);
  const [loading,    setLoading]    = useState(false);
  const [apiError,   setApiError]   = useState('');
  const [registered, setRegistered] = useState(false);

  const { values, errors, touched, handleChange, handleBlur, validateAll } =
    useForm(
      { username: '', email: '', password: '', confirm: '' },
      {
        username: [validators.username],
        email:    [validators.required, validators.email],
        password: [validators.password],
        confirm:  [
          validators.required,
          (v) => validators.confirmPassword(values.password)(v),
        ],
      }
    );

  async function handleSubmit(e) {
    e.preventDefault();
    setApiError('');
    if (!validateAll()) return;

    setLoading(true);
    try {
      await register({
        username: values.username,
        email:    values.email,
        password: values.password,
      });
      setRegistered(true);
    } catch (err) {
      setApiError(err.message || 'Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  }

  if (registered) {
    return (
      <div className="screen-enter">
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <div style={{
            width: 64, height: 64,
            background: '#DCFCE7', borderRadius: 16,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px',
          }}>
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none"
                 stroke="#16A34A" strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <div className="totp-title">Compte créé avec succès !</div>
          <p className="totp-sub" style={{ marginTop: 8 }}>
            Un email de confirmation a été envoyé à<br />
            <strong>{values.email}</strong>
          </p>
          <button
            className="btn-main"
            style={{ marginTop: 24 }}
            onClick={onLogin}
          >
            Se connecter →
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="screen-enter">
      <div className="form-header">
        <h1>Créer un compte</h1>
        <p>Rejoignez HomeCloud et gérez vos VMs</p>
      </div>

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

      {/* Username */}
      <div className="form-group">
        <label htmlFor="reg-username">Nom d'utilisateur</label>
        <input
          id="reg-username"
          type="text"
          autoComplete="username"
          placeholder="ex : gilles_poumou"
          className={`form-input${errors.username && touched.username ? ' error' : ''}`}
          value={values.username}
          onChange={(e) => handleChange('username', e.target.value)}
          onBlur={() => handleBlur('username')}
        />
        {errors.username && touched.username ? (
          <span className="input-error">{errors.username}</span>
        ) : (
          <span className="input-hint">
            Lettres minuscules, chiffres, tirets et underscores
          </span>
        )}
      </div>

      {/* Email */}
      <div className="form-group">
        <label htmlFor="reg-email">Adresse email</label>
        <input
          id="reg-email"
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
        <label htmlFor="reg-password">Mot de passe</label>
        <div className="input-wrap">
          <input
            id="reg-password"
            type={showPwd ? 'text' : 'password'}
            autoComplete="new-password"
            placeholder="Min. 8 car., majuscule, chiffre, symbole"
            className={`form-input has-icon${errors.password && touched.password ? ' error' : ''}`}
            value={values.password}
            onChange={(e) => handleChange('password', e.target.value)}
            onBlur={() => handleBlur('password')}
          />
          <button
            type="button"
            className="eye-btn"
            onClick={() => setShowPwd((v) => !v)}
          >
            <EyeIcon open={showPwd} />
          </button>
        </div>
        <PasswordStrengthBar password={values.password} />
        {errors.password && touched.password && (
          <span className="input-error">{errors.password}</span>
        )}
      </div>

      {/* Confirm */}
      <div className="form-group">
        <label htmlFor="reg-confirm">Confirmer le mot de passe</label>
        <div className="input-wrap">
          <input
            id="reg-confirm"
            type={showConf ? 'text' : 'password'}
            autoComplete="new-password"
            placeholder="Répétez votre mot de passe"
            className={`form-input has-icon${errors.confirm && touched.confirm ? ' error' : ''}`}
            value={values.confirm}
            onChange={(e) => handleChange('confirm', e.target.value)}
            onBlur={() => handleBlur('confirm')}
          />
          <button
            type="button"
            className="eye-btn"
            onClick={() => setShowConf((v) => !v)}
          >
            <EyeIcon open={showConf} />
          </button>
        </div>
        {errors.confirm && touched.confirm && (
          <span className="input-error">{errors.confirm}</span>
        )}
      </div>

      {/* Submit */}
      <button type="submit" className="btn-main" disabled={loading}>
        {loading ? (
          <><div className="btn-spinner" />Création du compte…</>
        ) : (
          'Créer mon compte →'
        )}
      </button>

      {/* Login link */}
      <div className="divider">
        <div className="divider-line" />
        <span className="divider-text">Déjà inscrit ?</span>
        <div className="divider-line" />
      </div>
      <p className="link-row">
        <button type="button" className="link-btn" onClick={onLogin}>
          Se connecter
        </button>
      </p>
    </form>
  );
}
