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

 // first work card is the Tipping case study and links correctly
 const firstCardHref = await page.locator('#work [data-cursor-hover]').first().getAttribute('href');
 check('first work card links to /case-studies/tipping',()=>assert.equal(firstCardHref,'/case-studies/tipping'));
 const firstCardTitle = await page.locator('#work [data-cursor-hover]').first().locator('h3').textContent();
 check('first work card is the Tipping project',()=>assert.ok(firstCardTitle.toLowerCase().includes('tipping')));

 // real click-through navigation
 await page.click('#work [data-cursor-hover]:has-text("rethinking tipping")');
 await page.waitForURL('**/case-studies/tipping');
 check('clicking card navigates to the case study',()=>assert.ok(page.url().endsWith('/case-studies/tipping')));
 await page.waitForTimeout(300);
 check('no page errors on case study',()=>assert.equal(errors.length,0));

 const h1 = await page.locator('h1').first().textContent();
 check('case study h1 present',()=>assert.ok(h1 && h1.toLowerCase().includes('tipping')));
 const sectionCount = await page.locator('main section').count();
 check('multiple case study sections',()=>assert.ok(sectionCount>=6));
 const backLinkCount = await page.locator('a[href="/#work"]').count();
 check('back-to-work links present',()=>assert.ok(backLinkCount>=2));

 // dark as-is/to-be block actually renders with both columns
 const darkSection = await page.locator('section.bg-\\[\\#1a1a1a\\]').count();
 check('as-is/to-be dark section rendered',()=>assert.ok(darkSection>=1));

 await browser.close();
 if (failures.length) { console.log('FAILURES:', failures.join(', ')); process.exit(1); }
})();
