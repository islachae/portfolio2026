/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useRef, useState } from "react";
import { pages, profile, type Page } from "@/content/site";
import { isCaseId, longHash } from "@/content/cases/ids";
import { isPlayId, playHash } from "@/content/routes";
import { reducedMotion, useShell } from "../shell-context";
import { Hello, formatNY, useNow } from "../HomePage";
import { ShaderHero } from "../ShaderHero";
import { loadCase } from "../case/load";
import { loadPlay } from "./play-load";
import { NameChip, PhoneBar, SiteAsk, SiteNav } from "./Nav";

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

      <section className="nh-play" id="play" aria-label="Play">
        {/* no rule, no label: one line in the voice of the introduction turns the page to play */}
        <h2 className="nh-say nh-play-h">
          Play <span className="nh-dim">is where I try things.</span>
        </h2>
        <ul className="nh-grid nh-grid--play">
          {fun.map((p) => (
            <li key={p.id}>
              <Card page={p} play />
            </li>
          ))}
        </ul>
      </section>

      <SayHi />
      <Foot />
      <CursorTag off={hidden} />
    </div>
  );
}

/* Now / Before / Where (Pittsburgh, with its time: the same zone as New York) and what she is open to: the right half of the
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
    <span className="nh-clock" suppressHydrationWarning title="Pittsburgh time">
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
    // phones get the small file: nothing has been fetched yet (preload is "none")
    if (clip.sm && window.matchMedia("(max-width: 760px)").matches) {
      const [mp4, webm] = v.querySelectorAll("source");
      mp4.src = clip.sm.mp4;
      webm.src = clip.sm.webm;
      v.load();
    }
    const root = document.documentElement;
    const home = v.closest(".nh");
    const card = v.closest(".nh-card");
    let inView = false;
    let played = false;
    const play = () => {
      if (!v.paused && !v.ended) return;
      v.currentTime = 0;
      void v.play().catch(() => {});
    };
    const first = () => {
      const free = inView && !root.dataset.boot && !home?.hasAttribute("data-hidden");
      if (clip.loop) {
        if (free) void v.play().catch(() => {});
        else v.pause();
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
 * One project, labelled the way Rachel Chen labels hers: a large line that says what it is and
 * for whom, and under it the project's name, its status and the year.
 * The whole card is the link: a work card opens its case study, a play card its page. What a
 * click does is written next to the pointer while it is over the card (`CursorTag`, from
 * `data-go`); the keyboard and touch screens, which have no pointer to follow, get it at the end
 * of the small line instead (on focus; always, on touch screens).
 * ZipFlow has no case study yet, and the Interaction Lab isn't ready to show (`status: "soon"` in
 * content/site.ts): their cards don't open anything and say “Coming soon” there.
 * A play card's large line is just its name, with what kind of piece it is and the year under it.
 * Phones show the play pieces as small cards, two to a row, with just the name.
 */
function Card({ page: p, play = false }: { page: Page; play?: boolean }) {
  const { openCase, openPlay } = useShell();
  // a play piece goes by its name (“Wish Tree”); a project by what it does, its name under it
  const headline = play ? p.title : headlineOf(p);
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
      <span className="nh-card-title">{headline}</span>
      <span className="nh-card-line">
        <span className="label">{play ? cardLine(p) : `${p.title} • ${cardLine(p)}`}</span>
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
      aria-label={play ? `${p.title}. Open` : `${p.title}: ${headline}. Read the case study`}
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

/**
 * The page closes the way it opens: a sentence on the left, facts on the right.
 * 안녕 is both hello and goodbye (the greeting at the top says it too). The facts are the ways to
 * reach her: the address copies itself on a click, the résumé and LinkedIn open in a new tab.
 */
function SayHi() {
  const { copyEmail } = useShell();
  return (
    <section className="nh-hi" id="hi" aria-label="Say hi">
      <h2 className="nh-say">
        <span lang="ko">안녕</span> <span className="nh-dim">means hi.</span>
        <br />
        <span className="nh-dim">It also means</span> bye<span className="nh-dim">.</span>
      </h2>
      <dl className="nh-facts nh-facts--hi">
        <div>
          <dt>Email</dt>
          <dd>
            <button type="button" className="nh-mail" onClick={copyEmail} aria-label={`Copy email address: ${profile.email}`}>
              {profile.email}
              <span className="label nh-copy" aria-hidden>
                Copy
              </span>
            </button>
          </dd>
        </div>
        <div>
          <dt>Resume</dt>
          <dd>
            <a className="nh-out" href={profile.links.resume} target="_blank" rel="noreferrer">
              PDF
            </a>
          </dd>
        </div>
        <div>
          <dt>LinkedIn</dt>
          <dd>
            <a className="nh-out" href={profile.links.linkedin} target="_blank" rel="noreferrer">
              chaewon-lim
            </a>
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
    </section>
  );
}

/** What the site was built with (Next.js, and the drink that kept her going: it links to HEYTEA),
 * the keys for the surprise, the year and when the site was last updated. */
function Foot() {
  return (
    <footer className="nh-foot">
      <div className="nh-foot-l">
        <p>
          Built with Next.js &amp;{" "}
          <a href="https://www.heytea.com/products" target="_blank" rel="noreferrer">
            heytea’s crisp grape boom
          </a>{" "}
          <span aria-hidden>🍇</span>
        </p>
        {/* the keys start ChaeLLM's run (components/Site.tsx); no keys on a touch screen, so no line */}
        <p className="nh-foot-keys">
          Press the <kbd>P</kbd> and <kbd>Space</kbd> keys for a surprise
        </p>
      </div>
      <div className="nh-foot-r">
        <p suppressHydrationWarning>© {new Date().getFullYear()} Chaewon Lim</p>
        {/* the day the site was last built (next.config.ts) */}
        <p>Last updated on {process.env.LAST_UPDATED}</p>
      </div>
    </footer>
  );
}
