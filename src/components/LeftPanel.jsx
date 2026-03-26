import React from 'react';

const FEATURES = [
  'Création de VMs en quelques clics',
  'Monitoring temps réel CPU / RAM / Disque',
  'Accès terminal web noVNC intégré',
  'Authentification 2FA sécurisée',
  'Snapshots et clonage de VMs',
];

export default function LeftPanel() {
  return (
    <div className="auth-left">
      {/* Brand */}
      <div className="brand">
        <div className="brand-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
               stroke="#fff" strokeWidth="2">
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
          </svg>
        </div>
        <div>
          <div className="brand-name">ProxPortal</div>
          <div className="brand-sub">Proxmox VE Management</div>
        </div>
      </div>

      {/* Body */}
      <div className="left-body">
        <div className="left-title">
          Gérez vos machines virtuelles simplement
        </div>
        <div className="left-desc">
          Un portail web moderne et sécurisé pour provisionner,
          administrer et surveiller vos VMs Proxmox VE.
        </div>
        <ul className="feature-list" style={{ listStyle: 'none' }}>
          {FEATURES.map((f) => (
            <li key={f} className="feature-item">
              <span className="feature-dot" />
              {f}
            </li>
          ))}
        </ul>
      </div>

      {/* Footer */}
      <div className="left-footer">
        © 2026 ProxPortal — Portail académique Proxmox VE
      </div>
    </div>
  );
}
