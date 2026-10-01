/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useImperativeHandle, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { pebboCase as C } from "@/content/cases/pebbo";
import { askPebbo, endpointReady, FACE_COLOR, faceSrc, getLive, type Face, type PebboAnswer, type Turn } from "@/content/cases/pebbo-brain";
import { reducedMotion } from "./shell-context";
import { useInView } from "./case/kit";

const HOLD_MS = 450;

/** The home prompt for an hour of the day (visitor's local time); the small hours have two to rotate. */
function promptForHour(h: number, round: number) {
  const slot = C.tryIt.home.prompts.find((p) => (p.from < p.to ? h >= p.from && h < p.to : h >= p.from || h < p.to)) ?? C.tryIt.home.prompts[0];
  return slot.texts[round % slot.texts.length] ?? slot.texts[0];
}

/* ───────────── Try Pebbo: the app's chat, working (content/cases/pebbo-brain.ts answers) ─────────────
   Built from Chaewon's screens: home (date pill, greeting, typed prompt, floating face, four buttons),
   chat (dark Pebbo bubbles, white user bubbles, “thinking...”, the + button), the long-press menu over
   a blurred screen, and the “Check Ai reason” card with its Pattern / Frequency / Impact table. */

type Msg = { id: number; from: "you"; text: string } | { id: number; from: "pebbo"; text: string; a: PebboAnswer };
type PebboMsg = Extract<Msg, { from: "pebbo" }>;
type Lift = { id: number; part: "bubble" | "card"; top: number; left: number; width: number; height: number };
const KINDS = ["log", "explore", "quest", "peek"] as const;
const TYPE_MS = 55;

export type PebboPhoneApi = { send: (text: string) => void; reset: () => void };
export type PebboPhoneState = { chatting: boolean; busy: boolean; live: "you" | "site" | false };

/**
 * The working Pebbo app in a phone. Used at the end of the case study and as the Pebbo work-page
 * stage. `active` (the deck) says when it's on screen; without it, the phone watches its own scroll.
 * `api` lets outside buttons send a message or start over; `onState` reports back.
 */
/** The phone is drawn at the app mockup's size and scaled down as a whole when there isn't room. */
const PHONE_W = 336;
const PHONE_H = 724;

