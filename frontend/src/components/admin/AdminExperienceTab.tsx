import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import type { Education, ExperienceProjectDetail, WorkExperience } from "../../lib/types";

interface Props {
  token: string;
  onError: (msg: string) => void;
}

type Section = "education" | "work" | "projects";

const emptyEdu = { institution: "", degree: "", field: "", start_year: "", end_year: "", description: "", sort_order: 0 };
const emptyWork = { company: "", role: "", location: "", start_date: "", end_date: "", description: "", sort_order: 0 };
const emptyProj = { title: "", slug: "", summary: "", role_context: "", ml_components: "[]", technical_detail: "", sort_order: 0 };

export default function AdminExperienceTab({ token, onError }: Props) {
  const [section, setSection] = useState<Section>("education");
  const [education, setEducation] = useState<Education[]>([]);
  const [work, setWork] = useState<WorkExperience[]>([]);
  const [projects, setProjects] = useState<ExperienceProjectDetail[]>([]);
  const [editingEdu, setEditingEdu] = useState<number | null>(null);
  const [editingWork, setEditingWork] = useState<number | null>(null);
  const [editingProj, setEditingProj] = useState<number | null>(null);
  const [eduForm, setEduForm] = useState(emptyEdu);
  const [workForm, setWorkForm] = useState(emptyWork);
  const [projForm, setProjForm] = useState(emptyProj);

  const load = async () => {
    const [edu, wrk, projs] = await Promise.all([
      api.adminGetEducation(token),
      api.adminGetWork(token),
      api.adminGetExperienceProjects(token),
    ]);
    setEducation(edu);
    setWork(wrk);
    const details = await Promise.all(projs.map((p) => api.adminGetExperienceProject(token, p.id)));
    setProjects(details);
  };

  useEffect(() => {
    load().catch((e) => onError(e.message));
  }, [token, onError]);

  return (
    <div className="admin-full-width">
      <div className="admin-subtabs mono">
        <button className={section === "education" ? "active" : ""} onClick={() => setSection("education")}>Education</button>
        <button className={section === "work" ? "active" : ""} onClick={() => setSection("work")}>Work history</button>
        <button className={section === "projects" ? "active" : ""} onClick={() => setSection("projects")}>ML projects</button>
      </div>

      {section === "education" && (
        <div className="admin-grid">
          <form className="admin-form card" onSubmit={async (e) => {
            e.preventDefault();
            try {
              if (editingEdu) await api.updateEducation(token, editingEdu, eduForm);
              else await api.createEducation(token, eduForm);
              setEduForm(emptyEdu); setEditingEdu(null); await load();
            } catch (err) { onError(err instanceof Error ? err.message : "Save failed"); }
          }}>
            <h2 className="mono">{editingEdu ? "Edit education" : "Add education"}</h2>
            <label>Institution<input value={eduForm.institution} onChange={(e) => setEduForm({ ...eduForm, institution: e.target.value })} required /></label>
            <div className="admin-form-row admin-form-row-2">
              <label>Degree<input value={eduForm.degree} onChange={(e) => setEduForm({ ...eduForm, degree: e.target.value })} /></label>
              <label>Field<input value={eduForm.field} onChange={(e) => setEduForm({ ...eduForm, field: e.target.value })} /></label>
            </div>
            <div className="admin-form-row admin-form-row-2">
              <label>Start<input value={eduForm.start_year} onChange={(e) => setEduForm({ ...eduForm, start_year: e.target.value })} /></label>
              <label>End<input value={eduForm.end_year} onChange={(e) => setEduForm({ ...eduForm, end_year: e.target.value })} /></label>
            </div>
            <label>Description<textarea value={eduForm.description} onChange={(e) => setEduForm({ ...eduForm, description: e.target.value })} rows={3} /></label>
            <button type="submit" className="btn btn-primary">{editingEdu ? "Update" : "Add"}</button>
          </form>
          <div className="admin-list">
            {education.map((item) => (
              <div key={item.id} className="admin-list-item card">
                <div><h3>{item.institution}</h3><p className="admin-list-meta mono">{item.degree} · {item.start_year}–{item.end_year}</p></div>
                <div className="admin-list-actions">
                  <button onClick={() => { setEditingEdu(item.id); setEduForm(item); }}>Edit</button>
                  <button className="danger" onClick={async () => { if (confirm("Delete?")) { await api.deleteEducation(token, item.id); await load(); } }}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {section === "work" && (
        <div className="admin-grid">
          <form className="admin-form card" onSubmit={async (e) => {
            e.preventDefault();
            try {
              if (editingWork) await api.updateWork(token, editingWork, workForm);
              else await api.createWork(token, workForm);
              setWorkForm(emptyWork); setEditingWork(null); await load();
            } catch (err) { onError(err instanceof Error ? err.message : "Save failed"); }
          }}>
            <h2 className="mono">{editingWork ? "Edit role" : "Add role"}</h2>
            <label>Company<input value={workForm.company} onChange={(e) => setWorkForm({ ...workForm, company: e.target.value })} required /></label>
            <label>Role<input value={workForm.role} onChange={(e) => setWorkForm({ ...workForm, role: e.target.value })} required /></label>
            <label>Location<input value={workForm.location} onChange={(e) => setWorkForm({ ...workForm, location: e.target.value })} /></label>
            <div className="admin-form-row admin-form-row-2">
              <label>Start<input value={workForm.start_date} onChange={(e) => setWorkForm({ ...workForm, start_date: e.target.value })} /></label>
              <label>End<input value={workForm.end_date} onChange={(e) => setWorkForm({ ...workForm, end_date: e.target.value })} placeholder="Present" /></label>
            </div>
            <label>Description<textarea value={workForm.description} onChange={(e) => setWorkForm({ ...workForm, description: e.target.value })} rows={4} /></label>
            <button type="submit" className="btn btn-primary">{editingWork ? "Update" : "Add"}</button>
          </form>
          <div className="admin-list">
            {work.map((item) => (
              <div key={item.id} className="admin-list-item card">
                <div><h3>{item.role}</h3><p className="admin-list-meta mono">{item.company}</p></div>
                <div className="admin-list-actions">
                  <button onClick={() => { setEditingWork(item.id); setWorkForm(item); }}>Edit</button>
                  <button className="danger" onClick={async () => { if (confirm("Delete?")) { await api.deleteWork(token, item.id); await load(); } }}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {section === "projects" && (
        <div className="admin-grid">
          <form className="admin-form card" onSubmit={async (e) => {
            e.preventDefault();
            try {
              if (editingProj) await api.updateExperienceProject(token, editingProj, projForm);
              else await api.createExperienceProject(token, projForm);
              setProjForm(emptyProj); setEditingProj(null); await load();
            } catch (err) { onError(err instanceof Error ? err.message : "Save failed"); }
          }}>
            <h2 className="mono">{editingProj ? "Edit ML project" : "Add ML project"}</h2>
            <label>Title<input value={projForm.title} onChange={(e) => setProjForm({ ...projForm, title: e.target.value })} required /></label>
            <label>Slug<input value={projForm.slug} onChange={(e) => setProjForm({ ...projForm, slug: e.target.value })} placeholder="auto from title" /></label>
            <label>Role context<input value={projForm.role_context} onChange={(e) => setProjForm({ ...projForm, role_context: e.target.value })} /></label>
            <label>Summary<textarea value={projForm.summary} onChange={(e) => setProjForm({ ...projForm, summary: e.target.value })} rows={2} /></label>
            <label>ML components (JSON)<textarea value={projForm.ml_components} onChange={(e) => setProjForm({ ...projForm, ml_components: e.target.value })} rows={8} /></label>
            <label>Technical detail (Markdown)<textarea value={projForm.technical_detail} onChange={(e) => setProjForm({ ...projForm, technical_detail: e.target.value })} rows={10} /></label>
            <button type="submit" className="btn btn-primary">{editingProj ? "Update" : "Add"}</button>
          </form>
          <div className="admin-list">
            {projects.map((item) => (
              <div key={item.id} className="admin-list-item card">
                <div><h3>{item.title}</h3><p className="admin-list-meta mono">{item.slug}</p></div>
                <div className="admin-list-actions">
                  <button onClick={() => { setEditingProj(item.id); setProjForm({ ...item, ml_components: JSON.stringify(item.ml_components, null, 2) }); }}>Edit</button>
                  <button className="danger" onClick={async () => { if (confirm("Delete?")) { await api.deleteExperienceProject(token, item.id); await load(); } }}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
