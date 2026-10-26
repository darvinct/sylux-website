import { useEffect, useState } from "react";
import {
  ArrowClockwise,
  ArrowUpRight,
  DiscordLogo,
  MagnifyingGlass,
} from "@phosphor-icons/react";
import { copy, type Language } from "../data/site";
import { filterMembers } from "../lib/utils";
import { Modal } from "./Shell";
import type { DiscordUser } from "./Auth";

type Member = DiscordUser & { handle: string; role: string; bio: string };
export function Team({ lang }: { lang: Language }) {
  const t = copy[lang];
  const id = lang === "id";
  const [query, setQuery] = useState("");
  const [role, setRole] = useState("");
  const [sorted, setSorted] = useState(false);
  const [selected, setSelected] = useState<Member | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [state, setState] = useState<"loading" | "empty" | "error" | "success">(
    "loading",
  );
  const [partial, setPartial] = useState(false);
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    const timeout = setTimeout(() => controller.abort(), 12000);
    setState("loading");
    fetch("/api/team", { signal: controller.signal })
      .then(async (res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data) => {
        if (!Array.isArray(data.members)) throw new Error();
        if (active) {
          setMembers(data.members);
          setPartial(Boolean(data.partial));
          setState(data.members.length ? "success" : "empty");
        }
      })
      .catch(() => {
        if (active) setState("error");
      })
      .finally(() => clearTimeout(timeout));
    return () => {
      active = false;
      clearTimeout(timeout);
      controller.abort();
    };
  }, [retry]);
  const result = filterMembers(members, query, role, sorted);
  return (
    <section className="section wrap" id="team">
      <div className="section-heading">
        <h2>{t.team}</h2>
        <p>{t.teamBody}</p>
        <span className="source-label">
          <DiscordLogo size={16} />
          {id ? "Profil terhubung ke Discord" : "Profiles connected to Discord"}
        </span>
      </div>
      {state === "success" && (
        <div className="team-toolbar">
          <label className="search">
            <MagnifyingGlass size={20} />
            <span className="sr-only">{t.search}</span>
            <input
              type="search"
              placeholder={t.search}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
          <label>
            <span className="sr-only">{t.all}</span>
            <select value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="">{t.all}</option>
              {[...new Set(members.map((m) => m.role))].map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
          </label>
          <label>
            <span className="sr-only">{t.sort}</span>
            <select
              value={String(sorted)}
              onChange={(e) => setSorted(e.target.value === "true")}
            >
              <option value="false">{t.defaultSort}</option>
              <option value="true">{t.az}</option>
            </select>
          </label>
        </div>
      )}
      <div aria-live="polite" aria-busy={state === "loading"}>
        {state === "loading" ? (
          <div className="team-grid">
            {[0, 1, 2, 3].map((i) => (
              <div className="member team-skeleton" key={i} />
            ))}
            <span className="sr-only">
              {id ? "Memuat profil tim…" : "Loading team profiles…"}
            </span>
          </div>
        ) : state === "error" ? (
          <div className="empty-state">
            <p>
              {id
                ? "Profil tim belum dapat dimuat dari Discord."
                : "Team profiles could not be loaded from Discord."}
            </p>
            <button
              className="button secondary"
              onClick={() => setRetry((n) => n + 1)}
            >
              <ArrowClockwise size={18} />
              {id ? "Coba lagi" : "Retry"}
            </button>
          </div>
        ) : state === "empty" ? (
          <div className="empty-state">
            <DiscordLogo size={32} />
            <p>
              {id
                ? "Tim komunitas akan segera diperkenalkan."
                : "Meet the community team here soon."}
            </p>
          </div>
        ) : result.length ? (
          <>
            <div className="team-grid">
              {result.map((member) => (
                <button
                  className="member"
                  key={member.id}
                  onClick={() => setSelected(member)}
                >
                  <img
                    className="avatar discord-avatar"
                    src={member.avatar}
                    alt=""
                    loading="lazy"
                    width="48"
                    height="48"
                  />
                  <span className="member-info">
                    <strong>{member.name}</strong>
                    <span>{member.role}</span>
                    <small>{member.handle}</small>
                  </span>
                  <ArrowUpRight size={19} className="member-arrow" />
                </button>
              ))}
            </div>
            {partial && (
              <p className="team-partial">
                {id
                  ? "Sebagian profil belum tersedia. Coba lagi beberapa saat lagi."
                  : "Some profiles are unavailable. Please try again shortly."}
              </p>
            )}
          </>
        ) : (
          <div className="empty-state">
            <MagnifyingGlass size={28} />
            <p>{t.noMembers}</p>
            <button
              className="button secondary"
              onClick={() => {
                setQuery("");
                setRole("");
              }}
            >
              {t.reset}
            </button>
          </div>
        )}
      </div>
      {selected && (
        <Modal title={selected.name} onClose={() => setSelected(null)}>
          <div className="profile-summary">
            <img
              className="account-avatar"
              src={selected.avatar}
              alt={selected.name}
              width="80"
              height="80"
            />
            <div>
              <span className="sample-label">{selected.role}</span>
              <p>{selected.handle}</p>
            </div>
          </div>
          {selected.bio && <p>{selected.bio}</p>}
          <a
            className="button secondary profile-open"
            href={selected.profileUrl}
            target="_blank"
            rel="noreferrer"
          >
            <DiscordLogo size={19} />
            {id ? "Buka profil Discord" : "Open Discord profile"}
            <ArrowUpRight size={17} />
          </a>
        </Modal>
      )}
    </section>
  );
}
