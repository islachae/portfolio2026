import { CATEGORIES } from './claude.js';
import { signOut } from './auth.js';
import { loadLang, t, getLang, catLabel, applyStatic } from './i18n.js';

const $ = (id) => document.getElementById(id);

$('redirect').textContent = chrome.identity.getRedirectURL();

function drawInterests(checked) {
  $('interests').innerHTML = CATEGORIES.map(
    (c) => `<label class="check"><input type="checkbox" value="${c.replace('&', '&amp;')}" ${checked.includes(c) ? 'checked' : ''} /> ${catLabel(c).replace('&', '&amp;')}</label>`
  ).join('');
}

async function load() {
  await loadLang();
  applyStatic();
  document.querySelectorAll('[data-lang]').forEach((b) => b.classList.toggle('on', b.dataset.lang === getLang()));
  const all = await chrome.storage.local.get(null);
  $('clientId').value = all.googleClientId || '';
  $('claudeKey').value = all.claudeApiKey || '';
  // Keep unsaved ticks when only the language changed.
  const ticked = document.querySelector('#interests input')
    ? [...document.querySelectorAll('#interests input:checked')].map((b) => b.value)
    : all.interests || [];
  drawInterests(ticked);
  $('account').textContent = all.googleEmail ? t('opt.signedIn', { email: all.googleEmail }) : t('opt.notSignedIn');
  $('signout').style.display = all.googleEmail ? '' : 'none';
  $('cacheCount').textContent = t('opt.cacheCount', { n: Object.keys(all).filter((k) => k.startsWith('analysis:')).length });
  $('hiddenCount').textContent = t('opt.hiddenCount', { n: Object.keys(all.hidden || {}).length });
}

// The language applies right away (no Save needed), here and in the open panel.
document.querySelectorAll('[data-lang]').forEach((b) =>
  b.addEventListener('click', async () => {
    await chrome.storage.local.set({ lang: b.dataset.lang });
    load();
  })
);

$('save').addEventListener('click', async () => {
  await chrome.storage.local.set({
    googleClientId: $('clientId').value.trim(),
    claudeApiKey: $('claudeKey').value.trim(),
    interests: [...document.querySelectorAll('#interests input:checked')].map((box) => box.value),
  });
  await chrome.storage.session.remove('googleToken');
  $('status').textContent = t('opt.savedMsg');
});

$('clearCache').addEventListener('click', async () => {
  const all = await chrome.storage.local.get(null);
  await chrome.storage.local.remove(Object.keys(all).filter((k) => k.startsWith('analysis:') || k.startsWith('ko:')));
  load();
});

$('unhide').addEventListener('click', async () => {
  await chrome.storage.local.set({ hidden: {} });
  load();
});

$('welcome').addEventListener('click', async () => {
  await chrome.storage.local.set({ onboarded: false });
  $('status').textContent = t('opt.welcomeDone');
});

$('signout').addEventListener('click', async () => {
  await signOut();
  load();
});

load();
