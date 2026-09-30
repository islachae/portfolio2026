import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Monogram } from "@/components/Monogram";
import { bootCss, cssScript, introScript } from "@/lib/boot";
import { SIGNATURE } from "@/lib/signature";

// Geist for UI and reading, Satoshi for headlines, Geist Mono for small labels.
const sans = localFont({
  src: "./fonts/Geist.woff2",
  variable: "--font-sans",
  weight: "100 900",
  display: "swap",
});

// Satoshi (Indian Type Foundry, Fontshare free license) for display and headings.
const display = localFont({
  src: [
    { path: "./fonts/Satoshi-Regular.woff2", style: "normal", weight: "400" },
    { path: "./fonts/Satoshi-Italic.woff2", style: "italic", weight: "400" },
    { path: "./fonts/Satoshi-Medium.woff2", style: "normal", weight: "500" },
    { path: "./fonts/Satoshi-MediumItalic.woff2", style: "italic", weight: "500" },
    { path: "./fonts/Satoshi-Bold.woff2", style: "normal", weight: "700" },
  ],
  variable: "--font-satoshi",
  display: "swap",
});

// Barlow + Barlow Semi Condensed (SIL OFL): the Pebbo app's typefaces, used only inside the
// “Try Pebbo” phone, so they are not preloaded.
const barlow = localFont({
  src: [
    { path: "./fonts/Barlow-Regular.woff2", weight: "400" },
    { path: "./fonts/Barlow-Medium.woff2", weight: "500" },
    { path: "./fonts/Barlow-SemiBold.woff2", weight: "600" },
  ],
  variable: "--font-barlow",
  display: "swap",
  preload: false,
});
const barlowSC = localFont({
  src: "./fonts/BarlowSemiCondensed-Bold.woff2",
  weight: "700",
  variable: "--font-barlow-sc",
  display: "swap",
  preload: false,
});

const mono = localFont({
  src: "./fonts/GeistMono.woff2",
  variable: "--font-mono",
  weight: "100 900",
  display: "swap",
});

export const metadata: Metadata = {
  // The live address, so share previews (Open Graph) resolve to chaewon.works
  metadataBase: new URL("https://chaewon.works"),
  title: "Chaewon Lim · Product Designer",
  description:
    "Product designer at Carnegie Mellon (MDes), designing AI that takes the repetitive work and leaves the judgment to people. Open to Summer 2027 internships in New York.",
  openGraph: {
    title: "Chaewon Lim · Product Designer",
    description: "Designing AI that people can trust. Open to Summer 2027 internships in NYC.",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FAFCFD" },
    { media: "(prefers-color-scheme: dark)", color: "#0E0F11" },
  ],
};

// Runs in <head> before anything paints (the stylesheet can take seconds on a slow phone):
// 1. saved theme/motion, so there's no flash;
// 2. a link straight to a case study or the About page: hide the deck and draw that page's outline;
// 3. the first visit to Home in a session: the monogram loader (only if the page isn't ready in 0.3s).
const bootScript = `(function(){var d=document.documentElement,W=window,h=location.hash;
try{var s=JSON.parse(localStorage.getItem("cw-settings")||"{}");if(s.theme==="light"||s.theme==="dark")d.dataset.theme=s.theme;if(s.motion==="reduced")d.dataset.motion="reduced";}catch(e){}
if(/^#case\\//.test(h)||/^#about\\/story$/.test(h))d.dataset.booting="case";
try{${cssScript}}catch(e){d.removeAttribute("data-cssw");var q=document.querySelectorAll("link[data-cw-css]");for(var j=0;j<q.length;j++)q[j].media="all"}
try{${introScript}}catch(e){d.removeAttribute("data-boot")}
})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${sans.variable} ${display.variable} ${mono.variable} ${barlow.variable} ${barlowSC.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: bootScript }} />
        {/* Inline, so the loader and the outline can paint before the stylesheet arrives */}
        <style dangerouslySetInnerHTML={{ __html: bootCss }} />
      </head>
      <body>
        {/* The monogram loader: first visit to Home, only when the page is slow (lib/boot.ts) */}
        <div id="cw-boot" aria-hidden="true">
          {/* The backdrop is its own layer so it can fade with opacity (compositor-only) */}
          <i className="cwb-bg" />
          <div className="cwb-mark">
            {/* The ring: a grey track, and two half-arcs that turn in behind a right and a left
                half-window as the page gets ready (transforms only; lib/boot.ts ring()) */}
            <span className="cwb-ring">
              <svg viewBox="0 0 120 120">
                <circle className="cwb-track" cx="60" cy="60" r="58" />
              </svg>
              <span className="cwb-half cwb-half--r">
                <svg className="cwb-arc" viewBox="0 0 120 120">
                  <path d="M60 118A58 58 0 0 1 60 2" />
                </svg>
              </span>
              <span className="cwb-half cwb-half--l">
                <svg className="cwb-arc" viewBox="0 0 120 120">
                  <path d="M60 2A58 58 0 0 1 60 118" />
                </svg>
              </span>
            </span>
            <Monogram size={64} className="cwb-mono" />
          </div>
          {/* “curiously, chaewon”, signed: a window slides open over it (and the ink slides the
              other way, so it stays put); the violet full stop lands when the page is ready */}
          <div className="cwb-sig">
            <span className="cwb-win">
              <span className="cwb-ink">
                <svg viewBox={`0 0 ${SIGNATURE.w} ${SIGNATURE.h}`}>
                  <g transform={SIGNATURE.transform} fill="currentColor">
                    <path d={SIGNATURE.d} />
                  </g>
                </svg>
              </span>
            </span>
            <i className="cwb-dot" />
          </div>
        </div>
        {/* A case study or About opened from a link: the page's outline until it's ready */}
        <div id="cw-skel" aria-hidden="true">
          <div className="cws-bar">
            <span className="cws-back">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m15 18-6-6 6-6" />
              </svg>
              Back
            </span>
            <span className="cws-links">
              <span className="cws-box">ABOUT</span>
              <span>RESUME ↗</span>
              <span className="cws-li">LINKEDIN ↗</span>
            </span>
          </div>
          <div className="cws-toc">
            <i /><i /><i /><i /><i /><i /><i />
          </div>
          <div className="cws-col">
            <i className="cws-e" />
            <i className="cws-h1" />
            <i className="cws-h1 cws-h1b" />
            <i className="cws-sub" />
            <span className="cws-meta">
              <i /><i /><i />
            </span>
            <i className="cws-fig" />
          </div>
        </div>
        {children}
      </body>
    </html>
  );
}
