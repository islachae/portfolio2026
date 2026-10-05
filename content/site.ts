/**
 * All copy on the site lives here. Components only read from it.
 * Lines marked TODO need your input before launch.
 */

export type PageId = "home" | "tipping" | "zipflow" | "pebbo" | "melon" | "wish" | "cocktail" | "bakery" | "lab" | "about" | "hi";

export type Page = {
  id: PageId;
  /** Sidebar group */
  group: "home" | "work" | "progress" | "fun" | "more";
  title: string;
  /** Short ticker-style symbol: the resting project index (left margin) and ⌘K search */
  ticker?: string;
  /** Grey line under the name in the inspector chip */
  kind: string;
  tagline: string;
  summary: string[];
  /**
   * Work pages: two labeled lines in the page's left column (Traveo-style) instead of paragraphs.
   * `summary` stays for search and ChaeLLM.
   */
  challenge?: string;
  did?: string;
  /** Label for `did`. Team projects say “My part” so the contribution is clear; default “What I did”. */
  didLabel?: string;
  /** Work pages: shown as chips under Role / Timeline / Type (and in the case study's hero) */
  tools?: string[];
  handoff?: { automated: string[]; yours: string[] };
  facts: { label: string; value: string }[];
  status?: "soon";
  /** Small mono line: "Payment UX • Concept 2025" */
  meta: string;
  /** Year shown in the sidebar */
  year?: string;
  /**
   * Home card, labelled the way Rachel Chen labels hers: `headline` is the large line (what the
   * project is, for whom, in plain words) and under it goes “<title> • <card>” (status and year).
   * Without them the card falls back to the tagline and to `meta`.
   */
  headline?: string;
  card?: string;
  /** Home card: the thumbnail (and, once, a small label on it) */
  tag?: string;
  thumb?: string;
  /** Home card: a clip in place of the still. A short one plays once and rests on its last frame
   *  (`thumb` is that frame); a `loop` one keeps playing while the card is on screen (`thumb` is a
   *  frame from it). Either way `thumb` is what shows wherever video can't play. */
  clip?: { mp4: string; webm: string; loop?: boolean };
  /** Extra words ⌘K search matches on */
  keywords: string[];
  /** The deck's big heading when it shouldn't just be the page name (About: “안녕! I’m Chaewon”) */
  heading?: string;
};

export const profile = {
  name: "Chaewon Lim",
  firstName: "Chaewon",
  role: "Product Designer",
  status: "Open to Summer ’27 internships",
  meta: ["Carnegie Mellon Univ. MDes", "Pittsburgh"],
  email: "chaewon2@andrew.cmu.edu",
  /** The small photo in Home's greeting (“Hi! I’m Chaewon [photo],”) */
  photo: "/about/me.webp",
  links: {
    // (the same file is also at /resume.pdf, for links shared before it was renamed)
    resume: "/Chaewon-Lim-Resume.pdf",
    linkedin: "https://www.linkedin.com/in/chaewon-lim-7591891a4/",
  },
  bio: {
    before: "A designer with an",
    parts: [
      {
        id: "artist",
        text: "artist's curiosity",
        /** Wide screens start a new line after this phrase (phones wrap naturally). */
        breakAfter: true,
        emoji: "/emoji/brain.webp",
        // "\n" = a line break in the note's title
        peekTitle: "Interactive art,\nSeoul → New York",
        peek: "Six exhibitions, two of them in New York. I was less interested in the object than the environment around it: what makes people slow down, move on, or stay. I still design that way.",
      },
      {
        id: "baker",
        text: "a baker's joy of sharing",
        emoji: "/emoji/bread.webp",
        peekTitle: "Hardcore baker",
        peek: "Hardcore enough to land me in a Michelin-starred kitchen, where every handoff has to work under pressure. I bake for people now, and I design the same way: it only counts if someone enjoys it.",
      },
      {
        id: "thinker",
        // "\n" = a line break on wide screens (the phrase stays one link)
        text: "a thinker's\ndrive to make AI worthy of trust",
        emoji: "/emoji/handshake.webp",
        peekTitle: "My working thesis",
        peek: "Let AI take the repetitive work. Make the moments that need judgment feel more like yours. That's how trust gets earned.",
      },
    ],
    after: "Especially drawn to fintech and wellness.",
    /** The words in `after` that get the emphasis. */
    afterEm: "fintech and wellness",
    /** The note under those words, like the ones under the three phrases. */
    afterPeekTitle: "Why these two",
    afterPeek: "Money and health are where a screen has to earn trust. Rethinking Tipping and Pebbo are my two tries at it.",
  },
  facts: [
    { label: "Now", value: "MDes, Carnegie Mellon" },
    { label: "Before", value: "Studio Art, NYU Steinhardt" },
    { label: "Next", value: "Design intern, NYC ’27" },
  ],
};

