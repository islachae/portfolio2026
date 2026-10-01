"use client";

import { useRef } from "react";
import type { CaseId } from "@/content/cases";
import { useShell } from "./shell-context";

/** Anything in a stage that does its own thing when clicked: the door stays shut over these. */
const OWN = [
  "a",
  "button",
  "input",
  "textarea",
  "select",
  "label",
  "video[controls]",
  "[role='button']",
  "[role='slider']",
  "[role='tab']",
  "[role='radio']",
  "[contenteditable='true']",
  "[tabindex]:not([tabindex='-1'])",
  ".no-door",
].join(",");

/**
 * A work page's stage, with two ways from the prototype into the case study (wide screens):
 *  - “Open case study ↗” in the stage's top-left corner, a real button (keyboard too);
 *  - the stage itself as a door: over the prototype (not its buttons) a small chip follows the
 *    pointer, “Read case study →”, and a click opens it. Mouse only, so a tap on a tablet
 *    doesn't whisk anyone away.
 * Pebbo's stage is the working app (you type into it), so it only gets the corner button.
 */
export function StageDoor({ id, children }: { id: CaseId | null; children: React.ReactNode }) {
  const { openCase } = useShell();
  const box = useRef<HTMLDivElement>(null);
  const chip = useRef<HTMLSpanElement>(null);
  const lastPointer = useRef("");
  const raf = useRef(0);
  const door = !!id && id !== "pebbo";

  const set = (on: boolean) => {
    const el = box.current;
    if (!el) return;
    if (on) el.dataset.door = "on";
    else delete el.dataset.door;
  };

  const onMove = (e: React.PointerEvent) => {
    if (!door || e.pointerType !== "mouse") return;
    const over = !(e.target as Element).closest(OWN);
    set(over);
    if (!over) return;
    const { clientX, clientY } = e;
    cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(() => {
      const el = box.current;
      const c = chip.current;
      if (!el || !c) return;
      const r = el.getBoundingClientRect();
      let x = clientX - r.left + 14;
      const y = clientY - r.top + 18;
      // keep it inside the stage: flip to the left of the pointer near the right edge
      if (x + c.offsetWidth > r.width - 8) x = clientX - r.left - c.offsetWidth - 10;
      c.style.transform = `translate(${Math.round(x)}px, ${Math.round(y)}px)`;
    });
  };

  const onClick = (e: React.MouseEvent) => {
    if (!door || !id || lastPointer.current !== "mouse") return;
    if ((e.target as Element).closest(OWN)) return;
    if (window.getSelection()?.toString()) return;
    openCase(id);
  };

  return (
    <div
      className="stage"
      ref={box}
      onPointerDown={(e) => (lastPointer.current = e.pointerType)}
      onPointerMove={onMove}
      onPointerLeave={() => set(false)}
      onClick={onClick}
    >
      {children}
      {id && (
        <button
          type="button"
          className="stage-open"
          onClick={(e) => {
            e.stopPropagation();
            openCase(id);
          }}
        >
          Open case study<span aria-hidden> ↗</span>
        </button>
      )}
      {door && (
        <span className="stage-chip" ref={chip} aria-hidden>
          Read case study →
        </span>
      )}
    </div>
  );
}
