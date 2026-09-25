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
 check('no page errors on home',()=>assert.equal(errors.length,0));

 await page.click('header a[href="/design-system"]');
 await page.waitForURL('**/design-system');
 check('clicking logo navigates to /design-system',()=>assert.ok(page.url().endsWith('/design-system')));
 await page.waitForTimeout(300);
 check('no page errors on /design-system',()=>assert.equal(errors.length,0));

 const h1 = await page.locator('h1').first().textContent();
 check('design system h1 present',()=>assert.ok(h1 && h1.length>0));
 const swatchCount = await page.locator('main span[style*="background-color"]').count();
 check('color swatches rendered',()=>assert.ok(swatchCount>=5));
 const sectionCount = await page.locator('main section').count();
 check('multiple documented sections',()=>assert.ok(sectionCount>=5));

 // wordmark still goes home
 await page.click('header a[href="/"]');
 await page.waitForURL('http://localhost:3000/');
 check('wordmark navigates back home',()=>assert.ok(page.url()==='http://localhost:3000/'));

 await browser.close();
 if (failures.length) { console.log('FAILURES:', failures.join(', ')); process.exit(1); }
})();
