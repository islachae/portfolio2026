"use client";

/* eslint-disable @next/next/no-img-element */
import { useEffect, useRef, useState } from "react";
import { pages, profile, type Page, type PageId } from "@/content/site";
import { useShell } from "./shell-context";
import { DisplaySettings } from "./Sidebar";
import { Monogram } from "./Monogram";
import { ExtArrow } from "./icons";

/**
 * The project index, without a sidebar (wide screens).
 * At rest it reads like a watchlist: each page's ticker (TIP, ZIPF, PEBO…) in mono, grouped
 * Work / Play / More, the current one marked with a small violet square.
 * Hover or tab into it and the lines open into the list: Work (numbered), Play, About / Say hi, search.
 * Hovering a name shows a small preview beside the list.
 * Phones keep the slide-in menu from the top bar.
 */
const PREVIEW: Partial<Record<PageId, string>> = {
  tipping: "/work/tipping.webp",
  zipflow: "/work/zipflow.webp",
  pebbo: "/work/pebbo.webp",
  wish: "/fun/wish-scene.webp",
  cocktail: "/fun/word-cocktail.webp",
  bakery: "/fun/bake-raspberry.webp",
  about: "/about/portrait.webp",
  hi: "/about/end-note.webp",
};

const GROUPS: { key: string; label: string | null; numbered?: boolean; of: Page["group"][] }[] = [
  { key: "home", label: null, of: ["home"] },
  { key: "work", label: "Work", numbered: true, of: ["work", "progress"] },
  { key: "play", label: "Play", of: ["fun"] },
  { key: "more", label: null, of: ["more"] },
];

export function IndexRail() {
  const { current, goTo, setPaletteOpen } = useShell();
  const list = pages;
  const [peek, setPeek] = useState<{ id: PageId; top: number } | null>(null);
  // After a pick the list folds back to tickers, even though the pointer is still over it;
  // it opens again once the pointer leaves and comes back, or focus returns by keyboard.
  const [closed, setClosed] = useState(false);
  const pick = (run: () => void) => {
    run();
    setPeek(null);
    setClosed(true);
    (document.activeElement as HTMLElement | null)?.blur();
  };
  const [mac, setMac] = useState(true);
  useEffect(() => setMac(/Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent)), []);

  const show = (id: PageId, el: HTMLElement) => setPeek({ id, top: el.offsetTop + el.offsetHeight / 2 });
  const src = peek ? PREVIEW[peek.id] : undefined;

  return (
    <nav
      className="rail"
      aria-label="Projects"
      data-closed={closed || undefined}
      onMouseLeave={() => {
        setPeek(null);
        setClosed(false);
      }}
      onKeyUp={(e) => e.key === "Tab" && setClosed(false)}
    >
      <span className="rail-tickers" aria-hidden>
        {GROUPS.map((g) => (
          <span className="rail-tgroup" key={g.key}>
            {list
              .filter((p) => g.of.includes(p.group))
              .map((p) => (
                <span key={p.id} className="rail-ticker" data-on={current === p.id || undefined}>
                  {p.ticker ?? p.title.slice(0, 4)}
                </span>
              ))}
          </span>
        ))}
      </span>
      <div className="rail-menu">
        <div className="rail-list">
          {GROUPS.map((g) => {
            const items = list.filter((p) => g.of.includes(p.group));
            return (
              <div className="rail-group" key={g.key}>
                {g.label && <p className="rail-k">{g.label}</p>}
                {items.map((p, i) => (
                  <button
                    key={p.id}
                    className="rail-item"
                    aria-current={current === p.id ? "page" : undefined}
                    onClick={() => pick(() => goTo(p.id))}
                    onMouseEnter={(e) => show(p.id, e.currentTarget)}
                    onFocus={(e) => show(p.id, e.currentTarget)}
                  >
                    <span className="rail-n" aria-hidden>
                      {g.numbered ? String(i + 1).padStart(2, "0") : ""}
                    </span>
                    {p.title}
                    {p.status === "soon" && <span className="rail-soon">Soon</span>}
                  </button>
                ))}
              </div>
            );
          })}
        </div>
        <button className="rail-search" onClick={() => pick(() => setPaletteOpen(true))}>
          <span suppressHydrationWarning>{mac ? "⌘K" : "Ctrl K"}</span> Search
        </button>
        {src && peek && (
          <span className="rail-peek" style={{ top: peek.top }} aria-hidden>
            <img src={src} alt="" />
          </span>
        )}
      </div>
    </nav>
  );
}

/** Bottom-left: who this is. The name goes Home; hover or tab in for Resume, LinkedIn and display settings. */
export function ProfileChip() {
  const { goTo, current } = useShell();
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div className="me-chip" ref={ref} data-page={current}>
      <button className="me-chip-main" onClick={() => goTo("home")} aria-label={`${profile.name}, ${profile.role}. Home`}>
        <Monogram size={28} className="me-chip-mark" />
        <span className="me-chip-name">{profile.name}</span>
        <span className="me-chip-role">{profile.role}</span>
      </button>
      {/* Resume and LinkedIn live in the header now; the chip keeps display settings */}
      <span className="me-chip-more">
        <DisplaySettings />
      </span>
    </div>
  );
}

/**
 * What a recruiter looks for first, on every page: résumé and LinkedIn. Always visible,
 * no hover needed. Top right of the canvas, with ChaeLLM after a hairline.
 */
export function ContactLinks({ compact = false }: { compact?: boolean }) {
  const { openCase, caseStudy } = useShell();
  const onAbout = caseStudy === "about";
  return (
    <>
      {/* About sits with Résumé and LinkedIn: all three answer “who is this?”. It opens the full
          About page; on the About page itself it's marked as the current one. */}
      {!compact && (
        <button
          type="button"
          className="top-link top-link--box top-link--about"
          aria-current={onAbout ? "page" : undefined}
          onClick={() => !onAbout && openCase("about")}
        >
          About me
        </button>
      )}
      <a className="top-link top-link--resume" href={profile.links.resume} target="_blank" rel="noreferrer">
        Resume
        <ExtArrow />
      </a>
      {!compact && (
        <a className="top-link top-link--li" href={profile.links.linkedin} target="_blank" rel="noreferrer">
          LinkedIn
          <ExtArrow />
        </a>
      )}
    </>
  );
}

export function TopLinks({ chat }: { chat: React.ReactNode }) {
  return (
    <nav className="top-links" aria-label="Contact">
      <ContactLinks />
      <span className="top-sep" aria-hidden />
      {chat}
    </nav>
  );
}
