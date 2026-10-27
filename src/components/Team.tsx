import { useEffect, useRef, useState } from "react";
import {
  ArrowClockwise,
  ArrowUpRight,
  DiscordLogo,
  MagnifyingGlass,
  CaretDown,
} from "@phosphor-icons/react";
import { copy, site, type Language } from "../data/site";
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
  const [expanded, setExpanded] = useState(true);
  const [collapsedRoles, setCollapsedRoles] = useState<string[]>([]);
  const search = useRef<HTMLInputElement>(null);
  const { members, state, partial, reload } = directory;
  const result = filterMembers(members, query, role, sorted);
  const groups = [...new Set(members.map((member) => member.role))]
    .map((name) => ({ name, members: result.filter((member) => member.role === name) }))
    .filter((group) => group.members.length > 0);
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
          {id ? "Profil terhubung ke Discord" : "Profiles connected to Discord"}
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
                onChange={(e) => { setQuery(e.target.value); setCollapsedRoles([]); }}
              />
              <kbd aria-hidden="true">/</kbd>
            </label>
            <div className="team-controls">
              <label>
                <span className="sr-only">{t.all}</span>
                <select value={role} onChange={(e) => { setRole(e.target.value); setCollapsedRoles([]); }}>
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
              <div className="team-tree">
                <div className="team-root" aria-label={`${site.name} community`}><DiscordLogo size={18} aria-hidden="true" /><BrandLogo /></div>
                <ol className="team-groups" aria-label={id ? "Tim berdasarkan peran" : "Team by role"}>
                  {groups.map((group, index) => (
                    <li className="team-group" key={group.name}>
                      <h3>
                        <button
                          className="team-role-toggle"
                          aria-expanded={!collapsedRoles.includes(group.name)}
                          aria-controls={`team-branch-${index}`}
                          onClick={() => setCollapsedRoles((previous) => previous.includes(group.name)
                            ? previous.filter((name) => name !== group.name)
                            : [...previous, group.name])}
                        >
                          {group.name}<span>({group.members.length})</span><CaretDown size={12} aria-hidden="true" />
                        </button>
                      </h3>
                      <ul className="team-branch" id={`team-branch-${index}`} hidden={collapsedRoles.includes(group.name)}>
                        {group.members.map((member) => (
                          <li className="team-node" key={member.id}>
                            <button className="member" aria-haspopup="dialog" onClick={() => setSelected(member)}>
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
                              <ArrowUpRight size={19} className="member-arrow" />
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
                  setCollapsedRoles([]);
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
