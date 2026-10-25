// Learned suggestion chips: Mellon remembers the questions you type (only in Chrome on this
// computer) and offers the ones you ask again and again instead of the fixed examples.

export const HISTORY_MAX = 50;
const CHIP_MAX_CHARS = 60;
const CHIPS = 2;

// "What's due  this week?" and "what's due this week" count as the same question.
const keyOf = (q) => q.toLowerCase().replace(/[\s?!.。？！]+/g, ' ').trim();

export function remember(history, q, ctx, card) {
  const text = q.replace(/\s+/g, ' ').trim();
  if (!text || text.length > CHIP_MAX_CHARS) return history;
  return [...history, { q: text, ctx, card: card || null, at: Date.now() }].slice(-HISTORY_MAX);
}

// A list question needs to be asked at least twice. A card question needs to be asked on at
// least two different cards, so a question about one email never shows up on the others.
export function learnedChips(history, ctx, now = Date.now()) {
  const groups = new Map();
  for (const h of history) {
    if (h.ctx !== ctx) continue;
    const k = keyOf(h.q);
    const g = groups.get(k) || { q: h.q, count: 0, cards: new Set(), last: 0 };
    g.count += 1;
    if (h.card) g.cards.add(h.card);
    if (h.at >= g.last) Object.assign(g, { q: h.q, last: h.at });
    groups.set(k, g);
  }
  const DAY = 86400000;
  return [...groups.values()]
    .filter((g) => (ctx === 'card' ? g.cards.size >= 2 : g.count >= 2))
    // Frequency first; a question asked this week beats one from last month.
    .map((g) => ({ q: g.q, score: g.count + 2 * Math.exp(-(now - g.last) / (7 * DAY)) }))
    .sort((a, b) => b.score - a.score)
    .map((g) => g.q);
}

// Learned questions first, then the built-in examples, without repeats.
export function pickChips(history, ctx, defaults) {
  const out = [];
  for (const q of [...learnedChips(history, ctx), ...defaults]) {
    if (out.length < CHIPS && !out.some((o) => keyOf(o) === keyOf(q))) out.push(q);
  }
  return out;
}
