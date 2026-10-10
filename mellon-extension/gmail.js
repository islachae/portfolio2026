// Read-only Gmail calls. Only GET requests: nothing is sent, changed or deleted.
import { forgetToken } from './auth.js';

const BASE = 'https://gmail.googleapis.com/gmail/v1/users/me/';

async function gmailGet(token, path) {
  const res = await fetch(BASE + path, { headers: { Authorization: `Bearer ${token}` } });
  if (res.status === 401) {
    await forgetToken();
    throw new Error('SIGNED_OUT');
  }
  if (!res.ok) throw new Error(`Gmail error ${res.status}: ${await res.text()}`);
  return res.json();
}

export async function getProfile(token) {
  return gmailGet(token, 'profile');
}

// Ids of inbox mail from the last `days` days, newest first.
export async function listRecentIds(token, { days = 7, max = 30 } = {}) {
  const q = encodeURIComponent(`in:inbox newer_than:${days}d`);
  const data = await gmailGet(token, `messages?q=${q}&maxResults=${max}`);
  return (data.messages || []).map((m) => m.id);
}

function header(msg, name) {
  const h = (msg.payload?.headers || []).find((x) => x.name.toLowerCase() === name.toLowerCase());
  return h ? h.value : '';
}

// Subject, sender and date only (no body).
export async function getMessageMeta(token, id) {
  const msg = await gmailGet(
    token,
    `messages/${id}?format=metadata&metadataHeaders=Subject&metadataHeaders=From&metadataHeaders=Date`
  );
  return {
    id,
    threadId: msg.threadId,
    subject: header(msg, 'Subject') || '(no subject)',
    from: header(msg, 'From'),
    date: Number(msg.internalDate),
    snippet: msg.snippet || '',
  };
}
