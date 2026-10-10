import { getGoogleClientId, getGoogleToken, getSignedInEmail, rememberEmail } from './auth.js';
import { getProfile, getMessageFull } from './gmail.js';
import { getClaudeKey, CATEGORIES } from './claude.js';
import { getDone, setDone, getHidden, setHidden } from './done.js';
import { loadUpdates } from './updates.js';
import { rankUpdates, senderName, receivedLabel, parseDeadline } from './rank.js';
import { loadLang, t, getLang, locale, catLabel, applyStatic } from './i18n.js';
import { ensureKorean, applyKorean, translateEmail } from './translate.js';

const app = document.getElementById('app');
const refreshBtn = document.getElementById('refresh');

const state = {
  token: null,
  raw: [], // updates as Claude analyzed them (English)
  ko: {}, // { messageId: Korean title/summary/action/details }
  items: [], // what is shown: raw, with Korean text on top when the language is Korean
  failed: [],
  filter: 'all', // 'all' | 'unread'
  loading: false,
  done: {}, // { messageId: timeMarkedDone }
  hidden: {}, // { messageId: timeDiscarded }
  showDone: false,
  selecting: false,
  selected: new Set(),
  cal: { open: false, month: null, day: null }, // month: first day of the shown month
};

const ICON = {
  cal: '<svg class="ic" viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="16" rx="3"></rect><path d="M3 10h18M8 3v4M16 3v4"></path></svg>',
  calFact: '<svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="16" rx="3"></rect><path d="M3 10h18M8 3v4M16 3v4"></path></svg>',
  doc: '<svg viewBox="0 0 24 24"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"></path><path d="M14 3v5h5"></path></svg>',
  tag: '<svg viewBox="0 0 24 24"><path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8z"></path><circle cx="7.5" cy="7.5" r="1.5"></circle></svg>',
  chevron: '<svg viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"></polyline></svg>',
  out: '<svg viewBox="0 0 24 24"><path d="M8 16L17 7M9 7h8v8"></path></svg>',
  tick: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>',
};

const FACE =
  '<defs><linearGradient id="mbg" x1="0.25" y1="0" x2="0.75" y2="1"><stop offset="0" stop-color="#DD745C"></stop><stop offset="1" stop-color="#D74841"></stop></linearGradient></defs>' +
  '<rect x="215" y="3" width="128" height="45" rx="21" fill="#D74A42"></rect><path d="M257 40 L298 40 L294 92 L252 92 Z" fill="#D74A42"></path><circle cx="256" cy="287" r="221" fill="url(#mbg)"></circle>';
const WINK_SVG =
  `<svg class="wk" width="72" height="72" viewBox="0 0 512 512" role="img" aria-label="Mellon winking">${FACE}` +
  '<g class="wk-eye"><ellipse cx="337" cy="279" rx="58" ry="78" fill="#fff"></ellipse><ellipse cx="360" cy="279" rx="39" ry="52" fill="#121112"></ellipse></g>' +
  '<path class="wk-arc" d="M310 300 Q352 248 394 300" fill="none" stroke="#121112" stroke-width="27" stroke-linecap="round"></path>' +
  '<ellipse cx="213" cy="281" rx="78" ry="86" fill="#fff"></ellipse><ellipse cx="242" cy="280" rx="42" ry="54" fill="#121112"></ellipse></svg>';

function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

const openSettings = () => chrome.runtime.openOptionsPage();
document.getElementById('settings').addEventListener('click', openSettings);
document.getElementById('logo').addEventListener('click', () => load());
refreshBtn.addEventListener('click', () => load());

// ---------- setup and sign-in states ----------

function showCenter({ face = true, title, text, button, onClick }) {
  app.innerHTML = `
    <div class="center">
      ${face ? '<img src="icons/mellon.svg" width="64" height="64" alt="" />' : ''}
      <div><h2>${esc(title)}</h2>${text ? `<p>${esc(text)}</p>` : ''}</div>
      ${button ? `<button class="ab pri" id="cta">${esc(button)}</button>` : ''}
    </div>`;
  if (button) document.getElementById('cta').addEventListener('click', onClick);
}

async function signIn() {
  try {
    const token = await getGoogleToken({ interactive: true });
    const profile = await getProfile(token);
    await rememberEmail(profile.emailAddress);
    load();
  } catch (err) {
    showCenter({ title: t('signin.failed'), text: err.message, button: t('error.retry'), onClick: signIn });
  }
}

// ---------- loading ----------

