import { useEffect, useState } from "react";
import { getProfile, updateProfile } from "../services/authApi";
import { parseApiErrors } from "../services/errorParser";

export default function ProfileForm() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState([]);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const data = await getProfile();
        setUsername(data.username);
        setEmail(data.email);
      } catch (err) {
        setErrors(parseApiErrors(err));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors([]);
    setSuccess(false);

    if (!username || !email) {
      setErrors(["Tous les champs sont obligatoires."]);
      return;
    }

    try {
      setSaving(true);
      await updateProfile(username, email);
      setSuccess(true);
    } catch (err) {
      setErrors(parseApiErrors(err));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p>Chargement du profil...</p>;

  return (
    <form onSubmit={handleSubmit}>
      <h2>Mon profil</h2>

      {success && <div className="success-box" role="status">Profil mis à jour avec succès.</div>}
      {errors.length > 0 && (
        <div className="error-box" role="alert">
          {errors.map((msg, i) => <p key={i}>{msg}</p>)}
        </div>
      )}

      <label>Nom d'utilisateur</label>
      <input value={username} onChange={(e) => setUsername(e.target.value)} />

      <label>Adresse e-mail</label>
      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />

      <button type="submit" disabled={saving}>
        {saving ? "Enregistrement..." : "Enregistrer"}
      </button>
    </form>
  );
}