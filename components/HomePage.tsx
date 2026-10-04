/* eslint-disable @next/next/no-img-element */
"use client";

import { Fragment, useEffect, useLayoutEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { profile } from "@/content/site";
import { reducedMotion, useShell } from "./shell-context";
import { SearchIcon } from "./icons";
import { Poll } from "./Poll";
import { POLL_ON } from "@/content/poll";
import { DEFAULT_HELLO, pickHello, type Hello as HelloWord } from "@/lib/hello";

const ease = [0.3, 0.7, 0.2, 1] as const;

export function useNow() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    // The first tick waits for an idle moment: the first time a browser formats a time in a named
    // time zone it loads its time-zone data (60–90ms on a mid phone), and done here directly that
    // landed inside the task that wakes the whole page up.
    let t = 0;
    const start = () => {
      setNow(new Date());
      t = window.setInterval(() => setNow(new Date()), 1000);
    };
    const ric = typeof window.requestIdleCallback === "function";
    const first = ric ? window.requestIdleCallback(start, { timeout: 1500 }) : window.setTimeout(start, 300);
    return () => {
      if (ric) window.cancelIdleCallback(first);
      else window.clearTimeout(first);
      window.clearInterval(t);
    };
  }, []);
  return now;
}

// New York time for the bar. Made once: a new formatter every second is wasted work.
let nyTime: Intl.DateTimeFormat | null = null;
export const formatNY = (d: Date) =>
  (nyTime ??= new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZone: "America/New_York",
  })).format(d);

/** The cover: who I am in one sentence, then a nudge to scroll into the work. */
export function HomeHero() {
  const { current, goTo } = useShell();
  // The scroll cue keeps drawing until the visitor scrolls, uses the keyboard, or leaves Home
  const [moved, setMoved] = useState(false);
  useEffect(() => {
    if (moved) return;
    if (current !== "home") {
      setMoved(true);
      return;
    }
    const stop = () => setMoved(true);
    const opts = { passive: true, once: true } as const;
    window.addEventListener("wheel", stop, opts);
    window.addEventListener("touchmove", stop, opts);
    window.addEventListener("keydown", stop, opts);
    return () => {
      window.removeEventListener("wheel", stop);
      window.removeEventListener("touchmove", stop);
      window.removeEventListener("keydown", stop);
    };
  }, [current, moved]);
  return (
    <div className="cover">
      <div className="cover-top">
        <Hello />
        <JumpBox />
        {/* The poll is parked (content/poll.ts → POLL_ON); it comes back here when switched on */}
        {POLL_ON && (
          <div className="cover-poll">
            <Poll variant="cover" />
          </div>
        )}
      </div>
      {/* One way on: scroll (the ticker rail and ⌘K are there for jumping). The line keeps drawing
          down every 3s until the visitor scrolls, then rests. */}
      <button className="cover-next" onClick={() => goTo("tipping")} aria-label="Scroll to the work" data-rest={moved || undefined}>
        <span className="cover-next-k">Scroll</span>
        {/* One drawing, so the shaft and the head can't drift apart by a half pixel */}
        <svg className="cover-next-a" width="20" height="52" viewBox="0 0 20 52" fill="none" aria-hidden>
          <line className="cue-shaft" x1="10" y1="0" x2="10" y2="42" />
          <path className="cue-head" d="M4 36l6 6 6-6" />
        </svg>
      </button>
    </div>
  );
}

/* Yan-style jump box: opens the ⌘K palette. */
function JumpBox() {
  const { setPaletteOpen } = useShell();
  const [mac, setMac] = useState(true);
  useEffect(() => setMac(/Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent)), []);
  return (
    <button className="jump" onClick={() => setPaletteOpen(true)}>
      <SearchIcon size={16} className="jump-icon" />
      <span className="jump-text">Jump to a project…</span>
      <kbd className="kbd" suppressHydrationWarning>
        {mac ? "⌘K" : "Ctrl K"}
      </kbd>
    </button>
  );
}

/* “Hi!” rolls to a hello in the visitor’s language (안녕! by default) on hover and once on load.
   `me`: her photo sits in the greeting, after her name, the way the emoji sit in the sentence.
   `now`: the line under the sentence (school, New York time); Home shows those in its own list. */