function showLoading() {
  const SCAN_TEXT = t('load.scan');
  app.innerHTML = `
    <div class="ld" role="status" aria-label="${esc(SCAN_TEXT)}">
      <img src="icons/mellon.svg" alt="" />
      <div class="ld-cap" aria-hidden="true"><span class="ld-ghost">${SCAN_TEXT}</span><span class="ld-typed"><span id="typed"></span><span class="ld-caret"></span></span></div>
      <div class="ld-count" id="ldCount"></div>
    </div>`;
  // The caption types itself, letter by letter, with a beat on spaces and dots.
  const el = document.getElementById('typed');
  let i = 0;
  const step = () => {
    if (!el.isConnected || i >= SCAN_TEXT.length) return;
    i++;
    el.textContent = SCAN_TEXT.slice(0, i);
    const next = SCAN_TEXT[i];
    setTimeout(step, next === ' ' ? 120 : next === '.' ? 230 : 44 + (i % 3) * 10);
  };
  setTimeout(step, 300);
}

function showProgress(done, total) {
  const el = document.getElementById('ldCount');
  if (el && total) el.textContent = `${done} / ${total}`;
}

// ---------- first run: pick interests ----------

let onbPicked = null; // kept while the language is switched on this screen

async function showOnboarding() {
  const { interests: saved = [] } = await chrome.storage.local.get('interests');
  const picked = onbPicked || new Set(saved);
  onbPicked = picked;
  app.innerHTML = `
    <div class="onb">
      <div class="onbTop">
        <img src="icons/mellon.svg" width="56" height="56" alt="" />
        <div class="seg" role="group" aria-label="${esc(t('onb.language'))}">
          <button data-lang="en" class="${getLang() === 'en' ? 'on' : ''}" aria-pressed="${getLang() === 'en'}">English</button>
          <button data-lang="ko" class="${getLang() === 'ko' ? 'on' : ''}" aria-pressed="${getLang() === 'ko'}">한국어</button>
        </div>
      </div>
      <h2>${esc(t('onb.title'))}</h2>
      <p>${esc(t('onb.text'))}</p>
      <div class="chips" role="group">
        ${CATEGORIES.map(
          (c) => `<button class="chip ${picked.has(c) ? 'on' : ''}" aria-pressed="${picked.has(c)}" data-cat="${esc(c)}">${ICON.tick}<span>${esc(catLabel(c))}</span></button>`
        ).join('')}
      </div>
      <button class="ab pri big" id="onbGo"></button>
      <button class="txt" id="onbSkip">${esc(t('onb.skip'))}</button>
      <p class="cap">${esc(t('onb.later'))}</p>
    </div>`;
  app.querySelectorAll('[data-lang]').forEach((btn) =>
    // Saving the language redraws this screen through the storage listener below.
    btn.addEventListener('click', () => chrome.storage.local.set({ lang: btn.dataset.lang }))
  );
  const go = document.getElementById('onbGo');
  const label = () => (go.textContent = picked.size ? t('onb.continueN', { n: picked.size }) : t('onb.continue'));
  label();
  app.querySelectorAll('.chip').forEach((chip) =>
    chip.addEventListener('click', () => {
      const c = chip.dataset.cat;
      picked.has(c) ? picked.delete(c) : picked.add(c);
      chip.classList.toggle('on', picked.has(c));
      chip.setAttribute('aria-pressed', picked.has(c));
      label();
    })
  );
  const finish = async (interests) => {
    onbPicked = null;
    await chrome.storage.local.set({ interests, onboarded: true });
    load();
  };
  go.addEventListener('click', () => finish(CATEGORIES.filter((c) => picked.has(c))));
  document.getElementById('onbSkip').addEventListener('click', () => finish(saved));
}

