// Browser-Test: sucht deutsche Texte in der englischen Version und umgekehrt (sichtbarer Text, aria-label, title, placeholder),
// in allen Fenstern mit vollem Spielstand und nach einem Kampf. Meldet ausserdem Übersetzungs-Keys ohne englischen Text.
// Start: npm run test:ui
let chromium;try{({chromium}=require('playwright'))}catch(e){console.log('Playwright fehlt: npm i -D playwright && npx playwright install chromium');process.exit(0)}
const INDEX=require('url').pathToFileURL(require('path').resolve(__dirname,'..','index.html')).href;
async function runLanguage(LANG){
const DE=/\b(und|der|die|das|ist|nicht|mit|für|noch|keine?|einen?|wird|werden|bei|ohne|auch|zurück|Gebiet|Gebiete|Wechseln|Schließen|Leben|Lager|Gegner|Beute|Ruhm|erreicht|Kampf|Sieg|Tod|Ausrüstung|Spielstand|Händler|Schmied|Erfolge|Rucksack|Runden|Wähle|kostenlos|Stufe|verbessern|Zerlegen|Verkaufen|Schaden|Verteidigung|Haltbarkeit|Seltenheit|Gewöhnlich|Selten|Episch|Legendär|Quest-Tafel|aktiv|Belohnung|benötigt|Benötigt|gesperrt|Fähigkeit|Fähigkeiten|Gold-Kosten|Kosten|Schriftrolle|Opferstück|besiegt|vertraut|ausgerüstetes|verzaubertes)\b|[äöüßÄÖÜ]/;
const EN=/\b(the|and|with|your|you|of|Backpack|Close|Choose|Equip|Player Stats|Camp|Bestiary|Merchant|Smith|Achievements|Save|Language|Health|Defense|Attack|Damage|Common|Rare|Epic|Legendary|enemies|Enemies|Requires|Zone|Zones|Quest Board|Start fight|Ready|Easy|Deadly|Abilities|Equipment|Belt|Renown|free|Open|Sell|Protect|Repair)\b/;
const RX=LANG==='en'?DE:EN;
// Eigennamen, die in beiden Sprachen gleich bleiben dürfen
const ALLOW=[/Borin Glutbart/,/Mira Nachtfaden/,/Nemurenai/,/Fantasy Grind/];
// Bewusst gleiche Spielbegriffe im Deutschen (Lehnwörter)
const ALLOW_EXACT=new Set(['Loot','Bringe ein Item an dein aktuelles Upgrade-Limit.','Schalte ein neues Upgrade-Limit frei.']);
const b=await chromium.launch();const p=await b.newPage({viewport:{width:1280,height:900},locale:LANG==='en'?'en-US':'de-CH'});
await p.goto(INDEX);await p.waitForTimeout(5000);
await p.evaluate(async(L)=>{await setLanguage(L);window.__miss=new Map();const orig=window.t;window.t=function(key,fallback=key,params={}){const lang=currentLanguage();if(lang==='en'&&translations.en&&!(key in translations.en)&&typeof key==='string'&&key.includes('.'))window.__miss.set(key,String(fallback).slice(0,80));return orig(key,fallback,params)};},LANG);await p.waitForTimeout(300);
await p.evaluate(async()=>{state.level=15;state.gold=99999;state.renown=80;syncDerivedStats();state.hp=state.maxHp;await loadOptionalDataPack('drops');await loadOptionalDataPack('achievements');
 const ens=Object.keys(enemies);for(let i=0;i<12;i++){const id=ens[i%ens.length];try{createLootChoices({...enemies[id],baseId:id},id);if(state.pendingLoot.length)chooseLoot(0,false);}catch(e){}}
 state.pendingLoot=[];render();});
const found=new Map();
async function scan(where){const res=await p.evaluate(({src,flags,L})=>{const rx0=new RegExp(src,flags);const out=[];
 const other=L==='en'?translations.de:translations.en, mine=L==='en'?translations.en:translations.de;
 if(!window.__foreign){window.__foreign=new Set();const mineValues=new Set(Object.values(mine).map(v=>String(v).trim()));for(const k in other){const v=other[k];if(typeof v==='string'&&v.length>=4&&mine[k]!==undefined&&mine[k]!==v&&!mineValues.has(v.trim())&&!/^[\d\s{}+%.,:·-]+$/.test(v))window.__foreign.add(v.trim())}}
 const rx={test:(tx)=>rx0.test(tx)||window.__foreign.has(tx.trim())};
 const vis=(el)=>{const r=el.getBoundingClientRect();const s=getComputedStyle(el);return r.width>0&&r.height>0&&s.visibility!=='hidden'&&s.display!=='none'};
 const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);let n;while(n=walker.nextNode()){const tx=n.textContent.trim();if(!tx||!n.parentElement||!vis(n.parentElement))continue;if(n.parentElement.closest('script,style,.studio-splash'))continue;
  // nur Fenster prüfen, die gerade offen sind, plus Hauptseite
  const ov=n.parentElement.closest('.modal-overlay');if(ov&&!ov.classList.contains('open'))continue;if(rx.test(tx))out.push(tx.slice(0,110))}
 document.querySelectorAll('[aria-label],[title],[placeholder],[alt]').forEach(el=>{const ov=el.closest('.modal-overlay');if(ov&&!ov.classList.contains('open'))return;if(el.closest('.studio-splash'))return;for(const a of ['aria-label','title','placeholder','alt']){const v=el.getAttribute(a);if(v&&rx.test(v))out.push('@'+a+'('+(el.id||el.tagName)+'): '+v.slice(0,90))}});
 if(rx.test(document.title))out.push('@title: '+document.title);return out;},{src:RX.source,flags:RX.flags,L:LANG});
 for(const r of res){if(ALLOW_EXACT.has(r))continue;if(ALLOW.some(a=>a.test(r)&&!RX.test(r.replace(a,''))))continue;if(!found.has(r))found.set(r,where)}}
