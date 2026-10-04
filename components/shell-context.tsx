"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { MotionConfig } from "motion/react";
import { pageById, pages, profile, type PageId } from "@/content/site";
import { isCaseId, longHash, type LongId } from "@/content/cases/ids";
import { isHomeSection, isPlayId, playHash, type HomeSection, type PlayId } from "@/content/routes";

type Theme = "system" | "light" | "dark";
type MotionPref = "system" | "reduced";
type Settings = { theme: Theme; motion: MotionPref };

type ShellState = {
  /** The page on screen: "home", or the project whose case study / play page is open. */
  current: PageId;
  setCurrent: (id: PageId) => void;
  /** Go to a page: Home, a case study, a play page, About. */
  goTo: (id: PageId, smooth?: boolean) => void;
  /** Home, optionally at one of its sections (the cards, the play row, the note at the end). */
  goHome: (section?: HomeSection | "top") => void;
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
  /** A full-page case study or the About page, over Home; null when none is open.
   *  Deep links: /#case/tipping, /#about/story */
  caseStudy: LongId | null;
  openCase: (id: LongId) => void;
  /** Leave the case study: back to Home where it was left, or on to another page. */
  closeCase: (to?: PageId) => void;
  /** A play page, over Home (/#play/wish); null when none is open. */
  play: PlayId | null;
  openPlay: (id: PlayId) => void;
};

const Ctx = createContext<ShellState | null>(null);

export function useShell() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useShell must be used inside <ShellProvider>");
  return ctx;
}

const ids = pages.map((p) => p.id);
const isPage = (s: string): s is PageId => (ids as string[]).includes(s);

/** A play page that can be opened (one marked “soon” in content/site.ts can't: its card says so). */
const playIsOpen = (id: string): id is PlayId => isPlayId(id) && pageById[id].status !== "soon";

type Route = { caseStudy: LongId | null; play: PlayId | null; section: HomeSection | null };
const HOME: Route = { caseStudy: null, play: null, section: null };
/**
 * What a hash means. "#case/tipping", "#about/story", "#play/wish", "#work" / "#play" / "#hi"
 * (a place on Home). The old deck's links still work: "#pebbo" opens the Pebbo case study,
 * "#wish" its play page, "#about" the About page, "#zipflow" the cards, "#hi" the note at the end.
 * A play page that isn't open yet ("#play/lab", "#lab") lands on the play cards instead.
 */
function routeFromHash(hash: string): Route {
  const h = hash.replace(/^#/, "");
  if (/^about(\/story)?$/.test(h)) return { ...HOME, caseStudy: "about" };
  const c = /^case\/([a-z-]+)$/.exec(h);
  if (c) return isCaseId(c[1]) ? { ...HOME, caseStudy: c[1] } : HOME;
  const p = /^play\/([a-z-]+)$/.exec(h);
  if (p) return playIsOpen(p[1]) ? { ...HOME, play: p[1] } : { ...HOME, section: "play" };
  if (isCaseId(h)) return { ...HOME, caseStudy: h };
  if (isPlayId(h)) return playIsOpen(h) ? { ...HOME, play: h } : { ...HOME, section: "play" };
  if (h === "zipflow") return { ...HOME, section: "work" };
  if (isHomeSection(h)) return { ...HOME, section: h };
  return HOME;
}
const homeUrl = () => window.location.pathname + window.location.search;

export function reducedMotion() {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(prefers-reduced-motion: reduce)").matches || document.documentElement.dataset.motion === "reduced"
  );
}

