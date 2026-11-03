let state;
// Rucksack: Grundgrösse und Erweiterung beim Schmied (Punkt 11).
const inventoryBaseCapacity = 60;
const inventoryMaxCapacity = 120;
const inventoryExpandStep = 10;
// Offline-Fortschritt und Auto-Farmen (Punkt 14)
const offlineMinMs = 5 * 60 * 1000;
const offlineMaxMs = 8 * 60 * 60 * 1000;
const offlineSecondsPerFight = 8;
const offlineEfficiency = 0.5;
const autoFarmDelayMs = 450;
// Paragon-Punkte nach Level 20 (Punkt 13): maximal 25 pro Wert, Bonus pro Punkt.
const paragonStats = {
  might: { max: 25, perPoint: 0.02 },
  guard: { max: 25, perPoint: 0.02 },
  vitality: { max: 25, perPoint: 0.03 },
  fortune: { max: 25, perPoint: 0.03 },
};

const preparedCombatEvents = new Map();
const tooltipItemCache = new Map();
const tooltipHtmlCache = new Map();
const bestiaryLootCache = new Map();
const bestiaryTemplateCache = new Map();
const renderCache = {};

const elementCache = new Map();
const $ = (id) => {
  if (!elementCache.has(id)) {
    elementCache.set(id, document.getElementById(id));
  }
  return elementCache.get(id);
};
const random = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const balanceVersion = 4;
const eliteEncounterChance = 0.06;
const combatEventChance = 0.24;
const maxBestiaryLootPerEnemy = 20;
const combatEventCatalog = [
  {
    id: "clearOpening",
    name: "Klare Öffnung",
    text: "Du erkennst eine Lücke in der Deckung. Dein Schaden ist in diesem Kampf leicht erhöht.",
    playerDamageBonus: 0.08,
  },
  {
    id: "looseGround",
    name: "Lockerer Grund",
    text: "Der Boden gibt nach. Beide Seiten treffen etwas vorsichtiger.",
    playerDamageBonus: -0.04,
    enemyDamageBonus: -0.06,
  },
  {
    id: "merchantRumor",
    name: "Händlergerücht",
    text: "Tilda nannte dir vorher einen Käufer. Der Goldfund dieses Kampfes ist leicht besser.",
    goldBonus: 0.08,
  },
  {
    id: "grimOmen",
    name: "Düsteres Omen",
    text: "Die Luft wird schwer. Der Gegner schlägt in diesem Kampf etwas härter zu.",
    enemyDamageBonus: 0.07,
  },
  {
    id: "ancientCache",
    name: "Altes Versteck",
    text: "Zwischen den Steinen blitzt etwas Wertvolles. Der Goldfund dieses Kampfes ist besser.",
    goldBonus: 0.12,
    conditions: { dungeon: true },
  },
  {
    id: "beastTracks",
    name: "Frische Fährten",
    text: "Du liest die Spuren der Bestie. Dein Schaden ist leicht erhöht.",
    playerDamageBonus: 0.06,
    conditions: { beast: true },
  },
  {
    id: "ashfall",
    name: "Ascheregen",
    text: "Asche kratzt in den Augen. Beide Seiten treffen unsauberer.",
    playerDamageBonus: -0.03,
    enemyDamageBonus: -0.04,
    conditions: { ash: true },
  },
  {
    id: "challengerRoar",
    name: "Herausforderung",
    text: "Der Gegner erzwingt ein hartes Duell. Beide Seiten schlagen entschlossener zu.",
    playerDamageBonus: 0.04,
    enemyDamageBonus: 0.04,
    conditions: { elite: true },
  },
];
const renownRanks = [
  { threshold: 0, name: "Fremder", benefit: "Noch kein Vorteil" },
  { threshold: 5, name: "Bekannter Kämpfer", benefit: "Reparaturen -10%" },
  { threshold: 10, name: "Verlässliche Klinge", benefit: "Quest-Tafel hält 4 Aufträge bereit" },
  { threshold: 15, name: "Schmiedefreund", benefit: "Zerlegen kann Bonus-Material geben" },
  { threshold: 20, name: "Held der Grauwacht", benefit: "Upgrades -8% Goldkosten" },
  { threshold: 30, name: "Eliteschrecken", benefit: "Elite-Gegner und Zerlegen geben bessere Chancen" },
  { threshold: 40, name: "Meister der Grauwacht", benefit: "Seltene Aufträge erscheinen öfter" },
];
const smithMasteryRanks = [
  {
    id: "emberAnvil",
    name: "Glut des Ambosses",
    limit: 10,
    requirement: { level: 6, renown: 5, rank: 5 },
    progress: { eliteKills: 2 },
    materials: { scrap: 8, emberCore: 3, shard: 2 },
    gold: 250,
    rewardRenown: 2,
    reward: "Ausrüstung kann bis +10 verbessert werden. Reparaturen dauerhaft -5%.",
  },
  {
    id: "pressureSteel",
    name: "Stahl unter Druck",
    limit: 15,
    requirement: { level: 12, renown: 15, rank: 15, bossKills: 1 },
    progress: { eliteKills: 3, bossKills: 1 },
    materials: { oathSteel: 5, shadowResin: 4, shard: 6 },
    gold: 750,
    rewardRenown: 4,
    reward: "Ausrüstung kann bis +15 verbessert werden. Upgrade-Goldkosten dauerhaft -5%.",
  },
  {
    id: "watchMastermark",
    name: "Meisterzeichen der Grauwacht",
    limit: 20,
    requirement: { level: 20, renown: 35, rank: 30, bossKills: 2 },
    progress: { eliteKills: 5, bossKills: 2 },
    materials: { crownAsh: 6, oathSteel: 8, graveSeal: 5 },
    gold: 1800,
    sacrificeQuality: "epic",
    rewardRenown: 8,
    reward: "Ausrüstung kann bis +20 verbessert werden. Reparaturen dauerhaft zusätzlich -10%.",
  },
];
const enchantMasteryRanks = [
  {
    id: "unstableRunes",
    name: "Instabile Magie",
    slotLimit: 2,
    requirement: { level: 12, renown: 10, enchantedItem: true },
    progress: { eliteKills: 2 },
    materials: { shard: 10, moonDust: 5 },
    gold: 500,
    rewardRenown: 2,
    reward: "Mira öffnet den zweiten Runen-Slot und seltene Verzauberungen.",
  },
  {
    id: "forbiddenLibrary",
    name: "Die verbotene Bibliothek",
    slotLimit: 3,
    requirement: { level: 17, renown: 25, bossKills: 1 },
    progress: { bossKills: 1 },
    materials: { shard: 12, moonDust: 8, shadowResin: 4 },
    gold: 1200,
    sacrificeQuality: "epic",
    rewardRenown: 4,
    reward: "Mira öffnet den dritten Runen-Slot und epische Verzauberungen.",
  },
  {
    id: "voidRitual",
    name: "Das Ritual der Leere",
    slotLimit: 3,
    arcaneMastery: true,
    requirement: { level: 20, renown: 40, bossKills: 2 },
    progress: { eliteKills: 5, bossKills: 2 },
    materials: { crownAsh: 5, graveSeal: 4, emberCore: 6 },
    gold: 2500,
    sacrificeQuality: "legendary",
    rewardRenown: 8,
    reward: "Arkane Meisterschaft freigeschaltet: extrem seltene instabile Verzauberungen können erscheinen.",
  },
];
const upgradeCostSteps = {
  1: { gold: 28, basis: 3 },
  2: { gold: 42, basis: 4 },
  3: { gold: 58, basis: 5 },
  4: { gold: 76, basis: 6 },
  5: { gold: 96, basis: 7 },
  6: { gold: 125, basis: 6, special: 1 },
  7: { gold: 155, basis: 7, special: 1 },
  8: { gold: 190, basis: 8, special: 2 },
  9: { gold: 230, basis: 9, special: 2 },
  10: { gold: 275, basis: 10, special: 3 },
  11: { gold: 330, basis: 8, rare: 2 },
  12: { gold: 390, basis: 9, rare: 2 },
  13: { gold: 455, basis: 10, rare: 3 },
  14: { gold: 525, basis: 11, rare: 3 },
  15: { gold: 600, basis: 12, rare: 4 },
  16: { gold: 700, basis: 10, boss: 2 },
  17: { gold: 815, basis: 11, boss: 2 },
  18: { gold: 945, basis: 12, boss: 3 },
  19: { gold: 1090, basis: 13, boss: 3 },
  20: { gold: 1250, basis: 15, boss: 4 },
};

