"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { MotionConfig } from "motion/react";
import { pages, profile, type PageId } from "@/content/site";
import { isCaseId, longHash, type LongId } from "@/content/cases";

type Theme = "system" | "light" | "dark";
type MotionPref = "system" | "reduced";
type Settings = { theme: Theme; motion: MotionPref };

type ShellState = {
  /** The page currently on screen (driven by scroll). */
  current: PageId;
  setCurrent: (id: PageId) => void;
  /** Scroll the deck to a page. */
  goTo: (id: PageId, smooth?: boolean) => void;
  step: (dir: 1 | -1) => void;
  registerScroller: (el: HTMLElement | null) => void;
  detailsOpen: boolean;
  setDetailsOpen: (open: boolean) => void;
  paletteOpen: boolean;
  setPaletteOpen: (open: boolean) => void;
  navOpen: boolean;
  setNavOpen: (open: boolean) => void;
  settings: Settings;
  setSettings: (s: Partial<Settings>) => void;
  toast: string | null;
  notify: (msg: string) => void;
  copyEmail: () => void;
  /** A full-page case study or the About page (sidebars hidden), or null for the deck.
   *  Deep links: /#case/tipping, /#about/story */
  caseStudy: LongId | null;
  openCase: (id: LongId) => void;
  /** Leave the case study for a page in the deck (defaults to the project's own page). */
  closeCase: (to?: PageId) => void;
};

const Ctx = createContext<ShellState | null>(null);

export function useShell() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useShell must be used inside <ShellProvider>");
  return ctx;
}

const ids = pages.map((p) => p.id);
const isPage = (s: string): s is PageId => (ids as string[]).includes(s);
/** "#case/tipping" → "tipping", "#about/story" → "about" */
const caseFromHash = (h: string): LongId | null => {
  if (/^#?about\/story$/.test(h)) return "about";
  const m = /^#?case\/([a-z-]+)$/.exec(h);
  return m && isCaseId(m[1]) ? m[1] : null;
};

export function reducedMotion() {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(prefers-reduced-motion: reduce)").matches || document.documentElement.dataset.motion === "reduced"
  );
}

