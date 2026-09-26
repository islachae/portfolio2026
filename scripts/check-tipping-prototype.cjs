// Verify the tipping case-study "Working prototype" section renders the
// interactive Trust-First Tipping demo in an iframe, assets load, and the
// demo's own interaction (tip popup) works.
const { chromium } = require("@playwright/test");

(async () => {
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const errors = [];
  page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
  page.on("requestfailed", (r) => errors.push("REQFAIL " + r.url()));

  await page.goto("http://localhost:3000/case-studies/tipping", { waitUntil: "networkidle" });

  // 1. Section exists with the eyebrow + heading
  const section = page.locator("#prototype");
  console.log("section present:", (await section.count()) === 1);

  const iframe = section.locator("iframe");
  console.log("iframe present:", (await iframe.count()) === 1);
  console.log("iframe src:", await iframe.getAttribute("src"));

  // scroll the iframe into view so lazy-load triggers
  await iframe.scrollIntoViewIfNeeded();
  await page.waitForTimeout(800);

  // 2. Switch into the iframe and confirm the demo rendered (phone + tip cards)
  const frame = page.frames().find(f => f.url().includes("tipping-demo"));
  console.log("iframe frame found:", !!frame);
  if (frame) {
    await frame.waitForSelector(".tipcard", { timeout: 8000 });
    console.log("tip cards in demo:", await frame.locator(".tipcard").count());
    console.log("screens in demo:", await frame.locator(".screen").count());
    console.log("step label:", await frame.locator("#stepLabel").textContent());

    // 3. Click a tip card -> popup opens
    await frame.locator(".tipcard--trust").click();
    await frame.waitForTimeout(450);
    const popOpen = await frame.locator("#tipPop").evaluate(el => el.classList.contains("open"));
    console.log("tip popup opens on card click:", popOpen);

    // 4. Popup grid has 8 options; click two -> badges appear
    const opts = frame.locator("#tipGrid .tippop-opt");
    console.log("popup options:", await opts.count());
    await opts.nth(0).click();
    await opts.nth(2).click();
    const selected = await opts.evaluateAll(els => els.filter(e => e.classList.contains("selected")).length);
    console.log("selected after 2 clicks:", selected);

    // 5. Submit closes popup
    await frame.locator("#tipSubmit").click();
    await frame.waitForTimeout(450);
    const popClosed = await frame.locator("#tipPop").evaluate(el => !el.classList.contains("open"));
    console.log("popup closes on submit:", popClosed);

    // 6. Place order advances to tracking screen
    await frame.locator("#placeOrder").click();
    await frame.waitForTimeout(500);
    console.log("after place order:", await frame.locator("#stepLabel").textContent());
  }

  await page.screenshot({ path: "scripts/_tipping-prototype-check.png", fullPage: false });
  console.log("console errors:", errors.length ? errors.slice(0, 5) : "none");
  await browser.close();
})();