state = load();
// Sofort sensible Defaults setzen, damit spätere Zugriffe nicht auf undefined fallen.
// Das verhindert, dass Zugriffe wie state.rareQuests[...] eine Exception werfen.
state.rareQuests = state.rareQuests || {};
state.activeQuests = Array.isArray(state.activeQuests) ? state.activeQuests : [];
state.questBoard = Array.isArray(state.questBoard) ? state.questBoard : ["wolves", "rust", "boars"];
state.discoveredLoot = state.discoveredLoot || {};
state.inventory = Array.isArray(state.inventory) ? state.inventory : [];
state.lockedItems = Array.isArray(state.lockedItems) ? state.lockedItems : [];
state.completedQuests = Array.isArray(state.completedQuests) ? state.completedQuests : [];

function defaultState() {
  return {
    level: 1,
    xp: 0,
    hp: 100,
    maxHp: 100,
    gold: 20,
    deaths: 0,
    renown: 0,
    language: defaultLanguage(),
    characterClass: "warrior",
    classChosen: false,
    build: "damage",
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
    bossDropPity: {},
    inventory: [],
    lockedItems: [],
    inventoryCapacity: inventoryBaseCapacity,
    paragon: defaultParagon(),
    lastActiveAt: 0,
    tower: defaultTower(),
    settings: defaultSettings(),
    materials: emptyMaterials(),
    discoveredLoot: {},
    defeatedBosses: [],
    quests: { wolves: 0, rust: 0, elites: 0 },
    questBoard: ["wolves", "rust", "boars"],
    unseenQuests: [],
    activeQuests: [],
    completedQuests: [],
    rareQuests: {},
    combatStats: {
      eliteKills: 0,
      bossKills: 0,
      wins: 0,
      itemsUpgraded: 0,
      itemsSalvaged: 0,
      itemsEnchanted: 0,
      rareEnchantments: 0,
    },
    achievements: { claimed: [], notified: [] },
    smithMastery: { limit: 5, active: null, completed: [], progress: {}, discovered: false },
    winsSinceQuestRefresh: 0,
    lastSaveExportAt: "",
    combatLog: [],
    enchanting: { unlockedSeen: false, active: null, completed: [], progress: {}, discovered: false },
    ui: {
      selectedZone: "meadow",
      selectedEnemy: "wolf",
      selectedBestiaryZone: "meadow",
      selectedBestiaryEnemy: "wolf",
      combatMode: "auto",
    },
    balanceVersion: 4,
    log: [createKeyLogEntry("log.start", "Du erreichst das Lager Grauwacht. Der Grind beginnt langsam.")],
  };
}

