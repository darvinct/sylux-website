import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import {
  authConfig,
  cookie,
  cookieName,
  discordRequest,
  json,
  noStore,
  publicUser,
  readCookie,
  redirect,
  safeReturn,
  seal,
  SESSION_TTL,
  unseal,
} from "../../server/discord.mjs";

export default async function handler(req, res) {
  noStore(res);
  const config = authConfig();
  const url = new URL(req.url, config?.origin || "https://invalid.local");
  const action = url.pathname.split("/").filter(Boolean).at(-1);
  if (!["login", "callback", "session", "logout"].includes(action))
    return json(res, 404, { error: "not_found" });
  const expectedMethod = action === "logout" ? "POST" : "GET";
  if (req.method !== expectedMethod) {
    res.setHeader("Allow", expectedMethod);
    return json(res, 405, { error: "method_not_allowed" });
  }
  if (!config) {
    if (action === "session")
      return json(res, 200, { configured: false, user: null });
    if (action === "login" || action === "callback")
      return redirect(res, "/login?error=not_configured");
    return json(res, 503, { error: "not_configured" });
  }
  if (action === "session") {
    const session = unseal(
      readCookie(req, cookieName(config, "session")),
      config.secret,
      "session",
    );
    return json(res, 200, {
      configured: true,
      user: session?.user || null,
      expiresAt: session?.exp || null,
    });
  }
  if (action === "logout") {
    if (req.headers.origin !== config.origin)
      return json(res, 403, { error: "invalid_origin" });
    res.setHeader("Set-Cookie", [
      cookie(config, "session", "", 0),
      cookie(config, "oauth", "", 0),
    ]);
    return json(res, 200, { user: null });
  }
  if (action === "login") {
    if (req.headers["sec-fetch-site"] === "cross-site")
      return json(res, 403, { error: "invalid_origin" });
    const state = randomBytes(32).toString("base64url");
    const verifier = randomBytes(32).toString("base64url");
    const returnTo = safeReturn(url.searchParams.get("returnTo"));
    res.setHeader(
      "Set-Cookie",
      cookie(
        config,
        "oauth",
        seal({ state, verifier, returnTo }, config.secret, "oauth", 600),
        600,
      ),
    );
    const authorize = new URL("https://discord.com/api/oauth2/authorize");
    authorize.search = new URLSearchParams({
      client_id: config.clientId,
      redirect_uri: config.redirectUri,
      response_type: "code",
      scope: "identify",
      state,
      code_challenge: createHash("sha256").update(verifier).digest("base64url"),
      code_challenge_method: "S256",
    }).toString();
    return redirect(res, authorize.toString());
  }
  // Consume the short-lived browser state before any code exchange.
  const oauth = unseal(
    readCookie(req, cookieName(config, "oauth")),
    config.secret,
    "oauth",
  );
  res.setHeader("Set-Cookie", cookie(config, "oauth", "", 0));
  const state = url.searchParams.get("state") || "";
  const stateValid =
    oauth &&
    typeof oauth.state === "string" &&
    Buffer.byteLength(state) === Buffer.byteLength(oauth.state) &&
    timingSafeEqual(Buffer.from(state), Buffer.from(oauth.state));
  if (!stateValid || url.searchParams.get("iss") !== "https://discord.com")
    return redirect(res, "/login?error=invalid_state");
  if (url.searchParams.has("error"))
    return redirect(res, "/login?error=cancelled");
  const code = url.searchParams.get("code");
  if (!code || code.length > 2048)
    return redirect(res, "/login?error=invalid_state");
  try {
    const response = await fetch("https://discord.com/api/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: config.clientId,
        client_secret: config.clientSecret,
        grant_type: "authorization_code",
        code,
        redirect_uri: config.redirectUri,
        code_verifier: oauth.verifier,
      }),
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) throw new Error("Token exchange failed");
    const token = await response.json();
    if (
      typeof token.access_token !== "string" ||
      token.token_type?.toLowerCase() !== "bearer" ||
      !(token.scope || "").split(" ").includes("identify")
    )
      throw new Error("Invalid access token");
    const user = publicUser(
      await discordRequest("/users/@me", `Bearer ${token.access_token}`),
    );
    // Access and refresh tokens are intentionally not persisted or sent to the browser.
    res.setHeader("Set-Cookie", [
      cookie(config, "oauth", "", 0),
      cookie(
        config,
        "session",
        seal({ user }, config.secret, "session", SESSION_TTL),
        SESSION_TTL,
      ),
    ]);
    return redirect(res, safeReturn(oauth.returnTo));
  } catch {
    return redirect(res, "/login?error=discord_unavailable");
  }
}
