import configuredTeam from "./team.json" with { type: "json" };
import { discordRequest, publicUser, snowflake } from "./discord.mjs";

// ponytail: cache per function instance; Vercel CDN also caches public profiles.
let cached = null;
let loading = null;

export async function getTeam(entries = configuredTeam, env = process.env) {
  if (
    !Array.isArray(entries) ||
    entries.length > 30 ||
    entries.some(
      (m) =>
        !snowflake(m.id) ||
        typeof m.role !== "string" ||
        !m.role.trim() ||
        m.role.length > 60 ||
        (m.bio != null && typeof m.bio !== "string"),
    ) ||
    new Set(entries.map((m) => m.id)).size !== entries.length
  )
    throw new Error("Invalid team configuration");
  if (!entries.length)
    return { configured: false, members: [], partial: false };
  if (
    !env.DISCORD_BOT_TOKEN ||
    (env.DISCORD_GUILD_ID && !snowflake(env.DISCORD_GUILD_ID))
  )
    throw new Error("Missing Discord configuration");
  const profiles = await Promise.allSettled(
    entries.map(async (member) => {
      const guildId = env.DISCORD_GUILD_ID;
      const data = await discordRequest(
        guildId
          ? `/guilds/${guildId}/members/${member.id}`
          : `/users/${member.id}`,
        `Bot ${env.DISCORD_BOT_TOKEN}`,
      );
      const user = publicUser(
        guildId ? data.user : data,
        guildId ? data : null,
        guildId,
      );
      if (user.id !== member.id) throw new Error("Mismatched Discord user");
      return {
        ...user,
        handle: `@${user.username}`,
        role: member.role.trim(),
        bio: (member.bio || "").slice(0, 500),
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
