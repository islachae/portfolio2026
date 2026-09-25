const { chromium } = require("@playwright/test");
(async () => {
  const b = await chromium.launch({ channel: "chrome", headless: true });
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  await p.goto("http://localhost:3000/about", { waitUntil: "networkidle" });
  await p.waitForTimeout(600);
  const getOpacity = () => p.evaluate(() => {
    const el = document.querySelector("h1").parentElement; // ScrollFade wrapper
    return { opacity: getComputedStyle(el).opacity, top: Math.round(el.getBoundingClientRect().top) };
  });
  const at0 = await getOpacity();
  await p.evaluate(() => window.scrollTo(0, 500));
  await p.waitForTimeout(300);
  const at500 = await getOpacity();
  await p.evaluate(() => window.scrollTo(0, 900));
  await p.waitForTimeout(300);
  const at900 = await getOpacity();
  console.log(JSON.stringify({ at0, at500, at900 }, null, 2));
  await b.close();
})();
