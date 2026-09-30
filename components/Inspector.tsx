/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { about, handoff, pageById, profile, type Page, type PageId } from "@/content/site";
import { isCaseId } from "@/content/cases";
import { useShell } from "./shell-context";
import { Poll } from "./Poll";
import { ChatDock, ChatPanel, useChat } from "./ChaeLLM";
import { CloseIcon, PageIcon, PanelIcon, Sparkle } from "./icons";

const ease = [0.3, 0.7, 0.2, 1] as const;

function useMediaQuery(q: string) {
  const [match, setMatch] = useState(false);
  useEffect(() => {
    const m = window.matchMedia(q);
    const on = () => setMatch(m.matches);
    on();
    m.addEventListener("change", on);
    return () => m.removeEventListener("change", on);
  }, [q]);
  return match;
}

function Content({ id }: { id: PageId }) {
  const page = pageById[id];
  if (id === "home") return <HomeInspector />;
  if (id === "about") return <AboutInspector />;
  if (id === "hi") return <HiInspector />;
  return <PageInspector page={page} />;
}

/** Right-hand column on wide screens. Follows whatever page is on screen. */
/** The value once it has stopped changing for `ms` (a fast flip through the deck switches the panel once). */
function useSettled<T>(value: T, ms: number) {
  const [settled, setSettled] = useState(value);
  useEffect(() => {
    const t = window.setTimeout(() => setSettled(value), ms);
    return () => window.clearTimeout(t);
  }, [value, ms]);
  return settled;
}

export function InspectorColumn({ open }: { open: boolean }) {
  const { open: chatOpen, closeChat } = useChat();
  return (
    <aside
      className="inspector"
      aria-label="ChaeLLM"
      data-collapsed={!open || undefined}
      data-mode="chat"
      inert={!open ? true : undefined}
    >
      {/* ChaeLLM only: the column is open exactly while the chat is */}
      <div className="inspector-chat" inert={!open ? true : undefined}>
        <ChatPanel active={open && chatOpen} onClose={closeChat} />
      </div>
    </aside>
  );
}

/** Same content as a drawer (tablet) or bottom sheet (phone). */
export function InspectorSheet() {
  const { detailsOpen, setDetailsOpen } = useShell();
  const { closeChat } = useChat();
  const wide = useMediaQuery("(min-width: 1200px)");
  const phone = useMediaQuery("(max-width: 799px)");
  const open = !wide && detailsOpen;

  // Dismissing the drawer (scrim, Esc) also ends chat mode on smaller screens.
  useEffect(() => {
    if (!wide && !detailsOpen) closeChat();
  }, [detailsOpen, wide, closeChat]);

  const offscreen = phone ? { y: "100%" } : { x: "calc(100% + 16px)" };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div key="scrim" className="scrim" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setDetailsOpen(false)} />
          <motion.div
            key="sheet"
            className="sheet"
            role="dialog"
            aria-modal="true"
            aria-label="ChaeLLM"
            data-chat
            initial={offscreen}
            animate={{ x: 0, y: 0 }}
            exit={offscreen}
            transition={{ type: "spring", stiffness: 420, damping: 42 }}
          >
            <ChatPanel
              active
              onClose={() => {
                closeChat();
                setDetailsOpen(false);
              }}
            />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/* ───────────── Shared ───────────── */

export function Facts({ rows }: { rows: { label: string; value: string }[] }) {
  return (
    <dl className="facts">
      {rows.map((r) => (
        <div className="fact" key={r.label}>
          <dt>{r.label}</dt>
          <dd>{r.value}</dd>
        </div>
      ))}
    </dl>
  );
}

/**
 * The thesis as a ledger: what AI handles on the left, what stays a human call on the right.
 * The divider between them is "that line" from the footnote; it lights up as you hover.
 */
