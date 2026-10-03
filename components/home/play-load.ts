/**
 * The play pages (the word bar, the wish tree, the bakery log, the interaction lab) are their
 * own chunk, like the long reads (components/case/load.ts): Home shows them as cards and only
 * fetches the real thing when a card is hovered, focused or opened.
 */
type Mod = typeof import("./PlayPage");

let mod: Mod | null = null;
let pending: Promise<Mod> | null = null;

/** The module, if it has arrived. */
export const playLoaded = () => mod;

export function loadPlay(): Promise<Mod> {
  if (!pending) {
    pending = import("./PlayPage").then(
      (m) => (mod = m),
      (e) => {
        pending = null; // a dropped connection: the next ask tries again
        throw e;
      },
    );
  }
  return pending;
}
