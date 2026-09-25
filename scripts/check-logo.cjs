const { chromium } = require("@playwright/test");

(async () => {
  const b = await chromium.launch({ channel: "chrome", headless: true });
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  await p.goto("http://localhost:3000/", { waitUntil: "networkidle" });
  await p.waitForTimeout(400);
  await p.locator("header").first().screenshot({ path: "/tmp/header-check.png" });
  console.log("screenshot saved");
  await b.close();
})();
