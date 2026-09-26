
const { chromium } = require("@playwright/test");
(async () => {
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const page = await browser.newPage({ viewport: { width: 560, height: 900 } });
  await page.goto("http://localhost:3000/case-studies/tipping-demo/index.html", { waitUntil: "networkidle" });
  await page.waitForTimeout(500);
  await page.locator(".tipcard--trust").click({force:true});
  await page.waitForTimeout(300);
  await page.locator("#tipSubmit").click();
  await page.waitForTimeout(300);
  await page.locator("#placeOrder").click({force:true});
  await page.waitForTimeout(300);
  await page.locator("#delivered").click({force:true});
  await page.waitForTimeout(300);
  await page.locator("#thumbUpHot").click({force:true});
  await page.waitForTimeout(400);
  await page.locator("#boostTipHot").click({force:true});
  await page.waitForTimeout(500);
  const rail = await page.locator("#sliderRail").boundingBox();
  await page.mouse.click(rail.x + rail.width*0.7, rail.y + rail.height/2);
  await page.waitForTimeout(350);
  await page.screenshot({ path: "scripts/_shot-toast3.png" });
  await browser.close();
})();
