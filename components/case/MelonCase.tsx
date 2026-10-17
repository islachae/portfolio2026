/* eslint-disable @next/next/no-img-element */
"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { melonCase as C, type Shot } from "@/content/cases/melon";
import { reducedMotion } from "../shell-context";
import { ToolChips } from "../ProjectBrief";
import { Lines, Section, Takeaways, useStickyProgress } from "./kit";
import { useScrollRoot } from "./scroll-root";
import { MelonPanelClip } from "../Stages";

/**
 * CMU Mellon, in nine sections with one headline each, so the headlines alone tell the story:
 * the brief, one email read two ways, what the research showed, five concepts, three decisions,
 * the solution (the loop film, the working student panel, the advisor's dashboard), what building it
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

type Reader = "donna" | "student";

/**
 * One email, two readers. Where the whole frame fits under the bar, it is pinned while the page
 * scrolls: the first half of the scroll shows it as Donna sent it, the second half as a student
 * read it, then it lets go. The two buttons stay, and pressing one scrolls to its half, so the scroll
 * is the one source of truth. With reduced motion, or a window too short to hold it, nothing is
 * pinned and the buttons simply switch.
 */
function Gap() {
  const g = C.gap;
  const root = useScrollRoot();
  const scene = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLDivElement>(null);
  const p = useStickyProgress(scene, frame);
  const [still, setStill] = useState(false);
  const [picked, setPicked] = useState<Reader>("donna");
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
  const mode: Reader = still ? picked : p < 0.5 ? "donna" : "student";
  const choose = (r: Reader) => {
    setPicked(r);
    const sc = scene.current;
    const fr = frame.current;
    if (still || !sc || !fr || !root) return;
    // scroll to the middle of that reader's half
    const top = sc.getBoundingClientRect().top - root.getBoundingClientRect().top + root.scrollTop;
    const stick = parseFloat(getComputedStyle(fr).top) || 0;
    const travel = sc.offsetHeight - fr.offsetHeight;
    root.scrollTo({ top: top - stick + travel * (r === "donna" ? 0.2 : 0.75), behavior: reducedMotion() ? "auto" : "smooth" });
  };
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const onKey = (e: React.KeyboardEvent, i: number) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    const next = (i + 1) % 2;
    choose(g.modes[next].id as Reader);
    tabs.current[next]?.focus();
  };
  const mark = (m?: { donna?: number; student?: number }) => m?.[mode];
  const notes = g.notes[mode];

  return (
    <Section label={g.label} id="ml-gap">
      <h2 className="cs-h2">
        <Lines lines={g.title} />
      </h2>

      <div className="ml-readscene" ref={scene} data-still={still || undefined}>
      <div className="ml-read" data-mode={mode} ref={frame}>
        <p className="ml-ftitle">{g.frame}</p>
        <div className="ml-steps2" role="tablist" aria-label="Read the email as">
          {g.modes.map((m, i) => {
            // each step's line fills over its half of the scroll; when nothing is pinned, the chosen one is full
            const fill = still ? (mode === m.id ? 1 : 0) : Math.min(1, Math.max(0, (p - i * 0.5) / 0.5));
            return (
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
                className="ml-step2"
                onClick={() => choose(m.id as Reader)}
                onKeyDown={(e) => onKey(e, i)}
              >
                <span className="ml-step2-bar" aria-hidden>
                  <i style={{ transform: `scaleX(${i === 0 && !still ? Math.max(fill, 0.04) : fill})` }} />
                </span>
                <span className="ml-step2-k">
                  {m.k}
                  {i === 1 && !still && mode === "donna" ? <span className="ml-step2-hint"> · {g.scrollHint}</span> : null}
                </span>
                <span className="ml-step2-t">{m.label}</span>
              </button>
            );
          })}
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

/** One step of the research: what we did (small), then what it showed (the heading). */
function RStep({ n, k, h }: { n: number; k: string; h: string }) {
  return (
    <header className="ml-rstep-h">
      <span className="ml-rstep-n" aria-hidden>
        {String(n).padStart(2, "0")}
      </span>
      <div>
        <p className="ml-rstep-k">{k}</p>
        <h3 className="ml-rstep-t">{h}</h3>
      </div>
    </header>
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

      <ol className="ml-rsteps">
        {/* Step 1: the map */}
        <li className="ml-rstep">
          <RStep n={1} k={r.steps[0].k} h={r.steps[0].h} />
          <figure className="ml-frame" id="ml-map" tabIndex={-1}>
            <figcaption className="ml-ftitle">{r.map.frame}</figcaption>
            <div className="ml-mapvid" style={{ aspectRatio: `${r.map.w} / ${r.map.h}` }}>
              <LoopVideo mp4={r.map.mp4} poster={r.map.poster} label={r.map.alt} w={r.map.w} h={r.map.h} />
            </div>
          </figure>
          <ul className="ml-methods ml-methods--3 ml-nums">
            {r.numbers.map((m) => (
              <li key={m.v}>
                <span className="ml-method-n">{m.n}</span>
                <span>{m.v}</span>
              </li>
            ))}
          </ul>
        </li>

        {/* Step 2: the interviews */}
        <li className="ml-rstep">
          <RStep n={2} k={r.steps[1].k} h={r.steps[1].h} />
          <ol className="ml-broke">
            {r.broke.map((b) => (
              <li key={b.a}>
                <p className="ml-broke-a">
                  <span className="label">{r.brokeLabels.a}</span>
                  <s>{b.a}</s>
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
        </li>

        {/* Step 3: the survey */}
        <li className="ml-rstep" id="ml-survey">
          <RStep n={3} k={r.steps[2].k} h={r.steps[2].h} />
          <ul className="ml-openqs ml-openqs--3">
            {v.findings.map((f) => (
              <li key={f.h}>
                <b>{f.h}</b>
                <span>{f.v}</span>
              </li>
            ))}
          </ul>
        </li>
      </ol>
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
            <span className="ml-concept-why">{c.why}</span>
          </li>
        ))}
      </ul>
      <div className="ml-side">
        <figure className="ml-frame">
          <span className="ml-ftitle">{d.sketchTitle}</span>
          <img className="ml-frame-img" src={d.sketch.src} alt={d.sketch.alt} width={d.sketch.w} height={d.sketch.h} loading="lazy" />
        </figure>
        <div className="ml-side-text">
          <b>{d.sketchTitle}</b>
          <p>{d.sketchCap}</p>
        </div>
      </div>
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
          <li className="ml-dec ml-side" id={it.id} key={it.id} tabIndex={-1}>
            <figure className="ml-frame">
              <span className="ml-ftitle">{it.frame}</span>
              <img className="ml-frame-img" src={it.img.src} alt={it.img.alt} width={it.img.w} height={it.img.h} loading="lazy" decoding="async" />
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
function ShotFig({ shot, kind, title }: { shot: Shot; kind: "panel" | "wide"; title?: string }) {
  return (
    <figure className="ml-shot" data-kind={kind}>
      {/* a wide screen keeps a readable size on a phone and scrolls sideways inside this box */}
      <span className="ml-shot-scroll" data-scroll-label={`${shot.alt} (scrolls sideways)`}>
        {title ? <span className="ml-ftitle">{title}</span> : null}
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

function Solution() {
  const m = C.melon;
  return (
    <Section label={m.label} id="ml-melon">
      <h2 className="cs-h2">
        <Lines lines={m.title} />
      </h2>

      <figure className="ml-frame" data-tone="warm">
        <figcaption className="ml-ftitle">{m.loop.frame}</figcaption>
        <div className="ml-loopvid" style={{ aspectRatio: `${m.loop.w} / ${m.loop.h}` }}>
          <LoopVideo mp4={m.loop.mp4} poster={m.loop.poster} label={m.loop.alt} w={m.loop.w} h={m.loop.h} />
        </div>
      </figure>

      {/* the student side: the working extension, recorded, with what each part shows */}
      <div className="ml-clip ml-half">
        <div className="ml-frame">
          <span className="ml-ftitle">{m.student.label}</span>
          <MelonPanelClip />
        </div>
        <ol className="ml-callouts">
          {m.chapters.map((c, i) => (
            <li key={c}>
              <span className="ml-ch-n">0{i + 1}</span>
              <b>{c}</b>
            </li>
          ))}
        </ol>
      </div>

      {/* the advisor side: a design prototype, marked */}
      <div className="ml-half">
        <div className="ml-shots ml-shots--wide">
          <ShotFig shot={m.advisor.shot} kind="wide" title={m.advisor.label} />
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
              <span className="ml-ftitle">{p.k}</span>
              <img src={p.src} alt={p.alt} width={p.w} height={p.h} loading="lazy" decoding="async" />
            </span>
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
          {b.stackNote}
          {b.link ? (
            <>
              {" "}
              <Todo s={b.link} />
            </>
          ) : null}
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
      {v.photo ? (
        <div className="ml-photo-slot" role="img" aria-label="Photo to come">
          <Todo s={v.photo} />
        </div>
      ) : null}
      {v.showQuote ? (
        <figure className="ml-pull">
          <blockquote>“{v.quote.q}”</blockquote>
          <figcaption>
            {v.quote.who}
            {v.quote.check ? (
              <>
                {" · "}
                <Todo s={v.quote.check} />
              </>
            ) : null}
          </figcaption>
        </figure>
      ) : null}
      <h3 className="cs-h3 ml-h3">{v.openTitle}</h3>
      <ul className="ml-openqs">
        {v.open.map((o) => (
          <li key={o.h}>
            <b>{o.h}</b>
            <span>{o.v}</span>
          </li>
        ))}
      </ul>
      {v.pilot ? (
        <p className="cs-body ml-pilot">
          <Todo s={v.pilot} />
        </p>
      ) : null}
    </Section>
  );
}
