// Fetches an already-submitted Seedance task by ID, downloads the MP4.
// Usage:  node scripts/fetch-video.mjs <slug> <task_id>

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { Buffer } from "node:buffer";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

const envPath = join(ROOT, ".env.local");
if (existsSync(envPath)) {
  const raw = readFileSync(envPath, "utf8");
  for (const line of raw.split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)$/);
    if (!m) continue;
    if (!process.env[m[1]]) process.env[m[1]] = m[2].replace(/^"|"$/g, "");
  }
}

const SEEDANCE_API_KEY = process.env.SEEDANCE_API_KEY;
if (!SEEDANCE_API_KEY) {
  console.error("Missing SEEDANCE_API_KEY");
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
