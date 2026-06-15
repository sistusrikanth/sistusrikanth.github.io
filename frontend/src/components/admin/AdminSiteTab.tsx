import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import type { SiteConfig } from "../../lib/types";

interface Props {
  token: string;
  onError: (msg: string) => void;
}

export default function AdminSiteTab({ token, onError }: Props) {
  const [form, setForm] = useState<SiteConfig | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api.adminGetSettings(token).then(setForm).catch((e: unknown) => onError(e instanceof Error ? e.message : String(e)));
  }, [token, onError]);

  if (!form) return <p className="mono private-muted">Loading…</p>;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const updated = await api.updateSettings(token, form);
      setForm(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      onError(err instanceof Error ? err.message : "Save failed");
    }
  };

  const updateExplore = (index: number, field: string, value: string) => {
    const cards = [...form.index_explore];
    cards[index] = { ...cards[index], [field]: value };
    setForm({ ...form, index_explore: cards });
  };

  return (
    <form className="admin-form card admin-full-width" onSubmit={handleSave}>
      <h2 className="mono">Site settings</h2>
      <div className="admin-form-row admin-form-row-2">
        <label>Name<input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
        <label>Location<input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} /></label>
      </div>
      <label>Tagline<input value={form.tagline} onChange={(e) => setForm({ ...form, tagline: e.target.value })} /></label>
      <label>Now text<textarea value={form.now_text} onChange={(e) => setForm({ ...form, now_text: e.target.value })} rows={2} /></label>
      <div className="admin-form-row admin-form-row-2">
        <label>GitHub<input value={form.github} onChange={(e) => setForm({ ...form, github: e.target.value })} /></label>
        <label>Email<input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label>
      </div>
      <label>Twitter<input value={form.twitter} onChange={(e) => setForm({ ...form, twitter: e.target.value })} /></label>

      <h3 className="mono admin-subsection-title">Homepage</h3>
      <label>Eyebrow<input value={form.index_eyebrow} onChange={(e) => setForm({ ...form, index_eyebrow: e.target.value })} /></label>
      <label>Hero headline<input value={form.index_hero} onChange={(e) => setForm({ ...form, index_hero: e.target.value })} /></label>
      <label>Intro<textarea value={form.index_intro} onChange={(e) => setForm({ ...form, index_intro: e.target.value })} rows={3} /></label>
      <label>Mission statement<textarea value={form.mission_statement} onChange={(e) => setForm({ ...form, mission_statement: e.target.value })} rows={3} /></label>

      <h3 className="mono admin-subsection-title">Explore cards</h3>
      {form.index_explore.map((card, i) => (
        <div key={card.num} className="admin-nested-card">
          <div className="admin-form-row">
            <label>Title<input value={card.title} onChange={(e) => updateExplore(i, "title", e.target.value)} /></label>
            <label>Link<input value={card.to} onChange={(e) => updateExplore(i, "to", e.target.value)} /></label>
            <label>Icon<input value={card.icon} onChange={(e) => updateExplore(i, "icon", e.target.value)} /></label>
          </div>
          <label>Description<textarea value={card.desc} onChange={(e) => updateExplore(i, "desc", e.target.value)} rows={2} /></label>
        </div>
      ))}

      <button type="submit" className="btn btn-primary">{saved ? "Saved ✓" : "Save site settings"}</button>
    </form>
  );
}
