import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  ArrowLeft,
  ArrowUpRight,
  DiscordLogo,
  List,
  X,
} from "@phosphor-icons/react";
import { copy, site, type Language } from "../data/site";
import { inviteCode } from "../lib/utils";
import { AuthControl } from "./Auth";

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
      className={`button primary ${className}`}
      href={site.discordInvite}
      target="_blank"
      rel="noreferrer"
    >
      <DiscordLogo size={20} weight="fill" />
      {t.join}
      <ArrowUpRight size={18} />
    </a>
  ) : (
    <button className={`button primary ${className}`} disabled>
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
  const t = copy[lang];
  useEffect(() => {
    const close = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, []);
  return (
    <header className="header">
      <a className="wordmark" href="/" aria-label={`${site.name} home`}>
        <BrandLogo />
      </a>
      <nav
        className={open ? "nav is-open" : "nav"}
        aria-label={lang === "id" ? "Navigasi utama" : "Main navigation"}
        id="main-nav"
      >
        {["home", "stats", "team", "portfolio"].map((id, i) => (
          <a
            key={id}
            href={`${tool ? "/" : ""}#${id}`}
            onClick={() => setOpen(false)}
          >
            {t.nav[i]}
          </a>
        ))}
        <a href="/information" onClick={() => setOpen(false)} aria-current={window.location.pathname.replace(/\/$/, "") === "/information" ? "page" : undefined}>
          {t.information}
        </a>
        <a href="/twibbon" onClick={() => setOpen(false)}>
          Twibbon
          <ArrowUpRight size={12} />
        </a>
      </nav>
      <div className="header-actions">
        <div className="language" aria-label="Language">
          <button aria-pressed={lang === "id"} onClick={() => setLang("id")}>
            ID
          </button>
          <button aria-pressed={lang === "en"} onClick={() => setLang("en")}>
            EN
          </button>
        </div>
        <AuthControl lang={lang} />
        <button
          className="icon-button menu-button"
          onClick={() => setOpen(!open)}
          aria-label={open ? t.close : "Menu"}
          aria-expanded={open}
          aria-controls="main-nav"
        >
          {open ? <X size={23} /> : <List size={23} />}
        </button>
      </div>
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
          <a href="/twibbon">Twibbon</a>
          <a href="/forms/public">Form</a>
          <a href="/webhooks/editor">Webhook</a>
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
