import React, { useEffect, useState, useMemo } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { getAvailableOS, createVm } from "../features/provisioning/services/ProvisionService";

const CATEGORY_LABELS = {
  basic: "HomeCloud Lite",
  mid: "HomeCloud Basique",
  elite: "HomeCloud Pro",
};

const STEPS = ["Offre & OS", "Configuration", "Récapitulatif"];

export default function CreateVmPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const incoming = location.state || {};

  const [step, setStep] = useState(1);
  const [category, setCategory] = useState(incoming.categoryTech || "basic");
  const [templateId, setTemplateId] = useState(incoming.os || "");
  const [hostname, setHostname] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [osList, setOsList] = useState(null);
  const [osError, setOsError] = useState(null);
  const [errors, setErrors] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getAvailableOS()
      .then(setOsList)
      .catch(() => setOsError("Impossible de charger la liste des systèmes d'exploitation."));
  }, []);

  const filteredOs = useMemo(() => (osList || []).filter((os) => os.category === category), [osList, category]);
  const selectedOs = useMemo(() => filteredOs.find((os) => os.lxId === templateId), [filteredOs, templateId]);

  useEffect(() => {
    if (templateId && !filteredOs.some((os) => os.lxId === templateId)) setTemplateId("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, osList]);

  const goNext = () => {
    setErrors([]);
    if (step === 1 && !templateId) {
      setErrors(["Choisissez un système d'exploitation pour continuer."]);
      return;
    }
    if (step === 2) {
      if (!hostname || !/^[a-zA-Z0-9-]+$/.test(hostname)) {
        setErrors(["Le nom d'hôte ne doit contenir que des lettres, chiffres ou tirets."]);
        return;
      }
      if (!password || password.length < 8) {
        setErrors(["Le mot de passe doit contenir au moins 8 caractères."]);
        return;
      }
      if (password !== confirmPassword) {
        setErrors(["Les mots de passe ne correspondent pas."]);
        return;
      }
    }
    if (step < 3) setStep(step + 1);
    else handleSubmit();
  };

  const goBack = () => { setErrors([]); if (step > 1) setStep(step - 1); };
  const goToStep = (n) => { if (n < step) { setErrors([]); setStep(n); } };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      await createVm({ hostname, templateId, category, password });
      navigate("/home");
    } catch (err) {
      const fields = err.response?.data?.fields;
      setErrors(fields ? Object.values(fields) : [err.response?.data?.error || "Erreur de communication avec Proxmox."]);
      setSubmitting(false);
    }
  };

  return (
    <div className="cvm-shell">
      <Sidebar />
      <div className="cvm-page">
        <style>{CVM_CSS}</style>

        <div className="cvm-topbar">
          <div className="cvm-topbar-title">Créer un conteneur</div>
          <Link to="/home" className="cvm-cancel">Annuler</Link>
        </div>

        <div className="cvm-content">
        <div className="wizard-area">
          <div className="steps-nav">
            {STEPS.map((label, i) => {
              const n = i + 1;
              const state = n < step ? "done" : n === step ? "active" : "todo";
              return (
                <React.Fragment key={label}>
                  <div className={`step ${state}`} onClick={() => goToStep(n)}>
                    <div className="step-circle">{state === "done" ? "✓" : n}</div>
                    <div className="step-text">{label}</div>
                  </div>
                  {n < STEPS.length && <div className={`step-connector ${n < step ? "done" : ""}`} />}
                </React.Fragment>
              );
            })}
          </div>

          {step === 1 && (
            <div className="form-card">
              <div className="form-card-title">Offre et système d'exploitation</div>
              <div className="form-card-sub">La catégorie détermine les ressources allouées au conteneur.</div>

              <div className="form-row single" style={{ marginBottom: 20 }}>
                <div className="cat-row">
                  {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                    <div key={key} className={`cat-btn ${category === key ? "selected" : ""}`} onClick={() => setCategory(key)}>
                      {label}
                    </div>
                  ))}
                </div>
              </div>

              {osError && <div className="cvm-error-banner">{osError}</div>}
              {!osError && osList === null && <div className="hint">Chargement des OS disponibles…</div>}
              {!osError && osList !== null && filteredOs.length === 0 && (
                <div className="hint">Aucun OS disponible pour cette offre pour le moment.</div>
              )}
              <div className="iso-grid">
                {filteredOs.map((os) => (
                  <div key={os.lxId} className={`iso-card ${templateId === os.lxId ? "selected" : ""}`} onClick={() => setTemplateId(os.lxId)}>
                    <img
                      src={`/logos/${os.osType}.svg`}
                      alt={os.displayName}
                      className="iso-icon-img"
                      onError={(e) => { e.target.src = "/logos/linux.svg"; }}
                    />
                    <div><div className="iso-name">{os.displayName}</div></div>
                    <div className="check-icon"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><polyline points="20,6 9,17 4,12" /></svg></div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="form-card">
              <div className="form-card-title">Configuration du conteneur</div>
              <div className="form-card-sub">Définissez le nom d'hôte et le mot de passe root.</div>
              <div className="form-row single">
                <div className="form-group">
                  <label>Nom d'hôte</label>
                  <input type="text" placeholder="mon-serveur-db" value={hostname} onChange={(e) => setHostname(e.target.value)} />
                  <div className="hint">Lettres, chiffres et tirets uniquement.</div>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Mot de passe root</label>
                  <input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Confirmer le mot de passe</label>
                  <input type="password" placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="form-card">
              <div className="form-card-title">Récapitulatif et confirmation</div>
              <div className="form-card-sub">Vérifiez la configuration avant de créer le conteneur.</div>
              <div className="summary-grid">
                <div className="summary-item"><div className="sum-label">Offre</div><div className="sum-val">{CATEGORY_LABELS[category]}</div></div>
                <div className="summary-item"><div className="sum-label">Système d'exploitation</div><div className="sum-val">{selectedOs?.displayName || "—"}</div></div>
                <div className="summary-item"><div className="sum-label">Nom d'hôte</div><div className="sum-val">{hostname}</div></div>
                <div className="summary-item"><div className="sum-label">Mot de passe</div><div className="sum-val">••••••••</div></div>
              </div>
              <div className="info-box">
                <strong>ℹ Le conteneur sera créé en tâche de fond.</strong> Le statut passera de "creating" à "running" une fois l'extraction du template terminée.
              </div>
            </div>
          )}

          {errors.length > 0 && (
            <div className="cvm-error-banner">
              {errors.map((msg, i) => <div key={i}>{msg}</div>)}
            </div>
          )}

          <div className="wizard-actions">
            {step > 1 && <button className="btn-back" onClick={goBack}>← Retour</button>}
            <button className="btn-next" onClick={goNext} disabled={submitting}>
              {submitting ? "Création en cours…" : step === 3 ? "✓ Créer le conteneur" : "Suivant →"}
            </button>
          </div>
        </div>

        <div className="side-summary">
          <div className="sum-card">
            <div className="sum-title">Résumé</div>
            <div className="sum-row"><span className="sum-key">Offre</span><span className="sum-val-side">{CATEGORY_LABELS[category]}</span></div>
            <div className="sum-row"><span className="sum-key">OS</span><span className="sum-val-side">{selectedOs?.displayName || "—"}</span></div>
            <div className="sum-row"><span className="sum-key">Hostname</span><span className="sum-val-side">{hostname || "—"}</span></div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}

const CVM_CSS = `
.cvm-shell{display:flex;height:100vh;overflow:hidden;background:#F0F3FA}
.cvm-page{font-family:'DM Sans',system-ui,sans-serif;color:#0F1B3D;flex:1;min-width:0;overflow-y:auto}
.cvm-topbar{display:flex;align-items:center;justify-content:space-between;padding:0 26px;height:58px;background:#fff;border-bottom:1px solid #E8EDF8;position:sticky;top:0;z-index:5}
.cvm-topbar-title{font-size:16px;font-weight:600}
.cvm-cancel{color:#9AAAC0;font-size:13px;text-decoration:none}
.cvm-cancel:hover{color:#DC2626}
.cvm-content{max-width:960px;margin:0 auto;padding:30px 24px 80px;display:flex;gap:26px}
.wizard-area{flex:1;min-width:0}

.steps-nav{display:flex;align-items:center;margin-bottom:28px;position:relative}
.step{display:flex;flex-direction:column;align-items:center;gap:8px;flex:0 0 auto;cursor:pointer}
.step-circle{width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:600;border:2px solid #E8EDF8;background:#fff}
.step-text{font-size:12px;font-weight:500;color:#B8C4D8;white-space:nowrap}
.step.done .step-circle{background:#22C55E;border-color:#22C55E;color:#fff}
.step.done .step-text{color:#16A34A}
.step.active .step-circle{background:#2D5BE3;border-color:#2D5BE3;color:#fff;box-shadow:0 0 0 5px rgba(45,91,227,.12)}
.step.active .step-text{color:#2D5BE3;font-weight:600}
.step-connector{flex:1;height:2px;background:#E8EDF8;margin:0 8px}
.step-connector.done{background:#22C55E}

.form-card{background:#fff;border:1px solid #E8EDF8;border-radius:16px;padding:28px;margin-bottom:16px}
.form-card-title{font-size:16px;font-weight:600;margin-bottom:5px}
.form-card-sub{font-size:13px;color:#9AAAC0;margin-bottom:22px}
.form-row{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px}
.form-row.single{grid-template-columns:1fr}
.form-group{display:flex;flex-direction:column;gap:6px}
.form-group label{font-size:11.5px;font-weight:600;color:#4A5A78;text-transform:uppercase;letter-spacing:.07em}
.form-group input{border:1.5px solid #E2E8F5;border-radius:10px;padding:10px 13px;font-size:14px;font-family:'DM Sans',sans-serif;background:#FAFBFE;outline:none}
.form-group input:focus{border-color:#2D5BE3;background:#fff;box-shadow:0 0 0 4px rgba(45,91,227,.07)}
.hint{font-size:11.5px;color:#B8C4D8;margin:4px 0 12px}

.cat-row{display:flex;gap:10px}
.cat-btn{flex:1;border:1.5px solid #E2E8F5;border-radius:10px;padding:12px;text-align:center;font-size:13px;font-weight:500;color:#5A6A88;cursor:pointer;background:#FAFBFE}
.cat-btn.selected{border-color:#2D5BE3;background:#EEF3FF;color:#2D5BE3}

.iso-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}
.iso-card{border:1.5px solid #E2E8F5;border-radius:11px;padding:13px;cursor:pointer;display:flex;align-items:center;gap:11px;background:#FAFBFE}
.iso-card:hover{border-color:#2D5BE3;background:#F3F7FF}
.iso-card.selected{border-color:#2D5BE3;background:#EEF3FF;box-shadow:0 0 0 3px rgba(45,91,227,.08)}
.iso-icon-img{width:28px;height:28px;object-fit:contain;flex-shrink:0}
.iso-name{font-size:13px;font-weight:500}
.check-icon{margin-left:auto;width:18px;height:18px;border-radius:50%;background:#2D5BE3;display:flex;align-items:center;justify-content:center;flex-shrink:0;opacity:0}
.iso-card.selected .check-icon{opacity:1}

.summary-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:12px}
.summary-item{background:#F8FAFD;border-radius:10px;padding:14px 16px;border:1px solid #F0F3FA}
.sum-label{font-size:11px;font-weight:600;color:#9AAAC0;text-transform:uppercase;letter-spacing:.07em;margin-bottom:4px}
.sum-val{font-size:14px;font-weight:500}
.info-box{background:#F0F8FF;border:1px solid #BFDBFE;border-radius:10px;padding:14px 16px;margin-top:16px;font-size:13px;color:#1D4ED8}

.cvm-error-banner{background:#FEE2E2;color:#DC2626;border:1px solid #FDCECE;border-radius:10px;padding:12px 14px;font-size:13px;margin-bottom:16px;display:flex;flex-direction:column;gap:4px}

.wizard-actions{display:flex;justify-content:flex-end;gap:10px}
.btn-back{background:#fff;border:1.5px solid #E2E8F5;color:#5A6A88;border-radius:10px;padding:11px 20px;font-size:13.5px;font-weight:500;cursor:pointer}
.btn-next{background:#2D5BE3;border:none;color:#fff;border-radius:10px;padding:11px 22px;font-size:13.5px;font-weight:600;cursor:pointer}
.btn-next:hover{background:#2451CC}
.btn-next:disabled{opacity:.6;cursor:not-allowed}

.side-summary{width:240px;flex-shrink:0}
.sum-card{background:#fff;border:1px solid #E8EDF8;border-radius:16px;padding:22px;position:sticky;top:20px}
.sum-title{font-size:14px;font-weight:600;margin-bottom:16px;padding-bottom:10px;border-bottom:1px solid #F0F3FA}
.sum-row{display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid #F8FAFD;gap:8px}
.sum-row:last-child{border-bottom:none}
.sum-key{font-size:12.5px;color:#9AAAC0}
.sum-val-side{font-size:12.5px;font-weight:500;font-family:'DM Mono',monospace;text-align:right}
@media (max-width:760px){.cvm-content{flex-direction:column}.side-summary{width:100%}}
`;
