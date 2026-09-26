import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "../../components/site-header";
import SiteFooter from "../../components/site-footer";
import RevealOnScroll from "../../components/reveal-on-scroll";
import CaseStudyToc from "../../components/case-study-toc";
import { ZipflowHeroVisual } from "../../components/zipflow-visual";

export const metadata: Metadata = {
  title: "ZipFlow — Chaewon Lim",
  description:
    "ZipFlow turns one property listing into a showroom, AI-assisted marketing, and client briefings — a single workflow for real estate agents.",
};

const sections = [
  { id: "challenge", label: "The Challenge" },
  { id: "approach", label: "The Approach" },
  { id: "experience", label: "The Experience" },
  { id: "design-details", label: "Design Details" },
  { id: "reflection", label: "Reflection" },
];

const beforeTasks = [
  "Enter the same property info across multiple channels",
  "Prepare different materials for each client inquiry",
  "Reformat listings every time a new channel appears",
  "Keep marketing, listings, and client notes in separate tools",
];

const experienceSteps = [
  {
    eyebrow: "01",
    title: "A single place for every property",
    body: "Manage listings, update property details, and keep information organized in one central workspace. Designed with a clear visual hierarchy to make everyday tasks easy to navigate.",
    focus: "매물 관리 대시보드 — 매물 추가 및 상세 입력 → 등록된 매물 카드. 클릭과 스크롤에 따라 화면이 이어지는 구성.",
  },
  {
    eyebrow: "02",
    title: "Your own property showroom",
    body: "Turn selected listings into a professional, shareable showroom. Agents can present their properties in one place, giving clients a clear way to explore available options.",
    focus: "쇼룸의 데스크톱 및 모바일 화면을 함께 배치. 매물을 선택하면 쇼룸에 추가되는 인터랙션을 보여주기.",
  },
  {
    eyebrow: "03",
    title: "Less time creating. More time connecting.",
    body: "Transform existing property information into AI-generated marketing content tailored to different channels. From blog posts to social media, agents can move from listing management to marketing without starting from scratch.",
    focus: "매물 선택 → 마케팅 채널 선택 → AI 콘텐츠 생성의 세 화면을 연결. 짧은 인터랙션 영상으로 보여주면 효과적인 구간.",
  },
  {
    eyebrow: "04",
    title: "From listings to meaningful client conversations",
    body: "Create tailored property briefings and share relevant information through a single link, making it easier for agents to communicate with clients.",
    focus: "브리핑 편집 화면 옆에 고객이 받는 실제 브리핑 페이지를 크게 보여줘. 발송 버튼에서 링크가 생성되고 고객 화면으로 이어지는 모션도 가능.",
  },
];

const designValues = [
  {
    title: "Clear information hierarchy",
    body: "Property details, actions, and status sit at different visual heights so agents can scan a listing in seconds and reach the right action without digging.",
  },
  {
    title: "Consistent UI components",
    body: "Cards, inputs, and state changes follow the same patterns across listing management, showroom, and briefing — so a new feature feels like part of the same tool, not a new one.",
  },
];

