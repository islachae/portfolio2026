import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import "./home.css";
import { Monogram } from "@/components/Monogram";
import { bootCss, cssScript, introScript } from "@/lib/boot";

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

// Caveat (SIL OFL): the handwritten notes in Word Cocktail only, so it isn't preloaded.
const hand = localFont({
  src: [
    { path: "./fonts/Caveat-Medium.woff2", weight: "500" },
    { path: "./fonts/Caveat-Bold.woff2", weight: "700" },
  ],
  variable: "--font-hand",
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
  // the browser tab says just her name (share previews keep the longer title, below)
  title: "Chaewon Lim",
  description:
    "Product designer at Carnegie Mellon (MDes), designing AI that takes the repetitive work and leaves the judgment to people. Open to Summer 2027 internships.",
  openGraph: {
    title: "Chaewon Lim · Product Designer",
    description: "Designing AI that people can trust. Open to Summer 2027 internships.",
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
// 2. a link straight to a case study or the About page: hide Home and draw that page's outline;
// 3. the first visit to Home in a session: the monogram loader (only if the page isn't ready in 0.3s).
const bootScript = `(function(){var d=document.documentElement,W=window,h=location.hash;
try{var s=JSON.parse(localStorage.getItem("cw-settings")||"{}");if(s.theme==="light"||s.theme==="dark")d.dataset.theme=s.theme;if(s.motion==="reduced")d.dataset.motion="reduced";}catch(e){}
if(/^#(case\\/|(tipping|pebbo|melon)$)/.test(h))d.dataset.booting="case";else if(/^#about(\\/story)?$/.test(h))d.dataset.booting="about";
try{${cssScript}}catch(e){d.removeAttribute("data-cssw");var q=document.querySelectorAll("link[data-cw-css]");for(var j=0;j<q.length;j++)q[j].media="all"}
try{${introScript}}catch(e){d.removeAttribute("data-boot")}
})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${sans.variable} ${display.variable} ${mono.variable} ${barlow.variable} ${barlowSC.variable} ${hand.variable}`}>
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
            {/* The frame: a grey square track, and four bars that grow along its edges, clockwise
                from the top left, as the page gets ready (transforms only; lib/boot.ts ring()) */}
            <span className="cwb-ring">
              <i className="cwb-track" />
              <i className="cwb-edge cwb-edge--t" />
              <i className="cwb-edge cwb-edge--r" />
              <i className="cwb-edge cwb-edge--b" />
              <i className="cwb-edge cwb-edge--l" />
            </span>
            <Monogram size={64} className="cwb-mono" tile />
          </div>
          {/* “Curiously, Chaewon”, written again stroke by stroke the way she wrote it (the pen
              draws on this canvas, lib/boot.ts); the violet full stop lands when the page is ready */}
          <div className="cwb-sig">
            <canvas className="cwb-pen" />
            <i className="cwb-dot" />
          </div>
          <script dangerouslySetInnerHTML={{ __html: "window.cwPen&&cwPen()" }} />
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
              <span>WORK</span>
              <span>PLAY</span>
              <span>ABOUT</span>
              <span>RESUME ↗</span>
            </span>
          </div>
          {/* a case study: its split first screen */}
          <div className="cws-split">
            <div>
              <i className="cws-e" />
              <i className="cws-h1" />
              <i className="cws-h1 cws-h1b" />
              <i className="cws-sub" />
              <span className="cws-meta">
                <i /><i /><i /><i />
              </span>
            </div>
            <i className="cws-fig" />
          </div>
          {/* About: table of contents and one column */}
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
