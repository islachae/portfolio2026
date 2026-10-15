/* eslint-disable @next/next/no-img-element */
"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { melonCase as C, type Shot } from "@/content/cases/melon";
import { reducedMotion } from "../shell-context";
import { ToolChips } from "../ProjectBrief";
import { Lines, Section, Takeaways, clamp, useStickyProgress } from "./kit";
import { useScrollRoot } from "./scroll-root";
import { MelonPanelClip } from "../Stages";

/**
 * CMU Mellon, in nine sections with one headline each, so the headlines alone tell the story:
 * the brief, one email read two ways, what the research showed, five concepts, three decisions,
 * the solution (the loop, the working student panel, the advisor's dashboard), what building it
 * for real changed, the test, and what carries over.
 * Anything not known yet is written {{like this}} in the content and drawn as a placeholder (Todo).
 */
export function MelonCase() {
  return (
    <article className="cs-article ml">
      <Impact />
      <Brief />
      <Gap />
      <Research />
      <Directions />
      <Decisions />
      <Solution />
      <Build />
      <Validation />
      <Takeaways t={C.takeaways} />
    </article>
  );
}

/* ───────────── Placeholders ───────────── */

/** Text with {{placeholders}}: those parts are drawn dashed and muted, so they can't pass for real. */
function Todo({ s }: { s: string }) {
  const parts = s.split(/(\{\{[^}]+\}\})/g).filter(Boolean);
  return (
    <>
      {parts.map((p, i) =>
        p.startsWith("{{") ? (
          <span key={i} className="ml-todo">
            {p.slice(2, -2)}
          </span>
        ) : (
          <Fragment key={i}>{p}</Fragment>
        ),
      )}
    </>
  );
}
const isTodo = (s: string) => /^\{\{[^}]+\}\}$/.test(s.trim());

