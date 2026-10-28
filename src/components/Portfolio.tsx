import { useEffect, useRef, useState, type CSSProperties } from "react";
import { ArrowLeft, ArrowRight, ArrowUpRight, Pause, Play } from "@phosphor-icons/react";
import { copy, events, type Language } from "../data/site";
import { Modal } from "./Shell";
import "../portfolio.css";

export function Portfolio({ lang }: { lang: Language }) {
  const t = copy[lang];
  const id = lang === "id";
  const [filter, setFilter] = useState("All");
  const [activeId, setActiveId] = useState(events[0].id);
  const [selected, setSelected] = useState<(typeof events)[number] | null>(null);
  const [paused, setPaused] = useState(false);
  const [inView, setInView] = useState(false);
  const gallery = useRef<HTMLDivElement>(null);
  const swipe = useRef<{ x: number; y: number } | null>(null);
  const suppressClick = useRef(false);
  const result = events.filter((event) => filter === "All" || event.category === filter);
  const active = result.find((event) => event.id === activeId) || result[0];

  useEffect(() => {
    const element = gallery.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting));
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  function move(direction: number) {
    const index = result.findIndex((event) => event.id === active.id);
    setActiveId(result[(index + direction + result.length) % result.length].id);
    setPaused(true);
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
      <div ref={gallery} className={`event-orbit${paused || !inView || selected ? " is-paused" : ""}${result.length === 1 ? " is-single" : ""}`}>
        <div className="event-orbit-stage" role="group" aria-label={id ? "Galeri dokumentasi event SYLUX" : "SYLUX event documentation gallery"}
          onPointerDown={(event) => {
            suppressClick.current = false;
            if (event.pointerType === "touch") swipe.current = { x: event.clientX, y: event.clientY };
          }}
          onPointerUp={(event) => {
            const start = swipe.current;
            swipe.current = null;
            if (!start) return;
            const dx = event.clientX - start.x;
            if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(event.clientY - start.y)) {
              suppressClick.current = true;
              move(dx < 0 ? 1 : -1);
            }
          }}
          onPointerCancel={() => { swipe.current = null; }}
          onClickCapture={(event) => {
            if (suppressClick.current) { event.preventDefault(); event.stopPropagation(); suppressClick.current = false; }
          }}>
          <div className="event-orbit-items">
            {result.map((event, index) => (
              <button key={event.id} className={`event-orbit-item${active.id === event.id ? " is-active" : ""}`}
                style={{
                  "--slot": index,
                  "--total": result.length,
                  "--orbit-pos-x": Math.cos(index * Math.PI * 2 / result.length),
                  "--orbit-pos-y": Math.sin(index * Math.PI * 2 / result.length),
                } as CSSProperties}
                aria-label={`${t.detail}: ${event.title}`} aria-haspopup="dialog" aria-describedby="event-orbit-hint"
                onPointerEnter={(pointer) => { if (pointer.pointerType === "mouse") setActiveId(event.id); }}
                onFocus={() => setActiveId(event.id)} onClick={() => setSelected(event)}>
                <span className="event-orbit-photo">
                  <img src={event.image} alt={event.alt} loading="lazy" width="1200" height="675" />
                </span>
                <span className="event-orbit-caption">{event.title}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="event-orbit-concept" aria-live="polite" aria-atomic="true">
          <div className="event-orbit-copy" key={active.id}>
            <span className="category">{active.category}</span>
            <h3>{active.title}</h3>
            <p>{active.concept[lang]}</p>
            <button className="button event-orbit-open" onClick={() => setSelected(active)} aria-haspopup="dialog">
              {t.detail}<ArrowUpRight size={18} aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
      <div className="event-orbit-footer">
        <p id="event-orbit-hint">
          <span className="event-orbit-pointer-hint">{id ? "Sorot gambar untuk mengenal konsepnya. Klik untuk melihat dokumentasi." : "Hover over an image to explore its concept. Click to view the documentation."}</span>
          <span className="event-orbit-touch-hint">{id ? "Geser untuk memilih event. Ketuk gambar untuk melihat dokumentasi." : "Swipe to choose an event. Tap an image to view its documentation."}</span>
        </p>
        <div className="event-orbit-controls" role="group" aria-label={id ? "Kontrol galeri event" : "Event gallery controls"}>
          <button className="icon-button" disabled={result.length < 2} onClick={() => move(-1)} aria-label={id ? "Event sebelumnya" : "Previous event"}><ArrowLeft size={20} /></button>
          <button className="icon-button event-orbit-pause" disabled={result.length < 2} aria-pressed={paused} onClick={() => setPaused((value) => !value)} aria-label={paused ? (id ? "Lanjutkan putaran galeri" : "Resume gallery rotation") : (id ? "Jeda putaran galeri" : "Pause gallery rotation")}>{paused ? <Play size={18} /> : <Pause size={18} />}</button>
          <button className="icon-button" disabled={result.length < 2} onClick={() => move(1)} aria-label={id ? "Event berikutnya" : "Next event"}><ArrowRight size={20} /></button>
        </div>
      </div>
      {selected && (
        <Modal title={selected.title} onClose={() => setSelected(null)}>
          <img className="modal-image event-documentation" src={selected.image} alt={selected.alt} />
          <h3>{id ? "Konsep acara" : "Event concept"}</h3>
          <p>{selected.description[lang]}</p>
          <h3>{id ? "Rangkaian acara" : "Program"}</h3>
          <ul className="event-program">{selected.program.map((item) => <li key={item}>{item}</li>)}</ul>
        </Modal>
      )}
    </section>
  );
}
