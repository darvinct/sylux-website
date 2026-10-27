import { useEffect, useRef } from "react";

export function useScrollReveal(selector: string) {
  const page = useRef<HTMLElement>(null);
  useEffect(() => {
    const root = page.current;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!root || !window.IntersectionObserver) return;
    let observer: IntersectionObserver | null = null;
    let changes: MutationObserver | null = null;
    const marked = new Set<HTMLElement>();
    function stop() {
      observer?.disconnect();
      changes?.disconnect();
      root?.classList.remove("motion-ready");
      for (const element of marked) {
        element.classList.remove("scroll-reveal", "is-visible");
        element.style.removeProperty("--reveal-delay");
      }
      marked.clear();
    }
    function start() {
      stop();
      if (!root || preference.matches) return;
      observer = new IntersectionObserver((entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer?.unobserve(entry.target);
          }
        }
      }, { threshold: .08, rootMargin: "0px 0px -24px 0px" });
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
          element.classList.add("scroll-reveal");
          observer?.observe(element);
        });
      }
      register();
      root.classList.add("motion-ready");
      changes = new MutationObserver(register);
      changes.observe(root, { childList: true, subtree: true });
    }
    start();
    preference.addEventListener("change", start);
    return () => { stop(); preference.removeEventListener("change", start); };
  }, [selector]);
  return page;
}
