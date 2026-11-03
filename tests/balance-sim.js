// Balance-Simulation (Punkt 15): spielt einen Spieler von Level 1 bis 20 mit den echten Spielfunktionen
// (Beute mit Auto-Loot, Material, Quests, Schmied-Upgrades, Risiko-Einschätzung) und misst Kämpfe und Spielzeit pro Level.
//
// Start: npm run balance            (Bericht)
//        node tests/balance-sim.js --check   (Exit-Code 1, wenn die Ziele verfehlt werden)
//
// Annahmen (bewusst einfach, damit die Zahlen vergleichbar bleiben):
// - Der Spieler kämpft gegen den Gegner mit der besten XP pro Minute, den er mit mindestens 90 % Siegchance schlägt.
// - Zeit pro Kampf: 1,5 s Grundzeit + 0,9 s pro Kampfrunde (entspricht dem Auto-Kampf mit Animation).
// - Niederlagen kosten nur Zeit. Gold wird für Upgrades und Rasten ausgegeben.
// - Schmied-Meisteraufträge: Upgrade-Limit +10 ab Level 10, +15 ab Level 15 (so wie man sie typischerweise erfüllt).

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.resolve(__dirname, "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const html = read("index.html");
const order = [...html.matchAll(/<script src="\.\/([^"?]+)[^"]*"><\/script>/g)].map((match) => match[1]);
const lazy = ["scripts/i18n-en.js", "scripts/data-achievements.js", "scripts/data-drops.js"];
const files = [...order.filter((file) => file !== "scripts/events.js"), ...lazy];

// Ziele aus dem Arbeitsplan
const TARGET_MIN_HOURS = 2;
const TARGET_MAX_HOURS = 4;
const MAX_STEP_RATIO = 2; // Sprung-Prüfung erst ab 1,5 min pro Level (kürzere Level schwanken zu stark)
const SEED = 20261101;

function createContext() {
  const storage = {};
  const noopElement = new Proxy({}, { get: () => () => null });
  const context = {
    console: { log() {}, warn() {}, error() {} },
    localStorage: { getItem: (key) => storage[key] || null, setItem: (key, value) => { storage[key] = String(value); }, removeItem: (key) => { delete storage[key]; } },
    document: { getElementById: () => null, querySelectorAll: () => [], querySelector: () => null, createElement: () => noopElement, documentElement: { dataset: {} } },
    window: { setTimeout, clearTimeout, requestAnimationFrame: (callback) => setTimeout(callback, 0), cancelAnimationFrame: clearTimeout, innerWidth: 1280, innerHeight: 720 },
    setTimeout,
    clearTimeout,
    performance: { now: () => 0 },
    Map,
    Date,
  };
  // Fester Zufall, damit Durchläufe vergleichbar sind
  let seed = SEED;
  const random = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
  context.Math = Object.create(Math);
  context.Math.random = random;
  vm.createContext(context);
  for (const file of files) vm.runInContext(read(file), context, { filename: file });
  vm.runInContext("render = () => {}; renderLog = () => {}; save = () => {}; queueSave = () => {};", context);
  return context;
}

