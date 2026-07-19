// src/components/NetworkBackground.jsx
import { useEffect, useRef } from "react";

/**
 * Arrière-plan "circuit réseau" réutilisable : grille blueprint statique (CSS)
 * + un maillage dense de nœuds (canvas) avec quelques "hubs" (anneaux pulsants,
 * façon serveurs) et des paquets de données qui voyagent sur les liaisons.
 * Recherche de voisins par grille spatiale (pas de O(n²) même à haute densité).
 *
 * IMPORTANT : le conteneur parent doit avoir `position: relative` et
 * `overflow: hidden`, et le contenu au-dessus doit avoir `position: relative`
 * + `z-index: 1` (ou plus) pour apparaître devant ce fond (qui est en z-index: 0).
 *
 * Usage :
 *   <div className="auth-layout" style={{ position: "relative", overflow: "hidden" }}>
 *     <NetworkBackground />
 *     <div style={{ position: "relative", zIndex: 1 }}>
 *       ... contenu de la page ...
 *     </div>
 *   </div>
 */
export default function NetworkBackground({ intensity = 1 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const BRAND_RGB = "45, 91, 227"; // #2D5BE3
    const PULSE_RGB = "125, 211, 252"; // cyan clair pour les paquets de données
    const PARTICLE_COUNT = 200;
    const MAX_DIST = 105;
    const HUB_EVERY = 14; // 1 nœud sur N devient un "hub" plus visible
    const MAX_PACKETS = 34;

    let width, height, dpr;
    let particles = [];
    let packets = [];
    let grid = new Map();
    let animationId;
    let visible = true;
    let frame = 0;

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.offsetWidth;
      height = canvas.offsetHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function initParticles() {
      particles = Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        r: Math.random() * 1.3 + 0.7,
        hub: i % HUB_EVERY === 0,
      }));
      packets = [];
    }

    function buildGrid() {
      grid = new Map();
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const key = `${Math.floor(p.x / MAX_DIST)},${Math.floor(p.y / MAX_DIST)}`;
        if (!grid.has(key)) grid.set(key, []);
        grid.get(key).push(i);
      }
    }

    function forEachNearbyPair(callback) {
      const seen = new Set();
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const cx = Math.floor(p.x / MAX_DIST);
        const cy = Math.floor(p.y / MAX_DIST);
        for (let dx = -1; dx <= 1; dx++) {
          for (let dy = -1; dy <= 1; dy++) {
            const bucket = grid.get(`${cx + dx},${cy + dy}`);
            if (!bucket) continue;
            for (const j of bucket) {
              if (j <= i) continue;
              const pairKey = i * particles.length + j;
              if (seen.has(pairKey)) continue;
              seen.add(pairKey);
              callback(i, j);
            }
          }
        }
      }
    }

    function maybeSpawnPacket(i, j, dist) {
      if (packets.length >= MAX_PACKETS) return;
      // Priorité aux liaisons courtes et impliquant un hub -> lecture "flux de données serveur"
      const involvesHub = particles[i].hub || particles[j].hub;
      const chance = involvesHub ? 0.006 : 0.0012;
      if (dist < MAX_DIST * 0.85 && Math.random() < chance) {
        packets.push({ a: i, b: j, t: 0, speed: 0.012 + Math.random() * 0.018 });
      }
    }

    function step() {
      if (!visible) {
        animationId = requestAnimationFrame(step);
        return;
      }
      frame++;
      ctx.clearRect(0, 0, width, height);
      buildGrid();

      // Liaisons + spawn occasionnel de paquets de données
      forEachNearbyPair((i, j) => {
        const a = particles[i], b = particles[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist >= MAX_DIST) return;
        const alpha = (1 - dist / MAX_DIST) * 0.22;
        ctx.strokeStyle = `rgba(${BRAND_RGB}, ${alpha})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
        maybeSpawnPacket(i, j, dist);
      });

      // Paquets de données voyageant le long des liaisons actives
      for (let k = packets.length - 1; k >= 0; k--) {
        const pk = packets[k];
        const a = particles[pk.a], b = particles[pk.b];
        pk.t += pk.speed;
        if (pk.t >= 1) {
          packets.splice(k, 1);
          continue;
        }
        const px = a.x + (b.x - a.x) * pk.t;
        const py = a.y + (b.y - a.y) * pk.t;
        const glowAlpha = Math.sin(pk.t * Math.PI); // apparaît puis s'efface en douceur
        ctx.beginPath();
        ctx.arc(px, py, 1.8, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${PULSE_RGB}, ${glowAlpha})`;
        ctx.shadowColor = `rgba(${PULSE_RGB}, ${glowAlpha})`;
        ctx.shadowBlur = 6;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // Nœuds
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = width; else if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height; else if (p.y > height) p.y = 0;

        if (p.hub) {
          // Anneau pulsant façon "serveur actif"
          const pulse = (Math.sin(frame * 0.02 + p.x * 0.01) + 1) / 2; // 0..1
          ctx.beginPath();
          ctx.arc(p.x, p.y, 4 + pulse * 3, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(${BRAND_RGB}, ${0.25 + pulse * 0.2})`;
          ctx.lineWidth = 1;
          ctx.stroke();

          ctx.beginPath();
          ctx.arc(p.x, p.y, 2.1, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${BRAND_RGB}, 0.85)`;
          ctx.fill();
        } else {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${BRAND_RGB}, 0.5)`;
          ctx.fill();
        }
      }

      animationId = requestAnimationFrame(step);
    }

    function handleVisibility() {
      visible = !document.hidden;
    }

    function handleResize() {
      resize();
      initParticles();
    }

    resize();
    initParticles();

    if (!prefersReducedMotion) {
      animationId = requestAnimationFrame(step);
    } else {
      // Une seule frame statique, pas d'animation en continu.
      step();
      cancelAnimationFrame(animationId);
    }

    window.addEventListener("resize", handleResize);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  return (
    <>
      <style>{NETWORK_BG_CSS}</style>
      <div className="nb-tech-grid" style={{ opacity: intensity }} />
      <canvas ref={canvasRef} className="nb-network-bg" style={{ opacity: intensity }} />
    </>
  );
}

const NETWORK_BG_CSS = `
.nb-network-bg{position:absolute;inset:0;width:100%;height:100%;z-index:0;pointer-events:none}
.nb-tech-grid{
  position:absolute;inset:0;z-index:0;pointer-events:none;
  background-image:
    linear-gradient(rgba(45,91,227,0.07) 1px, transparent 1px),
    linear-gradient(90deg, rgba(45,91,227,0.07) 1px, transparent 1px);
  background-size:38px 38px;
  -webkit-mask-image:radial-gradient(ellipse at center, black 35%, transparent 85%);
  mask-image:radial-gradient(ellipse at center, black 35%, transparent 85%);
}
`;