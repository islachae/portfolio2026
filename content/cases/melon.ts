/**
 * CMU Melon: the case study (opens at /#case/melon). FIRST DRAFT.
 * Sources: the team's research deck (Team Shadyside), the advisor and student interview transcripts,
 * Donna's written answers about a "Mini Donna" assistant, the project hypothesis, the card and chat
 * explorations and the prototype recording. Donna agreed to be named; students are not named.
 * Everything marked TODO(Chaewon) needs a real value before this goes public.
 */
const img = (name: string) => `/work/melon-case/${name}.webp`;

export type Verdict = "held" | "partly" | "broke";

export const melonCase = {
  id: "melon" as const,
  eyebrow: "Communication design · Systems mapping · AI assistant",
  title: "Making school email a two-way conversation",
  subtitle: "Students couldn’t tell which School of Design emails were meant for them. Their advisor couldn’t tell whether anything landed.",
  meta: [
    { label: "Role", value: "Team lead · systems mapping & framing" },
    // TODO(Chaewon): exact weeks
    { label: "Timeline", value: "Fall 2026 · in progress" },
    { label: "Type", value: "Team of 3 · MDes studio" },
  ],
  readingTime: "6 min",
  hero: {
    src: "/work/melon/melon-poster.webp",
    alt: "The Melon side panel: an Updates list of school emails with All, Starred and Unread filters and an Ask Melon box",
  },
  /** Left table of contents, Rachel's way: mostly names a reader recognizes at a glance (Problem,
   *  Solution, Research…), plus one or two that only this project has. Each label matches the mono
   *  label on its section, and the set and order follow this story. */
  toc: [
    { id: "cs-overview", label: "Overview" },
    { id: "ml-gap", label: "Problem" },
    { id: "ml-scope", label: "Scope" },
    { id: "ml-research", label: "Research" },
    { id: "ml-survey", label: "Survey" },
    { id: "ml-frame", label: "Framing" },
    { id: "ml-directions", label: "Concepts" },
    { id: "ml-melon", label: "Prototype" },
    { id: "ml-advisor", label: "Advisor view" },
    { id: "cs-takeaways", label: "Reflection" },
  ],
  overview:
    "Melon is a Gmail side panel for School of Design graduate students and their program coordinator. It sorts school email by what needs doing, summarizes each message with a link back to the original, and answers questions only from what the coordinator has already sent. On the other side, it shows her what students opened, asked and found unclear.",
  glance: [
    {
      k: "Problem",
      v: "One coordinator sends most program information by email. Each student decides alone what matters, and almost nothing tells her what landed.",
    },
    {
      k: "What we made",
      v: "A side panel inside Gmail: updates sorted by action, a calendar of what’s due, summaries that link to the source, and an assistant with clear limits.",
    },
    {
      k: "My part",
      v: "Led the team (agendas, decisions, deliverables), mapped the orientation communication system, and framed the problem we designed for.",
    },
  ],
  team: "With Jamie and Pragya, in the MDes Communication Design Studio at Carnegie Mellon.",

  // ── The gap: one email, read two ways. Illustrative: composed from the kinds of messages we studied.
  gap: {
    label: "Problem",
    title: ["One email,", "two readers."],
    text: "Donna, the School of Design’s graduate program coordinator, marks a message “Important” when something is pending and worth keeping. A student reading the same message looks for one thing: is there a due date or an action? The label meant different things on each side, and nothing flowed back to show Donna which reading won.",
    modes: [
      { id: "donna", label: "As Donna sent it" },
      { id: "student", label: "As a student read it" },
    ],
    note: "Illustrative email, composed from the kinds of messages we studied.",
    email: {
      from: "Donna · Graduate Program Coordinator",
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
  },

  scope: {
    label: "Scope",
    title: ["CMU’s information system is huge.", "We followed one event through it."],
    text: "We started wide, photographing boards, posters, signage, portals and drives around campus. Everything touched everything, so we narrowed to one event every graduate student goes through: the MDes/MA orientation.",
    photo: { src: img("ecosystem"), alt: "Collage of campus communication: a campus map board, a plaque, a Google Drive folder, a wall of flyers, a Convocation poster, wayfinding signage and the student portal", w: 1578, h: 1194 },
    reasons: [
      { k: "An opening", v: "A class activity on campus channels showed us where students and staff already felt the strain." },
      { k: "Awareness first", v: "We focused on how students learn something exists and whether it’s for them, before any action." },
      { k: "A scope we could test", v: "One event, with a clear before, during and after, and one coordinator at its center." },
    ],
    mapTitle: "Mapping orientation",
    mine: "My part",
    mapText: "I mapped every person, channel and device a new student meets around orientation, colored by when it happens. The same details arrive by email, Slack, a shared calendar, the admissions packet, posters and word of mouth, and the paths shift over time.",
    map: { src: img("system-map"), alt: "System map of the School of Design MDes/MA orientation process: people (students, the coordinator, faculty, career and support staff), channels (email, Slack, Google Calendar, surveys, Canvas, the website, Handshake, LinkedIn and more) and devices, with arrows colored for before, during and after orientation", w: 1766, h: 1056 },
    // TODO(Chaewon): the map names other staff by first name (Andrew, Jonathan, Peter, Ray). Swap for roles before publishing.
    findings: [
      "Almost every path passes through email, and through one person: Donna.",
      "Before orientation, students lean on the packet, Slack and surveys. After it, on Handshake, LinkedIn and the website.",
      "Nothing in the map flows back to Donna, except a student who writes to her directly.",
    ],
  },

  research: {
    label: "Research",
    title: ["We talked to both ends", "of the same inbox."],
    methods: [
      { n: "1", k: "Advisor interview", v: "Donna, 17 years at CMU, on how she filters, times and follows up." },
      // TODO(Chaewon): how many students
      { n: null, k: "Student interviews", v: "New and returning students, walking through a real event and a real email." },
      // TODO(Chaewon): number of written questions
      { n: null, k: "Written follow-up", v: "Donna’s answers on what an assistant could and couldn’t say for her." },
      { n: "16", k: "Channels mapped", v: "From email and Slack to Handshake, Canvas and word of mouth." },
      { n: "12", k: "Student survey", v: "Who writes to Donna, why, what happens when they don’t, and what would make an AI answer trustworthy." },
    ],
    assumptionsTitle: "What we assumed, and what held",
    assumptions: [
      { a: "If information is sent, students are informed.", v: "broke" as Verdict, why: "Students let anything without a date or consequence pass by, then went back to wherever they first saw it." },
      { a: "Students can tell what’s urgent or important.", v: "broke" as Verdict, why: "Importance was personal: a due date or a consequence. “Important” in a subject line didn’t decide it." },
      { a: "Students check email often.", v: "held" as Verdict, why: "They do, and they also use it as storage: starring, and searching “Donna” to find things again." },
      { a: "Email is the most effective channel.", v: "partly" as Verdict, why: "For Donna it’s a paper trail she relies on. Students pieced events together from email, Slack, a newsletter and posters." },
    ],
  },

  heard: {
    label: "What we heard",
    title: ["Both sides tried hard.", "Nothing connected them."],
    flow: {
      from: "Donna",
      to: "Students",
      out: "Email, Slack, reminders",
      back: "Only when someone writes in",
    },
    insights: [
      {
        h: "Repetition, not labels, told students what mattered",
        quotes: [{ q: "…I kept seeing it multiple times, so I started thinking it must be important.", who: "First-year student" }],
      },
      {
        h: "Everyone used email as a filing cabinet",
        quotes: [
          { q: "I search “Donna” all the time.", who: "Student" },
          { q: "…a paper trail.", who: "Donna" },
        ],
      },
      {
        h: "Donna couldn’t see what landed",
        quotes: [{ q: "I don’t get to know.", who: "Donna" }],
        note: "She re-sends to everyone once two or three students ask the same thing.",
      },
    ],
    pull: { q: "There are many days I come here and I feel like I’m just in an email factory.", src: "Donna" },
  },

  // ── The student survey (Google Form, Sept 19–21, 2026; 12 responses). Counts are of the students
  //    who answered each question; most questions were “choose everything that applies”.
  survey: {
    label: "Survey",
    title: ["The answers are out there.", "Students want certainty, with Donna behind it."],
    intro: "In September we surveyed 12 School of Design students. 10 of them had written to Donna with a question. Three answers shaped Melon.",
    /** The three answers the design leans on: the evidence (a count, drawn one square per student),
     *  what it means, and where it shows up in Melon. */
    findings: [
      {
        n: 5,
        of: 9,
        unit: "wanted Donna’s confirmation",
        h: "They write to Donna to be sure, not because the answer is missing.",
        note: "Only 3 of the 9 couldn’t find it. 4 found it, but it was unclear.",
        melon: "Summary first, source one tap away: every answer links back to Donna’s own email.",
      },
      {
        n: 6,
        of: 8,
        unit: "asked another student instead",
        h: "A question held back goes to a classmate, and Donna never sees it.",
        note: "5 of the 8 felt they should be able to find it themselves.",
        melon: "The advisor view shows Donna what students asked Melon, grouped by topic.",
      },
      {
        n: 6,
        of: 7,
        unit: "want an AI to say when it’s unsure",
        h: "An assistant earns trust by admitting doubt and handing over.",
        note: "5 of the 7 also want a way to ask Donna directly.",
        melon: "The middle lane: when Melon isn’t confident, it says so and sends the student to Donna.",
      },
    ],
    melonLabel: "In Melon",
    open: {
      k: "Still open",
      v: "Funding was one of the top reasons to write to Donna (4 of 9), and the topic fewest students were comfortable hearing from an AI (1 of 6). Funding questions may belong with Donna, not Melon.",
    },
    allLabel: "All answers",
    charts: [
      {
        k: "Why they wrote to Donna",
        n: 9,
        rows: [
          { k: "Wanted her confirmation", v: 5, key: true },
          { k: "Easier to ask her directly", v: 5 },
          { k: "Found it, but it was unclear", v: 4 },
          { k: "Unsure it applied to me", v: 3 },
          { k: "Didn’t know who else to ask", v: 3 },
          { k: "Couldn’t find it", v: 3 },
        ],
      },
      {
        k: "Why they held a question back",
        n: 8,
        rows: [
          { k: "Thought I should find it myself", v: 5, key: true },
          { k: "Didn’t want to bother her", v: 4 },
          { k: "Didn’t feel important enough", v: 4 },
          { k: "Forgot or didn’t follow up", v: 3 },
          { k: "Unsure she was the right person", v: 3 },
        ],
      },
      {
        k: "What they did instead",
        n: 8,
        rows: [
          { k: "Asked another student", v: 6, key: true },
          { k: "Searched the School of Design site", v: 5 },
          { k: "Searched their email", v: 4 },
          { k: "Asked a professor or staff", v: 1 },
          { k: "Checked Slack", v: 1 },
          { k: "Nothing", v: 1 },
        ],
      },
      {
        k: "What would make an AI’s answer trustworthy",
        n: 7,
        rows: [
          { k: "Says clearly when it’s unsure", v: 6, key: true },
          { k: "Shows when it was last updated", v: 5 },
          { k: "Lets me ask Donna directly", v: 5, key: true },
          { k: "Shows the original source", v: 4 },
          { k: "Only uses official School of Design info", v: 3 },
        ],
      },
    ],
    foot: "12 responses, not a representative sample. Counts are of the students who answered each question; most questions allowed more than one answer.",
  },

  frame: {
    label: "Framing",
    hmw: [
      { t: "How might we create a more " },
      { t: "visible, two-way", hi: true },
      { t: " communication process that helps students understand " },
      { t: "which School of Design events are relevant to them", hi: true },
      { t: ", while helping Donna understand " },
      { t: "how students are receiving and acting on it", hi: true },
      { t: "?" },
    ],
    rulesTitle: "Four rules we held ourselves to",
    rules: [
      { h: "Show me what’s mine", why: "Every student has different priorities." },
      { h: "Stay inside email", why: "Each channel has its own habits. Don’t add one more." },
      { h: "Feedback in one tap", why: "Students and Donna are both short on time." },
      { h: "No extra work for Donna", why: "The system already runs on her manual work." },
    ],
    limitsTitle: "Where Melon stops",
    limitsText: "We asked Donna what a “Mini Donna” could answer without her. Her answers became three lanes.",
    lanes: [
      {
        tone: "ok",
        k: "Melon answers",
        v: "Anything already in her emails or the graduate handbook, with a link to the source.",
        ex: ["When does registration open?", "How do I apply for conference funding?"],
      },
      {
        tone: "unsure",
        k: "Melon checks with Donna",
        v: "When it isn’t confident, it says so and refers the student to her.",
        ex: ["Will this elective run in the spring?"],
      },
      {
        tone: "stop",
        k: "Always Donna",
        v: "Physical or mental health, safety and academic privacy.",
        ex: ["I’m having a hard week. Who can I talk to?"],
      },
    ],
    // TODO(Chaewon): the rest of her answer to question 9
    limitsFoot: "Example questions are illustrative. At first, Donna keeps strong control over what it says.",
  },

  directions: {
    label: "Concepts",
    title: ["Five ways to close the loop.", "We kept two and combined them."],
    // TODO(Chaewon): confirm the reasons we set three aside
    concepts: [
      { src: img("concept-1"), name: "Mini Donna", v: "An assistant that answers student questions from what Donna has sent.", keep: true, why: "Kept, with her limits." },
      { src: img("concept-2"), name: "Smart email bot", v: "Sorts event emails into labels like Action needed, Important or For later.", keep: true, why: "Kept: it works where students already read." },
      { src: img("concept-3"), name: "Email comment layer", v: "A comment thread on each email, visible to everyone.", keep: false, why: "Set aside: questions happen one-on-one today, and some are personal." },
      { src: img("concept-4"), name: "Slack event hub", v: "Every event email mirrored into a Slack channel.", keep: false, why: "Set aside: Donna steps back from Slack after orientation." },
      { src: img("concept-5"), name: "SoD event hub", v: "One website for every School of Design event.", keep: false, why: "Set aside: every site change goes through a yearly web review, more work for Donna." },
    ],
    sketch: { src: img("first-sketch"), alt: "First sketch: a side panel beside the Mail inbox with tabs for primary info and calendar, cards for calendar events, priority info and to-dos, an AI summary that links to the exact email, and chat with quick action buttons", w: 1700, h: 925 },
    sketchCap: "First sketch: a panel beside the inbox. Each update leads to an AI summary, then to the exact email; chat ends in an action.",
  },

  melon: {
    label: "Prototype",
    title: ["A side panel that sorts,", "summarizes and answers."],
    text: "Melon (a nod to Mellon) sits beside Gmail, so nothing moves to a new channel and Donna keeps sending email the way she does now.",
    video: { mp4: "/work/melon/melon-demo.mp4", webm: "/work/melon/melon-demo.webm", poster: "/work/melon/melon-poster.webp" },
    chapters: [
      { t: 0, k: "Sorted by what needs doing", v: "Updates show the sender, date and one action. Clear what’s done in bulk, with undo." },
      { t: 9, k: "Filter by who and what", v: "Department, sender, type and whether action is needed." },
      { t: 15, k: "A calendar of what’s due", v: "Tap a date to see the updates behind it." },
      { t: 21, k: "Summary first, source one tap away", v: "Students go back to where they first saw something, and Donna keeps her paper trail, so every summary links to the original email." },
      { t: 27, k: "All clear", v: "When nothing is left, the panel says so." },
      { t: 33, k: "Ask Melon", v: "Answers come from Donna’s emails and the handbook, with quick actions like finding a location or setting a reminder." },
    ],
    explore: [
      { src: img("card-explorations"), alt: "Nineteen variations of an update card: minimal, with tags, with priority, with snippets, with dates and actions", w: 1800, h: 1200, k: "19 ways to show one update", v: "The final card keeps the title, sender and date, an unread dot or star, and at most one action." },
      { src: img("chat-options"), alt: "Five chat layouts for Ask Melon: minimal chat, card with quick actions, rich info with links, conversational follow-up and compact", w: 1800, h: 1200, k: "5 ways to answer", v: "The final answer is a short summary with a link to the email, then the next steps as buttons." },
    ],
  },

  advisor: {
    label: "Advisor view",
    title: ["What Donna sees", "on the other side."],
    text: "The same panel gives Donna what email never has: signals about how her messages landed, without adding a new tool to watch.",
    signals: [
      { k: "Reach", v: "How many students opened an update, and which ones haven’t." },
      { k: "Questions", v: "What students asked Melon about it, grouped by topic." },
      { k: "One clarification", v: "When the same question comes up a few times, a nudge to answer everyone at once, the move she already makes by instinct." },
    ],
    // TODO(Chaewon): add the advisor view screens
    pending: "Advisor view screens coming soon",
  },

  takeaways: {
    label: "Reflection · so far",
    items: [
      {
        title: "Follow one event, not the whole system",
        text: "The campus map was too big to design for. Tracing one orientation from first email to first week showed exactly where information piled up and where nothing came back.",
        evidence: { id: "ml-map", label: "Evidence: the orientation map" },
      },
      {
        title: "Importance is a conversation, not a label",
        text: "“Important” meant pending to the sender and consequence to the reader. The fix wasn’t a better label; it was letting each side see the other’s reading.",
        evidence: { id: "ml-gap", label: "Evidence: one email, two readers" },
      },
      {
        title: "Let the assistant quote the person, not imitate her",
        text: "Donna tried AI and stopped because it didn’t sound like her. Melon answers from her own words, links back to them, and hands over anything sensitive.",
        evidence: { id: "ml-limits", label: "Evidence: where the assistant stops" },
      },
    ],
    back: "Back to takeaways",
  },

  next: { id: "zipflow" as const, title: "ZipFlow", line: "One listing, every workflow." },
};
