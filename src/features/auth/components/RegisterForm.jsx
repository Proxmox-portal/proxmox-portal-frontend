import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { register } from "../services/authApi";
import { parseApiErrors } from "../services/errorParser";

export default function RegisterForm() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrors([]);

    // Validation locale
    if (!username || !email || !password || !confirm) {
      setErrors(["Tous les champs sont obligatoires."]);
      return;
    }
    if (password !== confirm) {
      setErrors(["Les mots de passe ne correspondent pas."]);
      return;
    }
    if (password.length < 8) {
      setErrors(["Le mot de passe doit contenir au moins 8 caractères."]);
      return;
    }

    try {
      setLoading(true);
      await register(username, email, password);
      navigate("/login", { state: { registered: true } });
    } catch (err) {
      setErrors(parseApiErrors(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-card">
      <div className="auth-card__header">
        <h1 className="auth-card__title">Créer un compte</h1>
        <p className="auth-card__subtitle">Rejoignez HomeCloud en quelques secondes</p>
      </div>

      <form className="auth-form" onSubmit={handleRegister} noValidate>
        <div className="form-group">
          <label htmlFor="username" className="form-label">Nom d'utilisateur</label>
          <input
            id="username"
            type="text"
            className="form-input"
            placeholder="john_doe"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
          />
        </div>

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

        <div className="form-group">
          <label htmlFor="password" className="form-label">Mot de passe</label>
          <input
            id="password"
            type="password"
            className="form-input"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
          {loading ? "Création en cours…" : "Créer mon compte"}
        </button>
      </form>

      <p className="auth-card__footer">
        Déjà un compte ?{" "}
        <Link to="/login" className="link">Se connecter</Link>
      </p>
    </div>
  );
}