export function HandoffTable() {
  const { goTo } = useShell();
  return (
    <section className="handoff" aria-labelledby="handoff-title">
      <h2 className="label handoff-title" id="handoff-title">
        {handoff.title}
      </h2>
      <p className="handoff-line">{handoff.line}</p>
      <div className="handoff-card" role="table" aria-label={handoff.title}>
        <div className="handoff-row handoff-row--head" role="row">
          <span role="columnheader">
            <span className="sr-only">Project</span>
          </span>
          <span role="columnheader" className="handoff-h handoff-h--ai">
            <Sparkle size={10} /> AI handles
          </span>
          <span className="handoff-rule" aria-hidden />
          <span role="columnheader" className="handoff-h handoff-h--you">
            <span className="dot-you" aria-hidden /> You decide
          </span>
        </div>
        {handoff.rows.map((r) => {
          const p = pageById[r.page];
          return (
            <button key={r.page} className="handoff-row" role="row" onClick={() => goTo(r.page)} title={`Open ${p.title}`}>
              <span role="cell" className="handoff-sym">
                <PageIcon id={r.page} size={16} />
              </span>
              <span role="cell" className="handoff-ai">
                {r.ai}
              </span>
              <span className="handoff-rule" aria-hidden />
              <span role="cell" className="handoff-you">
                {r.human}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

/* ───────────── Pages ───────────── */

function HomeInspector() {
  const p = pageById.home;
  return (
    <>
      <div className="insp-body">
        <HandoffTable />
      </div>
      <Poll />
      <Facts rows={p.facts} />
    </>
  );
}

function PageInspector({ page: p }: { page: Page }) {
  const isWork = p.group === "work" || p.group === "progress";
  const hasCase = isCaseId(p.id);
  const subject = encodeURIComponent(`${p.title}: walkthrough`);
  return (
    <>
      {/* challenge → what I did → ledger → ask → facts. The tagline is already on the canvas. */}
      <div className="insp-body insp-body--page">
        {p.challenge && p.did ? (
          <dl className="insp-pair">
            <div>
              <dt>Challenge</dt>
              <dd>{p.challenge}</dd>
            </div>
            <div>
              <dt>What I did</dt>
              <dd>{p.did}</dd>
            </div>
          </dl>
        ) : (
          p.summary.map((t, i) => <p key={i}>{t}</p>)
        )}
        {p.handoff && (
          <div className="split">
            <div className="split-col split-col--ai">
              <span className="split-head">
                <Sparkle size={10} /> AI handles
              </span>
              <ul>
                {p.handoff.automated.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </div>
            <div className="split-col split-col--you">
              <span className="split-head">
                <span className="dot-you" aria-hidden /> You decide
              </span>
              <ul>
                {p.handoff.yours.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
      {/* The case study button lives on the canvas title row; pages without one get a single ask */}
      {isWork && !hasCase && (
        <div className="insp-cta">
          <a className="btn btn--primary insp-ask" href={`mailto:${profile.email}?subject=${subject}`}>
            {p.status === "soon" ? "Ask about early work" : "Ask for a walkthrough"}
          </a>
        </div>
      )}
      {/* Team, focus, year: reference details sit at the very bottom */}
      <Facts rows={p.facts} />
    </>
  );
}

function AboutInspector() {
  const [openQuote, setOpenQuote] = useState<number | null>(null);
  const p = pageById.about;
  return (
    <>
      <div className="insp-body">
        {/* "안녕! I'm Chaewon." is the canvas tagline; the panel starts with the motto */}
        <p className="insp-lede">{about.motto}</p>
        {about.intro.map((t, i) => (
          <p key={i}>{t}</p>
        ))}

        <h2 className="insp-h">What I&rsquo;m good at</h2>
        <ul className="pill-list">
          {about.strengths.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>

        <h2 className="insp-h">What pulls me in</h2>
        <ul className="dash-list">
          {about.interests.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>

        <h2 className="insp-h">Words I design by</h2>
        <div className="quotes">
          {about.philosophy.map((q, i) => {
            const open = openQuote === i;
            return (
              <div className="quote" key={q.title} data-open={open || undefined}>
                <button className="quote-btn" aria-expanded={open} onClick={() => setOpenQuote(open ? null : i)}>
                  <span>{q.title}</span>
                  <span className="quote-plus" aria-hidden />
                </button>
                <AnimatePresence initial={false}>
                  {open && (
                    <motion.div
                      className="quote-body"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.22, ease }}
                    >
                      <blockquote>
                        “{q.quote}”<cite>{q.by}</cite>
                      </blockquote>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        <h2 className="insp-h">Where I&rsquo;ve shown work</h2>
        <p className="insp-small">{about.exhibitionsNote}</p>
        <div className="show-strip">
          {about.showPhotos.map((s) => (
            <img key={s.src} src={s.src} alt={s.alt} loading="lazy" />
          ))}
        </div>
        <ul className="shows">
          {about.exhibitions.map((x) => (
            <li key={x.title}>
              <span className="shows-year">{x.year}</span>
              <span className="shows-main">
                <span className="shows-title">{x.title}</span>
                <span className="shows-sub">
                  {x.type} · {x.place}
                </span>
              </span>
            </li>
          ))}
        </ul>

        <h2 className="insp-h">Off the clock</h2>
        <ul className="clock-off">
          {about.offTheClock.map((x) => (
            <li key={x.label}>
              <span>{x.label}</span>
              <span>{x.note}</span>
            </li>
          ))}
        </ul>
      </div>
      <Facts rows={p.facts} />
    </>
  );
}

function HiInspector() {
  const p = pageById.hi;
  // The canvas has the tagline, "Send a hi" and the links; the panel keeps the ask and the details
  return (
    <>
      <div className="insp-body">
        {p.summary.map((t, i) => (
          <p key={i} className={i === 0 ? "insp-lede" : undefined}>
            {t}
          </p>
        ))}
      </div>
      <Facts rows={p.facts} />
    </>
  );
}
