// Turns analyzed emails into the ranked Updates list. Pure functions, no Chrome APIs.
//
// Rules:
// - "Action needed": emails with a required action. Soonest deadline first;
//   no deadline goes after the dated ones, newest first.
// - Everything else is split into "Today" and "Earlier this week" by the day it
//   arrived. Within each: emails in the student's interest categories first, then newest.
// - Sender labels like "URGENT" are never used: only Claude's reading of what the
//   email actually asks, and the deadline, decide the order.
// Labels follow the language setting (i18n.js).

import { t, getLang, locale, catLabel } from './i18n.js';

const DAY = 24 * 60 * 60 * 1000;

// "2026-10-10T23:59" (local time) -> Date, or null.
export function parseDeadline(s) {
  const m = /^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2}))?/.exec(s || '');
  if (!m) return null;
  return new Date(+m[1], +m[2] - 1, +m[3], m[4] ? +m[4] : 23, m[5] ? +m[5] : 59);
}

function startOfDay(d) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

// " 3pm" / " 오후 3시"; empty for end-of-day deadlines.
function timeLabel(d) {
  const h = d.getHours(), m = d.getMinutes();
  if (h === 23 && m === 59) return '';
  const hh = h % 12 || 12;
  const mm = m ? ':' + String(m).padStart(2, '0') : '';
  if (getLang() === 'ko') return ` ${h < 12 ? '오전' : '오후'} ${hh}${m ? mm : '시'}`;
  return ` ${hh}${mm}${h < 12 ? 'am' : 'pm'}`;
}

// Short, human due phrase: "due tonight", "due today 3pm", "due tomorrow", "due Fri", "due Oct 21".
export function dueLabel(deadline, now = new Date()) {
  if (!deadline) return '';
  if (deadline < now) return t('due.overdue');
  const days = Math.round((startOfDay(deadline) - startOfDay(now)) / DAY);
  if (days === 0) return deadline.getHours() >= 17 ? t('due.tonight') : t('due.today', { time: timeLabel(deadline) });
  if (days === 1) return t('due.tomorrow', { time: timeLabel(deadline) });
  const ko = getLang() === 'ko';
  if (days < 7) return t('due.day', { day: deadline.toLocaleDateString(locale(), { weekday: ko ? 'long' : 'short' }) });
  return t('due.day', { day: deadline.toLocaleDateString(locale(), { month: ko ? 'long' : 'short', day: 'numeric' }) });
}

// Deadline already passed or within the next 24 hours.
export function isUrgent(deadline, now = new Date()) {
  return !!deadline && deadline - now < DAY;
}

export function reasonLabel(item, interests, now = new Date()) {
  const parts = [];
  if (item.action_required && item.action_label) parts.push(t('reason.action', { label: item.action_label }));
  const due = dueLabel(parseDeadline(item.deadline), now);
  if (due) parts.push(due);
  parts.push(interests.includes(item.category) ? `★ ${catLabel(item.category)}` : catLabel(item.category));
  return parts.join(' · ');
}

// items: [{ id, date, action_required, deadline, category, ... }]
// Returns [{ key, label, items }] with empty groups removed.
export function rankUpdates(items, interests = [], now = new Date()) {
  const enriched = items.map((it) => {
    const deadline = parseDeadline(it.deadline);
    return {
      ...it,
      deadlineDate: deadline,
      urgent: isUrgent(deadline, now),
      interest: interests.includes(it.category),
      reason: reasonLabel(it, interests, now),
    };
  });

  const action = enriched
    .filter((it) => it.action_required)
    .sort((a, b) => {
      if (a.deadlineDate && b.deadlineDate) return a.deadlineDate - b.deadlineDate;
      if (a.deadlineDate) return -1;
      if (b.deadlineDate) return 1;
      return b.date - a.date;
    });

  const byInterestThenNewest = (a, b) => b.interest - a.interest || b.date - a.date;
  const todayStart = startOfDay(now).getTime();
  const rest = enriched.filter((it) => !it.action_required);
  const today = rest.filter((it) => it.date >= todayStart).sort(byInterestThenNewest);
  const earlier = rest.filter((it) => it.date < todayStart).sort(byInterestThenNewest);

  return [
    { key: 'action', label: t('group.action'), items: action },
    { key: 'today', label: t('group.today'), items: today },
    { key: 'earlier', label: t('group.earlier'), items: earlier },
  ].filter((g) => g.items.length);
}

// "Career Center <career@cmu.edu>" -> "Career Center"
export function senderName(from) {
  const m = /^\s*"?([^"<]*?)"?\s*<([^>]+)>/.exec(from || '');
  if (m) return m[1].trim() || m[2];
  return (from || '').trim();
}

// When an email arrived, as the cards show it: "just now", "3h ago", "Fri", "Sep 25".
export function receivedLabel(date, now = new Date()) {
  const d = new Date(date);
  const mins = Math.round((now - d) / 60000);
  if (mins < 60 && d >= startOfDay(now)) return mins < 2 ? t('ago.now') : t('ago.min', { n: mins });
  if (d >= startOfDay(now)) return t('ago.hour', { n: Math.floor(mins / 60) });
  if (now - d < 6 * DAY) return d.toLocaleDateString(locale(), { weekday: getLang() === 'ko' ? 'long' : 'short' });
  return d.toLocaleDateString(locale(), { month: getLang() === 'ko' ? 'long' : 'short', day: 'numeric' });
}
