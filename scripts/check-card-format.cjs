const {chromium}=require('@playwright/test');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true});
 const failures=[];
 const check=(name,fn)=>{try{fn();console.log('PASS',name);}catch(e){failures.push(name);console.log('FAIL',name,e.message);}};
 const page=await browser.newPage({viewport:{width:1440,height:1200}});
 const errors=[]; page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://localhost:3000/');
 await page.waitForTimeout(300);
 check('no page errors',()=>assert.equal(errors.length,0));

 const firstCard = page.locator('#work .project-card').first();
 const badgeText = await firstCard.locator('span').first().textContent();
 check('type badge present top-right',()=>assert.ok(badgeText && badgeText.trim().length>0));

 const badgeBox = await firstCard.locator('span').first().boundingBox();
 const cardBox = await firstCard.boundingBox();
 check('badge sits in the top-right area of the card',()=>{
   assert.ok(badgeBox.x + badgeBox.width > cardBox.x + cardBox.width * 0.55);
   assert.ok(badgeBox.y - cardBox.y < 60);
 });

 const h3Text = await firstCard.locator('h3').textContent();
 check('title is short (not a full paragraph)',()=>assert.ok(h3Text.length < 60));

 const descCount = await firstCard.locator('p').count();
 check('only one short tag line under title, no long description',()=>assert.ok(descCount<=2));

 const toolChipCount = await firstCard.locator('.rounded-full').count();
 check('no tool-chip list on card',()=>assert.ok(toolChipCount<=1));

 await browser.close();
 if (failures.length) { console.log('FAILURES:', failures.join(', ')); process.exit(1); }
})();
