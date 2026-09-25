import { Suspense } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import SiteHeader from "./components/site-header";
import SiteFooter from "./components/site-footer";
import LocalTime from "./components/local-time";
import ParallaxImage from "./components/parallax-image";
import TippingVisual from "./components/tipping-visual";
import { PebboVisual } from "./components/pebbo-visuals";
import RevealOnScroll from "./components/reveal-on-scroll";
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
      {/* ── Header ─────────────────────────────────────────────────── */}
      <SiteHeader />

      <main className="portfolio-hero px-6 sm:px-10">
        <section className="hero-copy">
          <h1 className="max-w-2xl font-medium tracking-tight">
            <span className="block">Chaewon is a designer and thinker who</span>
            <span className="block">
              <sup className="hero-num">1</sup>
              <span className="hero-icon" aria-hidden="true">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#1a1a1a" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
                  <circle cx="12" cy="12" r="3.2" fill="#7c7fbf" stroke="none" />
                </svg>
              </span>{" "}
              brings new perspective,
            </span>
            <span className="block">
              <sup className="hero-num">2</sup>
              <span className="hero-icon" aria-hidden="true">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="9.5" stroke="#1a1a1a" strokeWidth="1.6" />
                  <path d="M12 6.5c.8 3 2.5 4.7 5.5 5.5-3 .8-4.7 2.5-5.5 5.5-.8-3-2.5-4.7-5.5-5.5 3-.8 4.7-2.5 5.5-5.5Z" fill="#7c7fbf" />
                </svg>
              </span>{" "}
              shapes trust in AI, &amp;
            </span>
            <span className="block">
              <sup className="hero-num">3</sup>
              <span className="hero-icon" aria-hidden="true">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="#7c7fbf">
                  <rect x="4" y="14" width="4.4" height="6" rx="1" />
                  <rect x="9.8" y="9" width="4.4" height="11" rx="1" />
                  <rect x="15.6" y="4" width="4.4" height="16" rx="1" />
                </svg>
              </span>{" "}
              crafts intentional experiences that scale.
            </span>
          </h1>
        </section>

        {/* ── Status row: metadata + availability dot inline ───────── */}
        <div className="mt-12 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-[var(--muted)]">
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
        className="border-t border-solid border-[var(--border)] px-6 py-16 sm:px-10"
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
                data-cursor-hover
                className="project-card group relative block rounded-2xl border border-solid border-[var(--border)] bg-white p-6"
              >
                <span className="absolute right-5 top-5 z-10 rounded-full border border-solid border-[var(--border)] bg-white/90 px-3 py-1 text-xs text-[var(--muted)]">
                  {p.type}
                </span>

                {p.link === "/case-studies/tipping" ? (
                  <TippingVisual />
                ) : p.link === "/case-studies/pebbo" ? (
                  <PebboVisual />
                ) : (
                  <ParallaxImage src={p.image} alt={p.title} />
                )}

                <div className="mt-5">
                  <h3 className="text-lg font-medium leading-snug tracking-tight">
                    {p.title}
                  </h3>
                  <p className="mt-1 text-sm text-[var(--muted)]">{p.tag}</p>
                  <p className="mt-1.5 text-xs text-[var(--muted)]">{p.readTime}</p>
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
