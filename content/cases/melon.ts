/**
 * CMU Mellon: the case study (opens at /#case/melon).
 * Sources: the team's final presentation (Team Shadyside, Fall 2026), the advisor and student
 * interview transcripts, Donna's written answers, the student survey, the card and chat
 * explorations, the prototype (student panel and advisor dashboard), the working Chrome extension
 * (mellon-extension/) and its recordings.
 * Donna agreed to be named; students are not named.
 *
 * Nine sections, each with one headline, so the headlines alone tell the story:
 * brief → problem → research → exploration → decisions → solution → build → validation → reflection.
 *
 * Placeholders: anything inside {{ }} is not known yet (test results, a quote to confirm, a count
 * from the survey). It renders as a dashed, muted mark (`.ml-todo`) so it can't pass for a real
 * number. Search this file for "{{" to find them all.
 */
const img = (name: string) => `/work/melon-case/${name}.webp`;

/** A numbered mark on a screenshot (x, y in percent of the picture) and what it points at. */
export type Pin = { x: number; y: number; t: string };
export type Shot = { src: string; alt: string; w: number; h: number; pins: Pin[]; cap?: string };

export const melonCase = {
  id: "melon" as const,
  eyebrow: "Communication design · AI assistant · Built in code",
  title: "Making “sent” mean “informed.”",
  subtitle: "A Gmail side panel that tells grad students what to do next, and tells their advisor what students still don’t understand.",
  meta: [
    { label: "Role", value: "Design lead · built the student panel" },
    { label: "Team", value: "Jamie Chung, Chaewon Lim, Pragya Srivastava · CMU MDes Studio" },
    { label: "Timeline", value: "Sept–Oct 2026 · 7 weeks" },
  ],
  readingTime: "6 min",
  hero: {
    src: "/work/melon/mellon-hero.webp",
    alt: "The Mellon side panel beside Gmail: an update card opens, its source email opens on the left, and a question gets an answer with its source",
  },
  /** Left table of contents: one entry per section, in the order of the story. */
  toc: [
    { id: "cs-overview", label: "Overview" },
    { id: "ml-brief", label: "Brief" },
    { id: "ml-gap", label: "Problem" },
    { id: "ml-research", label: "Research" },
    { id: "ml-directions", label: "Exploration" },
    { id: "ml-decisions", label: "Decisions" },
    { id: "ml-melon", label: "Solution" },
    { id: "ml-build", label: "Build" },
    { id: "ml-valid", label: "Validation" },
    { id: "cs-takeaways", label: "Reflection" },
  ],

  /** Right under the first screen: what it achieved, in three. */
  impact: {
    label: "Impact",
    items: [
      { n: "{{6/6}}", v: "students found the next action · {{14s}} vs {{71s}} in Gmail" },
      { q: "{{A sentence from Donna after the test}}", v: "Donna, Graduate Academic Advisor" },
      { n: "Real Chrome extension", v: "built with Claude Code", wide: true },
    ] as { n?: string; q?: string; v: string; wide?: boolean }[],
  },

  // ── 01 The brief
  brief: {
    label: "Brief",
    title: "What happens to all those school emails after they’re sent?",
    text: "The brief asked for a campus-wide, multi-channel communication system. We picked the one channel failing us every week. As grad students, we were always missing resources that had already been emailed to us. School email arrives from everywhere, and the part that matters most comes through one advisor, Donna.",
  },

  // ── 02 The problem: one email read two ways (illustrative: composed from what both sides told us)
  gap: {
    label: "Problem",
    title: ["The same email,", "read two ways."],
    modes: [
      { id: "donna", label: "As Donna sent it" },
      { id: "student", label: "As a student read it" },
    ],
    note: "Illustrative email, composed from the kinds of messages we studied.",
    frame: "Problem: “Important” means two different things",
    email: {
      from: "Donna · Graduate Academic Advisor",
      subject: "Important: Spring registration + resources",
      subjectMark: { donna: 1, student: 4 },
      lines: [
        { t: "Hi everyone," },
        { t: "Spring registration opens **Monday, Nov 9 at 8:00 AM**. Please review the Master’s Registration Guide before then.", mark: { donna: 2, student: 3 } },
        { t: "CPDC DROP-IN HOURS are this week for résumé and portfolio reviews: [Book on Handshake]", caps: true, mark: { student: 1 } },
        { t: "The Student Academic Success Center has new English and writing sessions: [Learn more] [Schedule]", mark: { student: 2 } },
        { t: "If you end up on a waitlist, the steps are in the guide: [Waitlist steps]", mark: { donna: 3 } },
        { t: "GSA social this Friday at 5 PM. All welcome." },
        { t: "Let me know if you have questions. Happy to help!" },
      ] as { t: string; caps?: boolean; mark?: { donna?: number; student?: number } }[],
    },
    notes: {
      donna: [
        { n: 1, t: "“Important” means it’s pending: “This should be on everyone’s radar. And save this to reference.”" },
        { n: 2, t: "The deadline this email exists for, timed two weeks before registration opens." },
        { n: 3, t: "A reference for later. When a student asks, she can point back to it: “a paper trail.”" },
      ],
      student: [
        { n: 1, t: "What they noticed first: “CPDC.” It was bold, in capitals." },
        { n: 2, t: "Many links. Early on they opened every one, “like three tabs,” then stopped and closed them all." },
        { n: 3, t: "The one line with a date and an action, which is what “important” means to them. It doesn’t stand out." },
        { n: 4, t: "“Honestly, it doesn’t feel that important to me.”" },
      ],
    },
    /** Under the email: the two readings, then what flows back. */
    reads: [
      { k: "As Donna sent it", v: "“Important” means pending. Save this for later." },
      { k: "As a student read it", v: "“Important” means is there a deadline? No? Star it. Forget it." },
      { k: "What comes back", v: "Nothing. Donna never finds out how it was read." },
    ],
  },

  // ── 03 Research: one event followed through the school, the beliefs that broke, the survey
  research: {
    label: "Research",
    title: ["Students had too much email, and their advisor", "had no way to know what landed."],
    text: "We traced one event, grad orientation, through the whole school. Students were drowning in information with no way to sort it. Donna had no way to know what landed, so her effort went where she guessed it was needed.",
    map: {
      frame: "Grad orientation, traced through the school",
      mp4: "/work/melon-case/map-anim.mp4",
      poster: img("map-anim"),
      w: 1742,
      h: 1046,
      alt: "Map of how orientation information reaches a School of Design student. It starts grey, comes into colour, then lights up in turn: every line between Donna and the student, the sixteen channels, and the lines that run through email.",
    },
    numbers: [
      { n: "16", v: "channels the information travels through" },
      { n: "7", v: "people sending it, from faculty to career services" },
      { n: "1", v: "advisor relaying most of it" },
    ],
    numbersNote: "What the map showed. Then 3 student interviews, 1 advisor interview and a 12-person survey.",
    brokeTitle: "From the interviews: two assumptions the system runs on, and what broke them",
    brokeLabels: { a: "We assumed", q: "We heard", area: "So the problem is" },
    broke: [
      { a: "Students recognize urgency.", q: "It doesn’t feel that important to me. But from Donna’s perspective, I guess it’s important.", who: "Graduate student", area: "Different ideas of importance" },
      { a: "Sent means informed.", q: "I’m never really sure if they understand my email responses.", who: "Donna, Graduate Academic Advisor", area: "Limited feedback to the advisor" },
    ],
  },

  // The student survey (Google Form, Sept 19–21, 2026; 12 responses). Counts are of the students
  // who answered each question; most questions were “choose everything that applies”.
  survey: {
    label: "Three things the survey added",
    findings: [
      { h: "Students want a clear source, and that source is Donna.", v: "5 of 9 ask Donna to double-check even after they’ve found the answer themselves." },
      { h: "Most questions go to classmates, so Donna never hears them.", v: "6 of 8 ask a classmate instead of Donna. Email feels formal, greeting and all, so a small question doesn’t seem worth sending." },
      { h: "Admitting doubt builds trust.", v: "6 of 7 would trust an AI more if it says when it isn’t sure." },
    ],
  },

  // ── 04 Exploration
  directions: {
    label: "Exploration",
    title: ["We explored five ways to get answers back to students,", "and kept two."],
    concepts: [
      { src: img("concept-1"), name: "Mini Donna", keep: true, why: "Kept. Answers only from what Donna already sent." },
      { src: img("concept-2"), name: "Smart email labels", keep: true, why: "Kept. Labels each email by what to do with it: act, read, or save." },
      { src: img("concept-3"), name: "Email comment layer", keep: false, why: "Set aside. Questions like funding and health can’t sit in a public thread." },
      { src: img("concept-4"), name: "Slack event hub", keep: false, why: "Set aside. Donna leaves Slack after orientation." },
      { src: img("concept-5"), name: "SoD event website", keep: false, why: "Set aside. Every update goes through the web admin and a yearly review." },
    ],
    sketch: { src: img("first-sketch"), alt: "First sketch: a side panel beside the Mail inbox with tabs for primary info and calendar, cards for calendar events, priority info and to-dos, an AI summary that links to the exact email, and chat with quick action buttons", w: 1700, h: 925 },
    sketchTitle: "First sketch",
    sketchCap: "Our first sketch: a panel beside the inbox, with every update in one place. Each one opens into a summary, and the summary links back to the email it came from.",
  },

  // ── 05 Decisions: three calls, each with the picture of what it chose
  decisions: {
    label: "Decisions",
    title: ["Three calls: sort before you chat, stay inside Gmail,", "and keep Donna the author."],
    items: [
      {
        id: "ml-decision-1",
        frame: "Chat only vs. sort first, ask second",
        n: "Decision 1",
        h: "Why not just a chatbot?",
        v: "Students had two problems: too many emails to sort, and questions about the ones they did read. One feature couldn’t solve both. A chatbot only helps with the second, and only once you know what to ask. So I designed the panel to sort updates into cards first, with chat underneath for whatever a card leaves unclear, and every answer links back to the email it came from.",
        img: { src: img("decision-1"), w: 2240, h: 1220, alt: "Two side panels. Left, greyed out: a chat-only panel with an empty “Ask me anything” screen. Right: Mellon, with update cards on top and, underneath, a question about funding answered from Donna’s email of Aug 31" },
      },
      {
        id: "ml-decision-2",
        frame: "The question, next to the email it’s about",
        n: "Decision 2",
        h: "Stay inside email, even though the survey said website.",
        v: "{{N of 12}} students said they’d expect a chatbot on the school website, probably because that’s where they’d seen one before. But their questions came up while reading email, so we put Mellon next to the inbox. It also suited Donna. In 17 years she has seen plenty of tools come and go, including AI assistants that didn’t last, so we didn’t want to hand her a new one to learn. She keeps writing email as she always has, and Mellon works from those emails.",
        img: { src: img("decision-2"), w: 2240, h: 1160, alt: "Donna’s funding email open in the inbox, with Mellon beside it. The panel knows which email is open and answers “When do I have to apply by?” with the dates from that email" },
      },
      {
        id: "ml-decision-3",
        frame: "Every answer dated · reuse is Donna’s call",
        n: "Decision 3",
        h: "Donna stays the author.",
        v: "Mellon answers students from Donna’s past emails, so in a way it speaks for her. She was wary of that. She wanted “strong controls at first,” and she worried that “old information could be stored and shared in error,” like last year’s deadline reaching this year’s students. So every answer shows which of her emails it came from and when she sent it. And when she answers a new question, it only gets reused for other students if she says so.",
        img: { src: img("decision-3"), w: 2240, h: 1220, alt: "Left, the student panel: an answer about the convocation RSVP with a card for Donna’s email of Aug 18. Right, Donna’s reply screen (a design prototype): her answer, “Send to Student A” checked and “Save as a reusable answer” left unchecked" },
      },
    ],
  },

  // ── 06 Solution
  melon: {
    label: "Solution",
    title: ["Mellon sorts updates by what needs doing, answers from Donna’s own emails,", "and shows her what students are still asking."],
    /** The two sides in one loop: a student asks, interest shows up, the advisor invests, support comes back. */
    loop: {
      frame: "Solution: a question becomes support",
      mp4: "/work/melon-case/loop.mp4",
      poster: img("loop"),
      w: 1920,
      h: 1080,
      alt: "The loop between the two screens: a student asks in the panel, the question shows up on Donna’s dashboard as rising interest, she invests where students are asking, and her answer comes back to students as a new update",
    },
    /** The student side is the working extension, recorded; the advisor side is a design prototype. */
    student: { label: "Student panel · working build" },
    chapters: ["Action needed comes first", "Summary first, source one tap away", "Ask next to the email", "Clear in bulk"],
    advisor: {
      label: "Advisor dashboard · design prototype",
      shot: {
        src: img("donna-overview"), w: 2194, h: 1080,
        alt: "Donna’s Overview: questions by category for the last seven days with arrows on the ones that are rising, 19 questions waiting for her answer, 41 answered by Mellon, two topics that need her answer, and two topics no Graduate Programs email covers yet",
        pins: [
          { x: 36.4, y: 17.6, t: "Where interest is rising" },
          { x: 69.1, y: 28.7, t: "New vs. already answered" },
          { x: 17.5, y: 56.1, t: "Each question beside its email" },
          { x: 22.2, y: 81.3, t: "Interests no email covers yet" },
        ],
      } as Shot,
    },
  },

  // ── 07 Design × Build
  build: {
    label: "Build",
    title: "Building the real panel changed the design.",
    text: "In Figma, we designed around 8 emails we picked ourselves. Then I built the panel as a Chrome extension with Claude Code and ran it on my own inbox: about 100 emails a week, most of them messier than anything we had mocked up.",
    pair: [
      { src: img("build-figma"), w: 640, h: 1552, k: "Figma · 8 sample emails", alt: "The Figma design of the Mellon panel: All 9 updates, two cards under Action needed, one under Today, and suggested questions above Ask Mellon" },
      { src: img("build-real"), w: 746, h: 1714, k: "Real build · my inbox, about 100 a week", alt: "The working Mellon extension on a real inbox: All 71 updates and 30 unread, long titles wrapping onto three lines, and a new Check first section warning that a sender imitates CMU from another address" },
    ],
    brokeTitle: "What broke, what changed",
    broke: [
      "{{Example: Real subject lines run 80 characters. The card now rewrites the key point instead of cutting it off.}}",
      "{{Example: 1 in 5 emails had no action. Those collapse into a digest instead of empty cards.}}",
      "{{Example: Linking to the source needed Gmail’s thread ID, which changed how a summary and its email are stored.}}",
    ],
    stack: ["Built with Claude Code", "Chrome side panel", "Vanilla JS", "Gmail API (read-only)", "Claude Haiku"],
    stackNote: "Prototyping in code let me test with real email, not sample email.",
    link: "{{GitHub / demo →}}",
  },

  // ── 08 Validation (to fill in after the test)
  valid: {
    label: "Validation",
    title: "We tested the working panel with students and Donna.",
    setup: "{{6}} students + Donna · task-based test on the working build",
    results: [
      { n: "{{6/6}}", v: "found the next action · {{14s}} median vs {{71s}} in Gmail" },
      { n: "{{5/6}}", v: "reached the source email from a funding question" },
      { n: "{{6/6}}", v: "got handed to Donna when Mellon wasn’t sure" },
    ],
    photo: "{{Photo: presenting to Donna and the studio (or a still from the Zoom recording)}}",
    quote: { q: "I’d see the pulse of what’s going on with the students. It would be great to have this.", who: "Donna, after the final presentation", check: "{{Confirm her exact wording}}" },
    openTitle: "Open questions from the review",
    open: [
      { h: "A saved answer can go stale.", v: "Donna won’t always have an answer on the spot, and policies change. Next: a “remind me” flag on open questions, and an expiry date on reusable answers." },
      { h: "Twelve questions this week means what, exactly?", v: "Faculty asked what “rising” means and over what window. Next: a fixed time range on every topic count, and ranking by unanswered questions, not volume." },
    ],
    pilot: "Pilot proposed to the School of Design for {{Spring 2027}} orientation.",
  },

  // ── 09 Reflection
  takeaways: {
    label: "Reflection",
    title: "Three things I’d carry into any AI product.",
    items: [
      {
        title: "Importance is a conversation, not a label.",
        text: "“Important” meant pending to the sender and consequence to the reader. The fix wasn’t a better label. It was letting each side see the other.",
        evidence: { id: "ml-gap", label: "Evidence: one email, two readers" },
      },
      {
        title: "Let the assistant quote Donna instead of imitating her.",
        text: "Trust came from the source link, not the tone.",
        evidence: { id: "ml-decision-3", label: "Evidence: Donna stays the author" },
      },
      {
        title: "Build before you’re done designing.",
        text: "Eight sample emails hid every problem the real inbox showed in a day.",
        evidence: { id: "ml-build", label: "Evidence: design × build" },
      },
    ],
    back: "Back to takeaways",
  },

  // (ZipFlow has no case study yet, so the last one leads back to the first)
  next: { id: "tipping" as const, title: "Trust Tip", line: "Tipping, rethought for checkouts with AI in the loop." },
};
