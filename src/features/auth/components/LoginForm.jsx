import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login } from "../services/authApi";
import { parseApiErrors } from "../services/errorParser";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrors([]);

    // Validation locale
    if (!email || !password) {
      setErrors(["Tous les champs sont obligatoires."]);
      return;
    }

    try {
      setLoading(true);
      const data = await login(email, password);
      localStorage.setItem("token", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);
      navigate("/home");
    } catch (err) {
      setErrors(parseApiErrors(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-card">
      <div className="auth-card__header">
        <h1 className="auth-card__title">Connexion</h1>
        <p className="auth-card__subtitle">Accédez à votre espace HomeCloud</p>
      </div>

      <form className="auth-form" onSubmit={handleLogin} noValidate>
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
            autoComplete="current-password"
          />
          <Link to="/forgot-password" className="form-hint-link">
            Mot de passe oublié ?
          </Link>
        </div>

        {errors.length > 0 && (
          <div className="error-list" role="alert">
            {errors.map((msg, i) => (
              <p key={i} className="error-item">{msg}</p>
            ))}
          </div>
        )}

        <button type="submit" className="btn btn--primary btn--full" disabled={loading}>
          {loading ? "Connexion en cours…" : "Se connecter"}
        </button>
      </form>

      <p className="auth-card__footer">
        Pas encore de compte ?{" "}
        <Link to="/register" className="link">Créer un compte</Link>
      </p>
    </div>
  );
}
