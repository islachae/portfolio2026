import { tippingCase } from "./tipping";
import { pebboCase } from "./pebbo";
import { melonCase } from "./melon";
import type { CaseId } from "./ids";

export { isCaseId, longHash, type CaseId, type LongId } from "./ids";

/** Every project with a full case study. The key is the page id and the #case/<id> route
 *  (the ids themselves live in ./ids.ts). */
export const caseStudies = { tipping: tippingCase, pebbo: pebboCase, melon: melonCase } as const satisfies Record<CaseId, unknown>;
