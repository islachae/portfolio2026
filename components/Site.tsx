"use client";

import { useEffect } from "react";

import { App } from "./App";
import { CasePage } from "./case/CasePage";
import { useShell } from "./shell-context";
import { Toast } from "./Chrome";
import { ImageMarks } from "./ImageMarks";

/** The deck (three panes), or a full-page case study with the side panels out of the way. */
export function Site() {
  const { caseStudy } = useShell();
  // Safety net for the deferred stylesheet (lib/boot.ts): if the boot script couldn't switch it on,
  // do it once the app is running, so the page can never stay unstyled or hidden.
  useEffect(() => {
    document.querySelectorAll<HTMLLinkElement>("link[data-cw-css]").forEach((l) => {
      if (l.media !== "all") l.media = "all";
    });
    document.documentElement.removeAttribute("data-cssw");
  }, []);
  // The toast sits outside both, so “Copy email” answers on the case and About pages too
  return (
    <>
      {caseStudy ? <CasePage id={caseStudy} /> : <App />}
      <Toast />
      <ImageMarks />
    </>
  );
}
