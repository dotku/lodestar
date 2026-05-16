// Fetches an already-submitted Seedance task by ID, downloads the MP4.
// Usage:  node scripts/fetch-video.mjs <slug> <task_id>
//
// SEEDANCE_API_KEY lives in ~/dev/x-post-scheduler/.env.local (not in
// lodestar's runtime env). Script falls through to that file if needed.

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { homedir } from "node:os";
import { Buffer } from "node:buffer";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

function loadEnvFile(path) {
  if (!existsSync(path)) return;
  const raw = readFileSync(path, "utf8");
  for (const line of raw.split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)$/);
    if (!m) continue;
    if (!process.env[m[1]]) process.env[m[1]] = m[2].replace(/^"|"$/g, "");
  }
}
loadEnvFile(join(ROOT, ".env.local"));
loadEnvFile(join(homedir(), "dev", "x-post-scheduler", ".env.local"));

const SEEDANCE_API_KEY = process.env.SEEDANCE_API_KEY;
if (!SEEDANCE_API_KEY) {
  console.error(
    "Missing SEEDANCE_API_KEY. Set in ~/dev/x-post-scheduler/.env.local or export it.",
  );
  process.exit(1);
}

const slug = process.argv[2];
const taskId = process.argv[3];
if (!slug || !taskId) {
  console.error("Usage: node scripts/fetch-video.mjs <slug> <task_id>");
  process.exit(1);
}

const res = await fetch(
  `https://seedanceapi.org/v1/status?task_id=${encodeURIComponent(taskId)}`,
  { headers: { Authorization: `Bearer ${SEEDANCE_API_KEY}` } },
);
const json = await res.json();
console.log(`Status response: ${JSON.stringify(json, null, 2).slice(0, 2000)}`);

const data = json?.data ?? {};
const response = data.response;
const videoUrl =
  (Array.isArray(response) && typeof response[0] === "string"
    ? response[0]
    : null) ||
  data.video_url ||
  data.output_url;

if (!videoUrl) {
  console.error("Could not extract video URL from response");
  process.exit(2);
}
console.log(`Video URL: ${videoUrl}`);

const mp4Res = await fetch(videoUrl);
if (!mp4Res.ok) {
  console.error(`Download failed ${mp4Res.status}`);
  process.exit(3);
}
const buf = Buffer.from(await mp4Res.arrayBuffer());
const outPath = join(ROOT, "public", "videos", `${slug}.mp4`);
writeFileSync(outPath, buf);
console.log(`✓ saved ${outPath} (${(buf.length / 1024 / 1024).toFixed(2)} MB)`);
