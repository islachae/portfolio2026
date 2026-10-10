const $ = (id) => document.getElementById(id);

$('redirect').textContent = chrome.identity.getRedirectURL();

chrome.storage.local.get('googleClientId').then(({ googleClientId }) => {
  $('clientId').value = googleClientId || '';
});

$('save').addEventListener('click', async () => {
  await chrome.storage.local.set({ googleClientId: $('clientId').value.trim() });
  await chrome.storage.session.remove('googleToken');
  $('status').textContent = 'Saved.';
});
