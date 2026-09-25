import type { Metadata } from "next";
import SiteHeader from "../components/site-header";
import SiteFooter from "../components/site-footer";

export const metadata: Metadata = {
  title: "Design System — Chaewon Lim",
  description:
    "The colors, type, spacing, motion, and components behind this site.",
};

const colors = [
  { name: "fg (charcoal)", value: "#1a1a1a", usage: "Body text, headings" },
  { name: "logo charcoal", value: "#2b2b2b", usage: "Logo circle, wordmark" },
  { name: "muted", value: "#8a8a8a", usage: "Secondary text, metadata" },
  { name: "border", value: "#e8e8e8", usage: "Card borders, dividers" },
  { name: "periwinkle", value: "#7c7fbf", usage: "Numbered hero badges, accents" },
  { name: "periwinkle hover", value: "#62659e", usage: "Badge hover state" },
  { name: "green", value: "#3a9d5e", usage: "Availability dot" },
  { name: "soft blue", value: "#f3f1fa", usage: "Background gradient end" },
  { name: "bg", value: "#ffffff", usage: "Page & card surfaces" },
];

const type = [
  { label: "Hero H1", size: "32–48px (clamp)", weight: "450", sample: "Chaewon Lim is a research-driven product designer" },
  { label: "Section heading", size: "24px", weight: "500", sample: "Work" },
  { label: "Card title", size: "18px", weight: "500", sample: "UX/UI Design — Product Detail Pages" },
  { label: "Body", size: "16px", weight: "400", sample: "Designed UI and product detail pages with Figma." },
  { label: "Caption / meta", size: "14px", weight: "400", sample: "Mar 2025 – Apr 2026" },
  { label: "Micro label", size: "12px", weight: "500", sample: "SKILLS & TOOLS" },
];

const spacing = [4, 8, 12, 16, 24, 32, 40, 48, 64, 80, 96];

const motion = [
  { name: "hover / underline", duration: "200ms", easing: "cubic-bezier(0.2,0,0,1)", usage: "Nav underline, badge scale" },
  { name: "card lift", duration: "250ms", easing: "cubic-bezier(0.2,0,0,1)", usage: "Project card hover translateY" },
  { name: "thumbnail zoom", duration: "350ms", easing: "cubic-bezier(0.2,0,0,1)", usage: "Card image scale on hover" },
  { name: "cursor swap", duration: "220ms", easing: "cubic-bezier(0.2,0,0,1)", usage: "Dot → arrow-circle cursor transition" },
  { name: "reveal on scroll", duration: "500–700ms", easing: "ease-out", usage: "Section fade + rise on intersection" },
];

