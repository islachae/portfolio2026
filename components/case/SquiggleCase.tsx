/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useRef, useState } from "react";
import { squiggleCase as C } from "@/content/cases/squiggle";
import { reducedMotion } from "../shell-context";
import { Section, Takeaways } from "./kit";
import { useScrollRoot } from "./scroll-root";

/**
 * Squiggle, in eight sections with one headline each, so the headlines alone tell the story:
 * the brief, the problem (the submission video's opening animation), the solution (three goals,
 * three clips), the twist (we used it on ourselves from day 1), the research, the three decisions
 * (each one an option switcher, like the deck we pitched with), trust, and what carries over.
 */
export function SquiggleCase() {
  return (
    <article className="cs-article sq">
      <Impact />
      <Brief />
      <Problem />
      <Solution />
      <Built />
      <Research />
      <Decisions />
      <Trust />
      <Takeaways t={C.takeaways} />
      <p className="sq-next cs-measure">{C.takeaways.next}</p>
    </article>
  );
}

/** A looping, silent clip that plays only while on screen (and never with reduced motion). */
function Clip({ mp4, poster, label, w, h }: { mp4: string; poster: string; label: string; w: number; h: number }) {
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
          <li key={i}>
            {it.n ? (
              <b className="ml-impact-n" data-wide={it.wide || undefined}>
                {it.n}
              </b>
            ) : null}
            <span className="ml-impact-v">{it.v}</span>
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
    <Section label={b.label} id="sq-brief">
      <h2 className="cs-h2">{b.title}</h2>
      <p className="cs-body cs-measure">{b.text}</p>
    </Section>
  );
}

/* ───────────── 02 Problem: the opening animation carries it ───────────── */

function Problem() {
  const p = C.problem;
  return (
    <Section label={p.label} id="sq-problem">
      <h2 className="cs-h2">
        {p.title[0]} {p.title[1]}
      </h2>
      <figure className="sq-film">
        <Clip mp4={p.film.mp4} poster={p.film.poster} label={p.film.alt} w={p.film.w} h={p.film.h} />
        <figcaption className="cs-cap">From our submission video</figcaption>
      </figure>
      <p className="cs-body cs-measure">{p.text}</p>
      <p className="sq-hmw cs-measure">{p.hmw}</p>
    </Section>
  );
}

/* ───────────── 03 Solution: three goals, three clips ───────────── */

