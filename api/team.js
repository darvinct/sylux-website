import { json, noStore } from "../server/discord.mjs";
import { cachedTeam } from "../server/team.mjs";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    noStore(res);
    res.setHeader("Allow", "GET");
    return json(res, 405, { error: "method_not_allowed" });
  }
  try {
    const data = await cachedTeam();
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
