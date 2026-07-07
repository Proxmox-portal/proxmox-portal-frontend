import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function ConsolePage() {
  const { state } = useLocation();
  const navigate = useNavigate();

  if (!state || !state.consoleUrl) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, background: "#0F1B3D", color: "#fff" }}>
        <p style={{ color: "#9AAAC0" }}>Aucune session de console active trouvée.</p>
        <button onClick={() => navigate("/home")} style={{ background: "#2D5BE3", color: "#fff", border: "none", borderRadius: 10, padding: "10px 18px", cursor: "pointer" }}>
          Retourner au Dashboard
        </button>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", width: "100%", display: "flex", flexDirection: "column", background: "#0F1B3D" }}>
      <div style={{ background: "#0F1B3D", borderBottom: "1px solid #1A2D5A", padding: "12px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, color: "#fff", fontWeight: 600, fontSize: 13 }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#22C55E" }} />
          Console NoVNC Sécurisée — {state.vmName}
        </div>
        <button onClick={() => navigate("/home")} style={{ background: "#1A2D5A", color: "#fff", border: "none", borderRadius: 8, padding: "6px 14px", fontSize: 12, cursor: "pointer" }}>
          Fermer la console
        </button>
      </div>
      <div style={{ flex: 1, position: "relative" }}>
        <iframe
          src={state.consoleUrl}
          title={`Console NoVNC de ${state.vmName}`}
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: "none" }}
          allowFullScreen
          sandbox="allow-scripts allow-same-origin allow-forms"
        />
      </div>
    </div>
  );
}
