import { useId } from "react";
import type { PageId } from "@/content/site";

type P = { size?: number; className?: string };

const stroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export const SearchIcon = ({ size = 18, className }: P) => (
  <svg width={size} height={size} viewBox="0 0 20 20" className={className} aria-hidden>
    <circle cx="9" cy="9" r="5.75" {...stroke} />
    <path d="M13.2 13.2 16.5 16.5" {...stroke} />
  </svg>
);

export const ArrowUpRight = ({ size = 16, className }: P) => (
  <svg width={size} height={size} viewBox="0 0 16 16" className={className} aria-hidden>
    <path d="M5.5 10.5 10.5 5.5M6 5.5h4.5V10" {...stroke} />
  </svg>
);

/** The ↗ after a link that leaves the site. Drawn, not typed: Geist and Geist Mono have no ↗, so
 *  the character came from whatever system font had one and sat small and thin beside the label.
 *  Sized in em (globals.css: .ext-arrow), so it scales with the text like a glyph would. */
export const ExtArrow = () => (
  <svg className="ext-arrow" viewBox="0 0 10 10" aria-hidden>
    <path d="M1.75 8.25 8.25 1.75M3 1.75h5.25V7" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const Chevron = ({ size = 16, className }: P) => (
  <svg width={size} height={size} viewBox="0 0 16 16" className={className} aria-hidden>
    <path d="M4.5 6.5 8 10l3.5-3.5" {...stroke} />
  </svg>
);

export const CloseIcon = ({ size = 16, className }: P) => (
  <svg width={size} height={size} viewBox="0 0 16 16" className={className} aria-hidden>
    <path d="M4.5 4.5l7 7M11.5 4.5l-7 7" {...stroke} />
  </svg>
);

export const MenuIcon = ({ size = 18, className }: P) => (
  <svg width={size} height={size} viewBox="0 0 20 20" className={className} aria-hidden>
    <path d="M3.5 7h13M3.5 13h13" {...stroke} />
  </svg>
);

export const SlidersIcon = ({ size = 16, className }: P) => (
  <svg width={size} height={size} viewBox="0 0 16 16" className={className} aria-hidden>
    <path d="M2.5 5h6M11.5 5h2M2.5 11h2M7.5 11h6" {...stroke} />
    <circle cx="10" cy="5" r="1.5" {...stroke} />
    <circle cx="6" cy="11" r="1.5" {...stroke} />
  </svg>
);

export const MailIcon = ({ size = 16, className }: P) => (
  <svg width={size} height={size} viewBox="0 0 16 16" className={className} aria-hidden>
    <rect x="2" y="3.5" width="12" height="9" rx="2" {...stroke} />
    <path d="m2.8 4.6 5.2 4 5.2-4" {...stroke} />
  </svg>
);

export const CheckIcon = ({ size = 16, className }: P) => (
  <svg width={size} height={size} viewBox="0 0 16 16" className={className} aria-hidden>
    <path d="m3.5 8.5 3 3 6-7" {...stroke} />
  </svg>
);

export const DocIcon = ({ size = 16, className }: P) => (
  <svg width={size} height={size} viewBox="0 0 16 16" className={className} aria-hidden>
    <path d="M4 2.5h5l3 3v8H4z" {...stroke} />
    <path d="M9 2.5v3h3M6 9h4M6 11.5h3" {...stroke} />
  </svg>
);

export const LensIcon = ({ size = 16, className }: P) => (
  <svg width={size} height={size} viewBox="0 0 16 16" className={className} aria-hidden>
    <circle cx="8" cy="8" r="5.5" {...stroke} />
    <circle cx="8" cy="8" r="2" {...stroke} />
  </svg>
);

export const HomeIcon = ({ size = 16, className }: P) => (
  <svg width={size} height={size} viewBox="0 0 16 16" className={className} aria-hidden>
    <path d="M2.8 7.2 8 3l5.2 4.2V13H2.8z" {...stroke} />
  </svg>
);

export const SunIcon = ({ size = 16, className }: P) => (
  <svg width={size} height={size} viewBox="0 0 16 16" className={className} aria-hidden>
    <circle cx="8" cy="8" r="2.8" {...stroke} />
    <path d="M8 1.8v1.4M8 12.8v1.4M1.8 8h1.4M12.8 8h1.4M3.6 3.6l1 1M11.4 11.4l1 1M3.6 12.4l1-1M11.4 4.6l1-1" {...stroke} />
  </svg>
);

/** The handoff sparkle: marks what AI takes on. */
export const Sparkle = ({ size = 12, className }: P) => (
  <svg width={size} height={size} viewBox="0 0 12 12" className={className} aria-hidden>
    <path d="M6 .8c.35 2.6 1.1 3.9 4.6 5.2C7.1 7.3 6.35 8.6 6 11.2 5.65 8.6 4.9 7.3 1.4 6 4.9 4.7 5.65 3.4 6 .8Z" fill="currentColor" />
  </svg>
);

/**
 * Personal mark: two overlapping circles.
 * One solid (the person), one outlined (the machine), sharing the middle.
 */
export const Logo = ({ size = 20, className }: P) => (
  <svg width={size} height={size} viewBox="0 0 20 20" className={className} aria-hidden>
    <rect width="20" height="20" rx="5.5" fill="var(--logo-bg)" />
    <circle className="pi-l1" cx="8.1" cy="10" r="3.6" fill="var(--logo-fg)" />
    <circle className="pi-l2" cx="11.9" cy="10" r="3.6" fill="none" stroke="var(--logo-fg)" strokeWidth="1.5" />
  </svg>
);

/** Sidebar toggle. The inner panel slides with the sidebar; a dot appears when something new is tucked away. */
export const PanelIcon = ({ size = 16, className, side = "left", open = true, dot = false }: P & { side?: "left" | "right"; open?: boolean; dot?: boolean }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" className={`panel-icon${open ? " is-open" : ""}${className ? " " + className : ""}`} data-side={side} aria-hidden>
    <rect x="2" y="2.75" width="12" height="10.5" rx="2.4" {...stroke} />
    <rect className="panel-icon-bar" x={side === "left" ? 3.6 : 9.4} y="4.35" width="3" height="7.3" rx="1" fill="currentColor" />
    <circle className="panel-icon-dot" cx={side === "left" ? 13.6 : 2.4} cy="3.1" r="2.1" fill="var(--brand)" stroke="var(--ground)" strokeWidth="1.2" opacity={dot ? 1 : 0} />
  </svg>
);

export const EyeIcon = ({ size = 16, className, off = false }: P & { off?: boolean }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" className={className} aria-hidden>
    <path d="M1.8 8S4.2 3.8 8 3.8 14.2 8 14.2 8 11.8 12.2 8 12.2 1.8 8 1.8 8Z" {...stroke} />
    <circle cx="8" cy="8" r="2" {...stroke} />
    {off && <path d="M2.5 2.5l11 11" {...stroke} />}
  </svg>
);

export const ReplayIcon = ({ size = 16, className }: P) => (
  <svg width={size} height={size} viewBox="0 0 16 16" className={className} aria-hidden>
    <path d="M3.2 8a4.8 4.8 0 1 0 1.5-3.5M3 2.8v2.6h2.6" {...stroke} />
  </svg>
);

export const InfoIcon = ({ size = 16, className }: P) => (
  <svg width={size} height={size} viewBox="0 0 16 16" className={className} aria-hidden>
    <circle cx="8" cy="8" r="5.8" {...stroke} />
    <path d="M8 7.2v3.6M8 5.2v.1" {...stroke} />
  </svg>
);

export const ArrowDown = ({ size = 16, className }: P) => (
  <svg width={size} height={size} viewBox="0 0 16 16" className={className} aria-hidden>
    <path d="M8 3v10M4 9l4 4 4-4" {...stroke} />
  </svg>
);

export const ArrowRight = ({ size = 16, className }: P) => (
  <svg width={size} height={size} viewBox="0 0 16 16" className={className} aria-hidden>
    <path d="M3 8h10M9 4l4 4-4 4" {...stroke} />
  </svg>
);

export const ChevronLeft = ({ size = 16, className }: P) => (
  <svg width={size} height={size} viewBox="0 0 16 16" className={className} aria-hidden>
    <path d="M10 3.5 5.5 8l4.5 4.5" {...stroke} />
  </svg>
);

export const ChevronRight = ({ size = 16, className }: P) => (
  <svg width={size} height={size} viewBox="0 0 16 16" className={className} aria-hidden>
    <path d="M6 3.5 10.5 8 6 12.5" {...stroke} />
  </svg>
);

/** App-icon style marks. Rounded squares, like the apps these projects would be. */
export function PageIcon({ id, size = 20, className }: { id: PageId } & P) {
  const r = 5.5;
  // Unique per instance: a gradient defined inside a hidden copy would otherwise break the visible one.
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const g = (name: string) => `${name}-${uid}`;
  const common = { width: size, height: size, viewBox: "0 0 20 20", className, "aria-hidden": true } as const;
  switch (id) {
    case "home":
      return <Logo size={size} className={className} />;
    case "tipping":
      return (
        <svg {...common}>
          <defs>
            <linearGradient id={g("tip")} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#FF9A5C" />
              <stop offset="1" stopColor="#F2560F" />
            </linearGradient>
          </defs>
          <rect width="20" height="20" rx={r} fill={`url(#${g("tip")})`} />
          <g className="pi-coin">
            <circle cx="9.2" cy="11" r="4.4" fill="none" stroke="#fff" strokeWidth="1.6" />
            <path d="M9.2 8.9v4.2" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" />
          </g>
          <path className="pi-spark" d="M15 3.2c.18 1.3.55 1.95 2.3 2.6-1.75.65-2.12 1.3-2.3 2.6-.18-1.3-.55-1.95-2.3-2.6 1.75-.65 2.12-1.3 2.3-2.6Z" fill="#fff" />
        </svg>
      );
    case "zipflow":
      return (
        <svg {...common}>
          <defs>
            <linearGradient id={g("zip")} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#6C82FF" />
              <stop offset="1" stopColor="#2D3FD3" />
            </linearGradient>
          </defs>
          <rect width="20" height="20" rx={r} fill={`url(#${g("zip")})`} />
          <circle cx="5.6" cy="10" r="1.9" fill="#fff" />
          <path className="pi-flow" d="M7.4 10h2.3c1.6 0 1.8-4.2 3.6-4.2M9.7 10h3.6M9.7 10c1.6 0 1.8 4.2 3.6 4.2" fill="none" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" />
          <circle className="pi-node pi-node1" cx="14.6" cy="5.8" r="1.3" fill="#fff" />
          <circle className="pi-node pi-node2" cx="14.6" cy="10" r="1.3" fill="#fff" />
          <circle className="pi-node pi-node3" cx="14.6" cy="14.2" r="1.3" fill="#fff" />
        </svg>
      );
    case "pebbo":
      return (
        <svg {...common}>
          <defs>
            <radialGradient id={g("peb")} cx="0.5" cy="0.45" r="0.7">
              <stop offset="0" stopColor="#FFE2B0" />
              <stop offset="0.6" stopColor="#FFB870" />
              <stop offset="1" stopColor="#F58C4B" />
            </radialGradient>
          </defs>
          <rect width="20" height="20" rx={r} fill={`url(#${g("peb")})`} />
          <g className="pi-eyes">
            <circle cx="7.6" cy="8.6" r="1" fill="#4A2A14" />
            <circle cx="12.4" cy="8.6" r="1" fill="#4A2A14" />
          </g>
          <path className="pi-smile" d="M6.6 11.6c1.8 2 5 2 6.8 0" fill="none" stroke="#4A2A14" strokeWidth="1.3" strokeLinecap="round" />
        </svg>
      );
    case "melon":
      return (
        <svg {...common}>
          <defs>
            <linearGradient id={g("mel")} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#D9F2B4" />
              <stop offset="1" stopColor="#8FCB6B" />
            </linearGradient>
          </defs>
          <rect width="20" height="20" rx={r} fill={`url(#${g("mel")})`} />
          {/* a melon slice: rind, flesh, seeds */}
          <g className="pi-slice">
            <path d="M3.6 8.2h12.8a6.4 6.4 0 0 1-12.8 0Z" fill="#3E8E3A" />
            <path d="M5 8.2h10a5 5 0 0 1-10 0Z" fill="#F4FFE0" />
            <path d="M6.2 8.2h7.6a3.8 3.8 0 0 1-7.6 0Z" fill="#C9EE9A" />
            <circle className="pi-seed" cx="8.3" cy="10" r=".55" fill="#3E8E3A" />
            <circle className="pi-seed" cx="10" cy="10.9" r=".55" fill="#3E8E3A" />
            <circle className="pi-seed" cx="11.7" cy="10" r=".55" fill="#3E8E3A" />
          </g>
        </svg>
      );
    case "wish":
      return (
        <svg {...common}>
          <defs>
            <linearGradient id={g("wish")} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#3D2B63" />
              <stop offset="1" stopColor="#1A1230" />
            </linearGradient>
          </defs>
          <rect width="20" height="20" rx={r} fill={`url(#${g("wish")})`} />
          <path d="M10 17.2v-5.2" stroke="#B89A7A" strokeWidth="1.6" strokeLinecap="round" />
          <circle cx="10" cy="8.4" r="4.8" fill="#4A6B3A" opacity=".85" />
          {[[7.6, 7.2, "#FF9FD1"], [10.4, 6, "#8FE3FF"], [12.4, 8.6, "#FFE27A"], [8.8, 10, "#B6FFA8"], [11, 10.4, "#C9A8FF"]].map(([x, y, c], i) => (
            <rect key={i} className="pi-light" style={{ animationDelay: `${i * 0.12}s` }} x={Number(x) - 0.45} y={Number(y) - 1.3} width=".9" height="2.6" rx=".45" fill={String(c)} />
          ))}
        </svg>
      );
    case "cocktail":
      return (
        <svg {...common}>
          <rect width="20" height="20" rx={r} fill="#F3EEE5" />
          {/* a martini glass with a lime drink and the eye olive */}
          <path d="M4.2 6.2h11.6L10 12.2z" fill="#CFE79A" />
          <path d="M4.2 6.2h11.6L10 12.2zM10 12.2v3.6M7.4 16h5.2" stroke="#151412" strokeWidth="1" strokeLinejoin="round" strokeLinecap="round" fill="none" />
          <g className="pi-olive">
            <path d="M10.6 8.6 14.6 3.4" stroke="#151412" strokeWidth=".9" strokeLinecap="round" />
            <circle cx="13.3" cy="5.1" r="1.75" fill="#8AA635" />
            <circle cx="13.45" cy="5.05" r=".95" fill="#FBF6E6" />
            <circle className="pi-pupil" cx="13.55" cy="5.05" r=".5" fill="#151412" />
          </g>
        </svg>
      );
    case "bakery":
      return (
        <svg {...common}>
          <defs>
            <linearGradient id={g("bake")} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#FFE9CF" />
              <stop offset="1" stopColor="#F6BE82" />
            </linearGradient>
          </defs>
          <rect width="20" height="20" rx={r} fill={`url(#${g("bake")})`} />
          {/* a cake slice with a raspberry on top */}
          <path d="M4.5 13.8V10l10.5-3v6.8z" fill="#fff" />
          <path d="M4.5 10 15 7l-2.2-1.4L4.5 8.3z" fill="#F7D9E3" />
          <path d="M4.5 11.9 15 9.6" stroke="#E0567A" strokeWidth="1.2" />
          <circle className="pi-berry" cx="11.6" cy="5.6" r="1.5" fill="#E0356A" />
        </svg>
      );
    case "lab":
      return (
        <svg {...common}>
          <rect width="20" height="20" rx={r} fill="#23252E" />
          <rect x="4" y="7.2" width="12" height="5.6" rx="2.8" fill="#6F72C8" />
          <circle className="pi-knob" cx="13.2" cy="10" r="2.1" fill="#fff" />
          <path className="pi-rays" d="M6.2 4.2l.4 1M9.4 3.6v1.1M12.6 4.2l-.4 1" stroke="#C9CBF2" strokeWidth="1" strokeLinecap="round" />
        </svg>
      );
    case "about":
      return (
        <span className="icon-photo" style={{ width: size, height: size }} aria-hidden>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/about/avatar.webp" alt="" />
        </span>
      );
    case "hi":
      return (
        <svg {...common}>
          <rect width="20" height="20" rx={r} fill="#EEEEFA" />
          <g className="pi-bubble">
            <path d="M5 6.8c0-.9.7-1.6 1.6-1.6h6.8c.9 0 1.6.7 1.6 1.6v4.6c0 .9-.7 1.6-1.6 1.6H9.2L6.6 15v-2H6.6c-.9 0-1.6-.7-1.6-1.6z" fill="#6F72C8" />
            <path d="M7.8 9.3h4.4" stroke="#fff" strokeWidth="1.3" strokeLinecap="round" />
          </g>
        </svg>
      );
  }
}
