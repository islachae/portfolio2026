const { chromium } = require("@playwright/test");
(async () => {
  const b = await chromium.launch({ channel: "chrome", headless: true });
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  await p.goto("http://localhost:3000/", { waitUntil: "networkidle" });
  await p.waitForTimeout(600);
  const computed = await p.evaluate(() => {
    const el = document.querySelector(".bottom-blur");
    const cs = getComputedStyle(el);
    return { backdropFilter: cs.backdropFilter, maskImage: cs.maskImage, height: el.getBoundingClientRect().height };
  });
  await p.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await p.waitForTimeout(500);
  await p.screenshot({ path: "artifacts/footer-blur-final.png" });
  console.log(JSON.stringify(computed));
  await b.close();
})();
