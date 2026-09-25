const { chromium } = require("@playwright/test");

(async () => {
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });
  await page.waitForTimeout(800);

  const checks = await page.evaluate(() => {
    const blur = document.querySelector(".bottom-blur");
    const cs = blur ? getComputedStyle(blur) : null;
    const firstCard = document.querySelector(".project-card");
    return {
      blurExists: !!blur,
      blurBackdrop: cs ? cs.backdropFilter || cs.webkitBackdropFilter : null,
      blurHeight: blur ? blur.getBoundingClientRect().height : 0,
      blurMask: cs ? cs.maskImage || cs.webkitMaskImage : null,
      tippingVisualPresent: !!firstCard && firstCard.textContent.includes("Trust-First Tipping"),
      phoneCount: document.querySelectorAll("div[style*='aspect-ratio']").length,
      phonesInFirstCard: firstCard ? firstCard.querySelectorAll(".aspect-\\[9\\/21\\]").length : 0,
    };
  });

  await page.screenshot({ path: "artifacts/tipping-card.png", fullPage: false });
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(400);
  await page.screenshot({ path: "artifacts/page-bottom.png" });

  console.log(JSON.stringify(checks, null, 2));
  await browser.close();
})();
