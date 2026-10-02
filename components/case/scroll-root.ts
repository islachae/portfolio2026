"use client";

import { createContext, useContext } from "react";

/** The element the case study scrolls in (the IntersectionObserver root for reveals); null in the
 *  deck. Its own module so the shared pieces (kit.tsx, used by the deck's Pebbo phone too) don't
 *  pull the case studies themselves into the first load. */
export const ScrollRoot = createContext<HTMLElement | null>(null);
export const useScrollRoot = () => useContext(ScrollRoot);
