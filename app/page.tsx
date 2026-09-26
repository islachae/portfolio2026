import { Suspense } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import SiteHeader from "./components/site-header";
import SiteFooter from "./components/site-footer";
import LocalTime from "./components/local-time";
import ParallaxImage from "./components/parallax-image";
import TippingVisual from "./components/tipping-visual";
import { PebboVisual } from "./components/pebbo-visuals";
import { ZipflowHeroVisual } from "./components/zipflow-visual";
import RevealOnScroll from "./components/reveal-on-scroll";
import ShaderHero from "./components/shader-hero";
import { workProjects } from "./data";

export const metadata: Metadata = {
  title: "Chaewon Lim — Product Designer",
  description:
    "Research-driven product designer combining craft, systems thinking, and AI to transform complex information into clear, scalable digital experiences. MDES candidate at Carnegie Mellon University.",
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><circle cx='50' cy='50' r='46' fill='%231a1a1a'/><text x='50' y='68' text-anchor='middle' dominant-baseline='auto' font-size='52' font-family='PingFang SC, Noto Sans SC, system-ui' fill='white'>採</text></svg>",
  },
};

export default function Home() {
  return (
    <div className="portfolio-shell min-h-screen">
      <ShaderHero />
      {/* ── Header ─────────────────────────────────────────────────── */}
      <SiteHeader />

      <main className="portfolio-hero px-6 sm:px-10">
        <section className="hero-copy">
          <h1>
            <span className="block">Chaewon is a designer and thinker</span>
            <span className="block">who shapes trust in AI into intuitive interactions</span>
          </h1>
        </section>

        {/* ── Status row: metadata + availability dot inline ───────── */}
        <div className="mt-10 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-[var(--muted)]">
          <span>Carnegie Mellon Univ. — MDES</span>
          <span aria-hidden="true">·</span>
          <span>NYC</span>
          <span aria-hidden="true">·</span>
          <Suspense fallback={<span className="font-mono text-xs">00:00:00</span>}>
            <LocalTime />
          </Suspense>
          <span className="group relative inline-flex items-center">
            <span className="availability-dot inline-block h-2.5 w-2.5 rounded-full bg-[var(--green)]" aria-hidden="true" />
            <span className="pointer-events-none absolute left-full top-1/2 ml-2.5 -translate-y-1/2 whitespace-nowrap rounded-full border border-solid border-[var(--border)] bg-white px-3.5 py-1.5 text-xs font-medium text-[var(--muted)] opacity-0 shadow-sm transition-opacity duration-200 group-hover:opacity-100">
              available for 2027 summer internship
            </span>
          </span>
        </div>
      </main>

      {/* ── Work ───────────────────────────────────────────────────── */}
      <section
        id="work"
        className="px-6 pt-32 pb-16 sm:px-10"
      >
        <div className="mb-10 flex items-baseline justify-between">
          <h2 className="text-2xl font-medium tracking-tight">Work</h2>
          <span className="text-sm text-[var(--muted)]">
            {workProjects.length} projects
          </span>
        </div>

        <div className="project-grid grid grid-cols-1 gap-x-8 gap-y-10 md:grid-cols-2">
          {workProjects.map((p, i) => (
            <RevealOnScroll key={p.title} delay={i * 90}>
              <Link
                href={p.link}
                aria-label={`View case study: ${p.title}`}
                className="project-card group relative block"
              >
                <div className="relative overflow-hidden rounded-[20px] border border-solid border-[#e8e8e8] bg-[#fffaf8]">
                  {p.link === "/case-studies/tipping" ? (
                    <img
                      src="/case-studies/tipping-thumb.png"
                      alt={p.title}
                      className="aspect-[678/368] w-full object-cover"
                    />
                  ) : p.link === "/case-studies/pebbo" ? (
                    <img
                      src="/case-studies/pebbo-thumb.png"
                      alt={p.title}
                      className="aspect-[678/368] w-full object-cover"
                    />
                  ) : p.link === "/case-studies/zipflow" ? (
                    <img
                      src="/case-studies/zipflow-thumb.png"
                      alt={p.title}
                      className="aspect-[678/368] w-full object-cover"
                    />
                  ) : (
                    <ParallaxImage src={p.image} alt={p.title} />
                  )}
                  <span className="absolute right-3 top-3 z-10 rounded-full border border-solid border-[#e8e8e8] bg-white/85 px-3 py-0.5 text-[16px] font-medium leading-[24.3px] tracking-[-0.45px] text-[var(--fg)]">
                    {p.type}
                  </span>
                </div>

                <div className="mt-4">
                  <h3 className="text-[18px] font-medium leading-[24.3px] tracking-[-0.45px] text-[var(--fg)]">
                    {p.title}
                  </h3>
                  <div className="mt-1 flex items-baseline justify-between gap-4">
                    <p className="text-[14px] leading-[20px] text-[var(--muted)]">{p.tag}</p>
                    <p className="shrink-0 text-[14px] leading-[20px] text-[var(--muted)]">{p.readTime}</p>
                  </div>
                </div>
              </Link>
            </RevealOnScroll>
          ))}
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────── */}
      <SiteFooter />
    </div>
  );
}
