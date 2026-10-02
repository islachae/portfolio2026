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

// The long reads (case studies, About) are their own chunk (components/case/load.ts), asked for
// only once the app is running. A link straight to one (/#case/…, /#about/story) preloads it from
// <head> instead, so it downloads alongside the page's own scripts rather than after them.
const page = readFileSync(index, "utf8");
const longRead = readdirSync(CHUNKS).filter(
  (f) => f.endsWith(".js") && !page.includes(f) && readFileSync(join(CHUNKS, f), "utf8").includes("cs-foot-actions"),
);
if (longRead.length) {
  const prefix = (page.match(/src="([^"]*)_next\/static\/chunks\//) || [, "/"])[1];
  const hrefs = JSON.stringify(longRead.map((f) => `${prefix}_next/static/chunks/${f}`));
  const pre = `<script>(function(h){if(!/^#case\\//.test(h)&&!/^#about\\/story$/.test(h))return;${hrefs}.forEach(function(u){var l=document.createElement("link");l.rel="preload";l.as="script";l.href=u;document.head.appendChild(l)})})(location.hash)</script>`;
  writeFileSync(index, page.replace("</head>", `${pre}</head>`));
}
console.log(`preload long reads on a deep link: ${longRead.join(", ") || "none found"}`);

// Each stage of the deck is its own Suspense boundary, so React can wake them up one at a time
// (components/Deck.tsx). When it writes the HTML, React moves the content of a large boundary to
// the end of the document, in a hidden <div>, and puts it in place with a script on the first
// frame (its streaming format, meant for content that arrives late). This is a static file:
// everything is already here. So the content goes back where it belongs, and the page reads the
// same as before with or without JavaScript:
//   <!--$?--><template id="B:0"></template><!--/$-->  …  <div hidden id="S:0">CONTENT</div><script>$RC("B:0","S:0")</script>
//   → <!--$-->CONTENT<!--/$-->
// All or nothing per page: if the markup isn't exactly this (a future React may write it
// differently), the page is left as React wrote it, which works too.
function inlineBoundaries(html) {
  let out = html;
  let n = 0;
  for (;;) {
    const seg = /<div hidden id="(S:[0-9a-f]+)">/.exec(out);
    if (!seg) break;
    const call = new RegExp(`\\$RC\\("(B:[0-9a-f]+)","${seg[1]}"\\)`).exec(out.slice(seg.index));
    if (!call) return null;
    const callAt = seg.index + call.index;
    const scriptAt = out.lastIndexOf("<script>", callAt);
    const scriptEnd = out.indexOf("</script>", callAt);
    const contentAt = seg.index + seg[0].length;
    if (scriptAt < contentAt || scriptEnd < 0 || out.slice(scriptAt - 6, scriptAt) !== "</div>") return null;
    const content = out.slice(contentAt, scriptAt - 6);
    const hole = `<!--$?--><template id="${call[1]}"></template><!--/$-->`;
    const holeAt = out.indexOf(hole);
    if (holeAt < 0 || holeAt > seg.index || out.indexOf(hole, holeAt + 1) >= 0) return null;
    // what's left of the script once this call is gone (the first one also defines $RC itself)
    const rest = out.slice(scriptAt + 8, scriptEnd).replace(call[0], "").replace(/;$/, "");
    out =
      out.slice(0, holeAt) +
      `<!--$-->${content}<!--/$-->` +
      out.slice(holeAt + hole.length, seg.index) +
      (rest ? `<script>${rest}</script>` : "") +
      out.slice(scriptEnd + 9);
    n++;
  }
  if (/<template id="B:|\$RC\("B:/.test(out)) return null;
  return { html: out, n };
}
for (const file of htmlFiles(OUT)) {
  const html = readFileSync(file, "utf8");
  if (!html.includes('<div hidden id="S:')) continue;
  const done = inlineBoundaries(html);
  if (done) writeFileSync(file, done.html);
  console.log(`stage boundaries: ${done ? `${done.n} put back in place` : "left as React wrote them (unexpected markup)"} (${file.slice(OUT.length)})`);
}

// Compile hints. Chrome normally compiles a function the first time it's called, on the main
// thread: waking the page up meant hundreds of small compiles in a row, and the gradient's code
// (three.js, one 0.9 MB function) a single long one. This comment at the top of a script tells
// Chrome (136+) to compile its functions while the file streams in, on a background thread
// instead. Other browsers read it as an ordinary comment.
const HINT = "//# allFunctionsCalledOnLoad\n";
let hinted = 0;
for (const f of readdirSync(CHUNKS)) {
  if (!f.endsWith(".js")) continue;
  const file = join(CHUNKS, f);
  const js = readFileSync(file, "utf8");
  if (js.startsWith(HINT)) continue;
  writeFileSync(file, HINT + js);
  hinted++;
}
console.log(`compile hints: ${hinted} script(s)`);
