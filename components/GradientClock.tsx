"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useRef } from "react";

/**
 * Inside the gradient's canvas: its clock starts at `at` seconds instead of 0, on the first frame
 * it draws. The first seconds of the animation are pale; this is the moment the still under it
 * shows (public/hero/gradient-*.webp), so the live gradient carries on from the picture.
 * It doesn't set off at full speed either: over `ease` seconds its time goes from standing still
 * to running normally, so the picture comes to life instead of suddenly moving.
 * (Loaded with the gradient's code, not before: components/ShaderHero.tsx.)
 */
export function StartAt({ at, ease = 3 }: { at: number; ease?: number }) {
  const clock = useThree((s) => s.clock);
  const t0 = useRef<number | null>(null);
  // before the gradient reads the clock (it reads it in a frame callback of its own)
  useFrame(() => {
    const now = performance.now() / 1000;
    if (t0.current === null) t0.current = now;
    const t = now - t0.current;
    // constant acceleration up to normal speed, then plain time (half of `ease` behind the wall clock)
    clock.elapsedTime = at + (t < ease ? (t * t) / (2 * ease) : t - ease / 2);
  }, -1);
  return null;
}