export function ShellProvider({ children }: { children: React.ReactNode }) {
  const [current, setCurrentState] = useState<PageId>("home");
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const [settings, setSettingsState] = useState<Settings>({ theme: "system", motion: "system" });
  const [toast, setToast] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const toastTimer = useRef<number | undefined>(undefined);
  const scroller = useRef<HTMLElement | null>(null);
  const [caseStudy, setCaseStudy] = useState<LongId | null>(null);
  const caseRef = useRef<LongId | null>(null);
  caseRef.current = caseStudy;
  const pendingPage = useRef<PageId | null>(null);

  const registerScroller = useCallback((el: HTMLElement | null) => {
    scroller.current = el;
  }, []);

  const goTo = useCallback((id: PageId, smooth = true) => {
    const el = document.getElementById(`page-${id}`);
    if (!el) return;
    const behavior: ScrollBehavior = smooth && !reducedMotion() ? "smooth" : "auto";
    const sc = scroller.current;
    // On phones the page itself scrolls; on larger screens the canvas does.
    if (sc && sc.scrollHeight > sc.clientHeight + 1 && getComputedStyle(sc).overflowY !== "visible") {
      sc.scrollTo({ top: el.offsetTop, behavior });
    } else {
      el.scrollIntoView({ behavior, block: "start" });
    }
    setNavOpen(false);
  }, []);

  const setCurrent = useCallback((id: PageId) => setCurrentState(id), []);

  const step = useCallback(
    (dir: 1 | -1) => {
      const i = ids.indexOf(current);
      const next = ids[Math.min(ids.length - 1, Math.max(0, i + dir))];
      goTo(next);
    },
    [current, goTo]
  );

  // Deep links: /#pebbo opens straight onto that page.
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("cw-settings") || "{}");
      setSettingsState((s) => ({ ...s, ...saved }));
    } catch {}
    const h = window.location.hash.slice(1);
    const c = caseFromHash(h);
    if (c) setCaseStudy(c);
    else {
      delete document.documentElement.dataset.booting;
      if (isPage(h) && h !== "home") requestAnimationFrame(() => goTo(h, false));
    }
    setReady(true);
  }, [goTo]);

  // Browser back/forward between the deck and a case study.
  useEffect(() => {
    const sync = () => {
      const h = window.location.hash;
      const c = caseFromHash(h);
      if (c) {
        setCaseStudy(c);
      } else if (caseRef.current) {
        const id = h.slice(1);
        pendingPage.current = isPage(id) ? id : caseRef.current;
        setCaseStudy(null);
      }
    };
    window.addEventListener("popstate", sync);
    window.addEventListener("hashchange", sync);
    return () => {
      window.removeEventListener("popstate", sync);
      window.removeEventListener("hashchange", sync);
    };
  }, []);

  // Back in the deck after a case study: land on the page we came back to, without the ride.
  useEffect(() => {
    if (caseStudy) {
      delete document.documentElement.dataset.booting;
      return;
    }
    const id = pendingPage.current;
    if (!id) return;
    pendingPage.current = null;
    requestAnimationFrame(() => requestAnimationFrame(() => goTo(id, false)));
  }, [caseStudy, goTo]);

  const openCase = useCallback((id: LongId) => {
    setCaseStudy(id);
    setPaletteOpen(false);
    setDetailsOpen(false);
    setNavOpen(false);
    try {
      window.history.pushState(null, "", longHash(id));
    } catch {}
  }, []);

  const closeCase = useCallback((to?: PageId) => {
    const id = to ?? caseRef.current ?? "home";
    pendingPage.current = id;
    setCaseStudy(null);
    try {
      window.history.pushState(null, "", id === "home" ? window.location.pathname + window.location.search : `#${id}`);
    } catch {}
  }, []);

  useEffect(() => {
    if (!ready || caseStudy) return;
    try {
      const url = current === "home" ? window.location.pathname + window.location.search : `#${current}`;
      window.history.replaceState(null, "", url);
    } catch {}
  }, [current, ready, caseStudy]);

  useEffect(() => {
    if (!ready) return;
    const d = document.documentElement;
    if (settings.theme === "system") delete d.dataset.theme;
    else d.dataset.theme = settings.theme;
    if (settings.motion === "reduced") d.dataset.motion = "reduced";
    else delete d.dataset.motion;
    try {
      localStorage.setItem("cw-settings", JSON.stringify(settings));
    } catch {}
  }, [settings, ready]);

  const setSettings = useCallback((s: Partial<Settings>) => setSettingsState((prev) => ({ ...prev, ...s })), []);

  const notify = useCallback((msg: string) => {
    setToast(msg);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 2400);
  }, []);

  const copyEmail = useCallback(() => {
    const done = () => notify(`Copied ${profile.email}`);
    try {
      navigator.clipboard.writeText(profile.email).then(done, () => notify(profile.email));
    } catch {
      notify(profile.email);
    }
  }, [notify]);

  // Keyboard: ⌘K or / search, ↑↓ / j k flip pages, 1–4 jump to work, Esc closes things.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (caseRef.current) return; // the case study page scrolls like a normal page
      const t = e.target as HTMLElement | null;
      const typing = !!t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable);
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((o) => !o);
        return;
      }
      if (typing || e.metaKey || e.ctrlKey || e.altKey || paletteOpen) return;
      if (e.key === "/") {
        e.preventDefault();
        setPaletteOpen(true);
      } else if (e.key === "Escape") {
        if (navOpen) setNavOpen(false);
        else if (detailsOpen) setDetailsOpen(false);
      } else if (e.key === "ArrowDown" || e.key === "PageDown" || e.key === "j") {
        e.preventDefault();
        step(1);
      } else if (e.key === "ArrowUp" || e.key === "PageUp" || e.key === "k") {
        e.preventDefault();
        step(-1);
      } else if (e.key === "Home" || e.key === "h") {
        goTo("home");
      } else if (e.key === "a") {
        goTo("about");
      } else {
        const n = Number(e.key);
        const work = pages.filter((p) => p.group === "work" || p.group === "progress");
        if (n >= 1 && n <= work.length) goTo(work[n - 1].id);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [paletteOpen, navOpen, detailsOpen, step, goTo]);

  const value = useMemo<ShellState>(
    () => ({
      current,
      setCurrent,
      goTo,
      step,
      registerScroller,
      detailsOpen,
      setDetailsOpen,
      paletteOpen,
      setPaletteOpen,
      navOpen,
      setNavOpen,
      settings,
      setSettings,
      toast,
      notify,
      copyEmail,
      caseStudy,
      openCase,
      closeCase,
    }),
    [current, setCurrent, goTo, step, registerScroller, detailsOpen, paletteOpen, navOpen, settings, setSettings, toast, notify, copyEmail, caseStudy, openCase, closeCase]
  );

  return (
    <Ctx.Provider value={value}>
      <MotionConfig reducedMotion={settings.motion === "reduced" ? "always" : "user"}>{children}</MotionConfig>
    </Ctx.Provider>
  );
}
