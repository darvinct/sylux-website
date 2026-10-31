import { useEffect, useRef } from "react";
import "../mascot.css";

const POSTER = "/images/sylux-mascot-motion-poster.webp";
const VIDEO = "/images/sylux-mascot-motion.mp4";

export function Mascot() {
  const stage = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const element = stage.current;
    const player = video.current;
    if (!element || !player || !window.IntersectionObserver) return;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    let visible = false;
    let nearby = false;
    let disposed = false;
    let failed = false;
    player.muted = true;

    const mayPlay = () => !disposed && visible && !document.hidden && !preference.matches && !failed;
    const update = () => {
      element.toggleAttribute("data-still", preference.matches || failed);
      if (nearby && !preference.matches && !failed && !player.hasAttribute("src")) {
        player.src = VIDEO;
        player.load();
      }
      if (mayPlay()) {
        void player.play().then(() => {
          if (!mayPlay()) player.pause();
        }).catch(() => { /* Keep the poster when autoplay is unavailable. */ });
      } else player.pause();
    };
    const ready = () => {
      element.setAttribute("data-playing", "");
      if (!mayPlay()) player.pause();
    };
    const error = () => { failed = true; update(); };
    const loadObserver = new IntersectionObserver(([entry]) => {
      nearby = entry.isIntersecting;
      update();
    }, { rootMargin: "400px 0px" });
    const playObserver = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      update();
    }, { threshold: .1 });

    player.addEventListener("playing", ready);
    player.addEventListener("error", error);
    document.addEventListener("visibilitychange", update);
    preference.addEventListener("change", update);
    loadObserver.observe(element);
    playObserver.observe(element);
    update();
    return () => {
      disposed = true;
      loadObserver.disconnect();
      playObserver.disconnect();
      document.removeEventListener("visibilitychange", update);
      preference.removeEventListener("change", update);
      player.removeEventListener("playing", ready);
      player.removeEventListener("error", error);
      player.pause();
      player.removeAttribute("src");
      player.load();
      element.removeAttribute("data-playing");
      element.removeAttribute("data-still");
    };
  }, []);

  return (
    <div className="community-mascot-stage" ref={stage} aria-hidden="true">
      <div className="mascot-media">
        <img className="mascot-poster" src={POSTER} width="768" height="432" alt="" loading="lazy" decoding="async" />
        <video ref={video} className="mascot-video" poster={POSTER} width="768" height="432" muted loop playsInline preload="none" disablePictureInPicture tabIndex={-1} />
      </div>
    </div>
  );
}
