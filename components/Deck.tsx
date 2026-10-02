"use client";

import { useEffect, useRef } from "react";
import { pages, type PageId } from "@/content/site";
import { isCaseId, type CaseId } from "@/content/cases";
import { useShell } from "./shell-context";
import { HomeHero } from "./HomePage";
import { ArrowRight, PanelIcon } from "./icons";
import { ShaderHero } from "./ShaderHero";
import { StageDoor } from "./StageDoor";
import { WordCocktail } from "./cocktail/WordCocktail";
import { IndexRail, ProfileChip, TopLinks } from "./IndexRail";
import { ChatToggle } from "./ChaeLLM";
import { AboutBrief, ProjectBrief } from "./ProjectBrief";
import {
  AboutStage,
  BakeryStage,
  HiStage,
  LabStage,
  MelonStage,
  PebboStage,
  TippingStage,
  WishStage,
  ZipflowStage,
} from "./Stages";

const stages: Partial<Record<PageId, () => React.ReactElement>> = {
  tipping: TippingStage,
  zipflow: ZipflowStage,
  pebbo: PebboStage,
  melon: MelonStage,
  wish: WishStage,
  bakery: BakeryStage,
  lab: LabStage,
  about: AboutStage,
  hi: HiStage,
};

/**
 * The canvas: a deck of full-height pages, no chrome on top.
 * Scrolling flips one page at a time; whatever is on screen drives the sidebar and inspector.
 */
export function Deck({
  leftOpen,
  onToggleLeft,
  onToggleChat,
}: {
  leftOpen: boolean;
  onToggleLeft: () => void;
  onToggleChat: () => void;
}) {
  const { registerScroller, setCurrent, current, openCase } = useShell();
  const deck = useRef<HTMLDivElement>(null);
  // a page next to the one on screen: heavy stages can warm up before they're scrolled to
  const at = pages.findIndex((x) => x.id === current);
  const near = (id: PageId) => Math.abs(pages.findIndex((x) => x.id === id) - at) <= 1;

  // Which page is on screen = the one crossing the middle of the scroller.
  // (Measured on scroll instead of IntersectionObserver: inside an embedded, cross-origin
  // frame the observer ignores rootMargin and reports the next page too early.)
  useEffect(() => {
    const d = deck.current;
    if (!d) return;
    registerScroller(d);
    const pages = Array.from(d.querySelectorAll<HTMLElement>("section[data-page]"));
    let raf = 0;
    const update = () => {
      raf = 0;
      // Canvas scrolls on larger screens; on phones the page itself does.
      const own = getComputedStyle(d).overflowY !== "visible";
      const r = own ? d.getBoundingClientRect() : { top: 0, height: window.innerHeight };
      const mid = r.top + r.height / 2;
      const hit = pages.find((el) => {
        const b = el.getBoundingClientRect();
        return b.top <= mid && b.bottom > mid;
      });
      if (hit) setCurrent(hit.dataset.page as PageId);
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    d.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    const ro = new ResizeObserver(schedule);
    ro.observe(d);
    update();
    return () => {
      cancelAnimationFrame(raf);
      d.removeEventListener("scroll", schedule);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      ro.disconnect();
    };
  }, [registerScroller, setCurrent]);

  return (
    <main className="canvas" id="main">
      {/* The project index and the name chip replace the left sidebar on wide screens */}
      <IndexRail />
      <ProfileChip />
      {/* No toolbar: the canvas stays a clean sheet. These appear only when a side panel is tucked away. */}
      <div className="canvas-controls canvas-controls--left" data-show={!leftOpen || undefined}>
        <button className="icon-btn panel-toggle" onClick={onToggleLeft} aria-label="Show sidebar" aria-expanded={false}>
          <PanelIcon side="left" open={false} dot />
        </button>
      </div>
      {/* Résumé, LinkedIn, email and ChaeLLM: top right, on every page */}
      <TopLinks chat={<ChatToggle onClick={onToggleChat} />} />

      <div className="deck" ref={deck} tabIndex={-1}>
        {pages.map((p) => {
          const Stage = stages[p.id];
          // Work pages and About: the brief on the left, the stage on the right, and a way into the long read
          const split = (p.challenge && p.did) || p.id === "about";
          const long = isCaseId(p.id) || p.id === "about";
          return (
            <section
              key={p.id}
              id={`page-${p.id}`}
              data-page={p.id}
              className={`page page--${p.id}${split ? " page--split" : ""}${current === p.id ? " is-active" : ""}`}
              aria-label={p.title}
            >
              {p.id === "home" ? (
                <>
                  <ShaderHero active={current === "home"} />
                  <HomeHero />
                </>
              ) : (
                <>
                  <header className={`page-head${long ? " page-head--case" : ""}`}>
                    <p className="label page-meta">
                      {p.meta}
                      {p.status === "soon" && <span className="tag tag--soon">Coming soon</span>}
                    </p>
                    <h2 className="page-title">{p.heading ?? p.title}</h2>
                    {/* the word bar says its own line, over the drink */}
                    {p.id !== "cocktail" && <p className="page-tagline">{p.tagline}</p>}
                    {/* Work pages: the brief sits right here, text on the left and the stage on the right */}
                    <ProjectBrief page={p} />
                    {p.id === "about" && <AboutBrief page={p} />}
                    {long && (
                      <button className="page-case" onClick={() => openCase(p.id as CaseId | "about")}>
                        {p.id === "about" ? "More about me" : "Read case study"}
                        <ArrowRight size={15} className="page-case-arrow" />
                      </button>
                    )}
                  </header>
                  {/* Work pages with a case study: the stage is a way in too (components/StageDoor.tsx) */}
                  {p.id === "cocktail" ? (
                    // the bar is this page's stage: one centred counter under the heading
                    <WordCocktail active={current === "cocktail"} near={near(p.id)} />
                  ) : (
                    <StageDoor id={isCaseId(p.id) ? p.id : null}>{Stage && <Stage />}</StageDoor>
                  )}
                </>
              )}
            </section>
          );
        })}
      </div>
    </main>
  );
}
