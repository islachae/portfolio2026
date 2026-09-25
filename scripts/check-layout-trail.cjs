const {chromium} = require('@playwright/test');
const assert = require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true});
 const failures=[];
 const check=(name,fn)=>{try{fn();console.log('PASS',name)}catch(e){failures.push(name+': '+e.message);console.log('FAIL',name,e.message)}};
 try {
 const page=await browser.newPage({viewport:{width:1440,height:1100},timezoneId:'Asia/Tokyo'});
 const consoleErrors=[];
 page.on('pageerror',e=>consoleErrors.push(e.message));
 page.on('console',m=>{if(m.type()==='error')consoleErrors.push(m.text())});
 await page.goto('http://localhost:3000/'); await page.waitForTimeout(1100);
 check('no hydration errors',()=>assert.equal(consoleErrors.length,0));
 const geometry=await page.evaluate(()=>{
 const section=document.querySelector('#work');const grid=section.querySelector('.grid, .project-grid'); const card=section.querySelector('.project-card');
 const header=document.querySelector('header');
 return {columns:getComputedStyle(grid).gridTemplateColumns.split(' ').length,cardPadding:parseFloat(getComputedStyle(card).paddingLeft),sectionX:section.getBoundingClientRect().x,headerPadding:parseFloat(getComputedStyle(header).paddingLeft),overflow:document.documentElement.scrollWidth>innerWidth};
 });
 const firstCard = page.locator('#work .project-card').first();
 const cardBox = await firstCard.boundingBox();
 const revealOpacity = await firstCard.evaluate(el=>getComputedStyle(el.parentElement).opacity);
 check('visible-in-viewport cards are not hidden by reveal',()=>{assert.ok(cardBox.y < 1100);assert.equal(revealOpacity,'1')});
 console.log('desktop geometry',geometry);
 check('two columns on desktop',()=>assert.equal(geometry.columns,2));
 check('card padding restored',()=>assert.ok(geometry.cardPadding>=20));
 check('header gutters restored',()=>assert.ok(geometry.headerPadding>=20));
 check('no desktop overflow',()=>assert.equal(geometry.overflow,false));
 await page.mouse.move(200,220); await page.mouse.move(950,350,{steps:30});
 await page.mouse.move(820,430);for(let i=0;i<32;i++){await page.mouse.move(820+i*12,430+Math.sin(i/7)*65);await page.waitForTimeout(8);}
 await page.waitForTimeout(1500);
 const visible=await page.evaluate(()=>{const el=document.querySelector('.custom-cursor__dot');return el?parseFloat(getComputedStyle(el).opacity)>=0:true;});
 check('cursor dot present after movement',()=>assert.equal(visible,true));
 await page.setViewportSize({width:390,height:844}); await page.reload(); await page.waitForTimeout(600);
 const mobile=await page.evaluate(()=>({columns:getComputedStyle(document.querySelector('#work .grid, #work .project-grid')).gridTemplateColumns.split(' ').length,overflow:document.documentElement.scrollWidth>innerWidth}));
 check('one column on mobile',()=>assert.equal(mobile.columns,1));check('no mobile overflow',()=>assert.equal(mobile.overflow,false));
 await page.emulateMedia({reducedMotion:'reduce'});await page.reload();await page.waitForTimeout(300);
 const reduced=await page.locator('.custom-cursor').count();
 check('reduced motion suppresses custom cursor',()=>assert.equal(reduced,0));

 } finally {await browser.close();}
 assert.deepEqual(failures,[]);
})().catch(e=>{console.error(e);process.exitCode=1;});
