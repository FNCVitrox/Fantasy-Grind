// Browser-Test: Hauptseite auf vielen Bildschirmgrössen.
// - Ausrüstungs-Slots: kein abgeschnittener Text (Punkt 3 im Arbeitsplan)
// - Kampf-Button ab 1280x768 ohne Scrollen sichtbar, auf dem Handy (≤620 px) über der Tab-Leiste
// - Handy-Tabs zeigen jeweils den richtigen Bereich
// - kein horizontaler Überlauf der Seite
// Start: npm run test:ui
let chromium;try{({chromium}=require('playwright'))}catch(e){console.log('Playwright fehlt: npm i -D playwright && npx playwright install chromium');process.exit(0)}
const INDEX=require('url').pathToFileURL(require('path').resolve(__dirname,'..','index.html')).href;
const VIEWS=[[320,568],[390,844],[620,900],[800,900],[1060,800],[1061,800],[1180,800],[1280,720],[1280,800],[1366,768],[1440,900],[1600,900],[1920,1080],[2560,1440]];
(async()=>{const b=await chromium.launch();let fails=0;
for(const lang of ['de','en'])for(const [w,h] of VIEWS){const p=await b.newPage({viewport:{width:w,height:h}});await p.goto(INDEX);await p.waitForTimeout(2200);
 const r=await p.evaluate(async(L)=>{await setLanguage(L);state.level=12;syncDerivedStats();
  // lange Item-Namen ausrüsten, damit der Test auch den schlimmsten Fall abdeckt
  const longest={};Object.entries(items).forEach(([id,it])=>{if(!it.slot)return;const n=itemDisplayName(it,id);if(!longest[it.slot]||n.length>longest[it.slot][1].length)longest[it.slot]=[id,n]});
  Object.entries(longest).forEach(([slot,[id]])=>{if(slot in state.equipment)state.equipment[slot]=id});render();
  await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));
  // Slot-Namen und Detailzeilen dürfen nie abgeschnitten sein; Item-Namen nur, wenn der volle Name als Tooltip (title) vorhanden ist.
  const trunc=[];document.querySelectorAll('#equipment .equipment-chip').forEach(c=>c.querySelectorAll(':scope > strong, :scope > span:not(.equipment-hover-detail), :scope > small').forEach(el=>{const s=getComputedStyle(el);if(s.display==='none')return;const cut=el.scrollWidth>el.clientWidth+1||el.scrollHeight>el.clientHeight+1;if(!cut)return;if(el.tagName==='SPAN'&&el.getAttribute('title')===el.textContent.trim())return;trunc.push(el.textContent.trim())}));
  const f=[...document.querySelectorAll('button')].find(x=>/Kampf starten|Start fight/.test(x.textContent));const fb=f?Math.round(f.getBoundingClientRect().bottom):-1;const tb=document.getElementById('mobileTabbar');const tabTop=tb&&getComputedStyle(tb).display!=='none'?Math.round(tb.getBoundingClientRect().top):innerHeight;
  let tabs=null;if(tabTop<innerHeight){const vis=s=>{const e=document.querySelector(s);return !!e&&e.getClientRects().length>0};tabs={};for(const t of ['hero','quests','fight']){document.querySelector('#mobileTabbar [data-mobile-tab="'+t+'"]').click();tabs[t]=[vis('#fightBtn'),vis('#equipment'),vis('#quests')].join('')}}
  return {trunc,fb,tabTop,tabs,vh:innerHeight,vw:innerWidth,overflow:document.documentElement.scrollWidth>document.documentElement.clientWidth};},lang);
 const errs=[];if(r.trunc.length)errs.push('abgeschnitten: '+r.trunc.slice(0,3).join(' | '));
 if(w>=1280&&h>=768&&r.fb>r.vh)errs.push(`Kampf-Button unter dem Rand (${r.fb}>${r.vh})`);
 if(r.overflow)errs.push('horizontaler Überlauf');
 if(w<=620&&r.fb>r.tabTop)errs.push(`Handy: Kampf-Button unter der Tab-Leiste (${r.fb}>${r.tabTop})`);
 if(w<=620&&(!r.tabs||r.tabs.hero!=='falsetruefalse'||r.tabs.quests!=='falsefalsetrue'||r.tabs.fight!=='truefalsefalse'))errs.push('Handy-Tabs falsch: '+JSON.stringify(r.tabs));
 if(errs.length){fails++;console.log(lang,w+'x'+h,errs.join('; '))}
 await p.close();}
console.log(fails?'LAYOUT-TEST FEHLGESCHLAGEN: '+fails:'LAYOUT-TEST BESTANDEN: Ausrüstung lesbar, Kampf-Button erreichbar');await b.close();process.exit(fails?1:0);})();
