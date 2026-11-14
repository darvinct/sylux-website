"use client";

import { useEffect, useRef, useState } from "react";
import { Music2, Headphones, Mail, Sparkles, VenetianMask, AudioLines } from "lucide-react";
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
      // Keep visual previews on screen for design review; live OBS uses 30s.
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
  const sizeClass = length > 380 ? "message-extra-long" : length > 180 ? "message-long" : "";

  return (
    <main className="overlay-stage">
      <audio ref={soundRef} src="/sounds/tuturu-notification.ogg" preload="auto" aria-hidden="true" />
      <div className={"overlay-card luxcast-reference " + (visible ? "overlay-visible" : "")} aria-live="polite">
        <div className="luxcast-topline"><Music2 aria-hidden="true"/><strong>LUXCAST: <em>AFTERHOURS</em></strong><span className="luxcast-onair"><i/> ON AIR</span></div>
        <div className="luxcast-maincard">
          <span className="luxcast-spark luxcast-spark-left" aria-hidden="true">✦</span>
          <div className="luxcast-avatar" aria-hidden="true"><Sparkles/></div>
          <div className="luxcast-person">
            <span className="luxcast-listener-tag">LISTENER</span>
            <h1>{item ? publicSenderName(item) : "LUXCAST Listener"} {item?.is_anonymous && <VenetianMask aria-label="Anonymous"/>}</h1>
          </div>
          <AudioLines className="luxcast-equalizer" aria-hidden="true"/>
          <Headphones className="luxcast-headphones" aria-hidden="true"/>
          <p className={"luxcast-message " + sizeClass}>{item?.message}</p>
          {item?.dedication_to && <p className="luxcast-dedication">To: <strong>{item.dedication_to}</strong></p>}
          <span className="luxcast-spark luxcast-spark-right" aria-hidden="true">✦</span>
        </div>
        <div className="luxcast-songbar">
          <span className="luxcast-envelope" aria-hidden="true"><Mail/></span>
          <div className="luxcast-songicon"><Music2 aria-hidden="true"/></div>
          <div className="luxcast-songinfo"><span>Dedicated Song</span><strong>{item?.song_title} — {item?.artist}</strong></div>
          <AudioLines className="luxcast-songwaves" aria-hidden="true"/>
        </div>
      </div>
      {warning && <div className="overlay-warning">{warning}</div>}
    </main>
  );
}
