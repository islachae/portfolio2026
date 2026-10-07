/* eslint-disable @next/next/no-img-element */
"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { melonCase as C, type Shot } from "@/content/cases/melon";
import { reducedMotion } from "../shell-context";
import { Lines, Section, Takeaways, clamp, useStickyProgress } from "./kit";

/**
 * CMU Mellon. The page follows the presentation's argument: one email read two ways, the belief
 * underneath (sent means informed), where it broke, the framing, then the two screens that let
 * each side see the other, and what people said they would use it for. Three small interactions:
 * the same email read two ways, the map's four findings, and the recording (the first screen).
 */
export function MelonCase() {
  return (
    <article className="cs-article ml">
      <Hero />
      <Gap />
      <Research />
      <Frame />
      <Directions />
      <Solution />
      <Reactions />
      <Takeaways t={C.takeaways} />
    </article>
  );
}

function Hero() {
  return (
    <>
      {/* The first screen (title, facts and the prototype) is SplitHero, drawn by CasePage */}
      <p className="cs-lede">{C.overview}</p>
      <dl className="ml-glance">
        {C.glance.map((g) => (
          <div key={g.k} data-mine={g.k === "My part" || undefined}>
            <dt>{g.k}</dt>
            <dd>{g.v}</dd>
          </div>
        ))}
      </dl>
      <p className="ml-team">{C.team}</p>
    </>
  );
}

/* ───────────── The gap: one email, two readers ───────────── */

/** **bold** and [link] inside an email line */
function EmailText({ t }: { t: string }) {
  const parts = t.split(/(\*\*[^*]+\*\*|\[[^\]]+\])/g).filter(Boolean);
  return (
    <>
      {parts.map((p, i) =>
        p.startsWith("**") ? (
          <b key={i}>{p.slice(2, -2)}</b>
        ) : p.startsWith("[") ? (
          <span key={i} className="ml-mail-link">
            {p.slice(1, -1)}
          </span>
        ) : (
          <Fragment key={i}>{p}</Fragment>
        ),
      )}
    </>
  );
}

function Gap() {
  const g = C.gap;
  const [mode, setMode] = useState<"donna" | "student">("donna");
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const onKey = (e: React.KeyboardEvent, i: number) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    const next = (i + 1) % 2;
    setMode(g.modes[next].id as "donna" | "student");
    tabs.current[next]?.focus();
  };
  const mark = (m?: { donna?: number; student?: number }) => m?.[mode];
  const notes = g.notes[mode];

  return (
    <Section label={g.label} id="ml-gap">
      <h2 className="cs-h2">
        <Lines lines={g.title} />
      </h2>
      {/* the first Monday of the semester, in four moments: the two sides never meet */}
      <ol className="ml-story">
        {g.story.map((m, i) => (
          <li key={m.k} data-who={m.who === "Donna" ? "donna" : "student"}>
            <span className="ml-story-k">
              <i>0{i + 1}</i>
              {m.k}
            </span>
            <blockquote className="ml-story-q">“{m.q}”</blockquote>
            <img className="ml-story-face" src={m.face} alt="" width={96} height={96} loading="lazy" />
          </li>
        ))}
      </ol>
      <p className="ml-story-note">{g.storyNote}</p>

      <h3 className="cs-h3 ml-h3">{g.readTitle}</h3>
      <p className="cs-body cs-measure">{g.text}</p>

      <div className="ml-read" data-mode={mode}>
        <div className="ml-read-tabs" role="tablist" aria-label="Read the email as">
          {g.modes.map((m, i) => (
            <button
              key={m.id}
              ref={(el) => {
                tabs.current[i] = el;
              }}
              role="tab"
              id={`ml-tab-${m.id}`}
              aria-selected={mode === m.id}
              aria-controls="ml-read-panel"
              tabIndex={mode === m.id ? 0 : -1}
              className="ml-read-tab"
              onClick={() => setMode(m.id as "donna" | "student")}
              onKeyDown={(e) => onKey(e, i)}
            >
              {m.label}
            </button>
          ))}
        </div>
        <div className="ml-read-body" id="ml-read-panel" role="tabpanel" aria-labelledby={`ml-tab-${mode}`}>
          <div className="ml-mail">
            <p className="ml-mail-from">{g.email.from}</p>
            <p className="ml-mail-subject" data-mark={mark(g.email.subjectMark) ? "" : undefined}>
              {mark(g.email.subjectMark) ? <span className="ml-pin">{mark(g.email.subjectMark)}</span> : null}
              {g.email.subject}
            </p>
            <div className="ml-mail-text">
              {g.email.lines.map((l, i) => {
                const n = mark(l.mark);
                return (
                  <p key={i} className="ml-mail-line" data-caps={l.caps || undefined} data-mark={n ? "" : undefined}>
                    {n ? <span className="ml-pin">{n}</span> : null}
                    <EmailText t={l.t} />
                  </p>
                );
              })}
            </div>
          </div>
          <ol className="ml-notes" aria-live="polite">
            <AnimatePresence mode="popLayout" initial={false}>
              {notes.map((n, i) => (
                <motion.li
                  key={`${mode}-${n.n}`}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0, transition: { delay: reducedMotion() ? 0 : i * 0.05, duration: 0.2 } }}
                  exit={{ opacity: 0, transition: { duration: 0.1 } }}
                >
                  <span className="ml-pin">{n.n}</span>
                  <span>{n.t}</span>
                </motion.li>
              ))}
            </AnimatePresence>
          </ol>
        </div>
        <p className="ml-read-note">{g.note}</p>
      </div>
    </Section>
  );
}

