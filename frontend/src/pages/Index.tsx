import { Link, useOutletContext } from "react-router-dom";
import { useEffect, useState } from "react";
import { api, formatDate } from "../lib/api";
import type { Article, ExploreCard, SiteConfig } from "../lib/types";
import "./Index.css";

const DEFAULT_CARDS: ExploreCard[] = [
  { num: "01", icon: "✎", title: "Writing", desc: "Research papers, taken apart and rebuilt from their core components.", to: "/writing" },
  { num: "02", icon: "◈", title: "Systems", desc: "Designing the ML systems everyone uses — and showing the reasoning.", to: "/systems" },
  { num: "03", icon: "◎", title: "Photography", desc: "A working portfolio. Cities, light, and the occasional whiteboard.", to: "/photography" },
  { num: "04", icon: "{ }", title: "Code", desc: "Small, sharp pieces — annotated line by line.", to: "/writing?category=notes" },
  { num: "05", icon: "↗", title: "Projects", desc: "Things I'm building and startup ideas I can't stop thinking about.", to: "/projects" },
];

export default function IndexPage() {
  const config = useOutletContext<SiteConfig>();
  const [articles, setArticles] = useState<Article[]>([]);
  const [counts, setCounts] = useState({ writing: 0, systems: 0, photos: 0, projects: 0 });

  useEffect(() => {
    Promise.all([api.getArticles(), api.getPhotos(), api.getProjects()]).then(([arts, photos, projects]) => {
      setArticles(arts.slice(0, 5));
      setCounts({
        writing: arts.length,
        systems: arts.filter((a) => a.category === "systems").length,
        photos: photos.length,
        projects: projects.length,
      });
    });
  }, []);

  const exploreCards = (config.index_explore?.length ? config.index_explore : DEFAULT_CARDS).map((card) => {
    let count = "";
    if (card.to === "/writing") count = `${counts.writing} essays`;
    else if (card.to === "/systems") count = `${counts.systems} designs`;
    else if (card.to === "/photography") count = `${counts.photos} frames`;
    else if (card.to.includes("notes")) count = "snippets";
    else if (card.to === "/projects") count = `${counts.projects} active`;
    return { ...card, count };
  });

  return (
    <div className="index-page">
      <p className="index-eyebrow mono">{config.index_eyebrow}</p>
      <h1 className="index-hero serif">{config.index_hero}</h1>
      <p className="index-intro">{config.index_intro}</p>

      {config.mission_statement && (
        <section className="index-mission card">
          <p className="index-mission-label mono">Mission</p>
          <p className="index-mission-text serif">{config.mission_statement}</p>
        </section>
      )}

      <div className="index-cta">
        <Link to="/writing" className="btn btn-primary">Read the writing →</Link>
        <Link to="/projects" className="btn btn-outline">See what I'm building</Link>
      </div>

      <p className="index-location mono">
        <span className="index-avatar">●</span>
        {config.name} — based in {config.location}
      </p>

      <section className="index-explore">
        <h2 className="index-section-title mono">Explore the work</h2>
        <div className="index-grid">
          {exploreCards.map((card) => (
            <Link key={card.num} to={card.to} className="index-card card">
              <div className="index-card-top">
                <span className="index-card-icon">{card.icon}</span>
                <span className="index-card-num mono">{card.num}</span>
              </div>
              <h3 className="index-card-title">{card.title}</h3>
              <p className="index-card-desc">{card.desc}</p>
              <div className="index-card-footer mono">
                <span>{card.count}</span>
                <span>→</span>
              </div>
            </Link>
          ))}
          <div className="index-card index-card-now card">
            <span className="index-now-badge mono">NOW</span>
            <p className="index-now-text">{config.now_text}</p>
          </div>
        </div>
      </section>

      <section className="index-recent">
        <div className="index-recent-header">
          <h2 className="mono">Recent writing</h2>
          <Link to="/writing" className="mono">All {counts.writing} →</Link>
        </div>
        <div className="index-recent-list">
          {articles.map((a) => (
            <Link key={a.id} to={`/writing/${a.slug}`} className="index-recent-row">
              <span className="mono index-recent-date">{formatDate(a.created_at)}</span>
              <span className="index-recent-title serif">{a.title}</span>
              <span className="tag">{a.tags.split(",")[0]}</span>
              <span className="mono index-recent-time">{a.read_time_min} min</span>
              <span className="index-recent-arrow">→</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
