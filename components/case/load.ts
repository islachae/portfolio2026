/**
 * The long reads (the three case studies and the About page) are their own chunk: Home doesn't
 * download or run them. They arrive in a quiet moment after the page has loaded (Site.tsx), or the
 * moment one is asked for; a link straight to one preloads the chunk from <head>
 * (scripts/defer-css.mjs), alongside the page's own scripts.
 */
type Mod = typeof import("./CasePage");

let mod: Mod | null = null;
let pending: Promise<Mod> | null = null;

/** The module, if it has arrived. */
export const caseLoaded = () => mod;

export function loadCase(): Promise<Mod> {
  if (!pending) {
    pending = import("./CasePage").then(
      (m) => (mod = m),
      (e) => {
        pending = null; // a dropped connection: the next ask tries again
        throw e;
      },
    );
  }
  return pending;
}
