"use client";

import { useState } from "react";

// ── Tipping case study — interactive section components ─────────────

const salmon = "#E8876B";
const green = "#5AA66A";
const purple = "#8471B5";

/* ── Section 1: tip-before-delivery guess demo ──────────────────── */
export function TipGuessDemo() {
  const tips = [3, 5, 7];
  const [tip, setTip] = useState<number | null>(null);
  const [delivered, setDelivered] = useState(false);

  const unknown = [
    { label: "Arrival", before: "Not yet known", after: "6:52 PM · On time" },
    { label: "Drop-off instructions", before: "Not yet known", after: "Followed · left at door" },
    { label: "Courier communication", before: "Not yet known", after: "Quick, clear updates" },
  ];

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-14">
      {/* Left: order card */}
      <div>
        <div className="rounded-2xl border border-solid border-[var(--border)] bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-widest text-[var(--muted)]">
            Your order
          </p>
          <p className="mt-1 text-xs text-[var(--muted)]">Order #01</p>
          <div className="mt-5 flex items-center justify-between">
            <p className="font-medium text-[var(--fg)]">Dinner for one</p>
            <p className="font-medium text-[var(--fg)]">$24.00</p>
          </div>

          <div className="mt-6 border-t border-solid border-[var(--border)] pt-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-[var(--muted)]">
              Add a courier tip
            </p>
            <div className="mt-3 flex gap-3">
              {tips.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTip(t)}
                  className={`rounded-lg border px-6 py-2.5 text-sm font-bold transition-colors ${
                    tip === t
                      ? "border-[#E8876B] bg-[#E8876B]/10 text-[#E8876B]"
                      : "border-[var(--border)] bg-white text-[var(--fg)] hover:border-[#E8876B]"
                  }`}
                >
                  ${t}
                </button>
              ))}
            </div>
            <p className="mt-3 text-xs text-[var(--muted)]">
              {delivered
                ? "You tipped knowing how the delivery went."
                : "Choose an amount. What would you base it on?"}
            </p>
          </div>
        </div>
      </div>

      {/* Right: what you know so far */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-[#8471B5]">
          What you know so far
        </p>
        <ul className="mt-4 divide-y divide-solid divide-[var(--border)] border-y border-solid border-[var(--border)]">
          {unknown.map((row) => (
            <li key={row.label} className="flex items-center justify-between py-3">
              <span className="text-sm text-[var(--muted)]">{row.label}</span>
              <span
                className={`text-sm font-medium transition-colors ${
                  delivered ? "text-[#5AA66A]" : "text-[#E8876B]"
                }`}
              >
                {delivered ? row.after : row.before}
              </span>
            </li>
          ))}
        </ul>
        <button
          type="button"
          onClick={() => setDelivered((d) => !d)}
          className={`mt-4 rounded-full px-5 py-2 text-xs font-semibold transition-colors ${
            delivered
              ? "border border-solid border-[var(--border)] bg-white text-[var(--fg)]"
              : "bg-[#E8876B] text-white"
          }`}
        >
          {delivered ? "Reset" : "See after delivery"}
        </button>
        <p className="mt-2 text-[10px] text-[var(--muted)]">Illustrative scenario</p>
      </div>
    </div>
  );
}

/* ── Section 2: barrier flip cards ──────────────────────────────── */
const barriers = [
  {
    title: "Forced to tip in the dark",
    body: "Tips are often requested before the service is complete, forcing users to decide with incomplete information.",
  },
  {
    title: "No memory, no baseline",
    body: "Users start fresh every time — no memory of past orders, no baseline, no shared standards.",
  },
  {
    title: "Same tip, regardless of effort",
    body: "Couriers get randomly assigned tips that aren't tied to their service — widening the gap between those who work hard and those who don't.",
  },
];

export function BarrierFlipCards() {
  const [flipped, setFlipped] = useState<number[]>([0]); // Timing open by default
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {barriers.map((b, i) => {
        const open = flipped.includes(i);
        return (
          <button
            key={b.title}
            type="button"
            onClick={() =>
              setFlipped((prev) =>
                prev.includes(i) ? prev.filter((n) => n !== i) : [...prev, i]
              )
            }
            className={`group relative min-h-[180px] rounded-2xl border border-solid p-6 text-left transition-all duration-300 ${
              open
                ? "border-[#8471B5]/50 bg-[#8471B5]/5"
                : "border-[var(--border)] bg-[var(--soft-blue)] hover:border-[#8471B5]"
            }`}
          >
            <span className="absolute right-4 top-4 text-xs font-medium text-[#8471B5]">
              {open ? "−" : "+"}
            </span>
            <p className="text-lg font-medium text-[var(--fg)]">{b.title}</p>
            <p
              className={`mt-3 text-sm leading-relaxed text-[var(--muted)] transition-opacity duration-300 ${
                open ? "opacity-100" : "opacity-0"
              }`}
            >
              {b.body}
            </p>
            {!open && (
              <p className="mt-3 text-xs text-[var(--muted)]">tap to reveal</p>
            )}
          </button>
        );
      })}
    </div>
  );
}

