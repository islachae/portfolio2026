"use client";

import { useEffect, useState } from "react";

import { App } from "./App";
import { caseLoaded, loadCase } from "./case/load";
import { useShell } from "./shell-context";
import { Toast } from "./Chrome";
import { ImageMarks } from "./ImageMarks";
import { whenQuiet } from "@/lib/quiet";

type CaseComponent = typeof import("./case/CasePage").CasePage;

/** The deck (three panes), or a full-page case study with the side panels out of the way. */
export function Site() {
  const { caseStudy, closeCase } = useShell();
  // The long reads are their own chunk (components/case/load.ts). Until it's here the deck stays
  // on screen (or, on a link straight to one, the outline from lib/boot.ts).
  const [Case, setCase] = useState<CaseComponent | null>(() => caseLoaded()?.CasePage ?? null);
  // Safety net for the deferred stylesheet (lib/boot.ts): if the boot script couldn't switch it on,
  // do it once the app is running, so the page can never stay unstyled or hidden.
  useEffect(() => {
    document.querySelectorAll<HTMLLinkElement>("link[data-cw-css]").forEach((l) => {
      if (l.media !== "all") l.media = "all";
    });
    document.documentElement.removeAttribute("data-cssw");
  }, []);
  // Asked for: fetch it now. Otherwise: in a quiet moment once the page has settled, so a click on
  // “Read case study” finds it already here.
  useEffect(() => {
    if (Case) return;
    let live = true;
    const get = () =>
      loadCase().then(
        (m) => live && setCase(() => m.CasePage),
        () => {
          // couldn't fetch it: back to the deck instead of an outline that never fills in
          if (!live || !caseStudy) return;
          delete document.documentElement.dataset.booting;
          closeCase();
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
  }, [Case, caseStudy, closeCase]);
  const open = caseStudy !== null && Case !== null;
  // The outline of a link straight to a long read goes once the page itself is on screen
  useEffect(() => {
    if (open) delete document.documentElement.dataset.booting;
  }, [open]);
  // The toast sits outside both, so “Copy email” answers on the case and About pages too
  return (
    <>
      {caseStudy !== null && Case !== null ? <Case id={caseStudy} /> : <App />}
      <Toast />
      <ImageMarks />
    </>
  );
}
