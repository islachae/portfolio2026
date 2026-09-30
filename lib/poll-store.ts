import { poll, type PollQuestion } from "@/content/poll";

export type Counts = Record<string, number>;

export type PollStore = {
  /** true = shared results from a backend; false = labeled sample data. */
  live: boolean;
  load(q: PollQuestion): Promise<Counts>;
  /** Cast `option` for question `q`; `previous` is this visitor's earlier answer, which the backend should replace. */
  vote(q: PollQuestion, option: string, previous: string | null): Promise<Counts>;
};

/**
 * Backend contract (any host: a Vercel/Netlify function, Cloudflare Worker, Supabase edge function…):
 *   GET  {endpoint}?poll=<pollId>&question=<questionId>      → { counts: { <optionId>: number, … } }
 *   POST {endpoint}  { poll, question, option, previous }    → { counts: { <optionId>: number, … } }
 * `previous` is null for a first vote; otherwise decrement it and increment `option`,
 * so changing a vote replaces it instead of adding one.
 */
const endpoint = process.env.NEXT_PUBLIC_POLL_ENDPOINT;

function clean(q: PollQuestion, raw: unknown): Counts {
  const src = (raw && typeof raw === "object" ? (raw as { counts?: unknown }).counts : null) as Record<string, unknown> | null;
  if (!src) throw new Error("bad response");
  const c: Counts = {};
  for (const o of q.options) {
    const n = Number(src[o.id]);
    c[o.id] = Number.isFinite(n) && n > 0 ? Math.floor(n) : 0;
  }
  return c;
}

async function call(q: PollQuestion, init?: RequestInit): Promise<Counts> {
  const sep = endpoint!.includes("?") ? "&" : "?";
  const url = `${endpoint}${sep}poll=${encodeURIComponent(poll.id)}&question=${encodeURIComponent(q.id)}`;
  const res = await fetch(url, { ...init, headers: { "content-type": "application/json", ...(init?.headers || {}) } });
  if (!res.ok) throw new Error(`poll ${res.status}`);
  return clean(q, await res.json());
}

const liveStore: PollStore = {
  live: true,
  load: (q) => call(q),
  vote: (q, option, previous) => call(q, { method: "POST", body: JSON.stringify({ poll: poll.id, question: q.id, option, previous }) }),
};

/** No backend yet: fixed sample numbers plus this visitor's own answer, clearly labeled in the UI. */
const sampleStore: PollStore = {
  live: false,
  load: async (q) => ({ ...q.sample }),
  vote: async (q, option) => {
    const c = { ...q.sample };
    c[option] = (c[option] || 0) + 1;
    return c;
  },
};

export const pollStore: PollStore = endpoint ? liveStore : sampleStore;

/* This visitor's answers ({ questionId: optionId }), remembered locally to discourage repeat voting. */
const key = `cw-poll:${poll.id}`;
export function readMyVotes(): Record<string, string> {
  try {
    const v = JSON.parse(localStorage.getItem(key) || "{}");
    const out: Record<string, string> = {};
    for (const q of poll.questions) {
      if (typeof v?.[q.id] === "string" && q.options.some((o) => o.id === v[q.id])) out[q.id] = v[q.id];
    }
    return out;
  } catch {
    return {};
  }
}
export function saveMyVotes(v: Record<string, string>) {
  try {
    localStorage.setItem(key, JSON.stringify(v));
  } catch {}
}
