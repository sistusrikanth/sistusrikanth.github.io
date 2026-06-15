import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import type { InspirationItem } from "../../lib/types";

interface Props {
  token: string;
  onError: (msg: string) => void;
}

type Section = "quotes" | "moves_me";

const emptyQuote = { kind: "quote" as const, content: "", source: "", entry_date: "", sort_order: 0 };
const emptyMoves = { kind: "moves_me" as const, content: "", source: "", entry_date: "", sort_order: 0 };

export default function AdminInspirationTab({ token, onError }: Props) {
  const [section, setSection] = useState<Section>("quotes");
  const [items, setItems] = useState<InspirationItem[]>([]);
  const [editing, setEditing] = useState<number | null>(null);
  const [quoteForm, setQuoteForm] = useState(emptyQuote);
  const [movesForm, setMovesForm] = useState(emptyMoves);

  const load = async () => {
    const list = await api.getInspiration(token);
    setItems(list);
  };

  useEffect(() => {
    load().catch((e) => onError(e.message));
  }, [token, onError]);

  const quotes = items.filter((i) => i.kind === "quote");
  const moves = items.filter((i) => i.kind === "moves_me");

  const resetQuote = () => { setEditing(null); setQuoteForm(emptyQuote); };
  const resetMoves = () => { setEditing(null); setMovesForm(emptyMoves); };

  return (
    <div className="admin-full-width">
      <div className="admin-subtabs mono">
        <button className={section === "quotes" ? "active" : ""} onClick={() => setSection("quotes")}>
          Daily quotes ({quotes.length})
        </button>
        <button className={section === "moves_me" ? "active" : ""} onClick={() => setSection("moves_me")}>
          Things that move me ({moves.length})
        </button>
      </div>

      {section === "quotes" && (
        <div className="admin-grid">
          <form className="admin-form card" onSubmit={async (e) => {
            e.preventDefault();
            try {
              if (editing) await api.updateInspiration(token, editing, quoteForm);
              else await api.createInspiration(token, quoteForm);
              resetQuote();
              await load();
            } catch (err) { onError(err instanceof Error ? err.message : "Save failed"); }
          }}>
            <h2 className="mono">{editing ? "Edit quote" : "Add quote"}</h2>
            <label>
              Quote
              <textarea value={quoteForm.content} onChange={(e) => setQuoteForm({ ...quoteForm, content: e.target.value })} rows={4} required />
            </label>
            <label>
              Source
              <input value={quoteForm.source} onChange={(e) => setQuoteForm({ ...quoteForm, source: e.target.value })} placeholder="Author or attribution" />
            </label>
            <label>
              Assign to date (optional)
              <input type="date" value={quoteForm.entry_date} onChange={(e) => setQuoteForm({ ...quoteForm, entry_date: e.target.value })} />
            </label>
            <p className="admin-attachments-hint">Leave date empty to include in the daily rotation pool.</p>
            <button type="submit" className="btn btn-primary">{editing ? "Update" : "Add"}</button>
          </form>

          <div className="admin-list">
            {quotes.map((item) => (
              <div key={item.id} className="admin-list-item card">
                <div>
                  <p className="serif inspiration-admin-preview">{item.content}</p>
                  <p className="admin-list-meta mono">
                    {item.source || "No source"}
                    {item.entry_date ? ` · ${item.entry_date}` : " · rotation pool"}
                  </p>
                </div>
                <div className="admin-list-actions">
                  <button onClick={() => { setEditing(item.id); setQuoteForm({ kind: "quote", content: item.content, source: item.source, entry_date: item.entry_date, sort_order: item.sort_order }); }}>Edit</button>
                  <button className="danger" onClick={async () => { if (confirm("Delete?")) { await api.deleteInspiration(token, item.id); await load(); } }}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {section === "moves_me" && (
        <div className="admin-grid">
          <form className="admin-form card" onSubmit={async (e) => {
            e.preventDefault();
            try {
              if (editing) await api.updateInspiration(token, editing, movesForm);
              else await api.createInspiration(token, movesForm);
              resetMoves();
              await load();
            } catch (err) { onError(err instanceof Error ? err.message : "Save failed"); }
          }}>
            <h2 className="mono">{editing ? "Edit entry" : "Add entry"}</h2>
            <label>
              What moves you
              <textarea value={movesForm.content} onChange={(e) => setMovesForm({ ...movesForm, content: e.target.value })} rows={5} required />
            </label>
            <label>
              Source / context
              <input value={movesForm.source} onChange={(e) => setMovesForm({ ...movesForm, source: e.target.value })} placeholder="Book, film, moment, person…" />
            </label>
            <button type="submit" className="btn btn-primary">{editing ? "Update" : "Add"}</button>
          </form>

          <div className="admin-list">
            {moves.map((item) => (
              <div key={item.id} className="admin-list-item card">
                <div>
                  <p className="serif inspiration-admin-preview">{item.content}</p>
                  {item.source && <p className="admin-list-meta mono">{item.source}</p>}
                </div>
                <div className="admin-list-actions">
                  <button onClick={() => { setEditing(item.id); setMovesForm({ kind: "moves_me", content: item.content, source: item.source, entry_date: "", sort_order: item.sort_order }); }}>Edit</button>
                  <button className="danger" onClick={async () => { if (confirm("Delete?")) { await api.deleteInspiration(token, item.id); await load(); } }}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
