import { useState } from "react";
import { ArrowUpRight } from "@phosphor-icons/react";
import { copy, events, type Language } from "../data/site";
import { Modal } from "./Shell";
import "../portfolio.css";

export function Portfolio({ lang }: { lang: Language }) {
  const t = copy[lang];
  const id = lang === "id";
  const [filter, setFilter] = useState("All");
  const [selected, setSelected] = useState<(typeof events)[number] | null>(
    null,
  );
  const result = events.filter(
    (e) => filter === "All" || e.category === filter,
  );
  return (
    <section className="section wrap portfolio" id="portfolio">
      <div className="section-heading">
        <h2>{t.portfolio}</h2>
        <p>{t.portfolioBody}</p>
      </div>
      <div className="filter-row" role="group" aria-label={id ? "Filter acara" : "Event filter"}>
        {["All", ...new Set(events.map((event) => event.category))].map((f) => (
          <button
            key={f}
            aria-pressed={filter === f}
            onClick={() => setFilter(f)}
          >
            {f === "All" ? t.allEvents : f}
          </button>
        ))}
      </div>
      <div
        className={`event-grid ${result.length === 1 ? "single-event" : ""}`}
      >
        {result.map((event, i) => (
          <button
            key={event.id}
            className={`event-card event-${i}`}
            aria-haspopup="dialog"
            aria-label={`${t.detail}: ${event.title}`}
            onClick={() => setSelected(event)}
          >
            <div className={`event-image${event.imageKind === "documentation" ? " is-documentation" : ""}`}>
              <img
                src={event.image}
                alt={event.alt}
                loading="lazy"
                width="1200"
                height="800"
              />
            </div>
            {event.imageKind === "illustration" && <span className="event-media-note">{id ? "Ilustrasi sementara" : "Temporary illustration"}</span>}
            <div className="event-body">
              <span className="category">{event.category}</span>
              <h3>{event.title}</h3>
              <span className="event-concept-label">{id ? "Konsep acara" : "Event concept"}</span>
              <p>{event.description[lang]}</p>
              <span className="event-link">
                {t.detail}
                <ArrowUpRight size={18} />
              </span>
            </div>
          </button>
        ))}
      </div>
      {selected && (
        <Modal title={selected.title} onClose={() => setSelected(null)}>
          <img
            className={`modal-image${selected.imageKind === "documentation" ? " event-documentation" : ""}`}
            src={selected.image}
            alt={selected.alt}
          />
          {selected.imageKind === "illustration" && <span className="event-media-note">{id ? "Ilustrasi sementara" : "Temporary illustration"}</span>}
          <h3>{id ? "Konsep acara" : "Event concept"}</h3>
          <p>{selected.description[lang]}</p>
          <h3>{id ? "Rangkaian acara" : "Program"}</h3>
          <ul className="event-program">{selected.program.map((item) => <li key={item}>{item}</li>)}</ul>
        </Modal>
      )}
    </section>
  );
}
