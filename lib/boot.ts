/**
 * What paints before the site's stylesheet and JavaScript arrive (inlined into <head> by
 * app/layout.tsx). On a slow phone the stylesheet alone takes ~3s and a case-study link waited
 * on all the JavaScript (~14s on 3G) with a white screen; these fill that gap.
 *
 * 1. The monogram loader (#cw-boot): on Home only. The first visit on a browser plays it as an
 *    intro (~4.9s with the flight, localStorage "cw-intro"), whatever the speed; later visits show
 *    it only if the page isn't ready after 0.3s. Any click, tap, scroll or key skips it once the
 *    page is ready. The ring fills with real steps (page parsed → styles in → fonts in, waiting
 *    at most 0.4s for fonts; they swap in after), never a timer. Under it, “Curiously, Chaewon”
 *    writes itself again the way she wrote it (lib/signature.ts, traced from a recording of her
 *    hand: stroke order, pace and pen lifts, ~3.5s, with a breath after the comma). When the page
 *    is ready and the writing has finished, the full stop lands as a small violet dot where she
 *    put hers (data-boot="done"); 0.26s later the ring fades, the signature sinks away and the
 *    monogram flies into the name chip (or the phone bar's mark), and the page is simply there
 *    under it. On a later visit, if the page gets ready mid-word, the rest is written 4× faster.
 *    Reduced motion: the signature is just there, the dot appears, it all fades.
 *    ⌘K → “Replay the intro” runs it again (window.cwIntro).
 *    It plays while React is waking the page up, so nothing in it may wait for the main thread:
 *    the pen draws on a canvas from a worker (OffscreenCanvas; on the main thread only where
 *    that's missing), the ring fills by two half-arcs turning in, the backdrop fades as a layer
 *    (transforms and opacity, on the compositor). The Home gradient (three.js) waits until the
 *    intro is over (components/ShaderHero.tsx); compiling its shader used to freeze the flight.
 * 2. The outline (#cw-skel): a link straight to a long read draws its frame until the page itself
 *    is ready. A case study (/#case/…): the bar and its split first screen (title and facts on
 *    the left, the prototype on the right). About (/#about/story): the bar, the table of
 *    contents, and the title and picture placeholders.
 */

import { PACE, SIGNATURE } from "./signature";

// Her full stop, as a share of the drawing: the violet dot lands there, a little wider than the pen
const pct = (v: number) => Math.round(v * 1e4) / 100;
const dotX = pct(SIGNATURE.stop[0] / SIGNATURE.w);
const dotY = pct(SIGNATURE.stop[1] / SIGNATURE.h);
const dotD = pct((SIGNATURE.pen * 1.25) / SIGNATURE.w);

const light = "--v:#6c4fe0;--bg:#fafcfd;--i:#32404f;--t:#6a737e;--l:#e2e5e8;--s:#eef0f2;--s2:#f9fafb;--mono-bg:#2b2b2b;--mono-fg:#ffffff;";
const dark = "--v:#a996ff;--bg:#0e0f11;--i:#f7f7f8;--t:#9e9fa0;--l:#353537;--s:#1b1c1e;--s2:#26272a;--mono-bg:#ececef;--mono-fg:#0b0b0c;";

