"use client";

import { useEffect, useRef, useState } from "react";

const TARGET = "Where Chaewon's ideas take shape.";
const GLYPHS = "abcdefghijklmnopqrstuvwxyz";

// Full-screen intro overlay: dark circle logo + a short scramble/decode tagline.
// The tagline decodes left-to-right — the first letter locks in first, then the
// next, and so on — with a gentle flicker on the still-scrambling tail, then
// pauses so it can be read before the screen fades out. Text is written
// directly to the DOM (no React re-render per frame) so the motion stays smooth.
export default function LoadingScreen() {
  const [done, setDone] = useState(false);
  const textRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = textRef.current;
    if (!el) return;

    let frame = 0;
    let raf = 0;
    let fadeTimer: ReturnType<typeof setTimeout> | undefined;
    const current = new Array(TARGET.length).fill("");

    // left-to-right reveal order: letters lock in one after another (spaces
    // and punctuation show immediately)
    const revealIndex = new Array(TARGET.length).fill(-1);
    let letterCount = 0;
    for (let i = 0; i < TARGET.length; i++) {
      if (/[a-zA-Z]/.test(TARGET[i])) revealIndex[i] = letterCount++;
    }
    const REVEAL_START = 3; // frames before the first letter locks in
    const REVEAL_STEP = 2;  // frames between each successive letter

    const tick = () => {
      let out = "";
      let allDone = true;
      for (let i = 0; i < TARGET.length; i++) {
        const ch = TARGET[i];
        const idx = revealIndex[i];
        if (idx < 0 || frame >= REVEAL_START + idx * REVEAL_STEP) {
          out += ch; // punctuation/space, or a letter that has locked in
        } else {
          allDone = false;
          // gentle flicker: ~30% of frames change, at 60fps
          if (!current[i] || Math.random() < 0.3) {
            current[i] = GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
          }
          out += current[i];
        }
      }
      el.textContent = out;
      if (allDone) {
        el.textContent = TARGET;
        fadeTimer = setTimeout(() => {
          setDone(true);
          // after the intro, future navigations settle instantly
          document.documentElement.style.setProperty("--reveal-base", "0s");
        }, 1700);
      } else {
        frame++;
        raf = requestAnimationFrame(tick);
      }
    };

    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      if (fadeTimer) clearTimeout(fadeTimer);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center gap-6 bg-white transition-opacity duration-500 ${
        done ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
    >
      <span
        className="flex h-16 w-16 items-center justify-center rounded-full"
        style={{ backgroundColor: "#2b2b2b", border: "1px solid #000000" }}
      >
        <span
          className="text-[26px] font-bold leading-none text-white"
          style={{ fontFamily: "'PingFang SC', 'Noto Sans SC', 'Microsoft YaHei', system-ui, sans-serif" }}
        >
          採
        </span>
      </span>
      <span ref={textRef} className="text-base font-medium text-[var(--periwinkle)]">
        &nbsp;
      </span>
    </div>
  );
}
