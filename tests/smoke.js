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

const context = {
  console,
  localStorage: {
    getItem: () => null,
    setItem: () => {},
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

console.log("Smoke test passed");
