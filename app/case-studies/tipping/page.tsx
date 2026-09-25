import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "../../components/site-header";
import SiteFooter from "../../components/site-footer";
import RevealOnScroll from "../../components/reveal-on-scroll";
import CaseStudyToc from "../../components/case-study-toc";
import TippingVisual from "../../components/tipping-visual";
import {
  CheckoutScreen,
  PriorityPopup,
  DeliveringScreen,
  EvaluatingScreen,
  CourierAcceptScreen,
  CountUp,
} from "../../components/cs-visuals";
import CaseStudySwitcher from "../../components/case-study-switcher";

export const metadata: Metadata = {
  title: "Rethinking Tipping for the Age of AI — Chaewon Lim",
  description:
    "An agentic AI 'Trust-First Tipping' redesign that settles delivery tips after service instead of before it — clearer for customers, fairer for couriers.",
};

const sections = [
  { id: "overview", label: "Overview" },
  { id: "problem", label: "Problem" },
  { id: "diagnosis", label: "Diagnosis" },
  { id: "predictability", label: "Predictability" },
  { id: "hmw", label: "Key Question" },
  { id: "mechanism", label: "Mechanism" },
  { id: "agentic", label: "Why Agentic AI" },
  { id: "testing", label: "User Testing" },
  { id: "design", label: "Design Process" },
  { id: "takeaways", label: "Learnings" },
];

const barriers = [
  {
    label: "Timing",
    body: "Tips are requested before the service is complete, forcing users to decide with incomplete information.",
  },
  {
    label: "Missing context",
    body: "Users start fresh every time — no memory of past orders, no baseline, no shared standards.",
  },
];

const researchShifts = [
  {
    title: "Payment evolution",
    icon: "💳",
    items: ["Cash", "Card", "Mobile / Contactless"],
    insight: "Automation over human touch",
    body: "Payment advanced, but tipping UX hasn't evolved for 20+ years.",
  },
  {
    title: "Dining context diversification",
    icon: "🍽",
    items: ["Dine-in", "Togo / Drive-thru", "Delivery"],
    insight: "Diverging context",
    body: "Technology has diversified dining formats, but tipping UX got lost.",
  },
];

const asIs = [
  {
    role: "User",
    icon: "❓",
    points: ["Uncertain service quality", "No tip data to interpret outcomes"],
  },
  {
    role: "Courier",
    icon: "🛵",
    points: [
      "Unfair blame for delays outside their control",
      "Uneven earnings despite effort",
    ],
  },
];

const toBe = [
  {
    role: "User",
    icon: "🎯",
    points: ["Predictive cost clarity", "Fair, quality-based tip adjustment"],
  },
  {
    role: "Courier",
    icon: "🪙",
    points: [
      "Earn more through better service",
      "More predictable, stable income",
    ],
  },
];

const journeyFull = [
  { name: "Browsing · deciding", highlight: false, steps: ["Opens the delivery app", "Browses for cravings within an acceptable price range"], feeling: { emoji: "😕", label: "Hungry", quote: "I'm hungry… everything feels expensive recently." } },
  { name: "Building my order", highlight: false, steps: ["Scrolls the menu, comparing taste vs portion vs price", "Checks total cost with delivery fees & tip"], feeling: { emoji: "🙂", label: "Hopeful", quote: "Looks good — but if delivery and other fees stack up…" } },
  { name: "Checkout · tip", highlight: true, steps: ["Proceeds to payment screen", "Selects auto-suggested 20 / 25 / 30% tip options"], feeling: { emoji: "😣", label: "Uncertain + pressured", quote: "Why do I need to tip before service? If I tip less, will my order get delayed?" } },
  { name: "Delivery in progress", highlight: true, steps: ["Tracks the driver's route", "Compares actual timing vs ETA"], feeling: { emoji: "😟", label: "Worried", quote: "What if something happens to my order on the way?" } },
  { name: "Received · eating", highlight: false, steps: ["Checks food condition: taste / temp / accuracy", "Eats, then considers adjusting the tip afterward"], feeling: { emoji: "😊", label: "Relieved", quote: "Nice, it arrived faster!" } },
  { name: "After-meal review", highlight: true, steps: ["Decides whether to reorder from the same place", "Files a claim if dissatisfied"], feeling: { emoji: "🤔", label: "Questioning", quote: "Was this tip worth it? Should I reorder?" } },
];

