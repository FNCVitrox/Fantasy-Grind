let state = load();
let selectedZone = "meadow";
let selectedEnemy = "wolf";
let selectedBestiaryZone = "meadow";
let selectedBestiaryEnemy = "wolf";
let isFighting = false;
let skipCombat = false;
let bestiaryListDirty = true;
let bestiaryListHtml = "";
let selectedBestiaryCategory = "overview";
let selectedBestiaryFilter = "all";
let selectedBestiarySearch = "";
let selectedBestiaryPage = 0;
let selectedBestiaryItemKey = "";
let logExpanded = false;
let smithView = "home";
let combatWatchdog = 0;
let bestiarySearchFrame = 0;
const tooltipItemCache = new Map();
const bestiaryLootCache = new Map();
const renderCache = {};

const elementCache = new Map();
const $ = (id) => {
  if (!elementCache.has(id)) {
    elementCache.set(id, document.getElementById(id));
  }
  return elementCache.get(id);
};
const random = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const balanceVersion = 3;
const eliteEncounterChance = 0.06;
const maxBestiaryLootPerEnemy = 20;
const generatedLootPoolSize = maxBestiaryLootPerEnemy;
const renownRanks = [
  { threshold: 0, name: "Fremder", benefit: "Noch kein Vorteil" },
  { threshold: 5, name: "Bekannter Kämpfer", benefit: "Reparaturen -10%" },
  { threshold: 10, name: "Verlässliche Klinge", benefit: "Quest-Tafel hält 4 Aufträge bereit" },
  { threshold: 15, name: "Schmiedefreund", benefit: "Zerlegen kann Bonus-Material geben" },
  { threshold: 20, name: "Held der Grauwacht", benefit: "Upgrades -8% Goldkosten" },
  { threshold: 30, name: "Eliteschrecken", benefit: "Elite-Gegner und Zerlegen geben bessere Chancen" },
  { threshold: 40, name: "Meister der Grauwacht", benefit: "Seltene Aufträge erscheinen öfter" },
];
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
function defaultState() {
  return {
    level: 1,
    xp: 0,
    hp: 100,
    maxHp: 100,
    gold: 20,
    deaths: 0,
    renown: 0,
    characterClass: "warrior",
    build: "bruiser",
    knownAbilities: [],
    durability: 100,
    itemDurability: {},
    equipment: {
      weapon: "trainingSword",
      offhand: "wornBuckler",
      chest: "paddedVest",
      pants: "patchedTrousers",
      boots: "travelBoots",
      necklace: "twineNecklace",
      ring: "copperRing",
    },
    customItems: {},
    pendingLoot: [],
    lootQueue: [],
    nextEncounters: {},
    inventory: [],
    materials: emptyMaterials(),
    discoveredLoot: {},
    quests: { wolves: 0, rust: 0, elites: 0 },
    questBoard: ["wolves", "rust", "boars"],
    activeQuests: [],
    completedQuests: [],
    rareQuests: {},
    winsSinceQuestRefresh: 0,
    balanceVersion: 3,
    log: ["Du erreichst das Lager Grauwacht. Der Grind beginnt langsam."],
  };
}

function load() {
  const candidates = [
    { key: saveKey, label: "Hauptspielstand" },
    { key: saveBackupKey, label: "Backup" },
    { key: savePreviousKey, label: "vorheriges Backup" },
  ];

  for (const candidate of candidates) {
    const raw = localStorage.getItem(candidate.key);
    if (!raw) continue;
    const loaded = parseSavedState(raw);
    if (!loaded) continue;
    if (candidate.key !== saveKey) {
      loaded.log = [
        `Spielstand aus ${candidate.label} wiederhergestellt.`,
        ...(loaded.log || []),
      ].slice(0, 40);
      const restored = JSON.stringify(loaded);
      localStorage.setItem(saveKey, restored);
      localStorage.setItem(saveBackupKey, restored);
    }
    return loaded;
  }

  return defaultState();
}

function emptyMaterials() {
  return Object.fromEntries(Object.keys(materialLabel).map((id) => [id, 0]));
}

function parseSavedState(raw) {
  try {
    const parsed = normalizeSavedText(JSON.parse(raw));
    const loaded = { ...defaultState(), ...parsed };
    if (!Array.isArray(parsed.activeQuests)) {
      loaded.activeQuests = questCatalog
        .filter((quest) => (loaded.quests?.[quest.id] || 0) > 0 || loaded.completedQuests.includes(quest.id))
        .map((quest) => quest.id);
    }
    loaded.activeQuests = loaded.activeQuests.filter((id) => !loaded.completedQuests.includes(id));
    loaded.discoveredLoot = loaded.discoveredLoot || {};
    loaded.lootQueue = Array.isArray(loaded.lootQueue) ? loaded.lootQueue : [];
    loaded.nextEncounters = loaded.nextEncounters || {};
    loaded.characterClass = classCatalog[loaded.characterClass] ? loaded.characterClass : "warrior";
    loaded.build = buildCatalog[loaded.build] ? loaded.build : "bruiser";
    loaded.knownAbilities = Array.isArray(loaded.knownAbilities)
      ? loaded.knownAbilities.filter((id) => abilityCatalog[id])
      : [];
    migrateEquipmentSlots(loaded);
    loaded.itemDurability = loaded.itemDurability || {};
    loaded.materials = normalizeMaterials(loaded.materials);
    loaded.questBoard = Array.isArray(loaded.questBoard) ? loaded.questBoard : ["wolves", "rust", "boars"];
    loaded.rareQuests = loaded.rareQuests || {};
    loaded.winsSinceQuestRefresh = loaded.winsSinceQuestRefresh || 0;
    applyBalanceMigration(loaded);
    return loaded;
  } catch {
    return null;
  }
}

function applyBalanceMigration(loaded) {
  if ((loaded.balanceVersion || 1) >= balanceVersion) return;
  Object.values(loaded.customItems || {}).forEach(rebalanceSavedItem);
  (loaded.pendingLoot || []).forEach(rebalanceSavedItem);
  (loaded.lootQueue || []).flat().forEach(rebalanceSavedItem);
  Object.values(loaded.discoveredLoot || {}).forEach((drops) => Object.values(drops || {}).forEach(rebalanceSavedItem));
  loaded.balanceVersion = balanceVersion;
  loaded.log = [
    "Balance überarbeitet: Item-Qualitäten sind klarer getrennt, Elite-Gegner seltener und Reparaturen günstiger.",
    ...(loaded.log || []),
  ].slice(0, 40);
}

function normalizeMaterials(materials = {}) {
  const next = { ...emptyMaterials(), ...materials };
  const legacyMap = {
    hide: "leather",
    fang: "sinew",
    iron: "scrap",
  };

  Object.entries(legacyMap).forEach(([oldId, newId]) => {
    if (!next[oldId]) return;
    next[newId] = (next[newId] || 0) + next[oldId];
    delete next[oldId];
  });

  Object.keys(next).forEach((id) => {
    if (!materialLabel[id]) delete next[id];
  });

  return { ...emptyMaterials(), ...next };
}

function rebalanceSavedItem(item) {
  if (!item || !item.slot || !item.quality) return item;
  const upgrade = item.upgrade || Number(item.name?.match(/\+(\d+)$/)?.[1] || 0);
  const stats = normalizeRolledItemStats(item.slot, item.quality, {
    damage: item.damage || 0,
    defense: item.defense || 0,
  }, upgrade);
  item.damage = stats.damage;
  item.defense = stats.defense;
  return item;
}

function itemStatBounds(slot, quality, upgrade = 0) {
  const qualityIndex = { common: 0, rare: 1, epic: 2, legendary: 3 }[quality] || 0;
  const caps = itemStatCap(slot, quality, upgrade);
  const floorRatio = [0, 0.5, 0.72, 0.88][qualityIndex];
  return {
    minDamage: Math.floor(caps.damage * floorRatio),
    minDefense: Math.floor(caps.defense * floorRatio),
    maxDamage: caps.damage,
    maxDefense: caps.defense,
  };
}

function normalizeRolledItemStats(slot, quality, stats, upgrade = 0) {
  const bounds = itemStatBounds(slot, quality, upgrade);
  const damage = Math.max(bounds.minDamage, Math.min(stats.damage || 0, bounds.maxDamage));
  const defense = Math.max(bounds.minDefense, Math.min(stats.defense || 0, bounds.maxDefense));
  return { damage, defense };
}

function itemStatCap(slot, quality, upgrade = 0) {
  const qualityIndex = { common: 0, rare: 1, epic: 2, legendary: 3 }[quality] || 0;
  const caps = {
    weapon: { damage: [8, 16, 29, 46], defense: [0, 0, 0, 0] },
    offhand: { damage: [4, 8, 14, 22], defense: [7, 17, 31, 47] },
    chest: { damage: [0, 0, 2, 3], defense: [11, 26, 50, 76] },
    pants: { damage: [1, 3, 6, 10], defense: [8, 18, 35, 53] },
    boots: { damage: [2, 4, 8, 12], defense: [6, 15, 28, 42] },
    necklace: { damage: [4, 9, 17, 26], defense: [3, 8, 16, 24] },
    ring: { damage: [3, 8, 15, 24], defense: [4, 10, 18, 28] },
  };
  const slotCaps = caps[slot] || caps.ring;
  return {
    damage: slotCaps.damage[qualityIndex] + upgrade * (slot === "weapon" ? 3 : 2),
    defense: slotCaps.defense[qualityIndex] + upgrade * (["chest", "pants", "boots", "offhand"].includes(slot) ? 4 : 2),
  };
}

