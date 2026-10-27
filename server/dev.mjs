import { createServer } from "node:http";
import auth from "../api/auth/[action].js";
import team from "../api/team.js";
import community from "../api/community.js";

const port = Number(process.env.API_PORT || 3001);
createServer(async (req, res) => {
  try {
    const path = new URL(req.url, "http://localhost").pathname;
    if (/^\/api\/auth\/(login|callback|session|logout)$/.test(path))
      return await auth(req, res);
    if (path === "/api/team") return await team(req, res);
    if (path === "/api/community") return await community(req, res);
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end('{"error":"not_found"}');
  } catch {
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end('{"error":"internal_error"}');
  }
}).listen(port, "127.0.0.1", () =>
  console.log(`Local Discord API: http://localhost:${port}`),
);
