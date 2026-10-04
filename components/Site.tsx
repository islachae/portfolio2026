"use client";

import { useCallback, useEffect, useState } from "react";

import { Home } from "./home/Home";
import { ChatDrawer } from "./home/ChatDrawer";
import { PhoneMenu, type NavPlace } from "./home/Nav";
import { loadPlay, playLoaded } from "./home/play-load";
import { caseLoaded, loadCase } from "./case/load";
import { useShell } from "./shell-context";
import { CommandPalette } from "./CommandPalette";
import { Toast } from "./Chrome";
import { ImageMarks } from "./ImageMarks";
import { whenQuiet } from "@/lib/quiet";

type CaseComponent = typeof import("./case/CasePage").CasePage;
type PlayComponent = typeof import("./home/PlayPage").PlayPage;
type RunnerComponent = typeof import("./home/Runner").Runner;

const typing = (t: EventTarget | null) =>
  t instanceof HTMLElement && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.tagName === "SELECT" || t.isContentEditable);

/**
 * Home, and over it whichever page is open: a case study, About, or a play page. Home stays
 * where it was underneath (hidden, not scrolled), so “Back” lands exactly where the visitor left.
 */
export function Site() {
  const { caseStudy, play, goHome } = useShell();
  // The long reads and the play pages are their own chunks (components/case/load.ts,
  // components/home/play-load.ts). Until one is here Home stays on screen (or, on a link
  // straight to a long read, the outline from lib/boot.ts).
  const [Case, setCase] = useState<CaseComponent | null>(() => caseLoaded()?.CasePage ?? null);
  const [Play, setPlay] = useState<PlayComponent | null>(() => playLoaded()?.PlayPage ?? null);
  // Safety net for the deferred stylesheet (lib/boot.ts): if the boot script couldn't switch it on,
  // do it once the app is running, so the page can never stay unstyled or hidden.
  useEffect(() => {
    document.querySelectorAll<HTMLLinkElement>("link[data-cw-css]").forEach((l) => {
      if (l.media !== "all") l.media = "all";
    });
    document.documentElement.removeAttribute("data-cssw");
  }, []);
  // Asked for: fetch it now. Otherwise: in a quiet moment once the page has settled, so a click on
  // a card finds it already here.
  useEffect(() => {
    if (Case) return;
    let live = true;
    const get = () =>
      loadCase().then(
        (m) => live && setCase(() => m.CasePage),
        () => {
          // couldn't fetch it: back to Home instead of an outline that never fills in
          if (!live || !caseStudy) return;
          delete document.documentElement.dataset.booting;
          goHome();
        },
      );
    if (caseStudy) {
      get();
      return () => {
        live = false;
      };
    }
    // (not for someone who has asked their browser to save data: then it waits to be asked for)
    const saver = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
    const cancel = saver ? () => {} : whenQuiet(get, { after: 2500 });
    return () => {
      live = false;
      cancel();
    };
  }, [Case, caseStudy, goHome]);
  // The play pages: only when one is opened (a card warms it up on hover: Home.tsx)
  useEffect(() => {
    if (Play || !play) return;
    let live = true;
    loadPlay().then(
      (m) => live && setPlay(() => m.PlayPage),
      () => live && goHome(),
    );
    return () => {
      live = false;
    };
  }, [Play, play, goHome]);

  // The surprise the last line of Home promises: P and Space held together start ChaeLLM's run
  // (components/home/Runner.tsx, fetched only now). Not while someone is typing.
  const [Run, setRun] = useState<RunnerComponent | null>(null);
  const [running, setRunning] = useState(false);
  const stopRun = useCallback(() => setRunning(false), []);
  useEffect(() => {
    const held = new Set<string>();
    const down = (e: KeyboardEvent) => {
      if (e.code !== "KeyP" && e.code !== "Space") return;
      if (e.metaKey || e.ctrlKey || e.altKey || typing(e.target)) return;
      held.add(e.code);
      if (held.size < 2) return;
      e.preventDefault(); // (Space would scroll the page)
      setRunning(true);
      import("./home/Runner").then(
        (m) => setRun(() => m.Runner),
        () => setRunning(false),
      );
    };
    const up = (e: KeyboardEvent) => held.delete(e.code);
    const clear = () => held.clear();
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    window.addEventListener("blur", clear);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("blur", clear);
    };
  }, []);

  const caseOpen = caseStudy !== null && Case !== null;
  const playOpen = play !== null && Play !== null;
  // The outline of a link straight to a long read goes once the page itself is on screen
  useEffect(() => {
    if (caseOpen) delete document.documentElement.dataset.booting;
  }, [caseOpen]);

  const at: NavPlace = caseStudy === "about" ? "about" : play ? "play" : "work";
  // ChaeLLM, search, the phone menu and the toast sit outside the pages, so they answer on all of them
  return (
    <>
      <Home hidden={caseOpen || playOpen} />
      {caseOpen && <Case id={caseStudy} />}
      {playOpen && <Play id={play} />}
      <PhoneMenu at={at} />
      <ChatDrawer />
      <CommandPalette />
      <Toast />
      <ImageMarks />
      {running && Run && <Run onClose={stopRun} />}
    </>
  );
}
