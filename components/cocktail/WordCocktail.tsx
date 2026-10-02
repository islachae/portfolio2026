"use client";

/**
 * Word Cocktail: some words don't come in English, so here is the recipe.
 *
 * One continuous scene. The 3D objects (CocktailScene → bar.ts) sit on a canvas behind this
 * layer and follow two invisible anchors; this file runs the phases and draws the type around
 * them. Two things are asked of the visitor: MAKE, and HOLD TO SHAKE. The rest unfolds.
 *
 *   hero → mix (auto pours) → hold → shake → pour → garnish → final (receipt prints)
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { AnimatePresence, motion } from "motion/react";
import { cocktailCopy as copy, isReady, menu, shotLabel, type ReadyCocktail } from "@/content/cocktails";
import { reducedMotion, useShell } from "../shell-context";
import { clock, mixPlan, T, type Phase } from "./timeline";
import type { BarStore } from "./bar";
import { Receipt } from "./Receipt";

const Scene = dynamic(() => import("./CocktailScene"), { ssr: false });

const now = () => clock.now();
const langOf = (code: string) => ({ KR: "ko", JP: "ja", CN: "zh", PT: "pt" })[code] ?? "en";
const ease = [0.16, 1, 0.3, 1] as const;
const spring = { type: "spring", stiffness: 420, damping: 30 } as const;

/** A hand-drawn four-point sparkle (the storyboard's ✦) */
function Sparkle({ className, style, delay = 0 }: { className?: string; style?: React.CSSProperties; delay?: number }) {
  return (
    <svg className={`wc-spark ${className ?? ""}`} style={{ ...style, animationDelay: `${delay}s` }} viewBox="0 0 24 24" aria-hidden>
      <path d="M12 1.5c.5 5.6 2.6 9.6 10 10.5-7.3.9-9.5 4.9-10 10.5-.6-5.6-2.7-9.6-10-10.5 7.3-.9 9.4-4.9 10-10.5z" />
    </svg>
  );
}

function Arrow({ dir }: { dir: "left" | "right" }) {
  return (
    <svg viewBox="0 0 40 20" aria-hidden className="wc-arrow-svg">
      {dir === "left" ? <path d="M38 10H3m8-7.5L3 10l8 7.5" /> : <path d="M2 10h35m-8-7.5L37 10l-8 7.5" />}
    </svg>
  );
}

/** The bartender's line, typed out once the bar is in view. Types once per visit to the hero. */
function Typed({ lines, run }: { lines: string[]; run: boolean }) {
  const full = lines.join("\n");
  const [n, setN] = useState(0);
  const started = useRef(false);
  useEffect(() => {
    if (!run || started.current) return;
    started.current = true;
    if (reducedMotion()) {
      setN(full.length);
      return;
    }
    let i = 0;
    let id = 0;
    const tick = () => {
      i++;
      setN(i);
      if (i >= full.length) return;
      const ch = full[i - 1];
      // a beat at the line break and after the full stop, like someone actually typing
      id = window.setTimeout(tick, ch === "\n" ? 320 : ch === "." || ch === "!" ? 200 : 26 + Math.random() * 30);
    };
    id = window.setTimeout(tick, 420);
    return () => window.clearTimeout(id);
  }, [run, full]);
  const done = n >= full.length;
  let from = 0;
  return (
    <p className="wc-lede" aria-label={lines.join(" ")}>
      {/* every line is there from the start; what hasn't been typed yet is only hidden, so nothing moves.
          The first line is the statement (large), the rest sit under it (small) */}
      {lines.map((l, i) => {
        const k = Math.max(0, Math.min(l.length, n - from));
        const caret = n >= from && n <= from + l.length;
        from += l.length + 1;
        return (
          <span key={i} className="wc-lede-line" data-lead={i === 0 || undefined} aria-hidden>
            {l.slice(0, k)}
            {caret && <span className="wc-caret" data-done={done || undefined} />}
            <span className="wc-lede-rest">{l.slice(k)}</span>
          </span>
        );
      })}
    </p>
  );
}

