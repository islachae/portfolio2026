"use client";

import { useEffect, useRef, useState } from "react";

const ORANGE = "#f55c2d";
const A = "/case-studies/tipping-assets";

/* ── CountUp: scroll 40% into view → count 0→target ──────────────── */
export function CountUp({
  target,
  suffix = "",
  className = "",
  duration = 1200,
}: {
  target: number;
  suffix?: string;
  className?: string;
  duration?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [val, setVal] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVal(target);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !started.current) {
          started.current = true;
          const t0 = performance.now();
          const tick = (now: number) => {
            const p = Math.min(1, (now - t0) / duration);
            const eased = 1 - Math.pow(1 - p, 3);
            setVal(Math.round(target * eased));
            if (p < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
          io.disconnect();
        }
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [target, duration]);

  return (
    <span ref={ref} className={className}>
      {val}
      {suffix}
    </span>
  );
}

/* ── MechanismSteps: 3-step nav + moving indicator bar + panels ───── */
const STEPS = [
  {
    num: "01",
    title: "Start Small, Adjust After Delivery",
    customerTitle: "Set your priorities and a minimum tip at checkout.",
    customerBody:
      "Customers set their tipping priorities once, lock in a minimum tip, and pre-authorize a maximum amount for adjustment after delivery.",
    courierTitle: "See customer priorities and potential tips upfront.",
    courierBody:
      "View the guaranteed base tip and potential post-delivery reward, along with the customer's priorities, before accepting the order.",
  },
  {
    num: "02",
    title: "Reward What Actually Happened",
    customerTitle: "Let AI adjust your tip based on service details and your priorities.",
    customerBody:
      "AI agent considers arrival time, drop-off accuracy, and communication alongside your priorities.",
    courierTitle: "Earn achievement badges that recognize your service strengths.",
    courierBody:
      "Badges highlight strengths such as accurate drop-offs, careful handling, and clear communication.",
  },
  {
    num: "03",
    title: "Let an Agent Handle Delivery Issues",
    customerTitle: "Let AI handle the claim and avoid unnecessary back-and-forth.",
    customerBody:
      "With one tap, the AI agent summarizes the issue using delivery records, submits a claim, and keeps you updated.",
    courierTitle: "See your earnings and understand every adjustment.",
    courierBody:
      "View base pay, tips, and claim updates in one place, with a clear explanation for every change.",
  },
];

export function MechanismSteps() {
  const [active, setActive] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const [barLeft, setBarLeft] = useState(0);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    // indicator bar sits under the active dot, centered on its x position
    setBarLeft(0);
  }, []);

  const step = STEPS[active];

  return (
    <div>
      {/* dots + title */}
      <div className="flex flex-col items-center">
        <div ref={trackRef} className="relative flex items-center gap-8">
          {STEPS.map((s, i) => (
            <button
              key={s.num}
              type="button"
              onClick={() => setActive(i)}
              aria-pressed={active === i}
              aria-label={s.title}
              className="relative flex h-10 w-10 items-center justify-center"
            >
              <span
                className="dot-pulse absolute inset-0 rounded-full"
                style={{ color: ORANGE }}
              />
              <span
                className="absolute inset-0 rounded-full transition-colors"
                style={{
                  border: `2px solid ${active === i ? ORANGE : "#e5e2df"}`,
                  background: active === i ? "#fbede8" : "#ffffff",
                }}
              />
              <span
                className="relative text-[14px] font-bold"
                style={{ color: active === i ? ORANGE : "#1a1a1a" }}
              >
                {s.num}
              </span>
            </button>
          ))}
        </div>
        <div className="relative mt-3 h-[2px] w-full">
          <div
            className="absolute h-[2px] w-[2px] transition-all duration-300"
            style={{ left: `${(active / (STEPS.length - 1)) * 100}%`, background: "#dcd3ce" }}
          />
        </div>
        <h2 className="mt-6 text-center text-[24px] leading-[32px] text-[#1a1a1a] sm:text-[30px] sm:leading-[36px]">
          {step.title}
        </h2>
      </div>

      {/* panels */}
      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="rounded-2xl bg-[#fefaf7] p-6">
          <p className="text-[12px] font-semibold uppercase tracking-[0.1em] text-[#f55c2d]">
            Customers
          </p>
          <h3 className="mt-3 text-[18px] font-medium leading-normal text-[#1a1a1a]">
            {step.customerTitle}
          </h3>
          <p className="mt-2 text-[16px] leading-[26px] text-[#666666]">{step.customerBody}</p>
        </div>
        <div className="rounded-2xl bg-[#fefaf7] p-6">
          <p className="text-[12px] font-semibold uppercase tracking-[0.1em] text-[#f55c2d]">
            Couriers
          </p>
          <h3 className="mt-3 text-[18px] font-medium leading-normal text-[#1a1a1a]">
            {step.courierTitle}
          </h3>
          <p className="mt-2 text-[16px] leading-[26px] text-[#666666]">{step.courierBody}</p>
        </div>
      </div>
    </div>
  );
}

/* ── DesignTabs: 3 tabs → image switch ────────────────────────────── */
const TABS = [
  { label: "Checkout", img: "b4b1f40e6ecb6c105cad83c0cfb81f67.png" },
  { label: "Delivery feedback", img: "7e3c4173e8f22a2a09cf7193876f769c.png" },
  { label: "Adjust tip", img: "70588d2a4634f2acc4a452c9914b5b3a.png" },
];

