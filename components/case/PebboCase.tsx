/* eslint-disable @next/next/no-img-element */
"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { pebboCase as C, PEBBO_MOODS } from "@/content/cases/pebbo";
import { reducedMotion } from "../shell-context";
import { PageIcon } from "../icons";
import { useScrollRoot } from "./scroll-root";
import {
  Lines,
  Section,
  Takeaways,
  useInView,
  useScrollProgress,
  useScrollThrough,
  useStickyProgress,
} from "./kit";

/**
 * Pebbo, hardware to app (the Rachel Chen OpenAI layout): the problem, then the device and the
 * flows it drives, then the research and reasoning behind them. Scroll plays the device → phone
 * scene, reclusters the research notes, runs the emotional loop and builds the problem → feature map.
 */
export function PebboCase() {
  return (
    <article className="cs-article pb">
      <Hero />
      <Problem />
      <Device />
      <Scene />
      <Daily />
      <Trust />
      <Research />
      <Define />
      <Approach />
      <Takeaways t={C.takeaways} />
    </article>
  );
}

function Hero() {
  return (
    <>
      {/* The first screen (title, facts and the prototype) is SplitHero, drawn by CasePage */}
      <p className="cs-lede">{C.overview}</p>
    </>
  );
}

/* ───────────── Problem: the scale, in one sentence ───────────── */

function Problem() {
  const p = C.problem;
  return (
    <Section label={p.label} id="pb-problem">
      <h2 className="cs-h2">
        <Lines lines={p.title} />
      </h2>
      <Scale />
    </Section>
  );
}

/** The scale, as one sentence: the two figures are marked in as it comes into view. */
function Scale() {
  const s = C.problem.scale;
  const [ref, seen] = useInView<HTMLElement>(0.6);
  return (
    <figure className="pb-scale" ref={ref} data-in={seen || undefined}>
      <p className="pb-scale-text">
        {s.lines.map((l, i) => (
          <span className="pb-scale-line" key={l.note}>
            {l.parts.map((x, j) =>
              x.hi ? (
                <mark key={j} style={{ ["--d" as string]: `${0.15 + i * 0.55}s` }}>
                  {x.t}
                </mark>
              ) : (
                <Fragment key={j}>{x.t}</Fragment>
              ),
            )}
            <sup aria-hidden>{l.note}</sup>
          </span>
        ))}
      </p>
      <figcaption className="pb-scale-notes">
        <ol>
          {s.notes.map((n, i) => (
            <li key={n}>
              <span aria-hidden>{i + 1}</span>
              {n}
            </li>
          ))}
        </ol>
        <p className="cs-src">{s.source}</p>
      </figcaption>
    </figure>
  );
}

/* ───────────── Solution: the device, with its parts called out and a mood you can set ───────────── */