async function load() {
  if (state.loading) return;
  const { onboarded } = await chrome.storage.local.get('onboarded');
  if (!onboarded) return showOnboarding();
  if (!(await getGoogleClientId()) || !(await getClaudeKey())) {
    return showCenter({
      title: t('setup.title'),
      text: t('setup.text'),
      button: t('setup.button'),
      onClick: openSettings,
    });
  }
  try {
    state.token = await getGoogleToken();
  } catch {
    return showCenter({
      title: t('signin.title'),
      text: t('signin.text'),
      button: t('signin.button'),
      onClick: signIn,
    });
  }

  state.loading = true;
  refreshBtn.classList.add('spin');
  showLoading();
  const started = Date.now();
  try {
    const { items, failed } = await loadUpdates(state.token, ({ done, total }) => showProgress(done, total));
    state.raw = items;
    state.failed = failed;
    if (getLang() === 'ko') {
      state.ko = await ensureKorean(items, ({ done, total }) => {
        const el = document.getElementById('ldCount');
        if (el) el.textContent = t('load.translating', { done, total });
      });
    }
    applyLanguage();
    state.done = await getDone();
    state.hidden = await getHidden();
    // Let the caption finish typing before the list deals in, as in the design.
    await new Promise((r) => setTimeout(r, Math.max(0, 1900 - (Date.now() - started))));
    renderList({ arrive: true });
  } catch (err) {
    if (err.message === 'SIGNED_OUT') {
      state.loading = false;
      refreshBtn.classList.remove('spin');
      return load();
    }
    showCenter({ title: t('error.load'), text: err.message, button: t('error.retry'), onClick: load });
  } finally {
    state.loading = false;
    refreshBtn.classList.remove('spin');
  }
}

// ---------- language ----------

function applyLanguage() {
  state.items = getLang() === 'ko' ? state.raw.map((it) => applyKorean(it, state.ko[it.id])) : state.raw;
}

// Language changed in Settings: translate what is missing, then redraw.
async function switchLanguage() {
  await loadLang();
  applyStatic();
  if (document.querySelector('.onb')) return showOnboarding();
  if (!state.raw.length) return load();
  if (getLang() === 'ko') state.ko = await ensureKorean(state.raw);
  applyLanguage();
  if (state.cal.open) renderCalendar();
  renderList({ scrollTop: document.getElementById('lst')?.scrollTop || 0 });
}

// ---------- list ----------

async function interests() {
  const { interests = [] } = await chrome.storage.local.get('interests');
  return interests;
}

const isDone = (it) => !!state.done[it.id];
const isHidden = (it) => !!state.hidden[it.id];
const activeItems = () => state.items.filter((it) => !isDone(it) && !isHidden(it));

function visibleItems() {
  const active = activeItems();
  return state.filter === 'unread' ? active.filter((it) => it.unread) : active;
}

function doneItems() {
  return state.items.filter((it) => isDone(it) && !isHidden(it)).sort((a, b) => state.done[b.id] - state.done[a.id]);
}

// Rows fold their real height when they leave, so neighbours close the gap.
const row = (it, inner) => `<div class="rw" data-row="${esc(it.id)}"><div><div class="rwi">${inner}</div></div></div>`;

// The ranking reason, broken only between its parts so a line never starts with "·".
function reasonHtml(parts) {
  return parts
    .filter(Boolean)
    .map((part, i, all) => `<span class="rp">${esc(part)}${i < all.length - 1 ? ' ·' : ''}</span>`)
    .join(' ');
}

function actionCard(it) {
  return `
    <div class="tk act" data-open="${esc(it.id)}" role="button" tabindex="0">
      <button class="ck" data-done="${esc(it.id)}" aria-label="${esc(t('card.markDone'))}" title="${esc(t('card.markDone'))}">${ICON.tick}</button>
      <div class="bd">
        <div class="tt">${esc(it.title)}</div>
        <div class="fr"><b>${esc(senderName(it.from))}</b></div>
        <div class="mt" style="margin-top: 7px;"><span class="dt ${it.urgent ? 'red' : ''}">${ICON.cal}<span>${reasonHtml(it.reason.split(' · '))}</span></span></div>
      </div>
      ${it.action_label ? `<div class="cta"><button class="ab ${it.urgent ? 'hot' : ''}" data-mail="${esc(it.threadId)}">${esc(it.action_label)}</button></div>` : ''}
    </div>`;
}

function updateCard(it) {
  const right = it.action_label
    ? `<button class="ab" data-mail="${esc(it.threadId)}">${esc(it.action_label)}</button>`
    : `<span>${esc(senderName(it.from))}</span>`;
  return `
    <div class="tk ${it.unread ? '' : 'rd'} ${state.selected.has(it.id) ? 'picked' : ''}" data-open="${esc(it.id)}" data-pick="${esc(it.id)}" role="button" tabindex="0">
      <span class="slot" aria-hidden="true"><span class="ck ${state.selected.has(it.id) ? 'on' : ''}">${ICON.tick}</span></span>
      <div class="bd">
        <div class="tt">${esc(it.title)}</div>
        <div class="pv">${esc(it.summary)}</div>
        <div class="mt"><span class="dt ${it.urgent ? 'red' : ''}">${reasonHtml([receivedLabel(it.date), ...it.reason.split(' · ')])}</span>${right}</div>
      </div>
    </div>`;
}

