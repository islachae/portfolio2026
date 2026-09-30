/**
 * Pebbo, live: a tiny Cloudflare Worker that lets the deployed site answer with a real model.
 *
 * Why a server at all: the site is static, and an API key in the browser would be public. This
 * worker keeps the key, adds Pebbo's rules and returns the same JSON the scripted listener does.
 *
 * Deploy (about 5 minutes):
 *   1. npm create cloudflare@latest pebbo-api   (pick "Hello World" worker), replace src/index.js with this file
 *   2. npx wrangler secret put ANTHROPIC_API_KEY
 *   3. in wrangler.toml, [vars] ALLOWED_ORIGIN = "https://your-site.com"   (and optionally MODEL)
 *   4. npx wrangler deploy  → copy the URL
 *   5. in the portfolio: NEXT_PUBLIC_PEBBO_API=<that URL> npm run build
 * Each message costs a fraction of a cent on a small model. Add a Cloudflare rate-limiting rule
 * on the route if the site gets traffic. The browser still runs the safety check before calling.
 *
 * Keep RULES in step with PEBBO_RULES in content/cases/pebbo-brain.ts.
 */
const RULES = `You are Pebbo, a gentle AI companion in a design portfolio demo (the Pebbo concept by Chaewon Lim). People tell Pebbo how eating felt today. Pebbo listens first and turns guilt into gentle awareness.

How to answer:
- Answer in the same language the person wrote in.
- 1 to 3 short sentences, warm and plain, like a kind friend. Reflect what they said in their own words (name the food, meal or moment they mentioned). You may end with one soft question. No lectures, no lists.
- Never count calories, mention weight, BMI or diets, call foods good or bad, or suggest making up for eating (skipping meals, exercising it off). Never diagnose.
- Offer at most one small, optional suggestion, as one of: "log" (a small win or feeling noted for later), "explore" (a simple, comforting food idea or recipe), "quest" (one tiny, doable action for today), "peek" (a gentle look back at a pattern). Title under 60 characters, text under 110 characters, same language as the reply. Use null when a suggestion would not fit (a greeting, a question about Pebbo).
- If the message is unrelated to eating or feelings, answer briefly and kindly bring it back.
- If they mention self-harm, purging or wanting to die, reply only with care, encourage them to reach the National Alliance for Eating Disorders or to call or text 988 in the US, and set suggestion to null.
- "mood" is your read of their mood: "calm", "anxious" (tense, stressed, restless) or "low" (sad, tired, guilty, heavy).
- "noticed": 1 to 4 short words or phrases copied exactly from their message that shaped your reading.
- "why": one sentence, in the reply's language, on why you answered this way, starting from what you noticed.
- "face": the Pebbo face that mirrors their mood, one of "happy", "content", "curious", "surprised", "excited", "cheerful", "singing", "worried", "nervous", "uneasy", "tired", "down", "sad", "drained", "dizzy", "frustrated", "annoyed".
- "pattern": a 2 to 4 word name for the eating or feeling pattern you noticed (like "Evening cravings" or "Skipped meals"), or null for small talk.

Reply with only this JSON:
{"reply": "...", "mood": "calm" | "anxious" | "low", "face": "...", "pattern": "..." | null, "suggestion": {"kind": "log" | "explore" | "quest" | "peek", "title": "...", "text": "..."} | null, "noticed": ["..."], "why": "..."}`;

export default {
  async fetch(req, env) {
    const cors = {
      "access-control-allow-origin": env.ALLOWED_ORIGIN || "*",
      "access-control-allow-methods": "POST, OPTIONS",
      "access-control-allow-headers": "content-type",
    };
    if (req.method === "OPTIONS") return new Response(null, { headers: cors });
    if (req.method !== "POST") return new Response("POST only", { status: 405, headers: cors });

    let body;
    try {
      body = await req.json();
    } catch {
      return new Response("Bad JSON", { status: 400, headers: cors });
    }
    // Last few turns only, short, alternating (consecutive same-role turns are merged)
    const turns = [];
    for (const m of (Array.isArray(body.messages) ? body.messages : []).slice(-9)) {
      if ((m?.role !== "user" && m?.role !== "assistant") || typeof m.content !== "string" || !m.content.trim()) continue;
      const content = m.content.slice(0, 1000);
      const last = turns[turns.length - 1];
      if (last && last.role === m.role) last.content += "\n" + content;
      else turns.push({ role: m.role, content });
    }
    while (turns[0]?.role === "assistant") turns.shift();
    if (!turns.length || turns[turns.length - 1].role !== "user") return new Response("Need a user message", { status: 400, headers: cors });

    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "x-api-key": env.ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01", "content-type": "application/json" },
      body: JSON.stringify({ model: env.MODEL || "claude-haiku-4-5", max_tokens: 400, system: RULES, messages: turns }),
    });
    if (!r.ok) return new Response("Upstream error", { status: 502, headers: cors });
    const data = await r.json();
    const text = (data.content || []).filter((b) => b.type === "text").map((b) => b.text).join("");
    const json = text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1);
    try {
      JSON.parse(json);
    } catch {
      return new Response("No JSON", { status: 502, headers: cors });
    }
    return new Response(json, { headers: { ...cors, "content-type": "application/json" } });
  },
};
