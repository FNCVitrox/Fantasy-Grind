// ============================================================================
// STATE & GLOBALS
// ============================================================================
let state;
let selectedZone = "meadow";
let selectedEnemy = zones[selectedZone]?.enemies?.[0] || "wolf";
let selectedBestiaryZone = selectedZone;
let selectedBestiaryEnemy = selectedEnemy;
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

// ============================================================================
// CACHES
// ============================================================================
const tooltipItemCache = new Map();
const tooltipHtmlCache = new Map();
const bestiaryLootCache = new Map();
const bestiaryTemplateCache = new Map();
const renderCache = {};
const elementCache = new Map();

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================
const $ = (id) => {
  if (!elementCache.has(id)) {
    elementCache.set(id, document.getElementById(id));
  }
  return elementCache.get(id);
};

const random = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// ============================================================================
// CONSTANTS
// ============================================================================
const balanceVersion = 4;
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

// ============================================================================
// STATE INITIALIZATION & LOADING
// ============================================================================
state = load();
initializeState();

function initializeState() {
  // Set sensible defaults to prevent undefined access errors
  state.rareQuests = state.rareQuests || {};
  state.activeQuests = Array.isArray(state.activeQuests) ? state.activeQuests : [];
  state.questBoard = Array.isArray(state.questBoard) ? state.questBoard : ["wolves", "rust", "boars"];
  state.discoveredLoot = state.discoveredLoot || {};
  state.inventory = Array.isArray(state.inventory) ? state.inventory : [];
  state.completedQuests = Array.isArray(state.completedQuests) ? state.completedQuests : [];
  
  // Initialize UI state
  selectedZone = state.ui?.selectedZone || "meadow";
  selectedEnemy = state.ui?.selectedEnemy || zones[selectedZone]?.enemies?.[0] || "wolf";
  selectedBestiaryZone = state.ui?.selectedBestiaryZone || selectedZone;
  selectedBestiaryEnemy = state.ui?.selectedBestiaryEnemy || selectedEnemy;
}

// ============================================================================
// MATERIAL MANAGEMENT
// ============================================================================
function emptyMaterials() {
  return Object.fromEntries(Object.keys(materialLabel).map((id) => [id, 0]));
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

function addMaterials(target, source) {
  Object.entries(source).forEach(([id, amount]) => {
    target[id] = (target[id] || 0) + amount;
  });
  return target;
}

// ============================================================================
// STATE NORMALIZATION
// ============================================================================
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
    inventory: [],
    materials: emptyMaterials(),
    discoveredLoot: {},
    defeatedBosses: [],
    quests: { wolves: 0, rust: 0, elites: 0 },
    questBoard: ["wolves", "rust", "boars"],
    unseenQuests: [],
    activeQuests: [],
    completedQuests: [],
    rareQuests: {},
    combatStats: createEmptyCombatStats(),
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
    },
    balanceVersion: 4,
    log: [t("log.start", "Du erreichst das Lager Grauwacht. Der Grind beginnt langsam.")],
  };
}

function createEmptyCombatStats() {
  return {
    eliteKills: 0,
    bossKills: 0,
    wins: 0,
    itemsUpgraded: 0,
    itemsSalvaged: 0,
    itemsEnchanted: 0,
    rareEnchantments: 0,
  };
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

function applyBalanceMigration(loaded) {
  if ((loaded.balanceVersion || 1) >= balanceVersion) return;
  Object.values(loaded.customItems || {}).forEach(rebalanceSavedItem);
  (loaded.pendingLoot || []).forEach(rebalanceSavedItem);
  (loaded.lootQueue || []).flat().forEach(rebalanceSavedItem);
  Object.values(loaded.discoveredLoot || {}).forEach((drops) => Object.values(drops || {}).forEach(rebalanceSavedItem));
  loaded.balanceVersion = balanceVersion;
  loaded.log = [
    "Balance überarbeitet: Item-Stats folgen klareren Rollen pro Ausrüstungsslot.",
    ...(loaded.log || []),
  ].slice(0, 40);
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
    progress: normalizeMasteryProgress(mastery.progress, smithMasteryRanks),
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
    progress: normalizeMasteryProgress(enchanting.progress, enchantMasteryRanks),
    discovered: Boolean(enchanting.discovered || active || completed.length),
  };
}

function normalizeMasteryProgress(progress = {}, masteryRanks) {
  return masteryRanks.reduce((result, rank) => {
    const source = progress[rank.id] || {};
    result[rank.id] = {
      eliteKills: Math.max(0, Math.floor(source.eliteKills || 0)),
      bossKills: Math.max(0, Math.floor(source.bossKills || 0)),
    };
    return result;
  }, {});
}

// ============================================================================
// ITEM NORMALIZATION
// ============================================================================
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
  const legendaryNames = new Set(Object.values(lootNames).flatMap((byQuality) => byQuality.legendary || []));
  if (item.quality === "epic" && (legendaryNames.has(baseName) || ["ashenGreatsword", "crownShard"].includes(item.id))) {
    item.quality = "legendary";
  }
  return item;
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

// ============================================================================
// ITEM SLOT RULES & STATS
// ============================================================================
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

function getItem(itemId) {
  const item = (state.customItems || {})[itemId] || items[itemId];
  return normalizeItemSlot(item);
}

