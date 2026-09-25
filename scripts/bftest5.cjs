const { chromium } = require("@playwright/test");
(async () => {
  const b = await chromium.launch({ channel: "chrome", headless: true });
  const p = await b.newPage();
  await p.goto("http://localhost:3000/", { waitUntil: "networkidle" });
  await p.waitForTimeout(500);
  const r = await p.evaluate(() => {
    const el = document.querySelector(".bottom-blur");
    const cs = getComputedStyle(el);
    return { backdropFilter: cs.backdropFilter, webkit: cs.webkitBackdropFilter, mask: cs.maskImage };
  });
  // screenshot at a scroll position with content near bottom of viewport
  await p.evaluate(() => window.scrollTo(0, 700));
  await p.waitForTimeout(400);
  await p.screenshot({ path: "artifacts/blur-test.png" });
  console.log(JSON.stringify(r));
  await b.close();
})();
