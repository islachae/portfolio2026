/**
 * Rethinking Tipping: the full case study (opens at /#case/tipping).
 * Copy comes from Chaewon's "Rethinking Tipping – Portfolio Case Study" canvas; images live in
 * public/work/tipping-case/. Edit words here; the layout reads from this file.
 */
const img = (name: string) => `/work/tipping-case/${name}.webp`;

export const tippingCase = {
  id: "tipping" as const,
  eyebrow: "Trust in AI · Design strategy · UX/UI design",
  title: "Rethinking tipping for the age of AI",
  subtitle: "No more guessing.\nTip for what actually happened.",
  meta: [
    { label: "Role", value: "Product Designer" },
    { label: "Timeline", value: "120 hours · March 2025" },
    { label: "Type", value: "Independent study" },
  ],
  /** On the “Read the case study” button, the home card badge and ⌘K. The hero shows the tool stack instead. */
  readingTime: "7 min",
  hero: {
    src: img("hero"),
    alt: "Two phone screens: checkout with Trust-First Tipping and the post-delivery feedback sheet",
    w: 678,
    h: 368,
  },
  /** Left table of contents, Rachel's way: mostly names a reader recognizes at a glance (Problem,
   *  Solution, Research…), plus one or two that only this project has. Each label matches the mono
   *  label on its section, and the set and order follow this story. */
  toc: [
    { id: "cs-overview", label: "Overview" },
    { id: "cs-problem", label: "Problem" },
    { id: "cs-why", label: "Why now?" },
    { id: "cs-principle", label: "Design principle" },
    { id: "cs-solution", label: "Solution" },
    { id: "cs-testing", label: "Testing & iteration" },
    { id: "cs-scene", label: "Final design" },
    { id: "cs-system", label: "Systemic thinking" },
    { id: "cs-takeaways", label: "Takeaways" },
  ],
  overview:
    "Delivery apps ask users to tip before the service is even complete, turning appreciation into a high-pressure decision. This project reimagines the tipping experience through an AI-assisted flow that allows users to adjust their tips after delivery, while considering the broader implications for couriers and platforms.",

  problem: {
    label: "Problem",
    title: ["Tipping is essentially a guess.", "Not a UI problem."],
    stats: [
      // `pic` draws the number: a 10×10 grid of 100 people, or a row of `of` people
      {
        value: 58,
        suffix: "%",
        pic: { kind: "grid", of: 100 },
        text: "say tipping experience push them to eat home instead of delivery",
        source: "Pew Research Center, 2023",
      },
      {
        value: 2,
        suffix: "/3",
        pic: { kind: "people", of: 3 },
        text: "US adults feel unsure about when and how much to tip",
        source: "Modern Restaurant Management, 2023",
      },
    ],
    sim: {
      question: ["How much would you tip", "for delivery you haven’t received?"],
      item: { name: "Chicken Teriyaki", price: "$24.00" },
      // The reader picks one of these before anything is known (a real choice, then a reveal)
      tips: ["$3", "$5", "$7"],
      tipsLabel: "Add a tip",
      pickHint: "Pick one",
      facts: [
        { label: "Arrival / Food quality", before: "Not yet known", after: "6:52 PM · On time" },
        { label: "Courier communication", before: "Not yet known", after: "Quick, clear updates" },
        { label: "Previous tip amount", before: "Not known", after: "$5.00 · Last order" },
      ],
      toAfter: "See after delivery",
      toBefore: "Back to checkout",
      /** The line under the receipt: before a pick, after a pick, and after the reveal. {tip} = the reader's pick. */
      prompt: "Pick a tip, then see what actually happened.",
      picked: "Locked in {tip}. Now see what happened.",
      verdict: "You tipped {tip} before knowing any of this.",
      verdictAgain: "Would you pick the same now?",
      verdictNone: "At checkout, none of this is known yet. That’s the guess.",
    },
  },

  deeper: {
    label: "Deeper problem",
    title: ["What else makes tipping", "uncomfortable?"],
    cards: [
      { title: "No reference point", text: "Without past tipping history or clear standards, users have to decide how much to tip every time." },
      {
        title: "Best effort leads to random tip",
        text: "Couriers who provide better service may earn less in tips than those who provide poorer service, because tips are determined before delivery.",
      },
    ],
  },

  question: {
    label: "Key question",
    // The two highlighted phrases are the goals; the rest stays plain
    parts: [
      { t: "How might we redesign tipping " },
      { t: "clearer for customers", hi: true },
      { t: " and " },
      { t: "fairer for couriers?", hi: true },
    ],
    skip: "Skip to solution",
  },

  // Read as a timeline: scroll moves from "Then" to "Now"; payment and dining change, tipping doesn't.
  whyNow: {
    label: "Why now?",
    title: ["Dining and payments evolved.", "Tipping hasn't caught up."],
    lead: "Service quality remains the strongest driver of tipping:",
    stat: { value: 77, suffix: "%" },
    rest: "Yet as dining and payments took digital form, the micro human interactions that guided tip decisions disappeared.",
    pay: {
      step: "01 / How we pay",
      title: ["Payment", "evolved."],
      items: [
        { label: "Cash", src: img("pay-cash"), alt: "Stack of cash" },
        { label: "Card", src: img("pay-card"), alt: "Credit card" },
        { label: "Contactless", src: img("pay-contactless"), alt: "Phone showing a contactless payment symbol", now: true },
      ],
    },
    dine: {
      step: "02 / How we dine",
      title: ["Dining", "expanded."],
      items: [
        { label: "Dine-in", src: img("dine-in"), alt: "Restaurant dining booth with a set table" },
        { label: "Takeout", src: img("dine-takeout"), alt: "Paper takeout bag", now: true },
        { label: "Drive-through", src: img("dine-drive"), alt: "Car pulling up to a drive-through payment kiosk", now: true },
        { label: "Delivery", src: img("dine-delivery"), alt: "Delivery bike with a food bag", now: true },
      ],
    },
    tip: {
      step: "03 / How we tip",
      title: ["Tipping", "stayed put."],
      card: "Add a tip",
      chips: ["$3", "$5", "$7"],
      note: "Still decided before the service",
    },
    axis: { from: "Then", to: "Now" },
  },

  principle: {
    label: "Design principle",
    title: "Users want predictability and transparency.",
    text: "I examined two successful UX case studies and identified predictability and transparency as key principles in payment experiences. I used these insights to define design opportunities for a more trustworthy tipping experience.",
    // One is open at a time; the other waits beside it as a strip. `mark` draws the highlight box
    // over the Uber Eats screenshot (the DoorDash ones have theirs drawn in).
    refs: [
      {
        brand: "Uber Eats",
        title: "Real-time tracking",
        mark: true,
        shots: [{ src: img("ubereats-tracking"), alt: "Uber Eats live tracking screen with the ETA banner highlighted", caption: "" }],
        rows: [
          { label: "Core value", value: "Reduces “where's my food?” anxiety" },
          { label: "Features", value: "Live GPS map • clear status stages • visual cues on delays" },
          { label: "Evidence", value: "Reduced customer inquiries by 20—35%" },
        ],
        insight: "Users value predictability. Yet tipping is decided before any service quality is known.",
      },
      {
        brand: "DoorDash",
        title: "Savings transparency",
        mark: false,
        shots: [
          { src: img("doordash-summary"), alt: "DashPass summary with “You’ve saved $1202.71 in fees” highlighted", caption: "Saving summary" },
          { src: img("doordash-order"), alt: "DoorDash order total with the waived fees and “Saving $7.18 with DashPass” highlighted", caption: "Order saving" },
        ],
        rows: [
          { label: "Core value", value: "Transparency + honesty in savings" },
          { label: "Features", value: "“You’ve saved $__ today” • clear savings breakdown • no hidden or unclear fees" },
          { label: "Evidence", value: "Customer retention increased by 20% (DoorDash data)" },
        ],
        insight: "Users are highly sensitive to savings, efficiency, and fairness. Loyalty naturally grows with transparency.",
      },
    ],
    more: "Show details",
  },

  mechanism: {
    label: "Solution",
    title: "Agentic AI automates the repetitive parts of tipping, using actual delivery quality and individual priorities",
    quote: [
      { t: "Harvard Business school’s research insight stated that customers " },
      { t: "tend to tip more", b: true },
      { t: " after confirming service quality, because " },
      { t: "outcome-based tipping feels more justified.", b: true },
    ],
    legend: { existing: "Existing flow", added: "New touchpoint", hint: "Scroll, or select an orange dot", hintSwipe: "Swipe, or select an orange dot" },
    // The whole order journey; the numbered stops are the three new touchpoints
    steps: [
      { label: "Menu selection" },
      { label: "Trust-first\npre tip", n: 1 },
      { label: "Payment" },
      { label: "In delivery" },
      { label: "Dynamic adjustment", n: 2 },
      { label: "Delivery complete" },
      { label: "Final tip settlement" },
      { label: "Claim resolution", n: 3 },
    ],
    touchpoints: [
      {
        n: 1,
        title: "Start Small, Adjust After Delivery",
        customer: {
          src: img("checkout"),
          alt: "Customer checkout phone screen with Trust-First Tipping",
          crop: "bottom",
          title: "Set your priorities and a minimum tip at checkout.",
          text: "Customers set their tipping priorities once, lock in a minimum tip, and pre-authorize a maximum amount for adjustment after delivery.",
        },
        courier: {
          src: img("courier-offer"),
          alt: "Courier order offer screen with guaranteed base tip and potential reward",
          crop: "bottom",
          title: "See customer priorities and potential tips upfront.",
          text: "View the guaranteed base tip and potential post-delivery reward, along with the customer's priorities, before accepting the order.",
        },
      },
      {
        n: 2,
        title: "Reward What Actually Happened",
        customer: {
          src: img("tip-breakdown"),
          alt: "Trust-First Tipping breakdown card showing pre-tip, post-reward, and itemized service adjustments",
          title: "Let AI adjust your tip based on service details and your priorities.",
          text: "AI agent considers arrival time, drop-off accuracy, and communication alongside your priorities. Customers and couriers see a concise summary without overwhelming live updates.",
        },
        courier: {
          src: img("courier-badge"),
          alt: "Courier map screen with a Drop-off Precision tag, Gustavo's profile, and the Tatte Bakery and Cafe order",
          title: "Earn achievement badges that recognize your service strengths.",
          text: "Badges highlight strengths such as accurate drop-offs, careful handling, and clear communication, helping customers recognize what you do well.",
        },
      },
      {
        n: 3,
        title: "Let an Agent Handle Delivery Issues",
        customer: {
          src: img("claim-summary"),
          alt: "Order claim card showing the AI claim summary, estimated vs. delivered time, and claim status with a Done button",
          title: "Let AI handle the claim and avoid unnecessary back-and-forth.",
          text: "With one tap, the AI agent summarizes the issue using delivery records, submits a claim under platform policy, and keeps you updated on its progress.",
        },
        courier: {
          src: img("courier-earnings"),
          alt: "Courier earnings screen showing total earnings, base pay, tips, and a claim update notice",
          title: "See your earnings and understand every adjustment.",
          text: "View base pay, tips, and claim updates in one place. Any claim-related tip changes appear with a clear explanation in the delivery breakdown.",
        },
      },
    ],
  },

  testing: {
    label: "Testing & iteration",
    users: 24,
    text: "Users appreciated the reduced tipping stress and said they'd keep using the system, as long as the AI gives clearer reasoning and adjusts tips within an understandable, predictable range.",
    patterns: [
      {
        n: 1,
        feedback: "“View reason” still feels unclear. Need stronger evidence behind tip adjustments.",
        tested: {
          src: img("test1-tested"),
          alt: "Tested version of the post-delivery rating screen with a plain grey avatar placeholder",
          note: "view reason button",
          title: "Hard to trust AI when its reasoning is buried",
          text: "Users appreciated the concept, but the “View reason” button was easy to miss, leaving the tip adjustment unclear.",
        },
        iterated: {
          src: img("test1-iterated"),
          alt: "Proposed rating screen showing ETA, verified drop-off and an expandable Trust Tip explanation",
          note: "more visible explanation",
          title: "Make the “why” instantly clear",
          text: "Made “View reason” more visible beside the final tip and added a breakdown of the service details behind the adjustment.",
        },
      },
      {
        n: 2,
        feedback: "The feedback step feels slightly high-effort, adding extra steps after delivery.",
        tested: {
          src: img("test2-tested"),
          alt: "Tested flow: feedback panel with a Confirm button, then a full-screen prompt to adjust tip or do it later",
          title: "Too many steps led users to drop off",
          text: "Giving feedback after delivery required too many steps and a final confirmation.",
        },
        iterated: {
          src: img("test2-iterated"),
          alt: "Proposed flow: feedback sheet with a Boost Tip option, then a slider to adjust the tip",
          title: "3 depth → 2 depth",
          text: "Shortened the flow and saved feedback automatically, while leaving tip adjustment available when users want it.",
        },
      },
    ],
  },

  // A scroll-driven walkthrough of one order: how the tip moves. "Solution" says what is new at each
  // touchpoint, so the step copy here stays with the numbers and doesn't repeat it. The numbers are
  // the ones on Chaewon's screens (checkout, breakdown card, feedback sheet); the amounts in the
  // step copy are preTip, maxReward and final below.
  // (A "Prototype" section used to follow, with three tabs of screens: all three are already shown
  // under Solution and Testing, so it was removed.)
  scene: {
    label: "Final design",
    title: "The tip only moves when something actually happens.",
    hint: "Scroll to follow the order",
    store: "Tatte Bakery & Cafe",
    preTip: 2,
    maxReward: 3.5,
    rewardRange: "+$1.50 – $3.50 after delivery",
    eta: "2:45 PM",
    steps: [
      { title: "Checkout", text: "$2.00 is locked in. Up to $3.50 more can follow after delivery." },
      { title: "In delivery", text: "The tip waits. Nothing moves until the order arrives." },
      { title: "Delivered", text: "Each service detail moves the tip, one line at a time." },
      { title: "Tip settles", text: "$4.50, with every line that led to it. The reason is one tap away." },
    ],
    // From the Trust-First Tipping breakdown card
    lines: [
      { label: "On-time accuracy", value: "5 min late", delta: "−$1.50", dir: "down" },
      { label: "Drop-off", value: "Correct door (photo matched)", delta: "", dir: "ok" },
      { label: "Communication", value: "Responsive driver", delta: "+$2.00", dir: "up" },
      { label: "Eco-friendly", value: "Electric bike", delta: "+$1.00", dir: "up" },
    ] as { label: string; value: string; delta: string; dir: "up" | "down" | "ok" }[],
    postReward: 2.5,
    final: 4.5,
  },

  system: {
    label: "Systemic thinking",
    title: "A Self-reinforcing loop, not a customer-only solution",
    text: "Explore how clearer, outcome-based tipping creates better incentives for every part of the system.",
    hint: "Select a stakeholder to explore",
    // Order matters: platform (left), customers (top), couriers (right), restaurants (bottom).
    // Each one's outgoing arrow is labelled with what it hands to the next.
    nodes: [
      {
        name: "Platform",
        sub: "Better service insights",
        arrow: "Better service decisions",
        headline: "Turn service feedback into better decisions.",
        text: "Delivery outcomes and claim patterns help the platform understand delivery quality, improve matching, and resolve issues more effectively.",
        benefits: ["Fewer repetitive support requests", "Better signals for service matching"],
      },
      {
        name: "Customers",
        sub: "Less guesswork",
        arrow: "Fair, transparent tips",
        headline: "Tip with confidence in what you received.",
        text: "Tips reflect your priorities and the service delivered, with clear explanations for adjustments and an agent to help handle issues.",
        benefits: ["Less tipping anxiety and guesswork", "Less effort to resolve delivery issues"],
      },
      {
        name: "Couriers",
        sub: "Service recognized",
        arrow: "Verified service quality",
        headline: "Let good service earn recognition.",
        text: "Service strengths translate into tip rewards and achievement badges, helping couriers understand what customers value and build their reputation.",
        benefits: ["Rewards tied to service quality", "Recognition that builds over time"],
      },
      {
        name: "Restaurants",
        sub: "Clearer issue attribution",
        arrow: "Clearer issue signals",
        headline: "Know which issues need your attention.",
        text: "Separating food and packing issues from delivery performance helps restaurants identify what to improve and respond to customer concerns.",
        benefits: ["Clearer feedback on food and preparation", "Opportunities to build repeat business"],
      },
    ],
  },

  takeaways: {
    label: "Takeaways",
    items: [
      {
        title: "Trust needs a reason, not just an outcome",
        text: "Users accepted AI-adjusted tips only once they could trace the adjustment to something concrete. Silent automation, even when correct, read as untrustworthy.",
        // Jumps back up to the part of the case that shows it
        evidence: { id: "cs-pattern-1", label: "Evidence: feedback pattern 1" },
      },
      {
        title: "Fixing tipping means fixing timing, not just UI",
        text: "The core dysfunction wasn't the tip screen's design — it was that tipping happens before the thing being tipped for. Any fix had to move the decision point, not just restyle it.",
        evidence: { id: "cs-guess", label: "Evidence: the tip guess" },
      },
    ],
    back: "Back to takeaways",
  },

  next: { id: "pebbo" as const, title: "Pebbo", line: "A companion that listens when eating feels heavy." },
};
