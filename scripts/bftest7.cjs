const { chromium } = require("@playwright/test");
(async () => {
  const b = await chromium.launch({ channel: "chrome", headless: true });
  const p = await b.newPage({ viewport: { width: 800, height: 600 } });
  const lines = Array.from({length: 30}, (_,i) => `<div style="font-size:26px;font-weight:700;line-height:1.35;color:#111">LINE ${i} ABCDEFGHIJKLMNOPQRSTUVWXYZ 0123456789</div>`).join("");
  await p.setContent(`<style>
    body{margin:0;background:#fff;font-family:sans-serif}
    .m{position:fixed;left:0;right:0;bottom:0;height:180px;backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);mask-image:linear-gradient(to top,black 30%,transparent 100%);-webkit-mask-image:linear-gradient(to top,black 30%,transparent 100%)}
  </style>${lines}<div class="m"></div>`);
  await p.waitForTimeout(400);
  await p.screenshot({ path: "artifacts/blur-final-test.png" });
  console.log("done");
  await b.close();
})();
