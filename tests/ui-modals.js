// Browser-Test: prüft alle Fenster auf 14 Bildschirmgrössen auf Überlauf, abgeschnittene Inhalte und verschachtelte Scroll-Boxen.
// Start: npm run test:ui   (braucht einmalig: npm i -D playwright && npx playwright install chromium)
// Mit vollem Spielstand: RICH=1 npm run test:ui
let chromium;try{({chromium}=require('playwright'))}catch(e){console.log('Playwright fehlt: npm i -D playwright && npx playwright install chromium');process.exit(0)}
const V=(process.env.VIEWS||'320x568,360x740,375x667,390x844,414x896,430x932,568x320,844x390,768x1024,1024x768,1280x800,1366x768,1440x900,1920x1080').split(',').map(v=>v.split('x').map(Number));
(async()=>{const b=await chromium.launch();let fails=0;
for(const [w,h] of V){const p=await b.newPage({viewport:{width:w,height:h}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto(require('url').pathToFileURL(require('path').resolve(__dirname,'..','index.html')).href);await p.waitForTimeout(5500);
if(process.env.RICH)await p.evaluate(async()=>{state.level=15;state.gold=999999;state.renown=80;syncDerivedStats();state.hp=state.maxHp;
 await loadOptionalDataPack('drops');await loadOptionalDataPack('achievements').catch(()=>{});
 const ens=Object.keys(enemies);for(let i=0;i<45;i++){const id=ens[i%ens.length];try{createLootChoices({...enemies[id],baseId:id},id);if(state.pendingLoot.length)chooseLoot(0,false);}catch(e){}}
 try{createLootChoices({...enemies[ens[ens.length-1]],baseId:ens[ens.length-1]},ens[ens.length-1]);}catch(e){}
 for(let i=0;i<40;i++)log('Testeintrag '+i+' mit etwas längerem Text, damit das Protokoll voll wird.','good');save();render();});
const ids=await p.evaluate(()=>[...document.querySelectorAll('.modal-overlay')].map(m=>m.id));
for(const id of ids){
 const r=await p.evaluate(async(id)=>{document.querySelectorAll('.modal-overlay.open').forEach(m=>closeModal(m.id));
  try{ const btn={zoneModal:'openZoneBtn',bestiaryModal:'openBestiaryBtn',inventoryModal:'openInventoryBtn',merchantModal:'openMerchantBtn',smithModal:'openSmithBtn',questBoardModal:'openQuestBoardBtn',achievementsModal:'openAchievementsBtn',saveModal:'openSaveMenuBtn'}[id]; if(btn&&$(btn)&&!$(btn).disabled){$(btn).click()} else openModal(id); render(); }catch(e){return {err:e.message}}
  await new Promise(r=>setTimeout(r,350));
  const vw=document.documentElement.clientWidth;const vh=window.innerHeight;const m=document.getElementById(id);const win=m.querySelector('.modal-window')||m;
  const wr=win.getBoundingClientRect();const off=[];
  win.querySelectorAll('*').forEach(el=>{const cs=getComputedStyle(el);if(cs.display==='none'||cs.visibility==='hidden')return;const rr=el.getBoundingClientRect();if(!rr.width)return;
   // ignore if clipped by a horizontally scrolling ancestor
   let a=el.parentElement,clipped=false;while(a&&a!==win){const s=getComputedStyle(a);if(/(auto|scroll|hidden)/.test(s.overflowX)&&a.scrollWidth>a.clientWidth+1){clipped=true;break}a=a.parentElement}
   if(!clipped&&(rr.right>vw+1||rr.left<-1))off.push((el.id?'#'+el.id:el.className.toString().split(' ')[0]||el.tagName)+':'+Math.round(rr.left)+'..'+Math.round(rr.right))});
  const inner=[];win.querySelectorAll('*').forEach(el=>{const s=getComputedStyle(el);if(el.scrollWidth>el.clientWidth+2&&/(auto|scroll)/.test(s.overflowX)&&el.clientWidth>0)inner.push((el.id||el.className.toString().split(' ')[0])+' '+el.scrollWidth+'/'+el.clientWidth)});
  const st=document.createElement('style');st.textContent='*{content-visibility:visible!important}';document.head.appendChild(st);await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));
  const clip=[];win.querySelectorAll('*').forEach(el=>{const s=getComputedStyle(el);if(s.display==='none')return;const r=el.getBoundingClientRect();if(r.height<4||r.width<4)return;
   if(/(hidden|clip)/.test(s.overflowY)&&el.scrollHeight>el.clientHeight+3&&!/(auto|scroll)/.test(s.overflowY)&&el.children.length&&s.textOverflow!=='ellipsis'&&s.webkitLineClamp==='none')clip.push((el.className.toString().split(' ')[0]||el.tagName)+' '+el.scrollHeight+'/'+el.clientHeight)});
  const nested=[];win.querySelectorAll('*').forEach(el=>{const s=getComputedStyle(el);if(s.display==='none')return;const h=el.clientHeight;if(/(auto|scroll)/.test(s.overflowY)&&el.scrollHeight>h+3&&h>0&&h<160)nested.push((el.className.toString().split(' ')[0]||el.tagName)+' '+el.scrollHeight+'/'+h)});
  st.remove();
  return {nested:[...new Set(nested)].slice(0,4),nestedCount:nested.length,clipCount:clip.length,clip:[...new Set(clip)].slice(0,5),win:[Math.round(wr.left),Math.round(wr.right),Math.round(wr.top),Math.round(wr.bottom)],vw,vh,pageScroll:document.documentElement.scrollWidth>vw,off:off.slice(0,6),offCount:off.length,innerScroll:inner.slice(0,4)};},id);
 const bad=r.err||r.nestedCount||r.clipCount||r.pageScroll||r.offCount||r.win[0]<0||r.win[1]>r.vw||r.win[2]<0||r.win[3]>r.vh||r.innerScroll.length;
 if(bad){fails++;console.log(w+'x'+h,id,JSON.stringify(r));}
 if(process.env.SHOT&&process.env.SHOT.split(',').includes(id))await p.screenshot({path:`/tmp/audit/${id}-${w}.png`});
}
if(errs.length)console.log(w,'pageerrors',errs.slice(0,3));await p.close();}
console.log(fails?'UI-TEST FEHLGESCHLAGEN: '+fails:'UI-TEST BESTANDEN: alle Fenster passen');await b.close();process.exit(fails?1:0);})();
