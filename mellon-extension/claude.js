// Sends one email to the Claude API and gets back a structured summary.
// Results are saved in chrome.storage.local by message id, so the same
// email is never sent twice.

const MODEL = 'claude-haiku-5-5';
const MAX_BODY_CHARS = 15000;

export const CATEGORIES = [
  'Career',
  'Funding',
  'Courses',
  'Events & community',
  'International students',
  'Studio & facilities',
  'Advising',
  'Admin',
];

const SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['title', 'summary', 'action_label', 'action_required', 'deadline', 'category', 'key_details', 'event'],
  properties: {
    title: {
      type: 'string',
      description: 'A short title (max ~8 words) that states the point of the email, not the original subject line.',
    },
    summary: { type: 'string', description: 'One sentence summary for a student.' },
    action_label: {
      type: 'string',
      description:
        'One or two word button label for what the reader must do, e.g. Submit, Pay, Register, RSVP, Reply, Sign up, Read. Empty string if there is nothing to do.',
    },
    action_required: {
      type: 'boolean',
      description:
        'True only if the reader personally must do something (with real consequences if they do not). Optional events, newsletters and FYIs are false.',
    },
    deadline: {
      type: 'string',
      description:
        'When the action is due, as local time "YYYY-MM-DDTHH:MM". Use 23:59 if only a date is given. Empty string if there is no deadline.',
    },
    category: { type: 'string', enum: CATEGORIES },
    key_details: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['kind', 'text'],
        properties: {
          kind: {
            type: 'string',
            enum: ['when', 'where', 'who', 'money', 'link', 'note'],
            description: 'when = date or time, where = place or online location, who = a person or office, money = amounts or fees, link = a form, document, website or portal, note = anything else',
          },
          text: { type: 'string' },
        },
      },
      description: 'Up to 4 short facts worth knowing: when, where, how much, who to contact, links or forms mentioned.',
    },
    event: {
      type: 'object',
      additionalProperties: false,
      required: ['has_event', 'title', 'start', 'end', 'all_day', 'location'],
      description:
        'The one thing in this email the student could attend (talk, workshop, office hours, fair, meeting, exhibition, class session), for adding to a calendar. Not a deadline.',
      properties: {
        has_event: { type: 'boolean', description: 'False if the email has no specific event with a date.' },
        title: { type: 'string', description: 'Short calendar title, e.g. "Hit Pause: CFA Wellness Day". Empty if no event.' },
        start: { type: 'string', description: 'Local start "YYYY-MM-DDTHH:MM", or "YYYY-MM-DD" for an all-day event. Empty if no event.' },
        end: { type: 'string', description: 'Local end in the same format, or empty if the email gives none.' },
        all_day: { type: 'boolean' },
        location: { type: 'string', description: 'Room, building or online link, as written. Empty if none.' },
      },
    },
  },
};

const SYSTEM = `You read emails sent to a design student at Carnegie Mellon University and extract what matters to them.
Rules:
- Judge importance by what the email actually asks of the student, never by the sender's own labels such as "IMPORTANT", "URGENT", "ACTION REQUIRED" or exclamation marks.
- Dates: relative words in an email ("today", "tonight", "tomorrow", "this Friday", "next week") are relative to the day the email was SENT, not to today. Work them out from the "Sent" date given above the email.
- Never write relative dates ("today", "tomorrow", "tonight", "this week") in the title, summary or key details: write the exact day, e.g. "Thu, Oct 8, 3:30–7:30 PM". The app shows relative words itself, always up to date.
- If the event or deadline is already over by the "Today" date, still give its real date (the app will show it as past).
- Write in plain, short English.
Categories:
- Career: jobs, internships, recruiting, portfolio reviews, career fairs.
- Funding: scholarships, grants, financial aid, tuition, payments, stipends.
- Courses: classes, assignments, registration, grades, syllabus, instructors.
- Events & community: talks, socials, clubs, workshops, exhibitions.
- International students: visas, OIE, CPT/OPT, immigration documents.
- Studio & facilities: studio spaces, labs, shops, equipment, building access.
- Advising: academic advisors, degree planning, meetings with advisors.
- Admin: anything else administrative (IT, housing, policies, surveys).`;

export async function getClaudeKey() {
  const { claudeApiKey } = await chrome.storage.local.get('claudeApiKey');
  return claudeApiKey || '';
}

const cacheKey = (id) => `analysis:${id}`;

// Bumped when the reading rules change, so older saved results are read once more.
// v2: relative dates are counted from the day an email was sent, and written as exact dates.
// v3: also pulls out the event (start, end, place) for "Put in my calendar".
export const ANALYSIS_VERSION = 3;