/** The thesis, one short pair per project. Keep each phrase short enough for one line. */
export const handoff = {
  title: "How I design with AI",
  line: "Automate the repetitive.\nKeep the judgment human.",
  rows: [
    { page: "tipping" as PageId, ai: "Do the math", human: "What it's worth" },
    { page: "zipflow" as PageId, ai: "Reformat listings", human: "The relationship" },
    { page: "pebbo" as PageId, ai: "Spot patterns", human: "Name the feeling" },
    { page: "melon" as PageId, ai: "Sort the inbox", human: "What matters" },
  ],
};

export const pages: Page[] = [
  {
    id: "home",
    meta: "Portfolio 2026",
    group: "home",
    title: "Home",
    ticker: "HOME",
    kind: "Chaewon Lim · Portfolio ’26",
    tagline: "",
    summary: [],
    // "Now" (CMU) is already in the cover bar; the panel keeps Before and Next
    facts: profile.facts.filter((f) => f.label !== "Now"),
    keywords: ["home", "start"],
  },
  {
    id: "tipping",
    meta: "Payment UX • Concept 2025",
    year: "2025",
    tag: "Payment UX",
    thumb: "/work/tipping-card.webp",
    // drawn for the card: one order in three moments (checkout, on the way while each service detail
    // is checked and the tip climbs, then the settled tip),
    // with only the words that matter, large, and the tip beside the phone
    clip: { mp4: "/work/tipping-card.mp4", webm: "/work/tipping-card.webm", loop: true },
    headline: "AI-assisted tipping that’s fairer for delivery apps",
    card: "Concept 2025",
    group: "work",
    title: "Rethinking Tipping",
    ticker: "TIP",
    kind: "Payment UX · AI",
    tagline: "Tipping, rethought for checkouts with AI in the loop.",
    summary: [
      "Tipping hasn't kept up with how we pay. The screen asks for a number at the most awkward moment, with almost nothing to go on.",
      "This project rethinks that moment for a world where AI sits inside the payment flow, without taking the decision away from the person who's tipping.",
    ],
    handoff: {
      automated: ["The math", "The context you'd otherwise guess at"],
      yours: ["What good service was worth", "The final say"],
    },
    challenge: "Delivery apps ask for the tip before the service happens, so the number is a guess.",
    did: "An AI-assisted flow: a small tip up front that settles after delivery, with the reasons shown.",
    // Same fields as the case study's hero: Role / Timeline / Type, then the tool stack
    facts: [
      { label: "Role", value: "Product Designer" },
      { label: "Timeline", value: "120 hours · Mar 2025" },
      { label: "Type", value: "Independent study" },
    ],
    // TODO(Chaewon): the real tool stack. Only Figma is filled in for now.
    tools: ["Figma"],
    keywords: ["fintech", "payments", "checkout", "tip", "tipping", "restaurant", "pos", "toast", "ai", "agentic", "trust", "money", "receipt"],
  },
  {
    id: "pebbo",
    meta: "AI companion • 2024",
    year: "2024",
    tag: "AI Companion",
    thumb: "/work/pebbo-card.webp",
    clip: { mp4: "/work/pebbo-card.mp4", webm: "/work/pebbo-card.webm", loop: true },
    headline: "AI companion that listens when eating brings guilt",
    card: "Side project 2024",
    group: "work",
    title: "Pebbo",
    ticker: "PEBO",
    kind: "AI companion · Health",
    tagline: "A companion that listens when eating feels heavy.",
    summary: [
      "Food trackers count calories. In four 90-minute interviews, people struggling with eating told me they didn't need another tracker. They needed something that listens.",
      "Pebbo pairs a private AI chat with a pocket-sized device you can squeeze or talk to. It reflects patterns back as gentle, anti-perfectionist nudges, turning guilt into awareness.",
      "Trust is built into the interface. Every insight has a “Check AI reasoning” view, the chat stays private by default, and one button erases everything.",
    ],
    handoff: {
      automated: ["Turning scattered chats into mood patterns", "Suggesting one small next step"],
      yours: ["What you share, and when", "Which nudge to try", "What gets erased"],
    },
    challenge: "People struggling with eating didn't want another tracker. They wanted something that listens.",
    did: "A private AI chat and a pocket device you squeeze or talk to, with “Check AI reasoning” on every insight.",
    // Matches the case study (from the portfolio PDF)
    facts: [
      { label: "Role", value: "UX research, UI, 3D modeling" },
      { label: "Timeline", value: "Oct – Dec 2024" },
      { label: "Type", value: "Individual project" },
    ],
    // TODO(Chaewon): the real tool stack (and the 3D tool). Only Figma is filled in for now.
    tools: ["Figma"],
    keywords: ["ai", "companion", "chatbot", "health", "wellbeing", "privacy", "trust", "tangible", "hardware", "research", "interviews"],
  },
  {
    id: "melon",
    meta: "Communication • In progress",
    year: "2026",
    tag: "In progress",
    group: "progress",
    thumb: "/work/melon/meet-mellon.webp",
    clip: { mp4: "/work/melon/meet-mellon.mp4", webm: "/work/melon/meet-mellon.webm" },
    headline: "Helping students catch key school emails, and advisors hear back",
    card: "In progress 2026",
    title: "CMU Mellon",
    ticker: "MELN",
    kind: "Communication · In progress",
    tagline: "School email, made two-way.",
    summary: [
      "School of Design graduate students get most program information by email from one coordinator, and each of them decides alone what matters. Almost nothing tells her what landed.",
      "On a team of three, I led the project, mapped how orientation information reaches students, and framed the problem. Mellon is a Gmail side panel that sorts school email by what needs doing, answers questions from what the coordinator already sent, and shows her what students found unclear.",
    ],
    handoff: {
      automated: ["Sorting and summarizing the inbox", "Answering from what was already sent"],
      yours: ["What matters to you", "Anything personal goes to a person"],
    },
    challenge: "Students couldn’t tell which school emails were meant for them, and their advisor couldn’t tell what landed.",
    didLabel: "My part",
    did: "Led a team of 3, mapped the orientation communication system and framed the problem behind Mellon, a Gmail side panel.",
    facts: [
      { label: "Role", value: "Team lead · systems mapping & framing" },
      // TODO(Chaewon): exact weeks
      { label: "Timeline", value: "Fall 2026 · in progress" },
      { label: "Type", value: "Team of 3 · MDes studio" },
    ],
    // TODO(Chaewon): the real tool stack. Only Figma is filled in for now.
    tools: ["Figma"],
    keywords: ["communication", "email", "inbox", "notifications", "personalization", "education", "school", "cmu", "advisor", "student", "productivity"],
  },
  {
    id: "zipflow",
    meta: "B2B SaaS • Team project 2026",
    year: "2026",
    tag: "B2B SaaS",
    thumb: "/work/zipflow.webp",
    headline: "Real estate SaaS: enter a listing once, use it everywhere",
    card: "Team project 2026",
    group: "work",
    title: "ZipFlow",
    ticker: "ZIPF",
    status: "soon",
    kind: "B2B SaaS · PropTech",
    tagline: "One listing, every workflow.",
    summary: [
      "Real estate agents spend their days re-entering the same property details: for every channel, every client, every new format.",
      "On a team, I led product design for ZipFlow. An agent registers a listing once, and it becomes the source for a shareable showroom, AI-assisted marketing, and tailored client briefings.",
      "It's built for Korean agents in their 40s and 50s, so it favors readability and familiar patterns over flashy AI. The agents stay in control of the work.",
    ],
    handoff: {
      automated: ["Reformatting a listing for every channel", "First drafts of marketing copy"],
      yours: ["Which clients see what", "The relationship itself"],
    },
    challenge: "Agents re-enter the same property details for every channel, client and format.",
    didLabel: "My part",
    did: "Led product design: register a listing once, and it feeds a showroom, AI-assisted marketing and client briefings.",
    facts: [
      { label: "Role", value: "Product design lead" },
      // TODO(Chaewon): how long (weeks / months)
      { label: "Timeline", value: "2026" },
      { label: "Type", value: "Team project" },
    ],
    // TODO(Chaewon): the real tool stack. Only Figma is filled in for now.
    tools: ["Figma"],
    keywords: ["b2b", "saas", "real estate", "proptech", "workflow", "dashboard", "enterprise", "productivity", "marketing", "ai", "team"],
  },
  {
    id: "cocktail",
    meta: "Motion • 3D • 2026",
    group: "fun",
    thumb: "/fun/cocktail-clip.webp",
    // 눈치 being made: the garnish drops in, the word and its receipt come out
    clip: { mp4: "/fun/cocktail-card.mp4", webm: "/fun/cocktail-card.webm", loop: true },
    title: "Untranslatable word bar",
    ticker: "MIX",
    kind: "Motion · 3D · Toy",
    tagline: "Words English doesn’t have, mixed as cocktails.",
    summary: [
      "Words like 눈치 (nunchi) don’t translate, so I mixed them instead: each one becomes a cocktail of emotional ingredients, poured as glossy gems into a chrome shaker.",
      "Two things to do, Make and Hold to shake. Everything else pours, shakes, garnishes and prints itself, in about fifteen seconds.",
    ],
    facts: [
      { label: "Built with", value: "Next.js, Motion, three.js" },
      { label: "On the menu", value: "Nunchi, Amae, Yuánfèn (more mixing)" },
    ],
    keywords: ["word cocktail", "word bar", "cocktail", "nunchi", "눈치", "amae", "甘え", "yuanfen", "缘分", "korean", "language", "untranslatable", "words", "motion", "3d", "three.js", "toy", "fun", "shake", "receipt"],
  },
  {
    id: "wish",
    meta: "XR • Gesture • 2024",
    year: "2024",
    group: "fun",
    thumb: "/fun/wish-card.webp",
    title: "Wish Tree",
    ticker: "WISH",
    kind: "XR · Gestural interaction",
    tagline: "A New Year wishing ritual, rebuilt in XR.",
    summary: [
      "Every New Year, people in Korea hike to temples and tie written wishes onto trees. Wish Tree turns that walk into XR: bring your hands together to speak a wish, blow to send it, and watch it join a tree lit by everyone else's.",
      "It grew out of Mycelia, my 2023 thesis installation at NYU Steinhardt, where about a hundred visitors tied handwritten wishes onto a sculpture of hanbok silk.",
    ],
    facts: [
      { label: "Built in", value: "Blender, gesture design" },
      { label: "Grew from", value: "Mycelia, NYU Steinhardt 2023" },
    ],
    keywords: ["xr", "vr", "gesture", "art", "3d", "blender", "installation", "wish", "korea"],
  },
  {
    id: "bakery",
    meta: "Off the clock",
    group: "fun",
    thumb: "/fun/bakery-card.webp",
    title: "Bakery Log",
    ticker: "BAKE",
    kind: "Off the clock",
    tagline: "Hardcore baker. Once, professionally.",
    summary: [
      "I took baking far enough to work in a Michelin-starred kitchen. It's still where I spontaneously get ideas.",
      "It's also how I think about craft: small details, precise timing, and a first bite that has to land.",
    ],
    facts: [{ label: "Status", value: "Always proofing" }],
    keywords: ["baking", "bake", "cake", "cookies", "michelin", "food", "fun", "hobby"],
  },
  {
    id: "lab",
    meta: "Playground",
    group: "fun",
    // not ready to show yet: its card on Home says “Coming soon” and doesn't open (like ZipFlow's)
    status: "soon",
    thumb: "/fun/lab-card.webp",
    title: "Interaction Lab",
    ticker: "LAB",
    kind: "Playground",
    tagline: "Tiny interactions I love from finance apps, rebuilt for fun.",
    summary: [
      "Rolling numbers, hold-to-confirm, hide-the-balance. The small moments that make money apps feel trustworthy, or at least fun.",
      "Everything here follows one rule of mine: prototype before overthinking.",
    ],
    facts: [
      { label: "Built with", value: "Next.js, Motion" },
      { label: "Rule", value: "One toy, one job" },
    ],
    keywords: ["micro-interaction", "microinteraction", "lab", "playground", "fintech", "animation", "prototype", "motion"],
  },
  {
    id: "about",
    meta: "About me • Pittsburgh",
    group: "more",
    title: "About me",
    heading: "안녕! I’m Chaewon",
    ticker: "ME",
    kind: "New York · Daejeon · Pittsburgh",
    tagline: "Interactive artist turned product designer.",
    summary: [],
    facts: [
      { label: "Based in", value: "Pittsburgh" },
      { label: "Studying", value: "MDes, Carnegie Mellon" },
      { label: "Before design", value: "Interactive art · 6 shows" },
      { label: "Speaks", value: "English, Korean, Spanish" },
    ],
    keywords: ["about", "bio", "background", "art", "exhibitions", "baking", "cats", "mets", "nyu", "cmu", "korean"],
  },
  {
    id: "hi",
    meta: "Contact",
    group: "more",
    title: "Say hi",
    ticker: "HI",
    kind: "Contact",
    tagline: "안녕 means hi. It also means bye.",
    summary: ["I'm looking for a product design internship in New York for Summer 2027. Big tech, B2B SaaS, fintech, or productivity tools: if you're building something people rely on, I'd love to hear about it."],
    facts: [
      { label: "Email", value: "chaewon2@andrew.cmu.edu" },
      { label: "Available", value: "Summer 2027" },
      { label: "Where", value: "New York City" },
    ],
    keywords: ["contact", "email", "hire", "hello", "linkedin", "resume", "cv"],
  },
];

