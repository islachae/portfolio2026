import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "../../components/site-header";
import SiteFooter from "../../components/site-footer";
import RevealOnScroll from "../../components/reveal-on-scroll";
import CaseStudyToc from "../../components/case-study-toc";
import {
  PebboDevice,
  EatingLoop,
  PebboAppTabs,
  AIReasonPanel,
} from "../../components/pebbo-visuals";

export const metadata: Metadata = {
  title: "Pebbo — Chaewon Lim",
  description:
    "Pebbo is a mindful-eating companion that pairs a pocket-sized tangible device with a reflective AI app — not another calorie tracker, but a companion that listens.",
};

const sections = [
  { id: "overview", label: "Overview" },
  { id: "reframe", label: "The Reframe" },
  { id: "device", label: "The Device" },
  { id: "ai-philosophy", label: "AI Philosophy" },
  { id: "daily-reflection", label: "Daily Reflection" },
  { id: "grip-talk", label: "Grip-Talk-Reflect" },
  { id: "design", label: "The Design" },
  { id: "learnings", label: "Learnings" },
];

const deskResearch = [
  { stat: "0.9 in 10", label: "adults will experience an eating disorder", src: "Deloitte Access Economics" },
  { stat: "$64.7B", label: "annual economic cost of eating disorders", src: "Deloitte Access Economics" },
  { stat: "Two-track", label: "treatment (nutrition + mind) is clinically proven", src: "Weight Loss Maintenance Trial Research Group" },
];

const insightToDesign = [
  { insight: "Users don't need another calorie tracker — they need a companion that listens", design: "Reflective AI chat, not logging" },
  { insight: "Distorted beliefs on 'healthy' eating", design: "Mindful eating guide" },
  { insight: "Unnoticed emotional states", design: "Mood Insights across monthly, daily, yearly views" },
  { insight: "Fear of open expression", design: "Judgment-free private chat with an 'Erase All' control" },
  { insight: "Habit formation is fragile and perfection-driven", design: "Anti-perfectionist journaling + gentle nudges" },
];

const appFeatures = [
  "Log, Explore, Quest, Peek — context-aware micro-suggestions",
  "Monthly, Daily, Yearly summaries of emotional & eating patterns",
  "Private AI chat with an 'Erase All' control",
];

const deviceFeatures = [
  "Mood-reactive LED (calm = yellow, anxious = purple, depressed = blue)",
  "Haptic feedback + two squeeze-friendly dimples",
  "Talk-mode button — prompts 'Are you OK?'",
];

const takeaways = [
  { title: "Presence, not prediction", body: "Emotional AI is about being there for the user, not forecasting them." },
  { title: "Extend, don't control", body: "Design should extend cognition, not steer behavior." },
  { title: "Tangibility builds empathy", body: "Physical touch reaches what digital-only experiences can't." },
];

