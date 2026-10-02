"use client";

import { useEffect } from "react";

/**
 * Skeletons for images, without touching every <img>: this marks each image's load state and
 * CSS does the rest (“Skeletons” in globals.css).
 *   data-ld="0"  still loading → the skeleton shows (warm grey for photos, a sheen for screens)
 *   data-ld="1"  loaded → the skeleton is gone
 *   data-anim    it arrived while you were looking → photos develop, screens ink in, once
 *   data-vis     "0" while a still-loading image is off screen → its sheen holds still (the sheen
 *                moves a background, which costs the main thread on every frame, seen or not)
 * Images that were already there when the page woke up get data-ld="1" with no animation.
 * Before this runs (the first seconds on a slow phone), the CSS shows the skeleton on its own.
 */
export function ImageMarks() {
  useEffect(() => {
    const io =
      typeof IntersectionObserver === "undefined"
        ? null
        : new IntersectionObserver((list) => {
            for (const en of list) (en.target as HTMLElement).dataset.vis = en.isIntersecting ? "1" : "0";
          });
    const settle = (img: HTMLImageElement) => {
      io?.unobserve(img);
      delete img.dataset.vis;
    };
    const done = (img: HTMLImageElement, animate: boolean) => {
      settle(img);
      img.dataset.ld = "1";
      if (!animate) return;
      img.dataset.anim = "";
      window.setTimeout(() => delete img.dataset.anim, 1000);
    };
    const mark = (img: HTMLImageElement) => {
      if (img.dataset.ld) return;
      if (img.complete && img.naturalWidth > 0) {
        img.dataset.ld = "1";
        return;
      }
      img.dataset.ld = "0";
      io?.observe(img);
      img.addEventListener("load", () => done(img, true), { once: true });
      // A broken image keeps a quiet grey box instead of a shimmer that never ends
      img.addEventListener(
        "error",
        () => {
          settle(img);
          img.dataset.ld = "x";
        },
        { once: true },
      );
    };
    const scan = (root: ParentNode) => root.querySelectorAll("img").forEach(mark);
    scan(document);
    const mo = new MutationObserver((list) => {
      for (const m of list)
        m.addedNodes.forEach((n) => {
          if (n instanceof HTMLImageElement) mark(n);
          else if (n instanceof Element) scan(n);
        });
    });
    mo.observe(document.body, { childList: true, subtree: true });
    return () => {
      mo.disconnect();
      io?.disconnect();
    };
  }, []);
  return null;
}
