"use client";

import { useEffect, useRef } from "react";

interface Props {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

export default function RevealOnScroll({ children, className = "", delay = 0 }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || !("IntersectionObserver" in window)) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    let animation: Animation | undefined;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      if (!reduced.matches) animation = el.animate([
        { opacity: 0 },
        { opacity: 1 },
      ], {duration: 700, delay: Math.min(delay, 180), easing: "ease-out", fill: "backwards"});
      observer.disconnect();
    }, {threshold: 0.01, rootMargin: "0px 0px 80px 0px"});
    const stop = () => { if (reduced.matches) animation?.cancel(); };
    reduced.addEventListener("change", stop);
    observer.observe(el);
    return () => {observer.disconnect();animation?.cancel();reduced.removeEventListener("change", stop);};
  }, [delay]);
  // Content remains visible if JS/observation fails; motion is enhancement only.
  return <div ref={ref} className={className}>{children}</div>;
}
