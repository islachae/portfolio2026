const {chromium}=require('@playwright/test');
const fs=require('node:fs');
(async()=>{
 fs.mkdirSync('artifacts',{recursive:true});
 const browser=await chromium.launch({channel:'chrome',headless:true});
 try{
 const page=await browser.newPage({viewport:{width:1440,height:1100},deviceScaleFactor:1});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://localhost:3000/');await page.waitForTimeout(1300);
 console.log('asset status',(await page.request.get('http://localhost:3000/cursor-glow.png')).status());
 await page.mouse.move(820,430);for(let i=0;i<32;i++){await page.mouse.move(820+i*12,430+Math.sin(i/7)*65);await page.waitForTimeout(8);}
 await page.screenshot({path:'artifacts/desktop-cursor.png'});
 await page.locator('#work').scrollIntoViewIfNeeded();await page.waitForTimeout(1000);await page.screenshot({path:'artifacts/two-column-work.png'});
 for(const width of [1440,1024,768,640,390,320]){
 await page.setViewportSize({width,height:900});
 console.log('layout',await page.evaluate(()=>({width:innerWidth,overflow:document.documentElement.scrollWidth>innerWidth,header: getComputedStyle(document.querySelector('header')).paddingLeft,main:getComputedStyle(document.querySelector('main')).paddingLeft,section:getComputedStyle(document.querySelector('#work')).paddingLeft,columns:getComputedStyle(document.querySelector('#work .project-grid')).gridTemplateColumns})));
 }
 await page.setViewportSize({width:390,height:844});await page.evaluate(()=>scrollTo(0,0));await page.waitForTimeout(800);await page.screenshot({path:'artifacts/mobile.png'});
 console.log('page errors',JSON.stringify(errors));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
