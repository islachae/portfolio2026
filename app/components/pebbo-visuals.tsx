"use client";

import { useState } from "react";

// ── Interactive visuals for the Pebbo case study ──────────────────────
// Native HTML/CSS/SVG (no screenshots), matching the site's periwinkle
// #7c7fbf / soft-blue #f3f1fa system. All interactive.

// Pebbo mood palette (from the PDF: calm=yellow, anxious=purple, depressed=blue)
const MOODS = [
  { key: "calm", label: "calm", color: "#f2c94c", ring: "#e6b93c", face: "happy" },
  { key: "anxious", label: "anxious", color: "#7c7fbf", ring: "#676aab", face: "worried" },
  { key: "depressed", label: "depressed", color: "#5b8dd6", ring: "#4a78bb", face: "sad" },
] as const;

function Face({ mood, size = 40 }: { mood: "happy" | "worried" | "sad"; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <circle cx="16" cy="19" r="3.2" fill="#1a1a1a" />
      <circle cx="32" cy="19" r="3.2" fill="#1a1a1a" />
      {mood === "happy" && (
        <path d="M13 30c3.2 4.4 6.4 6.6 11 6.6S31.8 34.4 35 30" stroke="#1a1a1a" strokeWidth="3" strokeLinecap="round" />
      )}
      {mood === "worried" && (
        <path d="M14 32c2.6-2 5.2-3 10-3s7.4 1 10 3" stroke="#1a1a1a" strokeWidth="3" strokeLinecap="round" />
      )}
      {mood === "sad" && (
        <path d="M15 33c3.2-3.4 6.4-5 9-5s5.8 1.6 9 5" stroke="#1a1a1a" strokeWidth="3" strokeLinecap="round" />
      )}
      {mood === "worried" && (
        <path d="M11 14l7 3M37 14l-7 3" stroke="#1a1a1a" strokeWidth="2.6" strokeLinecap="round" />
      )}
    </svg>
  );
}

// 1) Interactive Pebbo device — click to cycle mood, squeeze for haptic pulse.
export function PebboDevice() {
  const [idx, setIdx] = useState(0);
  const [squeezing, setSqueezing] = useState(false);
  const mood = MOODS[idx];

  return (
    <div className="flex flex-col items-center gap-4">
      <button
        type="button"
        onClick={() => setIdx((i) => (i + 1) % MOODS.length)}
        onMouseDown={() => setSqueezing(true)}
        onMouseUp={() => setTimeout(() => setSqueezing(false), 220)}
        onMouseLeave={() => setSqueezing(false)}
        aria-label={`Pebbo device, ${mood.label} mood. Click to change mood.`}
        className="group relative grid h-44 w-40 place-items-center rounded-[50%] border border-black/5 shadow-[0_14px_28px_-10px_rgba(20,20,34,0.35)] transition-all duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1a1a1a]"
        style={{ background: `radial-gradient(circle at 35% 30%, ${mood.color}, ${mood.ring})` }}
      >
        {/* carabiner clip */}
        <span aria-hidden="true" className="absolute -top-3 left-1/2 h-6 w-3 -translate-x-1/2 rounded-full border border-black/10 bg-white/70" />
        {/* mic dot */}
        <span aria-hidden="true" className="absolute top-6 h-1.5 w-1.5 rounded-full bg-white/80" />
        {/* face screen */}
        <span className="grid h-16 w-16 place-items-center rounded-2xl bg-white/95 shadow-inner transition-transform duration-200" style={{ transform: squeezing ? "scale(0.88)" : "scale(1)" }}>
          <Face mood={mood.face} />
        </span>
        {/* squeeze ripple */}
        {squeezing && (
          <span aria-hidden="true" className="absolute inset-0 animate-ping rounded-[50%] border-2 border-white/60" />
        )}
      </button>
      <p className="text-xs text-[var(--muted)]">
        mood-reactive LED · <span className="font-medium" style={{ color: mood.ring }}>{mood.label}</span> · click to cycle, hold to squeeze
      </p>
    </div>
  );
}

// Static pebble visual for the home work card (non-interactive).
export function PebboVisual() {
  return (
    <div className="flex aspect-[4/3] items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-[#fdf6ec] to-[#f3f1fa]">
      <div className="grid h-28 w-24 place-items-center rounded-[50%] bg-gradient-to-br from-[#f2c94c] to-[#e6b93c] shadow-[0_10px_20px_-8px_rgba(20,20,34,0.4)]">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/95 shadow-inner">
          <Face mood="happy" size={28} />
        </span>
      </div>
    </div>
  );
}

// 2) Emotional Eating Loop — interactive cycle (click a stage to focus).
const LOOP = [
  { key: "stress", label: "Stress", body: "Daily pressure builds and food becomes an emotional release valve." },
  { key: "restrict", label: "Restrict", body: "Guilt drives restrictive rules — 'I shouldn't have eaten that.'" },
  { key: "guilt", label: "Guilt", body: "Slipping up triggers shame and self-blame rather than compassion." },
  { key: "binge", label: "Binge eating", body: "Restriction backfires into overeating, feeding the next wave of stress." },
];

