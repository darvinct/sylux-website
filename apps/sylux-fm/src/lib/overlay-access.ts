import { timingSafeEqual } from "node:crypto";

export function hasOverlayAccess(received: string, expected: string): boolean {
  if (expected.length < 32) return false;
  const a = Buffer.from(received);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}
