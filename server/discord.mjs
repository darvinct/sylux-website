import {
  createHash,
  createCipheriv,
  createDecipheriv,
  randomBytes,
} from "node:crypto";

export const SESSION_TTL = 24 * 60 * 60;
export const snowflake = (value) =>
  typeof value === "string" && /^\d{17,20}$/.test(value);

export function authConfig(env = process.env) {
  try {
    const url = new URL(env.SITE_URL);
    const local =
      ["localhost", "127.0.0.1"].includes(url.hostname) && !env.VERCEL;
    if (
      (url.protocol !== "https:" && !(local && url.protocol === "http:")) ||
      url.username ||
      url.password ||
      url.pathname !== "/" ||
      url.search ||
      url.hash
    )
      return null;
    if (
      !snowflake(env.DISCORD_CLIENT_ID) ||
      !env.DISCORD_CLIENT_SECRET ||
      Buffer.byteLength(env.SESSION_SECRET || "") < 32
    )
      return null;
    return {
      origin: url.origin,
      clientId: env.DISCORD_CLIENT_ID,
      clientSecret: env.DISCORD_CLIENT_SECRET,
      secret: env.SESSION_SECRET,
      secure: url.protocol === "https:",
      redirectUri: `${url.origin}/api/auth/callback`,
    };
  } catch {
    return null;
  }
}

export function seal(value, secret, purpose, ttl) {
  const iv = randomBytes(12);
  const cipher = createCipheriv(
    "aes-256-gcm",
    createHash("sha256").update(secret).digest(),
    iv,
  );
  cipher.setAAD(Buffer.from(purpose));
  const data = Buffer.concat([
    cipher.update(
      JSON.stringify({ ...value, exp: Date.now() + ttl * 1000 }),
      "utf8",
    ),
    cipher.final(),
  ]);
  return Buffer.concat([iv, cipher.getAuthTag(), data]).toString("base64url");
}

export function unseal(value, secret, purpose) {
  try {
    if (typeof value !== "string" || value.length > 4096) return null;
    const data = Buffer.from(value, "base64url");
    const decipher = createDecipheriv(
      "aes-256-gcm",
      createHash("sha256").update(secret).digest(),
      data.subarray(0, 12),
    );
    decipher.setAAD(Buffer.from(purpose));
    decipher.setAuthTag(data.subarray(12, 28));
    const result = JSON.parse(
      Buffer.concat([
        decipher.update(data.subarray(28)),
        decipher.final(),
      ]).toString(),
    );
    return Number.isFinite(result.exp) && result.exp > Date.now()
      ? result
      : null;
  } catch {
    return null;
  }
}

export function cookieName(config, purpose) {
  return `${config.secure ? "__Host-" : ""}nc-${purpose}`;
}
export function cookie(config, purpose, value, ttl) {
  return `${cookieName(config, purpose)}=${value}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${ttl}${config.secure ? "; Secure" : ""}`;
}
export function readCookie(req, name) {
  const values = (req.headers.cookie || "")
    .split(";")
    .map((part) => part.trim())
    .filter((part) => part.startsWith(`${name}=`));
  return values.length === 1 ? values[0].slice(name.length + 1) : "";
}
export function json(res, status, data) {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.statusCode = status;
  res.end(JSON.stringify(data));
}
export function redirect(res, path) {
  res.statusCode = 303;
  res.setHeader("Location", path);
  res.end();
}
export function noStore(res) {
  res.setHeader("Cache-Control", "private, no-store");
  res.setHeader("Vercel-CDN-Cache-Control", "no-store");
  res.setHeader("Referrer-Policy", "no-referrer");
}
export function safeReturn(value) {
  return [
    "/",
    "/twibbon",
    "/forms/public",
    "/webhooks/editor",
    "/account",
  ].includes(value)
    ? value
    : "/account";
}

export function publicUser(user, member = null, guildId = "") {
  if (!snowflake(user?.id) || typeof user.username !== "string")
    throw new Error("Invalid Discord profile");
  const hash =
    typeof user.avatar === "string" && /^(a_)?[a-f0-9]{32}$/.test(user.avatar)
      ? user.avatar
      : null;
  const guildHash =
    typeof member?.avatar === "string" &&
    /^(a_)?[a-f0-9]{32}$/.test(member.avatar)
      ? member.avatar
      : null;
  const defaultIndex =
    user.discriminator && user.discriminator !== "0"
      ? Number(user.discriminator) % 5
      : Number((BigInt(user.id) >> 22n) % 6n);
  return {
    id: user.id,
    name: (member?.nick || user.global_name || user.username).slice(0, 100),
    username: user.username.slice(0, 32),
    avatar:
      guildHash && snowflake(guildId)
        ? `https://cdn.discordapp.com/guilds/${guildId}/users/${user.id}/avatars/${guildHash}.webp?size=256`
        : hash
          ? `https://cdn.discordapp.com/avatars/${user.id}/${hash}.webp?size=256`
          : `https://cdn.discordapp.com/embed/avatars/${defaultIndex}.png`,
    profileUrl: `https://discord.com/users/${user.id}`,
  };
}

export async function discordFailure(response) {
  const body = await response.json().catch(() => null);
  const knownErrors = [
    "invalid_client",
    "unauthorized_client",
    "invalid_grant",
    "invalid_request",
    "invalid_scope",
    "unsupported_grant_type",
    "access_denied",
    "server_error",
    "temporarily_unavailable",
  ];
  const providerCode = knownErrors.includes(body?.error)
    ? body.error
    : Number.isSafeInteger(body?.code)
      ? String(body.code)
      : "unknown";
  // Convert provider text to fixed labels; never retain descriptions, tokens, or request bodies.
  const description =
    typeof body?.error_description === "string" ? body.error_description : "";
  const detail = /code_verifier|code_challenge|pkce/i.test(description)
    ? "pkce"
    : /redirect_uri|redirect uri/i.test(description)
      ? "redirect_uri"
      : null;
  return Object.assign(new Error("Discord request failed"), {
    status: response.status,
    providerCode,
    detail,
  });
}

export async function discordRequest(path, authorization) {
  const response = await fetch(`https://discord.com/api/v10${path}`, {
    headers: { Authorization: authorization },
    signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) throw await discordFailure(response);
  return response.json();
}
