// "Put in my calendar": adds an update to the student's primary Google Calendar, only when
// they click the button. Also builds an .ics file for Apple Calendar or Outlook (no permission).
//
// What was added is remembered as `cal:<messageId>` = { eventId, link } in chrome.storage.local,
// so the same email is never added twice and can be taken out again.
import { getCalendarToken, forgetCalendarToken } from './auth.js';
import { parseDeadline, detailList } from './rank.js';
import { t } from './i18n.js';

const API = 'https://www.googleapis.com/calendar/v3/calendars/primary/events';
const pad = (n) => String(n).padStart(2, '0');
const tz = () => Intl.DateTimeFormat().resolvedOptions().timeZone;

const localDate = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const localDateTime = (d) => `${localDate(d)}T${pad(d.getHours())}:${pad(d.getMinutes())}:00`;
const addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);

function parseLocal(s) {
  const m = /^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2}))?/.exec(s || '');
  if (!m) return null;
  return { date: new Date(+m[1], +m[2] - 1, +m[3], m[4] ? +m[4] : 0, m[5] ? +m[5] : 0), hasTime: !!m[4] };
}

// What would go in the calendar for this update, or null if there is nothing with a date.
// An event to attend comes first; otherwise the deadline becomes a reminder.
export function calendarPlan(item, { titleOverride } = {}) {
  const ev = item.event;
  const start = ev?.has_event ? parseLocal(ev.start) : null;
  if (start) {
    const end = parseLocal(ev.end);
    const allDay = ev.all_day || !start.hasTime;
    return {
      kind: 'event',
      title: titleOverride || ev.title || item.title,
      location: ev.location || '',
      allDay,
      start: start.date,
      end: allDay
        ? addDays(end?.date || start.date, 1)
        : end?.hasTime && end.date > start.date
          ? end.date
          : new Date(start.date.getTime() + 60 * 60 * 1000),
    };
  }
  const due = parseDeadline(item.deadline);
  if (due && item.action_label) {
    // Due at end of day: an all-day reminder on that day. Due at a time: 30 minutes ending then.
    const endOfDay = due.getHours() === 23 && due.getMinutes() === 59;
    return {
      kind: 'deadline',
      title: `⏰ ${t('cal.dueTitle', { title: titleOverride || item.title })}`,
      location: '',
      allDay: endOfDay,
      start: endOfDay ? new Date(due.getFullYear(), due.getMonth(), due.getDate()) : new Date(due.getTime() - 30 * 60 * 1000),
      end: endOfDay ? addDays(due, 1) : due,
    };
  }
  return null;
}

function description(item, mailUrl) {
  const lines = [item.summary, '', ...detailList(item).map((d) => `• ${d.text}`)];
  if (mailUrl) lines.push('', `Email: ${mailUrl}`);
  lines.push('', 'Added by Mellon');
  return lines.join('\n').replace(/\n{3,}/g, '\n\n').trim();
}

export async function getAdded(id) {
  const key = `cal:${id}`;
  return (await chrome.storage.local.get(key))[key] || null;
}

async function calendarFetch(method, url, body) {
  const token = await getCalendarToken({ interactive: true });
  const res = await fetch(url, {
    method,
    headers: { Authorization: `Bearer ${token}`, 'content-type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (res.status === 401) {
    await forgetCalendarToken();
    throw new Error('CALENDAR_SIGNED_OUT');
  }
  if (res.status === 403) {
    const text = await res.text();
    if (/accessNotConfigured|has not been used|disabled/i.test(text)) throw new Error('CALENDAR_API_OFF');
    await forgetCalendarToken();
    throw new Error('CALENDAR_DENIED');
  }
  if (!res.ok && !(method === 'DELETE' && (res.status === 404 || res.status === 410))) {
    throw new Error(`Calendar error ${res.status}: ${await res.text()}`);
  }
  return method === 'DELETE' ? null : res.json();
}

// Deadline reminders: an all-day one at 9 AM the day before (15 hours before midnight);
// one due at a set time, a day and an hour before.
function deadlineAlarms(plan) {
  return plan.allDay
    ? [{ method: 'popup', minutes: 15 * 60 }]
    : [{ method: 'popup', minutes: 24 * 60 }, { method: 'popup', minutes: 60 }];
}

export async function addToCalendar(item, { mailUrl, titleOverride } = {}) {
  const plan = calendarPlan(item, { titleOverride });
  if (!plan) throw new Error('NO_DATE');
  const when = plan.allDay
    ? { start: { date: localDate(plan.start) }, end: { date: localDate(plan.end) } }
    : { start: { dateTime: localDateTime(plan.start), timeZone: tz() }, end: { dateTime: localDateTime(plan.end), timeZone: tz() } };
  const body = {
    summary: plan.title,
    location: plan.location || undefined,
    description: description(item, mailUrl),
    ...when,
    reminders: plan.kind === 'deadline' ? { useDefault: false, overrides: deadlineAlarms(plan) } : { useDefault: true },
  };
  const ev = await calendarFetch('POST', API, body);
  const added = { eventId: ev.id, link: ev.htmlLink, at: Date.now() };
  await chrome.storage.local.set({ [`cal:${item.id}`]: added });
  return added;
}

export async function removeFromCalendar(id) {
  const added = await getAdded(id);
  if (added) await calendarFetch('DELETE', `${API}/${encodeURIComponent(added.eventId)}`);
  await chrome.storage.local.remove(`cal:${id}`);
}

// An .ics file for Apple Calendar / Outlook. Made on this computer; nothing is sent anywhere.
export function downloadIcs(item, { mailUrl, titleOverride } = {}) {
  const plan = calendarPlan(item, { titleOverride });
  if (!plan) return;
  const escIcs = (s) => String(s).replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/([,;])/g, '\\$1');
  const stamp = (d) => `${localDate(d).replace(/-/g, '')}T${pad(d.getHours())}${pad(d.getMinutes())}00`;
  const utcNow = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+Z$/, 'Z');
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Mellon//EN',
    'BEGIN:VEVENT',
    `UID:${item.id}@mellon`,
    `DTSTAMP:${utcNow}`,
    plan.allDay ? `DTSTART;VALUE=DATE:${localDate(plan.start).replace(/-/g, '')}` : `DTSTART;TZID=${tz()}:${stamp(plan.start)}`,
    plan.allDay ? `DTEND;VALUE=DATE:${localDate(plan.end).replace(/-/g, '')}` : `DTEND;TZID=${tz()}:${stamp(plan.end)}`,
    `SUMMARY:${escIcs(plan.title)}`,
    plan.location ? `LOCATION:${escIcs(plan.location)}` : '',
    `DESCRIPTION:${escIcs(description(item, mailUrl))}`,
    plan.kind === 'deadline' ? `BEGIN:VALARM\r\nACTION:DISPLAY\r\nDESCRIPTION:Reminder\r\nTRIGGER:${plan.allDay ? '-PT15H' : '-P1D'}\r\nEND:VALARM` : '',
    'END:VEVENT',
    'END:VCALENDAR',
  ].filter(Boolean);
  const blob = new Blob([lines.join('\r\n')], { type: 'text/calendar' });
  const a = Object.assign(document.createElement('a'), {
    href: URL.createObjectURL(blob),
    download: `${plan.title.replace(/[^\p{L}\p{N} _-]+/gu, '').trim().slice(0, 60) || 'event'}.ics`,
  });
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}
