import { useState, type FormEvent } from "react";
import {
  DownloadSimple,
  EnvelopeSimple,
  FloppyDisk,
  Trash,
} from "@phosphor-icons/react";
import { site, type Language } from "../data/site";
import { downloadFile } from "../lib/utils";
import { ToolHeading } from "./Shell";
import { useAuth } from "./Auth";

const blank = {
  nickname: "",
  discord: "",
  division: "Moderator",
  motivation: "",
  availability: "",
};
function restore(storageKey: string, defaults: typeof blank) {
  try {
    const value = JSON.parse(localStorage.getItem(storageKey) || "{}");
    return Object.fromEntries(
      Object.entries(defaults).map(([key, fallback]) => [
        key,
        typeof value?.[key] === "string" ? value[key].slice(0, 2000) : fallback,
      ]),
    ) as typeof blank;
  } catch {
    return defaults;
  }
}

export default function CommunityForm({ lang }: { lang: Language }) {
  const id = lang === "id";
  const { user } = useAuth();
  const storageKey = `nocturne-application:${user!.id}`;
  const [data, setData] = useState(() =>
    restore(storageKey, {
      ...blank,
      nickname: user!.name,
      discord: user!.username,
    }),
  );
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState("");
  const update = (key: keyof typeof blank, value: string) => {
    setData({ ...data, [key]: value });
    setStatus("");
  };
  const save = () => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(data));
      setStatus(
        id
          ? "Draft tersimpan di perangkat ini."
          : "Draft saved on this device.",
      );
    } catch {
      setStatus(
        id
          ? "Browser tidak mengizinkan penyimpanan. Kamu tetap bisa mengunduh draft."
          : "Browser storage is unavailable. You can still download your draft.",
      );
    }
  };
  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    downloadFile(
      JSON.stringify(
        {
          community: site.name,
          ...data,
          discordUserId: user!.id,
          createdAt: new Date().toISOString(),
        },
        null,
        2,
      ),
      "community-application.json",
    );
    setStatus(
      id
        ? "Salinan berhasil dibuat. Pendaftaran belum dikirim ke pengurus."
        : "Your copy is ready. Your application has not been sent to the team.",
    );
  };
  const sendEmail = () => {
    const body = Object.entries(data)
      .map(([k, v]) => `${k}: ${v}`)
      .join("\n\n");
    window.location.href = `mailto:${site.contactEmail}?subject=${encodeURIComponent(`${site.name} application`)}&body=${encodeURIComponent(body)}`;
    setStatus(
      id
        ? "Draft email dibuka. Periksa dan kirim melalui aplikasi emailmu."
        : "Email draft opened. Review and send it in your email app.",
    );
  };
  return (
    <main className="tool-page wrap">
      <ToolHeading
        lang={lang}
        title={id ? "Form Komunitas" : "Community Form"}
        body={
          id
            ? "Ambil peran dalam cerita berikutnya. Kenalkan dirimu kepada tim."
            : "Be part of the next chapter. Introduce yourself to the team."
        }
      />
      <div className="form-layout">
        <aside className="form-aside">
          <span className="sample-label">
            {id ? "Form contoh" : "Example form"}
          </span>
          <h2>
            {id ? "Orang baru,\nenergi baru." : "New people,\nnew energy."}
          </h2>
          <p>
            {id
              ? "Pilih peran yang paling dekat dengan minatmu. Tidak perlu sempurna untuk mulai berkontribusi."
              : "Choose the role that fits your interests. You do not have to be perfect to start contributing."}
          </p>
          <div className="notice">
            {id
              ? "Form ini membuat draft lokal. Tidak ada pengiriman atau penyimpanan online. Unduh salinanmu, lalu bagikan ke pengurus melalui kanal resmi komunitas."
              : "This form creates a local draft. Nothing is submitted or saved online. Download your copy and share it with the team through the official community channel."}
          </div>
        </aside>
        <form className="tool-panel community-form" onSubmit={submit}>
          <div className="form-two-col">
            <label className="field">
              {id ? "Nama panggilan" : "Nickname"}
              <input
                required
                maxLength={60}
                autoComplete="nickname"
                value={data.nickname}
                onChange={(e) => update("nickname", e.target.value)}
              />
            </label>
            <label className="field">
              Username Discord
              <input
                required
                maxLength={60}
                spellCheck={false}
                value={data.discord}
                onChange={(e) => update("discord", e.target.value)}
                placeholder="username"
              />
            </label>
          </div>
          <label className="field">
            {id ? "Peran yang diminati" : "Preferred role"}
            <select
              value={data.division}
              onChange={(e) => update("division", e.target.value)}
            >
              {["Moderator", "Event Host", "Designer", "Social Media"].map(
                (role) => (
                  <option key={role}>{role}</option>
                ),
              )}
            </select>
          </label>
          <label className="field">
            {id
              ? "Apa yang ingin kamu bawa ke komunitas?"
              : "What would you like to bring to the community?"}
            <textarea
              required
              minLength={20}
              maxLength={2000}
              rows={5}
              value={data.motivation}
              onChange={(e) => update("motivation", e.target.value)}
            />
            <small>
              {data.motivation.length}/2000 ·{" "}
              {id ? "minimal 20 karakter" : "minimum 20 characters"}
            </small>
          </label>
          <label className="field">
            {id
              ? "Kapan biasanya kamu tersedia?"
              : "When are you usually available?"}
            <input
              required
              maxLength={120}
              value={data.availability}
              onChange={(e) => update("availability", e.target.value)}
              placeholder={
                id
                  ? "Misalnya: Jumat malam, setelah 20.00 WIB"
                  : "For example: Friday evenings after 8 PM WIB"
              }
            />
          </label>
          <label className="checkbox-label">
            <input
              type="checkbox"
              required
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
            />
            <span>
              {id
                ? "Aku memahami bahwa draft ini belum dikirim ke pengurus."
                : "I understand this draft has not been submitted to the team."}
            </span>
          </label>
          <div className="button-row">
            <button className="button secondary" type="button" onClick={save}>
              <FloppyDisk size={18} />
              {id ? "Simpan draft" : "Save draft"}
            </button>
            <button className="button primary" type="submit">
              <DownloadSimple size={18} />
              {id ? "Unduh salinan" : "Download copy"}
            </button>
          </div>
          {site.contactEmail && (
            <button
              className="button secondary"
              type="button"
              disabled={
                !data.nickname || data.motivation.trim().length < 20 || !consent
              }
              onClick={sendEmail}
            >
              <EnvelopeSimple size={18} />
              {id ? "Buka draft email" : "Open email draft"}
            </button>
          )}
          <button
            className="text-button"
            type="button"
            onClick={() => {
              setData(blank);
              setConsent(false);
              try {
                localStorage.removeItem(storageKey);
              } catch {
                /* Storage can be blocked. */
              }
              setStatus(id ? "Draft dibersihkan." : "Draft cleared.");
            }}
          >
            <Trash size={16} />
            {id ? "Hapus draft" : "Clear draft"}
          </button>
          <p role="status" className="form-status">
            {status}
          </p>
        </form>
      </div>
    </main>
  );
}