function doneCard(it) {
  return `
    <div class="tk rd isdone" data-open="${esc(it.id)}" role="button" tabindex="0">
      <span class="ck on" aria-hidden="true">${ICON.tick}</span>
      <div class="bd">
        <div class="tt">${esc(it.title)}</div>
        <div class="mt"><span class="dt">${reasonHtml([t('card.doneAgo', { when: receivedLabel(state.done[it.id]) }), catLabel(it.category)])}</span><button class="ab" data-undone="${esc(it.id)}">${esc(t('card.undo'))}</button></div>
      </div>
    </div>`;
}

let detailKeyHandler = null;

async function renderList({ arrive = false, scrollTop = 0 } = {}) {
  if (detailKeyHandler) document.removeEventListener('keydown', detailKeyHandler);
  detailKeyHandler = null;
  const groups = rankUpdates(visibleItems(), await interests());
  const countAll = activeItems().length;
  const countUnread = activeItems().filter((it) => it.unread).length;
  const done = doneItems();
  const doneSection = done.length
    ? `<button class="sh shBtn ${state.showDone ? 'open' : ''}" id="doneToggle" aria-expanded="${state.showDone}">${esc(t('group.done'))} <small>${done.length}</small>${ICON.chevron}</button>` +
      (state.showDone ? done.map((it) => row(it, doneCard(it))).join('') : '')
    : '';

  const sections = groups
    .map(
      (g, i) =>
        `<div class="sh ${i === 0 ? 'first' : ''}">${esc(g.label)} <small>${g.items.length}</small></div>` +
        g.items.map((it) => row(it, g.key === 'action' ? actionCard(it) : updateCard(it))).join('')
    )
    .join('');

  const empty =
    state.filter === 'unread'
      ? `<div class="center"><div><h2>${esc(t('empty.unreadTitle'))}</h2><p>${esc(t('empty.unreadText'))}</p></div></div>`
      : `<div class="center">${WINK_SVG}<div><h2>${esc(t('empty.title'))}</h2><p>${esc(t('empty.text'))}</p></div></div>`;

  const failedNote = state.failed.length
    ? `<br>${esc(t('foot.failed', { n: state.failed.length }))} · <button class="ab" id="retry" style="height: 22px; padding: 0 8px; font-size: 10.5px;">${esc(t('foot.retry'))}</button>`
    : '';

  app.innerHTML = `
    <div class="titleRow"><h1>${esc(t('list.title'))}</h1>
      ${activeItems().length ? `<button class="txt" id="selectToggle">${esc(state.selecting ? t('list.cancel') : t('list.select'))}</button>` : ''}
    </div>
    <div class="fadeTop" id="fadeTop" aria-hidden="true"></div>
    <div class="lst" id="lst">
      <div class="views" role="tablist">
        <span class="pill" id="pill" aria-hidden="true"></span>
        <button class="tab ${state.filter === 'all' ? 'on' : ''}" data-filter="all" role="tab">${esc(t('list.all'))} ${countAll}</button>
        <button class="tab ${state.filter === 'unread' ? 'on' : ''}" data-filter="unread" role="tab">${esc(t('list.unread'))} ${countUnread}</button>
      </div>
      ${groups.length ? sections : empty}
      ${doneSection}
      ${state.items.length ? `<div class="foot">${esc(t('foot.count', { n: state.items.length }))}${failedNote}</div>` : ''}
    </div>
    <div class="selWrap" id="selWrap"><div><div style="padding: 8px 0 12px;">
      <div class="selBar">
        <button class="selAll" id="selAll"><span class="ck" id="selAllCk">${ICON.tick}</span><span id="selText">${esc(t('sel.all'))}</span></button>
        <div style="display: flex; align-items: center; gap: 4px;">
          <button class="ab" id="discard">${esc(t('sel.discard'))}</button>
          <button class="ib" id="selDone" aria-label="${esc(t('sel.close'))}"><svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"></path></svg></button>
        </div>
      </div>
    </div></div></div>`;
  app.classList.toggle('sel', state.selecting);
  updateSelBar();

  app.classList.toggle('arrive', arrive);
  if (arrive) {
    [...document.getElementById('lst').children].forEach((el, i) => el.style.setProperty('--k', Math.min(i, 14)));
    setTimeout(() => app.classList.remove('arrive'), 1300);
  }

  const lst = document.getElementById('lst');
  lst.scrollTop = scrollTop;
  const fade = () => document.getElementById('fadeTop')?.classList.toggle('on', lst.scrollTop > 4);
  lst.addEventListener('scroll', fade);
  fade();
  placePill(false);

  document.getElementById('retry')?.addEventListener('click', () => load());
  document.getElementById('selectToggle')?.addEventListener('click', () => setSelecting(!state.selecting));
  document.getElementById('selDone').addEventListener('click', () => setSelecting(false));
  document.getElementById('selAll').addEventListener('click', toggleSelectAll);
  document.getElementById('discard').addEventListener('click', discardSelected);
  document.getElementById('doneToggle')?.addEventListener('click', () => {
    state.showDone = !state.showDone;
    renderList({ scrollTop: lst.scrollTop });
  });
}

