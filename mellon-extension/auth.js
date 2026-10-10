// Google sign-in. Gmail access is read-only.
// Calendar access is asked for separately, only the first time the student uses
// "Put in my calendar", and only for calendars the student owns (calendar.events.owned).
// Access tokens live in chrome.storage.session, which is memory only:
// they disappear when Chrome closes and are never written to disk.

const GMAIL_READONLY = 'https://www.googleapis.com/auth/gmail.readonly';
export const CALENDAR_OWNED = 'https://www.googleapis.com/auth/calendar.events.owned';

export async function getGoogleClientId() {
  const { googleClientId } = await chrome.storage.local.get('googleClientId');
  return googleClientId || '';
}

export async function getSignedInEmail() {
  const { googleEmail } = await chrome.storage.local.get('googleEmail');
  return googleEmail || '';
}

async function requestToken(interactive, scope = GMAIL_READONLY, slot = 'googleToken') {
  const clientId = await getGoogleClientId();
  if (!clientId) throw new Error('NO_CLIENT_ID');
  const email = await getSignedInEmail();

  const url = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  url.searchParams.set('client_id', clientId);
  url.searchParams.set('response_type', 'token');
  url.searchParams.set('redirect_uri', chrome.identity.getRedirectURL());
  url.searchParams.set('scope', scope);
  url.searchParams.set('include_granted_scopes', 'true');
  if (email) url.searchParams.set('login_hint', email);
  url.searchParams.set('prompt', interactive ? (slot === 'googleToken' ? 'select_account' : 'consent') : 'none');

  const responseUrl = await chrome.identity.launchWebAuthFlow({
    url: url.toString(),
    interactive,
  });
  const params = new URLSearchParams(new URL(responseUrl).hash.slice(1));
  const token = params.get('access_token');
  if (!token) throw new Error(params.get('error') || 'NO_TOKEN');
  const expiresAt = Date.now() + Number(params.get('expires_in') || 3600) * 1000;
  // A calendar token must really carry the calendar permission (the student can untick it).
  if (scope !== GMAIL_READONLY && !(params.get('scope') || '').includes(scope)) throw new Error('CALENDAR_DENIED');
  await chrome.storage.session.set({ [slot]: { token, expiresAt } });
  return token;
}

export async function getCalendarToken({ interactive = false } = {}) {
  const { calendarToken } = await chrome.storage.session.get('calendarToken');
  if (calendarToken && calendarToken.expiresAt > Date.now() + 60_000) return calendarToken.token;
  try {
    return await requestToken(false, CALENDAR_OWNED, 'calendarToken');
  } catch (err) {
    if (!interactive) throw err;
    return requestToken(true, CALENDAR_OWNED, 'calendarToken');
  }
}

export async function forgetCalendarToken() {
  await chrome.storage.session.remove('calendarToken');
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
  await chrome.storage.session.remove(['googleToken', 'calendarToken']);
  await chrome.storage.local.remove('googleEmail');
}

export async function forgetToken() {
  await chrome.storage.session.remove('googleToken');
}
