import { json, noStore } from "../server/discord.mjs";
import { cachedTeam } from "../server/team.mjs";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    noStore(res);
    res.setHeader("Allow", "GET");
    return json(res, 405, { error: "method_not_allowed" });
  }
  try {
    // Design previews can show the already-public team without copying bot secrets.
    let data;
    if (process.env.VERCEL_ENV === "preview" && !process.env.DISCORD_BOT_TOKEN) {
      const response = await fetch("https://website-komunitasi.vercel.app/api/team", {
        signal: AbortSignal.timeout(8000),
      });
      if (!response.ok) throw new Error("Published team unavailable");
      data = await response.json();
      if (!Array.isArray(data.members)) throw new Error("Invalid published team");
    } else {
      data = await cachedTeam();
    }
    res.setHeader(
      "Cache-Control",
      data.partial
        ? "no-store"
        : "public, max-age=0, s-maxage=60, stale-while-revalidate=120",
    );
    return json(res, 200, data);
  } catch {
    noStore(res);
    return json(res, 503, { error: "team_unavailable", members: [] });
  }
}
