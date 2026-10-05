/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useRef } from "react";
import { aboutPage as A } from "@/content/cases/about";
import { profile, type PageId } from "@/content/site";
import type { CaseId } from "@/content/cases";
import { reducedMotion, useShell } from "../shell-context";
import { ArrowRight, MailIcon } from "../icons";

/**
 * The About page, in the order chaewon.works/about tells it: who I am, the art I made before
 * design, the words I design by (each with where it shows up in the work), off the clock, and
 * the handwritten note at the end. Square structure and hairlines; the photos are the only
 * things that tilt. They sit on the page as they are (no frame around them), at different sizes.
 */
export function AboutCase() {
  const ref = useRef<HTMLElement>(null);
  useDrift(ref);
  return (
    <article className="cs-article ab" ref={ref}>
      <Intro />
      <Art />
      <Principles />
      <Off />
      <Hi />
    </article>
  );
}

/**
 * The one motion the photos have: as the page scrolls, each `data-drift` element slides a little
 * against it at its own pace, some ahead of the scroll and some behind, so neighbours shift
 * against each other. The number is how far it travels (px) between the middle of the window
 * and one window away; positive runs ahead, negative lags. Wide screens only, and not with
 * reduced motion.
 */
function useDrift(ref: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    const root = ref.current?.closest(".cs") as HTMLElement | null;
    if (!ref.current || !root || reducedMotion()) return;
    const els = [...ref.current.querySelectorAll<HTMLElement>("[data-drift]")];
    const wide = window.matchMedia("(min-width: 761px)");
    let raf = 0;
    const update = () => {
      raf = 0;
      const view = root.getBoundingClientRect();
      const at = els.map((el) => {
        const box = el.parentElement!.getBoundingClientRect();
        return (box.top + box.height / 2 - view.top - view.height / 2) / view.height;
      });
      els.forEach((el, i) => {
        const p = wide.matches ? Math.max(-1, Math.min(1, at[i])) : 0;
        el.style.setProperty("--dy", `${(p * Number(el.dataset.drift)).toFixed(1)}px`);
      });
    };
    const on = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    root.addEventListener("scroll", on, { passive: true });
    window.addEventListener("resize", on);
    return () => {
      cancelAnimationFrame(raf);
      root.removeEventListener("scroll", on);
      window.removeEventListener("resize", on);
    };
  }, [ref]);
}

/* ───────────── Intro ───────────── */

const Pin = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden>
    <path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21Z" fill="none" stroke="currentColor" strokeWidth="1.8" />
    <circle cx="12" cy="9.5" r="2.4" fill="none" stroke="currentColor" strokeWidth="1.8" />
  </svg>
);
const Cap = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" aria-hidden>
    <path d="M2 9.5 12 5l10 4.5L12 14 2 9.5Z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    <path d="M6 11.5V16c0 1.4 2.7 3 6 3s6-1.6 6-3v-4.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
  </svg>
);

function Intro() {
  const I = A.intro;
  const toHi = (e: React.MouseEvent) => {
    e.preventDefault();
    const el = document.getElementById("ab-hi");
    el?.scrollIntoView({ behavior: reducedMotion() ? "auto" : "smooth", block: "start" });
  };
  return (
    <header className="cs-hero ab-intro" id="ab-intro">
      <div className="ab-intro-grid">
        <div className="ab-collage">
          {I.photos.map((p, i) => (
            <figure key={p.src} className={`ab-ph ab-pol ab-pol--${i}`} data-drift={[-30, 44, 22][i]}>
              <img src={p.src} alt={p.alt} width={p.w} height={p.h} />
              <figcaption>{p.cap}</figcaption>
            </figure>
          ))}
        </div>
        <div className="ab-intro-text">
          <p className="cs-eyebrow">{I.label}</p>
          <h1 className="cs-h1">{I.title}</h1>
          <p className="ab-badges">
            {I.badges.map((b) => (
              <span key={b.text}>
                {b.icon === "pin" ? <Pin /> : <Cap />}
                <span>{b.text}</span>
              </span>
            ))}
          </p>
          {I.text.map((t, i) => (
            <p key={i} className="cs-body ab-p">
              {t}
            </p>
          ))}
          <a className="ab-touch" href="#ab-hi" onClick={toHi}>
            <i aria-hidden />
            {I.touch.lead} <b>{I.touch.cta}</b>
            <ArrowRight size={14} />
          </a>
        </div>
      </div>
      {/* “What I’m good at” and “What pulls me in” (I.good, I.pulls) are left out for now */}
    </header>
  );
}

