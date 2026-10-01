"use client";

import { AnimatePresence, motion } from "motion/react";
import { profile } from "@/content/site";
import { useShell } from "./shell-context";
import { ChatToggle, useChat } from "./ChaeLLM";
import { CheckIcon, MenuIcon, SearchIcon } from "./icons";
import { Monogram } from "./Monogram";

/** Top bar on phones. */
export function MobileBar() {
  const { setNavOpen, setPaletteOpen, goTo, openCase } = useShell();
  const { openChat } = useChat();
  return (
    <header className="mobilebar">
      <button className="mobilebar-home" onClick={() => goTo("home")}>
        <Monogram size={24} />
        <span>{profile.name}</span>
      </button>
      {/* Same order as the wide header: About (boxed), then Résumé */}
      <button type="button" className="top-link top-link--box top-link--about mobilebar-about" onClick={() => openCase("about")}>
        About me
      </button>
      <a className="top-link mobilebar-resume" href={profile.links.resume} target="_blank" rel="noreferrer">
        Resume<span aria-hidden> ↗</span>
      </a>
      <ChatToggle compact onClick={openChat} />
      <button className="icon-btn" onClick={() => setPaletteOpen(true)} aria-label="Search">
        <SearchIcon />
      </button>
      <button className="icon-btn" onClick={() => setNavOpen(true)} aria-label="Open menu">
        <MenuIcon />
      </button>
    </header>
  );
}

export function Toast() {
  const { toast } = useShell();
  return (
    <div className="toast-wrap" aria-live="polite">
      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast}
            className="toast"
            initial={{ opacity: 0, y: 10, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.98 }}
            transition={{ duration: 0.2, ease: [0.3, 0.7, 0.2, 1] }}
          >
            <CheckIcon size={15} />
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
