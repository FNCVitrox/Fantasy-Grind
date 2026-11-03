// Browser-Test: Erfolge und Titel (Punkt 24).
// - Das Erfolge-Fenster zeigt rund 60 Erfolge in allen Kategorien
// - Ein abgeholter Erfolg mit Titel schaltet den Titel frei, er erscheint unter dem Klassennamen
// - Titel lässt sich im Fenster wechseln und entfernen, die Wahl übersteht Neuladen
// Start: npm run test:ui
let chromium;try{({chromium}=require('playwright'))}catch(e){console.log('Playwright fehlt: npm i -D playwright && npx playwright install chromium');process.exit(0)}
const INDEX=require('url').pathToFileURL(require('path').resolve(__dirname,'..','index.html')).href;
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1440,height:900}});const errors=[];p.on('pageerror',e=>errors.push(e.message));
await p.goto(INDEX);await p.waitForTimeout(2000);
const r=await p.evaluate(async()=>{const wait=(ms)=>new Promise(res=>setTimeout(res,ms));
 state.classChosen=true;state.combatStats.wins=120;state.combatStats.eliteKills=55;render();
 $('openAchievementsBtn').click();await wait(400);
 const cards=document.querySelectorAll('#achievements .achievement-card').length;
 const cats=document.querySelectorAll('#achievements .achievement-category').length;
 const titleBefore=!$('playerTitle').hidden;
 document.querySelector('[data-claim-achievement="hundredWins"]').click();await wait(150);
 const first=$('playerTitle').textContent;const shown=!$('playerTitle').hidden;
 document.querySelector('[data-claim-achievement="fiftyElites"]').click();await wait(150);
 document.querySelector('[data-select-title="fiftyElites"]').click();await wait(150);
 const switched=$('playerTitle').textContent;const active=document.querySelector('.title-choice.active')?.dataset.selectTitle;
 save();return {cards,cats,titleBefore,first,shown,switched,active};});
await p.reload();await p.waitForTimeout(2000);
const after=await p.evaluate(async()=>{const kept=$('playerTitle').textContent;const visible=!$('playerTitle').hidden;
 $('openAchievementsBtn').click();await new Promise(res=>setTimeout(res,400));
 document.querySelector('[data-select-title=""]').click();await new Promise(res=>setTimeout(res,150));
 return {kept,visible,removed:$('playerTitle').hidden};});
const errs=[];
if(r.cards<55||r.cats<7)errs.push('Erfolge fehlen: '+r.cards+' Karten, '+r.cats+' Kategorien');
if(r.titleBefore)errs.push('Titel sichtbar, obwohl keiner freigeschaltet ist');
if(!r.shown||!/Kampferprobt|Battle-Tested/.test(r.first))errs.push('Erster Titel erscheint nicht: '+JSON.stringify(r));
if(!/Elitejäger|Elite Hunter/.test(r.switched)||r.active!=='fiftyElites')errs.push('Titelwechsel klappt nicht: '+JSON.stringify(r));
if(!after.visible||after.kept!==r.switched)errs.push('Titel übersteht Neuladen nicht: '+JSON.stringify(after));
if(!after.removed)errs.push('Titel lässt sich nicht entfernen');
if(errors.length)errs.push('Seitenfehler: '+errors.slice(0,2).join(' | '));
console.log('Erfolge: '+r.cards+' in '+r.cats+' Kategorien, Titel "'+r.first+'" → "'+r.switched+'", nach Neuladen "'+after.kept+'"');
errs.forEach(e=>console.log(e));
console.log(errs.length?'ERFOLGE-TEST FEHLGESCHLAGEN':'ERFOLGE-TEST BESTANDEN');await b.close();process.exit(errs.length?1:0);})();
