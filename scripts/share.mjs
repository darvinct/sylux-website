import data from "../src/data/share.json" with { type: "json" };
import { inviteCode } from "../src/lib/utils.ts";

export const DEFAULT_ORIGIN = "https://syluxofficial.vercel.app";

export function shareOrigin(env = process.env) {
  const value = env.VERCEL_ENV === "preview" && env.VERCEL_URL
    ? `https://${env.VERCEL_URL}`
    : env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${env.VERCEL_PROJECT_PRODUCTION_URL}`
      : env.SITE_URL || DEFAULT_ORIGIN;
  const url = new URL(value);
  const local = ["localhost", "127.0.0.1"].includes(url.hostname);
  if ((url.protocol !== "https:" && !(local && url.protocol === "http:")) ||
      url.username || url.password || url.pathname !== "/" || url.search || url.hash)
    throw new Error("Invalid public share origin");
  return url.origin;
}

export function buildShare(origin = DEFAULT_ORIGIN, invite = "https://discord.gg/sylux") {
  origin = shareOrigin({ SITE_URL: origin });
  if (!inviteCode(invite)) throw new Error("Invalid public Discord invite");
  const absolute = (path) => new URL(path, origin).href;
  const year = new Intl.DateTimeFormat("en", { year: "numeric", timeZone: "Asia/Bangkok" }).format(new Date());
  const footer = `© ${year} SYLUX Community. Ruangmu untuk bersinar.`;
  const buttons = data.links.map((link) => ({
    type: 2, style: 5, label: link.label,
    url: link.href === "$invite" ? invite : absolute(link.href),
  }));
  const payload = {
    component: {
      type: 17,
      accent_color: parseInt(data.accent.slice(1), 16),
      components: [
        { type: 9, components: [{ type: 10, content: `## [SYLUX](${origin}/) | Komunitas Discord\n${data.description}` }], accessory: { type: 11, media: { url: absolute(data.thumbnail) }, description: "Logo SYLUX" } },
        { type: 12, items: [{ media: { url: absolute(data.image) }, description: data.imageAlt }] },
        { type: 14, spacing: 1 },
        { type: 10, content: data.message },
        { type: 1, components: buttons },
        { type: 10, content: `-# ${footer}` },
      ],
    },
  };
  // This is inert JSON in the initial HTML, not client-injected executable code.
  const json = JSON.stringify(payload).replace(/</g, "\\u003c");
  if (Buffer.byteLength(json) > 3000) throw new Error("Discord component embed exceeds 3000 bytes");
  const meta = (property, content) => ({ tag: "meta", attrs: { property, content: String(content) }, injectTo: "head" });
  const name = (name, content) => ({ tag: "meta", attrs: { name, content }, injectTo: "head" });
  return {
    payload, json,
    tags: [
      name("description", data.description), name("theme-color", data.accent),
      meta("og:site_name", data.siteName), meta("og:title", data.title),
      meta("og:description", data.description), meta("og:type", "website"),
      meta("og:url", `${origin}/`), meta("og:locale", "id_ID"),
      meta("og:image", absolute(data.image)), meta("og:image:type", "image/jpeg"),
      meta("og:image:width", 1200), meta("og:image:height", 630), meta("og:image:alt", data.imageAlt),
      name("twitter:card", "summary_large_image"), name("twitter:title", data.title),
      name("twitter:description", data.description), name("twitter:image", absolute(data.image)),
      name("twitter:image:alt", data.imageAlt),
      { tag: "link", attrs: { rel: "canonical", href: `${origin}/` }, injectTo: "head" },
      { tag: "script", attrs: { id: "discord:component-embed", type: "application/json" }, children: json, injectTo: "head" },
    ],
  };
}

export function discordSharePlugin() {
  let invite;
  return {
    name: "sylux-discord-share",
    configResolved(config) { invite = config.env.VITE_DISCORD_INVITE || "https://discord.gg/sylux"; },
    transformIndexHtml() { return buildShare(shareOrigin(), invite).tags; },
  };
}
