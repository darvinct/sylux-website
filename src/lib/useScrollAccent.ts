import { useEffect, useRef } from "react";
import "../scroll-accent.css";

export function useScrollAccent(selector: string) {
  const page = useRef<HTMLElement>(null);
  useEffect(() => {
    const root = page.current;
    if (!root || !window.IntersectionObserver) return;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const registered = new Set<HTMLElement>();
    let observer: IntersectionObserver | undefined;
    let changes: MutationObserver | undefined;
    function clear(element: HTMLElement) {
      element.classList.remove("scroll-accent");
      element.style.removeProperty("--accent-delay");
    }
    function finish(event: AnimationEvent) {
      if (event.animationName === "scroll-accent-lift" && event.target instanceof HTMLElement) clear(event.target);
    }
    function stop() {
      observer?.disconnect();
      changes?.disconnect();
      root?.removeEventListener("animationend", finish);
      root?.removeEventListener("animationcancel", finish);
      for (const element of registered) clear(element);
      registered.clear();
    }
    function start() {
      stop();
      if (!root || preference.matches) return;
      observer = new IntersectionObserver((entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const element = entry.target as HTMLElement;
          // Accent the first entrance from below, never an upward revisit.
          if (entry.boundingClientRect.top > 48 && !element.matches(":focus-within")) element.classList.add("scroll-accent");
          observer?.unobserve(element);
        }
      }, { threshold: .05, rootMargin: "0px 0px -24px 0px" });
      function register() {
        for (const element of registered) {
          if (!root?.contains(element)) { observer?.unobserve(element); clear(element); registered.delete(element); }
        }
        root?.querySelectorAll<HTMLElement>(selector).forEach((element) => {
          if (registered.has(element)) return;
          registered.add(element);
          // Existing content in view stays stationary when opening a page/anchor.
          if (element.getBoundingClientRect().top < window.innerHeight * .75) return;
          const siblings = Array.from(element.parentElement?.children || []);
          element.style.setProperty("--accent-delay", `${Math.min(siblings.indexOf(element), 3) * 50}ms`);
          observer?.observe(element);
        });
      }
      root.addEventListener("animationend", finish);
      root.addEventListener("animationcancel", finish);
      register();
      changes = new MutationObserver(register);
      changes.observe(root, { childList: true, subtree: true });
    }
    start();
    preference.addEventListener("change", start);
    return () => { stop(); preference.removeEventListener("change", start); };
  }, [selector]);
  return page;
}
