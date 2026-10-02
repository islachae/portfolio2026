/* eslint-disable @next/next/no-img-element */
"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { tippingCase as C } from "@/content/cases/tipping";
import { reducedMotion } from "../shell-context";
import { useScrollRoot } from "./scroll-root";
import { pageById } from "@/content/site";
import { ToolChips } from "../ProjectBrief";
import { Takeaways, useCountUp, Num, CountUp, People, DotGrid, scrollToEl, clamp, useStickyProgress, Lines, Section, Check } from "./kit";

/* ───────────── the page ───────────── */

export function TippingCase() {
  return (
    <article className="cs-article">
      <Hero />
      <Problem />
      <Deeper />
      <KeyQuestion />
      <WhyNow />
      <Principle />
      <Mechanism />
      <Testing />
      <TipScene />
      <FinalDesign />
      <System />
      <Takeaways t={C.takeaways} />
    </article>
  );
}

function Hero() {
  return (
    <>
      <header className="cs-hero" id="cs-overview">
        <p className="cs-eyebrow">{C.eyebrow}</p>
        <h1 className="cs-h1">{C.title}</h1>
        <p className="cs-sub">{C.subtitle}</p>
        <dl className="cs-meta">
          {C.meta.map((m) => (
            <div key={m.label}>
              <dt>{m.label}</dt>
              <dd>{m.value}</dd>
            </div>
          ))}
          {/* Tool stack (from the project page) where the reading time used to be */}
          {pageById[C.id].tools?.length ? (
            <div>
              <dt>Tool stack</dt>
              <dd>
                <ToolChips tools={pageById[C.id].tools!} />
              </dd>
            </div>
          ) : null}
        </dl>
      </header>
      <figure className="cs-hero-fig">
        <img src={C.hero.src} alt={C.hero.alt} width={C.hero.w} height={C.hero.h} />
      </figure>
      <p className="cs-lede">{C.overview}</p>
    </>
  );
}

/* Problem: the numbers, then the guess itself */
function Problem() {
  const p = C.problem;
  return (
    <Section label={p.label} id="cs-problem">
      <h2 className="cs-h2">
        <Lines lines={p.title} />
      </h2>
      <div className="cs-stats">
        {p.stats.map((s) => (
          <Stat key={s.source} s={s} />
        ))}
      </div>
      <TipSim />
    </Section>
  );
}

function Stat({ s }: { s: (typeof C.problem.stats)[number] }) {
  const [ref, shown] = useCountUp<HTMLDivElement>(s.value, 0.5);
  return (
    <figure className="cs-stat">
      <div className="cs-stat-top" ref={ref}>
        <p className="cs-stat-n">
          <Num shown={shown} value={s.value} suffix={s.suffix} />
        </p>
        {s.pic.kind === "grid" ? <DotGrid filled={shown} /> : <People of={s.pic.of} filled={shown} className="cs-people--stat" />}
      </div>
      <p className="cs-stat-t">{s.text}</p>
      <figcaption className="cs-src">{s.source}</figcaption>
    </figure>
  );
}

