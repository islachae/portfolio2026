"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useRef } from "react";

/**
 * Inside the gradient's canvas: its clock starts at `at` seconds instead of 0, on the first frame
 * it draws. The first seconds of the animation are pale; this is the moment the still under it
 * shows (public/hero/gradient-*.webp), so the live gradient carries on from the picture.
 * (Loaded with the gradient's code, not before: components/ShaderHero.tsx.)
 */
export function StartAt({ at }: { at: number }) {
  const clock = useThree((s) => s.clock);
  const set = useRef(false);
  // before the gradient reads the clock (it reads it in a frame callback of its own)
  useFrame(() => {
    if (set.current) return;
    set.current = true;
    clock.start();
    clock.elapsedTime = at;
  }, -1);
  return null;
}
