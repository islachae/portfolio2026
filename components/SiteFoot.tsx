"use client";

import { profile } from "@/content/site";
import { useShell } from "./shell-context";
import { useNow } from "./HomePage";
import { Monogram } from "./Monogram";
import { DocIcon } from "./icons";

/** Pittsburgh time (New York's zone), 12-hour: "1:37 AM". Made once: a new formatter every second is wasted work. */
let fmt: Intl.DateTimeFormat | null = null;
const pgh = (d: Date) =>
  (fmt ??= new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit", hour12: true, timeZone: "America/New_York" })).format(d);
let hourFmt: Intl.DateTimeFormat | null = null;
const pghHour = (d: Date) =>
  Number((hourFmt ??= new Intl.DateTimeFormat("en-US", { hour: "numeric", hourCycle: "h23", timeZone: "America/New_York" })).format(d));

/** A moon at night (7pm–6am in Pittsburgh), a sun in the day. */
function Sky({ night }: { night: boolean }) {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" aria-hidden className="sf-sky">
      {night ? (
        <path d="M13.2 10.4A5.6 5.6 0 0 1 5.6 2.8a5.6 5.6 0 1 0 7.6 7.6z" fill="currentColor" />
      ) : (
        <>
          <circle cx="8" cy="8" r="3" fill="currentColor" />
          <path d="M8 1.5v1.6M8 12.9v1.6M1.5 8h1.6M12.9 8h1.6M3.4 3.4l1.1 1.1M11.5 11.5l1.1 1.1M3.4 12.6l1.1-1.1M11.5 4.5l1.1-1.1" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </>
      )}
    </svg>
  );
}

function Time() {
  const now = useNow();
  const h = now ? pghHour(now) : 12;
  return (
    <span className="sf-when-time" suppressHydrationWarning>
      <Sky night={h >= 19 || h < 6} />
      <span className="sf-clock" suppressHydrationWarning>
        {now ? pgh(now) : "12:00 PM"}
      </span>
    </span>
  );
}

const LinkedInIcon = () => (
  <svg width="18" height="18" viewBox="0 0 16 16" aria-hidden>
    <rect x="1.5" y="1.5" width="13" height="13" rx="2" fill="none" stroke="currentColor" strokeWidth="1.4" />
    <path d="M4.9 6.9v4.4M4.9 4.7v.1M7.6 11.3V6.9m0 2c0-1.2.8-2 1.8-2s1.7.7 1.7 1.9v2.5" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
);

/** A link that moves inside the site without a page load; ⌘/Ctrl/middle click still open the address. */
const inApp = (run: () => void) => (e: React.MouseEvent) => {
  if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button) return;
  e.preventDefault();
  run();
};

/**
 * The footer at the end of every page: Home (where it is #hi), the case studies, About and the play pages.
 * Three columns, after Michelle Liu's: her mark and name with Pittsburgh's time; Work / Play / About;
 * “Let's chat!” with the address (a click copies it) and LinkedIn and the résumé as icons. Under them,
 * centred, the small print: what the site was built with, the keys for the surprise, the year and the last build.
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
          <p className="sf-when">
            <Time />
            <span>Pittsburgh, PA</span>
          </p>
        </div>
        <nav className="sf-nav" aria-label="Footer">
          <a href="/#work" onClick={inApp(() => goHome("work"))}>
            Work
          </a>
          <a href="/#play" onClick={inApp(() => goHome("play"))}>
            Play
          </a>
          <a href="/#about/story" onClick={inApp(() => openCase("about"))}>
            About
          </a>
        </nav>
        <div className="sf-chat">
          <p className="sf-chat-h">Let’s chat!</p>
          <button type="button" className="sf-mail" onClick={copyEmail} aria-label={`Copy email address: ${profile.email}`}>
            {profile.email}
          </button>
          <p className="sf-icons">
            <a href={profile.links.linkedin} target="_blank" rel="noreferrer" aria-label="LinkedIn" title="LinkedIn">
              <LinkedInIcon />
            </a>
            <a href={profile.links.resume} target="_blank" rel="noreferrer" aria-label="Resume (PDF)" title="Resume (PDF)">
              <DocIcon size={19} />
            </a>
          </p>
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
