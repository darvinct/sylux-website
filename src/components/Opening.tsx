import { useEffect, type CSSProperties } from "react";
import type { Language } from "../data/site";
import "../opening.css";

const stars = Array.from({ length: 48 }, (_, index) => ({
  "--x": `${2 + (index * 37) % 96}%`,
  "--y": `${4 + (index * 53) % 92}%`,
  "--size": `${index % 7 === 0 ? 3 : index % 3 === 0 ? 2 : 1}px`,
  "--delay": `${(index % 9) * .11}s`,
}) as CSSProperties);

export function shouldPlayOpening() {
  const navigation = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
  return !window.location.hash
    && navigation?.type !== "back_forward"
    && !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function Opening({ lang, onComplete }: { lang: Language; onComplete: () => void }) {
  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const keydown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onComplete();
    };
    const motionChange = () => { if (preference.matches) onComplete(); };
    // Always release the page, even if an animation is disabled by a browser extension.
    const fallback = window.setTimeout(onComplete, 4000);
    document.documentElement.classList.add("opening-active");
    document.addEventListener("keydown", keydown);
    window.addEventListener("hashchange", onComplete);
    preference.addEventListener("change", motionChange);
    return () => {
      window.clearTimeout(fallback);
      document.documentElement.classList.remove("opening-active");
      document.removeEventListener("keydown", keydown);
      window.removeEventListener("hashchange", onComplete);
      preference.removeEventListener("change", motionChange);
    };
  }, [onComplete]);

  return (
    <div className="opening">
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
      <p className="sr-only" role="status">{lang === "id" ? "Selamat datang di SYLUX." : "Welcome to SYLUX."}</p>
      <button type="button" className="opening-skip" onClick={onComplete}>
        {lang === "id" ? "Lewati intro" : "Skip intro"}
      </button>
    </div>
  );
}
