// Browser-Test: Kampfablauf über den echten Button.
// - "Überspringen" beendet den Kampf in unter 250 ms (Punkt 4 im Arbeitsplan)
// - ohne Überspringen bleibt die Ergebnis-Anzeige sichtbar (normaler Ablauf unverändert)
// Start: npm run test:ui
let chromium;try{({chromium}=require('playwright'))}catch(e){console.log('Playwright fehlt: npm i -D playwright && npx playwright install chromium');process.exit(0)}
const INDEX=require('url').pathToFileURL(require('path').resolve(__dirname,'..','index.html')).href;
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1440,height:900}});const errors=[];p.on('pageerror',e=>errors.push(e.message));
await p.goto(INDEX);await p.waitForTimeout(2200);
const r=await p.evaluate(async()=>{const skip=[];const normal=[];
 const prep=(enemy)=>{state.pendingLoot=[];closeModal('lootModal');state.level=8;syncDerivedStats();state.hp=state.maxHp;selectedZone='meadow';selectedEnemy=enemy;render();};
 for(let i=0;i<10;i++){prep(['wolf','bandit','boar'][i%3]);const btn=$('fightBtn');btn.click();await new Promise(r=>setTimeout(r,i%2?350:0));const t1=performance.now();btn.click();while(isFighting)await new Promise(r=>setTimeout(r,5));skip.push(Math.round(performance.now()-t1));}
 // Banner bleibt nach dem Überspringen kurz sichtbar und verschwindet dann von selbst
 const bannerAfterSkip=$('battleResult').classList.contains('show');await new Promise(r=>setTimeout(r,1300));const bannerLater=$('battleResult').classList.contains('show');
 prep('wolf');const t0=performance.now();$('fightBtn').click();while(isFighting)await new Promise(r=>setTimeout(r,5));normal.push(Math.round(performance.now()-t0));
 return {skip,normal,bannerAfterSkip,bannerLater};});
const worst=Math.max(...r.skip);const errs=[];
if(worst>=250)errs.push('Überspringen zu langsam: '+worst+' ms');
if(!r.bannerAfterSkip)errs.push('Ergebnis-Banner fehlt nach dem Überspringen');
if(r.bannerLater)errs.push('Ergebnis-Banner verschwindet nicht');
if(r.normal[0]<900)errs.push('normaler Kampf zeigt das Ergebnis nicht lange genug ('+r.normal[0]+' ms)');
if(errors.length)errs.push('Seitenfehler: '+errors.slice(0,2).join(' | '));
console.log('Überspringen: max '+worst+' ms (Ziel < 250 ms), normaler Kampf: '+r.normal[0]+' ms');
errs.forEach(e=>console.log(e));
console.log(errs.length?'KAMPF-TEST FEHLGESCHLAGEN':'KAMPF-TEST BESTANDEN');await b.close();process.exit(errs.length?1:0);})();
