"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { pages, profile, type Page } from "@/content/site";
import { useShell } from "./shell-context";
import { Chevron, CloseIcon, PageIcon, PanelIcon, SearchIcon, SlidersIcon } from "./icons";

const groups: { key: Page["group"]; label: string }[] = [
  { key: "work", label: "Selected work" },
  { key: "progress", label: "In progress" },
  { key: "fun", label: "For fun" },
  { key: "more", label: "More" },
];

export function Sidebar({ open, onHide }: { open: boolean; onHide: () => void }) {
  const { current, goTo, navOpen, setNavOpen, setPaletteOpen } = useShell();
  const [mac, setMac] = useState(true);
  useEffect(() => setMac(/Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent)), []);

  return (
    <>
      <AnimatePresence>
        {navOpen && (
          <motion.div
            className="scrim scrim--nav"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setNavOpen(false)}
          />
        )}
      </AnimatePresence>
      <nav className={`sidebar${navOpen ? " is-open" : ""}`} data-collapsed={!open || undefined} aria-label="Portfolio" inert={!open && !navOpen ? true : undefined}>
        <div className="sidebar-inner">
          <div className="sidebar-scroll">
            <div className="sidebar-top">
              <NavItem page={pages[0]} active={current === "home"} onClick={() => goTo("home")} />
              <button className="icon-btn sidebar-hide" onClick={onHide} aria-label="Hide sidebar" title="Hide sidebar">
                <PanelIcon side="left" open />
              </button>
              <button className="icon-btn sidebar-close" onClick={() => setNavOpen(false)} aria-label="Close menu">
                <CloseIcon />
              </button>
            </div>
            <button className="nav-item nav-search" onClick={() => setPaletteOpen(true)}>
              <SearchIcon size={16} className="nav-search-icon" />
              <span className="nav-label">Search</span>
              <kbd className="kbd kbd--sm" suppressHydrationWarning>
                {mac ? "⌘K" : "Ctrl K"}
              </kbd>
            </button>

            {groups.map((g) => (
              <NavGroup key={g.key} label={g.label}>
                {pages
                  .filter((p) => p.group === g.key)
                  .map((p) => (
                    <NavItem key={p.id} page={p} active={current === p.id} onClick={() => goTo(p.id)} />
                  ))}
              </NavGroup>
            ))}
          </div>
          <ProfileFooter />
        </div>
      </nav>
    </>
  );
}

function NavItem({ page, active, onClick }: { page: Page; active: boolean; onClick: () => void }) {
  return (
    <button
      className="nav-item"
      data-page={page.id}
      data-active={active || undefined}
      aria-current={active ? "page" : undefined}
      onClick={onClick}
    >
      {active && <motion.span layoutId="nav-pill" className="nav-pill" transition={{ type: "spring", stiffness: 520, damping: 42 }} />}
      <PageIcon id={page.id} className="nav-icon" />
      <span className="nav-label">{page.title}</span>
      {/* Years only for selected work; "In progress" and "For fun" say enough with their headings */}
      {page.group === "work" && page.year && <span className="nav-year">{page.year}</span>}
    </button>
  );
}

function NavGroup({ label, children }: { label: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="nav-group">
      <button className="nav-group-label" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        {label}
        <Chevron size={14} className="nav-group-chev" />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            className="nav-group-items"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.3, 0.7, 0.2, 1] }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ProfileFooter() {
  const { goTo } = useShell();
  return (
    <div className="profile">
      {/* Name → About; Resume and LinkedIn sit under it instead of taking two rows in the list */}
      <div className="profile-me">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/about/avatar.webp" alt="" className="avatar" onClick={() => goTo("about")} />
        <span className="profile-text">
          <button className="profile-name" onClick={() => goTo("about")}>
            {profile.name}
          </button>
          <span className="profile-links">
            <a href={profile.links.resume} target="_blank" rel="noreferrer">
              Resume<span aria-hidden> ↗</span>
            </a>
            <a href={profile.links.linkedin} target="_blank" rel="noreferrer">
              LinkedIn<span aria-hidden> ↗</span>
            </a>
          </span>
        </span>
      </div>
      <DisplaySettings />
    </div>
  );
}

/** Appearance and motion, behind one small button. The popover opens above its nearest positioned parent. */
export function DisplaySettings() {
  const { settings, setSettings } = useShell();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);
  const closeTimer = useRef<number | undefined>(undefined);
  const chosen = useRef(false);
  // After a choice the panel lets go on its own, unhurried: 1.4s after the last pick or pointer
  // move inside it (so you can still change the other setting), or soon after the pointer leaves.
  // It fades out slowly. Keyboard users land back on the settings button.
  const closeIn = (ms: number) => {
    window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => {
      const a = document.activeElement;
      const byKeyboard = !!a?.closest(".settings") && a.matches(":focus-visible");
      chosen.current = false;
      setOpen(false);
      if (byKeyboard) toggle.current?.focus();
    }, ms);
  };
  const choose = (patch: Parameters<typeof setSettings>[0]) => {
    setSettings(patch);
    chosen.current = true;
    closeIn(1400);
  };
  useEffect(() => () => window.clearTimeout(closeTimer.current), []);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      const box = ref.current?.parentElement;
      if (box && !box.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      <span ref={ref} hidden />
      <button
        ref={toggle}
        className="icon-btn"
        aria-label="Display settings"
        aria-expanded={open}
        data-pressed={open || undefined}
        onClick={() => {
          window.clearTimeout(closeTimer.current);
          chosen.current = false;
          setOpen((o) => !o);
        }}
      >
        <SlidersIcon />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="popover settings"
            role="dialog"
            aria-label="Display settings"
            initial={{ opacity: 0, y: 6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 3, scale: 0.99, transition: { duration: 0.32, ease: [0.4, 0, 0.2, 1] } }}
            transition={{ duration: 0.16 }}
            onPointerMove={() => chosen.current && closeIn(1400)}
            onPointerLeave={() => chosen.current && closeIn(500)}
          >
            <Segmented
              label="Appearance"
              value={settings.theme}
              options={[
                { value: "system", label: "Auto" },
                { value: "light", label: "Light" },
                { value: "dark", label: "Dark" },
              ]}
              onChange={(v) => choose({ theme: v as typeof settings.theme })}
            />
            <Segmented
              label="Motion"
              value={settings.motion}
              options={[
                { value: "system", label: "Full" },
                { value: "reduced", label: "Reduced" },
              ]}
              onChange={(v) => choose({ motion: v as typeof settings.motion })}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function Segmented({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}) {
  return (
    <div className="seg-row">
      <span className="seg-label">{label}</span>
      <div className="seg" role="radiogroup" aria-label={label}>
        {options.map((o) => (
          <button key={o.value} role="radio" aria-checked={value === o.value} className="seg-opt" onClick={() => onChange(o.value)}>
            {value === o.value && <motion.span layoutId={`seg-${label}`} className="seg-pill" transition={{ type: "spring", stiffness: 600, damping: 42 }} />}
            <span className="seg-text">{o.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
