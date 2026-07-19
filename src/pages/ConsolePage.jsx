import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import RFB from "@novnc/novnc";

// Doit correspondre au host:port du backend Spring Boot (sans /api, car
// WebSocketConfig enregistre le handler à la racine : /ws/console/{id}).
const WS_BASE_URL = "ws://localhost:8080";

export default function ConsolePage() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const screenRef = useRef(null);
  const rfbRef = useRef(null);
  const socketRef = useRef(null);

  const [status, setStatus] = useState("connecting"); // connecting | connected | disconnected | error
  const [errorMsg, setErrorMsg] = useState(null);

  // Pas de session -> retour au dashboard.
  // NOTE : on attend désormais `state.vmId` (l'id interne du conteneur, celui
  // utilisé pour /hc/containers/{id}), PAS une "consoleUrl" — le backend n'en
  // renvoie pas. Le ticket VNC est récupéré côté serveur, directement dans le
  // handshake WebSocket (voir ProxmoxConsoleHandler).
  if (!state || !state.vmId) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, background: "#0F1B3D", color: "#fff" }}>
        <p style={{ color: "#9AAAC0" }}>Aucune session de console active trouvée.</p>
        <button onClick={() => navigate("/home")} style={{ background: "#2D5BE3", color: "#fff", border: "none", borderRadius: 10, padding: "10px 18px", cursor: "pointer" }}>
          Retourner au Dashboard
        </button>
      </div>
    );
  }

  useEffect(() => {
    let cancelled = false;

    const token = localStorage.getItem("token");
    const wsUrl = `${WS_BASE_URL}/ws/console/${state.vmId}?token=${token}`;

    console.log("[console] ouverture du WebSocket :", wsUrl);
    setStatus("connecting");
    setErrorMsg(null);

    const socket = new WebSocket(wsUrl);
    socketRef.current = socket;
    socket.binaryType = "arraybuffer";

    socket.onopen = () => {
      console.log("[console] WebSocket ouvert, en attente du ticket VNC...");
    };

    socket.onerror = (evt) => {
      console.error("[console] erreur WebSocket brute :", evt);
    };

    socket.onclose = (evt) => {
      console.log("[console] WebSocket brut fermé :", {
        code: evt.code,
        reason: evt.reason,
        wasClean: evt.wasClean,
      });
      // Si la socket se ferme AVANT même d'avoir reçu le ticket (donc avant
      // qu'un objet RFB existe), c'est que le backend a refusé la connexion :
      // non authentifié (1003/NOT_ACCEPTABLE) ou conteneur indisponible
      // (SERVER_ERROR) — voir ProxmoxConsoleHandler.afterConnectionEstablished.
      if (!cancelled && !rfbRef.current) {
        setStatus("error");
        setErrorMsg(
          evt.reason ||
            "Connexion refusée par le serveur. Le conteneur est peut-être arrêté ou votre session a expiré."
        );
      }
    };

    // Le premier message du backend n'est pas du protocole VNC : c'est le
    // ticket vncproxy de Proxmox. Il sert à la fois à ouvrir le WebSocket
    // ET, une fois dans le tunnel, de mot de passe RFB.
    socket.onmessage = (event) => {
      if (cancelled) return;

      const ticket = event.data;
      console.log("[console] ticket VNC reçu, longueur =", ticket?.length);

      socket.onmessage = null;

      console.log("[console] création de l'objet RFB...");
      const rfb = new RFB(screenRef.current, socket, {
        credentials: { password: ticket },
      });
      rfbRef.current = rfb;

      rfb.viewOnly = false;

      // --- Réglages de fluidité ---
      // Le serveur adapte sa résolution à la taille du conteneur DOM au lieu
      // de laisser le client re-scaler le canvas à chaque frame.
      rfb.resizeSession = true;
      rfb.scaleViewport = false;
      rfb.clipViewport = false;
      // Compression/qualité : plus bas = plus fluide, moins net.
      rfb.qualityLevel = 6;
      rfb.compressionLevel = 2;

      rfb.addEventListener("connect", () => {
        console.log("[console] NoVNC CONNECTÉ ✅");
        if (!cancelled) setStatus("connected");
      });

      rfb.addEventListener("disconnect", (evt) => {
        console.log("[console] NoVNC déconnecté :", evt?.detail);
        if (rfbRef.current === rfb) rfbRef.current = null;
        if (!cancelled) setStatus("disconnected");
      });

      rfb.addEventListener("securityfailure", (evt) => {
        console.error("[console] ÉCHEC d'authentification VNC :", evt?.detail);
        if (!cancelled) {
          setStatus("error");
          setErrorMsg("Échec d'authentification à la console (ticket VNC invalide ou expiré).");
        }
      });

      rfb.addEventListener("credentialsrequired", (evt) => {
        console.warn("[console] noVNC redemande des credentials :", evt?.detail);
      });
    };

    return () => {
      console.log("[console] nettoyage de l'effet (démontage ou StrictMode)");
      cancelled = true;

      if (rfbRef.current) {
        rfbRef.current.disconnect();
        rfbRef.current = null;
      } else if (socketRef.current && socketRef.current.readyState <= WebSocket.OPEN) {
        socketRef.current.close();
      }
      socketRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.vmId]);

  const statusColor =
    status === "connected" ? "#22C55E" :
    status === "connecting" ? "#F59E0B" :
    "#EF4444";

  const statusLabel =
    status === "connected" ? "Connecté" :
    status === "connecting" ? "Connexion en cours…" :
    status === "disconnected" ? "Déconnecté" :
    "Erreur";

  return (
    <div style={{ minHeight: "100vh", width: "100%", display: "flex", flexDirection: "column", background: "#0F1B3D" }}>
      <div style={{ background: "#0F1B3D", borderBottom: "1px solid #1A2D5A", padding: "12px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, color: "#fff", fontWeight: 600, fontSize: 13 }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: statusColor, flexShrink: 0 }} />
          Console NoVNC Sécurisée — {state.vmName} <span style={{ color: "#9AAAC0", fontWeight: 400 }}>({statusLabel})</span>
        </div>
        <button onClick={() => navigate("/home")} style={{ background: "#1A2D5A", color: "#fff", border: "none", borderRadius: 8, padding: "6px 14px", fontSize: 12, cursor: "pointer" }}>
          Fermer la console
        </button>
      </div>

      <div style={{ flex: 1, position: "relative", background: "#000" }}>
        {status === "error" && (
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, color: "#fff", zIndex: 2 }}>
            <p style={{ color: "#F87171" }}>{errorMsg}</p>
            <button onClick={() => navigate("/home")} style={{ background: "#2D5BE3", color: "#fff", border: "none", borderRadius: 10, padding: "10px 18px", cursor: "pointer" }}>
              Retourner au Dashboard
            </button>
          </div>
        )}

        {status === "connecting" && (
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "#9AAAC0", zIndex: 1, pointerEvents: "none" }}>
            Connexion à la console…
          </div>
        )}

        <div ref={screenRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />
      </div>
    </div>
  );
}