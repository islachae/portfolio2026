// Builds the Updates list: recent inbox mail -> Claude analysis (cached) -> items.
import { listRecentIds, getMessageMeta, getMessageFull } from './gmail.js';
import { analyzeEmail, getCachedAnalysis } from './claude.js';

const DAYS = 7;
const MAX_EMAILS = 30;
const PARALLEL = 4; // emails sent to Claude at the same time

// onProgress({ done, total, sent }) is called as each email finishes.
export async function loadUpdates(token, onProgress = () => {}) {
  const ids = await listRecentIds(token, { days: DAYS, max: MAX_EMAILS });
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
      items.push({ ...item, id });
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
  return { items, failed, sent };
}