// ---------- select and discard ----------

// Only updates without a required action can be discarded, as in the design:
// things to do stay until they are done.
const selectableIds = () =>
  [...app.querySelectorAll('[data-pick]')].map((el) => el.dataset.pick);

function setSelecting(on) {
  state.selecting = on;
  state.selected.clear();
  if (on) closeCalendar();
  app.classList.toggle('sel', on);
  app.querySelectorAll('.tk.picked').forEach((el) => el.classList.remove('picked'));
  app.querySelectorAll('.slot .ck.on').forEach((el) => el.classList.remove('on'));
  const btn = document.getElementById('selectToggle');
  if (btn) btn.textContent = on ? t('list.cancel') : t('list.select');
  updateSelBar();
}

function togglePick(id) {
  state.selected.has(id) ? state.selected.delete(id) : state.selected.add(id);
  const card = app.querySelector(`[data-pick="${CSS.escape(id)}"]`);
  card?.classList.toggle('picked', state.selected.has(id));
  card?.querySelector('.slot .ck')?.classList.toggle('on', state.selected.has(id));
  updateSelBar();
}

function toggleSelectAll() {
  const ids = selectableIds();
  const all = ids.length > 0 && ids.every((id) => state.selected.has(id));
  ids.forEach((id) => {
    if (all === state.selected.has(id)) togglePick(id);
  });
}

function updateSelBar() {
  const wrap = document.getElementById('selWrap');
  if (!wrap) return;
  wrap.classList.toggle('on', state.selecting);
  const ids = selectableIds();
  const n = state.selected.size;
  document.getElementById('selText').textContent = n ? t('sel.count', { n }) : t('sel.all');
  document.getElementById('selAllCk').classList.toggle('on', ids.length > 0 && n === ids.length);
  document.getElementById('discard').disabled = n === 0;
}

async function discardSelected() {
  const ids = [...state.selected];
  if (!ids.length) return;
  ids.forEach((id) => app.querySelector(`[data-row="${CSS.escape(id)}"]`)?.classList.add('off'));
  await new Promise((r) => setTimeout(r, 260));
  state.hidden = await setHidden(ids, true);
  state.selecting = false;
  state.selected.clear();
  renderList({ scrollTop: document.getElementById('lst')?.scrollTop || 0 });
  toast(t('toast.discarded', { n: ids.length }), async () => {
    state.hidden = await setHidden(ids, false);
    renderList({ scrollTop: document.getElementById('lst')?.scrollTop || 0 });
  });
}

// ---------- calendar ----------

const calPop = document.getElementById('calPop');
const calBtn = document.getElementById('calendar');

// Updates that have a deadline, keyed by local day "YYYY-M-D".
function deadlinesByDay() {
  const map = {};
  for (const it of activeItems()) {
    const d = parseDeadline(it.deadline);
    if (!d) continue;
    const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    (map[key] ||= []).push({ ...it, deadlineDate: d });
  }
  return map;
}

