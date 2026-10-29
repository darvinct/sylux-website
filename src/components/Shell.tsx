import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  ArrowLeft,
  ArrowUpRight,
  DiscordLogo,
  X,
} from "@phosphor-icons/react";
import { copy, site, type Language } from "../data/site";
import { inviteCode } from "../lib/utils";

export function BrandLogo({ className = "" }: { className?: string }) {
  return <img className={`brand-logo ${className}`} src="/images/sylux-logo.webp" alt={site.name} width="2158" height="729" />;
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
  const [hidden, setHidden] = useState(false);
  const header = useRef<HTMLElement>(null);
  const t = copy[lang];
  useEffect(() => {
    let previousY = window.scrollY;
    let direction = 0;
    let distance = 0;
    const scroll = () => {
      const currentY = Math.max(0, Math.min(window.scrollY, document.documentElement.scrollHeight - window.innerHeight));
      const delta = currentY - previousY;
      previousY = currentY;
      if (currentY <= 96 || header.current?.querySelector(":focus-visible")) {
        setHidden(false);
        distance = 0;
        return;
      }
      if (!delta) return;
      const nextDirection = Math.sign(delta);
      if (nextDirection !== direction) distance = 0;
      direction = nextDirection;
      distance += Math.abs(delta);
      if (distance >= (direction > 0 ? 16 : 8)) setHidden(direction > 0);
    };
    window.addEventListener("scroll", scroll, { passive: true });
    return () => window.removeEventListener("scroll", scroll);
  }, []);
  return (
    <header ref={header} className={`header${hidden ? " is-hidden" : ""}`} onFocusCapture={() => setHidden(false)}>
      <a className="wordmark" href="/" aria-label={`${site.name} home`}>
        <BrandLogo />
      </a>
      <div className="header-content" id="header-content">
        <nav
          className="nav"
          aria-label={lang === "id" ? "Navigasi utama" : "Main navigation"}
          id="main-nav"
        >
          {["home", "stats", "team", "portfolio"].map((id, i) => (
            <a
              key={id}
              href={`${tool ? "/" : ""}#${id}`}
              aria-current={!tool && i === 0 ? "page" : undefined}
            >
              {t.nav[i]}
            </a>
          ))}
          <a href="/information" aria-current={window.location.pathname.replace(/\/$/, "") === "/information" ? "page" : undefined}>{t.information}</a>
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
