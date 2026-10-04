/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useRef, useState } from "react";
import { pages, profile, type Page } from "@/content/site";
import { isCaseId, longHash } from "@/content/cases/ids";
import { isPlayId, playHash } from "@/content/routes";
import { useShell } from "../shell-context";
import { Hello, formatNY, useNow } from "../HomePage";
import { ShaderHero } from "../ShaderHero";
import { ExtArrow } from "../icons";
import { loadCase } from "../case/load";
import { loadPlay } from "./play-load";
import { NameChip, PhoneBar, SiteNav } from "./Nav";

/**
 * Home: who she is, then the work.
 * The first screen is the introduction (the sentence, with her photo in it, and four facts), as
 * tall as the window minus a strip at the bottom where the tops of the first two cards show:
 * the work is one scroll away, and it says so. Below: four projects as large cards (each opens
 * its case study), four play pieces the same way (two to a row), and a way to say hi.
 */
/** The card that opened the page now on screen: focus goes back to it when that page closes. */
let opener: HTMLElement | null = null;

export function Home({ hidden }: { hidden: boolean }) {
  // Back from a case study or a play page: the card it was opened from has the focus again
  // (keyboard and screen-reader users carry on from where they were, not from the top).
  const was = useRef(hidden);
  useEffect(() => {
    if (was.current && !hidden && opener?.isConnected) opener.focus({ preventScroll: true });
    if (!hidden) opener = null;
    was.current = hidden;
  }, [hidden]);

  // The gradient only runs while the introduction is on screen (and Home isn't under another page)
  const hero = useRef<HTMLElement>(null);
  const [seen, setSeen] = useState(true);
  useEffect(() => {
    const el = hero.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([e]) => setSeen(e.isIntersecting), { threshold: 0.05 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const work = pages.filter((p) => p.group === "work" || p.group === "progress");
  const fun = pages.filter((p) => p.group === "fun");

  return (
    <div className="nh" id="main" data-hidden={hidden || undefined} aria-hidden={hidden || undefined} inert={hidden ? true : undefined}>
      <PhoneBar />
      <section className="nh-hero" ref={hero} aria-label="Introduction">
        <ShaderHero active={seen && !hidden} />
        <div className="nh-top">
          <NameChip />
          <SiteNav at="work" />
        </div>
        <div className="nh-intro">
          <Hello me now={false} />
          <Facts />
        </div>
      </section>

      <section className="nh-work" id="work" aria-label="Selected work">
        <ul className="nh-grid">
          {work.map((p) => (
            <li key={p.id}>
              <Card page={p} />
            </li>
          ))}
        </ul>
      </section>

      <section className="nh-play" id="play" aria-labelledby="nh-play-h">
        <header className="nh-sech">
          <h2 className="label" id="nh-play-h">
            Play
          </h2>
          <span className="label" aria-hidden>
            {String(fun.length).padStart(2, "0")}
          </span>
        </header>
        <ul className="nh-grid nh-grid--play">
          {fun.map((p) => (
            <li key={p.id}>
              <Card page={p} play />
            </li>
          ))}
        </ul>
      </section>

      <SayHi />
    </div>
  );
}

/* Now / Before / Where (with New York time) and what she is open to: the right half of the
   introduction, lined up with the second column of cards under it. */
function Facts() {
  const rows = profile.facts.filter((f) => f.label !== "Next");
  return (
    <dl className="nh-facts">
      {rows.map((f) => (
        <div key={f.label}>
          <dt>{f.label}</dt>
          <dd>{f.value}</dd>
        </div>
      ))}
      <div>
        <dt>Where</dt>
        <dd>
          {profile.meta[1]} <span aria-hidden>·</span> <Clock />
        </dd>
      </div>
      <div>
        <dt>
          <span className="nh-dot" aria-hidden />
          <span className="sr-only">Status</span>
        </dt>
        <dd>{profile.status}</dd>
      </div>
    </dl>
  );
}

function Clock() {
  const now = useNow();
  return (
    <span className="nh-clock" suppressHydrationWarning title="New York time">
      {now ? formatNY(now) : "00:00:00"}
    </span>
  );
}

/** The large line: the card's own headline, or the tagline (a single sentence loses its full stop). */
const headlineOf = (p: Page) => p.headline ?? p.tagline.replace(/^([^.]*)\.$/, "$1");

/** After the name: status and year. Falls back to `meta`: "Motion • 3D • 2026" → "Motion · 3D 2026". */
function cardLine(p: Page) {
  if (p.card) return p.card;
  const parts = p.meta.split(/\s*•\s*/);
  const year = /^\d{4}$/.test(parts[parts.length - 1]) ? parts.pop() : "";
  return [parts.join(" · "), year].filter(Boolean).join(" ");
}

/**
 * One project, labelled the way Rachel Chen labels hers: a large line that says what it is and
 * for whom, and under it the project's name, its status and the year.
 * The whole card is the link: a work card opens its case study, a play card its page; what a
 * click does appears at the end of the small line on hover or focus (always, on touch screens).
 * ZipFlow has no case study yet: its card doesn't open anything and says “Coming soon” there.
 * Phones show the play pieces as small cards, two to a row, with just the name.
 */
function Card({ page: p, play = false }: { page: Page; play?: boolean }) {
  const { openCase, openPlay } = useShell();
  const headline = headlineOf(p);
  const soon = p.status === "soon";
  const toCase = isCaseId(p.id) ? p.id : null;
  const toPlay = isPlayId(p.id) ? p.id : null;
  const href = toCase ? `/${longHash(toCase)}` : toPlay ? `/${playHash(toPlay)}` : undefined;
  // the page's code starts downloading as soon as the pointer or focus reaches the card
  const warm = () => void (toCase ? loadCase() : toPlay ? loadPlay() : null)?.catch(() => {});

  const body = (
    <>
      <span className="nh-card-media">{p.thumb && <img src={p.thumb} alt="" loading="lazy" decoding="async" />}</span>
      <span className="nh-card-title">{headline}</span>
      <span className="nh-card-line">
        <span className="label">{`${p.title} • ${cardLine(p)}`}</span>
        <span className="label nh-card-go" aria-hidden>
          {soon ? (
            "Coming soon"
          ) : (
            <>
              {toCase ? "Read case study" : "Open"} <span className="nh-card-arrow">→</span>
            </>
          )}
        </span>
      </span>
      {/* phones' small play cards show this instead of the two lines above */}
      <span className="nh-card-name" aria-hidden>
        {p.title}
      </span>
    </>
  );

  if (!href || soon)
    return (
      <div className={`nh-card${play ? " nh-card--play" : ""}`} data-soon="">
        {body}
        <span className="sr-only">Coming soon</span>
      </div>
    );
  return (
    <a
      className={`nh-card${play ? " nh-card--play" : ""}`}
      href={href}
      aria-label={`${p.title}: ${headline}. ${toCase ? "Read the case study" : "Open"}`}
      onPointerEnter={warm}
      onFocus={warm}
      onClick={(e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button) return;
        e.preventDefault();
        opener = e.currentTarget;
        if (toCase) openCase(toCase);
        else if (toPlay) openPlay(toPlay);
      }}
    >
      {body}
    </a>
  );
}

function SayHi() {
  const { copyEmail } = useShell();
  const hi = pages.find((p) => p.id === "hi");
  return (
    <section className="nh-hi" id="hi" aria-labelledby="nh-hi-h">
      <div>
        <p className="label">Say hi</p>
        <h2 className="nh-hi-h" id="nh-hi-h">
          {hi?.tagline}
        </h2>
      </div>
      <div className="nh-hi-actions">
        <a className="sn-link" href={profile.links.resume} target="_blank" rel="noreferrer">
          Resume
          <ExtArrow />
        </a>
        <button className="btn btn--primary" onClick={copyEmail}>
          Copy email
        </button>
      </div>
    </section>
  );
}
