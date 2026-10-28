import { useEffect, useRef, useState } from "react";
import {
  ArrowClockwise,
  DiscordLogo,
  Users,
  Waveform,
} from "@phosphor-icons/react";
import { copy, type Language } from "../data/site";

export function useCommunity() {
  const [state, setState] = useState<"loading" | "success" | "error">("loading");
  const [counts, setCounts] = useState<{ total: number; online: number } | null>(null);
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    let active = true;
    let controller: AbortController | null = null;
    setState("loading");
    async function load() {
      controller?.abort();
      const request = new AbortController();
      controller = request;
      const timeout = setTimeout(() => request.abort(), 10000);
      try {
        const response = await fetch("/api/community", { signal: request.signal });
        if (!response.ok) throw new Error("Discord unavailable");
        const data = await response.json();
        if (![data.total, data.online].every((n) => Number.isSafeInteger(n) && n >= 0))
          throw new Error("No counts");
        if (active && controller === request) {
          setCounts({ total: data.total, online: data.online });
          setState("success");
        }
      } catch {
        if (active && controller === request) {
          setCounts(null);
          setState("error");
        }
      } finally {
        clearTimeout(timeout);
      }
    }
    void load();
    const interval = setInterval(() => {
      if (document.visibilityState === "visible") void load();
    }, 60000);
    return () => {
      active = false;
      controller?.abort();
      clearInterval(interval);
    };
  }, [retry]);
  return { state, counts, refresh: () => setRetry((n) => n + 1) };
}

function AnimatedCount({ value, lang }: { value: number; lang: Language }) {
  const element = useRef<HTMLSpanElement>(null);
  const [visible, setVisible] = useState(false);
  const [shown, setShown] = useState(0);
  useEffect(() => {
    const node = element.current;
    if (!node) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setVisible(true); observer.disconnect(); }
    }, { threshold: 0.25 });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (!visible) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setShown(value); return; }
    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - start) / 1400, 1);
      setShown(Math.round(value * (1 - Math.pow(1 - progress, 3))));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value, visible]);
  return <span ref={element} aria-label={value.toLocaleString(lang === "id" ? "id-ID" : "en-US")}><span aria-hidden="true">{shown.toLocaleString(lang === "id" ? "id-ID" : "en-US")}</span></span>;
}

export function Stats({ lang, community }: { lang: Language; community: ReturnType<typeof useCommunity> }) {
  const { state, counts, refresh } = community;
  const t = copy[lang];
  return (
    <section className="stats-section section wrap" id="stats">
      <div className="stats-intro">
        <h2 className="line-break">{t.stats}</h2>
        <p>{t.statsBody}</p>
        <span className="source-label">
          <DiscordLogo size={16} />
          Discord community
        </span>
      </div>
      <div
        className="stats-data"
        aria-live="polite"
        aria-busy={state === "loading"}
      >
        <div className="stat">
          <Users size={24} />
          <strong className={state === "loading" ? "skeleton-text" : ""}>
            {state === "success" && counts ? <AnimatedCount value={counts.total} lang={lang} /> : "···"}
          </strong>
          <span>{lang === "id" ? "Total anggota" : "Total members"}</span>
        </div>
        <div className="stat">
          <Waveform size={24} />
          <strong className={state === "loading" ? "skeleton-text" : ""}>
            {state === "success" && counts ? <AnimatedCount value={counts.online} lang={lang} /> : "···"}
          </strong>
          <span>{lang === "id" ? "Sedang online" : "Online now"}</span>
        </div>
        <div className="stats-message">
          {state === "loading" ? (
            lang === "id" ? (
              "Menghubungkan ke Discord…"
            ) : (
              "Connecting to Discord…"
            )
          ) : state === "error" ? (
            <>
              {lang === "id"
                ? "Statistik belum bisa dimuat."
                : "Statistics are unavailable."}
              <button
                className="text-button"
                onClick={refresh}
              >
                <ArrowClockwise size={15} />
                {lang === "id" ? "Coba lagi" : "Retry"}
              </button>
            </>
          ) : lang === "id" ? (
            "Perkiraan dari Discord, diperbarui setiap menit."
          ) : (
            "Approximate Discord counts, refreshed every minute."
          )}
        </div>
      </div>
    </section>
  );
}