function renderCalendar() {
  const { month, day } = state.cal;
  const byDay = deadlinesByDay();
  const today = new Date();
  const y = month.getFullYear(), m = month.getMonth();
  const first = new Date(y, m, 1).getDay();
  const days = new Date(y, m + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < first; i++) cells.push('<span></span>');
  for (let d = 1; d <= days; d++) {
    const key = `${y}-${m}-${d}`;
    const isToday = today.getFullYear() === y && today.getMonth() === m && today.getDate() === d;
    const items = byDay[key] || [];
    const hot = items.some((it) => it.urgent);
    cells.push(
      `<button class="cd ${isToday ? 'today' : ''} ${day === key ? 'picked' : ''}" data-day="${key}" aria-label="${new Date(y, m, d).toLocaleDateString(locale(), { month: 'long', day: 'numeric' })}${items.length ? `, ${t('cal.countDue', { n: items.length })}` : ''}">${d}${
        items.length ? `<span class="cdot ${hot ? 'hot' : ''}" aria-hidden="true"></span>` : ''
      }</button>`
    );
  }
  const picked = day ? byDay[day] || [] : [];
  const pickedDate = day ? new Date(...day.split('-').map(Number)) : null;
  calPop.innerHTML = `
    <div class="calHead">
      <button class="ib" data-cal-step="-1" aria-label="${esc(t('cal.prev'))}"><svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"></polyline></svg></button>
      <span>${month.toLocaleString(locale(), { month: 'long', year: 'numeric' })}</span>
      <button class="ib" data-cal-step="1" aria-label="${esc(t('cal.next'))}"><svg viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"></polyline></svg></button>
    </div>
    <div class="calGrid wk">${(getLang() === 'ko' ? ['일', '월', '화', '수', '목', '금', '토'] : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']).map((w) => `<span>${w}</span>`).join('')}</div>
    <div class="calGrid">${cells.join('')}</div>
    <div class="calLine"></div>
    <div class="calList">
      <span class="calLabel">${esc(pickedDate ? t('cal.dueOn', { date: pickedDate.toLocaleDateString(locale(), { weekday: 'short', month: 'short', day: 'numeric' }) }) : t('cal.hint'))}</span>
      ${
        pickedDate
          ? picked.length
            ? picked
                .sort((a, b) => a.deadlineDate - b.deadlineDate)
                .map(
                  (it) => `<button class="calEv" data-cal-open="${esc(it.id)}">
                    <span class="t">${esc(it.title)}</span>
                    <span class="s ${it.urgent ? 'red' : ''}">${esc(senderName(it.from))} · ${esc(it.deadlineDate.toLocaleTimeString(locale(), { hour: 'numeric', minute: '2-digit' }))}</span>
                  </button>`
                )
                .join('')
            : `<span class="calNone">${esc(t('cal.none'))}</span>`
          : ''
      }
    </div>`;
}

function openCalendar() {
  if (state.selecting) setSelecting(false);
  const now = new Date();
  state.cal = { open: true, month: state.cal.month || new Date(now.getFullYear(), now.getMonth(), 1), day: state.cal.day };
  renderCalendar();
  calPop.classList.add('on');
  calBtn.classList.add('open');
}

function closeCalendar() {
  state.cal.open = false;
  calPop.classList.remove('on');
  calBtn.classList.remove('open');
}

calBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  state.cal.open ? closeCalendar() : openCalendar();
});
calPop.addEventListener('click', (e) => {
  e.stopPropagation();
  const step = e.target.closest('[data-cal-step]');
  if (step) {
    const m = state.cal.month;
    state.cal.month = new Date(m.getFullYear(), m.getMonth() + Number(step.dataset.calStep), 1);
    return renderCalendar();
  }
  const dayBtn = e.target.closest('[data-day]');
  if (dayBtn) {
    state.cal.day = state.cal.day === dayBtn.dataset.day ? null : dayBtn.dataset.day;
    return renderCalendar();
  }
  const ev = e.target.closest('[data-cal-open]');
  if (ev) {
    closeCalendar();
    renderDetail(ev.dataset.calOpen);
  }
});
document.addEventListener('click', () => state.cal.open && closeCalendar());
document.addEventListener('keydown', (e) => e.key === 'Escape' && state.cal.open && closeCalendar());

// ---------- done ----------

let toastTimer = null;
function toast(text, onUndo) {
  const el = document.getElementById('toast');
  document.getElementById('toastText').textContent = text;
  const undo = document.getElementById('toastUndo');
  undo.onclick = () => {
    el.classList.remove('on');
    onUndo();
  };
  el.classList.add('on');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('on'), 4500);
}

// The check confirms first, holds long enough to be read, then the card folds
// away into Done and the rest of the list closes up.
async function markDone(id) {
  const rowEl = app.querySelector(`[data-row="${CSS.escape(id)}"]`);
  if (rowEl) {
    rowEl.querySelector('.tk')?.classList.add('done');
    rowEl.querySelector('.ck')?.classList.add('on');
    await new Promise((r) => setTimeout(r, 420));
    rowEl.classList.add('off');
    await new Promise((r) => setTimeout(r, 260));
  }
  state.done = await setDone(id, true);
  renderList({ scrollTop: document.getElementById('lst')?.scrollTop || 0 });
  toast(t('toast.done'), () => markUndone(id));
}

