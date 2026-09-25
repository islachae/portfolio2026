const { chromium } = require("playwright");

(async () => {
  const browser = await chromium.launch({ channel: "chrome" });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto("http://localhost:3000/about", { waitUntil: "networkidle" });
  await page.waitForTimeout(800);

  // Full-page screenshot
  await page.screenshot({ path: "/tmp/about-new.png", fullPage: true });

  // Measure key element positions
  const sel = async (label, selector) => {
    const el = page.locator(selector).first();
    if (await el.count() === 0) { console.log(`${label}: NOT FOUND`); return; }
    const box = await el.boundingBox();
    console.log(`${label}: x=${Math.round(box.x)} y=${Math.round(box.y)} w=${Math.round(box.width)} h=${Math.round(box.height)}`);
  };

  await sel("portrait", 'img[alt="Chaewon in Tokyo"]');
  await sel("daejeon", 'img[alt="Daejeon Expo Bridge, South Korea"]');
  await sel("student-id", 'img[alt="CMU student ID"]');
  await sel("h1", "h1");
  await sel("subheading", "h1 + p");
  await sel("bio-p1", "h1 + p + p");

  // heading computed font-size
  const fs = await page.evaluate(() => getComputedStyle(document.querySelector("h1")).fontSize);
  console.log("h1 font-size:", fs);

  await browser.close();
})();