function migrateEquipmentSlots(loaded) {
  const defaults = defaultState().equipment;
  const current = loaded.equipment || {};
  if (current.armor && !current.chest) {
    current.chest = current.armor;
    delete current.armor;
  }
  loaded.equipment = { ...defaults, ...current };
  Object.keys(loaded.equipment).forEach((slot) => {
    if (!equipmentSlots.includes(slot)) delete loaded.equipment[slot];
  });
    Object.values(loaded.customItems || {}).forEach(normalizeItemSlot);
    (loaded.pendingLoot || []).forEach(normalizeItemSlot);
    (loaded.lootQueue || []).flat().forEach(normalizeItemSlot);
    Object.values(loaded.discoveredLoot || {}).forEach((drops) => Object.values(drops || {}).forEach(normalizeItemSlot));
    Object.values(loaded.rareQuests || {}).forEach((quest) => {
      if (quest.rarity === "very-rare") quest.rarity = "epic";
      if (quest.rare && quest.rarity === "epic") quest.rarity = "legendary";
    });
  }

function normalizeItemSlot(item) {
  if (item?.slot === "armor") item.slot = "chest";
  if (item?.slot && !equipmentSlots.includes(item.slot)) item.slot = "ring";
  normalizeItemQuality(item);
  return item;
}

function normalizeItemQuality(item) {
  if (!item) return item;
  if (item.quality === "very-rare") item.quality = "epic";
  if (!["common", "rare", "epic", "legendary"].includes(item.quality)) item.quality = "common";
  const baseName = item.name?.replace(/\s\+\d+$/, "");
  const legendaryNames = new Set(Object.values(lootNames).flatMap((byQuality) => byQuality.legendary || []));
  if (item.quality === "epic" && (legendaryNames.has(baseName) || ["ashenGreatsword", "crownShard"].includes(item.id))) {
    item.quality = "legendary";
  }
  return item;
}

function save() {
  const previous = localStorage.getItem(saveKey);
  const next = JSON.stringify(state);
  if (previous && previous !== next) {
    localStorage.setItem(savePreviousKey, previous);
  }
  localStorage.setItem(saveKey, next);
  localStorage.setItem(saveBackupKey, next);
}

function exportSaveData() {
  return JSON.stringify({
    game: "Fantasy Grind",
    version: saveExportVersion,
    exportedAt: new Date().toISOString(),
    save: state,
  }, null, 2);
}

function importSaveData(raw) {
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    log("Import fehlgeschlagen: Der Text ist kein gültiges JSON.", "bad");
    return false;
  }

  const rawSave = parsed?.save ? JSON.stringify(parsed.save) : JSON.stringify(parsed);
  const loaded = parseSavedState(rawSave);
  if (!loaded) {
    log("Import fehlgeschlagen: Der Spielstand konnte nicht gelesen werden.", "bad");
    return false;
  }

  state = loaded;
  state.log = [
    "Spielstand erfolgreich importiert.",
    ...(state.log || []),
  ].slice(0, 40);
  save();
  render();
  return true;
}

function normalizeSavedText(value) {
  const repairs = [
    ["Wegr\u003Fuber", "Wegräuber"],
    ["Gruftschl\u003Fger", "Gruftschläger"],
    ["\u003Fbungsschwert", "Übungsschwert"],
    ["Schl\u003Fgerkettenhemd", "Schlägerkettenhemd"],
    ["Gro\u003Fschwert", "Großschwert"],
    ["Gew\u003Fhnlich", "Gewöhnlich"],
    ["R\u003Fstung", "Rüstung"],
    ["K\u003Fnigsschneide", "Königsschneide"],
    ["K\u003Fnigszeichen", "Königszeichen"],
    ["Reiser\u003Fstung", "Reiserüstung"],
    ["Eidh\u003Fterplatte", "Eidhüterplatte"],
    ["T\u003Fte", "Töte"],
    ["Waldw\u003Flfe", "Waldwölfe"],
    ["f\u003Fr", "für"],
    ["zur\u003Fck", "zurück"],
    ["Z\u003Fhne", "Zähne"],
    ["schlie\u003Fen", "schließen"],
    ["n\u003Fchste", "nächste"],
    ["kampfunf\u003Fhig", "kampfunfähig"],
    ["gew\u003Fhlt", "gewählt"],
    ["ausger\u003Fstet", "ausgerüstet"],
    ["vollst\u003Fndig", "vollständig"],
    ["Ausr\u003Fstung", "Ausrüstung"],
    ["T\u003Fdlich", "Tödlich"],
    ["\u003Fberspringe", "Überspringe"],
    ["\u003Fbersprungen", "übersprungen"],
    ["K\u003Fmpfe", "Kämpfe"],
    ["Auftr\u003Fge", "Aufträge"],
    ["l\u003Fschen", "löschen"],
  ];

  if (typeof value === "string") {
    return repairs.reduce((text, [from, to]) => text.split(from).join(to), value);
  }
  if (Array.isArray(value)) return value.map(normalizeSavedText);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, normalizeSavedText(entry)]));
  }
  return value;
}

function getItem(itemId) {
  const item = state.customItems[itemId] || items[itemId];
  return normalizeItemSlot(item);
}

function totalStats() {
  let itemDamage = 0;
  let itemDefense = 0;
  equipmentSlots.forEach((slot) => {
    const id = state.equipment[slot];
    const item = getItem(id);
    if (!item) return;
    const durabilityFactor = itemDurabilityFactor(id);
    itemDamage += Math.floor(item.damage * durabilityFactor);
    itemDefense += Math.floor(item.defense * durabilityFactor);
  });
  const setStats = activeSetBonusStats();
  const build = activeBuild();
  const baseDamage = 7 + state.level * 2.25 + itemDamage + setStats.damage;
  const baseDefense = 2 + state.level * 1.45 + itemDefense + setStats.defense;
  const baseHp = 90 + state.level * 6.5 + setStats.maxHp;
  return {
    damage: Math.floor(baseDamage * (build.damageMultiplier || 1)),
    defense: Math.floor(baseDefense * (build.defenseMultiplier || 1)),
    maxHp: Math.floor(baseHp * (build.maxHpMultiplier || 1)),
  };
}

function activeClass() {
  return classCatalog[state.characterClass] || classCatalog.warrior;
}

function activeBuild() {
  return buildCatalog[state.build] || buildCatalog.bruiser;
}

function knownClassAbilities() {
  return activeBuildAbilityIds().map((id) => [id, abilityCatalog[id]]).filter(([, ability]) => ability);
}

function activeBuildAbilityIds() {
  const build = activeBuild();
  const active = activeClass();
  return build.abilities || active.buildAbilities?.[state.build] || active.abilities || [];
}

function hasBuildAbility(id) {
  return activeBuildAbilityIds().includes(id);
}

function setBuild(buildId) {
  if (!buildCatalog[buildId]) return;
  state.build = buildId;
  syncDerivedStats();
  state.hp = state.maxHp;
  log(`Build gewechselt: ${buildCatalog[buildId].name}.`, "drop");
  save();
  render();
}

function activeSetBonusStats() {
  const result = { damage: 0, defense: 0, maxHp: 0 };
  Object.values(activeSetCounts()).forEach(({ id, count }) => {
    Object.entries(setBonuses[id]?.bonuses || {}).forEach(([needed, bonus]) => {
      if (count < Number(needed)) return;
      result.damage += bonus.damage || 0;
      result.defense += bonus.defense || 0;
      result.maxHp += bonus.maxHp || 0;
    });
  });
  return result;
}

function activeSetCounts() {
  const counts = {};
  equipmentSlots.forEach((slot) => {
    const item = getItem(state.equipment[slot]);
    if (!item) return;
    if (!item.set) return;
    counts[item.set] = counts[item.set] || { id: item.set, count: 0 };
    counts[item.set].count += 1;
  });
  return counts;
}

function itemDurability(itemId) {
  if (!itemId || !getItem(itemId)) return 0;
  if (state.itemDurability[itemId] == null) {
    state.itemDurability[itemId] = getItem(itemId)?.durability ?? 100;
  }
  return Math.max(0, Math.min(100, Math.floor(state.itemDurability[itemId])));
}

function setItemDurability(itemId, value) {
  if (!itemId) return;
  state.itemDurability[itemId] = Math.max(0, Math.min(100, Math.floor(value)));
}

function itemDurabilityFactor(itemId) {
  const durability = itemDurability(itemId);
  if (durability <= 0) return 0;
  return 0.5 + durability * 0.005;
}

function equippedDurabilityAverage() {
  let total = 0;
  let count = 0;
  equipmentSlots.forEach((slot) => {
    const id = state.equipment[slot];
    if (!getItem(id)) return;
    total += itemDurability(id);
    count += 1;
  });
  return count ? Math.round(total / count) : 100;
}

