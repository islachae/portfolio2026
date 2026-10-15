"use client";

import { profile } from "@/content/site";
import { useShell } from "./shell-context";
import { formatNY, useNow } from "./HomePage";
import { Monogram } from "./Monogram";
import { ExtArrow } from "./icons";

/** Pittsburgh time, as the site writes it everywhere else (New York's zone, 24-hour, with seconds). */
function Clock() {
  const now = useNow();
  return (
    <span className="sf-clock" suppressHydrationWarning>
      {now ? formatNY(now) : "00:00:00"}
    </span>
  );
}

/** A link that moves inside the site without a page load; ⌘/Ctrl/middle click still open the address. */
const inApp = (run: () => void) => (e: React.MouseEvent) => {
  if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button) return;
  e.preventDefault();
  run();
};

/**
 * The footer at the end of every page: Home (where it is #hi), the case studies, About and the play pages.
 * Three columns, after Michelle Liu's, in the site's own voice: her mark and name (the page-title voice)
 * with Pittsburgh's time in a label; the same four places as the menu at the top, in its mono caps;
 * “Say hi” as a label over the address (a click copies it) and LinkedIn. The places start where the
 * second column of cards does. Under them, left-aligned like everything else, the small print: what the
 * site was built with, the keys for the surprise, the year and the last build.
 * On a phone the three stack, and the places sit in one row.
 */
export function SiteFoot({ id }: { id?: string }) {
  const { copyEmail, goHome, openCase } = useShell();
  return (
    <footer className="sf" id={id}>
      <div className="sf-cols">
        <div className="sf-who">
          <p className="sf-name">
            <Monogram size={30} tile />
            {profile.name}
          </p>
          <p className="label sf-when">
            Pittsburgh, PA <span aria-hidden>·</span> <Clock />
          </p>
        </div>
        <nav className="sf-nav" aria-label="Footer">
          <a className="sn-link" href="/#work" onClick={inApp(() => goHome("work"))}>
            Work
          </a>
          <a className="sn-link" href="/#play" onClick={inApp(() => goHome("play"))}>
            Play
          </a>
          <a className="sn-link" href="/#about/story" onClick={inApp(() => openCase("about"))}>
            About
          </a>
          <a className="sn-link" href={profile.links.resume} target="_blank" rel="noreferrer">
            Resume
            <ExtArrow />
          </a>
        </nav>
        <div className="sf-chat">
          <p className="label">Say hi</p>
          <button type="button" className="sf-mail" onClick={copyEmail} aria-label={`Copy email address: ${profile.email}`}>
            {profile.email}
            <span className="label sf-copy" aria-hidden>
              Copy
            </span>
          </button>
          <a className="sn-link" href={profile.links.linkedin} target="_blank" rel="noreferrer">
            LinkedIn
            <ExtArrow />
          </a>
        </div>
      </div>
      <div className="sf-fine">
        <p>
          Built with Next.js &amp;{" "}
          <a href="https://www.heytea.com/products" target="_blank" rel="noreferrer">
            heytea’s crisp grape boom
          </a>{" "}
          <span aria-hidden>🍇</span>
        </p>
        {/* the keys start ChaeLLM's run (components/Site.tsx); no keys on a touch screen, so no line */}
        <p className="sf-keys">
          Press <kbd>P</kbd> and <kbd>Space</kbd> for a surprise
        </p>
        {/* the day the site was last built (next.config.ts) */}
        <p suppressHydrationWarning>
          © {new Date().getFullYear()} {profile.name} · Last updated {process.env.LAST_UPDATED}
        </p>
      </div>
    </footer>
  );
}
