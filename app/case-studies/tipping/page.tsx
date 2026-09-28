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
import {
  CountUp,
  MechanismSteps,
  DesignTabs,
  StakeholderNodes,
  WhyNow,
} from "../../components/tipping-interactive";

export const metadata: Metadata = {
  title: "Rethinking Tipping for the Age of AI — Chaewon Lim",
  description:
    "An agentic AI 'Trust-First Tipping' redesign that settles delivery tips after service instead of before it — clearer for customers, fairer for couriers.",
};

const ASSETS = "/case-studies/tipping-assets";
// exact design tokens (from the Figma React export)
const EB = "text-[14px] font-medium uppercase leading-[20px] tracking-[0.1em] text-[#5b5fa6]";
const H2 = "text-[30px] font-normal leading-[36px] tracking-[-0.015em] text-[#1a1a1a]";
const H3 = "text-[18px] font-medium leading-normal tracking-[-0.01em] text-[#1a1a1a]";
const BD = "text-[16px] leading-[26px] text-[#666666]";

export default function TippingPage() {
  return (
    <div className="portfolio-shell min-h-screen">
      <SiteHeader />

      <main className="mx-auto w-full max-w-[768px] px-6 pb-24 pt-14 sm:px-6">
        {/* ── Hero ─────────────────────────────────────────────────── */}
        <RevealOnScroll>
          <p className={EB}>Trust in AI · Design strategy · UX/UI design</p>
          <h1 className="mt-3 text-[40px] font-bold leading-[48px] tracking-[-0.02em] text-[#1a1a1a] sm:text-[48px] sm:leading-[56px]">
            Rethinking tipping for the age of AI
          </h1>
          <p className="mt-4 text-[18px] leading-[26px] text-[#666666]">
            No more guessing. Tip for what actually happened.
          </p>

          <div className="mt-8 flex flex-wrap items-end gap-x-10 gap-y-4">
            <div>
              <p className="text-[14px] uppercase leading-[20px] text-[#6b6b6b]">Role</p>
              <p className="mt-1 text-[16px] text-[#1a1a1a]">Product Designer</p>
            </div>
            <div>
              <p className="text-[14px] uppercase leading-[20px] text-[#6b6b6b]">Timeline</p>
              <p className="mt-1 text-[16px] text-[#1a1a1a]">120 hours · March 2025</p>
            </div>
            <div>
              <p className="text-[14px] uppercase leading-[20px] text-[#6b6b6b]">Type</p>
              <p className="mt-1 text-[16px] text-[#1a1a1a]">Independent study</p>
            </div>
            <div className="ml-auto">
              <p className="text-[14px] uppercase leading-[20px] text-[#6b6b6b]">Reading time</p>
              <p className="mt-1 text-[16px] text-[#f55c2d]">7 min</p>
            </div>
          </div>

          <div className="mt-12 overflow-hidden rounded-[20px] border border-solid border-[#e8e8e8] bg-[#eeeeee]">
            <img
              src={`${ASSETS}/86c76.png`}
              alt="Trust-First Tipping: checkout with a pre-tip, then adjust after delivery feedback."
              className="w-full"
            />
          </div>
        </RevealOnScroll>

        {/* ── Problem ──────────────────────────────────────────────── */}
        <section id="problem" className="mt-32">
          <RevealOnScroll>
            <p className={EB}>Problem</p>
            <h2 className={`${H2} mt-3`}>Tipping is essentially a guess. Not a UI problem.</h2>
          </RevealOnScroll>

          <RevealOnScroll>
            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="rounded-2xl border border-solid border-[#e6e1db] bg-white p-6">
                <p className="text-[38px] leading-[60px] font-light text-[#f55c2d]"><CountUp target={58} suffix="%" /></p>
                <p className={`${BD} mt-2`}>
                  say tipping experience push them to eat home instead of delivery
                </p>
                <p className="mt-3 text-[14px] leading-[20px] text-[#6b6b6b]">
                  Pew Research Center, 2023
                </p>
              </div>
              <div className="rounded-2xl border border-solid border-[#e6e1db] bg-white p-6">
                <p className="text-[38px] leading-[60px] font-light text-[#f55c2d]"><CountUp target={2} suffix="/3" /></p>
                <p className={`${BD} mt-2`}>US adults feel unsure about when and how much to tip</p>
                <p className="mt-3 text-[14px] leading-[20px] text-[#6b6b6b]">
                  Modern Restaurant Management, 2023
                </p>
              </div>
            </div>
          </RevealOnScroll>

          <RevealOnScroll>
            <div className="mt-10 rounded-2xl bg-[#fefaf7] p-8 sm:p-10">
              <TipGuessDemo />
            </div>
          </RevealOnScroll>
        </section>

        {/* ── Deeper problem ───────────────────────────────────────── */}
        <section id="deeper-problem" className="mt-32">
          <RevealOnScroll>
            <p className={EB}>Deeper problem</p>
            <h2 className={`${H2} mt-3`}>What else makes tipping uncomfortable?</h2>
          </RevealOnScroll>
          <RevealOnScroll>
            <div className="mt-8">
              <BarrierFlipCards />
            </div>
          </RevealOnScroll>
        </section>

        {/* ── Key question ─────────────────────────────────────────── */}
        <section id="key-question" className="mt-32 text-center">
          <RevealOnScroll>
            <p className={EB}>Key question</p>
            <h2 className={`${H2} mt-3`}>
              How might we redesign tipping clearer for customers and fairer for couriers?
            </h2>
            <a
              href="#final-design"
              className="mt-6 inline-block text-[14px] tracking-[1.4px] text-[#5b5fa6] underline"
            >
              SKIP TO SOLUTION
            </a>
          </RevealOnScroll>
        </section>

        {/* ── Why now ──────────────────────────────────────────────── */}
        <section id="why-now" className="mt-32">
          <RevealOnScroll>
            <p className={EB}>Why now?</p>
            <h2 className={`${H2} mt-3`}>Dining and payments evolved. Tipping hasn&apos;t caught up.</h2>
            <p className={`${BD} mt-4 max-w-[520px] text-[15px]`}>
              Service quality remains the strongest driver of tipping:{" "}
              <strong className="font-semibold text-[#1a1a1a]"><CountUp target={77} suffix="%" /></strong>. Yet as dining and
              payments took digital form, the micro human interactions that guided tip decisions
              disappeared.
            </p>
          </RevealOnScroll>

          <RevealOnScroll>
            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="rounded-2xl border border-solid border-[#e6e1db] bg-[#faf8f6] p-7">
                <p className="text-[12px] font-semibold uppercase tracking-[0.1em] text-[#f55c2d]">
                  01 / How we pay
                </p>
                <p className="mt-3 text-[26px] leading-[1.18] text-[#1a1a1a]">Payment evolved.</p>
                <div className="mt-6 flex flex-wrap gap-4">
                  {["Cash", "Card", "Contactless"].map((t) => (
                    <div
                      key={t}
                      className="flex h-[88px] w-[88px] items-center justify-center rounded-2xl border border-solid border-[#e6e1db] bg-white text-[14px] text-[#1a1a1a]"
                    >
                      {t}
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-2xl border border-solid border-[#e6e1db] bg-[#faf8f6] p-7">
                <p className="text-[12px] font-semibold uppercase tracking-[0.1em] text-[#f55c2d]">
                  02 / How we dine
                </p>
                <p className="mt-3 text-[26px] leading-[1.18] text-[#1a1a1a]">Dining expanded.</p>
                <div className="mt-6 grid grid-cols-2 gap-6">
                  {["Dine-in", "Takeout", "Drive-through", "Delivery"].map((t) => (
                    <div key={t} className="text-center">
                      <div className="mx-auto flex h-[88px] w-[88px] items-center justify-center rounded-2xl border border-solid border-[#e6e1db] bg-white text-[14px] text-[#1a1a1a]">
                        {t}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </RevealOnScroll>
        </section>

        {/* ── Design principle ─────────────────────────────────────── */}
        <section id="design-principle" className="mt-32">
          <RevealOnScroll>
            <p className={EB}>Design principle</p>
            <h2 className={`${H2} mt-3`}>Users want predictability and transparency.</h2>
            <p className={`${BD} mt-4`}>
              I examined two successful UX case studies and identified predictability and
              transparency as key principles in payment experiences.
            </p>
          </RevealOnScroll>
          <RevealOnScroll>
            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="rounded-2xl border border-solid border-[#e6e1db] p-6">
                <p className="text-[18px] font-medium text-[#1a1a1a]">Real-time tracking</p>
                <p className="mt-1 text-[14px] text-[#6b6b6b]">Uber Eats</p>
                <p className={`${BD} mt-4`}>
                  Live GPS map · clear status stages · visual cues on delays. Reduced customer
                  inquiries by 20–35%.
                </p>
              </div>
              <div className="rounded-2xl border border-solid border-[#e6e1db] p-6">
                <p className="text-[18px] font-medium text-[#1a1a1a]">Savings transparency</p>
                <p className="mt-1 text-[14px] text-[#6b6b6b]">DoorDash</p>
                <p className={`${BD} mt-4`}>
                  Surfaced fees and savings up front — the same predictability this design applies
                  to tips.
                </p>
              </div>
            </div>
          </RevealOnScroll>
        </section>

        {/* ── Mechanism ────────────────────────────────────────────── */}
        <section id="mechanism" className="mt-32">
          <RevealOnScroll>
            <p className={EB}>Mechanism</p>
            <h2 className={`${H2} mt-3`}>Existing flow — new touchpoint.</h2>
            <p className={`${BD} mt-4`}>
              Customers tend to tip more after confirming service quality, because outcome-based
              tipping feels more justified. Select an orange dot to explore.
            </p>
          </RevealOnScroll>
          <RevealOnScroll>
            <div className="mt-8">
              <AgenticAIFlow />
            </div>
          </RevealOnScroll>
        </section>

        {/* ── Three-part solution ──────────────────────────────────── */}
        <section id="solution" className="mt-32">
          <RevealOnScroll>
            <div className="rounded-2xl bg-[#fefaf7] p-8">
              <p className="text-[12px] font-semibold uppercase tracking-[0.1em] text-[#f55c2d]">01</p>
              <h2 className={`${H2} mt-2`}>Start Small, Adjust After Delivery</h2>
              <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <h3 className={H3}>Set your priorities and a minimum tip at checkout.</h3>
                  <p className={`${BD} mt-2`}>
                    Customers set their tipping priorities once, lock in a minimum tip, and
                    pre-authorize a maximum amount for adjustment after delivery.
                  </p>
                </div>
                <div>
                  <h3 className={H3}>See customer priorities and potential tips upfront.</h3>
                  <p className={`${BD} mt-2`}>
                    View the guaranteed base tip and potential post-delivery reward, along with the
                    customer&apos;s priorities, before accepting the order.
                  </p>
                </div>
              </div>
            </div>
          </RevealOnScroll>

          <RevealOnScroll>
            <div className="mt-6 rounded-2xl bg-[#fefaf7] p-8">
              <p className="text-[12px] font-semibold uppercase tracking-[0.1em] text-[#f55c2d]">02</p>
              <h2 className={`${H2} mt-2`}>Reward What Actually Happened</h2>
              <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <h3 className={H3}>
                    Let AI adjust your tip based on service details and your priorities.
                  </h3>
                  <p className={`${BD} mt-2`}>
                    AI agent considers arrival time, drop-off accuracy, and communication alongside
                    your priorities. Customers and couriers see a concise summary without
                    overwhelming live updates.
                  </p>
                </div>
                <div>
                  <h3 className={H3}>
                    Earn achievement badges that recognize your service strengths.
                  </h3>
                  <p className={`${BD} mt-2`}>
                    Badges highlight strengths such as accurate drop-offs, careful handling, and
                    clear communication, helping customers recognize what you do well.
                  </p>
                </div>
              </div>
            </div>
          </RevealOnScroll>

          <RevealOnScroll>
            <div className="mt-6 rounded-2xl bg-[#fefaf7] p-8">
              <p className="text-[12px] font-semibold uppercase tracking-[0.1em] text-[#f55c2d]">03</p>
              <h2 className={`${H2} mt-2`}>Let an Agent Handle Delivery Issues</h2>
              <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <h3 className={H3}>
                    Let AI handle the claim and avoid unnecessary back-and-forth.
                  </h3>
                  <p className={`${BD} mt-2`}>
                    With one tap, the AI agent summarizes the issue using delivery records, submits
                    a claim under platform policy, and keeps you updated on its progress.
                  </p>
                </div>
                <div>
                  <h3 className={H3}>See your earnings and understand every adjustment.</h3>
                  <p className={`${BD} mt-2`}>
                    View base pay, tips, and claim updates in one place. Any claim-related tip
                    changes appear with a clear explanation in the delivery breakdown.
                  </p>
                </div>
              </div>
            </div>
          </RevealOnScroll>
        </section>

        {/* ── User testing ─────────────────────────────────────────── */}
        <section id="testing" className="mt-32">
          <RevealOnScroll>
            <p className={EB}>User testing</p>
            <h2 className={`${H2} mt-3`}>24 users</h2>
            <p className={`${BD} mt-4`}>
              Users accepted AI-adjusted tips as the AI gives clearer reasoning and adjusts tips
              within an understandable, predictable range.
            </p>
          </RevealOnScroll>
          <RevealOnScroll>
            <div className="mt-8">
              <TestedVsProposed />
            </div>
          </RevealOnScroll>
        </section>

        {/* ── Final design ─────────────────────────────────────────── */}
        <section id="final-design" className="mt-32">
          <RevealOnScroll>
            <p className={EB}>Final design</p>
            <h2 className={`${H2} mt-3`}>Try the flow. Tip for what actually happened.</h2>
          </RevealOnScroll>
          <RevealOnScroll>
            <div className="mt-8">
              <DesignTabs />
            </div>
          </RevealOnScroll>
        </section>

        {/* ── Systemic thinking ────────────────────────────────────── */}
        <section id="systemic-thinking" className="mt-32">
          <RevealOnScroll>
            <p className={EB}>Systemic thinking</p>
            <h2 className={`${H2} mt-3`}>
              A Self-reinforcing loop, not a customer-only solution
            </h2>
            <p className={`${BD} mt-4`}>
              Explore how clearer, outcome-based tipping creates better incentives for every part
              of the system.
            </p>
          </RevealOnScroll>
          <RevealOnScroll>
            <div className="mt-8">
              <StakeholderNodes />
            </div>
          </RevealOnScroll>
        </section>

        {/* ── Takeaways ────────────────────────────────────────────── */}
        <section id="takeaways" className="mt-32 border-t border-solid border-[#e6e6e6] pt-14">
          <RevealOnScroll>
            <p className={EB}>Takeaways</p>
          </RevealOnScroll>
          <div className="mt-6 grid grid-cols-1 gap-8 md:grid-cols-2">
            <RevealOnScroll>
              <div>
                <h3 className="text-[20px] leading-[28px] text-[#1a1a1a]">
                  Trust needs a reason, not just an outcome
                </h3>
                <p className={`${BD} mt-2`}>
                  Users accepted AI-adjusted tips only once they could trace the adjustment to
                  something concrete. Silent automation, even when correct, read as untrustworthy.
                </p>
              </div>
            </RevealOnScroll>
            <RevealOnScroll>
              <div>
                <h3 className="text-[20px] leading-[28px] text-[#1a1a1a]">
                  Fixing tipping means fixing timing, not just UI
                </h3>
                <p className={`${BD} mt-2`}>
                  The core dysfunction wasn&apos;t the tip screen&apos;s design — it was that tipping
                  happens before the thing being tipped for. Any fix had to move the decision point,
                  not just restyle it.
                </p>
              </div>
            </RevealOnScroll>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
