"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { reducedMotion } from "../shell-context";
import { useScrollRoot } from "./CasePage";

/* Shared building blocks for the case studies (Tipping, Pebbo). */


/** True once the element has scrolled into view (inside the case study's own scroller). */
export function useInView<T extends Element>(threshold = 0.35) {
  const ref = useRef<T>(null);
  const root = useScrollRoot();
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || seen || !root) return;
    if (typeof IntersectionObserver === "undefined") {
      setSeen(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setSeen(true);
          io.disconnect();
        }
      },
      { root, threshold },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [root, seen, threshold]);
  return [ref, seen] as const;
}

/** Counts 0 → value the first time the ref'd element is seen (numbers and their pictures share it). */
export function useCountUp<T extends Element>(value: number, threshold = 0.6, decimals = 0) {
  const [ref, seen] = useInView<T>(threshold);
  const [shown, setShown] = useState(0);
  useEffect(() => {
    if (!seen) return;
    if (reducedMotion()) {
      setShown(value);
      return;
    }
    let raf = 0;
    const t0 = performance.now();
    const tick = (t: number) => {
      const k = Math.min(1, (t - t0) / 1200);
      const f = 10 ** decimals;
      setShown(Math.round(value * (1 - Math.pow(1 - k, 3)) * f) / f);
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [seen, value, decimals]);
  return [ref, shown] as const;
}

/** The animated digits; screen readers get the final value. */
export function Num({
  shown,
  value,
  suffix = "",
  prefix = "",
  decimals = 0,
}: {
  shown: number;
  value: number;
  suffix?: string;
  prefix?: string;
  decimals?: number;
}) {
  return (
    <span className="cs-count">
      <span aria-hidden>
        {prefix}
        {shown.toFixed(decimals)}
        {suffix}
      </span>
      <span className="sr-only">
        {prefix}
        {value.toFixed(decimals)}
        {suffix}
      </span>
    </span>
  );
}

/** A number that counts up the first time it's seen. */
export function CountUp({ value, suffix = "" }: { value: number; suffix?: string }) {
  const [ref, shown] = useCountUp<HTMLSpanElement>(value);
  return (
    <span ref={ref}>
      <Num shown={shown} value={value} suffix={suffix} />
    </span>
  );
}

/* Numbers as pictures: people that fill in as the number counts */
const Person = ({ on }: { on: boolean }) => (
  <svg viewBox="0 0 16 20" className="cs-person" data-on={on || undefined} aria-hidden>
    <circle cx="8" cy="4.5" r="3.6" />
    <path d="M1 20v-3.2A6.6 6.6 0 0 1 7.6 10.2h.8A6.6 6.6 0 0 1 15 16.8V20Z" />
  </svg>
);
export function People({ of, filled, className = "" }: { of: number; filled: number; className?: string }) {
  return (
    <span className={`cs-people ${className}`} aria-hidden>
      {Array.from({ length: of }, (_, i) => (
        <Person key={i} on={i < filled} />
      ))}
    </span>
  );
}
export function DotGrid({ filled }: { filled: number }) {
  return (
    <span className="cs-grid100" aria-hidden>
      {Array.from({ length: 100 }, (_, i) => (
        <span key={i} data-on={i < filled || undefined} />
      ))}
    </span>
  );
}

/** Scroll the case study so `el` sits just under the bar. */
export function scrollToEl(root: HTMLElement, el: HTMLElement, offset = 88) {
  const top = el.getBoundingClientRect().top - root.getBoundingClientRect().top + root.scrollTop - offset;
  root.scrollTo({ top, behavior: reducedMotion() ? "auto" : "smooth" });
}

export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));

/** 0 when a sticky frame first sticks, 1 when its scene lets it go. */
export function useStickyProgress(scene: React.RefObject<HTMLElement | null>, frame: React.RefObject<HTMLElement | null>) {
  const root = useScrollRoot();
  const [p, setP] = useState(0);
  useEffect(() => {
    if (!root) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const el = scene.current;
      const fr = frame.current;
      if (!el || !fr) return;
      const top = el.getBoundingClientRect().top - root.getBoundingClientRect().top;
      const stick = parseFloat(getComputedStyle(fr).top) || 0;
      const total = el.offsetHeight - fr.offsetHeight;
      setP(total > 0 ? clamp((stick - top) / total) : 0);
    };
    const on = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    root.addEventListener("scroll", on, { passive: true });
    window.addEventListener("resize", on);
    return () => {
      root.removeEventListener("scroll", on);
      window.removeEventListener("resize", on);
      cancelAnimationFrame(raf);
    };
  }, [root, scene, frame]);
  return p;
}

/**
 * How far an element has travelled up the case study's view: 0 while its top is still at
 * `from` (a fraction of the view height from the top), 1 once it reaches `to`.
 * Reduced motion jumps straight to 1.
 */
export function useScrollProgress<T extends HTMLElement>(from = 0.9, to = 0.35) {
  const ref = useRef<T>(null);
  const root = useScrollRoot();
  const [p, setP] = useState(0);
  useEffect(() => {
    if (!root) return;
    if (reducedMotion()) {
      setP(1);
      return;
    }
    let raf = 0;
    const update = () => {
      raf = 0;
      const el = ref.current;
      if (!el) return;
      const r = root.getBoundingClientRect();
      const top = el.getBoundingClientRect().top - r.top;
      const h = root.clientHeight;
      setP(clamp((h * from - top) / (h * (from - to))));
    };
    const on = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    root.addEventListener("scroll", on, { passive: true });
    window.addEventListener("resize", on);
    return () => {
      root.removeEventListener("scroll", on);
      window.removeEventListener("resize", on);
      cancelAnimationFrame(raf);
    };
  }, [root, from, to]);
  return [ref, p] as const;
}

