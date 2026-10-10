const $ = (id) => document.getElementById(id);

$('redirect').textContent = chrome.identity.getRedirectURL();

async function load() {
  const all = await chrome.storage.local.get(null);
  $('clientId').value = all.googleClientId || '';
  $('claudeKey').value = all.claudeApiKey || '';
  $('cacheCount').textContent = Object.keys(all).filter((k) => k.startsWith('analysis:')).length;
}

$('save').addEventListener('click', async () => {
  await chrome.storage.local.set({
    googleClientId: $('clientId').value.trim(),
    claudeApiKey: $('claudeKey').value.trim(),
  });
  await chrome.storage.session.remove('googleToken');
  $('status').textContent = 'Saved.';
});

$('clearCache').addEventListener('click', async () => {
  const all = await chrome.storage.local.get(null);
  await chrome.storage.local.remove(Object.keys(all).filter((k) => k.startsWith('analysis:')));
  load();
});

load();
