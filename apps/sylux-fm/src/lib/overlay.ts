import type { OverlayRequest } from "./requests.ts";

export const POPUP_DURATION_MS = 12_000;
export const OVERLAY_POLL_MS = 2_500;

export function overlayVersion(item: OverlayRequest): string {
  return `${item.id}:${item.updated_at}`;
}

export function parseOverlayPayload(payload: unknown): OverlayRequest | null {
  if (!payload || typeof payload !== "object" || !("active" in payload)) {
    throw new Error("Invalid overlay response");
  }
  const active = payload.active;
  if (active === null) return null;
  if (!active || typeof active !== "object") throw new Error("Invalid overlay request");
  const record = active as Record<string, unknown>;
  const fields = ["id", "username", "song_title", "artist", "message", "updated_at"] as const;
  if (!fields.every(field => typeof record[field] === "string") ||
      typeof record.is_anonymous !== "boolean" ||
      !("dedication_to" in active) ||
      (active.dedication_to !== null && typeof active.dedication_to !== "string")) {
    throw new Error("Invalid overlay request");
  }
  return active as OverlayRequest;
}
