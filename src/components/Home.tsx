import {
  ArrowRight,
  ArrowUpRight,
  ChatCircleDots,
  Headphones,
  ImageSquare,
  Microphone,
  PaintBrush,
  UsersThree,
  Waveform,
  FileText,
  Code,
} from "@phosphor-icons/react";
import { copy, site, type Language } from "../data/site";
import { JoinButton } from "./Shell";
import { Portfolio } from "./Portfolio";
import { Stats } from "./Stats";
import { Team } from "./Team";

export default function Home({ lang }: { lang: Language }) {
  const t = copy[lang];
  const activityIcons = [ChatCircleDots, Headphones, Microphone, PaintBrush];
  const toolIcons = [ImageSquare, FileText, Code];
  return (
    <main>
      <section className="hero" id="home">
        <img
          className="hero-background"
          src="/images/hero.webp"
          alt=""
          fetchPriority="high"
          width="1672"
          height="941"
        />
        <div className="hero-shade" />
        <div className="hero-content wrap">
          <p className="eyebrow">
            <span />
            {t.eyebrow}
          </p>
          <h1>
            {t.hero[0]}
            <br />
            <span>{t.hero[1]}</span>
          </h1>
          <p className="hero-intro">{t.intro}</p>
          <div className="hero-buttons">
            <JoinButton lang={lang} />
            <a className="hero-secondary" href="#community">
              {t.explore}
              <ArrowRight size={18} />
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
          Good conversations
        </span>
        <span>
          <Waveform size={18} />
          Late night company
        </span>
        <span>
          <UsersThree size={18} />
          Your kind of people
        </span>
      </div>
      <section className="section wrap about" id="community">
        <div className="about-copy">
          <span className="small-brand">
            {site.name.toUpperCase()} IS A PLACE TO BELONG.
          </span>
          <h2 className="line-break">{t.about}</h2>
          <p>{t.aboutBody}</p>
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
      <Stats lang={lang} />
      <Portfolio lang={lang} />
      <Team lang={lang} />
      <section className="section wrap tools-section">
        <div className="section-heading">
          <h2>{t.tools}</h2>
          <p>{t.toolsBody}</p>
        </div>
        <div className="tools-list">
          {toolIcons.map((Icon, i) => (
            <a
              key={i}
              className="tool-link"
              href={["/twibbon", "/forms/public", "/webhooks/editor"][i]}
            >
              <span className="tool-icon">
                <Icon size={26} weight="light" />
              </span>
              <div>
                <h3>{t.toolNames[i]}</h3>
                <p>{t.toolBodies[i]}</p>
              </div>
              <ArrowUpRight size={25} />
            </a>
          ))}
        </div>
      </section>
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
      <section className="closing wrap">
        <BirdMark />
        <div>
          <h2 className="line-break">{t.closing}</h2>
          <p>{t.closingBody}</p>
        </div>
        <JoinButton lang={lang} />
      </section>
    </main>
  );
}

function BirdMark() {
  return (
    <div className="closing-mark" aria-hidden="true">
      n.
    </div>
  );
}
