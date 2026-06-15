import type {
  Article,
  DayEntry,
  Education,
  Experience,
  ExperienceProject,
  ExperienceProjectDetail,
  IdentityCard,
  InspirationItem,
  InspirationToday,
  PhotoLink,
  Project,
  SiteConfig,
  StartupIdea,
  WeekSummary,
  WorkExperience,
} from "./types";
import { API } from "./config";

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || "Request failed");
  }
  return res.json();
}

function authHeaders(token: string): HeadersInit {
  return { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
}

export const api = {
  getConfig: () => fetchJson<SiteConfig>(`${API}/config`),

  getArticles: (category?: string) =>
    fetchJson<Article[]>(`${API}/articles${category ? `?category=${category}` : ""}`),

  getFeaturedArticle: () => fetchJson<Article[]>(`${API}/articles?featured=true`),

  getArticle: (slug: string) => fetchJson<Article>(`${API}/articles/${slug}`),

  getPhotos: (category?: string) =>
    fetchJson<PhotoLink[]>(`${API}/photos${category ? `?category=${category}` : ""}`),

  getProjects: () => fetchJson<Project[]>(`${API}/projects`),

  getIdeas: () => fetchJson<StartupIdea[]>(`${API}/ideas`),

  login: (password: string) =>
    fetchJson<{ access_token: string }>(`${API}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    }),

  adminGetArticles: (token: string) =>
    fetchJson<Article[]>(`${API}/admin/articles`, { headers: authHeaders(token) }),

  createArticle: (token: string, data: Partial<Article>) =>
    fetchJson<Article>(`${API}/admin/articles`, {
      method: "POST",
      headers: authHeaders(token),
      body: JSON.stringify(data),
    }),

  updateArticle: (token: string, id: number, data: Partial<Article>) =>
    fetchJson<Article>(`${API}/admin/articles/${id}`, {
      method: "PUT",
      headers: authHeaders(token),
      body: JSON.stringify(data),
    }),

  deleteArticle: (token: string, id: number) =>
    fetchJson<{ ok: boolean }>(`${API}/admin/articles/${id}`, {
      method: "DELETE",
      headers: authHeaders(token),
    }),

  uploadAttachment: async (token: string, file: File) => {
    const form = new FormData();
    form.append("file", file);
    const res = await fetch(`${API}/admin/uploads`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: res.statusText }));
      throw new Error(err.detail || "Upload failed");
    }
    return res.json() as Promise<{ url: string; filename: string; kind: "image" | "excalidraw" }>;
  },

  createPhoto: (token: string, data: { title: string; instagram_url: string; category: string }) =>
    fetchJson<PhotoLink>(`${API}/admin/photos`, {
      method: "POST",
      headers: authHeaders(token),
      body: JSON.stringify(data),
    }),

  deletePhoto: (token: string, id: number) =>
    fetchJson<{ ok: boolean }>(`${API}/admin/photos/${id}`, {
      method: "DELETE",
      headers: authHeaders(token),
    }),

  getDayEntries: (token: string) =>
    fetchJson<DayEntry[]>(`${API}/admin/days`, { headers: authHeaders(token) }),

  getDayEntry: (token: string, date: string) =>
    fetchJson<DayEntry>(`${API}/admin/days/${date}`, { headers: authHeaders(token) }),

  saveDayEntry: (token: string, date: string, data: { personal: string; professional: string }) =>
    fetchJson<DayEntry>(`${API}/admin/days/${date}`, {
      method: "PUT",
      headers: authHeaders(token),
      body: JSON.stringify({ entry_date: date, ...data }),
    }),

  deleteDayEntry: (token: string, date: string) =>
    fetchJson<{ ok: boolean }>(`${API}/admin/days/${date}`, {
      method: "DELETE",
      headers: authHeaders(token),
    }),

  getWeekSummary: (token: string, weekStart: string) =>
    fetchJson<WeekSummary>(`${API}/admin/weeks/${weekStart}`, { headers: authHeaders(token) }),

  updateWeekSummary: (token: string, weekStart: string, summary: string) =>
    fetchJson<WeekSummary>(`${API}/admin/weeks/${weekStart}/summary`, {
      method: "PUT",
      headers: authHeaders(token),
      body: JSON.stringify({ summary }),
    }),

  getExperience: () => fetchJson<Experience>(`${API}/experience`),

  getExperienceProject: (slug: string) =>
    fetchJson<ExperienceProjectDetail>(`${API}/experience/projects/${slug}`),

  getIdentityCards: (token: string) =>
    fetchJson<IdentityCard[]>(`${API}/admin/identity`, { headers: authHeaders(token) }),

  updateIdentityCard: (token: string, category: string, content: string) =>
    fetchJson<IdentityCard>(`${API}/admin/identity/${category}`, {
      method: "PUT",
      headers: authHeaders(token),
      body: JSON.stringify({ content }),
    }),

  adminGetSettings: (token: string) =>
    fetchJson<SiteConfig>(`${API}/admin/settings`, { headers: authHeaders(token) }),

  updateSettings: (token: string, data: Partial<SiteConfig>) =>
    fetchJson<SiteConfig>(`${API}/admin/settings`, {
      method: "PUT",
      headers: authHeaders(token),
      body: JSON.stringify(data),
    }),

  updatePhoto: (token: string, id: number, data: Partial<PhotoLink>) =>
    fetchJson<PhotoLink>(`${API}/admin/photos/${id}`, {
      method: "PUT",
      headers: authHeaders(token),
      body: JSON.stringify(data),
    }),

  adminGetProjects: (token: string) =>
    fetchJson<Project[]>(`${API}/admin/projects`, { headers: authHeaders(token) }),

  createProject: (token: string, data: Partial<Project>) =>
    fetchJson<Project>(`${API}/admin/projects`, { method: "POST", headers: authHeaders(token), body: JSON.stringify(data) }),

  updateProject: (token: string, id: number, data: Partial<Project>) =>
    fetchJson<Project>(`${API}/admin/projects/${id}`, { method: "PUT", headers: authHeaders(token), body: JSON.stringify(data) }),

  deleteProject: (token: string, id: number) =>
    fetchJson<{ ok: boolean }>(`${API}/admin/projects/${id}`, { method: "DELETE", headers: authHeaders(token) }),

  adminGetIdeas: (token: string) =>
    fetchJson<StartupIdea[]>(`${API}/admin/ideas`, { headers: authHeaders(token) }),

  createIdea: (token: string, data: Partial<StartupIdea>) =>
    fetchJson<StartupIdea>(`${API}/admin/ideas`, { method: "POST", headers: authHeaders(token), body: JSON.stringify(data) }),

  updateIdea: (token: string, id: number, data: Partial<StartupIdea>) =>
    fetchJson<StartupIdea>(`${API}/admin/ideas/${id}`, { method: "PUT", headers: authHeaders(token), body: JSON.stringify(data) }),

  deleteIdea: (token: string, id: number) =>
    fetchJson<{ ok: boolean }>(`${API}/admin/ideas/${id}`, { method: "DELETE", headers: authHeaders(token) }),

  adminGetEducation: (token: string) =>
    fetchJson<Education[]>(`${API}/admin/education`, { headers: authHeaders(token) }),

  createEducation: (token: string, data: Partial<Education>) =>
    fetchJson<Education>(`${API}/admin/education`, { method: "POST", headers: authHeaders(token), body: JSON.stringify(data) }),

  updateEducation: (token: string, id: number, data: Partial<Education>) =>
    fetchJson<Education>(`${API}/admin/education/${id}`, { method: "PUT", headers: authHeaders(token), body: JSON.stringify(data) }),

  deleteEducation: (token: string, id: number) =>
    fetchJson<{ ok: boolean }>(`${API}/admin/education/${id}`, { method: "DELETE", headers: authHeaders(token) }),

  adminGetWork: (token: string) =>
    fetchJson<WorkExperience[]>(`${API}/admin/work`, { headers: authHeaders(token) }),

  createWork: (token: string, data: Partial<WorkExperience>) =>
    fetchJson<WorkExperience>(`${API}/admin/work`, { method: "POST", headers: authHeaders(token), body: JSON.stringify(data) }),

  updateWork: (token: string, id: number, data: Partial<WorkExperience>) =>
    fetchJson<WorkExperience>(`${API}/admin/work/${id}`, { method: "PUT", headers: authHeaders(token), body: JSON.stringify(data) }),

  deleteWork: (token: string, id: number) =>
    fetchJson<{ ok: boolean }>(`${API}/admin/work/${id}`, { method: "DELETE", headers: authHeaders(token) }),

  adminGetExperienceProjects: (token: string) =>
    fetchJson<ExperienceProject[]>(`${API}/admin/experience-projects`, { headers: authHeaders(token) }),

  adminGetExperienceProject: (token: string, id: number) =>
    fetchJson<ExperienceProjectDetail>(`${API}/admin/experience-projects/${id}`, { headers: authHeaders(token) }),

  createExperienceProject: (token: string, data: Record<string, unknown>) =>
    fetchJson<ExperienceProject>(`${API}/admin/experience-projects`, { method: "POST", headers: authHeaders(token), body: JSON.stringify(data) }),

  updateExperienceProject: (token: string, id: number, data: Record<string, unknown>) =>
    fetchJson<ExperienceProject>(`${API}/admin/experience-projects/${id}`, { method: "PUT", headers: authHeaders(token), body: JSON.stringify(data) }),

  deleteExperienceProject: (token: string, id: number) =>
    fetchJson<{ ok: boolean }>(`${API}/admin/experience-projects/${id}`, { method: "DELETE", headers: authHeaders(token) }),

  getInspiration: (token: string, kind?: string) =>
    fetchJson<InspirationItem[]>(`${API}/admin/inspiration${kind ? `?kind=${kind}` : ""}`, { headers: authHeaders(token) }),

  getInspirationToday: (token: string, entryDate?: string) =>
    fetchJson<InspirationToday>(
      `${API}/admin/inspiration/today${entryDate ? `?entry_date=${entryDate}` : ""}`,
      { headers: authHeaders(token) },
    ),

  createInspiration: (token: string, data: Partial<InspirationItem>) =>
    fetchJson<InspirationItem>(`${API}/admin/inspiration`, { method: "POST", headers: authHeaders(token), body: JSON.stringify(data) }),

  updateInspiration: (token: string, id: number, data: Partial<InspirationItem>) =>
    fetchJson<InspirationItem>(`${API}/admin/inspiration/${id}`, { method: "PUT", headers: authHeaders(token), body: JSON.stringify(data) }),

  deleteInspiration: (token: string, id: number) =>
    fetchJson<{ ok: boolean }>(`${API}/admin/inspiration/${id}`, { method: "DELETE", headers: authHeaders(token) }),
};

export function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}

export function categoryLabel(cat: string): string {
  const map: Record<string, string> = {
    papers: "PAPER",
    systems: "SYSTEMS",
    notes: "NOTE",
  };
  return map[cat] || cat.toUpperCase();
}
