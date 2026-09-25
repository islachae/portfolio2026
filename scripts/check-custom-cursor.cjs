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

 const cursorCount = await page.locator('.custom-cursor').count();
 check('custom cursor mounted',()=>assert.equal(cursorCount,1));

 const nativeCursorBody = await page.evaluate(()=>getComputedStyle(document.body).cursor);
 check('native cursor hidden on body',()=>assert.equal(nativeCursorBody,'none'));
 const card = page.locator('[data-cursor-hover]').first();
 const nativeCursorCard = await card.evaluate(el=>getComputedStyle(el).cursor);
 check('native cursor hidden on card',()=>assert.equal(nativeCursorCard,'none'));

 await page.mouse.move(200,200);
 await page.mouse.move(250,250,{steps:6});
 await page.waitForTimeout(200);
 const stateIdle = await page.locator('.custom-cursor').getAttribute('data-hovering');
 check('idle state is not hovering',()=>assert.equal(stateIdle,'false'));
 const dotOpacityIdle = await page.locator('.custom-cursor__dot').evaluate(el=>getComputedStyle(el).opacity);
 check('small dot visible at rest',()=>assert.ok(parseFloat(dotOpacityIdle)>0.8));
 const arrowOpacityIdle = await page.locator('.custom-cursor__arrow').evaluate(el=>getComputedStyle(el).opacity);
 check('arrow circle hidden at rest',()=>assert.ok(parseFloat(arrowOpacityIdle)<0.1));

 await card.scrollIntoViewIfNeeded();
 const box = await card.boundingBox();
 await page.mouse.move(box.x + box.width/2, box.y + box.height/2, {steps:10});
 await page.waitForTimeout(300);
 const stateHover = await page.locator('.custom-cursor').getAttribute('data-hovering');
 check('hover state activates over card',()=>assert.equal(stateHover,'true'));
 const dotOpacityHover = await page.locator('.custom-cursor__dot').evaluate(el=>getComputedStyle(el).opacity);
 check('dot fades out on hover',()=>assert.ok(parseFloat(dotOpacityHover)<0.2));
 const arrowOpacityHover = await page.locator('.custom-cursor__arrow').evaluate(el=>getComputedStyle(el).opacity);
 check('arrow circle appears on hover',()=>assert.ok(parseFloat(arrowOpacityHover)>0.8));
 const arrowSize = await page.locator('.custom-cursor__arrow').evaluate(el=>({w:el.offsetWidth,h:el.offsetHeight}));
 check('arrow circle is ~40-45px',()=>assert.ok(arrowSize.w>=38 && arrowSize.w<=48));
 const arrowBg = await page.locator('.custom-cursor__arrow').evaluate(el=>getComputedStyle(el).backgroundColor);
 check('arrow circle background is white',()=>assert.ok(arrowBg.includes('255, 255, 255')));
 const hasSvg = await page.locator('.custom-cursor__arrow svg').count();
 check('arrow icon rendered inside circle',()=>assert.ok(hasSvg>0));

 await page.mouse.move(box.x - 100, box.y - 100, {steps:10});
 await page.waitForTimeout(300);
 const stateAfter = await page.locator('.custom-cursor').getAttribute('data-hovering');
 check('reverts to dot state after leaving card',()=>assert.equal(stateAfter,'false'));

 await page.emulateMedia({reducedMotion:'reduce'});
 await page.reload();
 await page.waitForTimeout(300);
 const cursorCountReduced = await page.locator('.custom-cursor').count();
 check('custom cursor absent under reduced motion',()=>assert.equal(cursorCountReduced,0));
 const nativeRestored = await page.evaluate(()=>getComputedStyle(document.body).cursor);
 check('native cursor restored under reduced motion',()=>assert.notEqual(nativeRestored,'none'));

 await browser.close();
 if (failures.length) { console.log('FAILURES:', failures.join(', ')); process.exit(1); }
})();
