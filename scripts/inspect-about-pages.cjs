const {chromium}=require('@playwright/test');
(async()=>{
 const b=await chromium.launch({channel:'chrome',headless:true});
 for (const [name,url] of [['vivian-info','https://vivianzhao.ca/info'],['michelle-about','https://www.liumichelle.com/about'],['sophia-about','https://sophiamanalo.com/about']]) {
  const p=await b.newPage({viewport:{width:1440,height:1400}});
  try {
   await p.goto(url,{waitUntil:'domcontentloaded',timeout:30000});
   await p.waitForTimeout(2000);
   console.log(name, JSON.stringify(await p.evaluate(()=>({title:document.title,text:document.body.innerText.slice(0,2500)}))));
   await p.screenshot({path:`artifacts/references/${name}.png`, fullPage:true});
  } catch(e) { console.log(name,'ERROR',e.message); }
  finally { await p.close(); }
 }
 await b.close();
})();
