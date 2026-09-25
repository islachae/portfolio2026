const { chromium } = require("@playwright/test");
(async () => {
  const b = await chromium.launch({ channel: "chrome", headless: true });
  const p = await b.newPage();
  await p.setContent(`<style>
    body{margin:0;background:#fff}
    .txt{position:absolute;top:0;left:20px;right:20px;font-size:40px;font-weight:700;line-height:1.3;color:#111}
    .mask{position:fixed;left:0;right:0;bottom:0;height:200px;backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);mask-image:linear-gradient(to top,black,transparent);-webkit-mask-image:linear-gradient(to top,black,transparent)}
    .nomask{position:fixed;left:0;right:0;bottom:0;height:200px;backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px)}
  </style>
  <div class="txt">ABCDEFGHIJKLMNOPQRSTUVWXYZ 0123456789<br>ABCDEFGHIJKLMNOPQRSTUVWXYZ 0123456789<br>ABCDEFGHIJKLMNOPQRSTUVWXYZ 0123456789<br>ABCDEFGHIJKLMNOPQRSTUVWXYZ 0123456789<br>ABCDEFGHIJKLMNOPQRSTUVWXYZ 0123456789<br>ABCDEFGHIJKLMNOPQRSTUVWXYZ 0123456789<br>ABCDEFGHIJKLMNOPQRSTUVWXYZ 0123456789</div>
  <div class="nomask" style="display:none" id="nm"></div>
  <div class="mask" id="mk"></div>`);
  // capture: mask OFF (nomask shown), then mask ON
  await p.evaluate(() => { document.getElementById('mk').style.display='none'; document.getElementById('nm').style.display='block'; });
  await p.waitForTimeout(300);
  await p.screenshot({ path: "artifacts/blur-nomask.png" });
  await p.evaluate(() => { document.getElementById('nm').style.display='none'; document.getElementById('mk').style.display='block'; });
  await p.waitForTimeout(300);
  await p.screenshot({ path: "artifacts/blur-mask.png" });
  console.log("done");
  await b.close();
})();