function slotWearMultiplier(slot) {
  return {
    weapon: 0.75,
    offhand: 0.65,
    chest: 0.9,
    pants: 0.65,
    boots: 0.55,
    necklace: 0.35,
    ring: 0.32,
  }[slot] || 1;
}

function repairSlotMultiplier(slot) {
  return {
    weapon: 0.78,
    offhand: 0.68,
    chest: 0.95,
    pants: 0.72,
    boots: 0.62,
    necklace: 0.48,
    ring: 0.45,
  }[slot] || 1;
}

function damageEquippedItems(enemy, extraLoss = 0) {
  const broken = [];
  equipmentSlots.forEach((slot) => {
    const itemId = state.equipment[slot];
    const item = getItem(itemId);
    if (!item) return;
    const baseLoss = random(1, enemy.elite ? 4 : 3) + Math.ceil(extraLoss * 0.5);
    const loss = Math.max(1, Math.ceil(baseLoss * slotWearMultiplier(slot)));
    const nextDurability = itemDurability(itemId) - loss;
    setItemDurability(itemId, nextDurability);
    if (itemDurability(itemId) <= 0) {
      broken.push({ slot, itemId, item });
    }
  });

  broken.forEach(({ slot, itemId, item }) => {
    state.equipment[slot] = null;
    delete state.itemDurability[itemId];
    if (state.customItems[itemId]) delete state.customItems[itemId];
    log(`${item.name} ist zerbrochen.`, "bad");
  });

  state.durability = equippedDurabilityAverage();
}

function syncDerivedStats() {
  const stats = totalStats();
  state.maxHp = stats.maxHp;
  state.hp = Math.min(state.hp, state.maxHp);
}

function log(message, type = "") {
  state.log.unshift(message);
  state.log = state.log.slice(0, 40);
  renderLog(type);
}

function gainXp(amount) {
  if (state.level >= 20) {
    state.renown += Math.max(1, Math.floor(amount / 30));
    return;
  }

  state.xp += amount;
  while (state.level < 20 && state.xp >= xpForLevel(state.level)) {
    state.xp -= xpForLevel(state.level);
    state.level += 1;
    syncDerivedStats();
    state.hp = state.maxHp;
    log(`Level ${state.level} erreicht. Deine Wunden schließen sich, aber der nächste Schritt wird schwerer.`, "good");
  }
}

function renownRank() {
  return renownRanks
    .slice()
    .reverse()
    .find((rank) => state.renown >= rank.threshold) || renownRanks[0];
}

function nextRenownRank() {
  return renownRanks.find((rank) => state.renown < rank.threshold) || null;
}

function questRenownReward(quest) {
  if (quest.rare || quest.rarity === "legendary") return 3;
  if (quest.rarity === "epic") return 2;
  return 1;
}

function renownRepairDiscount() {
  return state.renown >= 5 ? 0.1 : 0;
}

function renownUpgradeDiscount() {
  return state.renown >= 20 ? 0.08 : 0;
}

function renownQuestBoardSize() {
  return state.renown >= 10 ? 4 : 3;
}

function renownRareQuestBonus() {
  if (state.renown >= 40) return 0.028;
  if (state.renown >= 10) return 0.01;
  return 0;
}

function renownSalvageBonusChance(item) {
  if (state.renown < 15) return 0;
  const base = { common: 0.05, rare: 0.12, epic: 0.22, legendary: 0.35 }[item.quality] || 0.05;
  return Math.min(0.55, base + (state.renown >= 30 ? 0.08 : 0));
}

function maybeGrantBattleRenown(enemy) {
  if (!enemy.elite) return;
  const guaranteed = enemy.level >= 20;
  const chance = state.renown >= 30 ? 0.14 : 0.08;
  if (!guaranteed && Math.random() > chance) return;
  state.renown += 1;
  log(`Dein Ruf wächst: +1 Ruhm für den Sieg gegen ${enemy.name}.`, "drop");
}

function zoneKindLabel(zone) {
  return zone?.type === "dungeon" ? "Dungeon" : "Gebiet";
}

function isZoneUnlocked(zoneId) {
  const zone = zones[zoneId];
  if (!zone) return false;
  const unlock = zone.unlock || {};
  return state.level >= (unlock.level || 1) && state.renown >= (unlock.renown || 0);
}

function zoneLockText(zoneId) {
  const zone = zones[zoneId];
  if (!zone || isZoneUnlocked(zoneId)) return "";
  const unlock = zone.unlock || {};
  const missing = [];
  if (state.level < (unlock.level || 1)) missing.push(`Level ${unlock.level}`);
  if (state.renown < (unlock.renown || 0)) missing.push(`${unlock.renown} Ruhm`);
  return `Benötigt ${missing.join(" und ")}`;
}

function selectZone(zoneId) {
  if (!zones[zoneId]) return false;
  if (!isZoneUnlocked(zoneId)) {
    log(`${zones[zoneId].name} ist noch gesperrt. ${zoneLockText(zoneId)}.`, "bad");
    return false;
  }
  selectedZone = zoneId;
  selectedEnemy = zones[selectedZone].enemies[0];
  return true;
}

function unlockedEnemyIds() {
  return Object.entries(zones)
    .filter(([zoneId]) => isZoneUnlocked(zoneId))
    .flatMap(([, zone]) => zone.enemies);
}

function questTargetAvailable(target) {
  return unlockedEnemyIds().some((enemyId) => {
    const enemy = enemies[enemyId];
    if (!enemy) return false;
    if (target === "elite") return enemy.elite || !enemy.boss;
    return Boolean(enemy.tags?.[target]);
  });
}

function questAvailable(quest) {
  return Boolean(quest && questTargetAvailable(quest.target));
}

function abilityDamage(baseHit, multiplier) {
  return Math.max(1, Math.floor(baseHit * multiplier));
}

function enemyAbilityIds(enemy) {
  return [...new Set(enemy?.abilities || [])].filter((id) => enemyAbilityCatalog[id]);
}

function enemyPassiveIds(enemy) {
  return [...new Set(enemy?.passives || [])].filter((id) => enemyAbilityCatalog[id]);
}

function enemyAbilityEntries(enemy) {
  return [...enemyAbilityIds(enemy), ...enemyPassiveIds(enemy)]
    .map((id) => [id, enemyAbilityCatalog[id]])
    .filter(([, ability]) => ability);
}

function eliteBonusAbilityFor(enemy) {
  if (enemy.tags?.beast || enemy.tags?.wolf) return "eliteFury";
  return "eliteGuard";
}

function enemyHealMultiplier(enemy, enemyHp) {
  return enemyPassiveIds(enemy).includes("unholyRenewal") && enemyHp <= enemy.hp * 0.5 ? 1.45 : 1;
}

function enemyDamagePassiveMultiplier(enemy, enemyHp) {
  const passives = enemyPassiveIds(enemy);
  let multiplier = 1;
  if (passives.includes("forgeFire") && enemyHp <= enemy.hp * 0.5) multiplier *= 1.15;
  if (passives.includes("noblePride") && enemyHp <= enemy.hp * 0.4) multiplier *= 1.25;
  if (passives.includes("secondPhase") && enemyHp <= enemy.hp * 0.5) multiplier *= 1.18;
  return multiplier;
}

function enemyDamageTakenMultiplier(enemy, enemyHp, rounds, hit) {
  const passives = enemyPassiveIds(enemy);
  let multiplier = 1;
  const defensive = [];

  enemyAbilityIds(enemy).forEach((id) => {
    if (id === "mistForm" && rounds % 4 === 0) {
      multiplier *= 0.55;
      defensive.push("Nebelform");
    }
    if (id === "emberDodge" && rounds % 3 === 0) {
      multiplier *= 0.7;
      defensive.push("Glutausweichen");
    }
    if (id === "crownShield" && rounds % 4 === 0) {
      multiplier *= 0.55;
      defensive.push("Kronenschild");
    }
    if (id === "guardStance" && rounds % 4 === 0) {
      multiplier *= 0.65;
      defensive.push("Schildhaltung");
    }
    if (id === "boneArmor" && rounds % 4 === 0) {
      multiplier *= 0.65;
      defensive.push("Knochenpanzer");
    }
    if (id === "hardenArmor" && rounds % 4 === 0) {
      multiplier *= 0.6;
      defensive.push("Rüstung härten");
    }
    if (id === "ironWall" && rounds % 4 === 0) {
      multiplier *= 0.55;
      defensive.push("Eisenwand");
    }
    if (id === "eliteGuard" && rounds % 4 === 0) {
      multiplier *= 0.75;
      defensive.push("Elite-Deckung");
    }
  });

  if (passives.includes("prisonDiscipline") && rounds % 5 === 0) {
    multiplier *= 0.75;
    defensive.push("Kerkerdisziplin");
  }
  if (passives.includes("lastGuard") && enemyHp <= enemy.hp * 0.3) {
    multiplier *= 0.8;
    defensive.push("Standhaft");
  }
  if (passives.includes("heavyBody") && hit <= enemy.level * 2) {
    multiplier *= 0.8;
    defensive.push("Schwerer Körper");
  }
  if (passives.includes("royalHide")) {
    multiplier *= 0.9;
  }
  if (passives.includes("secondPhase") && enemyHp <= enemy.hp * 0.5) {
    multiplier *= 0.82;
    defensive.push("Zweite Phase");
  }

  return { multiplier: Math.max(0.25, multiplier), defensive };
}

