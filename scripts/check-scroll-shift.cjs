const { chromium } = require("@playwright/test");

(async () => {
  const b = await chromium.launch({ channel: "chrome", headless: true });
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  await p.goto("http://localhost:3000/about", { waitUntil: "networkidle" });
  await p.waitForTimeout(600);

  const grab = () => p.evaluate(() => {
    const els = [...document.querySelectorAll(".will-change-transform")];
    return els.map((el) => ({
      transform: el.style.transform || "(none)",
      hasImg: !!el.querySelector("img"),
      imgSrc: el.querySelector("img")?.getAttribute("src")?.replace("/about/", ""),
    }));
  });

  const before = await grab();
  await p.evaluate(() => window.scrollTo(0, 600));
  await p.waitForTimeout(300);
  const after = await grab();

  const shifted = before.map((b, i) => ({
    imgSrc: b.imgSrc || b.hasImg,
    before: b.transform,
    after: after[i]?.transform,
    changed: b.transform !== after[i]?.transform,
  }));

  await p.evaluate(() => window.scrollTo(0, 0));
  await p.waitForTimeout(300);
  await p.screenshot({ path: "artifacts/about-new-top.png" });
  await p.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await p.waitForTimeout(300);
  await p.screenshot({ path: "artifacts/about-new-bottom.png" });

  console.log(JSON.stringify(shifted, null, 2));
  await b.close();
})();
