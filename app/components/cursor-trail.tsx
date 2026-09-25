"use client";

import { useEffect, useRef } from "react";

const COUNT = 32;
const LIFETIME = 1100;

export default function CursorTrail() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = root.current;
    if (!container) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    const fine = matchMedia("(any-pointer: fine)");
    const dots = Array.from(container.children) as HTMLElement[];
    const particles = dots.map(() => ({ x: 0, y: 0, born: -Infinity, size: 80 }));
    // Effect-local state survives StrictMode setup/cleanup/setup correctly.
    let disposed = false;
    let frame = 0;
    let next = 0;
    let last: { x: number; y: number } | null = null;

    const clear = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      last = null;
      particles.forEach((p, i) => { p.born = -Infinity; dots[i].style.opacity = "0"; });
    };
    const tick = (now: number) => {
      frame = 0;
      if (disposed) return;
      let active = false;
      particles.forEach((p, i) => {
        const age = (now - p.born) / LIFETIME;
        if (age >= 1) { dots[i].style.opacity = "0"; return; }
        active = true;
        dots[i].style.opacity = String(0.95 * (1 - age) ** 1.4);
        dots[i].style.transform = `translate3d(${p.x}px, ${p.y - age * 9}px, 0) translate(-50%, -50%) scale(${1 + age * 0.3})`;
      });
      if (active) frame = requestAnimationFrame(tick);
    };
    const emit = (x: number, y: number, speed: number) => {
      const p = particles[next];
      p.x = x; p.y = y; p.born = performance.now();
      p.size = Math.min(112, 82 + speed * 0.12);
      dots[next].style.width = `${p.size}px`;
      dots[next].style.height = `${p.size}px`;
      next = (next + 1) % COUNT;
    };
    const move = (event: PointerEvent) => {
      if (reduced.matches || !fine.matches || event.pointerType === "touch") return;
      const x = event.clientX, y = event.clientY;
      if (!last) { emit(x, y, 0); last = {x, y}; }
      else {
        const dx = x - last.x, dy = y - last.y;
        const distance = Math.hypot(dx, dy);
        if (distance < 18) return;
        const steps = Math.min(8, Math.floor(distance / 18));
        for (let i = 1; i <= steps; i++) emit(last.x + dx * i / steps, last.y + dy * i / steps, distance);
        last = {x, y};
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
    <div ref={root} className="cursor-trail" aria-hidden="true" style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 80, overflow: "hidden" }}>
      {Array.from({length: COUNT}, (_, i) => <span key={i} style={{position: "absolute", top: 0, left: 0, width: 82, height: 82, opacity: 0, backgroundImage: 'url("/cursor-glow.png")', backgroundSize: "contain", backgroundRepeat: "no-repeat", backgroundPosition: "center", willChange: "transform, opacity"}} />)}
    </div>
  );
}