export const bootCss = `
html{background:#fafcfd}
html[data-theme=dark]{background:#0e0f11}
@media (prefers-color-scheme:dark){html:not([data-theme=light]){background:#0e0f11}}
html[data-cssw] body{visibility:hidden}html[data-cssw] #cw-boot,html[data-cssw] #cw-skel{visibility:visible}
#cw-boot,#cw-skel{display:none;${light}}
html[data-theme=dark] #cw-boot,html[data-theme=dark] #cw-skel{${dark}}
@media (prefers-color-scheme:dark){html:not([data-theme=light]) #cw-boot,html:not([data-theme=light]) #cw-skel{${dark}}}
html[data-boot]{overflow:hidden}
html[data-boot] #cw-boot{display:flex}
#cw-boot{position:fixed;inset:0;z-index:200;flex-direction:column;align-items:center;justify-content:center;gap:28px}
.cwb-bg{position:absolute;inset:0;background:var(--bg)}
.cwb-sig{position:relative;width:min(195px,49.4vw);color:var(--i)}
.cwb-pen{display:block;width:100%;height:auto;aspect-ratio:${SIGNATURE.w}/${SIGNATURE.h}}
html[data-boot] .cwb-arc,html[data-boot] .cwb-mono{will-change:transform}
html[data-boot=on] .cwb-mark,html[data-boot=on] .cwb-sig{animation:cwb-in .3s ease-out both}
@keyframes cwb-in{from{opacity:0;transform:translateY(4px)}}
.cwb-dot{position:absolute;left:${dotX}%;top:${dotY}%;width:${dotD}%;aspect-ratio:1;margin:-${dotD / 2}% 0 0 -${dotD / 2}%;border-radius:50%;background:var(--v);transform:scale(0)}
html[data-boot=done] .cwb-dot,html[data-boot=out] .cwb-dot{animation:cwb-dot .34s cubic-bezier(.3,1.7,.5,1) both}
@keyframes cwb-dot{from{transform:scale(0)}to{transform:scale(1)}}
.cwb-mark{position:relative;width:112px;height:112px}
.cwb-ring{position:absolute;inset:0}
.cwb-ring svg{position:absolute;top:0;left:0;width:112px;height:112px;overflow:visible}
.cwb-ring circle,.cwb-ring path{fill:none;stroke-width:1.5}
.cwb-track{stroke:var(--l)}
.cwb-half{position:absolute;top:0;width:56px;height:112px;overflow:hidden}
.cwb-half--l{left:0}
.cwb-half--r{left:56px}
.cwb-half--r svg{left:-56px}
.cwb-ring .cwb-arc{stroke:var(--i);transform-origin:56px 56px}
.cwb-mono{position:absolute;left:24px;top:24px;width:64px;height:64px;display:block}
html[data-boot=out] .me-chip-mark,html[data-boot=out] .mobilebar-home svg{visibility:hidden}
html[data-booting] #cw-skel{display:block}
#cw-skel{position:fixed;inset:0;z-index:30;overflow:hidden;background:var(--bg);color:var(--t);font:14px/1.4 system-ui,-apple-system,sans-serif}
#cw-skel i{display:block;background:var(--s)}
.cws-bar{display:flex;align-items:center;justify-content:space-between;height:56px;padding:0 24px;border-bottom:1px solid var(--l)}
.cws-back{display:inline-flex;align-items:center;gap:4px;margin-left:-4px}
.cws-links{display:flex;align-items:center;gap:28px;color:var(--t);font:12px/1 ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.04em}
.cws-toc{position:absolute;top:136px;left:max(24px,calc(50% - 600px));width:168px;padding:2px 0;border-left:1px solid var(--l)}
#cw-skel .cws-toc i{height:10px;margin:14px 0 14px 14px;width:70%}
#cw-skel .cws-toc i:nth-child(2n){width:52%}
#cw-skel .cws-toc i:nth-child(3n){width:84%}
.cws-col{box-sizing:content-box;max-width:768px;margin:0 auto;padding:88px 24px 0}
#cw-skel .cws-e{width:34%;height:12px}
#cw-skel .cws-h1{width:88%;height:40px;margin-top:18px}
#cw-skel .cws-h1b{width:56%;margin-top:10px}
#cw-skel .cws-sub{width:68%;height:16px;margin-top:22px}
.cws-meta{display:flex;gap:40px;margin-top:40px}
#cw-skel .cws-meta i{width:120px;height:34px}
#cw-skel .cws-fig{height:min(418px,52vw);margin-top:48px;background:linear-gradient(100deg,var(--s) 36%,var(--s2) 50%,var(--s) 64%) 0 0/300% 100% var(--s);animation:cws 1.6s linear infinite}
@keyframes cws{from{background-position:100% 0}to{background-position:0 0}}
html[data-booting=case] .cws-toc,html[data-booting=case] .cws-col,html[data-booting=about] .cws-split{display:none}
.cws-split{display:grid;grid-template-columns:minmax(300px,372px) minmax(0,1fr);column-gap:32px;align-items:center;height:calc(100vh - 56px);min-height:600px;max-height:1040px;padding:36px max(32px,calc(50% - 688px)) 24px max(24px,calc(50% - 600px))}
.cws-split .cws-meta{flex-wrap:wrap;gap:20px 24px;max-width:300px}
#cw-skel .cws-split .cws-fig{width:min(340px,100%);height:86%;margin:0 auto}
@media (max-width:1199px){.cws-toc{display:none}}
@media (max-width:1023px){.cws-split{display:block;height:auto;min-height:0;max-height:none;padding:48px 24px 0}#cw-skel .cws-split .cws-fig{width:100%;height:min(640px,78vh);margin-top:24px}.cws-split .cws-meta{display:none}}
@media (max-width:799px){.cws-links{display:none}.cws-bar{padding:0 16px}.cws-split{padding:32px 16px 0}.cws-col{padding:48px 16px 0}#cw-skel .cws-h1{height:30px}#cw-skel .cws-meta i{width:90px}}
html[data-motion=reduced] #cw-skel .cws-fig{animation:none}
html[data-motion=reduced] .cwb-mark,html[data-motion=reduced] .cwb-sig{animation:none}
html[data-motion=reduced][data-boot=done] .cwb-dot,html[data-motion=reduced][data-boot=out] .cwb-dot{animation:none;transform:none}
@media (prefers-reduced-motion:reduce){#cw-skel .cws-fig{animation:none}html[data-boot] .cwb-mark,html[data-boot] .cwb-sig{animation:none}html[data-boot=done] .cwb-dot,html[data-boot=out] .cwb-dot{animation:none;transform:none}}
`.replace(/\n/g, "");

