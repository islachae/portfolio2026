import { tippingCase } from "./tipping";
import { pebboCase } from "./pebbo";
import { melonCase } from "./melon";

/** Every project with a full case study. The key is the page id and the #case/<id> route. */
export const caseStudies = { tipping: tippingCase, pebbo: pebboCase, melon: melonCase } as const;
export type CaseId = keyof typeof caseStudies;
export const isCaseId = (s: string): s is CaseId => s in caseStudies;

/** Long reads that open over the deck: the case studies, plus the About page (/#about/story). */
export type LongId = CaseId | "about";
export const longHash = (id: LongId) => (id === "about" ? "#about/story" : `#case/${id}`);