const painPoints = [
  { pain: "Unclear price expectations", opportunity: "Upfront cost expectation & budget-aligned context" },
  { pain: "Low cost transparency — no way to compare final prices until checkout", opportunity: "Transparent total cost & cross-restaurant comparison" },
  { pain: "Forced pre-service tipping without context", opportunity: "Minimum pre-tip + post-service settlement model" },
  { pain: "No control or assurance over in-progress service quality", opportunity: "Real-time, quality-based automatic tip adjustments" },
  { pain: "Mismatch between prepaid tip and actual service quality", opportunity: "Automated post-service claims and tip adjustments" },
  { pain: "No data linking tips to future outcomes; hard-to-access claim filing", opportunity: "Curated tip data for personalized recommendation" },
];

const solution = [
  {
    title: "Pre-tip, post-reward mode",
    subtitle: "Start small, reward later based on quality.",
    body: "Users set tip priorities at checkout. The final tip settles after delivery, based on what actually happened — not a guess made before it did.",
  },
  {
    title: "Dynamic tip adjustment",
    subtitle: "Real-time service quality → real-time tip optimization.",
    body: "An AI agent tracks delivery signals in real time and adjusts the tip against the user's stated priorities, with plain-language reasoning: \"Delivered 4 min faster → +$1.20 added.\"",
  },
  {
    title: "Auto-claim resolution agent",
    subtitle: "An agent that advocates on behalf of the user.",
    body: "When something goes wrong, the agent detects the issue from the user's report, opens a tip-adjustment claim, and resolves it against platform policy — no back-and-forth required.",
  },
];

const agenticReasons = [
  {
    title: "A moving target",
    body: "Speed, handling, and communication only reveal themselves after checkout — no screen can see the future.",
  },
  {
    title: "An agent watches & reasons",
    body: "It tracks delivery signals against the customer's stated priorities and adjusts with plain-language reasoning.",
  },
  {
    title: "It advocates, not just automates",
    body: "When something goes wrong, the auto-claim agent opens and resolves a claim on the user's behalf.",
  },
];

const feedbackGaps = [
  {
    n: "1",
    text: "\"View reason\" still feels unclear — need stronger evidence behind tip adjustments.",
  },
  {
    n: "2",
    text: "The feedback step feels slightly high-effort, adding extra steps after delivery.",
  },
];