function triggeredEnemyAbility(enemy, rounds, playerHp, playerMaxHp, enemyHp) {
  return enemyAbilityIds(enemy).map((id) => {
    if (id === "ambush" && rounds === 1) return { id, damageMultiplier: 1.55 };
    if (id === "bloodBite" && rounds % 3 === 0) return { id, damageMultiplier: 1.18, dot: { name: "Blutung", damage: Math.max(1, Math.ceil(enemy.level * 0.65)), turns: 2 } };
    if (id === "ironBite" && rounds % 3 === 0) return { id, damageMultiplier: 1.22, playerDamageMultiplier: 0.9 };
    if (id === "tuskCharge" && rounds % 4 === 0) return { id, damageMultiplier: 1.55 };
    if (id === "shieldBash" && rounds % 3 === 0) return { id, damageMultiplier: 1.1, playerDamageMultiplier: 0.8 };
    if (id === "guardBash" && rounds % 3 === 0) return { id, damageMultiplier: 1.25, playerDamageMultiplier: 0.88 };
    if (id === "chainHook" && rounds % 4 === 0) return { id, damageMultiplier: 1.2, playerDamageMultiplier: 0.82 };
    if (id === "poisonClaws" && rounds % 3 === 0) return { id, damageMultiplier: 1, dot: { name: "Gift", damage: Math.max(1, Math.ceil(enemy.level * 0.7)), turns: 3 } };
    if (id === "lifeDrain" && rounds % 4 === 0) return { id, damageMultiplier: 1.05, healRatio: 0.45 };
    if (id === "burningBlade" && rounds % 3 === 0) return { id, damageMultiplier: 1.25, dot: { name: "Brennen", damage: Math.max(1, Math.ceil(enemy.level * 0.75)), turns: 2 } };
    if (id === "flameBite" && rounds % 4 === 0) return { id, damageMultiplier: 1.4, dot: { name: "Brennen", damage: Math.max(1, Math.ceil(enemy.level * 0.85)), turns: 2 } };
    if (id === "judgementStrike" && playerHp <= playerMaxHp * 0.45 && rounds % 2 === 0) return { id, damageMultiplier: 1.45 };
    if (id === "boneCurse" && rounds % 3 === 0) return { id, damageMultiplier: 0.95, playerDamageMultiplier: 0.75 };
    if (id === "graveMend" && rounds % 4 === 0) return { id, damageMultiplier: 0.75, healFlatRatio: 0.08 };
    if (id === "crushingBlow" && rounds % 4 === 0) return { id, damageMultiplier: 1.65 };
    if (id === "forgeSmash" && rounds % 3 === 0) return { id, damageMultiplier: 1.45 };
    if (id === "emberChains" && rounds % 4 === 0) return { id, damageMultiplier: 1.15, playerDamageMultiplier: 0.82, dot: { name: "Brennen", damage: Math.max(1, Math.ceil(enemy.level * 0.85)), turns: 2 } };
    if (id === "dukeCommand" && rounds % 3 === 0) return { id, damageMultiplier: 1.35 };
    if (id === "executionOrder" && playerHp <= playerMaxHp * 0.42 && rounds % 2 === 0) return { id, damageMultiplier: 1.7 };
    if (id === "emberPrayer" && rounds % 4 === 0) return { id, damageMultiplier: 0.8, healFlatRatio: 0.07 };
    if (id === "ashNova" && rounds % 5 === 0) return { id, damageMultiplier: 1.45, dot: { name: "Aschebrand", damage: Math.max(1, Math.ceil(enemy.level * 0.9)), turns: 2 } };
    if (id === "crownMaul" && rounds % 4 === 0) return { id, damageMultiplier: 1.55 };
    if (id === "ashBlade" && rounds % 3 === 0) return { id, damageMultiplier: 1.35, dot: { name: "Brennen", damage: Math.max(1, Math.ceil(enemy.level * 0.95)), turns: 2 } };
    if (id === "hollowGaze" && rounds % 4 === 0) return { id, damageMultiplier: 0.9, playerDamageMultiplier: 0.7 };
    if (id === "championLeap" && rounds % 5 === 0) return { id, damageMultiplier: 1.75 };
    if (id === "eliteFury" && rounds % 4 === 0) return { id, damageMultiplier: 1.25 };
    return null;
  }).find(Boolean);
}

