import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import {
  listMyContainers,
  startVm,
  stopVm,
  deleteVm,
  getVmConsole,
} from "../features/provisioning/services/ProvisionService";

// Couleurs de statut alignées sur le contrat réel (VmResponse.status: running | stopped | creating)
const STATUS_META = {
  running: { label: "Running", color: "#22C55E", pillBg: "#DCFCE7", pillFg: "#16A34A" },
  stopped: { label: "Stopped", color: "#EF4444", pillBg: "#FEE2E2", pillFg: "#DC2626" },
  starting: { label: "Starting…", color: "#2D5BE3", pillBg: "#EEF3FF", pillFg: "#2D5BE3" },


};

function formatDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" }) +
    " à " + d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}

export default function HomePage() {
  const navigate = useNavigate();
  const [containers, setContainers] = useState(null); // null = pas encore chargé
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const fetchContainers = useCallback(async () => {
    try {
      const data = await listMyContainers();
      setContainers(data);
      setError(null);
    } catch (e) {
      setError("Impossible de récupérer vos conteneurs.");
    }
  }, []);

  useEffect(() => {
    fetchContainers();
    // Les conteneurs en cours de création changent d'état côté Proxmox : on rafraîchit régulièrement.
    const interval = setInterval(fetchContainers, 5000);
    return () => clearInterval(interval);
  }, [fetchContainers]);

  const handleAction = async (id, actionFn) => {
    setActionLoadingId(id);
    try {
      await actionFn(id);
      await fetchContainers();
    } catch (e) {
      alert("L'action a échoué. Réessayez dans un instant.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Supprimer définitivement "${name}" ? Cette action est irréversible.`)) return;
    await handleAction(id, deleteVm);
  };

  const handleConsole = async (container) => {
    try {
      const { url } = await getVmConsole(container.id);
      navigate("/console", { state: { consoleUrl: url, vmName: container.name } });
    } catch (e) {
      alert("Impossible d'ouvrir la console. Le conteneur est peut-être encore en cours de démarrage.");
    }
  };

  const filtered = useMemo(() => {
    if (!containers) return [];
    return containers.filter((c) => {
      const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "all" || c.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [containers, search, statusFilter]);

  // Compteurs dérivés de la liste chargée — aucune métrique temps réel n'existe côté API,
  // donc pas de %CPU/%RAM live : on ne montre que ce que le backend fournit réellement.
  const counts = useMemo(() => {
    const base = { all: 0, running: 0, stopped: 0, creating: 0 };
    (containers || []).forEach((c) => { base.all++; base[c.status] = (base[c.status] || 0) + 1; });
    return base;
  }, [containers]);

  const totals = useMemo(() => {
    return (containers || []).reduce(
      (acc, c) => ({
        vcpus: acc.vcpus + (c.vcpus || 0),
        memoryMb: acc.memoryMb + (c.memoryMb || 0),
        diskGb: acc.diskGb + (c.diskGb || 0),
      }),
      { vcpus: 0, memoryMb: 0, diskGb: 0 }
    );
  }, [containers]);

  return (
    <div className="hc-app-shell">
      <Sidebar />
      <div className="hc-dashboard">
        <style>{DASHBOARD_CSS}</style>

        <div className="topbar">
          <div className="topbar-title">Tableau de bord</div>
          <div className="search-box">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#B8C4D8" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
            <input type="text" placeholder="Rechercher un conteneur..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <button className="btn-create" onClick={() => navigate("/createvm")}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><path d="M12 5v14M5 12h14" /></svg>
          Créer une machine
        </button>
      </div>

      <div className="content">
        {error && <div className="error-banner">{error}</div>}

        <div className="stats-row">
          <div className="stat-card green">
            <div className="stat-label">Machines actives</div>
            <div className="stat-val">{counts.running}</div>
            <div className="stat-sub">Running</div>
          </div>
          <div className="stat-card red">
            <div className="stat-label">Machines arrêtées</div>
            <div className="stat-val">{counts.stopped}</div>
            <div className="stat-sub">Stopped</div>
          </div>
          <div className="stat-card blue">
            <div className="stat-label">vCPU alloués</div>
            <div className="stat-val">{totals.vcpus}</div>
            <div className="stat-sub">sur l'ensemble de vos conteneurs</div>
          </div>
          <div className="stat-card amber">
            <div className="stat-label">RAM allouée</div>
            <div className="stat-val">{(totals.memoryMb / 1024).toFixed(1)} Go</div>
            <div className="stat-sub">{totals.diskGb} Go de disque alloués</div>
          </div>
        </div>

        <div className="section-header">
          <div className="section-title">Mes machines</div>
          <div className="section-actions">
            <button className={`filter-btn ${statusFilter === "all" ? "active" : ""}`} onClick={() => setStatusFilter("all")}>Tous ({counts.all})</button>
            <button className={`filter-btn ${statusFilter === "running" ? "active" : ""}`} onClick={() => setStatusFilter("running")}>Running ({counts.running || 0})</button>
            <button className={`filter-btn ${statusFilter === "stopped" ? "active" : ""}`} onClick={() => setStatusFilter("stopped")}>Stopped ({counts.stopped || 0})</button>
          </div>
        </div>

        <div className="vm-table">
          <div className="table-head">
            <span>Conteneur</span><span>Statut</span><span>vCPU</span><span>RAM</span><span>Disque</span><span>Adresse IP</span><span>Créé le</span><span>Actions</span>
          </div>

          {containers === null && <div className="table-empty">Chargement…</div>}

          {containers !== null && filtered.length === 0 && (
            <div className="table-empty">Aucun conteneur ne correspond à cette recherche.</div>
          )}

          {filtered.map((c) => {
            const meta = STATUS_META[c.status] || STATUS_META.stopped;
            const busy = actionLoadingId === c.id;
            return (
              <div className="table-row" key={c.id}>
                <div className="vm-name-cell">
                  <div className="vm-color" style={{ background: meta.color }} />
                  <div>
                    <div className="vm-name">{c.name}</div>
                    <div className="vm-id">#{c.vmId} · {c.nodeName}</div>
                  </div>
                </div>
                <div><span className="status-pill" style={{ background: meta.pillBg, color: meta.pillFg }}><span className="s-dot" style={{ background: meta.color }} />{meta.label}</span></div>
                <div className="cell-mono">{c.vcpus} vCPU</div>
                <div className="cell-mono">{(c.memoryMb / 1024).toFixed(1)} Go</div>
                <div className="cell-mono">{c.diskGb} Go</div>
                <div className="cell-mono">{c.ipAddress || "—"}</div>
                <div className="cell-mono" style={{ fontSize: 11, color: "#9AAAC0" }}>{formatDate(c.createdAt)}</div>
                <div className="actions-cell">
                  {c.status === "creating" && <span className="creating-hint">Création en cours…</span>}
                  {c.status === "running" && (
                    <>
                      <button className="act" title="Console noVNC" disabled={busy} onClick={() => handleConsole(c)}>
                        <svg viewBox="0 0 24 24" fill="none" strokeWidth="2"><path d="M4 17l6-6-6-6" /><path d="M12 19h8" /></svg>
                      </button>
                      <button className="act danger" title="Arrêter" disabled={busy} onClick={() => handleAction(c.id, stopVm)}>
                        <svg viewBox="0 0 24 24" fill="none" strokeWidth="2"><rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" /></svg>
                      </button>
                    </>
                  )}
                  {c.status === "stopped" && (
                    <button className="act" title="Démarrer" disabled={busy} onClick={() => handleAction(c.id, startVm)}>
                      <svg viewBox="0 0 24 24" fill="none" strokeWidth="2"><polygon points="5,3 19,12 5,21" /></svg>
                    </button>
                  )}
                  {c.status !== "creating" && (
                    <button className="act danger" title="Supprimer" disabled={busy} onClick={() => handleDelete(c.id, c.name)}>
                      <svg viewBox="0 0 24 24" fill="none" strokeWidth="2"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" /></svg>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
    </div>
  );
}

const DASHBOARD_CSS = `
.hc-app-shell{display:flex;height:100vh;overflow:hidden;background:#F0F3FA}
.hc-dashboard{font-family:'DM Sans',system-ui,sans-serif;color:#0F1B3D;display:flex;flex-direction:column;flex:1;min-width:0}
.hc-dashboard .topbar{background:#fff;border-bottom:1px solid #E8EDF8;padding:0 26px;height:58px;display:flex;align-items:center;gap:14px;flex-shrink:0}
.hc-dashboard .topbar-title{font-size:16px;font-weight:600;flex:1}
.hc-dashboard .search-box{display:flex;align-items:center;gap:8px;background:#F3F6FC;border:1px solid #E8EDF8;border-radius:9px;padding:7px 13px;width:220px}
.hc-dashboard .search-box input{border:none;background:transparent;font-size:13px;color:#0F1B3D;outline:none;width:100%;font-family:'DM Sans',sans-serif}
.hc-dashboard .btn-create{display:flex;align-items:center;gap:7px;background:#2D5BE3;color:#fff;border:none;border-radius:9px;padding:9px 16px;font-size:13px;font-weight:500;cursor:pointer}
.hc-dashboard .content{flex:1;overflow-y:auto;padding:24px 26px}
.hc-dashboard .error-banner{background:#FEE2E2;color:#DC2626;border:1px solid #FDCECE;border-radius:10px;padding:10px 14px;font-size:13px;margin-bottom:16px}
.hc-dashboard .stats-row{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:22px}
.hc-dashboard .stat-card{background:#fff;border:1px solid #E8EDF8;border-radius:14px;padding:18px 20px;position:relative}
.hc-dashboard .stat-card::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;border-radius:14px 14px 0 0}
.hc-dashboard .stat-card.green::before{background:#22C55E}
.hc-dashboard .stat-card.red::before{background:#EF4444}
.hc-dashboard .stat-card.blue::before{background:#2D5BE3}
.hc-dashboard .stat-card.amber::before{background:#F59E0B}
.hc-dashboard .stat-label{font-size:12px;color:#9AAAC0;font-weight:500;margin-bottom:8px}
.hc-dashboard .stat-val{font-size:28px;font-weight:600;line-height:1}
.hc-dashboard .stat-sub{font-size:12px;color:#9AAAC0;margin-top:6px}
.hc-dashboard .section-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:14px}
.hc-dashboard .section-title{font-size:15px;font-weight:600}
.hc-dashboard .section-actions{display:flex;gap:8px}
.hc-dashboard .filter-btn{padding:7px 12px;border-radius:8px;border:1px solid #E8EDF8;background:#fff;font-size:12px;color:#5A6A88;cursor:pointer}
.hc-dashboard .filter-btn.active{background:#EEF3FF;border-color:#2D5BE3;color:#2D5BE3;font-weight:500}
.hc-dashboard .vm-table{background:#fff;border:1px solid #E8EDF8;border-radius:14px;overflow:hidden}
.hc-dashboard .table-head{display:grid;grid-template-columns:2fr 1fr .8fr 1fr .8fr 1.2fr 1.4fr 120px;padding:12px 20px;background:#F8FAFD;border-bottom:1px solid #E8EDF8;font-size:11px;font-weight:600;color:#9AAAC0;text-transform:uppercase;letter-spacing:.07em}
.hc-dashboard .table-row{display:grid;grid-template-columns:2fr 1fr .8fr 1fr .8fr 1.2fr 1.4fr 120px;padding:14px 20px;border-bottom:1px solid #F2F5FC;align-items:center}
.hc-dashboard .table-row:last-child{border-bottom:none}
.hc-dashboard .table-empty{padding:32px 20px;text-align:center;color:#9AAAC0;font-size:13px}
.hc-dashboard .vm-name-cell{display:flex;align-items:center;gap:10px}
.hc-dashboard .vm-color{width:8px;height:8px;border-radius:50%;flex-shrink:0}
.hc-dashboard .vm-name{font-size:13.5px;font-weight:500}
.hc-dashboard .vm-id{font-size:11px;color:#B8C4D8;font-family:'DM Mono',monospace;margin-top:2px}
.hc-dashboard .status-pill{display:inline-flex;align-items:center;gap:5px;padding:4px 10px;border-radius:20px;font-size:12px;font-weight:500}
.hc-dashboard .s-dot{width:6px;height:6px;border-radius:50%;display:inline-block}
.hc-dashboard .cell-mono{font-size:12.5px;font-family:'DM Mono',monospace;color:#3D4F6E}
.hc-dashboard .actions-cell{display:flex;gap:5px}
.hc-dashboard .creating-hint{font-size:11px;color:#9AAAC0;font-style:italic}
.hc-dashboard .act{width:30px;height:30px;border-radius:7px;border:1px solid #E8EDF8;background:#fff;display:flex;align-items:center;justify-content:center;cursor:pointer}
.hc-dashboard .act svg{width:13px;height:13px;stroke:#5A6A88}
.hc-dashboard .act:hover{background:#EEF3FF;border-color:#2D5BE3}
.hc-dashboard .act:hover svg{stroke:#2D5BE3}
.hc-dashboard .act.danger:hover{background:#FEE2E2;border-color:#FDCECE}
.hc-dashboard .act.danger:hover svg{stroke:#DC2626}
.hc-dashboard .act:disabled{opacity:.4;cursor:not-allowed}
`;
