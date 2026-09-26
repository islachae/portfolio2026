"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Logo from "./logo";
import MobileNav from "./mobile-nav";

// Header hides when scrolling down, reappears when scrolling up or
// near the top — not permanently fixed/visible.
export default function SiteHeader() {
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);

  useEffect(() => {
    lastY.current = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      const goingDown = y > lastY.current;
      const pastThreshold = y > 80;
      setHidden(goingDown && pastThreshold);
      lastY.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-transform duration-300 ease-out ${
        hidden ? "-translate-y-full" : "translate-y-0"
      }`}
    >
      {/* Full-bleed background bar — spans the whole viewport so the
          white/blur doesn't stop at the 1280px shell edge */}
      <div
        aria-hidden="true"
        className="absolute inset-y-0 -z-10 border-b border-solid border-[var(--border)] bg-white/40 backdrop-blur-sm"
        style={{ left: "50%", width: "100vw", transform: "translateX(-50%)" }}
      />

      <div className="flex items-center justify-between px-6 py-4 sm:px-10">
        <Logo />

        <nav className="hidden items-center gap-8 sm:flex">
          <Link
            href="/#work"
            className="nav-link text-sm text-[var(--fg)]/60 transition-colors duration-200 hover:text-[var(--periwinkle)]"
          >
            work
          </Link>
          <Link
            href="/about"
            className="nav-link text-sm text-[var(--fg)]/60 transition-colors duration-200 hover:text-[var(--periwinkle)]"
          >
            about
          </Link>
          <Link
            href="/contact"
            className="nav-link text-sm text-[var(--fg)]/60 transition-colors duration-200 hover:text-[var(--periwinkle)]"
          >
            contact
          </Link>
        </nav>

        <MobileNav />

        <div className="hidden sm:flex items-center gap-5">
          <a
            href="https://www.linkedin.com/in/chaewon-lim-7591891a4/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-[var(--fg)] transition-colors hover:opacity-70"
          >
            Linkedin
          </a>
          <a
            href="/resume.pdf"
            download
            className="text-sm font-medium text-[var(--fg)] transition-colors hover:opacity-70"
          >
            Resume
          </a>
        </div>
      </div>
    </header>
  );
}
