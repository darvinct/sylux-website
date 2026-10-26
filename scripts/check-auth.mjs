import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import auth from "../api/auth/[action].js";
import teamHandler from "../api/team.js";
import {
  authConfig,
  cookieName,
  publicUser,
  readCookie,
  safeReturn,
  seal,
  unseal,
} from "../server/discord.mjs";
import { getTeam } from "../server/team.mjs";
import configuredTeam from "../server/team.json" with { type: "json" };

const env = {
  SITE_URL: "https://community.example",
  DISCORD_CLIENT_ID: "123456789012345678",
  DISCORD_CLIENT_SECRET: "test-only-client-secret",
  SESSION_SECRET: "test-only-secret-".repeat(4),
  DISCORD_BOT_TOKEN: "test-only-bot-token",
  DISCORD_GUILD_ID: "323456789012345678",
};
const originalEnv = Object.fromEntries(
  Object.keys(env).map((key) => [key, process.env[key]]),
);
const originalFetch = globalThis.fetch;
const originalConsoleError = console.error;
const loginFailures = [];
console.error = (label, details) => loginFailures.push({ label, ...details });
Object.assign(process.env, env);
const config = authConfig();
assert.ok(config);
assert.equal(
  authConfig({ ...env, SITE_URL: "http://community.example" }),
  null,
);
assert.equal(
  authConfig({ ...env, SITE_URL: "https://community.example/subpath" }),
  null,
);
assert.equal(authConfig({ ...env, SESSION_SECRET: "short" }), null);
assert.equal(authConfig({ ...env, DISCORD_CLIENT_ID: "not-an-id" }), null);
for (const value of [
  "https://evil.example",
  "//evil.example",
  "/\\evil.example",
  "/api/auth/callback",
  "/account?to=https://evil.example",
])
  assert.equal(safeReturn(value), "/account");
assert.equal(safeReturn("/twibbon"), "/twibbon");
const encrypted = seal(
  { user: { id: "123" } },
  env.SESSION_SECRET,
  "session",
  60,
);
assert.equal(unseal(encrypted, env.SESSION_SECRET, "session").user.id, "123");
assert.equal(unseal(encrypted, env.SESSION_SECRET, "oauth"), null);
assert.equal(
  unseal("x" + encrypted.slice(1), env.SESSION_SECRET, "session"),
  null,
);
assert.equal(
  unseal(
    seal({}, env.SESSION_SECRET, "session", -1),
    env.SESSION_SECRET,
    "session",
  ),
  null,
);
assert.equal(
  readCookie(
    { headers: { cookie: "nc-session=a; nc-session=b" } },
    "nc-session",
  ),
  "",
);

