import { getGoogleClientId, getGoogleToken, getSignedInEmail, rememberEmail, signOut } from './auth.js';
import { getProfile, listRecentIds, getMessageMeta } from './gmail.js';

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
            (m) => `<li><strong>${escapeHtml(m.subject)}</strong><br>
              <span class="muted">${escapeHtml(m.from)} · ${new Date(m.date).toLocaleString()}</span></li>`
          )
          .join('')}
      </ol>
      ${mails.length ? '' : '<p>No mail in the last 7 days.</p>'}`;
    document.getElementById('signout').addEventListener('click', async () => {
      await signOut();
      render();
    });
  } catch (err) {
    if (err.message === 'SIGNED_OUT') return render();
    showMessage(`Could not read mail: ${err.message}`, 'Try again', render);
  }
}

render();
