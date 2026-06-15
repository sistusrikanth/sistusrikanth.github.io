import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import { todayISO, usePrivateToken } from "../lib/auth";
import PrivateShell from "../components/PrivateShell";
import type { InspirationItem, InspirationToday } from "../lib/types";
import "./PrivatePages.css";

function formatDisplayDate(iso: string): string {
  const d = new Date(iso + "T12:00:00");
  return d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
}

export default function InspirationPage() {
  const token = usePrivateToken();
  const today = todayISO();
  const [viewDate, setViewDate] = useState(today);
  const [data, setData] = useState<InspirationToday | null>(null);
  const [allQuotes, setAllQuotes] = useState<InspirationItem[]>([]);

  const load = async (date: string) => {
    const [todayData, quotes] = await Promise.all([
      api.getInspirationToday(token, date),
      api.getInspiration(token, "quote"),
    ]);
    setData(todayData);
    setAllQuotes(quotes);
  };

  useEffect(() => {
    load(viewDate).catch(() => {});
  }, [token, viewDate]);

  const isToday = viewDate === today;
  const assignedQuote = allQuotes.find((q) => q.entry_date === viewDate);

  return (
    <PrivateShell>
      <p className="section-label"><span>§</span> Private Inspiration</p>
      <h1 className="page-title serif">{isToday ? "Today's light." : formatDisplayDate(viewDate)}</h1>
      <p className="page-subtitle">
        Daily quotes and the things that move you — a quiet corner to return to when you need perspective.
      </p>

      <div className="inspiration-date-row mono">
        <label>
          Date
          <input
            type="date"
            value={viewDate}
            onChange={(e) => setViewDate(e.target.value)}
            max={today}
          />
        </label>
        {!isToday && (
          <button type="button" className="btn btn-outline" onClick={() => setViewDate(today)}>
            Jump to today
          </button>
        )}
        <Link to="/admin?tab=inspiration" className="btn btn-outline inspiration-edit-link">
          Edit collection
        </Link>
      </div>

      {!data ? (
        <p className="mono private-muted">Loading…</p>
      ) : (
        <>
          <section className="inspiration-daily card">
            <p className="mono inspiration-daily-label">Daily quote</p>
            {data.daily_quote ? (
              <>
                <blockquote className="inspiration-quote serif">
                  {data.daily_quote.content}
                </blockquote>
                {data.daily_quote.source && (
                  <p className="inspiration-source mono">— {data.daily_quote.source}</p>
                )}
                {assignedQuote ? (
                  <p className="inspiration-note mono">Assigned to this date</p>
                ) : (
                  <p className="inspiration-note mono">Rotating from your quote collection</p>
                )}
              </>
            ) : (
              <p className="mono private-muted">No quotes yet. Add some in the admin panel.</p>
            )}
          </section>

          <section className="inspiration-moves">
            <div className="inspiration-moves-header">
              <h2 className="mono">Things that move me</h2>
              <p className="inspiration-moves-desc">
                Passages, moments, and ideas worth keeping close.
              </p>
            </div>
            {data.moves_me.length === 0 ? (
              <p className="mono private-muted">Nothing here yet.</p>
            ) : (
              <div className="inspiration-moves-grid">
                {data.moves_me.map((item) => (
                  <article key={item.id} className="inspiration-moves-card card">
                    <p className="inspiration-moves-content serif">{item.content}</p>
                    {item.source && (
                      <p className="inspiration-moves-source mono">{item.source}</p>
                    )}
                  </article>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </PrivateShell>
  );
}
