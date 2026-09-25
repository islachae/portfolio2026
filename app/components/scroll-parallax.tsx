"use client";

import { useEffect, useRef } from "react";

// ── Scroll parallax ──────────────────────────────────────────────────
// Shifts the child vertically at a slightly different rate than the page
// as you scroll (vivian-style subtle depth). `speed` = max shift in px.
// Disabled for reduced-motion; uses transform so layout never reflows.

export default function ScrollParallax({
  children,
  speed = 20,
  className = "",
  fade = true,
  fadeRange = 0.4,
}: {
  children: React.ReactNode;
  speed?: number;
  className?: string;
  fade?: boolean;
  fadeRange?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    const update = () => {
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const progress =
        (rect.top + rect.height / 2 - vh / 2) / (vh / 2 + rect.height / 2);
      const clamped = Math.max(-1, Math.min(1, progress));
      el.style.transform = `translate3d(0, ${(clamped * speed).toFixed(2)}px, 0)`;
      if (fade) {
        const opacity = Math.max(0, Math.min(1, 1 + rect.top / (vh * fadeRange)));
        el.style.opacity = String(opacity);
      }
    };
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [speed, fade, fadeRange]);

  return (
    <div
      ref={ref}
      className={`will-change-transform ${className}`}
      style={{ willChange: fade ? "transform, opacity" : "transform" }}
    >
      {children}
    </div>
  );
}