export function PebboPhone({
  active,
  api,
  onState,
  fit = "page",
}: {
  active?: boolean;
  /** "stage": fit the work-page stage's box; "page": fit the column and the window */
  fit?: "stage" | "page";
  api?: React.RefObject<PebboPhoneApi | null>;
  onState?: (s: PebboPhoneState) => void;
}) {
  const t = C.tryIt;
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [face, setFace] = useState<Face>("happy");
  const [lift, setLift] = useState<Lift | null>(null);
  const [whyFor, setWhyFor] = useState<number | null>(null);
  const [saved, setSaved] = useState<number[]>([]);
  const [held, setHeld] = useState(false);
  const [plus, setPlus] = useState(false);
  const [toast, setToast] = useState("");
  const [live, setLive] = useState<"you" | "site" | false>(false);
  const [date, setDate] = useState("");
  const [typed, setTyped] = useState(0);
  const [round, setRound] = useState(0);
  const [still, setStill] = useState(false);
  const [phone, seenHere] = useInView<HTMLDivElement>(0.45);
  const seen = active ?? seenHere;
  const [prompt, setPrompt] = useState<string>(t.home.prompts[0].texts[0]);
  const screen = useRef<HTMLDivElement>(null);
  const box = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const scaleRef = useRef(1);
  scaleRef.current = scale;
  const list = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const ctl = useRef<AbortController | null>(null);
  const nextId = useRef(1);
  const toastTimer = useRef<number | undefined>(undefined);
  const chatting = msgs.length > 0;

  useEffect(() => {
    let on = true;
    setStill(reducedMotion());
    // who answers: Claude on the viewer's own account (claude.ai preview), the site's endpoint, or the script
    getLive().then(async (s) => {
      if (s) return on && setLive("you");
      const ready = await endpointReady();
      if (on) setLive(ready ? "site" : false);
    });
    const d = new Date();
    setDate(`${d.toLocaleDateString("en-US", { month: "short" })} ${d.getDate()}. ${d.getFullYear()}`);
    return () => {
      on = false;
      ctl.current?.abort();
      window.clearTimeout(toastTimer.current);
    };
  }, []);
  // Scale the whole phone (it keeps the mockup's exact layout) to the room it has
  useEffect(() => {
    const parent = box.current?.parentElement;
    if (!parent) return;
    const measure = () => {
      const pw = parent.clientWidth;
      const pinned = fit === "stage" && window.matchMedia("(min-width: 800px)").matches;
      const ph = pinned ? parent.clientHeight : window.innerHeight * (fit === "stage" ? 0.84 : 0.92);
      setScale(Math.max(0.5, Math.min(1, pw / PHONE_W, ph / PHONE_H)));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(parent);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [fit]);
  // The home prompt follows the visitor's local time of day (picked again on each “Start over”)
  useEffect(() => {
    setPrompt(promptForHour(new Date().getHours(), round));
  }, [round]);
  // The prompt types itself in once the phone is in view (and again after “Start over”)
  useEffect(() => {
    if (!seen || chatting) return;
    const full = prompt.length;
    if (reducedMotion()) {
      setTyped(full);
      return;
    }
    setTyped(0);
    let n = 0;
    let timer = 0;
    const tick = () => {
      n += 1;
      setTyped(n);
      if (n < full) timer = window.setTimeout(tick, TYPE_MS + (prompt[n - 1] === " " ? 40 : 0));
    };
    timer = window.setTimeout(tick, 500);
    return () => window.clearTimeout(timer);
  }, [seen, chatting, round, prompt]);
  // Newest message in view, inside the phone only
  useEffect(() => {
    const el = list.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: reducedMotion() ? "auto" : "smooth" });
  }, [msgs, busy, whyFor]);

  const flash = (msg: string) => {
    setToast(msg);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(""), 1500);
  };

  const send = (raw: string) => {
    const text = raw.trim().slice(0, 400);
    if (!text || busy) return;
    const history: Turn[] = msgs.map((m) => ({ role: m.from === "you" ? "user" : "assistant", content: m.text }));
    setMsgs((m) => [...m, { id: nextId.current++, from: "you", text }]);
    setDraft("");
    setBusy(true);
    setLift(null);
    setWhyFor(null);
    setPlus(false);
    const c = new AbortController();
    ctl.current = c;
    const started = Date.now();
    askPebbo(text, history, c.signal)
      .then(async (a) => {
        // scripted answers are instant: hold them a beat so it reads as listening
        if (a.source === "script" && !reducedMotion()) await new Promise((r) => setTimeout(r, Math.max(0, 950 - (Date.now() - started))));
        if (c.signal.aborted) return;
        setFace(a.face);
        setMsgs((m) => [...m, { id: nextId.current++, from: "pebbo", text: a.reply, a }]);
      })
      .catch(() => {})
      .finally(() => {
        if (ctl.current === c) {
          ctl.current = null;
          setBusy(false);
        }
      });
  };
  const stop = () => {
    ctl.current?.abort();
    ctl.current = null;
    setBusy(false);
  };
  const reset = () => {
    stop();
    setMsgs([]);
    setFace("happy");
    setLift(null);
    setWhyFor(null);
    setSaved([]);
    setPlus(false);
    setRound((r) => r + 1);
  };

  // Long-press (or Enter) on one of Pebbo's messages: lift it over a blurred screen with the menu
  const open = (id: number, part: Lift["part"], el: HTMLElement) => {
    const b = screen.current?.getBoundingClientRect();
    if (!b) return;
    const r = el.getBoundingClientRect();
    const k = scaleRef.current;
    setHeld(true);
    setLift({ id, part, top: (r.top - b.top) / k, left: (r.left - b.left) / k, width: r.width / k, height: r.height / k });
  };
  const choose = (i: number, m: PebboMsg) => {
    setLift(null);
    if (i === 0) setWhyFor(m.id);
    if (i === 1) {
      setSaved((s) => (s.includes(m.id) ? s : [...s, m.id]));
      flash("Saved");
    }
    if (i === 2) {
      const card = m.a.suggestion;
      navigator.clipboard?.writeText(card ? `${card.title}${card.text ? ` · ${card.text}` : ""}` : m.text).catch(() => {});
      flash("Copied");
    }
    if (i === 3) {
      setDraft(`“${m.text.length > 48 ? `${m.text.slice(0, 46)}…` : m.text}” `);
      input.current?.focus({ preventScroll: true });
    }
    if (i === 4) flash(t.shareOff);
  };

  // What the page around the phone can do and see
  const sendRef = useRef(send);
  const resetRef = useRef(reset);
  sendRef.current = send;
  resetRef.current = reset;
  useImperativeHandle(api, () => ({ send: (x: string) => sendRef.current(x), reset: () => resetRef.current() }), []);
  useEffect(() => {
    onState?.({ chatting, busy, live });
  }, [chatting, busy, live, onState]);

  const lifted = lift ? (msgs.find((m) => m.id === lift.id) as PebboMsg | undefined) : undefined;
  const screenH = screen.current?.clientHeight ?? PHONE_H - 10;
  const menuH = 5 * 40 + 10;
  const menuTop = lift ? (lift.top - menuH - 10 >= 56 ? lift.top - menuH - 10 : Math.min(lift.top + lift.height + 10, screenH - menuH - 16)) : 0;
  const firstPebbo = msgs.find((m) => m.from === "pebbo")?.id;

  return (
    <div className="pba-fit" ref={box} style={{ width: PHONE_W * scale, height: PHONE_H * scale }}>
        <div className="pba-phone" ref={phone} style={scale < 1 ? { transform: `scale(${scale})` } : undefined}>
          <div className="pba-screen" ref={screen} data-chat={chatting || undefined}>
            <div className="pba-status" aria-hidden>
              <span>9:41</span>
              <PbaIcon name="status" />
            </div>
            <div className="pba-top">
              <span className="pba-avatar" aria-hidden />
              {chatting && (
                // A new mood doesn't snap: the halo's colour eases over, and the new face
                // fades in (unblurring) while the old one slowly fades out behind it
                <span className="pba-mini" style={{ ["--mood" as string]: FACE_COLOR[face] }} aria-hidden>
                  <AnimatePresence initial={false}>
                    <motion.img
                      key={face}
                      src={faceSrc(face)}
                      alt=""
                      className="pba-face"
                      initial={{ opacity: 0, scale: 0.9, filter: "blur(5px)" }}
                      animate={{ opacity: 1, scale: 1, filter: "blur(0px)", transition: { duration: still ? 0 : 1.4, ease: [0.22, 0.61, 0.36, 1] } }}
                      exit={{ opacity: 0, scale: 1.04, filter: "blur(5px)", transition: { duration: still ? 0 : 1.8, ease: [0.55, 0, 0.75, 0.45] } }}
                    />
                  </AnimatePresence>
                </span>
              )}
              <span className="pba-ic" aria-hidden>
                <PbaIcon name="calendar" />
                <PbaIcon name="bookmark" />
              </span>
            </div>

            {!chatting ? (
              <div className="pba-home">
                <span className="pba-date" suppressHydrationWarning>
                  {date || "Today"}
                  <PbaIcon name="chevron" />
                </span>
                <p className="pba-greet">{t.home.greet}</p>
                {/* the full line sits invisibly underneath so the face doesn't jump as it types */}
                <p className="pba-prompt" aria-label={prompt}>
                  <span className="pba-prompt-ghost" aria-hidden>
                    {prompt}
                    <i />
                  </span>
                  <span className="pba-prompt-typed" aria-hidden>
                    {prompt.slice(0, typed)}
                    <i />
                  </span>
                </p>
                <span className="pba-big" aria-hidden>
                  <img src={faceSrc("happy")} alt="" />
                </span>
              </div>
            ) : (
              <div className="pba-log" ref={list} role="log" aria-live="polite" aria-label="Chat with Pebbo">
                {msgs.map((m) =>
                  m.from === "you" ? (
                    <p key={m.id} className="pba-b pba-b--you">
                      {m.text}
                    </p>
                  ) : (
                    <div key={m.id} className="pba-turn">
                      <PbaHold className="pba-b pba-b--pebbo" label={`Pebbo: ${m.text}. Hold for options`} onOpen={(el) => open(m.id, "bubble", el)}>
                        {m.text}
                      </PbaHold>
                      {m.a.safety && (
                        <ul className="pba-help">
                          {t.help.map((h) => (
                            <li key={h.href}>
                              <a href={h.href} target="_blank" rel="noopener noreferrer">
                                {h.label} ↗
                              </a>
                            </li>
                          ))}
                        </ul>
                      )}
                      {m.a.suggestion ? (
                        <div className="pba-group" data-why={whyFor === m.id || undefined}>
                          <PbaHold
                            className="pba-card"
                            style={chipTone(m.a.suggestion.kind)}
                            label={`${m.a.suggestion.kind}: ${m.a.suggestion.title}. Hold for options`}
                            onOpen={(el) => open(m.id, "card", el)}
                          >
                            <PbaCardBody s={m.a.suggestion} saved={saved.includes(m.id)} />
                          </PbaHold>
                          {whyFor === m.id && <PbaWhy a={m.a} onClose={() => setWhyFor(null)} />}
                        </div>
                      ) : (
                        whyFor === m.id && (
                          <div className="pba-group" data-why>
                            <PbaWhy a={m.a} onClose={() => setWhyFor(null)} />
                          </div>
                        )
                      )}
                      {whyFor === m.id && m.a.pattern && (
                        <PbaTable a={m.a} count={msgs.filter((x) => x.from === "pebbo" && x.id <= m.id && x.a.pattern === m.a.pattern).length} />
                      )}
                      {m.id === firstPebbo && !held && <p className="pba-hold">{t.hold}</p>}
                    </div>
                  ),
                )}
                {busy && (
                  <p className="pba-thinking">
                    {/* Chaewon's thinking dot (Ellipse 303), breathing */}
                    <img src="/work/pebbo-case/thinking-dot.svg" alt="" width={24} height={24} />
                    {t.thinking}
                  </p>
                )}
              </div>
            )}

            {chatting && (
              <button type="button" className="pba-fab" data-open={plus || undefined} onClick={() => setPlus((v) => !v)} aria-label="Suggestions" aria-expanded={plus}>
                <PbaIcon name="plusBig" />
              </button>
            )}
            {(!chatting || plus) && (
              <div className="pba-actions" data-float={chatting || undefined} role="group" aria-label="Ask for a suggestion">
                {KINDS.map((k) => (
                  <button
                    key={k}
                    type="button"
                    className={`pba-act pba-act--${k}`}
                    onClick={() => send(t.actions[k].say)}
                    disabled={busy}
                    aria-label={`${t.actions[k].label}: ${t.actions[k].say}`}
                    title={t.actions[k].label}
                  >
                    <PbaIcon name={k} />
                  </button>
                ))}
              </div>
            )}
            <div className="pba-panel">
              <form
                className="pba-bar"
                onSubmit={(e) => {
                  e.preventDefault();
                  send(draft);
                }}
              >
                <span className="pba-field">
                  <PbaIcon name="plus" />
                  <input
                    ref={input}
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    placeholder={t.placeholder}
                    maxLength={400}
                    aria-label="Tell Pebbo how eating felt today"
                    autoComplete="off"
                  />
                  <PbaIcon name="mic" />
                </span>
                {busy ? (
                  <button type="button" className="pba-go pba-go--stop" onClick={stop} aria-label="Stop">
                    <i />
                  </button>
                ) : (
                  <button type="submit" className="pba-go" data-ready={draft.trim() ? true : undefined} disabled={!draft.trim()} aria-label="Send">
                    <PbaIcon name={draft.trim() ? "send" : "waves"} />
                  </button>
                )}
              </form>
              <p className="pba-foot">{t.footer}</p>
            </div>
            <i className="pba-home-bar" aria-hidden />

            {lift && lifted && (
              <div
                className="pba-veil"
                onPointerDown={(e) => {
                  if (e.target === e.currentTarget) setLift(null);
                }}
              >
                <div className="pba-lift" style={{ top: lift.top, left: lift.left, width: lift.width }}>
                  {lift.part === "bubble" ? (
                    <p className="pba-b pba-b--pebbo">{lifted.text}</p>
                  ) : (
                    <div className="pba-card" style={chipTone(lifted.a.suggestion!.kind)}>
                      <PbaCardBody s={lifted.a.suggestion!} saved={saved.includes(lifted.id)} />
                    </div>
                  )}
                </div>
                <div
                  className="pba-menu"
                  role="menu"
                  aria-label="Message actions"
                  style={{ top: menuTop, left: Math.max(14, Math.min(lift.left, 120)) }}
                  onKeyDown={(e) => {
                    e.stopPropagation();
                    if (e.key === "Escape") setLift(null);
                    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
                      e.preventDefault();
                      const items = Array.from(e.currentTarget.querySelectorAll<HTMLButtonElement>("button"));
                      const i = items.indexOf(document.activeElement as HTMLButtonElement);
                      items[(i + (e.key === "ArrowDown" ? 1 : -1) + items.length) % items.length]?.focus();
                    }
                  }}
                >
                  {t.menu.map((label, i) => (
                    <button key={label} role="menuitem" className="pba-menu-i" autoFocus={i === 0} onClick={() => choose(i, lifted)}>
                      <PbaIcon name={(["spark", "bookmark", "copy", "reply", "share"] as const)[i]} />
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <AnimatePresence>
              {toast && (
                <motion.span className="pba-toast" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  {toast}
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </div>
    </div>
  );
}

function chipTone(kind: string): React.CSSProperties {
  const c = C.daily.chips.find((x) => x.id === kind);
  return c ? ({ ["--tone" as string]: c.tone, ["--tone-ink" as string]: c.ink } as React.CSSProperties) : {};
}

/** Something you press and hold (or focus and press Enter) to get the app's menu. */
function PbaHold({
  className,
  style,
  label,
  onOpen,
  children,
}: {
  className: string;
  style?: React.CSSProperties;
  label: string;
  onOpen: (el: HTMLElement) => void;
  children: React.ReactNode;
}) {
  const el = useRef<HTMLDivElement>(null);
  const timer = useRef<number | undefined>(undefined);
  const [holding, setHolding] = useState(false);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  const down = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    setHolding(true);
    timer.current = window.setTimeout(() => {
      setHolding(false);
      if (el.current) onOpen(el.current);
    }, HOLD_MS);
  };
  const up = () => {
    window.clearTimeout(timer.current);
    setHolding(false);
  };
  return (
    <div
      ref={el}
      className={className}
      style={style}
      role="button"
      tabIndex={0}
      aria-haspopup="menu"
      aria-label={label}
      data-holding={holding || undefined}
      onPointerDown={down}
      onPointerUp={up}
      onPointerLeave={up}
      onPointerCancel={up}
      onContextMenu={(e) => e.preventDefault()}
      onKeyDown={(e) => {
        if ((e.key === "Enter" || e.key === " ") && el.current) {
          e.preventDefault();
          onOpen(el.current);
        }
      }}
    >
      {children}
    </div>
  );
}

function PbaCardBody({ s, saved }: { s: NonNullable<PebboAnswer["suggestion"]>; saved: boolean }) {
  return (
    <>
      <span className="pba-card-k">
        <i>
          <PbaIcon name={s.kind === "quest" ? "list" : s.kind} />
        </i>
        {s.kind}
        {saved && <PbaIcon name="bookmarkFill" />}
      </span>
      <b>{s.title}</b>
      {s.text && <span className="pba-card-t">{s.text}</span>}
    </>
  );
}

/** The gray reasoning panel tucked under the card, as in the app's “Checks AI Reasoning”. */
/** Labels in the language Pebbo answered in */
function whyLabels(a: PebboAnswer) {
  const t = C.tryIt;
  return /[\uac00-\ud7a3]/.test(a.reply) ? { ...t, ...t.ko, and: ", " } : { ...t, and: " and " };
}

function PbaWhy({ a, onClose }: { a: PebboAnswer; onClose: () => void }) {
  const t = whyLabels(a);
  const words = a.noticed.map((w) => `“${w}”`);
  return (
    <motion.button
      type="button"
      className="pba-why"
      onClick={onClose}
      aria-label="AI reasoning. Tap to hide"
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: [0.2, 0.7, 0.2, 1] }}
    >
      <span className="pba-why-because">{a.why}</span>
      <span className="pba-why-k">{t.noticed}</span>
      {words.length > 0 && (
        <span className="pba-why-v">
          {t.mentioned} {words.length > 1 ? `${words.slice(0, -1).join(", ")}${t.and}${words[words.length - 1]}` : words[0]}
        </span>
      )}
      {a.mood && (
        <span className="pba-why-v">
          {t.moodRead} {t.moods[a.mood]}
        </span>
      )}
      <span className="pba-why-badge" aria-hidden>
        <PbaIcon name="spark" />
      </span>
    </motion.button>
  );
}

function PbaTable({ a, count }: { a: PebboAnswer; count: number }) {
  const t = whyLabels(a);
  return (
    <motion.dl className="pba-table" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, delay: 0.1 }}>
      <div>
        <dt>{t.table[0]}</dt>
        <dd>{a.pattern}</dd>
      </div>
      <div>
        <dt>{t.table[1]}</dt>
        <dd>
          {count}
          {t.times}
        </dd>
      </div>
      <div>
        <dt>{t.table[2]}</dt>
        <dd>{a.mood ? t.impact[a.mood] : "–"}</dd>
      </div>
    </motion.dl>
  );
}

