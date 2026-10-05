import type { MetadataRoute } from "next";

// Written out as /robots.txt at build time (the site is a static export)
export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: "https://chaewon.works/sitemap.xml",
  };
}
