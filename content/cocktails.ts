/**
 * Word Cocktail: words that don't come in English, written up as cocktail recipes.
 *
 * Everything the experience shows comes from here, so a new word is a new entry in `menu`,
 * not a new component. The interaction (pours, shake, pour-out, garnish, receipt) reads:
 *   - `ingredients` in pour order: one gem per shot (a ½ shot is a small gem), poured from the
 *     side in `from` ("both" = two glasses at once, one from each side);
 *   - `liquid`: the finished drink's colour (the pour turns every gem into this);
 *   - `garnish.model`: which 3D garnish drops in at the end.
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
  ingredients: Ingredient[];
  /** Receipt order, if it should differ from the pour order (ingredient ids) */
  receiptOrder?: string[];
  garnish: {
    name: string;
    /** The 3D model that drops in. Only the eye olive exists so far. */
    model: "eye-olive";
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
  // TODO(Chaewon): recipes. Until then these sit on the menu as “still mixing”.
  {
    status: "soon",
    id: "amae",
    native: "甘え",
    word: "Amae",
    lang: "Japanese",
    code: "JP",
    meaning: "Leaning on someone, sure they’ll let you.",
    liquid: "#ffd3c2",
  },
  {
    status: "soon",
    id: "yuanfen",
    native: "缘分",
    word: "Yuánfèn",
    lang: "Chinese",
    code: "CN",
    meaning: "The fate that keeps bringing two people together.",
    liquid: "#ffc6c6",
  },
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
  title: "Word Cocktail",
  intro: ["Some words don’t come in English.", "So let’s see the recipe for that word!"],
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