type IconName =
  | "status"
  | "calendar"
  | "bookmark"
  | "bookmarkFill"
  | "chevron"
  | "plus"
  | "plusBig"
  | "mic"
  | "waves"
  | "send"
  | "spark"
  | "copy"
  | "reply"
  | "share"
  | "log"
  | "explore"
  | "quest"
  | "peek"
  | "list";
function PbaIcon({ name }: { name: IconName }) {
  const p = { width: 22, height: 22, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true };
  switch (name) {
    case "status":
      return (
        <svg width="60" height="12" viewBox="0 0 60 12" aria-hidden>
          <rect x="0" y="8" width="3" height="4" rx=".7" fill="currentColor" />
          <rect x="4.5" y="6" width="3" height="6" rx=".7" fill="currentColor" />
          <rect x="9" y="3.5" width="3" height="8.5" rx=".7" fill="currentColor" />
          <rect x="13.5" y="1" width="3" height="11" rx=".7" fill="currentColor" />
          <path d="M22.5 4.6a8 8 0 0 1 10.4 0M24.6 7.1a4.9 4.9 0 0 1 6.2 0M26.8 9.6a1.7 1.7 0 0 1 1.9 0" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          <rect x="37" y="1" width="21" height="10" rx="3" fill="none" stroke="currentColor" strokeOpacity=".4" />
          <rect x="38.6" y="2.6" width="17.8" height="6.8" rx="1.6" fill="currentColor" />
        </svg>
      );
    case "calendar":
      return (
        <svg {...p} width={26} height={26} strokeWidth={1.9}>
          <rect x="3.5" y="5" width="17" height="15.5" rx="2.2" />
          <path d="M3.5 10h17M8 3v4M16 3v4" />
        </svg>
      );
    case "bookmark":
      return (
        <svg {...p} width={26} height={26} strokeWidth={1.9}>
          <path d="M6.5 3.5h11v17l-5.5-4-5.5 4z" />
        </svg>
      );
    case "bookmarkFill":
      return (
        <svg {...p} width={13} height={13} fill="currentColor">
          <path d="M6.5 3.5h11v17l-5.5-4-5.5 4z" />
        </svg>
      );
    case "chevron":
      return (
        <svg {...p} width={14} height={14} strokeWidth={2.2}>
          <path d="m6 9 6 6 6-6" />
        </svg>
      );
    case "plus":
      return (
        <svg {...p} width={18} height={18} strokeWidth={1.6}>
          <path d="M12 5v14M5 12h14" />
        </svg>
      );
    case "plusBig":
      return (
        <svg {...p} width={24} height={24} strokeWidth={1.8}>
          <path d="M12 5v14M5 12h14" />
        </svg>
      );
    case "mic":
      return (
        <svg {...p} width={19} height={19}>
          <rect x="9" y="3" width="6" height="11" rx="3" />
          <path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21" />
        </svg>
      );
    case "waves":
      return (
        <svg {...p} width={18} height={18} strokeWidth={2}>
          <path d="M5 10v4M8.5 7.5v9M12 5v14M15.5 8v8M19 10.5v3" />
        </svg>
      );
    case "send":
      return (
        <svg {...p} width={18} height={18} strokeWidth={2.2}>
          <path d="M12 19V5M6 11l6-6 6 6" />
        </svg>
      );
    case "spark":
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden>
          <path d="M12 2.5c.6 4.6 3.9 7.9 8.5 8.5-4.6.6-7.9 3.9-8.5 8.5-.6-4.6-3.9-7.9-8.5-8.5 4.6-.6 7.9-3.9 8.5-8.5Z" fill="currentColor" />
          <path d="M19 2.5c.2 1.4 1.1 2.3 2.5 2.5-1.4.2-2.3 1.1-2.5 2.5-.2-1.4-1.1-2.3-2.5-2.5 1.4-.2 2.3-1.1 2.5-2.5Z" fill="currentColor" />
        </svg>
      );
    case "copy":
      return (
        <svg {...p} width={18} height={18}>
          <rect x="8" y="8" width="12" height="12" rx="2" />
          <path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3" />
        </svg>
      );
    case "reply":
      return (
        <svg {...p} width={18} height={18}>
          <path d="M9 7 4 12l5 5M4 12h11a5 5 0 0 1 5 5v1" />
        </svg>
      );
    case "share":
      return (
        <svg {...p} width={18} height={18}>
          <path d="M12 3v12M7.5 7.5 12 3l4.5 4.5M5 12v7.5h14V12" />
        </svg>
      );
    case "log":
      return (
        <svg {...p}>
          <path d="M6.5 4h9.5a1.5 1.5 0 0 1 1.5 1.5V20h-11A1.5 1.5 0 0 1 5 18.5v-13A1.5 1.5 0 0 1 6.5 4z" />
          <path d="M8.5 9h5M8.5 12.5h3.5" />
          <path d="m15.5 17 4.7-6.8 1.6 1.1-4.7 6.8-2 .8z" />
        </svg>
      );
    case "explore":
      return (
        <svg {...p}>
          <circle cx="12" cy="12" r="8.5" />
          <path d="m15.6 8.4-2.1 5.1-5.1 2.1 2.1-5.1z" />
        </svg>
      );
    case "quest":
      return (
        <svg {...p}>
          <path d="M12 6.5c.4 2.7 2.3 4.6 5 5-2.7.4-4.6 2.3-5 5-.4-2.7-2.3-4.6-5-5 2.7-.4 4.6-2.3 5-5Z" />
          <path d="M12 2.5v1.6M12 19.9v1.6M2.5 12h1.6M19.9 12h1.6M5.3 5.3l1.1 1.1M17.6 17.6l1.1 1.1M5.3 18.7l1.1-1.1M17.6 6.4l1.1-1.1" />
        </svg>
      );
    case "list":
      return (
        <svg {...p} strokeWidth={2.2}>
          <path d="M10 7h10M10 12h10M10 17h10" />
          <circle cx="5" cy="7" r="1" fill="currentColor" />
          <circle cx="5" cy="12" r="1" fill="currentColor" />
          <circle cx="5" cy="17" r="1" fill="currentColor" />
        </svg>
      );
    case "peek":
      return (
        <svg {...p}>
          <path d="M4 20h16M6.5 17v-6M10.5 17V7M14.5 17v-8M18.5 17v-4" />
        </svg>
      );
  }
}
