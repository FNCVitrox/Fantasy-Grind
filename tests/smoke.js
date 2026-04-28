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
assert.strictEqual(vm.runInContext("enemies.wolf.name", context), "Waldwolf");
assert.strictEqual(vm.runInContext("zones.meadow.enemies[0]", context), "wolf");
assert.strictEqual(vm.runInContext("eliteEncounterChance", context), 0.06);
assert(
  vm.runInContext("Object.values(enemies).every((enemy) => generatedLootPoolCount(enemy) + enemy.drops.length >= 15 && generatedLootPoolCount(enemy) + enemy.drops.length <= 20)", context),
  "enemy item pools should stay between 15 and 20 items",
);
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
