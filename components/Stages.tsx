/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { profile, type PageId } from "@/content/site";
import { bakes, type Bake } from "@/content/bakery";
import { reducedMotion, useShell } from "./shell-context";
import {
  ChevronLeft,
  ChevronRight,
  EyeIcon,
  MailIcon,
  PageIcon,
  ReplayIcon,
  Sparkle,
} from "./icons";
import { HoldButton, Roll, SlideToConfirm } from "./toys";
import { PebboPhone, type PebboPhoneApi, type PebboPhoneState } from "./PebboPhone";

const ease = [0.3, 0.7, 0.2, 1] as const;

export function useActive(id: PageId) {
  return useShell().current === id;
}

/** A small segmented control used in the stage pills. */
export function Pills<T extends string | number>({
  name,
  value,
  options,
  onChange,
}: {
  name: string;
  value: T | null;
  options: { value: T; label: React.ReactNode }[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="seg seg--stage" role="radiogroup" aria-label={name}>
      {options.map((o) => (
        <button
          key={String(o.value)}
          role="radio"
          aria-checked={value === o.value}
          className="seg-opt"
          onClick={() => onChange(o.value)}
        >
          {value === o.value && (
            <motion.span
              layoutId={`pill-${name}`}
              className="seg-pill"
              transition={{ type: "spring", stiffness: 520, damping: 40 }}
            />
          )}
          <span className="seg-text">{o.label}</span>
        </button>
      ))}
    </div>
  );
}

/* ───────────────────── TIP · the prototype, replayed ───────────────────── */

const tipShot = (name: string) => `/work/tipping-case/${name}.webp`;
/*
 * Real screens from the Figma prototype, played like a product film (“focus pull”): each step shows
 * its screen, then the camera leans into the one element that matters (zoom x, y, scale), rings it,
 * and the caption under the step bar says what it does; it eases back out before the next step.
 * Hotspots are in % of the phone screen. Reduced motion: no zoom, the ring and caption only.
 */
type TipStep = {
  label: string;
  caption: string;
  say: string;
  ms: number;
  zoom: { x: number; y: number; s: number };
  ring?: { l: number; t: number; w: number; h: number };
  tap?: { x: number; y: number };
  nudge?: { x: number; y: number };
};
const TIP_STEPS: TipStep[] = [
  {
    label: "Minimum",
    caption: "Pay a $2 minimum now. The rest waits until your food arrives.",
    say: "Checkout: Trust-First Tipping sets a $2.00 pre-tip and a post-delivery reward of $1.50 to $3.50.",
    ms: 4600,
    zoom: { x: 32, y: 60, s: 1.9 },
    ring: { l: 5.5, t: 52.3, w: 53, h: 16 },
  },
  {
    label: "Delivered",
    caption: "After delivery the tip settles at $4.50, with the reason one tap away.",
    say: "Delivered: ETA 2:45 PM, actual 2:55 PM, verified drop-off, responsive, e-bike. Trust Tip applied: $4.50, with a View reason link.",
    ms: 4400,
    zoom: { x: 50, y: 52.5, s: 1.6 },
    ring: { l: 5, t: 42.6, w: 89.5, h: 19.4 },
  },
  {
    label: "Feedback",
    caption: "Feedback is one tap and saves on its own. No confirm step.",
    say: "Feedback sheet: Quick & Efficient, Careful Handling, Clear Communication. Careful Handling is tapped.",
    ms: 4000,
    zoom: { x: 50, y: 79, s: 1.4 },
    tap: { x: 49, y: 80.6 },
  },
  {
    label: "Your call",
    caption: "The AI suggests, you decide: slide it up or down.",
    say: "Adjust tip sheet: the Trust Tip of $4.50 on a slider from $3.50 to $7.50.",
    ms: 4000,
    zoom: { x: 50, y: 86.5, s: 1.65 },
    ring: { l: 6, t: 83, w: 88, h: 8 },
    nudge: { x: 30.4, y: 88.8 },
  },
  {
    label: "Courier",
    caption: "Couriers see the tip range and your priorities before they accept.",
    say: "Courier view: base pay $6.00, a trust tip range of $2 to $4, and the customer’s preferences.",
    ms: 4600,
    zoom: { x: 72, y: 56.5, s: 1.85 },
    ring: { l: 49.5, t: 48, w: 46.5, h: 17.5 },
  },
];
/** When the camera leans in after a step starts, and how long before the step ends it leans out. */
const ZOOM_IN_AT = 520;
const ZOOM_OUT_BEFORE = 560;

export function TippingStage() {
  const active = useActive("tipping");
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [zoomed, setZoomed] = useState(false);
  const [still, setStill] = useState(false);
  // A pause the visitor chose sticks when they leave and come back
  const held = useRef(false);

  useEffect(() => setStill(reducedMotion()), []);
  // Plays while the page is on screen; never on its own with reduced motion
  useEffect(() => {
    if (!active) setPlaying(false);
    else if (!held.current && !reducedMotion()) setPlaying(true);
  }, [active]);
  // Each step: show the screen, lean in, (if playing) lean out, next
  useEffect(() => {
    setZoomed(false);
    if (still) return;
    const timers = [window.setTimeout(() => setZoomed(true), ZOOM_IN_AT)];
    if (playing) {
      timers.push(window.setTimeout(() => setZoomed(false), TIP_STEPS[step].ms - ZOOM_OUT_BEFORE));
      timers.push(window.setTimeout(() => setStep((s) => (s + 1) % TIP_STEPS.length), TIP_STEPS[step].ms));
    }
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [playing, step, still]);

  const toggle = () => {
    held.current = playing;
    setPlaying(!playing);
  };
  const cur = TIP_STEPS[step];
  const base = step === 0 ? "checkout" : step === 4 ? "courier" : "delivered";
  // the ring, tap and nudge show once the camera has arrived (or always, with reduced motion)
  const focus = zoomed || still;

  return (
    <>
      <div className="stage-visual tipproto-stage" data-zoomed={zoomed || undefined}>
        <div
          className="tp-phone"
          role="img"
          aria-label={cur.say}
          style={
            {
              "--zx": cur.zoom.x / 100,
              "--zy": cur.zoom.y / 100,
              "--zs": zoomed ? cur.zoom.s : 1,
              "--zt": zoomed ? 1 : 0,
            } as React.CSSProperties
          }
        >
          <div className="tp-screen">
            <img className="tp-shot tp-shot--checkout" src={tipShot("checkout")} alt="" data-on={base === "checkout" || undefined} loading="lazy" />
            <img className="tp-shot" src={tipShot("final-feedback")} alt="" data-on={base === "delivered" || undefined} loading="lazy" />
            <img className="tp-shot" src={tipShot("courier-offer")} alt="" data-on={base === "courier" || undefined} loading="lazy" />
            <span className="tp-scrim" data-on={step === 2 || step === 3 || undefined} />
            <img className="tp-sheet" src={tipShot("sheet-feedback")} alt="" data-on={step === 2 || undefined} loading="lazy" />
            <img className="tp-sheet" src={tipShot("sheet-adjust")} alt="" data-on={step === 3 || undefined} loading="lazy" />
            {TIP_STEPS.map((s, i) =>
              s.ring ? (
                <span
                  key={`r${i}`}
                  className="tp-ring"
                  data-on={(i === step && focus) || undefined}
                  style={{ left: `${s.ring.l}%`, top: `${s.ring.t}%`, width: `${s.ring.w}%`, height: `${s.ring.h}%` }}
                  aria-hidden
                />
              ) : null,
            )}
            {cur.tap && <span key={`t${step}`} className="tp-tap" data-on={focus || undefined} style={{ left: `${cur.tap.x}%`, top: `${cur.tap.y}%` }} aria-hidden />}
            {cur.nudge && (
              <span key={`n${step}`} className="tp-nudge" data-on={focus || undefined} style={{ left: `${cur.nudge.x}%`, top: `${cur.nudge.y}%` }} aria-hidden>
                <i />
                <i />
              </span>
            )}
          </div>
        </div>
      </div>
      <StageControls>
        <Pills
          name="Step through the prototype"
          value={step}
          onChange={setStep}
          options={TIP_STEPS.map((s, i) => ({ value: i, label: s.label }))}
        />
        <button className="stage-btn" onClick={toggle} aria-label={playing ? "Pause the walkthrough" : "Play the walkthrough"}>
          {playing ? (
            <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden>
              <rect x="2" y="1.5" width="2.6" height="9" rx="0.6" fill="currentColor" />
              <rect x="7.4" y="1.5" width="2.6" height="9" rx="0.6" fill="currentColor" />
            </svg>
          ) : (
            <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden>
              <path d="M3 1.8v8.4a.6.6 0 0 0 .9.5l6.8-4.2a.6.6 0 0 0 0-1L3.9 1.3a.6.6 0 0 0-.9.5Z" fill="currentColor" />
            </svg>
          )}
        </button>
        <p className="tp-caption" key={step} aria-live="polite">
          {cur.caption}
        </p>
      </StageControls>
    </>
  );
}

/* ───────────────────── ZIPF · before / after ───────────────────── */

const zipBefore = [
  {
    app: "Listing site",
    text: "Enter the same property info again",
    x: 6,
    y: 10,
    r: -5,
  },
  {
    app: "Blog",
    text: "Reformat the listing for a new channel",
    x: 58,
    y: 4,
    r: 4,
  },
  {
    app: "Client PDF",
    text: "Prepare different materials for each inquiry",
    x: 4,
    y: 68,
    r: 3,
  },
  {
    app: "Notes",
    text: "Marketing, listings, client notes: all in separate tools",
    x: 57,
    y: 72,
    r: -4,
  },
];

export function ZipflowStage() {
  const [mode, setMode] = useState<"before" | "after">("after");
  return (
    <>
      <div className="stage-visual zip-stage">
        <AnimatePresence mode="wait" initial={false}>
          {mode === "after" ? (
            <motion.img
              key="after"
              className="zip-shot"
              src="/work/zipflow.webp"
              alt="ZipFlow dashboard: properties under contract shown as cards, with a sidebar for properties, map, customer care and links."
              initial={{ opacity: 0, scale: 0.97, filter: "blur(6px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, scale: 0.97, filter: "blur(6px)" }}
              transition={{ duration: 0.35, ease }}
            />
          ) : (
            <motion.div
              key="before"
              className="zip-before"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.25 }}
            >
              <div className="zb-listing">
                <span className="zb-listing-pic" aria-hidden />
                <b>645 E 14th St, Unit 301</b>
                <span>$325,000 · typed again, and again</span>
              </div>
              {zipBefore.map((c, i) => (
                <div
                  key={c.app}
                  className="zb-task"
                  style={{
                    left: `${c.x}%`,
                    top: `${c.y}%`,
                    ["--r" as string]: `${c.r}deg`,
                    animationDelay: `${i * -0.7}s`,
                  }}
                >
                  <span className="zb-app">{c.app}</span>
                  {c.text}
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <StageControls>
        <Pills
          name="zip"
          value={mode}
          onChange={setMode}
          options={[
            { value: "before", label: "Before" },
            { value: "after", label: "After" },
          ]}
        />
        <span className="stage-caption">
          {mode === "before"
            ? "One listing, retyped for every task"
            : "Register once, work from everywhere"}
        </span>
      </StageControls>
    </>
  );
}

/* ───────────────────── PEBO · the working app ───────────────────── */

/* The Pebbo app itself, working (components/PebboPhone.tsx): type how eating felt, or try a starter. */
const PEBBO_STARTERS = [
  { label: "Skipped lunch, then chips", say: "Skipped lunch, then ate a whole bag of chips" },
  { label: "Craving sweets", say: "Craving sweets again tonight" },
  { label: "Cooked breakfast!", say: "Cooked a real breakfast today!" },
];

export function PebboStage() {
  const active = useActive("pebbo");
  const api = useRef<PebboPhoneApi | null>(null);
  const [state, setState] = useState<PebboPhoneState>({ chatting: false, busy: false, live: false });
  return (
    <>
      <div className="stage-visual pebbo-app-stage">
        <PebboPhone active={active} api={api} onState={setState} fit="stage" />
      </div>
      <StageControls>
        <div className="stage-starters" role="group" aria-label="Try saying">
          {PEBBO_STARTERS.map((s) => (
            <button key={s.label} type="button" onClick={() => api.current?.send(s.say)} disabled={state.busy}>
              {s.label}
            </button>
          ))}
        </div>
        <p className="pebbo-stage-cap">
          Working prototype. Hold any of Pebbo’s messages for the menu.
          {state.chatting && (
            <button type="button" onClick={() => api.current?.reset()}>
              Start over
            </button>
          )}
        </p>
      </StageControls>
    </>
  );
}

/* ───────────────────── MELN · the inbox that knows you ───────────────────── */

/* The Melon prototype, as recorded: chapters jump through the 43-second walkthrough. */
const MELON_CHAPTERS = [
  { t: 0, label: "Triage" },
  { t: 9, label: "Filter" },
  { t: 15, label: "Calendar" },
  { t: 21, label: "AI summary" },
  { t: 27, label: "All clear" },
  { t: 33, label: "Ask Melon" },
];

export function MelonStage() {
  const active = useActive("melon");
  const video = useRef<HTMLVideoElement>(null);
  const [chapter, setChapter] = useState(0);
  const [playing, setPlaying] = useState(false);
  // Set by a pause the visitor chose, so leaving and coming back doesn't restart it
  const held = useRef(false);

  // Plays only while the page is on screen, and never on its own with reduced motion
  useEffect(() => {
    const v = video.current;
    if (!v) return;
    if (active && !held.current && !reducedMotion()) v.play().catch(() => {});
    if (!active) v.pause();
  }, [active]);

  const seek = (i: number) => {
    const v = video.current;
    if (!v) return;
    v.currentTime = MELON_CHAPTERS[i].t;
    setChapter(i);
    held.current = false;
    v.play().catch(() => {});
  };
  const toggle = () => {
    const v = video.current;
    if (!v) return;
    if (v.paused) {
      held.current = false;
      v.play().catch(() => {});
    } else {
      held.current = true;
      v.pause();
    }
  };
  const onTime = () => {
    const t = video.current?.currentTime ?? 0;
    let i = 0;
    MELON_CHAPTERS.forEach((c, k) => {
      if (t >= c.t) i = k;
    });
    setChapter((c) => (c === i ? c : i));
  };

  return (
    <>
      <div className="stage-visual melon-stage">
        <div className="melon-demo">
          <video
            ref={video}
            className="melon-video"
            poster="/work/melon/melon-poster.webp"
            muted
            loop
            playsInline
            preload="metadata"
            aria-label="Screen recording of the Melon prototype: sorting and bulk-clearing updates, filtering by department and sender, a calendar of what's due, an AI summary with quick actions, and asking Melon a question."
            onTimeUpdate={onTime}
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
          >
            {/* H.264 for Safari and most browsers; VP9 for builds without it */}
            <source src="/work/melon/melon-demo.mp4" type='video/mp4; codecs="avc1.640028"' />
            <source src="/work/melon/melon-demo.webm" type='video/webm; codecs="vp9"' />
          </video>
        </div>
      </div>
      <StageControls>
        <Pills
          name="Jump to a part of the recording"
          value={chapter}
          onChange={seek}
          options={MELON_CHAPTERS.map((c, i) => ({ value: i, label: c.label }))}
        />
        <button className="stage-btn" onClick={toggle} aria-label={playing ? "Pause the recording" : "Play the recording"}>
          {playing ? (
            <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden>
              <rect x="2" y="1.5" width="2.6" height="9" rx="0.6" fill="currentColor" />
              <rect x="7.4" y="1.5" width="2.6" height="9" rx="0.6" fill="currentColor" />
            </svg>
          ) : (
            <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden>
              <path d="M3 1.8v8.4a.6.6 0 0 0 .9.5l6.8-4.2a.6.6 0 0 0 0-1L3.9 1.3a.6.6 0 0 0-.9.5Z" fill="currentColor" />
            </svg>
          )}
        </button>
        <span className="stage-caption">Working prototype.</span>
      </StageControls>
    </>
  );
}

/* ───────────────────── WISH · make a wish ───────────────────── */

const wishColors = [
  "#FF9FD1",
  "#8FE3FF",
  "#FFE27A",
  "#B6FFA8",
  "#C9A8FF",
  "#FFB38A",
];

export function WishStage() {
  const [wishes, setWishes] = useState<
    { id: number; c: string; x: number; y: number }[]
  >([]);
  const n = useRef(0);
  const make = () => {
    n.current += 1;
    const id = n.current;
    setWishes((w) => [
      ...w.slice(-24),
      {
        id,
        c: wishColors[id % wishColors.length],
        x: 44 + Math.random() * 22,
        y: 12 + Math.random() * 18,
      },
    ]);
  };
  return (
    <>
      <div className="stage-visual wish-stage">
        <div className="wish-frame">
          <img
            src="/fun/wish-tree.webp"
            alt="A glowing tree on a hill, lit by colorful wish ribbons, with a person in a VR headset looking up at it."
            loading="lazy"
          />
          {wishes.map((w) => (
            <motion.span
              key={w.id}
              className="wish"
              style={{ ["--c" as string]: w.c }}
              initial={{ left: "73%", top: "66%", opacity: 0, scale: 0.4 }}
              animate={{
                left: ["73%", "64%", `${w.x}%`],
                top: ["66%", "44%", `${w.y}%`],
                opacity: [0, 1, 1],
                scale: [0.4, 1, 0.8],
              }}
              transition={{
                duration: reducedMotion() ? 0 : 2.2,
                ease: "easeOut",
                times: [0, 0.45, 1],
              }}
              aria-hidden
            />
          ))}
        </div>
      </div>
      <StageControls>
        <button className="stage-btn stage-btn--label" onClick={make}>
          <Sparkle size={11} /> Make a wish
        </button>
        <span className="stage-caption" aria-live="polite">
          ~100 wishes at the 2023 show, +
          <Roll
            value={String(wishes.length ? n.current : 0)}
            className="stage-num"
          />{" "}
          here
        </span>
      </StageControls>
    </>
  );
}

/* ───────────────────── BAKE · card stack ───────────────────── */

const tilts = [-4, 3, -2, 5];
const REDACT = { recipe: [92, 70, 84, 58, 76], spot: [80, 52, 66] };

/** The back of a polaroid: a recipe card, or the brunch tip. Empty = "classified". */
function BakeBack({ bake }: { bake: Bake }) {
  const b = bake.back;
  const filled = b.kind === "recipe" ? b.ingredients.length > 0 || b.method.length > 0 : !!b.name;
  return (
    <>
      <p className="bake-back-k">{b.title}</p>
      <p className="bake-back-h">{b.kind === "spot" && b.name ? b.name : bake.cap}</p>
      {filled ? (
        b.kind === "recipe" ? (
          <div className="bake-back-body">
            {b.ingredients.length > 0 && (
              <ul className="bake-back-list">
                {b.ingredients.map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
            )}
            {b.method.length > 0 && (
              <ol className="bake-back-list bake-back-list--steps">
                {b.method.map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ol>
            )}
          </div>
        ) : (
          <div className="bake-back-body">
            {b.area && <p className="bake-back-row">📍 {b.area}</p>}
            {b.order && (
              <p className="bake-back-row">
                <b>Order:</b> {b.order}
              </p>
            )}
          </div>
        )
      ) : (
        <div className="bake-back-body">
          <span className="bake-redact" aria-hidden>
            {REDACT[b.kind].map((w, i) => (
              <span key={i} style={{ width: `${w}%` }} />
            ))}
          </span>
          <p className="bake-back-note">{b.sealed}</p>
        </div>
      )}
    </>
  );
}

export function BakeryStage() {
  const [order, setOrder] = useState([0, 1, 2, 3]);
  const [flip, setFlip] = useState(false);
  const dragged = useRef(false);
  const next = () => {
    setFlip(false);
    setOrder((o) => [...o.slice(1), o[0]]);
  };
  const prev = () => {
    setFlip(false);
    setOrder((o) => [o[o.length - 1], ...o.slice(0, -1)]);
  };
  return (
    <>
      <div className="stage-visual stack">
        {order
          .map((idx, pos) => ({ idx, pos }))
          .reverse()
          .map(({ idx, pos }) => {
            const b = bakes[idx];
            const top = pos === 0;
            const flipped = top && flip;
            const what = b.back.kind === "recipe" ? "Secret recipe" : "Brunch spot";
            return (
              <motion.figure
                key={b.src}
                className="stack-card bake-card"
                style={{ zIndex: 10 - pos }}
                animate={{
                  rotate: tilts[pos],
                  x: pos * 14 - 21,
                  y: pos * 6 - 9,
                  scale: 1 - pos * 0.035,
                }}
                transition={{ type: "spring", stiffness: 300, damping: 28 }}
                drag={top ? "x" : false}
                dragSnapToOrigin
                dragElastic={0.6}
                onPointerDown={() => (dragged.current = false)}
                onDragStart={() => (dragged.current = true)}
                onDragEnd={(_, info) => {
                  if (Math.abs(info.offset.x) > 90) next();
                }}
                onTap={() => {
                  if (top && !dragged.current) setFlip((f) => !f);
                }}
                onKeyDown={(e) => {
                  // Enter already counts as a tap (motion's press gesture); Space is ours
                  if (!top) return;
                  dragged.current = false;
                  if (e.key === " ") {
                    e.preventDefault();
                    setFlip((f) => !f);
                  }
                }}
                role={top ? "button" : undefined}
                tabIndex={top ? 0 : -1}
                aria-pressed={top ? flipped : undefined}
                aria-label={top ? `${b.cap}. ${flipped ? "Showing the back; press to see the photo" : `Flip for the ${what.toLowerCase()}`}` : undefined}
                aria-hidden={top ? undefined : true}
                whileDrag={{ scale: 1.03, rotate: 0, cursor: "grabbing" }}
              >
                <motion.div
                  className="bake-flip"
                  initial={false}
                  animate={{ rotateY: flipped ? 180 : 0 }}
                  transition={{ type: "spring", stiffness: 190, damping: 22 }}
                  style={{ transformPerspective: 1200 }}
                >
                  <div className="bake-face bake-front" aria-hidden={flipped || undefined}>
                    <span className="tape-strip" aria-hidden />
                    <img src={b.src} alt={b.alt} draggable={false} loading="lazy" />
                    <span className="bake-tag" aria-hidden>
                      {what}
                      <ReplayIcon size={11} />
                    </span>
                    <figcaption>{b.cap}</figcaption>
                  </div>
                  <div className="bake-face bake-back" data-kind={b.back.kind} aria-hidden={!flipped || undefined}>
                    <BakeBack bake={b} />
                  </div>
                </motion.div>
              </motion.figure>
            );
          })}
      </div>
      <StageControls>
        <button className="stage-btn" onClick={prev} aria-label="Previous bake">
          <ChevronLeft />
        </button>
        <span className="stage-caption stage-caption--num">
          <Roll value={String(order[0] + 1)} className="stage-num" /> /{" "}
          {bakes.length}
        </span>
        <button className="stage-btn" onClick={next} aria-label="Next bake">
          <ChevronRight />
        </button>
        <span className="michelin">★ Michelin-starred kitchen alum</span>
      </StageControls>
    </>
  );
}

/* ───────────────────── LAB · toys ───────────────────── */

export function LabStage() {
  const { notify } = useShell();
  const [shown, setShown] = useState(false);
  const [tabs, setTabs] = useState(47);
  return (
    <>
      <div className="stage-visual lab-stage">
        <div className="lab">
          <div className="toy">
            <span className="toy-label">Coffee this semester</span>
            <div className="toy-balance">
              {shown ? (
                <Roll value="$412.75" />
              ) : (
                <span className="toy-mask">$•••.••</span>
              )}
              <button
                className="icon-btn"
                onClick={() => setShown((s) => !s)}
                aria-label={shown ? "Hide balance" : "Show balance"}
              >
                <EyeIcon off={!shown} />
              </button>
            </div>
            <span className="toy-note">
              {shown
                ? "For research, obviously."
                : "Hidden, like any good balance."}
            </span>
          </div>
          <div className="toy">
            <span className="toy-label">Principle #4</span>
            <HoldButton doneText="Fine. Prototyping instead.">
              Hold to overthink
            </HoldButton>
          </div>
          <div className="toy">
            <span className="toy-label">Deploy</span>
            <SlideToConfirm
              id="slide-ship"
              label="Slide to ship it"
              done="Shipped (to staging)"
              onConfirm={() => notify("Shipped. To staging. Relax.")}
            />
            <span className="toy-note">
              Slide, don&rsquo;t tap. Some things deserve a gesture.
            </span>
          </div>
          <div className="toy">
            <span className="toy-label">Tabs open</span>
            <div className="toy-balance">
              <Roll value={String(tabs)} />
              <button
                className="toy-plus"
                onClick={() => setTabs((t) => t + 1)}
                aria-label="Open another tab"
              >
                +1
              </button>
              <button
                className="toy-plus"
                onClick={() => setTabs(3)}
                aria-label="Close most tabs"
              >
                ×
              </button>
            </div>
            <span className="toy-note">
              {tabs >= 52
                ? "Okay, that's a lot."
                : tabs <= 3
                  ? "Wow. Inbox zero energy."
                  : "Research, allegedly."}
            </span>
          </div>
        </div>
      </div>
      <StageControls>
        <span className="stage-caption">
          Four toys. Prototype before overthinking.
        </span>
      </StageControls>
    </>
  );
}

/* ───────────────────── About · photo collage ───────────────────── */

const collage = [
  {
    src: "/about/portrait.webp",
    alt: "Chaewon on a street in Tokyo at night",
    cap: "me, in Tokyo",
    x: 10,
    y: 0,
    w: 24,
    r: -3,
    d: 1.4,
    cls: "tall",
  },
  {
    src: "/about/nyc-chalkboard.webp",
    alt: "A chalkboard drawing titled Everyday in New York",
    cap: "everyday in New York",
    x: 44,
    y: 2,
    w: 34,
    r: 3,
    d: 0.8,
    cls: "",
  },
  {
    src: "/about/student-id.webp",
    alt: "Chaewon's Carnegie Mellon student ID",
    cap: "cmu, go tartans!",
    x: 40,
    y: 54,
    w: 26,
    r: -4,
    d: 1.1,
    cls: "",
  },
  {
    src: "/about/daejeon.webp",
    alt: "Daejeon Expo Bridge on a clear day",
    cap: "home, Daejeon",
    x: 70,
    y: 40,
    w: 20,
    r: 4,
    d: 0.6,
    cls: "tall",
  },
  {
    src: "/about/cats.webp",
    alt: "Chaewon holding two cats next to a Christmas tree",
    cap: "foster duty",
    x: 1,
    y: 70,
    w: 18,
    r: 5,
    d: 0.9,
    cls: "",
  },
  {
    src: "/about/mets.webp",
    alt: "At a Mets game, holding up a Let's Go Mets sign",
    cap: "let's go mets",
    x: 21,
    y: 73,
    w: 16,
    r: -6,
    d: 1.3,
    cls: "",
  },
];

export function AboutStage() {
  const ref = useRef<HTMLDivElement>(null);
  const { goTo } = useShell();
  const onMove = (e: React.PointerEvent) => {
    const el = ref.current;
    if (!el || reducedMotion()) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", String((e.clientX - r.left) / r.width - 0.5));
    el.style.setProperty("--my", String((e.clientY - r.top) / r.height - 0.5));
  };
  return (
    <>
      <div className="stage-visual collage-stage">
        <div
          className="collage"
          ref={ref}
          onPointerMove={onMove}
          onPointerLeave={() => ref.current?.style.setProperty("--mx", "0")}
        >
          {collage.map((c) => (
            <figure
              key={c.src}
              className={`polaroid collage-item${c.cls ? ` collage-item--${c.cls}` : ""}`}
              style={{
                left: `${c.x}%`,
                top: `${c.y}%`,
                width: `${c.w}%`,
                ["--r" as string]: `${c.r}deg`,
                ["--d" as string]: c.d,
              }}
            >
              <span className="tape-strip" aria-hidden />
              <img src={c.src} alt={c.alt} loading="lazy" />
              <figcaption>{c.cap}</figcaption>
            </figure>
          ))}
        </div>
      </div>
      <StageControls>
        <span className="stage-caption">New York · Daejeon · Pittsburgh</span>
        <button
          className="stage-btn stage-btn--label"
          onClick={() => goTo("hi")}
        >
          Say hi →
        </button>
      </StageControls>
    </>
  );
}

/* ───────────────────── Say hi ───────────────────── */

/* The note folds in thirds, drops into an envelope, gets sealed and flies off.
   The click copies the email (it has to happen inside the click); the end state
   says so honestly and offers the mail app. */
type HiPhase = "idle" | "fold" | "pack" | "seal" | "fly" | "sent";
const HI_STEPS: [HiPhase, number][] = [
  ["fold", 0],
  ["pack", 700],
  ["seal", 1400],
  ["fly", 2050],
  ["sent", 2750],
];
const HI_NOTE = "/about/end-note.webp";

export function HiStage() {
  const [phase, setPhase] = useState<HiPhase>("idle");
  const [round, setRound] = useState(0);
  const timers = useRef<number[]>([]);
  const again = useRef<HTMLButtonElement>(null);
  const mailto = `mailto:${profile.email}?subject=${encodeURIComponent("Hi Chaewon")}`;

  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), []);
  useEffect(() => {
    if (phase === "sent") again.current?.focus({ preventScroll: true });
  }, [phase]);

  const send = () => {
    if (phase !== "idle") return;
    try {
      void navigator.clipboard?.writeText(profile.email).catch(() => {});
    } catch {
      /* the end state still shows the address */
    }
    if (reducedMotion()) {
      setPhase("sent");
      return;
    }
    timers.current = HI_STEPS.map(([ph, t]) => window.setTimeout(() => setPhase(ph), t));
  };
  const reset = () => {
    timers.current.forEach((t) => window.clearTimeout(t));
    setRound((r) => r + 1); // a fresh sheet, not the old one flying back
    setPhase("idle");
  };

  const busy = phase !== "idle" && phase !== "sent";
  return (
    <>
      <div className="stage-visual hi-stage">
        <div className="hi" data-phase={phase}>
          <div className="hi-scene">
            <div className="hi-fly" key={round}>
              <span className="hi-env hi-env-back" aria-hidden />
              <figure className="hi-letter">
                <span className="tape-strip" aria-hidden />
                {(["top", "mid", "bot"] as const).map((k) => (
                  <span className={`hi-fold hi-fold--${k}`} key={k} aria-hidden={k !== "mid" || undefined}>
                    <span className="hi-face" style={{ backgroundImage: `url(${HI_NOTE})` }} />
                    <span className="hi-face hi-face--back" />
                  </span>
                ))}
                <img
                  className="sr-only"
                  loading="lazy"
                  src={HI_NOTE}
                  alt="Handwritten note: You scrolled all the way to the end! We should grab tea and talk about half-formed ideas or what we could build together. Find me at chaewon2@andrew.cmu.edu"
                />
              </figure>
              <span className="hi-env hi-env-front" aria-hidden />
              <span className="hi-env hi-env-flap" aria-hidden />
              <span className="hi-env-seal" aria-hidden>
                hi
              </span>
            </div>

            <div className="hi-sent" aria-hidden={phase !== "sent"}>
              <span className="hi-sent-icon" aria-hidden>
                <MailIcon size={20} />
              </span>
              <p className="hi-sent-h">Sealed. Your turn to hit send.</p>
              <p className="hi-sent-p">
                My email is on your clipboard:
                <br />
                <span className="hi-email">{profile.email}</span>
              </p>
              <button ref={again} className="hi-again" onClick={reset} tabIndex={phase === "sent" ? 0 : -1}>
                <ReplayIcon size={14} /> Fold another
              </button>
            </div>
          </div>

          {phase === "sent" ? (
            <a className="hi-send" href={mailto}>
              <MailIcon size={16} /> Open my mail app
            </a>
          ) : (
            <button className="hi-send" onClick={send} disabled={busy} aria-busy={busy || undefined}>
              <MailIcon size={16} /> {busy ? "Sealing…" : "Send a hi"}
            </button>
          )}
          <p className="sr-only" aria-live="polite">
            {phase === "sent" ? `Email copied: ${profile.email}` : ""}
          </p>

          <p className="hi-links">
            <a href={profile.links.linkedin} target="_blank" rel="noreferrer">
              LinkedIn ↗
            </a>
            <a href={profile.links.resume} target="_blank" rel="noreferrer">
              Resume ↗
            </a>
          </p>
        </div>
      </div>
      <StageControls>
        <span className="stage-caption">
          You made it to the end of the tape.
        </span>
      </StageControls>
    </>
  );
}

/* ───────────────────── shared ───────────────────── */

export function StageControls({ children }: { children: React.ReactNode }) {
  return <div className="stage-controls">{children}</div>;
}
