/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useRef, useState } from "react";
import { pages, profile, type Page } from "@/content/site";
import { isCaseId, longHash } from "@/content/cases/ids";
import { isPlayId, playHash } from "@/content/routes";
import { reducedMotion, useShell } from "../shell-context";
import { Hello } from "../HomePage";
import { ShaderHero } from "../ShaderHero";
import { loadCase } from "../case/load";
import { loadPlay } from "./play-load";
import { NameChip, PhoneBar, SiteAsk, SiteNav } from "./Nav";
import { SiteFoot } from "../SiteFoot";

/**
 * Home: who she is, then the work.
 * The first screen is the introduction (the sentence, with her photo in it, and three facts), as
 * tall as the window minus a strip at the bottom where the tops of the first two cards show:
 * the work is one scroll away, and it says so. Below: four projects as large cards (each opens
 * its case study), four play pieces the same way (two to a row), and the footer every page ends on
 * (components/SiteFoot.tsx; here it is #hi).
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
    <main className="nh" id="main" data-hidden={hidden || undefined} aria-hidden={hidden || undefined} inert={hidden ? true : undefined}>
      <PhoneBar name={false} />
      <section className="nh-hero" ref={hero} aria-label="Introduction">
        <ShaderHero active={seen && !hidden} />
        <div className="nh-top">
          <NameChip mark />
          <SiteNav at="work" />
          <SiteAsk />
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

      <section className="nh-play" id="play" aria-labelledby="play-h">
        {/* a section of its own: a hairline across, the title on the left, what it is in a label where
            the second column of cards starts */}
        <header className="nh-sec">
          <h2 className="nh-sec-title" id="play-h">
            Play
          </h2>
          <p className="label nh-sec-note">Where I try things</p>
        </header>
        <ul className="nh-grid nh-grid--play">
          {fun.map((p) => (
            <li key={p.id}>
              <Card page={p} play />
            </li>
          ))}
        </ul>
      </section>

      <SiteFoot id="hi" />
      <CursorTag off={hidden} />
    </main>
  );
}

/* Now / Before and what she is open to (the dot): the right half of the introduction, lined up with
   the second column of cards under it. No rules between the rows. (Pittsburgh and its time are in
   the footer.) */
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
        <dt>
          <span className="nh-dot" aria-hidden />
          <span className="sr-only">Status</span>
        </dt>
        <dd>{profile.status}</dd>
      </div>
    </dl>
  );
}

/** `meta` without its year, and the year: "Motion • 3D • 2026" → ["Motion · 3D", "2026"]. */
function metaOf(p: Page): [string, string] {
  const parts = p.meta.split(/\s*•\s*/);
  const year = /^\d{4}$/.test(parts[parts.length - 1]) ? (parts.pop() as string) : "";
  return [parts.join(" · "), year];
}

/** Under the name: what kind of thing it is. A project says it in a line of its own (`headline`,
 *  or the tagline without its full stop); a play piece in its `meta` ("Motion · 3D"). */
const kindOf = (p: Page, play: boolean) =>
  play ? metaOf(p)[0] : (p.headline ?? p.tagline.replace(/^([^.]*)\.$/, "$1"));

/** At the end of the name's row: the year (`card` replaces it where there is more to say: “In progress 2026”). */
const whenOf = (p: Page) => p.card ?? p.year ?? metaOf(p)[1];



/**
 * Small lights that drift up over a card's picture and fade (Wish Tree). Where each one starts,
 * how big it is and how long it takes are fixed here, so the page draws the same ones every time.
 * They only move while the card is on screen and Home is the page in front; CSS does the moving
 * (app/home.css, .nh-lights), and holds them still with reduced motion.
 */
const LIGHTS = (() => {
  let s = 7;
  const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
  const colors = ["#ff9bd0", "#8dffb0", "#ffe27a", "#c7a6ff", "#8fd0ff", "#ffb38a"];
  return Array.from({ length: 30 }, () => {
    const t = 12 + rnd() * 16;
    return {
      "--x": `${(18 + rnd() * 78).toFixed(1)}%`,
      "--y": `${(38 + rnd() * 58).toFixed(1)}%`,
      "--d": `${(0.26 + rnd() * 0.32).toFixed(2)}cqw`,
      "--c": colors[Math.floor(rnd() * colors.length)],
      "--o": (0.55 + rnd() * 0.4).toFixed(2),
      "--t": `${t.toFixed(1)}s`,
      "--dl": `${(-rnd() * t).toFixed(1)}s`,
      "--sw": `${(0.5 + rnd() * 0.9).toFixed(2)}cqw`,
      "--ts": `${(2.4 + rnd() * 3.6).toFixed(1)}s`,
    } as React.CSSProperties;
  });
})();

