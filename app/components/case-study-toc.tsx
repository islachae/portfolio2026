"use client";

import { useEffect, useRef, useState } from "react";

interface Section {
  id: string;
  label: string;
}

export default function CaseStudyToc({ sections }: { sections: Section[] }) {
  const [activeId, setActiveId] = useState(sections[0]?.id ?? "");
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const headings = sections
      .map((s) => document.getElementById(s.id))
      .filter((el): el is HTMLElement => el !== null);

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: "-15% 0px -70% 0px", threshold: 0 }
    );

    headings.forEach((el) => observerRef.current?.observe(el));
    return () => observerRef.current?.disconnect();
  }, [sections]);

  return (
    <nav
      aria-label="Case study sections"
      className="hidden lg:sticky lg:top-28 lg:block lg:h-fit lg:w-48 lg:shrink-0"
    >
      <ul className="flex flex-col gap-3 border-l border-solid border-[var(--border)] pl-4">
        {sections.map((s) => (
          <li key={s.id}>
            <a
              href={`#${s.id}`}
              className={`block text-sm transition-colors ${
                activeId === s.id
                  ? "font-medium text-[var(--fg)]"
                  : "text-[var(--muted)] hover:text-[var(--fg)]"
              }`}
            >
              {s.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
