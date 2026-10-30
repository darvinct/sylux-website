import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";

// Official Satoshi variable WOFF2 from Fontshare. Keep the font unmodified.
// The binary is self-hosted by the website, not redistributed in this repository.
const source = "https://cdn.fontshare.com/wf/NWBQYJIM7GCZ5XWD7D26ARB3VDY55ZRT/K63EV2KZIGKLE7RANQ2U42S6SVHU5RJ7/X6XYTKIVDUW7GZTZPZNN4EUM5KH54KHF.woff2";
const expected = "e739aff9b4d02c264341d6d4872edcda28e79373aeda936f659566a1cd3eb47f";
const destination = new URL("../public/fonts/satoshi-variable.woff2", import.meta.url);
const digest = (bytes) => createHash("sha256").update(bytes).digest("hex");

let cached;
try {
  cached = await readFile(destination);
} catch (error) {
  if (error.code !== "ENOENT") throw error;
}

if (cached && digest(cached) === expected) {
  console.log("Satoshi font ready (local cache).");
} else {
  const response = await fetch(source, { signal: AbortSignal.timeout(30000) });
  if (!response.ok) throw new Error(`Could not download Satoshi: HTTP ${response.status}`);
  const bytes = Buffer.from(await response.arrayBuffer());
  if (bytes.toString("ascii", 0, 4) !== "wOF2" || digest(bytes) !== expected)
    throw new Error("Satoshi font does not match the official pinned file.");
  await mkdir(new URL("../public/fonts/", import.meta.url), { recursive: true });
  await writeFile(destination, bytes);
  console.log("Satoshi font ready (official Fontshare file).");
}
