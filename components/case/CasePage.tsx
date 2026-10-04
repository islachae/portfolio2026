"use client";

import { useEffect, useRef, useState } from "react";
import { caseStudies, isCaseId, type LongId } from "@/content/cases";
import { aboutPage } from "@/content/cases/about";
import { pageById, profile } from "@/content/site";
import { reducedMotion, useShell } from "../shell-context";
import { ChevronLeft, ExtArrow, MenuIcon } from "../icons";
import { ChatToggle, useChat } from "../ChaeLLM";
import { SiteNav } from "../home/Nav";
import { SplitHero } from "./SplitHero";
import { TippingCase } from "./TippingCase";
import { PebboCase } from "./PebboCase";
import { MelonCase } from "./MelonCase";
import { AboutCase } from "./AboutCase";
import { ScrollRoot } from "./scroll-root";

/**
 * A case study as its own page: one long read (the Rachel-style layout), opening on a first
 * screen with the prototype in it (SplitHero). About opens on its own intro instead.
 * It scrolls inside its own container, so Home underneath keeps its place.
 */

/* Everything that eases up into place as it scrolls in (siblings stagger a little). */
const REVEAL = [
  ".cs-hero > *",
  ".cs-hero-fig",
  ".csx-stage",
  ".cs-lede",
  ".cs-sec > .cs-eyebrow",
  ".cs-sec > .cs-h2",
  ".cs-sec > .cs-body",
  ".cs-sec > .cs-quote",
  ".cs-sec > .cs-skip",
  ".cs-sec > .cs-scene-hint",
  ".cs-stats > *",
  ".cs-sim",
  ".cs-cards > *",
  ".cs-tl-frame",
  ".cs-sec > .cs-crowd",
  ".cs-refs",
  ".cs-journey",
  ".cs-pattern",
  ".cs-stage",
  ".cs-loop > *",
  ".cs-take",
  /* Pebbo */
  ".pb-dev",
  ".pb-bridges",
  ".pb-insight",
  ".pb-voice",
  ".pb-patterns",
  ".pb-statement",
  ".pb-define",
  ".pb-ia",
  ".pb-wire",
  ".pb-reason",
  ".pb-priv-col",
  ".pb-reflect",
  ".pb-scale",
  ".pba-copy",
  ".pba-phone",
  /* Melon */
  ".ml-glance",
  ".ml-read",
  ".ml-fig",
  ".ml-reasons",
  ".ml-map-findings",
  ".ml-methods",
  ".ml-assume",
  ".ml-flow",
  ".ml-insights > li",
  ".ml-pull",
  ".ml-rules",
  ".ml-limits",
  ".ml-concepts",
  ".ml-demo",
  ".ml-explore-item",
  ".ml-advisor",
  /* About */
  ".ab-intro-text > *",
  ".ab-collage",
  ".ab-lists > *",
  ".ab-shows",
  ".ab-show-photos",
  ".ab-cards > *",
  ".ab-off > *",
  ".ab-note",
  ".ab-hi-actions",
  ".cs-foot > *",
].join(",");


