import { useEffect, useRef } from "react";

export function useScrollReveal(selector: string) {
  const page = useRef<HTMLElement>(null);
  useEffect(() => {
    const root = page.current;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!root || !window.IntersectionObserver) return;
    let observer: IntersectionObserver | null = null;
    let changes: MutationObserver | null = null;
    let resizeTimer: number | undefined;
    const marked = new Set<HTMLElement>();
    function observeViewport() {
      observer?.disconnect();
      const inset = Math.round(Math.min(180, Math.max(64, window.innerHeight * .16)));
      observer = new IntersectionObserver((entries) => {
        for (const entry of entries) {
          // Reverse the entrance as content leaves the lower viewport when
          // scrolling up. Earlier content remains readable on the way back.
          const above = entry.boundingClientRect.top < (entry.rootBounds?.top ?? 0);
          entry.target.classList.toggle("is-visible", entry.isIntersecting || above);
        }
      }, { threshold: 0, rootMargin: `0px 0px -${inset}px 0px` });
      for (const element of marked) observer.observe(element);
    }
    function resize() {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(observeViewport, 120);
    }
    function stop() {
      observer?.disconnect();
      changes?.disconnect();
      window.clearTimeout(resizeTimer);
      window.removeEventListener("resize", resize);
      root?.classList.remove("motion-ready");
      for (const element of marked) {
        element.classList.remove("scroll-reveal", "is-visible");
        element.style.removeProperty("--reveal-delay");
        element.style.removeProperty("--reveal-start");
      }
      marked.clear();
    }
    function start() {
      stop();
      if (!root || preference.matches) return;
      observeViewport();
      function register() {
        for (const element of marked) {
          if (!root?.contains(element)) {
            observer?.unobserve(element);
            marked.delete(element);
          }
        }
        root?.querySelectorAll<HTMLElement>(selector).forEach((element) => {
          if (marked.has(element)) return;
          marked.add(element);
          const siblings = Array.from(element.parentElement?.children || []);
          const delay = Math.min(siblings.indexOf(element), 4) * 65;
          element.style.setProperty("--reveal-delay", `${delay}ms`);
          element.style.setProperty("--reveal-start", `${Math.min(siblings.indexOf(element), 3) * 5}%`);
          element.classList.add("scroll-reveal");
          observer?.observe(element);
        });
      }
      register();
      root.classList.add("motion-ready");
      changes = new MutationObserver(register);
      changes.observe(root, { childList: true, subtree: true });
      window.addEventListener("resize", resize, { passive: true });
    }
    start();
    preference.addEventListener("change", start);
    return () => { stop(); preference.removeEventListener("change", start); };
  }, [selector]);
  return page;
}
