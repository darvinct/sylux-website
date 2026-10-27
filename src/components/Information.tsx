import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import {
  ArrowLeft, ArrowRight, Atom, Buildings, Camera, CheckCircle, Code, Confetti, Crown,
  FirstAidKit, GameController, Handshake, House, Lightning, Medal, Megaphone,
  PaintBrush, Receipt, Sword, UserCircle, UsersThree, VideoCamera,
} from "@phosphor-icons/react";
import { legacyRole, levellingRoles, sentinelDivisions } from "../data/roles";
import { type Language } from "../data/site";
import { useScrollReveal } from "../lib/useScrollReveal";
import { BrandLogo, JoinButton } from "./Shell";
import "../information.css";

const icons = {
  partner: Handshake, "event-creative": Confetti, "design-editor": PaintBrush,
  publication: Megaphone, media: Camera, game: GameController, female: UsersThree,
  streamer: VideoCamera, medic: FirstAidKit, payment: Receipt,
  outsider: UserCircle, resident: House, "data-knight": Sword,
  "circuit-breaker": Lightning, "code-whisperer": Code, "neon-architect": Buildings,
  "quantum-shaper": Atom, "glitched-crown": Crown,
};

export default function Information({ lang }: { lang: Language }) {
  const id = lang === "id";
  const [selected, setSelected] = useState(0);
  const track = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ start: true, end: false });
  useEffect(() => {
    const element = track.current;
    if (!element || !window.IntersectionObserver) return;
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.target === element.firstElementChild)
          setEdges((previous) => ({ ...previous, start: entry.intersectionRatio >= .98 }));
        if (entry.target === element.lastElementChild)
          setEdges((previous) => ({ ...previous, end: entry.intersectionRatio >= .98 }));
      }
    }, { root: element, threshold: [0, .98, 1] });
    if (element.firstElementChild) observer.observe(element.firstElementChild);
    if (element.lastElementChild) observer.observe(element.lastElementChild);
    return () => observer.disconnect();
  }, []);
  const role = sentinelDivisions[selected];
  const Icon = icons[role.id];
  const page = useScrollReveal(".information-section-title, .management-layout, .community-role, .information-note, .information-cta");
  function navigate(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const direction = ["ArrowDown", "ArrowRight"].includes(event.key) ? 1
      : ["ArrowUp", "ArrowLeft"].includes(event.key) ? -1 : 0;
    const next = event.key === "Home" ? 0 : event.key === "End" ? sentinelDivisions.length - 1
      : direction ? (index + direction + sentinelDivisions.length) % sentinelDivisions.length : null;
    if (next === null) return;
    event.preventDefault();
    setSelected(next);
    event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>("button")[next]?.focus();
  }
  return (
    <main className="information-page motion-page wrap" ref={page}>
      <div className="reading-progress" aria-hidden="true" />
      <header className="information-intro">
        <a className="back-link" href="/"><ArrowLeft size={17} />{id ? "Kembali ke komunitas" : "Back to the community"}</a>
        <h1>{id ? "Informasi" : "Community"}<br /><span>{id ? "komunitas." : "information."}</span></h1>
        <p>{id ? "Kenali divisi Sentinel dan setiap tahap levelling yang membentuk perjalananmu di SYLUX." : "Explore the Sentinel divisions and levelling tiers that shape your SYLUX journey."}</p>
        <div className="information-jumps"><a href="#management-title">Sentinel Divisions <ArrowRight size={15} /></a><a href="#community-roles-title">Levelling <ArrowRight size={15} /></a></div>
      </header>

      <section className="information-section" aria-labelledby="management-title">
        <div className="information-section-title">
          <h2 id="management-title">Sentinel Divisions</h2>
          <p>{id ? "Sepuluh divisi, satu komunitas. Pilih divisi untuk mengenali fokus dan perannya." : "Ten divisions, one community. Choose a division to explore its role and focus."}</p>
        </div>
        <div className="management-layout">
          <div className="role-selector" role="group" aria-label={id ? "Pilih divisi Sentinel" : "Choose a Sentinel division"}>
            {sentinelDivisions.map((item, index) => {
              const ItemIcon = icons[item.id];
              return (
                <button key={item.id} aria-pressed={selected === index} aria-controls="management-detail" onClick={() => setSelected(index)} onKeyDown={(event) => navigate(event, index)}>
                  <ItemIcon size={21} aria-hidden="true" />
                  <span>{item.name}</span>
                  <ArrowRight size={17} className="role-selector-arrow" aria-hidden="true" />
                </button>
              );
            })}
          </div>
          <article className="role-feature" id="management-detail" aria-live="polite" aria-atomic="true">
            <div className="role-watermark" aria-hidden="true"><BrandLogo /></div>
            <div className="role-feature-content" key={role.id}>
              <span className="role-feature-icon"><Icon size={34} weight="light" aria-hidden="true" /></span>
              <p className="role-category">{role.category[lang]}</p>
              <h3>{role.name}</h3>
              <p className="role-description">{role.description[lang]}</p>
              <h4>{id ? "Fokus divisi" : "Division focus"}</h4>
              <ul>{role.duties[lang].map((duty) => <li key={duty}><CheckCircle size={19} aria-hidden="true" /><span>{duty}</span></li>)}</ul>
            </div>
          </article>
        </div>
      </section>

      <section className="information-section community-roles-section" aria-labelledby="community-roles-title">
        <div className="information-section-title">
          <h2 id="community-roles-title">Levelling</h2>
          <p>{id ? "Dari Outsider sampai The Glitched Crown. Kenali setiap tier dalam perjalanan level 0–135." : "From Outsider to The Glitched Crown. Explore every tier on the level 0–135 journey."}</p>
        </div>
        <div className="community-role-track" id="community-role-track" ref={track} role="region" aria-label={id ? "Tier levelling SYLUX" : "SYLUX levelling tiers"} tabIndex={0}>
          {levellingRoles.map((item) => {
            const ItemIcon = icons[item.id];
            return (
              <article className="community-role" key={item.id}>
                <ItemIcon size={28} weight="light" aria-hidden="true" />
                <span className="level-range">Level {item.minLevel}–{item.maxLevel}</span>
                <h3>{item.name}</h3>
                <p>{item.description[lang]}</p>
              </article>
            );
          })}
        </div>
        <div className="community-role-controls">
          <span>{id ? "Delapan tier progresi SYLUX." : "Eight SYLUX progression tiers."}</span>
          <div>
            <button className="icon-button" disabled={edges.start} aria-controls="community-role-track" aria-label={id ? "Role komunitas sebelumnya" : "Previous community role"} onClick={() => track.current?.scrollBy({ left: -track.current.clientWidth * .8, behavior: "auto" })}><ArrowLeft size={21} /></button>
            <button className="icon-button" disabled={edges.end} aria-controls="community-role-track" aria-label={id ? "Role komunitas berikutnya" : "Next community role"} onClick={() => track.current?.scrollBy({ left: track.current.clientWidth * .8, behavior: "auto" })}><ArrowRight size={21} /></button>
          </div>
        </div>
        <article className="community-role legacy-role">
          <span className="legacy-icon"><Medal size={32} weight="light" aria-hidden="true" /></span>
          <div><span className="level-range">Legacy recognition</span><h3>{legacyRole.name}</h3><p>{legacyRole.description[lang]}</p></div>
        </article>
        <p className="information-note">{id ? "Penamaan role dan akses mengikuti pengaturan serta pengumuman terbaru di server SYLUX." : "Role names and access follow the latest settings and announcements in the SYLUX server."}</p>
      </section>

      <section className="information-cta">
        <div><h2>{id ? "Mulai dari satu sapaan." : "Start with a simple hello."}</h2><p>{id ? "Kenali komunitasnya, temukan temanmu, dan bawa ceritamu." : "Discover the community, find your people, and bring your story."}</p></div>
        <JoinButton lang={lang} />
      </section>
    </main>
  );
}