export const pageById = Object.fromEntries(pages.map((p) => [p.id, p])) as Record<PageId, Page>;

export const about = {
  /** The deck page's three lines: the intro below, shortened (the full words are on the About page) */
  short:
    "Interactive art taught me that a piece shines when it creates flow, not when it demands the center stage. In design, I look for where people hesitate or lose trust, and find small ways to shift the rhythm.",
  intro: [
    "Coming from a background in interactive art, I learned the hard way that an artifact truly shines when it creates flow, rather than demanding the center stage.",
    "I've carried that into my design practice: looking closely at where people hesitate, disengage, or lose trust, and finding small ways to shift the rhythm. To me, good design feels intentional, crafted, and almost effortless.",
    "3 words to describe me: Crafted, never performed.",
  ],
  motto: "Designing with intention, craft, and a little hardcore energy.",
  strengths: ["Visual storytelling", "Problem reframing", "Interaction & systems thinking"],
  interests: [
    "Seeing the problems everyone takes for granted from a different angle",
    "Turning ideas into experiences that actually move",
    "Making complex information feel intuitive",
    "Exploring the relationship between people and technology",
  ],
  exhibitionsNote:
    "I've always made participatory work: the pieces are only complete once people take part.",
  exhibitions: [
    { year: "2023", title: "Dreamscape/Escape", type: "Two-person exhibition", place: "80WSE Gallery, New York" },
    { year: "2023", title: "Mycelia", type: "Group exhibition", place: "Barney Building, New York" },
    { year: "2021", title: "Asian Students and Young Artists Art Festival", type: "Group exhibition", place: "Chosun Press, Seoul" },
    { year: "2021", title: "Her’s", type: "Group exhibition", place: "Daejeon" }, // TODO: confirm title
    { year: "2020", title: "Sungan; MOMENT", type: "Solo exhibition", place: "Temiorae, Daejeon" },
    { year: "2020", title: "Young Korean Artists Exhibition", type: "Group exhibition", place: "Seoul 284, Seoul" },
  ],
  showPhotos: [
    { src: "/about/show-fabric.webp", alt: "Suspended fabric installation" },
    { src: "/about/show-indigo.webp", alt: "Indigo gradient wall pieces" },
    { src: "/about/show-sculptures.webp", alt: "Two blue ceramic sculptures on a plinth" },
    { src: "/about/show-domes.webp", alt: "White dome sculptures along a window" },
  ],
  philosophy: [
    {
      title: "Less, but intentional",
      quote: "Perfection is achieved, not when there is nothing more to add, but when there is nothing left to take away.",
      by: "Antoine de Saint-Exupéry",
    },
    { title: "Craft builds trust", quote: "The details are not the details. They make the design.", by: "Charles Eames" },
    { title: "Design for agency", quote: "People ignore design that ignores people.", by: "Frank Chimero" },
    { title: "Prototype before overthinking", quote: "The best way to have a good idea is to have lots of ideas.", by: "Linus Pauling" },
  ],
  offTheClock: [
    { label: "Hardcore baker", note: "Michelin-starred kitchen alum" },
    { label: "Proud foster mom", note: "14 cats and 1 dog" },
    { label: "Mets fan", note: "still rooting" },
  ],
};
