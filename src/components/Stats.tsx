import { useEffect, useState } from "react";
import {
  ArrowClockwise,
  DiscordLogo,
  Users,
  Waveform,
} from "@phosphor-icons/react";
import { copy, site, type Language } from "../data/site";
import { inviteCode } from "../lib/utils";

export function Stats({ lang }: { lang: Language }) {
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">(
    "idle",
  );
  const [counts, setCounts] = useState({ total: 0, online: 0 });
  const [retry, setRetry] = useState(0);
  const code = inviteCode(site.discordInvite);
  useEffect(() => {
    if (!code) return;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    let active = true;
    setState("loading");
    fetch(
      `https://discord.com/api/v10/invites/${encodeURIComponent(code)}?with_counts=true`,
      { signal: controller.signal },
    )
      .then(async (response) => {
        if (!response.ok) throw new Error("Discord unavailable");
        return response.json();
      })
      .then((data) => {
        if (
          !Number.isFinite(data.approximate_member_count) ||
          !Number.isFinite(data.approximate_presence_count)
        )
          throw new Error("No counts");
        if (active) {
          setCounts({
            total: data.approximate_member_count,
            online: data.approximate_presence_count,
          });
          setState("success");
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
  }, [code, retry]);
  const t = copy[lang];
  const values = [
    state === "success"
      ? counts.total.toLocaleString(lang === "id" ? "id-ID" : "en-US")
      : "···",
    state === "success"
      ? counts.online.toLocaleString(lang === "id" ? "id-ID" : "en-US")
      : "···",
  ];
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
            {values[0]}
          </strong>
          <span>{lang === "id" ? "Total anggota" : "Total members"}</span>
        </div>
        <div className="stat">
          <Waveform size={24} />
          <strong className={state === "loading" ? "skeleton-text" : ""}>
            {values[1]}
          </strong>
          <span>{lang === "id" ? "Sedang online" : "Online now"}</span>
        </div>
        <div className="stats-message">
          {!code ? (
            lang === "id" ? (
              "Server belum terhubung. Angka akan muncul setelah undangan Discord ditambahkan."
            ) : (
              "No server connected. Counts appear when a Discord invite is added."
            )
          ) : state === "loading" ? (
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
                onClick={() => setRetry(retry + 1)}
              >
                <ArrowClockwise size={15} />
                {lang === "id" ? "Coba lagi" : "Retry"}
              </button>
            </>
          ) : lang === "id" ? (
            "Perkiraan anggota dari Discord. Tidak mencakup statistik voice atau bot."
          ) : (
            "Approximate counts from Discord. Voice and bot counts are not included."
          )}
        </div>
      </div>
    </section>
  );
}
