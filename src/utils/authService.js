/**
 * authService.js
 * Tous les appels API vers le backend Spring Boot (auth-module).
 * Base URL configurable via la variable d'environnement VITE_API_URL.
 */

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080';

// ── Helpers ───────────────────────────────────────────────────────────────────

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const message =
      data.message || data.error || `Erreur ${res.status}`;
    throw new Error(message);
  }

  return data;
}

function setTokens({ accessToken, refreshToken }) {
  localStorage.setItem('access_token',  accessToken);
  localStorage.setItem('refresh_token', refreshToken);
}

export function clearTokens() {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
}

export function getAccessToken() {
  return localStorage.getItem('access_token');
}

// ── Auth endpoints ────────────────────────────────────────────────────────────

/**
 * POST /auth/register
 * Crée un compte et envoie l'email de confirmation.
 */
export async function register({ username, email, password }) {
  return request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ username, email, password }),
  });
}

/**
 * POST /auth/login
 * Vérifie email + mot de passe.
 * Si 2FA activé → retourne { requires2FA: true }
 * Sinon          → retourne { accessToken, refreshToken }
 */
export async function login({ email, password }) {
  const data = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

  if (!data.requires2FA) {
    setTokens(data);
  }

  return data;   // { requires2FA, userId? } ou { accessToken, refreshToken }
}

/**
 * POST /auth/verify-2fa
 * Valide le code TOTP à 6 chiffres.
 * Retourne { accessToken, refreshToken }.
 */
export async function verify2FA({ userId, code }) {
  const data = await request('/auth/verify-2fa', {
    method: 'POST',
    body: JSON.stringify({ userId, code }),
  });
  setTokens(data);
  return data;
}

/**
 * POST /auth/forgot-password
 * Envoie un lien de réinitialisation par email.
 * Réponse générique (sécurité : ne révèle pas si l'email existe).
 */
export async function forgotPassword({ email }) {
  return request('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

/**
 * POST /auth/reset-password
 * Réinitialise le mot de passe via le token reçu par email.
 */
export async function resetPassword({ token, password }) {
  return request('/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({ token, password }),
  });
}

/**
 * POST /auth/refresh
 * Rafraîchit l'access token via le refresh token.
 */
export async function refreshAccessToken() {
  const refreshToken = localStorage.getItem('refresh_token');
  if (!refreshToken) throw new Error('Aucun refresh token disponible.');

  const data = await request('/auth/refresh', {
    method: 'POST',
    body: JSON.stringify({ refreshToken }),
  });

  setTokens(data);
  return data.accessToken;
}
