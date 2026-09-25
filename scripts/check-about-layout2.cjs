const { chromium } = require("@playwright/test");
(async () => {
  const b = await chromium.launch({ channel: "chrome", headless: true });
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  await p.goto("http://localhost:3000/about", { waitUntil: "networkidle" });
  await p.waitForTimeout(500);
  const r = await p.evaluate(() => {
    const portrait = document.querySelector('img[src="/about/portrait.jpg"]').getBoundingClientRect();
    const daejeon = document.querySelector('img[src="/about/daejeon.jpg"]').getBoundingClientRect();
    const cols = [...document.querySelectorAll("main section")].find(s => s.textContent.includes("off the clock"));
    const colInfo = cols ? [...cols.children[2].children].map(c => {
      const cs = getComputedStyle(c);
      return { translate: cs.translate, rotate: cs.rotate };
    }) : [];
    return { overlapPx: Math.round(portrait.right - daejeon.left), colInfo };
  });
  console.log(JSON.stringify(r, null, 2));
  await b.close();
})();
