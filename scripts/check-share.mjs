import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { buildShare, DEFAULT_ORIGIN, shareOrigin } from "./share.mjs";

// Crawler contracts: initial HTML, Discord's size/shape limits, public URLs,
// link-only buttons, and an Open Graph fallback for other clients.
const { payload, json, tags } = buildShare();
assert.ok(Buffer.byteLength(json) <= 3000);
assert.deepEqual(JSON.parse(json), payload);
assert.equal(payload.component.type, 17);
let count = 0;
let buttons = 0;
const allowed = new Set([1, 2, 9, 10, 11, 12, 14, 17]);
function walk(component, root = false) {
  count++;
  assert.ok(allowed.has(component.type));
  if (!root) assert.notEqual(component.type, 17, "Containers cannot be nested");
  if (component.type === 1) assert.ok(component.components.length <= 5);
  if (component.type === 2) {
    buttons++;
    assert.equal(component.style, 5);
    assert.equal(new URL(component.url).protocol, "https:");
    assert.equal(component.custom_id, undefined);
  }
  if (component.type === 9) assert.ok(component.components.length >= 1 && component.components.length <= 3);
  for (const child of component.components || []) walk(child);
  if (component.accessory) walk(component.accessory);
  for (const media of component.items || (component.media ? [component] : [])) {
    const url = new URL(media.media.url);
    assert.equal(url.origin, DEFAULT_ORIGIN);
    assert.ok(existsSync(new URL(`../public${url.pathname}`, import.meta.url)));
  }
}
walk(payload.component, true);
assert.ok(count <= 40);
assert.equal(buttons, 4);
for (const key of ["og:title", "og:description", "og:image", "og:url"])
  assert.equal(tags.filter(tag => tag.attrs?.property === key).length, 1);
assert.ok(tags.some(tag => tag.attrs?.name === "twitter:card" && tag.attrs.content === "summary_large_image"));
const script = tags.find(tag => tag.attrs?.id === "discord:component-embed");
assert.equal(script.attrs.type, "application/json");
assert.equal(script.children, json);
const preview = shareOrigin({ VERCEL_ENV: "preview", VERCEL_URL: "sylux-preview.vercel.app", SITE_URL: DEFAULT_ORIGIN });
assert.equal(preview, "https://sylux-preview.vercel.app");
assert.ok(buildShare(preview).json.includes(preview));
assert.equal(shareOrigin({ SITE_URL: "https://sylux.example" }), "https://sylux.example");
assert.equal(shareOrigin({ VERCEL_PROJECT_PRODUCTION_URL: "syluxofficial.vercel.app", SITE_URL: "https://website-komunitasi.vercel.app" }), DEFAULT_ORIGIN);
for (const origin of ["http://sylux.example", "https://user:pass@sylux.example", "https://sylux.example/path", "https://sylux.example/?token=private"])
  assert.throws(() => buildShare(origin));
assert.throws(() => buildShare(DEFAULT_ORIGIN, "https://example.com/invite"));
console.log(`Discord share checks passed: ${Buffer.byteLength(json)} bytes, ${count} components, ${buttons} link buttons.`);
