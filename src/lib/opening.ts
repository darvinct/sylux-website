export const OPENING_ANIMATION_MS = 3000;
export const OPENING_LOGO_WAIT_MS = 1000;

export function shouldPlayOpening() {
  const navigation = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
  // Initial hash links still get the intro; back/forward navigation stays immediate.
  return navigation?.type !== "back_forward"
    && !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function prepareOpeningLogo(signal: AbortSignal, timeoutMs = OPENING_LOGO_WAIT_MS): Promise<boolean> {
  if (signal.aborted) return Promise.resolve(false);
  return new Promise((resolve) => {
    const image = new Image();
    let settled = false;
    const finish = (ready: boolean) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      image.onload = null;
      image.onerror = null;
      signal.removeEventListener("abort", abort);
      resolve(ready);
    };
    const abort = () => finish(false);
    const timeout = setTimeout(() => finish(false), timeoutMs);
    image.decoding = "async";
    image.onload = () => {
      if (typeof image.decode === "function") image.decode().then(() => finish(true), () => finish(false));
      else finish(true);
    };
    image.onerror = () => finish(false);
    signal.addEventListener("abort", abort, { once: true });
    image.src = "/images/sylux-logo.webp";
  });
}