async function fight() {
  if (isFighting) return;
  const enemy = getPreparedEncounter(selectedEnemy);
  syncDerivedStats();

  if (state.hp <= 0) {
    log("Du bist kampfunfähig. Raste zuerst im Lager.", "bad");
    return;
  }

  if (state.pendingLoot.length) {
    log("Wähle zuerst deine Beute aus dem letzten Kampf.", "drop");
    return;
  }

  let playerHp = state.hp;
  let enemyHp = enemy.hp;
  const stats = totalStats();
  let rounds = 0;
  const events = [];
  const fightState = {
    sustainUsed: false,
    nextEnemyDamageMultiplier: 1,
    playerDamageMultiplier: 1,
    playerDots: [],
    lastCounterRound: -99,
    lastExecuteRound: -99,
  };

  while (playerHp > 0 && enemyHp > 0 && rounds < 80) {
    rounds += 1;

    if (fightState.playerDots.length) {
      const dotDamage = fightState.playerDots.reduce((sum, dot) => sum + dot.damage, 0);
      playerHp -= dotDamage;
      const dotNames = [...new Set(fightState.playerDots.map((dot) => dot.name))].join(", ");
      fightState.playerDots = fightState.playerDots
        .map((dot) => ({ ...dot, turns: dot.turns - 1 }))
        .filter((dot) => dot.turns > 0);
      events.push({
        actor: "enemy",
        damage: dotDamage,
        enemyHp: Math.max(0, enemyHp),
        playerHp: Math.max(0, playerHp),
        text: `${dotNames} verursacht ${dotDamage} Schaden.`,
      });
      if (playerHp <= 0) break;
    }

    if (!fightState.sustainUsed && hasBuildAbility("lastStand") && playerHp <= stats.maxHp * 0.4) {
      const heal = Math.min(stats.maxHp - playerHp, Math.max(8, Math.floor(stats.maxHp * 0.14)));
      if (heal > 0) {
        playerHp += heal;
        fightState.sustainUsed = true;
        fightState.nextEnemyDamageMultiplier = Math.min(fightState.nextEnemyDamageMultiplier, 0.85);
        events.push({ actor: "hero", abilityId: "lastStand", damage: 0, text: `Letztes Aufbäumen heilt ${heal} Leben und festigt die Deckung.`, playerHp: Math.max(0, playerHp), enemyHp: Math.max(0, enemyHp) });
      }
    } else if (!fightState.sustainUsed && hasBuildAbility("battleRush") && playerHp <= stats.maxHp * 0.45) {
      const heal = Math.min(stats.maxHp - playerHp, Math.max(8, Math.floor(stats.maxHp * 0.18)));
      if (heal > 0) {
        playerHp += heal;
        fightState.sustainUsed = true;
        events.push({ actor: "hero", abilityId: "battleRush", damage: 0, text: `Kampfrausch heilt ${heal} Leben.`, playerHp: Math.max(0, playerHp), enemyHp: Math.max(0, enemyHp) });
      }
    }

    const shatter = hasBuildAbility("shatter") && rounds % 3 === 0;
    const armorIgnore = shatter ? Math.floor(enemy.defense * 0.45) : 0;
    const effectiveDefense = Math.max(0, enemy.defense - armorIgnore);
    const basePlayerHit = Math.max(1, random(stats.damage - 4, stats.damage + 3) - Math.floor(effectiveDefense * 1.08));
    let playerHit = basePlayerHit;
    let playerText = `Du triffst für ${playerHit}.`;
    let playerAbilityId = "";

    if (hasBuildAbility("execute") && enemyHp <= enemy.hp * 0.3 && rounds - fightState.lastExecuteRound >= 2) {
      playerHit = abilityDamage(basePlayerHit, 1.5);
      fightState.lastExecuteRound = rounds;
      playerAbilityId = "execute";
      playerText = `Hinrichten trifft für ${playerHit}.`;
    } else if (hasBuildAbility("heavyStrike") && rounds % 3 === 0) {
      playerHit = abilityDamage(basePlayerHit, 1.75);
      playerAbilityId = "heavyStrike";
      playerText = `Schwerer Hieb trifft für ${playerHit}.`;
    } else if (shatter) {
      playerHit = abilityDamage(basePlayerHit, 1.3);
      playerAbilityId = "shatter";
      playerText = `Zerschmettern bricht die Deckung und trifft für ${playerHit}.`;
    } else if (hasBuildAbility("tauntingBlow") && rounds % 3 === 0) {
      fightState.nextEnemyDamageMultiplier = Math.min(fightState.nextEnemyDamageMultiplier, 0.75);
      playerAbilityId = "tauntingBlow";
      playerText = `Spottender Schlag trifft für ${playerHit} und schwächt den Konter.`;
    }

    if (fightState.playerDamageMultiplier < 1) {
      playerHit = abilityDamage(playerHit, fightState.playerDamageMultiplier);
      playerText += " Dein Angriff ist geschwächt.";
      fightState.playerDamageMultiplier = 1;
    }

    const enemyDefense = enemyDamageTakenMultiplier(enemy, enemyHp, rounds, playerHit);
    if (enemyDefense.multiplier < 1) {
      playerHit = abilityDamage(playerHit, enemyDefense.multiplier);
      if (enemyDefense.defensive.length) {
        events.push({
          actor: "enemy",
          damage: 0,
          enemyHp: Math.max(0, enemyHp),
          playerHp: Math.max(0, playerHp),
          text: `${enemy.name} nutzt ${enemyDefense.defensive.join(" + ")}.`,
        });
      }
    }

    enemyHp -= playerHit;
    events.push({
      actor: "hero",
      abilityId: playerAbilityId,
      damage: playerHit,
      enemyHp: Math.max(0, enemyHp),
      playerHp: Math.max(0, playerHp),
      text: playerText,
    });

    if (enemyHp > 0 && hasBuildAbility("bladeFlurry") && rounds % 4 === 0) {
      const flurryHit = abilityDamage(basePlayerHit, 0.45);
      enemyHp -= flurryHit;
      events.push({
        actor: "hero",
        abilityId: "bladeFlurry",
        damage: flurryHit,
        enemyHp: Math.max(0, enemyHp),
        playerHp: Math.max(0, playerHp),
        text: `Klingenserie trifft zusätzlich für ${flurryHit}.`,
      });
    }

    if (enemyHp <= 0) break;

    const shieldWall = hasBuildAbility("shieldWall") && rounds % 4 === 0;
    const enemyBaseHit = Math.max(1, random(enemy.damage[0], enemy.damage[1]) - Math.floor(stats.defense * 0.42));
    const enemyAbility = triggeredEnemyAbility(enemy, rounds, playerHp, stats.maxHp, enemyHp);
    const enemyDamageMultiplier = shieldWall
      ? Math.min(fightState.nextEnemyDamageMultiplier, 0.45)
      : fightState.nextEnemyDamageMultiplier;
    const abilityMultiplier = enemyAbility?.damageMultiplier || 1;
    const passiveEnemyMultiplier = enemyDamagePassiveMultiplier(enemy, enemyHp);
    let enemyHit = Math.max(1, Math.floor(enemyBaseHit * enemyDamageMultiplier * abilityMultiplier * passiveEnemyMultiplier));
    fightState.nextEnemyDamageMultiplier = 1;
    playerHp -= enemyHit;
    let enemyText = shieldWall ? `Schildwall dämpft den Treffer auf ${enemyHit}.` : `${enemy.name} trifft für ${enemyHit}.`;
    if (enemyAbility) {
      const ability = enemyAbilityCatalog[enemyAbility.id];
      enemyText = `${enemy.name}: ${ability.name} trifft für ${enemyHit}.`;
      if (enemyAbility.playerDamageMultiplier) {
        fightState.playerDamageMultiplier = Math.min(fightState.playerDamageMultiplier, enemyAbility.playerDamageMultiplier);
        enemyText += " Dein nächster Angriff wird schwächer.";
      }
      if (enemyAbility.dot) {
        fightState.playerDots.push(enemyAbility.dot);
        enemyText += ` ${enemyAbility.dot.name} hält an.`;
      }
      if (enemyAbility.healRatio || enemyAbility.healFlatRatio) {
        const healBase = enemyAbility.healRatio ? enemyHit * enemyAbility.healRatio : enemy.hp * enemyAbility.healFlatRatio;
        const heal = Math.min(enemy.hp - enemyHp, Math.max(1, Math.floor(healBase * enemyHealMultiplier(enemy, enemyHp))));
        if (heal > 0) {
          enemyHp += heal;
          enemyText += ` Heilt ${heal}.`;
        }
      }
    }
    events.push({
      actor: "enemy",
      abilityId: shieldWall ? "shieldWall" : "",
      damage: enemyHit,
      enemyHp: Math.max(0, enemyHp),
      playerHp: Math.max(0, playerHp),
      text: enemyText,
    });

    if (
      playerHp > 0
      && enemyHp > 0
      && hasBuildAbility("counterBlow")
      && enemyBaseHit >= Math.max(10, stats.maxHp * 0.12)
      && rounds - fightState.lastCounterRound >= 3
    ) {
      const counterHit = abilityDamage(basePlayerHit, 0.5);
      fightState.lastCounterRound = rounds;
      enemyHp -= counterHit;
      events.push({
        actor: "hero",
        abilityId: "counterBlow",
        damage: counterHit,
        enemyHp: Math.max(0, enemyHp),
        playerHp: Math.max(0, playerHp),
        text: `Konterschlag antwortet für ${counterHit}.`,
      });
    }
  }

  isFighting = true;
  skipCombat = false;
  setBattleEnemyVisual(enemy);
  setControlsDisabled(true);
  $("fightBtn").textContent = "Skip";
  $("fightBtn").disabled = false;
  armCombatWatchdog(25000);
  try {
    await playCombatAnimation(enemy, events, playerHp > 0, {
      playerStartHp: state.hp,
      playerMaxHp: stats.maxHp,
      enemyMaxHp: enemy.hp,
    });

    damageEquippedItems(enemy);

    if (playerHp > 0) {
      state.hp = Math.max(1, playerHp);
      const gold = random(enemy.gold[0], enemy.gold[1]);
      state.gold += gold;
      gainXp(enemy.xp);
      grantMaterials(enemy.baseId || selectedEnemy, enemy.eliteVariant);
      createLootChoices(enemy, enemy.baseId || selectedEnemy);
      updateQuestProgress(enemy);
      maybeGrantBattleRenown(enemy);
      maybeDropRareQuest(enemy);
      refreshQuestBoard(false);
      log(`Sieg gegen ${enemy.name} nach ${rounds} Runden. +${enemy.xp} XP, +${gold} Gold.`, "good");
    } else {
      const xpLoss = Math.min(state.xp, Math.ceil(xpForLevel(state.level) * 0.1));
      const goldLoss = Math.min(state.gold, Math.ceil(14 + state.level * 6));
      state.xp -= xpLoss;
      state.gold -= goldLoss;
      state.deaths += 1;
      state.hp = Math.max(1, Math.floor(state.maxHp * 0.35));
      damageEquippedItems(enemy, 2);
      log(`Tod gegen ${enemy.name}. Du verlierst ${xpLoss} XP, ${goldLoss} Gold und kehrst angeschlagen ins Lager zurück.`, "bad");
    }
  } catch (error) {
    console.error(error);
    log("Der Kampfabschluss hatte einen Fehler, wurde aber sauber freigegeben.", "bad");
  } finally {
    clearCombatWatchdog();
    isFighting = false;
    skipCombat = false;
    setControlsDisabled(false);
    resetFightButton();
    prepareNextEncounter(enemy.baseId || selectedEnemy);
    save();
    safeRender();
  }
}

function armCombatWatchdog(ms) {
  clearCombatWatchdog();
  combatWatchdog = window.setTimeout(() => {
    if (isFighting) {
      forceUnlockCombat("Der Kampf wurde automatisch freigegeben.");
    }
  }, ms);
}

function clearCombatWatchdog() {
  if (!combatWatchdog) return;
  window.clearTimeout(combatWatchdog);
  combatWatchdog = 0;
}

function forceUnlockCombat(message) {
  clearCombatWatchdog();
  isFighting = false;
  skipCombat = false;
  setControlsDisabled(false);
  resetFightButton();
  if (message) log(message, "bad");
  save();
  safeRender();
}

function resetFightButton() {
  $("fightBtn").textContent = "Kampf starten";
  $("fightBtn").disabled = state.pendingLoot.length > 0;
}

function safeRender() {
  try {
    render();
  } catch (error) {
    console.error(error);
    resetFightButton();
    $("battleText").textContent = "Bereit";
  }
}

function getPreparedEncounter(enemyId) {
  const base = enemies[enemyId];
  if (state.nextEncounters[enemyId]?.elite && !base.elite) {
    return createEliteEnemy(base, enemyId);
  }

  return { ...base, baseId: enemyId };
}

function prepareNextEncounter(enemyId) {
  const base = enemies[enemyId];
  if (!base || base.elite) {
    state.nextEncounters[enemyId] = { elite: false };
    return;
  }

  const elite = Math.random() <= eliteEncounterChance;
  state.nextEncounters[enemyId] = { elite };
  if (elite) {
    log(`Der nächste ${base.name} ist eine Elite-Version.`, "bad");
  }
}

