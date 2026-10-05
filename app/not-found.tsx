import type { Metadata } from "next";
import { Monogram } from "@/components/Monogram";
import { PixelFace } from "@/components/PixelFace";
import { profile } from "@/content/site";

/**
 * Any address that isn't a page (written out as /404.html, which the host serves for it).
 * "404" with ChaeLLM's face as the zero, and two ways on: Home, or the chat (/#ask opens it).
 */
export const metadata: Metadata = { title: "Page not found · Chaewon Lim", robots: { index: false } };

export default function NotFound() {
  return (
    <main className="nf">
      {/* the layout's intro is for Home: call it off before anything paints (lib/boot.ts) */}
      <script dangerouslySetInnerHTML={{ __html: "window.cwNoIntro&&cwNoIntro()" }} />
      <a className="nf-chip" href="/">
        <Monogram size={30} tile />
        <span>
          <b>{profile.name}</b> {profile.role}
        </span>
      </a>
      <div className="nf-mid">
        <h1 className="nf-404" aria-label="404, page not found">
          <span aria-hidden>4</span>
          <span className="nf-face" aria-hidden>
            <PixelFace size={160} />
          </span>
          <span aria-hidden>4</span>
        </h1>
        <p className="nf-sub">This page doesn’t exist. ChaeLLM looked everywhere.</p>
        <p className="nf-go">
          <a className="nf-btn" href="/">
            Back to Home
          </a>
          <a className="nf-btn nf-btn--ghost" href="/#ask">
            Ask ChaeLLM
          </a>
        </p>
      </div>
    </main>
  );
}