async function markUndone(id) {
  state.done = await setDone(id, false);
  renderList({ scrollTop: document.getElementById('lst')?.scrollTop || 0 });
}

function placePill(animate = true) {
  const on = app.querySelector('.tab.on');
  const pill = document.getElementById('pill');
  if (!on || !pill) return;
  if (!animate) pill.style.transition = 'none';
  pill.style.width = `${on.offsetWidth}px`;
  pill.style.transform = `translateX(${on.offsetLeft}px)`;
  if (!animate) requestAnimationFrame(() => (pill.style.transition = ''));
}

// One click handler for the whole panel.
app.addEventListener('click', (e) => {
  if (state.selecting && !e.target.closest('#selWrap, .titleRow, .views, #doneToggle')) {
    const pick = e.target.closest('[data-pick]');
    if (pick) togglePick(pick.dataset.pick);
    return;
  }
  const doneBtn = e.target.closest('[data-done]');
  if (doneBtn) {
    e.stopPropagation();
    return markDone(doneBtn.dataset.done);
  }
  const undoneBtn = e.target.closest('[data-undone]');
  if (undoneBtn) {
    e.stopPropagation();
    return markUndone(undoneBtn.dataset.undone);
  }
  const mail = e.target.closest('[data-mail]');
  if (mail) {
    e.stopPropagation();
    return openInGmail(mail.dataset.mail);
  }
  const tab = e.target.closest('[data-filter]');
  if (tab) {
    state.filter = tab.dataset.filter;
    app.querySelectorAll('.tab').forEach((t) => t.classList.toggle('on', t === tab));
    placePill(true);
    setTimeout(() => renderList(), 140);
    return;
  }
  const card = e.target.closest('[data-open]');
  if (card && !card.classList.contains('still') && !e.target.closest('.detail')) return renderDetail(card.dataset.open);
});
app.addEventListener('keydown', (e) => {
  const card = e.target.closest?.('[data-open]');
  if (card && state.selecting && card.dataset.pick && e.target === card && (e.key === 'Enter' || e.key === ' ')) {
    e.preventDefault();
    return togglePick(card.dataset.pick);
  }
  if (card && !state.selecting && e.target === card && !card.classList.contains('still') && (e.key === 'Enter' || e.key === ' ')) {
    e.preventDefault();
    renderDetail(card.dataset.open);
  }
});

// ---------- detail ----------

