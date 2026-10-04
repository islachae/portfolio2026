"use client";

import dynamic from "next/dynamic";
import { Component, useEffect, useRef, useState, type ReactNode } from "react";
import { reducedMotion } from "./shell-context";
import { whenQuiet } from "@/lib/quiet";

/**
 * The Home background: the same ShaderGradient Chaewon uses on chaewon.works (waterPlane, white → lilac).
 * It fills the Home page of the canvas only (the side panels keep their own background).
 * Dark mode swaps the three colours for dark ones so the text stays readable; everything else is identical.
 * The WebGL canvas is only mounted while Home is on screen, so other pages don't pay for it.
 */
// One import for both pieces. The first call downloads three.js + shadergradient and runs them
// (about 0.4s of main thread on a mid phone, in one go); later calls are free.
const load = () => import("shadergradient");
const loadClock = () => import("./GradientClock");
/** The moment the gradient starts from, in seconds of its animation: the frame the still shows. */
const START = 9;
const ShaderGradientCanvas = dynamic(() => load().then((mod) => mod.ShaderGradientCanvas), {
  ssr: false,
});
const ShaderGradient = dynamic(() => load().then((mod) => mod.ShaderGradient), { ssr: false });
const StartAt = dynamic(() => loadClock().then((mod) => mod.StartAt), { ssr: false });

/** No WebGL (or it fails): keep the plain page colour instead of taking the page down with it. */
class Quiet extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {}
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

const LIGHT = { color1: "#ffffff", color2: "#fdfafd", color3: "#c19dff" };
const DARK = { color1: "#0b0b0c", color2: "#121016", color3: "#5b3fc4" };

function useDark() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const html = document.documentElement;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const read = () => {
      const t = html.dataset.theme;
      setDark(t ? t === "dark" : mq.matches);
    };
    read();
    const mo = new MutationObserver(read);
    mo.observe(html, { attributes: true, attributeFilter: ["data-theme"] });
    mq.addEventListener("change", read);
    return () => {
      mo.disconnect();
      mq.removeEventListener("change", read);
    };
  }, []);
  return dark;
}

/**
 * When the gradient may start. Getting it on screen is two heavy steps, and each one freezes the
 * main thread for a moment, so each is put where it won't be felt:
 *  1. running its code (three.js + shadergradient, ~0.4s on a mid phone). While the intro
 *     (#cw-boot, lib/boot.ts) is on screen it runs right away, under it: the signature is drawn by
 *     a worker and nobody can touch the page yet. Without an intro it waits for a quiet moment
 *     (lib/quiet.ts: idle, and no scroll, touch or key for a beat), so it never lands mid-scroll.
 *  2. starting WebGL and compiling the shader: once the intro is over (it used to freeze the
 *     monogram's flight), again in a quiet moment, and never in the same task as step 1.
 * Only while Home is the page on screen.
 */
function useGradientReady(active: boolean) {
  const [ok, setOk] = useState(false);
  useEffect(() => {
    if (!active || ok) return;
    const html = document.documentElement;
    const intro = () => html.hasAttribute("data-boot");
    let off = false;
    let cancel = () => {};
    const start = () => {
      cancel = whenQuiet(() => !off && setOk(true), { still: 300 });
    };
    const afterIntro = () => {
      if (off) return;
      if (!intro()) return start();
      const mo = new MutationObserver(() => {
        if (intro()) return;
        mo.disconnect();
        start();
      });
      mo.observe(html, { attributes: true, attributeFilter: ["data-boot"] });
      cancel = () => mo.disconnect();
    };
    // (if the code can't be fetched, Home simply keeps its plain background)
    const code = () => void Promise.all([load(), loadClock()]).then(afterIntro, () => {});
    if (intro()) code();
    else cancel = whenQuiet(code, { after: 200 });
    return () => {
      off = true;
      cancel();
    };
  }, [active, ok]);
  return ok;
}

export function ShaderHero({ active }: { active: boolean }) {
  const dark = useDark();
  const [still, setStill] = useState(false);
  // With motion reduced there is no canvas at all: the still (the box's background) is the gradient.
  // (shadergradient 1.3.5 ignores animate="off": its clock keeps running.)
  const ready = useGradientReady(active && !still);
  const [mounted, setMounted] = useState(false);
  const [live, setLive] = useState(false);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setStill(reducedMotion());
    const html = document.documentElement;
    const mo = new MutationObserver(() => setStill(reducedMotion()));
    mo.observe(html, { attributes: true, attributeFilter: ["data-motion"] });
    return () => mo.disconnect();
  }, []);

  // Mount on Home (once it may start: useGradientReady); let it go a moment after leaving (a
  // quick scroll back doesn't restart WebGL)
  useEffect(() => {
    if (active && ready) {
      setMounted(true);
      return;
    }
    if (active) return;
    const t = window.setTimeout(() => setMounted(false), 1500);
    return () => window.clearTimeout(t);
  }, [active, ready]);

  // Fade the gradient in once it has actually drawn: a few frames after the canvas appears
  // (the first one waits for the shader to compile), not the moment the empty canvas is added.
  useEffect(() => {
    setLive(false);
    if (!mounted) return;
    let raf = 0;
    let frames = 0;
    const tick = () => {
      if (box.current?.querySelector("canvas")) frames++;
      if (frames >= 3) return setLive(true);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [mounted]);

  const colors = dark ? DARK : LIGHT;
  return (
    <div className="shader-hero" aria-hidden ref={box} data-live={live ? "" : undefined}>
      {mounted && !still && (
        <Quiet>
          <ShaderGradientCanvas
            style={{ position: "absolute", inset: 0 }}
            fov={50}
            // 2.5 canvas pixels per CSS pixel: on a 2x screen the grain still blends as softly as at 3,
            // for about two thirds of the pixels drawn each frame (at 2 it turns hard and sandy)
            pixelDensity={2.5}
          >
            <StartAt at={START} />
            <ShaderGradient
              type="waterPlane"
              animate="on"
              uTime={START}
              uSpeed={0.12}
              uStrength={1.3}
              uDensity={1.5}
              uFrequency={5.5}
              uAmplitude={1}
              positionX={-0.4}
              positionY={0.1}
              positionZ={0}
              rotationX={0}
              rotationY={10}
              rotationZ={50}
              color1={colors.color1}
              color2={colors.color2}
              color3={colors.color3}
              reflection={0}
              wireframe={false}
              shader="defaults"
              cAzimuthAngle={181}
              cPolarAngle={84}
              cDistance={2.64}
              cameraZoom={1}
              lightType="3d"
              brightness={1}
              envPreset="city"
              grain="on"
              zoomOut={false}
              toggleAxis={false}
              enableTransition={false}
            />
          </ShaderGradientCanvas>
        </Quiet>
      )}
    </div>
  );
}