export default function Pebbo() {
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
            {/* ── Overview ─────────────────────────────────────────────── */}
            <section id="overview" className="text-center">
              <p className="text-sm font-medium uppercase tracking-widest text-[var(--periwinkle)]">
                APP UX/UI &amp; Tangible Interaction · Individual project
              </p>
              <h1 className="mx-auto mt-4 text-5xl font-medium tracking-tight sm:text-6xl">
                Pebbo
              </h1>
              <p className="mx-auto mt-4 max-w-xl text-lg text-[var(--muted)]">
                not another calorie tracker — a companion that listens when
                eating feels heavy
              </p>
              <p className="mt-3 text-xs text-[var(--muted)]">4 min read</p>

              <div className="mx-auto mt-10 grid max-w-3xl grid-cols-1 gap-6 text-left sm:grid-cols-2 sm:gap-8 lg:grid-cols-4">
                <div>
                  <p className="text-sm text-[var(--muted)]">Role</p>
                  <p className="mt-1 font-medium">Product Designer</p>
                </div>
                <div>
                  <p className="text-sm text-[var(--muted)]">Timeline</p>
                  <p className="mt-1 font-medium">Oct 2024 · Individual</p>
                </div>
                <div>
                  <p className="text-sm text-[var(--muted)]">Methods</p>
                  <p className="mt-1 font-medium">UX research · Strategy · UI · 3D</p>
                </div>
                <div>
                  <p className="text-sm text-[var(--muted)]">Tools</p>
                  <p className="mt-1 font-medium">Figma · 3D modeling · Prototyping</p>
                </div>
              </div>

              <RevealOnScroll>
                <div className="mx-auto mt-12 flex max-w-2xl justify-center">
                  <PebboDevice />
                </div>
              </RevealOnScroll>
            </section>

            <section className="mx-auto mt-12 max-w-2xl border-t border-solid border-[var(--border)] pt-8">
              <p className="leading-relaxed text-[var(--muted)]">
                Pebbo redefines our relationship with food through reflective AI
                and tangible design — turning logging into a mindful dialogue,
                not a number to hit.
              </p>
            </section>

            {/* ── The Reframe ──────────────────────────────────────────── */}
            <RevealOnScroll>
              <section id="reframe" className="mt-16 border-t border-solid border-[var(--border)] pt-10">
                <p className="text-sm font-medium uppercase tracking-widest text-[var(--periwinkle)]">
                  The reframe
                </p>
                <h2 className="mt-3 max-w-2xl text-3xl font-medium tracking-tight">
                  Not another tracker. A companion.
                </h2>
                <p className="mt-4 max-w-2xl leading-relaxed text-[var(--muted)]">
                  Eating apps promise &ldquo;healthy&rdquo; through calories and streaks —
                  yet young adults still fall into an emotional loop of stress,
                  restriction, guilt, and bingeing. Pebbo starts from a different
                  question: what if the tool listened, instead of judged?
                </p>

                <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
                  {deskResearch.map((r) => (
                    <div key={r.stat} className="rounded-2xl border border-solid border-[var(--border)] p-6">
                      <p className="text-2xl font-medium tracking-tight text-[var(--periwinkle)]">{r.stat}</p>
                      <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">{r.label}</p>
                      <p className="mt-3 text-xs text-[var(--muted)]">{r.src}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-10">
                  <EatingLoop />
                </div>

                <p className="mt-10 text-lg font-medium text-[var(--fg)]">
                  How might we turn guilt into gentle awareness — through
                  reflective AI and tangible touch?
                </p>
              </section>
            </RevealOnScroll>

            {/* ── The Device ───────────────────────────────────────────── */}
            <RevealOnScroll>
              <section id="device" className="mt-16 border-t border-solid border-[var(--border)] pt-10">
                <p className="text-sm font-medium uppercase tracking-widest text-[var(--periwinkle)]">
                  The device
                </p>
                <h2 className="mt-3 max-w-2xl text-3xl font-medium tracking-tight">
                  A companion that lives in your pocket.
                </h2>
                <p className="mt-4 max-w-2xl leading-relaxed text-[var(--muted)]">
                  A pocket-sized keychain that supports emotional expression
                  through daily touch and conversation — no social stigma, one
                  click to activate. Try it: click to cycle the mood LED, hold
                  to squeeze for haptic feedback.
                </p>
                <div className="mt-8 flex justify-center">
                  <PebboDevice />
                </div>
                <div className="mt-8 rounded-2xl border border-solid border-[var(--border)] p-6">
                  <p className="font-medium">What the device does</p>
                  <ul className="mt-3 space-y-2">
                    {deviceFeatures.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm text-[var(--muted)]">
                        <span aria-hidden="true" className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--periwinkle)]" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              </section>
            </RevealOnScroll>

            {/* ── AI Philosophy ────────────────────────────────────────── */}
            <RevealOnScroll>
              <section id="ai-philosophy" className="mt-16 border-t border-solid border-[var(--border)] pt-10">
                <p className="text-sm font-medium uppercase tracking-widest text-[var(--periwinkle)]">
                  AI philosophy
                </p>
                <h2 className="mt-3 max-w-2xl text-3xl font-medium tracking-tight">
                  Presence, not prediction.
                </h2>
                <p className="mt-4 max-w-2xl leading-relaxed text-[var(--muted)]">
                  Pebbo&apos;s AI doesn&apos;t forecast your next bite — it sits with you
                  in the moment. It extends cognition rather than steering
                  behavior, and every nudge can be opened to see why it was
                  suggested.
                </p>
                <div className="mt-8">
                  <AIReasonPanel />
                </div>
              </section>
            </RevealOnScroll>

            {/* ── Daily Reflection ─────────────────────────────────────── */}
            <RevealOnScroll>
              <section id="daily-reflection" className="mt-16 border-t border-solid border-[var(--border)] pt-10">
                <p className="text-sm font-medium uppercase tracking-widest text-[var(--periwinkle)]">
                  Daily reflection
                </p>
                <h2 className="mt-3 max-w-2xl text-3xl font-medium tracking-tight">
                  A check-in, not a meal log.
                </h2>
                <p className="mt-4 max-w-2xl leading-relaxed text-[var(--muted)]">
                  After skipping dinner out of stress, a 6:20&nbsp;PM check-in
                  nudges a gentle reflection instead of a meal log. The user
                  answers today&apos;s prompt, chats freely, receives context-aware
                  suggestions, and reviews aggregated mood insights.
                </p>
                <div className="mt-8">
                  <PebboAppTabs />
                </div>
              </section>
            </RevealOnScroll>

            {/* ── Grip-Talk-Reflect ────────────────────────────────────── */}
            <RevealOnScroll>
              <section id="grip-talk" className="mt-16 border-t border-solid border-[var(--border)] pt-10">
                <p className="text-sm font-medium uppercase tracking-widest text-[var(--periwinkle)]">
                  Grip — talk — reflect
                </p>
                <h2 className="mt-3 max-w-2xl text-3xl font-medium tracking-tight">
                  Translating unspoken feelings through touch and voice.
                </h2>
                <p className="mt-4 max-w-2xl leading-relaxed text-[var(--muted)]">
                  Two physical bridges carry stress into the device — no words
                  required, until the user is ready for them.
                </p>
                <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div className="rounded-2xl border border-solid border-[var(--border)] p-6">
                    <p className="font-medium">Stress → Talk</p>
                    <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
                      Hold the device to your mouth and speak thoughts aloud —
                      it listens and transcribes without judgment.
                    </p>
                  </div>
                  <div className="rounded-2xl border border-solid border-[var(--border)] p-6">
                    <p className="font-medium">Stress → Grip &amp; Squeeze</p>
                    <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
                      Squeeze the dimples to signal stress — haptic feedback
                      relieves tension while the pattern is quietly tracked.
                    </p>
                  </div>
                </div>
              </section>
            </RevealOnScroll>

            {/* ── The Design ───────────────────────────────────────────── */}
            <RevealOnScroll>
              <section id="design" className="mt-16 border-t border-solid border-[var(--border)] pt-10">
                <p className="text-sm font-medium uppercase tracking-widest text-[var(--periwinkle)]">
                  The design
                </p>
                <h2 className="mt-3 max-w-2xl text-3xl font-medium tracking-tight">
                  From insight to touch.
                </h2>
                <p className="mt-4 max-w-2xl leading-relaxed text-[var(--muted)]">
                  Four interviews with adults aged 20–30 surfaced a common
                  thread: &ldquo;a true healthy meal is one I can enjoy freely —
                  without guilt.&rdquo; Each insight maps to a deliberate design
                  decision.
                </p>

                <div className="mt-8 overflow-hidden rounded-2xl border border-solid border-[var(--border)]">
                  {insightToDesign.map((r, i) => (
                    <div key={r.insight} className={`grid grid-cols-1 gap-2 p-5 sm:grid-cols-2 sm:gap-6 ${i % 2 ? "bg-white" : "bg-[var(--soft-blue)]"}`}>
                      <p className="text-sm text-[var(--muted)]">&ldquo;{r.insight}&rdquo;</p>
                      <p className="text-sm font-medium">→ {r.design}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-8 rounded-2xl border border-solid border-[var(--border)] p-6">
                  <p className="font-medium">The app</p>
                  <ul className="mt-3 space-y-2">
                    {appFeatures.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm text-[var(--muted)]">
                        <span aria-hidden="true" className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--periwinkle)]" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              </section>
            </RevealOnScroll>

            {/* ── Learnings ────────────────────────────────────────────── */}
            <RevealOnScroll>
              <section id="learnings" className="mt-16 border-t border-solid border-[var(--border)] pt-10">
                <p className="text-sm font-medium uppercase tracking-widest text-[var(--periwinkle)]">
                  Learnings
                </p>
                <p className="mt-4 max-w-2xl leading-relaxed text-[var(--muted)]">
                  Pebbo&apos;s measure of success isn&apos;t a number — it&apos;s a user who
                  feels seen instead of judged. Three principles came out of the
                  work:
                </p>
                <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-3">
                  {takeaways.map((t) => (
                    <div key={t.title} className="rounded-2xl bg-[var(--soft-blue)] p-6">
                      <p className="font-medium">{t.title}</p>
                      <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">{t.body}</p>
                    </div>
                  ))}
                </div>
                <p className="mt-6 text-sm text-[var(--muted)]">
                  <span className="font-medium text-[var(--fg)]">Next:</span> validate the
                  device interaction through longitudinal use, and explore how the
                  mood-reflection model extends to other emotional-health contexts.
                </p>
              </section>
            </RevealOnScroll>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
