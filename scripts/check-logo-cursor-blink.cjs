const {chromium}=require('@playwright/test');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true});
 const failures=[];
 const check=(name,fn)=>{try{fn();console.log('PASS',name);}catch(e){failures.push(name);console.log('FAIL',name,e.message);}};
 const page=await browser.newPage({viewport:{width:1440,height:1000}});
 const errors=[]; page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://localhost:3000/');
 await page.waitForTimeout(300);
 check('no page errors on load',()=>assert.equal(errors.length,0));

 // 1) logo hover: no scale, gray silhouette fades in, frame draws in
 const logoLink = page.locator('header a[href="/design-system"]');
 const beforeTransform = await logoLink.evaluate(el=>getComputedStyle(el).transform);
 await logoLink.hover();
 await page.waitForTimeout(300);
 const afterTransform = await logoLink.evaluate(el=>getComputedStyle(el).transform);
 check('logo does NOT scale on hover',()=>assert.equal(beforeTransform, afterTransform));
 const ghostOpacity = await page.locator('.logo-mark__ghost').first().evaluate(el=>getComputedStyle(el).opacity);
 check('gray silhouette fades in on hover',()=>assert.ok(parseFloat(ghostOpacity)>0.8));
 const glyphOpacity = await page.locator('.logo-mark__glyph').first().evaluate(el=>getComputedStyle(el).opacity);
 check('white glyph fades out on hover',()=>assert.ok(parseFloat(glyphOpacity)<0.2));
 const frameOpacity = await page.locator('.logo-mark__frame rect').first().evaluate(el=>getComputedStyle(el).opacity);
 check('frame draws in on hover',()=>assert.ok(parseFloat(frameOpacity)>0.8));
 await page.mouse.move(10,10);
 await page.waitForTimeout(300);

 // 2) arrow-circle cursor only on project cards, not on logo/pills/nav
 await logoLink.hover();
 await page.waitForTimeout(300);
 const hoveringOnLogo = await page.locator('.custom-cursor').getAttribute('data-hovering');
 check('cursor circle does NOT activate on logo hover',()=>assert.equal(hoveringOnLogo,'false'));

 const navLink = page.locator('.nav-link').first();
 await navLink.hover();
 await page.waitForTimeout(300);
 const hoveringOnNav = await page.locator('.custom-cursor').getAttribute('data-hovering');
 check('cursor circle does NOT activate on nav hover',()=>assert.equal(hoveringOnNav,'false'));

 const card = page.locator('.project-card').first();
 await card.scrollIntoViewIfNeeded();
 const box = await card.boundingBox();
 await page.mouse.move(box.x + box.width/2, box.y + box.height/2, {steps:10});
 await page.waitForTimeout(300);
 const hoveringOnCard = await page.locator('.custom-cursor').getAttribute('data-hovering');
 check('cursor circle DOES activate on project card hover',()=>assert.equal(hoveringOnCard,'true'));

 // 3) availability dot blinks (soft opacity animation, not display:none)
 const dotAnim = await page.locator('.availability-dot').first().evaluate(el=>getComputedStyle(el).animationName);
 check('availability dot has blink animation',()=>assert.equal(dotAnim,'availability-blink'));
 const dotDuration = await page.locator('.availability-dot').first().evaluate(el=>getComputedStyle(el).animationDuration);
 check('blink duration is slow/soft (>1s)',()=>assert.ok(parseFloat(dotDuration)>1));

 await browser.close();
 if (failures.length) { console.log('FAILURES:', failures.join(', ')); process.exit(1); }
})();
