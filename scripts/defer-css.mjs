// After `next build`: the stylesheet stops blocking the first paint, so the monogram loader and the
// case-study outline (lib/boot.ts) can show while it downloads. Each <link rel="stylesheet"> gets
// media="print" (downloads without blocking) and data-cw-css; the boot script switches it to "all"
// the moment it has loaded, and keeps the page itself hidden until then (no flash of unstyled page).
// <noscript> keeps a normal link for browsers without JavaScript.
import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const OUT = new URL("../out/", import.meta.url).pathname;
const LINK = /<link rel="stylesheet" href="([^"]+)" data-precedence="next"\/>/g;

const htmlFiles = (dir) =>
  readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    if (statSync(p).isDirectory()) return f === "_next" ? [] : htmlFiles(p);
    return f.endsWith(".html") ? [p] : [];
  });

let n = 0;
for (const file of htmlFiles(OUT)) {
  const html = readFileSync(file, "utf8");
  const hrefs = [];
  let out = html.replace(LINK, (_, href) => {
    hrefs.push(href);
    return `<link rel="stylesheet" href="${href}" data-precedence="next" media="print" data-cw-css=""/>`;
  });
  if (!hrefs.length) continue;
  const noscript = `<noscript>${hrefs.map((h) => `<link rel="stylesheet" href="${h}"/>`).join("")}</noscript>`;
  out = out.replace("</head>", `${noscript}</head>`);
  // media="print" alone would drop the download to the lowest priority, behind every image.
  // A high-priority preload at the very top of <head> keeps it first in line.
  const preload = hrefs.map((h) => `<link rel="preload" as="style" href="${h}" fetchpriority="high"/>`).join("");
  out = out.replace(/(<head>(?:<meta [^>]*\/>)*)/, `$1${preload}`);
  writeFileSync(file, out);
  n++;
}
console.log(`defer-css: ${n} page(s)`);

// The Home gradient (three.js + shadergradient, ~260 KB gzipped) now starts only after the intro
// (components/ShaderHero.tsx). Prefetch its chunk once the page has loaded (the intro is still
// playing) — lowest priority, and it isn't run — so it's in the cache by then. Home visits only.
const CHUNKS = join(OUT, "_next/static/chunks");
const index = join(OUT, "index.html");
const home = readFileSync(index, "utf8");
const gl = readdirSync(CHUNKS).filter(
  (f) => f.endsWith(".js") && !home.includes(f) && readFileSync(join(CHUNKS, f), "utf8").includes("WebGLRenderer"),
);
if (gl.length) {
  // Same prefix the page's own scripts use ("/" normally, "./site/" in the preview build)
  const prefix = (home.match(/src="([^"]*)_next\/static\/chunks\//) || [, "/"])[1];
  const hrefs = JSON.stringify(gl.map((f) => `${prefix}_next/static/chunks/${f}`));
  const pre = `<script>(function(h){if(h&&h!=="#"&&h!=="#home")return;addEventListener("load",function(){${hrefs}.forEach(function(u){var l=document.createElement("link");l.rel="prefetch";l.href=u;document.head.appendChild(l)})},{once:true})})(location.hash)</script>`;
  writeFileSync(index, home.replace("</head>", `${pre}</head>`));
}
console.log(`prefetch gradient: ${gl.join(", ") || "none found"}`);
