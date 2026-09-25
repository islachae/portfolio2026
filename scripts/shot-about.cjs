const { chromium } = require("@playwright/test");
(async () => {
  const b = await chromium.launch({ channel: "chrome", headless: true });
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  await p.goto("http://localhost:3000/about", { waitUntil: "networkidle" });
  await p.waitForTimeout(600);
  await p.screenshot({ path: "artifacts/about-top.png" });
  await p.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await p.waitForTimeout(400);
  await p.screenshot({ path: "artifacts/about-bottom.png" });
  console.log("done");
  await b.close();
})();