/* ───────────── Research: one event through the system, the belief under it, the survey ───────────── */

/** The map, with one finding lit at a time (the presentation's four slides of the same map). */
function MapFindings() {
  const r = C.research;
  const [sel, setSel] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const onKey = (e: React.KeyboardEvent, i: number) => {
    const d = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 0;
    if (!d) return;
    e.preventDefault();
    const next = (i + d + r.findings.length) % r.findings.length;
    setSel(next);
    tabs.current[next]?.focus();
  };
  return (
    <div className="ml-map" id="ml-map" tabIndex={-1}>
      <h3 className="cs-h3 ml-h3">{r.mapTitle}</h3>
      <figure className="ml-mapfig">
        <div className="ml-mapfig-pic" id="ml-mapfig-pic" role="tabpanel" aria-labelledby={`ml-find-${sel}`} style={{ aspectRatio: `${r.map.w} / ${r.map.h}` }}>
          {r.findings.map((f, i) => (
            <img key={f.src} src={f.src} alt={i === sel ? `${r.map.alt}. Highlighted: ${f.h.toLowerCase()}.` : ""} aria-hidden={i !== sel || undefined} data-on={i === sel || undefined} width={r.map.w} height={r.map.h} loading="lazy" decoding="async" />
          ))}
        </div>
        <div className="ml-mapfig-tabs" role="tablist" aria-label="What the map showed">
          {r.findings.map((f, i) => (
            <button
              key={f.h}
              ref={(el) => {
                tabs.current[i] = el;
              }}
              role="tab"
              id={`ml-find-${i}`}
              aria-selected={i === sel}
              aria-controls="ml-mapfig-pic"
              tabIndex={i === sel ? 0 : -1}
              className="ml-mapfig-tab"
              onClick={() => setSel(i)}
              onKeyDown={(e) => onKey(e, i)}
            >
              <span className="ml-mapfig-n">0{i + 1}</span>
              <b>{f.h}</b>
              <span className="ml-mapfig-v">{f.v}</span>
            </button>
          ))}
        </div>
      </figure>
    </div>
  );
}

