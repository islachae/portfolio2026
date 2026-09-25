const { chromium } = require("playwright");
(async () => {
  const browser = await chromium.launch({ channel: "chrome" });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await page.goto("http://localhost:3000/about", { waitUntil: "networkidle" });
  await page.waitForTimeout(600);
  await page.screenshot({ path: "/tmp/about-mobile.png", fullPage: false });
  const el = page.locator('img[alt="Chaewon in Tokyo"]').first();
  const box = await el.boundingBox();
  console.log("mobile portrait:", JSON.stringify(box));
  const h1 = page.locator("h1").first();
  const hb = await h1.boundingBox();
  const fs = await page.evaluate(() => getComputedStyle(document.querySelector("h1")).fontSize);
  console.log("mobile h1 y:", Math.round(hb.y), "fontSize:", fs);
  await browser.close();
})();
