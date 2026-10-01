/**
 * Bakery Log: the polaroid stack on the Bakery Log page.
 * Tap (or press Enter on) the top photo to flip it over.
 *
 * The recipes are ROUGH PLACEHOLDERS (plausible, not tested): Chaewon, swap in the real amounts.
 * The back holds 4 ingredients (two rows of two), 3 one-line steps and the secret-ingredient line,
 * so keep each ingredient to about 13 characters and each step to about 30, or it gets cut off.
 * The secret ingredient is never written here: `secret` is only how wide the black bar is.
 * TODO(Chaewon): the brunch spot's `name` / `area` / `order`. While it's empty that card shows its
 * "classified" version (redacted lines + the `sealed` line), so nothing looks broken.
 */
export type RecipeBack = {
  kind: "recipe";
  title: string;
  /** e.g. "200g raspberries" */
  ingredients: string[];
  /** One short step per line */
  method: string[];
  /** The secret ingredient, blacked out: the bar's width in characters (0 = no such line) */
  secret: number;
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
      9,
    ),
  },
  {
    src: "/fun/bake-cookies.webp",
    cap: "Chocolate chip cookies",
    alt: "A box of thick chocolate chip cookies",
    back: recipe(
      ["115g butter", "150g sugar", "1 egg", "180g flour"],
      ["Brown the butter, let it cool.", "Mix; fold in 200g chocolate.", "Chill a day. Bake 11 min, 180°C."],
      6,
    ),
  },
  {
    src: "/fun/bake-roll.webp",
    cap: "Raspberry Swiss roll",
    alt: "A Swiss roll with raspberry filling on a dark plate",
    back: recipe(
      ["4 eggs", "100g sugar", "100g flour", "200ml cream"],
      ["Whip eggs and sugar till pale.", "Bake thin: 180°C, 12 min.", "Roll warm. Fill with berries."],
      8,
    ),
  },
  {
    src: "/fun/bake-pancakes.webp",
    cap: "Pancakes, extra fruit",
    alt: "Chaewon holding a plate of pancakes with berries and banana",
    back: {
      kind: "spot",
      title: "The best brunch spot in NYC",
      name: "",
      area: "",
      order: "",
      sealed: "Ask me over brunch.",
    },
  },
];