/**
 * Progress through a tall element: 0 when its top meets the line `at` (fraction of the view from
 * the top), 1 when its bottom does. Also reports the fraction where each `[data-mark]` child sits,
 * so markers along the way can light up as the line passes them. Reduced motion: 1.
 */
export function useScrollThrough<T extends HTMLElement>(at = 0.6) {
  const ref = useRef<T>(null);
  const root = useScrollRoot();
  const [state, setState] = useState<{ p: number; marks: number[] }>({ p: 0, marks: [] });
  useEffect(() => {
    if (!root) return;
    const still = reducedMotion();
    let raf = 0;
    const update = () => {
      raf = 0;
      const el = ref.current;
      if (!el) return;
      const top = el.getBoundingClientRect().top - root.getBoundingClientRect().top;
      const h = el.offsetHeight || 1;
      const marks = Array.from(el.querySelectorAll<HTMLElement>("[data-mark]")).map((m) => (m.getBoundingClientRect().top - el.getBoundingClientRect().top) / h);
      const p = still ? 1 : clamp((root.clientHeight * at - top) / h);
      setState((s) => (s.p === p && s.marks.join() === marks.join() ? s : { p, marks }));
    };
    const on = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    root.addEventListener("scroll", on, { passive: true });
    window.addEventListener("resize", on);
    return () => {
      root.removeEventListener("scroll", on);
      window.removeEventListener("resize", on);
      cancelAnimationFrame(raf);
    };
  }, [root, at]);
  return [ref, state.p, state.marks] as const;
}

/** Headline lines: stacked on wide screens, flowing together on phones. */
export function Lines({ lines }: { lines: string[] }) {
  return (
    <>
      {lines.map((l, i) => (
        <span key={i} className="cs-l">
          {l}
          {i < lines.length - 1 ? " " : ""}
        </span>
      ))}
    </>
  );
}

export function Section({
  id,
  label,
  children,
  className = "",
}: {
  id?: string;
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`cs-sec ${className}`} id={id} aria-label={label}>
      <p className="cs-eyebrow">{label}</p>
      {children}
    </section>
  );
}

export const Check = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden className="cs-check">
    <circle cx="12" cy="12" r="9" />
    <path d="M8.5 12.5l2.5 2.5 4.5-5" />
  </svg>
);

export type TakeawaysData = {
  label: string;
  items: readonly { title: string; text: string; evidence: { id: string; label: string } }[];
  back: string;
};

/** Takeaways, each with a link up to the part of the case that shows it (and a way back down). */
export function Takeaways({ t }: { t: TakeawaysData }) {
  const root = useScrollRoot();
  const sec = useRef<HTMLElement>(null);
  const links = useRef<(HTMLAnchorElement | null)[]>([]);
  const [from, setFrom] = useState<number | null>(null);
  const armed = useRef(false);
  const timers = useRef<number[]>([]);

  useEffect(() => () => timers.current.forEach((id) => window.clearTimeout(id)), []);

  const go = (e: React.MouseEvent, i: number, id: string) => {
    e.preventDefault();
    const target = document.getElementById(id);
    if (!target || !root) return;
    const rm = reducedMotion();
    scrollToEl(root, target);
    setFrom(i);
    armed.current = false;
    target.removeAttribute("data-flash");
    timers.current.push(
      window.setTimeout(() => {
        target.focus({ preventScroll: true });
        target.setAttribute("data-flash", "");
      }, rm ? 0 : 650),
      window.setTimeout(() => target.removeAttribute("data-flash"), rm ? 2000 : 2800),
      window.setTimeout(() => (armed.current = true), rm ? 50 : 1100),
    );
  };

  const goBack = () => {
    if (from === null || !root) return;
    const link = links.current[from];
    setFrom(null);
    if (!link) return;
    scrollToEl(root, link.closest(".cs-take") as HTMLElement, 160);
    timers.current.push(window.setTimeout(() => link.focus({ preventScroll: true }), reducedMotion() ? 0 : 650));
  };

  // The way back goes away once the reader scrolls back down here on their own
  useEffect(() => {
    if (from === null || !root) return;
    const on = () => {
      const el = sec.current;
      if (armed.current && el && el.getBoundingClientRect().top < root.clientHeight * 0.75) setFrom(null);
    };
    root.addEventListener("scroll", on, { passive: true });
    return () => root.removeEventListener("scroll", on);
  }, [from, root]);

  return (
    <section className="cs-sec cs-sec--takeaways" id="cs-takeaways" ref={sec} aria-label={t.label}>
      <p className="cs-eyebrow">{t.label}</p>
      {t.items.map((it, i) => (
        <div className="cs-take" key={it.title}>
          <h3 className="cs-take-h">{it.title}</h3>
          <p className="cs-body">{it.text}</p>
          <a
            className="cs-take-link"
            href={`#${it.evidence.id}`}
            ref={(el) => {
              links.current[i] = el;
            }}
            onClick={(e) => go(e, i, it.evidence.id)}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden>
              <path d="M12 19V5M6 11l6-6 6 6" />
            </svg>
            {it.evidence.label}
          </a>
        </div>
      ))}
      <AnimatePresence>
        {from !== null && (
          <motion.button
            className="cs-back-pill"
            onClick={goBack}
            initial={{ opacity: 0, y: 16, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: 12, x: "-50%", transition: { duration: 0.15 } }}
            transition={{ duration: 0.28, ease: [0.2, 0.7, 0.2, 1] }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden>
              <path d="M12 5v14M6 13l6 6 6-6" />
            </svg>
            {t.back}
          </motion.button>
        )}
      </AnimatePresence>
    </section>
  );
}
