/**
 * Squiggle: the case study (opens at /#case/squiggle).
 * Sources: the 6-day build thread (connector + app), the submission video (narration transcribed),
 * the final deck, the Granola interview notes, and the team's own 103-moment record.
 * Teammates and the host agreed to be named; interviewees are kept to their level.
 *
 * Nine sections, one headline each, so the headlines alone tell the story:
 * brief → problem → solution → built on day 1 (the twist) → research → decisions → trust → reflection.
 *
 * Anything still unconfirmed is written {{like this}} and renders dashed (same rule as Mellon).
 */
const v = (name: string) => `/work/squiggle/${name}.mp4`;
const img = (name: string) => `/work/squiggle/${name}.webp`;

export const squiggleCase = {
  id: "squiggle" as const,
  eyebrow: "AI tool · Product design · 6-day design competition",
  title: "Squiggle keeps the why behind decisions lost in AI chats.",
  subtitle: "It logs each decision with its reason and the chat it came from. Ask why, and it answers with the words from your actual chat.",
  meta: [
    { label: "Role", value: "Product designer · built the Claude connector, designed the app" },
    { label: "Team", value: "Pajama Club · Pragya Srivastava, Jamie Chung, Chaewon Lim" },
    { label: "Timeline", value: "6 days · Oct 2026 · SVSD hackathon, hosted by Naheel Jawaid" },
  ],
  readingTime: "4 min",
  toc: [
    { id: "cs-overview", label: "Overview" },
    { id: "sq-brief", label: "Brief" },
    { id: "sq-problem", label: "Problem" },
    { id: "sq-solution", label: "Solution" },
    { id: "sq-built", label: "Built on day 1" },
    { id: "sq-research", label: "Research" },
    { id: "sq-decisions", label: "Decisions" },
    { id: "sq-trust", label: "Trust" },
    { id: "cs-takeaways", label: "Reflection" },
  ],

  /** Right under the first screen. */
  impact: {
    label: "Impact",
    items: [
      { n: "Day 1", v: "a working Claude connector, used on our own project from then on" },
      { n: "103", v: "moments our team logged in the first 3 days" },
      { n: "Real MCP connector + app", v: "Cloudflare Workers · built with Claude", wide: true },
    ] as { n?: string; q?: string; v: string; wide?: boolean }[],
  },

  // ── 01 The brief
  brief: {
    label: "The brief",
    title: "6 days. 3 designers. Design something one group will love, even if others don’t.",
    text: "Our group: designers at early-stage startups. They work alone, think with AI, and pivot fast.",
  },

  // ── 02 Problem
  problem: {
    label: "Problem",
    title: ["Decisions get made in AI chats,", "and the reasoning stays buried there."],
    film: {
      mp4: v("problem"),
      poster: img("problem-poster"),
      w: 1280,
      h: 720,
      alt: "Animation from our submission video: a tangled line of prompts ends in a decision; later an AI summary answers why without the context, and the thinking is spread across several AI tools",
    },
    text: "A week later the founder asks why. The answer is scattered across chats, and an AI recap of it can’t be trusted.",
    hmw: "How might a designer working alone keep the why behind each decision, without stopping to write it down?",
  },

  // ── 03 Solution
  solution: {
    label: "Solution",
    title: "Squiggle works inside the chat and keeps a record you can search.",
    text: "It logs each decision, idea and dropped option with its reason, while you talk. Nothing changes in how you work. Nothing is shared until you choose.",
    goals: [
      {
        k: "Goal 1",
        h: "Find the why, just by asking",
        t: "Your own words come back underlined, linked to the chat they came from.",
        mp4: v("ask"),
        poster: img("ask-poster"),
        vw: 1440,
        vh: 848,
        alt: "Asking a question in plain words; the answer underlines the words that came from the designer's own chats",
        lime: true,
      },
      {
        k: "Goal 2",
        h: "See the context, not just what you chose",
        t: "The whole project on one line. Hover a keystone to see where the thinking turned.",
        mp4: v("map"),
        poster: img("map-poster"),
        vw: 1440,
        vh: 848,
        alt: "The thinking map: the whole project on one line, with keystones that show where the thinking changed direction",
      },
      {
        k: "Goal 3",
        h: "Keep the story without writing it down",
        t: "Summary grows with the project. Copy a recap whenever the founder asks.",
        mp4: v("summary"),
        poster: img("summary-poster"),
        vw: 1440,
        vh: 848,
        alt: "Summary telling the project through keystones, and a recap copied for Slack",
      },
    ],
  },

  // ── 04 Built on day 1 (the twist)
  built: {
    label: "Built on day 1",
    title: ["We built Squiggle while using it,", "prototyping live and correcting course like a lean startup."],
    numbers: [
      { n: "Day 1", v: "working connector, live inside Claude" },
      { n: "103", v: "moments logged in 3 days" },
      { n: "3", v: "of us, each in our own Claude" },
    ],
    learnedLabel: "Using it taught us two things",
    one: {
      h: "1 · Unsorted thinking can’t be shared.",
      t: "We built Squiggle for teams first. Past 70 moments even we got lost in each other’s maps — so we flipped it.",
      from: "Share everyone’s chats",
      to: "Sort your own thinking first",
      film: { mp4: v("board"), poster: img("board-poster"), w: 1280, h: 820, alt: "Our first board: a sprawling map of decision cards from days 1 and 2" },
      cap: "Our first board, day 1 to 2",
    },
    two: {
      quoteLabel: "A card on our board · Pragya, day 2",
      quote: "Most of the decisions on this board came from Claude, not from users.",
      h: "2 · The AI had been steering.",
      t: "So we interviewed designers, and made Squiggle show where every reason came from.",
    },
    surprise: "One more surprise: AI didn’t make us converge too fast. It kept opening possibilities — 22 ideas open at once.",
  },

  // ── 05 Research
  research: {
    label: "Research",
    title: "Three designers told us they lose track of why they made a decision.",
    interviews: [
      { src: img("interview-1"), q: "Later, when I ask ‘why did I decide this?’ I can’t find it.", mark: "‘why did I decide this?’", who: "Junior designer" },
      { src: img("interview-2"), q: "I want to see what led me from one idea to the next.", mark: "what led me from one idea to the next.", who: "Entry-level designer" },
      { src: img("interview-3"), q: "Figma shows the what, not the why. So I keep a separate story.", mark: "the what, not the why.", who: "Senior designer" },
    ],
    mentor: {
      k: "Mentor crit · Naheel Jawaid",
      q: "The map is too complex.",
      check: "{{워딩 확인}}",
      t: "He was right. Eight view tabs and a filter bar were all competing for attention (Hick’s law), so asking a question, the one thing we wanted people to do, didn’t stand out.",
    },
    insights: [
      "The hard part isn’t recording. It’s finding the reason again.",
      "Set-aside ideas disappear, even though they come back.",
    ],
    goalsLine: "Three goals followed: find the why, see the context, keep the story.",
  },

  // ── 06 Decisions: three goals, three options each, one kept (tabs)
  decisions: {
    label: "Design decisions",
    title: "For each goal we compared three options and kept one.",
    hint: "Click through the options we tried →",
    items: [
      {
        id: "sq-decision-1",
        n: 1,
        h: "Find the why, just by asking",
        options: [
          { tab: "Map first, search second", mp4: v("opt-map"), poster: img("opt-map-poster"), w: 960, h: 568, cap: "The one action that mattered got buried under views and filters." },
          { tab: "Timeline first, ask on top", src: img("opt-1b"), w: 788, h: 494, cap: "Search stayed small and easy to miss. Answers spread across cards." },
          { tab: "Ask first", mp4: v("opt-ask"), poster: img("opt-ask-poster"), w: 960, h: 564, cap: "One big search bar. Main reason first, dropped options below, a small map for context.", kept: true },
        ],
      },
      {
        id: "sq-decision-2",
        n: 2,
        h: "See the context, not just what you chose",
        options: [
          { tab: "Status by color", src: img("opt-2a"), w: 788, h: 467, cap: "Color alone didn’t explain each card’s status." },
          { tab: "Status by label", src: img("opt-2b"), w: 788, h: 467, cap: "Labels showed the status, never why it changed." },
          { tab: "The story between decisions", src: img("opt-2c"), w: 788, h: 467, cap: "Major decisions in a scrollable storyline under the map. Select one to see what changed and why.", kept: true },
        ],
      },
      {
        id: "sq-decision-3",
        n: 3,
        h: "Keep the story without writing it down",
        options: [
          { tab: "Story by hand", src: img("opt-3a"), w: 788, h: 467, cap: "Connecting the cards by hand. The map grew crowded fast." },
          { tab: "Story by timeline", src: img("opt-3b"), w: 788, h: 467, cap: "Showed when things happened, not why or how they connected." },
          { tab: "Story written for you", src: img("opt-3c"), w: 788, h: 467, cap: "Squiggle writes the storyline: what was chosen, what was dropped, and why.", kept: true },
        ],
      },
    ],
  },

  // ── 07 Designing for trust
  trust: {
    label: "Designing for trust",
    title: "Every answer points back to the original conversation.",
    shot: { src: img("answer"), w: 1400, h: 824, alt: "An answer in Squiggle with the source chat open below it: the designer's own words underlined, each reason linked to its conversation" },
    points: [
      { h: "Your own words are underlined", t: "Easy to tell apart from the AI’s summary." },
      { h: "Each reason opens its source chat", t: "Check any answer against what was said." },
      { h: "It admits when it has nothing", t: "“Nothing was logged about this yet” — instead of making an answer up." },
      { h: "Nothing gets erased", t: "A set-aside idea stays on the map as Potential." },
    ],
  },

  // ── 08 Reflection
  takeaways: {
    label: "Reflection",
    title: "What I’m taking from these six days.",
    items: [
      {
        title: "Use what you build.",
        text: "Our own map caught our blind spots before any reviewer did.",
        evidence: { id: "sq-built", label: "Evidence: built on day 1" },
      },
      {
        title: "Build the real thing early.",
        text: "A working connector on day 1 meant real problems, right away.",
        evidence: { id: "sq-built", label: "Evidence: 103 moments in 3 days" },
      },
      {
        title: "Keep the designer in charge.",
        text: "AI notices and summarizes. The decisions stay with the person.",
        evidence: { id: "sq-trust", label: "Evidence: designing for trust" },
      },
    ],
    back: "Back to takeaways",
    next: "Where we’d take it next: the record you keep for yourself becomes the handoff — the next designer inherits the why, not just the files.",
  },

  /** The closing frame of the submission video; the link arrives later. */
  film: { poster: img("closing"), alt: "Closing frame of our submission video: Every project is a story. Here’s ours.", href: "" },

  next: { id: "melon" as const, title: "CMU Mellon", line: "School email, made two-way." },
};