export function CasePage({ id }: { id: LongId }) {
  const { closeCase, copyEmail, setNavOpen } = useShell();
  const { openChat } = useChat();
  const data = id === "about" ? aboutPage : caseStudies[id];
  const isAbout = id === "about";
  const project = pageById[id];
  const next = pageById[data.next.id];
  const root = useRef<HTMLDivElement>(null);
  const [el, setEl] = useState<HTMLElement | null>(null);
  const [pastHero, setPastHero] = useState(false);
  const [tocFree, setTocFree] = useState(false);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const r = root.current;
    if (!r) return;
    setEl(r);
    r.scrollTop = 0;
    r.focus({ preventScroll: true });
    document.title = isAbout ? `About · ${profile.name}` : `${project.title} · Case study · ${profile.name}`;
    let raf = 0;
    const update = () => {
      raf = 0;
      // past the first screen (the prototype): the bar shows the project's name and the table
      // of contents comes in. About has no such screen: a short scroll is enough.
      const first = r.querySelector<HTMLElement>(".csx");
      setPastHero(r.scrollTop > (first ? first.offsetHeight - 200 : 320));
      // The table of contents sits where the first screen's left column passes on its way up, so
      // it only comes in once that screen has cleared it (never over the title or “Scroll ↓”).
      const toc = r.querySelector<HTMLElement>(".cs-toc");
      // (its CSS `top`, not its box: the box shifts a little while it waits)
      setTocFree(!first || !toc || first.getBoundingClientRect().bottom <= (parseFloat(getComputedStyle(toc).top) || 136) - 16);
      // “Scroll ↓” has done its job at the first scroll
      first?.toggleAttribute("data-moved", r.scrollTop > 24);
      // Table of contents: the last section whose top has passed ~30% of the view
      const line = r.getBoundingClientRect().top + r.clientHeight * 0.3;
      let i = 0;
      data.toc.forEach((t, k) => {
        const el = document.getElementById(t.id);
        if (el && el.getBoundingClientRect().top <= line) i = k;
      });
      if (r.scrollTop + r.clientHeight >= r.scrollHeight - 4) i = data.toc.length - 1;
      setActive(i);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    r.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      r.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
      document.title = profile.name;
    };
  }, [project.title, data.toc, isAbout]);

  const jump = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    const r = root.current;
    const el = document.getElementById(id);
    if (!r || !el) return;
    const top = el.getBoundingClientRect().top - r.getBoundingClientRect().top + r.scrollTop - 80;
    r.scrollTo({ top: Math.max(0, top), behavior: reducedMotion() ? "auto" : "smooth" });
    if (!el.hasAttribute("tabindex")) el.setAttribute("tabindex", "-1");
    window.setTimeout(() => el.focus({ preventScroll: true }), reducedMotion() ? 0 : 600);
  };

  // Each block eases up as its edge enters (once). Reduced motion: everything is simply there.
  // Scrolled fast (a flick, the scrollbar, a table-of-contents jump: more than ~1.4 screens a
  // second), nothing waits for its fade: whatever is on screen or within a screen of it appears
  // at once, so a quick scroll never lands on an empty page. Blocks already passed appear at once too.
  useEffect(() => {
    const r = root.current;
    if (!r || reducedMotion() || typeof IntersectionObserver === "undefined") return;
    const els = Array.from(r.querySelectorAll<HTMLElement>(REVEAL));
    const order = new Map<Element, number>();
    for (const e of els) {
      const parent = e.parentElement as Element;
      const i = order.get(parent) ?? 0;
      order.set(parent, i + 1);
      e.style.setProperty("--rv-d", `${Math.min(i, 4) * 40}ms`);
      e.classList.add("cs-rv");
    }
    const pending = new Set<Element>(els);
    const near = new Set<Element>(); // not shown yet, within a screen of the viewport
    let fastUntil = 0;
    const fast = () => performance.now() < fastUntil;
    const show = (e: Element, now: boolean) => {
      if (!pending.delete(e)) return;
      near.delete(e);
      if (now) e.classList.add("cs-rv-now");
      e.classList.add("cs-rv-in");
      enter.unobserve(e);
      ahead.unobserve(e);
    };
    const enter = new IntersectionObserver(
      (entries) => {
        for (const en of entries) if (en.isIntersecting) show(en.target, fast());
      },
      { root: r, threshold: 0.01 },
    );
    const ahead = new IntersectionObserver(
      (entries) => {
        for (const en of entries) {
          if (en.isIntersecting) {
            if (fast()) show(en.target, true);
            else near.add(en.target);
          } else {
            near.delete(en.target);
            // more than a screen above: it was passed, so it's simply there if they scroll back
            if (en.rootBounds && en.boundingClientRect.bottom < en.rootBounds.top) show(en.target, true);
          }
        }
      },
      { root: r, rootMargin: "100% 0px 100% 0px" },
    );
    // speed over the last ~150ms (one scroll event to the next is too jumpy: a wheel notch
    // arrives as one 100px step)
    let trail: [number, number][] = [];
    let lastPing = 0;
    let settle = 0;
    // once a fast scroll stops: anything it flew past without touching is simply there
    const sweep = () => {
      const edge = r.getBoundingClientRect().top;
      pending.forEach((e) => {
        if (e.getBoundingClientRect().bottom < edge) show(e, true);
      });
    };
    const onScroll = () => {
      const now = performance.now();
      const top = r.scrollTop;
      trail = trail.filter(([t]) => now - t <= 150);
      const from = trail[0];
      trail.push([now, top]);
      if (from && now - from[0] >= 40 && (Math.abs(top - from[1]) / (now - from[0])) * 1000 > r.clientHeight * 1.4) {
        fastUntil = now + 300;
        near.forEach((e) => show(e, true));
        if (now - lastPing > 100) {
          lastPing = now;
          r.dispatchEvent(new Event("cs-fast")); // the in-view pieces (kit.tsx) start early too
        }
        window.clearTimeout(settle);
        settle = window.setTimeout(sweep, 160);
      }
    };
    r.addEventListener("scroll", onScroll, { passive: true });
    els.forEach((e) => {
      enter.observe(e);
      ahead.observe(e);
    });
    return () => {
      enter.disconnect();
      ahead.disconnect();
      r.removeEventListener("scroll", onScroll);
      window.clearTimeout(settle);
    };
  }, [id]);

  return (
    <ScrollRoot.Provider value={el}>
      <div className="cs" ref={root} tabIndex={-1} data-case={id}>
        <header className="cs-bar">
          <button className="cs-back" onClick={() => closeCase(id)}>
            <ChevronLeft size={16} />
            Back
          </button>
          <span className="cs-bar-title" data-show={pastHero || undefined} aria-hidden={!pastHero}>
            {project.title}
          </span>
          {/* The same places as on Home; phones get ChaeLLM and the menu button */}
          <div className="cs-bar-links">
            <SiteNav at={isAbout ? "about" : "work"} />
            <span className="bar-phone">
              <ChatToggle compact onClick={openChat} />
              <button className="icon-btn" onClick={() => setNavOpen(true)} aria-label="Open menu" aria-haspopup="dialog">
                <MenuIcon />
              </button>
            </span>
          </div>
        </header>

        {isCaseId(id) && <SplitHero id={id} />}

        {/* On this page: sits in the left margin on wide screens. A case study's first screen
            uses that margin, so there it waits until that screen has scrolled clear of it. */}
        <nav className="cs-toc" aria-label="On this page" data-wait={(!isAbout && !tocFree) || undefined} inert={!isAbout && !tocFree ? true : undefined}>
          <ol>
            {data.toc.map((t, i) => (
              <li key={t.id}>
                <a href={`#${t.id}`} aria-current={i === active ? "true" : undefined} onClick={(e) => jump(e, t.id)}>
                  {t.label}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <main className="cs-main">
          {id === "about" ? <AboutCase /> : id === "pebbo" ? <PebboCase /> : id === "melon" ? <MelonCase /> : <TippingCase />}
        </main>

        <footer className="cs-foot">
          <button className="cs-next" onClick={() => closeCase(next.id)}>
            <span className="cs-next-label">{"label" in data.next ? data.next.label : "Next project"}</span>
            <span className="cs-next-row">
              <span className="cs-next-text">
                <span className="cs-next-title">{data.next.title}</span>
                <span className="cs-next-line">{data.next.line}</span>
              </span>
            </span>
          </button>
          {/* About ends on its own note and buttons; case studies end on these */}
          {!isAbout && (
          <div className="cs-foot-row">
            <p>Thanks for reading. Happy to walk you through the rest.</p>
            <div className="cs-foot-actions">
              <a className="btn btn--ghost" href={profile.links.resume} target="_blank" rel="noreferrer">
                Resume
                <ExtArrow />
              </a>
              <button className="btn btn--primary" onClick={copyEmail}>
                Copy email
              </button>
              <button className="btn btn--ghost" onClick={() => closeCase("home")}>
                All work
              </button>
            </div>
          </div>
          )}
        </footer>
      </div>
    </ScrollRoot.Provider>
  );
}
