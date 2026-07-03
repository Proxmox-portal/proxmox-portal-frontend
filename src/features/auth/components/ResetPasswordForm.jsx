import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { resetPassword } from "../services/authApi";
import { parseApiErrors } from "../services/errorParser";

export default function ResetPasswordForm() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";

  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors([]);

    if (!newPassword || !confirm) {
      setErrors(["Tous les champs sont obligatoires."]);
      return;
    }
    if (newPassword !== confirm) {
      setErrors(["Les mots de passe ne correspondent pas."]);
      return;
    }
    if (newPassword.length < 8) {
      setErrors(["Le mot de passe doit contenir au moins 8 caractères."]);
      return;
    }
    if (!token) {
      setErrors(["Lien de réinitialisation invalide ou expiré."]);
      return;
    }

    try {
      setLoading(true);
      await resetPassword(token, newPassword);
      navigate("/login", { state: { passwordReset: true } });
    } catch (err) {
      setErrors(parseApiErrors(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-card">
      <div className="auth-card__header">
        <h1 className="auth-card__title">Nouveau mot de passe</h1>
        <p className="auth-card__subtitle">Choisissez un mot de passe sécurisé.</p>
      </div>

      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <div className="form-group">
          <label htmlFor="newPassword" className="form-label">Nouveau mot de passe</label>
          <input
            id="newPassword"
            type="password"
            className="form-input"
            placeholder="••••••••"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            autoComplete="new-password"
          />
        </div>

        <div className="form-group">
          <label htmlFor="confirm" className="form-label">Confirmer le mot de passe</label>
          <input
            id="confirm"
            type="password"
            className="form-input"
            placeholder="••••••••"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            autoComplete="new-password"
          />
        </div>

        {errors.length > 0 && (
          <div className="error-list" role="alert">
            {errors.map((msg, i) => (
              <p key={i} className="error-item">{msg}</p>
            ))}
          </div>
        )}

        <button type="submit" className="btn btn--primary btn--full" disabled={loading}>
          {loading ? "Réinitialisation…" : "Réinitialiser le mot de passe"}
        </button>
      </form>

      <p className="auth-card__footer">
        <Link to="/login" className="link">← Retour à la connexion</Link>
      </p>
    </div>
  );
}
