const { chromium } = require("playwright");
(async () => {
  const browser = await chromium.launch({ channel: "chrome" });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto("http://localhost:3000/about", { waitUntil: "networkidle" });
  await page.waitForTimeout(600);

  // scroll to bottom, verify end-note img loads
  const info = await page.evaluate(async () => {
    const img = document.querySelector('img[src*="end-note"]');
    if (!img) return { found: false };
    return {
      found: true,
      complete: img.complete,
      naturalWidth: img.naturalWidth,
      naturalHeight: img.naturalHeight,
      src: img.getAttribute("src"),
      alt: (img.getAttribute("alt") || "").slice(0, 60),
    };
  });
  console.log("end-note img:", JSON.stringify(info));

  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(400);
  await page.screenshot({ path: "/tmp/about-bottom.png" });
  console.log("bottom screenshot saved");
  await browser.close();
})();
