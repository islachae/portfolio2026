// Korean versions of Mellon's own text (title, summary, action, key details).
// Only that short text is sent to Claude, never the email again, and each result is
// saved as `ko:<messageId>` in chrome.storage.local so it is translated once.
// Original emails can also be translated on request; those are kept in memory only.
import { callClaude } from './claude.js';

const BATCH = 10;

const SYSTEM = `You translate short English notes about a design student's emails into natural Korean for a Korean university student.
- Keep names of people, courses, buildings, rooms, programs, companies and links as they are.
- Keep well-known English terms students use as-is (e.g. CPT, OPT, portfolio review, RSVP, Canvas).
- action_label: a short Korean verb of one or two words, e.g. 제출, 결제, 등록, 참석 회신, 신청, 답장. Empty stays empty.
- Use a friendly, concise tone (해요체), no honorific excess.`;

const SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['items'],
  properties: {
    items: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['id', 'title', 'summary', 'action_label', 'key_details'],
        properties: {
          id: { type: 'string' },
          title: { type: 'string' },
          summary: { type: 'string' },
          action_label: { type: 'string' },
          key_details: { type: 'array', items: { type: 'string' } },
        },
      },
    },
  },
};

const key = (id) => `ko:${id}`;

// Returns { [id]: { title, summary, action_label, key_details } } for every item,
// translating the ones not saved yet. onProgress({ done, total }) counts emails.
export async function ensureKorean(items, onProgress = () => {}) {
  const stored = await chrome.storage.local.get(items.map((it) => key(it.id)));
  const result = {};
  const missing = [];
  for (const it of items) {
    if (stored[key(it.id)]) result[it.id] = stored[key(it.id)];
    else missing.push(it);
  }
  let done = 0;
  for (let i = 0; i < missing.length; i += BATCH) {
    const batch = missing.slice(i, i + BATCH);
    const input = batch.map((it) => ({
      id: it.id,
      title: it.title,
      summary: it.summary,
      action_label: it.action_label || '',
      key_details: it.key_details || [],
    }));
    try {
      const { items: out } = await callClaude({
        system: SYSTEM,
        content: `Translate each item into Korean. Return the same ids.\n\n${JSON.stringify(input, null, 1)}`,
        schema: SCHEMA,
        maxTokens: 8000,
      });
      const save = {};
      for (const tr of out) {
        if (!batch.some((it) => it.id === tr.id)) continue;
        const { id, ...fields } = tr;
        result[id] = fields;
        save[key(id)] = fields;
      }
      await chrome.storage.local.set(save);
    } catch (err) {
      // Untranslated items simply stay in English; the error is reported once.
      if (err.message === 'NO_CLAUDE_KEY') throw err;
      console.warn('Mellon: translation failed', err);
    }
    done += batch.length;
    onProgress({ done, total: missing.length });
  }
  return result;
}

// Puts the Korean text over the English, keeping everything else (category, deadline…).
export function applyKorean(item, ko) {
  if (!ko) return item;
  return { ...item, title: ko.title, summary: ko.summary, action_label: ko.action_label, key_details: ko.key_details };
}

const emailCache = new Map();

// Full original email into Korean, on request. Kept in memory only.
export async function translateEmail(id, text) {
  if (emailCache.has(id)) return emailCache.get(id);
  const out = await callClaude({
    system:
      'Translate the email the user gives you into natural Korean. Keep names, links, email addresses, room numbers, course codes and dates exactly. Keep the paragraph breaks. Reply with the translation only.',
    content: text.slice(0, 15000),
    maxTokens: 12000,
  });
  emailCache.set(id, out);
  return out;
}