function Research() {
  const r = C.research;
  const v = C.survey;
  return (
    <Section label={r.label} id="ml-research">
      <h2 className="cs-h2">
        <Lines lines={r.title} />
      </h2>
      <p className="cs-body cs-measure">{r.text}</p>
      <ul className="ml-methods ml-methods--3">
        {r.methods.map((m) => (
          <li key={m.k}>
            <span className="ml-method-n">{m.n}</span>
            <b>{m.k}</b>
            <span>{m.v}</span>
          </li>
        ))}
      </ul>
      <p className="ml-methods-note">{r.methodsNote}</p>

      <MapFindings />

      {/* The iceberg: what shows, and the belief at the bottom that holds it up */}
      <div className="ml-root">
        <h3 className="cs-h3 ml-h3">{r.rootTitle}</h3>
        <ol className="ml-berg">
          {r.root.map((l, i) => (
            <li key={l.k} data-i={i} data-root={i === r.root.length - 1 || undefined}>
              <span className="ml-berg-slice" aria-hidden>
                <i />
              </span>
              <span className="ml-berg-k">
                {l.k}
                {i < 2 && <small>{i === 0 ? r.rootLabels.seen : r.rootLabels.hidden}</small>}
              </span>
              <span className="ml-berg-v">
                {i === r.root.length - 1 ? <em>{r.rootLabels.assume}</em> : null}
                {l.v.map((t) => (
                  <span key={t}>{t}</span>
                ))}
              </span>
            </li>
          ))}
        </ol>
      </div>

      <h3 className="cs-h3 ml-h3">{r.brokeTitle}</h3>
      <ol className="ml-broke">
        {r.broke.map((b) => (
          <li key={b.a}>
            <p className="ml-broke-a">
              <span className="label">{r.brokeLabels.a}</span>
              {b.a}
            </p>
            <figure className="ml-broke-q">
              <span className="label">{r.brokeLabels.q}</span>
              <blockquote>“{b.q}”</blockquote>
              <figcaption>{b.who}</figcaption>
            </figure>
            <p className="ml-broke-area">
              <span className="label">{r.brokeLabels.area}</span>
              <b>{b.area}</b>
            </p>
          </li>
        ))}
      </ol>
      <figure className="ml-pull">
        <blockquote>“{r.pull.q}”</blockquote>
        <figcaption>{r.pull.src}</figcaption>
      </figure>

      {/* The survey in three numbers; every answer stays one click away under “All answers” */}
      <div className="ml-survey" id="ml-survey">
        <p className="label ml-survey-k">{v.label}</p>
        <h3 className="cs-h3 ml-survey-h">{v.title}</h3>
        <ol className="ml-finds">
          {v.findings.map((f) => (
            <li key={f.h}>
              <div className="ml-find-ev" role="img" aria-label={`${f.n} of ${f.of} ${f.unit}`}>
                <span className="ml-find-n" aria-hidden>
                  {f.n}
                  <small>/{f.of}</small>
                </span>
                <span className="ml-units" aria-hidden>
                  {Array.from({ length: f.of }, (_, k) => (
                    <i key={k} data-on={k < f.n || undefined} />
                  ))}
                </span>
              </div>
              <h4 className="ml-find-h">{f.h}</h4>
              <p className="ml-find-melon">
                <b>{v.melonLabel}</b>
                <span>{f.melon}</span>
              </p>
            </li>
          ))}
        </ol>
        <p className="ml-open">
          <b>{v.open.k}</b> {v.open.v}
        </p>
        <details className="ml-all">
          <summary>
            {v.allLabel}
            <span>4 charts</span>
          </summary>
          <div className="ml-charts">
            {v.charts.map((c) => (
              <figure className="ml-chart" key={c.k}>
                <figcaption>
                  <b>{c.k}</b>
                  <span>{c.n} answered</span>
                </figcaption>
                <ol>
                  {c.rows.map((row) => (
                    <li
                      key={row.k}
                      data-key={("key" in row && row.key) || undefined}
                      style={{ ["--w" as string]: `${(row.v / c.n) * 100}%` }}
                      aria-label={`${row.k}: ${row.v} of ${c.n}`}
                    >
                      <span className="ml-bar-k" aria-hidden>
                        {row.k}
                      </span>
                      <span className="ml-bar-track" aria-hidden>
                        <i className="ml-bar" />
                        <span className="ml-bar-v">
                          {row.v} <small>of {c.n}</small>
                          <em> · {Math.round((row.v / c.n) * 100)}%</em>
                        </span>
                      </span>
                    </li>
                  ))}
                </ol>
              </figure>
            ))}
          </div>
        </details>
        <p className="ml-survey-foot">{v.foot}</p>
      </div>
    </Section>
  );
}

