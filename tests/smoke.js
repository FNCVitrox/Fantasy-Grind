const fs = require("fs");
const path = require("path");
const vm = require("vm");
const assert = require("assert");

const root = path.resolve(__dirname, "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

const html = read("index.html");
const scripts = ["scripts/data.js", "scripts/save-system.js", "scripts/core.js", "scripts/render.js", "scripts/render-loot.js"].map(read);

assert(!/[Ã�]/.test(html), "index.html still contains likely mojibake characters");

const htmlIds = new Set([...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]));
const dynamicIds = new Set(["bestiaryDetail", "bestiarySearch", "smithGreeting", "smithGreetingText", "battleResult"]);
const referencedIds = new Set(
  [...scripts.join("\n").matchAll(/\$\("([^"]+)"\)/g)].map((match) => match[1]),
);

for (const id of referencedIds) {
  assert(htmlIds.has(id) || dynamicIds.has(id), `Missing DOM id referenced by $(): ${id}`);
}

const scriptOrder = [...html.matchAll(/<script src="\.\/([^"?]+)[^"]*"><\/script>/g)].map((match) => match[1]);
assert.deepStrictEqual(scriptOrder, [
  "scripts/data.js",
  "scripts/save-system.js",
  "scripts/core.js",
  "scripts/render.js",
  "scripts/render-loot.js",
  "scripts/events.js",
]);

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
assert.strictEqual(context.defaultState().level, 1);
assert.strictEqual(context.defaultState().build, "bruiser");
assert.strictEqual(vm.runInContext("enemies.wolf.name", context), "Waldwolf");
assert.strictEqual(vm.runInContext("zones.meadow.enemies[0]", context), "wolf");
assert(vm.runInContext("Object.values(zones).filter((zone) => zone.type === 'dungeon').every((zone) => zone.enemies.every((id) => enemies[id].boss))", context), "dungeons should contain boss enemies");
assert(vm.runInContext("Object.values(enemies).flatMap((enemy) => enemy.drops).every((drop) => items[drop.id])", context), "all fixed enemy drops need item data");
assert(vm.runInContext("state = defaultState(); questAvailable(getQuestById('wolves')) && !questAvailable(getQuestById('fields'))", context), "early quest board should only offer reachable quest targets");
assert(vm.runInContext("state.level = 9; state.renown = 8; selectedZone = 'fields'; questAvailable(getQuestById('fields'))", context), "field quests should unlock when the field zone is selected");
assert.strictEqual(vm.runInContext("eliteEncounterChance", context), 0.06);
assert.strictEqual(vm.runInContext("knownClassAbilities().length", context), 3);
assert(vm.runInContext("state = defaultState(); const normal = totalStats().damage; state.build = 'damage'; totalStats().damage > normal", context), "damage build should increase damage");
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
assert(vm.runInContext("lootSlots.every((slot) => { const stats = normalizeRolledItemStats(slot, 'legendary', rollSlotStats(slot, 20, qualityPower.legendary)); const rules = itemSlotRules(slot); return (!rules.damage ? stats.damage === 0 : true) && (!rules.defense ? stats.defense === 0 : true); })", context), "generated item stats should follow slot roles");
assert(vm.runInContext("(() => { const wholePercent = (value) => Math.abs((value || 0) * 100 - Math.round((value || 0) * 100)) < 0.000001; return Object.values(items).every((item) => { const normalized = normalizeItemStatsForSlot({ ...item }); return wholePercent(normalized.critChance) && wholePercent(normalized.critDamage); }); })()", context), "fixed item crit values should use whole percentage steps");
assert(vm.runInContext("(() => { const wholePercent = (value) => Math.abs((value || 0) * 100 - Math.round((value || 0) * 100)) < 0.000001; return lootSlots.every((slot) => { const crit = rollCritStats(slot, 'legendary'); return wholePercent(crit.critChance) && wholePercent(crit.critDamage); }); })()", context), "generated crit values should use whole percentage steps");
assert.strictEqual(
  vm.runInContext("itemStatText({ damage: 0, defense: 5, critChance: 0, critDamage: 0 })", context),
  "Verteidigung +5",
);
assert(!vm.runInContext("renderLootStatGrid({ damage: 0, defense: 5, critChance: 0, critDamage: 0 }).includes('Angriff')", context), "loot stat cards should hide zero item stats");
assert(!vm.runInContext("renderLootCompare(compareLoot({ damage: 0, defense: 5, critChance: 0, critDamage: 0 }, { damage: 0, defense: 0, critChance: 0, critDamage: 0 })).includes('Angriff')", context), "loot comparison should hide unchanged zero stats");
assert(vm.runInContext("renderLootCompare(compareLoot({ damage: 0, defense: 0, critChance: 0, critDamage: 0 }, { damage: 0, defense: 0, critChance: 0, critDamage: 0 })).includes('Keine Stat-')", context), "loot comparison should show a neutral fallback when nothing changes");
assert.strictEqual(vm.runInContext("combatLogEntry({ round: 2, actor: 'hero', damage: 7, text: 'Du triffst für 7.' }).text", context), "R2 · Du: Du triffst für 7.");
assert.strictEqual(vm.runInContext("combatLogEntry({ round: 3, actor: 'enemy', damage: 0, text: 'Kampfrausch heilt 12 Leben.' }).type", context), "heal");
assert(vm.runInContext("['Einfach', 'Machbar', 'Riskant', 'Tödlich'].includes(riskFor(enemies.wolf))", context), "risk labels should use the clear risk scale");
assert(vm.runInContext("state = defaultState(); state.hp = 10; riskFor(enemies.boar) !== 'Einfach'", context), "low current health should make risk stricter");
assert(vm.runInContext("combatRiskEstimate(enemies.wolf).playerDamagePerRound > 0 && combatRiskEstimate(enemies.wolf).enemyDamagePerRound > 0", context), "risk estimate should expose positive combat pressure values");
assert(vm.runInContext("Object.values(enemies).every((enemy) => (enemy.abilities || []).every((id) => enemyAbilityCatalog[id]) && (enemy.passives || []).every((id) => enemyAbilityCatalog[id]))", context), "enemy abilities and passives need catalog entries");
assert(vm.runInContext("Object.values(enemies).every((enemy) => enemyAbilityIds(enemy).length >= (enemy.boss ? 3 : enemy.elite ? 2 : 1))", context), "normal, elite and boss enemies need enough abilities");
assert(vm.runInContext("Object.values(enemies).filter((enemy) => enemy.boss).every((enemy) => enemyPassiveIds(enemy).length >= 1)", context), "dungeon bosses need passives");
assert(vm.runInContext("enemyAbilityIds(createEliteEnemy(enemies.wolf, 'wolf')).length >= 2", context), "elite variants should gain a bonus ability");
assert(
  vm.runInContext("Object.values(enemies).every((enemy) => generatedLootPoolCount(enemy) + enemy.drops.length >= 15 && generatedLootPoolCount(enemy) + enemy.drops.length <= 20)", context),
  "enemy item pools should stay between 15 and 20 items",
);
assert(vm.runInContext("Object.values(materialDrops).flat().every((drop) => materialLabel[drop.id])", context), "all material drops need labels");
assert(vm.runInContext("Object.keys(salvageValue({ slot: 'weapon', quality: 'rare', damage: 1, defense: 0, set: 'iron' })).includes('oathMark')", context));
assert(vm.runInContext("normalizeMaterials({ hide: 2, fang: 3, iron: 4 }).leather === 2", context));
assert.strictEqual(vm.runInContext("questRenownReward({ rarity: 'epic' })", context), 2);
assert.strictEqual(vm.runInContext("state.renown = 20; renownUpgradeDiscount()", context), 0.08);
assert(vm.runInContext("state.renown = 15; renownSalvageBonusChance({ quality: 'rare' }) > 0", context));
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
assert(vm.runInContext("state = defaultState(); state.questBoard = ['wolves']; markQuestAsNew('wolves'); state.unseenQuests.includes('wolves')", context), "new quests should be tracked for UI badges");
assert(vm.runInContext("forgetNewQuest('wolves'); !state.unseenQuests.includes('wolves')", context), "accepted or completed quests should clear their new marker");
assert(vm.runInContext("state = defaultState(); state.completedQuests = ['wolves', 'rust', 'boars']; state.questBoard = []; refreshQuestBoard(true); state.unseenQuests.length > 0", context), "freshly refilled empty boards should glow as new quests");
assert(vm.runInContext("rareQuestDropChance(enemies.wolf) > 0 && rareQuestDropChance(enemies.ratguard) > rareQuestDropChance(enemies.wolf)", context), "rare quest drop chances should be explicit and scale by enemy type");
assert(vm.runInContext("state = defaultState(); render = () => {}; createLootChoices(enemies.wolf, 'wolf'); const before = Object.keys(state.discoveredLoot.wolf || {}).length; chooseLoot(0, false); before === 0 && Object.keys(state.discoveredLoot.wolf || {}).length === 1", context), "bestiary loot should register only after a loot item is chosen");
assert(vm.runInContext("state = defaultState(); renderBestiaryList().includes('completion-bar')", context), "bestiary cards should keep the visual loot progress bar");
assert(vm.runInContext("state = defaultState(); const html = renderBestiaryList(); html.includes('Loot: 0/') && !html.includes('Level 1') && !html.includes('44 Leben')", context), "bestiary cards should show compact loot progress instead of level and hp");

console.log("Smoke test passed");
