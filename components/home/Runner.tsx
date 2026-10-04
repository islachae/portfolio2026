"use client";

import { useEffect, useRef } from "react";
import { PixelFace } from "../PixelFace";

/**
 * The surprise the last line of Home promises: P and Space together, and ChaeLLM (the pixel face,
 * on a small pixel body) comes down to the bottom of the screen and runs. Space jumps the things a designer gets
 * thrown at her; a hit ends the run and Space starts another. Esc (or the ×) closes it.
 *
 * It only exists once asked for (its own chunk: components/Site.tsx), and it moves by writing
 * transforms straight to the elements, so nothing re-renders while it runs.
 */

/** What comes at her. Short enough to jump: the longest is about 170px wide. */
const BLOCKS = ["final_final_v3.fig", "quick question?", "make it pop", "one more thing", "ASAP", "add AI?", "logo bigger", "any updates?"];

const FACE = 40; // her size
const AT = 72; // where she runs, from the left edge
const SPEED = 340; // how fast the blocks come, px/s
const JUMP = 760; // take-off speed, px/s
const GRAVITY = 2000; // px/s²

type Block = { el: HTMLSpanElement; x: number; w: number; h: number; passed: boolean };

const typing = (t: EventTarget | null) =>
  t instanceof HTMLElement && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.tagName === "SELECT" || t.isContentEditable);

export function Runner({ onClose }: { onClose: () => void }) {
  const box = useRef<HTMLDivElement>(null);
  const face = useRef<HTMLDivElement>(null);
  const lane = useRef<HTMLDivElement>(null);
  const scoreEl = useRef<HTMLSpanElement>(null);
  const note = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const strip = box.current;
    const f = face.current;
    const l = lane.current;
    if (!strip || !f || !l) return;
    let raf = 0;
    let last = 0;
    let y = 0; // how high she is off the ground
    let vy = 0;
    let over = false;
    let score = 0;
    let wait = 0.9; // seconds until the next block
    let blocks: Block[] = [];

    const say = (text: string) => {
      if (note.current) note.current.textContent = text;
    };
    const start = () => {
      blocks.forEach((b) => b.el.remove());
      blocks = [];
      y = vy = score = last = 0;
      wait = 0.9;
      over = false;
      strip.dataset.state = "run";
      if (scoreEl.current) scoreEl.current.textContent = "0";
      f.style.transform = "";
      say("");
    };
    const jump = () => {
      if (over) start();
      else if (y === 0) vy = JUMP;
    };
    const spawn = () => {
      const el = document.createElement("span");
      el.className = "rn-block";
      el.textContent = BLOCKS[Math.floor(Math.random() * BLOCKS.length)];
      l.appendChild(el);
      const b: Block = { el, x: strip.clientWidth + 24, w: el.offsetWidth, h: el.offsetHeight, passed: false };
      el.style.transform = `translate3d(${b.x}px,0,0)`;
      blocks.push(b);
      // the next one leaves room to land and take off again
      wait = (b.w + 280) / SPEED + Math.random() * 0.8;
    };
    const frame = (t: number) => {
      raf = requestAnimationFrame(frame);
      const dt = last ? Math.min(0.034, (t - last) / 1000) : 0;
      last = t;
      if (over) return;
      if (y > 0 || vy > 0) {
        vy -= GRAVITY * dt;
        y += vy * dt;
        if (y <= 0) y = vy = 0;
        f.style.transform = `translate3d(0,${-y}px,0)`;
      }
      strip.toggleAttribute("data-air", y > 0);
      wait -= dt;
      if (wait <= 0) spawn();
      for (const b of blocks) {
        b.x -= SPEED * dt;
        b.el.style.transform = `translate3d(${b.x}px,0,0)`;
        if (!b.passed && b.x + b.w < AT) {
          b.passed = true;
          score += 1;
          if (scoreEl.current) scoreEl.current.textContent = String(score);
        }
        // a hit: the boxes overlap (with a few pixels of forgiveness)
        if (!b.passed && b.x + 5 < AT + FACE - 7 && b.x + b.w - 5 > AT + 7 && y < b.h - 6) {
          over = true;
          strip.dataset.state = "over";
          say(`Stopped by “${b.el.textContent}”. Space to try again.`);
        }
      }
      blocks = blocks.filter((b) => {
        if (b.x + b.w > -24) return true;
        b.el.remove();
        return false;
      });
    };
    const key = (e: KeyboardEvent) => {
      if (typing(e.target) || e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.code === "Space") {
        e.preventDefault(); // (it would scroll the page)
        if (!e.repeat) jump();
      } else if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
      }
    };
    const tap = (e: PointerEvent) => {
      if (!(e.target instanceof Element) || !e.target.closest(".rn-x")) jump();
    };
    start();
    raf = requestAnimationFrame(frame);
    window.addEventListener("keydown", key, true);
    strip.addEventListener("pointerdown", tap);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("keydown", key, true);
      strip.removeEventListener("pointerdown", tap);
      blocks.forEach((b) => b.el.remove());
    };
  }, [onClose]);

  return (
    <div className="rn" ref={box} role="region" aria-label="ChaeLLM run, a small game" data-state="run">
      <p className="label rn-score">
        Score <span ref={scoreEl}>0</span>
      </p>
      <p className="label rn-keys">Space jump · Esc close</p>
      <button type="button" className="rn-x" aria-label="Close the game" onClick={onClose}>
        ×
      </button>
      <p className="rn-note" ref={note} aria-live="polite" />
      <div className="rn-lane" ref={lane}>
        {/* her: the pixel face on a small pixel body. The legs swap between two strides while she
            runs (.rn-a / .rn-b) and tuck in the air (.rn-j); the arms follow. */}
        <div className="rn-face" ref={face}>
          <span className="rn-head">
            <PixelFace size={FACE} />
          </span>
          <svg className="rn-body" viewBox="0 0 16 8" width={FACE} height={FACE / 2} shapeRendering="crispEdges" aria-hidden>
            <rect x="5" y="0" width="6" height="4" />
            <g className="rn-a">
              <rect x="3" y="1" width="2" height="1" />
              <rect x="11" y="2" width="2" height="1" />
              <rect x="5" y="4" width="2" height="3" />
              <rect x="4" y="7" width="3" height="1" />
              <rect x="9" y="4" width="2" height="2" />
              <rect x="10" y="5" width="3" height="1" />
            </g>
            <g className="rn-b">
              <rect x="3" y="2" width="2" height="1" />
              <rect x="11" y="1" width="2" height="1" />
              <rect x="9" y="4" width="2" height="3" />
              <rect x="9" y="7" width="3" height="1" />
              <rect x="5" y="4" width="2" height="2" />
              <rect x="3" y="5" width="3" height="1" />
            </g>
            <g className="rn-j">
              <rect x="3" y="0" width="2" height="1" />
              <rect x="11" y="0" width="2" height="1" />
              <rect x="5" y="4" width="2" height="1" />
              <rect x="4" y="5" width="3" height="1" />
              <rect x="9" y="4" width="2" height="1" />
              <rect x="9" y="5" width="3" height="1" />
            </g>
          </svg>
        </div>
      </div>
    </div>
  );
}
