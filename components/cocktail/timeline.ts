/**
 * Word Cocktail timing. The DOM (labels, notes, buttons) and the 3D scene both read this,
 * so changing a number here moves both together.
 *
 * Seconds. After MAKE: ~5s of pours, then the hold, then ~6.5s of shake → pour → garnish → receipt.
 */
import type { GemSide, ReadyCocktail } from "@/content/cocktails";

export type Phase = "hero" | "mix" | "hold" | "shake" | "pour" | "garnish" | "final";

/** The one clock the DOM and the 3D both read (seconds). Swappable, so a capture script can freeze it. */
export const clock = { now: () => performance.now() / 1000 };

export const T = {
  /** Finished drink slides off, the shaker drops in */
  swap: 0.6,
  /** One pour from fly-in to fly-out */
  step: 1.3,
  /** Next pour starts this long after the last (same side) */
  stepGap: 1.02,
  /** …or this long when it comes from the other side (the two overlap, like a bartender's two hands) */
  stepGapOther: 0.5,
  /** The cap drops on after the last pour */
  cap: 0.5,
  /** Holding to 100% */
  holdMs: 1500,
  /** Released early: the ring drains back over about this long */
  drainMs: 520,
  /** The one big shake at 100% */
  shake: 0.8,
  /** Cap off, shaker up, glass in, pour, shaker away */
  pour: 2.15,
  /** Beat, tweezers in, plop, tweezers out */
  garnish: 1.75,
  /** Receipt prints (starts as the final layout settles) */
  print: 1.7,
};

/** Inside a pour (seconds from its start) */
export const STEP = {
  inEnd: 0.32,
  tiltEnd: 0.5,
  streamStart: 0.4,
  /** the liquid reaches the shaker and turns into a gem */
  land: 0.66,
  streamEnd: 1.0,
  outStart: 0.98,
};

export type PourGlass = { side: "left" | "right"; size: number; color: string; gem: number };
export type PourStep = {
  index: number;
  start: number;
  side: GemSide;
  glasses: PourGlass[];
};
export type MixPlan = { steps: PourStep[]; gems: { color: string; size: number; slot: number; step: number }[]; end: number };

/** When each pour starts, which glasses it uses and which gem each one becomes. */
export function mixPlan(c: ReadyCocktail): MixPlan {
  const steps: PourStep[] = [];
  const gems: MixPlan["gems"] = [];
  let t = T.swap - 0.05;
  let lastSide: GemSide | null = null;
  c.ingredients.forEach((ing, index) => {
    if (index > 0) t += ing.from !== "both" && lastSide !== "both" && ing.from !== lastSide ? T.stepGapOther : T.stepGap;
    const sides: ("left" | "right")[] = ing.from === "both" ? ["left", "right"] : [ing.from];
    // 2 shots → two glasses at once (one per side) or two gems from one glass; ½ → a small glass
    const count = Math.max(1, Math.round(ing.shots));
    const size = ing.shots < 1 ? 0.78 : 1;
    const glasses: PourGlass[] = [];
    for (let k = 0; k < Math.max(sides.length, 1); k++) {
      const gem = gems.length;
      gems.push({ color: ing.color, size: size * (0.94 + ((gem * 37) % 10) / 100), slot: gem, step: index });
      glasses.push({ side: sides[k % sides.length], size, color: ing.color, gem });
    }
    // more shots than glasses (2 shots from one side): the same glass gives two gems
    for (let k = glasses.length; k < count; k++) {
      const gem = gems.length;
      gems.push({ color: ing.color, size, slot: gem, step: index });
    }
    steps.push({ index, start: t, side: ing.from, glasses });
    lastSide = ing.from;
  });
  const end = t + T.step;
  return { steps, gems, end };
}

export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
export const seg = (t: number, a: number, b: number) => clamp01((t - a) / (b - a));
export const easeOut = (x: number) => 1 - Math.pow(1 - x, 3);
export const easeIn = (x: number) => x * x * x;
export const easeInOut = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
/** Overshoots a little past 1, then settles */
export const backOut = (x: number, s = 1.7) => 1 + (s + 1) * Math.pow(x - 1, 3) + s * Math.pow(x - 1, 2);
