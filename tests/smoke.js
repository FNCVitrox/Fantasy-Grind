const fs = require("fs");
const path = require("path");
const vm = require("vm");
const assert = require("assert");

const root = path.resolve(__dirname, "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

const html = read("index.html");
const css = ["css/base.css", "css/modals.css", "css/responsive.css"].map(read).join("\n");
const dataScripts = [
  "scripts/data.js",
  "scripts/data-loader.js",
  "scripts/data-player.js",
  "scripts/data-world.js",
  "scripts/data-items.js",
  "scripts/data-quests.js",
  "scripts/data-labels.js",
];
const scripts = [
  ...dataScripts,
  "scripts/i18n.js",
  "scripts/i18n-en.js",
  "scripts/save-system.js",
  "scripts/core.js",
  "scripts/render.js",
  "scripts/render-loot.js",
  "scripts/data-achievements.js",
  "scripts/data-drops.js",
].map(read);

assert(!/[Ã�]/.test(html), "index.html still contains likely mojibake characters");

const htmlIds = new Set([...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]));
const dynamicIds = new Set(["bestiaryDetail", "bestiarySearch", "smithGreeting", "smithGreetingText", "smithMastery", "battleResult"]);
const referencedIds = new Set(
  [...scripts.join("\n").matchAll(/\$\("([^"]+)"\)/g)].map((match) => match[1]),
);

for (const id of referencedIds) {
  assert(htmlIds.has(id) || dynamicIds.has(id), `Missing DOM id referenced by $(): ${id}`);
}

const scriptOrder = [...html.matchAll(/<script src="\.\/([^"?]+)[^"]*"><\/script>/g)].map((match) => match[1]);
assert.deepStrictEqual(scriptOrder, [
  "scripts/data.js",
  "scripts/data-loader.js",
  "scripts/data-player.js",
  "scripts/data-world.js",
  "scripts/data-items.js",
  "scripts/data-quests.js",
  "scripts/data-labels.js",
  "scripts/i18n.js",
  "scripts/save-system.js",
  "scripts/core.js",
  "scripts/render.js",
  "scripts/render-loot.js",
  "scripts/events.js",
]);
assert(
  !/render\(\);\s*save\(\);\s*window\.addEventListener\("beforeunload"/.test(read("scripts/events.js")),
  "startup should not immediately overwrite an unreadable stored save",
);
assert(
  /if \(skipCombat\) break;[\s\S]*showBattleResult\(playerWon, enemyName, rounds, summary\);[\s\S]*waitResult\(skipCombat \? 850 : 1350\)/.test(read("scripts/events.js")),
  "skip combat should still show the win/loss result before the battle stage resets",
);
assert(html.includes('id="combatModeToggle"') && html.includes('data-combat-mode="manual"'), "combat mode toggle should expose a manual mode button");
assert(css.includes(".combat-mode-toggle"), "combat mode toggle should have stable styling");
assert(html.includes('id="combatActions"'), "combat UI should expose RPG action buttons");
assert(html.includes('class="combat-command-main"') && html.includes('class="combat-command-top"'), "combat UI should use a dedicated command dock layout");
assert(!html.includes('id="selectedEnemyMeta"') && !html.includes('id="selectedEnemyName"'), "combat command dock should not duplicate target details");
assert(/manualMode \? await waitForCombatAction\(\) : chooseAutoCombatAction/.test(read("scripts/core.js")), "manual and auto combat should share the same action loop");
assert(/requestCombatAction\(button\.dataset\.combatAction\)/.test(read("scripts/events.js")), "combat action buttons should feed manual combat choices");
assert(css.includes("grid-template-rows: auto minmax(0, 1fr)") && css.includes(".combat-command-main"), "combat command dock should stack controls above full-width actions");
assert(css.includes(".combat-card {\r\n    position: sticky") || css.includes(".combat-card {\n    position: sticky"), "mobile combat command dock should stay reachable");

const storage = {};
const context = {
  console,
  localStorage: {
    getItem: (key) => storage[key] || null,
    setItem: (key, value) => {
      storage[key] = String(value);
    },
  },
  document: {
    getElementById: () => null,
    querySelectorAll: () => [],
  },
  window: {
    setTimeout,
    clearTimeout,
    requestAnimationFrame: (callback) => setTimeout(callback, 0),
    cancelAnimationFrame: clearTimeout,
    innerWidth: 1280,
    innerHeight: 720,
  },
  setTimeout,
  clearTimeout,
  performance: { now: () => 0 },
  Map,
  Math,
  Date,
};

vm.createContext(context);
for (const source of scripts) {
  vm.runInContext(source, context);
}

assert.strictEqual(typeof context.defaultState, "function");
assert.strictEqual(typeof context.renderBestiaryItemDetail, "function");
const assetVersionInCode = vm.runInContext("assetVersion", context);
const htmlAssetVersions = [...html.matchAll(/\?v=([^"]+)/g)].map((match) => match[1]);
assert(htmlAssetVersions.length > 0 && htmlAssetVersions.every((version) => version === assetVersionInCode), "HTML asset versions should match assetVersion for cache busting");
assert(html.includes(`Alpha v${assetVersionInCode}`), "visible version badge should match assetVersion");
assert.strictEqual(context.defaultState().level, 1);
assert.strictEqual(context.defaultState().build, "damage");
assert.strictEqual(context.defaultState().ui.combatMode, "auto");
assert.strictEqual(vm.runInContext("normalizeSavedUi({ combatMode: 'manual' }).combatMode", context), "manual");
assert.strictEqual(vm.runInContext("normalizeSavedUi({ combatMode: 'slow' }).combatMode", context), "auto");
assert.strictEqual(vm.runInContext("state = defaultState(); state.characterClass = 'warrior'; classResource().label", context), "Wut");
assert.strictEqual(vm.runInContext("state = defaultState(); state.language = 'en'; state.characterClass = 'rogue'; classResource().label", context), "Cunning");
assert.strictEqual(vm.runInContext("zoneRangeText('meadow')", context), "Level 1-6");
assert.strictEqual(vm.runInContext("zoneRangeText('ironhold')", context), "Level 13-18");
assert.strictEqual(vm.runInContext("state = defaultState(); state.language = 'en'; t('nav.smith')", context), "Smith");
assert(vm.runInContext("state = defaultState(); state.language = 'en'; renderBestiaryList().includes('Collection: 0/')", context), "English mode should translate bestiary collection labels");
assert(vm.runInContext("state = defaultState(); state.language = 'en'; itemStatText({ damage: 2, defense: 0, critChance: 0.01, critDamage: 0.02 }).includes('Attack +2')", context), "English mode should translate item stat labels");
assert(
  vm.runInContext("state = undefined; const oldSave = defaultState(); delete oldSave.rareQuests; const loaded = parseSavedState(JSON.stringify(oldSave)); loaded && loaded.rareQuests && Array.isArray(loaded.questBoard)", context),
  "old saves without rare quests should load before global state exists",
);
assert(
  vm.runInContext("(() => { state = undefined; const brokenSave = { level: 1, hp: 0, maxHp: 0, gold: 0, equipment: null, customItems: null, materials: null, inventory: null, rareQuests: null }; const loaded = parseSavedState(JSON.stringify(brokenSave)); state = loaded; syncDerivedStats(); return loaded && state.maxHp > 0 && state.hp > 0 && state.equipment.weapon === 'trainingSword' && Array.isArray(state.inventory); })()", context),
  "partially corrupted saves should fall back to playable default runtime containers",
);
assert(
  vm.runInContext("(() => { state = undefined; const oldSave = defaultState(); delete oldSave.activeQuests; oldSave.quests = { wolves: 3, ratguard: 1 }; const loaded = parseSavedState(JSON.stringify(oldSave)); return loaded.activeQuests.includes('wolves') && loaded.activeQuests.includes('ratguard'); })()", context),
  "old saves without activeQuests should migrate progressed quests back into the active list",
);
assert.strictEqual(vm.runInContext("enemies.wolf.name", context), "Waldwolf");
assert.strictEqual(vm.runInContext("zones.meadow.enemies[0]", context), "wolf");
assert(vm.runInContext("Object.values(zones).filter((zone) => zone.type === 'dungeon').every((zone) => zone.enemies.every((id) => enemies[id].boss))", context), "dungeons should contain boss enemies");
assert(vm.runInContext("Object.values(enemies).flatMap((enemy) => enemy.drops).every((drop) => items[drop.id])", context), "all fixed enemy drops need item data");
const enemySprites = JSON.parse(vm.runInContext("JSON.stringify(Object.values(enemies).map((enemy) => enemy.sprite))", context));
assert.strictEqual(new Set(enemySprites).size, enemySprites.length, "enemy sprite class combinations should be unique");
const spriteTokens = [...new Set(enemySprites.flatMap((sprite) => sprite.split(/\s+/)).filter(Boolean))];
for (const token of spriteTokens) {
  assert(css.includes(`.${token}`), `Missing CSS sprite class: ${token}`);
}
for (const build of ["tank", "damage", "bruiser"]) {
  assert(css.includes(`.hero-build-${build}`), `Missing hero build sprite CSS: ${build}`);
}
assert(css.includes(".class-list"), "class selector should have dedicated layout CSS");
assert(css.includes(".smith-avatar::before") && css.includes(".enchant-avatar::after"), "Borin and Mira avatars should have detailed CSS silhouettes");
assert(vm.runInContext("state = defaultState(); questAvailable(getQuestById('wolves')) && !questAvailable(getQuestById('fields'))", context), "early quest board should only offer reachable quest targets");
assert(vm.runInContext("state.level = 9; state.renown = 8; selectedZone = 'fields'; questAvailable(getQuestById('fields'))", context), "field quests should unlock when the field zone is selected");
assert(vm.runInContext("state = defaultState(); selectedZone = 'meadow'; selectedEnemy = 'wolf'; state.questBoard = ['wolves', 'rust', 'boars']; refreshQuestBoard(true); state.questBoard.length === 1 && state.questBoard[0] === 'wolves'", context), "wolf target should only show wolf-related quests");
assert(vm.runInContext("state = defaultState(); selectedZone = 'meadow'; selectedEnemy = 'boar'; state.questBoard = ['wolves', 'rust', 'boars']; refreshQuestBoard(true); state.questBoard.length === 1 && state.questBoard[0] === 'boars'", context), "boar target should only show thorn boar quests");
assert(vm.runInContext("state = defaultState(); selectedZone = 'meadow'; selectedEnemy = 'bandit'; state.questBoard = []; refreshQuestBoard(true); state.questBoard.length > 0 && state.questBoard.every((id) => ['bandit', 'rust'].includes(getQuestById(id).target))", context), "bandit target should only show bandit and rust quests");
assert(vm.runInContext("state = defaultState(); state.level = 20; state.renown = 40; selectedZone = 'ashcathedral'; selectedEnemy = 'crownBeast'; state.questBoard = ['boars', 'crownBeast', 'ash', 'dungeon']; refreshQuestBoard(true); !state.questBoard.includes('boars') && state.questBoard.includes('crownBeast')", context), "crown beast should not receive the thorn boar quest");
assert(vm.runInContext("(() => { state = defaultState(); state.level = 20; state.renown = 40; return Object.entries(zones).every(([zoneId, zone]) => zone.enemies.every((enemyId) => { selectedZone = zoneId; selectedEnemy = enemyId; state.questBoard = []; refreshQuestBoard(true); return state.questBoard.length > 0 && state.questBoard.every((id) => questRelevantForCurrentEnemy(getQuestById(id))); })); })()", context), "every enemy should have at least one matching quest board offer");
assert(vm.runInContext("(() => { state = defaultState(); selectedZone = 'meadow'; selectedEnemy = 'wolf'; state.questBoard = ['wolves']; const before = questBoardSourceSignature(); state.gold += 10; return before === questBoardSourceSignature(); })()", context), "quest board cache source should ignore unrelated gold changes");
assert(vm.runInContext("(() => { state = defaultState(); const before = inventorySignature(); state.gold += 10; return before === inventorySignature(); })()", context), "inventory list signature should ignore gold-only changes");
assert(!vm.runInContext("state = defaultState(); renderInventoryItemCard('rustBlade', 0).includes('data-sell')", context), "backpack item cards should not sell directly");
assert(vm.runInContext("state = defaultState(); state.inventory = ['rustBlade', 'wolfRing']; inventorySellTotal() === sellValue(items.rustBlade) + sellValue(items.wolfRing)", context), "merchant sell total should sum backpack items");
assert(vm.runInContext("state = defaultState(); renderMerchantItemRow('rustBlade', 0).includes('data-sell')", context), "merchant rows should expose item selling");
assert(vm.runInContext("state = defaultState(); state.inventory = ['rustBlade', 'wolfRing']; lockInventoryItem('wolfRing'); inventorySellTotal() === sellValue(items.rustBlade)", context), "locked backpack items should be excluded from merchant sell totals");
assert(vm.runInContext("state = defaultState(); state.inventory = ['rustBlade', 'wolfRing']; lockInventoryItem('wolfRing'); render = () => {}; renderLog = () => {}; sellAllInventoryItems(); state.inventory.length === 1 && state.inventory[0] === 'wolfRing' && state.gold === 20 + sellValue(items.rustBlade)", context), "sell all should keep protected backpack items");
assert(vm.runInContext("state = defaultState(); state.inventory = ['rustBlade']; lockInventoryItem('rustBlade'); render = () => {}; renderLog = () => {}; sellInventoryItem(0); state.inventory.includes('rustBlade') && state.gold === 20", context), "protected backpack items should not sell individually");
assert(vm.runInContext("state = defaultState(); state.inventory = ['rustBlade']; lockInventoryItem('rustBlade'); renderInventoryItemCard('rustBlade', 0).includes('data-lock') && renderMerchantItemRow('rustBlade', 0).includes('disabled')", context), "inventory and merchant rows should expose protected item controls");
assert(vm.runInContext("state = defaultState(); state.inventory = ['rustBlade']; lockInventoryItem('rustBlade'); const card = renderInventoryItemCard('rustBlade', 0); card.includes('inventory-item-head') && card.includes('class=\"lock-note\"') && !card.includes('<p class=\"lock-note\"')", context), "protected inventory status should render inside the item header without adding a card row");
assert(vm.runInContext("(() => { state = defaultState(); const before = smithMasterySignature(); state.xp += 10; return before === smithMasterySignature(); })()", context), "smith mastery cache should ignore unrelated xp-only changes");
assert(vm.runInContext("state = defaultState(); renderStationFocus('smith').includes('Verlässliches Handwerk') && renderStationFocus('smith').includes('Reparatur')", context), "Borin station focus should describe reliable smith craft");
assert(vm.runInContext("state = defaultState(); renderStationFocus('enchant').includes('Runenrisiko') && renderStationFocus('enchant').includes('Arkane Slots')", context), "Mira station focus should describe rune risk and arcane slots");
assert(vm.runInContext("state = defaultState(); state.language = 'en'; renderStationFocus('smith').includes('Reliable Craft') && renderStationFocus('enchant').includes('Rune Risk')", context), "station focus chips should translate to English");
assert.strictEqual(vm.runInContext("eliteEncounterChance", context), 0.06);
assert.strictEqual(vm.runInContext("state = defaultState(); state.level = 20; combatRewardScale(enemies.wolf)", context), 0.35);
assert.strictEqual(vm.runInContext("state = defaultState(); state.level = 20; combatRewardScale(enemies.ratguard)", context), 0.6);
assert.strictEqual(vm.runInContext("state = defaultState(); state.level = 20; combatRewardScale(enemies.hollowChampion)", context), 1);
assert.strictEqual(vm.runInContext("state = defaultState(); state.level = 20; scaledCombatReward(100, enemies.wolf)", context), 35);
assert.strictEqual(vm.runInContext("state = defaultState(); state.language = 'en'; t('combat.rewardScaledLog', 'x', { percent: 35 })", context), "Old enemies now give only 35% combat rewards.");
assert.strictEqual(vm.runInContext("knownClassAbilities().length", context), 3);
assert(vm.runInContext("['warrior', 'mage', 'rogue', 'archer'].every((id) => classCatalog[id] && Object.keys(classCatalog[id].buildAbilities).length === 3)", context), "playable classes should ship with three build paths");
assert(vm.runInContext("state = defaultState(); state.characterClass = 'mage'; state.build = 'damage'; knownClassAbilities().map(([id]) => id).join(',') === 'arcaneBolt,emberNova,spellRend'", context), "mage damage build should expose spell damage abilities");
assert(vm.runInContext("state = defaultState(); state.characterClass = 'rogue'; state.build = 'damage'; knownClassAbilities().map(([id]) => id).join(',') === 'backstab,dualCut,finisher'", context), "rogue damage build should expose finisher abilities");
assert(vm.runInContext("state = defaultState(); state.characterClass = 'archer'; state.build = 'damage'; knownClassAbilities().map(([id]) => id).join(',') === 'powerShot,rapidVolley,heartpiercer'", context), "archer damage build should expose shot abilities");
assert(vm.runInContext("state = defaultState(); const warriorDamage = totalStats().damage; state.characterClass = 'mage'; totalStats().damage > warriorDamage && totalStats().maxHp < defaultState().maxHp", context), "mage class should trade health for spell pressure");
assert(vm.runInContext("state = defaultState(); const warrior = totalStats(); state.characterClass = 'rogue'; const rogue = totalStats(); rogue.critChance > warrior.critChance && rogue.critDamage > warrior.critDamage", context), "rogue class should lean into crit pressure");
assert(vm.runInContext("(() => { state = defaultState(); const warrior = totalStats(); state.characterClass = 'archer'; const archer = totalStats(); return archer.damage > warrior.damage && archer.critChance > warrior.critChance; })()", context), "archer class should lean into precise ranged pressure");
assert(vm.runInContext("renderLog = () => {}; render = () => {}; state = defaultState(); syncDerivedStats(); state.hp = Math.floor(state.maxHp / 2); setCharacterClass('mage'); state.characterClass === 'mage' && state.hp < state.maxHp && state.hp >= Math.floor(state.maxHp / 2) - 1", context), "class changes should preserve current health ratio");
assert(vm.runInContext("state = defaultState(); state.language = 'en'; state.characterClass = 'mage'; entityName('class', 'mage', classCatalog.mage.name) === 'Mage' && buildDescription('damage').includes('spell spikes') && entityName('ability', 'arcaneBolt', abilityCatalog.arcaneBolt.name) === 'Arcane Strike'", context), "mage class, build descriptions and abilities should translate to English");
assert(vm.runInContext("state = defaultState(); state.language = 'en'; state.characterClass = 'rogue'; entityName('class', 'rogue', classCatalog.rogue.name) === 'Rogue' && buildDescription('damage').includes('crit windows') && entityName('ability', 'finisher', abilityCatalog.finisher.name) === 'Finisher'", context), "rogue class, build descriptions and abilities should translate to English");
assert(vm.runInContext("state = defaultState(); state.language = 'en'; state.characterClass = 'archer'; entityName('class', 'archer', classCatalog.archer.name) === 'Archer' && buildDescription('damage').includes('quick volleys') && entityName('ability', 'powerShot', abilityCatalog.powerShot.name) === 'Power Shot'", context), "archer class, build descriptions and abilities should translate to English");
assert(vm.runInContext("state = defaultState(); state.characterClass = 'mage'; state.build = 'bruiser'; hasBuildAbility('wardCounter') && playerAbilityDamageMultiplier(enemies.wolf) > 1", context), "mage bruiser abilities should feed combat estimates");
assert(vm.runInContext("state = defaultState(); state.characterClass = 'rogue'; state.build = 'bruiser'; hasBuildAbility('riposte') && playerAbilityDamageMultiplier(enemies.wolf) > 1", context), "rogue bruiser abilities should feed combat estimates");
assert(vm.runInContext("state = defaultState(); state.characterClass = 'archer'; state.build = 'bruiser'; hasBuildAbility('snapShot') && playerAbilityDamageMultiplier(enemies.wolf) > 1", context), "archer bruiser abilities should feed combat estimates");
assert(vm.runInContext("(() => { state = defaultState(); state.language = 'en'; state.build = 'bruiser'; const text = knownClassAbilities().map(([id, ability]) => `${entityName('ability', id, ability.name)} ${entityText('ability', id, ability.text)}`).join(' | '); return text.includes('Battle Rush') && text.includes('Shatter') && text.includes('Counterblow') && !text.includes('Kampfrausch') && !text.includes('Zerschmettern') && !text.includes('Konterschlag'); })()", context), "bruiser abilities should render English names and descriptions");
assert(vm.runInContext("state = defaultState(); state.level = 1; combatActionList({ awaitingPlayerAction: true, resource: 0, maxResource: 6, cooldowns: {} }).filter((action) => action.type === 'ability').every((action) => action.disabledReason.includes('Level'))", context), "abilities should unlock through level progression");
assert(vm.runInContext("state = defaultState(); state.level = 10; const actions = combatActionList({ awaitingPlayerAction: true, resource: 6, maxResource: 6, cooldowns: {} }); actions.some((action) => action.id === 'attack' && !action.disabled) && actions.filter((action) => action.type === 'ability' && !action.disabled).length === 3", context), "level 10 manual combat should expose attack and three usable abilities with enough resource");
assert(vm.runInContext("state = defaultState(); state.level = 10; const combat = { awaitingPlayerAction: false, resource: 6, maxResource: 6, cooldowns: {}, playerHp: 100, combatStats: { maxHp: 100 }, enemyHp: 20, enemy: enemies.wolf }; chooseAutoCombatAction(combat).type === 'ability' && combat.awaitingPlayerAction === false", context), "auto combat should choose from the same actions without stealing manual turn state");
assert(vm.runInContext("state = defaultState(); state.build = 'tank'; const tankDamage = totalStats().damage; state.build = 'damage'; totalStats().damage > tankDamage", context), "damage build should deal more damage than tank");
assert(vm.runInContext("state = defaultState(); state.build = 'damage'; totalStats().critChance > 0.1 && totalStats().critDamage > 1.7", context), "damage build should improve critical stats");
assert.strictEqual(
  vm.runInContext("state = defaultState(); state.build = 'tank'; knownClassAbilities().map(([id]) => id).join(',')", context),
  "shieldWall,tauntingBlow,lastStand",
);
assert(vm.runInContext("state = defaultState(); state.build = 'damage'; hasBuildAbility('execute')", context), "damage build should know execute");
assert(vm.runInContext("state = defaultState(); state.build = 'bruiser'; hasBuildAbility('counterBlow') && hasBuildAbility('shatter')", context), "bruiser build should know counter and shatter");
assert(vm.runInContext("renderLog = () => {}; render = () => {}; state = defaultState(); state.build = 'damage'; syncDerivedStats(); state.hp = Math.floor(state.maxHp / 2); setBuild('tank'); state.hp < state.maxHp && state.hp >= Math.floor(state.maxHp / 2)", context), "build changes should keep current health ratio instead of full healing");
assert.strictEqual(vm.runInContext("abilityDamage(10, 1.75)", context), 17);
assert.strictEqual(vm.runInContext("enemyCriticalStats(enemies.wolf).critChance", context), 0.03);
assert.strictEqual(vm.runInContext("enemyCriticalStats(createEliteEnemy(enemies.wolf, 'wolf')).critDamage", context), 1.6);
assert(vm.runInContext("enemyCriticalStats(enemies.ratguard).critChance >= 0.09", context), "bosses should have stronger crit chance");
assert(vm.runInContext("Object.values(items).every((item) => { const copy = normalizeItemStatsForSlot({ ...item }); const rules = itemSlotRules(copy.slot); return (!rules.damage ? copy.damage === 0 : true) && (!rules.defense ? copy.defense === 0 : true) && (!rules.critChance ? (copy.critChance || 0) === 0 : true) && (!rules.critDamage ? (copy.critDamage || 0) === 0 : true); })", context), "fixed items should follow slot stat rules");
assert(vm.runInContext("Object.values(items).every((item) => itemScore(item) <= itemBalanceBudget(item) + 0.001)", context), "fixed items should stay inside their rarity balance budget");
assert(vm.runInContext("(() => { const order = ['common', 'rare', 'epic', 'legendary']; return equipmentSlots.every((slot) => { const byQuality = order.map((quality) => Object.values(items).filter((item) => item.slot === slot && item.quality === quality).map(itemScore)); for (let i = 0; i < byQuality.length - 1; i += 1) { if (!byQuality[i].length || !byQuality[i + 1].length) continue; if (Math.max(...byQuality[i]) > Math.max(...byQuality[i + 1])) return false; } return true; }); })()", context), "higher rarity fixed items should not be weaker than lower rarity peaks in the same slot");
assert(vm.runInContext("(() => { const order = ['common', 'rare', 'epic', 'legendary']; return lootSlots.every((slot) => order.every((quality, index) => { if (index === 0) return true; const previous = itemStatCap(slot, order[index - 1]); const current = itemStatCap(slot, quality); return current.damage >= previous.damage && current.defense >= previous.defense; })); })()", context), "generated item stat caps should grow by rarity");
assert(vm.runInContext("Object.values(items).every((item) => !item.effect || itemEffectCatalog[item.effect]?.slots?.includes(item.slot))", context), "fixed item effects should exist and fit their slots");
assert(vm.runInContext("Object.values(itemEffectCatalog).every((effect) => effect.slots.every((slot) => equipmentSlots.includes(slot)))", context), "all item effects should target known equipment slots");
assert(vm.runInContext("['huntingMark', 'ironWard', 'pilgrimPace', 'mendersThread', 'openingCut', 'scavengerCharm', 'battleLesson', 'ashTempo', 'revenantSeal'].every((id) => itemEffectCatalog[id])", context), "expanded item effect package should be registered");
assert(vm.runInContext("['huntingMark', 'ironWard', 'pilgrimPace', 'mendersThread', 'openingCut', 'scavengerCharm', 'battleLesson'].every((id) => { const effect = itemEffectCatalog[id]; return itemEffectScore({ id: 'test', slot: effect.slots[0], quality: 'rare', effect: id }) <= itemEffectBudget('rare'); })", context), "new rare item effects should fit the rare effect budget");
assert(vm.runInContext("itemEffectScore({ id: 'test', slot: 'ring', quality: 'rare', effect: 'mendersThread' }) < itemEffectScore({ id: 'test', slot: 'ring', quality: 'legendary', effect: 'lifeSiphon' })", context), "small hybrid healing effects should score below stronger healing effects");
assert(vm.runInContext("Object.values(enemies).filter((enemy) => enemy.boss).every((enemy) => enemy.drops.length >= 1 && enemy.drops.length <= 2 && enemy.drops.every((drop) => items[drop.id] && drop.chance > 0))", context), "dungeon bosses should have one or two valid fixed drops");
assert(vm.runInContext("Object.values(enemies).filter((enemy) => enemy.boss).every((enemy) => enemy.drops.every((drop) => drop.chance >= 0.018))", context), "boss fixed drops should have readable drop chances");
assert(vm.runInContext("Object.values(enemies).filter((enemy) => enemy.boss).every((enemy) => enemy.firstClear?.renown > 0 && enemy.firstClear?.gold > 0)", context), "dungeon bosses should grant first-clear rewards");
assert(vm.runInContext("(() => { state = defaultState(); render = () => {}; const originalRandom = Math.random; Math.random = () => 0; try { createLootChoices(enemies.ratguard, 'ratguard'); const ids = state.pendingLoot.map((item) => item.id); return ids.includes('guardAxe') && ids.includes('cellkeeperBulwark'); } finally { Math.random = originalRandom; } })()", context), "boss fixed drops should roll independently and allow multiple boss items in one loot batch");
assert(vm.runInContext("state = defaultState(); state.bossDropPity.ratguard = 2; bossDropPityText('ratguard', 'short').includes('2/3')", context), "boss drop pity should expose progress text");
assert(vm.runInContext("(() => { state = defaultState(); render = () => {}; const originalRandom = Math.random; Math.random = () => 0.99; try { createLootChoices(enemies.ratguard, 'ratguard'); return state.bossDropPity.ratguard === 1 && !state.pendingLoot.some((item) => item.fixed); } finally { Math.random = originalRandom; } })()", context), "boss drop pity should increase after dry boss wins");
assert(vm.runInContext("(() => { state = defaultState(); render = () => {}; state.bossDropPity.ratguard = bossDropPityGoal; const originalRandom = Math.random; Math.random = () => 0.99; try { createLootChoices(enemies.ratguard, 'ratguard'); return state.bossDropPity.ratguard === 0 && state.pendingLoot.some((item) => item.fixed && ['guardAxe', 'cellkeeperBulwark'].includes(item.id)); } finally { Math.random = originalRandom; } })()", context), "boss drop pity should guarantee a fixed boss drop after enough dry wins");
assert(vm.runInContext("(() => { const loaded = { ...defaultState(), bossDropPity: { ratguard: 99, wolf: 2 } }; normalizeLoadedCollections(loaded); return loaded.bossDropPity.ratguard === bossDropPityGoal && !('wolf' in loaded.bossDropPity); })()", context), "boss drop pity save data should normalize to known bosses");
assert(vm.runInContext("state = defaultState(); const reward = grantBossFirstClear(enemies.ratguard, 'ratguard'); reward && state.defeatedBosses.includes('ratguard') && state.renown === reward.renown && state.gold === 20 + reward.gold", context), "first boss clear should grant one-time rewards");
assert(vm.runInContext("const beforeGold = state.gold; grantBossFirstClear(enemies.ratguard, 'ratguard') === null && state.gold === beforeGold", context), "first boss clear should not pay twice");
assert(vm.runInContext("state = defaultState(); renderBossRewardPanel('ratguard', enemies.ratguard).includes('Bossbeute') && renderBossRewardPanel('ratguard', enemies.ratguard).includes('Erster Sieg')", context), "boss reward panel should show loot and first-clear rewards");
assert(vm.runInContext("state = defaultState(); state.bossDropPity.ratguard = bossDropPityGoal; renderBossRewardPanel('ratguard', enemies.ratguard).includes('Nächster Sieg garantiert')", context), "boss UI should show guaranteed boss loot state");
assert(vm.runInContext("state = defaultState(); renderEnemyCardMeta(enemies.ratguard, 'ratguard').includes('Erster Sieg offen') && renderEnemyCardMeta(enemies.ratguard, 'ratguard').includes('feste Drops')", context), "boss enemy cards should summarize first-clear and fixed drops");
assert(vm.runInContext("state = defaultState(); state.defeatedBosses = ['ratguard']; renderEnemyCardMeta(enemies.ratguard, 'ratguard').includes('Erster Sieg geholt')", context), "boss enemy card first-clear state should update after the reward is claimed");
assert(vm.runInContext("rollItemEffect('weapon', 'legendary', enemies.crownBoar) && itemEffectPool('weapon', 'legendary', enemies.crownBoar).includes(rollItemEffect('weapon', 'legendary', enemies.crownBoar))", context), "legendary generated items should be able to roll valid effects");
assert(vm.runInContext("state = defaultState(); state.equipment.weapon = 'rustBlade'; itemEffectSummary().bleedChance > 0", context), "equipped effects should be summarized for combat");
assert(vm.runInContext("state = defaultState(); state.equipment.ring = 'dukeSignet'; combatStatsWithItemEffects(totalStats(), enemies.ironDuke).critChance > totalStats().critChance", context), "elite hunter should increase crit chance against elites and bosses");
assert(vm.runInContext("state = defaultState(); state.equipment.boots = 'houndGreaves'; itemEffectSummary().durabilityReduction > 0", context), "steady step should reduce durability wear");
assert(vm.runInContext("state = defaultState(); state.equipment.chest = 'bruteMail'; itemEffectSummary().thornsRatio > 0", context), "thorn guard should be summarized for combat");
assert(vm.runInContext("state = defaultState(); state.equipment.chest = 'knightPlate'; itemEffectSummary().enemyCritReduction > 0", context), "steadfast ward should lower enemy crit pressure");
assert(vm.runInContext("state = defaultState(); state.equipment.weapon = 'crownFang'; itemEffectSummary().critHealRatio > 0", context), "life siphon should be summarized for combat");
assert(vm.runInContext("state = defaultState(); state.equipment.offhand = 'cellkeeperBulwark'; itemEffectSummary().firstHitReduction > 0 && itemEffectSummary().firstHitWeaken < 1", context), "boss drops can combine defensive effects");
assert(vm.runInContext("state = defaultState(); state.equipment.weapon = 'cryptCrusher'; itemEffectSummary().eliteDamageBonus > 0 && itemEffectSummary().eliteArmorIgnore > 0", context), "boss weapons can specialize against elites and bosses");
assert(vm.runInContext("state = defaultState(); state.equipment.weapon = 'guardAxe'; itemEffectSummary().bleedChance > 0 && itemEffectSummary().eliteDamageBonus > 0", context), "early boss weapons should combine bleed and elite pressure");
assert(vm.runInContext("state = defaultState(); state.customItems.openingTest = { id: 'openingTest', slot: 'weapon', quality: 'rare', damage: 1, defense: 0, effect: 'openingCut' }; state.equipment.weapon = 'openingTest'; itemEffectSummary().firstStrikeBonus > 0 && expectedPlayerDamagePerRound(enemies.bandit, totalStats()) > expectedPlayerDamagePerRound(enemies.bandit, { ...totalStats(), damage: totalStats().damage - 1 }, { ...itemEffectSummary(), firstStrikeBonus: 0 })", context), "opening cut should improve expected player pressure");
assert(vm.runInContext("state = defaultState(); state.customItems.progressTest = { id: 'progressTest', slot: 'ring', quality: 'rare', damage: 1, defense: 0, effect: 'scavengerCharm' }; state.equipment.ring = 'progressTest'; itemEffectSummary().lootBonus > 0 && itemEffectSummary().goldBonus > 0", context), "scavenger charm should summarize loot and gold bonuses");
assert(vm.runInContext("state = defaultState(); state.customItems.lessonTest = { id: 'lessonTest', slot: 'necklace', quality: 'rare', damage: 1, defense: 0, effect: 'battleLesson' }; state.equipment.necklace = 'lessonTest'; itemEffectSummary().xpBonus > 0 && combatStatsWithItemEffects(totalStats(), enemies.ratguard).critChance > totalStats().critChance", context), "battle lesson should summarize xp and elite crit pressure");
assert(vm.runInContext("state = defaultState(); state.equipment.ring = 'wardenShackle'; combatStatsWithItemEffects(totalStats(), enemies.chainWarden).critChance > totalStats().critChance && itemEffectSummary().goldBonus > 0", context), "boss trophies should help against elites while improving gold wins");
assert(vm.runInContext("state = defaultState(); state.equipment.chest = 'oathMantle'; itemEffectSummary().firstHitReduction > 0 && itemEffectSummary().enemyCritReduction > 0", context), "defensive boss drops should combine opening protection and crit pressure reduction");
assert(vm.runInContext("itemEffectPool('weapon', 'epic', enemies.crownBoar).includes('rendEdge') && itemEffectPool('ring', 'legendary', enemies.ironDuke).includes('trophyHunter') && itemEffectPool('boots', 'epic', enemies.crownBeast).includes('wardedTread')", context), "generated loot pools should include the expanded item effects");
assert(vm.runInContext("itemEffectPool('weapon', 'rare', enemies.bandit).includes('huntingMark') && itemEffectPool('chest', 'rare', enemies.bandit).includes('ironWard') && itemEffectPool('boots', 'rare', enemies.bandit).includes('scavengerCharm') && itemEffectPool('necklace', 'rare', enemies.bandit).includes('battleLesson') && itemEffectPool('weapon', 'epic', enemies.crownBeast).includes('ashTempo') && itemEffectPool('ring', 'epic', enemies.ratguard).includes('revenantSeal')", context), "new item effects should appear in generated loot pools");
assert(vm.runInContext("itemEffectPool('ring', 'epic', enemies.ratguard).includes('chainSnare')", context), "dungeon loot should be able to roll chain snare");
assert(vm.runInContext("(() => { state = defaultState(); const originalRandom = Math.random; Math.random = () => 0.93; try { const withoutBonus = rollQuality(enemies.wolf); state.customItems.finder = { id: 'finder', slot: 'ring', quality: 'rare', damage: 1, defense: 0, effect: 'scavengerCharm' }; state.equipment.ring = 'finder'; const withBonus = rollQuality(enemies.wolf); return withoutBonus === 'rare' && withBonus === 'epic'; } finally { Math.random = originalRandom; } })()", context), "loot quality item effects should improve generated loot quality rolls");
assert(vm.runInContext("(() => { state = defaultState(); state.language = 'en'; const translated = itemEffectDisplayName('openingCut') === 'Opening Cut' && itemEffectDisplayText('scavengerCharm').includes('loot quality'); state.language = 'de'; return translated; })()", context), "new item effects should be translated in English");
assert(vm.runInContext("Math.min(...Object.values(enemies).filter((enemy) => enemy.boss).flatMap((enemy) => enemy.drops.map((drop) => drop.chance))) >= 0.022", context), "improved boss fixed drops should no longer sit below 2.2%");
assert(vm.runInContext("lootSlots.every((slot) => { const stats = normalizeRolledItemStats(slot, 'legendary', rollSlotStats(slot, 20, qualityPower.legendary)); const rules = itemSlotRules(slot); return (!rules.damage ? stats.damage === 0 : true) && (!rules.defense ? stats.defense === 0 : true); })", context), "generated item stats should follow slot roles");
assert(vm.runInContext("(() => { const wholePercent = (value) => Math.abs((value || 0) * 100 - Math.round((value || 0) * 100)) < 0.000001; return Object.values(items).every((item) => { const normalized = normalizeItemStatsForSlot({ ...item }); return wholePercent(normalized.critChance) && wholePercent(normalized.critDamage); }); })()", context), "fixed item crit values should use whole percentage steps");
assert(vm.runInContext("(() => { const wholePercent = (value) => Math.abs((value || 0) * 100 - Math.round((value || 0) * 100)) < 0.000001; return lootSlots.every((slot) => { const crit = rollCritStats(slot, 'legendary'); return wholePercent(crit.critChance) && wholePercent(crit.critDamage); }); })()", context), "generated crit values should use whole percentage steps");
assert.strictEqual(
  vm.runInContext("itemStatText({ damage: 0, defense: 5, critChance: 0, critDamage: 0 })", context),
  "Verteidigung +5",
);
assert(!vm.runInContext("renderLootStatGrid({ damage: 0, defense: 5, critChance: 0, critDamage: 0 }).includes('Angriff')", context), "loot stat cards should hide zero item stats");
assert(vm.runInContext("renderLootCard({ ...items.rustBlade, id: 'rustBlade', sourceEnemy: 'bandit' }, 0).includes('Blutkante')", context), "loot cards should show item effects");
assert(vm.runInContext("renderItemTooltip(items.dukeSignet).includes('Elitenj')", context), "tooltips should show item effects");
assert(!vm.runInContext("renderLootCompare(compareLoot({ damage: 0, defense: 5, critChance: 0, critDamage: 0 }, { damage: 0, defense: 0, critChance: 0, critDamage: 0 })).includes('Angriff')", context), "loot comparison should hide unchanged zero stats");
assert(vm.runInContext("renderLootCompare(compareLoot({ damage: 0, defense: 0, critChance: 0, critDamage: 0 }, { damage: 0, defense: 0, critChance: 0, critDamage: 0 })).includes('Keine Stat-')", context), "loot comparison should show a neutral fallback when nothing changes");
assert.strictEqual(vm.runInContext("combatLogEntry({ round: 2, actor: 'hero', damage: 7, text: 'Du triffst für 7.' }).text", context), "R2 · Du: Du triffst für 7.");
assert.strictEqual(vm.runInContext("combatLogEntry({ round: 3, actor: 'enemy', damage: 0, text: 'Kampfrausch heilt 12 Leben.' }).type", context), "heal");
assert.strictEqual(vm.runInContext("combatSummary([{ critical: true, damage: 20, text: 'Du triffst kritisch.' }, { damage: 0, text: 'Kampfrausch heilt 12 Leben.' }, { damage: 0, text: 'Blutung hält an.' }])", context), "1 Crit · 1 Heilung · 1 Effekt");
assert.strictEqual(vm.runInContext("rollCombatEvent(enemies.wolf, 1)", context), null);
assert(vm.runInContext("combatEventLogText({ name: 'Klare Öffnung', text: 'Test.' }).includes('Kampfereignis')", context), "combat event log text should be explicit");
assert(vm.runInContext("combatEventPool(enemies.wolf).some((event) => event.id === 'beastTracks') && !combatEventPool(enemies.bandit).some((event) => event.id === 'beastTracks')", context), "beast combat events should only appear for beast or wolf enemies");
assert(vm.runInContext("combatEventPool(enemies.ratguard).some((event) => event.id === 'ancientCache') && combatEventPool(enemies.ratguard).some((event) => event.id === 'challengerRoar')", context), "dungeon bosses should include dungeon and elite combat events");
assert(vm.runInContext("combatEventPool(enemies.crownBeast).some((event) => event.id === 'ashfall') && combatEventPool(enemies.crownBeast).some((event) => event.id === 'beastTracks')", context), "ash beasts should include ash and beast combat events");
assert(vm.runInContext("state = defaultState(); state.language = 'en'; combatEventLogText(combatEventCatalog.find((event) => event.id === 'ancientCache')).includes('Ancient Cache')", context), "new combat events should use English translations");
assert(html.includes('id="battleEventBadge"') && html.includes('id="battleEventName"'), "combat event badge should have stable DOM anchors");
assert(html.includes('id="battleEventBadge" hidden aria-live="polite" tabindex="0"'), "combat event badge should be focusable for tooltip access");
assert(css.includes("content: attr(data-event-description)") && css.includes(".battle-event-badge:hover::after"), "combat event badge should expose a hover tooltip");
assert(vm.runInContext("combatEventTone(combatEventCatalog.find((event) => event.id === 'merchantRumor')) === 'reward' && combatEventTone(combatEventCatalog.find((event) => event.id === 'grimOmen')) === 'danger' && combatEventTone(combatEventCatalog.find((event) => event.id === 'clearOpening')) === 'advantage'", context), "combat event tones should match their gameplay effect");
assert(vm.runInContext("combatEventAnimationEntry(combatEventCatalog.find((event) => event.id === 'grimOmen'), enemies.wolf, 100).combatEventText === combatEventText(combatEventCatalog.find((event) => event.id === 'grimOmen'))", context), "combat event animation entries should keep effect text for tooltip display");
assert(vm.runInContext("(() => { state = defaultState(); selectedZone = 'meadow'; selectedEnemy = 'wolf'; preparedCombatEvents.clear(); const originalRandom = Math.random; let calls = 0; Math.random = () => (calls++ === 0 ? 1 : 0); try { const enemy = getPreparedEncounter('wolf'); const first = prepareCombatEvent(enemy, 'wolf'); const second = prepareCombatEvent(enemy, 'wolf'); return first === null && second === null && preparedCombatEvents.has(preparedCombatEventKey('wolf')); } finally { Math.random = originalRandom; preparedCombatEvents.clear(); } })()", context), "prepared combat events should stay stable while the same enemy is shown");
assert(vm.runInContext("(() => { state = defaultState(); selectedZone = 'meadow'; selectedEnemy = 'wolf'; preparedCombatEvents.clear(); const originalRandom = Math.random; Math.random = () => 0; try { const enemy = getPreparedEncounter('wolf'); const prepared = prepareCombatEvent(enemy, 'wolf'); const consumed = consumePreparedCombatEvent(enemy, 'wolf'); return prepared && consumed === prepared && !preparedCombatEvents.has(preparedCombatEventKey('wolf')); } finally { Math.random = originalRandom; preparedCombatEvents.clear(); } })()", context), "starting a fight should consume the prepared combat event");
assert(vm.runInContext("['Einfach', 'Machbar', 'Riskant', 'Tödlich'].includes(riskFor(enemies.wolf))", context), "risk labels should use the clear risk scale");
assert(vm.runInContext("state = defaultState(); state.hp = 10; riskFor(enemies.boar) !== 'Einfach'", context), "low current health should make risk stricter");
assert(vm.runInContext("combatRiskEstimate(enemies.wolf).playerDamagePerRound > 0 && combatRiskEstimate(enemies.wolf).enemyDamagePerRound > 0", context), "risk estimate should expose positive combat pressure values");
assert(vm.runInContext("Object.values(enemies).every((enemy) => (enemy.abilities || []).every((id) => enemyAbilityCatalog[id]) && (enemy.passives || []).every((id) => enemyAbilityCatalog[id]))", context), "enemy abilities and passives need catalog entries");
assert(vm.runInContext("Object.values(enemies).every((enemy) => enemyAbilityIds(enemy).length >= (enemy.boss ? 3 : enemy.elite ? 2 : 1))", context), "normal, elite and boss enemies need enough abilities");
assert(vm.runInContext("Object.values(enemies).filter((enemy) => enemy.boss).every((enemy) => enemyPassiveIds(enemy).length >= 1)", context), "dungeon bosses need passives");
assert(vm.runInContext("Object.values(enemies).filter((enemy) => enemy.boss).every((enemy) => enemyAbilityIds(enemy).length === 4 && enemyPassiveIds(enemy).length >= 2)", context), "expanded dungeon bosses should have four active tools and at least two passives");
assert(vm.runInContext("enemyAbilityIds(createEliteEnemy(enemies.wolf, 'wolf')).length >= 2", context), "elite variants should gain a bonus ability");
assert(
  vm.runInContext("Object.values(enemies).every((enemy) => generatedLootPoolCount(enemy) + enemy.drops.length >= 15 && generatedLootPoolCount(enemy) + enemy.drops.length <= 20)", context),
  "enemy item pools should stay between 15 and 20 items",
);
assert(vm.runInContext("Object.values(materialDrops).flat().every((drop) => materialLabel[drop.id])", context), "all material drops need labels");
assert(vm.runInContext("['boneAcolyte', 'cryptBrute', 'emberPriest', 'crownBeast', 'hollowChampion'].every((id) => materialDrops[id].some((drop) => drop.id === 'graveSeal'))", context), "late dungeon bosses should be able to drop grave seals for Mira mastery");
assert(vm.runInContext("Object.entries(materialDrops).filter(([, drops]) => drops.some((drop) => drop.id === 'graveSeal')).every(([id, drops]) => (enemies[id]?.tags?.dungeon || enemies[id]?.tags?.ash) && drops.some((drop) => drop.id === 'graveSeal' && drop.max > 0))", context), "grave seals should only drop from fitting dungeon or ash enemies with a positive amount");
assert(vm.runInContext("Object.keys(salvageValue({ slot: 'weapon', quality: 'rare', damage: 1, defense: 0, set: 'iron' })).includes('oathMark')", context));
assert(vm.runInContext("normalizeMaterials({ hide: 2, fang: 3, iron: 4 }).leather === 2", context));
assert.strictEqual(vm.runInContext("questRenownReward({ rarity: 'epic' })", context), 2);
assert.strictEqual(vm.runInContext("state.renown = 20; renownUpgradeDiscount()", context), 0.08);
assert(vm.runInContext("state.renown = 15; renownSalvageBonusChance({ quality: 'rare' }) > 0", context));
assert.strictEqual(vm.runInContext("state = defaultState(); currentSmithMasteryLimit()", context), 5);
assert.strictEqual(vm.runInContext("state = defaultState(); upgradeCost({ slot: 'weapon', quality: 'common', upgrade: 0 }).gold", context), 28);
assert.strictEqual(vm.runInContext("state = defaultState(); upgradeCost({ slot: 'weapon', quality: 'common', upgrade: 5 }).materials.emberCore", context), 1);
assert(vm.runInContext("state = defaultState(); state.gold = 999; state.materials.scrap = 99; canUpgrade({ slot: 'weapon', quality: 'common', upgrade: 4 }) && !canUpgrade({ slot: 'weapon', quality: 'common', upgrade: 5 })", context), "starter smith mastery should allow +5 but block higher upgrades");
assert(vm.runInContext("state = defaultState(); state.level = 6; state.renown = 5; state.customItems.trainingSword = { ...items.trainingSword, id: 'trainingSword', name: 'Übungsschwert +5', upgrade: 5 }; canStartSmithMasteryMission(smithMasteryRanks[0])", context), "first smith mastery mission should unlock from level, renown and a maxed equipped item");
assert(!vm.runInContext("state = defaultState(); smithMasteryDiscovered()", context), "smith mastery should stay hidden before the first maxed item");
assert(vm.runInContext("state = defaultState(); state.customItems.trainingSword = { ...items.trainingSword, id: 'trainingSword', name: 'Übungsschwert +5', upgrade: 5 }; smithMasteryDiscovered()", context), "smith mastery should reveal once an equipped item reaches the current limit");
assert.strictEqual(vm.runInContext("previewUpgradedItem({ slot: 'weapon', quality: 'common', name: 'Testklinge', damage: 10, defense: 0, upgrade: 0 }).damage", context), 12);
assert(vm.runInContext("previewUpgradedItem({ slot: 'weapon', quality: 'common', name: 'Testklinge', damage: 10, defense: 0, critChance: 0.01, upgrade: 0 }).critChance > 0.01", context));
assert.strictEqual(vm.runInContext("previewUpgradedItem({ slot: 'weapon', quality: 'common', name: 'Testklinge', damage: 10, defense: 0, critChance: 0.01, upgrade: 0 }).critChance", context), 0.02);
assert.strictEqual(vm.runInContext("previewUpgradedItem({ slot: 'ring', quality: 'common', name: 'Testring', damage: 1, defense: 5, upgrade: 0 }).defense", context), 0);
assert.strictEqual(vm.runInContext("previewUpgradedItem({ slot: 'chest', quality: 'rare', name: 'Testpanzer', damage: 3, defense: 10, critChance: 0.1, upgrade: 0 }).damage", context), 0);
assert.strictEqual(
  vm.runInContext("normalizeRolledItemStats('weapon', 'common', { damage: 999, defense: 0 }).damage", context),
  vm.runInContext("itemStatCap('weapon', 'common').damage", context),
);
assert(
  vm.runInContext("normalizeRolledItemStats('weapon', 'legendary', { damage: 1, defense: 0 }).damage", context)
    > vm.runInContext("itemStatCap('weapon', 'common').damage", context),
  "legendary weapon floor should be stronger than common weapon cap",
);
vm.runInContext("state.gold = 123; save();", context);
assert.strictEqual(JSON.parse(storage["fantasy-grind-save-v1"]).gold, 123);
assert.strictEqual(JSON.parse(storage["fantasy-grind-save-v1-backup"]).gold, 123);
assert(vm.runInContext("window.name.includes('fantasy-grind-save-v1')", context), "save should also be mirrored into window.name for preview reloads");
assert(vm.runInContext("indexedDbName === 'FantasyGrindSaves' && indexedDbStoreName === 'saves'", context), "IndexedDB save mirror should use stable database names");
assert(vm.runInContext("browserStorageStatus().indexedDB.label === 'IndexedDB' && browserStorageStatus().indexedDB.ok === false && saveDiagnostics.indexedDbMirror === 'nicht verfuegbar'", context), "IndexedDB mirror should fail softly when the browser API is unavailable");
assert(vm.runInContext("browserStorageStatus().localStorage.ok", context), "storage diagnostics should confirm working localStorage");
assert(vm.runInContext("parseSavedState('{broken') === null && saveDiagnostics.lastParseError.length > 0", context), "bad saves should expose a parse error for diagnostics");
assert(
  vm.runInContext("localStorage.setItem(saveKey, '{broken'); localStorage.setItem(saveBackupKey, JSON.stringify({ ...defaultState(), gold: 321 })); state = load(); state.gold === 321 && saveDiagnostics.recoveredFrom === 'Backup'", context),
  "load should recover from backup instead of falling through to a fresh save",
);
assert.strictEqual(vm.runInContext("selectedZone = 'meadow'; selectedEnemy = zones.meadow.enemies[1]; save(); load().ui.selectedEnemy", context), vm.runInContext("zones.meadow.enemies[1]", context));
assert.strictEqual(vm.runInContext("state = defaultState(); render = () => {}; importSaveData(JSON.stringify({ ...defaultState(), ui: { selectedZone: 'meadow', selectedEnemy: zones.meadow.enemies[2] } })); selectedEnemy", context), vm.runInContext("zones.meadow.enemies[2]", context));
assert(vm.runInContext("state = defaultState(); selectedZone = 'meadow'; saveFileName().includes('Level-1-Ruhm-0-Grauwacht-Wald')", context), "save filename should include useful progress info");
assert(vm.runInContext("state = defaultState(); const exported = JSON.parse(exportSaveData()); exported.metadata.level === 1 && exported.metadata.zone === 'Grauwacht-Wald' && exported.metadata.equipment.weapon === 'Übungsschwert'", context), "save exports should include readable progress metadata");
assert(vm.runInContext("/\\d{4}-\\d{2}-\\d{2}-\\d{2}-\\d{2}/.test(saveFileName())", context), "save filename should include date and time");
assert(vm.runInContext("state.log = []; remindSaveBackup('Testmoment.'); state.log[0].startsWith('Tipp: Spielstand herunterladen')", context), "important moments should create a save reminder");
assert(vm.runInContext("const cachedSave = storageGet(saveKey); localStorage = { getItem() { throw new Error('blocked'); }, setItem() { throw new Error('blocked'); } }; storageGet(saveKey) === cachedSave", context), "window.name fallback should load when localStorage is blocked");
assert(vm.runInContext("exportSaveData().includes('Fantasy Grind')", context));
assert(vm.runInContext("state.gold = 0; restCost()", context) > 0);
assert(vm.runInContext("render = () => {}; state = defaultState(); state.hp = 10; state.gold = 0; rest(); state.hp === state.maxHp && state.gold === 0", context), "resting without gold should heal without charging hidden costs");
assert(vm.runInContext("state = defaultState(); state.completedQuests = ['wolves', 'rust', 'boars']; state.questBoard = []; refreshQuestBoard(true); state.questBoard.length > 0 && state.questBoard.every((id) => questAvailable(getQuestById(id)))", context), "repeatable standard quests should refill the board after completion");
assert(vm.runInContext("state = defaultState(); state.level = 17; state.renown = 30; selectedZone = 'ashgrounds'; state.questBoard = []; refreshQuestBoard(true); state.questBoard.length > 0 && !state.questBoard.includes('wolves') && state.questBoard.every((id) => questRelevantForCurrentZone(getQuestById(id)))", context), "late zones should not offer low-level starter quests");
assert(vm.runInContext("state = defaultState(); selectedZone = 'meadow'; selectedEnemy = 'wolf'; render = () => {}; renderLog = () => {}; state.questBoard = ['wolves']; acceptQuest('wolves'); state.activeQuests.includes('wolves') && !state.questBoard.includes('wolves')", context), "accepted quests should move from the board into active quests");
assert(vm.runInContext("state = defaultState(); selectedZone = 'meadow'; selectedEnemy = 'wolf'; render = () => {}; renderLog = () => {}; state.activeQuests = ['wolves']; state.quests.wolves = 4; state.questBoard = []; cancelQuest('wolves'); !state.activeQuests.includes('wolves') && !('wolves' in state.quests)", context), "active quests should be deletable from the quest list");
assert(vm.runInContext("(() => { state = defaultState(); render = () => {}; renderLog = () => {}; const quest = { ...rareQuestTemplates.find((entry) => entry.key === 'dungeon'), id: 'rare-dungeon-smoke', rare: true, rewardItem: true }; state.rareQuests[quest.id] = quest; state.activeQuests = [quest.id]; state.quests[quest.id] = quest.needed - 1; const beforeGold = state.gold; updateQuestProgress(enemies.ratguard, 'ratguard'); return state.completedQuests.includes(quest.id) && !state.activeQuests.includes(quest.id) && state.gold === beforeGold + quest.rewardGold && state.pendingLoot.some((item) => item.sourceType === 'quest' && item.sourceQuest === quest.id); })()", context), "quest completion should grant rewards, remove active quests, and queue reward loot");
assert(vm.runInContext("state = defaultState(); state.questBoard = ['wolves']; markQuestAsNew('wolves'); state.unseenQuests.includes('wolves')", context), "new quests should be tracked for UI badges");
assert(vm.runInContext("forgetNewQuest('wolves'); !state.unseenQuests.includes('wolves')", context), "accepted or completed quests should clear their new marker");
assert(vm.runInContext("state = defaultState(); state.completedQuests = ['wolves', 'rust', 'boars']; state.questBoard = []; refreshQuestBoard(true); state.unseenQuests.length > 0", context), "freshly refilled empty boards should glow as new quests");
assert(vm.runInContext("rareQuestDropChance(enemies.wolf) > 0 && rareQuestDropChance(enemies.ratguard) > rareQuestDropChance(enemies.wolf)", context), "rare quest drop chances should be explicit and scale by enemy type");
assert(vm.runInContext("state = defaultState(); state.language = 'en'; const quest = { ...rareQuestTemplates.find((entry) => entry.key === 'elite'), id: 'rare-elite-test' }; questDisplayName(quest) === 'Oath Against the Fallen' && questDisplayText(quest).includes('elite enemies')", context), "dynamic rare quests should use translated names and text");
assert(vm.runInContext("state = defaultState(); state.language = 'en'; itemDisplayName({ ...items.cryptCrusher, id: 'cryptCrusher' }) === 'Crypt Splitter'", context), "drop item names should use English display names");
assert(vm.runInContext("state = defaultState(); state.language = 'en'; zoneForEnemy('ratguard') === 'Crypt of Graywatch'", context), "enemy zone labels should use translated zone names");
assert(vm.runInContext("state = defaultState(); render = () => {}; createLootChoices(enemies.wolf, 'wolf'); const before = Object.keys(state.discoveredLoot.wolf || {}).length; chooseLoot(0, false); before === 0 && Object.keys(state.discoveredLoot.wolf || {}).length === 1", context), "bestiary loot should register only after a loot item is chosen");
assert(vm.runInContext("state = defaultState(); renderBestiaryList().includes('completion-bar')", context), "bestiary cards should keep the visual loot progress bar");
assert(vm.runInContext("state = defaultState(); const html = renderBestiaryList(); html.includes('Sammlung: 0/') && !html.includes('Level 1') && !html.includes('44 Leben')", context), "bestiary cards should show compact collection progress instead of level and hp");
assert(vm.runInContext("(() => { state = defaultState(); selectedBestiaryType = 'zone'; selectedBestiaryZone = 'meadow'; selectedBestiaryEnemy = 'wolf'; const bestiaryHtml = renderBestiaryList(); return bestiaryHtml.includes('data-bestiary-type=\"zone\"') && bestiaryHtml.includes('data-bestiary-type=\"dungeon\"') && bestiaryHtml.includes('Grauwacht-Wald') && !bestiaryHtml.includes('Krypta der Grauwacht'); })()", context), "bestiary should separate normal zones from dungeons");
assert(vm.runInContext("(() => { state = defaultState(); selectedBestiaryType = 'zone'; selectedBestiaryZone = 'meadow'; selectedBestiaryEnemy = 'wolf'; const bestiaryHtml = renderBestiaryList(); return bestiaryHtml.includes('bestiary-section-head--zone') && bestiaryHtml.includes('Normale Gebiete') && bestiaryHtml.includes('Funde') && bestiaryHtml.includes('3 Gegner'); })()", context), "bestiary zone tab should show a dedicated normal-zone summary");
assert(vm.runInContext("(() => { state = defaultState(); selectedBestiaryType = 'dungeon'; selectedBestiaryZone = 'meadow'; selectedBestiaryEnemy = 'wolf'; const bestiaryHtml = renderBestiaryList(); return selectedBestiaryZone === 'crypt' && selectedBestiaryEnemy === 'ratguard' && bestiaryHtml.includes('Krypta der Grauwacht') && !bestiaryHtml.includes('Grauwacht-Wald'); })()", context), "bestiary dungeon tab should select the first dungeon when needed");
assert(vm.runInContext("(() => { state = defaultState(); selectedBestiaryType = 'dungeon'; selectedBestiaryZone = 'crypt'; selectedBestiaryEnemy = 'ratguard'; const bestiaryHtml = renderBestiaryList(); return bestiaryHtml.includes('bestiary-section-head--dungeon') && bestiaryHtml.includes('Dungeon-Bosse') && bestiaryHtml.includes('bestiary-section-summary') && bestiaryHtml.includes('Erste Siege') && bestiaryHtml.includes('Feste Drops'); })()", context), "bestiary dungeon tab should summarize boss progress");
assert(vm.runInContext("(() => { state = defaultState(); state.language = 'en'; selectedBestiaryType = 'zone'; selectedBestiaryZone = 'meadow'; selectedBestiaryEnemy = 'wolf'; const bestiaryHtml = renderBestiaryList(); return bestiaryHtml.includes('Open Zones') && bestiaryHtml.includes('3 enemies'); })()", context), "bestiary section split should be translated in English");
assert.strictEqual(vm.runInContext("previewUpgradedItem({ slot: 'chest', quality: 'rare', name: 'Testpanzer +10', damage: 0, defense: 10, upgrade: 10 }).defense", context), 12);
assert.strictEqual(vm.runInContext("previewUpgradedItem({ slot: 'weapon', quality: 'rare', name: 'Testklinge +20', damage: 10, defense: 0, critChance: 0.1, critDamage: 0.2, upgrade: 20 }).critDamage", context), 0.21);
assert(vm.runInContext("(() => { function clone(id) { return { ...items[id], id }; } function upgradeTo(item, target) { let copy = { ...item }; while ((copy.upgrade || 0) < target) copy = previewUpgradedItem(copy); return copy; } function equipBest(level, upgrade) { const ids = new Set(Object.values(defaultState().equipment)); Object.values(enemies).filter((enemy) => enemy.level <= level).forEach((enemy) => enemy.drops.forEach((drop) => ids.add(drop.id))); state.equipment = { ...state.equipment }; state.customItems = {}; equipmentSlots.forEach((slot) => { const best = [...ids].map(clone).filter((item) => item.slot === slot).sort((a, b) => itemScore(b) - itemScore(a))[0]; if (!best) return; const item = upgradeTo(best, upgrade); item.id = `power-${slot}`; state.customItems[item.id] = item; state.equipment[slot] = item.id; }); } state = defaultState(); state.level = 16; state.build = 'damage'; equipBest(16, 10); syncDerivedStats(); state.hp = state.maxHp; return riskFor(enemies.ironDuke, totalStats()) !== 'Einfach'; })()", context), "iron duke should remain threatening against level 16 upgraded damage builds");
assert(vm.runInContext("(() => { function clone(id) { return { ...items[id], id }; } function upgradeTo(item, target) { let copy = { ...item }; while ((copy.upgrade || 0) < target) copy = previewUpgradedItem(copy); return copy; } function equipBest(level, upgrade) { const ids = new Set(Object.values(defaultState().equipment)); Object.values(enemies).filter((enemy) => enemy.level <= level).forEach((enemy) => enemy.drops.forEach((drop) => ids.add(drop.id))); state.equipment = { ...state.equipment }; state.customItems = {}; equipmentSlots.forEach((slot) => { const best = [...ids].map(clone).filter((item) => item.slot === slot).sort((a, b) => itemScore(b) - itemScore(a))[0]; if (!best) return; const item = upgradeTo(best, upgrade); item.id = `power-${slot}`; state.customItems[item.id] = item; state.equipment[slot] = item.id; }); } state = defaultState(); state.level = 20; state.build = 'damage'; equipBest(20, 15); syncDerivedStats(); state.hp = state.maxHp; return riskFor(enemies.hollowChampion, totalStats()) !== 'Einfach'; })()", context), "hollow champion should not be trivial for level 20 +15 damage builds");
assert(vm.runInContext("state = defaultState(); const rows = renderAllBestiaryRows('wolf', enemies.wolf); rows.includes('Unbekannt') && rows.includes('Chance') && rows.includes('Ring des Rudels')", context), "bestiary should reveal drop names and chances while locking undiscovered details");
assert(!vm.runInContext("state = defaultState(); renderAllBestiaryRows('wolf', enemies.wolf).includes('1x')", context), "bestiary rows should not show found counts");
assert.strictEqual(vm.runInContext("state = defaultState(); maxEnchantSlotsForLevel()", context), 0);
assert.strictEqual(vm.runInContext("state = defaultState(); state.level = 8; maxEnchantSlotsForLevel()", context), 1);
assert.strictEqual(vm.runInContext("state = defaultState(); state.level = 14; maxEnchantSlotsForLevel()", context), 1);
assert.strictEqual(vm.runInContext("state.enchanting.completed = ['unstableRunes']; maxEnchantSlotsForLevel()", context), 2);
assert.strictEqual(vm.runInContext("state.enchanting.completed = ['unstableRunes', 'forbiddenLibrary']; maxEnchantSlotsForLevel()", context), 3);
assert(vm.runInContext("(() => { state = defaultState(); state.level = 8; state.customItems.trainingSword = { ...items.trainingSword, id: 'trainingSword', enchantments: ['keenEdge', 'cruelMark', 'warSigil'] }; const item = getItem(state.equipment.weapon); return activeItemEnchantments(item).length === 1 && inactiveItemEnchantments(item).length === 2; })()", context), "Mira mastery should cap active enchantment slots while keeping later runes locked");
assert(vm.runInContext("(() => { state = defaultState(); state.level = 8; state.customItems.trainingSword = { ...items.trainingSword, id: 'trainingSword', enchantments: ['keenEdge', 'cruelMark', 'warSigil'] }; const locked = equippedEnchantmentSummary(); state.enchanting.completed = ['unstableRunes', 'forbiddenLibrary']; const unlocked = equippedEnchantmentSummary(); return locked.critChance === 0.02 && locked.critDamage === 0 && locked.damage === 0 && unlocked.critDamage === 0.08 && unlocked.damage === 5; })()", context), "locked Mira runes should stay saved without counting into combat stats");
assert(vm.runInContext("(() => { state.enchanting.completed = ['unstableRunes']; const item = getItem(state.equipment.weapon); return activeItemEnchantments(item).length === 2 && inactiveItemEnchantments(item).length === 1; })()", context), "Mira's first mastery should activate the second saved rune slot");
assert(vm.runInContext("(() => { state.enchanting.completed = ['unstableRunes', 'forbiddenLibrary']; const item = getItem(state.equipment.weapon); return activeItemEnchantments(item).length === 3 && inactiveItemEnchantments(item).length === 0; })()", context), "Mira's second mastery should activate the third saved rune slot");
assert(vm.runInContext("state = defaultState(); state.level = 12; state.renown = 10; state.customItems.trainingSword = { ...items.trainingSword, id: 'trainingSword', enchantments: ['keenEdge'] }; canStartEnchantMasteryMission(enchantMasteryRanks[0])", context), "Mira's first mastery mission should require level, renown and an enchanted equipped item");
assert(!vm.runInContext("state = defaultState(); state.level = 20; allowedEnchantRarities().includes('arcane')", context), "arcane enchantments should stay locked before Mira's final mastery");
assert(vm.runInContext("state = defaultState(); state.level = 20; state.enchanting.completed = ['unstableRunes', 'forbiddenLibrary', 'voidRitual']; allowedEnchantRarities().includes('arcane')", context), "Mira's final mastery should unlock arcane enchantments");
assert(vm.runInContext("Object.values(enchantmentCatalog).every((enchantment) => enchantment.slots.every((slot) => equipmentSlots.includes(slot)))", context), "enchantments should only target valid equipment slots");
assert(vm.runInContext("Object.values(enchantmentCatalog).every((enchantment) => Object.values(enchantment.stats || {}).every((value) => Math.abs(value) >= 0.01 || value === 0))", context), "enchantment values should avoid tiny unreadable decimals");
assert(vm.runInContext("state = defaultState(); state.level = 8; const commonCost = enchantCost().gold; state.enchanting.completed = ['unstableRunes']; const rareCost = enchantCost().gold; state.enchanting.completed = ['unstableRunes', 'forbiddenLibrary']; const epicCost = enchantCost().gold; state.enchanting.completed = ['unstableRunes', 'forbiddenLibrary', 'voidRitual']; commonCost < rareCost && rareCost < epicCost && epicCost < enchantCost().gold", context), "Mira's ritual costs should scale with unlocked rune power");
assert(vm.runInContext("(() => { const summary = clampEnchantmentSummary({ ...emptyEnchantmentSummary(), critChance: 0.6, critDamage: 1.2, damageReduction: 0.9, lootBonus: 0.8, maxHp: -999 }); return summary.critChance <= 0.18 && summary.critDamage <= 0.45 && summary.damageReduction <= 0.24 && summary.lootBonus <= 0.24 && summary.maxHp >= -80; })()", context), "enchantment totals should be capped so stacked runes cannot break builds");
assert(vm.runInContext("state = defaultState(); state.level = 8; state.customItems.trainingSword = { ...items.trainingSword, id: 'trainingSword', enchantments: ['keenEdge'] }; totalStats().critChance > 0.06", context), "equipped enchantments should affect player stats");
assert(vm.runInContext("state = defaultState(); state.level = 8; state.gold = 999; state.materials.shard = 9; state.materials.moonDust = 9; render = () => {}; renderLog = () => {}; enchantEquipped('weapon', 'offense'); getItem(state.equipment.weapon).enchantments.length === 1", context), "enchanting should add a valid enchantment to equipped gear");
assert.strictEqual(vm.runInContext("achievementCatalog.length", context), 20);
assert(vm.runInContext("new Set(achievementCatalog.map((achievement) => achievement.id)).size === achievementCatalog.length", context), "achievement ids should be unique");
assert(vm.runInContext("achievementCatalog.every((achievement) => !achievement.reward?.materials || Object.keys(achievement.reward.materials).every((id) => materialLabel[id]))", context), "achievement rewards should only use known materials");
assert.strictEqual(vm.runInContext("defaultState().achievements.claimed.length", context), 0);
assert(vm.runInContext("state = defaultState(); state.combatStats.eliteKills = 1; achievementProgress(achievementById('firstElite')).ready", context), "first elite achievement should become ready after one elite kill");
assert(vm.runInContext("state = defaultState(); state.discoveredLoot.wolf = { one: { quality: 'legendary', set: 'wolf' } }; achievementProgress(achievementById('legendaryFind')).ready && achievementProgress(achievementById('setHunter')).ready", context), "loot achievements should use discovered item data");
assert(vm.runInContext("state = defaultState(); render = () => {}; state.combatStats.eliteKills = 1; claimAchievement('firstElite'); state.achievements.claimed.includes('firstElite') && state.renown === 1 && state.gold === 60", context), "claiming achievements should grant rewards once");
assert(vm.runInContext("claimAchievement('firstElite'); state.renown === 1 && state.gold === 60", context), "claimed achievements should not pay twice");
assert(vm.runInContext("state = defaultState(); state.level = 8; state.gold = 999; state.materials.shard = 99; state.materials.moonDust = 99; render = () => {}; renderLog = () => {}; enchantEquipped('weapon', 'offense'); state.combatStats.itemsEnchanted === 1 && achievementProgress(achievementById('firstEnchant')).ready", context), "enchanting should progress achievement counters");
assert(vm.runInContext("state = defaultState(); state.inventory = ['rustBlade', 'wolfRing']; render = () => {}; renderLog = () => {}; salvageAllInventoryItems(); state.combatStats.itemsSalvaged === 2", context), "bulk salvage should progress achievement counters");

console.log("Smoke test passed");
