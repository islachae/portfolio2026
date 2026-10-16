"use client";

import { profile } from "@/content/site";
import { SIGNATURE } from "@/lib/signature";
import { useShell } from "./shell-context";
import { formatNY, useNow } from "./HomePage";

/** Pittsburgh time, as the site writes it everywhere else (New York's zone, 24-hour, with seconds). */
function Clock() {
  const now = useNow();
  return (
    <span className="sf-clock" suppressHydrationWarning>
      {now ? formatNY(now) : "00:00:00"}
    </span>
  );
}

/**
 * Her signature, “Curiously, Chaewon.”, the same strokes the loader writes (lib/signature.ts), in ink,
 * with the full stop in violet where she put hers.
 */
function Signature() {
  const S = SIGNATURE;
  return (
    <svg className="sf-sig" viewBox={`0 0 ${S.w} ${S.h}`} role="img" aria-label="Curiously, Chaewon.">
      <g fill="none" stroke="currentColor" strokeWidth={S.pen} strokeLinecap="round" strokeLinejoin="round">
        {S.strokes.map((st, i) => (
          <path key={i} d={st[0] as string} />
        ))}
      </g>
      <circle cx={S.stop[0]} cy={S.stop[1]} r={S.pen * 0.62} fill="var(--accent-1)" />
    </svg>
  );
}

/**
 * The footer at the end of every page: Home (where it is #hi), the case studies, About and the play pages.
 * The page signs off in her hand: the signature from the intro, with Pittsburgh's time under it in a
 * label; on the right, where the second column of cards starts, EMAIL (a click copies the address),
 * RESUME and LINKEDIN in the menu's own mono caps. Under them, one left-to-right row of small print:
 * what the site was built with, the keys for the surprise, the year and the last build.
 * No rules, no icons; violet only in the full stop and on hover. Phones stack it all.
 */
export function SiteFoot({ id }: { id?: string }) {
  const { copyEmail } = useShell();
  return (
    <footer className="sf" id={id}>
      <div className="sf-row">
        <div>
          <Signature />
          <p className="label sf-when">
            Pittsburgh, PA <span aria-hidden>·</span> <Clock />
          </p>
        </div>
        <nav className="sf-links" aria-label="Contact">
          <button type="button" className="sn-link" onClick={copyEmail} aria-label={`Copy email address: ${profile.email}`}>
            Email
          </button>
          <a className="sn-link" href={profile.links.resume} target="_blank" rel="noreferrer">
            Resume
          </a>
          <a className="sn-link" href={profile.links.linkedin} target="_blank" rel="noreferrer">
            LinkedIn
          </a>
        </nav>
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
