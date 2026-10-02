"use client";

/**
 * The receipt: feeds out of a slot in short bursts like a thermal printer, sways while it
 * hangs, then gets torn off and settles at a slight angle.
 */
import { useEffect, useMemo, useRef } from "react";
import { animate } from "motion/react";
import { cocktailCopy, shotLabel, type ReadyCocktail } from "@/content/cocktails";
import { T } from "./timeline";

/** An irregular torn edge (deterministic, so it doesn't change between renders) */
function tornEdge(seed = 7) {
  let a = seed;
  const rnd = () => {
    a = (a * 16807) % 2147483647;
    return a / 2147483647;
  };
  let d = "M0 0 H200 V2";
  let x = 200;
  while (x > 0) {
    const w = 3 + rnd() * 5;
    x = Math.max(0, x - w);
    const y = 2 + rnd() * 6;
    d += ` L${x.toFixed(1)} ${y.toFixed(1)}`;
  }
  return d + " Z";
}

export function Receipt({ cocktail, order, reduced, printing }: { cocktail: ReadyCocktail; order: number; reduced: boolean; printing: boolean }) {
  const feed = useRef<HTMLDivElement>(null);
  const paper = useRef<HTMLDivElement>(null);
  const edge = useMemo(() => tornEdge(order * 13 + 7), [order]);
  const stamp = useMemo(() => {
    const d = new Date();
    const p = (n: number) => String(n).padStart(2, "0");
    return `${p(d.getMonth() + 1)}/${p(d.getDate())}/${String(d.getFullYear()).slice(2)} ${p(d.getHours())}:${p(d.getMinutes())}`;
  }, []);

  const rows = useMemo(() => {
    const byId = new Map(cocktail.ingredients.map((i) => [i.id, i]));
    const ids = cocktail.receiptOrder ?? cocktail.ingredients.map((i) => i.id);
    return ids.map((id) => byId.get(id)!).filter(Boolean);
  }, [cocktail]);

  useEffect(() => {
    const f = feed.current;
    const p = paper.current;
    if (!f || !p || !printing) return;
    if (reduced) {
      f.style.transform = "translateY(0)";
      p.style.transform = "rotate(-1deg)";
      return;
    }
    const h = p.offsetHeight + 12;
    // short feeds with tiny stops between them, a bit uneven, like a real printer
    const bursts = 9;
    const y: number[] = [-h];
    const times: number[] = [0];
    const ease: ("easeOut" | "linear")[] = [];
    let at = 0;
    for (let i = 1; i <= bursts; i++) {
      const move = (0.62 + ((i * 7) % 5) * 0.04) / bursts;
      const rest = 0.38 / bursts;
      at += move;
      y.push(-h + (h * i) / bursts);
      times.push(Math.min(1, at));
      ease.push("easeOut");
      if (i < bursts) {
        at += rest;
        y.push(-h + (h * i) / bursts);
        times.push(Math.min(1, at));
        ease.push("linear");
      }
    }
    times[times.length - 1] = 1;
    const run = animate(f, { y }, { duration: T.print, times, ease });
    let tear: ReturnType<typeof animate> | undefined;
    run.then(() => {
      // torn off: a small drop and a tilt, like it was just set down
      tear = animate(p, { rotate: [0, -2.6, -1.2], y: [0, 9, 5] }, { duration: 0.55, ease: [0.3, 1.4, 0.4, 1] });
    });
    return () => {
      run.stop();
      tear?.stop();
    };
  }, [printing, reduced]);

  return (
    <div className="wc-printer">
      <span className="wc-slot" aria-hidden />
      <div className="wc-feed-clip">
        <div className="wc-feed" ref={feed} style={{ transform: "translateY(-110%)" }}>
          <div className="wc-paper" ref={paper}>
            <div className="wc-paper-sway">
              <div className="wc-receipt" role="group" aria-label={`Receipt for ${cocktail.word}`}>
                <p className="wc-r-center wc-r-brand">{cocktailCopy.title}</p>
                <p className="wc-r-center wc-r-muted">
                  Order #{String(order).padStart(3, "0")} · {stamp}
                </p>
                <hr />
                <p className="wc-r-row wc-r-head">
                  <span>{cocktail.word}</span>
                  <span>{cocktail.code}</span>
                </p>
                <ul className="wc-r-list">
                  {rows.map((r) => (
                    <li key={r.id} className="wc-r-row">
                      <span>{r.name}</span>
                      <span className="wc-r-dots" aria-hidden />
                      <span>{shotLabel(r.shots)}</span>
                    </li>
                  ))}
                </ul>
                <hr />
                <p className="wc-r-k">Garnish</p>
                <p className="wc-r-v">{cocktail.garnish.name}</p>
                <hr />
                <p className="wc-r-k">Best served:</p>
                <p className="wc-r-v">{cocktail.bestServed}</p>
                <hr />
                <p className="wc-r-k">Translation</p>
                <p className="wc-r-v">{cocktail.translation}</p>
                <p className="wc-r-barcode" aria-hidden>
                  {Array.from({ length: 38 }, (_, i) => (
                    <i key={i} style={{ width: [1, 2, 1, 3, 1, 2][(i * 5 + order) % 6] }} />
                  ))}
                </p>
              </div>
              <svg className="wc-torn" viewBox="0 0 200 9" preserveAspectRatio="none" aria-hidden>
                <path d={edge} />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
