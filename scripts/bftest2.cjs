const { chromium } = require("@playwright/test");
(async () => {
  const b = await chromium.launch({ channel: "chrome", headless: true });
  const p = await b.newPage();
  // test: backdrop-filter WITH mask-image (same combo as .bottom-blur)
  await p.setContent(`<style>
    .a{position:fixed;bottom:0;height:100px;backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);mask-image:linear-gradient(to top,black,transparent);-webkit-mask-image:linear-gradient(to top,black,transparent);}
    .b{position:fixed;bottom:0;height:100px;backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);}
  </style><div style="height:2000px;font-size:40px">HELLO text</div><div class="a"></div><div class="b" style="bottom:200px"></div>`);
  const r = await p.evaluate(() => {
    const a = getComputedStyle(document.querySelector(".a"));
    const b = getComputedStyle(document.querySelector(".b"));
    return { withMask: a.backdropFilter, withoutMask: b.backdropFilter };
  });
  console.log(JSON.stringify(r));
  await b.close();
})();
