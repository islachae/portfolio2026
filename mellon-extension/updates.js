// Builds the Updates list: recent inbox mail -> Claude analysis (cached) -> items.
import { listRecentIds, listUnreadIds, getMessageMeta, getMessageFull } from './gmail.js';
import { analyzeEmail, getCachedAnalysis } from './claude.js';
import { parseDeadline } from './rank.js';

// How far back to read. The student can change both in Settings.
export const SCAN_DAYS = [7, 14];
export const SCAN_MAX = [30, 50, 100];
const DEFAULT_DAYS = 7;
const DEFAULT_MAX = 100;
const PARALLEL = 6; // emails sent to Claude at the same time

export async function getScanSettings() {
  const { scanDays, scanMax } = await chrome.storage.local.get(['scanDays', 'scanMax']);
  return {
    days: SCAN_DAYS.includes(scanDays) ? scanDays : DEFAULT_DAYS,
    max: SCAN_MAX.includes(scanMax) ? scanMax : DEFAULT_MAX,
  };
}

// To-dos read on an earlier day whose deadline has not passed yet. They stay on the list even
// after their email is older than the scan range. Saved results only: no Gmail or Claude call.
async function stillDueFromBefore(skipIds) {
  const all = await chrome.storage.local.get(null);
  const now = new Date();
  return Object.entries(all)
    .filter(([key, a]) => key.startsWith('analysis:') && a && a.date && a.action_required)
    .map(([key, a]) => ({ ...a, id: key.slice('analysis:'.length) }))
    .filter((a) => !skipIds.has(a.id) && parseDeadline(a.deadline) > now)
    .map((a) => ({ ...a, unread: false, carried: true }));
}

// onProgress({ done, total, sent }) is called as each email finishes.
export async function loadUpdates(token, onProgress = () => {}) {
  const { days, max } = await getScanSettings();
  const [ids, unreadIds] = await Promise.all([
    listRecentIds(token, { days, max }),
    listUnreadIds(token, { days }),
  ]);
  const unread = new Set(unreadIds);
  const items = [];
  const failed = [];
  let done = 0;
  let sent = 0;

  async function handle(id) {
    try {
      let item = await getCachedAnalysis(id);
      if (item && !item.date) {
        // Saved by an older version without sender/date: add them from Gmail (free, no Claude call).
        item = { ...item, ...(await getMessageMeta(token, id)) };
      }
      if (!item) {
        item = await analyzeEmail(await getMessageFull(token, id));
        sent++;
      }
      items.push({ ...item, id, unread: unread.has(id) });
    } catch (err) {
      if (err.message === 'SIGNED_OUT' || err.message === 'NO_CLAUDE_KEY') throw err;
      failed.push({ id, error: err.message });
    } finally {
      done++;
      onProgress({ done, total: ids.length, sent });
    }
  }

  const queue = [...ids];
  await Promise.all(
    Array.from({ length: Math.min(PARALLEL, queue.length) }, async () => {
      while (queue.length) await handle(queue.shift());
    })
  );
  const carried = await stillDueFromBefore(new Set(ids));
  return { items: [...items, ...carried], failed, sent, scanned: ids.length, days };
}
