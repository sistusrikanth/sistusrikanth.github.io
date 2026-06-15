import { useEffect, useState } from "react";
import { api } from "../../lib/api";

const CORE = ["who_i_am", "what_i_do", "what_i_care_about"] as const;
const SITE = ["writing", "systems", "photography", "projects"] as const;
const LABELS: Record<string, string> = {
  who_i_am: "Who I am", what_i_do: "What I do", what_i_care_about: "What I care about",
  writing: "Writing", systems: "Systems", photography: "Photography", projects: "Projects",
};

interface Props {
  token: string;
  onError: (msg: string) => void;
}

export default function AdminIdentityTab({ token, onError }: Props) {
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState<string | null>(null);

  useEffect(() => {
    api.getIdentityCards(token).then((cards) => {
      const d: Record<string, string> = {};
      cards.forEach((c) => { d[c.category] = c.content; });
      setDrafts(d);
    }).catch((e) => onError(e.message));
  }, [token, onError]);

  const save = async (category: string) => {
    try {
      await api.updateIdentityCard(token, category, drafts[category] || "");
      setSaved(category);
      setTimeout(() => setSaved(null), 2000);
    } catch (err) {
      onError(err instanceof Error ? err.message : "Save failed");
    }
  };

  const render = (title: string, cats: readonly string[]) => (
    <section className="identity-section">
      <h2 className="mono identity-section-title">{title}</h2>
      <div className="identity-cards">
        {cats.map((cat) => (
          <div key={cat} className="identity-card card">
            <h3 className="serif">{LABELS[cat]}</h3>
            <textarea value={drafts[cat] || ""} onChange={(e) => setDrafts({ ...drafts, [cat]: e.target.value })} rows={3} />
            <button type="button" className="btn btn-outline identity-save" onClick={() => save(cat)}>
              {saved === cat ? "Saved ✓" : "Save"}
            </button>
          </div>
        ))}
      </div>
    </section>
  );

  return (
    <div className="admin-full-width">
      {render("Core", CORE)}
      {render("Site face", SITE)}
    </div>
  );
}