async function invoke(
  handler,
  path,
  { method = "GET", cookie = "", origin, fetchSite } = {},
) {
  const headers = { cookie };
  if (origin) headers.origin = origin;
  if (fetchSite) headers["sec-fetch-site"] = fetchSite;
  const response = {
    statusCode: 200,
    headers: {},
    setHeader(key, value) {
      this.headers[key.toLowerCase()] = value;
    },
    end(body = "") {
      this.body = body;
    },
  };
  await handler({ url: path, method, headers }, response);
  return response;
}
const profile = {
  id: "223456789012345678",
  username: "actual.username",
  global_name: "Actual Discord Name",
  avatar: "a".repeat(32),
  email: "must-not-be-public@example.com",
};
try {
  let response = await invoke(auth, "/api/auth/login?returnTo=/twibbon");
  assert.equal(response.statusCode, 303);
  const authorize = new URL(response.headers.location);
  assert.equal(authorize.origin, "https://discord.com");
  assert.equal(authorize.searchParams.get("scope"), "identify");
  assert.equal(authorize.searchParams.get("code_challenge_method"), "S256");
  assert.ok(!authorize.toString().includes(env.DISCORD_CLIENT_SECRET));
  const oauthCookie = response.headers["set-cookie"];
  assert.ok(
    oauthCookie.includes("HttpOnly") &&
      oauthCookie.includes("Secure") &&
      oauthCookie.includes("SameSite=Lax"),
  );
  const browserCookie = oauthCookie.split(";")[0];
  const oauth = unseal(
    browserCookie.slice(browserCookie.indexOf("=") + 1),
    env.SESSION_SECRET,
    "oauth",
  );
  assert.equal(
    authorize.searchParams.get("code_challenge"),
    createHash("sha256").update(oauth.verifier).digest("base64url"),
  );
  assert.equal(response.headers["cache-control"], "private, no-store");
  let tokenExchanges = 0;
  globalThis.fetch = async (input, options) => {
    const url = String(input);
    if (url.endsWith("/oauth2/token")) {
      tokenExchanges++;
      assert.equal(options.body.get("code_verifier"), oauth.verifier);
      assert.equal(
        options.body.get("redirect_uri"),
        env.SITE_URL + "/api/auth/callback",
      );
      assert.equal(
        options.body.get("client_secret"),
        env.DISCORD_CLIENT_SECRET,
      );
      return Response.json({
        access_token: "test-only-access-token",
        refresh_token: "must-not-persist",
        token_type: "Bearer",
        scope: "identify",
      });
    }
    assert.equal(url, "https://discord.com/api/v10/users/@me");
    assert.equal(
      options.headers.Authorization,
      "Bearer test-only-access-token",
    );
    return Response.json(profile);
  };
  const callback =
    "/api/auth/callback?code=test-code&state=" +
    authorize.searchParams.get("state") +
    "&iss=https%3A%2F%2Fdiscord.com";
  response = await invoke(
    auth,
    callback.replace(authorize.searchParams.get("state"), "wrong-state"),
    { cookie: browserCookie },
  );
  assert.equal(response.headers.location, "/login?error=invalid_state");
  assert.equal(tokenExchanges, 0);
  response = await invoke(
    auth,
    callback.replace("https%3A%2F%2Fdiscord.com", "https%3A%2F%2Fevil.example"),
    { cookie: browserCookie },
  );
  assert.equal(response.headers.location, "/login?error=invalid_state");
  assert.equal(tokenExchanges, 0);
  response = await invoke(auth, callback);
  assert.equal(response.headers.location, "/login?error=invalid_state");
  assert.equal(tokenExchanges, 0);
  response = await invoke(auth, callback, { cookie: browserCookie });
  assert.equal(response.headers.location, "/twibbon");
  assert.equal(tokenExchanges, 1);
  const cookies = response.headers["set-cookie"];
  const sessionCookie = cookies.find((value) =>
    value.startsWith(cookieName(config, "session") + "="),
  );
  assert.ok(
    sessionCookie && !cookies.join("").includes("test-only-access-token"),
  );
  response = await invoke(auth, "/api/auth/session", {
    cookie: sessionCookie.split(";")[0],
  });
  const session = JSON.parse(response.body);
  assert.equal(session.user.id, profile.id);
  assert.equal(session.user.name, profile.global_name);
  assert.ok(
    !response.body.includes("email") &&
      !response.body.includes("access_token") &&
      !response.body.includes("refresh_token"),
  );
  assert.equal(
    session.user.avatar,
    `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.webp?size=256`,
  );
  response = await invoke(auth, "/api/auth/logout", {
    method: "POST",
    origin: "https://evil.example",
    cookie: sessionCookie,
  });
  assert.equal(response.statusCode, 403);
  assert.equal(response.headers["set-cookie"], undefined);
  response = await invoke(auth, "/api/auth/logout", {
    method: "POST",
    origin: env.SITE_URL,
  });
  assert.equal(response.statusCode, 200);
  assert.ok(
    response.headers["set-cookie"].every((value) =>
      value.includes("Max-Age=0"),
    ),
  );
  assert.equal((await invoke(auth, "/api/auth/logout")).statusCode, 405);
  assert.equal(
    (await invoke(auth, "/api/auth/login", { fetchSite: "cross-site" }))
      .statusCode,
    403,
  );
  globalThis.fetch = async () =>
    Response.json({ error: "do-not-reflect-provider-error" }, { status: 503 });
  response = await invoke(auth, callback, { cookie: browserCookie });
  assert.equal(response.headers.location, "/login?error=discord_unavailable");
  for (const [providerCode, status, expected] of [
    ["invalid_client", 401, "discord_configuration"],
    ["invalid_scope", 400, "discord_configuration"],
    ["invalid_grant", 400, "login_expired"],
  ]) {
    globalThis.fetch = async () =>
      Response.json(
        {
          error: providerCode,
          error_description:
            "sensitive-provider-echo " + env.DISCORD_CLIENT_SECRET,
        },
        { status },
      );
    response = await invoke(auth, callback, { cookie: browserCookie });
    assert.equal(response.headers.location, "/login?error=" + expected);
    assert.equal(loginFailures.at(-1).stage, "token_exchange");
    assert.equal(loginFailures.at(-1).reason, providerCode);
    assert.equal(loginFailures.at(-1).status, status);
  }
  globalThis.fetch = async () =>
    Response.json(
      {
        error: "invalid_grant",
        error_description: "Invalid code_verifier sensitive-provider-echo",
      },
      { status: 400 },
    );
  await invoke(auth, callback, { cookie: browserCookie });
  assert.equal(loginFailures.at(-1).detail, "pkce");
  globalThis.fetch = async () =>
    Response.json(
      {
        error: "invalid_grant",
        error_description: "Mismatched redirect_uri sensitive-provider-echo",
      },
      { status: 400 },
    );
  response = await invoke(auth, callback, { cookie: browserCookie });
  assert.equal(response.headers.location, "/login?error=discord_configuration");
  assert.equal(loginFailures.at(-1).detail, "redirect_uri");
  globalThis.fetch = async () =>
    new Response("<html>sensitive-provider-echo</html>", { status: 403 });
  response = await invoke(auth, callback, { cookie: browserCookie });
  assert.equal(response.headers.location, "/login?error=discord_unavailable");
  assert.equal(loginFailures.at(-1).reason, "unknown");
  globalThis.fetch = async () => {
    throw new DOMException("sensitive-provider-echo", "TimeoutError");
  };
  await invoke(auth, callback, { cookie: browserCookie });
  assert.equal(loginFailures.at(-1).reason, "timeout");
  globalThis.fetch = async (input) =>
    String(input).endsWith("/oauth2/token")
      ? Response.json({
          access_token: "test-only-access-token",
          token_type: "Bearer",
          scope: "identify",
        })
      : Response.json(
          { code: 50014, message: "sensitive-provider-echo" },
          { status: 401 },
        );
  await invoke(auth, callback, { cookie: browserCookie });
  assert.equal(loginFailures.at(-1).stage, "profile");
  assert.equal(loginFailures.at(-1).reason, "50014");
  assert.ok(!JSON.stringify(loginFailures).includes("sensitive-provider-echo"));
  assert.ok(!JSON.stringify(loginFailures).includes(env.DISCORD_CLIENT_SECRET));
  assert.ok(!JSON.stringify(loginFailures).includes("test-only-access-token"));
  delete process.env.DISCORD_CLIENT_SECRET;
  response = await invoke(auth, "/api/auth/session");
  assert.equal(JSON.parse(response.body).configured, false);
  process.env.DISCORD_CLIENT_SECRET = env.DISCORD_CLIENT_SECRET;

  const members = [{ id: profile.id, role: "Founder", bio: "Team biography" }];
  let requestedPath = "";
  globalThis.fetch = async (input, options) => {
    requestedPath = String(input);
    assert.equal(options.headers.Authorization, "Bot test-only-bot-token");
    return Response.json({
      user: profile,
      nick: "Server nickname",
      avatar: "b".repeat(32),
      roles: ["private-role"],
      joined_at: "private-date",
    });
  };
  const team = await getTeam(members, {
    DISCORD_BOT_TOKEN: "test-only-bot-token",
    DISCORD_GUILD_ID: "323456789012345678",
  });
  assert.ok(
    requestedPath.endsWith("/guilds/323456789012345678/members/" + profile.id),
  );
  assert.equal(team.members[0].name, "Server nickname");
  assert.equal(team.members[0].role, "Founder");
  assert.ok(
    !JSON.stringify(team).includes("private-role") &&
      !JSON.stringify(team).includes(profile.email),
  );
  assert.deepEqual(await getTeam([], {}), {
    configured: false,
    members: [],
    partial: false,
  });
  await assert.rejects(getTeam(members, {}));
  await assert.rejects(
    getTeam([{ id: "../../users/@me", role: "Founder" }], {
      DISCORD_BOT_TOKEN: "test",
    }),
  );
  await assert.rejects(
    getTeam([...members, ...members], { DISCORD_BOT_TOKEN: "test" }),
  );
  assert.ok(
    publicUser({ ...profile, avatar: null }).avatar.includes("/embed/avatars/"),
  );
  assert.ok(
    !publicUser({ ...profile, avatar: "https://evil.example" }).avatar.includes(
      "evil",
    ),
  );
  const requestedIds = [];
  globalThis.fetch = async (input, options) => {
    assert.equal(options.headers.Authorization, "Bot test-only-bot-token");
    const id = String(input).split("/").at(-1);
    requestedIds.push(id);
    return Response.json({
      user: { ...profile, id },
      nick: "Configured team fixture",
    });
  };
  const teamResponse = await invoke(
    teamHandler,
    "/api/team?id=attacker-controlled",
  );
  assert.equal(teamResponse.statusCode, 200);
  assert.equal(
    JSON.parse(teamResponse.body).members.length,
    configuredTeam.length,
  );
  assert.deepEqual(
    requestedIds.sort(),
    configuredTeam.map((member) => member.id).sort(),
  );
  assert.equal(
    (await invoke(teamHandler, "/api/team", { method: "POST" })).statusCode,
    405,
  );
  console.log(
    "Passed: OAuth state/PKCE/issuer, token exchange, encrypted expiry-bound sessions, origin-checked logout, private-data filtering, and whitelisted Discord team profiles.",
  );
} finally {
  console.error = originalConsoleError;
  globalThis.fetch = originalFetch;
  for (const [key, value] of Object.entries(originalEnv)) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
}
