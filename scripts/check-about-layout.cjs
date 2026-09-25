const { chromium } = require("@playwright/test");
(async () => {
  const b = await chromium.launch({ channel: "chrome", headless: true });
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  await p.goto("http://localhost:3000/about", { waitUntil: "networkidle" });
  await p.waitForTimeout(500);
  const r = await p.evaluate(() => {
    const portrait = document.querySelector('img[src="/about/portrait.jpg"]').getBoundingClientRect();
    const daejeon = document.querySelector('img[src="/about/daejeon.jpg"]').getBoundingClientRect();
    const phil = document.querySelectorAll("main > section")[1];
    const philBg = phil ? getComputedStyle(phil).backgroundColor : null;
    const subtext = document.body.innerText.includes("where I spontaneously get ideas");
    const tapes = document.querySelectorAll(".bg-\\[var\\(--periwinkle\\)\\]\\/25").length;
    // interest columns transforms
    const cols = [...document.querySelectorAll("main section")].find(s => s.textContent.includes("off the clock"));
    const colTransforms = cols ? [...cols.querySelectorAll(".md\\:translate-y-16, .md\\:translate-y-8, .md\\:rotate-2, .md\\:-rotate-3, .md\\:-rotate-2")].map(el => ({ cls: el.className.split(" ").filter(c=>c.startsWith("md:")).join(" "), t: getComputedStyle(el).transform })) : [];
    return {
      portraitRight: Math.round(portrait.right),
      daejeonLeft: Math.round(daejeon.left),
      overlapPx: Math.round(portrait.right - daejeon.left),
      philosophyBg: philBg,
      hasSubtext: subtext,
      tapeCount: tapes,
      colTransforms,
    };
  });
  console.log(JSON.stringify(r, null, 2));
  await b.close();
})();
