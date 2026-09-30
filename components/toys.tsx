"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CheckIcon } from "./icons";

/**
 * Rolling digits, like a balance updating in a finance app.
 * Digits roll on a strip; everything else (commas, $, %) just sits there.
 */
export function Roll({ value, className }: { value: string; className?: string }) {
  const chars = [...value];
  return (
    <span className={`roll${className ? " " + className : ""}`} aria-label={value} role="text">
      {chars.map((ch, i) => {
        // Key from the right so the ones column stays the ones column when the length changes.
        const key = chars.length - i;
        if (!/\d/.test(ch)) {
          return (
            <span key={`c${key}`} className="roll-char" aria-hidden>
              {ch}
            </span>
          );
        }
        return (
          <span key={`d${key}`} className="roll-digit" aria-hidden>
            <span className="roll-strip" style={{ transform: `translateY(${-Number(ch) * 10}%)` }}>
              {"0123456789".split("").map((d) => (
                <span key={d}>{d}</span>
              ))}
            </span>
          </span>
        );
      })}
    </span>
  );
}

/** Slide-to-confirm, the gesture money apps use when a tap feels too casual. */
export function SlideToConfirm({
  label,
  done,
  onConfirm,
  id,
}: {
  label: string;
  done: string;
  onConfirm: () => void;
  id: string;
}) {
  const track = useRef<HTMLDivElement>(null);
  const [x, setX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [complete, setComplete] = useState(false);
  const start = useRef(0);
  const max = useRef(0);

  const finish = useCallback(() => {
    setComplete(true);
    setX(max.current);
    onConfirm();
    window.setTimeout(() => {
      setComplete(false);
      setX(0);
    }, 2600);
  }, [onConfirm]);

  const measure = () => {
    const t = track.current;
    if (t) max.current = t.clientWidth - 44 - 8;
  };

  return (
    <div className={`slide${complete ? " is-done" : ""}`} ref={track} data-dragging={dragging || undefined}>
      <span className="slide-fill" style={{ width: x + 48 }} aria-hidden />
      <span className="slide-label" style={{ opacity: complete ? 0 : Math.max(0.15, 1 - x / 140) }}>
        {label}
      </span>
      <span className="slide-done" aria-live="polite">
        {complete && (
          <>
            <CheckIcon size={15} /> {done}
          </>
        )}
      </span>
      <button
        id={id}
        className="slide-knob"
        style={{ transform: `translateX(${x}px)` }}
        aria-label={`${label}. Press Enter to confirm.`}
        onPointerDown={(e) => {
          if (complete) return;
          measure();
          (e.target as HTMLElement).setPointerCapture(e.pointerId);
          start.current = e.clientX - x;
          setDragging(true);
        }}
        onPointerMove={(e) => {
          if (!dragging) return;
          setX(Math.max(0, Math.min(max.current, e.clientX - start.current)));
        }}
        onPointerUp={() => {
          setDragging(false);
          if (x > max.current * 0.86) finish();
          else setX(0);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " " || e.key === "ArrowRight") {
            e.preventDefault();
            measure();
            finish();
          }
        }}
      >
        {complete ? <CheckIcon size={18} /> : <span aria-hidden>→</span>}
      </button>
    </div>
  );
}

/** Press and hold: a ring fills, then something happens. */
export function HoldButton({
  children,
  doneText,
  ms = 1200,
}: {
  children: React.ReactNode;
  doneText: string;
  ms?: number;
}) {
  const [p, setP] = useState(0);
  const [done, setDone] = useState(false);
  const raf = useRef(0);
  const t0 = useRef(0);

  const stop = () => {
    cancelAnimationFrame(raf.current);
    if (!done) setP(0);
  };
  const tick = (now: number) => {
    const v = Math.min(1, (now - t0.current) / ms);
    setP(v);
    if (v >= 1) {
      setDone(true);
      window.setTimeout(() => {
        setDone(false);
        setP(0);
      }, 2600);
      return;
    }
    raf.current = requestAnimationFrame(tick);
  };
  const begin = () => {
    if (done) return;
    t0.current = performance.now();
    raf.current = requestAnimationFrame(tick);
  };
  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  return (
    <div className="hold">
      <button
        className="hold-btn"
        style={{ ["--p" as string]: p }}
        data-done={done || undefined}
        onPointerDown={begin}
        onPointerUp={stop}
        onPointerLeave={stop}
        onKeyDown={(e) => {
          if ((e.key === "Enter" || e.key === " ") && !e.repeat) begin();
        }}
        onKeyUp={stop}
      >
        <span className="hold-ring" aria-hidden />
        <span className="hold-text">{done ? "✓" : children}</span>
      </button>
      <span className="hold-note" aria-live="polite">
        {done ? doneText : "Press and hold"}
      </span>
    </div>
  );
}

/** Runs `fn` whenever the element's page becomes the active page. */
export function useWhenActive(active: boolean, fn: () => void | (() => void)) {
  const fnRef = useRef(fn);
  fnRef.current = fn;
  useEffect(() => {
    if (active) return fnRef.current() || undefined;
  }, [active]);
}
