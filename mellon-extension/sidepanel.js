import { getGoogleClientId, getGoogleToken, getSignedInEmail, rememberEmail, signOut } from './auth.js';
import { getProfile } from './gmail.js';
import { getClaudeKey } from './claude.js';
import { loadUpdates } from './updates.js';
import { rankUpdates, senderName } from './rank.js';

const app = document.getElementById('app');
document.getElementById('settings').addEventListener('click', () => chrome.runtime.openOptionsPage());

function escapeHtml(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function showMessage(text, buttonLabel, onClick) {
  app.innerHTML = `<p>${escapeHtml(text)}</p>${buttonLabel ? `<button id="cta">${escapeHtml(buttonLabel)}</button>` : ''}`;
  if (buttonLabel) document.getElementById('cta').addEventListener('click', onClick);
}

async function signIn() {
  try {
    const token = await getGoogleToken({ interactive: true });
    const profile = await getProfile(token);
    await rememberEmail(profile.emailAddress);
    render();
  } catch (err) {
    showMessage(`Sign-in failed: ${err.message}`, 'Try again', signIn);
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

function cardHtml(it) {
  return `
    <li class="card" data-thread="${escapeHtml(it.threadId)}">
      <div class="card-title">${escapeHtml(it.title)}</div>
      <div class="muted">${escapeHtml(senderName(it.from))}</div>
      <div class="reason ${it.urgent ? 'urgent' : ''}">${escapeHtml(it.reason)}</div>
      ${it.action_label ? `<button class="action secondary">${escapeHtml(it.action_label)}</button>` : ''}
    </li>`;
}

async function render() {
  if (!(await getGoogleClientId())) {
    return showMessage('First, add your Google client ID in Settings.', 'Open settings', () =>
      chrome.runtime.openOptionsPage()
    );
  }
  if (!(await getClaudeKey())) {
    return showMessage('Add your Claude API key in Settings.', 'Open settings', () => chrome.runtime.openOptionsPage());
  }

  let token;
  try {
    token = await getGoogleToken();
  } catch {
    return showMessage('Sign in with Google to read your mail (read-only).', 'Sign in with Google', signIn);
  }

  app.innerHTML = '<p class="muted" id="progress">Checking your inbox…</p>';
  try {
    const { items, failed, sent } = await loadUpdates(token, ({ done, total }) => {
      const el = document.getElementById('progress');
      if (el) el.textContent = `Reading your mail… ${done} of ${total}`;
    });
    const { interests = [] } = await chrome.storage.local.get('interests');
    const groups = rankUpdates(items, interests);
    const email = await getSignedInEmail();

    app.innerHTML = `
      <p class="muted">
        ${escapeHtml(email)} · <button id="refresh" class="link">Refresh</button> · <button id="signout" class="link">Sign out</button><br>
        ${items.length} emails from the last 7 days · ${sent} newly read by Claude
      </p>
      ${groups
        .map((g) => `<h2>${escapeHtml(g.label)} <span class="muted">${g.items.length}</span></h2>
          <ol class="cards">${g.items.map(cardHtml).join('')}</ol>`)
        .join('')}
      ${items.length ? '' : '<p>No mail in the last 7 days.</p>'}
      ${failed.length ? `<p class="muted">${failed.length} emails could not be read: ${escapeHtml(failed[0].error)}</p>` : ''}`;

    document.getElementById('refresh').addEventListener('click', render);
    document.getElementById('signout').addEventListener('click', async () => {
      await signOut();
      render();
    });
    app.querySelectorAll('.card .action').forEach((btn) =>
      btn.addEventListener('click', () => openInGmail(btn.closest('.card').dataset.thread))
    );
  } catch (err) {
    if (err.message === 'SIGNED_OUT') return render();
    showMessage(`Could not load updates: ${err.message}`, 'Try again', render);
  }
}

render();
