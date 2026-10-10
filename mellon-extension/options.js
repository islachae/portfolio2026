import { CATEGORIES } from './claude.js';
import { signOut } from './auth.js';

const $ = (id) => document.getElementById(id);

$('interests').innerHTML = CATEGORIES.map(
  (c) => `<label class="check"><input type="checkbox" value="${c}" /> ${c.replace('&', '&amp;')}</label>`
).join('');

$('redirect').textContent = chrome.identity.getRedirectURL();

async function load() {
  const all = await chrome.storage.local.get(null);
  $('clientId').value = all.googleClientId || '';
  $('claudeKey').value = all.claudeApiKey || '';
  const interests = all.interests || [];
  document.querySelectorAll('#interests input').forEach((box) => (box.checked = interests.includes(box.value)));
  $('account').textContent = all.googleEmail ? `Signed in as ${all.googleEmail}` : 'Not signed in';
  $('signout').style.display = all.googleEmail ? '' : 'none';
  $('cacheCount').textContent = Object.keys(all).filter((k) => k.startsWith('analysis:')).length;
}

$('save').addEventListener('click', async () => {
  await chrome.storage.local.set({
    googleClientId: $('clientId').value.trim(),
    claudeApiKey: $('claudeKey').value.trim(),
    interests: [...document.querySelectorAll('#interests input:checked')].map((box) => box.value),
  });
  await chrome.storage.session.remove('googleToken');
  $('status').textContent = 'Saved';
});

$('clearCache').addEventListener('click', async () => {
  const all = await chrome.storage.local.get(null);
  await chrome.storage.local.remove(Object.keys(all).filter((k) => k.startsWith('analysis:')));
  load();
});

load();

$('signout').addEventListener('click', async () => {
  await signOut();
  load();
});

$('welcome').addEventListener('click', async () => {
  await chrome.storage.local.set({ onboarded: false });
  $('status').textContent = 'Open Mellon to see it';
});
