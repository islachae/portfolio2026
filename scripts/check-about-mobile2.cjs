const { chromium } = require("playwright");
(async () => {
  const browser = await chromium.launch({ channel: "chrome" });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await page.goto("http://localhost:3000/about", { waitUntil: "networkidle" });
  await page.waitForTimeout(800);

  const overflow = await page.evaluate(() => ({
    scrollW: document.documentElement.scrollWidth,
    clientW: document.documentElement.clientWidth,
  }));
  console.log("doc scrollWidth/clientWidth:", JSON.stringify(overflow));

  // all text elements that overflow viewport horizontally
  const bad = await page.evaluate(() => {
    const out = [];
    document.querySelectorAll("p, h1, h2, span").forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.right > 391 || r.left < -1) {
        out.push({
          tag: el.tagName,
          text: (el.textContent || "").slice(0, 50),
          left: Math.round(r.left),
          right: Math.round(r.right),
        });
      }
    });
    return out.slice(0, 15);
  });
  console.log("overflowing elements:");
  bad.forEach((b) => console.log(" ", JSON.stringify(b)));

  await browser.close();
})();