/** A looping, silent video that plays only while it is on screen (and never with reduced motion). */
function LoopVideo({ mp4, poster, label, w, h }: { mp4: string; poster: string; label: string; w: number; h: number }) {
  const v = useRef<HTMLVideoElement>(null);
  const root = useScrollRoot();
  useEffect(() => {
    const el = v.current;
    if (!el || !root || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && !reducedMotion()) el.play().catch(() => {});
        else el.pause();
      },
      { root, threshold: 0.3 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [root]);
  return <video ref={v} src={mp4} poster={poster} muted loop playsInline preload="metadata" width={w} height={h} aria-label={label} />;
}

/* ───────────── Right under the first screen: impact ───────────── */

function Impact() {
  const im = C.impact;
  return (
    <section className="ml-impact" aria-label={im.label}>
      <p className="label ml-impact-k">{im.label}</p>
      <ul className="ml-impact-list">
        {im.items.map((it, i) => (
          <li key={i} data-pending={(it.n && isTodo(it.n)) || (it.q && isTodo(it.q)) || undefined}>
            {it.n ? (
              <b className="ml-impact-n" data-wide={it.wide || undefined}>
                <Todo s={it.n} />
              </b>
            ) : null}
            {it.q ? (
              <q className="ml-impact-q">
                <Todo s={it.q} />
              </q>
            ) : null}
            <span className="ml-impact-v">
              <Todo s={it.v} />
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ───────────── 01 The brief ───────────── */

function Brief() {
  const b = C.brief;
  return (
    <Section label={b.label} id="ml-brief">
      <h2 className="cs-h2">{b.title}</h2>
      <p className="cs-body cs-measure">{b.text}</p>
    </Section>
  );
}

/* ───────────── 02 The problem: one email, two readers ───────────── */

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

      {/* the two readings, then what flows back to Donna: nothing */}
      <dl className="ml-reads">
        {g.reads.map((r, i) => (
          <div key={r.k} data-last={i === g.reads.length - 1 || undefined}>
            <dt className="label">{r.k}</dt>
            <dd>{r.v}</dd>
          </div>
        ))}
      </dl>
    </Section>
  );
}

/* ───────────── 03 Research: the map, three numbers, two broken beliefs, the survey ───────────── */

function Research() {
  const r = C.research;
  const v = C.survey;
  return (
    <Section label={r.label} id="ml-research">
      <h2 className="cs-h2">
        <Lines lines={r.title} />
      </h2>
      <p className="cs-body cs-measure">{r.text}</p>

      <figure className="ml-mapvid" id="ml-map" tabIndex={-1} style={{ aspectRatio: `${r.map.w} / ${r.map.h}` }}>
        <LoopVideo mp4={r.map.mp4} poster={r.map.poster} label={r.map.alt} w={r.map.w} h={r.map.h} />
      </figure>
      <ul className="ml-methods ml-methods--3 ml-nums">
        {r.numbers.map((m) => (
          <li key={m.v}>
            <span className="ml-method-n">{m.n}</span>
            <span>{m.v}</span>
          </li>
        ))}
      </ul>
      <p className="ml-methods-note">{r.numbersNote}</p>

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

      {/* The survey in three findings; every answer stays one click away under “All answers” */}
      <div className="ml-survey" id="ml-survey">
        <h3 className="cs-h3 ml-survey-h">{v.label}</h3>
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
              {f.v ? <p className="ml-find-v">{f.v}</p> : null}
              <p className="ml-find-melon">
                <b>{v.melonLabel}</b>
                <span>{f.melon}</span>
              </p>
            </li>
          ))}
        </ol>
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

/* ───────────── 04 Exploration ───────────── */

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

/* ───────────── 05 Decisions: the picture first, then the call ───────────── */

function Decisions() {
  const d = C.decisions;
  return (
    <Section label={d.label} id="ml-decisions">
      <h2 className="cs-h2">
        <Lines lines={d.title} />
      </h2>
      <ol className="ml-decs">
        {d.items.map((it) => (
          <li className="ml-dec" id={it.id} key={it.id} tabIndex={-1}>
            <figure className="ml-dec-fig">
              <img src={it.img.src} alt={it.img.alt} width={it.img.w} height={it.img.h} loading="lazy" decoding="async" />
            </figure>
            <div className="ml-dec-text">
              <p className="label ml-dec-n">{it.n}</p>
              <div>
                <h3 className="ml-dec-h">{it.h}</h3>
                <p className="cs-body">
                  <Todo s={it.v} />
                </p>
              </div>
            </div>
          </li>
        ))}
      </ol>
    </Section>
  );
}

/* ───────────── 06 Solution: the loop, then the student side and the advisor side ───────────── */

/** A screenshot with numbered marks on it and, beside or under it, what each mark points at. */
function ShotFig({ shot, kind }: { shot: Shot; kind: "panel" | "wide" }) {
  return (
    <figure className="ml-shot" data-kind={kind}>
      {/* a wide screen keeps a readable size on a phone and scrolls sideways inside this box */}
      <span className="ml-shot-scroll" data-scroll-label={`${shot.alt} (scrolls sideways)`}>
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

  const root = useScrollRoot();
  // pinned only where the whole frame fits under the bar (a phone on its side, a window zoomed to
  // 200%, a short laptop: there it would hide steps 03 and 04); otherwise the finished loop is shown
  useEffect(() => {
    if (reducedMotion()) return setStill(true);
    const sc = scene.current;
    const fr = frame.current;
    if (!sc || !fr || !root) return;
    const check = () => {
      sc.removeAttribute("data-still"); // measured as it would be pinned
      const fits = (parseFloat(getComputedStyle(fr).top) || 0) + fr.offsetHeight <= root.clientHeight;
      if (!fits) sc.setAttribute("data-still", "");
      setStill(!fits);
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, [root]);
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
                        <span className="ml-loop-words">{step >= 3 ? m.loopPosted : m.loopInvest.words.join(" · ")}</span>
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
  return (
    <Section label={m.label} id="ml-melon">
      <h2 className="cs-h2">
        <Lines lines={m.title} />
      </h2>

      <Loop />

      {/* the student side: the working extension, recorded, with what each part shows */}
      <div className="ml-clip ml-half">
        <p className="label ml-half-k">{m.student.label}</p>
        <MelonPanelClip />
        <ol className="ml-callouts">
          {m.chapters.map((c, i) => (
            <li key={c.k}>
              <span className="ml-ch-n">0{i + 1}</span>
              <b>{c.k}</b>
              <span>{c.v}</span>
            </li>
          ))}
        </ol>
      </div>

      {/* the advisor side: a design prototype, marked */}
      <div className="ml-half">
        <p className="label ml-half-k">{m.advisor.label}</p>
        <div className="ml-shots ml-shots--wide">
          <ShotFig shot={m.advisor.shot} kind="wide" />
        </div>
      </div>
    </Section>
  );
}

/* ───────────── 07 Design × Build ───────────── */

function Build() {
  const b = C.build;
  return (
    <Section label={b.label} id="ml-build" className="ml-build">
      <h2 className="cs-h2">{b.title}</h2>
      <p className="cs-body cs-measure">{b.text}</p>
      <div className="ml-build-pair">
        {b.pair.map((p) => (
          <figure key={p.k}>
            <span className="ml-build-pic">
              <img src={p.src} alt={p.alt} width={p.w} height={p.h} loading="lazy" decoding="async" />
            </span>
            <figcaption className="label">{p.k}</figcaption>
          </figure>
        ))}
      </div>
      <h3 className="cs-h3 ml-h3">{b.brokeTitle}</h3>
      <ol className="ml-build-broke">
        {b.broke.map((t, i) => (
          <li key={i} data-pending={isTodo(t) || undefined}>
            <span className="ml-ch-n">0{i + 1}</span>
            <span>
              <Todo s={t} />
            </span>
          </li>
        ))}
      </ol>
      <div className="ml-stack">
        <ToolChips tools={b.stack} />
        <p>
          {b.stackNote} <Todo s={b.link} />
        </p>
      </div>
    </Section>
  );
}

/* ───────────── 08 Validation ───────────── */

function Validation() {
  const v = C.valid;
  return (
    <Section label={v.label} id="ml-valid">
      <h2 className="cs-h2">{v.title}</h2>
      <p className="ml-methods-note ml-valid-setup">
        <Todo s={v.setup} />
      </p>
      <ul className="ml-methods ml-methods--3 ml-nums">
        {v.results.map((r, i) => (
          <li key={i} data-pending={isTodo(r.n) || undefined}>
            <span className="ml-method-n">
              <Todo s={r.n} />
            </span>
            <span>
              <Todo s={r.v} />
            </span>
          </li>
        ))}
      </ul>
      <div className="ml-photo-slot" role="img" aria-label="Photo to come">
        <Todo s={v.photo} />
      </div>
      <figure className="ml-pull">
        <blockquote>“{v.quote.q}”</blockquote>
        <figcaption>
          {v.quote.who} · <Todo s={v.quote.check} />
        </figcaption>
      </figure>
      <h3 className="cs-h3 ml-h3">{v.openTitle}</h3>
      <ul className="ml-openqs">
        {v.open.map((o) => (
          <li key={o.h}>
            <b>{o.h}</b>
            <span>{o.v}</span>
          </li>
        ))}
      </ul>
      <p className="cs-body ml-pilot">
        <Todo s={v.pilot} />
      </p>
    </Section>
  );
}
