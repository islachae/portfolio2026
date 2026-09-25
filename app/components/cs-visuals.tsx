"use client";

import { useEffect, useRef, useState } from "react";

// ── Case study visual primitives ────────────────────────────────────
// Phone-frame mockups and diagrams matching the tipping wireframe.

export function Phone({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`aspect-[9/19] w-full overflow-hidden rounded-[26px] border-[5px] border-[#1C1C1E] bg-white shadow-[0_24px_48px_-20px_rgba(20,20,34,0.4)] ${className}`}
    >
      <div className="flex items-center justify-between px-4 pt-3 text-[10px] font-semibold text-[#1A1A1A]">
        <span>9:41</span>
        <span className="flex items-center gap-1">
          <span className="h-[7px] w-[11px] rounded-[1px] bg-[#1A1A1A]" />
          <span className="h-[8px] w-[8px] rounded-full bg-[#1A1A1A]/75" />
          <span className="h-[8px] w-[14px] rounded-[1px] bg-[#1A1A1A]" />
        </span>
      </div>
      {children}
    </div>
  );
}

// ── Customer checkout screen ────────────────────────────────────────
export function CheckoutScreen() {
  return (
    <Phone>
      <div className="px-4 pt-3">
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-[#92908D]">←</span>
          <p className="text-[12px] font-bold text-[#1A1A1A]">Checkout</p>
          <span className="w-3" />
        </div>
        <p className="mt-2 text-[10px] font-semibold text-[#1A1A1A]">
          Tatte Bakery &amp; Cafe
        </p>
        <p className="mt-0.5 text-[9px] text-[#92908D]">Cart · 2 items</p>

        <div className="mt-3 space-y-1 rounded-xl bg-[#F7F5F2] p-3 text-[10px]">
          <Row k="Subtotal" v="$44.00" />
          <Row k="Delivery fee" v="$1.99" />
          <Row k="Service fee" v="$6.60" />
          <Row k="Discount" v="–$5.00" red />
          <div className="border-t border-[#E5E2DD] pt-1" />
          <Row k="Total before tip" v="$50.32" bold />
        </div>

        <div className="mt-3 flex items-start justify-between">
          <p className="text-[10px] font-bold text-[#1A1A1A]">Courier Tip</p>
          <span className="text-[9px] text-[#92908D]">100% to courier ⓘ</span>
        </div>

        <div className="mt-2 rounded-xl border border-dashed border-[#E8876B] bg-[#FBEDE8] p-3">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-semibold text-[#1A1A1A]">
              Trust-First Tipping
            </p>
            <span className="text-[8px] font-medium text-[#E8876B]">
              AI adjusts after delivery →
            </span>
          </div>
          <Row k="Pre-tip" v="+ $2.00" />
          <Row k="Post-reward" v="+ $1.50 – $3.50" green />
        </div>

        <p className="mt-2 text-[9px] text-[#92908D]">
          Custom tip · adjustable post-delivery
        </p>

        <div className="mt-3 flex items-center justify-between">
          <p className="text-[11px] font-bold text-[#1A1A1A]">Estimated total</p>
          <p className="text-[14px] font-bold text-[#1A1A1A]">$56.32</p>
        </div>
        <div className="mt-3 rounded-full bg-[#E8876B] py-2.5 text-center text-[11px] font-semibold text-white">
          Place order
        </div>
      </div>
    </Phone>
  );
}

// ── Priority selection popup ────────────────────────────────────────
const priorities = [
  { icon: "⚡", label: "Quick" },
  { icon: "🤍", label: "Careful" },
  { icon: "💬", label: "Comms" },
  { icon: "🙂", label: "Friendly" },
  { icon: "📍", label: "Drop-off" },
  { icon: "🌡", label: "Temp" },
  { icon: "🍃", label: "Eco" },
  { icon: "⭐", label: "Effort" },
];

export function PriorityPopup() {
  return (
    <div className="overflow-hidden rounded-2xl border border-[#E5E2DD] bg-white shadow-[0_20px_40px_-18px_rgba(20,20,34,0.3)]">
      <div className="bg-[#1A1A1A] px-4 py-2.5">
        <p className="text-[11px] font-semibold text-white">
          Tip selection priority
        </p>
      </div>
      <div className="p-4">
        <p className="text-[10px] leading-snug text-[#92908D]">
          Select your top 3 priorities for judging the tip. You can change
          these anytime in settings.
        </p>
        <div className="mt-3 grid grid-cols-4 gap-2">
          {priorities.map((p, i) => (
            <div
              key={p.label}
              className={`flex flex-col items-center gap-1 rounded-lg p-1.5 ${
                i < 3 ? "bg-[#FBEDE8]" : "bg-[#F7F5F2]"
              }`}
            >
              <span className="text-[14px]">{p.icon}</span>
              <span className="text-[8px] font-medium text-[#1A1A1A]">
                {p.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Delivering screen ───────────────────────────────────────────────
export function DeliveringScreen() {
  return (
    <Phone>
      <div className="px-4 pt-3">
        <p className="text-[12px] font-bold text-[#1A1A1A]">Delivering</p>
        <p className="mt-1 text-[10px] text-[#1A1A1A]">
          Gustavo is heading to you…
        </p>
        <p className="text-[9px] text-[#92908D]">Arrives ~9:48 PM</p>
        <div className="mt-3 h-[90px] rounded-xl bg-gradient-to-br from-[#E9ECEE] to-[#DDE3E4]" />
        <div className="mt-3 rounded-xl border border-[#E5E2DD] p-3">
          <div className="flex justify-between">
            <p className="text-[10px] font-bold text-[#1A1A1A]">
              Tatte Bakery &amp; Cafe
            </p>
            <span className="text-[9px] text-[#92908D]">2 items</span>
          </div>
          <div className="mt-2 border-t border-[#F0EEEB] pt-2">
            <Row k="Trust tip" v="$3.00" green />
            <Row k="Est. total" v="$45.32" bold />
          </div>
        </div>
      </div>
    </Phone>
  );
}

// ── Evaluating (feedback) screen ────────────────────────────────────
export function EvaluatingScreen() {
  return (
    <Phone>
      <div className="px-4 pt-3">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#E9ECEE] text-[11px]">
            👤
          </span>
          <div>
            <p className="text-[11px] font-bold text-[#1A1A1A]">
              How was Gustavo's service?
            </p>
            <p className="text-[9px] text-[#92908D]">Arrived 5 min late</p>
          </div>
        </div>

        <div className="mt-3 space-y-1 rounded-xl bg-[#F7F5F2] p-3 text-[9px]">
          <Row k="ETA" v="2:45 PM" />
          <Row k="Actual" v="2:55 PM" />
          <p className="text-[#92908D]">✓ Verified drop-off · Responsive · E-bike</p>
        </div>

        <div className="mt-3 flex items-center justify-between rounded-xl border border-[#5AA66A] bg-[#E9F4EB] p-3">
          <div>
            <p className="text-[10px] font-semibold text-[#1A1A1A]">Trust tip</p>
            <p className="text-[13px] font-bold text-[#5AA66A]">$4.50</p>
          </div>
          <span className="text-[9px] font-medium text-[#5AA66A] underline">
            View reason
          </span>
        </div>

        <p className="mt-2 text-[9px] leading-snug text-[#92908D]">
          Review this order to adjust your tip. Otherwise the final charge
          applies automatically.
        </p>
        <div className="mt-3 flex justify-center gap-3">
          <span className="rounded-full border border-[#E5E2DD] px-4 py-1.5 text-[12px]">
            👎
          </span>
          <span className="rounded-full border border-[#E5E2DD] px-4 py-1.5 text-[12px]">
            👍
          </span>
        </div>
      </div>
    </Phone>
  );
}

// ── Courier accept screen ───────────────────────────────────────────
export function CourierAcceptScreen() {
  return (
    <Phone>
      <div className="px-4 pt-3">
        <p className="text-[12px] font-bold text-[#1A1A1A]">Accepting order</p>
        <div className="mt-2 h-[64px] rounded-xl bg-gradient-to-br from-[#E9ECEE] to-[#DDE3E4]" />
        <div className="mt-3 flex gap-2">
          <div className="flex-1 rounded-xl bg-[#F7F5F2] p-2.5 text-center">
            <p className="text-[8px] text-[#92908D]">Base pay</p>
            <p className="text-[14px] font-bold text-[#1A1A1A]">$6.00</p>
          </div>
          <div className="flex-1 rounded-xl bg-[#E9F4EB] p-2.5 text-center">
            <p className="text-[8px] text-[#92908D]">Trust tip range</p>
            <p className="text-[14px] font-bold text-[#5AA66A]">$2–4.00</p>
          </div>
        </div>
        <div className="mt-3">
          <p className="text-[9px] text-[#92908D]">Customer's preference</p>
          <div className="mt-1 flex gap-1.5">
            {["⚡", "🤍", "💬"].map((i) => (
              <span
                key={i}
                className="flex h-6 w-6 items-center justify-center rounded-full bg-[#FBEDE8] text-[11px]"
              >
                {i}
              </span>
            ))}
          </div>
        </div>
        <div className="mt-2 flex justify-between text-[10px] font-bold">
          <span className="text-[#92908D]">Total</span>
          <span className="text-[#1A1A1A]">$8.00 – $12.00</span>
        </div>
        <p className="text-[8px] text-[#92908D]">1.7 mi · Deliver by 3:30 PM</p>
        <div className="mt-1 space-y-1 text-[9px]">
          <p className="text-[#1A1A1A]">Pickup · Tatte Bakery &amp; Cafe</p>
          <p className="text-[#1A1A1A]">Dropoff · 43-45 Hunter Street</p>
        </div>
        <div className="mt-3 flex items-center justify-between rounded-full bg-[#E8876B] px-4 py-2.5 text-[11px] font-semibold text-white">
          <span>Accept</span>
          <span className="rounded-full bg-white/20 px-1.5 text-[9px]">48</span>
        </div>
      </div>
    </Phone>
  );
}

// ── Uber Eats tracking reference ────────────────────────────────────
export function UberEatsScreen() {
  return (
    <Phone>
      <div className="px-4 pt-3">
        <div className="flex items-center justify-between text-[11px] text-[#92908D]">
          <span>✕</span>
          <span className="flex items-center gap-2">
            <span>↗</span>
            <span>Help</span>
          </span>
        </div>
        <div className="mt-2 rounded-lg border-2 border-[#E8876B] p-2.5">
          <p className="text-[11px] font-bold text-[#1A1A1A]">Heading your way…</p>
          <p className="text-[9px] text-[#92908D]">
            Arriving at <b className="text-[#1A1A1A]">10:19 PM</b>
          </p>
          <div className="mt-2 flex gap-1">
            {[0, 1, 2, 3, 4].map((i) => (
              <span
                key={i}
                className={`h-1.5 flex-1 rounded-full ${
                  i < 3 ? "bg-[#5AA66A]" : "bg-[#E5E2DD]"
                }`}
              />
            ))}
          </div>
          <p className="mt-1.5 text-[8px] text-[#92908D]">
            ⓘ Uber One · Latest arrival by 10:55 PM
          </p>
        </div>
        <div className="mt-2 h-[70px] rounded-xl bg-gradient-to-br from-[#E9ECEE] to-[#DDE3E4]" />
        <div className="mt-2 rounded-xl bg-[#F7F5F2] p-2.5">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#1A1A1A] text-[9px] text-white">
              T
            </span>
            <div className="flex-1">
              <p className="text-[9px] font-semibold text-[#1A1A1A]">
                Trieu is taking care of your order today
              </p>
              <p className="text-[8px] text-[#92908D]">View profile</p>
            </div>
          </div>
          <div className="mt-2 flex gap-1">
            <span className="flex-1 rounded-full border border-[#E5E2DD] py-1 text-center text-[8px] font-medium text-[#1A1A1A]">
              Send a message
            </span>
            <span className="flex-1 rounded-full border border-[#E5E2DD] py-1 text-center text-[8px] font-medium text-[#1A1A1A]">
              + Tip
            </span>
          </div>
          <p className="mt-1.5 text-center text-[7px] text-[#92908D]">
            Confirm delivery with your PIN
          </p>
        </div>
      </div>
    </Phone>
  );
}

// ── DoorDash savings reference ──────────────────────────────────────
export function DoorDashScreen() {
  return (
    <Phone>
      <div className="px-4 pt-3">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-bold text-[#1A1A1A]">DashPass</p>
          <span className="text-[9px] text-[#92908D]">☰</span>
        </div>
        <div className="mt-2 rounded-lg border-2 border-[#E8876B]/70 p-2.5 text-center">
          <p className="text-[10px] font-bold text-[#1A1A1A]">
            You've saved $1,202.71 in fees
          </p>
        </div>
        <div className="mt-3 rounded-xl bg-[#F7F5F2] p-3 text-[10px]">
          <p className="font-bold text-[#1A1A1A]">Saving summary</p>
          <div className="mt-2 space-y-1">
            <Row k="Subtotal" v="$26.85" />
            <Row k="Retail delivery fees" v="$0.29" />
            <Row k="Delivery fee" v="$0.00" green />
            <Row k="Fees & est. tax" v="$3.60" />
            <div className="border-t border-[#E5E2DD] pt-1" />
            <Row k="Total" v="$30.74" bold />
          </div>
        </div>
        <div className="mt-2 rounded-lg border-2 border-[#5AA66A] bg-[#E9F4EB] p-2.5 text-center">
          <p className="text-[10px] font-bold text-[#5AA66A]">
            Saving $7.18 with DashPass
          </p>
        </div>
      </div>
    </Phone>
  );
}

// ── Ecosystem diagram (4 stakeholders) ──────────────────────────────
export function EcosystemDiagram() {
  const nodes = [
    { label: "Customers", cls: "left-1/2 top-0 -translate-x-1/2" },
    { label: "Platform", cls: "left-0 top-1/2 -translate-y-1/2" },
    { label: "Couriers", cls: "right-0 top-1/2 -translate-y-1/2" },
    { label: "Restaurants", cls: "bottom-0 left-1/2 -translate-x-1/2" },
  ];
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[320px]">
      {/* connecting lines */}
      <svg
        viewBox="0 0 200 200"
        className="absolute inset-0 h-full w-full text-[var(--periwinkle)]/40"
        fill="none"
      >
        <path d="M100 100 L100 30" stroke="currentColor" strokeWidth="1.5" />
        <path d="M100 100 L30 100" stroke="currentColor" strokeWidth="1.5" />
        <path d="M100 100 L170 100" stroke="currentColor" strokeWidth="1.5" />
        <path d="M100 100 L100 170" stroke="currentColor" strokeWidth="1.5" />
      </svg>
      <div className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--periwinkle)]" />
      {nodes.map((n) => (
        <div
          key={n.label}
          className={`absolute ${n.cls} rounded-full border border-solid border-[var(--border)] bg-white px-5 py-2.5 text-sm font-medium shadow-sm`}
        >
          {n.label}
        </div>
      ))}
    </div>
  );
}

// ── Animated count-up stat (scroll-triggered) ───────────────────────
export function CountUp({
  value,
  prefix = "",
  suffix = "",
  duration = 1200,
  className = "",
}: {
  value: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [started, setStarted] = useState(false);
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDisplay(value);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setStarted(true);
          io.disconnect();
        }
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [value]);

  useEffect(() => {
    if (!started) return;
    let raf = 0;
    const t0 = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(eased * value));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [started, value, duration]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {display}
      {suffix}
    </span>
  );
}

function Row({
  k,
  v,
  bold,
  green,
  red,
}: {
  k: string;
  v: string;
  bold?: boolean;
  green?: boolean;
  red?: boolean;
}) {
  const color = green
    ? "text-[#5AA66A]"
    : red
      ? "text-[#E8876B]"
      : "text-[#1A1A1A]";
  return (
    <div className="flex items-center justify-between">
      <span className="text-[#92908D]">{k}</span>
      <span className={`${bold ? "font-bold" : ""} ${color}`}>{v}</span>
    </div>
  );
}
