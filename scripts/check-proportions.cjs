const { chromium } = require("@playwright/test");
(async () => {
  const b = await chromium.launch({ channel: "chrome", headless: true });
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  await p.goto("http://localhost:3000/about", { waitUntil: "networkidle" });
  await p.waitForTimeout(500);
  const r = await p.evaluate(() => {
    const w = document.documentElement.clientWidth;
    const portrait = document.querySelector('img[src="/about/portrait.jpg"]').getBoundingClientRect();
    const daejeon = document.querySelector('img[src="/about/daejeon.jpg"]').getBoundingClientRect();
    const id = document.querySelector('img[src="/about/student-id.jpg"]').getBoundingClientRect();
    return {
      viewportW: w,
      portraitW: Math.round(portrait.width), portraitWpct: Math.round(portrait.width/w*100),
      daejeonW: Math.round(daejeon.width), daejeonWpct: Math.round(daejeon.width/w*100),
      daejeonRatio: (daejeon.height/daejeon.width).toFixed(2),
      idW: Math.round(id.width),
      idBelowDaejeon: id.top >= daejeon.bottom,
      gapDaejeonId: Math.round(id.top - daejeon.bottom),
      idLeftVsDaejeon: Math.round(id.left - daejeon.left),
    };
  });
  console.log(JSON.stringify(r, null, 2));
  await p.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await p.waitForTimeout(300);
  await p.screenshot({ path: "artifacts/about-final.png" });
  await b.close();
})();