export function DesignTabs() {
  const [tab, setTab] = useState(0);
  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {TABS.map((t, i) => (
          <button
            key={t.label}
            type="button"
            onClick={() => setTab(i)}
            role="tab"
            aria-selected={tab === i}
            className="h-10 rounded-full border px-5 text-[14px] transition-colors"
            style={{
              border: `1px solid ${tab === i ? "#1a1a1a" : "#cfcfcf"}`,
              background: tab === i ? "#1a1a1a" : "#ffffff",
              color: tab === i ? "#ffffff" : "#1a1a1a",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="mt-6 overflow-hidden rounded-2xl border border-solid border-[#e6e1db] bg-[#f4f4f4]">
        <img
          key={tab}
          src={`${A}/${TABS[tab].img}`}
          alt={TABS[tab].label}
          className="panel-anim mx-auto max-h-[520px] w-auto"
        />
      </div>
    </div>
  );
}

/* ── StakeholderNodes: 4 nodes → selected detail ──────────────────── */
const NODES = [
  {
    id: 0,
    name: "Platform",
    sub: "Better service insights",
    detail: "Delivery outcomes and claim patterns help the platform understand delivery quality, improve matching, and resolve issues more effectively.",
  },
  {
    id: 1,
    name: "Customers",
    sub: "Less guesswork",
    detail: "Tips reflect your priorities and the service delivered, with clear explanations for adjustments and an agent to help handle issues.",
  },
  {
    id: 2,
    name: "Couriers",
    sub: "Service recognized",
    detail: "Service strengths translate into tip rewards and achievement badges, helping couriers understand what customers value.",
  },
  {
    id: 3,
    name: "Restaurants",
    sub: "Clearer issue attribution",
    detail: "Separating food and packing issues from delivery performance helps restaurants identify what to improve.",
  },
];

export function StakeholderNodes() {
  const [sel, setSel] = useState(1);
  const node = NODES.find((n) => n.id === sel)!;
  return (
    <div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {NODES.map((n) => (
          <button
            key={n.id}
            type="button"
            onClick={() => setSel(n.id)}
            aria-pressed={sel === n.id}
            className="flex flex-col items-center justify-center gap-1.5 rounded-[22px] border p-5 transition-colors"
            style={{
              border: `1.5px solid ${sel === n.id ? ORANGE : "#e5e2df"}`,
              background: sel === n.id ? "#fbede8" : "#ffffff",
            }}
          >
            <span
              className="text-[15px] font-bold leading-[18px]"
              style={{ color: sel === n.id ? ORANGE : "#1a1a1a" }}
            >
              {n.name}
            </span>
            <span className="text-[12px] leading-[15px]" style={{ color: sel === n.id ? ORANGE : "#767676" }}>
              {n.sub}
            </span>
          </button>
        ))}
      </div>
      <div className="panel-anim mt-6 rounded-2xl border border-solid border-[#e5e2df] bg-white p-6">
        <p className="text-[12px] font-semibold uppercase tracking-[0.1em] text-[#f55c2d]">
          {node.name.toUpperCase()} · 0{node.id + 1} / 04
        </p>
        <p className="mt-3 text-[16px] leading-[26px] text-[#666666]">{node.detail}</p>
      </div>
    </div>
  );
}

/* ── WhyNow panels: staggered fade-in on scroll ───────────────────── */
const PAY = [
  { label: "Cash", img: "51c1016e137e1d98e472c8cb392de7a6.png" },
  { label: "Card", img: "643c930fa17c924561e16fd9024fa440.png" },
  { label: "Contactless", img: "a5b740ea9c528f64ff7e766d88204ef9.png" },
];
const DINE = [
  { label: "Dine-in", img: "54b22b5ce0bd19655ff4637ef07ce7c0.png" },
  { label: "Takeout", img: "d82f04a2d3729c599d1b4c5d02054132.png" },
  { label: "Drive-through", img: "57f1888038b632753c1efdb201d4bcf7.png" },
  { label: "Delivery", img: "3aeb937242beecebbb631234bb0ec15e.png" },
];

function WhyNowPanel({
  tag,
  heading,
  items,
  cols,
}: {
  tag: string;
  heading: string;
  items: { label: string; img: string }[];
  cols: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setInView(true);
      return;
    }
    const io = new IntersectionObserver(
      (e) => {
        if (e[0].isIntersecting) {
          setTimeout(() => setInView(true), 500);
          io.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className="rounded-2xl border border-solid border-[#e6e1db] bg-[#faf8f6] p-7">
      <p className="text-[12px] font-semibold uppercase tracking-[0.1em] text-[#f55c2d]">{tag}</p>
      <p className="mt-3 text-[26px] leading-[1.18] text-[#1a1a1a]">{heading}</p>
      <div className={`mt-6 grid gap-4 grid-cols-${cols}`}>
        {items.map((it, i) => (
          <div
            key={it.label}
            className="flex flex-col items-center text-center transition-all duration-700"
            style={{
              opacity: inView ? 1 : 0,
              transform: inView ? "translateY(0)" : "translateY(14px)",
              transitionDelay: `${i * 120}ms`,
            }}
          >
            <div className="flex h-[88px] w-[88px] items-center justify-center rounded-2xl border border-solid border-[#e6e1db] bg-white">
              <img src={`${A}/${it.img}`} alt={it.label} className="max-h-[56px] max-w-[60px] object-contain" />
            </div>
            <p className="mt-2 text-[14px] text-[#1a1a1a]">{it.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function WhyNow() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
      <WhyNowPanel tag="01 / How we pay" heading="Payment evolved." items={PAY} cols={3} />
      <WhyNowPanel tag="02 / How we dine" heading="Dining expanded." items={DINE} cols={2} />
    </div>
  );
}