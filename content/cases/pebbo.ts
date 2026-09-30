/**
 * Pebbo: the full case study (opens at /#case/pebbo).
 * Copy comes from Chaewon's Pebbo portfolio PDF (2026), lightly edited for the web. Images are
 * crops of that PDF, in public/work/pebbo-case/. Edit words here; the layout reads from this file.
 * Structure follows Rachel Chen's OpenAI hardware case: solution and core flows first, then the
 * research and reasoning behind them.
 */
const img = (name: string) => `/work/pebbo-case/${name}.webp`;

/** Mood colours the device's LED reflects (from the PDF's "Color change based on mood"). */
export const PEBBO_MOODS = [
  { id: "calm", label: "Calm", color: "#F6C744" },
  { id: "anxious", label: "Anxious", color: "#EE5A43" },
  { id: "low", label: "Depressed", color: "#9B72E8" },
] as const;

export const pebboCase = {
  id: "pebbo" as const,
  eyebrow: "AI companion · App UX/UI · Tangible interaction",
  title: "Pebbo listens when eating feels heavy",
  subtitle: "Transforming guilt into gentle awareness, through touch, voice and a private AI chat.",
  meta: [
    { label: "Role", value: "UX research, UI, 3D modeling" },
    { label: "Timeline", value: "Oct – Dec 2024" },
    { label: "Type", value: "Individual project" },
  ],
  /** On the “Read the case study” button, the home card badge and ⌘K. The hero shows the tool stack instead. */
  readingTime: "6 min",
  hero: {
    src: "/work/pebbo.webp",
    alt: "The Pebbo keychain device with a glowing smile, next to a phone showing Pebbo listening",
    w: 1017,
    h: 552,
  },
  /** Left table of contents, Rachel's way: mostly names a reader recognizes at a glance (Problem,
   *  Solution, Research…), plus one or two that only this project has. Each label matches the mono
   *  label on its section, and the set and order follow this story. */
  toc: [
    { id: "cs-overview", label: "Overview" },
    { id: "pb-problem", label: "Problem" },
    { id: "pb-device", label: "Solution" },
    { id: "pb-scene", label: "User journey" },
    { id: "pb-research", label: "Research" },
    { id: "pb-approach", label: "Approach" },
    { id: "pb-trust", label: "Designing for trust" },
    { id: "pb-try", label: "Try Pebbo" },
    { id: "cs-takeaways", label: "Reflection" },
  ],
  overview:
    "Pebbo redefines our relationship with food through reflective AI and tangible design. Inspired by Extended Mind Theory and CBT journaling, Pebbo turns logging into a mindful dialogue, bridging emotion and cognition, body and mind.",

  problem: {
    label: "Problem",
    title: ["Eating and well-being are linked.", "Most of us overlook it."],
    text: "Using the Deloitte Access Economics report, the Barriers and Negative Nudges study and related clinical research, I looked at the scale of eating-related mental health challenges and how they are treated.",
    // One sentence to read, not two tiles to count (Tipping already counts people). Figures from the
    // Deloitte Access Economics report with Harvard STRIPED (2020); 1 in 11 is its 9%.
    scale: {
      lines: [
        { parts: [{ t: "About " }, { t: "1 in 11", hi: true }, { t: " Americans will face an eating disorder in their lifetime." }], note: 1 },
        { parts: [{ t: "Every year, eating disorders cost the US " }, { t: "$64.7 billion", hi: true }, { t: "." }], note: 2 },
      ] as { parts: { t: string; hi?: boolean }[]; note: number }[],
      notes: ["28.8 million people, about 9% of the population.", "Economic cost in 2018–19."],
      source: "Deloitte Access Economics, with Harvard STRIPED and the Academy for Eating Disorders, 2020",
    },
    cards: [
      { title: "Expanding demographics", text: "Once niche, now a generational and cultural problem.", source: "National Eating Disorders Association" },
      { title: "Journaling works", text: "Clinically proven two-track treatment: nutrition and mind.", source: "Weight Loss Maintenance Trial Research Group" },
    ],
  },

  device: {
    label: "Solution",
    title: ["Bridging food tracking and emotional care,", "digitally and physically."],
    text: "Pebbo pairs a private AI chat with a pocket-sized companion that clips onto your keychain. It supports emotional expression through everyday touch and conversation, without social stigma. One click of its button starts talking, and everything syncs to the app.",
    src: img("device-calm"),
    alt: "The Pebbo keychain device: a pebble-shaped body with a glowing face and a small microphone button",
    // Callouts on the render, in % of the image
    parts: [
      { label: "Talk mode button", x: 47, y: 49, side: "left" },
      { label: "Mood reflection LED", x: 72, y: 60, side: "right" },
      { label: "Squeeze-friendly dimples", x: 18, y: 72, side: "left" },
      { label: "Keychain clip", x: 17, y: 10, side: "right" },
    ],
    flow: [
      { k: "You", v: "Touch · Talk" },
      { k: "Pebbo", v: "Multi sensors" },
      { k: "App", v: "BLE · real-time sync" },
    ],
    moodLabel: "Color changes with mood",
    haptic: "Are you OK?",
    squeeze: "Squeeze",
    features: ["Talk-record mode", "Haptic reminder", "Stress-relief squeeze tracking", "Mood reflection LED"],
  },

  // Journey 2, played by the reader's scroll: the device on the left, the phone on the right
  scene: {
    label: "User journey · Grip, talk, reflect",
    title: "Unspoken feelings, turned into a healthier mindset through touch, voice and small nudges.",
    hint: "Scroll to follow one stressful afternoon",
    bridges: [
      { src: img("sketch-squeeze"), alt: "Line drawing of a hand squeezing Pebbo", label: "Stress → grip & squeeze" },
      { src: img("sketch-talk"), alt: "Line drawing of a person talking to Pebbo held in their hand", label: "Stress → talk" },
    ],
    steps: [
      {
        title: "Grip",
        text: "When it’s too much, squeeze. The dimples trigger haptic feedback to relieve stress, and Pebbo quietly tracks the pattern.",
        screen: { src: img("screen-home"), alt: "Pebbo home screen asking what kind of taste feels right today" },
      },
      {
        title: "Talk",
        text: "Press the talk button and say it out loud. Speaking thoughts out loud clarifies tangled feelings.",
        screen: { src: img("screen-listen"), alt: "Listening screen: “forgot to bring my breakfast packed yesterday, so bought all the snacks and fast…”" },
      },
      {
        title: "Nudge",
        text: "Pebbo answers with one context-aware suggestion, not a rule: here, a no-guilt yogurt bark for sweet cravings.",
        screen: { src: img("screen-recipe"), alt: "Chat with an explore card: a no-guilt yogurt bark recipe with ingredients and steps" },
      },
      {
        title: "Reflect",
        text: "Recipes and quotes you save gather in one place, and Pebbo recommends and reflects on them again.",
        screen: { src: img("screen-saved"), alt: "Saved screen: a grid of colourful notes, recipes and weekly reflections" },
      },
    ],
  },

  // Journey 1: a day, from the check-in notification to the monthly summary
  daily: {
    label: "User journey · Daily reflection",
    title: "After skipping dinner out of stress, the user felt seen.",
    text: "Pebbo’s context-aware dialogue starts from one gentle notification and ends in a summary of the month.",
    notification: {
      time: "06:20 PM",
      title: "Craving something comforting?",
      lines: ["Maybe not food. Maybe warmth.", "Try writing one thing that felt good at dinner."],
    },
    steps: [
      { k: "After-dinner check-in", t: "A notification, not a reminder to log." },
      {
        k: "Meet Pebbo’s mood reflection",
        t: "Answer today’s prompt. The avatar’s colour reflects the mood of your words.",
        src: img("screen-home"),
        alt: "Home: “hey chaewon, I noticed you often crave something sweet after a long day. Maybe it’s a sign of trying hard.”",
      },
      {
        k: "Converse with Pebbo",
        t: "Release emotions freely. The chat stays private unless you choose otherwise.",
        src: img("screen-chat"),
        alt: "Chat: Pebbo reassures that craving carbs or sweets after work is natural",
      },
    ],
    chipsTitle: "Follow micro suggestions for self-kindness",
    chipsHint: "Pick a suggestion type",
    chips: [
      { id: "log", label: "log", tone: "#8DBDF2", ink: "#123A63", kind: "A small win, noted", card: "Made avocado toast instead of ordering delivery! Proud of you" },
      { id: "explore", label: "explore", tone: "#F29AC6", ink: "#5C1739", kind: "A recipe or idea to try", card: "No-guilt yogurt bark for sweet cravings" },
      { id: "quest", label: "quest", tone: "#D5E07A", ink: "#3A4210", kind: "One tiny action", card: "Take a 10-min mindful nap with bossa nova" },
      { id: "peek", label: "peek", tone: "#F2D05A", ink: "#4A3A06", kind: "A look back at your week", card: "April week 3 · You gave yourself permission to rest more" },
    ],
    summaryTitle: "Review the mood behind the meals",
    summaryText: "Mood variations are collected from conversations and aggregated into monthly, daily and yearly summaries.",
    summaries: [
      { src: img("screen-monthly"), alt: "Monthly summary: mood frequency, happiness 32%, and highlight stories", cap: "Monthly · mood frequency" },
      { src: img("screen-board"), alt: "Emotion scattered board and a track timeline of calm and energetic weeks", cap: "Scattered board · timeline" },
      { src: img("screen-daily-yearly"), alt: "Daily energy curve and a yearly grid of coloured mood dots", cap: "Daily · yearly" },
    ],
    reflection:
      "You realize you’ve been doing better than you thought. The summary reveals mood insights; the next day, you carry a small action Pebbo suggested, and Pebbo checks in with a notification.",
  },

  research: {
    label: "Research",
    title: ["Four interviews,", "one clear ask."],
    text: "Through four 90-minute semi-structured interviews with adults in their 20s and 30s experiencing eating disorders (3 female, 1 male), I examined lived experiences and the emotional patterns shaping eating-related stress.",
    insight: "Users don’t need another calorie tracker. They need a companion that listens, reflects, and guides mental recovery around eating.",
    q: "What does “an ideal healthy meal” mean to you?",
    a: [
      { t: "“People often say a balanced carb-protein-fat meal is healthy, but to me, " },
      { t: "a truly healthy meal is one I can enjoy freely", b: true },
      { t: ", comfortably with family or friends, without guilt, even if it’s heavy.”" },
    ],
    who: { name: "Namjoo Kwon, 26", role: "Graduate student", src: img("interviewee") },
    patternsLabel: "Shared patterns",
    patterns: [
      "Irregular routines, irregular eating",
      "From healthy to self-compassion",
      "Wants privacy & shared empathy",
      "Pressure of eating right",
      "Conflict between food, social life and control",
    ],
    boardLabel: "Reclustering key problems across eating disorders and food-tracking apps",
    board: [
      {
        head: "Laborious logging, wrong nudges",
        notes: ["High entry effort: ingredients, portions, eating out", "Missed logs → habit dropout", "Doesn’t reflect cultural or dietary diversity"],
      },
      {
        head: "Mindsets & emotions as the central focus",
        notes: ["Perfectionism → guilt → binge-avoid cycles", "Progress linked to small wins & self-compassion"],
      },
      {
        head: "Privacy first. Empathy without exposure",
        notes: ["Food and weight feel private → prefer 1:1 spaces", "Communities help, but also trigger shame", "Users hide “bad days” and skip logging outings"],
      },
      {
        head: "Misconceptions about “healthy eating”",
        notes: ["Diet = tasteless, expensive, time-consuming", "“Balance” is unclear; jargon doesn’t stick", "Need simple, low-effort, taste-friendly guidance"],
      },
    ],
  },

  define: {
    label: "Problem definition",
    statement: [
      { t: "Young adults often feel stress and guilt around their eating habits. " },
      { t: "Healthy eating is deeply tied to psychological well-being, yet many fail to recognize the connection.", b: true },
      { t: " This fuels an unhealthy, unsustainable cycle of emotional distress." },
    ],
    loopLabel: "Emotional eating loop",
    loop: ["Stress", "Binge eating", "Guilt", "Restrict"],
    why: {
      k: "Why it matters",
      v: "Persistent food-related stress leads to emotional exhaustion and a distorted sense of self, reinforcing fragile relationships with food and self-care.",
    },
    who: { k: "Who it affects", v: "20–29-year-olds balancing work, study and emotional fatigue." },
  },

  approach: {
    label: "Approach",
    title: ["Four problems, four features.", "Three in the app, one in your hand."],
    core: "Struggle to recognize the link between healthy eating and psychological well-being",
    rows: ["Defining problem", "Solution", "Method", "Key feature"],
    cols: [
      {
        problem: "Distorted beliefs about healthy eating",
        solution: "Mindful eating guide",
        method: "App",
        feature: "Log, explore, quest, peek suggestions",
        text: "AI offers context-aware micro-suggestions, with low-barrier ways in, like mini quests or recipes.",
      },
      {
        problem: "Unnoticed emotional states",
        solution: "Mood insights",
        method: "App",
        feature: "Monthly, daily, yearly summary",
        text: "Scattered conversations are synthesized into visual insights of emotional and eating patterns.",
      },
      {
        problem: "Fear of open expression",
        solution: "Judgment-free, private AI chat",
        method: "App",
        feature: "Private AI chat mode",
        text: "Speak freely with AI, without judgment. A disclaimer and an “Erase all” button keep you in control.",
      },
      {
        problem: "Losing long-term habit formation",
        solution: "Anti-perfectionist journaling",
        method: "Device",
        feature: "Talk mode & tactile feedback",
        text: "Speaking out loud clarifies tangled feelings. Squeezing triggers haptic feedback to relieve stress while tracking patterns.",
      },
    ],
    iaLabel: "Information architecture",
    ia: [
      { k: "Home", items: ["Header", "Today’s prompt", "Action suggestion chips", "Chat input bar"] },
      { k: "Summary", items: ["Monthly", "Daily", "Yearly"] },
      { k: "Saved", items: ["Chat bubbles"] },
      { k: "Profile", items: ["Account info", "Privacy & data", "Preferences"] },
    ],
    wire: {
      src: img("wireframe"),
      alt: "Annotated wireframe of the home and chat screens: nudge prompt, emotion avatar, action chips, context menu and talk mode",
      w: 1126,
      h: 554,
    },
  },

  trust: {
    label: "Designing for trust",
    title: ["Make the AI legible.", "Keep the person in control."],
    text: "An AI that talks about food and feelings has to earn trust twice: by showing how it reached an insight, and by letting people decide what it keeps.",
    reason: {
      k: "Check AI reasoning",
      t: "Long-press any suggestion to see how the insight was formed, so users can understand it, trust it and reflect on it.",
      hint: "Press and hold the quest",
      hintKey: "or press Enter",
      quest: "Take 1 minute to remember how that first bite tasted. What did it remind you of?",
      menu: ["Check AI reason", "Save", "Copy", "Mention", "Share"],
      because: "You often mentioned craving sweets after stressful days.",
      noticedK: "AI noticed",
      noticed: ["Evening cravings often follow high workload or emotional fatigue.", "Your last log mentioned “feeling heavy after dessert.”"],
      table: {
        head: ["Pattern", "Frequency", "Impact"],
        rows: [
          ["Evening cravings", "4× this week", "Medium stress"],
          ["Positive reflection after logging", "2×", "Calm"],
        ],
      },
    },
    privacy: {
      k: "Private by default",
      t: "Chats stay on your side unless you choose otherwise. Privacy chat mode, an app lock and export sit in Profile, and one button erases every conversation.",
      src: img("screen-profile"),
      alt: "Profile screen: linked Pebble, app lock, privacy chat mode, export chat and a red Erase All Chat button",
      footnote: "Talking with your AI. Stays private unless you want.",
    },
    onboarding: {
      k: "A soft start",
      t: "Onboarding asks how you’d colour today’s meal memory, not what you ate, and offers a passcode before anything is shared.",
      src: img("screen-onboarding"),
      alt: "Three onboarding screens: colour today’s meal memory, set a passcode, and sign in",
      w: 1200,
      h: 807,
    },
  },

  // “Try Pebbo”: a working copy of the Pebbo app chat at the end of the case. The answers come from
  // content/cases/pebbo-brain.ts (Claude when it can be reached, else the scripted listener).
  tryIt: {
    label: "Try Pebbo",
    title: ["Tell Pebbo how eating felt today."],
    text: "This is the Pebbo chat, working. Type how eating felt, or tap one of the four buttons. Pebbo’s face changes with the mood of your words, and holding any of Pebbo’s messages opens the same menu as the app, with “Check AI reason”.",
    say: "Try saying",
    starters: ["Skipped lunch, then ate a whole bag of chips", "Craving sweets again tonight", "Cooked a real breakfast today!", "Dinner with friends felt like a lot"],
    noteLive: "Replies here come from Claude, on your own account, after you allow it. Nothing is saved.",
    noteScript: "Replies are scripted from what you type (English or Korean), not a live AI. Nothing is saved or sent anywhere.",
    reset: "Start over",
    // the app's home screen before the first message
    home: {
      greet: "hey there, I’m Pebbo. Whatever you ate today, you can tell me. No counting, no judging.",
      // The typed prompt follows the visitor's local time. from/to are hours (to is exclusive; a slot
      // can wrap past midnight). The small hours rotate between two lines on each “Start over”.
      prompts: [
        { name: "Morning", from: 5, to: 11, texts: ["How are you feeling about food this morning?"] },
        { name: "Lunch", from: 11, to: 14, texts: ["How has eating felt so far today?"] },
        { name: "Afternoon", from: 14, to: 18, texts: ["Any food thoughts on your mind this afternoon?"] },
        { name: "Evening", from: 18, to: 22, texts: ["Looking back, how did eating feel today?"] },
        { name: "Night", from: 22, to: 2, texts: ["Anything about today’s meals still on your mind tonight?"] },
        { name: "Small hours", from: 2, to: 5, texts: ["What’s on your mind in these quiet hours?", "Any food worries keeping you company tonight?"] },
      ] as { name: string; from: number; to: number; texts: string[] }[],
    },
    placeholder: "Tell me anything",
    footer: "Talking with your AI. Stays private unless you want.",
    thinking: "thinking...",
    // the four round buttons above the input (log, explore, quest, peek) send one of these
    actions: {
      log: { label: "log", say: "I want to note a small win from today" },
      explore: { label: "explore", say: "What should I eat tonight?" },
      quest: { label: "quest", say: "Give me one tiny thing to do for myself" },
      peek: { label: "peek", say: "How has my week been?" },
    },
    hold: "Hold a message to check AI reasoning",
    // the app's long-press menu
    menu: ["Check Ai reason", "Save", "Copy", "Mention", "Share"],
    noticed: "AI noticed:",
    mentioned: "You mentioned",
    moodRead: "Mood read:",
    table: ["Pattern", "Frequency", "Impact"],
    times: "× today",
    impact: { calm: "calm", anxious: "medium stress", low: "low mood" } as Record<"calm" | "anxious" | "low", string>,
    shareOff: "Sharing is off in this demo",
    // the same labels when Pebbo answered in Korean
    ko: {
      noticed: "AI가 알아챈 것:",
      mentioned: "이렇게 말했어요:",
      moodRead: "읽은 기분:",
      table: ["패턴", "빈도", "영향"],
      times: "회 · 오늘",
      moods: { calm: "편안", anxious: "긴장", low: "가라앉음" } as Record<"calm" | "anxious" | "low", string>,
      impact: { calm: "편안", anxious: "중간 스트레스", low: "가라앉은 기분" } as Record<"calm" | "anxious" | "low", string>,
    },
    moods: { calm: "Calm", anxious: "Tense", low: "Low" } as Record<"calm" | "anxious" | "low", string>,
    sourceLive: "Answered live by Claude",
    sourceScript: "Scripted demo answer",
    help: [
      { label: "National Alliance for Eating Disorders", href: "https://www.allianceforeatingdisorders.com/" },
      { label: "988 Suicide & Crisis Lifeline", href: "https://988lifeline.org/" },
    ],
  },

  takeaways: {
    label: "Reflection",
    items: [
      {
        title: "Emotional AI is not about prediction, but presence",
        text: "Pebbo doesn’t forecast what someone will eat. It listens first, through a squeeze or a few spoken words, and answers with one small, kind suggestion.",
        evidence: { id: "pb-scene", label: "Evidence: grip, talk, reflect" },
      },
      {
        title: "Design should extend cognition, not control behavior",
        text: "Every insight shows its reasoning and every suggestion is optional. Pebbo holds the patterns so people can think with them; what to do stays their call.",
        evidence: { id: "pb-reason", label: "Evidence: check AI reasoning" },
      },
      {
        title: "Tangibility builds empathy beyond digital boundaries",
        text: "A squeeze says “this is hard” without words or an app to open. Something you can hold makes care feel present, not only on a screen.",
        evidence: { id: "pb-device", label: "Evidence: the companion device" },
      },
    ],
    back: "Back to takeaways",
  },

  next: { id: "melon" as const, title: "CMU Melon", line: "School email, made two-way." },
};
