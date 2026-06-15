import { Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import Header from "./Header";
import Footer from "./Footer";
import { api } from "../lib/api";
import type { SiteConfig } from "../lib/types";

const DEFAULT_CONFIG: SiteConfig = {
  name: "srikanthsistu website",
  tagline: "writing, systems & photography",
  location: "Lisbon",
  github: "",
  twitter: "",
  email: "",
  now_text: "",
  index_eyebrow: "Writer + ML Systems + Photography",
  index_hero: "I break complex systems down to their essence.",
  index_intro: "I read the research so the ideas show through, design machine-learning systems in the open, and photograph the world in between.",
  mission_statement: "Make the hidden wiring visible — through clear writing, honest systems, and a steady eye on the world.",
  index_explore: [],
};

export default function Layout() {
  const [config, setConfig] = useState<SiteConfig>(DEFAULT_CONFIG);

  useEffect(() => {
    api.getConfig().then(setConfig).catch(() => {});
  }, []);

  return (
    <>
      <Header config={config} />
      <main className="container" style={{ paddingTop: 48, paddingBottom: 48, minHeight: "70vh" }}>
        <Outlet context={config} />
      </main>
      <Footer config={config} />
    </>
  );
}