export default function TippingCaseStudy() {
  return (
    <div className="portfolio-shell min-h-screen">
      <SiteHeader />

      <main className="px-6 pb-24 pt-12 sm:px-10">
        <Link
          href="/#work"
          className="inline-flex items-center gap-2 text-sm text-[var(--muted)] transition-colors hover:text-[var(--fg)]"
        >
          <span aria-hidden="true">←</span> back to work
        </Link>

        <div className="mt-8 flex flex-col gap-12 lg:flex-row lg:items-start lg:gap-16">
          <CaseStudyToc sections={sections} />

          <div className="min-w-0 flex-1">
            {/* ── Hero / Overview ─────────────────────────────────────── */}
            <section id="overview" className="text-center">
              <p className="text-sm font-medium tracking-widest uppercase text-[var(--periwinkle)]">
                UX research · Design strategy · UX/UI design
              </p>
              <h1 className="mx-auto mt-4 max-w-3xl text-4xl font-medium leading-[1.15] tracking-tight sm:text-5xl">
                Rethinking tipping for the age of AI
              </h1>
              <p className="mt-4 text-lg text-[var(--muted)]">
                No more guessing. Tip for what actually happened.
              </p>
              <p className="mt-3 text-xs text-[var(--muted)]">6 min read</p>

              <div className="mx-auto mt-10 grid max-w-2xl grid-cols-1 gap-6 text-left sm:grid-cols-3 sm:gap-10">
                <div>
                  <p className="text-sm text-[var(--muted)]">Role</p>
                  <p className="mt-1 font-medium">Product Designer</p>
                </div>
                <div>
                  <p className="text-sm text-[var(--muted)]">Timeline</p>
                  <p className="mt-1 font-medium">120 hours · March 2025</p>
                </div>
                <div>
                  <p className="text-sm text-[var(--muted)]">Type</p>
                  <p className="mt-1 font-medium">Independent study</p>
                </div>
              </div>

              <RevealOnScroll>
                <div className="mx-auto mt-12 max-w-3xl">
                  <TippingVisual />
                </div>
              </RevealOnScroll>
            </section>

            <section className="mx-auto mt-12 max-w-2xl border-t border-solid border-[var(--border)] pt-8">
              <p className="leading-relaxed text-[var(--muted)]">
                Pre-service tipping in delivery apps is a high-pressure decision
                users have to make before the service is even complete. This
                project rethinks that flow end to end — from why delivery
                tipping is the most broken tipping context, through a working
                AI-mediated solution, to its effects on couriers and platforms.
              </p>
            </section>

            {/* ── Problem ─────────────────────────────────────────────── */}
            <RevealOnScroll>
              <section id="problem" className="mt-16 border-t border-solid border-[var(--border)] pt-10">
                <p className="text-sm font-medium tracking-widest uppercase text-[var(--periwinkle)]">
                  Problem
                </p>
                <h2 className="mt-3 max-w-2xl text-3xl font-medium tracking-tight">
                  Tipping is a guess — not a screen problem.
                </h2>
                <p className="mt-4 max-w-2xl leading-relaxed text-[var(--muted)]">
                  We&apos;re often asked to decide how much to tip before we fully
                  know what we&apos;re paying for.
                </p>

                <div className="mt-8 rounded-2xl border border-solid border-[var(--border)] bg-[var(--soft-blue)] p-6 text-center">
                  <p className="text-3xl font-medium tracking-tight text-[var(--periwinkle)]">
                    58%
                  </p>
                  <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-[var(--muted)]">
                    say the tipping experience pushes them to eat at home
                    instead of ordering delivery.
                  </p>
                </div>

                <h3 className="mt-10 text-lg font-medium">
                  But why is tipping so ambiguous?
                </h3>
                <p className="mt-2 text-sm text-[var(--muted)]">
                  2/3 of US adults feel unsure about when and how much to tip.
                </p>
                <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
                  {barriers.map((b) => (
                    <div
                      key={b.label}
                      className="rounded-2xl border border-solid border-[var(--border)] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[var(--periwinkle)] hover:shadow-lg"
                    >
                      <span
                        aria-hidden="true"
                        className="inline-block h-2.5 w-2.5 rounded-full bg-[var(--periwinkle)]"
                      />
                      <p className="mt-3 font-medium">{b.label}</p>
                      <p className="mt-1 text-sm leading-relaxed text-[var(--muted)]">
                        {b.body}
                      </p>
                    </div>
                  ))}
                </div>

                <h3 className="mt-10 text-lg font-medium">What about couriers?</h3>
                <p className="mt-2 max-w-2xl leading-relaxed text-[var(--muted)]">
                  Couriers get randomly assigned tips that aren&apos;t based on
                  their service — widening the gap between couriers who work
                  hard and those who don&apos;t.
                </p>
              </section>
            </RevealOnScroll>

            {/* ── Diagnosis ───────────────────────────────────────────── */}
            <RevealOnScroll>
              <section id="diagnosis" className="mt-16 border-t border-solid border-[var(--border)] pt-10">
                <p className="text-sm font-medium tracking-widest uppercase text-[var(--periwinkle)]">
                  Diagnosis
                </p>
                <h2 className="mt-3 max-w-2xl text-3xl font-medium tracking-tight">
                  Why does the problem persist today?
                </h2>
                <p className="mt-4 max-w-2xl leading-relaxed text-[var(--muted)]">
                  When dining got smarter, the sense of gratitude got lost.
                  Service quality remains the strongest driver of tipping —{" "}
                  <span className="font-semibold text-[var(--fg)]">
                    <CountUp value={77} suffix="%" />
                  </span>
                  . Yet as dining and payments took digital form, the micro
                  human interactions that guided tip decisions disappeared.
                </p>

                <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
                  {researchShifts.map((s) => (
                    <div
                      key={s.title}
                      className="rounded-2xl border border-solid border-[var(--border)] p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                    >
                      <div className="flex items-center gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--soft-blue)] text-lg">
                          {s.icon}
                        </span>
                        <p className="font-medium">{s.title}</p>
                      </div>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {s.items.map((it) => (
                          <span
                            key={it}
                            className="rounded-full border border-solid border-[var(--border)] px-3 py-1 text-xs text-[var(--muted)]"
                          >
                            {it}
                          </span>
                        ))}
                      </div>
                      <p className="mt-5 text-sm font-medium text-[var(--periwinkle)]">
                        {s.insight}
                      </p>
                      <p className="mt-1 text-sm leading-relaxed text-[var(--muted)]">
                        {s.body}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            </RevealOnScroll>

            {/* ── Predictability & transparency ───────────────────────── */}
            <RevealOnScroll>
              <section id="predictability" className="mt-16 border-t border-solid border-[var(--border)] pt-10">
                <p className="text-sm font-medium tracking-widest uppercase text-[var(--periwinkle)]">
                  Predictability &amp; transparency
                </p>
                <h2 className="mt-3 max-w-2xl text-3xl font-medium tracking-tight">
                  Users want predictability and transparency.
                </h2>
                <p className="mt-4 max-w-2xl leading-relaxed text-[var(--muted)]">
                  I examined two renowned UX cases that worked well. From them,
                  users value predictability and transparency around payment.
                </p>

                <div className="mt-8">
                  <CaseStudySwitcher />
                </div>
              </section>
            </RevealOnScroll>

            {/* ── Key question ────────────────────────────────────────── */}
            <RevealOnScroll>
              <section id="hmw" className="mt-16 border-t border-solid border-[var(--border)] py-16 text-center">
                <p className="text-sm font-medium tracking-widest uppercase text-[var(--periwinkle)]">
                  Key question
                </p>
                <p className="mx-auto mt-6 max-w-2xl text-2xl font-medium leading-snug tracking-tight sm:text-3xl">
                  How might we redesign tipping to be{" "}
                  <span className="text-[var(--periwinkle)]">clearer for customers</span>{" "}
                  and{" "}
                  <span className="text-[var(--periwinkle)]">fairer for couriers</span>?
                </p>
                <a
                  href="#mechanism"
                  className="mt-6 inline-block text-sm font-medium text-[var(--periwinkle)] underline underline-offset-4 transition-colors hover:text-[var(--fg)]"
                >
                  skip to mechanism ↓
                </a>
              </section>
            </RevealOnScroll>

            {/* ── Mechanism ───────────────────────────────────────────── */}
            <RevealOnScroll>
              <section id="mechanism" className="mt-16 border-t border-solid border-[var(--border)] pt-10">
                <p className="text-sm font-medium tracking-widest uppercase text-[var(--periwinkle)]">
                  The mechanism
                </p>
                <h2 className="mt-3 max-w-2xl text-3xl font-medium tracking-tight">
                  Trust-first tipping with agentic AI.
                </h2>
                <p className="mt-4 max-w-2xl leading-relaxed text-[var(--muted)]">
                  Harvard Business School&apos;s research found that customers tend
                  to tip more after confirming service quality — because
                  outcome-based tipping feels more justified. That&apos;s the
                  opportunity space where both sides win.
                </p>

                {/* Venn diagram */}
                <div className="relative mx-auto mt-10 h-[240px] w-full max-w-[520px]">
                  <div className="absolute left-0 top-1/2 flex h-[200px] w-[200px] -translate-y-1/2 flex-col items-center justify-center rounded-full bg-[var(--soft-blue)] px-6 text-center">
                    <p className="text-sm font-medium text-[var(--fg)]">
                      customers want more justification
                    </p>
                  </div>
                  <div className="absolute right-0 top-1/2 flex h-[200px] w-[200px] -translate-y-1/2 flex-col items-center justify-center rounded-full bg-[var(--periwinkle)]/15 px-6 text-center">
                    <p className="text-sm font-medium text-[var(--fg)]">
                      couriers want a fairer tip based on their action
                    </p>
                  </div>
                  <div className="absolute left-1/2 top-1/2 w-[230px] -translate-x-1/2 -translate-y-1/2 rounded-xl border border-solid border-[var(--border)] bg-white p-4 text-center shadow-sm">
                    <p className="text-[11px] leading-relaxed text-[var(--muted)]">
                      Harvard Business School&apos;s research found customers tend to
                      tip more after confirming service quality — outcome-based
                      tipping feels more justified.
                    </p>
                  </div>
                </div>

                {/* Three pillars */}
                <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-3">
                  {solution.map((s, i) => (
                    <div
                      key={s.title}
                      className="rounded-2xl border border-solid border-[var(--border)] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[var(--periwinkle)] hover:shadow-lg"
                    >
                      <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[var(--periwinkle)] text-xs font-medium text-white">
                        {i + 1}
                      </span>
                      <p className="mt-4 font-medium">{s.title}</p>
                      <p className="mt-1 text-sm text-[var(--periwinkle)]">{s.subtitle}</p>
                      <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">{s.body}</p>
                    </div>
                  ))}
                </div>

                {/* Flow */}
                <div className="mt-12">
                  <p className="mb-6 text-sm font-medium uppercase tracking-widest text-[var(--muted)]">
                    The trust-first flow
                  </p>
                  <div className="flex flex-wrap items-start justify-center gap-6 lg:flex-nowrap">
                    <div className="w-[150px] shrink-0">
                      <CheckoutScreen />
                      <p className="mt-2 text-center text-xs text-[var(--muted)]">1 · Checkout</p>
                    </div>
                    <span className="hidden self-center text-2xl text-[var(--muted)]/40 lg:block">→</span>
                    <div className="w-[150px] shrink-0">
                      <PriorityPopup />
                      <p className="mt-2 text-center text-xs text-[var(--muted)]">2 · Set priorities</p>
                    </div>
                    <span className="hidden self-center text-2xl text-[var(--muted)]/40 lg:block">→</span>
                    <div className="w-[150px] shrink-0">
                      <DeliveringScreen />
                      <p className="mt-2 text-center text-xs text-[var(--muted)]">3 · In delivery</p>
                    </div>
                    <span className="hidden self-center text-2xl text-[var(--muted)]/40 lg:block">→</span>
                    <div className="w-[150px] shrink-0">
                      <EvaluatingScreen />
                      <p className="mt-2 text-center text-xs text-[var(--muted)]">4 · Settle</p>
                    </div>
                  </div>
                </div>

                {/* Timeline */}
                <div className="mt-12">
                  <div className="overflow-x-auto pb-2">
                    <div className="relative flex min-w-max items-start pt-2">
                      <div className="absolute left-0 right-0 top-[6px] h-px bg-[var(--border)]" />
                      {[
                        "Menu selection",
                        "Tip priorities setting",
                        "Pre-tip insurance",
                        "Payment",
                        "In-delivery",
                        "Dynamic adjustment",
                        "Delivery completion",
                        "Final tip settlement",
                        "Agent claim",
                        "Recommendation algorithm",
                      ].map((step, i) => {
                        const hl = [2, 5, 8].includes(i);
                        return (
                          <div key={step} className="flex w-[96px] shrink-0 flex-col items-center">
                            <span
                              className={`relative z-10 h-3 w-3 rounded-full ${
                                hl ? "bg-[var(--periwinkle)] ring-4 ring-[var(--periwinkle)]/20" : "bg-[var(--border)]"
                              }`}
                            />
                            <span
                              className={`mt-2.5 px-1 text-center text-[9px] leading-tight ${
                                hl ? "font-medium text-[var(--periwinkle)]" : "text-[var(--muted)]"
                              }`}
                            >
                              {step}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Two-sided */}
                <div className="mt-12 grid grid-cols-1 items-center gap-10 lg:grid-cols-[240px_1fr]">
                  <div className="mx-auto w-[200px]">
                    <CourierAcceptScreen />
                    <p className="mt-2 text-center text-xs text-[var(--muted)]">The courier side</p>
                  </div>
                  <div>
                    <h3 className="text-xl font-medium tracking-tight">
                      Fairness has to flow both ways.
                    </h3>
                    <p className="mt-3 leading-relaxed text-[var(--muted)]">
                      The same trust-first model changes what couriers see before
                      accepting an order. Instead of a flat tip, they see a base
                      pay plus a transparent tip range tied to the customer&apos;s
                      stated priorities — so better service is directly rewarded.
                    </p>
                    <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
                      <div className="rounded-2xl border border-solid border-[var(--border)] p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                        <p className="font-medium">Base pay + trust tip range</p>
                        <p className="mt-2 text-sm text-[var(--muted)]">
                          &quot;$6.00 base + $2–4.00 trust tip&quot; shown up front,
                          with the customer&apos;s priorities listed — so couriers know
                          exactly which behaviors lead to better earnings.
                        </p>
                      </div>
                      <div className="rounded-2xl border border-solid border-[var(--border)] p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                        <p className="font-medium">Preferences over surprises</p>
                        <p className="mt-2 text-sm text-[var(--muted)]">
                          Couriers check the customer&apos;s priorities (speed, careful
                          handling, communication) before accepting — turning an
                          opaque tip into a legible contract between both sides.
                        </p>
                      </div>
                    </div>
                    <p className="mt-4 text-sm text-[var(--muted)]">
                      Beyond the two sides, the model also settles disputes faster
                      for restaurants and gives platforms richer delivery-quality
                      data.
                    </p>
                  </div>
                </div>
              </section>
            </RevealOnScroll>

            {/* ── Why agentic AI ───────────────────────────────────────── */}
            <RevealOnScroll>
              <section id="agentic" className="mt-16 border-t border-solid border-[var(--border)] pt-10">
                <p className="text-sm font-medium tracking-widest uppercase text-[var(--periwinkle)]">
                  Why agentic AI
                </p>
                <h2 className="mt-3 max-w-2xl text-3xl font-medium tracking-tight">
                  Why does tipping need an agent, not a screen?
                </h2>
                <p className="mt-4 max-w-2xl leading-relaxed text-[var(--muted)]">
                  A static checkout screen can only ask for a number. Tipping&apos;s
                  real problem is a moving target — service quality unfolds over
                  the next 30 minutes.
                </p>
                <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
                  {agenticReasons.map((r) => (
                    <div
                      key={r.title}
                      className="rounded-2xl border border-solid border-[var(--border)] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[var(--periwinkle)] hover:shadow-lg"
                    >
                      <p className="font-medium">{r.title}</p>
                      <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
                        {r.body}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            </RevealOnScroll>

            {/* ── User testing ────────────────────────────────────────── */}
            <RevealOnScroll>
              <section id="testing" className="mt-16 border-t border-solid border-[var(--border)] pt-10">
                <p className="text-sm font-medium tracking-widest uppercase text-[var(--periwinkle)]">
                  User testing
                </p>
                <h2 className="mt-3 max-w-2xl text-3xl font-medium tracking-tight">
                  Initial proposal tested by{" "}
                  <span className="text-[var(--periwinkle)]">
                    <CountUp value={15} suffix=" users" />
                  </span>
                  .
                </h2>
                <p className="mt-4 max-w-2xl leading-relaxed text-[var(--muted)]">
                  Users appreciated the reduced tipping stress and said they&apos;d
                  keep using the system — as long as the AI gives clearer
                  reasoning and adjusts tips within an understandable,
                  predictable range.
                </p>

                <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
                  {feedbackGaps.map((g) => (
                    <div
                      key={g.n}
                      className="rounded-2xl border border-solid border-[var(--border)] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[var(--periwinkle)] hover:shadow-lg"
                    >
                      <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[var(--periwinkle)] text-xs font-medium text-white">
                        {g.n}
                      </span>
                      <p className="mt-4 text-sm leading-relaxed text-[var(--muted)]">
                        {g.text}
                      </p>
                    </div>
                  ))}
                </div>

                <p className="mt-6 max-w-2xl leading-relaxed text-[var(--muted)]">
                  On the final design, I focused on shortening the depth of the
                  feedback and making the tip calculation more transparent.
                </p>
              </section>
            </RevealOnScroll>

            {/* ── Design process ───────────────────────────────────────── */}
            <RevealOnScroll>
              <section id="design" className="mt-16 border-t border-solid border-[var(--border)] pt-10">
                <p className="text-sm font-medium tracking-widest uppercase text-[var(--periwinkle)]">
                  Design process
                </p>
                <h2 className="mt-3 max-w-2xl text-3xl font-medium tracking-tight">
                  From friction points to design opportunities.
                </h2>

                <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
                  {/* As is */}
                  <div className="rounded-2xl bg-neutral-100 p-6">
                    <p className="text-sm font-medium tracking-widest uppercase text-[var(--muted)]">
                      As is
                    </p>
                    <div className="mt-6 flex flex-col gap-8">
                      <div className="flex items-start gap-4">
                        <div className="relative h-16 w-20 shrink-0 text-neutral-400">
                          <span className="absolute left-0 top-0 text-lg font-bold leading-none">?</span>
                          <img src="/case-studies/scooter.svg" alt="Delivery scooter" className="absolute bottom-1 left-0 h-7 w-7" />
                          <svg className="absolute bottom-0 right-0 h-12 w-14" viewBox="0 0 56 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeDasharray="4 4">
                            <path d="M2 42 Q16 42 20 30 T38 16 T54 10" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-[var(--fg)]">User</p>
                          <ul className="mt-2 flex flex-col gap-1.5">
                            {asIs[0].points.map((p) => (
                              <li key={p} className="flex gap-2 text-sm leading-relaxed text-[var(--muted)]">
                                <span aria-hidden="true">–</span>
                                <span>{p}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      <div className="flex items-start gap-4">
                        <div className="flex shrink-0 items-end gap-3 text-neutral-400">
                          <div className="flex flex-col items-center gap-1">
                            <div className="flex flex-col gap-0.5">
                              {[0, 1, 2, 3, 4].map((i) => <span key={i} className="h-1.5 w-5 rounded-[2px] bg-current" />)}
                            </div>
                            <span className="relative h-6 w-6 rounded-full bg-current/25">
                              <span className="absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-current/60" />
                            </span>
                          </div>
                          <div className="flex flex-col items-center gap-1">
                            <div className="flex flex-col gap-0.5">
                              {[0, 1].map((i) => <span key={i} className="h-1.5 w-5 rounded-[2px] bg-current" />)}
                            </div>
                            <span className="relative h-6 w-6 rounded-full bg-current/25">
                              <span className="absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-current/60" />
                            </span>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-[var(--fg)]">Courier</p>
                          <ul className="mt-2 flex flex-col gap-1.5">
                            {asIs[1].points.map((p) => (
                              <li key={p} className="flex gap-2 text-sm leading-relaxed text-[var(--muted)]">
                                <span aria-hidden="true">–</span>
                                <span>{p}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* To be */}
                  <div className="rounded-2xl bg-[var(--soft-blue)] p-6">
                    <p className="text-sm font-medium tracking-widest uppercase text-[var(--periwinkle)]">
                      To be
                    </p>
                    <div className="mt-6 flex flex-col gap-8">
                      <div className="flex items-start gap-4">
                        <div className="flex w-24 shrink-0 flex-col items-center gap-2 text-[var(--periwinkle)]">
                          <div className="flex w-full items-center justify-between text-sm leading-none">
                            <img src="/case-studies/face-sad.svg" alt="Dissatisfied" className="h-5 w-5" />
                            <img src="/case-studies/face-happy.svg" alt="Satisfied" className="h-5 w-5" />
                          </div>
                          <div className="relative h-4 w-full">
                            <div className="absolute left-0 right-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-current/40" />
                            <span className="absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-current" />
                          </div>
                          <div className="flex w-full justify-between text-[9px] font-semibold">
                            <span>$</span>
                            <span>$$$</span>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-[var(--fg)]">User</p>
                          <ul className="mt-2 flex flex-col gap-1.5">
                            {toBe[0].points.map((p) => (
                              <li key={p} className="flex gap-2 text-sm leading-relaxed text-[var(--muted)]">
                                <span aria-hidden="true" className="text-[var(--periwinkle)]">+</span>
                                <span>{p}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      <div className="flex items-start gap-4">
                        <div className="flex shrink-0 flex-col gap-3 text-[var(--periwinkle)]">
                          <div className="flex items-center gap-2">
                            <img src="/case-studies/thumb-up.svg" alt="Thumbs up" className="h-5 w-5" />
                            <span className="text-xs font-semibold">=</span>
                            <div className="flex flex-col gap-0.5">
                              {[0, 1, 2, 3].map((i) => <span key={i} className="h-1.5 w-5 rounded-[2px] bg-current" />)}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <img src="/case-studies/thumb-down.svg" alt="Thumbs down" className="h-5 w-5" />
                            <span className="text-xs font-semibold">=</span>
                            <div className="flex flex-col gap-0.5">
                              {[0, 1].map((i) => <span key={i} className="h-1.5 w-5 rounded-[2px] bg-current" />)}
                            </div>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-[var(--fg)]">Courier</p>
                          <ul className="mt-2 flex flex-col gap-1.5">
                            {toBe[1].points.map((p) => (
                              <li key={p} className="flex gap-2 text-sm leading-relaxed text-[var(--muted)]">
                                <span aria-hidden="true" className="text-[var(--periwinkle)]">+</span>
                                <span>{p}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Pain points → opportunities */}
                <div className="mt-10 overflow-x-auto pb-2">
                  <div className="grid min-w-[1080px] grid-cols-6 gap-3">
                    {painPoints.map((p, i) => (
                      <div key={p.pain} className="flex flex-col gap-2">
                        <span className="rounded-md bg-[var(--soft-blue)]/60 px-2 py-1.5 text-center text-xs font-medium text-[var(--fg)]">
                          {journeyFull[i]?.name}
                        </span>
                        <div className="flex-1 rounded-lg bg-neutral-100 p-3">
                          <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--muted)]">Pain</p>
                          <p className="mt-1 text-xs leading-relaxed text-[var(--muted)]">{p.pain}</p>
                        </div>
                        <div className="flex-1 rounded-lg bg-[var(--periwinkle)]/10 p-3">
                          <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--periwinkle)]">Opportunity</p>
                          <p className="mt-1 text-xs leading-relaxed text-[var(--fg)]">{p.opportunity}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            </RevealOnScroll>

            {/* ── Learnings ────────────────────────────────────────────── */}
            <RevealOnScroll>
              <section id="takeaways" className="mt-16 max-w-2xl border-t border-solid border-[var(--border)] pt-10">
                <p className="text-sm font-medium tracking-widest uppercase text-[var(--periwinkle)]">
                  Learnings
                </p>
                <div className="mt-6 flex flex-col gap-6">
                  <div>
                    <p className="font-medium">Trust needs a reason, not just an outcome</p>
                    <p className="mt-1 text-sm leading-relaxed text-[var(--muted)]">
                      Users accepted AI-adjusted tips only once they could trace
                      the adjustment to something concrete. Silent automation,
                      even when correct, read as untrustworthy.
                    </p>
                  </div>
                  <div>
                    <p className="font-medium">Fixing tipping means fixing timing, not just UI</p>
                    <p className="mt-1 text-sm leading-relaxed text-[var(--muted)]">
                      The core dysfunction wasn&apos;t the tip screen&apos;s design — it
                      was that tipping happens before the thing being tipped
                      for. Any fix had to move the decision point, not just
                      restyle it.
                    </p>
                  </div>
                </div>
              </section>
            </RevealOnScroll>

            <div className="mt-16 border-t border-solid border-[var(--border)] pt-10">
              <Link
                href="/#work"
                className="inline-flex items-center gap-2 text-sm font-medium transition-colors hover:opacity-70"
              >
                <span aria-hidden="true">←</span> Back to all work
              </Link>
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
