"use client";

import { useEffect, useRef, useState } from "react";

// JS-driven cursor: instant follow (no lerp lag) + smooth scale on hover.
// Purple dot (20px) at rest; grows to 30px over links/buttons; white circle
// + arrow over project cards. Scale animates via CSS transition (smooth).
export default function CustomCursor() {
  const ref = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [mode, setMode] = useState<"dot" | "grow" | "arrow">("dot");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduced) return;

    setReady(true);
    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    let raf = 0;

    const onMove = (e: MouseEvent) => {
      x = e.clientX;
      y = e.clientY;
    };

    const tick = () => {
      if (ref.current) {
        ref.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      }
      raf = requestAnimationFrame(tick);
    };

    const onOver = (e: Event) => {
      const t = e.target as HTMLElement;
      if (t.closest(".project-card")) setMode("arrow");
      else if (t.closest("a, button, [role='button'], .cursor-pointer")) setMode("grow");
      else setMode("dot");
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("mouseover", onOver);
    raf = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseover", onOver);
      cancelAnimationFrame(raf);
    };
  }, []);

  if (!ready) return null;

  return (
    <div
      ref={ref}
      className="custom-cursor pointer-events-none fixed left-0 top-0 z-[70] will-change-transform"
      data-mode={mode}
      aria-hidden="true"
    >
      <div className="cc-dot" />
      <div className="cc-arrow">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="7" y1="17" x2="17" y2="7" />
          <polyline points="8 7 17 7 17 16" />
        </svg>
      </div>
    </div>
  );
}
