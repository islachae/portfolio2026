/**
 * The tab's title while a page is open over Home, put back to `rest` when it closes.
 *
 * A page opened from a link can be on screen before React has finished waking up the <head>, and
 * when it does it writes the site's own title back into <title>. So the title is watched while the
 * page is open and set again if anything else changes it. Returns the cleanup.
 */
export function holdTitle(title: string, rest: string): () => void {
  document.title = title;
  const mo = new MutationObserver(() => {
    if (document.title !== title) document.title = title;
  });
  mo.observe(document.head, { childList: true, subtree: true, characterData: true });
  return () => {
    mo.disconnect();
    document.title = rest;
  };
}
