import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Fully static site: deploy the `out/` folder anywhere (Vercel, Netlify, GitHub Pages).
  output: "export",
  images: { unoptimized: true },
  trailingSlash: true,
  // Only for the shareable preview build (relative asset paths). Real deploys leave this unset.
  ...(process.env.PREVIEW_BUILD ? { assetPrefix: "./site" } : {}),
  // Where “Try Pebbo” asks a live model: the site's own Vercel Function (api/pebbo.js), unless
  // NEXT_PUBLIC_PEBBO_API says otherwise. None in the claude.ai preview, which has Claude itself.
  env: {
    PEBBO_API: process.env.NEXT_PUBLIC_PEBBO_API ?? (process.env.PREVIEW_BUILD ? "" : "/api/pebbo"),
  },
};

export default nextConfig;
