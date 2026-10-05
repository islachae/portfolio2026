import type { MetadataRoute } from "next";

// Written out as /sitemap.xml at build time. The site is one page (the case studies and the play
// pages open inside it, at /#case/…), so there is one address to list, plus the resume.
export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return [
    { url: "https://chaewon.works/", lastModified, priority: 1 },
    { url: "https://chaewon.works/Chaewon-Lim-Resume.pdf", lastModified, priority: 0.5 },
  ];
}
