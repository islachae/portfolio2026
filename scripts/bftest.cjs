const { chromium } = require("@playwright/test");
(async () => {
  const b = await chromium.launch({ channel: "chrome", headless: true });
  const p = await b.newPage();
  await p.setContent(`<style>.o{position:fixed;left:0;right:0;bottom:0;height:100px;backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);background:rgba(0,0,0,0.05)}</style><div style="height:2000px;font-size:40px">HELLO WORLD text behind</div><div class="o"></div>`);
  const r = await p.evaluate(() => {
    const el = document.querySelector(".o");
    const cs = getComputedStyle(el);
    return { backdropFilter: cs.backdropFilter, webkit: cs.webkitBackdropFilter, supports: CSS.supports("backdrop-filter","blur(10px)") };
  });
  console.log("STANDALONE:", JSON.stringify(r));
  const p2 = await b.newPage();
  await p2.goto("http://localhost:3000/", { waitUntil: "networkidle" });
  const r2 = await p2.evaluate(() => {
    const el = document.querySelector(".bottom-blur");
    const cs = getComputedStyle(el);
    return { backdropFilter: cs.backdropFilter, webkit: cs.webkitBackdropFilter, supports: CSS.supports("backdrop-filter","blur(10px)") };
  });
  console.log("LOCALHOST:", JSON.stringify(r2));
  await b.close();
})();
