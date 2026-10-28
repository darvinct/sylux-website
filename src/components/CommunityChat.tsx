import { useEffect, useState } from "react";
import { ChatCircleDots, ArrowUpRight } from "@phosphor-icons/react";
import type { Language } from "../data/site";

const chatUrl = "https://discord.com/channels/1415636393211854898/1415636393211854901";
type Message = { id: string; name: string; content: string; timestamp: string };

export function CommunityChat({ lang }: { lang: Language }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [state, setState] = useState<"loading" | "ready" | "unavailable">("loading");
  const id = lang === "id";
  useEffect(() => {
    const controller = new AbortController();
    const load = () => fetch("/api/chat", { signal: controller.signal }).then((r) => {
      if (!r.ok) throw new Error("Unavailable");
      return r.json();
    }).then((data) => {
      if (!Array.isArray(data.messages)) throw new Error("Invalid data");
      setMessages(data.messages); setState("ready");
    }).catch(() => { if (!controller.signal.aborted) setState("unavailable"); });
    void load();
    const timer = window.setInterval(load, 60000);
    return () => { controller.abort(); window.clearInterval(timer); };
  }, []);
  return <section className="section wrap community-chat" aria-labelledby="chat-title">
    <div className="chat-intro"><ChatCircleDots size={24} /><h2 id="chat-title">{id ? "Obrolan di SYLUX" : "Conversations in SYLUX"}</h2><p>{id ? "Lihat obrolan terbaru dan lanjutkan percakapan di Discord." : "See the latest messages and join the conversation on Discord."}</p></div>
    <div className="chat-panel"><div className="chat-panel-heading"><span># chat</span><span>{id ? "Pesan publik" : "Public messages"}</span></div>
      {state === "loading" ? <p className="chat-status">{id ? "Memuat obrolan…" : "Loading messages…"}</p> : state === "unavailable" ? <p className="chat-status">{id ? "Obrolan belum tersedia. Buka channel di Discord untuk melihat pesan." : "Messages are unavailable. Open the channel in Discord to view them."}</p> : messages.length === 0 ? <p className="chat-status">{id ? "Belum ada pesan yang bisa ditampilkan." : "No messages to show yet."}</p> : <ol className="chat-messages">{messages.map((m) => <li key={m.id}><div><strong>{m.name}</strong><time dateTime={m.timestamp}>{new Date(m.timestamp).toLocaleString(id ? "id-ID" : "en-US", {day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"})}</time></div><p>{m.content}</p></li>)}</ol>}
      <a className="chat-compose" href={chatUrl} target="_blank" rel="noreferrer"><span>{id ? "Kirim pesan di Discord" : "Send a message on Discord"}</span><ArrowUpRight size={18} /></a>
    </div>
  </section>;
}
