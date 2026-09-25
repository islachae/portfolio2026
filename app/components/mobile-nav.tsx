"use client";

import { useState } from "react";
import Link from "next/link";

export default function MobileNav() {
  const [open, setOpen] = useState(false);

  const close = () => setOpen(false);

  return (
    <div className="relative sm:hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex h-8 w-8 items-center justify-center rounded-full border border-solid border-[var(--border)] text-sm text-[var(--fg)] transition-colors hover:border-[var(--fg)]"
        aria-label={open ? "Close navigation menu" : "Open navigation menu"}
        aria-expanded={open}
      >
        {open ? (
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M1 4h12M1 7h12M1 10h12"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        ) : (
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M2 4.5h10M2 7h10M2 9.5h10"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 min-w-[190px] rounded-xl border border-solid border-[var(--border)] bg-white p-2 shadow-lg">
          <Link
            href="/#work"
            onClick={close}
            className="block py-2 text-sm font-medium text-[var(--fg)] transition-colors hover:bg-neutral-50"
          >
            Work
          </Link>
          <Link
            href="/about"
            onClick={close}
            className="block py-2 text-sm font-medium text-[var(--fg)] transition-colors hover:bg-neutral-50"
          >
            About
          </Link>
          <Link
            href="/contact"
            onClick={close}
            className="block py-2 text-sm font-medium text-[var(--fg)] transition-colors hover:bg-neutral-50"
          >
            Contact
          </Link>
          <div className="my-2 border-t border-solid border-[var(--border)]" />
          <a
            href="/resume.pdf"
            download
            onClick={close}
            className="block py-2 text-sm font-medium text-[var(--fg)] transition-colors hover:bg-neutral-50"
          >
            Resume
          </a>
        </div>
      )}
    </div>
  );
}