function createEliteEnemy(base, enemyId) {
  const bonusAbility = eliteBonusAbilityFor(base);
  const abilities = [...new Set([...(base.abilities || []), bonusAbility])].filter((id) => enemyAbilityCatalog[id]);
  return {
    ...base,
    baseId: enemyId,
    name: `Elite-${base.name}`,
    level: base.level + 2,
    hp: Math.ceil(base.hp * 1.72),
    damage: [Math.ceil(base.damage[0] * 1.42), Math.ceil(base.damage[1] * 1.5)],
    defense: Math.ceil(base.defense * 1.65 + 3),
    xp: Math.ceil(base.xp * 1.65),
    gold: [Math.ceil(base.gold[0] * 1.35), Math.ceil(base.gold[1] * 1.65)],
    drops: base.drops.map((drop) => ({ ...drop, chance: Math.min(0.12, drop.chance * 1.45) })),
    abilities,
    passives: [...new Set(base.passives || [])].filter((id) => enemyAbilityCatalog[id]),
    elite: true,
    eliteVariant: true,
    tags: { ...base.tags, elite: 1 },
  };
}

function updateQuestProgress(enemy) {
  state.activeQuests.map(getQuestById).filter(Boolean).forEach((quest) => {
    if (!isQuestActive(quest.id)) return;
    if (state.completedQuests.includes(quest.id)) return;
    const current = state.quests[quest.id] || 0;
    const gain = enemy.tags[quest.target] || 0;
    if (!gain) return;
    state.quests[quest.id] = Math.min(quest.needed, current + gain);
    if (state.quests[quest.id] >= quest.needed) {
      state.completedQuests.push(quest.id);
      state.activeQuests = state.activeQuests.filter((id) => id !== quest.id);
      state.questBoard = state.questBoard.filter((id) => id !== quest.id);
      state.gold += quest.rewardGold;
      gainXp(quest.rewardXp);
      const renown = questRenownReward(quest);
      state.renown += renown;
      if (quest.rewardItem) {
        const reward = createQuestRewardItem(quest);
        state.customItems[reward.id] = reward;
        queueLootBatch([reward]);
        log(`Questbelohnung erhalten: ${reward.name} (${qualityLabel[reward.quality]}).`, "drop");
      }
      log(`Quest abgeschlossen: ${quest.name}. +${quest.rewardXp} XP, +${quest.rewardGold} Gold, +${renown} Ruhm.`, "drop");
    }
  });
}

function maybeDropRareQuest(enemy) {
  const chance = (enemy.elite ? 0.035 : enemy.tags.dungeon ? 0.022 : 0.012) + renownRareQuestBonus();
  if (Math.random() > chance) return;

  const template = pickRareQuestTemplate(enemy);
  const id = `rare-${template.key}-${Date.now()}-${Math.random().toString(16).slice(2, 6)}`;
    const quest = {
      ...template,
      id,
      rare: true,
      rewardItem: true,
    name: `${template.name}`,
  };

  state.rareQuests[id] = quest;
  state.questBoard.unshift(id);
  state.questBoard = uniqueQuestIds(state.questBoard).slice(0, state.renown >= 40 ? 6 : 5);
  log(`Seltene Quest-Schriftrolle gefunden: ${quest.name}. Sie liegt auf der Quest-Tafel.`, "drop");
}

function pickRareQuestTemplate(enemy) {
  if (enemy.tags.ash) return rareQuestTemplates.find((quest) => quest.key === "ash");
  if (enemy.tags.elite) return rareQuestTemplates.find((quest) => quest.key === "elite");
  if (enemy.tags.dungeon) return rareQuestTemplates.find((quest) => quest.key === "dungeon");
  if (enemy.tags.bandit) return rareQuestTemplates.find((quest) => quest.key === "bandit");
  return rareQuestTemplates.find((quest) => quest.key === "wolf");
}

function refreshQuestBoard(force) {
  if (!force) {
    state.winsSinceQuestRefresh += 1;
  }
  state.questBoard = uniqueQuestIds(state.questBoard)
    .filter((id) => !state.completedQuests.includes(id))
    .filter((id) => {
      const quest = getQuestById(id);
      return quest && (isQuestActive(id) || questAvailable(quest));
    });

  if (!force && state.winsSinceQuestRefresh < 4) return;

  const candidates = questCatalog
    .map((quest) => quest.id)
    .filter((id) => !state.questBoard.includes(id))
    .filter((id) => !state.completedQuests.includes(id))
    .filter((id) => !state.activeQuests.includes(id))
    .filter((id) => questAvailable(getQuestById(id)));

  while (state.questBoard.length < renownQuestBoardSize() && candidates.length) {
    const index = random(0, candidates.length - 1);
    state.questBoard.push(candidates.splice(index, 1)[0]);
  }

  state.winsSinceQuestRefresh = 0;
}

function uniqueQuestIds(ids) {
  return [...new Set(ids)];
}

function getQuestById(questId) {
  return questCatalog.find((quest) => quest.id === questId) || state.rareQuests[questId];
}

function createQuestRewardItem(quest) {
  const quality = quest.rare ? "legendary" : "epic";
  const slot = quest.slot || lootSlots[random(0, lootSlots.length - 1)];
  const base = Math.max(5, Math.floor(quest.rewardXp / 115) + Math.floor(state.level * 0.7));
  const power = qualityPower[quality] * 0.92;
  const namePool = lootNames[slot][quality];
  const stats = normalizeRolledItemStats(slot, quality, rollSlotStats(slot, base, power));

  return {
    id: `quest-reward-${quest.id}`,
    name: `${namePool[random(0, namePool.length - 1)]} der Grauwacht`,
    slot,
    quality,
    damage: stats.damage,
    defense: stats.defense,
    set: questSet(quest),
    durability: 100,
    fixed: false,
    sourceType: "quest",
    sourceQuest: quest.id,
  };
}

function questSet(quest) {
  if (quest.key === "wolf" || quest.target === "wolf") return "wolf";
  if (quest.key === "bandit" || quest.target === "bandit" || quest.target === "rust") return "iron";
  if (quest.key === "dungeon" || quest.target === "dungeon") return "crypt";
  return "ashen";
}

function itemScore(item) {
  return item.damage * 1.5 + item.defense;
}

function createLootChoices(enemy, enemyId) {
  const choices = [generateLootItem(enemy, enemyId), generateLootItem(enemy, enemyId), generateLootItem(enemy, enemyId)];
  const specialDrop = enemy.drops.find((drop) => Math.random() <= drop.chance);

  if (specialDrop) {
    const specialItem = getItem(specialDrop.id);
    choices[random(0, choices.length - 1)] = {
      ...specialItem,
      id: specialDrop.id,
      fixed: true,
      sourceEnemy: enemyId,
    };
    log(`Seltener Fund in der Beuteauswahl: ${specialItem.name} (${qualityLabel[specialItem.quality]}).`, "drop");
  }

  markLootDiscovery(enemyId, choices);
  queueLootBatch(choices);
  recordDiscoveredLoot(enemyId, choices);
}

function queueLootBatch(items) {
  const equipmentItems = items.filter((item) => item && equipmentSlots.includes(item.slot));
  if (!equipmentItems.length) return;
  if (state.pendingLoot.length) {
    state.lootQueue.push(equipmentItems);
    return;
  }
  state.pendingLoot = equipmentItems;
}

function advanceLootQueue() {
  state.pendingLoot = state.lootQueue.length ? state.lootQueue.shift() : [];
}

