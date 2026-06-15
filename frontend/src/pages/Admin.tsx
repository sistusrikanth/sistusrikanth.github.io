import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { api } from "../lib/api";
import { clearToken, usePrivateToken } from "../lib/auth";
import PrivateShell from "../components/PrivateShell";
import AdminSiteTab from "../components/admin/AdminSiteTab";
import AdminExperienceTab from "../components/admin/AdminExperienceTab";
import AdminProjectsTab from "../components/admin/AdminProjectsTab";
import AdminIdentityTab from "../components/admin/AdminIdentityTab";
import AdminDaysTab from "../components/admin/AdminDaysTab";
import AdminInspirationTab from "../components/admin/AdminInspirationTab";
import type { Article, PhotoLink } from "../lib/types";
import "./Admin.css";
import "./PrivatePages.css";

type AdminTab = "site" | "articles" | "experience" | "projects" | "photos" | "identity" | "days" | "inspiration";

const TAB_VALUES: AdminTab[] = ["site", "articles", "experience", "projects", "photos", "identity", "days", "inspiration"];

function isAdminTab(value: string | null): value is AdminTab {
  return !!value && TAB_VALUES.includes(value as AdminTab);
}

export default function AdminPage() {
  const token = usePrivateToken();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [error, setError] = useState("");
  const [tab, setTab] = useState<AdminTab>(() => {
    const fromUrl = searchParams.get("tab");
    return isAdminTab(fromUrl) ? fromUrl : "site";
  });
  const [articles, setArticles] = useState<Article[]>([]);
  const [photos, setPhotos] = useState<PhotoLink[]>([]);
  const [editing, setEditing] = useState<Article | null>(null);
  const [editingPhoto, setEditingPhoto] = useState<PhotoLink | null>(null);

  const [form, setForm] = useState({
    title: "",
    summary: "",
    content: "",
    category: "papers",
    tags: "",
    read_time_min: 10,
    featured: false,
    published: true,
  });

  const [photoForm, setPhotoForm] = useState({
    title: "",
    instagram_url: "",
    category: "street",
  });
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onError = useCallback((msg: string) => setError(msg), []);

  const selectTab = (next: AdminTab) => {
    setTab(next);
    setSearchParams(next === "site" ? {} : { tab: next }, { replace: true });
  };

  useEffect(() => {
    const fromUrl = searchParams.get("tab");
    if (isAdminTab(fromUrl) && fromUrl !== tab) setTab(fromUrl);
  }, [searchParams, tab]);

  const loadData = async (t: string) => {
    const [arts, phs] = await Promise.all([
      api.adminGetArticles(t),
      api.getPhotos(),
    ]);
    setArticles(arts);
    setPhotos(phs);
  };

  useEffect(() => {
    if (token) loadData(token).catch(() => {
      clearToken();
      navigate("/admin");
    });
  }, [token, navigate]);

  const resetForm = () => {
    setEditing(null);
    setForm({
      title: "",
      summary: "",
      content: "",
      category: "papers",
      tags: "",
      read_time_min: 10,
      featured: false,
      published: true,
    });
  };

  const resetPhotoForm = () => {
    setEditingPhoto(null);
    setPhotoForm({ title: "", instagram_url: "", category: "street" });
  };

  const handleSaveArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    try {
      if (editing) {
        await api.updateArticle(token, editing.id, form);
      } else {
        await api.createArticle(token, form);
      }
      resetForm();
      await loadData(token);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    }
  };

  const handleEdit = (article: Article) => {
    setEditing(article);
    setForm({
      title: article.title,
      summary: article.summary,
      content: article.content,
      category: article.category,
      tags: article.tags,
      read_time_min: article.read_time_min,
      featured: article.featured,
      published: article.published,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeleteArticle = async (id: number) => {
    if (!token || !confirm("Delete this article?")) return;
    await api.deleteArticle(token, id);
    await loadData(token);
  };

  const handleSavePhoto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    try {
      if (editingPhoto) {
        await api.updatePhoto(token, editingPhoto.id, photoForm);
      } else {
        await api.createPhoto(token, photoForm);
      }
      resetPhotoForm();
      await loadData(token);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    }
  };

  const handleEditPhoto = (photo: PhotoLink) => {
    setEditingPhoto(photo);
    setPhotoForm({
      title: photo.title,
      instagram_url: photo.instagram_url,
      category: photo.category,
    });
  };

  const handleDeletePhoto = async (id: number) => {
    if (!token || !confirm("Delete this photo link?")) return;
    await api.deletePhoto(token, id);
    await loadData(token);
  };

  const insertAttachment = (result: { url: string; filename: string; kind: "image" | "excalidraw" }) => {
    const alt = result.filename.replace(/\.[^.]+$/, "");
    const insertion =
      result.kind === "image"
        ? `\n\n![${alt}](${result.url})\n\n`
        : `\n\n<!-- excalidraw:${result.url} -->\n\n`;
    setForm((prev) => ({ ...prev, content: prev.content + insertion }));
  };

  const handleAttachmentUpload = async (files: FileList | null) => {
    if (!files?.length || !token) return;
    setUploading(true);
    setError("");
    try {
      for (const file of Array.from(files)) {
        const result = await api.uploadAttachment(token, file);
        insertAttachment(result);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  if (!token) return null;

  return (
    <PrivateShell>
      <div className="admin-page">
        <div className="admin-header">
          <h1 className="serif">Admin panel</h1>
        </div>

        <div className="admin-tabs mono">
          <button className={tab === "site" ? "active" : ""} onClick={() => selectTab("site")}>Site</button>
          <button className={tab === "articles" ? "active" : ""} onClick={() => selectTab("articles")}>Articles ({articles.length})</button>
          <button className={tab === "experience" ? "active" : ""} onClick={() => selectTab("experience")}>Experience</button>
          <button className={tab === "projects" ? "active" : ""} onClick={() => selectTab("projects")}>Projects</button>
          <button className={tab === "photos" ? "active" : ""} onClick={() => selectTab("photos")}>Photos ({photos.length})</button>
          <button className={tab === "identity" ? "active" : ""} onClick={() => selectTab("identity")}>Identity</button>
          <button className={tab === "days" ? "active" : ""} onClick={() => selectTab("days")}>Days</button>
          <button className={tab === "inspiration" ? "active" : ""} onClick={() => selectTab("inspiration")}>Inspiration</button>
        </div>

        {error && <p className="admin-error">{error}</p>}

        {tab === "site" && <AdminSiteTab token={token} onError={onError} />}

        {tab === "articles" && (
          <div className="admin-grid">
            <form className="admin-form card" onSubmit={handleSaveArticle}>
              <h2 className="mono">{editing ? "Edit article" : "New article"}</h2>
              <label>
                Title
                <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
              </label>
              <label>
                Summary
                <textarea value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} rows={2} />
              </label>
              <label>
                Content (Markdown)
                <textarea
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  rows={16}
                  placeholder="# Your article title&#10;&#10;Write in markdown..."
                  required
                />
              </label>
              <div className="admin-attachments">
                <p className="admin-attachments-label">Attachments</p>
                <p className="admin-attachments-hint">
                  Add screenshots (PNG, JPG, WebP) or Excalidraw files (.excalidraw). They are inserted into the article content automatically.
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/gif,image/webp,image/svg+xml,.excalidraw"
                  multiple
                  className="admin-attachments-input"
                  onChange={(e) => handleAttachmentUpload(e.target.files)}
                />
                <button
                  type="button"
                  className="btn btn-outline admin-attachments-btn"
                  disabled={uploading}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {uploading ? "Uploading…" : "Attach screenshots or diagrams"}
                </button>
              </div>
              <div className="admin-form-row">
                <label>
                  Category
                  <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                    <option value="papers">Papers</option>
                    <option value="systems">Systems</option>
                    <option value="notes">Notes</option>
                  </select>
                </label>
                <label>
                  Tags (comma-separated)
                  <input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="transformers,gpu" />
                </label>
                <label>
                  Read time (min)
                  <input
                    type="number"
                    value={form.read_time_min}
                    onChange={(e) => setForm({ ...form, read_time_min: Number(e.target.value) })}
                    min={1}
                  />
                </label>
              </div>
              <div className="admin-checkboxes">
                <label>
                  <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} />
                  Featured
                </label>
                <label>
                  <input type="checkbox" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} />
                  Published
                </label>
              </div>
              <div className="admin-form-actions">
                <button type="submit" className="btn btn-primary">
                  {editing ? "Update article" : "Publish article"}
                </button>
                {editing && (
                  <button type="button" className="btn btn-outline" onClick={resetForm}>
                    Cancel
                  </button>
                )}
              </div>
            </form>

            <div className="admin-list">
              <h2 className="mono">All articles</h2>
              {articles.map((a) => (
                <div key={a.id} className="admin-list-item card">
                  <div>
                    <span className={`article-type mono type-${a.category}`}>{a.category}</span>
                    {!a.published && <span className="admin-draft mono">draft</span>}
                    <h3>{a.title}</h3>
                    <p className="mono admin-list-meta">{a.slug}</p>
                  </div>
                  <div className="admin-list-actions">
                    <button onClick={() => handleEdit(a)}>Edit</button>
                    <button onClick={() => handleDeleteArticle(a.id)} className="danger">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "experience" && <AdminExperienceTab token={token} onError={onError} />}
        {tab === "projects" && <AdminProjectsTab token={token} onError={onError} />}

        {tab === "photos" && (
          <div className="admin-grid">
            <form className="admin-form card" onSubmit={handleSavePhoto}>
              <h2 className="mono">{editingPhoto ? "Edit photo link" : "Add Instagram link"}</h2>
              <label>
                Title (optional)
                <input value={photoForm.title} onChange={(e) => setPhotoForm({ ...photoForm, title: e.target.value })} />
              </label>
              <label>
                Instagram URL
                <input
                  value={photoForm.instagram_url}
                  onChange={(e) => setPhotoForm({ ...photoForm, instagram_url: e.target.value })}
                  placeholder="https://www.instagram.com/p/..."
                  required
                />
              </label>
              <label>
                Category
                <select value={photoForm.category} onChange={(e) => setPhotoForm({ ...photoForm, category: e.target.value })}>
                  <option value="street">Street</option>
                  <option value="landscape">Landscape</option>
                  <option value="architecture">Architecture</option>
                  <option value="portrait">Portrait</option>
                </select>
              </label>
              <div className="admin-form-actions">
                <button type="submit" className="btn btn-primary">{editingPhoto ? "Update" : "Add photo link"}</button>
                {editingPhoto && (
                  <button type="button" className="btn btn-outline" onClick={resetPhotoForm}>Cancel</button>
                )}
              </div>
            </form>

            <div className="admin-list">
              <h2 className="mono">Photo links</h2>
              {photos.map((p) => (
                <div key={p.id} className="admin-list-item card">
                  <div>
                    <span className="mono admin-list-meta">{p.category}</span>
                    <h3>{p.title || "Untitled"}</h3>
                    <a href={p.instagram_url} target="_blank" rel="noopener noreferrer" className="admin-photo-url mono">
                      {p.instagram_url}
                    </a>
                  </div>
                  <div className="admin-list-actions">
                    <button onClick={() => handleEditPhoto(p)}>Edit</button>
                    <button onClick={() => handleDeletePhoto(p.id)} className="danger">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "identity" && <AdminIdentityTab token={token} onError={onError} />}
        {tab === "days" && <AdminDaysTab token={token} />}
        {tab === "inspiration" && <AdminInspirationTab token={token} onError={onError} />}
      </div>
    </PrivateShell>
  );
}
