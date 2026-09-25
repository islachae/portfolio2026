const {chromium}=require('@playwright/test');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true});
 const failures=[];
 const check=(name,fn)=>{try{fn();console.log('PASS',name);}catch(e){failures.push(name);console.log('FAIL',name,e.message);}};
 const page=await browser.newPage({viewport:{width:1440,height:900}});
 await page.goto('http://localhost:3000/');
 await page.waitForTimeout(600);

 const fontLoaded = await page.evaluate(async () => {
   await document.fonts.ready;
   return [...document.fonts].some(f => f.family.toLowerCase().includes('satoshi'));
 });
 check('Satoshi font face loaded', () => assert.ok(fontLoaded));

 const bodyFont = await page.evaluate(() => getComputedStyle(document.body).fontFamily);
 check('body font-family includes Satoshi', () => assert.ok(bodyFont.toLowerCase().includes('satoshi')));

 const logoText = await page.locator('header a[href="/design-system"] svg text').first().textContent();
 check('logo character is 采', () => assert.equal(logoText.trim(), '采'));

 const circleStyle = await page.locator('header a[href="/design-system"]').first().evaluate(el => {
   const s = getComputedStyle(el);
   return { bg: s.backgroundColor, border: s.borderColor, borderWidth: s.borderWidth };
 });
 check('circle has charcoal fill', () => assert.equal(circleStyle.bg, 'rgb(43, 43, 43)'));
 check('circle has black border', () => assert.ok(circleStyle.border.includes('0, 0, 0') || circleStyle.border === 'rgb(0, 0, 0)'));

 const wordmarkColor = await page.locator('header a[href="/"]').first().evaluate(el => getComputedStyle(el).color);
 check('wordmark matches charcoal', () => assert.equal(wordmarkColor, 'rgb(43, 43, 43)'));

 await page.screenshot({ path: 'artifacts/logo-check.png', clip: { x: 0, y: 0, width: 400, height: 100 } });

 await browser.close();
 if (failures.length) { console.log('FAILURES:', failures.join(', ')); process.exit(1); }
})();