function fullDate(d) {
  return d.toLocaleString(locale(), { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}

async function renderDetail(id) {
  const listScroll = document.getElementById('lst')?.scrollTop || 0;
  const groups = rankUpdates(state.items.filter((x) => !isHidden(x)), await interests());
  const all = groups.flatMap((g) => g.items.map((it) => ({ ...it, group: g.key })));
  const it = all.find((x) => x.id === id);
  if (!it) return;
  const done = isDone(it);
  origShown = null;
  setSelecting(false);
  const others = visibleItems().filter((x) => x.id !== id).length;

  const cardHtml = done ? doneCard(it) : it.group === 'action' ? actionCard(it) : updateCard(it);
  const card = cardHtml.replace('class="tk', 'class="tk still').replace(/<button class="ck"[^>]*>.*?<\/button>/, '');
  const deadline = parseDeadline(it.deadline);
  const facts = [
    deadline
      ? `<div class="fact ${it.urgent ? 'red' : ''}">${ICON.calFact}<span>${esc(t('detail.due', { date: fullDate(deadline) }))}</span></div>`
      : '',
    ...(it.key_details || []).map((d) => `<div class="fact">${ICON.doc}<span>${esc(d)}</span></div>`),
    `<div class="fact">${ICON.tag}<span>${esc(it.reason)}</span></div>`,
  ].join('');

  app.innerHTML = `
    <div class="detail" id="detail">
      <button class="stk" id="back" aria-label="${esc(t('detail.back'))}">
        <span class="e2"></span><span class="e1"></span>
        <span class="face"><span>${esc(others > 1 ? t('detail.more', { n: others }) : others === 1 ? t('detail.moreOne') : t('detail.all'))}</span>${ICON.chevron}</span>
      </button>
      ${card}
      <div class="sbox">
        <div class="dotRow" aria-hidden="true"><i></i><i></i><i></i></div>
        <div class="sgrid"><div>
          <div class="sin">
            <div class="cap" style="color: var(--green);">${esc(t('detail.summary'))}</div>
            <div class="prose">${esc(it.summary)}</div>
            <div style="display: flex; flex-direction: column; gap: 8px;">${facts}</div>
            <button class="goMail" data-mail="${esc(it.threadId)}">${esc(t('detail.goMail'))}${ICON.out}</button>
          </div>
        </div></div>
      </div>
      <span class="cap late" style="padding-left: 2px;">${esc(senderName(it.from))} · ${esc(fullDate(new Date(it.date)))}</span>
      <div class="late" style="display: flex; gap: 6px; flex-wrap: wrap;">
        ${done
          ? `<button class="q" id="doneBtn">${esc(t('detail.moveBack'))}</button>`
          : `<button class="ab pri" id="doneBtn" style="height: 30px;"><span class="tickIc">${ICON.tick}</span>${esc(t('detail.markDone'))}</button>`}
        <button class="q" id="showOrig">${esc(t('detail.showOrig'))}</button>
        ${getLang() === 'ko' ? `<button class="q" id="showKo">${esc(t('detail.translate'))}</button>` : ''}
      </div>
      <div id="orig"></div>
    </div>`;

  const detail = document.getElementById('detail');
  // The typing bubble opens up into the summary, as an incoming message does.
  setTimeout(() => detail.classList.add('ready'), 380);

  const back = () => renderList({ scrollTop: listScroll });
  const onKey = (e) => e.key === 'Escape' && back();
  detailKeyHandler = onKey;
  document.addEventListener('keydown', onKey);
  document.getElementById('back').addEventListener('click', back);
  document.getElementById('doneBtn').addEventListener('click', async () => {
    if (done) return markUndone(id);
    state.done = await setDone(id, true);
    renderList({ scrollTop: listScroll });
    toast(t('toast.done'), () => markUndone(id));
  });
  document.getElementById('showOrig').addEventListener('click', () => showOriginal(it, false));
  document.getElementById('showKo')?.addEventListener('click', () => showOriginal(it, true));
}

// The original text is fetched from Gmail on demand and only kept on screen, never stored.
// With `korean`, Claude translates it first (kept in memory only).
let origShown = null; // null | 'orig' | 'ko'
async function showOriginal(it, korean) {
  const box = document.getElementById('orig');
  const origBtn = document.getElementById('showOrig');
  const koBtn = document.getElementById('showKo');
  const mode = korean ? 'ko' : 'orig';
  const reset = () => {
    origBtn.textContent = t('detail.showOrig');
    if (koBtn) koBtn.textContent = t('detail.translate');
  };
  if (box.innerHTML && origShown === mode) {
    box.innerHTML = '';
    origShown = null;
    return reset();
  }
  reset();
  const btn = korean ? koBtn : origBtn;
  btn.textContent = korean ? t('detail.translating') : t('detail.loading');
  try {
    const mail = await getMessageFull(state.token || (await getGoogleToken()), it.id);
    const body = mail.body || mail.snippet;
    const shown = korean ? await translateEmail(it.id, `Subject: ${mail.subject}\n\n${body}`) : body;
    box.innerHTML = `
      <div class="orig">
        <div class="meta"><b>${esc(mail.subject)}</b><br>${esc(mail.from)}<br>${esc(fullDate(new Date(mail.date)))}
          ${korean ? `<br><span class="cap" style="color: var(--green);">${esc(t('detail.translatedNote'))}</span>` : ''}</div>
        <div class="body">${esc(shown)}</div>
      </div>`;
    origShown = mode;
    reset();
    btn.textContent = t('detail.hideOrig');
  } catch (err) {
    reset();
    box.innerHTML = `<div class="orig"><div class="meta">${esc(t('detail.loadFailed', { msg: err.message }))}</div></div>`;
  }
}

// Opens the email in the Gmail tab next to the panel.
async function openInGmail(threadId) {
  const email = await getSignedInEmail();
  const url = `https://mail.google.com/mail/?authuser=${encodeURIComponent(email)}#all/${threadId}`;
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab) chrome.tabs.update(tab.id, { url });
  else chrome.tabs.create({ url });
}

// Settings saved in the other tab: re-sort for new interests, or start once keys are added.
chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== 'local') return;
  if (changes.lang && !state.loading) return switchLanguage();
  if (state.loading) return;
  const lst = document.getElementById('lst');
  if (changes.hidden && lst) state.hidden = changes.hidden.newValue || {};
  if ((changes.interests || changes.hidden) && lst) renderList({ scrollTop: lst.scrollTop });
  else if ((changes.claudeApiKey || changes.googleClientId) && !state.items.length) load();
});

loadLang().then(() => {
  applyStatic();
  load();
});
