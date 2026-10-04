"use client";

import { useEffect, useRef } from "react";
import { pageById, profile } from "@/content/site";
import type { PlayId } from "@/content/routes";
import { useShell } from "../shell-context";
import { ChatToggle, useChat } from "../ChaeLLM";
import { ChevronLeft, MenuIcon } from "../icons";
import { WordCocktail } from "../cocktail/WordCocktail";
import { BakeryStage, LabStage, WishStage } from "../Stages";
import { SiteNav } from "./Nav";

const stages: Record<Exclude<PlayId, "cocktail">, () => React.ReactElement> = {
  wish: WishStage,
  bakery: BakeryStage,
  lab: LabStage,
};

/**
 * A play piece as its own page, over Home: its name and one line at the top, the thing itself
 * filling the rest. “Back” returns to Home where it was left (the play row).
 */
export function PlayPage({ id }: { id: PlayId }) {
  const { goHome, setNavOpen } = useShell();
  const { openChat } = useChat();
  const p = pageById[id];
  const root = useRef<HTMLDivElement>(null);
  const Stage = id === "cocktail" ? null : stages[id];

  useEffect(() => {
    root.current?.focus({ preventScroll: true });
    document.title = `${p.title} · ${profile.name}`;
    return () => {
      document.title = profile.name;
    };
  }, [p.title]);

  return (
    <div className="pp" ref={root} tabIndex={-1} data-play={id}>
      <header className="cs-bar">
        <button className="cs-back" onClick={() => goHome()}>
          <ChevronLeft size={16} />
          Back
        </button>
        <span />
        <div className="cs-bar-links">
          <SiteNav at="play" />
          <span className="bar-phone">
            <ChatToggle compact onClick={openChat} />
            <button className="icon-btn" onClick={() => setNavOpen(true)} aria-label="Open menu" aria-haspopup="dialog">
              <MenuIcon />
            </button>
          </span>
        </div>
      </header>
      <main className={`page page--${id} is-active`} aria-label={p.title}>
        <header className="page-head">
          <p className="label page-meta">{p.meta}</p>
          <h1 className="page-title">{p.heading ?? p.title}</h1>
          {/* the word bar says its own line, over the drink */}
          {id !== "cocktail" && <p className="page-tagline">{p.tagline}</p>}
        </header>
        {Stage ? (
          <div className="stage">
            <Stage />
          </div>
        ) : (
          <WordCocktail active near />
        )}
      </main>
    </div>
  );
}