function Device() {
  const d = C.device;
  const [figRef, seen] = useInView<HTMLDivElement>(0.4);
  const [mood, setMood] = useState<(typeof PEBBO_MOODS)[number]["id"]>("calm");
  const [squeezing, setSqueezing] = useState(false);
  const [count, setCount] = useState(0);
  const [bubble, setBubble] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  const chips = useRef<(HTMLButtonElement | null)[]>([]);
  const color = PEBBO_MOODS.find((m) => m.id === mood)!.color;

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const press = () => {
    window.clearTimeout(timer.current);
    setSqueezing(true);
    setBubble(true);
  };
  const release = () => {
    if (!squeezing) return;
    setSqueezing(false);
    setCount((c) => c + 1);
    timer.current = window.setTimeout(() => setBubble(false), 1800);
  };
  const onMoodKey = (e: React.KeyboardEvent, i: number) => {
    const n = PEBBO_MOODS.length;
    let next = -1;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") next = (i + 1) % n;
    if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = (i - 1 + n) % n;
    if (next < 0) return;
    e.preventDefault();
    setMood(PEBBO_MOODS[next].id);
    chips.current[next]?.focus();
  };

  return (
    <section className="cs-sec" id="pb-device" tabIndex={-1} aria-label={d.label}>
      <p className="cs-eyebrow">{d.label}</p>
      <h2 className="cs-h2">
        <Lines lines={d.title} />
      </h2>
      <p className="cs-body cs-measure">{d.text}</p>
      {/* why a conversation and not a food log: the clinical ground for journaling */}
      <p className="pb-basis">
        <b>{d.basis.k}</b>
        {d.basis.t}
        <span className="cs-src">{d.basis.source}</span>
      </p>

      <div className="pb-dev">
        <figure className="pb-dev-fig">
          <div
            className="pb-dev-stage"
            ref={figRef}
            data-in={seen || undefined}
            data-squeeze={squeezing || undefined}
            style={{ ["--mood" as string]: color }}
          >
            <img src={d.src} alt={d.alt} width={415} height={733} />
            <span className="pb-dev-glow" aria-hidden />
            <span className="pb-dev-tint" aria-hidden />
            <span className="pb-dev-ring" data-on={squeezing || undefined} aria-hidden />
            {d.parts.map((pt, i) => (
              <span
                key={pt.label}
                className="pb-part"
                data-side={pt.side}
                style={{ ["--x" as string]: `${pt.x}%`, ["--y" as string]: `${pt.y}%`, ["--i" as string]: i }}
                aria-hidden
              >
                <span className="pb-part-line" />
                <span className="pb-part-dot" />
                <span className="pb-part-label">{pt.label}</span>
              </span>
            ))}
            <AnimatePresence>
              {bubble && (
                <motion.span
                  className="pb-dev-bubble"
                  role="status"
                  initial={{ opacity: 0, y: 6, scale: 0.92 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -4, transition: { duration: 0.15 } }}
                  transition={{ duration: 0.22, ease: [0.2, 0.7, 0.2, 1] }}
                >
                  {d.haptic}
                </motion.span>
              )}
            </AnimatePresence>
          </div>
          <figcaption className="sr-only">Parts: {d.parts.map((p) => p.label).join(", ")}.</figcaption>
        </figure>

        <div className="pb-dev-side">
          {/* You ⇄ Pebbo ⇄ App: each squeeze travels down the line to the app */}
          <ol className="pb-flow" aria-label="How Pebbo connects">
            {d.flow.map((f, i) => (
              <li key={f.k} className="pb-flow-node">
                <span className="pb-flow-k">{f.k}</span>
                <span className="pb-flow-v">{f.v}</span>
                {i < d.flow.length - 1 && (
                  <span className="pb-flow-link" aria-hidden>
                    <span key={count} className="pb-flow-pulse" data-go={count > 0 || undefined} />
                  </span>
                )}
              </li>
            ))}
          </ol>

          <div className="pb-ctl">
            <p className="pb-ctl-k" id="pb-mood-k">
              {d.moodLabel}
            </p>
            <div className="pb-moods" role="radiogroup" aria-labelledby="pb-mood-k">
              {PEBBO_MOODS.map((m, i) => (
                <button
                  key={m.id}
                  ref={(el) => {
                    chips.current[i] = el;
                  }}
                  role="radio"
                  aria-checked={mood === m.id}
                  tabIndex={mood === m.id ? 0 : -1}
                  className="pb-mood"
                  style={{ ["--c" as string]: m.color }}
                  onClick={() => setMood(m.id)}
                  onKeyDown={(e) => onMoodKey(e, i)}
                >
                  <span className="pb-mood-dot" aria-hidden />
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          <div className="pb-ctl">
            <p className="pb-ctl-k">Haptic feedback</p>
            <div className="pb-squeeze-row">
              <button
                className="pb-squeeze"
                data-on={squeezing || undefined}
                onPointerDown={press}
                onPointerUp={release}
                onPointerLeave={release}
                onPointerCancel={release}
                onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && !e.repeat && (e.preventDefault(), press())}
                onKeyUp={(e) => (e.key === "Enter" || e.key === " ") && release()}
              >
                <span className="pb-squeeze-ico" aria-hidden />
                {d.squeeze}
              </button>
              <span className="pb-count" aria-live="polite">
                {count === 0 ? "Press and hold to squeeze" : `${count} squeeze${count > 1 ? "s" : ""} tracked · synced to the app`}
              </span>
            </div>
          </div>

          <ul className="pb-feats" aria-label="Main features">
            {d.features.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

/* ───────────── Grip · Talk · Reflect: a sticky stage your scroll plays forward ───────────── */

function Scene() {
  const s = C.scene;
  const root = useScrollRoot();
  const scene = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLDivElement>(null);
  const p = useStickyProgress(scene, frame);
  const n = s.steps.length;
  const step = Math.min(n - 1, Math.floor(p * n));

  const jump = (i: number) => {
    const el = scene.current;
    const fr = frame.current;
    if (!el || !fr || !root) return;
    const stick = parseFloat(getComputedStyle(fr).top) || 0;
    const sceneTop = el.getBoundingClientRect().top - root.getBoundingClientRect().top + root.scrollTop;
    const total = el.offsetHeight - fr.offsetHeight;
    root.scrollTo({ top: sceneTop - stick + ((i + 0.5) / n) * total, behavior: reducedMotion() ? "auto" : "smooth" });
  };

  return (
    <Section label={s.label} className="cs-sec--scene" id="pb-scene">
      <h2 className="cs-h2">{s.title}</h2>
      <div className="pb-bridges">
        {s.bridges.map((b, i) => (
          <figure className="pb-bridge" key={b.label}>
            <img src={b.src} alt={b.alt} loading="lazy" />
            <figcaption>
              <span className="pb-bridge-n">Bridge {i + 1}</span>
              {b.label}
            </figcaption>
          </figure>
        ))}
      </div>
      <p className="cs-scene-hint">
        <span className="cs-scene-mouse" aria-hidden>
          <span />
        </span>
        {s.hint}
      </p>
      <div className="cs-scene pb-scene" ref={scene}>
        <div className="cs-scene-frame pb-scene-frame" ref={frame}>
          <ol className="cs-scene-steps">
            <span className="cs-scene-track" aria-hidden>
              <span style={{ transform: `scaleY(${p})` }} />
            </span>
            {s.steps.map((st, i) => (
              <li key={st.title} data-on={i === step || undefined} data-done={i < step || undefined}>
                <button className="cs-scene-step" onClick={() => jump(i)} aria-current={i === step ? "step" : undefined}>
                  <span className="cs-scene-n">0{i + 1}</span>
                  <span className="cs-scene-t">{st.title}</span>
                </button>
                <p className="cs-scene-d">{st.text}</p>
              </li>
            ))}
          </ol>

          <div className="pb-stage" data-step={step} role="img" aria-label={`${s.steps[step].title}. ${s.steps[step].screen.alt}`}>
            {/* One device: its face glows blue under stress, then warms back while you talk */}
            <div className="pb-stage-dev" style={{ ["--mood" as string]: step === 0 ? "#5b8def" : "#f6c74400" }}>
              <img src={C.device.src} alt="" data-squish={step === 0 || undefined} />
              <span className="pb-dev-glow" aria-hidden />
              <span className="pb-dev-tint" aria-hidden />
              <span className="pb-stage-ring" data-on={step === 0 || undefined} />
              <span className="pb-stage-ring pb-stage-ring--2" data-on={step === 0 || undefined} />
              <span className="pb-stage-bubble" data-on={step === 0 || undefined}>
                {C.device.haptic}
              </span>
              <span className="pb-stage-waves" data-on={step === 1 || undefined}>
                <i />
                <i />
                <i />
              </span>
            </div>
            <div className="pb-stage-link" data-on={step <= 1 || undefined}>
              <span className="pb-stage-line">
                <i />
                <i />
                <i />
              </span>
              <span className="pb-stage-link-k">{step === 0 ? "Squeeze logged" : step === 1 ? "Voice synced" : "Synced"}</span>
            </div>
            <div className="pb-stage-phone">
              {s.steps.map((st, i) => (
                <img key={st.title} src={st.screen.src} alt="" data-on={i === step || undefined} loading={i < 2 ? "eager" : "lazy"} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}

/* ───────────── Daily reflection: a day, drawn down a line as you read ───────────── */

function Daily() {
  const d = C.daily;
  const [ref, p, marks] = useScrollThrough<HTMLOListElement>(0.62);
  const on = (i: number) => marks[i] !== undefined && p >= marks[i] - 0.001;
  const end = marks.length ? marks[marks.length - 1] : 1;
  return (
    <Section label={d.label} id="pb-daily">
      <h2 className="cs-h2">{d.title}</h2>
      <p className="cs-body cs-measure">{d.text}</p>
      <ol className="pb-day" ref={ref}>
        <span className="pb-day-line" style={{ height: `${end * 100}%` }} aria-hidden>
          <span style={{ transform: `scaleY(${end > 0 ? Math.min(1, p / end) : 0})` }} />
        </span>

        <li className="pb-day-step" data-mark="" data-on={on(0) || undefined}>
          <div className="pb-day-text">
            <p className="pb-day-n">01 · {d.notification.time}</p>
            <h3 className="cs-h3">{d.steps[0].k}</h3>
            <p className="cs-body">{d.steps[0].t}</p>
          </div>
          <div className="pb-notif" role="img" aria-label={`Notification: ${d.notification.title} ${d.notification.lines.join(" ")}`}>
            <PageIcon id="pebbo" size={36} className="pb-notif-ico" />
            <span className="pb-notif-body">
              <b>{d.notification.title}</b>
              {d.notification.lines.map((l) => (
                <span key={l}>{l}</span>
              ))}
            </span>
            <span className="pb-notif-t">now</span>
          </div>
        </li>

        {d.steps.slice(1).map((st, i) => (
          <li className="pb-day-step" data-mark="" data-on={on(i + 1) || undefined} key={st.k}>
            <div className="pb-day-text">
              <p className="pb-day-n">0{i + 2}</p>
              <h3 className="cs-h3">{st.k}</h3>
              <p className="cs-body">{st.t}</p>
            </div>
            <figure className="pb-shot">
              <img src={st.src} alt={st.alt} loading="lazy" />
            </figure>
          </li>
        ))}

        <li className="pb-day-step pb-day-step--wide" data-mark="" data-on={on(3) || undefined}>
          <div className="pb-day-text">
            <p className="pb-day-n">04</p>
            <h3 className="cs-h3">{d.chipsTitle}</h3>
          </div>
          <Chips />
        </li>

        <li className="pb-day-step pb-day-step--wide" data-mark="" data-on={on(4) || undefined}>
          <div className="pb-day-text">
            <p className="pb-day-n">05</p>
            <h3 className="cs-h3">{d.summaryTitle}</h3>
            <p className="cs-body">{d.summaryText}</p>
          </div>
          <div className="pb-sums">
            {d.summaries.map((s) => (
              <figure className="pb-sum" key={s.cap}>
                <span className="pb-sum-shot">
                  <img src={s.src} alt={s.alt} loading="lazy" />
                </span>
                <figcaption>{s.cap}</figcaption>
              </figure>
            ))}
          </div>
        </li>
      </ol>
      <p className="pb-reflect">
        <span className="pb-reflect-k">Reflection</span>
        {d.reflection}
      </p>
    </Section>
  );
}

/* log / explore / quest / peek: one suggestion card per type */
function Chips() {
  const d = C.daily;
  const [sel, setSel] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const onKey = (e: React.KeyboardEvent, i: number) => {
    const n = d.chips.length;
    let next = -1;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") next = (i + 1) % n;
    if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = (i - 1 + n) % n;
    if (next < 0) return;
    e.preventDefault();
    setSel(next);
    tabs.current[next]?.focus();
  };
  const c = d.chips[sel];
  return (
    <div className="pb-chips">
      <div className="pb-chip-row" role="tablist" aria-label={d.chipsHint}>
        {d.chips.map((ch, i) => (
          <button
            key={ch.id}
            ref={(el) => {
              tabs.current[i] = el;
            }}
            role="tab"
            id={`pb-chip-${ch.id}`}
            aria-selected={sel === i}
            aria-controls="pb-chip-panel"
            tabIndex={sel === i ? 0 : -1}
            className="pb-chip"
            style={{ ["--c" as string]: ch.tone }}
            onClick={() => setSel(i)}
            onKeyDown={(e) => onKey(e, i)}
          >
            <span className="pb-chip-dot" aria-hidden />
            {ch.label}
          </button>
        ))}
      </div>
      <div className="pb-chip-panel" id="pb-chip-panel" role="tabpanel" aria-labelledby={`pb-chip-${c.id}`}>
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={c.id}
            className="pb-card"
            style={{ ["--c" as string]: c.tone, ["--ink" as string]: c.ink }}
            initial={{ opacity: 0, y: 10, rotate: -1.5 }}
            animate={{ opacity: 1, y: 0, rotate: 0 }}
            exit={{ opacity: 0, y: -6, transition: { duration: 0.12 } }}
            transition={{ duration: 0.24, ease: [0.2, 0.7, 0.2, 1] }}
          >
            <span className="pb-card-k">
              {c.label} · {c.kind}
            </span>
            <span className="pb-card-t">{c.card}</span>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ───────────── Research: the interview, then the notes reclustering as you scroll ───────────── */

function Research() {
  const r = C.research;
  return (
    <Section label={r.label} id="pb-research">
      <h2 className="cs-h2">
        <Lines lines={r.title} />
      </h2>
      <p className="pb-insight pb-insight--lead">{r.insight}</p>
      <p className="cs-body cs-measure">{r.text}</p>

      <figure className="pb-voice">
        <p className="pb-voice-q">Q. {r.q}</p>
        <blockquote className="pb-voice-a">
          {r.a.map((x, i) => (x.b ? <b key={i}>{x.t}</b> : <Fragment key={i}>{x.t}</Fragment>))}
        </blockquote>
        <figcaption className="pb-voice-who">
          <img src={r.who.src} alt="" width={40} height={40} loading="lazy" />
          <span>
            <b>{r.who.name}</b>
            {r.who.role}
          </span>
        </figcaption>
      </figure>

      <div className="pb-patterns">
        <p className="pb-k">{r.patternsLabel}</p>
        <ul>
          {r.patterns.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
      </div>

      <Board />
    </Section>
  );
}

function Board() {
  const r = C.research;
  const [ref, seen] = useInView<HTMLDivElement>(0.3);
  let k = 0;
  return (
    <div className="pb-board" ref={ref} data-in={seen || undefined}>
      <p className="pb-k">{r.boardLabel}</p>
      <div className="pb-board-cols">
        {r.board.map((col) => (
          <div className="pb-board-col" key={col.head}>
            <h3 className="pb-board-head">{col.head}</h3>
            {col.notes.map((t) => {
              const i = k++;
              return (
                <p
                  className="pb-note"
                  key={t}
                  style={{
                    // a few pixels off and a little tilted, straightened in turn
                    ["--jx" as string]: `${(((i * 37) % 5) - 2) * 6}px`,
                    ["--jy" as string]: `${(((i * 53) % 5) - 2) * 5}px`,
                    ["--rot" as string]: `${((i * 29) % 7) - 3}deg`,
                    ["--d" as string]: `${i * 55}ms`,
                  }}
                >
                  {t}
                </p>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ───────────── Problem definition: the loop, turned once by your scroll ───────────── */

const LOOP_POS = [
  { x: 50, y: 12 },
  { x: 88, y: 50 },
  { x: 50, y: 88 },
  { x: 12, y: 50 },
];

function Define() {
  const d = C.define;
  const [ref, p] = useScrollProgress<HTMLDivElement>(0.9, 0.25);
  const turn = p * 360;
  const at = p >= 1 ? 0 : Math.min(3, Math.floor(((turn + 45) % 360) / 90));
  return (
    <Section label={d.label} id="pb-define">
      <p className="pb-statement">
        {d.statement.map((x, i) => (x.b ? <b key={i}>{x.t}</b> : <Fragment key={i}>{x.t}</Fragment>))}
      </p>
      <div className="pb-define">
        <figure className="pb-loop" ref={ref} aria-label={`${d.loopLabel}: ${d.loop.join(" → ")} → ${d.loop[0]}`} role="img">
          <div className="pb-loop-map">
            <svg viewBox="0 0 100 100" className="pb-loop-svg" aria-hidden>
              <circle cx="50" cy="50" r="38" className="pb-loop-track" />
              <circle cx="50" cy="50" r="38" className="pb-loop-run" pathLength={100} style={{ strokeDashoffset: 100 - p * 100 }} />
            </svg>
            <span className="pb-loop-dot" style={{ transform: `rotate(${turn}deg)` }} aria-hidden>
              <i />
            </span>
            {d.loop.map((t, i) => (
              <span key={t} className="pb-loop-node" data-on={i === at || undefined} style={{ left: `${LOOP_POS[i].x}%`, top: `${LOOP_POS[i].y}%` }}>
                {t}
              </span>
            ))}
          </div>
          <figcaption className="pb-k">{d.loopLabel}</figcaption>
        </figure>
        <dl className="pb-why">
          {[d.why, d.who].map((x) => (
            <div key={x.k}>
              <dt>{x.k}</dt>
              <dd>{x.v}</dd>
            </div>
          ))}
        </dl>
      </div>
    </Section>
  );
}

/* ───────────── Approach: problem → solution → method → feature, built row by row ───────────── */

function Approach() {
  const a = C.approach;
  const [ref, p] = useScrollProgress<HTMLDivElement>(0.85, 0.3);
  const shown = (row: number) => p >= row * 0.24 || undefined;
  const appCols = a.cols.filter((c) => c.method === "App").length;
  return (
    <Section label={a.label} id="pb-approach">
      <h2 className="cs-h2">
        <Lines lines={a.title} />
      </h2>
      <div className="pb-map" ref={ref} style={{ ["--cols" as string]: a.cols.length }}>
        <p className="pb-map-core">
          <span className="pb-k">Problem core</span>
          {a.core}
        </p>
        <div className="pb-map-grid">
          {a.rows.map((r, i) => (
            <span key={r} className="pb-map-rk" style={{ gridRow: i + 1 }} data-in={shown(i)}>
              {r}
            </span>
          ))}
          {a.cols.map((c, i) => (
            <Fragment key={c.feature}>
              <span className="pb-map-cell pb-map-cell--problem" style={{ gridColumn: i + 2, gridRow: 1 }} data-in={shown(0)}>
                {c.problem}
              </span>
              <span className="pb-map-cell pb-map-cell--solution" style={{ gridColumn: i + 2, gridRow: 2 }} data-in={shown(1)}>
                {c.solution}
              </span>
              <span className="pb-map-cell pb-map-cell--feature" style={{ gridColumn: i + 2, gridRow: 4 }} data-in={shown(3)}>
                <b>{c.feature}</b>
              </span>
            </Fragment>
          ))}
          <span className="pb-map-cell pb-map-cell--method" style={{ gridColumn: `2 / span ${appCols}`, gridRow: 3 }} data-in={shown(2)}>
            App
          </span>
          <span
            className="pb-map-cell pb-map-cell--method pb-map-cell--device"
            style={{ gridColumn: `${appCols + 2} / span ${a.cols.length - appCols}`, gridRow: 3 }}
            data-in={shown(2)}
          >
            Device
          </span>
        </div>
      </div>

      <figure className="pb-wire">
        <img src={a.wire.src} alt={a.wire.alt} width={a.wire.w} height={a.wire.h} loading="lazy" />
        <figcaption>Wireframe · home and chat</figcaption>
      </figure>
    </Section>
  );
}

/* ───────────── Trust & privacy: long-press a suggestion to see why ───────────── */

function Trust() {
  const t = C.trust;
  const root = useScrollRoot();
  return (
    <Section label={t.label} id="pb-trust">
      <h2 className="cs-h2">
        <Lines lines={t.title} />
      </h2>
      <p className="cs-body cs-measure">{t.text}</p>
      <Reasoning />
      <p className="pb-try">
        {t.tryAbove.t}{" "}
        <button type="button" onClick={() => root?.scrollTo({ top: 0, behavior: reducedMotion() ? "auto" : "smooth" })}>
          {t.tryAbove.go}
        </button>
      </p>
      <div className="pb-priv">
        <figure className="pb-priv-col">
          <span className="pb-priv-shot">
            <img src={t.privacy.src} alt={t.privacy.alt} loading="lazy" />
          </span>
          <figcaption>
            <h3 className="cs-h3">{t.privacy.k}</h3>
            <p className="cs-body">{t.privacy.t}</p>
            <p className="pb-foot">“{t.privacy.footnote}”</p>
          </figcaption>
        </figure>
        <figure className="pb-priv-col pb-priv-col--wide">
          <span className="pb-priv-shot">
            <img src={t.onboarding.src} alt={t.onboarding.alt} width={t.onboarding.w} height={t.onboarding.h} loading="lazy" />
          </span>
          <figcaption>
            <h3 className="cs-h3">{t.onboarding.k}</h3>
            <p className="cs-body">{t.onboarding.t}</p>
          </figcaption>
        </figure>
      </div>
      <div className="pb-limits">
        <div>
          <h3 className="cs-h3">{t.limits.k}</h3>
          <p className="cs-body">{t.limits.t}</p>
        </div>
        <ul>
          {C.tryIt.help.map((h) => (
            <li key={h.href}>
              <a href={h.href} target="_blank" rel="noopener noreferrer">
                {h.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}

const HOLD_MS = 450;

function Reasoning() {
  const r = C.trust.reason;
  const [holding, setHolding] = useState(false);
  const [menu, setMenu] = useState(false);
  const [open, setOpen] = useState(false);
  const [nudge, setNudge] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  const firstItem = useRef<HTMLButtonElement>(null);
  const quest = useRef<HTMLButtonElement>(null);
  const opened = useRef(false);

  useEffect(() => () => window.clearTimeout(timer.current), []);
  useEffect(() => {
    if (menu) firstItem.current?.focus({ preventScroll: true });
  }, [menu]);

  const down = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    opened.current = false;
    setNudge(false);
    setHolding(true);
    timer.current = window.setTimeout(() => {
      opened.current = true;
      setHolding(false);
      setMenu(true);
    }, HOLD_MS);
  };
  const up = () => {
    window.clearTimeout(timer.current);
    if (holding && !opened.current) setNudge(true);
    setHolding(false);
  };
  const choose = (i: number) => {
    setMenu(false);
    if (i === 0) setOpen(true);
    quest.current?.focus({ preventScroll: true });
  };

  return (
    <div className="pb-reason" id="pb-reason" tabIndex={-1}>
      <div className="pb-reason-text">
        <h3 className="cs-h3">{r.k}</h3>
        <p className="cs-body">{r.t}</p>
        <p className="pb-reason-hint" data-nudge={nudge || undefined}>
          {nudge ? "Hold it a little longer" : r.hint}
          <span> · {r.hintKey}</span>
        </p>
      </div>
      <div className="pb-reason-ui" data-menu={menu || undefined}>
        <button
          ref={quest}
          className="pb-quest"
          data-holding={holding || undefined}
          aria-haspopup="menu"
          aria-expanded={menu}
          onPointerDown={down}
          onPointerUp={up}
          onPointerLeave={up}
          onPointerCancel={up}
          onContextMenu={(e) => e.preventDefault()}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setMenu(true);
            }
          }}
          style={{ ["--hold" as string]: `${HOLD_MS}ms` }}
        >
          <span className="pb-quest-k">quest</span>
          <span className="pb-quest-t">{r.quest}</span>
          <span className="pb-quest-hold" aria-hidden />
        </button>
        <AnimatePresence>
          {menu && (
            <motion.div
              className="pb-menu"
              role="menu"
              aria-label="Suggestion actions"
              initial={{ opacity: 0, scale: 0.96, y: 6 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, transition: { duration: 0.12 } }}
              transition={{ duration: 0.18, ease: [0.2, 0.7, 0.2, 1] }}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  setMenu(false);
                  quest.current?.focus({ preventScroll: true });
                }
                if (e.key === "ArrowDown" || e.key === "ArrowUp") {
                  e.preventDefault();
                  const items = Array.from(e.currentTarget.querySelectorAll<HTMLButtonElement>("button"));
                  const i = items.indexOf(document.activeElement as HTMLButtonElement);
                  items[(i + (e.key === "ArrowDown" ? 1 : -1) + items.length) % items.length]?.focus();
                }
              }}
            >
              {r.menu.map((m, i) => (
                <button key={m} role="menuitem" ref={i === 0 ? firstItem : undefined} className="pb-menu-i" data-key={i === 0 || undefined} onClick={() => choose(i)}>
                  {m}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              className="pb-why-card"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: [0.2, 0.7, 0.2, 1] }}
            >
              <div className="pb-why-in">
                <p className="pb-why-because">{r.because}</p>
                <p className="pb-why-k">{r.noticedK}</p>
                {r.noticed.map((x) => (
                  <p key={x} className="pb-why-v">
                    {x}
                  </p>
                ))}
                <table className="pb-why-table">
                  <thead>
                    <tr>
                      {r.table.head.map((h) => (
                        <th key={h} scope="col">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {r.table.rows.map((row) => (
                      <tr key={row[0]}>
                        {row.map((c) => (
                          <td key={c}>{c}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                <button className="pb-why-close" onClick={() => setOpen(false)}>
                  Hide reasoning
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
