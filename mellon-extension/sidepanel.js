import { getGoogleClientId, getGoogleToken, getSignedInEmail, rememberEmail } from './auth.js';
import { getProfile, getMessageFull } from './gmail.js';
import { getClaudeKey } from './claude.js';
import { loadUpdates } from './updates.js';
import { rankUpdates, senderName, receivedLabel, parseDeadline } from './rank.js';

const app = document.getElementById('app');
const refreshBtn = document.getElementById('refresh');

const state = {
  token: null,
  items: [],
  failed: [],
  filter: 'all', // 'all' | 'unread'
  loading: false,
};

const ICON = {
  cal: '<svg class="ic" viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="16" rx="3"></rect><path d="M3 10h18M8 3v4M16 3v4"></path></svg>',
  calFact: '<svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="16" rx="3"></rect><path d="M3 10h18M8 3v4M16 3v4"></path></svg>',
  doc: '<svg viewBox="0 0 24 24"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"></path><path d="M14 3v5h5"></path></svg>',
  tag: '<svg viewBox="0 0 24 24"><path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8z"></path><circle cx="7.5" cy="7.5" r="1.5"></circle></svg>',
  chevron: '<svg viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"></polyline></svg>',
  out: '<svg viewBox="0 0 24 24"><path d="M8 16L17 7M9 7h8v8"></path></svg>',
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
    showCenter({ title: 'Sign-in did not finish', text: err.message, button: 'Try again', onClick: signIn });
  }
}

// ---------- loading ----------

const SCAN_TEXT = 'Scanning your inbox...';

function showLoading() {
  app.innerHTML = `
    <div class="ld" role="status" aria-label="Scanning your inbox">
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

async function load() {
  if (state.loading) return;
  if (!(await getGoogleClientId()) || !(await getClaudeKey())) {
    return showCenter({
      title: 'Almost ready',
      text: 'Add your Google client ID and Claude API key in Settings.',
      button: 'Open settings',
      onClick: openSettings,
    });
  }
  try {
    state.token = await getGoogleToken();
  } catch {
    return showCenter({
      title: 'Sign in to Gmail',
      text: 'Mellon reads your recent mail (read-only) and sorts it into Updates.',
      button: 'Sign in with Google',
      onClick: signIn,
    });
  }

  state.loading = true;
  refreshBtn.classList.add('spin');
  showLoading();
  const started = Date.now();
  try {
    const { items, failed } = await loadUpdates(state.token, ({ done, total }) => showProgress(done, total));
    state.items = items;
    state.failed = failed;
    // Let the caption finish typing before the list deals in, as in the design.
    await new Promise((r) => setTimeout(r, Math.max(0, 1900 - (Date.now() - started))));
    renderList({ arrive: true });
  } catch (err) {
    if (err.message === 'SIGNED_OUT') {
      state.loading = false;
      refreshBtn.classList.remove('spin');
      return load();
    }
    showCenter({ title: 'Could not load updates', text: err.message, button: 'Try again', onClick: load });
  } finally {
    state.loading = false;
    refreshBtn.classList.remove('spin');
  }
}

// ---------- list ----------

async function interests() {
  const { interests = [] } = await chrome.storage.local.get('interests');
  return interests;
}

function visibleItems() {
  return state.filter === 'unread' ? state.items.filter((it) => it.unread) : state.items;
}

// The ranking reason, broken only between its parts so a line never starts with "·".
function reasonHtml(parts) {
  return parts
    .filter(Boolean)
    .map((part, i, all) => `<span class="rp">${esc(part)}${i < all.length - 1 ? ' ·' : ''}</span>`)
    .join(' ');
}

function actionCard(it) {
  return `
    <div class="rw"><div class="tk act" data-open="${esc(it.id)}" role="button" tabindex="0">
      <div class="bd">
        <div class="tt">${esc(it.title)}</div>
        <div class="fr"><b>${esc(senderName(it.from))}</b></div>
        <div class="mt" style="margin-top: 7px;"><span class="dt ${it.urgent ? 'red' : ''}">${ICON.cal}<span>${reasonHtml(it.reason.split(' · '))}</span></span></div>
      </div>
      ${it.action_label ? `<div class="cta"><button class="ab ${it.urgent ? 'hot' : ''}" data-mail="${esc(it.threadId)}">${esc(it.action_label)}</button></div>` : ''}
    </div></div>`;
}

function updateCard(it) {
  const right = it.action_label
    ? `<button class="ab" data-mail="${esc(it.threadId)}">${esc(it.action_label)}</button>`
    : `<span>${esc(senderName(it.from))}</span>`;
  return `
    <div class="rw"><div class="tk ${it.unread ? '' : 'rd'}" data-open="${esc(it.id)}" role="button" tabindex="0">
      <div class="bd">
        <div class="tt">${esc(it.title)}</div>
        <div class="pv">${esc(it.summary)}</div>
        <div class="mt"><span class="dt ${it.urgent ? 'red' : ''}">${reasonHtml([receivedLabel(it.date), ...it.reason.split(' · ')])}</span>${right}</div>
      </div>
    </div></div>`;
}

async function renderList({ arrive = false, scrollTop = 0 } = {}) {
  const groups = rankUpdates(visibleItems(), await interests());
  const countAll = state.items.length;
  const countUnread = state.items.filter((it) => it.unread).length;

  const sections = groups
    .map(
      (g, i) =>
        `<div class="sh ${i === 0 ? 'first' : ''}">${esc(g.label)} <small>${g.items.length}</small></div>` +
        g.items.map(g.key === 'action' ? actionCard : updateCard).join('')
    )
    .join('');

  const empty =
    state.filter === 'unread'
      ? `<div class="center"><div><h2>No unread updates</h2><p>Everything from the last 7 days has been opened.</p></div></div>`
      : `<div class="center">${WINK_SVG}<div><h2>All clear</h2><p>You're up to date.</p></div></div>`;

  const failedNote = state.failed.length
    ? `<br>${state.failed.length} could not be read · <button class="ab" id="retry" style="height: 22px; padding: 0 8px; font-size: 10.5px;">Retry</button>`
    : '';

  app.innerHTML = `
    <div class="titleRow"><h1>Updates</h1></div>
    <div class="fadeTop" id="fadeTop" aria-hidden="true"></div>
    <div class="lst" id="lst">
      <div class="views" role="tablist">
        <span class="pill" id="pill" aria-hidden="true"></span>
        <button class="tab ${state.filter === 'all' ? 'on' : ''}" data-filter="all" role="tab">All ${countAll}</button>
        <button class="tab ${state.filter === 'unread' ? 'on' : ''}" data-filter="unread" role="tab">Unread ${countUnread}</button>
      </div>
      ${groups.length ? sections : empty}
      ${countAll ? `<div class="foot">${countAll} emails · last 7 days${failedNote}</div>` : ''}
    </div>`;

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
  if (card && !card.classList.contains('still')) return renderDetail(card.dataset.open);
});
app.addEventListener('keydown', (e) => {
  const card = e.target.closest?.('[data-open]');
  if (card && (e.key === 'Enter' || e.key === ' ')) {
    e.preventDefault();
    renderDetail(card.dataset.open);
  }
});

