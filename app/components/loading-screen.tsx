"use client";

import { useEffect, useRef, useState } from "react";

const TARGET = "Where Chaewon's ideas take shape.";
const TYPE_MS = 80; // per-character typing speed

// Full-screen intro overlay: dark circle logo + a typewriter tagline.
// The tagline types out left-to-right ("W", "Wh", "Whe", …) with a blinking
// caret on the right, lingers so it can be read, then the screen fades out.
export default function LoadingScreen() {
  const [done, setDone] = useState(false);
  const textRef = useRef<HTMLSpanElement>(null);
  const caretRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = textRef.current;
    if (!el) return;

    let typeTimer: ReturnType<typeof setTimeout> | undefined;
    let fadeTimer: ReturnType<typeof setTimeout> | undefined;
    let blinkTimer: ReturnType<typeof setInterval> | undefined;
    let i = 0;

    const typeNext = () => {
      i++;
      el.textContent = TARGET.slice(0, i);
      if (i < TARGET.length) {
        typeTimer = setTimeout(typeNext, TYPE_MS);
      } else {
        // typing done — stop the caret and linger before fading
        if (caretRef.current) caretRef.current.style.opacity = "0";
        if (blinkTimer) clearInterval(blinkTimer);
        fadeTimer = setTimeout(() => {
          setDone(true);
          // after the intro, future navigations settle instantly
          document.documentElement.style.setProperty("--reveal-base", "0s");
        }, 1700);
      }
    };

    typeTimer = setTimeout(typeNext, 150);

    // blinking caret
    blinkTimer = setInterval(() => {
      if (caretRef.current) {
        const cur = caretRef.current.style.opacity;
        caretRef.current.style.opacity = cur === "0" ? "1" : "0";
      }
    }, 530);

    return () => {
      if (typeTimer) clearTimeout(typeTimer);
      if (fadeTimer) clearTimeout(fadeTimer);
      if (blinkTimer) clearInterval(blinkTimer);
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
      <span className="flex items-center text-base font-medium text-[var(--periwinkle)]">
        <span ref={textRef}>&nbsp;</span>
        <span
          ref={caretRef}
          className="ml-[2px] inline-block h-[1.15em] w-[2px] bg-[var(--periwinkle)]"
        />
      </span>
    </div>
  );
}