function simulate(classId = "warrior") {
  const context = createContext();
  const run = (code) => vm.runInContext(code, context);
  run(`
    state = defaultState();
    state.characterClass = ${JSON.stringify(classId)};
    swapStarterItems(state.characterClass);
    state.settings.autoLoot = true;
    state.settings.autoSellCommon = true;
    syncDerivedStats();
    state.hp = state.maxHp;
  `);

  const levels = [];
  let levelStart = { seconds: 0, fights: 0 };
  let seconds = 0;
  let fights = 0;
  let guard = 0;

  while (run("state.level") < 20 && guard < 60000) {
    guard += 1;
    // Schmied-Meisterschaft grob nachbilden
    run(`state.smithMastery.limit = state.level >= 15 ? 15 : state.level >= 10 ? 10 : 5;`);
    // besten Gegner wählen: höchste XP pro Minute bei >= 90 % Siegchance
    const pick = JSON.parse(run(`JSON.stringify((() => {
      const stats = totalStats();
      const options = Object.entries(zones)
        .filter(([zoneId, zone]) => zone.type === "zone" && isZoneUnlocked(zoneId))
        .flatMap(([zoneId, zone]) => zone.enemies.map((id) => [zoneId, id]))
        .filter(([, id]) => enemies[id] && !enemies[id].boss)
        .map(([zoneId, id]) => {
          const enemy = enemies[id];
          const estimate = combatRiskEstimate(enemy, stats);
          const chance = offlineWinChance(enemy, stats);
          const rounds = Math.max(1, Math.ceil(estimate.playerRoundsToWin));
          const time = 1.5 + rounds * 0.9;
          const xp = enemy.xp * combatRewardScale(enemy);
          return { zoneId, id, chance, rounds, time, value: (xp * chance) / time };
        });
      const safe = options.filter((option) => option.chance >= 0.9);
      const pool = safe.length ? safe : options.sort((a, b) => b.chance - a.chance).slice(0, 1);
      return pool.sort((a, b) => b.value - a.value)[0];
    })())`));

    run(`ui.selectedZone = ${JSON.stringify(pick.zoneId)}; ui.selectedEnemy = ${JSON.stringify(pick.id)};`);
    // Quest-Tafel nutzen: verfügbare Quests annehmen (bis zum Limit der Tafel)
    run(`refreshQuestBoard(false); state.questBoard.slice().forEach((id) => { if (state.activeQuests.length < 3 && questAvailable(getQuestById(id))) acceptQuest(id); });`);

    fights += 1;
    seconds += pick.time;
    const won = run(`Math.random()`) < pick.chance;
    if (won) {
      run(`(() => {
        const id = ui.selectedEnemy;
        const enemy = getPreparedEncounter(id);
        const scale = combatRewardScale(enemy);
        state.gold += Math.floor(((enemy.gold[0] + enemy.gold[1]) / 2) * scale);
        gainXp(Math.floor(enemy.xp * scale));
        grantMaterials(id, false);
        maybeGrantBattleRenown(enemy);
        createLootChoices(enemy, id);
        updateQuestProgress(enemy, id);
        state.combatStats = normalizeCombatStats(state.combatStats);
        state.combatStats.wins += 1;
      })()`);
    }
    // Gold sinnvoll ausgeben: Upgrades, gelegentlich Rasten/Reparieren
    run(`(() => {
      for (const slot of equipmentSlots) {
        for (let i = 0; i < 3; i += 1) {
          const item = getItem(state.equipment[slot]);
          if (!item || !canUpgrade(item)) break;
          upgradeEquipped(slot);
        }
      }
      if (state.combatStats.wins % 8 === 0 && state.gold > restCost()) state.gold -= restCost();
      Object.keys(state.itemDurability || {}).forEach((id) => { state.itemDurability[id] = 100; });
    })()`);

    const level = run("state.level");
    if (level > levels.length + 1) {
      while (levels.length < level - 1) {
        levels.push({
          level: levels.length + 1,
          fights: fights - levelStart.fights,
          minutes: (seconds - levelStart.seconds) / 60,
          enemy: pick.id,
        });
      }
      levelStart = { seconds, fights };
    }
  }

  const totalHours = seconds / 3600;
  return { levels, totalHours, fights };
}

function report(result) {
  const lines = ["Level  Kämpfe  Minuten  Gegner"];
  result.levels.forEach((entry) => {
    lines.push(`${String(entry.level).padStart(5)}  ${String(entry.fights).padStart(6)}  ${entry.minutes.toFixed(1).padStart(7)}  ${entry.enemy}`);
  });
  lines.push(`Gesamt: ${result.fights} Kämpfe, ${result.totalHours.toFixed(2)} Stunden bis Level 20`);
  return lines.join("\n");
}

function evaluate(result) {
  const problems = [];
  if (result.totalHours < TARGET_MIN_HOURS || result.totalHours > TARGET_MAX_HOURS) {
    problems.push(`Gesamtzeit ${result.totalHours.toFixed(2)} h liegt ausserhalb von ${TARGET_MIN_HOURS}–${TARGET_MAX_HOURS} h`);
  }
  result.levels.forEach((entry, index) => {
    const previous = result.levels[index - 1];
    if (previous && previous.minutes > 1.5 && entry.minutes > previous.minutes * MAX_STEP_RATIO) {
      problems.push(`Level ${entry.level} dauert ${entry.minutes.toFixed(1)} min, mehr als doppelt so lange wie Level ${previous.level} (${previous.minutes.toFixed(1)} min)`);
    }
  });
  return problems;
}

// Spielbare Klassen, die bis Level 20 im Zielbereich liegen müssen (Punkt 22: Magier).
const SIM_CLASSES = ["warrior", "mage"];

if (require.main === module) {
  const only = process.argv.includes("--class") ? [process.argv[process.argv.indexOf("--class") + 1]] : SIM_CLASSES;
  let failed = false;
  for (const classId of only) {
    const result = simulate(classId);
    console.log(`== ${classId}`);
    console.log(report(result));
    const problems = evaluate(result);
    problems.forEach((problem) => console.log(`WARNUNG (${classId}): ${problem}`));
    failed = failed || problems.length > 0;
  }
  console.log(failed ? "BALANCE: Ziele verfehlt" : "BALANCE: im Zielbereich");
  if (process.argv.includes("--check") && failed) process.exit(1);
}

module.exports = { simulate, evaluate, report };
