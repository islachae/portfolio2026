const { chromium } = require("@playwright/test");
(async () => {
  const b = await chromium.launch({ channel: "chrome", headless: true });
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  await p.goto("http://localhost:3000/case-studies/tipping", { waitUntil: "networkidle" });
  await p.waitForTimeout(500);
  await p.evaluate(() => {
    const el = [...document.querySelectorAll("button")].find(b => b.textContent.includes("Savings transparency"));
    if (el) { el.scrollIntoView({ block: "center" }); }
  });
  await p.waitForTimeout(300);
  const before = await p.evaluate(() => {
    const btns = [...document.querySelectorAll("button")];
    const dd = btns.find(b => b.textContent.includes("Savings transparency"));
    return { ddPreviewVisible: !!dd, text: document.body.innerText.includes("click to expand") };
  });
  // click DoorDash preview
  await p.evaluate(() => {
    const el = [...document.querySelectorAll("button")].find(b => b.textContent.includes("Savings transparency"));
    el && el.click();
  });
  await p.waitForTimeout(700);
  const after = await p.evaluate(() => {
    const t = document.body.innerText;
    return {
      doordashExpanded: t.includes("Transparency + honesty in savings"),
      uberCollapsed: t.includes("click to expand"),
    };
  });
  console.log(JSON.stringify({ before, after }, null, 2));
  await b.close();
})();
