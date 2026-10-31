import { useEffect, useState, type CSSProperties } from "react";
import type { Language } from "../data/site";
import { OPENING_ANIMATION_MS, OPENING_LOGO_WAIT_MS, prepareOpeningLogo } from "../lib/opening";
export { shouldPlayOpening } from "../lib/opening";
import "../opening.css";

const stars = Array.from({ length: 18 }, (_, index) => ({
  "--x": `${2 + (index * 37) % 96}%`,
  "--y": `${4 + (index * 53) % 92}%`,
  "--size": `${index % 7 === 0 ? 3 : index % 3 === 0 ? 2 : 1}px`,
  "--delay": `${(index % 6) * .06}s`,
}) as CSSProperties);

export function Opening({ lang, onComplete }: { lang: Language; onComplete: () => void }) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const keydown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onComplete();
    };
    const motionChange = () => { if (preference.matches) onComplete(); };
    // Always release the page, even if an animation is disabled by a browser extension.
    const fallback = window.setTimeout(onComplete, OPENING_LOGO_WAIT_MS + OPENING_ANIMATION_MS + 200);
    document.documentElement.classList.add("opening-active");
    document.addEventListener("keydown", keydown);
    window.addEventListener("hashchange", onComplete);
    preference.addEventListener("change", motionChange);
    void prepareOpeningLogo(controller.signal).then((loaded) => {
      if (!active) return;
      if (loaded) setReady(true);
      else onComplete();
    });
    return () => {
      active = false;
      controller.abort();
      window.clearTimeout(fallback);
      document.documentElement.classList.remove("opening-active");
      document.removeEventListener("keydown", keydown);
      window.removeEventListener("hashchange", onComplete);
      preference.removeEventListener("change", motionChange);
    };
  }, [onComplete]);

  return (
    <div className={`opening${ready ? " is-ready" : ""}`}>
      {ready ? <>
      <div className="opening-curtain opening-curtain-top" aria-hidden="true" onAnimationEnd={onComplete} />
      <div className="opening-curtain opening-curtain-bottom" aria-hidden="true" />
      <div className="opening-galaxy" aria-hidden="true">
        <div className="opening-nebula" />
        <div className="opening-stars">
          {stars.map((style, index) => <i key={index} style={style} />)}
        </div>
      </div>
      <div className="opening-mark" aria-hidden="true">
        <div className="opening-letters">
          {["S", "Y", "L", "U", "X"].map((letter, index) => (
            <span className="opening-letter" key={letter} style={{ "--letter": index } as CSSProperties} />
          ))}
        </div>
        <div className="opening-shine" />
        <div className="opening-glint opening-glint-first" />
        <div className="opening-glint opening-glint-last" />
      </div>
      </> : <p className="opening-loading">{lang === "id" ? "Menyiapkan SYLUX…" : "Preparing SYLUX…"}</p>}
      <p className="sr-only" role="status">{lang === "id" ? "Selamat datang di SYLUX." : "Welcome to SYLUX."}</p>
      <button type="button" className="opening-skip" onClick={onComplete}>
        {lang === "id" ? "Lewati intro" : "Skip intro"}
      </button>
    </div>
  );
}
