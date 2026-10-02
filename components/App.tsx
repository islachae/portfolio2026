"use client";

import { useEffect, useState } from "react";
import { Sidebar } from "./Sidebar";
import { Deck } from "./Deck";
import { InspectorColumn, InspectorSheet } from "./Inspector";
import { CommandPalette } from "./CommandPalette";
import { MobileBar } from "./Chrome";
import { useShell } from "./shell-context";
import { useChat } from "./ChaeLLM";

/**
 * The deck, with ChaeLLM sliding in from the right when asked (wide screens) or as a drawer.
 */
export function App() {
  const [left, setLeft] = useState(true);
  const { setDetailsOpen } = useShell();
  const chat = useChat();

  // Below 1200px ChaeLLM opens as a drawer / bottom sheet instead of a column.
  // (Read on the first client render rather than in the effect: on a phone the effect's
  // true → false re-rendered the whole deck right after waking it. It can't mismatch the server's
  // HTML: `wide` only matters while the chat is open, and it starts closed.)
  const [wide, setWide] = useState(() => typeof window === "undefined" || window.matchMedia("(min-width: 1200px)").matches);
  useEffect(() => {
    const m = window.matchMedia("(min-width: 1200px)");
    const on = () => setWide(m.matches);
    on();
    m.addEventListener("change", on);
    return () => m.removeEventListener("change", on);
  }, []);

  // There is no details panel any more (each work page carries its own brief): the right column
  // exists only for ChaeLLM, so it is open exactly while the chat is.
  const right = wide && chat.open;

  // Asking ChaeLLM (header, ⌘K, phone bar) on a smaller screen opens the drawer.
  useEffect(() => {
    if (!chat.nonce) return;
    if (!window.matchMedia("(min-width: 1200px)").matches) setDetailsOpen(true);
  }, [chat.nonce, setDetailsOpen]);

  const toggleChat = () => {
    if (chat.open) {
      chat.closeChat();
      if (!wide) setDetailsOpen(false);
    } else chat.openChat();
  };

  return (
    <div className="app" data-left={left ? "open" : "closed"} data-right={right ? "open" : "closed"}>
      <MobileBar />
      <Sidebar open={left} onHide={() => setLeft(false)} />
      <Deck leftOpen={left} onToggleLeft={() => setLeft((v) => !v)} onToggleChat={toggleChat} />
      <InspectorColumn open={right} />
      <InspectorSheet />
      <CommandPalette />
    </div>
  );
}
