import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import type { Project, StartupIdea } from "../../lib/types";

interface Props {
  token: string;
  onError: (msg: string) => void;
}

const emptyProject = { title: "", description: "", url: "", status: "wip", tech_tags: "", icon_color: "#6366f1", sort_order: 0 };
const emptyIdea = { title: "", description: "", contact_url: "", sort_order: 0 };

export default function AdminProjectsTab({ token, onError }: Props) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [ideas, setIdeas] = useState<StartupIdea[]>([]);
  const [editingProject, setEditingProject] = useState<number | null>(null);
  const [editingIdea, setEditingIdea] = useState<number | null>(null);
  const [projectForm, setProjectForm] = useState(emptyProject);
  const [ideaForm, setIdeaForm] = useState(emptyIdea);

  const load = async () => {
    const [p, i] = await Promise.all([api.adminGetProjects(token), api.adminGetIdeas(token)]);
    setProjects(p);
    setIdeas(i);
  };

  useEffect(() => {
    load().catch((e) => onError(e.message));
  }, [token, onError]);

  return (
    <div className="admin-full-width">
      <div className="admin-grid">
        <form className="admin-form card" onSubmit={async (e) => {
          e.preventDefault();
          try {
            if (editingProject) await api.updateProject(token, editingProject, projectForm);
            else await api.createProject(token, projectForm);
            setProjectForm(emptyProject); setEditingProject(null); await load();
          } catch (err) { onError(err instanceof Error ? err.message : "Save failed"); }
        }}>
          <h2 className="mono">{editingProject ? "Edit project" : "Add project"}</h2>
          <label>Title<input value={projectForm.title} onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })} required /></label>
          <label>Description<textarea value={projectForm.description} onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })} rows={3} /></label>
          <label>URL<input value={projectForm.url} onChange={(e) => setProjectForm({ ...projectForm, url: e.target.value })} /></label>
          <div className="admin-form-row admin-form-row-2">
            <label>Status
              <select value={projectForm.status} onChange={(e) => setProjectForm({ ...projectForm, status: e.target.value })}>
                <option value="live">Live</option>
                <option value="wip">WIP</option>
              </select>
            </label>
            <label>Icon color<input value={projectForm.icon_color} onChange={(e) => setProjectForm({ ...projectForm, icon_color: e.target.value })} /></label>
          </div>
          <label>Tech tags<input value={projectForm.tech_tags} onChange={(e) => setProjectForm({ ...projectForm, tech_tags: e.target.value })} placeholder="ts,react,python" /></label>
          <button type="submit" className="btn btn-primary">{editingProject ? "Update" : "Add"}</button>
        </form>

        <div className="admin-list">
          <h2 className="mono">Projects</h2>
          {projects.map((p) => (
            <div key={p.id} className="admin-list-item card">
              <div><h3>{p.title}</h3><p className="admin-list-meta mono">{p.status}</p></div>
              <div className="admin-list-actions">
                <button onClick={() => { setEditingProject(p.id); setProjectForm(p); }}>Edit</button>
                <button className="danger" onClick={async () => { if (confirm("Delete?")) { await api.deleteProject(token, p.id); await load(); } }}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="admin-grid" style={{ marginTop: 32 }}>
        <form className="admin-form card" onSubmit={async (e) => {
          e.preventDefault();
          try {
            if (editingIdea) await api.updateIdea(token, editingIdea, ideaForm);
            else await api.createIdea(token, ideaForm);
            setIdeaForm(emptyIdea); setEditingIdea(null); await load();
          } catch (err) { onError(err instanceof Error ? err.message : "Save failed"); }
        }}>
          <h2 className="mono">{editingIdea ? "Edit startup idea" : "Add startup idea"}</h2>
          <label>Title<input value={ideaForm.title} onChange={(e) => setIdeaForm({ ...ideaForm, title: e.target.value })} required /></label>
          <label>Description<textarea value={ideaForm.description} onChange={(e) => setIdeaForm({ ...ideaForm, description: e.target.value })} rows={3} /></label>
          <label>Contact URL<input value={ideaForm.contact_url} onChange={(e) => setIdeaForm({ ...ideaForm, contact_url: e.target.value })} /></label>
          <button type="submit" className="btn btn-primary">{editingIdea ? "Update" : "Add"}</button>
        </form>

        <div className="admin-list">
          <h2 className="mono">Startup ideas</h2>
          {ideas.map((idea) => (
            <div key={idea.id} className="admin-list-item card">
              <div><h3>{idea.title}</h3></div>
              <div className="admin-list-actions">
                <button onClick={() => { setEditingIdea(idea.id); setIdeaForm(idea); }}>Edit</button>
                <button className="danger" onClick={async () => { if (confirm("Delete?")) { await api.deleteIdea(token, idea.id); await load(); } }}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
