"use client";

import { useEffect, useState } from "react";

// ── Tipping project card visual ─────────────────────────────────────
// Two phone frames (customer + courier) reflecting the Trust-First
// Tipping design identity: salmon accent, green "settled" state.
// Cropped at the bottom (~top 70% visible) like the reference mockup.
// Subtle loop: the tip settles (provisional → applied) on a cycle.

export default function TippingVisual() {
  const [settled, setSettled] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => setSettled((s) => !s), 3600);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-[#F3F2F0]">
      <div className="flex h-full items-start justify-center gap-4 px-6 pt-7">
        {/* Customer phone */}
        <div className="aspect-[9/21] w-[40%] shrink-0 rounded-[24px] border-[5px] border-[#1C1C1E] bg-white shadow-[0_22px_44px_-22px_rgba(20,20,34,0.35)]">
          <div className="flex items-center justify-between px-3.5 pt-3 text-[9px] font-semibold text-[#1A1A1A]">
            <span>9:41</span>
            <span className="flex items-center gap-1">
              <span className="h-[6px] w-[9px] rounded-[1px] bg-[#1A1A1A]" />
              <span className="h-[7px] w-[7px] rounded-full bg-[#1A1A1A]/75" />
              <span className="h-[7px] w-[12px] rounded-[1px] bg-[#1A1A1A]" />
            </span>
          </div>
          <div className="px-3.5 pt-2">
            <p className="text-[10px] font-bold text-[#1A1A1A]">Tatte Bakery &amp; Cafe</p>
            <div
              className={`mt-2 rounded-xl border p-2.5 transition-colors duration-500 ${
                settled
                  ? "border-[#5AA66A] bg-[#E9F4EB]"
                  : "border-dashed border-[#E8876B] bg-[#FBEDE8]"
              }`}
            >
              <p className="text-[9px] font-semibold text-[#1A1A1A]">Trust-First Tipping</p>
              <div className="relative mt-1 h-[22px]">
                <span
                  className={`absolute left-0 text-lg font-bold transition-opacity duration-300 ${
                    settled ? "opacity-0" : "opacity-100"
                  } text-[#E8876B]`}
                >
                  $2.00
                </span>
                <span
                  className={`absolute left-0 text-lg font-bold transition-opacity duration-300 ${
                    settled ? "opacity-100" : "opacity-0"
                  } text-[#5AA66A]`}
                >
                  $4.50
                </span>
              </div>
              <span
                className={`mt-1.5 inline-block rounded-full px-1.5 py-0.5 text-[7.5px] font-semibold transition-colors duration-300 ${
                  settled ? "bg-white text-[#5AA66A]" : "bg-[#E8876B]/15 text-[#E8876B]"
                }`}
              >
                {settled ? "Trust tip applied ✓" : "pre-tip · settles after delivery"}
              </span>
            </div>
            <div className="mt-3 rounded-full bg-[#E8876B] py-2 text-center text-[10px] font-semibold text-white">
              Place order
            </div>
          </div>
        </div>

        {/* Courier phone */}
        <div className="aspect-[9/21] w-[40%] shrink-0 rounded-[24px] border-[5px] border-[#1C1C1E] bg-white shadow-[0_22px_44px_-22px_rgba(20,20,34,0.35)]">
          <div className="flex items-center justify-between px-3.5 pt-3 text-[9px] font-semibold text-[#1A1A1A]">
            <span>9:41</span>
            <span className="flex items-center gap-1">
              <span className="h-[6px] w-[9px] rounded-[1px] bg-[#1A1A1A]" />
              <span className="h-[7px] w-[7px] rounded-full bg-[#1A1A1A]/75" />
              <span className="h-[7px] w-[12px] rounded-[1px] bg-[#1A1A1A]" />
            </span>
          </div>
          <div className="px-3.5 pt-2">
            <p className="text-[10px] font-bold text-[#1A1A1A]">Accepting order</p>
            <div className="mt-2 h-[56px] rounded-lg bg-gradient-to-br from-[#E9ECEE] to-[#DDE3E4]" />
            <div className="mt-2 flex justify-between text-[9px]">
              <span className="text-[#92908D]">Base pay</span>
              <span className="font-semibold text-[#1A1A1A]">$6.00</span>
            </div>
            <div className="mt-1 flex justify-between text-[9px]">
              <span className="text-[#92908D]">Trust tip</span>
              <span className={`font-semibold transition-colors ${settled ? "text-[#5AA66A]" : "text-[#1A1A1A]"}`}>
                {settled ? "$4.50" : "$2.00–$4.00"}
              </span>
            </div>
            <div className="mt-1 flex justify-between text-[11px] font-bold">
              <span className="text-[#92908D]">Total</span>
              <span className={settled ? "text-[#5AA66A]" : "text-[#1A1A1A]"}>
                {settled ? "$10.50" : "$8.00–$12.00"}
              </span>
            </div>
            <div className="mt-3 rounded-full bg-[#E8876B] py-2 text-center text-[10px] font-semibold text-white">
              Accept
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
