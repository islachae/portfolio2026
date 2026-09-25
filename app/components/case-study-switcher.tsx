"use client";

import { useState } from "react";

// ── Research 02 case-study switcher ─────────────────────────────────
// Two side-by-side cards. One is expanded (full detail) at a time;
// clicking the collapsed card shrinks the current one and expands it.

function Preview({
  brand,
  name,
  onClick,
}: {
  brand: string;
  name: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-full min-h-[220px] w-full flex-col items-center justify-center gap-2 p-6 text-center"
    >
      <p className="text-xs font-medium uppercase tracking-widest text-[var(--muted)]">
        {brand}
      </p>
      <p className="text-lg font-medium text-[var(--fg)]">{name}</p>
      <p className="mt-1 text-xs text-[var(--muted)]">click to expand →</p>
    </button>
  );
}

export default function CaseStudySwitcher() {
  const [active, setActive] = useState<"uber" | "doordash">("uber");

  return (
    <div className="flex items-stretch gap-6">
      {/* Uber Eats */}
      <div
        className={`overflow-hidden rounded-2xl border border-solid transition-all duration-500 ease-out ${
          active === "uber"
            ? "flex-[2.4] border-[var(--border)]"
            : "flex-1 cursor-pointer border-[var(--border)] hover:border-[var(--periwinkle)]"
        }`}
        onClick={() => setActive("uber")}
      >
        {active === "uber" ? (
          <div className="p-6">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium uppercase tracking-widest text-[var(--muted)]">
                Uber Eats
              </p>
              <p className="text-lg font-medium">Real-time tracking</p>
            </div>
            <div className="mt-4 grid grid-cols-[2fr_3fr] gap-6">
              <img
                src="/case-studies/uber-eats-screen.png"
                alt="Uber Eats order tracking screen"
                className="w-full rounded-lg"
              />
              <div className="flex flex-col gap-3 text-sm">
                <div>
                  <p className="font-medium text-[var(--periwinkle)]">Core value</p>
                  <p className="mt-0.5 text-[var(--muted)]">
                    Reduces "where's my food?" anxiety
                  </p>
                </div>
                <div>
                  <p className="font-medium text-[var(--periwinkle)]">Features</p>
                  <p className="mt-0.5 text-[var(--muted)]">
                    Live GPS map · clear status stages · visual cues on delays
                  </p>
                </div>
                <div>
                  <p className="font-medium text-[var(--periwinkle)]">Evidence</p>
                  <p className="mt-0.5 text-[var(--muted)]">
                    Reduced customer inquiries by 20–35%
                  </p>
                </div>
                <p className="mt-1 border-t border-solid border-[var(--border)] pt-3 font-medium text-[var(--fg)]">
                  Users value predictability. Yet tipping is decided before any
                  service quality is known.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <Preview
            brand="Uber Eats"
            name="Real-time tracking"
            onClick={() => setActive("uber")}
          />
        )}
      </div>

      {/* DoorDash */}
      <div
        className={`overflow-hidden rounded-2xl border border-solid transition-all duration-500 ease-out ${
          active === "doordash"
            ? "flex-[2.4] border-[var(--border)]"
            : "flex-1 cursor-pointer border-[var(--border)] hover:border-[var(--periwinkle)]"
        }`}
        onClick={() => setActive("doordash")}
      >
        {active === "doordash" ? (
          <div className="p-6">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium uppercase tracking-widest text-[var(--muted)]">
                DoorDash
              </p>
              <p className="text-lg font-medium">Savings transparency</p>
            </div>
            <div className="mt-4 grid grid-cols-[2fr_3fr] gap-6">
              <img
                src="/case-studies/doordash-savings.png"
                alt="DoorDash DashPass savings"
                className="w-full rounded-lg"
              />
              <div className="flex flex-col gap-3 text-sm">
                <div>
                  <p className="font-medium text-[var(--periwinkle)]">Core value</p>
                  <p className="mt-0.5 text-[var(--muted)]">
                    Transparency + honesty in savings
                  </p>
                </div>
                <div>
                  <p className="font-medium text-[var(--periwinkle)]">Features</p>
                  <p className="mt-0.5 text-[var(--muted)]">
                    "You've saved $__ today" · clear breakdown · no hidden fees
                  </p>
                </div>
                <div>
                  <p className="font-medium text-[var(--periwinkle)]">Evidence</p>
                  <p className="mt-0.5 text-[var(--muted)]">
                    Customer retention increased by 20%
                  </p>
                </div>
                <p className="mt-1 border-t border-solid border-[var(--border)] pt-3 font-medium text-[var(--fg)]">
                  Users are highly sensitive to savings, efficiency, and
                  fairness. Loyalty naturally grows with transparency.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <Preview
            brand="DoorDash"
            name="Savings transparency"
            onClick={() => setActive("doordash")}
          />
        )}
      </div>
    </div>
  );
}
