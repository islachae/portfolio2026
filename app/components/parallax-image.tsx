"use client";

import { useEffect, useRef, useState } from "react";

// ── Parallax image ──────────────────────────────────────────────────
// The image shifts subtly opposite to mouse movement within its
// container — like the card/thumbnail micro-parallax on liumichelle,
// queenie.works, sophiamanalo. Only runs on screens >= 640px, and the
// shift is capped at ±6px so it stays quiet and intentional.

const MAX_PX = 0.04; // ~6px at a 150px container half-width

interface Props {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
}

export default function ParallaxImage({
  src,
  alt,
  className = "",
  priority = false,
}: Props) {
  const imgRef = useRef<HTMLImageElement>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [active, setActive] = useState(false);

  useEffect(() => {
    // Parallax only on larger screens; quiet on mobile.
    if (typeof window === "undefined" || window.innerWidth < 640) return;

    const el = imgRef.current;
    if (!el) return;

    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) / (rect.width / 2);
      const dy = (e.clientY - cy) / (rect.height / 2);
      setOffset({
        x: Math.max(-MAX_PX, Math.min(MAX_PX, dx * MAX_PX)) * rect.width,
        y: Math.max(-MAX_PX, Math.min(MAX_PX, dy * MAX_PX)) * rect.height,
      });
      setActive(true);
    };

    const onLeave = () => {
      setOffset({ x: 0, y: 0 });
      setActive(false);
    };

    el.addEventListener("mousemove", onMove, { passive: true });
    el.addEventListener("mouseleave", onLeave);

    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return (
    <div
      className={`relative aspect-[4/3] overflow-hidden rounded-xl bg-neutral-50 ${className}`}
      style={{ willChange: "transform" }}
    >
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        className="h-full w-full object-cover"
        style={{
          transform: `translate(${-offset.x}px, ${-offset.y}px)`,
          transition: active ? "transform 0.03s linear" : "transform 0.4s cubic-bezier(0.2, 0, 0, 1)",
          willChange: "transform",
        }}
      />
    </div>
  );
}
