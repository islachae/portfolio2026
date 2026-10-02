/**
 * Word Cocktail: words that don't come in English, written up as cocktail recipes.
 *
 * Everything the experience shows comes from here, so a new word is a new entry in `menu`,
 * not a new component. The interaction (pours, shake, pour-out, garnish, receipt) reads:
 *   - `ingredients` in pour order: one gem per shot (a ½ shot is a small gem), poured from the
 *     side in `from` ("both" = two glasses at once, one from each side);
 *   - `liquid`: the finished drink's colour (the pour turns every gem into this);
 *   - `garnish.model`: which 3D garnish drops in at the end (each one has its own small reaction
 *     to the visitor: the olive's eye follows the pointer, the cream wakes up when you come close);
 *   - `glass`: "coupe" (plain), "wavy" (wide, scalloped rim) or "goblet" (deep round bowl).
 *
 * A word with `status: "soon"` shows on the menu (← →) with an empty glass and no recipe yet.
 * To publish one: switch it to `status: "ready"` and fill in the recipe fields.
 */

export type GemSide = "left" | "right" | "both";

export type Ingredient = {
  id: string;
  /** "Social Awareness" (the UI sets it in caps where it needs to) */
  name: string;
  /** 2, 1 or 0.5 */
  shots: number;
  /** Gem and liquid colour while it is still its own thing */
  color: string;
  /** Where the shot glass comes from */
  from: GemSide;
  /** A small handwritten aside during the pour ("2 shots!", "clink!"). Optional, keep it rare. */
  note?: string;
};

export type ReadyCocktail = {
  status: "ready";
  id: string;
  /** In its own script */
  native: string;
  /** Romanised, as the CTA and receipt print it */
  word: string;
  lang: string;
  /** Two-letter code on the receipt */
  code: string;
  meaning: string;
  /** The finished drink */
  liquid: string;
  /** The coupe's rim. Plain if left out. */
  glass?: "coupe" | "wavy" | "goblet";
  ingredients: Ingredient[];
  /** Receipt order, if it should differ from the pour order (ingredient ids) */
  receiptOrder?: string[];
  garnish: {
    name: string;
    /**
     * The 3D model that drops in: an olive with an eye that reads the room, a cloud of cream that
     * dozes over the rim, or a foam sprite among clovers (one of which comes over to find you)
     */
    model: "eye-olive" | "sleepy-cloud" | "lucky-clover";
  };
  bestServed: string;
  translation: string;
  /** Handwritten under the finished drink */
  aside: string;
};

export type SoonCocktail = {
  status: "soon";
  id: string;
  native: string;
  word: string;
  lang: string;
  code: string;
  meaning: string;
  liquid: string;
};

export type Cocktail = ReadyCocktail | SoonCocktail;

export const menu: Cocktail[] = [
  {
    status: "ready",
    id: "nunchi",
    native: "눈치",
    word: "Nunchi",
    lang: "Korean",
    code: "KR",
    meaning: "The subtle art of reading the room.",
    liquid: "#cfe79a",
    ingredients: [
      { id: "social", name: "Social Awareness", shots: 2, color: "#c8ec8c", from: "both", note: "2 shots!" },
      { id: "anxiety", name: "Anxiety", shots: 1, color: "#ffadd2", from: "left", note: "clink!" },
      { id: "empathy", name: "Empathy", shots: 1, color: "#9cc8ff", from: "left" },
      { id: "selfconscious", name: "Self-Consciousness", shots: 0.5, color: "#c9b2ff", from: "right" },
    ],
    receiptOrder: ["social", "empathy", "anxiety", "selfconscious"],
    garnish: { name: "Awkward Silence", model: "eye-olive" },
    bestServed: "At a dinner table where nobody says what’s wrong.",
    translation: "Unavailable.",
    aside: "Some people just taste it.",
  },
  {
    status: "ready",
    id: "amae",
    native: "甘え",
    word: "Amae",
    lang: "Japanese",
    code: "JP",
    meaning: "Leaning on someone, sure they’ll let you.",
    liquid: "#f8a9c0",
    glass: "wavy",
    ingredients: [
      { id: "trust", name: "Trust", shots: 2, color: "#ffd0dd", from: "both", note: "2 shots!" },
      { id: "vulnerability", name: "Vulnerability", shots: 1, color: "#cfdcff", from: "left", note: "gently…" },
      { id: "affection", name: "Affection", shots: 1, color: "#ff9dbd", from: "left" },
      { id: "dependency", name: "Dependency", shots: 0.5, color: "#ffd2ad", from: "right" },
    ],
    garnish: { name: "A Little Lean", model: "sleepy-cloud" },
    bestServed: "With people who make you feel safe to be soft.",
    translation: "Unavailable.",
    aside: "It’s okay to lean a little.",
  },
  {
    status: "ready",
    id: "yuanfen",
    native: "缘分",
    word: "Yuánfèn",
    lang: "Chinese",
    code: "CN",
    meaning: "A fated connection, a bond meant to be.",
    liquid: "#dcec8c",
    glass: "goblet",
    ingredients: [
      { id: "serendipity", name: "Serendipity", shots: 2, color: "#d2ee86", from: "both", note: "2 shots!" },
      { id: "timing", name: "Timing", shots: 1, color: "#ffeb9c", from: "left", note: "right on time" },
      { id: "trust", name: "Trust", shots: 1, color: "#b6e6c6", from: "left" },
      { id: "distance", name: "Distance", shots: 0.5, color: "#c7d6ff", from: "right" },
    ],
    garnish: { name: "A Chance Encounter", model: "lucky-clover" },
    bestServed: "With people who were meant to stay, even across time and distance.",
    translation: "Unavailable.",
    aside: "Some connections just find you.",
  },
  // TODO(Chaewon): recipe. Until then this one sits on the menu as “still mixing”.
  {
    status: "soon",
    id: "saudade",
    native: "saudade",
    word: "Saudade",
    lang: "Portuguese",
    code: "PT",
    meaning: "Missing something you might never get back.",
    liquid: "#bcd4ff",
  },
];

/** Words on the experience chrome. */
export const cocktailCopy = {
  title: "Untranslatable Word Bar",
  intro: ["Some words just don’t translate into English.", "So let’s see the recipe for that word!"],
  menuLabel: "Menu",
  soon: "Still mixing this one.",
  soonCta: "On the menu soon",
  hold: ["Hold", "to shake"],
  holdHint: "Shake it!",
  shaking: "shaking…",
  pour: "Pour it out!",
  garnishLead: "One last thing…",
  garnishWith: "Garnish with",
  youMade: "You made",
  /** The label over the definition at the end */
  means: "Roughly, in English",
  again: "Make another",
  share: "Share",
};

export const shotLabel = (n: number) => {
  const whole = Math.floor(n);
  const half = n - whole >= 0.5 ? "½" : "";
  const num = whole ? `${whole}${half}` : half;
  return `${num} shot${n > 1 ? "s" : ""}`;
};

export const isReady = (c: Cocktail): c is ReadyCocktail => c.status === "ready";
