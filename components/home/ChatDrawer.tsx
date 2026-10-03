"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChatPanel, useChat } from "../ChaeLLM";

/**
 * ChaeLLM, from any page: a panel that slides in from the right (a sheet from the bottom on
 * phones). The conversation itself lives in ChatProvider, so closing it keeps what was said.
 */
export function ChatDrawer() {
  const { open, closeChat } = useChat();
  const [phone, setPhone] = useState(false);
  useEffect(() => {
    const m = window.matchMedia("(max-width: 799px)");
    const on = () => setPhone(m.matches);
    on();
    m.addEventListener("change", on);
    return () => m.removeEventListener("change", on);
  }, []);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeChat();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, closeChat]);

  const away = phone ? { y: "100%" } : { x: "100%" };
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div key="scrim" className="scrim cd-scrim" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeChat} />
          <motion.div
            key="panel"
            className="cd"
            role="dialog"
            aria-modal="true"
            aria-label="ChaeLLM"
            initial={away}
            animate={{ x: 0, y: 0 }}
            exit={away}
            transition={{ type: "spring", stiffness: 420, damping: 42 }}
          >
            <ChatPanel active onClose={closeChat} />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
