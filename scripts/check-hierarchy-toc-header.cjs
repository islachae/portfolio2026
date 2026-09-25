const {chromium}=require('@playwright/test');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true});
 const failures=[];
 const check=(name,fn)=>{try{fn();console.log('PASS',name);}catch(e){failures.push(name);console.log('FAIL',name,e.message);}};
 const page=await browser.newPage({viewport:{width:1440,height:1000}});
 const errors=[]; page.on('pageerror',e=>errors.push(e.message));

 // 1) "View case study →" removed from home cards
 await page.goto('http://localhost:3000/');
 await page.waitForTimeout(300);
 check('no page errors on home',()=>assert.equal(errors.length,0));
 const viewCaseStudyCount = await page.locator('#work .project-card', {hasText:'View case study'}).count();
 check('View case study link removed from cards',()=>assert.equal(viewCaseStudyCount,0));

 // 2) header hides on scroll down, reappears on scroll up
 const headerBefore = await page.locator('header').evaluate(el=>getComputedStyle(el).translate);
 await page.evaluate(()=>window.scrollTo(0,1200));
 await page.waitForTimeout(500);
 const headerHidden = await page.locator('header').evaluate(el=>getComputedStyle(el).translate);
 check('header translate changes on scroll down',()=>assert.notEqual(headerBefore, headerHidden));
 await page.evaluate(()=>window.scrollTo(0,900));
 await page.waitForTimeout(500);
 const headerReappear = await page.locator('header').evaluate(el=>getComputedStyle(el).translate);
 check('header reappears on scroll up',()=>assert.equal(headerReappear, headerBefore));

 // 3) case study left TOC exists and links to real sections
 await page.goto('http://localhost:3000/case-studies/tipping');
 await page.waitForTimeout(300);
 const tocLinkCount = await page.locator('nav[aria-label="Case study sections"] a').count();
 check('case study TOC has multiple section links',()=>assert.ok(tocLinkCount>=6));
 const firstTocHref = await page.locator('nav[aria-label="Case study sections"] a').first().getAttribute('href');
 const targetId = firstTocHref.replace('#','');
 const targetExists = await page.locator(`#${targetId}`).count();
 check('TOC link target section exists on page',()=>assert.ok(targetExists>=1));

 // active section updates on scroll
 await page.evaluate(()=>document.getElementById('solution').scrollIntoView());
 await page.waitForTimeout(600);
 const activeLink = await page.locator('nav[aria-label="Case study sections"] a.font-medium').textContent();
 check('active TOC item updates on scroll',()=>assert.ok(activeLink.toLowerCase().includes('solution')));

 // 4) hero status hierarchy: availability badge visually distinct/first
 await page.goto('http://localhost:3000/');
 await page.waitForTimeout(300);
 const badge = page.locator('main .availability-dot').first();
 const badgeParent = await badge.evaluate(el=>el.closest('div').className);
 check('availability sits in its own pill/badge container',()=>assert.ok(badgeParent.includes('rounded-full')));
 const metaRow = await page.locator('main').evaluate(()=>{
   const rows = [...document.querySelectorAll('main div')].filter(d=>d.textContent.includes('NYC') && d.textContent.includes('Carnegie'));
   return rows.length;
 });
 check('secondary metadata (NYC/school/time) grouped separately',()=>assert.ok(metaRow>=1));

 await browser.close();
 if (failures.length) { console.log('FAILURES:', failures.join(', ')); process.exit(1); }
})();