export function EatingLoop() {
  const [active, setActive] = useState(0);
  const stage = LOOP[active];

  return (
    <div className="rounded-2xl border border-solid border-[var(--border)] bg-white p-6">
      <div className="flex flex-wrap items-center gap-2">
        {LOOP.map((s, i) => (
          <div key={s.key} className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActive(i)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${
                i === active
                  ? "bg-[var(--periwinkle)] text-white"
                  : "border border-solid border-[var(--border)] text-[var(--muted)] hover:border-[var(--periwinkle)] hover:text-[var(--fg)]"
              }`}
            >
              {s.label}
            </button>
            {i < LOOP.length - 1 && (
              <span aria-hidden="true" className="text-[var(--muted)]">→</span>
            )}
          </div>
        ))}
        <span aria-hidden="true" className="ml-1 text-[var(--muted)]">↻ loops back to stress</span>
      </div>
      <div className="mt-5 rounded-xl bg-[var(--soft-blue)] px-5 py-4">
        <p className="text-sm font-medium">{stage.label}</p>
        <p className="mt-1 text-sm leading-relaxed text-[var(--muted)]">{stage.body}</p>
      </div>
    </div>
  );
}

// 3) Tabbed app screens — Home / Chat / Summary.
const SCREENS = {
  home: {
    title: "Home",
    eyebrow: "Today's nudge",
    prompt: "What kind of taste feels right for today?",
    chips: ["log", "explore", "quest", "peek"],
  },
  chat: {
    title: "Chat",
    eyebrow: "Converse with Pebbo",
    prompt: "I keep craving sweets after long days…",
    chips: ["log", "explore"],
  },
  summary: {
    title: "Summary",
    eyebrow: "Mood insights",
    prompt: "Happiness 32% · Melancholy 32% this month",
    chips: ["monthly", "daily", "yearly"],
  },
};

export function PebboAppTabs() {
  const [tab, setTab] = useState<keyof typeof SCREENS>("home");
  const screen = SCREENS[tab];

  return (
    <div className="mx-auto w-full max-w-[280px]">
      <div className="overflow-hidden rounded-[28px] border border-solid border-[var(--border)] bg-white shadow-[0_18px_40px_-16px_rgba(20,20,34,0.35)]">
        {/* phone top */}
        <div className="flex items-center justify-between px-5 pt-3 text-[10px] text-[var(--muted)]">
          <span>9:41</span>
          <span className="h-4 w-16 rounded-full bg-black/85" aria-hidden="true" />
        </div>
        {/* app header */}
        <div className="px-5 pt-3">
          <div className="flex items-baseline justify-between">
            <p className="text-[10px] font-medium uppercase tracking-widest text-[var(--periwinkle)]">{screen.eyebrow}</p>
            <span className="text-[10px] text-[var(--muted)]">pebbo</span>
          </div>
        </div>
        {/* content */}
        <div className="px-5 py-4">
          <div className="rounded-2xl bg-[var(--soft-blue)] p-4">
            <p className="text-sm font-medium leading-snug">{screen.prompt}</p>
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {screen.chips.map((c) => (
              <span key={c} className="rounded-full border border-solid border-[var(--border)] px-2.5 py-1 text-[10px] text-[var(--muted)]">
                {c}
              </span>
            ))}
          </div>
        </div>
        {/* bottom tab bar */}
        <div className="grid grid-cols-3 border-t border-solid border-[var(--border)]">
          {(["home", "chat", "summary"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`py-2.5 text-xs font-medium transition-colors ${
                tab === t ? "text-[var(--periwinkle)]" : "text-[var(--muted)] hover:text-[var(--fg)]"
              }`}
            >
              {SCREENS[t].title}
            </button>
          ))}
        </div>
      </div>
      <p className="mt-3 text-center text-xs text-[var(--muted)]">tap tabs to explore the app</p>
    </div>
  );
}

// 4) "Check AI reason" — expandable explainability panel.
export function AIReasonPanel() {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-2xl border border-solid border-[var(--border)] bg-white p-5">
      <div className="rounded-xl bg-[var(--soft-blue)] px-4 py-3">
        <p className="text-sm">
          &ldquo;Take 1 minute to remember how that first bite tasted. What did it remind you of?&rdquo;
        </p>
      </div>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-[var(--periwinkle)] transition-colors hover:text-[var(--fg)]"
      >
        <span aria-hidden="true">{open ? "−" : "+"}</span> Check AI reason
      </button>
      {open && (
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {[
            { k: "Pattern", v: "Evening cravings after high workload" },
            { k: "Frequency", v: "4× this week" },
            { k: "Impact", v: "medium stress → calm" },
          ].map((r) => (
            <div key={r.k} className="rounded-xl border border-solid border-[var(--border)] p-3">
              <p className="text-xs text-[var(--muted)]">{r.k}</p>
              <p className="mt-1 text-sm font-medium">{r.v}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