function generateLootItem(enemy, enemyId) {
  const lootPick = pickGeneratedLootTemplate(enemy);
  const slot = lootPick.slot;
  const quality = lootPick.quality;
  const base = Math.max(1, Math.floor(enemy.level * 0.82) + random(-2, 1));
  const power = qualityPower[quality];
  const id = `loot-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const stats = normalizeRolledItemStats(slot, quality, rollSlotStats(slot, base, power));

  return {
    id,
    name: lootPick.name,
    slot,
    quality,
    damage: stats.damage,
    defense: stats.defense,
    set: rollItemSet(enemy, quality),
    durability: 100,
    fixed: false,
    sourceEnemy: enemyId,
  };
}

function pickGeneratedLootTemplate(enemy) {
  const profile = enemy.generatedLoot || {};
  const slots = (profile.slots || lootSlots).filter((slot) => lootSlots.includes(slot));
  const qualities = (profile.qualities || Object.keys(qualityLabel)).filter((quality) => qualityPower[quality]);
  const slot = slots.length ? slots[random(0, slots.length - 1)] : lootSlots[random(0, lootSlots.length - 1)];
  const rolledQuality = rollQuality(enemy);
  const quality = nearestAllowedQuality(rolledQuality, qualities.length ? qualities : Object.keys(qualityPower));
  const namePool = lootNames[slot][quality] || lootNames[slot].common;

  return {
    slot,
    quality,
    name: namePool[random(0, namePool.length - 1)],
  };
}

function nearestAllowedQuality(quality, allowedQualities) {
  const order = ["common", "rare", "epic", "legendary"];
  const allowed = allowedQualities.filter((item) => order.includes(item));
  if (allowed.includes(quality)) return quality;

  const targetIndex = order.indexOf(quality);
  return allowed
    .slice()
    .sort((a, b) => Math.abs(order.indexOf(a) - targetIndex) - Math.abs(order.indexOf(b) - targetIndex))[0] || "common";
}

function generatedLootPoolCount(enemy) {
  const profile = enemy.generatedLoot || {};
  const slots = (profile.slots || lootSlots).filter((slot) => lootSlots.includes(slot));
  const qualities = (profile.qualities || Object.keys(qualityPower)).filter((quality) => qualityPower[quality]);
  return (slots.length || lootSlots.length) * (qualities.length || Object.keys(qualityPower).length) * 3;
}

function rollSlotStats(slot, base, power) {
  const profiles = {
    weapon: [1.35, 0],
    offhand: [0.4, 0.85],
    chest: [0, 1.45],
    pants: [0.1, 0.98],
    boots: [0.18, 0.72],
    necklace: [0.6, 0.35],
    ring: [0.42, 0.5],
  };
  const [damageScale, defenseScale] = profiles[slot] || profiles.ring;
  return {
    damage: damageScale ? Math.max(1, Math.floor(base * damageScale * power + random(0, 2))) : 0,
    defense: defenseScale ? Math.max(1, Math.floor(base * defenseScale * power + random(0, 3))) : 0,
  };
}

function rollItemSet(enemy, quality) {
  const chance = quality === "legendary" ? 0.55 : quality === "epic" ? 0.3 : quality === "rare" ? 0.12 : 0.02;
  if (Math.random() > chance) return null;
  if (enemy.tags?.wolf || enemy.tags?.beast) return "wolf";
  if (enemy.tags?.bandit || enemy.tags?.rust || enemy.name?.includes("Ritter")) return "iron";
  if (enemy.tags?.dungeon) return enemy.level >= 18 ? "ashen" : "crypt";
  return null;
}

function recordDiscoveredLoot(enemyId, lootItems) {
  state.discoveredLoot[enemyId] = state.discoveredLoot[enemyId] || {};
  bestiaryListDirty = true;
  bestiaryLootCache.delete(enemyId);

  lootItems.forEach((item) => {
    const key = lootDiscoveryKey(item);
    const existing = state.discoveredLoot[enemyId][key];
    const bestItem = existing && itemScore(existing) >= itemScore(item) ? existing : item;
    state.discoveredLoot[enemyId][key] = {
      id: bestItem.id,
      name: bestItem.name,
      slot: bestItem.slot,
      quality: bestItem.quality,
      damage: bestItem.damage,
      defense: bestItem.defense,
      set: bestItem.set,
      fixed: bestItem.fixed,
      count: (existing?.count || 0) + 1,
    };
  });
  pruneBestiaryLoot(enemyId);
}

function pruneBestiaryLoot(enemyId) {
  const entries = Object.entries(state.discoveredLoot[enemyId] || {});
  const fixed = entries.filter(([, item]) => item.fixed);
  const generatedLimit = Math.max(0, maxBestiaryLootPerEnemy - fixed.length);
  const generated = entries
    .filter(([, item]) => !item.fixed)
    .sort(([, a], [, b]) => bestiaryKeepScore(b) - bestiaryKeepScore(a));

  state.discoveredLoot[enemyId] = Object.fromEntries([
    ...fixed,
    ...generated.slice(0, generatedLimit),
  ]);
  bestiaryLootCache.delete(enemyId);
}

function bestiaryKeepScore(item) {
  const rarityScore = { common: 1, rare: 10, epic: 25, legendary: 50 }[item.quality] || 0;
  const setScore = item.set ? 18 : 0;
  const countScore = Math.min(10, item.count || 0);
  return rarityScore + setScore + itemScore(item) * 0.2 + countScore;
}

function markLootDiscovery(enemyId, lootItems) {
  state.discoveredLoot[enemyId] = state.discoveredLoot[enemyId] || {};
  lootItems.forEach((item) => {
    const entry = state.discoveredLoot[enemyId][lootDiscoveryKey(item)];
    item.discoveryNew = !entry;
    item.discoveryCount = entry?.count || 0;
  });
}

function lootDiscoveryKey(item) {
  return item.fixed ? `fixed:${item.id}` : `${item.name}|${item.slot}|${item.quality}`;
}

function rollQuality(enemy) {
  const roll = Math.random();
  const eliteBonus = enemy.elite ? 0.025 : 0;
  const dungeonBonus = enemy.tags.dungeon ? 0.015 : 0;
  const bonus = eliteBonus + dungeonBonus + Math.min(0.025, enemy.level * 0.0013);

  if (roll > 0.996 - bonus) return "legendary";
  if (roll > 0.965 - bonus) return "epic";
  if (roll > 0.82 - bonus) return "rare";
  return "common";
}

function chooseLoot(index, equipNow = false) {
  if (!state.pendingLoot[index]) return;
  const item = state.pendingLoot[index];
  if (!item.fixed) {
    state.customItems[item.id] = item;
  }
  setItemDurability(item.id, item.durability ?? 100);
  if (equipNow) {
    const previousId = state.equipment[item.slot];
    state.equipment[item.slot] = item.id;
    if (previousId) {
      state.inventory.push(previousId);
    }
    log(`${item.name} gewählt und direkt ausgerüstet.`, "drop");
  } else {
    state.inventory.push(item.id);
    log(`${item.name} gewählt und ins Inventar gelegt.`, "drop");
  }
  advanceLootQueue();
  save();
  render();
}

function equipInventoryItem(index) {
  const itemId = state.inventory[index];
  const item = getItem(itemId);
  if (!item || !equipmentSlots.includes(item.slot)) return;

  const previousId = state.equipment[item.slot];
  state.equipment[item.slot] = itemId;
  state.inventory.splice(index, 1);
  setItemDurability(itemId, itemDurability(itemId) || 100);

  if (previousId) {
    state.inventory.push(previousId);
  }

  log(`${item.name} ausgerüstet. ${getItem(previousId)?.name || "Altes Teil"} liegt jetzt im Inventar.`, "drop");
  save();
  render();
}

function sellInventoryItem(index) {
  const itemId = state.inventory[index];
  const item = getItem(itemId);
  if (!item) return;

  const value = sellValue(item);
  state.inventory.splice(index, 1);
  delete state.itemDurability[itemId];
  state.gold += value;
  log(`${item.name} verkauft. +${value} Gold.`, "drop");
  save();
  render();
}

function sellAllInventoryItems() {
  if (!state.inventory.length) return;
  const total = state.inventory.reduce((sum, itemId) => {
    const item = getItem(itemId);
    return item ? sum + sellValue(item) : sum;
  }, 0);
  const count = state.inventory.length;
  state.inventory.forEach((itemId) => delete state.itemDurability[itemId]);
  state.inventory = [];
  state.gold += total;
  log(`${count} Items verkauft. +${total} Gold.`, "drop");
  save();
  render();
}

function sellValue(item) {
  const qualityValue = {
    common: 4,
    rare: 12,
    epic: 30,
    legendary: 82,
  };
  return Math.max(2, Math.floor(qualityValue[item.quality] + itemScore(item) * 1.45));
}

function grantMaterials(enemyId, eliteBonus = false) {
  const drops = materialDrops[enemyId] || [];
  const gained = [];
  drops.forEach((drop) => {
    const amount = Math.max(0, random(drop.min, drop.max) + (eliteBonus && Math.random() < 0.65 ? 1 : 0) - (Math.random() < 0.22 ? 1 : 0));
    if (amount <= 0) return;
    state.materials[drop.id] = (state.materials[drop.id] || 0) + amount;
    gained.push(`${amount} ${materialLabel[drop.id]}`);
  });
  if (gained.length) {
    log(`Material gefunden: ${gained.join(", ")}.`, "drop");
  }
}

function upgradeCost(item) {
  const level = item.upgrade || 0;
  const qualityMultiplier = { common: 1, rare: 2.4, epic: 4, legendary: 7 }[item.quality];
  const slotMaterial = primaryMaterialForSlot(item.slot);
  const setMaterial = setMaterialForItem(item);
  const materials = {
    [slotMaterial]: Math.ceil(3 + level * qualityMultiplier),
    leather: ["chest", "pants", "boots"].includes(item.slot) ? 2 + level : 0,
    shard: ["epic", "legendary"].includes(item.quality) ? 1 + level : 0,
  };
  if (item.set) {
    materials[setMaterial] = (materials[setMaterial] || 0) + 1 + Math.floor(level / 2);
  }
  const baseGold = Math.floor(28 * qualityMultiplier * Math.pow(level + 1, 1.18));
  return {
    gold: Math.max(1, Math.floor(baseGold * (1 - renownUpgradeDiscount()))),
    materials,
  };
}

function primaryMaterialForSlot(slot) {
  if (slot === "weapon" || slot === "offhand") return "scrap";
  if (slot === "chest") return "chain";
  if (slot === "pants") return "cloth";
  if (slot === "boots") return "leather";
  return "moonDust";
}

function setMaterialForItem(item) {
  return {
    wolf: "wolfFang",
    iron: "oathMark",
    crypt: "graveSeal",
    ashen: "crownAsh",
  }[item.set] || "shard";
}

function canUpgrade(item) {
  if ((item.upgrade || 0) >= 4) return false;
  const cost = upgradeCost(item);
  return canPayUpgradeCost(cost);
}

function canPayUpgradeCost(cost) {
  return state.gold >= cost.gold && Object.entries(cost.materials).every(([id, amount]) => (state.materials[id] || 0) >= amount);
}

function previewUpgradedItem(item) {
  const upgraded = { ...item, upgrade: (item.upgrade || 0) + 1 };
  if (item.slot === "weapon") upgraded.damage += 2;
  if (item.slot === "offhand") {
    upgraded.damage += 1;
    upgraded.defense += 2;
  }
  if (item.slot === "chest") upgraded.defense += 3;
  if (item.slot === "pants" || item.slot === "boots") upgraded.defense += 2;
  if (item.slot === "necklace" || item.slot === "ring") {
    upgraded.damage += 1;
    upgraded.defense += 1;
  }
  upgraded.name = item.name.replace(/\s\+\d+$/, "") + ` +${upgraded.upgrade}`;
  return upgraded;
}

function upgradeEquipped(slot) {
  const item = getItem(state.equipment[slot]);
  if (!item || !canUpgrade(item)) {
    log("Dem Schmied fehlen noch Materialien oder Gold.", "bad");
    return;
  }
  const cost = upgradeCost(item);
  state.gold -= cost.gold;
  Object.entries(cost.materials).forEach(([id, amount]) => {
    state.materials[id] -= amount;
  });
  const upgraded = previewUpgradedItem(item);
  state.customItems[upgraded.id] = upgraded;
  log(`${upgraded.name} beim Schmied verbessert.`, "drop");
  save();
  render();
}

function salvageValue(item) {
  const qualityAmount = { common: 1, rare: 2, epic: 4, legendary: 7 }[item.quality];
  const upgradeBonus = item.upgrade || 0;
  const result = addMaterials({}, salvageBaseMaterials(item.slot, qualityAmount + upgradeBonus));
  const rareAmount = { common: 0, rare: 1, epic: 2, legendary: 4 }[item.quality] || 0;

  if (rareAmount) addMaterials(result, salvageRareMaterials(item, rareAmount));
  if (item.set) addMaterials(result, { [setMaterialForItem(item)]: Math.max(1, Math.ceil(rareAmount / 2)) });
  if (item.quality === "legendary") addMaterials(result, { emberCore: 1 });

  return Object.fromEntries(Object.entries(result).filter(([, amount]) => amount > 0));
}

function rollSalvageValue(item) {
  const result = salvageValue(item);
  const bonus = salvageBonusMaterials(item);
  if (bonus) addMaterials(result, bonus.materials);
  return { materials: result, bonus };
}

function salvageBonusMaterials(item) {
  if (!item || Math.random() > renownSalvageBonusChance(item)) return null;
  const amount = item.quality === "legendary" ? 2 : 1;
  const options = [];

  if (item.set) options.push(setMaterialForItem(item));
  if (["weapon", "offhand"].includes(item.slot)) options.push("oathSteel", "scrap");
  if (["chest", "pants", "boots"].includes(item.slot)) options.push("leather", "sinew");
  if (["necklace", "ring"].includes(item.slot)) options.push("moonDust", "shard");
  if (["epic", "legendary"].includes(item.quality)) options.push("shard");
  if (item.quality === "legendary") options.push("emberCore");

  const material = options[random(0, options.length - 1)] || "scrap";
  return {
    materials: { [material]: amount },
    text: `Sauber zerlegt: +${amount} ${materialLabel[material]}.`,
  };
}

function addMaterials(target, source) {
  Object.entries(source).forEach(([id, amount]) => {
    target[id] = (target[id] || 0) + amount;
  });
  return target;
}

function salvageBaseMaterials(slot, amount) {
  if (slot === "weapon") return { scrap: amount, oathSteel: Math.floor(amount / 3) };
  if (slot === "offhand") return { scrap: amount, chain: Math.max(1, Math.floor(amount / 2)) };
  if (slot === "chest") return { chain: amount, leather: Math.max(1, Math.floor(amount / 2)) };
  if (slot === "pants") return { cloth: amount, leather: Math.max(1, Math.floor(amount / 2)) };
  if (slot === "boots") return { leather: amount, sinew: Math.max(1, Math.floor(amount / 2)) };
  if (slot === "necklace") return { moonDust: amount, shard: Math.max(1, Math.floor(amount / 2)) };
  return { moonDust: amount, shard: Math.max(1, Math.floor(amount / 2)) };
}

function salvageRareMaterials(item, amount) {
  if (item.set === "wolf") return { sinew: amount, wolfFang: Math.ceil(amount / 2) };
  if (item.set === "iron") return { oathSteel: amount, oathMark: Math.ceil(amount / 2) };
  if (item.set === "crypt") return { bone: amount, shadowResin: Math.ceil(amount / 2) };
  if (item.set === "ashen") return { emberCore: Math.ceil(amount / 2), crownAsh: Math.ceil(amount / 2) };
  if (["necklace", "ring"].includes(item.slot)) return { moonDust: amount, shard: Math.ceil(amount / 2) };
  return { shard: amount };
}

function salvageInventoryItem(index) {
  const itemId = state.inventory[index];
  const item = getItem(itemId);
  if (!item) return;
  const { materials, bonus } = rollSalvageValue(item);
  Object.entries(materials).forEach(([id, amount]) => {
    state.materials[id] = (state.materials[id] || 0) + amount;
  });
  state.inventory.splice(index, 1);
  delete state.itemDurability[itemId];
  const text = Object.entries(materials).map(([id, amount]) => `${amount} ${materialLabel[id]}`).join(", ");
  log(`${item.name} zerlegt. Erhalten: ${text}.`, "drop");
  if (bonus) log(bonus.text, "drop");
  save();
  render();
}

function salvageAllInventoryItems() {
  if (!state.inventory.length) return;
  const gained = {};
  let count = 0;
  let bonusCount = 0;

  state.inventory.forEach((itemId) => {
    const item = getItem(itemId);
    if (!item) return;
    count += 1;
    const { materials, bonus } = rollSalvageValue(item);
    if (bonus) bonusCount += 1;
    Object.entries(materials).forEach(([id, amount]) => {
      gained[id] = (gained[id] || 0) + amount;
      state.materials[id] = (state.materials[id] || 0) + amount;
    });
  });

  state.inventory.forEach((itemId) => delete state.itemDurability[itemId]);
  state.inventory = [];
  const text = Object.entries(gained).map(([id, amount]) => `${amount} ${materialLabel[id]}`).join(", ");
  log(`${count} Items zerlegt. Erhalten: ${text}.`, "drop");
  if (bonusCount) log(`${bonusCount} Items wurden sauber zerlegt und gaben Bonus-Material.`, "drop");
  save();
  render();
}

function rest() {
  const cost = restCost();
  if (state.gold < cost) {
    log(`Für eine Rast fehlen ${cost - state.gold} Gold.`, "bad");
    return;
  }
  state.gold -= cost;
  syncDerivedStats();
  state.hp = state.maxHp;
  log(`Du rastest am Feuer. Leben vollständig erholt. Kosten: ${cost} Gold.`);
  save();
  render();
}

function repair() {
  const cost = repairCost();
  if (!cost) {
    log("Deine Ausrüstung ist bereits in gutem Zustand.");
    return;
  }
  if (state.gold < cost) {
    log(`Für die Reparatur fehlen ${cost - state.gold} Gold.`, "bad");
    return;
  }
  state.gold -= cost;
  equipmentSlots.forEach((slot) => {
    const itemId = state.equipment[slot];
    if (getItem(itemId)) setItemDurability(itemId, 100);
  });
  state.durability = equippedDurabilityAverage();
  log(`Der Schmied repariert deine ausgerüsteten Items vollständig. Kosten: ${cost} Gold.`);
  save();
  render();
}

function repairSlot(slot) {
  const itemId = state.equipment[slot];
  const item = getItem(itemId);
  if (!item) return;
  const cost = repairCostForSlot(slot);
  if (!cost) {
    log(`${item.name} ist bereits vollständig repariert.`);
    return;
  }
  if (state.gold < cost) {
    log(`Für ${item.name} fehlen ${cost - state.gold} Gold.`, "bad");
    return;
  }
  state.gold -= cost;
  setItemDurability(itemId, 100);
  state.durability = equippedDurabilityAverage();
  log(`${item.name} repariert. Kosten: ${cost} Gold.`);
  save();
  render();
}

function riskFor(enemy, stats = totalStats()) {
  const score = stats.damage * 2.1 + stats.defense * 1.6 + state.hp * 0.42;
  const danger = enemy.hp * 0.42 + enemy.damage[1] * 3.1 + enemy.defense * 2;
  return score >= danger ? "Machbar" : score >= danger * 0.78 ? "Riskant" : "Tödlich";
}

function restCost() {
  return Math.max(8, Math.floor(6 + state.level * 4.2));
}

function repairCost() {
  return equipmentSlots.reduce((sum, slot) => sum + repairCostForSlot(slot), 0);
}

function repairCostForSlot(slot) {
  const itemId = state.equipment[slot];
  const item = getItem(itemId);
  if (!item) return 0;
  const missing = 100 - itemDurability(itemId);
  if (!missing) return 0;
  const qualityMultiplier = { common: 0.75, rare: 1.25, epic: 1.9, legendary: 2.8 }[item.quality] || 1;
  const upgradeMultiplier = 1 + (item.upgrade || 0) * 0.18;
  const baseCost = missing * repairSlotMultiplier(slot) * qualityMultiplier * upgradeMultiplier * (0.42 + state.level * 0.025);
  return Math.ceil(baseCost * (1 - renownRepairDiscount()));
}

