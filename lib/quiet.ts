/**
 * Run something heavy when it won't be felt: the browser is idle and the visitor hasn't scrolled,
 * touched, clicked or typed for a moment. (requestIdleCallback alone isn't enough: it fires between
 * the frames of a scroll, and a 0.4s task there is a 0.4s freeze under the finger.)
 * Returns a cancel function.
 */
const EVENTS = ["wheel", "touchstart", "touchmove", "pointerdown", "keydown", "scroll"] as const;

export function whenQuiet(run: () => void, { after = 0, still = 400 }: { after?: number; still?: number } = {}) {
  let last = performance.now();
  let timer = 0;
  let idle = 0;
  let done = false;
  const touch = () => (last = performance.now());
  const opts = { passive: true, capture: true } as const;
  EVENTS.forEach((t) => window.addEventListener(t, touch, opts));
  const stop = () => {
    done = true;
    window.clearTimeout(timer);
    if (idle) window.cancelIdleCallback?.(idle);
    EVENTS.forEach((t) => window.removeEventListener(t, touch, opts));
  };
  const check = () => {
    if (done) return;
    const wait = still - (performance.now() - last);
    if (wait > 0 || document.hidden) {
      timer = window.setTimeout(check, Math.max(wait, 120));
      return;
    }
    const go = () => {
      if (done) return;
      // something happened while we waited for the idle slot: wait again
      if (performance.now() - last < still) return check();
      stop();
      run();
    };
    if (typeof window.requestIdleCallback === "function") idle = window.requestIdleCallback(go, { timeout: 1500 });
    else timer = window.setTimeout(go, 50);
  };
  timer = window.setTimeout(check, after);
  return stop;
}
