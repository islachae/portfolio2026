"use client";

import { useEffect, useRef } from "react";

// Frosted-glass blobs that trail the cursor, matching vivianzhao.ca's
// glassmorphism cursor effect (verified via DOM inspection): semi-transparent
// white fill + backdrop-blur + soft layered shadow + thin faint border,
// each blob fading in then out as new ones spawn along the pointer path.

const COUNT = 10;
const LIFETIME = 900;
const SIZES = [26, 34, 42, 30, 38, 46, 28, 36, 44, 32];

export default function GlassCursorTrail() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = root.current;
    if (!container) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    const fine = matchMedia("(any-pointer: fine)");
    const blobs = Array.from(container.children) as HTMLElement[];
    const particles = blobs.map(() => ({ x: 0, y: 0, born: -Infinity }));

    let disposed = false;
    let frame = 0;
    let next = 0;
    let last: { x: number; y: number } | null = null;

    const clear = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      last = null;
      particles.forEach((p, i) => { p.born = -Infinity; blobs[i].style.opacity = "0"; });
    };
    const tick = (now: number) => {
      frame = 0;
      if (disposed) return;
      let active = false;
      particles.forEach((p, i) => {
        const age = (now - p.born) / LIFETIME;
        if (age >= 1) { blobs[i].style.opacity = "0"; return; }
        active = true;
        // Fade in fast, fade out slow — matches the observed opacity curve.
        const fade = age < 0.15 ? age / 0.15 : 1 - (age - 0.15) / 0.85;
        blobs[i].style.opacity = String(Math.max(0, fade));
        blobs[i].style.transform = `translate(-50%, -50%) translate(${p.x}px, ${p.y}px)`;
      });
      if (active) frame = requestAnimationFrame(tick);
    };
    const emit = (x: number, y: number) => {
      const p = particles[next];
      p.x = x; p.y = y; p.born = performance.now();
      next = (next + 1) % COUNT;
    };
    const move = (event: PointerEvent) => {
      if (reduced.matches || !fine.matches || event.pointerType === "touch") return;
      const x = event.clientX, y = event.clientY;
      if (!last) { emit(x, y); last = { x, y }; }
      else {
        const dx = x - last.x, dy = y - last.y;
        const distance = Math.hypot(dx, dy);
        if (distance < 24) return;
        emit(x, y);
        last = { x, y };
      }
      if (!frame) frame = requestAnimationFrame(tick);
    };
    const visibility = () => { if (document.hidden) clear(); };
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("blur", clear);
    document.documentElement.addEventListener("pointerleave", clear);
    document.addEventListener("visibilitychange", visibility);
    reduced.addEventListener("change", clear);
    fine.addEventListener("change", clear);
    return () => {
      disposed = true; clear();
      window.removeEventListener("pointermove", move);
      window.removeEventListener("blur", clear);
      document.documentElement.removeEventListener("pointerleave", clear);
      document.removeEventListener("visibilitychange", visibility);
      reduced.removeEventListener("change", clear);
      fine.removeEventListener("change", clear);
    };
  }, []);

  return (
    <div
      ref={root}
      className="glass-cursor-trail"
      aria-hidden="true"
      style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 79, overflow: "hidden" }}
    >
      {SIZES.map((size, i) => (
        <span
          key={i}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: size,
            height: size,
            opacity: 0,
            borderRadius: `${size * 0.38}px`,
            background: "rgba(255,255,255,0.4)",
            border: "0.6px solid rgba(144,144,144,0.2)",
            backdropFilter: "blur(2px)",
            WebkitBackdropFilter: "blur(2px)",
            boxShadow:
              "0.4px 0.4px 2.1px -1.1px rgba(0,0,0,0.13), 1.2px 1.2px 6.5px -2.3px rgba(0,0,0,0.12), 3.2px 3.2px 17.2px -3.4px rgba(0,0,0,0.1)",
            willChange: "transform, opacity",
          }}
        />
      ))}
    </div>
  );
}
