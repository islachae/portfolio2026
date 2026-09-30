"use client";

import { about, type Page } from "@/content/site";

/** Tool names as small square chips (text only, no logos). */
export function ToolChips({ tools }: { tools: string[] }) {
  return (
    <ul className="tools" aria-label="Tool stack">
      {tools.map((t) => (
        <li key={t} className="tool">
          {t}
        </li>
      ))}
    </ul>
  );
}

/**
 * A work page's brief, always visible in its left column (no panel, no click):
 * Challenge and What I did, then Role / Timeline / Type and the tool stack.
 */
export function ProjectBrief({ page }: { page: Page }) {
  if (!page.challenge || !page.did) return null;
  return (
    <div className="brief">
      <dl className="brief-pair">
        <div>
          <dt>Challenge</dt>
          <dd>{page.challenge}</dd>
        </div>
        <div>
          <dt>{page.didLabel ?? "What I did"}</dt>
          <dd>{page.did}</dd>
        </div>
      </dl>
      <dl className="brief-facts">
        {page.facts.map((f) => (
          <div key={f.label}>
            <dt>{f.label}</dt>
            <dd>{f.value}</dd>
          </div>
        ))}
        {page.tools?.length ? (
          <div>
            <dt>Tool stack</dt>
            <dd>
              <ToolChips tools={page.tools} />
            </dd>
          </div>
        ) : null}
      </dl>
    </div>
  );
}

/**
 * The About page's brief: three lines in Chaewon's words and four facts. The rest (the full intro,
 * the art, the principles, off the clock) is one click away on the About page.
 */
export function AboutBrief({ page }: { page: Page }) {
  return (
    <div className="brief brief--about">
      <p className="brief-bio">{about.short}</p>
      <dl className="brief-facts">
        {page.facts.map((f) => (
          <div key={f.label}>
            <dt>{f.label}</dt>
            <dd>{f.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