function Solution() {
  const s = C.solution;
  return (
    <Section label={s.label} id="sq-solution">
      <h2 className="cs-h2">{s.title}</h2>
      <p className="cs-body cs-measure">{s.text}</p>
      <div className="sq-goals">
        {s.goals.map((g) => (
          <div className="sq-goal" key={g.k}>
            <div className="sq-goal-shot" data-lime={("lime" in g && g.lime) || undefined}>
              <Clip mp4={g.mp4} poster={g.poster} label={g.alt} w={g.vw} h={g.vh} />
            </div>
            <div className="sq-goal-copy">
              <p className="label">{g.k}</p>
              <h3 className="sq-h3">{g.h}</h3>
              <p className="sq-small">{g.t}</p>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}

/* ───────────── 04 Built on day 1: the twist ───────────── */

function Built() {
  const b = C.built;
  return (
    <Section label={b.label} id="sq-built">
      <h2 className="cs-h2">
        {b.title[0]} {b.title[1]}
      </h2>
      <ul className="sq-numbers">
        {b.numbers.map((n) => (
          <li key={n.v}>
            <b>{n.n}</b>
            <span>{n.v}</span>
          </li>
        ))}
      </ul>
      <p className="label sq-learned">{b.learnedLabel}</p>
      <div className="sq-learn">
        <div className="sq-learn-copy">
          <h3 className="sq-h3">{b.one.h}</h3>
          <p className="sq-small">{b.one.t}</p>
          <p className="sq-pivot">
            <s>{b.one.from}</s>
            <span aria-hidden>→</span>
            <em>{b.one.to}</em>
          </p>
        </div>
        <figure className="sq-learn-shot">
          <Clip mp4={b.one.film.mp4} poster={b.one.film.poster} label={b.one.film.alt} w={b.one.film.w} h={b.one.film.h} />
          <figcaption className="cs-cap">{b.one.cap}</figcaption>
        </figure>
      </div>
      <div className="sq-twist">
        <blockquote className="sq-card">
          <p className="label">{b.two.quoteLabel}</p>
          <p className="sq-card-q">“{b.two.quote}”</p>
        </blockquote>
        <div className="sq-twist-copy">
          <h3 className="sq-h3">{b.two.h}</h3>
          <p className="sq-small">{b.two.t}</p>
        </div>
      </div>
      <p className="cs-cap cs-measure">{b.surprise}</p>
    </Section>
  );
}

/* ───────────── 05 Research ───────────── */

function Research() {
  const r = C.research;
  return (
    <Section label={r.label} id="sq-research">
      <h2 className="cs-h2">{r.title}</h2>
      <ul className="sq-interviews">
        {r.interviews.map((it) => {
          const [before, after] = it.q.split(it.mark);
          return (
            <li key={it.who}>
              <img src={it.src} alt={`Interview · ${it.who}`} loading="lazy" width={480} height={480} />
              <blockquote>
                “{before}
                <mark>{it.mark}</mark>
                {after}”
              </blockquote>
              <p className="cs-cap">{it.who}</p>
            </li>
          );
        })}
      </ul>
      <div className="sq-mentor">
        <p className="label">{r.mentor.k}</p>
        <div>
          <p className="sq-mentor-q">“{r.mentor.q}”</p>
          <p className="sq-small">{r.mentor.t}</p>
        </div>
      </div>
      <div className="sq-insights">
        {r.insights.map((t) => (
          <p key={t}>
            <span className="label">Insight</span>
            {t}
          </p>
        ))}
      </div>
      <p className="cs-cap">{r.goalsLine}</p>
    </Section>
  );
}

/* ───────────── 06 Decisions: an option switcher per goal, like the deck we pitched with ───────────── */

type Opt = (typeof C.decisions.items)[number]["options"][number];

function OptionMedia({ o }: { o: Opt }) {
  if ("mp4" in o && o.mp4) return <Clip mp4={o.mp4} poster={o.poster as string} label={`${o.tab} — ${o.cap}`} w={o.w} h={o.h} />;
  return <img src={(o as { src: string }).src} alt={`${o.tab} — ${o.cap}`} loading="lazy" width={o.w} height={o.h} />;
}

function Decision({ d }: { d: (typeof C.decisions.items)[number] }) {
  const keptIndex = d.options.findIndex((o) => "kept" in o && o.kept);
  const [on, setOn] = useState(keptIndex);
  const o = d.options[on];
  const kept = "kept" in o && o.kept;
  return (
    <div className="sq-decision" id={d.id}>
      <h3 className="sq-h3">
        <span className="sq-pin" aria-hidden>
          {d.n}
        </span>
        {d.h}
      </h3>
      <div className="sq-tabs" role="tablist" aria-label={`${d.h}: the options we tried`}>
        {d.options.map((opt, i) => (
          <button
            key={opt.tab}
            role="tab"
            aria-selected={i === on}
            className="sq-tab"
            data-kept={("kept" in opt && opt.kept) || undefined}
            onClick={() => setOn(i)}
          >
            {opt.tab}
            {"kept" in opt && opt.kept ? <em> · Kept</em> : null}
          </button>
        ))}
      </div>
      <div className="sq-pane" data-kept={kept || undefined}>
        <OptionMedia o={o} />
        <p className="sq-pane-cap">
          <b aria-hidden>{kept ? "✓" : "✕"}</b>
          <span className="sr-only">{kept ? "Kept: " : "Set aside: "}</span>
          {o.cap}
        </p>
      </div>
    </div>
  );
}

function Decisions() {
  const d = C.decisions;
  return (
    <Section label={d.label} id="sq-decisions">
      <h2 className="cs-h2">{d.title}</h2>
      <p className="cs-cap">{d.hint}</p>
      <div className="sq-decisions">
        {d.items.map((it) => (
          <Decision d={it} key={it.id} />
        ))}
      </div>
    </Section>
  );
}

/* ───────────── 07 Designing for trust ───────────── */

function Trust() {
  const t = C.trust;
  return (
    <Section label={t.label} id="sq-trust">
      <h2 className="cs-h2">{t.title}</h2>
      <div className="sq-trust">
        <figure className="sq-trust-shot">
          <img src={t.shot.src} alt={t.shot.alt} loading="lazy" width={t.shot.w} height={t.shot.h} />
        </figure>
        <ul className="sq-trust-points">
          {t.points.map((p) => (
            <li key={p.h}>
              <b>{p.h}</b>
              <span>{p.t}</span>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}
