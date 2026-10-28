import configuredTeam from "./team.json" with { type: "json" };
import { discordRequest, publicUser, snowflake } from "./discord.mjs";

// ponytail: cache per function instance; Vercel CDN also caches public profiles.
let cached = null;
let loading = null;

export async function getTeam(entries = configuredTeam, env = process.env) {
  if (
    !Array.isArray(entries) ||
    entries.length > 100 ||
    entries.some(
      (m) =>
        !snowflake(m.id) ||
        typeof m.role !== "string" ||
        !m.role.trim() ||
        m.role.length > 60 ||
        (m.bio != null && typeof m.bio !== "string") ||
        (m.division != null &&
          (typeof m.division !== "string" || !m.division.trim() || m.division.length > 60)),
    ) ||
    new Set(entries.map((m) => `${m.id}:${m.role.trim()}`)).size !== entries.length
  )
    throw new Error("Invalid team configuration");
  if (!entries.length)
    return { configured: false, members: [], partial: false };
  if (
    !env.DISCORD_BOT_TOKEN ||
    (env.DISCORD_GUILD_ID && !snowflake(env.DISCORD_GUILD_ID))
  )
    throw new Error("Missing Discord configuration");
  const users = new Map();
  const ids = [...new Set(entries.map((member) => member.id))];
  const authorization = `Bot ${env.DISCORD_BOT_TOKEN}`;
  for (let i = 0; i < ids.length; i += 5) {
    if (i) await new Promise((resolve) => setTimeout(resolve, 300));
    await Promise.all(ids.slice(i, i + 5).map(async (id) => {
      const result = await Promise.allSettled([
        discordRequest(`/users/${id}`, authorization),
        env.DISCORD_GUILD_ID
          ? discordRequest(`/guilds/${env.DISCORD_GUILD_ID}/members/${id}`, authorization)
          : Promise.resolve(null),
      ]);
      users.set(id, result);
    }));
  }
  const profiles = await Promise.allSettled(
    entries.map(async (member) => {
      const guildId = env.DISCORD_GUILD_ID;
      const results = users.get(member.id);
      if (results.some((result) => result.status !== "fulfilled")) throw new Error("Discord profile unavailable");
      const [profile, data] = results.map((result) => result.value);
      if (guildId && data?.user?.id !== member.id)
        throw new Error("Mismatched Discord member");
      const user = publicUser(
        profile,
        data,
        guildId,
      );
      if (user.id !== member.id) throw new Error("Mismatched Discord user");
      const imageHash = (value) =>
        typeof value === "string" && /^(a_)?[a-f0-9]{32}$/.test(value);
      const banner = imageHash(profile.banner) ? profile.banner : null;
      const decoration = profile.avatar_decoration_data?.asset;
      const primaryGuild = profile.primary_guild;
      return {
        ...user,
        handle: `@${user.username}`,
        role: member.role.trim(),
        division: (member.division || member.role).trim(),
        bio: (member.bio || "").slice(0, 500),
        banner: banner
          ? `https://cdn.discordapp.com/banners/${user.id}/${banner}.${banner.startsWith("a_") ? "gif" : "webp"}?size=1024`
          : null,
        accentColor: Number.isInteger(profile.accent_color) && profile.accent_color >= 0 && profile.accent_color <= 0xffffff
          ? `#${profile.accent_color.toString(16).padStart(6, "0")}`
          : null,
        avatarDecoration: imageHash(decoration)
          ? `https://cdn.discordapp.com/avatar-decoration-presets/${decoration}.png?size=240&passthrough=true`
          : null,
        guildTag: primaryGuild?.identity_enabled === true && typeof primaryGuild.tag === "string"
          ? primaryGuild.tag.slice(0, 10)
          : null,
      };
    }),
  );
  const members = profiles
    .filter((result) => result.status === "fulfilled")
    .map((result) => result.value);
  if (!members.length) throw new Error("Team unavailable");
  return {
    configured: true,
    members,
    partial: members.length !== entries.length,
  };
}

export async function cachedTeam() {
  if (cached && cached.until > Date.now()) return cached.value;
  if (!loading)
    loading = getTeam()
      .then((value) => {
        cached = { value, until: Date.now() + 60000 };
        return value;
      })
      .finally(() => {
        loading = null;
      });
  return loading;
}
