import { useEffect, useState } from "react";
import {
  ArrowClockwise,
  ArrowUpRight,
  DiscordLogo,
  MagnifyingGlass,
} from "@phosphor-icons/react";
import { copy, type Language } from "../data/site";
import { filterMembers } from "../lib/utils";
import { BrandLogo, Modal } from "./Shell";
import type { DiscordUser } from "./Auth";

type Member = DiscordUser & {
  handle: string;
  role: string;
  division?: string;
  bio: string;
  banner?: string | null;
  accentColor?: string | null;
  avatarDecoration?: string | null;
  guildTag?: string | null;
};
export function useTeam() {
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
  return { members, state, partial, reload: () => setRetry((n) => n + 1) };
}

export function Team({ lang, directory }: { lang: Language; directory: ReturnType<typeof useTeam> }) {
  const t = copy[lang];
  const id = lang === "id";
  const [query, setQuery] = useState("");
  const [role, setRole] = useState("");
  const [sorted, setSorted] = useState(false);
  const [selected, setSelected] = useState<Member | null>(null);
  const { members, state, partial, reload } = directory;
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
              onClick={reload}
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
                  aria-haspopup="dialog"
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
        <Modal
          title={selected.name}
          className="member-profile-modal"
          onClose={() => setSelected(null)}
        >
          <div className="member-profile-header">
            <BrandLogo />
          </div>
          <div
            className="member-profile-banner"
            style={{ backgroundColor: selected.accentColor || undefined }}
          >
            {selected.banner && <img src={selected.banner} alt="" onError={(e) => { e.currentTarget.style.visibility = "hidden"; }} />}
          </div>
          <div className="member-profile-body">
            <div className="member-profile-avatar">
              <span className="member-profile-initials" aria-hidden="true">{Array.from(selected.name)[0]}</span>
              <img className="member-profile-portrait" src={selected.avatar} alt="" width="112" height="112" onError={(e) => { e.currentTarget.style.visibility = "hidden"; }} />
              {selected.avatarDecoration && (
                <img className="member-profile-decoration" src={selected.avatarDecoration} alt="" onError={(e) => { e.currentTarget.style.visibility = "hidden"; }} />
              )}
            </div>
            <div className="member-profile-identity">
              <div className="member-profile-name">
                <h3>{selected.name}</h3>
                {selected.guildTag && (
                  <span className="member-guild-tag"><DiscordLogo size={16} weight="fill" />{selected.guildTag}</span>
                )}
              </div>
              <p className="member-profile-handle">{selected.handle}</p>
            </div>
            {selected.bio && <p className="member-profile-bio">{selected.bio}</p>}
            <dl className="member-profile-details">
              <div><dt>{id ? "Divisi" : "Division"}</dt><dd>{selected.division || selected.role}</dd></div>
              <div><dt>{id ? "Peran" : "Role"}</dt><dd>{selected.role}</dd></div>
            </dl>
            <a
              className="button secondary member-profile-open"
              href={selected.profileUrl}
              target="_blank"
              rel="noreferrer"
            >
              <DiscordLogo size={19} weight="fill" />
              {id ? "Buka profil Discord" : "Open Discord profile"}
              <ArrowUpRight size={17} />
            </a>
          </div>
        </Modal>
      )}
    </section>
  );
}
