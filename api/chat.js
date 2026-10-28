import { discordRequest, json, noStore } from "../server/discord.mjs";

// This public feed reads only the community's chosen channel.
const channelId = "1415636393211854901";
export default async function handler(req, res) {
  noStore(res);
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return json(res, 405, { error: "method_not_allowed" });
  }
  try {
    if (!process.env.DISCORD_BOT_TOKEN) throw new Error("Missing bot configuration");
    const data = await discordRequest(`/channels/${channelId}/messages?limit=15`, `Bot ${process.env.DISCORD_BOT_TOKEN}`);
    if (!Array.isArray(data)) throw new Error("Invalid response");
    const messages = data.filter((m) => m.type === 0 && !m.author?.bot && typeof m.content === "string" && m.content.trim())
      .slice(0, 5).reverse().map((m) => ({
        id: m.id,
        name: (m.author?.global_name || m.author?.username || "Member").slice(0, 80),
        content: m.content.replace(/<@!?\d+>/g, "@member").replace(/<@&\d+>/g, "@role").replace(/<#\d+>/g, "#channel").slice(0, 500),
        timestamp: m.timestamp,
      }));
    return json(res, 200, { messages });
  } catch {
    return json(res, 503, { error: "chat_unavailable" });
  }
}
