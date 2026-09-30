"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { pages, profile } from "@/content/site";
import { tippingCase } from "@/content/cases/tipping";
import { useShell } from "./shell-context";
import { useChat } from "./ChaeLLM";
import { ArrowUpRight, DocIcon, Logo, MailIcon, PageIcon, SearchIcon, SunIcon } from "./icons";
import { PixelFace } from "./PixelFace";
import { Monogram } from "./Monogram";

type Cmd = {
  id: string;
  group: string;
  title: string;
  sub?: string;
  icon: React.ReactNode;
  terms: string;
  run: () => void;
};

const groupName: Record<string, string> = {
  home: "Go to",
  work: "Selected work",
  progress: "In progress",
  fun: "For fun",
  more: "Go to",
};

export function CommandPalette() {
  const { paletteOpen, setPaletteOpen, goTo, copyEmail, settings, setSettings, openCase } = useShell();
  const { openChat } = useChat();
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);
  const input = useRef<HTMLInputElement>(null);
  const list = useRef<HTMLDivElement>(null);

  const commands = useMemo<Cmd[]>(() => {
    const dark =
      settings.theme === "dark" ||
      (settings.theme === "system" && typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches);
    return [
      ...pages.map((p) => ({
        id: `p-${p.id}`,
        group: groupName[p.group],
        title: p.title,
        sub: p.status === "soon" ? `Coming soon · ${p.tagline || p.kind}` : p.tagline || p.kind,
        icon: <PageIcon id={p.id} size={22} />,
        terms: [p.title, p.ticker ?? "", p.tagline, p.kind, ...p.keywords].join(" "),
        run: () => goTo(p.id),
      })),
      {
        id: "case-tipping",
        group: "Actions",
        title: "Read the Rethinking Tipping case study",
        sub: `${tippingCase.title} · ${tippingCase.readingTime} read`,
        icon: <PageIcon id="tipping" size={22} />,
        terms: "case study tipping read full process research testing",
        run: () => openCase("tipping"),
      },
      {
        id: "chaellm",
        group: "Actions",
        title: "Ask ChaeLLM",
        sub: "Chat with an AI version of Chaewon",
        icon: <PixelFace size={24} />,
        terms: "chat ai llm ask question chaellm bot assistant",
        run: openChat,
      },
      {
        id: "email",
        group: "Actions",
        title: "Copy email",
        sub: profile.email,
        icon: <MailIcon size={18} />,
        terms: "email contact mail reach hire",
        run: copyEmail,
      },
      {
        id: "resume",
        group: "Actions",
        title: "Open resume",
        icon: <DocIcon size={18} />,
        terms: "resume cv experience",
        run: () => window.open(profile.links.resume, "_blank", "noopener"),
      },
      {
        id: "linkedin",
        group: "Actions",
        title: "Open LinkedIn",
        icon: <ArrowUpRight size={18} />,
        terms: "linkedin profile social",
        run: () => window.open(profile.links.linkedin, "_blank", "noopener"),
      },
      {
        id: "intro",
        group: "Actions",
        title: "Replay the intro",
        sub: "The loading screen slow connections see",
        icon: <Monogram size={20} />,
        terms: "intro loader loading screen replay monogram splash",
        run: () => {
          // Let the palette close first, then run the loader from lib/boot.ts
          window.setTimeout(() => (window as unknown as { cwIntro?: () => void }).cwIntro?.(), 180);
        },
      },
      {
        id: "theme",
        group: "Actions",
        title: dark ? "Switch to light mode" : "Switch to dark mode",
        icon: <SunIcon size={18} />,
        terms: "theme dark light mode appearance",
        run: () => setSettings({ theme: dark ? "light" : "dark" }),
      },
    ];
  }, [goTo, copyEmail, settings.theme, setSettings, openChat, openCase]);

  const results = useMemo(() => {
    const tokens = q.toLowerCase().trim().split(/\s+/).filter(Boolean);
    if (!tokens.length) return commands;
    return commands
      .map((c, i) => {
        const title = c.title.toLowerCase();
        const hay = `${title} ${(c.sub ?? "").toLowerCase()} ${c.terms.toLowerCase()}`;
        if (!tokens.every((t) => hay.includes(t))) return null;
        const score = tokens.reduce((s, t) => s + (title.startsWith(t) ? 3 : title.includes(t) ? 2 : 1), 0);
        return { c, score, i };
      })
      .filter((x): x is { c: Cmd; score: number; i: number } => !!x)
      .sort((a, b) => b.score - a.score || a.i - b.i)
      .map((x) => x.c);
  }, [q, commands]);

  // Group while keeping the ranked order of first appearance.
  const grouped = useMemo(() => {
    const order: string[] = [];
    const map = new Map<string, Cmd[]>();
    for (const r of results) {
      if (!map.has(r.group)) {
        map.set(r.group, []);
        order.push(r.group);
      }
      map.get(r.group)!.push(r);
    }
    return order.map((g) => ({ group: g, items: map.get(g)! }));
  }, [results]);
  const flat = grouped.flatMap((g) => g.items);

  useEffect(() => {
    if (paletteOpen) {
      setQ("");
      setActive(0);
      requestAnimationFrame(() => input.current?.focus());
    }
  }, [paletteOpen]);

  useEffect(() => setActive(0), [q]);

  useEffect(() => {
    list.current?.querySelector<HTMLElement>(`[data-index="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [active]);

  const run = (c?: Cmd) => {
    if (!c) return;
    setPaletteOpen(false);
    c.run();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => (flat.length ? (a + 1) % flat.length : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => (flat.length ? (a - 1 + flat.length) % flat.length : 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      run(flat[active]);
    } else if (e.key === "Escape") {
      e.preventDefault();
      setPaletteOpen(false);
    }
  };

  let index = -1;

  return (
    <AnimatePresence>
      {paletteOpen && (
        <>
          <motion.div
            key="scrim"
            className="scrim scrim--palette"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={() => setPaletteOpen(false)}
          />
          <div className="palette-wrap" key="wrap">
            <motion.div
              className="palette"
              role="dialog"
              aria-modal="true"
              aria-label="Search"
              initial={{ opacity: 0, scale: 0.98, y: -6 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.985, y: -4, transition: { duration: 0.12 } }}
              transition={{ duration: 0.18, ease: [0.3, 0.7, 0.2, 1] }}
              onKeyDown={onKeyDown}
            >
              <div className="palette-input-row">
                <SearchIcon className="palette-search-icon" />
                <input
                  ref={input}
                  id="palette-input"
                  className="palette-input"
                  placeholder="Try “fintech”, “AI”, or “research”"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  role="combobox"
                  aria-expanded="true"
                  aria-controls="palette-list"
                  aria-activedescendant={flat[active] ? `cmd-${flat[active].id}` : undefined}
                  autoComplete="off"
                  spellCheck={false}
                />
                <kbd className="kbd">esc</kbd>
              </div>
              <div className="palette-list" id="palette-list" role="listbox" ref={list}>
                {grouped.map((g) => (
                  <div key={g.group} role="group" aria-label={g.group}>
                    <div className="palette-group">{g.group}</div>
                    {g.items.map((c) => {
                      index += 1;
                      const i = index;
                      return (
                        <div
                          key={c.id}
                          id={`cmd-${c.id}`}
                          role="option"
                          aria-selected={i === active}
                          data-index={i}
                          data-active={i === active || undefined}
                          className="palette-item"
                          onMouseMove={() => active !== i && setActive(i)}
                          onClick={() => run(c)}
                        >
                          <span className="palette-item-icon">{c.icon}</span>
                          <span className="palette-item-text">
                            <span className="palette-item-title">{c.title}</span>
                            {c.sub && <span className="palette-item-sub">{c.sub}</span>}
                          </span>
                          {i === active && <span className="palette-enter" aria-hidden>↵</span>}
                        </div>
                      );
                    })}
                  </div>
                ))}
                {!flat.length && (
                  <div className="palette-empty">
                    <Logo size={22} />
                    <p>
                      Nothing for “{q}” yet. Try <b>fintech</b>, <b>B2B</b>, <b>AI</b>, or <b>baking</b>, or{" "}
                      <button
                        onClick={() => {
                          setPaletteOpen(false);
                          copyEmail();
                        }}
                      >
                        copy my email
                      </button>{" "}
                      and ask me directly.
                    </p>
                  </div>
                )}
              </div>
              <div className="palette-foot" aria-hidden>
                <span>
                  <kbd className="kbd kbd--sm">↑</kbd>
                  <kbd className="kbd kbd--sm">↓</kbd> move
                </span>
                <span>
                  <kbd className="kbd kbd--sm">↵</kbd> open
                </span>
                <span className="palette-foot-right">
                  Tip: <kbd className="kbd kbd--sm">↑</kbd>
                  <kbd className="kbd kbd--sm">↓</kbd> flip pages anywhere
                </span>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
