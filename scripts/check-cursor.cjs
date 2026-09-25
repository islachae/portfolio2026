const { chromium } = require('@playwright/test');
const assert = require('node:assert/strict');
(async () => {
 const browser = await chromium.launch({channel:'chrome',headless:true});
 try {
 const page = await browser.newPage({viewport:{width:1440,height:1000}});
 await page.goto('http://localhost:3000/');
 await page.waitForTimeout(1200);
 await page.mouse.move(250,250);
 await page.mouse.move(750,380,{steps:20});
 await page.waitForTimeout(150);
 const result = await page.locator('.cursor-trail').evaluate(el => ({opacity:getComputedStyle(el).opacity, points:[...el.children].map(p=>({x:p.getBoundingClientRect().x,y:p.getBoundingClientRect().y,transform:p.style.transform}))}));
 console.log(JSON.stringify(result));
 assert.ok(result.points.some(p=>p.x>200 && p.y>100),'Trail must paint near moved cursor, not stay at origin after effect replay');
 console.log('PASS cursor motion after development-mode mount');
 } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
