"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { motion } from "motion/react";
import { poll, type PollOption } from "@/content/poll";
import { pollStore, readMyVotes, saveMyVotes, type Counts } from "@/lib/poll-store";
import { reducedMotion } from "./shell-context";
import { Chevron } from "./icons";
import { PollIcon } from "./PollIcon";

/**
 * A small poll you discover, not a survey you complete.
 * One random question per visit, answered with one tap on an icon tile. On every fresh load the
 * tiles peek open for a few seconds, then tuck away under the question; hovering, focusing or
 * answering keeps them open. After voting, each tile shows its share and yours turns violet.
 */

const PLAY_MS = 360;
const PEEK_DELAY = 900; // after the greeting settles
const PEEK_MS = 5000; // how long it stays out on its own
const FOLD_AFTER_VOTE = 1800; // results show for a beat, then the card folds into “team …”
const Q = poll.questions;
let peeked = false; // once per page load
// When this code arrived (not navigation start: in an embedded preview the chunks can take a while)
const T0 = typeof performance !== "undefined" ? performance.now() : 0;

/* Whole-number percentages that always add up to 100 (largest remainder). */
function percents(c: Counts, ids: string[]) {
  const total = ids.reduce((s, k) => s + (c[k] || 0), 0);
  const p: Record<string, number> = Object.fromEntries(ids.map((k) => [k, 0]));
  if (!total) return { total, p };
  const raw = ids.map((k) => ({ k, v: ((c[k] || 0) / total) * 100 }));
  raw.forEach((r) => (p[r.k] = Math.floor(r.v)));
  let left = 100 - ids.reduce((s, k) => s + p[k], 0);
  raw
    .sort((a, b) => (b.v % 1) - (a.v % 1))
    .forEach((r) => {
      if (left > 0 && (c[r.k] || 0) > 0) {
        p[r.k] += 1;
        left -= 1;
      }
    });
  return { total, p };
}

