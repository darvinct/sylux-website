import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  ArrowLeft,
  ArrowUpRight,
  DiscordLogo,
  CaretLeft,
  List,
  X,
} from "@phosphor-icons/react";
import { copy, site, type Language } from "../data/site";
import { inviteCode } from "../lib/utils";
import { AuthControl } from "./Auth";
import share from "../data/share.json";

export function BrandLogo({ className = "" }: { className?: string }) {
  return <img className={`brand-logo ${className}`} src="/images/sylux-logo-hd.png" alt={site.name} width="2158" height="729" />;
}

export function JoinButton({
  lang,
  className = "",
}: {
  lang: Language;
  className?: string;
}) {
  const t = copy[lang];
  return inviteCode(site.discordInvite) ? (
    <a
      className={`button join-button ${className}`}
      href={site.discordInvite}
      target="_blank"
      rel="noreferrer"
    >
      <DiscordLogo size={20} weight="fill" />
      {t.join}
      <ArrowUpRight size={18} />
    </a>
  ) : (
    <button className={`button join-button ${className}`} disabled>
      <DiscordLogo size={20} weight="fill" />
      {t.waiting}
    </button>
  );
}

export function Header({
  lang,
  setLang,
  tool = false,
}: {
  lang: Language;
  setLang: (lang: Language) => void;
  tool?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const t = copy[lang];
  const closeMenus = () => setOpen(false);
  useEffect(() => {
    const narrow = window.matchMedia("(max-width: 1023px)");
    const expandOnMobile = () => { if (narrow.matches) setCollapsed(false); };
    const close = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setOpen(false);
      const trigger = document.getElementById("nav-menu-toggle");
      if (trigger?.getAttribute("aria-expanded") === "true") trigger.focus();
    };
    window.addEventListener("keydown", close);
    narrow.addEventListener("change", expandOnMobile);
    return () => {
      window.removeEventListener("keydown", close);
      narrow.removeEventListener("change", expandOnMobile);
    };
  }, []);
  return (
    <header className={`header${collapsed ? " is-collapsed" : ""}`}>
      <a className="wordmark" href="/" aria-label={`${site.name} home`}>
        <img className="nav-emblem" src={share.thumbnail} alt="" width="28" height="28" />
        <BrandLogo />
      </a>
      <div className="header-content" id="header-content" inert={collapsed}>
        <nav
          className={open ? "nav is-open" : "nav"}
          aria-label={lang === "id" ? "Navigasi utama" : "Main navigation"}
          id="main-nav"
        >
          {["home", "stats", "team", "portfolio"].map((id, i) => (
            <a
              key={id}
              href={`${tool ? "/" : ""}#${id}`}
              aria-current={!tool && i === 0 ? "page" : undefined}
              onClick={closeMenus}
            >
              {t.nav[i]}
            </a>
          ))}
          <a href="/information" onClick={closeMenus} aria-current={window.location.pathname.replace(/\/$/, "") === "/information" ? "page" : undefined}>{t.information}</a>
        </nav>
      </div>
      <div className="header-actions">
        <div className="language" aria-label={lang === "id" ? "Bahasa" : "Language"}>
          <button aria-pressed={lang === "en"} onClick={() => setLang("en")}>
            EN
          </button>
          <button aria-pressed={lang === "id"} onClick={() => setLang("id")}>
            ID
          </button>
        </div>
        <AuthControl lang={lang} />
        <button
          id="nav-menu-toggle"
          className="icon-button menu-button"
          onClick={() => { if (open) closeMenus(); else setOpen(true); }}
          aria-label={open ? t.close : "Menu"}
          aria-expanded={open}
          aria-controls="main-nav"
        >
          {open ? <X size={23} /> : <List size={23} />}
        </button>
      </div>
      <button className="icon-button nav-collapse" onClick={() => { closeMenus(); setCollapsed(!collapsed); }} aria-label={lang === "id" ? (collapsed ? "Perluas navbar" : "Ringkas navbar") : (collapsed ? "Expand navigation" : "Collapse navigation")} aria-expanded={!collapsed} aria-controls="header-content">
        <CaretLeft size={20} aria-hidden="true" />
      </button>
    </header>
  );
}

export function Footer({ lang }: { lang: Language }) {
  const t = copy[lang];
  return (
    <footer className="footer wrap">
      <div className="footer-top">
        <a href="/" className="wordmark" aria-label={`${site.name} home`}>
          <BrandLogo />
        </a>
        <p>{site.tagline}</p>
        <div className="footer-links">
          <a href="/information">{t.information}</a>
          {site.instagram && (
            <a href={site.instagram} target="_blank" rel="noreferrer">
              Instagram
              <ArrowUpRight size={13} />
            </a>
          )}
        </div>
      </div>
      {site.isDemo && <p className="demo-note">{t.demo}</p>}
      <div className="footer-bottom">
        <span>
          © {new Date().getFullYear()} {site.name}.
        </span>
        <span>{t.rights}</span>
        <a href="/#home">
          {lang === "id" ? "Kembali ke atas" : "Back to top"} ↑
        </a>
      </div>
    </footer>
  );
}

export function Modal({
  title,
  children,
  onClose,
  className = "",
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
  className?: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    const previous = document.activeElement as HTMLElement | null;
    dialog?.showModal();
    const close = () => onClose();
    dialog?.addEventListener("close", close);
    document.body.style.overflow = "hidden";
    return () => {
      dialog?.removeEventListener("close", close);
      document.body.style.overflow = "";
      previous?.focus();
    };
  }, [onClose]);
  return (
    <dialog
      ref={ref}
      className={`modal ${className}`}
      aria-labelledby="modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
    >
      <div className="modal-content">
        <button
          className="icon-button modal-close"
          aria-label="Close / Tutup"
          onClick={onClose}
        >
          <X size={23} />
        </button>
        <h2 id="modal-title">{title}</h2>
        {children}
      </div>
    </dialog>
  );
}

export function ToolHeading({
  title,
  body,
  lang,
}: {
  title: string;
  body: string;
  lang: Language;
}) {
  return (
    <div className="tool-heading">
      <a href="/" className="back-link">
        <ArrowLeft size={18} />
        {lang === "id" ? "Kembali ke komunitas" : "Back to community"}
      </a>
      <h1>{title}</h1>
      <p>{body}</p>
    </div>
  );
}
