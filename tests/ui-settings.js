// Browser-Test: Einstellungsfenster (Punkt 21).
// - Alle Optionen an einem Ort: Sprache, Kampftempo, Auto-Loot, Junk-Filter, Rasten, Ton, Lautstärken, Effekte, Spielstand
// - Jede Änderung landet im Spielstand und überlebt ein Neuladen
// - Kampftempo 4× ist spürbar schneller als 1×
// Start: npm run test:ui
let chromium;try{({chromium}=require('playwright'))}catch(e){console.log('Playwright fehlt: npm i -D playwright && npx playwright install chromium');process.exit(0)}
const INDEX=require('url').pathToFileURL(require('path').resolve(__dirname,'..','index.html')).href;
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:1280,height:900}});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
const fails=[];const check=(ok,msg)=>{if(!ok)fails.push(msg)};
await p.goto(INDEX);await p.waitForTimeout(2300);
await p.click('#openSettingsBtn');await p.waitForTimeout(250);
const groups=await p.evaluate(()=>[...document.querySelectorAll('#settingsBody .settings-group')].map(g=>g.className.match(/settings-group-(\w+)/)[1]));
check(JSON.stringify(groups)===JSON.stringify(['game','loot','sound','display','save']),'Gruppen: '+groups);
const controls=await p.evaluate(()=>({choices:[...new Set([...document.querySelectorAll('[data-setting-choice]')].map(e=>e.dataset.settingChoice))],ranges:[...document.querySelectorAll('[data-setting-range]')].map(e=>e.dataset.settingRange),actions:[...document.querySelectorAll('[data-settings-action]')].map(e=>e.dataset.settingsAction)}));
for(const key of ['language','combatSpeed','autoLoot','autoSellCommon','autoFarmRestPercent','muted','reducedEffects'])check(controls.choices.includes(key),'Option fehlt: '+key);
for(const key of ['soundVolume','musicVolume'])check(controls.ranges.includes(key),'Regler fehlt: '+key);
for(const key of ['export','import','newGame'])check(controls.actions.includes(key),'Spielstand-Aktion fehlt: '+key);
// alles umstellen
for(const [key,value] of [['combatSpeed','4'],['autoLoot','true'],['autoSellCommon','true'],['autoFarmRestPercent','70'],['muted','true'],['reducedEffects','true']]){
  await p.click(`[data-setting-choice="${key}"][data-value="${value}"]`);await p.waitForTimeout(80);
  check(await p.getAttribute(`[data-setting-choice="${key}"][data-value="${value}"]`,'aria-pressed')==='true',`${key}=${value} nicht aktiv markiert`);
}
await p.evaluate(()=>{const r=document.querySelector('[data-setting-range=soundVolume]');r.value='60';r.dispatchEvent(new Event('input',{bubbles:true}));r.dispatchEvent(new Event('change',{bubbles:true}))});
await p.click('[data-setting-choice="language"][data-value="en"]');await p.waitForTimeout(400);
check(await p.textContent('#settingsTitle')==='Settings','Sprachwechsel im Fenster wirkt nicht');
await p.waitForTimeout(500);
await p.reload();await p.waitForTimeout(2300);
const after=await p.evaluate(()=>({s:normalizeSettings(state.settings),lang:currentLanguage(),reduced:document.body.classList.contains('reduced-effects'),speed:document.body.dataset.combatSpeed}));
const want={combatSpeed:4,autoLoot:true,autoSellCommon:true,autoFarmRestPercent:70,muted:true,reducedEffects:true,soundVolume:60};
for(const [k,v] of Object.entries(want))check(after.s[k]===v,`nach Neuladen ${k}=${after.s[k]} statt ${v}`);
check(after.lang==='en','Sprache nicht gespeichert');check(after.reduced,'reduzierte Effekte nicht aktiv nach Neuladen');check(after.speed==='4','Kampftempo nicht auf der Seite aktiv');
// Kampftempo messen: gleicher Kampf mit 1× und 4×
const timeFight=async(speed)=>p.evaluate(async(speed)=>{state.settings=normalizeSettings({...state.settings,combatSpeed:speed,autoLoot:true});state.hp=state.maxHp;ui.selectedZone='meadow';ui.selectedEnemy='wolf';state.level=8;syncDerivedStats();state.hp=state.maxHp;render();
  const t0=performance.now();document.getElementById('fightBtn').click();
  while(!ui.isFighting&&performance.now()-t0<2000)await new Promise(r=>setTimeout(r,20));
  while(ui.isFighting&&performance.now()-t0<20000)await new Promise(r=>setTimeout(r,20));
  return Math.round(performance.now()-t0);},speed);
const slow=await timeFight(1);const fast=await timeFight(4);
check(fast<slow*0.6,`Kampftempo 4× nicht schneller (1×: ${slow} ms, 4×: ${fast} ms)`);
if(errs.length)fails.push('JS-Fehler: '+errs.slice(0,2).join(' | '));
console.log(fails.length?'EINSTELLUNGS-TEST FEHLGESCHLAGEN:\n- '+fails.join('\n- '):`EINSTELLUNGS-TEST BESTANDEN (Kampf 1×: ${slow} ms, 4×: ${fast} ms)`);
await b.close();process.exit(fails.length?1:0);})();
