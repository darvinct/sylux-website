import { useEffect, useRef } from "react";

export function useScrollReveal(selector: string) {
  const page = useRef<HTMLElement>(null);
  useEffect(() => {
    const root = page.current;
    if (!root) return;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    let generation = 0;
    let dispose: (() => void) | undefined;

    function start() {
      const current = ++generation;
      dispose?.();
      dispose = undefined;
      if (preference.matches) return;
      // Load the animation engine only when motion is wanted. If loading fails,
      // the page stays readable without hidden content or interrupted scrolling.
      void Promise.all([import("gsap"), import("gsap/ScrollTrigger")]).then(([{ gsap }, { ScrollTrigger }]) => {
        if (current !== generation || !root) return;
        gsap.registerPlugin(ScrollTrigger);
        const reveals = new Map<HTMLElement, ReturnType<typeof gsap.fromTo>>();
        const refresh = gsap.delayedCall(.12, () => ScrollTrigger.refresh()).pause();
        const scheduleRefresh = () => { refresh.restart(true); };
        const changes = new MutationObserver(register);
        const opening = new MutationObserver(scheduleRefresh);
        dispose = () => {
          changes.disconnect();
          opening.disconnect();
          refresh.kill();
          root.removeEventListener("toggle", scheduleRefresh, true);
          for (const [element, tween] of reveals) {
            tween.scrollTrigger?.kill();
            tween.revert();
            element.classList.remove("scroll-reveal");
          }
          reveals.clear();
          root.classList.remove("motion-ready");
        };
        function register() {
          for (const [element, tween] of reveals) {
            if (!root?.contains(element)) {
              tween.scrollTrigger?.kill();
              tween.revert();
              element.classList.remove("scroll-reveal");
              reveals.delete(element);
            }
          }
          root?.querySelectorAll<HTMLElement>(selector).forEach((element) => {
            if (reveals.has(element)) return;
            const siblings = Array.from(element.parentElement?.children || []);
            const order = Math.max(0, Math.min(siblings.indexOf(element), 3));
            element.classList.add("scroll-reveal");
            const tween = gsap.fromTo(element,
              { opacity: 0, y: 26, scale: .99 },
              {
                opacity: 1, y: 0, scale: 1, ease: "none",
                scrollTrigger: {
                  trigger: element,
                  start: `top ${88 - order * 2}%`,
                  end: "top 62%",
                  scrub: window.matchMedia("(pointer: coarse)").matches ? .18 : .4,
                  invalidateOnRefresh: true,
                },
              });
            reveals.set(element, tween);
          });
          scheduleRefresh();
        }
        register();
        root.classList.add("motion-ready");
        changes.observe(root, { childList: true, subtree: true });
        opening.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "lang"] });
        root.addEventListener("toggle", scheduleRefresh, true);
        void document.fonts.ready.then(() => { if (current === generation) scheduleRefresh(); });
      }).catch(() => {
        if (current === generation) { dispose?.(); dispose = undefined; }
      });
    }
    start();
    preference.addEventListener("change", start);
    return () => { generation++; dispose?.(); preference.removeEventListener("change", start); };
  }, [selector]);
  return page;
}
