const {chromium}=require('@playwright/test');
const fs=require('node:fs');
(async()=>{
 const b=await chromium.launch({channel:'chrome',headless:true});fs.mkdirSync('artifacts/references',{recursive:true});
 try {for(const [name,url] of [['lana','https://lana-farkas.vercel.app/'],['vivian','https://vivianzhao.ca/']]){
 const p=await b.newPage({viewport:{width:1440,height:1000}});
 try{
 await p.goto(url,{waitUntil:'domcontentloaded',timeout:45000});await p.waitForTimeout(3500);
 console.log(name,await p.evaluate(()=>({title:document.title,text:document.body.innerText.slice(0,1600),links:[...document.querySelectorAll('a')].map(a=>({text:a.innerText.slice(0,140),href:a.getAttribute('href'),class:a.className})).filter(a=>a.text||a.href?.includes('case')).slice(0,30)})));
 await p.screenshot({path:`artifacts/references/${name}-home.png`});
 if(name==='lana'){
 const links=p.locator('a[href*="case-stud"]'); console.log('case links',await links.count());
 if(await links.count()){
 const card=links.first();await card.scrollIntoViewIfNeeded();await p.waitForTimeout(700);
 console.log('lana card before',await card.evaluate(el=>({html:el.outerHTML.slice(0,14000),rect:el.getBoundingClientRect().toJSON()})));
 await p.screenshot({path:'artifacts/references/lana-before.png'});
 await card.hover();await p.waitForTimeout(700);
 console.log('lana hover',await card.evaluate(el=>({rect:el.getBoundingClientRect().toJSON(),nodes:[el,...el.querySelectorAll('*')].map(n=>{const c=getComputedStyle(n);return {tag:n.tagName,class:n.className,transform:c.transform,opacity:c.opacity,shadow:c.boxShadow,bg:c.backgroundColor}}).slice(0,35)})));
 await p.screenshot({path:'artifacts/references/lana-hover.png'});
 }
 } else {
 await p.mouse.move(200,280); for(let i=0;i<30;i++){await p.mouse.move(200+i*24,300+Math.sin(i/6)*90);await p.waitForTimeout(15)}
 await p.screenshot({path:'artifacts/references/vivian-trail.png'});
 console.log('vivian moving elements',await p.evaluate(()=>[...document.querySelectorAll('img,canvas')].map(el=>({tag:el.tagName,src:el.getAttribute('src'),class:el.className,style:el.getAttribute('style'),parent:el.parentElement?.className})).slice(-35)));
 }
 }catch(e){console.log(name,'ERROR',e.message)}finally{await p.close()}
 }}finally{await b.close()}
})();
