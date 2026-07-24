import React, { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import NetworkBackground from "../components/Networkbackground";

// Les 3 offres HomeCloud — la "category" doit correspondre exactement aux
// valeurs attendues par le backend dans CreateLxcRequest.category ("basic"|"mid"|"elite")
const OFFERS = [
  {
    category: "basic",
    name: "HomeCloud Lite",
    tagline: "Pour démarrer un petit projet ou tester rapidement un service.",
    vcpus: 1,
    ramGb: 1,
    diskGb: 8,
    highlight: false,
  },
  {
    category: "mid",
    name: "HomeCloud Basique",
    tagline: "Plus d'espace disque pour vos environnements de développement.",
    vcpus: 1,
    ramGb: 1,
    diskGb: 16,
    highlight: true,
  },
  {
    category: "elite",
    name: "HomeCloud Pro",
    tagline: "Plus de mémoire pour les charges applicatives plus lourdes.",
    vcpus: 1,
    ramGb: 2,
    diskGb: 16,
    highlight: false,
  },
];

export default function WelcomePage() {
  const navigate = useNavigate();

  // Un utilisateur déjà connecté n'a plus rien à faire sur le catalogue
  // public : il gère ses conteneurs depuis le Dashboard.
  useEffect(() => {
    if (localStorage.getItem("token")) {
      navigate("/home", { replace: true });
    }
  }, [navigate]);

  const handleSelectOffer = (offer) => {
    const state = { type: "lxc", categoryTech: offer.category, os: null };
    // Toujours passer par la connexion, même si une session existe déjà.
    navigate("/login", { state: { from: "/createvm", data: state } });
  };

  return (
    <div className="welcome-page">
      <style>{WELCOME_CSS}</style>
      <NetworkBackground />

      <header className="wp-header">
        <div className="wp-logo">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2D5BE3" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" /></svg>
          <span>Home<b>Cloud</b></span>
        </div>
        <Link to="/login" className="wp-login-link">Se connecter →</Link>
      </header>

      <section className="wp-hero">
        <span className="wp-eyebrow">Offres</span>
        <h1>Des machines virtuelles prêtes à l'emploi</h1>
        <p>Choisissez le profil de ressources adapté à votre projet.</p>
      </section>

      <section className="wp-plans">
        {OFFERS.map((offer) => (
          <div key={offer.category} className={`wp-card ${offer.highlight ? "wp-card--highlight" : ""}`}>
            {offer.highlight && <span className="wp-badge">Le plus choisi</span>}
            <h3>{offer.name}</h3>
            <p className="wp-tagline">{offer.tagline}</p>

            <ul className="wp-specs">
              <li><CheckIcon /> {offer.vcpus} vCPU</li>
              <li><CheckIcon /> {offer.ramGb} Go de RAM</li>
              <li><CheckIcon /> {offer.diskGb} Go de stockage</li>
            </ul>

            <button
              className={`wp-btn ${offer.highlight ? "wp-btn--primary" : ""}`}
              onClick={() => handleSelectOffer(offer)}
            >
              Obtenir {offer.name}
            </button>
          </div>
        ))}
      </section>
    </div>
  );
}

function CheckIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#2D5BE3" strokeWidth="3">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

const WELCOME_CSS = `
html, body, #root { height: 100%; }
.welcome-page{font-family:'DM Sans',system-ui,sans-serif;color:#0F1B3D;height:100vh;background:#fff;position:relative;overflow:hidden;display:flex;flex-direction:column;box-sizing:border-box}
.welcome-page::before{content:'';position:absolute;top:-160px;left:50%;transform:translateX(-50%);width:900px;height:420px;background:radial-gradient(closest-side,rgba(45,91,227,.10),transparent);pointer-events:none;z-index:0}

.wp-header{display:flex;align-items:center;justify-content:space-between;padding:16px 40px;border-bottom:1px solid #E8EDF8;position:relative;z-index:1;background:#fff;flex-shrink:0}
.wp-logo{display:flex;align-items:center;gap:8px;font-size:16px;font-weight:600}
.wp-logo svg{transition:transform .25s ease}
.wp-logo:hover svg{transform:rotate(-8deg) scale(1.08)}
.wp-logo b{color:#2D5BE3}
.wp-login-link{color:#2D5BE3;font-size:14px;font-weight:600;text-decoration:none;padding:8px 16px;border-radius:9px;transition:background .2s}
.wp-login-link:hover{background:#EEF3FF}

.wp-hero{text-align:center;padding:26px 24px 20px;max-width:620px;margin:0 auto;position:relative;z-index:1;flex-shrink:0}
.wp-eyebrow{display:inline-block;color:#2D5BE3;font-weight:700;font-size:12.5px;text-transform:uppercase;letter-spacing:.1em;background:#EEF3FF;padding:5px 14px;border-radius:20px}
.wp-hero h1{font-size:32px;font-weight:700;line-height:1.2;margin:14px 0 10px;color:#0F1B3D;letter-spacing:-.01em}
.wp-hero p{color:#4A5A78;font-size:16px;line-height:1.5}

.wp-plans{flex:1;min-height:0;display:grid;grid-template-columns:repeat(3,1fr);gap:22px;max-width:1040px;width:100%;margin:0 auto;padding:0 24px 28px;position:relative;z-index:1;box-sizing:border-box}
.wp-card{border:1.5px solid #E8EDF8;border-radius:18px;padding:22px 22px;position:relative;display:flex;flex-direction:column;background:#fff;transition:transform .25s cubic-bezier(.2,.8,.2,1),box-shadow .25s ease,border-color .25s ease;cursor:default;min-height:0}
.wp-card:hover{transform:translateY(-6px) scale(1.03);box-shadow:0 20px 40px rgba(15,27,61,.12);border-color:#C9D8FA;z-index:2}
.wp-card--highlight{border-color:#2D5BE3;box-shadow:0 10px 32px rgba(45,91,227,.14)}
.wp-card--highlight:hover{box-shadow:0 24px 48px rgba(45,91,227,.22)}
.wp-badge{position:absolute;top:-12px;right:20px;background:#2D5BE3;color:#fff;font-size:11px;font-weight:700;padding:5px 13px;border-radius:20px;box-shadow:0 4px 10px rgba(45,91,227,.35)}
.wp-card h3{font-size:19px;font-weight:700;margin-bottom:7px;color:#0F1B3D}
.wp-tagline{color:#5A6A88;font-size:13.5px;line-height:1.5;margin-bottom:16px}
.wp-specs{list-style:none;padding:0;margin:0 0 18px;display:flex;flex-direction:column;gap:10px}
.wp-specs li{display:flex;align-items:center;gap:9px;font-size:14.5px;color:#2A3B5C;font-weight:600}
.wp-specs li svg{flex-shrink:0;background:#EEF3FF;border-radius:50%;padding:3px;width:21px;height:21px;box-sizing:border-box}
.wp-btn{margin-top:auto;border:1.5px solid #E2E8F5;background:#fff;color:#2D5BE3;font-weight:600;font-size:13.5px;border-radius:11px;padding:12px;cursor:pointer;transition:all .2s ease}
.wp-btn:hover{border-color:#2D5BE3;background:#F5F8FF;transform:translateY(-1px)}
.wp-btn--primary{background:#2D5BE3;color:#fff;border-color:#2D5BE3;box-shadow:0 6px 16px rgba(45,91,227,.25)}
.wp-btn--primary:hover{background:#2451CC;box-shadow:0 8px 20px rgba(45,91,227,.35)}
@media (max-width:860px){.welcome-page{height:auto;overflow:auto}.wp-plans{grid-template-columns:1fr}.wp-hero h1{font-size:26px}.wp-card:hover{transform:translateY(-4px) scale(1.015)}}
`;