/**
 * Bakery Log: the polaroid stack on the Bakery Log page.
 * Tap (or press Enter on) the top photo to flip it over.
 *
 * The recipes are ROUGH PLACEHOLDERS (plausible, not tested): Chaewon, swap in the real amounts.
 * The back holds 4 ingredients (two rows of two), 3 one-line steps, then “Secret ingredient”, a
 * mosaic where the word would be, and “Ask Chaewon!” under it. Keep each ingredient to about 13
 * characters and each step to about 30, or it gets cut off.
 * The secret ingredient is never written here: `secret` is only how wide the mosaic is.
 * The pancakes card is a place, not a recipe: Five Leaves, Brooklyn. (`order` comes from the
 * photo's own caption; change it if you order something else.) A back with nothing filled in
 * shows its "classified" version (redacted lines + the `sealed` line).
 */
export type RecipeBack = {
  kind: "recipe";
  title: string;
  /** e.g. "200g raspberries" */
  ingredients: string[];
  /** One short step per line */
  method: string[];
  /** The secret ingredient, pixelated out: how many mosaic tiles wide (0 = no such line) */
  secret: number;
  /** What it says under the mosaic */
  ask: string;
  sealed: string;
};
export type SpotBack = {
  kind: "spot";
  title: string;
  /** The place */
  name: string;
  /** Neighborhood, e.g. "West Village" */
  area: string;
  /** What to order */
  order: string;
  sealed: string;
};
export type Bake = { src: string; cap: string; alt: string; back: RecipeBack | SpotBack };

const recipe = (ingredients: string[], method: string[], secret: number): RecipeBack => ({
  kind: "recipe",
  title: "Chaewon’s secret recipe",
  ingredients,
  method,
  secret,
  ask: "Ask Chaewon!",
  sealed: "Classified. Ask me in person.",
});

export const bakes: Bake[] = [
  {
    src: "/fun/bake-raspberry.webp",
    cap: "Raspberry mousse cake",
    alt: "A glossy raspberry mousse cake topped with raspberries and cream",
    back: recipe(
      ["250g berries", "200ml cream", "60g sugar", "6g gelatin"],
      ["Purée berries with sugar.", "Melt in gelatin, fold in cream.", "Chill overnight, then glaze."],
      12,
    ),
  },
  {
    src: "/fun/bake-cookies.webp",
    cap: "Chocolate chip cookies",
    alt: "A box of thick chocolate chip cookies",
    back: recipe(
      ["115g butter", "150g sugar", "1 egg", "180g flour"],
      ["Brown the butter, let it cool.", "Mix; fold in 200g chocolate.", "Chill a day. Bake 11 min, 180°C."],
      9,
    ),
  },
  {
    src: "/fun/bake-roll.webp",
    cap: "Raspberry Swiss roll",
    alt: "A Swiss roll with raspberry filling on a dark plate",
    back: recipe(
      ["4 eggs", "100g sugar", "100g flour", "200ml cream"],
      ["Whip eggs and sugar till pale.", "Bake thin: 180°C, 12 min.", "Roll warm. Fill with berries."],
      11,
    ),
  },
  {
    src: "/fun/bake-pancakes.webp",
    cap: "Pancakes, extra fruit",
    alt: "Chaewon holding a plate of pancakes with berries and banana",
    back: {
      kind: "spot",
      title: "The best pancake place in NYC",
      name: "Five Leaves",
      area: "Brooklyn",
      order: "Pancakes, extra fruit",
      sealed: "Ask me over brunch.",
    },
  },
];
