// What the student did with an update, saved only in chrome.storage.local:
//   done:   marked as done (shown under Done)
//   hidden: discarded from Mellon with Select (the Gmail message is not touched)
// Each is { [messageId]: timeMarked }. Entries older than 30 days are dropped.

const KEEP_DAYS = 30;

async function getMarks(kind) {
  const stored = await chrome.storage.local.get(kind);
  const marks = stored[kind] || {};
  const cutoff = Date.now() - KEEP_DAYS * 24 * 60 * 60 * 1000;
  return Object.fromEntries(Object.entries(marks).filter(([, at]) => at > cutoff));
}

async function setMarks(kind, ids, on) {
  const marks = await getMarks(kind);
  for (const id of ids) {
    if (on) marks[id] = Date.now();
    else delete marks[id];
  }
  await chrome.storage.local.set({ [kind]: marks });
  return marks;
}

export const getDone = () => getMarks('done');
export const setDone = (id, isDone) => setMarks('done', [id], isDone);
export const getHidden = () => getMarks('hidden');
export const setHidden = (ids, isHidden) => setMarks('hidden', ids, isHidden);