// ============================================================================
// ITEM RETRIEVAL & INVENTORY
// ============================================================================
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
  const baseDamage = 7 + state.level * 2.25 + itemDamage + setStats.damage + enchantStats.damage;
  const baseDefense = 2 + state.level * 1.45 + itemDefense + setStats.defense + enchantStats.defense;
  const baseHp = 90 + state.level * 6.5 + setStats.maxHp + enchantStats.maxHp;
  return {
    damage: Math.floor(baseDamage * (build.damageMultiplier || 1)),
    defense: Math.floor(baseDefense * (build.defenseMultiplier || 1)),
    maxHp: Math.floor(baseHp * (build.maxHpMultiplier || 1)),
    critChance: Math.min(0.65, 0.05 + itemCritChance + enchantStats.critChance + (build.critChanceBonus || 0)),
    critDamage: Math.min(3.2, 1.5 + itemCritDamage + enchantStats.critDamage + (build.critDamageBonus || 0)),
  };
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
  const wearReduction = Math.min(0.55, itemEffectSummary().durabilityReduction + equippedEnchantmentSummary().durabilityReduction);
  equipmentSlots.forEach((slot) => {
    const itemId = state.equipment[slot];
    const item = getItem(itemId);
    if (!item) return;
    const baseLoss = random(1, enemy.elite ? 4 : 3) + Math.ceil(extraLoss * 0.5);
    const loss = Math.max(1, Math.ceil(baseLoss * slotWearMultiplier(slot) * (1 - wearReduction)));
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

// ============================================================================
// COMBAT FUNCTIONS
// ============================================================================
function riskFor(enemy, stats = totalStats()) {
  const estimate = combatRiskEstimate(enemy, stats);
  if (estimate.survivalRatio >= 2.05) return "Einfach";
  if (estimate.survivalRatio >= 1.18) return "Machbar";
  if (estimate.survivalRatio >= 0.72) return "Riskant";
  return "Tödlich";
}

function combatRiskEstimate(enemy, stats = totalStats()) {
  const effectSummary = itemEffectSummary();
  const combatStats = combatStatsWithItemEffects(stats, enemy, effectSummary);
  const playerDamagePerRound = expectedPlayerDamagePerRound(enemy, combatStats, effectSummary);
  const enemyDamagePerRound = expectedEnemyDamagePerRound(enemy, combatStats, effectSummary);
  const enemyEffectiveHp = expectedEnemyEffectiveHp(enemy, playerDamagePerRound);
  const playerEffectiveHp = expectedPlayerEffectiveHp(enemy, combatStats, effectSummary);
  const playerRoundsToWin = Math.max(1, enemyEffectiveHp / Math.max(1, playerDamagePerRound));
  const enemyRoundsToWin = Math.max(1, playerEffectiveHp / Math.max(1, enemyDamagePerRound));
  return {
    playerDamagePerRound,
    enemyDamagePerRound,
    playerRoundsToWin,
    enemyRoundsToWin,
    survivalRatio: enemyRoundsToWin / playerRoundsToWin,
  };
}

function expectedPlayerDamagePerRound(enemy, stats, effectSummary = itemEffectSummary()) {
  const enchantStats = equippedEnchantmentSummary();
  const critMultiplier = 1 + (stats.critChance || 0) * ((stats.critDamage || 1.5) - 1);
  const effectArmorIgnore = (enemy.elite || enemy.boss) ? enemy.defense * effectSummary.eliteArmorIgnore : 0;
  let baseHit = Math.max(1, stats.damage - Math.max(0, enemy.defense - effectArmorIgnore) * 1.08) * critMultiplier;
  if (enemy.elite || enemy.boss) baseHit *= 1 + enchantStats.bossDamage;
  if (enemy.elite || enemy.boss) baseHit *= 1 + effectSummary.eliteDamageBonus;
  baseHit *= playerAbilityDamageMultiplier(enemy);
  baseHit *= enemyAverageDamageTakenMultiplier(enemy, baseHit);
  baseHit *= enemyPlayerDamageDebuffMultiplier(enemy);
  baseHit += stats.damage * Math.min(0.08, effectSummary.bleedChance * 0.22);
  baseHit += stats.damage * Math.min(0.07, effectSummary.poisonChance * 0.2);
  baseHit += stats.damage * Math.min(0.08, effectSummary.thornsRatio * 0.35);
  if (effectSummary.critBurn) baseHit += stats.damage * (stats.critChance || 0) * 0.14;
  return Math.max(1, baseHit);
}

function playerAbilityDamageMultiplier(enemy) {
  let multiplier = 1;
  if (hasBuildAbility("heavyStrike")) multiplier += 0.75 / 3;
  if (hasBuildAbility("bladeFlurry")) multiplier += 0.45 / 4;
  if (hasBuildAbility("execute")) multiplier += 0.15;
  if (hasBuildAbility("shatter")) {
    const armorValue = enemy.defense > 0 ? Math.min(0.25, enemy.defense / Math.max(12, enemy.defense + state.level * 3)) : 0;
    multiplier += (0.3 + armorValue) / 3;
  }
  if (hasBuildAbility("counterBlow")) multiplier += 0.08;
  return multiplier;
}

function enemyAverageDamageTakenMultiplier(enemy, hit) {
  let total = 0;
  const sampleRounds = 12;
  for (let round = 1; round <= sampleRounds; round += 1) {
    total += enemyDamageTakenMultiplier(enemy, enemy.hp * 0.6, round, hit).multiplier;
  }
  return total / sampleRounds;
}

function enemyPlayerDamageDebuffMultiplier(enemy) {
  const ids = enemyAbilityIds(enemy);
  let multiplier = 1;
  if (ids.includes("ironBite")) multiplier *= 0.97;
  if (ids.includes("shieldBash")) multiplier *= 0.94;
  if (ids.includes("guardBash")) multiplier *= 0.97;
  if (ids.includes("chainHook")) multiplier *= 0.955;
  if (ids.includes("boneCurse")) multiplier *= 0.92;
  if (ids.includes("emberChains")) multiplier *= 0.955;
  if (ids.includes("hollowGaze")) multiplier *= 0.925;
  if (ids.includes("cellLockdown")) multiplier *= 0.93;
  if (ids.includes("wardenVerdict")) multiplier *= 0.94;
  if (ids.includes("hollowRift")) multiplier *= 0.93;
  return multiplier;
}

function expectedEnemyEffectiveHp(enemy, playerDamagePerRound) {
  let effectiveHp = enemy.hp;
  enemyAbilityIds(enemy).forEach((id) => {
    const ability = enemyAbilityCatalog[id];
    if (!ability) return;
    if (id === "lifeDrain") effectiveHp += Math.max(2, playerDamagePerRound * 0.45);
    if (id === "graveMend") effectiveHp += enemy.hp * 0.08;
    if (id === "emberPrayer") effectiveHp += enemy.hp * 0.07;
    if (id === "graveTithe") effectiveHp += enemy.hp * 0.1;
    if (id === "emberHymn") effectiveHp += enemy.hp * 0.1;
  });
  if (enemyPassiveIds(enemy).includes("unholyRenewal")) effectiveHp *= 1.08;
  if (enemyPassiveIds(enemy).includes("graveBargain")) effectiveHp *= 1.06;
  if (enemyPassiveIds(enemy).includes("emberChoir")) effectiveHp *= 1.07;
  if (enemyPassiveIds(enemy).includes("hollowSecondWind")) effectiveHp *= 1.12;
  return effectiveHp;
}

function expectedEnemyDamagePerRound(enemy, stats, effectSummary = itemEffectSummary()) {
  const enchantStats = equippedEnchantmentSummary();
  const averageHit = (enemy.damage[0] + enemy.damage[1]) / 2;
  const critStats = enemyCriticalStats(enemy);
  const enemyCritChance = Math.max(0, critStats.critChance - Math.min(0.08, effectSummary.enemyCritReduction || 0));
  const critMultiplier = 1 + enemyCritChance * (critStats.critDamage - 1);
  let hit = Math.max(1, averageHit - stats.defense * 0.42) * critMultiplier;
  hit *= enemyAbilityDamageMultiplier(enemy);
  hit *= enemyDamagePassiveMultiplier(enemy, enemy.hp * 0.45);
  hit += enemyDotDamagePerRound(enemy);
  hit *= playerDefensiveAbilityMultiplier(stats);
  hit *= 1 - Math.min(0.35, enchantStats.damageReduction);
  hit *= 1 - Math.min(0.08, effectSummary.firstHitReduction / 8);
  hit *= effectSummary.firstHitWeaken < 1 ? 0.985 : 1;
  hit *= 1 - Math.min(0.04, effectSummary.critHealRatio * 0.3);
  return Math.max(1, hit);
}

function enemyAbilityDamageMultiplier(enemy) {
  let bonus = 0;
  enemyAbilityIds(enemy).forEach((id) => {
    const multiplier = enemyAbilityAverageMultiplier(id);
    if (multiplier !== 1) bonus += multiplier - 1;
  });
  return Math.max(0.75, 1 + bonus);
}

function enemyAbilityAverageMultiplier(id) {
  const multipliers = {
    ambush: 1.045,
    bloodBite: 1 + 0.18 / 3,
    ironBite: 1 + 0.22 / 3,
    tuskCharge: 1 + 0.55 / 4,
    shieldBash: 1 + 0.1 / 3,
    guardBash: 1 + 0.25 / 3,
    chainHook: 1 + 0.2 / 4,
    lifeDrain: 1 + 0.05 / 4,
    burningBlade: 1 + 0.25 / 3,
    flameBite: 1 + 0.4 / 4,
    judgementStrike: 1 + 0.45 / 5,
    boneCurse: 1 - 0.05 / 3,
    graveMend: 1 - 0.25 / 4,
    crushingBlow: 1 + 0.65 / 4,
    forgeSmash: 1 + 0.45 / 3,
    emberChains: 1 + 0.15 / 4,
    dukeCommand: 1 + 0.35 / 3,
    executionOrder: 1 + 0.7 / 5,
    emberPrayer: 1 - 0.2 / 4,
    ashNova: 1 + 0.45 / 5,
    crownMaul: 1 + 0.55 / 4,
    ashBlade: 1 + 0.35 / 3,
    hollowGaze: 1 - 0.1 / 4,
    championLeap: 1 + 0.75 / 5,
    eliteFury: 1 + 0.25 / 4,
    cellLockdown: 1 + 0.1 / 5,
    graveTithe: 1 - 0.05 / 5,
    bruteRampage: 1 + 0.5 / 6,
    wardenVerdict: 1 + 0.35 / 5,
    anvilQuake: 1 + 0.55 / 5,
    dukeDuel: 1 + 0.45 / 5,
    emberHymn: 1 - 0.1 / 5,
    royalGore: 1 + 0.45 / 5,
    hollowRift: 1 + 0.4 / 5,
  };
  return multipliers[id] || 1;
}

function enemyDotDamagePerRound(enemy) {
  const ids = enemyAbilityIds(enemy);
  let dot = 0;
  if (ids.includes("bloodBite")) dot += Math.max(1, Math.ceil(enemy.level * 0.65)) * 0.45;
  if (ids.includes("poisonClaws")) dot += Math.max(1, Math.ceil(enemy.level * 0.7)) * 0.75;
  if (ids.includes("burningBlade")) dot += Math.max(1, Math.ceil(enemy.level * 0.75)) * 0.5;
  if (ids.includes("flameBite")) dot += Math.max(1, Math.ceil(enemy.level * 0.85)) * 0.35;
  if (ids.includes("emberChains")) dot += Math.max(1, Math.ceil(enemy.level * 0.85)) * 0.45;
  if (ids.includes("ashNova")) dot += Math.max(1, Math.ceil(enemy.level * 0.9)) * 0.35;
  if (ids.includes("ashBlade")) dot += Math.max(1, Math.ceil(enemy.level * 0.95)) * 0.5;
  if (ids.includes("graveTithe")) dot += Math.max(1, Math.ceil(enemy.level * 0.65)) * 0.35;
  if (ids.includes("anvilQuake")) dot += Math.max(1, Math.ceil(enemy.level * 0.8)) * 0.35;
  if (ids.includes("emberHymn")) dot += Math.max(1, Math.ceil(enemy.level * 0.85)) * 0.35;
  return dot;
}

function playerDefensiveAbilityMultiplier(stats) {
  let multiplier = 1;
  if (hasBuildAbility("shieldWall")) multiplier *= 0.9;
  if (hasBuildAbility("tauntingBlow")) multiplier *= 0.94;
  if (hasBuildAbility("lastStand")) multiplier *= 0.93;
  if (hasBuildAbility("battleRush")) multiplier *= 0.97;
  return multiplier;
}

function expectedPlayerEffectiveHp(enemy, stats, effectSummary = itemEffectSummary()) {
  const enchantStats = equippedEnchantmentSummary();
  let hp = Math.max(1, state.hp || stats.maxHp);
  if (hasBuildAbility("battleRush")) hp += stats.maxHp * 0.18;
  if (hasBuildAbility("lastStand")) hp += stats.maxHp * 0.14;
  if (hasBuildAbility("shieldWall")) hp += stats.maxHp * 0.08;
  if (effectSummary.firstHitReduction > 0) hp += stats.maxHp * 0.04;
  if (effectSummary.postCombatHeal > 0) hp += stats.maxHp * Math.min(0.12, effectSummary.postCombatHeal);
  if (enchantStats.lowHpShield > 0) hp += stats.maxHp * Math.min(0.18, enchantStats.lowHpShield);
  if (enemyAbilityIds(enemy).some((id) => ["judgementStrike", "executionOrder"].includes(id))) hp *= 0.94;
  return hp;
}

// ============================================================================
// QUEST FUNCTIONS
// ============================================================================
function questRenownReward(quest) {
  if (quest.rare || quest.rarity === "legendary") return 3;
  if (quest.rarity === "epic") return 2;
  return 1;
}

function renownRepairDiscount() {
  return Math.min(0.35, (state.renown >= 5 ? 0.1 : 0) + smithMasteryRepairDiscount());
}

function renownUpgradeDiscount() {
  return Math.min(0.25, (state.renown >= 20 ? 0.08 : 0) + smithMasteryUpgradeDiscount());
}

function smithMasteryRepairDiscount() {
  const completed = state.smithMastery?.completed || [];
  return (completed.includes("emberAnvil") ? 0.05 : 0) + (completed.includes("watchMastermark") ? 0.1 : 0);
}

function smithMasteryUpgradeDiscount() {
  return state.smithMastery?.completed?.includes("pressureSteel") ? 0.05 : 0;
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

function bossFirstClearClaimed(enemyId) {
  return Array.isArray(state.defeatedBosses) && state.defeatedBosses.includes(enemyId);
}

function bossFirstClearReward(enemy) {
  if (!enemy?.boss || !enemy.firstClear) return null;
  return {
    renown: Math.max(0, Math.floor(enemy.firstClear.renown || 0)),
    gold: Math.max(0, Math.floor(enemy.firstClear.gold || 0)),
    materials: { ...(enemy.firstClear.materials || {}) },
  };
}

function rewardMaterialText(materials = {}) {
  return Object.entries(materials)
    .filter(([id, amount]) => materialLabel[id] && amount > 0)
    .map(([id, amount]) => `${amount} ${materialLabel[id]}`)
    .join(", ");
}

function bossFirstClearRewardText(enemy) {
  const reward = bossFirstClearReward(enemy);
  if (!reward) return "";
  const parts = [];
  if (reward.renown) parts.push(`${reward.renown} Ruhm`);
  if (reward.gold) parts.push(`${reward.gold} Gold`);
  const materials = rewardMaterialText(reward.materials);
  if (materials) parts.push(materials);
  return parts.join(" · ");
}

function grantBossFirstClear(enemy, enemyId = selectedEnemy) {
  const bossId = enemy?.baseId || enemyId;
  const reward = bossFirstClearReward(enemy);
  if (!reward || bossFirstClearClaimed(bossId)) return null;

  state.defeatedBosses = [...new Set([...(state.defeatedBosses || []), bossId])];
  state.renown += reward.renown;
  state.gold += reward.gold;
  Object.entries(reward.materials).forEach(([id, amount]) => {
    if (!materialLabel[id] || amount <= 0) return;
    state.materials[id] = (state.materials[id] || 0) + amount;
  });
  return reward;
}

function zoneKindLabel(zone) {
  return zone?.type === "dungeon" ? t("common.dungeon", "Dungeon") : t("common.zone", "Gebiet");
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
  save();
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
  return Boolean(quest && questTargetAvailable(quest.target) && questRelevantForCurrentZone(quest));
}

function questRelevantForCurrentZone(quest) {
  if (!quest) return false;
  return questEnemyIdsForZone(quest, selectedZone).length > 0;
}

function questEnemyIdsForZone(quest, zoneId) {
  const zone = zones[zoneId];
  if (!zone) return [];
  return zone.enemies.filter((enemyId) => {
    const enemy = enemies[enemyId];
    if (!enemy) return false;
    if (quest.target === "elite") return enemy.elite || !enemy.boss;
    if (quest.target === "dungeon") return zone.type === "dungeon" || Boolean(enemy.tags?.dungeon);
    return Boolean(enemy.tags?.[quest.target]);
  });
}

function questLevelRange(quest, zoneId = selectedZone) {
  const matchingLevels = questEnemyIdsForZone(quest, zoneId)
    .map((enemyId) => enemies[enemyId]?.level)
    .filter((level) => Number.isFinite(level));
  if (!matchingLevels.length) return "";
  const min = Math.min(...matchingLevels);
  const max = Math.max(...matchingLevels);
  return min === max ? `Level ${min}` : `Level ${min}-${max}`;
}

function isQuestCompletedPermanent(questId) {
  const quest = getQuestById(questId);
  return Boolean(quest && !quest.repeatable && state.completedQuests.includes(questId));
}

// ============================================================================
// COMBAT LOGIC
// ============================================================================
function abilityDamage(baseHit, multiplier) {
  return Math.max(1, Math.floor(baseHit * multiplier));
}

function rollPlayerCritical(hit, stats) {
  if (hit <= 0 || Math.random() >= (stats.critChance || 0)) {
    return { damage: hit, critical: false };
  }
  return {
    damage: Math.max(1, Math.floor(hit * (stats.critDamage || 1.5))),
    critical: true,
  };
}

function enemyCriticalStats(enemy) {
  if (enemy.critChance || enemy.critDamage) {
    return {
      critChance: enemy.critChance ?? 0.03,
      critDamage: enemy.critDamage ?? 1.5,
    };
  }
  if (enemy.boss) return { critChance: 0.09, critDamage: 1.7 };
  if (enemy.elite || enemy.eliteVariant) return { critChance: 0.06, critDamage: 1.6 };
  return { critChance: 0.03, critDamage: 1.5 };
}

function rollEnemyCritical(hit, enemy, effectSummary = itemEffectSummary()) {
  const stats = enemyCriticalStats(enemy);
  const critChance = Math.max(0, stats.critChance - Math.min(0.08, effectSummary.enemyCritReduction || 0));
  if (hit <= 0 || Math.random() >= critChance) {
    return { damage: hit, critical: false };
  }
  return {
    damage: Math.max(1, Math.floor(hit * stats.critDamage)),
    critical: true,
  };
}

function criticalText(text, damage) {
  const replacement = `kritisch für ${damage}`;
  return text.includes(" für ")
    ? text.replace(/für \d+/, replacement)
    : `${text} Kritischer Treffer für ${damage}.`;
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
  const passives = enemyPassiveIds(enemy);
  let multiplier = 1;
  if (passives.includes("unholyRenewal") && enemyHp <= enemy.hp * 0.5) multiplier *= 1.45;
  if (passives.includes("graveBargain") && enemyHp <= enemy.hp * 0.5) multiplier *= 1.25;
  if (passives.includes("emberChoir")) multiplier *= 1.18;
  return multiplier;
}

function enemyDamagePassiveMultiplier(enemy, enemyHp) {
  const passives = enemyPassiveIds(enemy);
  let multiplier = 1;
  if (passives.includes("forgeFire") && enemyHp <= enemy.hp * 0.5) multiplier *= 1.15;
  if (passives.includes("oathHeat") && enemyHp <= enemy.hp * 0.5) multiplier *= 1.18;
  if (passives.includes("noblePride") && enemyHp <= enemy.hp * 0.4) multiplier *= 1.25;
  if (passives.includes("dukePride") && enemyHp <= enemy.hp * 0.45) multiplier *= 1.18;
  if (passives.includes("crownFrenzy") && enemyHp <= enemy.hp * 0.55) multiplier *= 1.16;
  if (passives.includes("secondPhase") && enemyHp <= enemy.hp * 0.5) multiplier *= 1.18;
  if (passives.includes("hollowSecondWind") && enemyHp <= enemy.hp * 0.5) multiplier *= 1.2;
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
  if (passives.includes("cellAuthority") && (rounds <= 2 || rounds % 5 === 0)) {
    multiplier *= 0.86;
    defensive.push("Kerkerautorität");
  }
  if (passives.includes("graveBargain") && enemyHp <= enemy.hp * 0.5) {
    multiplier *= 0.92;
    defensive.push("Grabpakt");
  }
  if (passives.includes("lastGuard") && enemyHp <= enemy.hp * 0.3) {
    multiplier *= 0.8;
    defensive.push("Standhaft");
  }
  if (passives.includes("heavyBody") && hit <= enemy.level * 2) {
    multiplier *= 0.8;
    defensive.push("Schwerer Körper");
  }
  if (passives.includes("bruteBulk") && hit <= enemy.level * 2.6) {
    multiplier *= 0.78;
    defensive.push("Massiger Leib");
  }
  if (passives.includes("wardenPressure") && rounds % 4 === 0) {
    multiplier *= 0.8;
    defensive.push("Kettendruck");
  }
  if (passives.includes("oathHeat") && enemyHp <= enemy.hp * 0.5) {
    multiplier *= 0.9;
    defensive.push("Eidglut");
  }
  if (passives.includes("dukePride") && enemyHp <= enemy.hp * 0.45) {
    multiplier *= 0.9;
    defensive.push("Herzogsstolz");
  }
  if (passives.includes("royalHide")) {
    multiplier *= 0.9;
  }
  if (passives.includes("secondPhase") && enemyHp <= enemy.hp * 0.5) {
    multiplier *= 0.82;
    defensive.push("Zweite Phase");
  }

  if (passives.includes("hollowSecondWind") && enemyHp <= enemy.hp * 0.5) {
    multiplier *= 0.8;
    defensive.push("Leere zweite Phase");
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
    if (id === "cellLockdown" && rounds % 5 === 0) return { id, damageMultiplier: 1.1, playerDamageMultiplier: 0.65 };
    if (id === "graveTithe" && rounds % 5 === 0) return { id, damageMultiplier: 0.95, healFlatRatio: 0.1, dot: { name: "Grabfrost", damage: Math.max(1, Math.ceil(enemy.level * 0.65)), turns: 2 } };
    if (id === "bruteRampage" && enemyHp <= enemy.hp * 0.55 && rounds % 3 === 0) return { id, damageMultiplier: 1.5 };
    if (id === "wardenVerdict" && rounds % 5 === 0) return { id, damageMultiplier: 1.35, playerDamageMultiplier: 0.7 };
    if (id === "anvilQuake" && rounds % 5 === 0) return { id, damageMultiplier: 1.55, dot: { name: "Brennen", damage: Math.max(1, Math.ceil(enemy.level * 0.8)), turns: 2 } };
    if (id === "dukeDuel" && rounds % 5 === 0) return { id, damageMultiplier: 1.45 };
    if (id === "emberHymn" && rounds % 5 === 0) return { id, damageMultiplier: 0.9, healFlatRatio: 0.1, dot: { name: "Aschebrand", damage: Math.max(1, Math.ceil(enemy.level * 0.85)), turns: 2 } };
    if (id === "royalGore" && enemyHp <= enemy.hp * 0.6 && rounds % 3 === 0) return { id, damageMultiplier: 1.45 };
    if (id === "hollowRift" && rounds % 5 === 0) return { id, damageMultiplier: 1.4, playerDamageMultiplier: 0.65 };
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

  resetCombatLog();
  let playerHp = state.hp;
  let enemyHp = enemy.hp;
  const stats = totalStats();
  const effectSummary = itemEffectSummary();
  const enchantStats = equippedEnchantmentSummary();
  const combatStats = combatStatsWithItemEffects(stats, enemy, effectSummary);
  let rounds = 0;
  const events = [];
  const fightState = {
    sustainUsed: false,
    nextEnemyDamageMultiplier: 1,
    playerDamageMultiplier: 1,
    playerDots: [],
    enemyDots: [],
    guardBlockUsed: false,
    graveCurseUsed: false,
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
        round: rounds,
        actor: "enemy",
        damage: dotDamage,
        enemyHp: Math.max(0, enemyHp),
        playerHp: Math.max(0, playerHp),
        text: `${dotNames} verursacht ${dotDamage} Schaden.`,
      });
      if (playerHp <= 0) break;
    }

    if (fightState.enemyDots.length) {
      const dotDamage = fightState.enemyDots.reduce((sum, dot) => sum + dot.damage, 0);
      enemyHp -= dotDamage;
      const dotNames = [...new Set(fightState.enemyDots.map((dot) => dot.name))].join(", ");
      fightState.enemyDots = fightState.enemyDots
        .map((dot) => ({ ...dot, turns: dot.turns - 1 }))
        .filter((dot) => dot.turns > 0);
      events.push({
        round: rounds,
        actor: "hero",
        damage: dotDamage,
        enemyHp: Math.max(0, enemyHp),
        playerHp: Math.max(0, playerHp),
        text: `${dotNames} verursacht ${dotDamage} Schaden.`,
      });
      if (enemyHp <= 0) break;
    }

    if (!fightState.sustainUsed && hasBuildAbility("lastStand") && playerHp <= combatStats.maxHp * 0.4) {
      const heal = Math.min(combatStats.maxHp - playerHp, Math.max(8, Math.floor(combatStats.maxHp * 0.14)));
      if (heal > 0) {
        playerHp += heal;
        fightState.sustainUsed = true;
        fightState.nextEnemyDamageMultiplier = Math.min(fightState.nextEnemyDamageMultiplier, 0.85);
        events.push({ round: rounds, actor: "hero", abilityId: "lastStand", damage: 0, text: `Letztes Aufbäumen heilt ${heal} Leben und festigt die Deckung.`, playerHp: Math.max(0, playerHp), enemyHp: Math.max(0, enemyHp) });
      }
    } else if (!fightState.sustainUsed && hasBuildAbility("battleRush") && playerHp <= combatStats.maxHp * 0.45) {
      const heal = Math.min(combatStats.maxHp - playerHp, Math.max(8, Math.floor(combatStats.maxHp * 0.18)));
      if (heal > 0) {
        playerHp += heal;
        fightState.sustainUsed = true;
        events.push({ round: rounds, actor: "hero", abilityId: "battleRush", damage: 0, text: `Kampfrausch heilt ${heal} Leben.`, playerHp: Math.max(0, playerHp), enemyHp: Math.max(0, enemyHp) });
      }
    }

    const shatter = hasBuildAbility("shatter") && rounds % 3 === 0;
    const armorIgnore = shatter ? Math.floor(enemy.defense * 0.45) : 0;
    const effectArmorIgnore = (enemy.elite || enemy.boss) ? Math.floor(enemy.defense * effectSummary.eliteArmorIgnore) : 0;
    const effectiveDefense = Math.max(0, enemy.defense - armorIgnore - effectArmorIgnore);
    const basePlayerHit = Math.max(1, random(combatStats.damage - 4, combatStats.damage + 3) - Math.floor(effectiveDefense * 1.08));
    let playerHit = basePlayerHit;
    if (enemy.elite || enemy.boss) playerHit = Math.max(1, Math.floor(playerHit * (1 + enchantStats.bossDamage)));
    if (enemy.elite || enemy.boss) playerHit = Math.max(1, Math.floor(playerHit * (1 + effectSummary.eliteDamageBonus)));
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

    if (!fightState.graveCurseUsed && effectSummary.firstHitWeaken < 1) {
      fightState.nextEnemyDamageMultiplier = Math.min(fightState.nextEnemyDamageMultiplier, effectSummary.firstHitWeaken);
      fightState.graveCurseUsed = true;
      playerText += " Grabfluch schwächt den Gegenschlag.";
    }

    const enemyDefense = enemyDamageTakenMultiplier(enemy, enemyHp, rounds, playerHit);
    if (enemyDefense.multiplier < 1) {
      playerHit = abilityDamage(playerHit, enemyDefense.multiplier);
      if (enemyDefense.defensive.length) {
        events.push({
          round: rounds,
          actor: "enemy",
          damage: 0,
          enemyHp: Math.max(0, enemyHp),
          playerHp: Math.max(0, playerHp),
          text: `${enemy.name} nutzt ${enemyDefense.defensive.join(" + ")}.`,
        });
      }
    }

    const playerCrit = rollPlayerCritical(playerHit, combatStats);
    playerHit = playerCrit.damage;
    if (playerCrit.critical) playerText = criticalText(playerText, playerHit);

    enemyHp -= playerHit;
    events.push({
      round: rounds,
      actor: "hero",
      abilityId: playerAbilityId,
      damage: playerHit,
      critical: playerCrit.critical,
      enemyHp: Math.max(0, enemyHp),
      playerHp: Math.max(0, playerHp),
      text: playerText,
    });

    if (playerHp > 0 && playerCrit.critical && effectSummary.critHealRatio > 0) {
      const heal = Math.min(combatStats.maxHp - playerHp, Math.max(1, Math.floor(combatStats.maxHp * effectSummary.critHealRatio)));
      if (heal > 0) {
        playerHp += heal;
        events.push({
          round: rounds,
          actor: "hero",
          damage: 0,
          enemyHp: Math.max(0, enemyHp),
          playerHp: Math.max(0, playerHp),
          text: `Lebenssog heilt ${heal} Leben.`,
        });
      }
    }

    if (enemyHp > 0 && effectSummary.bleedChance > 0 && Math.random() < Math.min(0.32, effectSummary.bleedChance)) {
      const bleedDamage = Math.max(1, Math.ceil(combatStats.damage * 0.16));
      fightState.enemyDots.push({ name: "Blutung", damage: bleedDamage, turns: 2 });
      events.push({
        round: rounds,
        actor: "hero",
        damage: 0,
        enemyHp: Math.max(0, enemyHp),
        playerHp: Math.max(0, playerHp),
        text: `Blutkante öffnet eine Wunde. Blutung hält an.`,
      });
    }

    if (enemyHp > 0 && effectSummary.poisonChance > 0 && Math.random() < Math.min(0.3, effectSummary.poisonChance)) {
      const poisonDamage = Math.max(1, Math.ceil(combatStats.damage * 0.1));
      fightState.enemyDots.push({ name: "Gift", damage: poisonDamage, turns: 3 });
      events.push({
        round: rounds,
        actor: "hero",
        damage: 0,
        enemyHp: Math.max(0, enemyHp),
        playerHp: Math.max(0, playerHp),
        text: `Giftkante legt Gift in die Wunde.`,
      });
    }

    if (enemyHp > 0 && effectSummary.critBurn && playerCrit.critical) {
      const burnDamage = Math.max(1, Math.ceil(combatStats.damage * 0.18));
      fightState.enemyDots.push({ name: "Kronenbrand", damage: burnDamage, turns: 2 });
      events.push({
        round: rounds,
        actor: "hero",
        damage: 0,
        enemyHp: Math.max(0, enemyHp),
        playerHp: Math.max(0, playerHp),
        text: `Kronenbrand entzündet den Treffer.`,
      });
    }

    if (enemyHp > 0 && hasBuildAbility("bladeFlurry") && rounds % 4 === 0) {
      const flurryCrit = rollPlayerCritical(abilityDamage(basePlayerHit, 0.45), combatStats);
      const flurryHit = flurryCrit.damage;
      enemyHp -= flurryHit;
      events.push({
        round: rounds,
        actor: "hero",
        abilityId: "bladeFlurry",
        damage: flurryHit,
        critical: flurryCrit.critical,
        enemyHp: Math.max(0, enemyHp),
        playerHp: Math.max(0, playerHp),
        text: flurryCrit.critical
          ? `Klingenserie trifft zusätzlich kritisch für ${flurryHit}.`
          : `Klingenserie trifft zusätzlich für ${flurryHit}.`,
      });
    }

    if (enemyHp <= 0) break;

    const shieldWall = hasBuildAbility("shieldWall") && rounds % 4 === 0;
    const enemyBaseHit = Math.max(1, random(enemy.damage[0], enemy.damage[1]) - Math.floor(combatStats.defense * 0.42));
    const enemyAbility = triggeredEnemyAbility(enemy, rounds, playerHp, combatStats.maxHp, enemyHp);
    const enemyDamageMultiplier = shieldWall
      ? Math.min(fightState.nextEnemyDamageMultiplier, 0.45)
      : fightState.nextEnemyDamageMultiplier;
    const abilityMultiplier = enemyAbility?.damageMultiplier || 1;
    const passiveEnemyMultiplier = enemyDamagePassiveMultiplier(enemy, enemyHp);
    let enemyHit = Math.max(1, Math.floor(enemyBaseHit * enemyDamageMultiplier * abilityMultiplier * passiveEnemyMultiplier));
    enemyHit = Math.max(1, Math.floor(enemyHit * (1 - Math.min(0.35, enchantStats.damageReduction))));
    let guardBlocked = false;
    if (!fightState.guardBlockUsed && effectSummary.firstHitReduction > 0) {
      enemyHit = Math.max(1, Math.floor(enemyHit * (1 - effectSummary.firstHitReduction)));
      fightState.guardBlockUsed = true;
      guardBlocked = true;
    }
    const enemyCrit = rollEnemyCritical(enemyHit, enemy, effectSummary);
    enemyHit = enemyCrit.damage;
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
    if (enemyCrit.critical) enemyText = criticalText(enemyText, enemyHit);
    if (guardBlocked) enemyText += " Wachblock dämpft den Einschlag.";
    events.push({
      round: rounds,
      actor: "enemy",
      abilityId: shieldWall ? "shieldWall" : "",
      damage: enemyHit,
      critical: enemyCrit.critical,
      enemyHp: Math.max(0, enemyHp),
      playerHp: Math.max(0, playerHp),
      text: enemyText,
    });

    if (playerHp > 0 && enemyHp > 0 && effectSummary.thornsRatio > 0) {
      const thornsDamage = Math.max(1, Math.floor(enemyHit * effectSummary.thornsRatio));
      enemyHp -= thornsDamage;
      events.push({
        round: rounds,
        actor: "hero",
        damage: thornsDamage,
        enemyHp: Math.max(0, enemyHp),
        playerHp: Math.max(0, playerHp),
        text: `Dornenwache wirft ${thornsDamage} Schaden zurück.`,
      });
    }

    if (
      playerHp > 0
      && enemyHp > 0
      && hasBuildAbility("counterBlow")
      && (enemyCrit.critical || enemyBaseHit >= Math.max(10, combatStats.maxHp * 0.12))
      && rounds - fightState.lastCounterRound >= 3
    ) {
      const counterCrit = rollPlayerCritical(abilityDamage(basePlayerHit, 0.5), combatStats);
      const counterHit = counterCrit.damage;
      fightState.lastCounterRound = rounds;
      enemyHp -= counterHit;
      events.push({
        round: rounds,
        actor: "hero",
        abilityId: "counterBlow",
        damage: counterHit,
        critical: counterCrit.critical,
        enemyHp: Math.max(0, enemyHp),
        playerHp: Math.max(0, playerHp),
        text: counterCrit.critical
          ? `Konterschlag antwortet kritisch für ${counterHit}.`
          : `Konterschlag antwortet für ${counterHit}.`,
      });
    }
  }

  if (playerHp > 0 && effectSummary.postCombatHeal > 0) {
    const heal = Math.min(combatStats.maxHp - playerHp, Math.max(1, Math.floor(combatStats.maxHp * Math.min(0.18, effectSummary.postCombatHeal))));
    if (heal > 0) {
      playerHp += heal;
      events.push({
        round: Math.max(1, rounds),
        actor: "hero",
        damage: 0,
        enemyHp: Math.max(0, enemyHp),
        playerHp: Math.max(0, playerHp),
        text: `Nachhall heilt ${heal} Leben.`,
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
    setCombatLog(enemy, events, playerHp > 0, rounds);

    damageEquippedItems(enemy);

    if (playerHp > 0) {
      state.hp = Math.max(1, playerHp);
      const enchantStats = equippedEnchantmentSummary();
      const goldBonus = enchantStats.goldBonus + effectSummary.goldBonus;
      const gold = Math.max(1, Math.floor(random(enemy.gold[0], enemy.gold[1]) * (1 + goldBonus)));
      const xp = Math.max(1, Math.floor(enemy.xp * (1 + enchantStats.xpBonus)));
      state.gold += gold;
      gainXp(xp);
      await loadOptionalDataPack("drops");
      grantMaterials(enemy.baseId || selectedEnemy, enemy.eliteVariant);
      createLootChoices(enemy, enemy.baseId || selectedEnemy);
      state.combatStats = normalizeCombatStats(state.combatStats);
      state.combatStats.wins += 1;
      recordSmithMasteryBattle(enemy);
      recordEnchantMasteryBattle(enemy);
      updateQuestProgress(enemy);
      maybeGrantBattleRenown(enemy);
      const firstClearReward = grantBossFirstClear(enemy, enemy.baseId || selectedEnemy);
      maybeDropRareQuest(enemy);
      refreshQuestBoard(false);
      log(`Sieg gegen ${enemy.name} nach ${rounds} Runden. +${xp} XP, +${gold} Gold.`, "good");
      if (firstClearReward) {
        log(`Erster Dungeon-Sieg: ${bossFirstClearRewardText(enemy)}.`, "drop");
      }
      if (enemy.boss) remindSaveBackup("du hast einen Dungeon-Boss besiegt.");
      notifyReadyAchievements();
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
    critChance: 0.06,
    critDamage: 1.6,
    elite: true,
    eliteVariant: true,
    tags: { ...base.tags, elite: 1 },
  };
}

function updateQuestProgress(enemy) {
  state.activeQuests.map(getQuestById).filter(Boolean).forEach((quest) => {
    if (!isQuestActive(quest.id)) return;
    if (isQuestCompletedPermanent(quest.id)) return;
    const current = state.quests[quest.id] || 0;
    const gain = enemy.tags[quest.target] || 0;
    if (!gain) return;
    state.quests[quest.id] = Math.min(quest.needed, current + gain);
    if (state.quests[quest.id] >= quest.needed) {
      if (quest.repeatable) {
        state.quests[quest.id] = 0;
      } else {
        state.completedQuests.push(quest.id);
      }
      state.activeQuests = state.activeQuests.filter((id) => id !== quest.id);
      state.questBoard = state.questBoard.filter((id) => id !== quest.id);
      forgetNewQuest(quest.id);
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
  const chance = rareQuestDropChance(enemy);
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
  markQuestAsNew(id);
  log(`Seltene Quest-Schriftrolle gefunden: ${quest.name}. Sie liegt auf der Quest-Tafel.`, "drop");
}

function rareQuestDropChance(enemy) {
  return (enemy.elite ? 0.035 : enemy.tags.dungeon ? 0.022 : 0.012) + renownRareQuestBonus();
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
    .filter((id) => !isQuestCompletedPermanent(id))
    .filter((id) => !isQuestActive(id))
    .filter((id) => {
      const quest = getQuestById(id);
      return quest && questRelevantForCurrentZone(quest);
    });
  const hadVisibleQuest = state.questBoard.length > 0;

  if (!force && state.winsSinceQuestRefresh < 4) return;

  const candidates = questCatalog
    .map((quest) => quest.id)
    .filter((id) => !state.questBoard.includes(id))
    .filter((id) => !isQuestCompletedPermanent(id))
    .filter((id) => !state.activeQuests.includes(id))
    .filter((id) => questRelevantForCurrentZone(getQuestById(id)));

  while (state.questBoard.length < renownQuestBoardSize() && candidates.length) {
    const index = random(0, candidates.length - 1);
    const [questId] = candidates.splice(index, 1);
    state.questBoard.push(questId);
    if (!force || !hadVisibleQuest) markQuestAsNew(questId);
  }

  state.winsSinceQuestRefresh = 0;
}

function uniqueQuestIds(ids) {
  return [...new Set(ids)];
}

function markQuestAsNew(questId) {
  state.unseenQuests = uniqueQuestIds([questId, ...(state.unseenQuests || [])])
    .filter((id) => state.questBoard.includes(id));
}

function forgetNewQuest(questId) {
  state.unseenQuests = (state.unseenQuests || []).filter((id) => id !== questId);
}

function getQuestById(questId) {
  const rareQuests = typeof state !== "undefined" && state?.rareQuests ? state.rareQuests : {};
  return questCatalog.find((quest) => quest.id === questId) || rareQuests[questId];
}

function createQuestRewardItem(quest) {
  const quality = quest.rare ? "legendary" : "epic";
  const slot = quest.slot || lootSlots[random(0, lootSlots.length - 1)];
  const base = Math.max(5, Math.floor(quest.rewardXp / 115) + Math.floor(state.level * 0.7));
  const power = qualityPower[quality] * 0.92;
  const namePool = lootNames[slot][quality];
  const stats = normalizeRolledItemStats(slot, quality, rollSlotStats(slot, base, power));
  const critStats = rollCritStats(slot, quality);

  return {
    id: `quest-reward-${quest.id}`,
    name: `${namePool[random(0, namePool.length - 1)]} der Grauwacht`,
    slot,
    quality,
    damage: stats.damage,
    defense: stats.defense,
    ...critStats,
    effect: rollItemEffect(slot, quality, null),
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

// ============================================================================
// ACHIEVEMENT FUNCTIONS
// ============================================================================
function achievementById(id) {
  return achievementCatalog.find((achievement) => achievement.id === id);
}

function isAchievementClaimed(id) {
  state.achievements = normalizeAchievements(state.achievements);
  return state.achievements.claimed.includes(id);
}

function achievementProgress(achievement) {
  const value = achievementProgressValue(achievement.metric);
  const target = Math.max(1, achievement.target || 1);
  return {
    value,
    target,
    percent: Math.max(0, Math.min(100, (value / target) * 100)),
    ready: value >= target,
  };
}

function achievementProgressValue(metric) {
  state.combatStats = normalizeCombatStats(state.combatStats);
  if (metric === "eliteKills") return state.combatStats.eliteKills;
  if (metric === "bossKills") return state.combatStats.bossKills;
  if (metric === "wins") return state.combatStats.wins;
  if (metric === "itemsUpgraded") return state.combatStats.itemsUpgraded;
  if (metric === "itemsSalvaged") return state.combatStats.itemsSalvaged;
  if (metric === "itemsEnchanted") return state.combatStats.itemsEnchanted;
  if (metric === "rareEnchantments") return Math.max(state.combatStats.rareEnchantments, discoveredRareEnchantments());
  if (metric === "discoveredItems") return discoveredItemCount();
  if (metric === "legendaryItems") return hasDiscoveredItem((item) => itemQuality(item) === "legendary") ? 1 : 0;
  if (metric === "fixedBossDrops") return hasDiscoveredItem((item, enemyId) => item.fixed && enemies[enemyId]?.boss) ? 1 : 0;
  if (metric === "setItems") return hasDiscoveredItem((item) => Boolean(item.set)) ? 1 : 0;
  if (metric === "itemAtLimit") return hasEquippedItemAtLimit() ? 1 : 0;
  if (metric === "smithMasteries") return state.smithMastery?.completed?.length || 0;
  if (metric === "enchantSlots") return currentEnchantSlotLimit();
  if (metric === "enchantMasteries") return state.enchanting?.completed?.length || 0;
  if (metric === "renown") return state.renown || 0;
  return 0;
}

function discoveredItemCount() {
  return Object.values(state.discoveredLoot || {}).reduce((sum, drops) => sum + Object.keys(drops || {}).length, 0);
}

function hasDiscoveredItem(predicate) {
  return Object.entries(state.discoveredLoot || {}).some(([enemyId, drops]) =>
    Object.values(drops || {}).some((item) => predicate(item, enemyId))
  );
}

function discoveredRareEnchantments() {
  return allSavedItems()
    .flatMap((item) => activeItemEnchantments(item))
    .filter((enchantment) => enchantRarityRank(enchantment.rarity) >= enchantRarityRank("rare"))
    .length;
}

function allSavedItems() {
  const ids = [...Object.values(state.equipment || {}), ...(state.inventory || [])].filter(Boolean);
  const itemsById = ids.map(getItem).filter(Boolean);
  return [...itemsById, ...Object.values(state.customItems || {})].filter(Boolean);
}

function readyAchievements() {
  state.achievements = normalizeAchievements(state.achievements);
  return achievementCatalog.filter((achievement) =>
    !isAchievementClaimed(achievement.id) && achievementProgress(achievement).ready
  );
}

function readyAchievementCount() {
  return readyAchievements().length;
}

function claimedAchievementCount() {
  state.achievements = normalizeAchievements(state.achievements);
  return state.achievements.claimed.length;
}

function achievementRewardText(reward = {}) {
  const parts = [];
  if (reward.gold) parts.push(`${reward.gold} Gold`);
  if (reward.renown) parts.push(`${reward.renown} Ruhm`);
  Object.entries(reward.materials || {}).forEach(([id, amount]) => {
    parts.push(`${amount} ${materialLabel[id] || id}`);
  });
  return parts.join(" · ") || "Keine Belohnung";
}

function claimAchievement(id) {
  const achievement = achievementById(id);
  if (!achievement || isAchievementClaimed(id) || !achievementProgress(achievement).ready) return false;
  state.achievements.claimed.push(id);
  grantAchievementReward(achievement.reward);
  log(`Erfolg eingelöst: ${achievement.name}. Belohnung: ${achievementRewardText(achievement.reward)}.`, "drop");
  notifyReadyAchievements();
  save();
  render();
  return true;
}

function grantAchievementReward(reward = {}) {
  state.gold += reward.gold || 0;
  state.renown += reward.renown || 0;
  Object.entries(reward.materials || {}).forEach(([id, amount]) => {
    state.materials[id] = (state.materials[id] || 0) + amount;
  });
}

// ============================================================================
// SMITHING FUNCTIONS
// ============================================================================
function currentSmithMasteryLimit() {
  return Math.max(5, Math.min(20, state.smithMastery?.limit || 5));
}

function smithMasteryDiscovered() {
  return Boolean(
    state.smithMastery?.discovered
    || state.smithMastery?.active
    || state.smithMastery?.completed?.length
    || hasEquippedItemAtLimit(),
  );
}

function nextSmithMasteryRank() {
  return smithMasteryRanks.find((rank) => !state.smithMastery.completed.includes(rank.id)) || null;
}

function smithMasteryRankById(id) {
  return smithMasteryRanks.find((rank) => rank.id === id);
}

function hasEquippedItemAtLimit(limit = currentSmithMasteryLimit()) {
  return equipmentSlots.some((slot) => {
    const item = getItem(state.equipment[slot]);
    return item && (item.upgrade || 0) >= limit;
  });
}

function smithRankMeets(threshold = 0) {
  return renownRank().threshold >= threshold;
}

function smithMasteryRequirementStatus(rank) {
  const requirement = rank.requirement || {};
  return [
    { label: `Level ${requirement.level}`, done: state.level >= (requirement.level || 1) },
    { label: `${requirement.renown} Ruhm`, done: state.renown >= (requirement.renown || 0) },
    { label: "ein ausgerüstetes Item am aktuellen Limit", done: hasEquippedItemAtLimit() },
    { label: "Schmied vertraut dir genug", done: smithRankMeets(requirement.rank || 0) },
    ...(requirement.bossKills ? [{ label: `${requirement.bossKills} Dungeon-Boss besiegt`, done: (state.combatStats?.bossKills || 0) >= requirement.bossKills }] : []),
  ];
}

function canStartSmithMasteryMission(rank) {
  return Boolean(rank)
    && !state.smithMastery.active
    && !state.smithMastery.completed.includes(rank.id)
    && smithMasteryRequirementStatus(rank).every((entry) => entry.done);
}

function startSmithMasteryMission(rankId) {
  const rank = smithMasteryRankById(rankId);
  if (!canStartSmithMasteryMission(rank)) {
    log("Borin Glutbart schüttelt den Kopf. Für diesen Meisterauftrag fehlt dir noch etwas.", "bad");
    return;
  }
  state.smithMastery.discovered = true;
  state.smithMastery.active = rank.id;
  state.smithMastery.progress[rank.id] = { eliteKills: 0, bossKills: 0 };
  log(`Meisterauftrag begonnen: ${rank.name}.`, "drop");
  save();
  render();
}

function smithMasteryProgress(rank) {
  return state.smithMastery.progress[rank.id] || { eliteKills: 0, bossKills: 0 };
}

function smithMasteryObjectiveStatus(rank) {
  const progress = smithMasteryProgress(rank);
  const objectives = [];
  if (rank.progress?.eliteKills) {
    objectives.push({ label: "Elite-Gegner", value: progress.eliteKills || 0, needed: rank.progress.eliteKills });
  }
  if (rank.progress?.bossKills) {
    objectives.push({ label: "Dungeon-Bosse", value: progress.bossKills || 0, needed: rank.progress.bossKills });
  }
  Object.entries(rank.materials || {}).forEach(([id, needed]) => {
    objectives.push({ label: labelFor(materialLabel, id), value: state.materials[id] || 0, needed });
  });
  objectives.push({ label: "Gold", value: state.gold, needed: rank.gold });
  if (rank.sacrificeQuality) {
    objectives.push({ label: "Episches Opferstück", value: findSmithSacrificeItemId() ? 1 : 0, needed: 1 });
  }
  return objectives;
}

function canCompleteSmithMasteryMission(rank) {
  return Boolean(rank)
    && state.smithMastery.active === rank.id
    && smithMasteryObjectiveStatus(rank).every((entry) => entry.value >= entry.needed);
}

function completeSmithMasteryMission(rankId) {
  const rank = smithMasteryRankById(rankId);
  if (!canCompleteSmithMasteryMission(rank)) {
    log("Borin Glutbart knurrt: Bring mir Erz, nicht Ausreden.", "bad");
    return;
  }

  state.gold -= rank.gold;
  Object.entries(rank.materials || {}).forEach(([id, amount]) => {
    state.materials[id] -= amount;
  });
  if (rank.sacrificeQuality) removeSmithSacrificeItem();
  state.smithMastery.limit = rank.limit;
  state.smithMastery.discovered = true;
  state.smithMastery.active = null;
  state.smithMastery.completed = [...new Set([...state.smithMastery.completed, rank.id])];
  state.renown += rank.rewardRenown;
  log(`Borin Glutbart vollendet "${rank.name}". Neues Upgrade-Limit: +${rank.limit}. +${rank.rewardRenown} Ruhm.`, "drop");
  remindSaveBackup("Borin hat seine Werkstatt erweitert.");
  notifyReadyAchievements();
  save();
  render();
}

function recordSmithMasteryBattle(enemy) {
  state.combatStats = normalizeCombatStats(state.combatStats);
  if (enemy.elite) state.combatStats.eliteKills += 1;
  if (enemy.boss) state.combatStats.bossKills += 1;

  const active = smithMasteryRankById(state.smithMastery?.active);
  if (!active) return;
  const progress = smithMasteryProgress(active);
  if (enemy.elite) progress.eliteKills = Math.min(active.progress?.eliteKills || 0, (progress.eliteKills || 0) + 1);
  if (enemy.boss) progress.bossKills = Math.min(active.progress?.bossKills || 0, (progress.bossKills || 0) + 1);
  state.smithMastery.progress[active.id] = progress;
}

// ============================================================================
// ENCHANTING FUNCTIONS
// ============================================================================
function nextEnchantMasteryRank() {
  return enchantMasteryRanks.find((rank) => !state.enchanting.completed.includes(rank.id)) || null;
}

function enchantMasteryRankById(id) {
  return enchantMasteryRanks.find((rank) => rank.id === id);
}

function hasEnchantedEquippedItem() {
  return equipmentSlots.some((slot) => activeItemEnchantments(getItem(state.equipment[slot])).length > 0);
}

function enchantMasteryRequirementStatus(rank) {
  const requirement = rank.requirement || {};
  return [
    { label: `Level ${requirement.level}`, done: state.level >= (requirement.level || 1) },
    { label: `${requirement.renown} Ruhm`, done: state.renown >= (requirement.renown || 0) },
    ...(requirement.enchantedItem ? [{ label: "ein verzaubertes ausgerüstetes Item", done: hasEnchantedEquippedItem() }] : []),
    ...(requirement.bossKills ? [{ label: `${requirement.bossKills} Dungeon-Boss besiegt`, done: (state.combatStats?.bossKills || 0) >= requirement.bossKills }] : []),
  ];
}

function canStartEnchantMasteryMission(rank) {
  return Boolean(rank)
    && enchantmentsUnlocked()
    && !state.enchanting.active
    && !state.enchanting.completed.includes(rank.id)
    && enchantMasteryRequirementStatus(rank).every((entry) => entry.done);
}

function startEnchantMasteryMission(rankId) {
  const rank = enchantMasteryRankById(rankId);
  if (!canStartEnchantMasteryMission(rank)) {
    log("Mira Nachtfaden lächelt spitz: Erst die Prüfung, dann das Ritual.", "bad");
    return;
  }
  state.enchanting.discovered = true;
  state.enchanting.active = rank.id;
  state.enchanting.progress[rank.id] = { eliteKills: 0, bossKills: 0 };
  log(`Arkaner Auftrag begonnen: ${rank.name}.`, "drop");
  save();
  render();
}

function enchantMasteryProgress(rank) {
  return state.enchanting.progress[rank.id] || { eliteKills: 0, bossKills: 0 };
}

function enchantMasteryObjectiveStatus(rank) {
  const progress = enchantMasteryProgress(rank);
  const objectives = [];
  if (rank.progress?.eliteKills) {
    objectives.push({ label: "Elite-Gegner", value: progress.eliteKills || 0, needed: rank.progress.eliteKills });
  }
  if (rank.progress?.bossKills) {
    objectives.push({ label: "Dungeon-Bosse", value: progress.bossKills || 0, needed: rank.progress.bossKills });
  }
  Object.entries(rank.materials || {}).forEach(([id, needed]) => {
    objectives.push({ label: labelFor(materialLabel, id), value: state.materials[id] || 0, needed });
  });
  objectives.push({ label: "Gold", value: state.gold, needed: rank.gold });
  if (rank.sacrificeQuality) {
    objectives.push({ label: `${labelFor(qualityLabel, rank.sacrificeQuality)}es Opferstück`, value: findEnchantSacrificeItemId(rank.sacrificeQuality) ? 1 : 0, needed: 1 });
  }
  return objectives;
}

function canCompleteEnchantMasteryMission(rank) {
  return Boolean(rank)
    && state.enchanting.active === rank.id
    && enchantMasteryObjectiveStatus(rank).every((entry) => entry.value >= entry.needed);
}

function completeEnchantMasteryMission(rankId) {
  const rank = enchantMasteryRankById(rankId);
  if (!canCompleteEnchantMasteryMission(rank)) {
    log("Mira Nachtfaden tippt auf den Runenkreis. Er bleibt kalt.", "bad");
    return;
  }

  state.gold -= rank.gold;
  Object.entries(rank.materials || {}).forEach(([id, amount]) => {
    state.materials[id] -= amount;
  });
  if (rank.sacrificeQuality) removeEnchantSacrificeItem(rank.sacrificeQuality);
  state.enchanting.discovered = true;
  state.enchanting.active = null;
  state.enchanting.completed = [...new Set([...state.enchanting.completed, rank.id])];
  state.renown += rank.rewardRenown;
  log(`Mira vollendet "${rank.name}". ${rank.reward} +${rank.rewardRenown} Ruhm.`, "drop");
  remindSaveBackup("Mira hat deine Runenbindung erweitert.");
  notifyReadyAchievements();
  save();
  render();
}

function recordEnchantMasteryBattle(enemy) {
  const active = enchantMasteryRankById(state.enchanting?.active);
  if (!active) return;
  const progress = enchantMasteryProgress(active);
  if (enemy.elite) progress.eliteKills = Math.min(active.progress?.eliteKills || 0, (progress.eliteKills || 0) + 1);
  if (enemy.boss) progress.bossKills = Math.min(active.progress?.bossKills || 0, (progress.bossKills || 0) + 1);
  state.enchanting.progress[active.id] = progress;
}