/**
 * First thing that runs: the stylesheet was set to media="print" by scripts/defer-css.mjs so it
 * doesn't block the first paint. Switch each one on as soon as it has loaded; until all are on,
 * data-cssw keeps the page hidden (the loader and the outline still show). Gives up after 12s
 * and switches them on anyway. In dev (no deferred links) this does nothing.
 */
export const cssScript = `
var CL=document.querySelectorAll("link[data-cw-css]"),C0=Date.now();
function cssOn(){for(var i=0;i<CL.length;i++){var l=CL[i];if(l.media==="all")continue;if(l.sheet||Date.now()-C0>12000)l.media="all";else return false}d.removeAttribute("data-cssw");return true}
if(CL.length){d.setAttribute("data-cssw","");for(var i=0;i<CL.length;i++){CL[i].addEventListener("load",cssOn);CL[i].addEventListener("error",function(){this.media="all";cssOn()})}
  (function tick(){if(!cssOn())setTimeout(tick,40)})()}
`;

/** Runs inside bootScript's function, where d = <html>, W = window, h = location.hash. */
export const introScript = `
var P=0,shown=0,busy=0,RA=0,LA=0,A0=0,A1=0;
function reduce(){return d.dataset.motion==="reduced"||!!(W.matchMedia&&W.matchMedia("(prefers-reduced-motion: reduce)").matches)}
/* The ring fills clockwise from 12 o'clock with transforms only (two half-arcs turning in behind
   two half-windows), so it keeps moving on the compositor while the page's JavaScript is busy.
   A new step starts from wherever the last one had got to. */
function arcs(){var b=document.getElementById("cw-boot");return b?[b.querySelector(".cwb-half--r .cwb-arc"),b.querySelector(".cwb-half--l .cwb-arc")]:[]}
function rot(a){return"rotate("+a+"deg)"}
function ring(p){var a=arcs(),r=a[0],l=a[1];if(!r||!l)return;
  var q=A1;if(RA){try{var c=RA.effect.getComputedTiming().progress;if(c!=null)q=A0+(A1-A0)*c}catch(e){}RA.cancel();LA.cancel();RA=LA=0}
  A0=q;A1=p;var f0=Math.min(q,.5)*360,f1=Math.max(q-.5,0)*360,t0=Math.min(p,.5)*360,t1=Math.max(p-.5,0)*360;
  if(reduce()||!r.animate){r.style.transform=rot(t0);l.style.transform=rot(t1);return}
  var k=p>q?Math.min(1,Math.max(0,(.5-q)/(p-q))):1,o={duration:450,fill:"forwards",easing:"cubic-bezier(.3,.7,.2,1)"};
  RA=r.animate([{transform:rot(f0),offset:0},{transform:rot(t0),offset:k},{transform:rot(t0),offset:1}],o);
  LA=l.animate([{transform:rot(f1),offset:0},{transform:rot(f1),offset:k},{transform:rot(t1),offset:1}],o)}
function setP(p){if(p>P){P=p;ring(p)}}
/* The pen writes “Curiously, Chaewon” again the way she did (lib/signature.ts, at PACE). It draws
   on a canvas from a worker, so React waking the page up can't make it stop mid-word; pen() and
   penLoop() are sent to the worker as text, so they use nothing from out here. Where there's no
   OffscreenCanvas they run on this thread instead. */
var SG=${JSON.stringify(SIGNATURE)},SP=${JSON.stringify(PACE)},PN=0;
function pen(D,S){var st=D.strokes,n=st.length,T=[],Q=[],t=S.lead,i,g;
  for(i=0;i<n;i++){if(i){g=(st[i][2]-st[i-1][2]-st[i-1][3])/S.gap;if(i===D.rest&&g<S.breath)g=S.breath;t+=g}T.push(t);t+=st[i][3]/S.draw}
  function share(s,r){var k=s[4],pt=0,pf=0,j,ct,cf;for(j=0;j<=k.length;j+=2){ct=j<k.length?k[j]:s[3];cf=j<k.length?k[j+1]:1;if(r<=ct)return ct>pt?pf+(cf-pf)*(r-pt)/(ct-pt):cf;pt=ct;pf=cf}return 1}
  return{end:t,draw:function(x,v,k,c){var i,s,r,f;x.setTransform(1,0,0,1,0,0);x.clearRect(0,0,x.canvas.width,x.canvas.height);
    x.setTransform(k,0,0,k,0,0);x.lineWidth=D.pen;x.lineCap="round";x.lineJoin="round";x.strokeStyle=c;
    for(i=0;i<n;i++){r=(v-T[i])*S.draw;if(r<=0)break;s=st[i];Q[i]=Q[i]||new Path2D(s[0]);
      f=r>=s[3]?1:share(s,r);x.setLineDash(f<1?[f*s[1],s[1]+D.pen*2]:[]);x.stroke(Q[i])}}}}
function penLoop(p,x,k,c){var v0=0,n0=0,r=1,on=0,af=self.requestAnimationFrame?function(f){self.requestAnimationFrame(f)}:function(f){setTimeout(f,16)};
  function now(){return performance.now()/1e3}
  function vt(){return v0+(now()-n0)*r}
  function loop(){if(!on)return;var v=vt();p.draw(x,v,k,c);if(v>=p.end)on=0;else af(loop)}
  return function(m){if(m.col)c=m.col;if(m.v!=null){v0=m.v;n0=now();r=m.r||1;if(!on){on=1;loop()}}else if(m.r){v0=vt();n0=now();r=m.r}}}
function penNow(){return performance.now()/1e3}
function penV(){return PN?PN.v0+(penNow()-PN.n0)*PN.r:0}
/* ms of writing left (0 if the pen isn't writing) */
function penLeft(){return PN&&PN.on?Math.max(0,(PN.end-penV())/PN.r)*1e3:0}
function penSet(){if(PN)return PN;var c=document.querySelector("#cw-boot .cwb-pen");if(!c||!W.Path2D||!W.performance)return 0;
  var b=c.getBoundingClientRect();if(!b.width)return 0;
  var q=Math.min(W.devicePixelRatio||1,3),pw=Math.round(b.width*q),ph=Math.round(pw*SG.h/SG.w),k=pw/SG.w,p=pen(SG,SP),col=getComputedStyle(c).color,post=0,x;
  if(c.transferControlToOffscreen&&W.Worker&&W.Blob&&W.URL)try{
    var wk=new Worker(URL.createObjectURL(new Blob([pen+";"+penLoop+";var H;onmessage=function(e){var m=e.data;if(m.cv){m.cv.width=m.w;m.cv.height=m.h;H=penLoop(pen(m.D,m.S),m.cv.getContext('2d'),m.k,m.col)}if(H)H(m)}"],{type:"text/javascript"}))),oc=c.transferControlToOffscreen();
    wk.postMessage({cv:oc,w:pw,h:ph,k:k,col:col,D:SG,S:SP},[oc]);post=function(m){wk.postMessage(m)}}catch(e){post=0}
  if(!post){try{c.width=pw;c.height=ph;x=c.getContext("2d")}catch(e){}if(!x)return 0;post=penLoop(p,x,k,col)}
  return PN={el:c,end:p.end,v0:0,n0:penNow(),r:1,on:0,post:post}}
/* Start writing from v seconds in (reduced motion: from the end, so it's simply there) */
function penGo(){var p=penSet();if(!p)return;p.v0=reduce()?p.end:0;p.n0=penNow();p.r=1;p.on=1;p.post({v:p.v0,r:1,col:getComputedStyle(p.el).color})}
function penRate(r){if(!PN||!PN.on)return;PN.v0=penV();PN.n0=penNow();PN.r=r;PN.post({r:r})}
/* The canvas is in the page now (app/layout.tsx calls this right after it) */
W.cwPen=function(){if(d.dataset.boot==="on"&&!PN)penGo()};
function stylesIn(){if(d.hasAttribute("data-cssw"))return false;var l=document.querySelectorAll('link[rel="stylesheet"]');if(!l.length)return false;for(var i=0;i<l.length;i++)if(!l[i].sheet||l[i].media==="print")return false;return true}
function whenReady(cb){var t0=Date.now();(function poll(){
  if(document.readyState!=="loading")setP(.35);
  if(document.readyState!=="loading"&&stylesIn()){setP(.72);var f=document.fonts&&document.fonts.ready,once=0;
    var go=function(){if(once++)return;setP(1);cb()};if(f)f.then(go,go);setTimeout(go,f&&shown?400:0);return}
  if(Date.now()-t0>10000){setP(1);return cb()}
  setTimeout(poll,50)})()}
function target(){var e=document.querySelectorAll(".me-chip-mark, .mobilebar-home svg");for(var i=0;i<e.length;i++){var r=e[i].getBoundingClientRect();if(r.width>0&&r.height>0&&r.bottom>0)return r}return null}
function reset(){var box=document.getElementById("cw-boot");if(box&&box.getAnimations)box.getAnimations({subtree:true}).forEach(function(a){a.cancel()});
  RA=LA=0;A0=A1=P=0;var a=arcs();for(var i=0;i<a.length;i++)if(a[i])a[i].style.transform=""}
function finish(){d.removeAttribute("data-boot");reset();busy=0}
function done(){d.dataset.boot="done";setTimeout(out,reduce()?120:260)}
/* Everything that moves here is transform or opacity, so it runs on the compositor: a busy
   main thread (React waking the page up) can't make the monogram stall mid-flight. */
function out(){var box=document.getElementById("cw-boot");if(!box)return finish();
  var mono=box.querySelector(".cwb-mono"),ring=box.querySelector(".cwb-ring"),sig=box.querySelector(".cwb-sig"),bg=box.querySelector(".cwb-bg");
  d.dataset.boot="out";var t=target(),r=mono.getBoundingClientRect();
  if(!reduce()&&t&&mono.animate){
    var dx=(t.left+t.width/2)-(r.left+r.width/2),dy=(t.top+t.height/2)-(r.top+r.height/2),k=t.width/r.width;
    ring.animate([{opacity:1,transform:"scale(1)"},{opacity:0,transform:"scale(.86)"}],{duration:240,fill:"forwards",easing:"ease-in"});
    if(sig)sig.animate([{opacity:1,transform:"none"},{opacity:0,transform:"translateY(6px)"}],{duration:260,fill:"forwards",easing:"ease-in"});
    mono.animate([{transform:"none"},{transform:"translate("+dx+"px,"+dy+"px) scale("+k+")"}],{duration:760,delay:160,fill:"forwards",easing:"cubic-bezier(.65,0,.25,1)"});
    if(bg)bg.animate([{opacity:1},{opacity:0}],{duration:560,delay:300,fill:"forwards",easing:"ease-out"});
    setTimeout(finish,930)}
  else{if(box.animate)box.animate([{opacity:1},{opacity:0}],{duration:260,fill:"forwards"});setTimeout(finish,280)}}
W.cwIntro=function(){if(busy)return;busy=1;reset();d.dataset.boot="on";penGo();
  setTimeout(function(){setP(.35)},120);setTimeout(function(){setP(.72)},420);setTimeout(function(){setP(1)},700);
  setTimeout(done,Math.max(950,penLeft()&&penLeft()+SP.stop*1e3))};
/* Home only (a link to a project, a case study or About skips it).
   First visit on this browser: it plays as the intro, whatever the speed: the whole signature,
   then the dot (about 3.7s), then the flight.
   Later visits: it shows only if the styles aren't in after 0.3s (fonts alone never trigger it),
   and once the page is ready the rest of the signature is written within about half a second.
   Any click, tap, scroll or key skips it as soon as the page is ready. */
var home=!h||h==="#"||h==="#home",first=false,ready=0,skipped=0,went=0,timer=0;
try{first=W.localStorage.getItem("cw-intro")!=="1"}catch(e){first=false}
function go(){if(went)return;went=1;if(skipped&&!reduce()){d.dataset.boot="done";out()}else done()}
function skip(){skipped=1;if(ready)go()}
function start(){d.dataset.boot="on";shown=Date.now();penGo();
  try{W.localStorage.setItem("cw-intro","1")}catch(e){}
  ["pointerdown","wheel","keydown","touchstart"].forEach(function(t){W.addEventListener(t,skip,{once:true,passive:true})})}
if(home){busy=1;
  if(first)start();else timer=setTimeout(function(){if(!stylesIn())start()},300);
  whenReady(function(){clearTimeout(timer);ready=1;if(!shown){busy=0;return}
    if(skipped)return go();
    var left=penLeft();if(left&&!first)penRate(Math.max(4,left/500));left=penLeft();
    setTimeout(go,Math.max(left&&left+SP.stop*1e3,(reduce()?300:950)-(Date.now()-shown)))})}
`;
