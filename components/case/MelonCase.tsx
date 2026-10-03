/* eslint-disable @next/next/no-img-element */
"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { melonCase as C, type Verdict } from "@/content/cases/melon";
import { reducedMotion } from "../shell-context";
import { Lines, Section, Takeaways } from "./kit";

/**
 * CMU Melon: a systems project first, a product second. The page follows the work in that order:
 * the gap between sender and reader, one event traced through the system, what both sides said,
 * the framing and limits, then the panel and the advisor's side. Two interactions only:
 * the same email read two ways, and the prototype recording with its chapters.
 */
export function MelonCase() {
  return (
    <article className="cs-article ml">
      <Hero />
      <Gap />
      <Scope />
      <Research />
      <Heard />
      <Survey />
      <Frame />
      <Directions />
      <Panel />
      <Advisor />
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

/* ───────────── Scope: one event through the system ───────────── */

function Scope() {
  const s = C.scope;
  return (
    <Section label={s.label} id="ml-scope">
      <h2 className="cs-h2">
        <Lines lines={s.title} />
      </h2>
      <p className="cs-body cs-measure">{s.text}</p>
      <figure className="ml-fig ml-fig--photo">
        <img src={s.photo.src} alt={s.photo.alt} width={s.photo.w} height={s.photo.h} loading="lazy" />
      </figure>
      <ol className="ml-reasons">
        {s.reasons.map((r, i) => (
          <li key={r.k}>
            <span className="ml-reason-n">0{i + 1}</span>
            <b>{r.k}</b>
            <span>{r.v}</span>
          </li>
        ))}
      </ol>

      <div className="ml-map" id="ml-map" tabIndex={-1}>
        <h3 className="cs-h3 ml-h3">
          {s.mapTitle}
          <span className="ml-mine">{s.mine}</span>
        </h3>
        <p className="cs-body cs-measure">{s.mapText}</p>
        <figure className="ml-fig ml-fig--map">
          <img src={s.map.src} alt={s.map.alt} width={s.map.w} height={s.map.h} loading="lazy" />
        </figure>
        <ul className="ml-map-findings">
          {s.findings.map((f) => (
            <li key={f}>{f}</li>
          ))}
        </ul>
      </div>
    </Section>
  );
}

/* ───────────── Research ───────────── */

const VERDICT: Record<Verdict, string> = { held: "Held", partly: "Partly", broke: "Broke" };

function Research() {
  const r = C.research;
  return (
    <Section label={r.label} id="ml-research">
      <h2 className="cs-h2">
        <Lines lines={r.title} />
      </h2>
      <ul className="ml-methods">
        {r.methods.map((m) => (
          <li key={m.k} data-pending={("pending" in m && m.pending) || undefined}>
            <span className="ml-method-n" data-empty={m.n === null || undefined}>
              {m.n ?? "—"}
            </span>
            <b>{m.k}</b>
            <span>{m.v}</span>
          </li>
        ))}
      </ul>

      <h3 className="cs-h3 ml-h3">{r.assumptionsTitle}</h3>
      <ul className="ml-assume">
        {r.assumptions.map((a) => (
          <li key={a.a} data-v={a.v}>
            <span className="ml-assume-a">{a.a}</span>
            <span className="ml-verdict" data-v={a.v}>
              {VERDICT[a.v]}
            </span>
            <span className="ml-assume-why">{a.why}</span>
          </li>
        ))}
      </ul>
    </Section>
  );
}

function Heard() {
  const h = C.heard;
  return (
    <Section label={h.label} id="ml-heard">
      <h2 className="cs-h2">
        <Lines lines={h.title} />
      </h2>
      {/* The whole finding in one picture: messages go out, almost nothing comes back */}
      <div className="ml-flow" role="img" aria-label={`${h.flow.from} to ${h.flow.to}: ${h.flow.out}. Back: ${h.flow.back}.`}>
        <span className="ml-flow-node">{h.flow.from}</span>
        <span className="ml-flow-lanes" aria-hidden>
          <span className="ml-flow-out">
            <i />
            <b>{h.flow.out}</b>
          </span>
          <span className="ml-flow-back">
            <i />
            <b>{h.flow.back}</b>
          </span>
        </span>
        <span className="ml-flow-node">{h.flow.to}</span>
      </div>
      <ol className="ml-insights">
        {h.insights.map((it, i) => (
          <li key={it.h}>
            <span className="ml-insight-n">0{i + 1}</span>
            <h3 className="ml-insight-h">{it.h}</h3>
            {it.quotes.map((q) => (
              <figure className="ml-insight-q" key={q.q}>
                <blockquote>“{q.q}”</blockquote>
                <figcaption>{q.who}</figcaption>
              </figure>
            ))}
            {"note" in it && it.note ? <p className="ml-insight-note">{it.note}</p> : null}
          </li>
        ))}
      </ol>
      <figure className="ml-pull">
        <blockquote>“{h.pull.q}”</blockquote>
        <figcaption>{h.pull.src}</figcaption>
      </figure>
    </Section>
  );
}

/* ───────────── Survey ───────────── */

/**
 * The survey in three numbers. Each column: the count, one square per student who answered (the
 * ones counted in Melon red), what it means in a few words, and where it shows up in Melon. The
 * funding question we haven't settled is one line under it, and every answer stays one click away
 * under “All answers” (bar charts, count at the tip, share on hover).
 */
function Survey() {
  const v = C.survey;
  return (
    <Section label={v.label} id="ml-survey">
      <h2 className="cs-h2">
        <Lines lines={v.title} />
      </h2>
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
            <h3 className="ml-find-h">{f.h}</h3>
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
                {c.rows.map((r) => (
                  <li
                    key={r.k}
                    data-key={("key" in r && r.key) || undefined}
                    style={{ ["--w" as string]: `${(r.v / c.n) * 100}%` }}
                    aria-label={`${r.k}: ${r.v} of ${c.n}`}
                  >
                    <span className="ml-bar-k" aria-hidden>
                      {r.k}
                    </span>
                    <span className="ml-bar-track" aria-hidden>
                      <i className="ml-bar" />
                      <span className="ml-bar-v">
                        {r.v} <small>of {c.n}</small>
                        <em> · {Math.round((r.v / c.n) * 100)}%</em>
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
    </Section>
  );
}

/* ───────────── Framing and limits ───────────── */

const LANE_MARK: Record<string, string> = { ok: "✓", unsure: "?", stop: "→" };

function Frame() {
  const f = C.frame;
  return (
    <Section label={f.label} id="ml-frame">
      <h2 className="cs-h2 ml-hmw">
        {f.hmw.map((p, i) => (p.hi ? <em key={i}>{p.t}</em> : <Fragment key={i}>{p.t}</Fragment>))}
      </h2>
      <h3 className="cs-h3 ml-h3">{f.rulesTitle}</h3>
      <ol className="ml-rules">
        {f.rules.map((r, i) => (
          <li key={r.h}>
            <span className="ml-rule-n">0{i + 1}</span>
            <b>{r.h}</b>
            <span>{r.why}</span>
          </li>
        ))}
      </ol>
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

/* ───────────── The panel: what each part of the recording shows (the recording itself is the
   page's first screen: SplitHero) ───────────── */

function Panel() {
  const m = C.melon;
  return (
    <Section label={m.label} id="ml-melon">
      <h2 className="cs-h2">
        <Lines lines={m.title} />
      </h2>
      <p className="cs-body cs-measure">{m.text}</p>
      <ol className="ml-demo ml-parts">
        {m.chapters.map((c, i) => (
          <li key={c.k}>
            <span className="ml-ch-n">0{i + 1}</span>
            <span className="ml-ch-k">{c.k}</span>
            <p className="ml-ch-v">{c.v}</p>
          </li>
        ))}
      </ol>
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

function Advisor() {
  const a = C.advisor;
  return (
    <Section label={a.label} id="ml-advisor">
      <h2 className="cs-h2">
        <Lines lines={a.title} />
      </h2>
      <p className="cs-body cs-measure">{a.text}</p>
      <div className="ml-advisor">
        <ul className="ml-signals">
          {a.signals.map((s) => (
            <li key={s.k}>
              <b>{s.k}</b>
              <span>{s.v}</span>
            </li>
          ))}
        </ul>
        <div className="ml-pending" role="img" aria-label={a.pending}>
          <span>{a.pending}</span>
        </div>
      </div>
    </Section>
  );
}
