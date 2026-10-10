// Corrections the student makes by hand: whether it is a to-do, the deadline and the category.
// Saved as `edit:<messageId>` in chrome.storage.local and laid over Claude's reading, so they
// survive a rescan. Re-reading an email with Claude clears its correction.
import { analyzeEmail } from './claude.js';
import { getMessageFull } from './gmail.js';

const key = (id) => `edit:${id}`;
export const EDITABLE = ['action_required', 'deadline', 'category'];

export async function getEdits() {
  const all = await chrome.storage.local.get(null);
  return Object.fromEntries(Object.entries(all).filter(([k]) => k.startsWith('edit:')).map(([k, v]) => [k.slice(5), v]));
}

export async function saveEdit(id, fields) {
  const clean = Object.fromEntries(Object.entries(fields).filter(([k]) => EDITABLE.includes(k)));
  await chrome.storage.local.set({ [key(id)]: clean });
  return clean;
}

export async function clearEdit(id) {
  await chrome.storage.local.remove(key(id));
}

export function applyEdit(item, edit) {
  if (!edit) return item;
  return { ...item, ...edit, edited: true };
}

// Throws away the saved reading (and its Korean version and correction) and asks Claude again.
export async function rereadEmail(token, id) {
  await chrome.storage.local.remove([`analysis:${id}`, `ko:${id}`, key(id)]);
  return analyzeEmail(await getMessageFull(token, id));
}
