import { useEffect, useRef, type RefObject } from "react";

// The pinned story follows page scrolling; direct swipes keep native inertia.
export function useRoleScroller(
  scene: RefObject<HTMLElement | null>,
  track: RefObject<HTMLDivElement | null>,
  range: RefObject<HTMLInputElement | null>,
) {
  const move = useRef<(progress: number, smooth: boolean) => void>(() => {});
  useEffect(() => {
    const section = scene.current;
    const element = track.current;
    if (!section || !element) return;
    const desktop = window.matchMedia("(min-width: 900px) and (min-height: 700px) and (hover: hover) and (pointer: fine)");
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const pinned = () => desktop.matches && !motion.matches;
    const limit = () => Math.max(0, element.scrollWidth - element.clientWidth);
    const pagePosition = (progress: number) => window.scrollY + section.getBoundingClientRect().top
      + progress * Math.max(1, section.offsetHeight - window.innerHeight);
    let frame = 0;
    let target = element.scrollLeft;
    let previousTime = 0;
    let nativeUntil = 0;
    const cancel = () => { cancelAnimationFrame(frame); frame = 0; previousTime = 0; };
    const draw = (time: number) => {
      const elapsed = previousTime ? Math.min(time - previousTime, 48) : 16;
      previousTime = time;
      const distance = target - element.scrollLeft;
      element.scrollTo({ left: Math.abs(distance) < 3 ? target : element.scrollLeft + distance * (1 - Math.exp(-elapsed / 75)), behavior: "instant" });
      if (Math.abs(target - element.scrollLeft) > 1) frame = requestAnimationFrame(draw);
      else { frame = 0; previousTime = 0; }
    };
    const update = () => {
      if (!pinned()) { cancel(); return; }
      if (performance.now() < nativeUntil) return;
      const progress = Math.min(1, Math.max(0, -section.getBoundingClientRect().top / Math.max(1, section.offsetHeight - window.innerHeight)));
      target = progress * limit();
      if (!frame) frame = requestAnimationFrame(draw);
    };
    const sync = () => {
      const progress = element.scrollLeft / Math.max(1, limit());
      if (range.current) range.current.value = String(Math.round(progress * 1000));
      if (pinned() && performance.now() < nativeUntil) {
        nativeUntil = performance.now() + 250;
        cancel();
        target = element.scrollLeft;
        window.scrollTo({ top: pagePosition(progress), behavior: "instant" });
      }
    };
    const pointer = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") { nativeUntil = performance.now() + 1000; cancel(); }
    };
    const wheel = (event: WheelEvent) => {
      if (event.deltaX || event.shiftKey) { nativeUntil = performance.now() + 350; cancel(); }
    };
    move.current = (progress, smooth) => {
      const clamped = Math.min(1, Math.max(0, progress));
      nativeUntil = 0;
      const apply = () => {
        if (!element.isConnected) return;
        if (pinned()) {
          if (!smooth) { cancel(); target = clamped * limit(); element.scrollTo({ left: target, behavior: "instant" }); }
          window.scrollTo({ top: pagePosition(clamped), behavior: smooth ? "smooth" : "instant" });
        } else {
          element.scrollTo({ left: clamped * limit(), behavior: smooth && !motion.matches ? "smooth" : "instant" });
        }
      };
      if (smooth) requestAnimationFrame(apply);
      else apply();
    };
    const resize = new ResizeObserver(update);
    resize.observe(element);
    window.addEventListener("scroll", update, { passive: true });
    element.addEventListener("scroll", sync, { passive: true });
    element.addEventListener("pointerdown", pointer, { passive: true });
    element.addEventListener("wheel", wheel, { passive: true });
    motion.addEventListener("change", update);
    desktop.addEventListener("change", update);
    update(); sync();
    return () => {
      cancel(); resize.disconnect();
      window.removeEventListener("scroll", update);
      element.removeEventListener("scroll", sync);
      element.removeEventListener("pointerdown", pointer);
      element.removeEventListener("wheel", wheel);
      motion.removeEventListener("change", update);
      desktop.removeEventListener("change", update);
    };
  }, [scene, track, range]);
  return (progress: number, smooth = false) => move.current(progress, smooth);
}