/* ── Section 4: agentic AI workflow — dual customer/courier ───── */
const flowSteps = [
  { id: "menu", label: "Menu selection", existing: true },
  { id: "pretip", label: "Trust-first pre-tip", existing: false, num: "01" },
  { id: "payment", label: "Payment", existing: true },
  { id: "indelivery", label: "In delivery", existing: true },
  { id: "adjust", label: "Dynamic adjustment", existing: false, num: "02" },
  { id: "complete", label: "Delivery complete", existing: true },
  { id: "settle", label: "Final tip settlement", existing: true },
  { id: "claim", label: "Claim resolution", existing: false, num: "03" },
];

interface Touchpoint {
  title: string;
  sub: string;
  customer: { label: string; details: string[]; btn: string };
  courier: { label: string; details: string[]; btn: string };
}

const touchpoints: Record<string, Touchpoint> = {
  pretip: {
    title: "Start with a trust-first pre-tip.",
    sub: "A minimum tip locks in at checkout so the courier sees commitment without the customer overpaying up front. The full amount settles after delivery.",
    customer: {
      label: "Customer — Checkout",
      details: ["Tatte Bakery & Cafe · Order #4821", "Min pre-tip: $2.00", "Priority: careful handling, follow instructions", "Potential reward: up to +$2.00"],
      btn: "Place order",
    },
    courier: {
      label: "Courier — New delivery request",
      details: ["Base pay: $6.00", "Trust tip range: $2.00–4.00", "Total potential: $8.00–10.00", "Customer priorities: careful handling, follow instructions"],
      btn: "Accept delivery",
    },
  },
  adjust: {
    title: "Adjust the tip with evidence.",
    sub: "As the delivery unfolds, the tip moves within the chosen range — rewarding on-time arrival and careful handling, dialing back when things go wrong.",
    customer: {
      label: "Customer — In delivery",
      details: ["Starting tip: $2.00", "On-time delivery: +$1.00", "Careful handling: +$1.20", "Stays within your $2–6 range"],
      btn: "View adjustment",
    },
    courier: {
      label: "Courier — Live tip tracking",
      details: ["Service reward earned: +$2.20", "ETA accuracy: On time (+$1.00)", "Handling: Confirmed (+$1.20)", "Total tip so far: $4.20"],
      btn: "Continue delivery",
    },
  },
  claim: {
    title: "Resolve problems with context.",
    sub: "When something goes wrong, an agent gathers both sides — customer and courier — bringing the issue and both perspectives together instead of forcing a blind dispute.",
    customer: {
      label: "Customer — Order support",
      details: ["My order arrived damaged.", "Order details attached", "Claim status: Under review", "Agent reviewing delivery context"],
      btn: "View claim",
    },
    courier: {
      label: "Courier — Delivery support",
      details: ["Customer reported: items damaged", "Drop-off photo: Attached", "Courier context: Awaiting response", "Add your perspective before resolution"],
      btn: "Add your perspective",
    },
  },
};

