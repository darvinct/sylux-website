import { useEffect } from "react";
import type { Language } from "../data/site";
import "../opening.css";

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
    const fallback = window.setTimeout(onComplete, 3100);
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
      <div className="opening-mark" aria-hidden="true"><span /></div>
      <p className="sr-only" role="status">{lang === "id" ? "Selamat datang di SYLUX." : "Welcome to SYLUX."}</p>
      <button type="button" className="opening-skip" onClick={onComplete}>
        {lang === "id" ? "Lewati intro" : "Skip intro"}
      </button>
    </div>
  );
}
