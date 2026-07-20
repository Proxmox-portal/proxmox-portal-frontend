 
import { useState } from "react";
import { changePassword } from "../services/authApi";
import { parseApiErrors } from "../services/errorParser";

export default function ChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState([]);
  const [success, setSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors([]);
    setSuccess(false);

    if (!currentPassword || !newPassword || !confirm) {
      setErrors(["Tous les champs sont obligatoires."]);
      return;
    }
    if (newPassword !== confirm) {
      setErrors(["Les nouveaux mots de passe ne correspondent pas."]);
      return;
    }
    if (newPassword.length < 8) {
      setErrors(["Le nouveau mot de passe doit contenir au moins 8 caractères."]);
      return;
    }

    try {
      setSaving(true);
      await changePassword(currentPassword, newPassword);
      setSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirm("");
    } catch (err) {
      setErrors(parseApiErrors(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Changer le mot de passe</h2>

      {success && <div className="success-box" role="status">Mot de passe modifié avec succès.</div>}
      {errors.length > 0 && (
        <div className="error-box" role="alert">
          {errors.map((msg, i) => <p key={i}>{msg}</p>)}
        </div>
      )}

      <label>Mot de passe actuel</label>
      <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />

      <label>Nouveau mot de passe</label>
      <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />

      <label>Confirmer le nouveau mot de passe</label>
      <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />

      <button type="submit" disabled={saving}>
        {saving ? "Enregistrement..." : "Changer le mot de passe"}
      </button>
    </form>
  );
}