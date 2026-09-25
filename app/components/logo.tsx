import Link from "next/link";

// ── 採 logo ────────────────────────────────────────────────────────
// Circle links to /design-system. On hover, matches liumichelle.com's
// "blueprint" reveal: the icon fades to a flat gray silhouette while a
// thin rounded frame draws in around it — no scale-up. See the
// .logo-mark rules in globals.css.

export default function Logo() {
  return (
    <span className="inline-flex items-center gap-2 group">
      <Link
        href="/design-system"
        aria-label="View design system"
        className="logo-mark relative inline-flex h-8 w-8 items-center justify-center rounded-full"
        style={{
          backgroundColor: "#2b2b2b",
          border: "1px solid #000000",
        }}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 1 1"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="logo-mark__glyph text-white"
          aria-hidden="true"
        >
          <text
            x="0.5"
            y="0.78"
            textAnchor="middle"
            dominantBaseline="auto"
            fontSize="0.72"
            fontWeight="700"
            fontFamily="'PingFang SC', 'Noto Sans SC', 'Microsoft YaHei', system-ui, sans-serif"
            fill="currentColor"
          >
            採
          </text>
        </svg>
        {/* Gray silhouette, fades in on hover as the white glyph fades out */}
        <svg
          width="18"
          height="18"
          viewBox="0 0 1 1"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="logo-mark__ghost pointer-events-none absolute inset-0 m-auto text-zinc-400"
          aria-hidden="true"
        >
          <text
            x="0.5"
            y="0.78"
            textAnchor="middle"
            dominantBaseline="auto"
            fontSize="0.72"
            fontWeight="700"
            fontFamily="'PingFang SC', 'Noto Sans SC', 'Microsoft YaHei', system-ui, sans-serif"
            fill="currentColor"
          >
            採
          </text>
        </svg>
        {/* Frame that draws in around the mark on hover */}
        <svg
          className="logo-mark__frame pointer-events-none absolute -inset-1.5 text-zinc-400/70"
          viewBox="0 0 100 100"
          fill="none"
          aria-hidden="true"
        >
          <rect
            x="4"
            y="4"
            width="92"
            height="92"
            rx="20"
            ry="20"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>
      </Link>
      <Link
        href="/"
        className="text-sm font-medium tracking-tight hover:opacity-70"
        style={{ color: "#2b2b2b" }}
      >
        chaewon lim
      </Link>
    </span>
  );
}
