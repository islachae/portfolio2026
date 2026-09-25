const { chromium } = require("@playwright/test");
(async () => {
  const b = await chromium.launch({ channel: "chrome", headless: true });
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  await p.goto("http://localhost:3000/about", { waitUntil: "networkidle" });
  await p.waitForTimeout(500);
  const r = await p.evaluate(() => {
    const d = document.querySelector('img[src="/about/daejeon.jpg"]');
    const id = document.querySelector('img[src="/about/student-id.jpg"]');
    const dRect = d.getBoundingClientRect();
    const idRect = id.getBoundingClientRect();
    return {
      daejeonW: Math.round(dRect.width), daejeonH: Math.round(dRect.height),
      daejeonIsPortrait: dRect.height > dRect.width,
      daejeonTop: Math.round(dRect.top), daejeonBottom: Math.round(dRect.bottom),
      idTop: Math.round(idRect.top), idBottom: Math.round(idRect.bottom),
      idBelowDaejeon: idRect.top >= dRect.bottom,
      idRightAligned: Math.abs(idRect.right - dRect.right) < 10 || idRect.right > dRect.right,
    };
  });
  console.log(JSON.stringify(r, null, 2));
  await b.close();
})();
