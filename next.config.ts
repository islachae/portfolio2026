import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Images served from /public — no external domains, no loader needed.
  images: {
    remotePatterns: [],
  },
};

export default nextConfig;
