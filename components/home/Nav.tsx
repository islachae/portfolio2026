"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { profile } from "@/content/site";
import { useShell } from "../shell-context";
import { ChatToggle, useChat } from "../ChaeLLM";
import { DisplaySettings } from "../Sidebar";
import { Monogram } from "../Monogram";
import { PixelFace } from "../PixelFace";
import { CloseIcon, ExtArrow, MenuIcon } from "../icons";

/** Which of the nav's places the page on screen belongs to (marked with the small violet square). */
export type NavPlace = "work" | "play" | "about" | null;

/** A link that moves inside the site without a page load; ⌘/Ctrl/middle click still open the address. */
const inApp = (run: () => void) => (e: React.MouseEvent) => {
  if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button) return;
  e.preventDefault();
  run();
};

function useNavLinks() {
  const { goHome, openCase } = useShell();
  return [
    { key: "work" as const, label: "Work", href: "/#work", run: () => goHome("work") },
    { key: "play" as const, label: "Play", href: "/#play", run: () => goHome("play") },
    { key: "about" as const, label: "About", href: "/#about/story", run: () => openCase("about") },
  ];
}

/**
 * The same four places on every page: Work, Play, About, Resume. ChaeLLM sits after a hairline.
 * (Wide screens; phones get the bar and the menu below.)
 */
export function SiteNav({ at }: { at: NavPlace }) {
  const links = useNavLinks();
  const chat = useChat();
  return (
    <nav className="sn" aria-label="Site">
      {links.map((l) => (
        <a key={l.key} className="sn-link" href={l.href} aria-current={at === l.key ? "page" : undefined} onClick={inApp(l.run)}>
          {l.label}
        </a>
      ))}
      <a className="sn-link" href={profile.links.resume} target="_blank" rel="noreferrer">
        Resume
      </a>
      <span className="top-sep" aria-hidden />
      <ChatToggle onClick={() => (chat.open ? chat.closeChat() : chat.openChat())} />
    </nav>
  );
}

/** Top left on Home: who this is. The name goes to the top of Home; display settings sit beside it. */
export function NameChip() {
  const { goHome } = useShell();
  return (
    <div className="me-chip">
      <a className="me-chip-main" href="/" onClick={inApp(() => goHome("top"))} aria-label={`${profile.name}, ${profile.role}. Home`}>
        <Monogram size={30} className="me-chip-mark" tile />
        <span className="me-chip-name">{profile.name}</span>
        <span className="me-chip-role">{profile.role}</span>
      </a>
      <span className="me-chip-more">
        <DisplaySettings />
      </span>
    </div>
  );
}

/** Phones: her name, ChaeLLM's face and the menu button. */
export function PhoneBar() {
  const { goHome, setNavOpen } = useShell();
  const { openChat } = useChat();
  return (
    <header className="mobilebar pb">
      <a className="mobilebar-home" href="/" onClick={inApp(() => goHome("top"))}>
        <Monogram size={24} tile />
        <span>{profile.name}</span>
      </a>
      <ChatToggle compact onClick={openChat} />
      <button className="icon-btn" onClick={() => setNavOpen(true)} aria-label="Open menu" aria-haspopup="dialog">
        <MenuIcon />
      </button>
    </header>
  );
}

/** Phones: the menu, over whichever page is open. */
export function PhoneMenu({ at }: { at: NavPlace }) {
  const { navOpen, setNavOpen, copyEmail } = useShell();
  const { openChat } = useChat();
  const links = useNavLinks();

  // Never left open behind a wide window
  useEffect(() => {
    if (!navOpen) return;
    const m = window.matchMedia("(min-width: 800px)");
    const on = () => m.matches && setNavOpen(false);
    on();
    m.addEventListener("change", on);
    return () => m.removeEventListener("change", on);
  }, [navOpen, setNavOpen]);

  return (
    <AnimatePresence>
      {navOpen && (
        <motion.div
          className="pm"
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.16 }}
        >
          <div className="pm-bar">
            <span className="mobilebar-home">
              <Monogram size={24} tile />
              <span>{profile.name}</span>
            </span>
            <button className="icon-btn" onClick={() => setNavOpen(false)} aria-label="Close menu" autoFocus>
              <CloseIcon />
            </button>
          </div>
          <nav className="pm-links" aria-label="Site">
            {links.map((l) => (
              <a
                key={l.key}
                href={l.href}
                aria-current={at === l.key ? "page" : undefined}
                onClick={inApp(() => {
                  setNavOpen(false);
                  l.run();
                })}
              >
                {l.label}
              </a>
            ))}
            <a href={profile.links.resume} target="_blank" rel="noreferrer" onClick={() => setNavOpen(false)}>
              Resume
              <ExtArrow />
            </a>
          </nav>
          <button
            className="pm-ask pf-hover"
            onClick={() => {
              setNavOpen(false);
              openChat();
            }}
          >
            <PixelFace size={26} />
            <span>Ask ChaeLLM</span>
            <span aria-hidden>→</span>
          </button>
          <div className="pm-hi">
            <p className="label">Say hi</p>
            <button onClick={copyEmail}>{profile.email}</button>
            <div className="pm-settings">
              <DisplaySettings />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