export function Hello({ me = false, now = true }: { me?: boolean; now?: boolean } = {}) {
  const { bio } = profile;
  const [korean, setKorean] = useState(false);
  const [widths, setWidths] = useState<[number, number] | null>(null);
  const [word, setWord] = useState<HelloWord>(DEFAULT_HELLO);
  const en = useRef<HTMLSpanElement>(null);
  const ko = useRef<HTMLSpanElement>(null);
  const hovering = useRef(false);

  // Read the visitor's languages after hydration (the server always renders 안녕!).
  useEffect(() => {
    setWord(pickHello(navigator.languages?.length ? navigator.languages : [navigator.language]));
  }, []);

  useLayoutEffect(() => {
    const measure = () => {
      if (en.current && ko.current)
        setWidths([en.current.offsetWidth, ko.current.offsetWidth]);
    };
    measure();
    document.fonts?.ready.then(measure).catch(() => {});
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [word]);

  useEffect(() => {
    if (reducedMotion()) return;
    const a = window.setTimeout(() => setKorean(true), 1500);
    const b = window.setTimeout(
      () => !hovering.current && setKorean(false),
      3300,
    );
    return () => {
      window.clearTimeout(a);
      window.clearTimeout(b);
    };
  }, []);

  return (
    // One block, as wide as the longest line of the sentence, so the row under it can end where it ends
    <div className="hello-block">
    <h1 className="hello">
      <span
        className="hello-line"
        onPointerEnter={() => {
          hovering.current = true;
          setKorean(true);
        }}
        onPointerLeave={() => {
          hovering.current = false;
          setKorean(false);
        }}
      >
        <span
          className="flip"
          data-ready={widths ? "" : undefined}
          data-ko={korean || undefined}
          style={{ width: widths ? widths[korean ? 1 : 0] : undefined }}
          aria-hidden
        >
          <span ref={en} className="flip-word flip-en">
            Hi!
          </span>
          <span
            ref={ko}
            className="flip-word flip-ko"
            lang={word.lang}
            dir="auto"
            title={word.lang === "ko" ? undefined : `Hi in ${word.name}`}
            suppressHydrationWarning
          >
            {word.text}
          </span>
        </span>
        <span className="sr-only">Hi!</span> I&rsquo;m{" "}
        <em>{profile.firstName}</em>
        {me && <img className="hello-me" src={profile.photo} alt="" width={38} height={38} draggable={false} />},
      </span>
    </h1>
    <p className="hello-sub">
      <Bio />
    </p>
    {/* Where she is now, and New York time with the availability dot (hover it) */}
    {now && (
    <div className="hello-now">
      <p className="label hello-school">
        Currently @ <span>{profile.meta[0]}</span>
      </p>
      <Meta />
    </div>
    )}
    </div>
  );
}

function Bio() {
  const { bio } = profile;
  const [open, setOpen] = useState<number | null>(null);
  const closeTimer = useRef<number | undefined>(undefined);

  const show = (i: number) => {
    window.clearTimeout(closeTimer.current);
    setOpen(i);
  };
  const hide = () => {
    window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => setOpen(null), 90);
  };

  return (
    <span className="bio">
      {bio.before.charAt(0).toLowerCase() + bio.before.slice(1)}{" "}
      {bio.parts.map((part, i) => (
        <span key={part.id}>
          {i === bio.parts.length - 1 ? "and " : ""}
          <span
            role="button"
            tabIndex={0}
            className="phrase"
            data-id={part.id}
            aria-expanded={open === i}
            aria-describedby={open === i ? `peek-${part.id}` : undefined}
            onPointerEnter={(e) => e.pointerType === "mouse" && show(i)}
            onPointerLeave={(e) => e.pointerType === "mouse" && hide()}
            onFocus={() => show(i)}
            onBlur={hide}
            onClick={() => (open === i ? setOpen(null) : show(i))}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setOpen(open === i ? null : i);
              }
            }}
          >
            {/* "\n" in the text is a line break on wide screens; phones just wrap */}
            {part.text
              .split("\n")
              .slice(0, -1)
              .map((line) => (
                <Fragment key={line}>
                  <span className="phrase-text">{line} </span>
                  <br className="bio-br" />
                </Fragment>
              ))}
            <span className="phrase-text">
              {lastLine(part.text).split(" ").slice(0, -1).join(" ")}{" "}
            </span>
            {/* The last word, emoji and punctuation stay on one line */}
            <span className="emoji-tail">
              <span className="phrase-text">{lastLine(part.text).split(" ").pop()}</span>
              <span className="emoji-wrap">
                <img
                  className="emoji"
                  src={part.emoji}
                  alt=""
                  draggable={false}
                />
                {/* The brain strains, then pops: a ring and a spray of sparks */}
                {part.id === "artist" && (
                  <span className="emoji-burst" aria-hidden>
                    <b className="emoji-ring" />
                    {Array.from({ length: 10 }, (_, k) => (
                      <i key={k} style={{ ["--a" as string]: `${k * 36 + 8}deg` }} />
                    ))}
                  </span>
                )}
                <AnimatePresence>
                  {open === i && (
                    <motion.span
                      id={`peek-${part.id}`}
                      role="tooltip"
                      className="peek"
                      data-align={
                        i === 0
                          ? "start"
                          : i === bio.parts.length - 1
                            ? "end"
                            : "center"
                      }
                      initial={{ opacity: 0, y: 4, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 2, transition: { duration: 0.1 } }}
                      transition={{ duration: 0.18, ease }}
                    >
                      <span className="peek-title">{part.peekTitle}</span>
                      <span className="peek-text">{part.peek}</span>
                    </motion.span>
                  )}
                </AnimatePresence>
              </span>
              {i < bio.parts.length - 1 ? "," : "."}
            </span>
          </span>
          {i < bio.parts.length - 1 ? " " : ""}
          {part.breakAfter && <br className="bio-br" />}
        </span>
      ))}{" "}
      <br className="bio-br" />
      <BioAfter />
    </span>
  );
}

