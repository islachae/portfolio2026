import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Fully static site: deploy the `out/` folder anywhere (Vercel, Netlify, GitHub Pages).
  output: "export",
  images: { unoptimized: true },
  trailingSlash: true,
  // Only for the shareable preview build (relative asset paths). Real deploys leave this unset.
  ...(process.env.PREVIEW_BUILD ? { assetPrefix: "./site" } : {}),
};

export default nextConfig;
