/** The play pages: each opens as its own page (/#play/<id>), from its card on Home. */
export const PLAY_IDS = ["cocktail", "wish", "bakery", "lab"] as const;
export type PlayId = (typeof PLAY_IDS)[number];
export const isPlayId = (s: string): s is PlayId => (PLAY_IDS as readonly string[]).includes(s);
export const playHash = (id: PlayId) => `#play/${id}`;

/** Places on Home a link can land on: the cards, the play row, the note at the end. */
export const HOME_SECTIONS = ["work", "play", "hi"] as const;
export type HomeSection = (typeof HOME_SECTIONS)[number];
export const isHomeSection = (s: string): s is HomeSection => (HOME_SECTIONS as readonly string[]).includes(s);
