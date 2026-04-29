const fs = require("fs");
const path = require("path");
const vm = require("vm");
const assert = require("assert");

const root = path.resolve(__dirname, "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

const html = read("index.html");
const scripts = ["scripts/data.js", "scripts/core.js", "scripts/render.js"].map(read);

assert(!/[Ã�]/.test(html), "index.html still contains likely mojibake characters");

const htmlIds = new Set([...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]));
const dynamicIds = new Set(["bestiaryDetail", "bestiarySearch"]);
const referencedIds = new Set(
  [...scripts.join("\n").matchAll(/\$\("([^"]+)"\)/g)].map((match) => match[1]),
);

for (const id of referencedIds) {
  assert(htmlIds.has(id) || dynamicIds.has(id), `Missing DOM id referenced by $(): ${id}`);
}

const scriptOrder = [...html.matchAll(/<script src="\.\/([^"?]+)[^"]*"><\/script>/g)].map((match) => match[1]);
assert.deepStrictEqual(scriptOrder, [
  "scripts/data.js",
  "scripts/core.js",
  "scripts/render.js",
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
assert(vm.runInContext("state.level = 9; state.renown = 8; questAvailable(getQuestById('fields'))", context), "field quests should unlock when the field zone unlocks");
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
assert.strictEqual(vm.runInContext("renderLog = () => {}; render = () => {}; state = defaultState(); state.build = 'damage'; syncDerivedStats(); state.hp = 10; setBuild('tank'); state.hp", context), vm.runInContext("state.maxHp", context));
assert.strictEqual(vm.runInContext("abilityDamage(10, 1.75)", context), 17);
assert.strictEqual(vm.runInContext("enemyCriticalStats(enemies.wolf).critChance", context), 0.03);
assert.strictEqual(vm.runInContext("enemyCriticalStats(createEliteEnemy(enemies.wolf, 'wolf')).critDamage", context), 1.6);
assert(vm.runInContext("enemyCriticalStats(enemies.ratguard).critChance >= 0.09", context), "bosses should have stronger crit chance");
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
assert(vm.runInContext("exportSaveData().includes('Fantasy Grind')", context));
assert(vm.runInContext("state.gold = 0; restCost()", context) > 0);

console.log("Smoke test passed");
