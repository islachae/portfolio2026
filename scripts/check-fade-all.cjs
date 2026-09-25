const { chromium } = require("@playwright/test");
(async () => {
  const b = await chromium.launch({ channel: "chrome", headless: true });
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  await p.goto("http://localhost:3000/about", { waitUntil: "networkidle" });
  await p.waitForTimeout(600);
  const grab = () => p.evaluate(() => {
    const imgs = ["portrait.jpg","daejeon.jpg","student-id.jpg","pancakes.jpg","cats.jpg","mets.jpg"];
    return imgs.map(s => {
      const img = document.querySelector(`img[src="/about/${s}"]`);
      const el = img.closest(".will-change-transform");
      const cs = el ? getComputedStyle(el) : null;
      return { s, opacity: cs ? cs.opacity : null, transform: el ? el.style.transform : null };
    });
  });
  const top = await grab();
  await p.evaluate(() => window.scrollTo(0, 800));
  await p.waitForTimeout(300);
  const mid = await grab();
  await p.evaluate(() => window.scrollTo(0, 1600));
  await p.waitForTimeout(300);
  const lower = await grab();
  console.log(JSON.stringify({ top, mid, lower }, null, 1));
  await b.close();
})();
