const { chromium } = require("@playwright/test");
(async () => {
  const b = await chromium.launch({ channel: "chrome", headless: true });
  const p = await b.newPage();
  await p.goto("http://localhost:3000/", { waitUntil: "networkidle" });
  const r = await p.evaluate(() => {
    const el = document.querySelector(".bottom-blur");
    const out = [];
    for (const sheet of document.styleSheets) {
      let rules;
      try { rules = sheet.cssRules; } catch (e) { continue; }
      for (const rule of rules) {
        if (rule.style && (rule.style.backdropFilter !== undefined) && rule.style.backdropFilter !== "") {
          out.push({ selector: rule.selectorText, value: rule.style.backdropFilter });
        }
      }
    }
    const cs = getComputedStyle(el);
    return { matchedBackdropRules: out, computed: cs.backdropFilter };
  });
  console.log(JSON.stringify(r, null, 2));
  await b.close();
})();
