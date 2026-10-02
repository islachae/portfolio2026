/** Which projects have a full case study, and the routes of the long reads. Kept apart from the
 *  case studies' content (./index.ts), so the deck can ask "is this a case study?" without
 *  carrying all of them: the long reads load as their own chunk (components/case/load.ts). */
export const CASE_IDS = ["tipping", "pebbo", "melon"] as const;
/** The page id, and the #case/<id> route. */
export type CaseId = (typeof CASE_IDS)[number];
export const isCaseId = (s: string): s is CaseId => (CASE_IDS as readonly string[]).includes(s);

/** Long reads that open over the deck: the case studies, plus the About page (/#about/story). */
export type LongId = CaseId | "about";
export const longHash = (id: LongId) => (id === "about" ? "#about/story" : `#case/${id}`);
