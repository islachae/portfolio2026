const { chromium } = require("@playwright/test");

(async () => {
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto("http://localhost:3000/about", { waitUntil: "networkidle" });
  await page.waitForTimeout(400);

  async function measure() {
    return page.evaluate(() => {
      const gap = (src) => {
        const img = document.querySelector(`img[src*="${src}"]`);
        if (!img) return "no-img";
        const wrapper = img.parentElement; // aspect-ratio div containing the img
        const cap = wrapper.nextElementSibling; // caption <p> sibling
        if (!cap) return "no-cap";
        return Math.round(cap.getBoundingClientRect().top - wrapper.getBoundingClientRect().bottom);
      };
      return { sid: gap("student-id"), dae: gap("daejeon") };
    });
  }

  console.log("scroll 0    :", await measure());
  await page.evaluate(() => window.scrollTo(0, 700));
  await page.waitForTimeout(350);
  console.log("scroll 700  :", await measure());
  await page.evaluate(() => window.scrollTo(0, 1400));
  await page.waitForTimeout(350);
  console.log("scroll 1400 :", await measure());

  await browser.close();
})();
