import { useState } from "react";
import { Link } from "react-router-dom";
import { forgotPassword } from "../services/authApi";
import { parseApiErrors } from "../services/errorParser";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState([]);
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors([]);
    setSuccessMsg("");

    if (!email) {
      setErrors(["Veuillez saisir votre adresse e-mail."]);
      return;
    }

    try {
      setLoading(true);
      const message = await forgotPassword(email);
      setSuccessMsg(message || "Si cet e-mail existe, un lien de réinitialisation vous a été envoyé.");
      setEmail("");
    } catch (err) {
      setErrors(parseApiErrors(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-card">
      <div className="auth-card__header">
        <h1 className="auth-card__title">Mot de passe oublié</h1>
        <p className="auth-card__subtitle">
          Saisissez votre e-mail pour recevoir un lien de réinitialisation.
        </p>
      </div>

      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <div className="form-group">
          <label htmlFor="email" className="form-label">Adresse e-mail</label>
          <input
            id="email"
            type="email"
            className="form-input"
            placeholder="vous@exemple.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
        </div>

        {errors.length > 0 && (
          <div className="error-list" role="alert">
            {errors.map((msg, i) => (
              <p key={i} className="error-item">{msg}</p>
            ))}
          </div>
        )}

        {successMsg && (
          <div className="success-box" role="status">
            <p>{successMsg}</p>
          </div>
        )}

        <button type="submit" className="btn btn--primary btn--full" disabled={loading}>
          {loading ? "Envoi en cours…" : "Envoyer le lien"}
        </button>
      </form>

      <p className="auth-card__footer">
        <Link to="/login" className="link">← Retour à la connexion</Link>
      </p>
    </div>
  );
}
