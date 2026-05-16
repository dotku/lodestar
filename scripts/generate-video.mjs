// Generates a single Seedance 2.0 text-to-video clip and downloads the MP4.
// Usage:
//   node scripts/generate-video.mjs hero
//   node scripts/generate-video.mjs approach
//   node scripts/generate-video.mjs demo-intro
//
// Output: public/videos/<slug>.mp4 (+ <slug>.poster.jpg if a poster URL is returned).

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { Buffer } from "node:buffer";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

// --- env loader (no dependency on dotenv) --------------------------------
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
  console.error("SEEDANCE_API_KEY not found in .env.local or environment.");
  process.exit(1);
}
const BASE = "https://seedanceapi.org/v1";

// --- prompts -------------------------------------------------------------
const PROMPTS = {
  hero: {
    slug: "hero-contested-logistics",
    prompt:
      "Cinematic aerial drone shot of a coastal military supply chain at dusk. Stacks of shipping containers at a port, cargo trucks moving along a road. As the camera pans across the landscape, faint blue and amber data overlays trace the supply routes. Several of those route lines flicker, dim, and disconnect mid-flow, suggesting contested logistics under degraded comms. Color palette: deep navy, slate, with thin cyan tactical-display accents. No text overlays. No people in close focus. Slow steady camera movement. Subtle film grain. Anduril and Palantir tactical-display aesthetic.",
    aspect: "16:9",
    duration: 8,
  },
  approach: {
    slug: "approach-decision-layer",
    prompt:
      "Abstract data-flow visualization in a dark cinematic frame. Pale blue and cyan light streams flow from the left side through four glowing vertical pillars (no readable text, only abstract glyph marks). The streams converge into a dense, slowly-pulsing neural-network knot in the center, then radiate outward as recommendation rays toward the right. Background is deep navy with a thin tactical-grid overlay and floating particles. Camera slowly pulls back. Smooth premium UI feel, Anduril Lattice / Palantir Gotham aesthetic. No literal text, no logos, no humans.",
    aspect: "16:9",
    duration: 8,
  },
  "demo-intro": {
    slug: "demo-command-center",
    prompt:
      "Wide cinematic shot of a darkened military command center, soft blue ambient light. A large translucent holographic display dominates the center of the frame, showing abstract supply-chain graphs, pulsing nodes, and route lines refreshing in real time. A single anonymous silhouette stands looking at the display from the lower left. Camera dollies forward slowly. The display redraws as new data arrives. No readable text, no recognizable faces. Cinematic film grain, 35mm anamorphic lens feel. Color palette: deep navy and slate with cyan highlights.",
    aspect: "16:9",
    duration: 8,
  },
};

// --- main ----------------------------------------------------------------
const which = process.argv[2];
if (!which || !PROMPTS[which]) {
  console.error("Usage: node scripts/generate-video.mjs <hero|approach|demo-intro>");
  process.exit(1);
}
const job = PROMPTS[which];

console.log(`▶ Generating "${which}" (${job.slug})`);
console.log(`  prompt: ${job.prompt.slice(0, 120)}…`);

const submitRes = await fetch(`${BASE}/generate`, {
  method: "POST",
  headers: {
    Authorization: `Bearer ${SEEDANCE_API_KEY}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    prompt: job.prompt,
    mode: "text-to-video",
    aspect_ratio: job.aspect,
    resolution: "720p",
    duration: job.duration,
    enable_audio: false,
    lock_camera: false,
  }),
});
const submitJson = await submitRes.json();
if (!submitRes.ok || (submitJson.code !== undefined && submitJson.code !== 200)) {
  console.error("Submit failed:", submitRes.status, JSON.stringify(submitJson));
  process.exit(2);
}
const taskId = submitJson?.data?.task_id ?? submitJson?.data?.id;
if (!taskId) {
  console.error("No task ID returned:", JSON.stringify(submitJson));
  process.exit(2);
}
console.log(`  ✓ task_id: ${taskId}`);

// poll
let videoUrl = null;
let posterUrl = null;
const startedAt = Date.now();
const POLL_INTERVAL_MS = 6000;
const MAX_POLL_MS = 8 * 60 * 1000;

while (Date.now() - startedAt < MAX_POLL_MS) {
  await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
  const res = await fetch(`${BASE}/status?task_id=${encodeURIComponent(taskId)}`, {
    headers: { Authorization: `Bearer ${SEEDANCE_API_KEY}` },
  });
  const json = await res.json();
  const data = json?.data ?? {};
  const status = String(data?.status ?? "").toUpperCase();
  const elapsed = ((Date.now() - startedAt) / 1000).toFixed(0);
  console.log(`  · ${elapsed}s status=${status || "?"}`);

  if (status === "COMPLETED") {
    const outputs = data.outputs || data.video_outputs || data.result?.videos || [];
    const first = Array.isArray(outputs) ? outputs[0] : null;
    videoUrl = first?.video_url || first?.url || data.video_url || data?.result?.video_url;
    posterUrl = first?.poster_url || first?.image_url || data.poster_url || null;
    break;
  }
  if (status === "FAILED") {
    console.error("  ✗ task failed:", JSON.stringify(json));
    process.exit(3);
  }
}

if (!videoUrl) {
  console.error("  ✗ timed out or no video URL");
  process.exit(4);
}
console.log(`  ✓ video URL: ${videoUrl}`);

// download mp4
const mp4Res = await fetch(videoUrl);
if (!mp4Res.ok) {
  console.error(`  ✗ download failed ${mp4Res.status}`);
  process.exit(5);
}
const buf = Buffer.from(await mp4Res.arrayBuffer());
const outPath = join(ROOT, "public", "videos", `${job.slug}.mp4`);
writeFileSync(outPath, buf);
console.log(`  ✓ saved ${outPath} (${(buf.length / 1024 / 1024).toFixed(2)} MB)`);

if (posterUrl) {
  const posterRes = await fetch(posterUrl);
  if (posterRes.ok) {
    const pbuf = Buffer.from(await posterRes.arrayBuffer());
    const posterPath = join(ROOT, "public", "videos", `${job.slug}.poster.jpg`);
    writeFileSync(posterPath, pbuf);
    console.log(`  ✓ saved ${posterPath}`);
  }
}

console.log("✓ done");
