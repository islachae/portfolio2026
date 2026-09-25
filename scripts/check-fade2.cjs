const { chromium } = require("@playwright/test");
(async () => {
  const b = await chromium.launch({ channel: "chrome", headless: true });
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  await p.goto("http://localhost:3000/about", { waitUntil: "networkidle" });
  await p.waitForTimeout(400);
  const probe = () => p.evaluate(() => {
    const out = {};
    const philH2 = [...document.querySelectorAll("h2")].find(h => h.textContent.includes("My Design Philosophy"));
    out.philWrapper = philH2.parentElement.getAttribute("class") + " | op=" + getComputedStyle(philH2.parentElement).opacity;
    const otcH2 = [...document.querySelectorAll("h2")].find(h => h.textContent.includes("off the clock"));
    out.otcWrapper = otcH2.parentElement.getAttribute("class") + " | op=" + getComputedStyle(otcH2.parentElement).opacity;
    const img = document.querySelector('img[src="/about/end-note.png"]');
    out.ctaWrapper = img.closest("div.relative").parentElement.getAttribute("class") + " | op=" + getComputedStyle(img.closest("div.relative").parentElement).opacity;
    out.scrollY = Math.round(window.scrollY);
    out.h = document.body.scrollHeight;
    return out;
  });
  await p.evaluate(() => window.scrollTo(0, document.body.scrollHeight * 0.45)); await p.waitForTimeout(500);
  console.log("45%:", JSON.stringify(await probe()));
  await p.evaluate(() => window.scrollTo(0, document.body.scrollHeight * 0.75)); await p.waitForTimeout(500);
  console.log("75%:", JSON.stringify(await probe()));
  await p.evaluate(() => window.scrollTo(0, document.body.scrollHeight * 0.9)); await p.waitForTimeout(500);
  console.log("90%:", JSON.stringify(await probe()));
  await b.close();
})();
