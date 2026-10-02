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
 * A work page's stage as a door into its case study (wide screens): over the prototype (not its
 * buttons) a small chip follows the pointer, “Read case study →”, and a click opens it. Mouse
 * only, so a tap on a tablet doesn't whisk anyone away; the keyboard way in is the “Read case
 * study” button beside the stage.
 * A project that isn't written up yet (`soon`) gets the same chip saying “Coming soon”, and a
 * click does nothing. Pebbo's stage is the working app (you type into it), so it has no chip.
 */
export function StageDoor({ id, soon, children }: { id: CaseId | null; soon?: boolean; children: React.ReactNode }) {
  const { openCase } = useShell();
  const box = useRef<HTMLDivElement>(null);
  const chip = useRef<HTMLSpanElement>(null);
  const lastPointer = useRef("");
  const raf = useRef(0);
  const door = !!id && id !== "pebbo";
  const hint = door || !!soon;

  const set = (on: boolean) => {
    const el = box.current;
    if (!el) return;
    if (on) el.dataset.door = door ? "on" : "soon";
    else delete el.dataset.door;
  };

  const onMove = (e: React.PointerEvent) => {
    if (!hint || e.pointerType !== "mouse") return;
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
      {hint && (
        <span className="stage-chip" ref={chip} aria-hidden>
          {door ? "Read case study →" : "Coming soon"}
        </span>
      )}
    </div>
  );
}
