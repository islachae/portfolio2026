"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { chaellm, reply } from "@/content/chaellm";
import { reducedMotion } from "./shell-context";
import { ArrowDown, CloseIcon, InfoIcon, ReplayIcon } from "./icons";
import { PixelFace } from "./PixelFace";

/**
 * ChaeLLM turns the right sidebar into a chat. The conversation lives here (not in the panel),
 * so it survives switching back to Details, collapsing the sidebar, or moving to the drawer.
 */

type Msg = { id: number; role: "user" | "assistant"; text: string; shown?: number; follow?: string[] };

type ChatState = {
  open: boolean;
  /** Bumps on every openChat(), so the shell can reveal the panel even if chat was already on. */
  nonce: number;
  openChat: () => void;
  closeChat: () => void;
  messages: Msg[];
  busy: boolean;
  streaming: boolean;
  ask: (q: string) => void;
  reset: () => void;
};

const Ctx = createContext<ChatState | null>(null);

export function useChat() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useChat must be used inside <ChatProvider>");
  return ctx;
}

const wordsOf = (t: string) => t.split(" ");

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [nonce, setNonce] = useState(0);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [busy, setBusy] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const session = useRef(0);
  const nextId = useRef(1);
  const timer = useRef<number | undefined>(undefined);

  const openChat = useCallback(() => {
    setOpen(true);
    setNonce((n) => n + 1);
  }, []);
  const closeChat = useCallback(() => setOpen(false), []);

  const stopStream = () => {
    window.clearInterval(timer.current);
    setStreaming(false);
  };

  const ask = useCallback(
    (raw: string) => {
      const q = raw.trim();
      if (!q || busy || streaming) return;
      const mine = session.current;
      setMessages((m) => [...m, { id: nextId.current++, role: "user", text: q }]);
      setBusy(true);
      reply(q).then((r) => {
        if (mine !== session.current) return; // chat was reset while thinking
        const id = nextId.current++;
        const total = wordsOf(r.text).length;
        const instant = reducedMotion();
        setMessages((m) => [...m, { id, role: "assistant", text: r.text, follow: r.follow, shown: instant ? total : 0 }]);
        setBusy(false);
        if (instant) return;
        // Stream it in a few words at a time, like the real thing will.
        setStreaming(true);
        let shown = 0;
        timer.current = window.setInterval(() => {
          shown = Math.min(total, shown + 2);
          setMessages((m) => m.map((x) => (x.id === id ? { ...x, shown } : x)));
          if (shown >= total) stopStream();
        }, 45);
      });
    },
    [busy, streaming]
  );

  const reset = useCallback(() => {
    session.current += 1;
    stopStream();
    setBusy(false);
    setMessages([]);
  }, []);

  useEffect(() => () => window.clearInterval(timer.current), []);

  const value = useMemo<ChatState>(
    () => ({ open, nonce, openChat, closeChat, messages, busy, streaming, ask, reset }),
    [open, nonce, openChat, closeChat, messages, busy, streaming, ask, reset]
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

const ease = [0.3, 0.7, 0.2, 1] as const;

function Suggestions({ items, onPick, divided }: { items: string[]; onPick: (q: string) => void; divided?: boolean }) {
  if (!items.length) return null;
  return (
    <ul className={`chat-sugs${divided ? " chat-sugs--divided" : ""}`} aria-label="Suggested questions">
      {items.map((s, i) => (
        <motion.li
          key={s}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.05 + i * 0.05, ease }}
        >
          <button className="chat-sug" onClick={() => onPick(s)}>
            <span className="chat-sug-arrow" aria-hidden>
              ↳
            </span>
            {s}
          </button>
        </motion.li>
      ))}
    </ul>
  );
}

