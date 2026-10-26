import { useState } from "react";
import { ArrowUpRight } from "@phosphor-icons/react";
import { copy, events, site, type Language } from "../data/site";
import { Modal } from "./Shell";

export function Portfolio({ lang }: { lang: Language }) {
  const t = copy[lang];
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
      <div className="filter-row" role="group" aria-label="Portfolio filter">
        {["All", "Music", "Talk", "Games"].map((f) => (
          <button
            key={f}
            aria-pressed={filter === f}
            onClick={() => setFilter(f)}
          >
            {f === "All" ? t.allEvents : f}
          </button>
        ))}
        {site.isDemo && <span className="sample-label">{t.sample}</span>}
      </div>
      <div
        className={`event-grid ${result.length === 1 ? "single-event" : ""}`}
      >
        {result.map((event, i) => (
          <button
            key={event.id}
            className={`event-card event-${i}`}
            onClick={() => setSelected(event)}
          >
            <div className="event-image">
              <img
                src={event.image}
                alt={event.alt}
                loading="lazy"
                width="1200"
                height="800"
              />
            </div>
            <div className="event-body">
              <span className="category">{event.category}</span>
              <h3>{event.title}</h3>
              <p>{event.subtitle[lang]}</p>
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
            className="modal-image"
            src={selected.image}
            alt={selected.alt}
          />
          <p>{selected.description[lang]}</p>
          {site.isDemo && <span className="sample-label">{t.sample}</span>}
        </Modal>
      )}
    </section>
  );
}
