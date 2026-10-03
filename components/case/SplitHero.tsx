"use client";

import { useEffect, useRef, useState } from "react";
import { caseStudies, type CaseId } from "@/content/cases";
import { pageById } from "@/content/site";
import { ToolChips } from "../ProjectBrief";
import { MelonStage, PebboStage, StageLive, TippingStage } from "../Stages";
import { useScrollRoot } from "./scroll-root";

const stages: Record<CaseId, () => React.ReactElement> = {
  tipping: TippingStage,
  pebbo: PebboStage,
  melon: MelonStage,
};

/**
 * A case study's first screen: what it is on the left (label, title, one line, the facts), the
 * prototype itself on the right, working. It used to be a page of its own before the case study;
 * now the case study opens on it, and the long read continues underneath.
 * The prototype runs only while this screen is in view (StageLive).
 */
export function SplitHero({ id }: { id: CaseId }) {
  const C = caseStudies[id];
  const tools = pageById[id].tools;
  const Stage = stages[id];
  const root = useScrollRoot();
  const box = useRef<HTMLElement>(null);
  const [live, setLive] = useState(true);
  useEffect(() => {
    const el = box.current;
    if (!el || !root || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([e]) => setLive(e.isIntersecting), { root, threshold: 0.25 });
    io.observe(el);
    return () => io.disconnect();
  }, [root]);

  return (
    <section className="csx" id="cs-overview" ref={box} data-live={live || undefined}>
      <header className="cs-hero csx-text">
        <p className="cs-eyebrow">{C.eyebrow}</p>
        <h1 className="cs-h1">{C.title}</h1>
        <p className="cs-sub">{C.subtitle}</p>
        <dl className="cs-meta">
          {C.meta.map((m) => (
            <div key={m.label}>
              <dt>{m.label}</dt>
              <dd>{m.value}</dd>
            </div>
          ))}
          {tools?.length ? (
            <div>
              <dt>Tool stack</dt>
              <dd>
                <ToolChips tools={tools} />
              </dd>
            </div>
          ) : null}
        </dl>
      </header>
      <div className="stage csx-stage">
        <StageLive.Provider value={live}>
          <Stage />
        </StageLive.Provider>
      </div>
      <p className="label csx-cue" aria-hidden>
        Scroll <span>↓</span>
      </p>
    </section>
  );
}
