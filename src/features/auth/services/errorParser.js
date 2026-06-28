/**
 * Extrait un tableau de messages d'erreur lisibles depuis une erreur Axios.
 * Gère les 3 cas définis dans le guide :
 *   A) Erreurs de validation des champs  → { fields: { email: "...", password: "..." } }
 *   B) Erreur globale de sécurité        → { error: "Bad credentials" }
 *   C) Coupure réseau / crash serveur    → err.response === undefined
 */
export function parseApiErrors(err) {
  if (!err.response) {
    return ["Impossible de joindre le serveur. Veuillez vérifier votre connexion."];
  }

  const data = err.response.data;

  // Cas A : erreurs de validation par champ
  if (data?.fields && typeof data.fields === "object") {
    return Object.values(data.fields);
  }

  // Cas B : erreur globale
  if (data?.error) {
    return [data.error];
  }

  // Fallback
  return ["Une erreur inattendue est survenue. Veuillez réessayer."];
}
