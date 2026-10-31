import assert from "node:assert/strict";
import { prepareOpeningLogo, shouldPlayOpening, OPENING_ANIMATION_MS } from "../src/lib/opening.ts";

const previousWindow = globalThis.window;
const previousImage = globalThis.Image;
const originalEntries = performance.getEntriesByType;
let navigationType = "navigate";
let reduced = false;
let loadedImage;
let mode = "ready";
let finishDecode;
globalThis.window = { location: { hash: "" }, matchMedia: () => ({ matches: reduced }) };
performance.getEntriesByType = () => [{ type: navigationType }];
globalThis.Image = class {
  constructor() { loadedImage = this; }
  set src(value) {
    assert.equal(value, "/images/sylux-logo.webp");
    if (mode === "never") return;
    queueMicrotask(() => mode === "error" ? this.onerror?.() : this.onload?.());
  }
  decode() {
    if (mode === "decode-failure") return Promise.reject(new Error("decode failed"));
    if (mode === "slow-decode") return new Promise(resolve => { finishDecode = resolve; });
    return Promise.resolve();
  }
};

try {
  for (const hash of ["", "#home", "#team", "#portfolio"]) {
    window.location.hash = hash;
    assert.equal(shouldPlayOpening(), true, hash);
  }
  navigationType = "reload";
  assert.equal(shouldPlayOpening(), true);
  navigationType = "back_forward";
  assert.equal(shouldPlayOpening(), false);
  navigationType = "navigate";
  reduced = true;
  assert.equal(shouldPlayOpening(), false);
  reduced = false;
  assert.equal(OPENING_ANIMATION_MS, 1800);

  assert.equal(await prepareOpeningLogo(new AbortController().signal), true);
  assert.equal(loadedImage.onload, null);
  assert.equal(loadedImage.onerror, null);

  mode = "slow-decode";
  let ready = false;
  const decoding = prepareOpeningLogo(new AbortController().signal).then(value => { ready = value; return value; });
  await Promise.resolve();
  assert.equal(ready, false, "Animation must not start before decode completes");
  finishDecode();
  assert.equal(await decoding, true);

  for (mode of ["error", "decode-failure", "never"]) {
    assert.equal(await prepareOpeningLogo(new AbortController().signal, 10), false, mode);
    assert.equal(loadedImage.onload, null);
    assert.equal(loadedImage.onerror, null);
  }
  const controller = new AbortController();
  const pending = prepareOpeningLogo(controller.signal);
  controller.abort();
  assert.equal(await pending, false);
  assert.equal(await prepareOpeningLogo(controller.signal), false);
  console.log("Passed: opening on hash links/reload, reduced motion/back navigation, image decode gating, load failure, timeout and abort cleanup.");
} finally {
  performance.getEntriesByType = originalEntries;
  if (previousWindow === undefined) delete globalThis.window; else globalThis.window = previousWindow;
  if (previousImage === undefined) delete globalThis.Image; else globalThis.Image = previousImage;
}
