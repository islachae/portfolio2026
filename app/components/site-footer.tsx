import { Suspense } from "react";
import Logo from "./logo";
import LocalTime from "./local-time";

export default function SiteFooter() {
  return (
    <footer className="border-t border-solid border-[var(--border)] px-6 pb-10 pt-8 sm:px-10">
      <div className="flex flex-wrap items-center gap-x-8 gap-y-3 text-sm text-[var(--muted)]">
        <div className="flex items-center gap-4">
          <Logo />
        </div>

        <div className="flex items-center gap-6">
          <a
            href="/contact"
            className="transition-colors hover:text-[var(--fg)]"
          >
            Contact
          </a>
          <a
            href="https://www.linkedin.com/in/chaewon-lim-7591891a4/"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-[var(--fg)]"
          >
            Linkedin
          </a>
          <a
            href="https://github.com/islachae"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-[var(--fg)]"
          >
            GitHub
          </a>
        </div>

      </div>

      <div className="mt-6 flex items-center justify-between text-xs text-[var(--muted)]">
        <span className="flex items-center gap-2 font-mono">
          <Suspense fallback={<span>--:--:--</span>}>
            <LocalTime />
          </Suspense>
          <span aria-hidden="true">·</span>
          <span>NYC time</span>
          <span className="group relative inline-flex items-center">
            <span className="availability-dot inline-block h-2 w-2 rounded-full bg-[var(--green)] transition-all duration-200 group-hover:scale-125 group-hover:shadow-[0_0_10px_2px_rgba(90,166,106,0.55)]" aria-hidden="true" />
            <span className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 whitespace-nowrap rounded-full border border-solid border-[var(--border)] bg-white px-3.5 py-1.5 text-xs font-medium text-[var(--muted)] opacity-0 shadow-sm transition-opacity duration-200 group-hover:opacity-100">
              available for 2027 summer internship
            </span>
          </span>
        </span>
        <span>&copy; {new Date().getFullYear()} Chaewon Lim</span>
      </div>

      <div className="mt-8 text-center text-sm">
        <span className="text-[var(--muted)]">Built with Next.js &amp;{" "}</span>
        <a
          href="https://www.heytea.com/products"
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-[#555555] transition-colors duration-200 hover:text-[var(--periwinkle)]"
        >
          heytea&apos;s crisp grape boom
        </a>
        <span aria-hidden="true"> 🍇</span>
      </div>

      <div className="mt-3 text-center text-xs text-[var(--muted)]">
        <a
          href="https://github.com/islachae/portfolio2026"
          target="_blank"
          rel="noopener noreferrer"
          className="transition-colors hover:text-[var(--fg)]"
        >
          CHANGELOG: 09-25-26
        </a>
      </div>
    </footer>
  );
}
