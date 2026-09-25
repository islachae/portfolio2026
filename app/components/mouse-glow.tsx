"use client";

import { useEffect, useRef } from "react";

// ── Mouse-following soft glow ──────────────────────────────────────
// A single fixed radial gradient that follows the cursor with smooth
// lag (requestAnimationFrame). Very low opacity so it feels atmospheric,
// not distracting — like the subtle light spots on the reference sites.

const GLOW_RADIUS = "40vw";
const GLOW_OPACITY = 0.10;

export default function MouseGlow() {
  const el = useRef<HTMLDivElement>(null);
  const x = useRef(0);
  const y = useRef(0);
  const tx = useRef(0);
  const ty = useRef(0);

  useEffect(() => {
    const move = (e: MouseEvent) => {
      x.current = e.clientX;
      y.current = e.clientY;
    };
    window.addEventListener("mousemove", move, { passive: true });

    let raf: number;
    const tick = () => {
      // Smooth lag toward the real cursor
      tx.current += (x.current - tx.current) * 0.08;
      ty.current += (y.current - ty.current) * 0.08;
      if (tx.current > 0 && ty.current > 0 && el.current) {
        el.current.style.transform = `translate(-50%, -50%) translate(${tx.current}px, ${ty.current}px)`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("mousemove", move);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      ref={el}
      aria-hidden="true"
      style={{
        position: "fixed",
        top: "50%",
        left: "50%",
        width: "1px",
        height: "1px",
        margin: "-1px",
        transform: "translate(-50%, -50%) translate(0px, 0px)",
        pointerEvents: "none",
        zIndex: 9999,
        background:
          `radial-gradient(circle ${GLOW_RADIUS} at 50% 50%, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0) 60%)`,
        opacity: GLOW_OPACITY,
        mixBlendMode: "screen",
        transition: "opacity 0.4s ease",
      }}
    />
  );
}
