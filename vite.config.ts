import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { discordSharePlugin } from "./scripts/share.mjs";

export default defineConfig({
  plugins: [react(), discordSharePlugin()],
  server: { proxy: { "/api": "http://127.0.0.1:3001" } },
  preview: { proxy: { "/api": "http://127.0.0.1:3001" } },
});
