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
  required: ['title', 'summary', 'action_label', 'action_required', 'deadline', 'category', 'key_details'],
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
      items: { type: 'string' },
      description: 'Up to 4 short facts worth knowing: where, how much, who to contact, links mentioned.',
    },
  },
};

const SYSTEM = `You read emails sent to a design student at Carnegie Mellon University and extract what matters to them.
Rules:
- Judge importance by what the email actually asks of the student, never by the sender's own labels such as "IMPORTANT", "URGENT", "ACTION REQUIRED" or exclamation marks.
- Resolve relative dates ("tonight", "this Friday") using the current date given in the message.
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

export async function getCachedAnalysis(id) {
  const key = cacheKey(id);
  const stored = await chrome.storage.local.get(key);
  return stored[key] || null;
}

function emailPrompt(email) {
  const now = new Date();
  let body = email.body || email.snippet;
  if (body.length > MAX_BODY_CHARS) body = body.slice(0, MAX_BODY_CHARS) + '\n[email cut off here: too long]';
  return `Current date and time: ${now.toString()}

From: ${email.from}
Date received: ${new Date(email.date).toString()}
Subject: ${email.subject}

${body}`;
}

// Returns { ...analysis, cached: true|false }.
export async function analyzeEmail(email) {
  const cached = await getCachedAnalysis(email.id);
  if (cached) return { ...cached, cached: true };

  const apiKey = await getClaudeKey();
  if (!apiKey) throw new Error('NO_CLAUDE_KEY');

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      // Required for calls made directly from a browser. The key stays on this computer.
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 4000,
      system: SYSTEM,
      output_config: { effort: 'low', format: { type: 'json_schema', schema: SCHEMA } },
      messages: [{ role: 'user', content: emailPrompt(email) }],
    }),
  });

  if (res.status === 401) throw new Error('Claude API key is not valid. Check it in Settings.');
  if (res.status === 429) throw new Error('Too many requests to Claude right now. Wait a minute and try again.');
  if (!res.ok) throw new Error(`Claude error ${res.status}: ${await res.text()}`);

  const data = await res.json();
  if (data.stop_reason === 'refusal') throw new Error('Claude declined to read this email.');
  if (data.stop_reason === 'max_tokens') throw new Error('Claude ran out of room for this email.');
  const text = (data.content || []).find((b) => b.type === 'text')?.text;
  if (!text) throw new Error('Claude returned no answer.');

  const analysis = { ...JSON.parse(text), analyzedAt: Date.now() };
  await chrome.storage.local.set({ [cacheKey(email.id)]: analysis });
  return { ...analysis, cached: false };
}
