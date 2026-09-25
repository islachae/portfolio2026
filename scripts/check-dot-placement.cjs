const { chromium } = require("@playwright/test");

(async () => {
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });

  const res = await page.evaluate(() => {
    const dot = document.querySelector(".availability-dot");
    const anim = getComputedStyle(dot).animationName;
    // The dot's parent group should be inside the same row as the time text
    const group = dot.closest(".group");
    const row = group.parentElement;
    const rowText = row.textContent.trim();
    // Is the dot visually on the same line as the time? compare y-centers
    const timeEl = document.querySelector(".font-mono") || row.querySelector(".font-mono");
    const dotRect = dot.getBoundingClientRect();
    const rowRect = row.getBoundingClientRect();
    const sameLine = Math.abs(dotRect.top + dotRect.height / 2 - (rowRect.top + rowRect.height / 2)) < 6;
    return { animationName: anim, rowText, sameLine, dotCount: document.querySelectorAll(".availability-dot").length };
  });
  console.log(JSON.stringify(res, null, 2));
  await browser.close();
})();