/* ───────────── Framing: the question, the hypothesis, and what each constraint decided ───────────── */

function Frame() {
  const f = C.frame;
  return (
    <Section label={f.label} id="ml-frame">
      <h2 className="cs-h2 ml-hmw">
        {f.hmw.map((p, i) => (p.hi ? <em key={i}>{p.t}</em> : <Fragment key={i}>{p.t}</Fragment>))}
      </h2>

      <h3 className="cs-h3 ml-h3">{f.hypoTitle}</h3>
      <div className="ml-hypo">
        <div className="ml-hypo-head" aria-hidden>
          <span>{f.hypoLabels.area}</span>
          <span>{f.hypoLabels.ifs}</span>
          <span>{f.hypoLabels.then}</span>
        </div>
        {f.hypo.map((h) => (
          <div className="ml-hypo-row" key={h.area}>
            <b>{h.area}</b>
            <p data-k={f.hypoLabels.ifs}>
              <span className="sr-only">{f.hypoLabels.ifs}: </span>
              {h.ifs}
            </p>
            <p data-k={f.hypoLabels.then}>
              <span className="sr-only">{f.hypoLabels.then}: </span>
              {h.then}
            </p>
          </div>
        ))}
        <p className="ml-hypo-because">
          <span className="ml-hypo-k">{f.hypoLabels.because}</span>
          <span>{f.because}</span>
        </p>
      </div>

      <h3 className="cs-h3 ml-h3">{f.rulesTitle}</h3>
      <ol className="ml-rules">
        {f.rules.map((r, i) => (
          <li key={r.h}>
            <span className="ml-rule-n">0{i + 1}</span>
            <span className="ml-rule-why">{r.why}</span>
            <b>{r.h}</b>
          </li>
        ))}
      </ol>
    </Section>
  );
}

function Directions() {
  const d = C.directions;
  return (
    <Section label={d.label} id="ml-directions">
      <h2 className="cs-h2">
        <Lines lines={d.title} />
      </h2>
      <ul className="ml-concepts">
        {d.concepts.map((c) => (
          <li key={c.name} data-keep={c.keep || undefined}>
            <span className="ml-concept-shot">
              <img src={c.src} alt="" loading="lazy" />
            </span>
            <b>{c.name}</b>
            <span className="ml-concept-v">{c.v}</span>
            <span className="ml-concept-why">{c.why}</span>
          </li>
        ))}
      </ul>
      <figure className="ml-fig ml-fig--sketch">
        <img src={d.sketch.src} alt={d.sketch.alt} width={d.sketch.w} height={d.sketch.h} loading="lazy" />
        <figcaption>{d.sketchCap}</figcaption>
      </figure>
    </Section>
  );
}

/* ───────────── Solution: the loop, then each problem answered on both sides ───────────── */

const LANE_MARK: Record<string, string> = { ok: "✓", unsure: "?", stop: "→" };

/** A screenshot with numbered marks on it and, beside or under it, what each mark points at. */
function ShotFig({ shot, kind }: { shot: Shot; kind: "panel" | "wide" }) {
  return (
    <figure className="ml-shot" data-kind={kind}>
      {/* a wide screen keeps a readable size on a phone and scrolls sideways inside this box */}
      <span className="ml-shot-scroll">
        <span className="ml-shot-pic">
          <img src={shot.src} alt={shot.alt} width={shot.w} height={shot.h} loading="lazy" decoding="async" />
          {shot.pins.map((p, i) => (
            <i key={p.t} className="ml-shot-pin" style={{ left: `${p.x}%`, top: `${p.y}%` }} aria-hidden>
              {i + 1}
            </i>
          ))}
        </span>
      </span>
      {shot.pins.length > 0 && (
        <ol className="ml-shot-notes">
          {shot.pins.map((p, i) => (
            <li key={p.t} style={{ ["--y" as string]: `${p.y}%` }}>
              <i className="ml-shot-pin" aria-hidden>
                {i + 1}
              </i>
              {p.t}
            </li>
          ))}
        </ol>
      )}
      {shot.cap && <figcaption className="ml-shot-cap">{shot.cap}</figcaption>}
    </figure>
  );
}

