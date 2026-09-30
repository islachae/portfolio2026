/**
 * Bakery Log: the polaroid stack on the Bakery Log page.
 * Tap (or press Enter on) the top photo to flip it over.
 *
 * TODO(Chaewon): fill in the backs. While a list is empty, the card shows its
 * "classified" version (redacted lines + the `sealed` line), so nothing looks broken.
 */
export type RecipeBack = {
  kind: "recipe";
  title: string;
  /** e.g. "200g raspberries" */
  ingredients: string[];
  /** One short step per line */
  method: string[];
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

const recipe = (): RecipeBack => ({
  kind: "recipe",
  title: "Chaewon’s secret recipe",
  ingredients: [],
  method: [],
  sealed: "Classified. Ask me in person.",
});

export const bakes: Bake[] = [
  {
    src: "/fun/bake-raspberry.webp",
    cap: "Raspberry mousse cake",
    alt: "A glossy raspberry mousse cake topped with raspberries and cream",
    back: recipe(),
  },
  {
    src: "/fun/bake-cookies.webp",
    cap: "Chocolate chip cookies",
    alt: "A box of thick chocolate chip cookies",
    back: recipe(),
  },
  {
    src: "/fun/bake-roll.webp",
    cap: "Raspberry Swiss roll",
    alt: "A Swiss roll with raspberry filling on a dark plate",
    back: recipe(),
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
