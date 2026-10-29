import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  ArrowLeft,
  ArrowUpRight,
  DiscordLogo,
  InstagramLogo,
  TiktokLogo,
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
  const id = lang === "id";
  const socials = [
    { name: "Discord", href: site.discordInvite, Icon: DiscordLogo },
    { name: "Instagram", href: site.instagram, Icon: InstagramLogo },
    { name: "TikTok", href: site.tiktok, Icon: TiktokLogo },
  ];
  return (
    <footer className="footer">
      <div className="footer-top wrap">
        <div className="footer-brand">
          <a href="/" className="wordmark" aria-label={`${site.name} home`}><BrandLogo /></a>
          <p>{id ? "Ruang untuk bertukar pengalaman, mengembangkan bakat, dan mewujudkan ide bersama." : "Share experiences, develop your talents, and bring ideas to life together."}</p>
          <div className="footer-socials" role="group" aria-label={id ? "Media sosial SYLUX" : "SYLUX social media"}>
            {socials.map(({ name, href, Icon }) => <a key={name} href={href} target="_blank" rel="noreferrer" aria-label={`${name} SYLUX`}><Icon size={21} aria-hidden="true" /></a>)}
          </div>
        </div>
        <nav className="footer-column" aria-label={id ? "Halaman situs" : "Site pages"}>
          <h2>{id ? "Halaman" : "Pages"}</h2>
          {["home", "stats", "team", "portfolio"].map((anchor, index) => <a key={anchor} href={`/#${anchor}`}>{t.nav[index]}</a>)}
          <a href="/information">{t.information}</a>
        </nav>
        <nav className="footer-column" aria-label={id ? "Tautan komunitas" : "Community links"}>
          <h2>{id ? "Tautan" : "Links"}</h2>
          {socials.map(({ name, href }) => <a key={name} href={href} target="_blank" rel="noreferrer">{name === "Discord" ? "Discord Server" : name}</a>)}
        </nav>
        <div className="footer-column footer-community">
          <h2>{id ? "Kolaborasi" : "Collaborate"}</h2>
          <p>{id ? "Punya ide kegiatan? Mari bicarakan bersama." : "Have an idea for an event? Let's talk about it."}</p>
          <a className="footer-contact" href={site.discordInvite} target="_blank" rel="noreferrer"><DiscordLogo size={17} aria-hidden="true" />{id ? "Diskusi di Discord" : "Talk on Discord"}</a>
          <h2>{t.team}</h2>
          <a href="/#team">{id ? "Kenali anggota dan divisi" : "Meet the people and divisions"}</a>
        </div>
      </div>
      {site.isDemo && <p className="demo-note wrap">{t.demo}</p>}
      <div className="footer-base">
        <div className="footer-bottom wrap">
          <span>© {new Date().getFullYear()} {site.name} Community.</span>
          <a href="/#home">{id ? "Kembali ke atas" : "Back to top"}<ArrowUpRight size={15} aria-hidden="true" /></a>
        </div>
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
