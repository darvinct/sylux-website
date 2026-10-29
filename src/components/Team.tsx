import { useEffect, useRef, useState } from "react";
import {
  ArrowClockwise,
  ArrowUpRight,
  DiscordLogo,
  MagnifyingGlass,
  CaretDown,
  Eye,
} from "@phosphor-icons/react";
import { copy, type Language } from "../data/site";
import { filterMembers } from "../lib/utils";
import { BrandLogo, Modal } from "./Shell";
import type { DiscordUser } from "./Auth";
import "../team.css";

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
const leadershipRoles = new Set(["Founder", "Owner", "Head Staff"]);

function cachedMembers(): Member[] {
  try {
    const data = JSON.parse(localStorage.getItem("sylux-team-cache-v1") || "null");
    if (data && Date.now() - data.savedAt < 86400000 && Array.isArray(data.members) && data.members.length && data.members.every((m: Member) => typeof m.id === "string" && typeof m.name === "string" && typeof m.role === "string" && typeof m.handle === "string" && typeof m.avatar === "string")) return data.members;
  } catch { /* Storage may be disabled. */ }
  return [];
}

export function useTeam() {
  const [members, setMembers] = useState<Member[]>(cachedMembers);
  const hasCached = useRef(members.length > 0);
  const [state, setState] = useState<"loading" | "empty" | "error" | "success">(
    members.length ? "success" : "loading",
  );
  const [partial, setPartial] = useState(false);
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    const timeout = setTimeout(() => controller.abort(), 60000);
    setState(hasCached.current ? "success" : "loading");
    fetch("/api/team", { signal: controller.signal })
      .then(async (res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data) => {
        if (!Array.isArray(data.members)) throw new Error();
        if (active) {
          const keepingCached = Boolean(data.partial && hasCached.current);
          if (!keepingCached) setMembers(data.members);
          hasCached.current = keepingCached || data.members.length > 0;
          if (!data.partial) {
            try {
              if (data.members.length) localStorage.setItem("sylux-team-cache-v1", JSON.stringify({ savedAt: Date.now(), members: data.members }));
              else localStorage.removeItem("sylux-team-cache-v1");
            } catch { /* Storage may be disabled. */ }
          }
          setPartial(Boolean(data.partial));
          setState(keepingCached || data.members.length ? "success" : data.partial ? "error" : "empty");
        }
      })
      .catch(() => {
        if (active && !hasCached.current) setState("error");
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
  const [expanded, setExpanded] = useState(true);
  const [roleVisibility, setRoleVisibility] = useState<Record<string, boolean>>({});
  const search = useRef<HTMLInputElement>(null);
  const { members, state, partial, reload } = directory;
  const result = filterMembers(members, query, role, sorted);
  const groups = [...new Set(members.map((member) => member.role))]
    .map((name) => ({ name, members: result.filter((member) => member.role === name) }))
    .filter((group) => group.members.length > 0);
  const roleIsOpen = (name: string, visibility = roleVisibility) => visibility[name] ?? (Boolean(query.trim() || role) || leadershipRoles.has(name));
  useEffect(() => {
    const shortcut = (event: KeyboardEvent) => {
      const target = event.target;
      if (event.key !== "/" || event.ctrlKey || event.metaKey || event.altKey ||
          !search.current || document.querySelector("dialog[open]") ||
          (target instanceof HTMLElement && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)))) return;
      event.preventDefault();
      setExpanded(true);
      requestAnimationFrame(() => search.current?.focus());
    };
    window.addEventListener("keydown", shortcut);
    return () => window.removeEventListener("keydown", shortcut);
  }, []);
  return (
    <section className="section wrap team-section" id="team">
      <div className="section-heading">
        <h2><button className="team-section-toggle" aria-expanded={expanded} aria-controls="team-directory" onClick={() => setExpanded(!expanded)}>{t.team}<CaretDown size={18} aria-hidden="true" /></button></h2>
        <p>{t.teamBody}</p>
        <span className="source-label">
          <DiscordLogo size={16} />
          {state === "success" ? `${new Set(members.map((member) => member.id)).size} ${id ? "profil Discord" : "Discord profiles"}` : (id ? "Profil terhubung ke Discord" : "Profiles connected to Discord")}
        </span>
      </div>
      <div id="team-directory" hidden={!expanded}>
        {state === "success" && (
          <div className="team-toolbar">
            <label className="search">
              <MagnifyingGlass size={20} />
              <span className="sr-only">{t.search}</span>
              <input
                ref={search}
                type="search"
                placeholder={t.search}
                value={query}
                onChange={(e) => { setQuery(e.target.value); setRoleVisibility({}); }}
              />
              <kbd aria-hidden="true">/</kbd>
            </label>
            <div className="team-controls">
              <label>
                <span className="sr-only">{t.all}</span>
                <select value={role} onChange={(e) => { setRole(e.target.value); setRoleVisibility({}); }}>
                  <option value="">{t.all}</option>
                  {[...new Set(members.map((m) => m.role))].map((r) => (
                    <option key={r}>{r}</option>
                  ))}
                </select>
              </label>
              <div className="team-sort" role="group" aria-label={t.sort}>
                <button aria-pressed={!sorted} onClick={() => setSorted(false)}>{t.defaultSort}</button>
                <button aria-pressed={sorted} onClick={() => setSorted(true)}>{t.az}</button>
              </div>
            </div>
          </div>
        )}
        <div className="team-results" aria-live="polite" aria-busy={state === "loading"}>
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
              <div className="team-gallery">
                <ol className="team-groups" aria-label={id ? "Tim berdasarkan peran" : "Team by role"}>
                  {groups.map((group, index) => (
                    <li className="team-group" key={group.name} data-role={group.name.toLowerCase()}>
                      <h3>
                        <button
                          className="team-role-toggle"
                          aria-expanded={roleIsOpen(group.name)}
                          aria-controls={`team-branch-${index}`}
                          onClick={() => setRoleVisibility((previous) => ({ ...previous, [group.name]: !roleIsOpen(group.name, previous) }))}
                        >
                          <span className="team-role-number" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                          <span className="team-role-title">{group.name}</span>
                          <CaretDown size={14} aria-hidden="true" />
                        </button>
                      </h3>
                      <ul className="team-branch" id={`team-branch-${index}`} hidden={!roleIsOpen(group.name)}>
                        {group.members.map((member) => (
                          <li className="team-node" key={member.id}>
                            <button className="member" aria-haspopup="dialog" onClick={() => setSelected(member)}>
                              <span className="sr-only">{id ? "Lihat profil" : "View Profile"}</span>
                              <span className="member-backdrop" aria-hidden="true">
                                {member.banner && <img src={member.banner.replace(".gif?", ".webp?")} alt="" loading="lazy" onError={(event) => { event.currentTarget.style.visibility = "hidden"; }} />}
                              </span>
                              <img
                                className="avatar discord-avatar"
                                src={member.avatar}
                                alt=""
                                loading="lazy"
                                width="48"
                                height="48"
                              />
                              <span className="member-info">
                                <strong>
                                  <span className="member-card-name">{member.name}</span>
                                  {member.guildTag && <span className="member-card-tag"><DiscordLogo size={11} weight="fill" aria-hidden="true" />{member.guildTag}</span>}
                                </strong>
                                <small>{member.handle}</small>
                                <span>{member.division || member.role}</span>
                              </span>
                              <ArrowUpRight size={19} className="member-arrow" aria-hidden="true" />
                              <span className="member-profile-cta" aria-hidden="true"><Eye size={15} />{id ? "Lihat profil" : "View Profile"}</span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    </li>
                  ))}
                </ol>
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
                  setRoleVisibility({});
                }}
              >
                {t.reset}
              </button>
            </div>
          )}
        </div>
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
