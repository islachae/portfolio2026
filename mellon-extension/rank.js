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
export function rankUpdates(items, interests = [], now = new Date(), { safe = {} } = {}) {
  const enriched = items.map((it) => {
    const deadline = parseDeadline(it.deadline);
    return {
      ...it,
      suspect: safe[it.id] ? null : suspicionOf(it),
      deadlineDate: deadline,
      urgent: isUrgent(deadline, now),
      interest: interests.includes(it.category),
      reason: reasonLabel(it, interests, now),
    };
  });

  // Anything that looks like phishing goes to its own group, never among the to-dos.
  const check = enriched.filter((it) => it.suspect).sort((a, b) => b.date - a.date);
  const clean = enriched.filter((it) => !it.suspect);

  const action = clean
    .filter((it) => it.action_required)
    .sort((a, b) => {
      if (a.deadlineDate && b.deadlineDate) return a.deadlineDate - b.deadlineDate;
      if (a.deadlineDate) return -1;
      if (b.deadlineDate) return 1;
      return b.date - a.date;
    });

  const byInterestThenNewest = (a, b) => b.interest - a.interest || b.date - a.date;
  const todayStart = startOfDay(now).getTime();
  const rest = clean.filter((it) => !it.action_required);
  const today = rest.filter((it) => it.date >= todayStart).sort(byInterestThenNewest);
  const earlier = rest.filter((it) => it.date < todayStart).sort(byInterestThenNewest);

  return [
    { key: 'action', label: t('group.action'), items: action },
    { key: 'check', label: t('group.check'), items: check },
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

// Key details as [{ kind, text }]. New analyses come with a kind from Claude; older saved
// ones are plain text, so their kind is guessed from the words (English or Korean).
export const DETAIL_KINDS = ['when', 'where', 'who', 'money', 'link', 'note'];

export function guessKind(text) {
  const s = String(text);
  if (/\$\s?\d|\d+\s?(USD|dollars?|달러)|tuition|fee|\bpay|stipend|refund|등록금|비용|금액|수수료|장학금\s?\d/i.test(s)) return 'money';
  if (/https?:|www\.|\.com|\.edu|\bform\b|sheet|\bdoc\b|document|pdf|portal|link|canvas|\bhub\b|e-?bill|폼|시트|문서|링크|포털|사이트/i.test(s)) return 'link';
  if (/\b(mon|tue|wed|thu|fri|sat|sun)[a-z]*\b|\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s?\d|\d{1,2}(:\d{2})?\s?(am|pm)\b|\bnoon\b|midnight|tonight|tomorrow|deadline|\d+월\s?\d+일|오전|오후|자정|정오|요일|마감/i.test(s)) return 'when';
  if (/\broom\b|\bhall\b|center|centre|building|studio|\blab\b|library|floor|campus|zoom|online|in person|\bMM\s?\d|강의실|호관|센터|건물|스튜디오|도서관|층|온라인|줌|캠퍼스/i.test(s)) return 'where';
  if (/speaker|contact|advisor|adviser|professor|prof\.|instructor|\bta\b|office of|coordinator|@|with [A-Z]|연사|담당|교수|조교|문의|연락|어드바이저|사무실/i.test(s)) return 'who';
  return 'note';
}

export function detailList(item) {
  return (item.key_details || []).map((d) =>
    typeof d === 'string' ? { kind: guessKind(d), text: d } : { kind: DETAIL_KINDS.includes(d.kind) ? d.kind : 'note', text: d.text }
  );
}

// ---------- phishing ----------
// Two checks, either is enough: Claude's reading of the email, and Mellon's own rule on the
// sender address (no AI): outside cmu.edu while asking to log in or pay, or imitating CMU.

export function senderDomain(from) {
  const m = /<([^>]+)>/.exec(from || '') || /([^\s<>]+@[^\s<>]+)/.exec(from || '');
  const addr = (m ? m[1] : '').toLowerCase();
  return addr.includes('@') ? addr.split('@').pop() : '';
}

const isCmu = (domain) => domain === 'cmu.edu' || domain.endsWith('.cmu.edu');

export function suspicionOf(item) {
  const domain = senderDomain(item.from);
  const ai = item.suspicion?.flag ? item.suspicion.type || 'other' : null;
  if (ai && ai !== 'none') return { type: ai, domain, evidence: item.suspicion.evidence || '' };
  if (!domain || isCmu(domain)) return null;
  if (/cmu|carnegie|andrew/.test(domain)) return { type: 'lookalike', domain, evidence: '' };
  const text = `${item.action_label || ''} ${item.title || ''} ${item.summary || ''}`;
  if (/\b(log ?in|sign ?in|verify|password|credentials?|account (?:suspend|lock|expir))/i.test(text)) return { type: 'credentials', domain, evidence: '' };
  if (item.action_required && /\b(pay|payment|wire|gift ?cards?|bank|deposit|invoice)\b/i.test(text)) return { type: 'payment', domain, evidence: '' };
  return null;
}