/* The guess: pick a tip before anything is known, then see what happened */
function TipSim() {
  const s = C.problem.sim;
  const [after, setAfter] = useState(false);
  const [pick, setPick] = useState<number | null>(null);
  const chips = useRef<(HTMLButtonElement | null)[]>([]);
  const onKey = (e: React.KeyboardEvent, i: number) => {
    const n = s.tips.length;
    let next = -1;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") next = (i + 1) % n;
    if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = (i - 1 + n) % n;
    if (next < 0 || after) return;
    e.preventDefault();
    setPick(next);
    chips.current[next]?.focus();
  };
  const tip = pick === null ? "" : s.tips[pick];
  const line = after ? (pick === null ? s.verdictNone : s.verdict.replace("{tip}", tip)) : pick === null ? s.prompt : s.picked.replace("{tip}", tip);
  return (
    <div className="cs-sim" id="cs-guess" tabIndex={-1} data-after={after || undefined}>
      <div className="cs-sim-card">
        <p className="cs-sim-q">
          <Lines lines={s.question} />
        </p>
        <div className="cs-sim-grid">
          <div className="cs-receipt" aria-label="Your order">
            <p className="cs-rc-row cs-rc-cap">
              <span>Your order</span>
              <span>01</span>
            </p>
            <p className="cs-rc-row">
              <span>{s.item.name}</span>
              <span>{s.item.price}</span>
            </p>
            <hr />
            <p className="cs-rc-row cs-rc-cap">
              <span id="cs-tip-label">{s.tipsLabel}</span>
              <span className="cs-rc-hint" data-hide={pick !== null || after || undefined}>
                {s.pickHint}
              </span>
            </p>
            <div className="cs-rc-tips" role="radiogroup" aria-labelledby="cs-tip-label">
              {s.tips.map((t, i) => (
                <button
                  key={t}
                  ref={(el) => {
                    chips.current[i] = el;
                  }}
                  type="button"
                  role="radio"
                  className="cs-rc-tip"
                  aria-checked={pick === i}
                  aria-disabled={after || undefined}
                  tabIndex={(pick ?? 0) === i ? 0 : -1}
                  onClick={() => !after && setPick(i)}
                  onKeyDown={(e) => onKey(e, i)}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div className="cs-know">
            <p className="cs-know-h">What you know so far</p>
            <dl aria-live="polite">
              {s.facts.map((f) => (
                <div key={f.label}>
                  <dt>{f.label}</dt>
                  <dd>
                    <AnimatePresence mode="wait" initial={false}>
                      <motion.span
                        key={after ? "after" : "before"}
                        className="cs-know-v"
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.18 }}
                      >
                        {after ? f.after : f.before}
                      </motion.span>
                    </AnimatePresence>
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
        <div className="cs-sim-verdict" aria-live="polite" data-after={after || undefined}>
          <AnimatePresence mode="wait" initial={false}>
            <motion.p
              key={line}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.18 }}
            >
              {after ? <b>{line}</b> : line}
              {after && pick !== null && <span> {s.verdictAgain}</span>}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>
      <button className="cs-sim-btn" aria-pressed={after} onClick={() => setAfter((a) => !a)}>
        {after ? s.toBefore : s.toAfter}
      </button>
    </div>
  );
}

function Deeper() {
  const d = C.deeper;
  return (
    <Section label={d.label}>
      <h2 className="cs-h2">
        <Lines lines={d.title} />
      </h2>
      <div className="cs-cards">
        {d.cards.map((c) => (
          <div className="cs-card" key={c.title}>
            <span className="cs-card-dot" aria-hidden />
            <h3 className="cs-h3">{c.title}</h3>
            <p className="cs-body">{c.text}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}

function KeyQuestion() {
  const q = C.question;
  const root = useScrollRoot();
  const skip = (e: React.MouseEvent) => {
    e.preventDefault();
    const target = document.getElementById("cs-solution");
    if (!target || !root) return;
    scrollToEl(root, target, 72);
    window.setTimeout(() => target.focus({ preventScroll: true }), reducedMotion() ? 0 : 700);
  };
  return (
    <Section label={q.label} className="cs-sec--center">
      <h2 className="cs-h2 cs-question">
        {q.parts.map((p, i) => (p.hi ? <em key={i}>{p.t}</em> : <Fragment key={i}>{p.t}</Fragment>))}
      </h2>
      <a className="cs-skip" href="#cs-solution" onClick={skip}>
        {q.skip}
      </a>
    </Section>
  );
}

/* Why now: a timeline the scroll plays from "Then" to "Now". Payment and dining keep changing;
   the tip prompt never moves. */
const spread = (n: number) => Array.from({ length: n }, (_, i) => (n > 1 ? i / (n - 1) : 0));

function WhyNow() {
  const w = C.whyNow;
  const scene = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLDivElement>(null);
  const raw = useStickyProgress(scene, frame);
  const [still, setStill] = useState(false);
  useEffect(() => setStill(reducedMotion()), []);
  // The last stretch holds the finished picture
  const p = still ? 1 : clamp(raw / 0.8);
  const rows = [
    { key: "pay", ...w.pay },
    { key: "dine", ...w.dine },
  ];
  return (
    <Section label={w.label} id="cs-why">
      <h2 className="cs-h2">
        <Lines lines={w.title} />
      </h2>
      <p className="cs-body cs-measure">
        {w.lead}{" "}
        <b className="cs-strong">
          <CountUp value={w.stat.value} suffix={w.stat.suffix} />
        </b>
        . {w.rest}
      </p>
      <div className="cs-tl" ref={scene} data-still={still || undefined}>
        <div className="cs-tl-frame" ref={frame} style={{ ["--p" as string]: p }}>
          <div className="cs-tl-axis" aria-hidden>
            <span>{w.axis.from}</span>
            <span className="cs-tl-axis-line">
              <span style={{ transform: `scaleX(${p})` }} />
            </span>
            <span data-on={p > 0.98 || undefined}>{w.axis.to}</span>
          </div>
          <span className="cs-tl-playhead" aria-hidden>
            <span />
          </span>
          {rows.map((row) => {
            const t = spread(row.items.length);
            return (
              <div className={`cs-tl-row cs-tl-row--${row.key}`} key={row.key}>
                <div className="cs-tl-head">
                  <p className="cs-now-step">{row.step}</p>
                  <h3 className="cs-tl-h">
                    <Lines lines={row.title} />
                  </h3>
                </div>
                <ul className="cs-tl-track">
                  {row.items.map((it, i) => (
                    <li
                      key={it.label}
                      className="cs-tile"
                      data-now={it.now || undefined}
                      data-in={p >= t[i] - 0.02 || undefined}
                      style={{ ["--t" as string]: t[i] }}
                    >
                      <span className="cs-tile-box">
                        <img src={it.src} alt={it.alt} loading="lazy" />
                      </span>
                      <span className="cs-tile-label">{it.label}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
          <div className="cs-tl-row cs-tl-row--tip">
            <div className="cs-tl-head">
              <p className="cs-now-step">{w.tip.step}</p>
              <h3 className="cs-tl-h">
                <Lines lines={w.tip.title} />
              </h3>
            </div>
            <div className="cs-tl-track">
              <div className="cs-tl-tip" role="img" aria-label={`${w.tip.card}: ${w.tip.chips.join(", ")}. ${w.tip.note}.`}>
                <span className="cs-tl-tip-cap">{w.tip.card}</span>
                <span className="cs-tl-tip-chips">
                  {w.tip.chips.map((c) => (
                    <span key={c}>{c}</span>
                  ))}
                </span>
              </div>
              <span className="cs-tl-stay" aria-hidden />
              <span className="cs-tl-note" data-in={p > 0.98 || undefined} aria-hidden>
                {w.tip.note}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}

function Principle() {
  const p = C.principle;
  const [open, setOpen] = useState(false);
  return (
    <Section label={p.label} id="cs-principle">
      <h2 className="cs-h2">{p.title}</h2>
      <p className="cs-body cs-measure">{p.text}</p>
      <div className="cs-refs">
        <div className="cs-ref">
          <div className="cs-ref-head">
            <h3 className="cs-h3">{p.uber.title}</h3>
            <span className="cs-ref-brand">{p.uber.brand}</span>
          </div>
          <div className="cs-ref-body">
            <div className="cs-ref-shot">
              <img src={p.uber.src} alt={p.uber.alt} loading="lazy" />
              <span className="cs-ref-mark" aria-hidden />
            </div>
            <div className="cs-ref-text">
              <dl>
                {p.uber.rows.map((r) => (
                  <div key={r.label}>
                    <dt>{r.label}</dt>
                    <dd>{r.value}</dd>
                  </div>
                ))}
              </dl>
              <p className="cs-ref-insight">{p.uber.insight}</p>
            </div>
          </div>
        </div>
        <button className="cs-ref cs-ref--more" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
          <span className="cs-ref-brand">{p.doordash.brand}</span>
          <span className="cs-h3">{p.doordash.title}</span>
          {open ? (
            p.doordash.rows.length ? (
              <dl className="cs-ref-dl">
                {p.doordash.rows.map((r) => (
                  <div key={r.label}>
                    <dt>{r.label}</dt>
                    <dd>{r.value}</dd>
                  </div>
                ))}
              </dl>
            ) : (
              <span className="cs-ref-todo">Write-up in progress.</span>
            )
          ) : (
            <span className="cs-ref-hint">Show details</span>
          )}
        </button>
      </div>
    </Section>
  );
}

/* Mechanism: the order journey with three new touchpoints to open */
function Mechanism() {
  const m = C.mechanism;
  const [sel, setSel] = useState(1);
  const col = m.steps.findIndex((s) => s.n === sel);
  return (
    <section className="cs-sec" id="cs-solution" tabIndex={-1} aria-label={m.label}>
      <p className="cs-eyebrow">{m.label}</p>
      <h2 className="cs-h2">{m.title}</h2>
      <p className="cs-quote">
        {m.quote.map((q, i) => (q.b ? <b key={i}>{q.t}</b> : <Fragment key={i}>{q.t}</Fragment>))}
      </p>

      <div className="cs-journey">
        <div className="cs-legend">
          <span className="cs-legend-item">
            <span className="cs-legend-dot" aria-hidden />
            {m.legend.existing}
          </span>
          <span className="cs-legend-item cs-legend-item--new">
            <span className="cs-legend-dot" aria-hidden />
            {m.legend.added}
          </span>
          <span className="cs-legend-hint">{m.legend.hint}</span>
        </div>
        <div className="cs-rail-scroll">
          <ol className="cs-rail" style={{ ["--n" as string]: m.steps.length }}>
            {m.steps.map((s) => (
              <li className="cs-stop" key={s.label} data-new={s.n ? "" : undefined} data-on={s.n === sel || undefined}>
                <span className="cs-stop-n">{s.n ? `0${s.n}` : ""}</span>
                {s.n ? (
                  <button
                    className="cs-stop-dot"
                    aria-pressed={s.n === sel}
                    aria-label={`Touchpoint 0${s.n}: ${s.label.replace("\n", " ")}`}
                    onClick={() => setSel(s.n!)}
                  >
                    <span />
                  </button>
                ) : (
                  <span className="cs-stop-dot" aria-hidden>
                    <span />
                  </span>
                )}
                <span className="cs-stop-label">{s.label}</span>
              </li>
            ))}
          </ol>
          {/* A pin runs from the chosen stop down to its details */}
          <span className="cs-pin" style={{ left: `${((col + 0.5) / m.steps.length) * 100}%` }} aria-hidden />
        </div>

        <div className="cs-tp-stack">
          {m.touchpoints.map((tp) => (
            <div className="cs-tp" key={tp.n} data-on={tp.n === sel || undefined} aria-hidden={tp.n !== sel}>
              <h3 className="cs-tp-title">
                <span className="cs-tp-n">0{tp.n}</span>
                {tp.title}
              </h3>
              <div className="cs-tp-cols">
                {(
                  [
                    ["Customer", tp.customer],
                    ["Courier", tp.courier],
                  ] as const
                ).map(([who, v]) => (
                  <div className="cs-tp-col" key={who}>
                    <p className="cs-tp-who">{who}</p>
                    <div className="cs-shot" data-crop={"crop" in v ? v.crop : undefined}>
                      <span className="cs-shot-in">
                        <img src={v.src} alt={v.alt} loading="lazy" />
                      </span>
                    </div>
                    <h4 className="cs-h3">{v.title}</h4>
                    <p className="cs-body">{v.text}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* User testing: what broke, what changed */
function Testing() {
  const t = C.testing;
  const [ref, shown] = useCountUp<HTMLDivElement>(t.users, 0.5);
  return (
    <Section label={t.label} id="cs-testing">
      <h2 className="cs-h2">
        Initial proposal tested by <Num shown={shown} value={t.users} /> users.
      </h2>
      <div className="cs-crowd" ref={ref}>
        <People of={t.users} filled={shown} />
      </div>
      <p className="cs-body cs-measure">{t.text}</p>
      {t.patterns.map((p) => (
        <div className="cs-pattern" id={`cs-pattern-${p.n}`} tabIndex={-1} key={p.n}>
          <p className="cs-pattern-k">Feedback pattern {p.n}</p>
          <p className="cs-pattern-q">{p.feedback}</p>
          <div className="cs-vs">
            {(
              [
                ["tested", "Tested ver.", p.tested],
                ["iterated", "Iterated ver.", p.iterated],
              ] as const
            ).map(([kind, tag, v]) => (
              <figure className="cs-vs-col" data-kind={kind} key={kind}>
                <p className="cs-vs-tag" data-kind={kind}>
                  <span className="cs-vs-dot" aria-hidden />
                  <span>{tag}</span>
                </p>
                <div className={`cs-vs-frame cs-vs-frame--${p.n}`} data-kind={kind}>
                  <img src={v.src} alt={v.alt} loading="lazy" />
                  {"note" in v && v.note && (
                    <span className="cs-vs-note" aria-hidden>
                      <span className="cs-vs-line" />
                      <span className="cs-vs-note-t">{v.note}</span>
                    </span>
                  )}
                </div>
                <figcaption>
                  <span className="cs-vs-title">{v.title}</span>
                  <span className="cs-vs-text">{v.text}</span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      ))}
    </Section>
  );
}

/* One order, start to finish: a sticky phone that the reader's scroll plays forward.
   Checkout → in delivery → delivered (the service details land one by one) → the tip settles. */
const money = (n: number) => `$${n.toFixed(2)}`;
const METER_LABEL = ["Pre-tip · locked", "On hold until delivery", "Post-reward · calculating", "Trust Tip applied"];

function TipScene() {
  const s = C.scene;
  const root = useScrollRoot();
  const scene = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLDivElement>(null);
  // Scroll progress through the scene: 0 when the frame first sticks, 1 when it lets go.
  const p = useStickyProgress(scene, frame);

  const n = s.steps.length;
  const step = Math.min(n - 1, Math.floor(p * n));
  const local = clamp(p * n - step);
  const lines = step < 2 ? 0 : step === 2 ? Math.min(s.lines.length, Math.floor(local * (s.lines.length + 1))) : s.lines.length;
  const settle = step === 3 ? 1 - Math.pow(1 - clamp(local / 0.45), 3) : 0;
  const value = s.preTip + s.postReward * settle;
  const fill = (value - s.preTip) / s.maxReward;

  // Steps are buttons too: jump straight to that point of the order.
  const jump = (i: number) => {
    const el = scene.current;
    const fr = frame.current;
    if (!el || !fr || !root) return;
    const stick = parseFloat(getComputedStyle(fr).top) || 0;
    const sceneTop = el.getBoundingClientRect().top - root.getBoundingClientRect().top + root.scrollTop;
    const total = el.offsetHeight - fr.offsetHeight;
    const land = [0.3, 0.5, 0.85, 0.6][i] ?? 0.5; // where each step has fully played out
    root.scrollTo({ top: sceneTop - stick + ((i + land) / n) * total, behavior: reducedMotion() ? "auto" : "smooth" });
  };

  return (
    <Section label={s.label} className="cs-sec--scene" id="cs-scene">
      <h2 className="cs-h2">{s.title}</h2>
      <p className="cs-scene-hint">
        <span className="cs-scene-mouse" aria-hidden>
          <span />
        </span>
        {s.hint}
      </p>
      <div className="cs-scene" ref={scene}>
        <div className="cs-scene-frame" ref={frame}>
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

          <div className="cs-ph-wrap">
            <div className="cs-ph" data-step={step} role="img" aria-label={`${s.steps[step].title}. ${METER_LABEL[step]}: ${money(value)}`}>
              <div className="cs-ph-in">
                <div className="cs-ph-status">
                  <span>9:41</span>
                  <span className="cs-ph-island" />
                  <span className="cs-ph-bars" />
                </div>

                <div className="cs-ph-heads">
                  <div className="cs-ph-head" data-on={step === 0 || undefined}>
                    <b>Checkout</b>
                    <span>{s.store}</span>
                  </div>
                  <div className="cs-ph-head" data-on={step === 1 || undefined}>
                    <b>Heading your way</b>
                    <span>Arriving {s.eta}</span>
                  </div>
                  <div className="cs-ph-head" data-on={step === 2 || undefined}>
                    <b>Delivered</b>
                    <span>Checking what happened</span>
                  </div>
                  <div className="cs-ph-head" data-on={step === 3 || undefined}>
                    <b>Thanks for your order</b>
                    <span>{s.store}</span>
                  </div>
                </div>

                <div className="cs-ph-meter" data-final={step === 3 || undefined}>
                  <span className="cs-ph-label">{METER_LABEL[step]}</span>
                  <span className="cs-ph-value">{money(value)}</span>
                  <span className="cs-ph-bar">
                    <span className="cs-ph-bar-base" />
                    <span className="cs-ph-bar-fill" style={{ transform: `scaleX(${fill})` }} />
                  </span>
                  <span className="cs-ph-scale">
                    <span>{money(s.preTip)} min</span>
                    <span>{money(s.preTip + s.maxReward)} max</span>
                  </span>
                </div>

                <div className="cs-ph-bodies">
                  <div className="cs-ph-body" data-on={step === 0 || undefined}>
                    <div className="cs-ph-card cs-ph-card--on">
                      <span className="cs-ph-card-h">Trust-First Tipping</span>
                      <span className="cs-ph-row">
                        <span>Pre-tip</span>
                        <span>{money(s.preTip)}</span>
                      </span>
                      <span className="cs-ph-row cs-ph-muted">
                        <span>Post-reward</span>
                        <span>{s.rewardRange.replace(" after delivery", "")}</span>
                      </span>
                    </div>
                    <span className="cs-ph-btn">Place order</span>
                  </div>

                  <div className="cs-ph-body" data-on={step === 1 || undefined}>
                    <span className="cs-ph-route">
                      <span style={{ transform: `scaleX(${step === 1 ? 0.15 + local * 0.85 : step > 1 ? 1 : 0.15})` }} />
                    </span>
                    <div className="cs-ph-card">
                      <span className="cs-ph-row">
                        <span>Tip</span>
                        <span>{money(s.preTip)} locked</span>
                      </span>
                      <span className="cs-ph-muted cs-ph-small">Adjusts after delivery, within {s.rewardRange.replace(" after delivery", "")}</span>
                    </div>
                  </div>

                  <div className="cs-ph-body" data-on={step >= 2 || undefined}>
                    <ul className="cs-ph-lines">
                      {s.lines.map((l, i) => (
                        <li key={l.label} data-in={i < lines || undefined} data-dir={l.dir}>
                          <span className="cs-ph-line-k">{l.label}</span>
                          <span className="cs-ph-line-v">
                            <span>{l.value}</span>
                            <span className="cs-ph-delta">{l.delta || "✓"}</span>
                          </span>
                        </li>
                      ))}
                    </ul>
                    <span className="cs-ph-reason" data-in={step === 3 || undefined}>
                      View reason
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}

function FinalDesign() {
  const f = C.final;
  const [tab, setTab] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const onKey = (e: React.KeyboardEvent, i: number) => {
    const n = f.tabs.length;
    let next = -1;
    if (e.key === "ArrowRight") next = (i + 1) % n;
    if (e.key === "ArrowLeft") next = (i - 1 + n) % n;
    if (e.key === "Home") next = 0;
    if (e.key === "End") next = n - 1;
    if (next < 0) return;
    e.preventDefault();
    setTab(next);
    tabs.current[next]?.focus();
  };
  return (
    <Section label={f.label} id="cs-final">
      <h2 className="cs-h2">{f.title}</h2>
      <div className="cs-stage">
        <div className="cs-tabs" role="tablist" aria-label="Final design screens">
          {f.tabs.map((t, i) => (
            <button
              key={t.label}
              ref={(el) => {
                tabs.current[i] = el;
              }}
              role="tab"
              id={`cs-tab-${i}`}
              aria-selected={tab === i}
              aria-controls={`cs-tabpanel-${i}`}
              tabIndex={tab === i ? 0 : -1}
              className="cs-tab"
              onClick={() => setTab(i)}
              onKeyDown={(e) => onKey(e, i)}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="cs-stage-view">
          {f.tabs.map((t, i) => (
            <div
              key={t.label}
              role="tabpanel"
              id={`cs-tabpanel-${i}`}
              aria-labelledby={`cs-tab-${i}`}
              hidden={tab !== i}
              className="cs-stage-panel"
              data-wide={t.w > t.h || undefined}
            >
              <img src={t.src} alt={t.alt} width={t.w} height={t.h} loading="lazy" />
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}

/* Systemic thinking: four stakeholders in a loop; pick one to read what it gains */
const NODE_POS = [
  { left: 6, top: 172 }, // platform
  { left: 139, top: 20 }, // customers
  { left: 272, top: 172 }, // couriers
  { left: 139, top: 324 }, // restaurants
];
const ARCS = ["M108 170 Q116 100 172 130", "M256 130 Q312 100 320 170", "M320 292 Q312 360 256 330", "M172 330 Q116 360 108 292"];
const ARC_LABELS = [
  { left: 4, top: 78, align: "left" },
  { left: 328, top: 78, align: "right" },
  { left: 328, top: 296, align: "right" },
  { left: 4, top: 296, align: "left" },
] as const;

function NodeIcon({ i }: { i: number }) {
  const common = {
    width: 26,
    height: 26,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };
  if (i === 0)
    return (
      <svg {...common}>
        <polygon points="12 2 2 7 12 12 22 7 12 2" />
        <polyline points="2 17 12 22 22 17" />
        <polyline points="2 12 12 17 22 12" />
      </svg>
    );
  if (i === 1)
    return (
      <svg {...common}>
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    );
  if (i === 2)
    return (
      <svg {...common}>
        <circle cx="18.5" cy="17.5" r="3.5" />
        <circle cx="5.5" cy="17.5" r="3.5" />
        <circle cx="15" cy="5" r="1" />
        <path d="M12 17.5V14l-3-3 4-3 2 3h2" />
      </svg>
    );
  return (
    <svg {...common}>
      <path d="M2 7l1.5-4h17L22 7" />
      <path d="M2 7v13a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1v-4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v4a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1V7" />
      <path d="M2 7h20" />
    </svg>
  );
}

function System() {
  const s = C.system;
  const [sel, setSel] = useState(0);
  const btns = useRef<(HTMLButtonElement | null)[]>([]);
  const n = s.nodes.length;
  const onKey = (e: React.KeyboardEvent, i: number) => {
    let next = -1;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") next = (i + 1) % n;
    if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = (i - 1 + n) % n;
    if (next < 0) return;
    e.preventDefault();
    setSel(next);
    btns.current[next]?.focus();
  };
  return (
    <Section label={s.label} id="cs-system">
      <h2 className="cs-h2">{s.title}</h2>
      <p className="cs-body cs-measure">{s.text}</p>
      <div className="cs-loop">
        <div className="cs-loop-map">
          <svg className="cs-loop-arcs" viewBox="0 0 428 500" aria-hidden>
            <defs>
              <marker id="cs-ah" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                <path d="M1 1L9 5L1 9" strokeWidth="1.5" fill="none" stroke="context-stroke" />
              </marker>
            </defs>
            {ARCS.map((d, i) => (
              <path key={i} d={d} className="cs-arc" data-on={sel === i || undefined} markerEnd="url(#cs-ah)" />
            ))}
          </svg>
          {s.nodes.map((node, i) => (
            <span
              key={`l${i}`}
              className="cs-arc-label"
              data-on={sel === i || undefined}
              style={{
                left: `${(ARC_LABELS[i].left / 428) * 100}%`,
                top: `${(ARC_LABELS[i].top / 500) * 100}%`,
                textAlign: ARC_LABELS[i].align,
              }}
              aria-hidden
            >
              {node.arrow}
            </span>
          ))}
          {s.nodes.map((node, i) => (
            <button
              key={node.name}
              ref={(el) => {
                btns.current[i] = el;
              }}
              className="cs-node"
              aria-pressed={sel === i}
              aria-label={`${node.name}: ${node.sub}`}
              onClick={() => setSel(i)}
              onKeyDown={(e) => onKey(e, i)}
              style={{ left: `${(NODE_POS[i].left / 428) * 100}%`, top: `${(NODE_POS[i].top / 500) * 100}%` }}
            >
              <span className="cs-node-icon">
                <NodeIcon i={i} />
              </span>
              <span className="cs-node-name">{node.name}</span>
              <span className="cs-node-sub">{node.sub}</span>
            </button>
          ))}
          <p className="cs-loop-hint">{s.hint}</p>
        </div>
        <div className="cs-loop-stack" aria-live="polite">
          {s.nodes.map((node, i) => (
            <div className="cs-loop-panel" key={node.name} data-on={sel === i || undefined} aria-hidden={sel !== i}>
              <p className="cs-loop-k">
                <span>{node.name}</span>
                <span>
                  0{i + 1} / 0{n}
                </span>
              </p>
              <p className="cs-loop-h">{node.headline}</p>
              <p className="cs-body">{node.text}</p>
              <p className="cs-loop-b">Potential benefits</p>
              <ul>
                {node.benefits.map((b) => (
                  <li key={b}>
                    <Check />
                    {b}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}
