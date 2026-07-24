import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { logout } from "../features/auth/services/authApi";

const NAV_ITEMS = [
  { key: "dashboard", label: "Dashboard", path: "/home", enabled: true, icon: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>
  ) },
  { key: "vms", label: "Mes VMs", path: "/createvm", enabled: true, icon: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2" /><path d="M8 21h8M12 17v4" /></svg>
  ) },
  { key: "monitoring", label: "Monitoring", path: "/monitoring", enabled: false, icon: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22,12 18,12 15,21 9,3 6,12 2,12" /></svg>
  ) },
];

const ACCOUNT_ITEMS = [
  { key: "profil", label: "Mon profil", path: "/profil", enabled: false, icon: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" /></svg>
  ) },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    setMobileOpen(false);
    try {
      await logout();
    } catch (e) {
      // sécurité supplémentaire si jamais logout() lève malgré le try/finally interne
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
    } finally {
      navigate("/", { replace: true });
    }
  };

  const renderItem = (item) => {
    const active = location.pathname === item.path;
    return (
      <div
        key={item.key}
        className={`sb-nav-item ${active ? "active" : ""} ${!item.enabled ? "disabled" : ""}`}
        onClick={() => {
          if (!item.enabled) return;
          navigate(item.path);
          setMobileOpen(false);
        }}
      >
        {item.icon}
        {item.label}
        {!item.enabled && <span className="sb-soon">Bientôt</span>}
      </div>
    );
  };

  return (
    <>
      <style>{SIDEBAR_CSS}</style>

      {/* Bouton hamburger — visible uniquement en dessous de 820px (voir media query) */}
      <button
        className="sb-mobile-toggle"
        onClick={() => setMobileOpen((o) => !o)}
        aria-label="Ouvrir le menu"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>

      {/* Overlay derrière le tiroir mobile ouvert */}
      <div className={`sb-overlay ${mobileOpen ? "show" : ""}`} onClick={() => setMobileOpen(false)} />

      <div className={`sb-sidebar ${mobileOpen ? "open" : ""}`}>
        <div className="sb-logo-area">
          <div className="sb-logo-box">
            <div className="sb-logo-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" /></svg>
            </div>
            <div>
              <div className="sb-logo-text">HomeCloud</div>
              <div className="sb-logo-sub">VE Management</div>
            </div>
          </div>
        </div>

        <div className="sb-nav-section">Principal</div>
        {NAV_ITEMS.map(renderItem)}

        <div className="sb-nav-section">Compte</div>
        {ACCOUNT_ITEMS.map(renderItem)}

        <div className="sb-sidebar-footer">
          <div className="sb-avatar">U</div>
          <div className="sb-user-info">
            <div className="sb-user-name">Mon compte</div>
            <button className="sb-logout-btn" onClick={handleLogout}>Se déconnecter</button>
          </div>
        </div>
      </div>
    </>
  );
}

const SIDEBAR_CSS = `
.sb-sidebar{width:230px;background:#fff;border-right:1px solid #E8EDF8;display:flex;flex-direction:column;flex-shrink:0;height:100%;font-family:'DM Sans',system-ui,sans-serif}
.sb-logo-area{padding:20px 20px 16px;border-bottom:1px solid #E8EDF8}
.sb-logo-box{display:flex;align-items:center;gap:10px}
.sb-logo-icon{width:34px;height:34px;background:#2D5BE3;border-radius:9px;display:flex;align-items:center;justify-content:center}
.sb-logo-text{font-size:15px;font-weight:600;color:#0F1B3D}
.sb-logo-sub{font-size:10.5px;color:#9AAAC0;margin-top:1px}
.sb-nav-section{padding:16px 16px 5px;font-size:10px;font-weight:600;color:#C5CFDF;letter-spacing:.1em;text-transform:uppercase}
.sb-nav-item{display:flex;align-items:center;gap:10px;padding:9px 16px;cursor:pointer;font-size:13.5px;color:#5A6A88;border-left:3px solid transparent}
.sb-nav-item svg{width:16px;height:16px;flex-shrink:0}
.sb-nav-item.active{background:#EEF3FF;color:#2D5BE3;border-left-color:#2D5BE3;font-weight:500}
.sb-nav-item.disabled{color:#C5CFDF;cursor:not-allowed}
.sb-soon{margin-left:auto;font-size:9.5px;background:#F0F3FA;color:#B8C4D8;padding:2px 6px;border-radius:20px}
.sb-sidebar-footer{margin-top:auto;border-top:1px solid #E8EDF8;padding:14px 16px;display:flex;align-items:center;gap:10px}
.sb-avatar{width:32px;height:32px;border-radius:50%;background:#2D5BE3;color:#fff;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:600;flex-shrink:0}
.sb-user-info{display:flex;flex-direction:column;gap:3px;min-width:0}
.sb-user-name{font-size:12.5px;font-weight:500;color:#0F1B3D}
.sb-logout-btn{background:none;border:none;padding:0;font-size:11.5px;color:#DC2626;cursor:pointer;text-align:left}
.sb-logout-btn:hover{text-decoration:underline}

/* ===== Menu mobile (tiroir coulissant) — inactif au-dessus de 820px ===== */
.sb-mobile-toggle{display:none;position:fixed;top:12px;left:14px;z-index:1001;width:38px;height:38px;border-radius:9px;background:#2D5BE3;border:none;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 4px 10px rgba(45,91,227,.3)}
.sb-mobile-toggle svg{width:18px;height:18px;stroke:#fff}
.sb-overlay{display:none}
@media (max-width: 820px){
  .sb-mobile-toggle{display:flex}
  .sb-sidebar{position:fixed;top:0;left:0;height:100vh;z-index:1000;transform:translateX(-100%);transition:transform .25s ease;box-shadow:2px 0 20px rgba(15,27,61,.18)}
  .sb-sidebar.open{transform:translateX(0)}
  .sb-overlay{display:block;position:fixed;inset:0;background:rgba(15,27,61,0);pointer-events:none;z-index:999;transition:background .25s ease}
  .sb-overlay.show{background:rgba(15,27,61,.35);pointer-events:auto}
}
`;