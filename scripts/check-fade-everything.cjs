const { chromium } = require("@playwright/test");
(async () => {
  const b = await chromium.launch({ channel: "chrome", headless: true });
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  await p.goto("http://localhost:3000/about", { waitUntil: "networkidle" });
  await p.waitForTimeout(400);
  const get = (sel) => p.evaluate((s) => {
    const el = document.querySelector(s);
    if (!el) return { found: false };
    const r = el.getBoundingClientRect();
    return { found: true, opacity: getComputedStyle(el).opacity, top: Math.round(r.top), boxShadow: getComputedStyle(el).boxShadow };
  }, sel);
  // scroll to a point where philosophy is passing the top
  await p.evaluate(() => window.scrollTo(0, document.body.scrollHeight * 0.45));
  await p.waitForTimeout(500);
  const phil = await p.evaluate(() => {
    const sec = [...document.querySelectorAll("main section")].find(s => s.textContent.includes("My Design Philosophy"));
    const h = sec.querySelector("h2");
    const card = sec.querySelector(".rounded-xl");
    return { h2op: getComputedStyle(h).opacity, cardOp: getComputedStyle(card).opacity, cardBg: getComputedStyle(card).backgroundColor };
  });
  console.log("philosophy@45%:", JSON.stringify(phil));
  // scroll further to check CTA fade + shadow
  await p.evaluate(() => window.scrollTo(0, document.body.scrollHeight * 0.85));
  await p.waitForTimeout(500);
  const cta = await p.evaluate(() => {
    const img = document.querySelector('img[src="/about/end-note.png"]');
    return { op: getComputedStyle(img).opacity, shadow: getComputedStyle(img).boxShadow };
  });
  console.log("cta@85%:", JSON.stringify(cta));
  // caption fade
  await p.evaluate(() => window.scrollTo(0, document.body.scrollHeight * 0.62));
  await p.waitForTimeout(500);
  const cap = await p.evaluate(() => {
    const el = [...document.querySelectorAll("p")].find(x => x.textContent.includes("hardcore baker"));
    return { op: getComputedStyle(el).opacity };
  });
  console.log("baker caption@62%:", JSON.stringify(cap));
  await b.close();
})();
