import assert from "node:assert/strict";
import { getCommunity } from "../server/community.mjs";
import handler from "../api/community.js";

const originalFetch = globalThis.fetch;
const originalWarn = console.warn;
const originalInvite = process.env.VITE_DISCORD_INVITE;
let requestedUrl;
let calls = 0;
const payload = { approximate_member_count: 1234, approximate_presence_count: 321, inviter: { private: "not-for-visitors" } };
console.warn = () => {};
function invoke(method = "GET") {
  const res = { headers: {}, setHeader(key, value) { this.headers[key] = value; }, end(body) { this.body = body; } };
  return handler({ method, url: "/api/community?invite=attacker-controlled" }, res).then(() => res);
}
try {
  delete process.env.VITE_DISCORD_INVITE;
  globalThis.fetch = async (url, options) => {
    requestedUrl = String(url);
    calls++;
    assert.equal(options.headers.Authorization, undefined);
    return Response.json(payload);
  };
  assert.deepEqual(await getCommunity({}), { total: 1234, online: 321 });
  assert.equal(requestedUrl, "https://discord.com/api/v10/invites/sylux?with_counts=true");
  await getCommunity({ VITE_DISCORD_INVITE: "https://discord.com/invite/custom-community" });
  assert.ok(requestedUrl.includes("/invites/custom-community?"));
  const before = calls;
  for (const invite of ["https://attacker.example/sylux", "http://discord.gg/sylux", "https://discord.gg/a/b", "https://discord.com/invite/../secret"]) {
    await assert.rejects(getCommunity({ VITE_DISCORD_INVITE: invite }));
  }
  assert.equal(calls, before);
  let response = await invoke();
  assert.equal(response.statusCode, 200);
  assert.deepEqual(JSON.parse(response.body), { total: 1234, online: 321 });
  assert.ok(requestedUrl.includes("/invites/sylux?"));
  assert.ok(response.headers["Cache-Control"].includes("s-maxage=60"));
  response = await invoke("POST");
  assert.equal(response.statusCode, 405);
  assert.equal(response.headers.Allow, "GET");
  for (const count of [null, -1, "321", 1.5]) {
    globalThis.fetch = async () => Response.json({ ...payload, approximate_presence_count: count });
    await assert.rejects(getCommunity({}));
  }
  globalThis.fetch = async () => Response.json({ approximate_member_count: 0, approximate_presence_count: 0 });
  assert.deepEqual(await getCommunity({}), { total: 0, online: 0 });
  for (const failure of [
    async () => new Response("Discord failed", { status: 429 }),
    async () => { throw new DOMException("Timed out", "TimeoutError"); },
    async () => new Response("not JSON"),
  ]) {
    globalThis.fetch = failure;
    response = await invoke();
    assert.equal(response.statusCode, 503);
    assert.deepEqual(JSON.parse(response.body), { error: "community_unavailable" });
    assert.equal(response.headers["Cache-Control"], "private, no-store");
  }
  console.log("Passed: fixed Discord invite source, public counts only, zero/missing/invalid counts, cache headers, method checks, and provider failure handling.");
} finally {
  globalThis.fetch = originalFetch;
  console.warn = originalWarn;
  if (originalInvite === undefined) delete process.env.VITE_DISCORD_INVITE;
  else process.env.VITE_DISCORD_INVITE = originalInvite;
}
