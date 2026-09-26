import type { Metadata } from "next";
import SiteHeader from "../../components/site-header";
import SiteFooter from "../../components/site-footer";
import RevealOnScroll from "../../components/reveal-on-scroll";
import {
  TipGuessDemo,
  BarrierFlipCards,
  AgenticAIFlow,
  EcosystemLoop,
  TestedVsProposed,
} from "../../components/tipping-interactions";

export const metadata: Metadata = {
  title: "Rethinking Tipping for the Age of AI — Chaewon Lim",
  description:
    "An agentic AI 'Trust-First Tipping' redesign that settles delivery tips after service instead of before it — clearer for customers, fairer for couriers.",
};

const takeaways = [
  {
    title: "The problem wasn't the tip screen.",
    body: "It was asking people to decide with no information. Reframing the issue as a timing problem — not a UI problem — is what unlocked the design.",
  },
  {
    title: "Fairness is a loop, not a feature.",
    body: "Customers feel justified, couriers earn by their service, and the platform keeps both sides engaged. A one-sided fix wouldn't have held.",
  },
];

export default function TippingPage() {
  return (
    <div className="portfolio-shell min-h-screen">
      <SiteHeader />

      <main className="mx-auto w-full max-w-[1120px] px-6 pb-24 pt-14 sm:px-10">
        {/* ── Hero ─────────────────────────────────────────────────── */}
        <RevealOnScroll>
          <p className="text-xs font-medium uppercase tracking-widest text-[var(--periwinkle)]">
            trust in ai · Design strategy · UX/UI design
          </p>
          <h1 className="mt-5 max-w-3xl text-4xl font-medium leading-[1.1] tracking-tight sm:text-5xl">
            Rethinking tipping for the age of AI
          </h1>
          <p className="mt-4 text-lg text-[var(--muted)]">
            No more guessing. Tip for what actually happened.
          </p>

          <div className="mt-8 flex flex-wrap gap-x-10 gap-y-4 text-sm">
            <div>
              <p className="text-xs uppercase tracking-widest text-[var(--muted)]">Role</p>
              <p className="mt-1 font-medium text-[var(--fg)]">Product Designer</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-[var(--muted)]">Timeline</p>
              <p className="mt-1 font-medium text-[var(--fg)]">120 hours · March 2025</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-[var(--muted)]">Type</p>
              <p className="mt-1 font-medium text-[var(--fg)]">Independent study</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-[var(--muted)]">Read</p>
              <p className="mt-1 font-medium text-[var(--fg)]">6 min read</p>
            </div>
          </div>

          <p className="mt-8 max-w-2xl leading-relaxed text-[var(--muted)]">
            Pre-service tipping in delivery apps is a high-pressure decision users
            have to make before the service is even complete. This project rethinks
            that flow end to end — from why delivery tipping is the most broken
            tipping context, through a working AI-mediated solution, to its effects
            on couriers and platforms.
          </p>
        </RevealOnScroll>

        {/* ── Problem ─────────────────────────────────────────────── */}
        <section id="problem" className="mt-24 border-t border-solid border-[var(--border)] pt-10">
          <RevealOnScroll>
            <p className="text-xs font-medium uppercase tracking-widest text-[var(--periwinkle)]">
              Problem
            </p>
            <h2 className="mt-3 text-3xl font-medium tracking-tight">
              Tipping is essentially a guess. Not a screen problem.
            </h2>
            <p className="mt-4 max-w-2xl leading-relaxed text-[var(--muted)]">
              We&apos;re often asked to decide how much to tip before we fully know
              what we&apos;re paying for. Try it:
            </p>
          </RevealOnScroll>

          <RevealOnScroll>
            <div className="mt-8">
              <TipGuessDemo />
            </div>
          </RevealOnScroll>

          <RevealOnScroll>
            <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="rounded-2xl border border-solid border-[var(--border)] p-6">
                <p className="text-4xl font-bold tracking-tight text-[var(--fg)]">58%</p>
                <p className="mt-2 text-sm text-[var(--muted)]">
                  say the tipping experience pushes them to eat at home instead of ordering delivery
                </p>
              </div>
              <div className="rounded-2xl border border-solid border-[var(--border)] p-6">
                <p className="text-4xl font-bold tracking-tight text-[var(--fg)]">2/3</p>
                <p className="mt-2 text-sm text-[var(--muted)]">
                  of US adults feel unsure about when and how much to tip
                </p>
              </div>
            </div>
          </RevealOnScroll>
        </section>

        {/* ── Why ambiguous ───────────────────────────────────────── */}
        <section id="barriers" className="mt-24 border-t border-solid border-[var(--border)] pt-10">
          <RevealOnScroll>
            <p className="text-xs font-medium uppercase tracking-widest text-[var(--periwinkle)]">
              Why ambiguous
            </p>
            <h2 className="mt-3 text-3xl font-medium tracking-tight">
              But why is tipping so ambiguous / uncomfortable?
            </h2>
          </RevealOnScroll>
          <RevealOnScroll>
            <div className="mt-8">
              <BarrierFlipCards />
            </div>
          </RevealOnScroll>
        </section>

        {/* ── Diagnosis ───────────────────────────────────────────── */}
        <section id="diagnosis" className="mt-24 border-t border-solid border-[var(--border)] pt-10">
          <RevealOnScroll>
            <p className="text-xs font-medium uppercase tracking-widest text-[var(--periwinkle)]">
              Diagnosis
            </p>
            <h2 className="mt-3 text-3xl font-medium tracking-tight">
              Why does the problem exist now? When dining got smarter, the sense of
              gratitude got lost.
            </h2>
            <p className="mt-4 max-w-2xl leading-relaxed text-[var(--muted)]">
              Service quality remains the strongest driver of tipping — 77%. Yet as
              dining and payments took digital form, the micro human interactions
              that guided tip decisions disappeared.
            </p>
          </RevealOnScroll>

          <RevealOnScroll>
            <div className="mt-8 overflow-hidden rounded-2xl border border-solid border-[var(--border)] bg-[#F7F5F2]">
              <img
                src="/case-studies/payment-dining.svg"
                alt="Payment evolved. Dining expanded."
                className="hidden w-full md:block"
              />
              <img
                src="/case-studies/payment-dining-mobile.svg"
                alt="Payment evolved. Dining expanded."
                className="w-full md:hidden"
              />
            </div>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[var(--muted)]">
              Payment advanced and dining formats diversified — but the tipping UX
              never moved with them, and the human touch that once carried the gesture
              was automated away.
            </p>
          </RevealOnScroll>

          <RevealOnScroll>
            <div className="mt-12 rounded-2xl bg-[var(--soft-blue)] p-8 text-center">
              <p className="text-xs font-medium uppercase tracking-widest text-[var(--periwinkle)]">
                Key question
              </p>
              <p className="mx-auto mt-3 max-w-2xl text-2xl font-medium tracking-tight sm:text-3xl">
                How might we redesign tipping clearer for customers and fairer for
                couriers?
              </p>
            </div>
          </RevealOnScroll>
        </section>

        {/* ── Mechanism ───────────────────────────────────────────── */}
        <section id="mechanism" className="mt-24 border-t border-solid border-[var(--border)] pt-10">
          <RevealOnScroll>
            <p className="text-xs font-medium uppercase tracking-widest text-[var(--periwinkle)]">
              Mechanism
            </p>
            <h2 className="mt-3 text-3xl font-medium tracking-tight">
              Applying seamless agentic AI for the tipping workflow
            </h2>
            <p className="mt-4 max-w-2xl leading-relaxed text-[var(--muted)]">
              Harvard Business School&apos;s research found that customers tend to tip
              more after confirming service quality — because outcome-based tipping
              feels more justified. That insight became the mechanism.
            </p>
          </RevealOnScroll>

          <RevealOnScroll>
            <div className="mt-8">
              <AgenticAIFlow />
            </div>
          </RevealOnScroll>
        </section>

        {/* ── User testing ────────────────────────────────────────── */}
        <section id="testing" className="mt-24 border-t border-solid border-[var(--border)] pt-10">
          <RevealOnScroll>
            <p className="text-xs font-medium uppercase tracking-widest text-[var(--periwinkle)]">
              User testing
            </p>
            <h2 className="mt-3 text-3xl font-medium tracking-tight">
              Less tipping stress. Two things still needed work.
            </h2>
            <p className="mt-4 max-w-2xl leading-relaxed text-[var(--muted)]">
              Users appreciated the reduced tipping stress and said they&apos;d keep
              using the system — as long as the AI gives clearer reasoning and adjusts
              tips within an understandable, predictable range.
            </p>
          </RevealOnScroll>
          <RevealOnScroll>
            <div className="mt-8">
              <TestedVsProposed />
            </div>
          </RevealOnScroll>
        </section>

        {/* ── Working prototype ───────────────────────────────────── */}
        <section id="prototype" className="mt-24 border-t border-solid border-[var(--border)] pt-10">
          <RevealOnScroll>
            <p className="text-xs font-medium uppercase tracking-widest text-[var(--periwinkle)]">
              Final design · Working prototype
            </p>
            <h2 className="mt-3 text-3xl font-medium tracking-tight">
              Try the flow — tip for what actually happened.
            </h2>
            <p className="mt-4 max-w-2xl leading-relaxed text-[var(--muted)]">
              A clickable end-to-end prototype of the Trust-First Tipping flow.
              Hover the tip cards to open priority settings, tap <span className="font-medium text-[var(--fg)]">Place order</span> to
              track delivery, hover the map for the drop-off tooltip, rate the
              courier, and drag the slider to adjust the final tip.
            </p>
          </RevealOnScroll>
          <RevealOnScroll>
            <div className="mt-8 overflow-hidden rounded-2xl border border-solid border-[var(--border)] bg-[#f3f1fa]">
              <iframe
                src="/case-studies/tipping-demo/index.html"
                title="Trust-First Tipping — interactive prototype"
                loading="lazy"
                className="h-[680px] w-full border-0"
              />
            </div>
          </RevealOnScroll>
        </section>

        {/* ── Ecosystem ───────────────────────────────────────────── */}
        <section id="ecosystem" className="mt-24 border-t border-solid border-[var(--border)] pt-10">
          <RevealOnScroll>
            <p className="text-xs font-medium uppercase tracking-widest text-[var(--periwinkle)]">
              Ecosystem impact
            </p>
            <h2 className="mt-3 text-3xl font-medium tracking-tight">
              A self-reinforcing loop, not a customer-only solution.
            </h2>
            <p className="mt-4 max-w-2xl leading-relaxed text-[var(--muted)]">
              The same mechanism serves all four sides — each reinforcing the next.
            </p>
          </RevealOnScroll>
          <RevealOnScroll>
            <div className="mt-8">
              <EcosystemLoop />
            </div>
          </RevealOnScroll>
        </section>

        {/* ── Takeaways ───────────────────────────────────────────── */}
        <section id="takeaways" className="mt-24 border-t border-solid border-[var(--border)] pt-10">
          <RevealOnScroll>
            <p className="text-xs font-medium uppercase tracking-widest text-[var(--periwinkle)]">
              Takeaways
            </p>
          </RevealOnScroll>
          <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
            {takeaways.map((t) => (
              <RevealOnScroll key={t.title}>
                <div className="rounded-2xl bg-[var(--soft-blue)] p-6">
                  <h3 className="text-lg font-medium tracking-tight text-[var(--fg)]">
                    {t.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">{t.body}</p>
                </div>
              </RevealOnScroll>
            ))}
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