/** The chat itself. Used in the right column (wide screens) and in the drawer/sheet. */
export function ChatPanel({ active, onClose }: { active: boolean; onClose: () => void }) {
  const { messages, busy, streaming, ask, reset } = useChat();
  const [text, setText] = useState("");
  const log = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Focus the input on open, except on touch screens where it would pop the keyboard over the answers.
    if (!active || window.matchMedia("(pointer: coarse)").matches) return;
    const t = window.setTimeout(() => input.current?.focus({ preventScroll: true }), 220);
    return () => window.clearTimeout(t);
  }, [active]);

  useEffect(() => {
    const el = log.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: reducedMotion() ? "auto" : "smooth" });
  }, [messages, busy]);

  // ChaeLLM blinks once each time an answer appears.
  const answers = messages.filter((m) => m.role === "assistant").length;

  const asked = new Set(messages.filter((m) => m.role === "user").map((m) => m.text));
  const lastId = messages[messages.length - 1]?.id;
  const send = (q: string) => {
    ask(q);
    setText("");
  };

  return (
    <section className="chat" aria-label="ChaeLLM">
      <header className="chat-head">
        <span className="chat-name">
          <PixelFace size={24} blink={answers} />
          {chaellm.name}
        </span>
        <span className="chat-info" tabIndex={0} aria-label={chaellm.about}>
          <InfoIcon size={14} />
          <span className="chat-tip" role="tooltip">
            {chaellm.about}
          </span>
        </span>
        <span className="chat-head-actions">
          <button className="icon-btn" onClick={reset} disabled={!messages.length} aria-label="Start a new chat" title="New chat">
            <ReplayIcon size={15} />
          </button>
          <button className="icon-btn" onClick={onClose} aria-label="Close ChaeLLM" title="Close">
            <CloseIcon />
          </button>
        </span>
      </header>

      <div className="chat-log" ref={log}>
        {messages.length === 0 ? (
          <div className="chat-empty">
            <PixelFace size={48} blink={1} className="chat-avatar" />
            <motion.p
              className="chat-hello"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease }}
            >
              {chaellm.greeting}
            </motion.p>
            <p className="chat-intro">{chaellm.intro}</p>
            <Suggestions items={chaellm.starters} onPick={send} />
          </div>
        ) : (
          <ol className="chat-msgs" aria-live="polite">
            {messages.map((m) => {
              if (m.role === "user")
                return (
                  <motion.li
                    key={m.id}
                    className="msg msg--you"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, ease }}
                  >
                    {m.text}
                  </motion.li>
                );
              const words = m.text.split(" ");
              const done = (m.shown ?? words.length) >= words.length;
              return (
                <li key={m.id} className="msg msg--ai">
                  <p>
                    {done ? m.text : words.slice(0, m.shown).join(" ")}
                    {!done && <span className="msg-caret" aria-hidden />}
                  </p>
                  {done && m.id === lastId && (
                    <Suggestions divided items={(m.follow ?? []).filter((f) => !asked.has(f)).slice(0, 3)} onPick={send} />
                  )}
                </li>
              );
            })}
            <AnimatePresence>
              {busy && (
                <motion.li
                  key="typing"
                  className="msg msg--typing"
                  aria-label="ChaeLLM is thinking"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, transition: { duration: 0.1 } }}
                >
                  <span />
                  <span />
                  <span />
                </motion.li>
              )}
            </AnimatePresence>
          </ol>
        )}
      </div>

      <form
        className="chat-form"
        onSubmit={(e) => {
          e.preventDefault();
          send(text);
        }}
      >
        <input
          ref={input}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Escape" && onClose()}
          placeholder={chaellm.placeholder}
          aria-label="Ask ChaeLLM"
          autoComplete="off"
          enterKeyHint="send"
        />
        <button type="submit" className="chat-send" disabled={!text.trim() || busy || streaming} aria-label="Send">
          <ArrowDown size={14} className="flip-y" />
        </button>
      </form>
    </section>
  );
}

/** A one-line composer at the bottom of the details panel. Sending opens chat mode with the question. */
export function ChatDock() {
  const { openChat, ask, busy, streaming } = useChat();
  const [text, setText] = useState("");
  return (
    <form
      className="chat-dock"
      onSubmit={(e) => {
        e.preventDefault();
        openChat();
        if (text.trim()) ask(text);
        setText("");
      }}
    >
      <button type="button" className="chat-dock-name pf-hover" onClick={openChat}>
        <PixelFace size={24} />
        {chaellm.name}
      </button>
      <div className="chat-form chat-form--dock">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={chaellm.placeholder}
          aria-label="Ask ChaeLLM"
          autoComplete="off"
          enterKeyHint="send"
        />
        <button type="submit" className="chat-send" disabled={!text.trim() || busy || streaming} aria-label="Ask ChaeLLM">
          <ArrowDown size={14} className="flip-y" />
        </button>
      </div>
    </form>
  );
}

/** Floating button: ✦ ChaeLLM. */
export function ChatToggle({ onClick, compact = false, ask = false }: { onClick: () => void; compact?: boolean; ask?: boolean }) {
  const { open } = useChat();
  return (
    <button
      className={`chat-toggle pf-hover${compact ? " chat-toggle--compact" : ""}${ask ? " chat-toggle--ask" : ""}`}
      aria-pressed={open}
      aria-label={compact ? "Ask ChaeLLM" : undefined}
      title={open ? "Close ChaeLLM" : "Ask ChaeLLM"}
      onClick={onClick}
    >
      <PixelFace size={24} />
      {!compact && <span>{ask ? "Ask ChaeLLM" : "ChaeLLM"}</span>}
    </button>
  );
}
