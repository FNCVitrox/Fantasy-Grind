// Browser-Test: Kampfablauf über den echten Button.
// - "Überspringen" beendet den Kampf in unter 250 ms (Punkt 4 im Arbeitsplan)
// - ohne Überspringen bleibt die Ergebnis-Anzeige sichtbar (normaler Ablauf unverändert)
// Start: npm run test:ui
let chromium;try{({chromium}=require('playwright'))}catch(e){console.log('Playwright fehlt: npm i -D playwright && npx playwright install chromium');process.exit(0)}
const INDEX=require('url').pathToFileURL(require('path').resolve(__dirname,'..','index.html')).href;
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1440,height:900}});const errors=[];p.on('pageerror',e=>errors.push(e.message));
await p.goto(INDEX);await p.waitForTimeout(2200);
const r=await p.evaluate(async()=>{const skip=[];const normal=[];
 const prep=(enemy)=>{state.pendingLoot=[];closeModal('lootModal');state.level=8;syncDerivedStats();state.hp=state.maxHp;ui.selectedZone='meadow';ui.selectedEnemy=enemy;render();};
 for(let i=0;i<10;i++){prep(['wolf','bandit','boar'][i%3]);const btn=$('fightBtn');btn.click();await new Promise(r=>setTimeout(r,i%2?350:0));const t1=performance.now();btn.click();while(ui.isFighting)await new Promise(r=>setTimeout(r,5));skip.push(Math.round(performance.now()-t1));}
 // Banner bleibt nach dem Überspringen kurz sichtbar und verschwindet dann von selbst
 const bannerAfterSkip=$('battleResult').classList.contains('show');await new Promise(r=>setTimeout(r,1300));const bannerLater=$('battleResult').classList.contains('show');
 prep('wolf');const t0=performance.now();$('fightBtn').click();while(ui.isFighting)await new Promise(r=>setTimeout(r,5));normal.push(Math.round(performance.now()-t0));
 return {skip,normal,bannerAfterSkip,bannerLater};});
// Auto-Loot (Punkt 11): 100 Kämpfe ohne Klick auf Beute, Rucksack bleibt im Limit
const al=await p.evaluate(async()=>{state.level=8;syncDerivedStats();state.hp=state.maxHp;state.gold=500;state.inventory=[];state.pendingLoot=[];closeModal('lootModal');
 $('openInventoryBtn').click();render();document.querySelector('[data-setting-toggle="autoLoot"]').click();closeModal('inventoryModal');
 let wins=0,modal=0,maxInv=0;for(let i=0;i<100;i++){if(state.hp<state.maxHp*0.5)rest();ui.selectedZone='meadow';ui.selectedEnemy=['wolf','bandit','boar'][i%3];const pr=fight();ui.skipCombat=true;await pr;if(state.hp>0)wins++;if($('lootModal').classList.contains('open'))modal++;maxInv=Math.max(maxInv,state.inventory.length);}
 return {wins,modal,maxInv,cap:inventoryCapacity(),pending:state.pendingLoot.length}});
// Auto-Farmen (Punkt 14): läuft selbständig, rastet unter der Schwelle und stoppt per Knopf
const farm=await p.evaluate(async()=>{state.settings.autoLoot=true;state.level=8;syncDerivedStats();state.hp=state.maxHp;ui.selectedZone='meadow';ui.selectedEnemy='bandit';render();
 const w0=state.combatStats.wins;$('autoFarmBtn').click();await new Promise(r=>setTimeout(r,9000));const running=ui.autoFarm;$('autoFarmBtn').click();
 for(let i=0;i<40&&ui.isFighting;i++)await new Promise(r=>setTimeout(r,100));return {wins:state.combatStats.wins-w0,running,stopped:!ui.autoFarm&&!ui.isFighting}});
const worst=Math.max(...r.skip);const errs=[];
if(worst>=250)errs.push('Überspringen zu langsam: '+worst+' ms');
if(!r.bannerAfterSkip)errs.push('Ergebnis-Banner fehlt nach dem Überspringen');
if(r.bannerLater)errs.push('Ergebnis-Banner verschwindet nicht');
if(r.normal[0]<900)errs.push('normaler Kampf zeigt das Ergebnis nicht lange genug ('+r.normal[0]+' ms)');
if(al.wins<100||al.modal||al.pending)errs.push('Auto-Loot: '+JSON.stringify(al));
if(al.maxInv>al.cap)errs.push('Rucksack über dem Limit: '+al.maxInv+'/'+al.cap);
console.log('Auto-Loot: '+al.wins+' Siege ohne Klick, Rucksack max '+al.maxInv+'/'+al.cap);
if(!farm.running||farm.wins<2||!farm.stopped)errs.push('Auto-Farmen: '+JSON.stringify(farm));
console.log('Auto-Farmen: '+farm.wins+' Siege in 9 s (normales Tempo), Stopp per Knopf: '+(farm.stopped?'ok':'FEHLER'));
if(errors.length)errs.push('Seitenfehler: '+errors.slice(0,2).join(' | '));
console.log('Überspringen: max '+worst+' ms (Ziel < 250 ms), normaler Kampf: '+r.normal[0]+' ms');
errs.forEach(e=>console.log(e));
console.log(errs.length?'KAMPF-TEST FEHLGESCHLAGEN':'KAMPF-TEST BESTANDEN');await b.close();process.exit(errs.length?1:0);})();
