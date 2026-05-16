// Uploads the 3 compressed videos + their poster JPGs to Vercel Blob
// and prints the URLs in a copy-pastable TS object for lib/videos.ts.
//
// Requires BLOB_READ_WRITE_TOKEN in .env.local.

import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { put } from "@vercel/blob";

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

if (!process.env.BLOB_READ_WRITE_TOKEN) {
  console.error("Missing BLOB_READ_WRITE_TOKEN in .env.local");
  process.exit(1);
}

const SLUGS = [
  "hero-contested-logistics",
  "approach-decision-layer",
  "demo-command-center",
];

const result = {};
for (const slug of SLUGS) {
  for (const ext of ["mp4", "poster.jpg"]) {
    const localPath = join(ROOT, "public", "videos", `${slug}.${ext}`);
    if (!existsSync(localPath)) {
      console.error(`✗ missing ${localPath}`);
      continue;
    }
    const buf = readFileSync(localPath);
    const contentType = ext === "mp4" ? "video/mp4" : "image/jpeg";
    const blob = await put(`videos/${slug}.${ext}`, buf, {
      access: "public",
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType,
      cacheControlMaxAge: 60 * 60 * 24 * 365,
    });
    const key = ext === "mp4" ? slug : `${slug}.poster`;
    result[key] = blob.url;
    console.log(`✓ ${slug}.${ext} -> ${blob.url} (${(buf.length / 1024 / 1024).toFixed(2)} MB)`);
  }
}

console.log("\n--- Paste into lib/videos.ts ---\n");
console.log(`export const videos = ${JSON.stringify(result, null, 2)} as const;`);