/** Handwritten note */
function Note({ children, className, show, delay = 0, rotate = -6 }: { children: React.ReactNode; className?: string; show: boolean; delay?: number; rotate?: number }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.span
          className={`wc-note ${className ?? ""}`}
          initial={{ opacity: 0, scale: 0.6, rotate: rotate - 8 }}
          animate={{ opacity: 1, scale: 1, rotate, transition: { type: "spring", stiffness: 520, damping: 18, delay } }}
          exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.18 } }}
          aria-hidden
        >
          {children}
        </motion.span>
      )}
    </AnimatePresence>
  );
}

export function WordCocktail({ active, near = false }: { active: boolean; near?: boolean }) {
  const { notify } = useShell();
  const [idx, setIdx] = useState(0);
  const word = menu[idx];
  const [phase, setPhase] = useState<Phase>("hero");
  const [made, setMade] = useState<ReadyCocktail | null>(null);
  const [step, setStep] = useState(-1);
  const [order, setOrder] = useState(1);
  const [sceneOn, setSceneOn] = useState(false);
  const [sceneReady, setSceneReady] = useState(false);
  const [noGL, setNoGL] = useState(false);
  const [bg, setBg] = useState("#f3eee5");
  const [holding, setHolding] = useState(false);
  const [plop, setPlop] = useState(false);
  /** the garnish beat's lines, one at a time: 0 "One last thing…", 1 "Garnish with", 2 + the name */
  const [gBeat, setGBeat] = useState(0);
  const [shared, setShared] = useState<"" | "shared" | "copied">("");

  const root = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const mainA = useRef<HTMLDivElement>(null);
  const finalA = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLButtonElement>(null);
  const timers = useRef<number[]>([]);
  const hold = useRef({ p: 0, on: false, done: false, last: 0 });

  const store = useRef<BarStore>({
    phase: "hero",
    t0: 0,
    cocktail: menu[0],
    plan: null,
    hold: 0,
    wordT0: -10,
    wordDir: 1,
    pointer: { x: 0, y: 0, t: -10 },
    anchors: { main: null, final: null },
    canvas: null,
    reduced: false,
    intensity: 0,
  }).current;

  const plan = useMemo(() => (made ? mixPlan(made) : null), [made]);
  const reduced = () => reducedMotion();

  /* ───────────── phases ───────────── */

  const clear = () => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
  };
  const later = (s: number, fn: () => void) => {
    timers.current.push(window.setTimeout(fn, s * 1000));
  };
  const go = useCallback(
    (p: Phase) => {
      store.phase = p;
      store.t0 = now();
      store.reduced = reducedMotion();
      setPhase(p);
    },
    [store]
  );

  const make = () => {
    if (!isReady(word) || phase !== "hero") return;
    const r = reduced();
    const pl = mixPlan(word);
    clear();
    setMade(word);
    store.cocktail = word;
    store.plan = pl;
    store.hold = 0;
    hold.current = { p: 0, on: false, done: false, last: 0 };
    setStep(-1);
    setPlop(false);
    setShared("");
    go("mix");
    if (r) {
      setStep(pl.steps.length - 1);
      later(0.5, () => go("hold"));
      return;
    }
    pl.steps.forEach((s) => later(s.start, () => setStep(s.index)));
    later(pl.end + T.cap, () => go("hold"));
  };

  const shaken = useCallback(() => {
    const r = reducedMotion();
    clear();
    go("shake");
    const d = (s: number) => (r ? Math.min(s, 0.3) : s);
    let t = d(T.shake);
    later(t, () => go("pour"));
    t += d(T.pour);
    later(t, () => {
      setGBeat(r ? 2 : 0);
      go("garnish");
    });
    if (!r) {
      later(t + T.garnishBeat, () => setGBeat(1));
      later(t + T.garnishIn, () => setGBeat(2));
    }
    later(t + (r ? 0 : T.garnishIn + 1.12), () => setPlop(true));
    t += d(T.garnish);
    later(t, () => go("final"));
  }, [go]);

  const again = () => {
    clear();
    hold.current = { p: 0, on: false, done: false, last: 0 };
    store.hold = 0;
    setHolding(false);
    setPlop(false);
    go("hero");
    // the next one gets the next order number
    setOrder((o) => {
      const n = o + 1;
      try {
        localStorage.setItem("wc-order", String(n));
      } catch {}
      return n;
    });
  };

  // a returning visitor keeps counting orders
  useEffect(() => {
    try {
      const n = Number(localStorage.getItem("wc-order"));
      if (n > 0) setOrder(n);
    } catch {}
  }, []);

  /* ───────────── the menu (← →) ───────────── */

  const browse = useCallback(
    (dir: 1 | -1) => {
      if (store.phase !== "hero") return;
      const next = (idx + dir + menu.length) % menu.length;
      store.wordDir = dir;
      store.wordT0 = now();
      store.cocktail = menu[next];
      setIdx(next);
    },
    [idx, store]
  );

  // ← → on the keyboard browse the menu while the page is on screen (↑ ↓ still flip pages)
  useEffect(() => {
    if (!active || phase !== "hero") return;
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === "ArrowLeft") browse(-1);
      else if (e.key === "ArrowRight") browse(1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, phase, browse]);

  /* ───────────── hold to shake ───────────── */

  const press = (on: boolean) => {
    if (store.phase !== "hold" || hold.current.done) return;
    hold.current.on = on;
    setHolding(on);
  };

  // one loop: hold progress, the ring, and how hard the shaker is going (for the motion lines)
  useEffect(() => {
    if (!active) return;
    let raf = 0;
    let last = performance.now();
    const tick = (ms: number) => {
      // wall-clock time (capped only for a tab coming back), so a slow device still fills in 1.5s
      const dt = Math.min(0.25, (ms - last) / 1000);
      last = ms;
      const h = hold.current;
      if (store.phase === "hold" && !h.done) {
        if (h.on) h.p = Math.min(1, h.p + (dt * 1000) / T.holdMs);
        else h.p = Math.max(0, h.p - (dt * 1000) / T.drainMs);
        store.hold = h.p;
        if (h.p >= 1) {
          h.done = true;
          h.on = false;
          setHolding(false);
          shaken();
        }
      }
      ring.current?.style.setProperty("--p", h.p.toFixed(4));
      root.current?.style.setProperty("--wc-i", Math.min(1.4, store.intensity).toFixed(3));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, store, shaken]);

  /* ───────────── lifecycle ───────────── */

  // the canvas mounts once the page is on screen or next to it (so it's warm when you arrive),
  // then stays, paused while you're elsewhere
  useEffect(() => {
    if (!(active || near) || sceneOn || noGL) return;
    // no WebGL (old device, blocked GPU): the still of the drink stands in, the rest still works
    let gl = false;
    try {
      const c = document.createElement("canvas");
      gl = !!(c.getContext("webgl2") || c.getContext("webgl"));
    } catch {}
    if (gl) setSceneOn(true);
    else setNoGL(true);
  }, [active, near, sceneOn, noGL]);

  // scrolled away mid-pour: start over next time (a finished drink stays on the bar)
  useEffect(() => {
    if (active) return;
    if (store.phase !== "hero" && store.phase !== "final") {
      clear();
      hold.current = { p: 0, on: false, done: false, last: 0 };
      store.hold = 0;
      setHolding(false);
      setPlop(false);
      go("hero");
    }
  }, [active, go, store]);

  useEffect(() => () => clear(), []);

  useEffect(() => {
    store.anchors.main = mainA.current;
    store.anchors.final = finalA.current;
    store.canvas = stage.current;
  });

  // the canvas paints the page colour, so it follows the theme
  useEffect(() => {
    const read = () => {
      const v = root.current ? getComputedStyle(root.current).getPropertyValue("--wc-bg").trim() : "";
      if (v) setBg(v);
    };
    read();
    const mo = new MutationObserver(read);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    mq.addEventListener("change", read);
    return () => {
      mo.disconnect();
      mq.removeEventListener("change", read);
    };
  }, []);

  // the olive's eye reads the room: it follows the pointer
  useEffect(() => {
    if (!active) return;
    const move = (e: PointerEvent) => {
      const el = stage.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      store.pointer.x = ((e.clientX - r.left) / r.width) * 2 - 1;
      store.pointer.y = -(((e.clientY - r.top) / r.height) * 2 - 1);
      store.pointer.t = now();
    };
    window.addEventListener("pointermove", move, { passive: true });
    // a tap counts too (phones): tap near the heart and it wakes up
    window.addEventListener("pointerdown", move, { passive: true });
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerdown", move);
    };
  }, [active, store]);

  // Development only: jump to any moment (scripts/screenshots). Stripped from production builds.
  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;
    const w = window as unknown as { __wc?: unknown };
    w.__wc = {
      clock,
      store,
      /** show a word on the menu (hero) */
      menuTo: (id: string) => {
        const i = Math.max(0, menu.findIndex((m) => m.id === id));
        store.cocktail = menu[i];
        store.wordT0 = -10;
        setIdx(i);
      },
      jump: (p: Phase, tau = 0, h = 0, snap = true, id?: string) => {
        clear();
        const c = (menu.find((m) => m.id === id && isReady(m)) as ReadyCocktail | undefined) ?? menu.find(isReady)!;
        const pl = mixPlan(c);
        setMade(c);
        store.cocktail = c;
        store.plan = pl;
        store.hold = h;
        hold.current = { p: h, on: false, done: true, last: 0 };
        setStep(p === "mix" ? pl.steps.filter((s) => s.start <= tau).length - 1 : pl.steps.length - 1);
        setPlop(p === "garnish" && tau > T.garnishIn + 1.12);
        setGBeat(p !== "garnish" ? 0 : tau >= T.garnishIn ? 2 : tau >= T.garnishBeat ? 1 : 0);
        store.phase = p;
        store.t0 = clock.now() - tau;
        store.snap = snap;
        setPhase(p);
      },
    };
  });

  // phones: the header sits above the bar; once you Make, bring the whole bar into view
  useEffect(() => {
    if (phase !== "mix" || !root.current || !window.matchMedia("(max-width: 799px)").matches) return;
    root.current.scrollIntoView({ behavior: store.reduced ? "auto" : "smooth", block: "end" });
  }, [phase, store]);

  /* ───────────── share ───────────── */

  const share = async () => {
    if (!made) return;
    const url = `${window.location.origin}${window.location.pathname}#cocktail`;
    const recipe = made.ingredients.map((i) => `${shotLabel(i.shots)} ${i.name.toLowerCase()}`).join(", ");
    const text = `I made ${made.native} (${made.word.toLowerCase()}): ${recipe}. Garnish: ${made.garnish.name.toLowerCase()}. Translation: ${made.translation.toLowerCase()}`;
    const touch = window.matchMedia("(pointer: coarse)").matches;
    if (touch && navigator.share) {
      try {
        await navigator.share({ title: `${copy.title} · ${made.word}`, text, url });
        setShared("shared");
        return;
      } catch {
        /* closed the sheet: fall through to copying */
      }
    }
    try {
      await navigator.clipboard.writeText(`${text}\n${url}`);
      notify("Recipe copied. Pour one for a friend.");
      setShared("copied");
    } catch {
      notify(url);
    }
  };

  /* ───────────── render ───────────── */

  const n = made?.ingredients.length ?? 0;
  const left = plan && step >= 0 ? [...plan.steps.slice(0, step + 1)].reverse().find((s) => s.side !== "right") : undefined;
  const pourNote = made && left ? made.ingredients[left.index].note : undefined;
  const cur = plan && step >= 0 ? plan.steps[step] : undefined;
  const status =
    phase === "mix" && made && step >= 0
      ? `${made.ingredients[step].name}, ${shotLabel(made.ingredients[step].shots)}`
      : phase === "hold"
        ? "All in. Press and hold the button to shake."
        : phase === "shake"
          ? "Shaking."
          : phase === "pour"
            ? "Pouring it out."
            : phase === "garnish" && made
              ? `Garnish with ${made.garnish.name}.`
              : phase === "final" && made
                ? `You made ${made.word}. The receipt is printing.`
                : "";

  return (
    <div
      className="wc"
      ref={root}
      data-phase={phase}
      data-word={word.status}
      data-holding={holding || undefined}
      // the drink's own colour, for the highlighter over its definition
      style={{ "--wc-liquid": (made ?? word).liquid } as React.CSSProperties}
    >
      <div className="wc-stage" ref={stage} data-ready={sceneReady || undefined}>
        {sceneOn && <Scene store={store} active={active} bg={bg} onReady={() => setSceneReady(true)} />}
      </div>

      <div className="wc-ui">
        {/* top row: the label, and the menu / pour counter */}
        <header className="wc-top">
          <AnimatePresence mode="wait" initial={false}>
            {phase === "hero" ? (
              <motion.p key="menu" className="wc-count" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                {copy.menuLabel} ({menu.length})
                <span className="wc-dots" aria-hidden>
                  {menu.map((m, i) => (
                    <i key={m.id} data-on={i === idx || undefined} data-soon={m.status === "soon" || undefined} />
                  ))}
                </span>
              </motion.p>
            ) : phase !== "final" && made ? (
              <motion.p key="count" className="wc-count" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <span className="wc-count-n">
                  {String(Math.max(1, Math.min(n, phase === "mix" ? step + 1 : n))).padStart(2, "0")} / {String(n).padStart(2, "0")}
                </span>
                <span className="wc-count-word" lang={langOf(made.code)}>
                  {made.native}
                </span>
              </motion.p>
            ) : null}
          </AnimatePresence>
        </header>

        {/* ── HERO ── */}
        <AnimatePresence>
          {phase === "hero" && (
            <motion.div
              key="intro"
              className="wc-intro"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0, transition: { duration: 0.6, ease, delay: 0.15 } }}
              exit={{ opacity: 0, y: -8, transition: { duration: 0.25 } }}
            >
              <Typed lines={copy.intro} run={active} />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="wc-anchor wc-anchor--main" ref={mainA}>
          {/* a still of the drink while the 3D warms up (light theme; the canvas fades in over it) */}
          {phase === "hero" && idx === 0 && (
            // eslint-disable-next-line @next/next/no-img-element
            <img className="wc-poster" src="/fun/word-cocktail-glass.webp" alt="" aria-hidden data-keep={noGL || undefined} data-gone={(sceneReady && !noGL) || undefined} />
          )}
          {/* hero: browse the menu */}
          <AnimatePresence>
            {phase === "hero" && (
              <motion.div className="wc-browse" initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { delay: 0.25 } }} exit={{ opacity: 0, transition: { duration: 0.15 } }}>
                <button className="wc-nav wc-nav--prev" onClick={() => browse(-1)} aria-label="Previous word">
                  <Arrow dir="left" />
                </button>
                <button className="wc-nav wc-nav--next" onClick={() => browse(1)} aria-label="Next word">
                  <Arrow dir="right" />
                </button>
                <Sparkle className="wc-s1" delay={0.4} />
                <Sparkle className="wc-s2" delay={1.6} />
                <Note show={word.status === "soon"} className="wc-note--soon" rotate={-5}>
                  still mixing…
                </Note>
              </motion.div>
            )}
          </AnimatePresence>

          {/* pours: a note now and then */}
          <Note show={phase === "mix" && !!pourNote} className="wc-note--pour" rotate={-8}>
            {pourNote}
          </Note>
          {phase === "mix" && <Sparkle className="wc-s3" delay={0.2} />}

          {/* hold */}
          <Note show={phase === "hold"} className="wc-note--shake" rotate={-14} delay={0.35}>
            Shake
            <br />
            it!
          </Note>
          <Note show={phase === "shake"} className="wc-note--shaking" rotate={-10}>
            {copy.shaking}
          </Note>
          <svg className="wc-lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
            <path d="M8 34 Q3 50 8 66" />
            <path d="M2 40 Q-1 50 2 60" />
            <path d="M92 30 Q97 46 92 62" />
            <path d="M98 38 Q101 48 98 58" />
          </svg>

          {/* pour + garnish */}
          <Note show={phase === "pour"} className="wc-note--pourout" rotate={-12} delay={0.5}>
            Pour
            <br />
            it out!
            <svg className="wc-note-arrow" viewBox="0 0 60 40" aria-hidden>
              <path d="M4 4c10 18 24 26 46 28m-9-9 9 9-11 5" />
            </svg>
          </Note>
          <Note show={phase === "garnish" && plop} className="wc-note--plop" rotate={-10}>
            plop!
          </Note>
        </div>

        <AnimatePresence mode="popLayout" initial={false}>
          {phase === "hero" && (
            <motion.div
              key={word.id}
              className="wc-word"
              initial={{ opacity: 0, x: 24 * store.wordDir }}
              animate={{ opacity: 1, x: 0, transition: { ...spring, delay: 0.12 } }}
              exit={{ opacity: 0, x: -24 * store.wordDir, transition: { duration: 0.16 } }}
            >
              <p className="wc-native" lang={langOf(word.code)}>
                {word.native}
              </p>
              <p className="wc-roman">{word.word}</p>
              <p className="wc-lang">{word.lang}</p>
              <p className="wc-meaning">{word.meaning}</p>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {phase === "hero" && (
            <motion.div
              key="cta"
              className="wc-cta-row"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0, transition: { ...spring, delay: 0.2 } }}
              exit={{ opacity: 0, y: 8, transition: { duration: 0.18 } }}
            >
              {isReady(word) ? (
                <button className="wc-cta" onClick={make}>
                  Make {word.word}
                  <svg viewBox="0 0 20 20" aria-hidden className="wc-cta-arrow">
                    <path d="M3 10h13m-5-5 5 5-5 5" />
                  </svg>
                </button>
              ) : (
                <span className="wc-cta wc-cta--soon" aria-disabled>
                  {copy.soonCta}
                </span>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── MIX: what's going in (one label, centred over the shaker: the pour happening now) ── */}
        <AnimatePresence mode="wait">
          {phase === "mix" && made && cur && (
            <motion.div
              key={`s${cur.index}`}
              className="wc-step"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0, transition: { duration: 0.32, ease } }}
              exit={{ opacity: 0, y: -6, transition: { duration: 0.16 } }}
            >
              <span className="wc-step-n">{String(cur.index + 1).padStart(2, "0")}</span>
              <span className="wc-step-name">{made.ingredients[cur.index].name}</span>
              <span className="wc-step-shots">{shotLabel(made.ingredients[cur.index].shots)}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── HOLD TO SHAKE ── */}
        <AnimatePresence>
          {phase === "hold" && (
            <motion.div
              key="hold"
              className="wc-hold"
              initial={{ opacity: 0, scale: 0.6, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 380, damping: 20, delay: 0.1 } }}
              // done: the ring pops (a little bigger, then gone) as the big shake starts
              exit={{ opacity: 0, scale: 1.3, transition: { duration: 0.32, ease } }}
            >
              <button
                ref={ring}
                className="wc-ring"
                data-on={holding || undefined}
                onPointerDown={(e) => {
                  e.preventDefault();
                  (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
                  press(true);
                }}
                onPointerUp={() => press(false)}
                onPointerCancel={() => press(false)}
                onLostPointerCapture={() => press(false)}
                onKeyDown={(e) => {
                  if ((e.key === " " || e.key === "Enter") && !e.repeat) {
                    e.preventDefault();
                    press(true);
                  }
                }}
                onKeyUp={(e) => {
                  if (e.key === " " || e.key === "Enter") press(false);
                }}
                onContextMenu={(e) => e.preventDefault()}
                aria-label="Hold to shake. Press and hold (Space works too)."
              >
                <svg className="wc-ring-svg" viewBox="0 0 120 120" aria-hidden>
                  <defs>
                    <linearGradient id="wc-ring-g" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0" stopColor="#c9b2ff" />
                      <stop offset=".5" stopColor="#9cc8ff" />
                      <stop offset="1" stopColor="#ffadd2" />
                    </linearGradient>
                  </defs>
                  <circle className="wc-ring-track" cx="60" cy="60" r="55" />
                  <circle className="wc-ring-fill" cx="60" cy="60" r="55" pathLength={1} />
                </svg>
                <span className="wc-ring-text">
                  {copy.hold[0]}
                  <br />
                  {copy.hold[1]}
                </span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── GARNISH: one line at a time ── */}
        <AnimatePresence mode="wait">
          {phase === "garnish" && made && gBeat === 0 && (
            <motion.p
              key="lead"
              className="wc-garnish wc-garnish-lead"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0, transition: { duration: 0.4, ease } }}
              exit={{ opacity: 0, y: -8, transition: { duration: 0.2 } }}
            >
              {copy.garnishLead}
            </motion.p>
          )}
          {phase === "garnish" && made && gBeat > 0 && (
            <motion.p key="with" className="wc-garnish wc-garnish-name" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.25 } }}>
              <motion.span className="wc-garnish-k" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0, transition: { duration: 0.35, ease } }}>
                {copy.garnishWith}
              </motion.span>
              {/* always there (it holds its line), shown when its turn comes */}
              <motion.span
                className="wc-garnish-v"
                initial={false}
                animate={gBeat > 1 ? { opacity: 1, y: 0, scale: 1, transition: spring } : { opacity: 0, y: 10, scale: 0.96, transition: { duration: 0 } }}
              >
                {made.garnish.name}
              </motion.span>
            </motion.p>
          )}
        </AnimatePresence>

        {/* ── FINAL ── */}
        <div className="wc-final" aria-hidden={phase !== "final"}>
          <div className="wc-made">
            <AnimatePresence>
              {phase === "final" && made && (
                <motion.div key="made" className="wc-made-text" initial="off" animate="on" exit="off" variants={{ on: { transition: { staggerChildren: 0.07, delayChildren: 0.15 } } }}>
                  {[
                    <p key="a" className="wc-made-k">
                      {copy.youMade}
                    </p>,
                    <p key="b" className="wc-made-native" lang={langOf(made.code)}>
                      {made.native}
                    </p>,
                    <p key="c" className="wc-made-roman">
                      {made.word}
                    </p>,
                    <p key="d" className="wc-made-means">
                      <span className="wc-made-means-k">{copy.means}</span>
                      <span className="wc-made-meaning">
                        <span className="wc-hl">{made.meaning}</span>
                      </span>
                    </p>,
                  ].map((el) => (
                    <motion.div
                      key={el.key}
                      variants={{ off: { opacity: 0, y: 10, transition: { duration: 0.2 } }, on: { opacity: 1, y: 0, transition: { duration: 0.5, ease } } }}
                    >
                      {el}
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
            <div className="wc-anchor wc-anchor--final" ref={finalA}>
              {noGL && phase === "final" && (
                // eslint-disable-next-line @next/next/no-img-element
                <img className="wc-poster" src="/fun/word-cocktail-glass.webp" alt="" aria-hidden data-keep />
              )}
              <AnimatePresence>
                {phase === "final" && made && (
                  <motion.span
                    className="wc-aside"
                    initial={{ opacity: 0, scale: 0.7, rotate: -18 }}
                    animate={{ opacity: 1, scale: 1, rotate: -9, transition: { type: "spring", stiffness: 420, damping: 16, delay: 0.9 } }}
                    exit={{ opacity: 0, transition: { duration: 0.15 } }}
                    aria-hidden
                  >
                    <svg viewBox="0 0 160 80" preserveAspectRatio="none" aria-hidden>
                      <path d="M150 34c4 22-38 40-80 40C26 74 4 60 8 40 12 16 52 5 86 6c38 1 62 12 66 30-2 12-24 18-46 20" />
                    </svg>
                    <span>{made.aside}</span>
                  </motion.span>
                )}
              </AnimatePresence>
              {phase === "final" && <Sparkle className="wc-s4" delay={1.1} />}
            </div>
          </div>
          <div className="wc-print">
            {phase === "final" && made && <Receipt cocktail={made} order={order} reduced={store.reduced} printing />}
          </div>
          <AnimatePresence>
            {phase === "final" && (
              <motion.div
                key="actions"
                className="wc-actions"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0, transition: { ...spring, delay: store.reduced ? 0 : T.print * 0.8 } }}
                exit={{ opacity: 0, transition: { duration: 0.15 } }}
              >
                <button className="wc-cta" onClick={again}>
                  {copy.again}
                  <svg viewBox="0 0 20 20" aria-hidden className="wc-cta-arrow">
                    <path d="M3 10h13m-5-5 5 5-5 5" />
                  </svg>
                </button>
                <button className="wc-ghost" onClick={share} data-done={shared || undefined}>
                  {shared === "copied" ? "Copied" : shared === "shared" ? "Shared" : copy.share}
                  <svg viewBox="0 0 20 20" aria-hidden className="wc-ghost-icon">
                    {shared ? <path d="m4 10.5 4 4 8-9" /> : <path d="M8 4H4.5v11.5H16V12M11 4h5v5m0-5-7.5 7.5" />}
                  </svg>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <p className="sr-only" aria-live="polite">
          {status}
        </p>
      </div>
    </div>
  );
}
