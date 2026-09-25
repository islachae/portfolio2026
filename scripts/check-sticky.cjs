const { chromium } = require("@playwright/test");
(async () => {
  const b = await chromium.launch({ channel: "chrome", headless: true });
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  await p.goto("http://localhost:3000/about", { waitUntil: "networkidle" });
  await p.waitForTimeout(800);
  const r = await p.evaluate(() => {
    const blur = document.querySelector(".bottom-blur");
    const hand = document.querySelector(".font-hand");
    const cs = hand ? getComputedStyle(hand) : null;
    return {
      blurRemoved: !blur,
      handFontFamily: cs ? cs.fontFamily : null,
      handText: hand ? hand.textContent.slice(0, 40) : null,
      caveatLoaded: document.fonts.check('16px Caveat'),
    };
  });
  await p.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await p.waitForTimeout(400);
  await p.screenshot({ path: "artifacts/sticky-note.png" });
  console.log(JSON.stringify(r, null, 2));
  await b.close();
})();