/* ───────────── Art ───────────── */

function Art() {
  const R = A.art;
  const { closeCase } = useShell();
  return (
    <section className="cs-sec ab-art" id="ab-art" aria-label={R.label}>
      <p className="cs-eyebrow">{R.label}</p>
      <h2 className="cs-h2">{R.title}</h2>
      <p className="cs-body cs-measure">{R.note}</p>
      <div className="ab-art-grid">
        <ol className="ab-shows">
          {R.shows.map((x) => (
            <li key={x.title}>
              <span className="ab-show-year">{x.year}</span>
              <span className="ab-show-main">
                <span className="ab-show-title">{x.title}</span>
                <span className="ab-show-sub">
                  {x.type} · {x.place}
                </span>
                {x.title === R.grewInto.title && (
                  <button className="ab-link" onClick={() => closeCase(R.grewInto.page)}>
                    {R.grewInto.text}
                    <ArrowRight size={13} />
                  </button>
                )}
              </span>
            </li>
          ))}
        </ol>
        <div className="ab-show-photos">
          {R.photos.map((p, i) => (
            <img key={p.src} src={p.src} alt={p.alt} className={`ab-show-ph ab-show-ph--${i}`} data-drift={[-18, 30, -24, 16][i]} loading="lazy" />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───────────── Principles ───────────── */

function Principles() {
  const P = A.principles;
  const { openCase, closeCase } = useShell();
  const go = (to: { case: CaseId } | { page: PageId }) => ("case" in to ? openCase(to.case) : closeCase(to.page));
  return (
    <section className="cs-sec ab-principles" id="ab-principles" aria-label={P.label}>
      <p className="cs-eyebrow">{P.label}</p>
      <h2 className="cs-h2">{P.title}</h2>
      <ol className="ab-cards">
        {P.items.map((q, i) => (
          <li key={q.title} className="ab-card">
            <span className="ab-card-n">{String(i + 1).padStart(2, "0")}</span>
            <h3 className="ab-card-h">{q.title}</h3>
            <blockquote className="ab-card-q">
              <p>“{q.quote}”</p>
              <cite>— {q.by}</cite>
            </blockquote>
            <button className="ab-where" onClick={() => go(q.where.to)}>
              <span className="ab-where-k">In {q.where.project}</span>
              <span className="ab-where-t">{q.where.text}</span>
              <ArrowRight size={14} className="ab-where-arrow" />
            </button>
          </li>
        ))}
      </ol>
    </section>
  );
}

/* ───────────── Off the clock ───────────── */

function Off() {
  const O = A.off;
  const { closeCase } = useShell();
  return (
    <section className="cs-sec" id="ab-off" aria-label={O.label}>
      <p className="cs-eyebrow">{O.label}</p>
      <h2 className="cs-h2">{O.title}</h2>
      <ul className="ab-off">
        {O.items.map((x, i) => (
          <li key={x.src} className="ab-off-item" data-drift={[-26, 40, -14][i]}>
            <figure className={`ab-ph ab-off-pol ab-off-pol--${i}`}>
              <img src={x.src} alt={x.alt} width={750} height={1000} loading="lazy" />
              <figcaption>{x.cap}</figcaption>
            </figure>
            <p className="ab-off-note">
              {x.note}
              {"link" in x && x.link && (
                <button className="ab-link" onClick={() => closeCase(x.link.page)}>
                  {x.link.text}
                  <ArrowRight size={13} />
                </button>
              )}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ───────────── Say hi: the note at the end ───────────── */

function Hi() {
  const H = A.hi;
  const { copyEmail } = useShell();
  return (
    <section className="cs-sec ab-hi" id="ab-hi" aria-label={H.label}>
      <p className="cs-eyebrow">{H.label}</p>
      <figure className="ab-note">
        <img src={H.note} alt={H.alt} width={1000} height={738} loading="lazy" />
      </figure>
      <div className="ab-hi-actions">
        <button className="btn btn--primary" onClick={copyEmail}>
          <MailIcon size={16} /> Copy email
        </button>
        <a className="btn btn--ghost" href={profile.links.resume} target="_blank" rel="noreferrer">
          Resume
        </a>
        <a className="btn btn--ghost" href={profile.links.linkedin} target="_blank" rel="noreferrer">
          LinkedIn
        </a>
      </div>
    </section>
  );
}
