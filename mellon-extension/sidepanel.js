import { getGoogleClientId, getGoogleToken, getSignedInEmail, rememberEmail, signOut } from './auth.js';
import { getProfile, listRecentIds, getMessageMeta, getMessageFull } from './gmail.js';
import { analyzeEmail, getCachedAnalysis, getClaudeKey } from './claude.js';

const app = document.getElementById('app');
document.getElementById('settings').addEventListener('click', () => chrome.runtime.openOptionsPage());

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
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

function analysisHtml(a) {
  return `
    <div class="analysis">
      <p><strong>${escapeHtml(a.title)}</strong></p>
      <p>${escapeHtml(a.summary)}</p>
      <p class="muted">
        Action: ${a.action_label ? escapeHtml(a.action_label) : 'none'} (${a.action_required ? 'must do' : 'optional'})
        · Due: ${a.deadline ? escapeHtml(a.deadline) : 'none'}
        · Category: ${escapeHtml(a.category)}
      </p>
      ${a.key_details.length ? `<ul>${a.key_details.map((d) => `<li>${escapeHtml(d)}</li>`).join('')}</ul>` : ''}
      <p class="muted">${a.cached ? 'Saved result (not sent to Claude again).' : 'Fresh result from Claude, now saved.'}</p>
    </div>`;
}

async function summarize(token, id, box, button) {
  if (!(await getClaudeKey())) {
    box.innerHTML = '<p>Add your Claude API key in Settings first.</p>';
    return;
  }
  button.disabled = true;
  box.innerHTML = '<p class="muted">Asking Claude…</p>';
  try {
    let analysis = await getCachedAnalysis(id);
    analysis = analysis
      ? { ...analysis, cached: true }
      : await analyzeEmail(await getMessageFull(token, id));
    box.innerHTML = analysisHtml(analysis);
  } catch (err) {
    box.innerHTML = `<p>Could not summarize: ${escapeHtml(err.message)}</p>`;
  } finally {
    button.disabled = false;
  }
}

async function render() {
  if (!(await getGoogleClientId())) {
    return showMessage('First, add your Google client ID in Settings.', 'Open settings', () =>
      chrome.runtime.openOptionsPage()
    );
  }

  let token;
  try {
    token = await getGoogleToken();
  } catch {
    return showMessage('Sign in with Google to read your mail (read-only).', 'Sign in with Google', signIn);
  }

  app.innerHTML = '<p class="muted">Loading your mail…</p>';
  try {
    const ids = await listRecentIds(token, { days: 7, max: 10 });
    const mails = await Promise.all(ids.map((id) => getMessageMeta(token, id)));
    const email = await getSignedInEmail();
    app.innerHTML = `
      <p class="muted">Signed in as ${escapeHtml(email)} · <button id="signout" class="link">Sign out</button></p>
      <ol class="subjects">
        ${mails
          .map(
            (m) => `<li data-id="${escapeHtml(m.id)}"><strong>${escapeHtml(m.subject)}</strong><br>
              <span class="muted">${escapeHtml(m.from)} · ${new Date(m.date).toLocaleString()}</span><br>
              <button class="summarize secondary">Summarize</button>
              <div class="result"></div></li>`
          )
          .join('')}
      </ol>
      ${mails.length ? '' : '<p>No mail in the last 7 days.</p>'}`;
    document.getElementById('signout').addEventListener('click', async () => {
      await signOut();
      render();
    });
    app.querySelectorAll('li[data-id]').forEach((li) => {
      const button = li.querySelector('.summarize');
      button.addEventListener('click', () => summarize(token, li.dataset.id, li.querySelector('.result'), button));
    });
  } catch (err) {
    if (err.message === 'SIGNED_OUT') return render();
    showMessage(`Could not read mail: ${err.message}`, 'Try again', render);
  }
}

render();
