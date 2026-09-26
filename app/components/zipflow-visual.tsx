"use client";

// ── Zipflow home work-card visual ───────────────────────────────────────
// Single-source-of-truth flow: one listing → three branches
// (Showroom / AI marketing / Briefing). Native SVG, periwinkle #7c7fbf.

export function ZipflowHeroVisual() {
  return (
    <div className="flex aspect-[4/3] items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-[#f7f5fc] to-[#f3f1fa]">
      <svg
        viewBox="0 0 400 300"
        className="h-full w-full max-w-[340px]"
        aria-hidden="true"
      >
        {/* central listing card */}
        <rect
          x="150"
          y="50"
          width="100"
          height="70"
          rx="10"
          fill="#fff"
          stroke="#d8d4e8"
          strokeWidth="1.5"
        />
        <path
          d="M175 78 h50 M175 90 h38"
          stroke="#7c7fbf"
          strokeWidth="2.4"
          strokeLinecap="round"
        />
        <rect
          x="168"
          y="100"
          width="64"
          height="4"
          rx="2"
          fill="#c7c2da"
        />
        <rect
          x="168"
          y="108"
          width="44"
          height="4"
          rx="2"
          fill="#e2dee9"
        />

        {/* outgoing arrow */}
        <path
          d="M200 120 v30"
          stroke="#7c7fbf"
          strokeWidth="2"
          strokeDasharray="4 4"
          strokeLinecap="round"
        />
        <path
          d="M194 146 l6 6 -6 6"
          stroke="#7c7fbf"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* branch: Showroom */}
        <g transform="translate(40 200)">
          <rect
            x="0"
            y="0"
            width="90"
            height="60"
            rx="10"
            fill="#fff"
            stroke="#d8d4e8"
            strokeWidth="1.5"
          />
          <path
            d="M24 18 h36 l-8 14 h-20 z M28 24 h28 M28 32 h20"
            stroke="#7c7fbf"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <text
            x="45"
            y="52"
            textAnchor="middle"
            fontSize="9"
            fill="#7c7fbf"
            fontWeight="600"
            fontFamily="system-ui"
          >
            Showroom
          </text>
        </g>

        {/* branch: AI marketing */}
        <g transform="translate(155 200)">
          <rect
            x="0"
            y="0"
            width="90"
            height="60"
            rx="10"
            fill="#fff"
            stroke="#d8d4e8"
            strokeWidth="1.5"
          />
          <path
            d="M36 16 a10 10 0 0 1 14 0 M38 32 h14 M38 38 h14 M38 32 v6"
            stroke="#7c7fbf"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <text
            x="45"
            y="52"
            textAnchor="middle"
            fontSize="9"
            fill="#7c7fbf"
            fontWeight="600"
            fontFamily="system-ui"
          >
            AI marketing
          </text>
        </g>

        {/* branch: Briefing */}
        <g transform="translate(270 200)">
          <rect
            x="0"
            y="0"
            width="90"
            height="60"
            rx="10"
            fill="#fff"
            stroke="#d8d4e8"
            strokeWidth="1.5"
          />
          <path
            d="M32 16 h18 l4 4 -10 10 h-12 z M30 34 h22 M34 40 h16"
            stroke="#7c7fbf"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <text
            x="45"
            y="52"
            textAnchor="middle"
            fontSize="9"
            fill="#7c7fbf"
            fontWeight="600"
            fontFamily="system-ui"
          >
            Briefing
          </text>
        </g>

        {/* dotted connectors from center to each branch */}
        <path
          d="M188 152 q-22 26 -4 74"
          stroke="#c7c2da"
          strokeWidth="1.4"
          fill="none"
          strokeDasharray="3 4"
        />
        <path
          d="M200 152 v74"
          stroke="#c7c2da"
          strokeWidth="1.4"
          fill="none"
          strokeDasharray="3 4"
        />
        <path
          d="M212 152 q22 26 4 74"
          stroke="#c7c2da"
          strokeWidth="1.4"
          fill="none"
          strokeDasharray="3 4"
        />
      </svg>
    </div>
  );
}