function CardLights() {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    const media = el?.parentElement;
    if (!el || !media) return;
    const root = document.documentElement;
    const home = el.closest(".nh");
    let inView = false;
    const sync = () => {
      const on = inView && !root.dataset.boot && !home?.hasAttribute("data-hidden");
      media.setAttribute("data-lights", on ? "on" : "");
    };
    const io = new IntersectionObserver(
      ([e]) => {
        inView = e.isIntersecting;
        sync();
      },
      { threshold: 0.2 },
    );
    io.observe(media);
    const mo = new MutationObserver(sync);
    mo.observe(root, { attributes: true, attributeFilter: ["data-boot"] });
    if (home) mo.observe(home, { attributes: true, attributeFilter: ["data-hidden"] });
    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, []);
  return (
    <span className="nh-lights" ref={ref} aria-hidden>
      {LIGHTS.map((style, i) => (
        <i key={i} style={style} />
      ))}
    </span>
  );
}

/**
 * A card whose picture moves. A short clip plays once when the card is on screen, and again each
 * time the pointer or focus comes to the card, then rests on its last frame (the still under it is that
 * same frame). A `loop` clip (a longer recording) plays for as long as the card is on screen and
 * pauses when it isn't. Both wait while the intro or another page covers Home, load nothing until
 * they are about to play, and never play with reduced motion: the still under them stands in.
 */
function CardClip({ clip }: { clip: NonNullable<Page["clip"]> }) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const v = ref.current;
    if (!v || reducedMotion()) return;
    // phones get the small file, swapped in the first time it plays: until then nothing is fetched
    // (preload is "none"), not even while Home waits behind a page opened from a link
    let sized = !clip.sm || !window.matchMedia("(max-width: 799px)").matches;
    const size = () => {
      if (sized || !clip.sm) return;
      sized = true;
      const [mp4, webm] = v.querySelectorAll("source");
      mp4.src = clip.sm.mp4;
      webm.src = clip.sm.webm;
      v.load();
    };
    const root = document.documentElement;
    const home = v.closest(".nh");
    const card = v.closest(".nh-card");
    let inView = false;
    let played = false;
    const play = () => {
      size();
      if (!v.paused && !v.ended) return;
      v.currentTime = 0;
      void v.play().catch(() => {});
    };
    const first = () => {
      const free = inView && !root.dataset.boot && !home?.hasAttribute("data-hidden");
      if (clip.loop) {
        if (free) {
          size();
          void v.play().catch(() => {});
        } else v.pause();
        return;
      }
      if (played || !free) return;
      played = true;
      play();
    };
    const io = new IntersectionObserver(
      ([e]) => {
        inView = e.isIntersecting;
        first();
      },
      { threshold: clip.loop ? 0.35 : 0.6 },
    );
    io.observe(v);
    // the intro leaving, or the page over Home closing, is the other moment it can start
    const mo = new MutationObserver(first);
    mo.observe(root, { attributes: true, attributeFilter: ["data-boot"] });
    if (home) mo.observe(home, { attributes: true, attributeFilter: ["data-hidden"] });
    if (!clip.loop) {
      card?.addEventListener("pointerenter", play);
      card?.addEventListener("focus", play);
    }
    return () => {
      io.disconnect();
      mo.disconnect();
      card?.removeEventListener("pointerenter", play);
      card?.removeEventListener("focus", play);
    };
  }, [clip.loop, clip.sm]);
  return (
    <video ref={ref} muted playsInline loop={clip.loop} preload="none" aria-hidden tabIndex={-1} disablePictureInPicture>
      {/* H.264 for Safari and most browsers; VP9 for builds without it */}
      <source src={clip.mp4} type="video/mp4" />
      <source src={clip.webm} type="video/webm" />
    </video>
  );
}

/**
 * One project: its name, with the year at the end of that row, and under it one line that says
 * what kind of thing it is.
 * The whole card is the link: a work card opens its case study, a play card its page. What a
 * click does is written next to the pointer while it is over the card (`CursorTag`, from
 * `data-go`); the keyboard and touch screens, which have no pointer to follow, get it at the end
 * of the small line instead (on focus; always, on touch screens).
 * ZipFlow has no case study yet, and the Interaction Lab isn't ready to show (`status: "soon"` in
 * content/site.ts): their cards don't open anything and say “Coming soon” there.
 * A play card reads the same way (name and year, then what kind of piece it is).
 * Phones show the play pieces as small cards, two to a row, with just the name.
 */
