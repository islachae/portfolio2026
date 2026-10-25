import { CATEGORIES, usageCost } from './claude.js';
import { signOut } from './auth.js';
import { loadLang, t, getLang, catLabel, applyStatic } from './i18n.js';
import { SCAN_DAYS, SCAN_MAX, getScanSettings } from './updates.js';

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
  const scan = await getScanSettings();
  $('scanDays').innerHTML = SCAN_DAYS.map((n) => `<button data-scan-days="${n}" class="${n === scan.days ? 'on' : ''}" aria-pressed="${n === scan.days}">${t('opt.days', { n })}</button>`).join('');
  $('scanMax').innerHTML = SCAN_MAX.map((n) => `<button data-scan-max="${n}" class="${n === scan.max ? 'on' : ''}" aria-pressed="${n === scan.max}">${t('opt.emails', { n })}</button>`).join('');
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
  const u = all.usage;
  $('usageLine').textContent = u?.requests
    ? t('opt.usageLine', {
        requests: u.requests,
        since: new Date(u.since).toLocaleDateString(getLang() === 'ko' ? 'ko-KR' : 'en-US', { month: 'short', day: 'numeric' }),
        cost: usageCost(u) < 0.01 ? t('opt.costUnder') : t('opt.cost', { cost: usageCost(u).toFixed(2) }),
      })
    : t('opt.usageNone');
  $('hiddenCount').textContent = t('opt.hiddenCount', { n: Object.keys(all.hidden || {}).length });
  $('rememberAsks').checked = all.rememberAsks !== false;
  $('asksCount').textContent = t('opt.asksCount', { n: (all.askHistory || []).length });
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

// Applies right away, like the language. Turning it off stops learning; Forget clears what was kept.
$('rememberAsks').addEventListener('change', async (e) => {
  await chrome.storage.local.set({ rememberAsks: e.target.checked });
});

$('forgetAsks').addEventListener('click', async () => {
  await chrome.storage.local.remove('askHistory');
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

$('usageReset').addEventListener('click', async () => {
  await chrome.storage.local.remove('usage');
  load();
});

// The scan range applies right away; an open panel scans again.
document.addEventListener('click', async (e) => {
  const d = e.target.closest('[data-scan-days]');
  const m = e.target.closest('[data-scan-max]');
  if (d) await chrome.storage.local.set({ scanDays: Number(d.dataset.scanDays) });
  if (m) await chrome.storage.local.set({ scanMax: Number(m.dataset.scanMax) });
  if (d || m) load();
});
