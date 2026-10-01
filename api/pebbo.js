/**
 * Pebbo, live: the endpoint “Try Pebbo” asks on chaewon.works (POST /api/pebbo).
 *
 * A Vercel Function, deployed with the site (anything in api/ becomes one). The site is static,
 * and an API key in the browser would be public, so the key lives here, in the project's
 * environment variables, never in the code:
 *
 *   ANTHROPIC_API_KEY   required. Without it this answers 503 and the phone uses the scripted
 *                       listener, so deploying before the key is set is safe.
 *   PEBBO_MODEL         optional, default claude-haiku-4-5-20251001 (small, fast, cheap)
 *   PEBBO_DAILY_LIMIT   optional, default 300 answers a day (per running instance, best effort;
 *                       the real ceiling is the monthly spend limit set in the Anthropic Console)
 *
 * Guard rails: only pages on this site may ask (Origin check), 20 messages per visitor per 10
 * minutes, the last 9 turns at most, 1,000 characters a turn, 400 output tokens. Nothing is
 * stored or logged. The browser still runs the safety check before calling, and the rules
 * (api/_pebbo-rules.js, copied from content/cases/pebbo-brain.ts at build) carry the crisis reply.
 * The answer is the same JSON the scripted listener returns; the browser validates it again.
 */
import { RULES } from "./_pebbo-rules.js";

const MODEL = process.env.PEBBO_MODEL || "claude-haiku-4-5-20251001";
const DAILY = Number(process.env.PEBBO_DAILY_LIMIT) || 300;
const PER_VISITOR = { max: 20, windowMs: 10 * 60 * 1000 };

// Pages that may call: the domain, plus this deployment's own Vercel addresses (previews)
const host = (h) => (h ? `https://${h}` : null);
const ALLOWED = new Set(
  [
    "https://chaewon.works",
    "https://www.chaewon.works",
    host(process.env.VERCEL_URL),
    host(process.env.VERCEL_BRANCH_URL),
    host(process.env.VERCEL_PROJECT_PRODUCTION_URL),
    ...(process.env.PEBBO_ORIGINS || "").split(",").map((s) => s.trim()),
  ].filter(Boolean),
);

// Best effort, per instance (instances are short-lived): enough to stop a loop or a bored script
const visitors = new Map();
let day = "";
let today = 0;

function tooMany(ip) {
  const now = Date.now();
  const recent = (visitors.get(ip) || []).filter((t) => now - t < PER_VISITOR.windowMs);
  recent.push(now);
  visitors.set(ip, recent);
  if (visitors.size > 5000) visitors.clear();
  return recent.length > PER_VISITOR.max;
}

function overBudget() {
  const d = new Date().toISOString().slice(0, 10);
  if (d !== day) {
    day = d;
    today = 0;
  }
  return ++today > DAILY;
}

/** The last few turns, trimmed, alternating, starting and ending with the visitor. */
export function turnsFrom(body) {
  const turns = [];
  for (const m of (Array.isArray(body?.messages) ? body.messages : []).slice(-9)) {
    if ((m?.role !== "user" && m?.role !== "assistant") || typeof m.content !== "string" || !m.content.trim()) continue;
    const content = m.content.slice(0, 1000);
    const last = turns[turns.length - 1];
    if (last && last.role === m.role) last.content += "\n" + content;
    else turns.push({ role: m.role, content });
  }
  while (turns[0]?.role === "assistant") turns.shift();
  return turns.length && turns[turns.length - 1].role === "user" ? turns : null;
}

/** The JSON object in the model's text (it is asked for JSON only; this forgives a stray fence). */
export function jsonFrom(text) {
  const a = text.indexOf("{");
  const b = text.lastIndexOf("}");
  if (a < 0 || b <= a) return null;
  try {
    return JSON.parse(text.slice(a, b + 1));
  } catch {
    return null;
  }
}

export default async function handler(req, res) {
  res.setHeader("cache-control", "no-store");
  // GET: is the live model set up? (the phone says “live” or “scripted” from this; no model call)
  if (req.method === "GET") return res.status(200).json({ live: !!process.env.ANTHROPIC_API_KEY });
  if (req.method !== "POST") {
    res.setHeader("allow", "GET, POST");
    return res.status(405).json({ error: "post_only" });
  }
  const origin = req.headers.origin;
  if (!origin || !ALLOWED.has(origin)) return res.status(403).json({ error: "origin" });
  if (!process.env.ANTHROPIC_API_KEY) return res.status(503).json({ error: "not_configured" });

  const ip = String(req.headers["x-forwarded-for"] || req.headers["x-real-ip"] || "?").split(",")[0].trim();
  if (tooMany(ip)) return res.status(429).json({ error: "slow_down" });

  let body = req.body;
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch {
      body = null;
    }
  }
  const messages = turnsFrom(body);
  if (!messages) return res.status(400).json({ error: "need_a_message" });
  if (overBudget()) return res.status(429).json({ error: "daily_limit" });

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 15000);
  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({ model: MODEL, max_tokens: 400, system: RULES, messages }),
      signal: ctrl.signal,
    });
    if (!r.ok) return res.status(r.status === 429 ? 429 : 502).json({ error: "upstream", status: r.status });
    const data = await r.json();
    const text = (data.content || []).filter((b) => b.type === "text").map((b) => b.text).join("");
    const answer = jsonFrom(text);
    if (!answer) return res.status(502).json({ error: "no_json" });
    return res.status(200).json(answer);
  } catch {
    return res.status(504).json({ error: "timeout" });
  } finally {
    clearTimeout(timer);
  }
}
