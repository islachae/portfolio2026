const { chromium } = require("@playwright/test");

(async () => {
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });

  const res = await page.evaluate(() => {
    const dots = document.querySelectorAll(".availability-dot");
    const heroGroup = dots[0]?.closest(".group");
    const tooltip = heroGroup?.querySelector("span.pointer-events-none");
    const before = tooltip ? getComputedStyle(tooltip).opacity : null;
    return { dotCount: dots.length, tooltipText: tooltip?.textContent.trim(), beforeHoverOpacity: before };
  });

  // hover the hero dot and re-check opacity
  const heroGroup = page.locator(".availability-dot").first().locator("..");
  await heroGroup.hover();
  await page.waitForTimeout(250);
  const after = await page.evaluate(() => {
    const tooltip = document.querySelector(".availability-dot")?.closest(".group")?.querySelector("span.pointer-events-none");
    return getComputedStyle(tooltip).opacity;
  });

  console.log(JSON.stringify({ ...res, afterHoverOpacity: after }, null, 2));
  await browser.close();
})();
