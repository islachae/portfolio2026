const {chromium}=require('@playwright/test');
(async()=>{
 const b=await chromium.launch({channel:'chrome',headless:true});
 const p=await b.newPage({viewport:{width:1440,height:1000}});
 await p.goto('https://vivianzhao.ca/',{waitUntil:'networkidle',timeout:45000});
 await p.waitForTimeout(2000);
 // Look for cursor-related elements: fixed/absolute positioned elements that
 // are hidden initially and appear on mousemove, motion divs, canvas, custom cursor divs.
 const info = await p.evaluate(()=>{
  const all = [...document.querySelectorAll('*')];
  const suspects = all.filter(el=>{
   const cs=getComputedStyle(el);
   return (cs.position==='fixed'||cs.position==='absolute') && (cs.pointerEvents==='none' || el.className.toString().toLowerCase().includes('cursor'));
  }).map(el=>({tag:el.tagName,class:typeof el.className==='string'?el.className:'',id:el.id,style:el.getAttribute('style')?.slice(0,200)}));
  return {count:suspects.length, suspects: suspects.slice(0,40), hasCanvas: !!document.querySelector('canvas'), scripts:[...document.scripts].map(s=>s.src).filter(Boolean).slice(0,20)};
 });
 console.log(JSON.stringify(info,null,1));
 // Now actually move mouse across hero and watch for DOM mutations
 const mutations = [];
 await p.exposeFunction('reportMutation', (m) => mutations.push(m));
 await p.evaluate(() => {
  const mo = new MutationObserver((list) => {
   for (const m of list) {
    if (m.addedNodes.length) {
     for (const n of m.addedNodes) {
      if (n.nodeType === 1) {
       // @ts-ignore
       window.reportMutation({tag: n.tagName, class: n.className, style: n.getAttribute && n.getAttribute('style')});
      }
     }
    }
   }
  });
  mo.observe(document.body, {childList: true, subtree: true});
 });
 await p.mouse.move(400, 300);
 for (let i = 0; i < 40; i++) { await p.mouse.move(400 + i*15, 300 + Math.sin(i/5)*80); await p.waitForTimeout(20); }
 await p.waitForTimeout(500);
 console.log('mutations', JSON.stringify(mutations.slice(0,30)));
 await b.close();
})();
