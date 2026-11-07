import type { OverlayRequest } from "./requests.ts";
import { overlayVersion, POPUP_DURATION_MS } from "./overlay.ts";

// Own both timers so standby, errors and unmount cannot re-show a stale popup.
export function createPopup(
  show: (item: OverlayRequest) => void,
  visibility: (visible: boolean) => void,
  schedule: (callback: () => void, delay: number) => ReturnType<typeof setTimeout> = setTimeout,
  cancel: (timer: ReturnType<typeof setTimeout>) => void = clearTimeout,
  notify?: (item: OverlayRequest) => void,
) {
  let lastVersion: string | null = null;
  let enter: ReturnType<typeof setTimeout> | undefined;
  let leave: ReturnType<typeof setTimeout> | undefined;
  function clear() {
    if (enter !== undefined) cancel(enter);
    if (leave !== undefined) cancel(leave);
    enter = leave = undefined;
    visibility(false);
  }
  return {
    display(item: OverlayRequest | null) {
      if (!item) { clear(); lastVersion = null; return; }
      const version = overlayVersion(item);
      if (version === lastVersion) return;
      clear();
      lastVersion = version;
      show(item);
      // The sound follows new popup versions, never repeated API polling.
      // An optional notification failure must not stop the on-air popup.
      try { notify?.(item); } catch { /* audio is optional */ }
      enter = schedule(() => visibility(true), 90);
      leave = schedule(() => visibility(false), POPUP_DURATION_MS);
    },
    clear,
  };
}
