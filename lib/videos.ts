// URLs are uploaded to Vercel Blob by scripts/upload-videos.mjs.
// To regenerate: run `node scripts/upload-videos.mjs` and paste output here.

export const videos = {
  hero: {
    src: "https://zwwcibgxnx5sloys.public.blob.vercel-storage.com/videos/hero-contested-logistics.mp4",
    poster:
      "https://zwwcibgxnx5sloys.public.blob.vercel-storage.com/videos/hero-contested-logistics.poster.jpg",
  },
  approach: {
    src: "https://zwwcibgxnx5sloys.public.blob.vercel-storage.com/videos/approach-decision-layer.mp4",
    poster:
      "https://zwwcibgxnx5sloys.public.blob.vercel-storage.com/videos/approach-decision-layer.poster.jpg",
  },
  demoIntro: {
    src: "https://zwwcibgxnx5sloys.public.blob.vercel-storage.com/videos/demo-command-center.mp4",
    poster:
      "https://zwwcibgxnx5sloys.public.blob.vercel-storage.com/videos/demo-command-center.poster.jpg",
  },
} as const;