// ---------- detail ----------

function fullDate(d) {
  return d.toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}

async function renderDetail(id) {
  const listScroll = document.getElementById('lst')?.scrollTop || 0;
  const groups = rankUpdates(visibleItems(), await interests());
  const all = groups.flatMap((g) => g.items.map((it) => ({ ...it, group: g.key })));
  const it = all.find((x) => x.id === id);
  if (!it) return;
  const others = all.length - 1;

  const card = (it.group === 'action' ? actionCard(it) : updateCard(it)).replace('class="tk', 'class="tk still');
  const deadline = parseDeadline(it.deadline);
  const facts = [
    deadline
      ? `<div class="fact ${it.urgent ? 'red' : ''}">${ICON.calFact}<span>Due ${esc(fullDate(deadline))}</span></div>`
      : '',
    ...(it.key_details || []).map((d) => `<div class="fact">${ICON.doc}<span>${esc(d)}</span></div>`),
    `<div class="fact">${ICON.tag}<span>${esc(it.reason)}</span></div>`,
  ].join('');

  app.innerHTML = `
    <div class="detail" id="detail">
      <button class="stk" id="back" aria-label="Back to all updates">
        <span class="e2"></span><span class="e1"></span>
        <span class="face"><span>${others > 0 ? `${others} more update${others === 1 ? '' : 's'}` : 'All updates'}</span>${ICON.chevron}</span>
      </button>
      ${card}
      <div class="sbox">
        <div class="dotRow" aria-hidden="true"><i></i><i></i><i></i></div>
        <div class="sgrid"><div>
          <div class="sin">
            <div class="cap" style="color: var(--green);">Summary by Mellon</div>
            <div class="prose">${esc(it.summary)}</div>
            <div style="display: flex; flex-direction: column; gap: 8px;">${facts}</div>
            <button class="goMail" data-mail="${esc(it.threadId)}">Go to email${ICON.out}</button>
          </div>
        </div></div>
      </div>
      <span class="cap late" style="padding-left: 2px;">${esc(senderName(it.from))} · ${esc(fullDate(new Date(it.date)))}</span>
      <button class="q late" id="showOrig">Show original email</button>
      <div id="orig"></div>
    </div>`;

  const detail = document.getElementById('detail');
  // The typing bubble opens up into the summary, as an incoming message does.
  setTimeout(() => detail.classList.add('ready'), 380);

  const back = () => {
    document.removeEventListener('keydown', onKey);
    renderList({ scrollTop: listScroll });
  };
  const onKey = (e) => e.key === 'Escape' && back();
  document.addEventListener('keydown', onKey);
  document.getElementById('back').addEventListener('click', back);
  detail.addEventListener('click', (e) => {
    const mail = e.target.closest('[data-mail]');
    if (mail) openInGmail(mail.dataset.mail);
  });
  document.getElementById('showOrig').addEventListener('click', () => showOriginal(it));
}

// The original text is fetched from Gmail on demand and only kept on screen, never stored.
async function showOriginal(it) {
  const box = document.getElementById('orig');
  const btn = document.getElementById('showOrig');
  if (box.innerHTML) {
    box.innerHTML = '';
    btn.textContent = 'Show original email';
    return;
  }
  btn.textContent = 'Loading…';
  try {
    const mail = await getMessageFull(state.token || (await getGoogleToken()), it.id);
    box.innerHTML = `
      <div class="orig">
        <div class="meta"><b>${esc(mail.subject)}</b><br>${esc(mail.from)}<br>${esc(fullDate(new Date(mail.date)))}</div>
        <div class="body">${esc(mail.body || mail.snippet)}</div>
      </div>`;
    btn.textContent = 'Hide original email';
  } catch (err) {
    btn.textContent = 'Show original email';
    box.innerHTML = `<div class="orig"><div class="meta">Could not load the email: ${esc(err.message)}</div></div>`;
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
  if (area !== 'local' || state.loading) return;
  const lst = document.getElementById('lst');
  if (changes.interests && lst) renderList({ scrollTop: lst.scrollTop });
  else if ((changes.claudeApiKey || changes.googleClientId) && !state.items.length) load();
});

load();
