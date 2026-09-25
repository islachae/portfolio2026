const { chromium } = require("@playwright/test");
(async () => {
  const b = await chromium.launch({ channel: "chrome", headless: true });
  const p = await b.newPage();
  await p.goto("http://localhost:3000/about", { waitUntil: "networkidle" });
  await p.waitForTimeout(400);
  const r = await p.evaluate(() => {
    const h1 = document.querySelector("h1");
    const cs = getComputedStyle(h1);
    const imgs = [...document.querySelectorAll("main img")].map(i => ({ src: i.getAttribute("src"), ok: i.complete && i.naturalWidth > 0 }));
    return { h1FontSize: cs.fontSize, h1Weight: cs.fontWeight, h1LetterSpacing: cs.letterSpacing, imgCount: imgs.length, imgs };
  });
  console.log(JSON.stringify(r, null, 2));
  await b.close();
})();
