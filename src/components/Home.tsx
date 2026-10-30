import { useEffect, useState } from "react";
import { Mascot } from "./Mascot";
import {
  ArrowRight,
  ChatCircleDots,
  Headphones,
  Microphone,
  PaintBrush,
  UsersThree,
  Waveform,
  ArrowClockwise,
} from "@phosphor-icons/react";
import { copy, site, type Language } from "../data/site";
import { useScrollReveal } from "../lib/useScrollReveal";
import { JoinButton } from "./Shell";
import { Portfolio } from "./Portfolio";
import { Stats, useCommunity } from "./Stats";
import { Team, useTeam } from "./Team";
import { SocialLinks } from "./SocialLinks";

function TypewriterIntro({ text, ready }: { text: string; ready: boolean }) {
  const [length, setLength] = useState(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches ? text.length : 0);
  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    let timer: number | undefined;
    const start = () => {
      window.clearTimeout(timer);
      if (preference.matches) { setLength(text.length); return; }
      let position = 0;
      setLength(0);
      if (!ready) return;
      const type = () => {
        position += 1;
        setLength(position);
        if (position < text.length) timer = window.setTimeout(type, 45);
      };
      timer = window.setTimeout(type, 300);
    };
    start();
    preference.addEventListener("change", start);
    return () => { window.clearTimeout(timer); preference.removeEventListener("change", start); };
  }, [text, ready]);
  return (
    <p className="hero-intro">
      <span className="sr-only">{text}</span>
      <span className="typing-space" aria-hidden="true">{text}</span>
      <span className="typing-copy" aria-hidden="true">{text.slice(0, length)}{length < text.length && <span className="typing-caret" />}</span>
    </p>
  );
}

export default function Home({ lang, ready = true }: { lang: Language; ready?: boolean }) {
  const t = copy[lang];
  const id = lang === "id";
  const community = useCommunity();
  const directory = useTeam();
  const page = useScrollReveal(".community-strip, .about-copy, .activity, .stats-intro, .stats-data, .section-heading, .filter-row, .event-track, .event-track-footer, .team-toolbar, .member, .faq-section > h2, .faq-list details, .social-intro, .social-card, .community-mascot-stage, .community-showcase-copy");
  const activityIcons = [ChatCircleDots, Headphones, Microphone, PaintBrush];
  return (
    <main ref={page} className="motion-page">
      <div className="reading-progress" aria-hidden="true" />
      <section className="hero" id="home">
        <div className="hero-background" aria-hidden="true" />
        <div className="hero-shade" />
        <div className="hero-content wrap">
          <h1 className="hero-name">
            <span className="sr-only">{site.name}</span>
            <span className="hero-title-logo" aria-hidden="true" />
          </h1>
          <p className="hero-tagline">{t.heroTagline}</p>
          <p className="hero-welcome">{t.eyebrow}</p>
          <TypewriterIntro key={lang} text={t.intro} ready={ready} />
          <div className="hero-presence">
            {directory.members.length > 0 && (
              <a className="hero-members" href="#team" aria-label={id ? "Kenali tim SYLUX" : "Meet the SYLUX team"}>
                {directory.members.slice(0, 3).map((member) => (
                  <img key={member.id} src={member.avatar} alt={member.name} title={`${member.name} · Team SYLUX`} width="34" height="34" />
                ))}
              </a>
            )}
            <span className="hero-online" aria-live="polite" aria-busy={community.state === "loading"}>
              {community.state === "success" && community.counts ? (
                <>
                  <span className={`presence-dot${community.counts.online === 0 ? " is-quiet" : ""}`} aria-hidden="true" />
                  <strong>{community.counts.online.toLocaleString(id ? "id-ID" : "en-US")}</strong>
                  {id ? "Sedang Aktif" : "Currently Active"}
                </>
              ) : community.state === "loading" ? (
                id ? "Menghubungkan ke Discord…" : "Connecting to Discord…"
              ) : (
                <>
                  {id ? "Status online belum tersedia" : "Online status unavailable"}
                  <button className="icon-button presence-retry" onClick={community.refresh} aria-label={id ? "Muat ulang status online" : "Reload online status"}>
                    <ArrowClockwise size={16} />
                  </button>
                </>
              )}
            </span>
          </div>
          <div className="hero-buttons">
            <a className="button join-button" href="#community">
              <UsersThree size={20} aria-hidden="true" />
              {t.explore}
              <ArrowRight size={18} aria-hidden="true" />
            </a>
          </div>
        </div>
      </section>
      <div
        className="community-strip wrap"
        aria-label={
          lang === "id" ? "Aktivitas komunitas" : "Community activities"
        }
      >
        <span>
          <ChatCircleDots size={18} />
          {t.communityHighlights[0]}
        </span>
        <span>
          <Waveform size={18} />
          {t.communityHighlights[1]}
        </span>
        <span>
          <UsersThree size={18} />
          {t.communityHighlights[2]}
        </span>
      </div>
      <section className="section wrap about" id="community">
        <div className="about-copy">
          <span className="small-brand">{t.aboutLabel}</span>
          <h2 className="line-break">{t.about}</h2>
          <p>{t.aboutBody}</p>
          <a className="about-portfolio-link" href="#portfolio">{t.portfolioLink}<ArrowRight size={18} aria-hidden="true" /></a>
        </div>
        <div className="activity-grid">
          {activityIcons.map((Icon, i) => (
            <article className="activity" key={i}>
              <Icon size={26} weight="light" />
              <h3>{t.activities[i]}</h3>
              <p>{t.activityBodies[i]}</p>
            </article>
          ))}
        </div>
      </section>
      <Stats lang={lang} community={community} />
      <Team lang={lang} directory={directory} />
      <Portfolio lang={lang} />
      <section className="section wrap faq-section">
        <h2>{t.faq}</h2>
        <div className="faq-list">
          {t.questions.map((question, i) => (
            <details key={question}>
              <summary>
                {question}
                <span aria-hidden="true">+</span>
              </summary>
              <p>{t.answers[i]}</p>
            </details>
          ))}
        </div>
      </section>
      <section className="section wrap social-section" id="social" aria-label={id ? "Media sosial resmi SYLUX" : "SYLUX official social media"}>
        <SocialLinks lang={lang} />
      </section>
      <section className="wrap community-showcase" id="join" aria-labelledby="community-join-title">
        <Mascot />
        <div className="community-showcase-copy">
          <h2 id="community-join-title"><span>Let’s go.</span>{id ? "Saatnya gabung SYLUX." : "Come join us at SYLUX."}</h2>
          <p>{t.joinBody}</p>
          <JoinButton lang={lang} />
        </div>
      </section>
    </main>
  );
}