/**
 * The loop, pinned. While the page scrolls past, the frame stays put and the scroll carries one
 * question round it: it waits in the student's panel, is sent, lands on Donna's dashboard where
 * the count goes up, she posts a guide, and the guide lands back in the panel. Everything is read
 * off one number (how far through the scene the scroll is), so it runs backwards as well.
 * With reduced motion nothing is pinned and the finished loop is simply shown.
 */
type Pt = { x: number; y: number };

function Loop() {
  const m = C.melon;
  const scene = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLDivElement>(null);
  const pics = useRef<(HTMLElement | null)[]>([]);
  const row = useRef<HTMLElement | null>(null);
  const raw = useStickyProgress(scene, frame);
  const [still, setStill] = useState(false);
  // where things leave from and land, measured inside the frame
  const [pts, setPts] = useState<{ ask: [Pt, Pt]; guide: [Pt, Pt] } | null>(null);

  useEffect(() => setStill(reducedMotion()), []);
  useEffect(() => {
    const fr = frame.current;
    if (!fr) return;
    const measure = () => {
      const b = fr.getBoundingClientRect();
      const mid = (el: HTMLElement): Pt => {
        const r = el.getBoundingClientRect();
        return { x: r.left + r.width / 2 - b.left, y: r.top + r.height / 2 - b.top };
      };
      const [p0, , p2, p3] = pics.current;
      if (!p0 || !p2 || !p3 || !row.current) return;
      const r2 = p2.getBoundingClientRect();
      // the guide leaves from the button at the foot of Donna's picture
      setPts({ ask: [mid(p0), mid(row.current)], guide: [{ x: r2.left + r2.width / 2 - b.left, y: r2.bottom - b.top - 30 }, mid(p3)] });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(fr);
    return () => ro.disconnect();
  }, []);

  const p = still ? 1 : raw;
  // 0 waiting · 1 sent, travelling · 2 counted, Donna's turn · 3 posted, travelling · 4 back
  const step = p < 0.14 ? 0 : p < 0.34 ? 1 : p < 0.54 ? 2 : p < 0.76 ? 3 : 4;
  const moved = step >= 2;
  /** A copy on its way: quick to leave, slow to arrive, on a slight arc, shrinking as it lands. */
  const carry = (t: number, [a, z]: [Pt, Pt]): React.CSSProperties => {
    const e = 1 - (1 - t) * (1 - t);
    const x = a.x + (z.x - a.x) * e;
    const y = a.y + (z.y - a.y) * e - Math.sin(Math.PI * e) * 24;
    return { opacity: t <= 0 || t >= 1 ? 0 : t > 0.85 ? (1 - t) / 0.15 : 1, transform: `translate(${x}px, ${y}px) translate(-50%, -50%) scale(${1 - 0.45 * e})` };
  };

  return (
    <>
      <h3 className="cs-h3 ml-h3">{m.loopTitle}</h3>
      {!still && (
        <p className="cs-scene-hint">
          <span className="cs-scene-mouse" aria-hidden>
            <span />
          </span>
          {m.loopHint}
        </p>
      )}
      <div className="ml-scene" ref={scene} data-still={still || undefined}>
        <div className="ml-scene-frame" ref={frame}>
          <div className="ml-loop-bar">
            <p className="ml-loop-say">
              <i className="ml-loop-dot" aria-hidden />
              {m.loopWatch[step]}
            </p>
            <span className="ml-loop-meter" aria-hidden>
              {m.loop.map((s, i) => (
                <i key={s.k} data-on={step > i || undefined} />
              ))}
            </span>
          </div>
          <ol className="ml-loop" data-s={step}>
            {m.loop.map((s, i) => (
              <li key={s.k} data-on={(step < 4 && step === i) || undefined} data-wait={i > step || undefined}>
                <span className="ml-loop-n">0{i + 1}</span>
                <b>{s.k}</b>
                <span className="ml-loop-v">{s.v}</span>
                <span
                  className="ml-loop-pic"
                  ref={(el) => {
                    pics.current[i] = el;
                  }}
                >
                  {i === 0 &&
                    (step === 0 ? (
                      <span className="ml-loop-box" aria-hidden>
                        <span className="ml-loop-typed">{m.loopAsk}</span>
                        <span className="ml-loop-send" data-press={p >= 0.1 || undefined}>
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M8 13V3M3.5 7.5 8 3l4.5 4.5" />
                          </svg>
                        </span>
                      </span>
                    ) : (
                      <span className="ml-loop-ask">{m.loopAsk}</span>
                    ))}
                  {i === 1 && (
                    <span className="ml-loop-rows" role="img" aria-label={m.loopRows.map((r) => `${r.k}: ${moved || !r.was ? r.n : r.was}`).join(", ")}>
                      {m.loopRows.map((r) => {
                        const up = Boolean(r.was) && moved;
                        return (
                          <span
                            key={r.k}
                            ref={(el) => {
                              if (r.was) row.current = el;
                            }}
                            data-plus={up ? "" : undefined}
                            data-tick={(up && !still) || undefined}
                            aria-hidden
                          >
                            <i>
                              <span className="ml-loop-full">{r.k}</span>
                              <span className="ml-loop-short">{r.s}</span>
                            </i>
                            {up && r.plus && <u>{r.plus}</u>}
                            <b>{r.was && !up ? r.was : r.n}</b>
                            <em>{r.was ? (up ? "▲" : "–") : r.up ? "▲" : "–"}</em>
                          </span>
                        );
                      })}
                    </span>
                  )}
                  {i === 2 && (
                    <>
                      <img src={m.loopInvest.src} alt={m.loopInvest.alt} width={800} height={423} loading="lazy" />
                      {step === 2 ? (
                        <span className="ml-loop-post" data-press={p >= 0.5 || undefined} aria-hidden>
                          {m.loopPost}
                        </span>
                      ) : (
                        <span className="ml-loop-words">{step >= 3 ? m.loopPosted : m.loopInvest.words.join(" · ")}</span>
                      )}
                    </>
                  )}
                  {i === 3 &&
                    (step === 4 ? (
                      <span className="ml-loop-update">
                        <u>{m.loopBack.tag}</u>
                        <b>{m.loopBack.title}</b>
                        <span>{m.loopBack.from}</span>
                        <small>{m.loopBack.meta}</small>
                        <em aria-hidden>{m.loopBack.view}</em>
                      </span>
                    ) : (
                      <span className="ml-loop-empty">{m.loopEmpty}</span>
                    ))}
                </span>
              </li>
            ))}
          </ol>
          {pts && !still && (
            <>
              <span className="ml-loop-tok" data-kind="ask" style={carry(clamp((p - 0.14) / 0.2), pts.ask)} aria-hidden>
                <span>{m.loopAsk}</span>
              </span>
              <span className="ml-loop-tok" data-kind="guide" style={carry(clamp((p - 0.54) / 0.22), pts.guide)} aria-hidden>
                <span>
                  <u>{m.loopBack.tag}</u>
                  {m.loopBack.title}
                </span>
              </span>
            </>
          )}
        </div>
      </div>
    </>
  );
}

function Solution() {
  const m = C.melon;
  const f = C.frame;
  return (
    <Section label={m.label} id="ml-melon">
      <h2 className="cs-h2">
        <Lines lines={m.title} />
      </h2>
      <p className="cs-body cs-measure">{m.text}</p>

      <Loop />

      {m.sides.map((side) => (
        <div className="ml-side" id={side.id} key={side.id} tabIndex={-1}>
          <p className="ml-side-area">{side.area}</p>
          <h3 className="ml-side-h">{side.title}</h3>
          <div className="ml-side-half" data-who="student">
            <p className="ml-side-who">
              <span className="label">{m.sideLabels.student}</span>
              <b>{side.student.h}</b>
            </p>
            <div className="ml-shots" data-n={side.student.shots.length}>
              {side.student.shots.map((s) => (
                <ShotFig key={s.src} shot={s} kind="panel" />
              ))}
            </div>
          </div>
          <div className="ml-side-half" data-who="donna">
            <p className="ml-side-who">
              <span className="label">{m.sideLabels.donna}</span>
              <b>{side.donna.h}</b>
            </p>
            <div className="ml-shots ml-shots--wide">
              {side.donna.shots.map((s) => (
                <ShotFig key={s.src} shot={s} kind="wide" />
              ))}
            </div>
          </div>
        </div>
      ))}

      <div className="ml-limits" id="ml-limits" tabIndex={-1}>
        <h3 className="cs-h3">{f.limitsTitle}</h3>
        <p className="cs-body">{f.limitsText}</p>
        <div className="ml-lanes">
          {f.lanes.map((l) => (
            <div className="ml-lane" data-tone={l.tone} key={l.k}>
              <p className="ml-lane-k">
                <span className="ml-lane-mark" aria-hidden>
                  {LANE_MARK[l.tone]}
                </span>
                {l.k}
              </p>
              <p className="ml-lane-v">{l.v}</p>
              <ul className="ml-lane-ex" aria-label="Example questions">
                {l.ex.map((q) => (
                  <li key={q}>{q}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className="ml-limits-foot">{f.limitsFoot}</p>
      </div>

      {/* what each part of the recording shows (the recording itself is the page's first screen) */}
      <h3 className="cs-h3 ml-h3">{m.partsTitle}</h3>
      <ol className="ml-demo ml-parts">
        {m.chapters.map((c, i) => (
          <li key={c.k}>
            <span className="ml-ch-n">0{i + 1}</span>
            <span className="ml-ch-k">{c.k}</span>
            <p className="ml-ch-v">{c.v}</p>
          </li>
        ))}
      </ol>

      <h3 className="cs-h3 ml-h3">{m.exploreTitle}</h3>
      <div className="ml-explore">
        {m.explore.map((e) => (
          <figure className="ml-explore-item" key={e.k}>
            <span className="ml-explore-shot">
              <img src={e.src} alt={e.alt} width={e.w} height={e.h} loading="lazy" />
            </span>
            <figcaption>
              <b>{e.k}</b>
              <span>{e.v}</span>
            </figcaption>
          </figure>
        ))}
      </div>
    </Section>
  );
}

/* ───────────── First reactions, and where it could go ───────────── */

function Reactions() {
  const r = C.react;
  return (
    <Section label={r.label} id="ml-react">
      <h2 className="cs-h2">
        <Lines lines={r.title} />
      </h2>
      <p className="cs-body cs-measure">{r.text}</p>
      <div className="ml-react">
        <figure className="ml-react-col">
          <figcaption className="label">{r.students.k}</figcaption>
          <ul>
            {r.students.a.map((a) => (
              <li key={a}>“{a}”</li>
            ))}
          </ul>
          <span className="ml-react-src">{r.students.src}</span>
        </figure>
        <figure className="ml-react-col" data-who="donna">
          <figcaption className="label">{r.donna.k}</figcaption>
          <blockquote>“{r.donna.q}”</blockquote>
          <span className="ml-react-src">{r.donna.src}</span>
        </figure>
      </div>
      <p className="ml-react-note">{r.note}</p>

      <h3 className="cs-h3 ml-h3">{r.nextTitle}</h3>
      <ol className="ml-next">
        {r.next.map((n) => (
          <li key={n.k}>
            <span className="label">{n.k}</span>
            <b>{n.v}</b>
          </li>
        ))}
      </ol>
      <p className="ml-close">
        <Lines lines={r.close} />
      </p>
    </Section>
  );
}
