// Which updates the student marked as done. Saved only in chrome.storage.local,
// as { [messageId]: timeMarkedDone }. Entries older than 30 days are dropped.

const KEEP_DAYS = 30;

export async function getDone() {
  const { done = {} } = await chrome.storage.local.get('done');
  const cutoff = Date.now() - KEEP_DAYS * 24 * 60 * 60 * 1000;
  return Object.fromEntries(Object.entries(done).filter(([, at]) => at > cutoff));
}

export async function setDone(id, isDone) {
  const done = await getDone();
  if (isDone) done[id] = Date.now();
  else delete done[id];
  await chrome.storage.local.set({ done });
  return done;
}
