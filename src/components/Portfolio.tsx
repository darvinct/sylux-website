import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "@phosphor-icons/react";
import { copy, events, type Language } from "../data/site";
import { Modal } from "./Shell";
import "../portfolio.css";

export function Portfolio({ lang }: { lang: Language }) {
  const t = copy[lang];
  const id = lang === "id";
  const [filter, setFilter] = useState("All");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [edges, setEdges] = useState({ start: true, end: true });
  const [reducedMotion, setReducedMotion] = useState(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  const [hovered, setHovered] = useState(false);
  const track = useRef<HTMLDivElement>(null);
  const interactionUntil = useRef(0);
  const result = events.filter((event) => filter === "All" || event.category === filter);
  const selected = result.find((event) => event.id === selectedId);
  const selectedIndex = result.findIndex((event) => event.id === selectedId);
  const closeModal = useCallback(() => setSelectedId(null), []);
  const hasOverflow = !edges.start || !edges.end;

  useEffect(() => {
    const element = track.current;
    if (!element) return;
    function measure() {
      if (!element) return;
      const start = element.scrollLeft <= 2;
      const end = element.scrollLeft + element.clientWidth >= element.scrollWidth - 2;
      setEdges((previous) => previous.start === start && previous.end === end ? previous : { start, end });
    }
    element.scrollTo({ left: 0, behavior: "instant" });
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    element.addEventListener("scroll", measure, { passive: true });
    return () => { observer.disconnect(); element.removeEventListener("scroll", measure); };
  }, [filter]);

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const change = () => setReducedMotion(preference.matches);
    preference.addEventListener("change", change);
    return () => preference.removeEventListener("change", change);
  }, []);

  useEffect(() => {
    if (reducedMotion || hovered || selectedId || !hasOverflow) return;
    const timer = window.setInterval(() => {
      const element = track.current;
      const first = element?.firstElementChild as HTMLElement | null;
      if (!element || !first || document.hidden || document.querySelector("dialog[open]")) return;
      if (performance.now() < interactionUntil.current || element.closest(".portfolio")?.querySelector(":focus-visible")) return;
      const bounds = element.getBoundingClientRect();
      if (bounds.bottom <= 0 || bounds.top >= window.innerHeight) return;
      const end = element.scrollWidth - element.clientWidth;
      const step = first.offsetWidth + (parseFloat(getComputedStyle(element).columnGap) || 0);
      const restart = element.scrollLeft >= end - 2;
      // Keep both card advances and the return to the first event smooth.
      element.scrollTo({ left: restart ? 0 : element.scrollLeft + step, behavior: "smooth" });
    }, 5000);
    return () => window.clearInterval(timer);
  }, [reducedMotion, hovered, selectedId, hasOverflow, filter]);

  useEffect(() => {
    if (!selectedId) return;
    // The keyboard gallery follows the same category filter as the card row.
    const visible = events.filter((event) => filter === "All" || event.category === filter);
    function onKeyDown(event: KeyboardEvent) {
      if (event.altKey || event.ctrlKey || event.metaKey || !["ArrowLeft", "ArrowRight"].includes(event.key)) return;
      event.preventDefault();
      const index = visible.findIndex((item) => item.id === selectedId);
      const direction = event.key === "ArrowRight" ? 1 : -1;
      setSelectedId(visible[(index + direction + visible.length) % visible.length].id);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selectedId, filter]);

  function pauseForInteraction() {
    interactionUntil.current = performance.now() + 5000;
  }

  function scrollRow(direction: number) {
    pauseForInteraction();
    const element = track.current;
    const first = element?.firstElementChild as HTMLElement | null;
    if (!element || !first) return;
    const gap = parseFloat(getComputedStyle(element).columnGap) || 0;
    // Let pointer focus finish scrolling the page before animating this row.
    requestAnimationFrame(() => {
      if (element.isConnected) element.scrollBy({ left: direction * (first.offsetWidth + gap), behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
    });
  }

  function movePhoto(direction: number) {
    setSelectedId(result[(selectedIndex + direction + result.length) % result.length].id);
  }

  return (
    <section className="section wrap portfolio" id="portfolio" aria-labelledby="portfolio-title">
      <div className="section-heading">
        <h2 id="portfolio-title">{t.portfolio}</h2>
        <p>{t.portfolioBody}</p>
      </div>
      <div className="filter-row" role="group" aria-label={id ? "Filter acara" : "Event filter"}>
        {["All", ...new Set(events.map((event) => event.category))].map((category) => (
          <button key={category} aria-pressed={filter === category} onClick={() => setFilter(category)}>
            {category === "All" ? t.allEvents : category}
          </button>
        ))}
      </div>
      <div className="event-track" ref={track} role="group" aria-label={id ? "Galeri event SYLUX" : "SYLUX event gallery"}
        onPointerEnter={(event) => { if (event.pointerType === "mouse") setHovered(true); }}
        onPointerLeave={() => setHovered(false)}
        onPointerDown={(event) => { if (event.pointerType !== "mouse") pauseForInteraction(); }}
        onFocusCapture={pauseForInteraction}
        onWheel={(event) => { if (event.deltaX || event.shiftKey) pauseForInteraction(); }}
        onKeyDown={(event) => {
          if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
          const cards = Array.from(track.current?.querySelectorAll<HTMLButtonElement>(".event-tile") || []);
          const index = cards.indexOf(document.activeElement as HTMLButtonElement);
          if (index < 0) return;
          event.preventDefault();
          const next = event.key === "Home" ? 0 : event.key === "End" ? cards.length - 1 : Math.max(0, Math.min(cards.length - 1, index + (event.key === "ArrowRight" ? 1 : -1)));
          cards[next].focus({ preventScroll: true });
          const element = track.current!;
          element.scrollTo({ left: element.scrollLeft + cards[next].getBoundingClientRect().left - element.getBoundingClientRect().left, behavior: reducedMotion ? "instant" : "smooth" });
        }}>
        {result.map((event) => (
          <button key={event.id} className="event-tile" aria-haspopup="dialog" onClick={() => setSelectedId(event.id)}>
            <div className="event-tile-image"><img src={event.image} alt="" loading="lazy" width="1200" height="675" /></div>
            <div className="event-tile-copy">
              <span className="category">{event.category}</span>
              <h3>{event.title}</h3>
              <p>{event.concept[lang]}</p>
              <span className="event-tile-link">{id ? "Lihat foto" : "View photo"}<ArrowUpRight size={18} aria-hidden="true" /></span>
            </div>
          </button>
        ))}
      </div>
      <div className="event-track-footer">
        <p>{hasOverflow ? (!reducedMotion ? (id ? "Event bergeser otomatis ke kiri. Klik foto untuk memperbesar." : "Events scroll left automatically. Click a photo to enlarge it.") : (id ? "Geser untuk melihat event lainnya. Klik foto untuk memperbesar." : "Swipe to see more events. Click a photo to enlarge it.")) : (id ? "Klik foto untuk memperbesar dokumentasi." : "Click a photo to enlarge the documentation.")}</p>
        {hasOverflow && <div className="event-track-controls" onMouseDown={(event) => event.preventDefault()} role="group" aria-label={id ? "Navigasi galeri event" : "Event gallery navigation"}>
          <button className="icon-button" disabled={edges.start} onClick={() => scrollRow(-1)} aria-label={id ? "Geser ke event sebelumnya" : "Scroll to previous events"}><ArrowLeft size={20} /></button>
          <button className="icon-button" disabled={edges.end} onClick={() => scrollRow(1)} aria-label={id ? "Geser ke event berikutnya" : "Scroll to next events"}><ArrowRight size={20} /></button>
        </div>}
      </div>
      {selected && <Modal title={selected.title} onClose={closeModal} className="event-lightbox">
        <div className="event-lightbox-photo">
          <img src={selected.image} alt={selected.alt} width="1200" height="675" />
          {result.length > 1 && <>
            <button className="icon-button event-photo-previous" onClick={() => movePhoto(-1)} aria-label={id ? "Foto event sebelumnya" : "Previous event photo"}><ArrowLeft size={22} aria-hidden="true" /></button>
            <button className="icon-button event-photo-next" onClick={() => movePhoto(1)} aria-label={id ? "Foto event berikutnya" : "Next event photo"}><ArrowRight size={22} aria-hidden="true" /></button>
          </>}
        </div>
        <span className="sr-only" aria-live="polite">{selected.title}, {selectedIndex + 1} / {result.length}</span>
      </Modal>}
    </section>
  );
}