export function AgenticAIFlow() {
  const [active, setActive] = useState("pretip");
  const tp = touchpoints[active];

  return (
    <div className="rounded-2xl bg-[#F7F5F2] p-6 sm:p-8">
      {/* Timeline */}
      <div className="flex items-center gap-1 text-xs">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-[#D1C8DD]" /> Existing
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-[#8471B5]" /> New touchpoint
        </span>
        <span className="ml-auto hidden text-[var(--muted)] sm:block">Select a purple dot to explore</span>
      </div>

      <div className="mt-5 flex items-center gap-0 overflow-x-auto pb-1">
        {flowSteps.map((s, idx) => (
          <div key={s.id} className="flex items-center gap-0">
            <button
              type="button"
              onClick={() => !s.existing && setActive(s.id)}
              className={`flex shrink-0 flex-col items-center gap-1 ${
                s.existing ? "cursor-default" : "cursor-pointer"
              }`}
            >
              <span
                className={`h-3 w-3 rounded-full transition-transform ${
                  !s.existing && active === s.id ? "scale-150" : ""
                } ${s.existing ? "bg-[#D1C8DD]" : "bg-[#8471B5]"}`}
              />
              <span
                className={`max-w-[56px] text-center text-[9px] leading-tight ${
                  !s.existing && active === s.id ? "font-semibold text-[var(--fg)]" : "text-[var(--muted)]"
                }`}
              >
                {s.label}
              </span>
              {!s.existing && <span className="text-[8px] font-bold text-[#8471B5]">{s.num}</span>}
            </button>
            {idx < flowSteps.length - 1 && (
              <span className={`mx-0.5 h-px w-2 shrink-0 ${s.existing ? "bg-[#D1C8DD]" : "bg-[#8471B5]/40"}`} />
            )}
          </div>
        ))}
      </div>

      {/* Detail: dual cards */}
      <div className="mt-6">
        <p className="text-sm font-semibold uppercase tracking-widest text-[#8471B5]">
          {active === "pretip" ? "01" : active === "adjust" ? "02" : "03"}
        </p>
        <h4 className="mt-1 text-xl font-medium tracking-tight text-[var(--fg)]">{tp.title}</h4>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--muted)]">{tp.sub}</p>

        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Customer card */}
          <div className="rounded-2xl border border-solid border-[#E8876B]/30 bg-white p-5 shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#E8876B]">{tp.customer.label}</p>
            <ul className="mt-3 space-y-2">
              {tp.customer.details.map((d) => (
                <li key={d} className="text-sm text-[var(--muted)]">{d}</li>
              ))}
            </ul>
            <p className="mt-4 rounded-full bg-[#E8876B] px-4 py-2 text-center text-xs font-semibold text-white">
              {tp.customer.btn}
            </p>
          </div>
          {/* Courier card */}
          <div className="rounded-2xl border border-solid border-[var(--border)] bg-white p-5 shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted)]">{tp.courier.label}</p>
            <ul className="mt-3 space-y-2">
              {tp.courier.details.map((d) => (
                <li key={d} className="text-sm text-[var(--muted)]">{d}</li>
              ))}
            </ul>
            <p className="mt-4 rounded-full border border-solid border-[var(--border)] px-4 py-2 text-center text-xs font-semibold text-[var(--fg)]">
              {tp.courier.btn}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Section 6: self-reinforcing loop (4-circle ecosystem) ─────── */
const ecosystem = [
  { label: "Customers", x: "0%", y: "8%" },
  { label: "Couriers", x: "62%", y: "8%" },
  { label: "Restaurants", x: "12%", y: "58%" },
  { label: "Platform", x: "50%", y: "58%" },
];

export function EcosystemLoop() {
  return (
    <div className="relative mx-auto aspect-[4/3] w-full max-w-[560px]">
      <div className="absolute left-[6%] top-[4%] aspect-[4/1.2] w-[52%] rounded-[50%] border border-solid border-[#8471B5]/50 bg-[#8471B5]/10" />
      <div className="absolute right-[6%] top-[14%] aspect-[4/1.2] w-[52%] rounded-[50%] border border-solid border-[#8471B5]/50 bg-[#8471B5]/10" />
      <div className="absolute bottom-[4%] left-[10%] aspect-[4/1.2] w-[52%] rounded-[50%] border border-solid border-[#8471B5]/50 bg-[#8471B5]/10" />
      <div className="absolute bottom-[14%] right-[6%] aspect-[4/1.2] w-[52%] rounded-[50%] border border-solid border-[#8471B5]/50 bg-[#8471B5]/10" />
      {ecosystem.map((e) => (
        <span
          key={e.label}
          className="absolute translate-x-[-50%] translate-y-[-50%] text-sm font-medium text-[var(--fg)]"
          style={{ left: e.x, top: e.y }}
        >
          {e.label}
        </span>
      ))}
    </div>
  );
}

/* ── Iteration: tested vs proposed ─────────────────────────────── */
const iterations = [
  {
    title: "Make the adjustment understandable.",
    tested: "Service labels appear, but the connection to the final amount remains hard to follow.",
    proposed: "Show the calculation, service context, and agreed range together.",
  },
  {
    title: "Bring feedback into one moment.",
    tested: "Reviewing the delivery and giving specific feedback happen in separate views.",
    proposed: "Combine review and feedback. Keep the response and confirmation on one screen.",
  },
];

export function TestedVsProposed() {
  return (
    <div className="space-y-8">
      {iterations.map((it) => (
        <div key={it.title}>
          <h4 className="text-lg font-medium tracking-tight text-[var(--fg)]">{it.title}</h4>
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-solid border-[var(--border)] p-5">
              <p className="text-xs font-semibold uppercase tracking-widest text-[var(--muted)]">
                Tested
              </p>
              <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">{it.tested}</p>
            </div>
            <div className="rounded-2xl border border-solid border-[#8471B5]/40 bg-[#8471B5]/5 p-5">
              <p className="text-xs font-semibold uppercase tracking-widest text-[#8471B5]">
                Refined
              </p>
              <p className="mt-2 text-sm leading-relaxed text-[var(--fg)]">{it.proposed}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export { salmon, green, purple };
