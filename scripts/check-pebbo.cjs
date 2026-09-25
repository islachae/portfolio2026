const { chromium } = require("playwright");
(async () => {
  const b = await chromium.launch({ channel: "chrome" });
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  await p.goto("http://localhost:3000/case-studies/pebbo", { waitUntil: "networkidle" });
  await p.waitForTimeout(800);

  // 1. PebboDevice: click cycles mood label
  const devBtn = p.locator('button[aria-label^="Pebbo device"]').first();
  const label0 = await p.locator('text=mood-reactive LED').first().textContent();
  await devBtn.click();
  await p.waitForTimeout(200);
  const label1 = await p.locator('text=mood-reactive LED').first().textContent();
  console.log("device mood before:", label0?.trim().slice(-12), "-> after click:", label1?.trim().slice(-12));

  // 2. EatingLoop: click a stage button
  const loopBtns = p.locator('button', { hasText: /^(Stress|Restrict|Guilt|Binge eating)$/ });
  const count = await loopBtns.count();
  console.log("eating loop stage buttons:", count);

  // 3. PebboAppTabs: click a tab
  const tabBtns = p.locator('button', { hasText: /^(Home|Chat|Summary)$/ });
  console.log("app tab buttons:", await tabBtns.count());

  // 4. AIReasonPanel: expand
  const reason = p.locator('button', { hasText: "Check AI reason" }).first();
  console.log("AI reason button found:", await reason.count() > 0);

  await p.screenshot({ path: "/tmp/pebbo.png", fullPage: false });
  await b.close();
})();
