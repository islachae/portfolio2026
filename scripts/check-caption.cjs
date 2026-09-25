const { chromium } = require("@playwright/test");
(async () => {
  const b = await chromium.launch({ channel: "chrome", headless: true });
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  await p.goto("http://localhost:3000/about", { waitUntil: "networkidle" });
  await p.waitForTimeout(500);
  const r = await p.evaluate(() => {
    const captions = [...document.querySelectorAll("p")].filter(p =>
      ["hardcore baker","proud foster mom of 14 cats and 1 dog","... and still rooting for the mets"].some(t => p.textContent.trim().includes(t))
    );
    return captions.map(c => ({
      text: c.textContent.trim(),
      color: getComputedStyle(c).color,
      fontSize: getComputedStyle(c).fontSize,
      fontWeight: getComputedStyle(c).fontWeight,
    }));
  });
  console.log(JSON.stringify(r, null, 2));
  await b.close();
})();
