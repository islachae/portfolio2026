const { chromium } = require("@playwright/test");
(async () => {
  const b = await chromium.launch({ channel: "chrome", headless: true });
  const p = await b.newPage();
  await p.goto("http://localhost:3000/", { waitUntil: "networkidle" });
  const r = await p.evaluate(() => {
    const out = [];
    for (const sheet of document.styleSheets) {
      let rules;
      try { rules = sheet.cssRules; } catch (e) { out.push("SKIP: " + (e.message||"").slice(0,40)); continue; }
      for (const rule of rules) {
        if (rule.selectorText && rule.selectorText.includes("bottom-blur")) {
          out.push("RULE: " + rule.cssText);
        }
      }
    }
    // also count style tags and their content containing backdrop
    const styles = [...document.querySelectorAll("style")].map(s => s.textContent.includes("bottom-blur") ? "STYLE-TAG-HAS-bottom-blur" : null).filter(Boolean);
    return { rules: out, styleTagHit: styles };
  });
  console.log(JSON.stringify(r, null, 2));
  await b.close();
})();
