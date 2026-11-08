"use client";

import { useEffect, useRef, useState } from "react";
import { Music2 } from "lucide-react";
import type { OverlayRequest } from "@/lib/requests";
import { publicSenderName } from "@/lib/requests";
import { createPopup } from "@/lib/popup";
import { OVERLAY_POLL_MS, parseOverlayPayload } from "@/lib/overlay";
import { overlayErrorMessage } from "@/lib/overlay-errors";

const example: OverlayRequest = {
  id: "preview", display_name: "Mellie", is_anonymous: false,
  song_title: "Those Eyes", artist: "New West",
  dedication_to: "Someone special",
  message: "A little song for someone who makes ordinary days feel special. Thank you for being here!",
  updated_at: new Date().toISOString()
};

export default function OverlayPage() {
  const [item, setItem] = useState<OverlayRequest | null>(null);
  const [visible, setVisible] = useState(false);
  const [warning, setWarning] = useState("");
  const soundRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const preview = params.get("preview");
    const key = params.get("key");
    let alive = true;
    // Only ring when a new popup becomes visible (not on each 2.5s poll).
    const playNotification = () => {
      const audio = soundRef.current;
      if (!audio) return;
      audio.pause();
      audio.currentTime = 0;
      void audio.play().catch(() => {
        // Regular browsers can block autoplay; OBS Browser Source allows source audio.
        console.warn("LUXCAST: AFTERHOURS: notification audio blocked by browser autoplay policy.");
      });
    };
    const popup = createPopup(setItem, setVisible, undefined, undefined, playNotification);
    const controller = new AbortController();
    let timer: ReturnType<typeof setTimeout> | undefined;

    if (preview === "1" || preview === "anonymous") {
      // Keep visual previews on screen for design review; live OBS uses 40s.
      setItem({ ...example, is_anonymous: preview === "anonymous" });
      setVisible(true);
      playNotification();
      return () => { alive = false; popup.clear(); soundRef.current?.pause(); };
    }
    if (!key) {
      setWarning("Add ?key=YOUR_OVERLAY_VIEW_KEY to the OBS browser source URL.");
      return;
    }

    async function poll() {
      let failureMessage = overlayErrorMessage(0);
      try {
        const response = await fetch("/api/overlay", {
          headers: { "x-overlay-key": key! }, cache: "no-store",
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
        if (alive) timer = setTimeout(() => { void poll(); }, OVERLAY_POLL_MS);
      }
    }
    void poll();
    return () => { alive = false; clearTimeout(timer); controller.abort(); popup.clear(); };
  }, []);

  const length = item?.message.length ?? 0;
  const sizeClass = length > 310 ? "message-extra-long" : length > 155 ? "message-long" : "";

  return (
    <main className="overlay-stage">
      <audio ref={soundRef} src="/sounds/tuturu-notification.ogg" preload="auto" aria-hidden="true" />
      <div className={"overlay-card " + (visible ? "overlay-visible" : "")} aria-live="polite">
        <div className="overlay-sparkle overlay-sparkle-one" aria-hidden="true">✦</div>
        <section className="overlay-window overlay-note" aria-label="LUXCAST: AFTERHOURS dedication popup">
          <div className="overlay-window-header overlay-pink">
            <div className="overlay-window-title"><span className="overlay-capsule"/><span className="overlay-small-dot"/> A LIL NOTE</div>
            <div className="overlay-window-dots" aria-hidden="true"><i/><i/><i/></div>
          </div>
          <div className="overlay-content">
            <p className="overlay-station-mark">✦ LUXCAST: AFTERHOURS ✦</p>
            <p className="overlay-kicker">A MESSAGE FROM</p>
            <h1>{item ? publicSenderName(item) : "SYLUX Listener"}</h1>
            {item?.dedication_to && <p className="overlay-to">For: <strong>{item.dedication_to}</strong></p>}
            <p className={"overlay-message " + sizeClass}>{item?.message}</p>
            <div className="overlay-song-inline">
              <div className="overlay-song-inline-icon"><Music2 size={29} strokeWidth={2.5}/></div>
              <div className="overlay-song-inline-text">
                <span className="overlay-song-inline-label">SONG REQUEST</span>
                <strong className="overlay-song-title">{item?.song_title}</strong>
                <span className="overlay-artist">{item?.artist}</span>
              </div>
            </div>
          </div>
          <div className="overlay-window-buttons" aria-hidden="true">
            <span className="overlay-pill overlay-close">CLOSE</span>
            <span className="overlay-pill overlay-okay">OKAY</span>
          </div>
        </section>
        <div className="overlay-sparkle overlay-sparkle-two" aria-hidden="true">✦</div>
      </div>
      {warning && <div className="overlay-warning">{warning}</div>}
    </main>
  );
}
