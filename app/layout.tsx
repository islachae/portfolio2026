import type { Metadata } from "next";
import "./globals.css";
import CustomCursor from "./components/custom-cursor";

export const metadata: Metadata = {
  title: "Chaewon Lim — Product Designer",
  description:
    "Research-driven product designer combining craft, systems thinking, and AI to transform complex information into clear, scalable digital experiences. MDES candidate at Carnegie Mellon University.",
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><circle cx='50' cy='50' r='45' fill='%232b2b2b' stroke='black' stroke-width='3'/><text x='50' y='68' text-anchor='middle' dominant-baseline='auto' font-size='52' font-weight='700' font-family='PingFang SC, Noto Sans SC, system-ui' fill='white'>採</text></svg>",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://api.fontshare.com" />
        <link
          href="https://api.fontshare.com/v2/css?f[]=satoshi@400,500,700,900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased bg-[var(--bg)] text-[var(--fg)]">
        <CustomCursor />
        {children}
      </body>
    </html>
  );
}
