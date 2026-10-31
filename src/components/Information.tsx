import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
import { Mascot } from "./Mascot";
import {
  ArrowDown, ArrowLeft, ArrowRight, Atom, Buildings, Camera, Code, Confetti, Crown,
  FirstAidKit, GameController, Handshake, House, Lightning, Medal, Megaphone,
  PaintBrush, Receipt, Sword, UserCircle, UsersThree, VideoCamera,
} from "@phosphor-icons/react";
import { legacyRole, levellingRoles, sentinelDivisions } from "../data/roles";
import { copy, type Language } from "../data/site";
import { useScrollReveal } from "../lib/useScrollReveal";
import { useRoleScroller } from "../lib/useRoleScroller";
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

function roleStyle(colors: readonly string[]): CSSProperties {
  return { "--role-color": colors[0], "--role-gradient": `linear-gradient(105deg, ${colors.join(", ")})` } as CSSProperties;
}

export default function Information({ lang }: { lang: Language }) {
  const id = lang === "id";
  const hero = useRef<HTMLElement>(null);
  useEffect(() => {
    const section = hero.current;
    if (!section) return;
    const logo = section.querySelector<HTMLElement>(".information-hero-logo");
    const shade = section.querySelector<HTMLElement>(".information-hero-shade");
    if (!logo || !shade) return;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    const render = () => {
      frame = 0;
      if (motion.matches) { logo.style.transform = ""; shade.style.opacity = ""; return; }
      const rect = section.getBoundingClientRect();
      const distance = Math.max(1, section.offsetHeight - window.innerHeight);
      const progress = Math.min(1, Math.max(0, -rect.top / distance));
      logo.style.transform = `scale(${1 + 13 * progress})`;
      shade.style.opacity = String(Math.min(1, Math.max(0, (progress - .4) / .45)));
    };
    const update = () => { if (!frame) frame = requestAnimationFrame(render); };
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    motion.addEventListener("change", update);
    update();
    return () => { window.removeEventListener("scroll", update); window.removeEventListener("resize", update); motion.removeEventListener("change", update); cancelAnimationFrame(frame); };
  }, []);
  const [selected, setSelected] = useState(0);
  const list = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const roleScene = useRef<HTMLElement>(null);
  const roleRange = useRef<HTMLInputElement>(null);
  const dragging = useRef<{ x: number; left: number } | null>(null);
  const moveCommunity = useRoleScroller(roleScene, track, roleRange);
  function stepCommunity(direction: number) {
    const element = track.current;
    if (element) moveCommunity((element.scrollLeft + direction * element.clientWidth * .8) / Math.max(1, element.scrollWidth - element.clientWidth), true);
  }

  const [edges, setEdges] = useState({ start: true, end: false });
  useEffect(() => {
    if (!window.IntersectionObserver) return;
    let observer: IntersectionObserver;
    const observe = () => {
      observer?.disconnect();
      const middle = Math.floor(window.innerHeight / 2);
      observer = new IntersectionObserver((entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setSelected(Number((entry.target as HTMLElement).dataset.step));
        }
      }, { rootMargin: `-${middle}px 0px -${window.innerHeight - middle - 1}px 0px`, threshold: 0 });
      list.current?.querySelectorAll("[data-step]").forEach((element) => observer.observe(element));
    };
    observe();
    window.addEventListener("resize", observe);
    return () => { observer.disconnect(); window.removeEventListener("resize", observe); };
  }, []);
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
  function chooseDivision(index: number) {
    setSelected(index);
    list.current?.querySelector<HTMLElement>(`[data-step="${index}"]`)?.scrollIntoView({ block: "center", behavior: "instant" });
  }
  function navigate(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const direction = ["ArrowDown", "ArrowRight"].includes(event.key) ? 1
      : ["ArrowUp", "ArrowLeft"].includes(event.key) ? -1 : 0;
    const next = event.key === "Home" ? 0 : event.key === "End" ? sentinelDivisions.length - 1
      : direction ? (index + direction + sentinelDivisions.length) % sentinelDivisions.length : null;
    if (next === null) return;
    event.preventDefault();
    chooseDivision(next);
    list.current?.querySelectorAll<HTMLButtonElement>("button")[next]?.focus({ preventScroll: true });
  }
  const role = sentinelDivisions[selected];
  const Icon = icons[role.id];
  const page = useScrollReveal(".information-section-title, .community-role-track, .community-role-controls, .information-note, .information-legacy, .community-mascot-stage, .community-showcase-copy");
  return (
    <main className="information-page motion-page" ref={page}>
      <div className="reading-progress" aria-hidden="true" />
      <section ref={hero} className="information-hero" aria-labelledby="information-title">
        <div className="information-hero-stage">
          <div className="information-hero-copy">
            <span className="information-hero-logo" aria-hidden="true" />
            <h1 id="information-title">{id ? "Informasi komunitas" : "Community information"}</h1>
            <p>{id ? "Orang-orangnya. Perannya. Perjalananmu." : "The people. The roles. Your journey."}</p>
          </div>
          <a className="information-scroll-cue" href="#management-title">{id ? "Jelajahi role SYLUX" : "Explore SYLUX roles"}<ArrowDown size={20} /></a>
          <div className="information-hero-shade" aria-hidden="true" />
        </div>
      </section>

      <section className="information-section sentinel-scroll" aria-labelledby="management-title">
        <div className="information-shell">
          <header className="information-section-title">
            <span className="information-kicker">{id ? "INFORMASI KOMUNITAS" : "COMMUNITY INFORMATION"}</span>
            <h2 id="management-title">ROLE MANAGEMENT</h2>
            <p>{id ? "Kenali sepuluh divisi Sentinel yang menggerakkan SYLUX." : "Meet the ten Sentinel divisions behind SYLUX."}</p>
          </header>
          <div className="management-layout">
            <div className="role-selector" ref={list} role="group" aria-label={id ? "Divisi Sentinel" : "Sentinel divisions"}>
              {sentinelDivisions.map((item, index) => (
                <article key={item.id} className={`info-role-item${selected === index ? " is-active" : ""}`} data-step={index} style={roleStyle(item.colors)}>
                  <h3><button data-division={index} aria-pressed={selected === index} aria-controls="management-detail" onClick={() => chooseDivision(index)} onKeyDown={(event) => navigate(event, index)}>{item.name}</button></h3>
                  <p>{item.description[lang]}</p>
                </article>
              ))}
            </div>
            <article className="role-feature" id="management-detail" style={roleStyle(role.colors)} aria-label={id ? "Divisi yang sedang ditampilkan" : "Currently featured division"}>
              <div className="role-watermark" aria-hidden="true"><BrandLogo /></div>
              <div className="role-feature-content" key={role.id}>
                <span className="role-feature-icon"><Icon size={32} weight="light" aria-hidden="true" /></span>
                <div>
                  <p className="role-category">Sentinel Divisions</p>
                  <h3>{role.name}</h3>
                  <span className="division-position">{String(selected + 1).padStart(2, "0")} / {String(sentinelDivisions.length).padStart(2, "0")}</span>
                </div>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section ref={roleScene} className="information-section community-roles-section" aria-labelledby="community-roles-title">
        <div className="community-roles-stage">
        <header className="information-section-title information-shell">
          <span className="information-kicker">COMMUNITY ROLES</span>
          <h2 id="community-roles-title">{id ? "Roles Komunitas" : "Community Roles"}</h2>
          <p>{id ? "Delapan tier levelling, dari Outsider sampai The Glitched Crown." : "Eight levelling tiers, from Outsider to The Glitched Crown."}</p>
        </header>
        <div className="community-role-track" id="community-role-track" ref={track}
          onPointerDown={(event) => {
            if (event.pointerType !== "mouse") return;
            dragging.current = { x: event.clientX, left: event.currentTarget.scrollLeft };
            event.currentTarget.setPointerCapture(event.pointerId);
          }}
          onPointerMove={(event) => {
            if (!dragging.current) return;
            const element = event.currentTarget;
            moveCommunity((dragging.current.left + dragging.current.x - event.clientX) / Math.max(1, element.scrollWidth - element.clientWidth));
          }}
          onPointerUp={() => { dragging.current = null; }} onPointerCancel={() => { dragging.current = null; }} onLostPointerCapture={() => { dragging.current = null; }}
          onKeyDown={(event) => {
            if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
            event.preventDefault();
            if (event.key === "Home" || event.key === "End") moveCommunity(event.key === "Home" ? 0 : 1, true);
            else stepCommunity(event.key === "ArrowRight" ? 1 : -1);
          }}
          role="region" aria-label={id ? "Tier levelling SYLUX" : "SYLUX levelling tiers"} tabIndex={0}>
          {levellingRoles.map((item) => {
            const ItemIcon = icons[item.id];
            return (
              <article className="community-role" key={item.id} style={roleStyle(item.colors)}>
                <div className="community-role-stage"><ItemIcon size={84} weight="duotone" aria-hidden="true" /></div>
                <div className="community-role-body">
                  <span className="level-range">Level {item.minLevel}–{item.maxLevel}</span>
                  <h3 className="role-label">{item.name}</h3>
                  <p>{item.description[lang]}</p>
                </div>
              </article>
            );
          })}
        </div>
        <div className="community-role-slider information-shell"><input ref={roleRange} type="range" min="0" max="1000" defaultValue="0" aria-label={id ? "Geser daftar role komunitas" : "Scroll community roles"} aria-controls="community-role-track" onChange={(event) => moveCommunity(Number(event.target.value) / 1000)} /></div>
        <div className="community-role-controls information-shell">
          <span>{id ? "Geser untuk melihat setiap tier." : "Swipe to explore every tier."}</span>
          <div>
            <button className="icon-button" disabled={edges.start} aria-controls="community-role-track" aria-label={id ? "Role komunitas sebelumnya" : "Previous community role"} onClick={() => stepCommunity(-1)}><ArrowLeft size={21} /></button>
            <button className="icon-button" disabled={edges.end} aria-controls="community-role-track" aria-label={id ? "Role komunitas berikutnya" : "Next community role"} onClick={() => stepCommunity(1)}><ArrowRight size={21} /></button>
          </div>
        </div>
        </div>
      </section>

      <section className="information-legacy information-shell" aria-labelledby="legacy-title" style={roleStyle(legacyRole.colors)}>
        <Medal size={100} weight="duotone" aria-hidden="true" />
        <div className="legacy-role">
          <span className="information-kicker">LEGACY RECOGNITION</span>
          <h2 id="legacy-title" className="role-label">{legacyRole.name}</h2>
          <p>{legacyRole.description[lang]}</p>
        </div>
      </section>
      <p className="information-note information-shell">{id ? "Penamaan role dan akses mengikuti pengaturan serta pengumuman terbaru di server SYLUX." : "Role names and access follow the latest settings and announcements in the SYLUX server."}</p>
      <section className="wrap community-showcase" aria-labelledby="information-join-title">
        <Mascot />
        <div className="community-showcase-copy">
          <h2 id="information-join-title"><span>Let’s go.</span>{id ? "Saatnya gabung SYLUX." : "Come join us at SYLUX."}</h2>
          <p>{copy[lang].joinBody}</p>
          <JoinButton lang={lang} />
        </div>
      </section>
    </main>
  );
}