export default function DesignSystem() {
  return (
    <div className="portfolio-shell min-h-screen">
      <SiteHeader />

      <main className="px-6 pb-24 pt-16 sm:px-10">
        <section className="max-w-2xl">
          <p className="text-sm font-medium tracking-widest uppercase text-[var(--muted)]">
            Design System
          </p>
          <h1 className="mt-3 text-4xl font-medium leading-[1.2] tracking-tight sm:text-5xl">
            chaewonlim.com
          </h1>
          <p className="mt-6 leading-relaxed text-[var(--muted)]">
            The colors, type, spacing, motion, and components behind this
            site, kept here as a living reference.
          </p>
        </section>

        {/* ── Color ──────────────────────────────────────────────────── */}
        <section className="mt-16 max-w-3xl border-t border-solid border-[var(--border)] pt-10">
          <h2 className="text-sm font-medium tracking-widest uppercase text-[var(--muted)]">
            Color
          </h2>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {colors.map((c) => (
              <div key={c.name} className="flex items-center gap-4">
                <span
                  className="h-12 w-12 flex-none rounded-xl border border-solid border-[var(--border)]"
                  style={{ backgroundColor: c.value }}
                  aria-hidden="true"
                />
                <div>
                  <p className="text-sm font-medium">{c.name}</p>
                  <p className="font-mono text-xs text-[var(--muted)]">{c.value}</p>
                  <p className="text-xs text-[var(--muted)]">{c.usage}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Typography ─────────────────────────────────────────────── */}
        <section className="mt-16 max-w-3xl border-t border-solid border-[var(--border)] pt-10">
          <h2 className="text-sm font-medium tracking-widest uppercase text-[var(--muted)]">
            Typography — Satoshi
          </h2>
          <div className="mt-6 flex flex-col gap-6">
            {type.map((t) => (
              <div
                key={t.label}
                className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 border-b border-solid border-[var(--border)] pb-5 last:border-b-0 last:pb-0"
              >
                <p
                  style={{ fontSize: t.size.split(/[–—]/)[0].trim(), fontWeight: t.weight }}
                  className="max-w-md leading-snug"
                >
                  {t.sample}
                </p>
                <div className="text-right text-xs text-[var(--muted)]">
                  <p>{t.label}</p>
                  <p className="font-mono">{t.size} · {t.weight}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Spacing ────────────────────────────────────────────────── */}
        <section className="mt-16 max-w-3xl border-t border-solid border-[var(--border)] pt-10">
          <h2 className="text-sm font-medium tracking-widest uppercase text-[var(--muted)]">
            Spacing scale
          </h2>
          <div className="mt-6 flex flex-col gap-3">
            {spacing.map((s) => (
              <div key={s} className="flex items-center gap-4">
                <span className="w-12 flex-none font-mono text-xs text-[var(--muted)]">
                  {s}px
                </span>
                <span
                  className="h-3 rounded-sm bg-[var(--periwinkle)]"
                  style={{ width: `${s * 2}px` }}
                  aria-hidden="true"
                />
              </div>
            ))}
          </div>
        </section>

        {/* ── Motion ─────────────────────────────────────────────────── */}
        <section className="mt-16 max-w-3xl border-t border-solid border-[var(--border)] pt-10">
          <h2 className="text-sm font-medium tracking-widest uppercase text-[var(--muted)]">
            Motion
          </h2>
          <div className="mt-6 flex flex-col gap-4">
            {motion.map((m) => (
              <div
                key={m.name}
                className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-solid border-[var(--border)] pb-4 last:border-b-0 last:pb-0"
              >
                <p className="font-medium">{m.name}</p>
                <p className="text-sm text-[var(--muted)]">{m.usage}</p>
                <p className="font-mono text-xs text-[var(--muted)]">
                  {m.duration} · {m.easing}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Components — buttons & pills ─────────────────────────────── */}
        <section className="mt-16 max-w-3xl border-t border-solid border-[var(--border)] pt-10">
          <h2 className="text-sm font-medium tracking-widest uppercase text-[var(--muted)]">
            Components
          </h2>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <span
              className="inline-flex items-center gap-2 rounded-full border border-solid border-[var(--border)] px-5 py-2 text-sm font-medium transition-colors hover:border-[var(--fg)] hover:text-[var(--fg)]"
            >
              Outline pill
            </span>
            <span
              className="inline-flex items-center gap-2 rounded-full border border-solid border-[var(--border)] px-4 py-2 text-sm text-[var(--fg)]"
            >
              Tag pill
            </span>
            <span className="hero-badge inline-flex items-center justify-center h-7 w-7 rounded-full bg-[var(--periwinkle)] text-white text-xs font-medium cursor-default">
              1
            </span>
            <span className="inline-flex items-center gap-2 text-sm">
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-[var(--green)]" />
              Availability dot
            </span>
          </div>

          <div
            className="project-card mt-6 max-w-sm rounded-2xl border border-solid border-[var(--border)] bg-white p-6"
          >
            <p className="text-sm text-[var(--muted)]">Org · Year</p>
            <h3 className="mt-1 text-lg font-medium tracking-tight">
              Project card
            </h3>
            <p className="mt-2 text-sm text-[var(--muted)]">
              Hover to see the lift, border-color shift, and cursor swap
              used across the Work grid.
            </p>
          </div>
        </section>

        {/* ── Cursor ─────────────────────────────────────────────────── */}
        <section className="mt-16 max-w-3xl border-t border-solid border-[var(--border)] pt-10">
          <h2 className="text-sm font-medium tracking-widest uppercase text-[var(--muted)]">
            Custom cursor
          </h2>
          <p className="mt-5 max-w-lg leading-relaxed text-[var(--muted)]">
            A small faint dot at rest; hovering a{" "}
            <code className="rounded bg-[var(--soft-blue)] px-1.5 py-0.5 font-mono text-xs">
              .project-card
            </code>{" "}
            element swaps it for a white circle with a black arrow. Move
            your mouse over the card above to see it.
          </p>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
