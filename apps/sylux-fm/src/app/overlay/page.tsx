"use client";

import { useEffect, useRef, useState } from "react";
import { RadioTower, Disc3 } from "lucide-react";
import type { OverlayRequest } from "@/lib/requests";

const example: OverlayRequest = {
  id:"preview", username:"Yeri", song_title:"Those Eyes", artist:"New West",
  dedication_to:"Someone special", message:"A little song for someone who makes ordinary days feel special.",
  updated_at:new Date().toISOString()
};

export default function OverlayPage() {
  const [item, setItem] = useState<OverlayRequest | null>(null);
  const [visible, setVisible] = useState(false);
  const [warning, setWarning] = useState("");
  const lastId = useRef<string | null>(null);
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const preview = params.get("preview") === "1";
    const key = params.get("key");
    let alive = true;

    function display(next: OverlayRequest | null) {
      if (!alive) return;
      if (!next) { setVisible(false); lastId.current=null; return; }
      if (next.id === lastId.current) return;
      lastId.current = next.id;
      setVisible(false);
      setItem(next);
      if (timeout.current) clearTimeout(timeout.current);
      setTimeout(() => { if (alive) setVisible(true); }, 90);
      timeout.current = setTimeout(() => { if (alive) setVisible(false); }, 12000);
    }

    if (preview) {
      display(example);
      return () => { alive=false; if(timeout.current)clearTimeout(timeout.current); };
    }
    if (!key) {
      setWarning("Add ?key=YOUR_OVERLAY_VIEW_KEY to the OBS browser source URL.");
      return;
    }

    async function poll() {
      try {
        const response = await fetch("/api/overlay", {
          headers: { "x-overlay-key": key! }, cache:"no-store"
        });
        if (!response.ok) { if(alive)setWarning("Overlay access denied or unavailable."); return; }
        const data = (await response.json()) as { active: OverlayRequest | null };
        if (alive) { setWarning(""); display(data.active); }
      } catch {
        if (alive) setWarning("Unable to connect to overlay API.");
      }
    }
    void poll();
    const timer = setInterval(() => { void poll(); }, 2500);
    return () => { alive=false; clearInterval(timer); if(timeout.current)clearTimeout(timeout.current); };
  }, []);

  return (
    <main className="overlay-stage">
      <div className={"overlay-card "+(visible ? "overlay-visible" : "")} aria-live="polite">
        <div className="overlay-top"><div className="overlay-brand"><RadioTower size={19}/> SYLUX<span>FM</span></div><div className="overlay-label">NEW DEDICATION</div></div>
        <div className="overlay-content"><div className="overlay-kicker">A MESSAGE FROM</div><h1>{item?.username}</h1>{item?.dedication_to && <p className="overlay-to">To: {item.dedication_to}</p>}<p className="overlay-message">“{item?.message}”</p></div>
        <div className="overlay-song"><div className="record-icon"><Disc3 size={24}/></div><div><div className="overlay-song-title">{item?.song_title}</div><div className="overlay-artist">{item?.artist}</div></div><span className="overlay-wave"><b/><b/><b/><b/><b/></span></div>
      </div>
      {warning && <div className="overlay-warning">{warning}</div>}
    </main>
  );
}
