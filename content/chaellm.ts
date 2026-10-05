/**
 * ChaeLLM: the chat mode of the right sidebar.
 *
 * PLACEHOLDER. Every answer below is canned and stitched together from copy already on the site.
 * To plug in a real model later, replace `reply()` with a call to your API route
 * (keep the same return shape) and delete `answers`.
 */
import { profile } from "./site";

export type ChatReply = { text: string; follow?: string[] };

export const chaellm = {
  name: "ChaeLLM",
  about: "An AI version of Chaewon, still in training. Answers are placeholders for now.",
  greeting: "안녕! I’m ChaeLLM.",
  intro: "Ask about my projects, how I design with AI, or the Michelin kitchen.",
  placeholder: "Ask about Chaewon…",
  starters: ["How do you design with AI?", "What are you working on right now?", "Why the bread?"],
};

type Answer = { q: string; keys: string[]; a: string; follow: string[] };

const answers: Answer[] = [
  {
    q: "How do you design with AI?",
    keys: ["design with ai", "ai", "trust", "automate", "agency", "judgment", "approach", "process"],
    a: "I let AI take the repetitive work and keep the judgment calls with people. In Rethinking Tipping, AI does the math and brings the context you’d otherwise guess at,, but what good service was worth is still your call.",
    follow: ["Tell me about Rethinking Tipping", "What are you working on right now?", "Are you open to internships?"],
  },
  {
    q: "What are you working on right now?",
    keys: ["working on", "right now", "current", "mellon", "cmu mellon", "melon", "cmu melon", "in progress"],
    a: "CMU Mellon, for students and advisors at Carnegie Mellon. School email buries the one message that matters, so Mellon sorts and summarizes the inbox. What matters to you, and when to reach out, stays with you. It’s still in progress.",
    follow: ["How do you design with AI?", "Tell me about ZipFlow", "Are you open to internships?"],
  },
  {
    q: "Why the bread?",
    keys: ["bread", "bake", "baker", "baking", "michelin", "kitchen", "pastry"],
    a: "Before design, I was a hardcore baker. Hardcore enough to land in a Michelin-starred kitchen. It’s still where ideas show up, and baking for people is how I share them.",
    follow: ["What’s your background?", "How do you design with AI?", "What are you working on right now?"],
  },
  {
    q: "Tell me about Rethinking Tipping",
    keys: ["tipping", "tip", "checkout", "payment"],
    a: "Tipping hasn’t kept up with how we pay. The screen asks for a number at the most awkward moment, with almost nothing to go on. Rethinking Tipping puts AI inside the payment flow without taking the decision away from the person who’s tipping.",
    follow: ["Tell me about Pebbo", "Tell me about ZipFlow", "How do you design with AI?"],
  },
  {
    q: "Tell me about ZipFlow",
    keys: ["zipflow", "zip flow", "real estate", "b2b", "saas", "team"],
    a: "ZipFlow is a B2B SaaS tool for real estate: one listing, every workflow. It was a team project where I led design, from the information architecture and navigation to a cohesive UI.",
    follow: ["Tell me about Pebbo", "What are you working on right now?", "Are you open to internships?"],
  },
  {
    q: "Tell me about Pebbo",
    keys: ["pebbo", "companion", "eating", "mood"],
    a: "Pebbo is a companion that listens when eating feels heavy. It turns scattered chats into mood patterns and suggests one small next step. What you share, and what gets erased, is always up to you.",
    follow: ["Tell me about Rethinking Tipping", "How do you design with AI?", "What’s your background?"],
  },
  {
    q: "Are you open to internships?",
    keys: ["intern", "internship", "hire", "hiring", "job", "available", "open to", "nyc", "new york", "2027"],
    a: `Yes! I’m looking for a Summer 2027 product or UX design internship, ideally in New York City. The fastest way to reach me is ${profile.email}.`,
    follow: ["What’s your background?", "How do you design with AI?", "Tell me about ZipFlow"],
  },
  {
    q: "What’s your background?",
    keys: ["background", "art", "nyu", "studied", "study", "school", "who are you", "about you", "education"],
    a: "I studied Studio Art at NYU Steinhardt and I’m now in the MDes program at Carnegie Mellon. The artist’s curiosity stuck: I still start by questioning the problem everyone else takes for granted.",
    follow: ["Why the bread?", "How do you design with AI?", "Are you open to internships?"],
  },
];

const norm = (s: string) => s.toLowerCase().replace(/[’']/g, "'").replace(/[^a-z0-9' ]+/g, " ");

/** Placeholder brain: exact question first, then the answer with the most keyword hits. */
export async function reply(question: string): Promise<ChatReply> {
  const q = ` ${norm(question).replace(/\s+/g, " ").trim()} `;
  const exact = answers.find((x) => ` ${norm(x.q).replace(/\s+/g, " ").trim()} ` === q);
  let best = exact;
  if (!best) {
    let score = 0;
    for (const x of answers) {
      // Keys match at the start of a word, so "intern" catches "internship" but "ai" skips "email".
      const s = x.keys.reduce((n, k) => n + (q.includes(` ${k}`) ? k.length : 0), 0);
      if (s > score) {
        score = s;
        best = x;
      }
    }
  }
  await new Promise((r) => setTimeout(r, 650 + Math.random() * 450));
  if (!best) {
    return {
      text: `That one isn’t in my training yet. Ask the real Chaewon at ${profile.email}, or try one of these.`,
      follow: chaellm.starters,
    };
  }
  return { text: best.a, follow: best.follow };
}
