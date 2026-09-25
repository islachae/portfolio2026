const {chromium}=require('@playwright/test');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true});
 const failures=[];
 const check=(name,fn)=>{try{fn();console.log('PASS',name);}catch(e){failures.push(name);console.log('FAIL',name,e.message);}};
 const page=await browser.newPage({viewport:{width:1440,height:1000}});
 const errors=[]; page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://localhost:3000/about');
 await page.waitForTimeout(500);
 check('no page errors on /about',()=>assert.equal(errors.length,0));
 const hasHeader=await page.locator('header').count();
 check('shared header present',()=>assert.ok(hasHeader>0));
 const hasFooter=await page.locator('footer').count();
 check('shared footer present',()=>assert.ok(hasFooter>0));
 const h1=await page.locator('h1').first().textContent();
 check('h1 greeting present',()=>assert.ok(h1 && h1.includes('Chaewon')));
 const sections=await page.locator('main section').count();
 check('has multiple narrative sections',()=>assert.ok(sections>=5));
 const skillChips=await page.locator('main span').filter({hasText:'Figma'}).count();
 check('skills rendered',()=>assert.ok(skillChips>0));
 await page.goto('http://localhost:3000/');
 await page.click('a[href="/about"]');
 await page.waitForURL('**/about');
 check('nav link navigates to /about',()=>assert.ok(page.url().endsWith('/about')));
 await browser.close();
 if (failures.length) { console.log('FAILURES:', failures.join(', ')); process.exit(1); }
})();