await scan('main');
const ids=await p.evaluate(()=>[...document.querySelectorAll('.modal-overlay')].map(m=>m.id));
const btn={zoneModal:'openZoneBtn',bestiaryModal:'openBestiaryBtn',inventoryModal:'openInventoryBtn',merchantModal:'openMerchantBtn',smithModal:'openSmithBtn',questBoardModal:'openQuestBoardBtn',achievementsModal:'openAchievementsBtn',saveModal:'openSaveMenuBtn',settingsModal:'openSettingsBtn',logModal:'openLogBtn',playerStatsModal:'openPlayerStatsBtn',classModal:'openClassModalBtn'};
for(const id of ids){await p.evaluate(({id,b})=>{document.querySelectorAll('.modal-overlay.open').forEach(m=>closeModal(m.id));if(b&&$(b))$(b).click();else openModal(id);render();},{id,b:btn[id]});await p.waitForTimeout(250);await scan(id);}
// Kampf ausführen und erneut prüfen (Kampftexte, Log)
await p.evaluate(async()=>{document.querySelectorAll('.modal-overlay.open').forEach(m=>closeModal(m.id));ui.selectedZone='meadow';ui.selectedEnemy='wolf';state.level=15;syncDerivedStats();state.hp=state.maxHp;const pr=fight();ui.skipCombat=true;await pr;});await p.waitForTimeout(300);await scan('after-fight');
// Meisteraufträge (Bedingungen und Ziele) von Schmied und Mira sowie Gegner-Details im Bestiarium
await p.evaluate(()=>{document.querySelectorAll('.modal-overlay.open').forEach(m=>closeModal(m.id));state.level=20;state.renown=80;state.smithMastery=normalizeSmithMastery({...state.smithMastery,discovered:true,active:smithMasteryRanks[1]?.id||smithMasteryRanks[0].id});$('openSmithBtn').click();ui.smithView='home';render();});await p.waitForTimeout(150);await scan('smith-mastery');
await p.evaluate(()=>{state.smithMastery=normalizeSmithMastery({...state.smithMastery,active:null});render();});await scan('smith-mastery-requirements');
await p.evaluate(()=>{closeModal('smithModal');state.enchanting=normalizeEnchanting({...state.enchanting,discovered:true,unlockedSeen:true,active:enchantMasteryRanks[0].id});$('openEnchantBtn')?.click();render();});await p.waitForTimeout(150);await scan('enchant-mastery');
await p.evaluate(()=>{state.enchanting=normalizeEnchanting({...state.enchanting,active:null});render();});await scan('enchant-mastery-requirements');
await p.evaluate(()=>{document.querySelectorAll('.modal-overlay.open').forEach(m=>closeModal(m.id));$('openBestiaryBtn').click();render();document.querySelector('[data-bestiary]')?.click();});await p.waitForTimeout(150);await scan('bestiary-enemy');
await p.evaluate(()=>document.querySelectorAll('.modal-overlay.open').forEach(m=>closeModal(m.id)));
// Bosskampf mit Passiv-Fähigkeiten: Kampflog muss in der gewählten Sprache sein
await p.evaluate(async()=>{document.querySelectorAll('.modal-overlay.open').forEach(m=>closeModal(m.id));state.level=20;state.renown=60;syncDerivedStats();for(const [z,e] of [['ironhold','ironDuke'],['ashcathedral','hollowChampion'],['tower','towerWarden']]){state.hp=state.maxHp;state.pendingLoot=[];closeModal('lootModal');ui.selectedZone=z;ui.selectedEnemy=e;const pr=fight();ui.skipCombat=true;await pr;}state.pendingLoot=[];closeModal('lootModal');$('openCombatLogBtn')?.click()||openModal('combatLogModal');render();});await p.waitForTimeout(150);await scan('boss-combatlog');
await p.evaluate(()=>document.querySelectorAll('.modal-overlay.open').forEach(m=>closeModal(m.id)));
await p.evaluate(()=>{showBattleResult(true,enemyDisplayName(enemies.wolf,'wolf'),3,{criticals:2,effects:2});});await scan('battle-result-win');
await p.evaluate(()=>{showBattleResult(false,enemyDisplayName(enemies.wolf,'wolf'),1,{criticals:1,effects:1});});await scan('battle-result-loss');
await p.evaluate(()=>hideBattleResult());
await p.evaluate(()=>{$('openLogBtn')?.click();render();});await p.waitForTimeout(200);await scan('log-after-fight');
await p.evaluate(()=>{closeModal('logModal');$('openCombatLogBtn')?.click();render();});await p.waitForTimeout(200);await scan('combatlog');
const miss=await p.evaluate(()=>[...window.__miss.entries()]);for(const [k,v] of miss)console.log('Fehlender englischer Key:',k,'('+v+')');
for(const [t,w] of found)console.log('['+LANG+']',w.padEnd(18),'|',t);await b.close();return found.size+(LANG==='en'?miss.length:0);}
(async()=>{let fails=0;for(const L of ['en','de']){const n=await runLanguage(L);console.log(L==='en'?'Englisch':'Deutsch',n?'FEHLER: '+n:'ok');fails+=n;}
console.log(fails?'SPRACH-TEST FEHLGESCHLAGEN':'SPRACH-TEST BESTANDEN: keine gemischten Texte');process.exit(fails?1:0);})();
