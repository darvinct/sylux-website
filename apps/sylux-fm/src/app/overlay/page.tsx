"use client";

import { useEffect, useState } from "react";
import { RadioTower, Disc3 } from "lucide-react";
import type { OverlayRequest } from "@/lib/requests";
import { createPopup } from "@/lib/popup";
import { OVERLAY_POLL_MS, parseOverlayPayload } from "@/lib/overlay";
import { overlayErrorMessage } from "@/lib/overlay-errors";

const example: OverlayRequest = {
  id:"preview", username:"Yeri", song_title:"Those Eyes", artist:"New West",
  dedication_to:"Someone special", message:"A little song for someone who makes ordinary days feel special.",
  updated_at:new Date().toISOString()
};

export default function OverlayPage() {
  const [item, setItem] = useState<OverlayRequest | null>(null);
  const [visible, setVisible] = useState(false);
  const [warning, setWarning] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const preview = params.get("preview") === "1";
    const key = params.get("key");
    let alive = true;
    const popup = createPopup(setItem, setVisible);
    const controller = new AbortController();
    let timer: ReturnType<typeof setTimeout> | undefined;

    if (preview) {
      popup.display(example);
      return () => { alive=false; popup.clear(); };
    }
    if (!key) {
      setWarning("Add ?key=YOUR_OVERLAY_VIEW_KEY to the OBS browser source URL.");
      return;
    }

    async function poll() {
      let failureMessage = overlayErrorMessage(0);
      try {
        const response = await fetch("/api/overlay", {
          headers: { "x-overlay-key": key! }, cache:"no-store",
          referrerPolicy: "no-referrer", signal: controller.signal
        });
        if (!response.ok) {
          const body = await response.json().catch(() => null);
          failureMessage = overlayErrorMessage(response.status, body?.code);
          throw new Error("Overlay unavailable");
        }
        const active = parseOverlayPayload(await response.json());
        if (alive) { setWarning(""); popup.display(active); }
      } catch {
        if (alive) { popup.clear(); setWarning(failureMessage); }
      } finally {
        // Schedule only after completion; slow requests cannot overwrite newer data.
        if (alive) timer = setTimeout(() => { void poll(); }, OVERLAY_POLL_MS);
      }
    }
    void poll();
    return () => { alive=false; clearTimeout(timer); controller.abort(); popup.clear(); };
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

