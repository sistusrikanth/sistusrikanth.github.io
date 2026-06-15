/** Cloud Run origin in production; empty locally (same-origin via proxy). */
export const API_ORIGIN = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");

export const API = API_ORIGIN ? `${API_ORIGIN}/api` : "/api";

export function assetUrl(path: string): string {
  if (!path || path.startsWith("http")) return path;
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return API_ORIGIN ? `${API_ORIGIN}${normalized}` : normalized;
}