function Card({ page: p, play = false }: { page: Page; play?: boolean }) {
  const { openCase, openPlay } = useShell();
  const kind = kindOf(p, play);
  const when = whenOf(p);
  const soon = p.status === "soon";
  const toCase = isCaseId(p.id) ? p.id : null;
  const toPlay = isPlayId(p.id) ? p.id : null;
  const href = toCase ? `/${longHash(toCase)}` : toPlay ? `/${playHash(toPlay)}` : undefined;
  // the page's code starts downloading as soon as the pointer or focus reaches the card
  const warm = () => void (toCase ? loadCase() : toPlay ? loadPlay() : null)?.catch(() => {});

  const body = (
    <>
      <span className="nh-card-media" data-lights={p.lights ? "" : undefined} style={p.tone ? ({ "--tone": p.tone } as React.CSSProperties) : undefined}>
        {/* the still is always there (it fades in over the card's tone); a clip plays on top of it */}
        {p.thumb && <img src={p.thumb} alt="" loading="lazy" decoding="async" />}
        {p.clip && <CardClip clip={p.clip} />}
        {p.lights && <CardLights />}
      </span>
      <span className="nh-card-head">
        <span className="nh-card-title">{p.title}</span>
        {when && <span className="label nh-card-when">{when}</span>}
      </span>
      <span className="nh-card-line">
        <span className="nh-card-kind">{kind}</span>
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
        {soon && <span className="label nh-card-soon">Coming soon</span>}
      </span>
    </>
  );

  if (!href || soon)
    return (
      <div className={`nh-card${play ? " nh-card--play" : ""}`} data-soon="" data-go="Coming soon">
        {body}
        <span className="sr-only">Coming soon</span>
      </div>
    );
  return (
    <a
      className={`nh-card${play ? " nh-card--play" : ""}`}
      href={href}
      aria-label={play ? `${p.title}. Open` : `${p.title}: ${kind}. Read the case study`}
      data-go={toCase ? "Read case study" : "Open"}
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

/**
 * What a click on the card under the pointer does (“Read case study →”, “Open →”, “Coming soon”),
 * written beside the pointer and moving with it, the way Rachel Chen's cards do.
 * One element for the whole page: it reads `data-go` from the card under the pointer, trails the
 * pointer by a few frames (not at all with reduced motion), and flips to the other side where it
 * would leave the window. Mouse only; it rests while another page is open over Home.
 */
function CursorTag({ off }: { off: boolean }) {
  const el = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const tag = el.current;
    const home = tag?.parentElement;
    const text = tag?.firstElementChild;
    if (!tag || !home || !text) return;
    if (off) {
      tag.removeAttribute("data-on");
      return;
    }
    let on = false;
    let raf = 0;
    let x = 0; // where the tag is
    let y = 0;
    let px = -1; // where the pointer is
    let py = -1;
    let w = 0;
    let h = 0;
    let snap = false; // reduced motion: it doesn't trail
    /* below and to the right of the pointer; on the other side near the window's edge */
    const spot = () =>
      [px + 16 + w > window.innerWidth - 8 ? px - 12 - w : px + 16, py + 20 + h > window.innerHeight - 8 ? py - 12 - h : py + 20] as const;
    const draw = () => {
      tag.style.transform = `translate3d(${Math.round(x * 10) / 10}px, ${Math.round(y * 10) / 10}px, 0)`;
    };
    const frame = () => {
      raf = 0;
      const [tx, ty] = spot();
      const k = snap ? 1 : 0.32;
      x += (tx - x) * k;
      y += (ty - y) * k;
      if (Math.abs(tx - x) < 0.4 && Math.abs(ty - y) < 0.4) [x, y] = [tx, ty];
      draw();
      if (on && (x !== tx || y !== ty)) raf = requestAnimationFrame(frame);
    };
    const hide = () => {
      if (!on) return;
      on = false;
      tag.removeAttribute("data-on");
    };
    const over = (target: EventTarget | null) => {
      const card = target instanceof Element ? target.closest<HTMLElement>(".nh-card[data-go]") : null;
      if (!card) return hide();
      const label = card.dataset.go ?? "";
      if (text.textContent !== label || !w) {
        text.textContent = label;
        tag.toggleAttribute("data-soon", card.hasAttribute("data-soon"));
        w = tag.offsetWidth;
        h = tag.offsetHeight;
      }
      if (!on) {
        // it appears where the pointer is, it doesn't fly in from where it was last
        on = true;
        snap = reducedMotion();
        [x, y] = spot();
        draw();
        tag.setAttribute("data-on", "");
      }
      if (!raf) raf = requestAnimationFrame(frame);
    };
    const move = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return hide();
      px = e.clientX;
      py = e.clientY;
      over(e.target);
    };
    // the page moved under a still pointer: another card (or none) is under it now
    const scrolled = () => {
      if (px >= 0) over(document.elementFromPoint(px, py));
    };
    home.addEventListener("pointermove", move);
    home.addEventListener("pointerleave", hide);
    window.addEventListener("scroll", scrolled, { passive: true });
    window.addEventListener("blur", hide);
    return () => {
      home.removeEventListener("pointermove", move);
      home.removeEventListener("pointerleave", hide);
      window.removeEventListener("scroll", scrolled);
      window.removeEventListener("blur", hide);
      cancelAnimationFrame(raf);
      tag.removeAttribute("data-on");
    };
  }, [off]);
  return (
    <div className="nh-cursor" ref={el} aria-hidden>
      <span />
      <span className="nh-cursor-arrow">→</span>
    </div>
  );
}
