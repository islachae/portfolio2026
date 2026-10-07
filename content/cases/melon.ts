/**
 * CMU Mellon: the case study (opens at /#case/melon).
 * Sources: the team's final presentation (Team Shadyside, Fall 2026), the advisor and student
 * interview transcripts, Donna's written answers, the student survey, the card and chat
 * explorations, the prototype (student panel and advisor dashboard) and its recording.
 * Donna agreed to be named; students are not named.
 */
const img = (name: string) => `/work/melon-case/${name}.webp`;

/** A numbered mark on a screenshot (x, y in percent of the picture) and what it points at. */
export type Pin = { x: number; y: number; t: string };
export type Shot = { src: string; alt: string; w: number; h: number; pins: Pin[]; cap?: string };

export const melonCase = {
  id: "melon" as const,
  eyebrow: "Communication design · Systems mapping · AI assistant",
  title: "Making school email a two-way conversation",
  subtitle: "Students couldn’t tell which School of Design emails were meant for them. Their advisor couldn’t tell whether anything landed.",
  meta: [
    { label: "Role", value: "Team lead · framing & interface design" },
    { label: "Timeline", value: "Fall 2026" },
    { label: "Type", value: "Team of 3 · MDes studio" },
  ],
  readingTime: "6 min",
  hero: {
    src: "/work/melon/mellon-panel.webp",
    alt: "The Mellon side panel: an Updates list with what needs action first, and an Ask Mellon box",
  },
  /** Left table of contents: names a reader recognizes at a glance. Each label matches the mono
   *  label on its section, and the set and order follow this story. */
  toc: [
    { id: "cs-overview", label: "Overview" },
    { id: "ml-gap", label: "Problem" },
    { id: "ml-research", label: "Research" },
    { id: "ml-frame", label: "Framing" },
    { id: "ml-directions", label: "Concepts" },
    { id: "ml-melon", label: "Solution" },
    { id: "ml-react", label: "Reactions" },
    { id: "cs-takeaways", label: "Reflection" },
  ],
  overview:
    "Mellon is a Gmail side panel for School of Design graduate students, and a dashboard for the advisor who writes to them. Students see what needs doing first and get answers from emails already sent. Their advisor, Donna, sees what students are asking, answers a new question once, and lets Mellon handle it the next time.",
  glance: [
    {
      k: "Problem",
      v: "One advisor sends most program information by email. Each student decides alone what matters, and almost nothing tells her what landed.",
    },
    {
      k: "What we made",
      v: "A side panel inside Gmail that sorts updates by action and answers from the source, and a dashboard where the advisor sees what students ask and saves answers Mellon can reuse.",
    },
    {
      k: "My part",
      v: "Led the team, framed the problem we designed for, and designed the screens on both sides: the student panel and the advisor dashboard.",
    },
  ],
  team: "With Jamie and Pragya, in the MDes Communication Design Studio at Carnegie Mellon.",

  // ── The problem: the first Monday of the semester, then one email read two ways.
  //    Both are illustrative: composed from what the two sides told us.
  gap: {
    label: "Problem",
    title: ["One email,", "two readers."],
    story: [
      { face: img("sb-donna"), who: "Donna", k: "Donna sends", q: "Everything students will need might be in here!" },
      { face: img("sb-student-later"), who: "A student", k: "Student stars it", q: "I will come back later…" },
      { face: img("sb-donna-q"), who: "Donna", k: "Donna wonders", q: "Why don’t I get any replies? Maybe it wasn’t helpful?" },
      { face: img("sb-student-q"), who: "The student", k: "Student wonders", q: "Where are the career events? Maybe I missed an email?" },
    ],
    storyNote: "The first Monday of the semester. The lines are illustrative, written from what both sides told us.",
    readTitle: "The same email, read two ways",
    text: "Donna, the School of Design’s graduate academic advisor, marks a message “Important” when something is pending and worth keeping. A student reading the same message looks for one thing: is there a due date or an action? The label meant different things on each side, and nothing flowed back to show Donna which reading won.",
    modes: [
      { id: "donna", label: "As Donna sent it" },
      { id: "student", label: "As a student read it" },
    ],
    note: "Illustrative email, composed from the kinds of messages we studied.",
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
  },

  // ── Research: one event followed through the system, the belief underneath, and the survey.
  research: {
    label: "Research",
    title: ["We followed one event", "through the whole system."],
    text: "CMU’s information system is huge, and everything touches everything. So we traced one event every graduate student goes through, the MDes/MA orientation, and mapped every person, channel and device a new student meets around it.",
    methods: [
      { n: "1", k: "Advisor interview", v: "Donna, 17 years at CMU, on how she filters, times and follows up." },
      { n: "16", k: "Channels mapped", v: "From email and Slack to Handshake, Canvas and word of mouth." },
      { n: "12", k: "Survey responses", v: "Who writes to Donna, why, and what would make an AI answer trustworthy." },
    ],
    methodsNote: "Plus interviews with new and returning students, each walking through a real event and a real email, and written follow-up answers from Donna.",
    mapTitle: "Four things the map showed",
    map: {
      w: 1800,
      h: 732,
      alt: "Map of how orientation information reaches a School of Design student: faculty, staff and campus offices on the left, Donna and email in the middle, then Slack, Zoom, Google Calendar, Canvas, the website, shared documents, surveys, Handshake and other channels, all ending at the student",
    },
    // (The map names staff by first name. Chaewon confirmed the names can be shown.)
    findings: [
      { src: img("map-1"), h: "Donna relays much of the information", v: "Faculty, staff and campus offices send through her. She filters, organises and passes it on." },
      { src: img("map-2"), h: "Email is the primary channel", v: "Almost every path to a student runs through it." },
      { src: img("map-3"), h: "Messages repeat across channels", v: "The same details arrive by email, Slack, a shared calendar, the admissions packet and word of mouth." },
      { src: img("map-4"), h: "Receiving information does not always lead to action", v: "Nothing on the map flows back to Donna, unless a student writes to her directly." },
    ],
    rootTitle: "The root is a belief: sent means informed.",
    rootLabels: { seen: "Visible", hidden: "Hidden", assume: "We assume that" },
    root: [
      { k: "Event", v: ["Information is missed, actions are delayed, and questions surface later."] },
      { k: "Pattern", v: ["Students keep returning to information after it is sent.", "Emails mix different levels of importance."] },
      { k: "Structure", v: ["Email serves as both communication and storage.", "Follow-up depends on remembering to return, act or ask.", "Feedback arrives through separate, individual questions."] },
      { k: "Mental model", v: ["Students can recognize urgency and importance.", "If information is sent, students are informed."] },
    ],
    brokeTitle: "Both beliefs broke in interviews",
    brokeLabels: { a: "We assumed", q: "We heard", area: "The problem" },
    broke: [
      { a: "Students can recognize urgency and importance.", q: "Honestly, it doesn’t feel that important to me. But from Donna’s perspective, I guess it’s important.", who: "Graduate student", area: "Different ideas of importance" },
      { a: "If information is sent, students are informed.", q: "I’m never really sure if they understand my email responses.", who: "Donna", area: "Limited feedback" },
    ],
    pull: { q: "There are many days I come here and I feel like I’m just in an email factory.", src: "Donna" },
  },

  // ── The student survey (Google Form, Sept 19–21, 2026; 12 responses). Counts are of the students
  //    who answered each question; most questions were “choose everything that applies”.
  survey: {
    label: "Survey · 12 students",
    title: "The answers are out there. Students want certainty, with Donna behind it.",
    /** The three answers the design leans on: a count (drawn one square per student who
     *  answered), what it means in a few words, and where it shows up in Mellon. */
    findings: [
      { n: 5, of: 9, unit: "wanted Donna’s confirmation", h: "Ask Donna to be sure, not because it’s missing", melon: "Answers link to her own email" },
      { n: 6, of: 8, unit: "asked another student instead", h: "Unasked questions go to classmates", melon: "Donna sees what students ask" },
      { n: 6, of: 7, unit: "want an AI to say when it’s unsure", h: "Trust an AI that admits doubt", melon: "Unsure? It hands over to Donna" },
    ],
    melonLabel: "In Mellon",
    open: {
      k: "Still open",
      v: "Funding: a top reason to ask Donna (4 of 9), and the topic fewest would trust an AI with (1 of 6).",
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
    foot: "12 responses, September 2026. Not a representative sample; counts are of the students who answered each question.",
  },

  frame: {
    label: "Framing",
    hmw: [
      { t: "How might we make School of Design communication " },
      { t: "easier for students to recognize and follow up on", hi: true },
      { t: ", while making " },
      { t: "their needs more visible to the graduate academic advisor", hi: true },
      { t: "?" },
    ],
    hypoTitle: "Our design hypothesis",
    hypoLabels: { area: "Problem", ifs: "If", then: "Then", because: "Because" },
    hypo: [
      { area: "Different ideas of importance", ifs: "we nudge students toward information they care about, need to know, or need to act on", then: "students can act and follow up more easily," },
      { area: "Limited feedback", ifs: "and make it easy to ask questions in context,", then: "while the advisor can see where clarification is needed." },
    ],
    because: "This can reduce the time and effort for both students and the advisor, and ultimately improve trust in correspondence.",
    rulesTitle: "Four constraints, four decisions",
    rules: [
      { h: "Updates sorted by what matters to each student", why: "Each student has different priorities and needs." },
      { h: "A side panel on top of email, not another channel", why: "Each channel has its own character and purpose." },
      { h: "Quick, low-effort feedback. Donna answers only new questions", why: "Advisor and students have limited time and attention." },
      { h: "Reusable answers for repeated questions", why: "The system runs on manual coordination: Donna filters, organises and distributes information across channels." },
    ],
    limitsTitle: "Where Mellon stops",
    limitsText: "We asked Donna what a “Mini Donna” could answer without her. Her answers became three lanes.",
    lanes: [
      {
        tone: "ok",
        k: "Mellon answers",
        v: "Anything already in her emails or the graduate handbook, with a link to the source.",
        ex: ["When does registration open?", "How do I apply for conference funding?"],
      },
      {
        tone: "unsure",
        k: "Mellon checks with Donna",
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
    limitsFoot: "Example questions are illustrative. At first, Donna keeps strong control over what it says.",
  },

  directions: {
    label: "Concepts",
    title: ["Five ways to close the loop.", "We kept two and combined them."],
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
    label: "Solution",
    title: ["A side panel for students,", "a dashboard for Donna."],
    text: "Mellon sits beside Gmail, so nothing moves to a new channel and Donna keeps sending email the way she does now. What changes is that each side can see the other.",
    video: { mp4: "/work/melon/mellon-panel.mp4", webm: "/work/melon/mellon-panel.webm", poster: "/work/melon/mellon-panel.webp" },
    // The loop the two screens make together (the presentation's four steps).
    loopTitle: "How a question becomes support",
    loop: [
      { k: "A student asks", v: "In the panel, in their own words." },
      { k: "Interest shows up", v: "Questions gather by topic on Donna’s dashboard, with what is rising." },
      { k: "The advisor invests", v: "Her effort, resources and time go where the questions are." },
      { k: "Support comes back", v: "Her answer returns to students as a new update." },
    ],
    // The loop is pinned while the page scrolls, and the scroll carries one question round it.
    // One line says what is happening at each step.
    loopHint: "Scroll to send one question round the loop.",
    loopWatch: [
      "A student asks a question.",
      "It travels to Donna’s dashboard.",
      "Funding questions are rising, so she acts.",
      "Her guide travels back.",
      "It reaches every student who asked. Then the loop starts again.",
    ],
    loopPost: "Post a funding guide",
    loopPosted: "Guide posted",
    loopEmpty: "Nothing new yet",
    loopAsk: "where can i find sources for funding?",
    loopRows: [
      { k: "Career", s: "Career", n: "12", up: true, was: "", plus: "" },
      { k: "Funding & financial", s: "Funding", n: "6", up: true, was: "5", plus: "+1" },
      { k: "Events & community", s: "Events", n: "5", up: false, was: "", plus: "" },
    ],
    loopInvest: { src: img("loop-advisor"), alt: "Donna at her laptop, looking at a list where one row is rising", words: ["Effort", "Resources", "Time"] },
    loopBack: { tag: "New", title: "Funding sources guide", from: "From Donna", meta: "Posted today · 6 students asked", view: "View" },
    sideLabels: { student: "Student sees", donna: "Donna sees" },
    // The two problems, each answered on both sides. Pins are in percent of each picture.
    sides: [
      {
        id: "ml-matters",
        area: "Different ideas of importance",
        title: "Both sides see what matters",
        student: {
          h: "What needs my action, first",
          shots: [
            {
              src: img("panel-updates"), w: 640, h: 1552,
              alt: "The Updates list in the Mellon panel: two updates under Action needed, one graded essay under Today, older updates below, and an Ask Mellon box",
              pins: [
                { x: 95.6, y: 6.4, t: "Filters by sender, type and action" },
                { x: 45.6, y: 19.5, t: "Action needed comes first" },
                { x: 6.3, y: 57.9, t: "The key point is the title" },
                { x: 93.8, y: 68.3, t: "One clear action per update" },
              ],
            },
          ] as Shot[],
        },
        donna: {
          h: "Which topics students care about",
          shots: [
            {
              src: img("donna-overview"), w: 2194, h: 1080,
              alt: "Donna’s Overview: questions by category for the last seven days with arrows on the ones that are rising, 19 questions waiting for her answer, 41 answered by Mellon, two topics that need her answer, and two topics no Graduate Programs email covers yet",
              pins: [
                { x: 36.4, y: 17.6, t: "Shows where interest is rising" },
                { x: 69.1, y: 28.7, t: "Separates new questions from repeats Mellon already answered" },
                { x: 17.5, y: 56.1, t: "Lists what needs her answer" },
                { x: 22.2, y: 81.3, t: "Surfaces interests no email covers yet" },
              ],
            },
          ] as Shot[],
        },
      },
      {
        id: "ml-back",
        area: "Limited feedback",
        title: "Donna hears back",
        student: {
          h: "Donna’s answer, with its source",
          shots: [
            {
              src: img("panel-source"), w: 640, h: 1552,
              alt: "Ask Mellon answering “where can i find sources for funding?”: Donna sent the conference funding details on Aug 31, with a card from that email showing the application dates and an Open this email button",
              pins: [
                { x: 93.8, y: 30.4, t: "Answers from Donna’s emails" },
                { x: 93.8, y: 41.4, t: "Shows the source clearly" },
                { x: 6.3, y: 67.9, t: "Opens the original email" },
              ],
            },
            {
              src: img("panel-draft"), w: 640, h: 1552,
              alt: "Ask Mellon after a question it could not answer: it says so, then shows a draft email to the person who sent the original, with Send email and Discard",
              pins: [
                { x: 93.8, y: 34.3, t: "Says when it can’t find an answer" },
                { x: 93.8, y: 47.7, t: "Drafts the email for you" },
                { x: 6.3, y: 84.1, t: "The student chooses to send" },
              ],
            },
          ] as Shot[],
        },
        donna: {
          h: "Where her email left questions",
          shots: [
            {
              src: img("donna-reply"), w: 1720, h: 1200,
              alt: "Donna answering one student’s question about Convocation: the related topic and source email, her answer, a checkbox to send it to the student and a checkbox to save it as a reusable answer with names left out",
              pins: [
                { x: 2.6, y: 43.8, t: "Each question sits beside the email it came from" },
                { x: 2.6, y: 73.8, t: "She replies to the student privately" },
                { x: 2.6, y: 81.3, t: "Answer once, Mellon answers next time" },
              ],
            },
            {
              src: img("donna-answers"), w: 2194, h: 820,
              alt: "Reusable answers: two saved answers, each showing its topic and how many similar questions it has been used for (34 and 7)",
              pins: [],
              cap: "Every saved answer shows how many similar questions it has covered.",
            },
          ] as Shot[],
        },
      },
    ],
    partsTitle: "In the recording",
    chapters: [
      { t: 0, k: "Sorted by what needs doing", v: "Action needed first, then today, then earlier this week." },
      { t: 3.8, k: "Summary first, source one tap away", v: "Students go back to where they first saw something, and Donna keeps her paper trail, so every summary links to the original email." },
      { t: 16.8, k: "Ask next to the email", v: "A question typed beside the update it is about." },
      { t: 34.6, k: "Clear in bulk", v: "Select what’s done and discard it together." },
    ],
    exploreTitle: "How the panel got here",
    explore: [
      { src: img("card-explorations"), alt: "Nineteen variations of an update card: minimal, with tags, with priority, with snippets, with dates and actions", w: 1800, h: 1200, k: "19 ways to show one update", v: "The final card keeps the title, the sender or date, and at most one action." },
      { src: img("chat-options"), alt: "Five chat layouts for Ask Mellon: minimal chat, card with quick actions, rich info with links, conversational follow-up and compact", w: 1800, h: 1200, k: "5 ways to answer", v: "The final answer is a short summary with a link to the email, then the next steps as buttons." },
    ],
  },

  // ── First reactions (the presentation’s last research slide) and where it could go.
  react: {
    label: "First reactions",
    title: ["What would they", "use it for?"],
    text: "We asked students and Donna what they would use Mellon for.",
    students: {
      k: "Students",
      src: "Google Forms survey",
      a: ["Internship and job assistance", "Kind of questions that I can get the answer from the handbook.", "Administrative process", "School events, resources, professor info"],
    },
    donna: { k: "Graduate advisor", src: "Written interview with Donna", q: "Possibly everything" },
    note: "These are first reactions to the concept. We have not measured use.",
    nextTitle: "Where it could go",
    next: [
      { k: "Today", v: "School of Design" },
      { k: "Next", v: "CMU-wide programs" },
      { k: "Long term", v: "A platform for schools anywhere" },
    ],
    close: ["With Mellon,", "sent can mean informed."],
  },

  takeaways: {
    label: "Reflection",
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
        text: "Donna tried AI and stopped because it didn’t sound like her. Mellon answers from her own words, links back to them, and hands over anything sensitive.",
        evidence: { id: "ml-limits", label: "Evidence: where the assistant stops" },
      },
    ],
    back: "Back to takeaways",
  },

  // (ZipFlow has no case study yet, so the last one leads back to the first)
  next: { id: "tipping" as const, title: "Trust Tip", line: "Tipping, rethought for checkouts with AI in the loop." },
};
