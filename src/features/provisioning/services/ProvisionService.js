// src/features/provisioning/services/ProvisionService.js
import { instance as apiClient } from '../../../api/axiosClient';

/**
 * 1. Récupère la liste globale des templates OS disponibles.
 * Endpoint public (utilisé sur la WelcomePage pour filtrer par catégorie).
 */
export async function getAvailableOS() {
  const resp = await apiClient.get('/hc/os-templates');
  return resp.data;
}

/**
 * 2. Soumet la demande de création d'un nouveau conteneur LXC.
 */
export async function createVm(vmParams) {
  const resp = await apiClient.post('/hc/containers', vmParams);
  return resp.data;
}

/**
 * 3. Récupère la liste de tous les conteneurs appartenant à l'utilisateur connecté.
 */
export async function listMyContainers() {
  const resp = await apiClient.get('/hc/containers');
  return resp.data;
}

/**
 * 4. Récupère les détails complets d'un conteneur spécifique par son ID.
 */
export async function getContainerDetails(id) {
  const resp = await apiClient.get(`/hc/containers/${id}`);
  return resp.data;
}

/**
 * 5. Démarre un conteneur LXC (Action asynchrone).
 */
export async function startVm(id) {
  const resp = await apiClient.post(`/hc/containers/${id}/start`);
  return resp.data;
}

/**
 * 6. Arrête un conteneur LXC.
 */
export async function stopVm(id) {
  const resp = await apiClient.post(`/hc/containers/${id}/stop`);
  return resp.data;
}

/**
 * 7. Supprime définitivement un conteneur LXC sur Proxmox et en base de données.
 */
export async function deleteVm(id) {
  const resp = await apiClient.delete(`/hc/containers/${id}`);
  return resp.data;
}

/**
 * 8. Récupère l'URL de console NoVNC et le ticket d'accès temporaire.
 */
export async function getVmConsole(id) {
  const resp = await apiClient.get(`/hc/containers/${id}/console`);
  return resp.data;
}
