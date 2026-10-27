import { getCommunity } from "../server/community.mjs";
import { json, noStore } from "../server/discord.mjs";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    noStore(res);
    res.setHeader("Allow", "GET");
    return json(res, 405, { error: "method_not_allowed" });
  }
  try {
    const data = await getCommunity();
    res.setHeader("Cache-Control", "public, max-age=15, s-maxage=60, stale-while-revalidate=60");
    return json(res, 200, data);
  } catch {
    noStore(res);
    return json(res, 503, { error: "community_unavailable" });
  }
}
