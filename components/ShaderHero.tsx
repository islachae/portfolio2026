"use client";

import dynamic from "next/dynamic";
import { Component, useEffect, useRef, useState, type ReactNode } from "react";
import { reducedMotion } from "./shell-context";

/**
 * The Home background: the same ShaderGradient Chaewon uses on chaewon.works (waterPlane, white → lilac).
 * It fills the Home page of the canvas only (the side panels keep their own background).
 * Dark mode swaps the three colours for dark ones so the text stays readable; everything else is identical.
 * The WebGL canvas is only mounted while Home is on screen, so other pages don't pay for it.
 */
const ShaderGradientCanvas = dynamic(
  () => import("shadergradient").then((mod) => mod.ShaderGradientCanvas),
  {
    ssr: false,
  },
);
const ShaderGradient = dynamic(
  () => import("shadergradient").then((mod) => mod.ShaderGradient),
  { ssr: false },
);

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
 * True once the intro (#cw-boot, lib/boot.ts) is over and the browser has a quiet moment.
 * Starting WebGL means downloading three.js and compiling the shader, one long stall of the
 * main thread (and the GPU); during the intro it landed right on the monogram's flight.
 * On visits without the intro this is simply "after the page has woken up".
 */
function useAfterIntro() {
  const [ok, setOk] = useState(false);
  useEffect(() => {
    const html = document.documentElement;
    let idle = 0;
    let timer = 0;
    const go = () => {
      if (typeof window.requestIdleCallback === "function") {
        idle = window.requestIdleCallback(() => setOk(true), { timeout: 1200 });
      } else {
        timer = window.setTimeout(() => setOk(true), 250);
      }
    };
    const mo = new MutationObserver(() => {
      if (html.hasAttribute("data-boot")) return;
      mo.disconnect();
      go();
    });
    if (html.hasAttribute("data-boot")) {
      mo.observe(html, { attributes: true, attributeFilter: ["data-boot"] });
    } else {
      go();
    }
    return () => {
      mo.disconnect();
      if (idle) window.cancelIdleCallback?.(idle);
      window.clearTimeout(timer);
    };
  }, []);
  return ok;
}

export function ShaderHero({ active }: { active: boolean }) {
  const dark = useDark();
  const ready = useAfterIntro();
  const [mounted, setMounted] = useState(false);
  const [live, setLive] = useState(false);
  const [still, setStill] = useState(false);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setStill(reducedMotion());
    const html = document.documentElement;
    const mo = new MutationObserver(() => setStill(reducedMotion()));
    mo.observe(html, { attributes: true, attributeFilter: ["data-motion"] });
    return () => mo.disconnect();
  }, []);

  // Mount on Home (once the intro is over); let it go a moment after leaving (a quick scroll
  // back doesn't restart WebGL)
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
      {mounted && (
        <Quiet>
          <ShaderGradientCanvas
            style={{ position: "absolute", inset: 0 }}
            fov={50}
            pixelDensity={3}
          >
            <ShaderGradient
              type="waterPlane"
              animate={still ? "off" : "on"}
              uTime={3.7}
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
