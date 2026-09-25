const { chromium } = require("@playwright/test");
(async () => {
  const b = await chromium.launch({ channel: "chrome", headless: true });
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  await p.goto("http://localhost:3000/", { waitUntil: "networkidle" });
  await p.waitForTimeout(500);
  await p.evaluate(() => {
    const el = document.querySelector(".bottom-blur");
    el.style.backdropFilter = "blur(20px)";
    el.style.webkitBackdropFilter = "blur(20px)";
    el.style.maskImage = "none";       // isolate: no mask, strong blur
    el.style.webkitMaskImage = "none";
    el.style.background = "rgba(0,0,0,0.15)"; // tint so we can SEE the overlay region
  });
  await p.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await p.waitForTimeout(500);
  await p.screenshot({ path: "artifacts/isolate-nomask.png" });
  console.log("done");
  await b.close();
})();
