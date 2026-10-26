import { useState } from "react";
import { Check, Copy, DownloadSimple } from "@phosphor-icons/react";
import { site, type Language } from "../data/site";
import { downloadFile, webhookPayload } from "../lib/utils";
import { BrandLogo, ToolHeading } from "./Shell";

export default function Webhook({ lang }: { lang: Language }) {
  const id = lang === "id";
  const [title, setTitle] = useState("See you after hours.");
  const [description, setDescription] = useState(
    "Music, stories, and good company.\nBring yourself. We will bring the playlist.",
  );
  const [color, setColor] = useState("#a78bfa");
  const [status, setStatus] = useState("");
  const payload = JSON.stringify(
    webhookPayload(title, description, color),
    null,
    2,
  );
  const valid = Boolean(title.trim() || description.trim());
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(payload);
      setStatus(id ? "JSON berhasil disalin." : "JSON copied.");
    } catch {
      setStatus(
        id
          ? "Clipboard tidak tersedia. Gunakan Unduh JSON."
          : "Clipboard is unavailable. Use Download JSON.",
      );
    }
  };
  return (
    <main className="tool-page wrap">
      <ToolHeading
        lang={lang}
        title="Webhook Studio"
        body={
          id
            ? "Rancang pesan yang terasa seperti komunitasmu. Lihat hasilnya sebelum dibagikan."
            : "Design a message that feels like your community. Preview it before sharing."
        }
      />
      <div className="tool-grid webhook-grid">
        <div className="tool-panel">
          <h2>{id ? "Pesan berikutnya." : "Your next message."}</h2>
          <label className="field">
            {id ? "Judul" : "Title"}
            <input
              maxLength={256}
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setStatus("");
              }}
            />
            <small>{title.length}/256</small>
          </label>
          <label className="field">
            {id ? "Isi pesan" : "Message"}
            <textarea
              rows={8}
              maxLength={4096}
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                setStatus("");
              }}
            />
            <small>{description.length}/4096</small>
          </label>
          <label className="field color-field">
            {id ? "Warna embed" : "Embed color"}
            <span>
              <input
                type="color"
                value={color}
                onChange={(e) => {
                  setColor(e.target.value);
                  setStatus("");
                }}
              />
              <code>{color}</code>
            </span>
          </label>
          <div className="button-row">
            <button
              className="button secondary"
              disabled={!valid}
              onClick={copy}
            >
              <Copy size={18} />
              {id ? "Salin JSON" : "Copy JSON"}
            </button>
            <button
              className="button primary"
              disabled={!valid}
              onClick={() => downloadFile(payload, "discord-message.json")}
            >
              <DownloadSimple size={18} />
              {id ? "Unduh JSON" : "Download JSON"}
            </button>
          </div>
          <p className="form-status" role="status">
            {status && (
              <>
                <Check size={16} />
                {status}
              </>
            )}
          </p>
          <p className="notice">
            {id
              ? "Editor ini hanya membuat preview dan JSON. Pesan tidak dikirim ke Discord. Tidak perlu memasukkan URL webhook atau token."
              : "This editor creates a preview and JSON only. No messages are sent to Discord. No webhook URL or token is needed."}
          </p>
        </div>
        <div className="preview-panel">
          <span className="preview-label">
            {id ? "Pratinjau pesan" : "Message preview"}
          </span>
          <div className="discord-preview">
            <span className="bot-avatar">
              <BrandLogo />
            </span>
            <div className="discord-message">
              <div className="discord-author">
                <strong>{site.name}</strong>
                <span>APP</span>
                <small>{id ? "Hari ini" : "Today"}</small>
              </div>
              <div className="discord-embed" style={{ borderLeftColor: color }}>
                {title.trim() && <h3>{title}</h3>}
                {description.trim() && <p>{description}</p>}
                {!valid && (
                  <p className="muted">
                    {id
                      ? "Tulis pesan untuk melihat pratinjau."
                      : "Write a message to see the preview."}
                  </p>
                )}
              </div>
            </div>
          </div>
          <small className="muted">
            {id
              ? "Teks ditampilkan apa adanya. Format Markdown akan dirender oleh Discord."
              : "Text is shown as written. Markdown formatting is rendered by Discord."}
          </small>
          <details className="json-details">
            <summary>JSON payload</summary>
            <pre>{payload}</pre>
          </details>
        </div>
      </div>
    </main>
  );
}
