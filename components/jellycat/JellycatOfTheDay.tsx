"use client";

/**
 * Jellycat of the Day: a claw machine. Move the claw, grab one, and the plush you catch comes out
 * with a fortune for the day (the same one all day for that plush).
 *
 * The machine and the game are plain three.js in game.ts, loaded when the page is on screen or
 * next to it; this file is the type and the buttons around it.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { jellycatCopy as copy, type Jellycat } from "@/content/jellycats";
import { reducedMotion } from "../shell-context";
import type { ClawGame } from "./game";

const hashStr = (s: string) => {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
};

function todayInfo() {
  const d = new Date();
  return {
    key: `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`,
    label: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
  };
}
const pickKey = (day: string) => `jc-pick:${day}`;
const readPick = (day: string) => {
  try {
    return localStorage.getItem(pickKey(day));
  } catch {
    return null;
  }
};

export function JellycatOfTheDay({ active, near }: { active: boolean; near: boolean }) {
  const stage = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const game = useRef<ClawGame | null>(null);
  const [ready, setReady] = useState(false);
  const [noGL, setNoGL] = useState(false);
  const [busy, setBusy] = useState(false);
  const [prize, setPrize] = useState<{ j: Jellycat; line: string; label: string } | null>(null);
  const [toast, setToast] = useState<{ text: string; n: number } | null>(null);
  // the date and the first pick are read on the client (the page is built ahead of time)
  const [first, setFirst] = useState<string | null>(null);
  const [status, setStatus] = useState("");

  useEffect(() => setFirst(readPick(todayInfo().key)), []);

  const say = useCallback((text: string) => {
    setToast((t) => ({ text, n: (t?.n ?? 0) + 1 }));
    setStatus(text);
  }, []);
  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(null), 2400);
    return () => window.clearTimeout(id);
  }, [toast]);

  // The machine loads when the page is on screen or next to it, and stays once it has
  useEffect(() => {
    if (!(active || near) || game.current || noGL) return;
    let dead = false;
    import("./game")
      .then(({ ClawGame }) => {
        if (dead || game.current || !canvas.current || !stage.current) return;
        try {
          game.current = new ClawGame(
            canvas.current,
            stage.current,
            {
              onBusy: setBusy,
              onMiss: (kind) => say(kind === "slip" ? copy.slip : copy.empty),
              onPrize: (j) => {
                const day = todayInfo();
                const line = j.lines[hashStr(day.key + j.name) % j.lines.length];
                if (!readPick(day.key)) {
                  try {
                    localStorage.setItem(pickKey(day.key), j.name);
                  } catch {}
                }
                setFirst(readPick(day.key) ?? j.name);
                setPrize({ j, line, label: day.label });
                setStatus(`${j.name}. ${line}`);
              },
            },
            reducedMotion,
          );
          setReady(true);
        } catch {
          // no WebGL (old device, blocked GPU): a still of the machine stands in
          setNoGL(true);
        }
      })
      .catch(() => {});
    return () => {
      dead = true;
    };
  }, [active, near, noGL, say]);

  // It only animates while you're on the page; away from it, it rests on its last frame
  useEffect(() => {
    game.current?.setActive(active && ready);
  }, [active, ready]);
  useEffect(
    () => () => {
      game.current?.dispose();
      game.current = null;
    },
    [],
  );

  // the floor shadow follows the site's theme
  useEffect(() => {
    if (!ready) return;
    const sync = () => requestAnimationFrame(() => game.current?.syncTheme());
    const mo = new MutationObserver(sync);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    mq.addEventListener("change", sync);
    return () => {
      mo.disconnect();
      mq.removeEventListener("change", sync);
    };
  }, [ready]);

  const drop = useCallback(() => {
    const g = game.current;
    if (!g || !g.idle) return;
    setToast(null);
    g.drop();
  }, []);
  const again = useCallback(() => {
    if (!game.current?.showing) return;
    setPrize(null);
    game.current.again();
    canvas.current?.focus({ preventScroll: true });
  }, []);

  // keyboard: ← → move the claw, Space / Enter grabs (only while this page is the one on screen)
  useEffect(() => {
    if (!active) return;
    const down = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const el = e.target as HTMLElement | null;
      if (el && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName))) return;
      if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
        game.current?.setDir(e.key === "ArrowLeft" ? -1 : 1);
        e.preventDefault();
      } else if ((e.key === " " || e.key === "Enter") && el?.tagName !== "BUTTON") {
        if (game.current?.showing) again();
        else drop();
        e.preventDefault();
      }
    };
    const up = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" || e.key === "ArrowRight") game.current?.setDir(0);
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      game.current?.setDir(0);
    };
  }, [active, drop, again]);

  // hold an arrow to keep the claw moving
  const hold = (d: number) => ({
    onPointerDown: (e: React.PointerEvent<HTMLButtonElement>) => {
      if (e.currentTarget.disabled) return;
      e.currentTarget.setPointerCapture(e.pointerId);
      game.current?.setDir(d);
    },
    onPointerUp: () => game.current?.setDir(0),
    onPointerCancel: () => game.current?.setDir(0),
    onLostPointerCapture: () => game.current?.setDir(0),
    onKeyDown: (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        game.current?.setDir(d);
        e.preventDefault();
      }
    },
    onKeyUp: () => game.current?.setDir(0),
  });

  // or drag across the machine
  const drag = useRef<{ x: number } | null>(null);

  // Development only: steer it from the console (screen recordings). Stripped from production builds.
  useEffect(() => {
    if (process.env.NODE_ENV !== "development" || !ready || !game.current) return;
    const w = window as unknown as { __jc?: unknown };
    w.__jc = { ...game.current.dev(), drop, again, game: game.current };
  }, [ready, drop, again]);

  return (
    <div className="jc" data-ready={ready || undefined}>
      <p className="jc-hint">{copy.hint}</p>
      <div className="jc-stage" ref={stage}>
        <canvas
          ref={canvas}
          className="jc-canvas"
          role="img"
          aria-label={copy.canvas}
          tabIndex={0}
          onPointerDown={(e) => {
            drag.current = { x: e.clientX };
            e.currentTarget.setPointerCapture(e.pointerId);
          }}
          onPointerMove={(e) => {
            if (!drag.current) return;
            game.current?.nudge(e.clientX - drag.current.x);
            drag.current.x = e.clientX;
          }}
          onPointerUp={() => (drag.current = null)}
          onPointerCancel={() => (drag.current = null)}
        />
        {noGL && (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="jc-poster" src="/fun/jellycat.webp" alt="" aria-hidden />
            <p className="jc-toast">{copy.noGL}</p>
          </>
        )}
        {toast && (
          <p className="jc-toast" key={toast.n} aria-hidden>
            {toast.text}
          </p>
        )}
        {prize && (
          <div className="jc-card">
            <p className="jc-card-k">
              {prize.label} · {copy.ofTheDay}
            </p>
            <h3 className="jc-card-name">{prize.j.name}</h3>
            <p className="jc-card-line">{prize.line}</p>
            <button className="jc-btn jc-btn--go" onClick={again}>
              {copy.again}
            </button>
          </div>
        )}
      </div>
      <div className="jc-dock">
        <button className="jc-btn jc-arrow" aria-label={copy.left} disabled={busy || noGL} {...hold(-1)}>
          ◀
        </button>
        <button className="jc-btn jc-btn--go" disabled={busy || noGL} onClick={drop}>
          {copy.grab}
        </button>
        <button className="jc-btn jc-arrow" aria-label={copy.right} disabled={busy || noGL} {...hold(1)}>
          ▶
        </button>
      </div>
      <p className="jc-foot">
        <span>{copy.fan}</span>
        <span>{first ? copy.firstPick + first : copy.noPick}</span>
      </p>
      <p className="sr-only" aria-live="polite">
        {status}
      </p>
    </div>
  );
}
