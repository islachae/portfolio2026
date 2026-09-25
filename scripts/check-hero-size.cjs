const { chromium } = require("@playwright/test");

(async () => {
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });

  const res = await page.evaluate(() => {
    const h1 = document.querySelector(".hero-copy h1");
    const blocks = h1.querySelectorAll(":scope > .block");
    const num = document.querySelector(".hero-num");
    const icon = document.querySelector(".hero-icon svg");
    return {
      h1FontSize: getComputedStyle(h1).fontSize,
      blockCount: blocks.length,
      lines: Array.from(blocks).map((b) => b.textContent.trim()),
      numFontSize: getComputedStyle(num).fontSize,
      iconSize: icon ? `${getComputedStyle(icon).width}x${getComputedStyle(icon).height}` : null,
    };
  });
  console.log(JSON.stringify(res, null, 2));
  await browser.close();
})();
