// Macht deterministische Screenshots vieler Spielzustände. Aufruf: node shoot.js <ausgabeordner>
// Visueller Vergleich: macht deterministische Screenshots vieler Spielzustände (27 Zustände x 4 Bildschirmgrössen).
// npm run visual:baseline  -> speichert den aktuellen Stand in .visual/baseline
// npm run visual:check     -> macht neue Screenshots und vergleicht Pixel für Pixel (Unterschiede landen in .visual/diff)
// Gedacht für CSS-/Design-Änderungen, die nichts sichtbar verändern sollen. Braucht: npm i -D playwright pngjs pixelmatch@5
let chromium,PNG,pixelmatch;try{({chromium}=require('playwright'));({PNG}=require('pngjs'));pixelmatch=require('pixelmatch')}catch(e){console.log('Fehlende Pakete: npm i -D playwright pngjs pixelmatch@5 && npx playwright install chromium');process.exit(0)}
const path=require('path');const MODE=process.argv[2]||'check';const BASE=path.resolve(__dirname,'..','.visual');
const fs=require('fs');const OUT=path.join(BASE,MODE==='baseline'?'baseline':'current');fs.rmSync(OUT,{recursive:true,force:true});fs.mkdirSync(OUT,{recursive:true});
const INDEX=require('url').pathToFileURL(path.resolve(__dirname,'..','index.html')).href;
const VIEWS=[[390,844],[820,1180],[1280,800],[1920,1080]];
const init=`(()=>{let a=1234567;Math.random=function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296};
const F=new Date('2026-11-01T12:00:00Z').getTime();const D=Date;class FD extends D{constructor(...x){x.length?super(...x):super(F)}static now(){return F}};window.Date=FD;
try{localStorage.clear()}catch(e){}})();`;
const freeze='*,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important}';
const STATES={
 main:async()=>{},
 rich:async()=>{await rich()},
 en:async()=>{await rich();await setLanguage('en')},
 modal_zone:async()=>{await rich();$('openZoneBtn').click()},
 modal_inventory:async()=>{await rich();$('openInventoryBtn').click()},
 modal_merchant:async()=>{await rich();$('openMerchantBtn').click()},
 modal_quests:async()=>{await rich();$('openQuestBoardBtn').click()},
 modal_achievements:async()=>{await rich();$('openAchievementsBtn').click()},
 modal_save:async()=>{await rich();$('openSaveMenuBtn').click()},
 modal_log:async()=>{await rich();openModal('logModal');render()},
 modal_combatlog:async()=>{await rich();openModal('combatLogModal');render()},
 modal_repair:async()=>{await rich();openModal('repairModal');render()},
 modal_equipment:async()=>{await rich();openModal('equipmentModal');render()},
 modal_stats:async()=>{await rich();$('openPlayerStatsBtn').click()},
 modal_class:async()=>{await rich();$('openClassModalBtn').click()},
 modal_loot:async()=>{await rich();const id='crownSentinel';createLootChoices({...enemies[id],baseId:id},id);render()},
 smith_home:async()=>{await rich();ui.smithView='home';$('openSmithBtn').click();render()},
 smith_upgrade:async()=>{await rich();$('openSmithBtn').click();ui.smithView='upgrade';render()},
 smith_salvage:async()=>{await rich();$('openSmithBtn').click();ui.smithView='salvage';render()},
 smith_enchant:async()=>{await rich();state.level=15;$('openEnchantBtn').click();render()},
 bestiary_overview:async()=>{await rich();$('openBestiaryBtn').click()},
 bestiary_dungeon:async()=>{await rich();$('openBestiaryBtn').click();ui.selectedBestiaryType='dungeon';ui.bestiaryListDirty=true;render()},
 bestiary_fixed:async()=>{await rich();$('openBestiaryBtn').click();ui.selectedBestiaryCategory='fixed';ui.bestiaryListDirty=true;render()},
 bestiary_materials:async()=>{await rich();$('openBestiaryBtn').click();ui.selectedBestiaryCategory='materials';ui.bestiaryListDirty=true;render()},
 battle_win:async()=>{await rich();showBattleResult(true,'Waldwolf',3,{criticals:2,effects:1});document.getElementById('battleStage').classList.add('victory')},
 battle_loss:async()=>{await rich();showBattleResult(false,'Waldwolf',1,{criticals:0,effects:1});document.getElementById('battleStage').classList.add('defeat')},
 manual_mode:async()=>{await rich();setCombatMode('manual');render()},
};
(async()=>{const b=await chromium.launch();const only=process.argv[3]?process.argv[3].split(','):null;let n=0;
for(const [w,h] of VIEWS){const ctx=await b.newContext({viewport:{width:w,height:h},deviceScaleFactor:1,locale:'de-CH'});await ctx.addInitScript(init);
 for(const [name,fn] of Object.entries(STATES)){if(only&&!only.includes(name))continue;const p=await ctx.newPage();await p.goto(INDEX);await p.waitForTimeout(400);
  await p.addStyleTag({content:freeze});
  await p.evaluate(()=>{document.getElementById('studioSplash')?.remove();window.rich=async()=>{await setLanguage('de');await loadOptionalDataPack('drops');await loadOptionalDataPack('achievements');state.level=15;state.gold=54321;state.renown=42;
   ['wolf','bandit','boar','ironHound','plagueCrow','fieldWraith','ashMarauder','crownSentinel'].forEach(id=>{if(!enemies[id])return;createLootChoices({...enemies[id],baseId:id},id);chooseLoot(0,true);createLootChoices({...enemies[id],baseId:id},id);chooseLoot(0,false);state.pendingLoot=[]});
   Object.keys(state.materials||{}).forEach((k,i)=>state.materials[k]=5+i);syncDerivedStats();state.hp=Math.floor(state.maxHp*0.7);closeModal('lootModal');
   ['wolf','bandit'].forEach((id,i)=>{grantMaterials(id);});state.combatLog=[{type:'hero',text:'R1 · Du: Treffer für 12.'},{type:'critical',text:'R2 · Du: kritisch für 30.'},{type:'heal',text:'R2 · Gegner: heilt 5.'}];render();}});
  await p.evaluate(`(${fn.toString()})()`);await p.waitForTimeout(150);
  await p.screenshot({path:`${OUT}/${name}-${w}.png`,fullPage:name==='main'||name==='rich'||name==='en'||name==='manual_mode'});n++;await p.close();}
 await ctx.close();}
console.log('Screenshots',n);await b.close();
if(MODE==='baseline'){console.log('Basis gespeichert in .visual/baseline');return}
if(!fs.existsSync(path.join(BASE,'baseline'))){console.log('Keine Basis vorhanden: zuerst npm run visual:baseline');process.exit(1)}
const bad=compareDirs(path.join(BASE,'baseline'),OUT,path.join(BASE,'diff'));
console.log(bad?'VISUELLER VERGLEICH: '+bad+' Bilder unterschiedlich (siehe .visual/diff)':'VISUELLER VERGLEICH: identisch');process.exit(bad?1:0);})();
function compareDirs(A,B,DIFF){fs.rmSync(DIFF,{recursive:true,force:true});fs.mkdirSync(DIFF,{recursive:true});let bad=0;
 for(const f of fs.readdirSync(A)){const pa=PNG.sync.read(fs.readFileSync(A+'/'+f));if(!fs.existsSync(B+'/'+f)){console.log('fehlt',f);bad++;continue}const pb=PNG.sync.read(fs.readFileSync(B+'/'+f));
  if(pa.width!==pb.width||pa.height!==pb.height){console.log('Grösse geändert',f,pa.width+'x'+pa.height,'->',pb.width+'x'+pb.height);bad++;continue}
  const d=new PNG({width:pa.width,height:pa.height});const n=pixelmatch(pa.data,pb.data,d.data,pa.width,pa.height,{threshold:0});
  // bis 20 Pixel: Rendering-Rauschen bei halbtransparenten Ebenen
  if(n>20){bad++;console.log('Unterschied',f,n,'Pixel');fs.writeFileSync(DIFF+'/'+f,PNG.sync.write(d))}}
 return bad;}

