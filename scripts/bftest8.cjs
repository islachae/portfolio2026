const { chromium } = require("@playwright/test");
(async () => {
  const b = await chromium.launch({ channel: "chrome", headless: true });
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  await p.goto("http://localhost:3000/", { waitUntil: "networkidle" });
  await p.waitForTimeout(500);
  await p.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await p.waitForTimeout(500);
  await p.screenshot({ path: "artifacts/footer-blur.png" });
  console.log("done, scrollHeight=" + await p.evaluate(() => document.body.scrollHeight));
  await b.close();
})();