export default function Zipflow() {
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
            {/* ── Hero ──────────────────────────────────────────────────── */}
            <section className="text-center">
              <p className="text-sm font-medium uppercase tracking-widest text-[var(--periwinkle)]">
                PropTech · AI-assisted marketing · Case study
              </p>
              <h1 className="mx-auto mt-4 text-5xl font-medium tracking-tight sm:text-6xl">
                ZipFlow
              </h1>
              <p className="mx-auto mt-4 max-w-xl text-lg text-[var(--muted)]">
                one listing, every workflow
              </p>
              <p className="mt-3 text-xs text-[var(--muted)]">5 min read</p>

              <div className="mx-auto mt-10 grid max-w-3xl grid-cols-1 gap-6 text-left sm:grid-cols-2 sm:gap-8 lg:grid-cols-4">
                <div>
                  <p className="text-sm text-[var(--muted)]">Role</p>
                  <p className="mt-1 font-medium">Product Designer (lead)</p>
                </div>
                <div>
                  <p className="text-sm text-[var(--muted)]">Timeline</p>
                  <p className="mt-1 font-medium">Sep 2026 · Independent</p>
                </div>
                <div>
                  <p className="text-sm text-[var(--muted)]">Methods</p>
                  <p className="mt-1 font-medium">UX/UI · Design Strategy · AI Prototyping</p>
                </div>
                <div>
                  <p className="text-sm text-[var(--muted)]">Tools</p>
                  <p className="mt-1 font-medium">Figma</p>
                </div>
              </div>

              <RevealOnScroll>
              <div className="mx-auto mt-12 flex justify-center">
                <ZipflowHeroVisual />
              </div>
              </RevealOnScroll>
            </section>

            {/* ── The Challenge ─────────────────────────────────────────── */}
            <RevealOnScroll>
              <section
                id="challenge"
                className="mt-16 border-t border-solid border-[var(--border)] pt-10"
              >
                <p className="text-sm font-medium uppercase tracking-widest text-[var(--periwinkle)]">
                  The challenge
                </p>
                <h2 className="mt-3 max-w-2xl text-3xl font-medium tracking-tight">
                  One property. Too many repetitive tasks.
                </h2>
                <p className="mt-4 max-w-2xl leading-relaxed text-[var(--muted)]">
                  Real estate agents manage more than properties. They create
                  marketing materials, update listings across multiple channels,
                  and prepare information for different clients. Yet these tasks
                  often require entering the same information over and over,
                  leaving less time for what matters most: building relationships
                  with clients.
                </p>

                <div className="mt-8 rounded-2xl border border-solid border-[var(--border)] bg-[var(--soft-blue)] p-6">
                  <p className="text-sm font-medium uppercase tracking-widest text-[var(--periwinkle)]">
                    Design opportunity
                  </p>
                  <p className="mt-2 text-lg font-medium">
                    How might we turn scattered, repetitive tasks into one
                    seamless workflow?
                  </p>
                </div>

                <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {beforeTasks.map((t) => (
                    <div
                      key={t}
                      className="flex items-start gap-3 rounded-xl border border-solid border-[var(--border)] bg-white p-4"
                    >
                      <span
                        aria-hidden="true"
                        className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--periwinkle)]"
                      />
                      <p className="text-sm text-[var(--muted)]">{t}</p>
                    </div>
                  ))}
                </div>

                <p className="mt-8 text-sm text-[var(--muted)]">
                  Instead of a long research phase, the first artifact is a simple
                  before diagram — a single listing entering a scattered set of
                  tasks, and the same listing becoming the source for everything
                  that follows.
                </p>
              </section>
            </RevealOnScroll>

            {/* ── The Design Approach ───────────────────────────────────── */}
            <RevealOnScroll>
              <section
                id="approach"
                className="mt-16 border-t border-solid border-[var(--border)] pt-10"
              >
                <p className="text-sm font-medium uppercase tracking-widest text-[var(--periwinkle)]">
                  The design approach
                </p>
                <h2 className="mt-3 max-w-2xl text-3xl font-medium tracking-tight">
                  Register once. Work from everywhere.
                </h2>
                <p className="mt-4 max-w-2xl leading-relaxed text-[var(--muted)]">
                  Instead of designing another tool for each task, we connected
                  the entire workflow around a single property listing. Once
                  registered, a property becomes the foundation for a personal
                  showroom, AI-assisted marketing, and tailored client briefings.
                </p>

                <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-3">
                  {[
                    {
                      n: "01",
                      label: "One listing",
                      body: "Property details entered once become the single source for everything downstream.",
                    },
                    {
                      n: "02",
                      label: "Three outputs",
                      body: "Showroom, AI marketing, and briefing all reuse the same information — no re-entry.",
                    },
                    {
                      n: "03",
                      label: "Same workflow",
                      body: "Agents stay inside one flow instead of switching between tools for each task.",
                    },
                  ].map((c) => (
                    <div
                      key={c.n}
                      className="rounded-2xl border border-solid border-[var(--border)] p-6"
                    >
                      <p className="text-sm font-medium text-[var(--periwinkle)]">
                        {c.n}
                      </p>
                      <p className="mt-1 font-medium">{c.label}</p>
                      <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
                        {c.body}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            </RevealOnScroll>

            {/* ── The Experience ────────────────────────────────────────── */}
            <RevealOnScroll>
              <section
                id="experience"
                className="mt-16 border-t border-solid border-[var(--border)] pt-10"
              >
                <p className="text-sm font-medium uppercase tracking-widest text-[var(--periwinkle)]">
                  The experience
                </p>
                <p className="mt-4 max-w-2xl leading-relaxed text-[var(--muted)]">
                  Each feature focuses on one core job. Real product screens go
                  here — 대시보드, 쇼룸, AI 마케팅 플로우, 브리핑 발송과 고객 화면을
                  이미지와 인터랙션으로 보여주며, 텍스트는 최소화한다.
                </p>

                <div className="mt-10 grid grid-cols-1 gap-10 sm:grid-cols-2">
                  {experienceSteps.map((step, i) => (
                    <div
                      key={step.eyebrow}
                      className="rounded-2xl border border-solid border-[var(--border)] bg-white p-6"
                    >
                      <p className="text-[10px] font-medium uppercase tracking-widest text-[var(--periwinkle)]">
                        {step.eyebrow}
                      </p>
                      <h3 className="mt-2 text-xl font-medium tracking-tight">
                        {step.title}
                      </h3>
                      <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">
                        {step.body}
                      </p>
                      <p className="mt-4 text-xs text-[var(--muted)]">
                        {step.focus}
                      </p>
                      <div className="mt-4 h-40 rounded-xl border border-dashed border-[var(--border)] bg-[var(--soft-blue)]">
                        <p className="mx-auto flex h-full items-center justify-center text-xs text-[var(--muted)]">
                          {i === 0
                            ? "매물 관리 대시보드 화면"
                            : i === 1
                              ? "쇼룸 데스크톱 + 모바일 화면"
                              : i === 2
                                ? "매물 선택 → 채널 선택 → AI 생성 흐름"
                                : "브리핑 편집 + 고객 수신 화면"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <p className="mt-6 text-xs text-[var(--muted)]">
                  AI 마케팅 구간은 매물 선택 → 마케팅 채널 선택 → AI 콘텐츠 생성의 세 화면을
                  짧은 인터랙션 영상으로 보여주면 효과적이다. 실제 영상으로 교체하기 전까지 이
                  자리는 플레이스홀더로 둔다.
                </p>
              </section>
            </RevealOnScroll>

            {/* ── Design Details ────────────────────────────────────────── */}
            <RevealOnScroll>
              <section
                id="design-details"
                className="mt-16 border-t border-solid border-[var(--border)] pt-10"
              >
                <p className="text-sm font-medium uppercase tracking-widest text-[var(--periwinkle)]">
                  Designing for familiarity
                </p>
                <h2 className="mt-3 max-w-2xl text-3xl font-medium tracking-tight">
                  Powerful behind the scenes. Simple on the surface.
                </h2>
                <p className="mt-4 max-w-2xl leading-relaxed text-[var(--muted)]">
                  Designed for Korean real estate agents in their 40s and 50s,
                  ZipFlow prioritizes readability, familiar interaction patterns,
                  and clear navigation. Rather than introducing complexity with AI,
                  the interface brings new capabilities into workflows agents
                  already understand.
                </p>

                <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2">
                  {designValues.map((v) => (
                    <div
                      key={v.title}
                      className="rounded-2xl border border-solid border-[var(--border)] bg-[var(--soft-blue)] p-6"
                    >
                      <p className="font-medium">{v.title}</p>
                      <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
                        {v.body}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-8 rounded-2xl border border-solid border-[var(--border)] bg-white p-6">
                  <p className="text-sm font-medium uppercase tracking-widest text-[var(--periwinkle)]">
                    Show the design details
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">
                    실제 타이포그래피, 버튼, 입력 폼, 상태 변화 등 구체적인 디자인 디테일을
                    이 섹션에서 보여준다. 비주얼 방향 참고용 이미지를 실제 디자인으로 교체할
                    자리.
                  </p>
                  <div className="mt-4 h-48 rounded-xl border border-dashed border-[var(--border)] bg-[var(--soft-blue)]">
                    <p className="mx-auto flex h-full items-center justify-center text-xs text-[var(--muted)]">
                      타이포그래피 · 버튼 · 입력 폼 · 상태 변화 상세
                    </p>
                  </div>
                </div>
              </section>
            </RevealOnScroll>

            {/* ── Reflection ────────────────────────────────────────────── */}
            <RevealOnScroll>
              <section
                id="reflection"
                className="mt-16 border-t border-solid border-[var(--border)] pt-10"
              >
                <p className="text-sm font-medium uppercase tracking-widest text-[var(--periwinkle)]">
                  Reflection
                </p>
                <p className="mt-4 max-w-2xl leading-relaxed text-[var(--muted)]">
                  Making AI useful starts with understanding the workflow. Leading
                  the product design taught me that simplifying an experience isn&apos;t
                  just about reducing steps. It&apos;s about connecting them.
                </p>
                <p className="mt-4 max-w-2xl leading-relaxed text-[var(--muted)]">
                  By bringing property management, marketing, and client
                  communication into one workflow, ZipFlow explores how AI can
                  reduce repetitive work while keeping agents in control of their
                  everyday tasks.
                </p>

                <div className="mt-8 rounded-2xl border border-solid border-[var(--border)] bg-white p-6">
                  <p className="text-sm text-[var(--muted)]">
                    <span className="font-medium text-[var(--fg)]">Next:</span>
                    실제 매물 관리 대시보드, 쇼룸, AI 마케팅 플로우, 브리핑 화면을 Figma에서
                    완성해 이 케이스 스터디에 넣고, 인터랙션 영상으로 흐름을 보강한다.
                  </p>
                </div>
              </section>
            </RevealOnScroll>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