/* Percent that counts up from 0 the first time results appear. */
function Pct({ value }: { value: number }) {
  const [shown, setShown] = useState(() => (reducedMotion() ? value : 0));
  useEffect(() => {
    if (reducedMotion()) {
      setShown(value);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const from = 0;
    const tick = (t: number) => {
      const k = Math.min(1, (t - start) / 600);
      setShown(Math.round(from + (value - from) * (1 - Math.pow(1 - k, 3))));
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);
  return <>{shown}%</>;
}

/* The poll's mark: three small bars on a baseline. */
function Bars() {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden className="poll-bars">
      <rect x="2.5" y="6.5" width="2.6" height="6" rx="0.6" />
      <rect className="poll-bars-mid" x="6.7" y="3" width="2.6" height="9.5" rx="0.6" />
      <rect x="10.9" y="9.5" width="2.6" height="3" rx="0.6" />
      <path d="M1.5 14.5h13" />
    </svg>
  );
}

export function Poll({ variant = "panel" }: { variant?: "panel" | "cover" }) {
  const [open, setOpen] = useState(false);
  const [peek, setPeek] = useState(false); // opened on its own (not by the visitor)
  const [qi, setQi] = useState<number | null>(null); // chosen after mount, so it can be random
  const [votes, setVotes] = useState<Record<string, string>>({});
  const [picked, setPicked] = useState<string | null>(null);
  const [changing, setChanging] = useState(false);
  const [counts, setCounts] = useState<Counts | null>(null);
  const [status, setStatus] = useState<"idle" | "saving" | "error" | "loadError">("idle");
  const [playing, setPlaying] = useState<string | null>(null);
  const [focusIdx, setFocusIdx] = useState(0);
  const wrap = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const refocus = useRef(false);
  const foldTimer = useRef<number | undefined>(undefined);
  const dialog = useRef<HTMLDivElement>(null);
  const optRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const peekTimer = useRef<number | undefined>(undefined);
  const popId = useId();

  // One random question per visit (an unanswered one when possible).
  useEffect(() => {
    const v = readMyVotes();
    setVotes(v);
    const fresh = Q.map((_, i) => i).filter((i) => !v[Q[i].id]);
    const pool = fresh.length ? fresh : Q.map((_, i) => i);
    const i = pool[Math.floor(Math.random() * pool.length)];
    setQi(i);
    setPicked(v[Q[i].id] ?? null);

    // Every fresh load: whichever copy is on screen (right panel, or under the jump box below 1200px)
    // peeks open for a moment, then tucks itself away.
    if (peeked || performance.now() - T0 > 4000) return;
    const t = window.setTimeout(() => {
      if (peeked || !wrap.current?.offsetParent) return; // the hidden copy stays shut
      // Only peek where it can be seen: opened off screen (a phone deep-linked to /#about), it would
      // grow the page above the reader and shove whatever they were about to tap out from under them.
      const r = wrap.current.getBoundingClientRect();
      if (r.bottom < 0 || r.top > window.innerHeight) return;
      peeked = true;
      setPeek(true);
      setOpen(true);
      peekTimer.current = window.setTimeout(() => {
        setOpen(false);
        setPeek(false);
      }, PEEK_MS);
    }, PEEK_DELAY);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(
    () => () => {
      window.clearTimeout(peekTimer.current);
      window.clearTimeout(foldTimer.current);
    },
    []
  );

  // Once the visitor engages (hover, focus, click), the bubble stays until they close it.
  const engage = () => {
    if (!peek) return;
    window.clearTimeout(peekTimer.current);
    setPeek(false);
  };

  const q = qi === null ? null : Q[qi];
  const mine = q ? votes[q.id] ?? null : null;
  const phase: "choose" | "results" = mine && !changing ? "results" : "choose";
  const results = phase === "results" && !!counts;

  const load = useCallback(() => {
    if (!q) return;
    setStatus((s) => (s === "loadError" ? "idle" : s));
    pollStore.load(q).then(setCounts, () => setStatus("loadError"));
  }, [q]);

  useEffect(() => {
    if (open && !counts) load();
  }, [open, counts, load]);

  // Peeking on a short screen: nudge the panel so the bubble shows, then put it back when it tucks away.
  useEffect(() => {
    if (!peek || !open) return;
    let box: HTMLElement | null = null;
    let before = 0;
    const t = window.setTimeout(() => {
      const el = dialog.current;
      box = el?.closest<HTMLElement>(".inspector-scroll") ?? null;
      if (!el || !box) return;
      before = box.scrollTop;
      const over = el.getBoundingClientRect().bottom + 12 - box.getBoundingClientRect().bottom;
      if (over > 0) box.scrollBy({ top: over, behavior: reducedMotion() ? "auto" : "smooth" });
    }, 380);
    return () => {
      window.clearTimeout(t);
      if (box && box.scrollTop !== before) box.scrollTo({ top: before, behavior: reducedMotion() ? "auto" : "smooth" });
    };
  }, [peek, open]);

  // Panel: when the visitor opens it, keep all of the bubble in view.
  useEffect(() => {
    if (!open || peek || variant !== "panel") return;
    const t = window.setTimeout(() => {
      const el = dialog.current;
      const box = el?.closest<HTMLElement>(".inspector-scroll, .sheet");
      if (!el || !box) return;
      const over = el.getBoundingClientRect().bottom + 16 - box.getBoundingClientRect().bottom;
      if (over > 0) box.scrollBy({ top: over, behavior: reducedMotion() ? "auto" : "smooth" });
    }, 260);
    return () => window.clearTimeout(t);
  }, [open, peek, phase, counts, status, variant]);

  // Focus the answers when the visitor opens it (never when it peeks on its own).
  useEffect(() => {
    if (!open || peek || phase !== "choose" || !q) return;
    const i = Math.max(0, q.options.findIndex((o) => o.id === picked));
    setFocusIdx(i);
    const t = window.setTimeout(() => optRefs.current[i]?.focus({ preventScroll: true }), 30);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, peek, phase]);

  // Close on outside click or Escape (Escape never reaches page-level shortcuts).
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (wrap.current && !wrap.current.contains(e.target as Node)) {
        setOpen(false);
        setPeek(false);
      }
    };
    const onEsc = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      e.stopImmediatePropagation();
      refocus.current = true; // the folded card replaces the header; focus it once it's there
      setOpen(false);
      setPeek(false);
    };
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("keydown", onEsc, true);
    return () => {
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("keydown", onEsc, true);
    };
  }, [open]);

  useEffect(() => {
    if (open || !refocus.current) return;
    refocus.current = false;
    trigger.current?.focus({ preventScroll: true });
  }, [open]);

  // Closing after "Change vote" without re-picking shows the results next time.
  useEffect(() => {
    if (!open) {
      window.clearTimeout(foldTimer.current);
      setChanging(false);
      setStatus((s) => (s === "error" ? "idle" : s));
      if (mine) setPicked(mine);
    }
  }, [open, mine]);

  const save = useCallback(
    async (option: string, previous: string | null) => {
      if (!q) return;
      setStatus("saving");
      try {
        const res = await pollStore.vote(q, option, previous);
        setCounts(res);
        setVotes((v) => {
          const next = { ...v, [q.id]: option };
          saveMyVotes(next);
          return next;
        });
        setChanging(false);
        setStatus("idle");
        window.setTimeout(() => dialog.current?.focus({ preventScroll: true }), 0);
        // Let the percentages land, then fold into the small “team …” card.
        window.clearTimeout(foldTimer.current);
        foldTimer.current = window.setTimeout(() => {
          if (wrap.current?.contains(document.activeElement)) refocus.current = true;
          setOpen(false);
          setPeek(false);
        }, FOLD_AFTER_VOTE);
      } catch {
        setStatus("error"); // the selection stays; offer a retry
      }
    },
    [q]
  );

  const choose = (option: string) => {
    engage();
    if (status === "saving" || playing) return;
    setPicked(option);
    if (option === mine) {
      setChanging(false);
      return;
    }
    const previous = mine;
    if (reducedMotion()) {
      save(option, previous);
      return;
    }
    setPlaying(option);
    window.setTimeout(() => {
      setPlaying(null);
      save(option, previous);
    }, PLAY_MS);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (phase !== "choose" || !q) return;
    const n = q.options.length;
    let next = -1;
    if (e.key === "ArrowDown" || e.key === "ArrowRight") next = (focusIdx + 1) % n;
    if (e.key === "ArrowUp" || e.key === "ArrowLeft") next = (focusIdx - 1 + n) % n;
    if (e.key === "Home") next = 0;
    if (e.key === "End") next = n - 1;
    const onOption = (e.target as HTMLElement).classList.contains("poll-opt");
    if (next >= 0 && onOption) {
      e.preventDefault();
      e.stopPropagation(); // arrows move between answers, not between pages
      setFocusIdx(next);
      optRefs.current[next]?.focus();
    } else if (e.key.startsWith("Arrow") || e.key === "PageUp" || e.key === "PageDown") {
      e.stopPropagation();
    }
  };

  const head = (inner: React.ReactNode, props: React.ButtonHTMLAttributes<HTMLButtonElement> = {}) => (
    <h2 className="poll-h">
      <button className="poll-head" {...props}>
        <span className="poll-kicker">
          <span className="label">{poll.kicker}</span>
        </span>
        <span className="poll-qrow">
          {inner}
          <Chevron size={16} className="poll-chev" />
        </span>
      </button>
    </h2>
  );

  const toggle = () => {
    engage();
    setOpen((o) => !o);
  };

  /* Folded: a small card that shows your pick (or a question mark before you vote). */
  const mini = (opt?: PollOption) => (
    <motion.button
      key="mini"
      layout="position"
      ref={trigger}
      className="poll-mini"
      aria-expanded={false}
      aria-label={
        opt
          ? `${poll.kicker}: you picked ${opt.label}. Show results`
          : `${poll.kicker}${q ? `: ${q.question}` : ""}`
      }
      onClick={toggle}
      initial={false}
      animate={{ opacity: 1 }}
    >
      <span className="poll-mini-text">
        <Bars />
        <span className="poll-mini-label">{opt ? `${poll.teamPrefix} ${opt.team}` : poll.kicker}</span>
      </span>
      <span className="poll-mini-icon" data-picked={opt ? "" : undefined}>
        <PollIcon name={opt ? opt.icon : "question"} size={24} />
      </span>
    </motion.button>
  );

  if (!q) {
    // Before mount (the question is picked at random on the client): the folded card, no pick yet.
    return <div className={`poll poll--${variant}`}>{mini()}</div>;
  }

  const ids = q.options.map((o) => o.id);
  const { total, p } = counts ? percents(counts, ids) : { total: 0, p: {} as Record<string, number> };
  const sample = !pollStore.live;
  const mineOpt = mine ? q.options.find((o) => o.id === mine) : undefined;
  const ease = [0.3, 0.7, 0.2, 1] as const;

  return (
    <motion.div
      layout
      transition={{ layout: { duration: 0.38, ease } }}
      style={{ borderRadius: 16 }}
      className={`poll poll--${variant}`}
      data-open={open || undefined}
      data-voted={mine ? "" : undefined}
      ref={wrap}
      onPointerEnter={engage}
      onFocusCapture={engage}
    >
      {!open ? (
        mini(mineOpt)
      ) : (
        <motion.div
          key="full"
          layout="position"
          className="poll-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { duration: 0.22, delay: 0.12 } }}
        >
          {head(<span className="poll-q">{q.question}</span>, {
            ref: trigger,
            "aria-expanded": true,
            "aria-controls": popId,
            onClick: toggle,
          } as React.ButtonHTMLAttributes<HTMLButtonElement>)}
          <div className="poll-body">
            <div
              className="poll-pop"
              id={popId}
              role="group"
              aria-label={q.question}
              onKeyDown={onKeyDown}
              ref={dialog}
              tabIndex={-1}
            >
              <div
                className="poll-tiles"
                role={phase === "choose" ? "radiogroup" : "list"}
                aria-label={phase === "choose" ? q.question : `Results: ${q.question}`}
                data-phase={results ? "results" : "choose"}
                style={{ gridTemplateColumns: `repeat(${q.options.length}, minmax(0, 1fr))` }}
                key={phase}
              >
                {q.options.map((o, i) => {
                  const isPicked = picked === o.id;
                  const hers = results && q.herPick === o.id;
                  const inner = (
                    <>
                      {hers && <span className="poll-her">Chaewon’s pick</span>}
                      <PollIcon name={o.icon} className="poll-tile-icon" />
                      {/* Label and percent share one cell, so the tile never changes height */}
                      <span className="poll-tile-text">
                        <span className="poll-tile-label">{o.label}</span>
                        {results && (
                          <span className="poll-tile-pct" aria-hidden>
                            <Pct value={p[o.id]} />
                          </span>
                        )}
                      </span>
                    </>
                  );
                  return phase === "choose" ? (
                    <button
                      key={o.id}
                      ref={(el) => {
                        optRefs.current[i] = el;
                      }}
                      className="poll-tile poll-opt"
                      role="radio"
                      aria-checked={isPicked}
                      data-on={isPicked || undefined}
                      data-play={playing === o.id || undefined}
                      tabIndex={i === focusIdx ? 0 : -1}
                      onFocus={() => setFocusIdx(i)}
                      onClick={() => choose(o.id)}
                      disabled={status === "saving"}
                    >
                      {inner}
                    </button>
                  ) : (
                    <div
                      key={o.id}
                      className="poll-tile poll-tile--result"
                      role="listitem"
                      data-on={(results && isPicked) || undefined}
                      title={o.label}
                      aria-label={`${o.label}${results ? `, ${p[o.id]}%` : ""}${isPicked ? ", your pick" : ""}${hers ? ", Chaewon’s pick" : ""}`}
                    >
                      {inner}
                    </div>
                  );
                })}
              </div>

              <div className="poll-foot" aria-live="polite">
                {status === "error" && (
                  <p className="poll-note poll-note--error">
                    Couldn’t save your vote.{" "}
                    <button className="poll-link" onClick={() => picked && save(picked, mine)}>
                      Retry
                    </button>
                  </p>
                )}
                {status === "loadError" && (
                  <p className="poll-note poll-note--error">
                    Results didn’t load.{" "}
                    <button className="poll-link" onClick={load}>
                      Retry
                    </button>
                  </p>
                )}
                {phase === "choose" && status !== "error" && counts && total === 0 && pollStore.live && (
                  <p className="poll-note">Be the first to vote.</p>
                )}
                {phase === "choose" && mine && status !== "error" && <p className="poll-note">Pick again to change your answer.</p>}
                {results && (
                  <>
                    {q.herPick && q.herPick === mine && <p className="poll-me">Me too — Chaewon</p>}
                    <p className="poll-meta">
                      <span title={sample ? "No backend connected yet: these are sample numbers, not live votes" : undefined}>
                        {sample ? `Sample results · ${total} votes` : `${total} ${total === 1 ? "vote" : "votes"}`}
                      </span>
                      <button
                        className="poll-link"
                        onClick={() => {
                          window.clearTimeout(foldTimer.current);
                          setChanging(true);
                        }}
                      >
                        Change vote
                      </button>
                    </p>
                  </>
                )}
                {phase === "results" && !counts && status !== "loadError" && <p className="poll-note">Loading results…</p>}
              </div>

              {/* While it's peeking on its own: a hairline that runs out as it's about to tuck away */}
              {peek && <span className="poll-timer" style={{ animationDuration: `${PEEK_MS}ms` }} aria-hidden />}
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