const lastLine = (text: string) => text.slice(text.lastIndexOf("\n") + 1);

/** “Especially drawn to fintech and wellness.”: those words open a note too, like the phrases above. */
function BioAfter() {
  const { after, afterEm, afterPeekTitle, afterPeek } = profile.bio;
  const [open, setOpen] = useState(false);
  const closeTimer = useRef<number | undefined>(undefined);
  const show = () => {
    window.clearTimeout(closeTimer.current);
    setOpen(true);
  };
  const hide = () => {
    window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => setOpen(false), 90);
  };
  const i = after.indexOf(afterEm);
  if (i < 0) return <span className="bio-after">{after}</span>;
  return (
    <span className="bio-after">
      {after.slice(0, i)}
      <span
        role="button"
        tabIndex={0}
        className="phrase phrase--after"
        aria-expanded={open}
        aria-describedby={open ? "peek-after" : undefined}
        onPointerEnter={(e) => e.pointerType === "mouse" && show()}
        onPointerLeave={(e) => e.pointerType === "mouse" && hide()}
        onFocus={show}
        onBlur={hide}
        onClick={() => (open ? setOpen(false) : show())}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setOpen(!open);
          }
        }}
      >
        <em className="bio-em phrase-text">{afterEm}</em>
        <AnimatePresence>
          {open && (
            <motion.span
              id="peek-after"
              role="tooltip"
              className="peek"
              initial={{ opacity: 0, y: 4, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 2, transition: { duration: 0.1 } }}
              transition={{ duration: 0.18, ease }}
            >
              <span className="peek-title">{afterPeekTitle}</span>
              <span className="peek-text">{afterPeek}</span>
            </motion.span>
          )}
        </AnimatePresence>
      </span>
      {after.slice(i + afterEm.length)}
    </span>
  );
}

function Meta() {
  const now = useNow();
  const time = now ? formatNY(now) : "00:00:00";
  // The school now sits under the hello ("Currently @ …"); the bar keeps New York time
  const places = profile.meta.slice(1);
  return (
    <p className="meta">
      {/* city, time and availability dot stay together */}
      <span className="meta-end">
        {places.map((m) => (
          <span key={m} className="meta-item">
            {m}
          </span>
        ))}
        <span className="meta-item meta-time" suppressHydrationWarning title="New York time">
          {time}
        </span>
        <span className="avail" tabIndex={0} aria-label={profile.status}>
          <span className="avail-dot" aria-hidden />
          <span className="avail-tip" role="tooltip">
            {profile.status}
          </span>
        </span>
      </span>
    </p>
  );
}