ui.selectedZone = state.ui?.selectedZone || "meadow";
ui.selectedEnemy = state.ui?.selectedEnemy || zones[ui.selectedZone]?.enemies?.[0] || "wolf";
ui.selectedBestiaryZone = state.ui?.selectedBestiaryZone || ui.selectedZone;
ui.selectedBestiaryEnemy = state.ui?.selectedBestiaryEnemy || ui.selectedEnemy;
ui.selectedBestiaryType = zones[ui.selectedBestiaryZone]?.type || "zone";

function emptyMaterials() {
  return Object.fromEntries(Object.keys(materialLabel).map((id) => [id, 0]));
}

function applyBalanceMigration(loaded) {
  if ((loaded.balanceVersion || 1) >= balanceVersion) return;
  Object.values(loaded.customItems || {}).forEach(rebalanceSavedItem);
  (loaded.pendingLoot || []).forEach(rebalanceSavedItem);
  (loaded.lootQueue || []).flat().forEach(rebalanceSavedItem);
  Object.values(loaded.discoveredLoot || {}).forEach((drops) => Object.values(drops || {}).forEach(rebalanceSavedItem));
  loaded.balanceVersion = balanceVersion;
  loaded.log = [
    createKeyLogEntry("log.balanceRework", "Balance überarbeitet: Item-Stats folgen klareren Rollen pro Ausrüstungsslot.", {}, "drop"),
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

function normalizeCombatStats(stats = {}) {
  return {
    eliteKills: Math.max(0, Math.floor(stats.eliteKills || 0)),
    bossKills: Math.max(0, Math.floor(stats.bossKills || 0)),
    wins: Math.max(0, Math.floor(stats.wins || 0)),
    itemsUpgraded: Math.max(0, Math.floor(stats.itemsUpgraded || 0)),
    itemsSalvaged: Math.max(0, Math.floor(stats.itemsSalvaged || 0)),
    itemsEnchanted: Math.max(0, Math.floor(stats.itemsEnchanted || 0)),
    rareEnchantments: Math.max(0, Math.floor(stats.rareEnchantments || 0)),
  };
}

function normalizeAchievements(achievements = {}) {
  const catalogReady = Array.isArray(achievementCatalog) && achievementCatalog.length > 0;
  const ids = new Set(achievementCatalog.map((achievement) => achievement.id));
  const claimed = Array.isArray(achievements.claimed)
    ? achievements.claimed.filter((id) => !catalogReady || ids.has(id))
    : [];
  const notified = Array.isArray(achievements.notified)
    ? achievements.notified.filter((id) => !catalogReady || ids.has(id))
    : [];
  return {
    claimed: [...new Set(claimed)],
    notified: [...new Set(notified)],
  };
}

function normalizeSmithMastery(mastery = {}, sourceState = state) {
  const savedLimit = Math.max(5, Math.min(20, mastery.limit || 5));
  const completed = Array.isArray(mastery.completed)
    ? mastery.completed.filter((id) => smithMasteryRanks.some((rank) => rank.id === id))
    : [];
  smithMasteryRanks
    .filter((rank) => rank.limit <= savedLimit && savedLimit > 5)
    .forEach((rank) => completed.push(rank.id));
  const highestCompletedLimit = smithMasteryRanks
    .filter((rank) => completed.includes(rank.id))
    .reduce((limit, rank) => Math.max(limit, rank.limit), 5);
  const limit = Math.max(savedLimit, highestCompletedLimit);
  const active = smithMasteryRanks.some((rank) => rank.id === mastery.active) && !completed.includes(mastery.active)
    ? mastery.active
    : null;
  return {
    limit: Math.max(limit, highestCompletedLimit),
    active,
    completed: [...new Set(completed)],
    progress: normalizeSmithMasteryProgress(mastery.progress),
    discovered: Boolean(mastery.discovered || active || completed.length || hasSavedItemAtSmithLimit(mastery.limit || 5, sourceState)),
  };
}

function normalizeEnchanting(enchanting = {}) {
  const completed = Array.isArray(enchanting.completed)
    ? enchanting.completed.filter((id) => enchantMasteryRanks.some((rank) => rank.id === id))
    : [];
  const active = enchantMasteryRanks.some((rank) => rank.id === enchanting.active) && !completed.includes(enchanting.active)
    ? enchanting.active
    : null;
  return {
    unlockedSeen: Boolean(enchanting.unlockedSeen),
    active,
    completed: [...new Set(completed)],
    progress: normalizeEnchantMasteryProgress(enchanting.progress),
    discovered: Boolean(enchanting.discovered || active || completed.length),
  };
}

function normalizeEnchantMasteryProgress(progress = {}) {
  return enchantMasteryRanks.reduce((result, rank) => {
    const source = progress[rank.id] || {};
    result[rank.id] = {
      eliteKills: Math.max(0, Math.floor(source.eliteKills || 0)),
      bossKills: Math.max(0, Math.floor(source.bossKills || 0)),
    };
    return result;
  }, {});
}

function normalizeSmithMasteryProgress(progress = {}) {
  return smithMasteryRanks.reduce((result, rank) => {
    const source = progress[rank.id] || {};
    result[rank.id] = {
      eliteKills: Math.max(0, Math.floor(source.eliteKills || 0)),
      bossKills: Math.max(0, Math.floor(source.bossKills || 0)),
    };
    return result;
  }, {});
}

function hasSavedItemAtSmithLimit(limit = 5, sourceState = state) {
  return equipmentSlots.some((slot) => {
    const itemId = sourceState?.equipment?.[slot];
    const item = sourceState?.customItems?.[itemId] || items[itemId];
    return item && (item.upgrade || 0) >= limit;
  });
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
  item.critChance = item.critChance || 0;
  item.critDamage = item.critDamage || 0;
  normalizeItemStatsForSlot(item);
  return item;
}

function itemSlotRules(slot) {
  return {
    weapon: { damage: true, defense: false, critChance: true, critDamage: true },
    offhand: { damage: true, defense: true, critChance: false, critDamage: false },
    chest: { damage: false, defense: true, critChance: false, critDamage: false },
    pants: { damage: false, defense: true, critChance: false, critDamage: false },
    boots: { damage: false, defense: true, critChance: false, critDamage: false },
    necklace: { damage: true, defense: false, critChance: true, critDamage: true },
    ring: { damage: true, defense: false, critChance: true, critDamage: true },
  }[slot] || { damage: true, defense: false, critChance: true, critDamage: true };
}

function normalizeItemStatsForSlot(item) {
  if (!item) return item;
  const rules = itemSlotRules(item.slot);
  item.damage = rules.damage ? Math.max(0, Math.floor(item.damage || 0)) : 0;
  item.defense = rules.defense ? Math.max(0, Math.floor(item.defense || 0)) : 0;
  item.critChance = rules.critChance ? normalizePercentStep(item.critChance || 0) : 0;
  item.critDamage = rules.critDamage ? normalizePercentStep(item.critDamage || 0) : 0;
  return item;
}

function normalizePercentStep(value) {
  return Math.max(0, Math.round((value || 0) * 100) / 100);
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
    chest: { damage: [0, 0, 0, 0], defense: [11, 26, 50, 76] },
    pants: { damage: [0, 0, 0, 0], defense: [8, 18, 35, 53] },
    boots: { damage: [0, 0, 0, 0], defense: [7, 16, 30, 45] },
    necklace: { damage: [5, 11, 20, 30], defense: [0, 0, 0, 0] },
    ring: { damage: [4, 10, 18, 28], defense: [0, 0, 0, 0] },
  };
  const slotCaps = caps[slot] || caps.ring;
  const rules = itemSlotRules(slot);
  return {
    damage: rules.damage ? slotCaps.damage[qualityIndex] + upgrade * (slot === "weapon" ? 3 : 2) : 0,
    defense: rules.defense ? slotCaps.defense[qualityIndex] + upgrade * (["chest", "pants", "boots", "offhand"].includes(slot) ? 4 : 0) : 0,
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
  if (!item) return item;
  if (item?.slot === "armor") item.slot = "chest";
  if (item?.slot && !equipmentSlots.includes(item.slot)) item.slot = "ring";
  normalizeItemQuality(item);
  normalizeItemStatsForSlot(item);
  item.enchantments = normalizeItemEnchantments(item);
  return item;
}

function normalizeItemEnchantments(item) {
  if (!item || !Array.isArray(item.enchantments)) return [];
  const seenGroups = new Set();
  return item.enchantments
    .filter((id) => {
      const enchantment = enchantmentCatalog[id];
      if (!enchantment || !enchantment.slots.includes(item.slot) || seenGroups.has(enchantment.group)) return false;
      seenGroups.add(enchantment.group);
      return true;
    })
    .slice(0, 3);
}

function normalizeItemQuality(item) {
  if (!item) return item;
  if (item.quality === "very-rare") item.quality = "epic";
  if (!["common", "rare", "epic", "legendary"].includes(item.quality)) item.quality = "common";
  const baseName = item.name?.replace(/\s\+\d+$/, "");
  const legendaryNames = new Set([lootNames, ...Object.values(classLootNames)].flatMap((pools) => Object.values(pools).flatMap((byQuality) => byQuality.legendary || [])));
  if (item.quality === "epic" && (legendaryNames.has(baseName) || ["ashenGreatsword", "crownShard"].includes(item.id))) {
    item.quality = "legendary";
  }
  return item;
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
  const item = (state.customItems || {})[itemId] || items[itemId];
  return normalizeItemSlot(item);
}

function totalStats() {
  let itemDamage = 0;
  let itemDefense = 0;
  let itemCritChance = 0;
  let itemCritDamage = 0;
  equipmentSlots.forEach((slot) => {
    const id = state.equipment?.[slot];
    const item = getItem(id);
    if (!item) return;
    const durabilityFactor = itemDurabilityFactor(id);
    itemDamage += Math.floor(item.damage * durabilityFactor);
    itemDefense += Math.floor(item.defense * durabilityFactor);
    itemCritChance += item.critChance || 0;
    itemCritDamage += item.critDamage || 0;
  });
  const enchantStats = equippedEnchantmentSummary();
  const setStats = activeSetBonusStats();
  const build = activeBuild();
  const classStats = activeClass().statBonuses || {};
  const paragon = typeof paragonBonuses === "function" ? paragonBonuses() : { damage: 0, defense: 0, maxHp: 0 };
  const baseDamage = 7 + state.level * 2.25 + itemDamage + setStats.damage + enchantStats.damage;
  const baseDefense = 2 + state.level * 1.45 + itemDefense + setStats.defense + enchantStats.defense;
  const baseHp = 90 + state.level * 6.5 + setStats.maxHp + enchantStats.maxHp;
  return {
    damage: Math.floor(baseDamage * (classStats.damageMultiplier || 1) * (build.damageMultiplier || 1) * (1 + paragon.damage)),
    defense: Math.floor(baseDefense * (classStats.defenseMultiplier || 1) * (build.defenseMultiplier || 1) * (1 + paragon.defense)),
    maxHp: Math.floor(baseHp * (classStats.maxHpMultiplier || 1) * (build.maxHpMultiplier || 1) * (1 + paragon.maxHp)),
    critChance: Math.min(0.65, 0.05 + itemCritChance + enchantStats.critChance + (classStats.critChanceBonus || 0) + (build.critChanceBonus || 0)),
    critDamage: Math.min(3.2, 1.5 + itemCritDamage + enchantStats.critDamage + (classStats.critDamageBonus || 0) + (build.critDamageBonus || 0)),
  };
}

const classAbilityGroups = {
  lastStand: ["lastStand", "lastSpark", "lastTrick", "survivalInstinct"],
  battleRush: ["battleRush", "spellRush", "adrenaline", "hunterFocus"],
  armorBreak: ["shatter", "runeCrush", "armorPiercer", "piercingArrow"],
  execute: ["execute", "spellRend", "finisher", "heartpiercer"],
  heavy: ["heavyStrike", "arcaneBolt", "backstab", "powerShot"],
  weaken: ["tauntingBlow", "frostAegis", "blindside", "pinningShot"],
  flurry: ["bladeFlurry", "emberNova", "dualCut", "rapidVolley"],
  guard: ["shieldWall", "manaWard", "shadowVeil", "distanceGuard"],
  counter: ["counterBlow", "wardCounter", "riposte", "snapShot"],
};

// Eigene Mechaniken je Klasse (Punkt 22): ersetzen die allgemeine Gruppenwirkung der Fähigkeit.
// multiplier: Schadensfaktor, lifesteal: Heilung in Anteil des Schadens, dot: Schaden über Zeit,
// enemyWeaken: Gegner macht weniger Schaden (mehrere Züge), guard: Deckung über mehrere Gegnerzüge,
// freeze: Gegner setzt Züge aus, armorPierce: Anteil ignorierter Rüstung, bonusVsDot/bonusPerDebuff: Zusatzschaden.
const classAbilityEffects = {
  manaWard: { multiplier: 1.2, enemyWeaken: { multiplier: 0.75, turns: 1 }, textKey: "combat.mage.frostLance", text: "{ability} trifft für {damage} und unterkühlt den Gegner." },
  frostAegis: { multiplier: 0.8, guard: { value: 0.55, turns: 2 }, textKey: "combat.mage.iceArmor", text: "{ability} trifft für {damage} und schützt dich {turns} Züge lang." },
  lastSpark: { multiplier: 0.9, freeze: 1, textKey: "combat.mage.frostPrison", text: "{ability} trifft für {damage} und friert den Gegner ein." },
  arcaneBolt: { multiplier: 1.75, textKey: "combat.mage.fireball", text: "{ability} explodiert für {damage}." },
  emberNova: { multiplier: 1, dot: { ratio: 0.38, turns: 3, key: "combat.dot.burn", name: "Brand" }, textKey: "combat.mage.ignite", text: "{ability} trifft für {damage} und setzt den Gegner in Brand." },
  spellRend: { multiplier: 2.05, bonusVsDot: 0.45, textKey: "combat.mage.inferno", text: "{ability} verschlingt den Gegner für {damage}." },
  spellRush: { multiplier: 1.2, lifesteal: 0.5, textKey: "combat.mage.soulDrain", text: "{ability} trifft für {damage} und heilt dich um {heal}." },
  runeCrush: { multiplier: 0.95, armorPierce: 0.3, enemyWeaken: { multiplier: 0.8, turns: 3 }, textKey: "combat.mage.curse", text: "{ability} trifft für {damage} und verflucht den Gegner {turns} Züge lang." },
  wardCounter: { multiplier: 1.55, bonusPerDebuff: 0.22, textKey: "combat.mage.shadowBurst", text: "{ability} entlädt alle Flüche für {damage}." },
};

// Startausrüstung je Klasse; beim Klassenwechsel wird getragene Startausrüstung getauscht.
const classStarterItems = {
  warrior: { weapon: "trainingSword", offhand: "wornBuckler", chest: "paddedVest" },
  mage: { weapon: "apprenticeStaff", offhand: "apprenticeTome", chest: "apprenticeRobe" },
};

const combatAbilityUnlockLevels = [3, 6, 10];
const combatAbilityCosts = [2, 3, 4];
const combatAbilityCooldowns = [1, 2, 3];
const classResourceConfig = {
  warrior: { label: "Wut", max: 6, attackGain: 1, defendGain: 2, hitGain: 1 },
  mage: { label: "Mana", max: 6, attackGain: 2, defendGain: 2, turnGain: 1 },
  rogue: { label: "List", max: 6, attackGain: 1, defendGain: 2, critGain: 1 },
  archer: { label: "Fokus", max: 6, attackGain: 1, defendGain: 3 },
};

function syncDerivedStats() {
  const stats = totalStats();
  state.maxHp = stats.maxHp;
  state.hp = Math.min(state.hp, state.maxHp);
}

// message: Funktion, die den Text liefert (wird für DE und EN ausgewertet), oder ein fertiger Log-Eintrag.
function log(message, type = "", extra = {}) {
  const entry = typeof message === "function"
    ? createLogEntry(message, type, extra)
    : typeof message === "object" && message
      ? message
      : createLogEntry(() => String(message), type, extra);
  state.log.unshift(entry);
  state.log = state.log.slice(0, 40);
  renderLog(type);
}

// reason: Funktion, die den Grund in der aktuellen Sprache liefert (oder ein fester Text).
function remindSaveBackup(reason) {
  // Wichtiger Moment: beim nächsten Speichern auch Backup und vorheriges Backup weiterreichen.
  if (typeof requestSaveBackup === "function") requestSaveBackup();
  const isReminder = (entry) => entry?.kind === "saveReminder" || (typeof entry === "string" && entry.startsWith("Tipp: Spielstand herunterladen"));
  if (state.log.slice(0, 8).some(isReminder)) return;
  log(() => t("save.backupTip", "Tipp: Spielstand herunterladen - {reason}", { reason: typeof reason === "function" ? reason() : String(reason) }), "drop", { kind: "saveReminder" });
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

function rest() {
  const cost = restCost();
  syncDerivedStats();
  if (state.hp >= state.maxHp) {
    log(() => t("camp.alreadyRestedLog", "Du bist bereits vollständig erholt."));
    return;
  }
  const paid = state.gold >= cost ? cost : 0;
  state.gold -= paid;
  state.hp = state.maxHp;
  log(() => paid
    ? t("camp.restPaidLog", "Du rastest am Lagerplatz. Leben vollständig erholt. Kosten: {gold} Gold.", { gold: cost })
    : t("camp.restFreeLog", "Du rastest am Lagerplatz. Ohne genug Gold heilt dich die Grauwacht kostenlos."));
  save();
  render();
}

function restCost() {
  return Math.max(8, Math.floor(6 + state.level * 4.2));
}
