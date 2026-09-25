const { chromium } = require("@playwright/test");
(async () => {
  const b = await chromium.launch({ channel: "chrome", headless: true });
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  await p.goto("http://localhost:3000/about", { waitUntil: "networkidle" });
  await p.waitForTimeout(600);
  const r = await p.evaluate(() => {
    const sid = document.querySelector('img[src="/about/student-id.png"]');
    const dae = document.querySelector('img[src="/about/daejeon.jpg"]');
    const cards = [...document.querySelectorAll("main section")].find(s => s.textContent.includes("My Design Philosophy")).querySelectorAll(".rounded-xl");
    return {
      studentIdLoaded: sid ? sid.complete && sid.naturalWidth > 0 : false,
      daejeonLoaded: dae ? dae.complete && dae.naturalWidth > 0 : false,
      cardBg: cards[0] ? getComputedStyle(cards[0]).backgroundColor : null,
      cardCount: cards.length,
    };
  });
  console.log(JSON.stringify(r, null, 2));
  await b.close();
})();