export function ShellProvider({ children }: { children: React.ReactNode }) {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const [settings, setSettingsState] = useState<Settings>({ theme: "system", motion: "system" });
  const [toast, setToast] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const toastTimer = useRef<number | undefined>(undefined);
  const [caseStudy, setCaseStudy] = useState<LongId | null>(null);
  const [play, setPlay] = useState<PlayId | null>(null);
  // Where on Home to land once it is the page on screen again (the scroll itself: the effect below)
  const pendingSection = useRef<{ to: HomeSection | "top"; smooth: boolean } | null>(null);
  const [landing, setLanding] = useState(0);
  const over = caseStudy !== null || play !== null;
  const overRef = useRef(false);
  overRef.current = over;

  const show = useCallback((r: Route) => {
    setCaseStudy(r.caseStudy);
    setPlay(r.play);
    setPaletteOpen(false);
    setDetailsOpen(false);
    setNavOpen(false);
  }, []);

  const land = useCallback((to: HomeSection | "top" | null, smooth: boolean) => {
    if (!to) return;
    pendingSection.current = { to, smooth };
    setLanding((n) => n + 1);
  }, []);

  // Saved settings, and the page the link asks for.
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("cw-settings") || "{}");
      // Same settings: keep the same object, so nothing re-renders.
      setSettingsState((s) => {
        const next = { ...s, ...saved };
        return next.theme === s.theme && next.motion === s.motion ? s : next;
      });
    } catch {}
    const r = routeFromHash(window.location.hash);
    show(r);
    // (the outline of a link straight to a long read goes when the page is on screen: Site.tsx)
    if (!r.caseStudy) delete document.documentElement.dataset.booting;
    // An old deck link: the address bar gets the page's own address
    try {
      const want = r.caseStudy ? longHash(r.caseStudy) : r.play ? playHash(r.play) : r.section ? `#${r.section}` : "";
      if (want !== window.location.hash) window.history.replaceState(null, "", want || homeUrl());
    } catch {}
    land(r.section, false);
    setReady(true);
  }, [show, land]);

  // Browser back/forward, and links typed into the address bar.
  useEffect(() => {
    const sync = () => {
      const r = routeFromHash(window.location.hash);
      show(r);
      land(r.section, false);
    };
    window.addEventListener("popstate", sync);
    window.addEventListener("hashchange", sync);
    return () => {
      window.removeEventListener("popstate", sync);
      window.removeEventListener("hashchange", sync);
    };
  }, [show, land]);

  // Home keeps its place under a case study or a play page: while one is open the page itself
  // doesn't scroll, so "Back" lands exactly where the visitor left.
  useEffect(() => {
    const d = document.documentElement;
    if (over) d.dataset.over = "";
    else delete d.dataset.over;
  }, [over]);

  // Landing on a section of Home, once Home is the page on screen. (The wish is only taken when
  // the scroll actually happens: this effect can run again before the frame it waits for.)
  useEffect(() => {
    if (over || !pendingSection.current) return;
    const run = () => {
      const want = pendingSection.current;
      if (!want) return;
      pendingSection.current = null;
      const behavior: ScrollBehavior = want.smooth && !reducedMotion() ? "smooth" : "auto";
      if (want.to === "top") return window.scrollTo({ top: 0, behavior });
      document.getElementById(want.to)?.scrollIntoView({ behavior, block: "start" });
    };
    const r = requestAnimationFrame(() => requestAnimationFrame(run));
    return () => cancelAnimationFrame(r);
  }, [over, landing]);

  const push = (url: string) => {
    try {
      if (url !== window.location.hash && !(url === homeUrl() && !window.location.hash)) window.history.pushState(null, "", url);
    } catch {}
  };

  const openCase = useCallback(
    (id: LongId) => {
      show({ ...HOME, caseStudy: id });
      push(longHash(id));
    },
    [show],
  );

  const openPlay = useCallback(
    (id: PlayId) => {
      show({ ...HOME, play: id });
      push(playHash(id));
    },
    [show],
  );

  const goHome = useCallback(
    (section?: HomeSection | "top") => {
      const was = overRef.current;
      show(HOME);
      push(homeUrl());
      // from another page: simply there; already on Home: a ride to it
      if (section) land(section, !was);
    },
    [show, land],
  );

  const goTo = useCallback(
    (id: PageId) => {
      if (id === "home") goHome("top");
      else if (id === "about") openCase("about");
      else if (isCaseId(id)) openCase(id);
      else if (playIsOpen(id)) openPlay(id);
      else if (isPlayId(id)) goHome("play"); // not open yet (“Coming soon”): its card
      else if (id === "hi") goHome("hi");
      else goHome("work"); // a project without a page of its own yet (ZipFlow): its card
    },
    [goHome, openCase, openPlay],
  );

  // “Back” (no page given, or the project itself): Home, where it was left. “All work”: the cards.
  // Another project: straight to its page.
  const closeCase = useCallback(
    (to?: PageId) => {
      if (!to || to === caseStudy) goHome();
      else if (to === "home") goHome("work");
      else goTo(to);
    },
    [caseStudy, goHome, goTo],
  );

  const current: PageId = caseStudy ?? play ?? "home";
  // (the old deck drove these; nothing scrolls a deck any more)
  const setCurrent = useCallback(() => {}, []);
  const step = useCallback(() => {}, []);
  const registerScroller = useCallback(() => {}, []);

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

  // Keyboard: ⌘K or / opens search, Esc closes the menu.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
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
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [paletteOpen, navOpen, detailsOpen]);

  const value = useMemo<ShellState>(
    () => ({
      current,
      setCurrent,
      goTo,
      goHome,
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
      play,
      openPlay,
    }),
    [current, setCurrent, goTo, goHome, step, registerScroller, detailsOpen, paletteOpen, navOpen, settings, setSettings, toast, notify, copyEmail, caseStudy, openCase, closeCase, play, openPlay],
  );

  return (
    <Ctx.Provider value={value}>
      <MotionConfig reducedMotion={settings.motion === "reduced" ? "always" : "user"}>{children}</MotionConfig>
    </Ctx.Provider>
  );
}
