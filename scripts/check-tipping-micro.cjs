// Verify the 10 fixes + back button in the tipping demo.
const { chromium } = require("@playwright/test");

(async () => {
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const page = await browser.newPage({ viewport: { width: 560, height: 900 } });
  const errors = [];
  page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
  page.on("requestfailed", (r) => errors.push("REQFAIL " + r.url()));

  await page.goto("http://localhost:3000/case-studies/tipping-demo/index.html", { waitUntil: "networkidle" });
  await page.waitForTimeout(600);

  const frame = page;
  const shot = async (name) => { await page.screenshot({ path: `scripts/_shot-${name}.png` }); };

  // 1. step label + back button present
  console.log("backBtn present:", await page.locator("#backBtn").count() === 1);
  console.log("step label:", await page.locator("#stepLabel").innerText());

  // 2. trust card guide glow
  const trustGuide = await page.locator(".tipcard--trust").evaluate(el =>
    getComputedStyle(el).animationName.includes("guideGlow"));
  console.log("trust card guide glow:", trustGuide);
  await shot("s1");

  // custom tip: clicking should NOT open popup
  await page.locator(".tipcard--custom").click({ force: true });
  await page.waitForTimeout(300);
  console.log("custom tip opens popup (false):", await page.locator("#tipPop").evaluate(el => el.classList.contains("open")));

  // trust card opens popup
  await page.locator(".tipcard--trust").click({ force: true });
  await page.waitForTimeout(450);
  console.log("trust card opens popup:", await page.locator("#tipPop").evaluate(el => el.classList.contains("open")));
  await shot("s1-popup");

  // submit -> place order guided
  await page.locator("#tipSubmit").click();
  await page.waitForTimeout(450);
  console.log("place order guided:", await page.locator("#placeOrder").evaluate(el => el.classList.contains("guide")));

  // go to s2
  await page.locator("#placeOrder").click({ force: true });
  await page.waitForTimeout(500);
  await shot("s2");

  // s2: courier info always visible (no hidden class); location icon flashes; hover -> tooltip
  const courierHidden = await page.locator("#s2 .courier-info").first().evaluate(el => el.classList.contains("hidden"));
  console.log("courier info hidden (should be false):", courierHidden);
  const locGlow = await page.locator("#locZone").evaluate(el => el.classList.contains("guide"));
  console.log("location icon has guide glow:", locGlow);

  // hover location icon -> black tooltip visible
  const locBox = await page.locator("#locZone").boundingBox();
  if (locBox) {
    await page.mouse.move(locBox.x + locBox.width / 2, locBox.y + locBox.height / 2);
    await page.waitForTimeout(400);
  }
  const tipVisible = await page.locator(".dropoff-tip").first().evaluate(el => !el.classList.contains("hidden"));
  console.log("drop-off tooltip revealed on hover:", tipVisible);
  await shot("s2-hover");

  // back button: go back to s1
  await page.locator("#backBtn").click();
  await page.waitForTimeout(400);
  console.log("back to s1:", await page.locator("#s1").evaluate(el => el.classList.contains("active")));

  // forward again to s2 -> s3
  await page.locator("#placeOrder").click({ force: true });
  await page.waitForTimeout(400);
  await page.locator("#delivered").click({ force: true });
  await page.waitForTimeout(500);
  await shot("s3");
  console.log("thumbUp has guide--circle:", await page.locator("#thumbUpHot").evaluate(el => el.classList.contains("guide--circle")));

  // s3 -> s4
  await page.locator("#thumbUpHot").click({ force: true });
  await page.waitForTimeout(500);
  await shot("s4");
  const selCount = await page.locator("#s4 .fb-opt.selected").count();
  console.log("s4 pre-selected option count (should be 1):", selCount);
  console.log("s4 pre-selected is last (Clear Communication):",
    await page.locator("#s4 .fb-opt.selected").getAttribute("data-fb") === "2");

  // click first fb option -> it becomes selected
  await page.locator("#s4 .fb-opt").first().click({ force: true });
  await page.waitForTimeout(300);
  console.log("after click, selected is first:",
    await page.locator("#s4 .fb-opt.selected").getAttribute("data-fb") === "0");

  // s4 -> s5
  await page.locator("#boostTipHot").click({ force: true });
  await page.waitForTimeout(500);
  await shot("s5");

  // slider snap: click far right, tip text should update to $7.50
  const railBox = await page.locator("#sliderRail").boundingBox();
  if (railBox) {
    await page.mouse.click(railBox.x + railBox.width - 2, railBox.y + railBox.height / 2);
    await page.waitForTimeout(300);
  }
  console.log("tip value text:", await page.locator("#s5TipVal").innerText());
  console.log("tip applied text:", await page.locator("#s5TipApplied").innerText());
  await shot("s5-after");

  // view reason: open partial sheet
  await page.locator(".view-reason").first().click({ force: true });
  await page.waitForTimeout(500);
  console.log("reason sheet open:", await page.locator("#reasonSheet").evaluate(el => el.classList.contains("open")));
  await shot("s5-reason");

  console.log("console errors:", errors.length ? errors.slice(0, 6) : "none");
  await browser.close();
})();
