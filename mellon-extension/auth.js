// Google sign-in. Asks for read-only Gmail access and nothing else.
// The access token lives in chrome.storage.session, which is memory only:
// it disappears when Chrome closes and is never written to disk.

const GMAIL_READONLY = 'https://www.googleapis.com/auth/gmail.readonly';

export async function getGoogleClientId() {
  const { googleClientId } = await chrome.storage.local.get('googleClientId');
  return googleClientId || '';
}

export async function getSignedInEmail() {
  const { googleEmail } = await chrome.storage.local.get('googleEmail');
  return googleEmail || '';
}

async function requestToken(interactive) {
  const clientId = await getGoogleClientId();
  if (!clientId) throw new Error('NO_CLIENT_ID');
  const email = await getSignedInEmail();

  const url = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  url.searchParams.set('client_id', clientId);
  url.searchParams.set('response_type', 'token');
  url.searchParams.set('redirect_uri', chrome.identity.getRedirectURL());
  url.searchParams.set('scope', GMAIL_READONLY);
  if (email) url.searchParams.set('login_hint', email);
  url.searchParams.set('prompt', interactive ? 'select_account' : 'none');

  const responseUrl = await chrome.identity.launchWebAuthFlow({
    url: url.toString(),
    interactive,
  });
  const params = new URLSearchParams(new URL(responseUrl).hash.slice(1));
  const token = params.get('access_token');
  if (!token) throw new Error(params.get('error') || 'NO_TOKEN');
  const expiresAt = Date.now() + Number(params.get('expires_in') || 3600) * 1000;
  await chrome.storage.session.set({ googleToken: { token, expiresAt } });
  return token;
}

// Returns a valid token. Tries a silent refresh first; only shows the
// Google window when `interactive` is true (i.e. the user clicked a button).
export async function getGoogleToken({ interactive = false } = {}) {
  const { googleToken } = await chrome.storage.session.get('googleToken');
  if (googleToken && googleToken.expiresAt > Date.now() + 60_000) return googleToken.token;
  try {
    return await requestToken(false);
  } catch (err) {
    if (!interactive) throw err;
    return requestToken(true);
  }
}

export async function rememberEmail(email) {
  await chrome.storage.local.set({ googleEmail: email });
}

export async function signOut() {
  await chrome.storage.session.remove('googleToken');
  await chrome.storage.local.remove('googleEmail');
}

export async function forgetToken() {
  await chrome.storage.session.remove('googleToken');
}
