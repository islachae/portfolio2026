"use client";

import { useEffect, useRef } from "react";

// ── Scroll fade ──────────────────────────────────────────────────────
// Fades the child out as it scrolls up past the top of the viewport
// (vivian-style "i'm vivian" hero fade). `fadeRange` = fraction of the
// viewport height over which the fade completes. Respects reduced-motion.

export default function ScrollFade({
  children,
  className = "",
  fadeRange = 0.35,
}: {
  children: React.ReactNode;
  className?: string;
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
      const opacity = Math.max(0, Math.min(1, 1 + rect.top / (vh * fadeRange)));
      el.style.opacity = String(opacity);
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
  }, [fadeRange]);

  return (
    <div ref={ref} className={className} style={{ willChange: "opacity" }}>
      {children}
    </div>
  );
}