export async function getCachedAnalysis(id, { anyVersion = false } = {}) {
  const key = cacheKey(id);
  const stored = (await chrome.storage.local.get(key))[key];
  if (!stored) return null;
  return anyVersion || stored.v >= ANALYSIS_VERSION ? stored : null;
}

// "Wed, Oct 7, 2026, 2:15 PM (America/New_York)": weekday spelled out so "tomorrow" is easy to resolve.
function fmtDay(d) {
  const day = d.toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' });
  return `${day} (${Intl.DateTimeFormat().resolvedOptions().timeZone})`;
}

function emailPrompt(email) {
  const now = new Date();
  let body = email.body || email.snippet;
  if (body.length > MAX_BODY_CHARS) body = body.slice(0, MAX_BODY_CHARS) + '\n[email cut off here: too long]';
  const sent = new Date(email.date);
  return `Today: ${fmtDay(now)}
Sent: ${fmtDay(sent)}  (relative dates in the email count from this day)

From: ${email.from}
Subject: ${email.subject}

${body}`;
}

// Returns { ...analysis, cached: true|false }.
// One request to the Claude API, straight from this browser (the key never leaves this computer
// except to api.anthropic.com). Returns the raw response: { content, stop_reason, usage }.
export async function requestClaude({ system, messages, tools, toolChoice, schema, maxTokens = 4000 }) {
  const apiKey = await getClaudeKey();
  if (!apiKey) throw new Error('NO_CLAUDE_KEY');

  const output_config = { effort: 'low' };
  if (schema) output_config.format = { type: 'json_schema', schema };
  const body = { model: MODEL, max_tokens: maxTokens, system, output_config, messages };
  if (tools) body.tools = tools;
  if (toolChoice) body.tool_choice = toolChoice;

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      // Required for calls made directly from a browser.
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify(body),
  });

  if (res.status === 401) throw new Error('Claude API key is not valid. Check it in Settings.');
  if (res.status === 429) throw new Error('Too many requests to Claude right now. Wait a minute and try again.');
  if (!res.ok) throw new Error(`Claude error ${res.status}: ${await res.text()}`);

  const data = await res.json();
  await addUsage(data.usage);
  if (data.stop_reason === 'refusal') throw new Error('Claude declined this request.');
  if (data.stop_reason === 'max_tokens') throw new Error('Claude ran out of room for this answer.');
  return data;
}

export const textOf = (data) =>
  (data.content || [])
    .filter((b) => b.type === 'text')
    .map((b) => b.text)
    .join('\n')
    .trim();

// Single question, single answer. With a schema, the answer comes back as parsed JSON.
export async function callClaude({ system, content, schema, maxTokens = 4000 }) {
  const data = await requestClaude({ system, messages: [{ role: 'user', content }], schema, maxTokens });
  const text = textOf(data);
  if (!text) throw new Error('Claude returned no answer.');
  return schema ? JSON.parse(text) : text;
}

// Rough cost of the saved usage, at Claude Haiku 5.5 prices ($0.10 / $0.50 per million tokens).
export function usageCost(usage) {
  if (!usage) return 0;
  return (usage.input * 0.1 + usage.output * 0.5) / 1e6;
}

// Running token count, so Settings can show roughly what Mellon has cost.
// Updates run one after another so parallel requests don't overwrite each other.
let usageQueue = Promise.resolve();
function addUsage(usage) {
  if (!usage) return usageQueue;
  usageQueue = usageQueue.then(() => saveUsage(usage)).catch(() => {});
  return usageQueue;
}

async function saveUsage(usage) {
  const { usage: total = { input: 0, output: 0, requests: 0, since: Date.now() } } = await chrome.storage.local.get('usage');
  total.input += (usage.input_tokens || 0) + (usage.cache_creation_input_tokens || 0) + (usage.cache_read_input_tokens || 0);
  total.output += usage.output_tokens || 0;
  total.requests += 1;
  await chrome.storage.local.set({ usage: total });
}

export async function analyzeEmail(email) {
  const cached = await getCachedAnalysis(email.id);
  if (cached) return { ...cached, cached: true };

  const result = await callClaude({ system: SYSTEM, content: emailPrompt(email), schema: SCHEMA });

  // Saved locally with the basic email info, so cached emails need no further calls.
  const analysis = {
    ...result,
    id: email.id,
    threadId: email.threadId,
    subject: email.subject,
    from: email.from,
    date: email.date,
    analyzedAt: Date.now(),
    v: ANALYSIS_VERSION,
  };
  await chrome.storage.local.set({ [cacheKey(email.id)]: analysis });
  // An older Korean version of this email's notes no longer matches; it is translated again.
  await chrome.storage.local.remove(`ko:${email.id}`);
  return { ...analysis, cached: false };
}
