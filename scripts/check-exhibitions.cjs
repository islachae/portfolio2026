const { chromium } = require("@playwright/test");

(async () => {
  const b = await chromium.launch({ channel: "chrome", headless: true });
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  await p.goto("http://localhost:3000/about", { waitUntil: "networkidle" });
  await p.waitForTimeout(400);
  // find the Exhibitions heading and scroll to it
  await p.evaluate(() => {
    const h = Array.from(document.querySelectorAll("h2")).find((el) => el.textContent.trim() === "Exhibitions");
    if (h) h.scrollIntoView({ block: "start" });
  });
  await p.waitForTimeout(500);
  await p.screenshot({ path: "/tmp/exhibitions-section.png", fullPage: false });
  console.log("saved");
  await b.close();
})();
