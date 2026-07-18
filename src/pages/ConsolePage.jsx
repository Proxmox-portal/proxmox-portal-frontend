import { useEffect, useRef } from "react";
// CORRECTION ICI : On importe directement depuis `@novnc/novnc`
import RFB from "@novnc/novnc";

export default function ConsolePage() {
    const screenRef = useRef(null);
    const rfbRef = useRef(null);
    const socketRef = useRef(null);

    useEffect(() => {
        let cancelled = false;

        const token = localStorage.getItem("token");
        const wsUrl = `ws://localhost:8080/ws/console/18?token=${token}`;

        console.log("[console] ouverture du WebSocket :", wsUrl);

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
        };

        // On ouvre nous-mêmes le WebSocket (au lieu de laisser noVNC le faire),
        // car le tout premier message envoyé par le backend n'est PAS du protocole
        // VNC : c'est le ticket vncproxy de Proxmox. Ce même ticket authentifie à
        // la fois l'ouverture du WebSocket ET, une fois à l'intérieur du tunnel,
        // sert de mot de passe RFB (fonctionnement propre de Proxmox). Sans ce mot
        // de passe, noVNC reste bloqué en silence à l'étape d'authentification.
        socket.onmessage = (event) => {
            if (cancelled) return;

            const ticket = event.data;
            console.log("[console] ticket VNC reçu, longueur =", ticket?.length);

            // On rend la main à noVNC à partir de maintenant : tous les messages
            // suivants sur cette connexion seront du vrai protocole RFB.
            socket.onmessage = null;

            console.log("[console] création de l'objet RFB...");
            const rfb = new RFB(screenRef.current, socket, {
                credentials: { password: ticket },
            });
            rfbRef.current = rfb;

            rfb.viewOnly = false;
            rfb.scaleViewport = true;

            rfb.addEventListener("connect", () => {
                console.log("[console] NoVNC CONNECTÉ ✅");
            });

            rfb.addEventListener("disconnect", (evt) => {
                console.log("[console] NoVNC déconnecté :", evt?.detail);
                if (rfbRef.current === rfb) {
                    rfbRef.current = null;
                }
            });

            rfb.addEventListener("securityfailure", (evt) => {
                console.error("[console] ÉCHEC d'authentification VNC :", evt?.detail);
            });

            rfb.addEventListener("credentialsrequired", (evt) => {
                console.warn(
                    "[console] noVNC redemande des credentials (ne devrait pas arriver) :",
                    evt?.detail
                );
            });
        };

        return () => {
            // Nettoyage propre quand le composant React se démonte (ou lors du
            // second passage de StrictMode en dev — dans ce cas cette fonction est
            // appelée quasi immédiatement après le montage, avant même que le
            // ticket ait pu arriver : on ferme alors la socket brute directement).
            console.log("[console] nettoyage de l'effet (démontage ou StrictMode)");
            cancelled = true;

            if (rfbRef.current) {
                rfbRef.current.disconnect();
                rfbRef.current = null;
            } else if (
                socketRef.current &&
                socketRef.current.readyState <= WebSocket.OPEN
            ) {
                socketRef.current.close();
            }
            socketRef.current = null;
        };
    }, []);

    return (
        <div
            ref={screenRef}
            style={{
                width: "100vw",
                height: "100vh",
                background: "black"
            }}
        />
    );
}