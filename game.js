const saveKey = "fantasy-grind-save-v1";

const xpForLevel = (level) => Math.floor(80 * Math.pow(level, 1.72) + level * 35);

const zones = {
  meadow: {
    name: "Startzone",
    enemies: ["wolf", "bandit", "boar", "oldKnight"],
  },
  dungeon: {
    name: "Dungeon",
    enemies: ["ratguard", "boneAcolyte", "cryptBrute", "hollowChampion"],
  },
};

const enemies = {
  wolf: {
    name: "Waldwolf",
    sprite: "enemy-wolf",
    level: 1,
    hp: 34,
    damage: [5, 9],
    defense: 1,
    xp: 18,
    gold: [2, 5],
    drops: [{ id: "wolfRing", chance: 0.035 }],
    tags: { wolf: 1 },
  },
  bandit: {
    name: "Wegräuber",
    sprite: "enemy-bandit",
    level: 3,
    hp: 54,
    damage: [8, 14],
    defense: 3,
    xp: 34,
    gold: [5, 11],
    drops: [{ id: "rustBlade", chance: 0.055 }],
    tags: { bandit: 1, rust: 0.32 },
  },
  boar: {
    name: "Dornenkeiler",
    sprite: "enemy-boar",
    level: 6,
    hp: 92,
    damage: [14, 22],
    defense: 5,
    xp: 72,
    gold: [8, 16],
    drops: [{ id: "hideArmor", chance: 0.045 }],
    tags: { beast: 1 },
  },
  oldKnight: {
    name: "Alter Grenzritter",
    sprite: "enemy-knight",
    level: 10,
    hp: 150,
    damage: [22, 34],
    defense: 10,
    xp: 145,
    gold: [18, 32],
    drops: [{ id: "oathRing", chance: 0.025 }, { id: "knightPlate", chance: 0.018 }],
    elite: true,
    tags: { elite: 1 },
  },
  ratguard: {
    name: "Kellergardist",
    sprite: "enemy-ratguard",
    level: 9,
    hp: 136,
    damage: [20, 31],
    defense: 8,
    xp: 126,
    gold: [13, 26],
    drops: [{ id: "guardAxe", chance: 0.04 }],
    tags: { dungeon: 1 },
  },
  boneAcolyte: {
    name: "Knochenakolyth",
    sprite: "enemy-acolyte",
    level: 12,
    hp: 184,
    damage: [28, 42],
    defense: 11,
    xp: 210,
    gold: [21, 39],
    drops: [{ id: "graveRing", chance: 0.035 }],
    tags: { dungeon: 1 },
  },
  cryptBrute: {
    name: "Gruftschläger",
    sprite: "enemy-brute",
    level: 15,
    hp: 260,
    damage: [38, 58],
    defense: 16,
    xp: 345,
    gold: [34, 62],
    drops: [{ id: "bruteMail", chance: 0.03 }],
    elite: true,
    tags: { elite: 1, dungeon: 1 },
  },
  hollowChampion: {
    name: "Hohler Champion",
    sprite: "enemy-champion",
    level: 20,
    hp: 420,
    damage: [58, 88],
    defense: 24,
    xp: 820,
    gold: [80, 150],
    drops: [{ id: "ashenGreatsword", chance: 0.018 }, { id: "crownShard", chance: 0.012 }],
    elite: true,
    tags: { elite: 1, dungeon: 1 },
  },
};

const items = {
  trainingSword: { name: "Übungsschwert", slot: "weapon", quality: "common", damage: 4, defense: 0 },
  paddedVest: { name: "Gepolsterte Weste", slot: "armor", quality: "common", damage: 0, defense: 3 },
  copperRing: { name: "Kupferring", slot: "ring", quality: "common", damage: 1, defense: 1 },
  wolfRing: { name: "Ring des Rudels", slot: "ring", quality: "rare", damage: 3, defense: 2 },
  rustBlade: { name: "Rostklinge", slot: "weapon", quality: "rare", damage: 10, defense: 0 },
  hideArmor: { name: "Dornenleder", slot: "armor", quality: "rare", damage: 0, defense: 11 },
  oathRing: { name: "Eidring", slot: "ring", quality: "very-rare", damage: 5, defense: 5 },
  knightPlate: { name: "Grenzritterplatte", slot: "armor", quality: "very-rare", damage: 0, defense: 20 },
  guardAxe: { name: "Gardistenaxt", slot: "weapon", quality: "rare", damage: 15, defense: 0 },
  graveRing: { name: "Grablichtring", slot: "ring", quality: "very-rare", damage: 7, defense: 4 },
  bruteMail: { name: "Schlägerkettenhemd", slot: "armor", quality: "very-rare", damage: 1, defense: 27 },
  ashenGreatsword: { name: "Aschgraues Großschwert", slot: "weapon", quality: "epic", damage: 34, defense: 0 },
  crownShard: { name: "Splitter der Krone", slot: "ring", quality: "epic", damage: 11, defense: 10 },
};

const qualityLabel = {
  common: "Gewöhnlich",
  rare: "Selten",
  "very-rare": "Sehr selten",
  epic: "Episch",
};

const slotLabel = {
  weapon: "Waffe",
  armor: "Rüstung",
  ring: "Ring",
};

const qualityPower = {
  common: 1,
  rare: 1.45,
  "very-rare": 1.95,
  epic: 2.65,
};

const lootNames = {
  weapon: {
    common: ["Kerbenschwert", "Feldbeil", "Wachklinge"],
    rare: ["Runenklinge", "Blutrost-Axt", "Silberfalchion"],
    "very-rare": ["Eidbrecher", "Sternstahlklinge", "Gruftspalter"],
    epic: ["Königsschneide", "Aschenurteil", "Drachenzahn"],
  },
  armor: {
    common: ["Lederwams", "Kettenfetzen", "Reiserüstung"],
    rare: ["Wolfsleder", "Schildplattenrock", "Schuppenpanzer"],
    "very-rare": ["Eidhüterplatte", "Nachtkettenhemd", "Runenharnisch"],
    epic: ["Krone der Bastion", "Aschenpanzer", "Sonnenharnisch"],
  },
  ring: {
    common: ["Zinnring", "Feldreif", "Schlichter Talisman"],
    rare: ["Blutsteinring", "Wolfszeichen", "Wachtersiegel"],
    "very-rare": ["Grablichtreif", "Eidsiegel", "Sternsplitterring"],
    epic: ["Splitterkrone", "Ring des alten Feuers", "Königszeichen"],
  },
};

const questCatalog = [
  { id: "wolves", name: "Sichere den Waldrand", rarity: "common", text: "Töte 8 Waldwölfe.", target: "wolf", needed: 8, rewardXp: 95, rewardGold: 35 },
  { id: "rust", name: "Rost für den Schmied", rarity: "rare", text: "Sammle 3 Rostsplitter von Wegräubern.", target: "rust", needed: 3, rewardXp: 180, rewardGold: 70 },
  { id: "elites", name: "Mut unter Stein", rarity: "very-rare", text: "Besiege 2 Elite-Gegner.", target: "elite", needed: 2, rewardXp: 520, rewardGold: 160 },
  { id: "boars", name: "Dornen im Acker", rarity: "common", text: "Erlege 5 Dornenkeiler.", target: "beast", needed: 5, rewardXp: 260, rewardGold: 90 },
  { id: "dungeon", name: "Licht unter Stein", rarity: "very-rare", text: "Besiege 6 Dungeon-Gegner.", target: "dungeon", needed: 6, rewardXp: 440, rewardGold: 140 },
  { id: "bandits", name: "Wege wieder sicher", rarity: "rare", text: "Besiege 7 Wegräuber.", target: "bandit", needed: 7, rewardXp: 210, rewardGold: 80 },
];

const rareQuestTemplates = [
  { key: "wolf", name: "Blutspur des Rudels", rarity: "epic", text: "Jage 6 Waldwölfe für eine alte Jagdtrophaee.", target: "wolf", needed: 6, rewardXp: 360, rewardGold: 120, slot: "ring" },
  { key: "bandit", name: "Versiegelter Steckbrief", rarity: "epic", text: "Besiege 5 Wegräuber und bringe den Steckbrief zurück.", target: "bandit", needed: 5, rewardXp: 420, rewardGold: 160, slot: "weapon" },
  { key: "elite", name: "Schwur gegen die Gefallenen", rarity: "epic", text: "Bezwinge 3 Elite-Gegner für eine seltene Reliquie.", target: "elite", needed: 3, rewardXp: 900, rewardGold: 260, slot: "armor" },
  { key: "dungeon", name: "Runen aus der Tiefe", rarity: "epic", text: "Besiege 5 Dungeon-Gegner und berge eine Runenbelohnung.", target: "dungeon", needed: 5, rewardXp: 760, rewardGold: 220, slot: "ring" },
];

const allQuestIds = () => [...questCatalog.map((quest) => quest.id), ...Object.keys(state?.rareQuests || {})];

const rarityLabel = {
  common: "Gewöhnlich",
  rare: "Selten",
  "very-rare": "Sehr selten",
  epic: "Episch",
};

const materialLabel = {
  hide: "Fell",
  fang: "Zähne",
  iron: "Eisenbarren",
  shard: "Runensplitter",
};

const materialDrops = {
  wolf: [{ id: "hide", min: 1, max: 2 }, { id: "fang", min: 0, max: 1 }],
  bandit: [{ id: "iron", min: 1, max: 2 }, { id: "shard", min: 0, max: 1 }],
  boar: [{ id: "hide", min: 2, max: 3 }, { id: "fang", min: 1, max: 2 }],
  oldKnight: [{ id: "iron", min: 2, max: 4 }, { id: "shard", min: 1, max: 2 }],
  ratguard: [{ id: "iron", min: 2, max: 3 }, { id: "shard", min: 0, max: 1 }],
  boneAcolyte: [{ id: "shard", min: 1, max: 3 }, { id: "fang", min: 1, max: 2 }],
  cryptBrute: [{ id: "iron", min: 3, max: 5 }, { id: "shard", min: 2, max: 3 }],
  hollowChampion: [{ id: "iron", min: 5, max: 8 }, { id: "shard", min: 4, max: 6 }, { id: "fang", min: 2, max: 4 }],
};

let state = load();
let selectedZone = "meadow";
let selectedEnemy = "wolf";
let selectedBestiaryEnemy = "wolf";
let isFighting = false;
let skipCombat = false;

const $ = (id) => document.getElementById(id);
const random = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const eliteEncounterChance = 0.09;
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
    durability: 100,
    equipment: {
      weapon: "trainingSword",
      armor: "paddedVest",
      ring: "copperRing",
    },
    customItems: {},
    pendingLoot: [],
    lootQueue: [],
    nextEncounters: {},
    inventory: [],
    materials: { hide: 0, fang: 0, iron: 0, shard: 0 },
    discoveredLoot: {},
    quests: { wolves: 0, rust: 0, elites: 0 },
    questBoard: ["wolves", "rust", "elites"],
    activeQuests: [],
    completedQuests: [],
    rareQuests: {},
    winsSinceQuestRefresh: 0,
    log: ["Du erreichst das Lager Grauwacht. Der Grind beginnt langsam."],
  };
}

function load() {
  try {
    const raw = localStorage.getItem(saveKey);
    if (!raw) return defaultState();
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
    loaded.materials = { ...defaultState().materials, ...(loaded.materials || {}) };
    loaded.questBoard = Array.isArray(loaded.questBoard) ? loaded.questBoard : ["wolves", "rust", "elites"];
    loaded.rareQuests = loaded.rareQuests || {};
    loaded.winsSinceQuestRefresh = loaded.winsSinceQuestRefresh || 0;
    return loaded;
  } catch {
    return defaultState();
  }
}

function save() {
  localStorage.setItem(saveKey, JSON.stringify(state));
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
  return items[itemId] || state.customItems[itemId];
}

function totalStats() {
  const equipped = Object.values(state.equipment).map((id) => getItem(id));
  const itemDamage = equipped.reduce((sum, item) => sum + item.damage, 0);
  const itemDefense = equipped.reduce((sum, item) => sum + item.defense, 0);
  const durabilityFactor = 0.72 + state.durability / 360;
  return {
    damage: Math.floor((8 + state.level * 3 + itemDamage) * durabilityFactor),
    defense: Math.floor((3 + state.level * 2 + itemDefense) * durabilityFactor),
    maxHp: 92 + state.level * 8,
  };
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

  while (playerHp > 0 && enemyHp > 0 && rounds < 80) {
    rounds += 1;
    const playerHit = Math.max(1, random(stats.damage - 3, stats.damage + 5) - enemy.defense);
    enemyHp -= playerHit;
    events.push({ actor: "hero", damage: playerHit, enemyHp: Math.max(0, enemyHp), playerHp: Math.max(0, playerHp) });
    if (enemyHp <= 0) break;
    const enemyHit = Math.max(1, random(enemy.damage[0], enemy.damage[1]) - Math.floor(stats.defense * 0.55));
    playerHp -= enemyHit;
    events.push({ actor: "enemy", damage: enemyHit, enemyHp: Math.max(0, enemyHp), playerHp: Math.max(0, playerHp) });
  }

  isFighting = true;
  skipCombat = false;
  setBattleEnemyVisual(enemy);
  setControlsDisabled(true);
  $("fightBtn").textContent = "Skip";
  $("fightBtn").disabled = false;
  await playCombatAnimation(enemy, events, playerHp > 0);

  state.durability = Math.max(0, state.durability - random(2, enemy.elite ? 9 : 5));

  if (playerHp > 0) {
    state.hp = Math.max(1, playerHp);
    const gold = random(enemy.gold[0], enemy.gold[1]);
    state.gold += gold;
    gainXp(enemy.xp);
    grantMaterials(enemy.baseId || selectedEnemy, enemy.eliteVariant);
    updateQuestProgress(enemy);
    maybeDropRareQuest(enemy);
    refreshQuestBoard(false);
    createLootChoices(enemy, enemy.baseId || selectedEnemy);
    log(`Sieg gegen ${enemy.name} nach ${rounds} Runden. +${enemy.xp} XP, +${gold} Gold.`, "good");
  } else {
    const xpLoss = Math.min(state.xp, Math.ceil(xpForLevel(state.level) * 0.06));
    const goldLoss = Math.min(state.gold, Math.ceil(10 + state.level * 4));
    state.xp -= xpLoss;
    state.gold -= goldLoss;
    state.deaths += 1;
    state.hp = Math.max(1, Math.floor(state.maxHp * 0.35));
    state.durability = Math.max(0, state.durability - 12);
    log(`Tod gegen ${enemy.name}. Du verlierst ${xpLoss} XP, ${goldLoss} Gold und kehrst angeschlagen ins Lager zurück.`, "bad");
  }

  isFighting = false;
  setControlsDisabled(false);
  prepareNextEncounter(enemy.baseId || selectedEnemy);
  save();
  render();
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
  return {
    ...base,
    baseId: enemyId,
    name: `Elite-${base.name}`,
    level: base.level + 2,
    hp: Math.ceil(base.hp * 1.55),
    damage: [Math.ceil(base.damage[0] * 1.32), Math.ceil(base.damage[1] * 1.36)],
    defense: Math.ceil(base.defense * 1.45 + 2),
    xp: Math.ceil(base.xp * 2.15),
    gold: [Math.ceil(base.gold[0] * 1.8), Math.ceil(base.gold[1] * 2.25)],
    drops: base.drops.map((drop) => ({ ...drop, chance: Math.min(0.22, drop.chance * 1.85) })),
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
      state.renown += 1;
      if (quest.rewardItem) {
        const reward = createQuestRewardItem(quest);
        state.customItems[reward.id] = reward;
        queueLootBatch([reward]);
        log(`Questbelohnung erhalten: ${reward.name} (${qualityLabel[reward.quality]}).`, "drop");
      }
      log(`Quest abgeschlossen: ${quest.name}. +${quest.rewardXp} XP, +${quest.rewardGold} Gold.`, "drop");
    }
  });
}

function maybeDropRareQuest(enemy) {
  const chance = enemy.elite ? 0.055 : enemy.tags.dungeon ? 0.035 : 0.018;
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
  state.questBoard = uniqueQuestIds(state.questBoard).slice(0, 5);
  log(`Seltene Quest-Schriftrolle gefunden: ${quest.name}. Sie liegt auf der Quest-Tafel.`, "drop");
}

function pickRareQuestTemplate(enemy) {
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
    .filter((id) => getQuestById(id));

  if (!force && state.winsSinceQuestRefresh < 4) return;

  const candidates = questCatalog
    .map((quest) => quest.id)
    .filter((id) => !state.questBoard.includes(id))
    .filter((id) => !state.completedQuests.includes(id))
    .filter((id) => !state.activeQuests.includes(id));

  while (state.questBoard.length < 3 && candidates.length) {
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
  const quality = quest.rare ? "epic" : "very-rare";
  const slot = quest.slot || ["weapon", "armor", "ring"][random(0, 2)];
  const base = Math.max(6, Math.floor(quest.rewardXp / 80) + state.level);
  const power = qualityPower[quality];
  const namePool = lootNames[slot][quality];

  return {
    id: `quest-reward-${quest.id}`,
    name: `${namePool[random(0, namePool.length - 1)]} der Grauwacht`,
    slot,
    quality,
    damage: slot === "armor" ? 0 : Math.max(3, Math.floor(base * (slot === "ring" ? 0.7 : 1.8) * power)),
    defense: slot === "weapon" ? 0 : Math.max(3, Math.floor(base * (slot === "ring" ? 0.75 : 2.0) * power)),
    fixed: false,
    sourceType: "quest",
    sourceQuest: quest.id,
  };
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
  const equipmentItems = items.filter((item) => item && item.slot && ["weapon", "armor", "ring"].includes(item.slot));
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
  const slot = ["weapon", "armor", "ring"][random(0, 2)];
  const quality = rollQuality(enemy);
  const base = Math.max(1, enemy.level + random(-1, 2));
  const power = qualityPower[quality];
  const namePool = lootNames[slot][quality];
  const id = `loot-${Date.now()}-${Math.random().toString(16).slice(2)}`;

  let damage = 0;
  let defense = 0;

  if (slot === "weapon") {
    damage = Math.max(2, Math.floor(base * 1.65 * power + random(0, 3)));
  } else if (slot === "armor") {
    defense = Math.max(2, Math.floor(base * 1.85 * power + random(0, 4)));
  } else {
    damage = Math.max(1, Math.floor(base * 0.55 * power));
    defense = Math.max(1, Math.floor(base * 0.65 * power));
  }

  return {
    id,
    name: namePool[random(0, namePool.length - 1)],
    slot,
    quality,
    damage,
    defense,
    fixed: false,
    sourceEnemy: enemyId,
  };
}

function recordDiscoveredLoot(enemyId, lootItems) {
  state.discoveredLoot[enemyId] = state.discoveredLoot[enemyId] || {};

  lootItems.forEach((item) => {
    const key = lootDiscoveryKey(item);
    const existing = state.discoveredLoot[enemyId][key];
    state.discoveredLoot[enemyId][key] = {
      id: item.id,
      name: item.name,
      slot: item.slot,
      quality: item.quality,
      damage: item.damage,
      defense: item.defense,
      fixed: item.fixed,
      count: (existing?.count || 0) + 1,
    };
  });
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
  const eliteBonus = enemy.elite ? 0.04 : 0;
  const dungeonBonus = enemy.tags.dungeon ? 0.025 : 0;
  const bonus = eliteBonus + dungeonBonus + Math.min(0.04, enemy.level * 0.002);

  if (roll > 0.992 - bonus) return "epic";
  if (roll > 0.94 - bonus) return "very-rare";
  if (roll > 0.72 - bonus) return "rare";
  return "common";
}

function chooseLoot(index, equipNow = false) {
  if (!state.pendingLoot[index]) return;
  const item = state.pendingLoot[index];
  if (!item.fixed) {
    state.customItems[item.id] = item;
  }
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
  if (!item) return;

  const previousId = state.equipment[item.slot];
  state.equipment[item.slot] = itemId;
  state.inventory.splice(index, 1);

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
  state.inventory = [];
  state.gold += total;
  log(`${count} Items verkauft. +${total} Gold.`, "drop");
  save();
  render();
}

function sellValue(item) {
  const qualityValue = {
    common: 6,
    rare: 18,
    "very-rare": 45,
    epic: 120,
  };
  return Math.max(2, Math.floor(qualityValue[item.quality] + itemScore(item) * 2.2));
}

function grantMaterials(enemyId, eliteBonus = false) {
  const drops = materialDrops[enemyId] || [];
  const gained = [];
  drops.forEach((drop) => {
    const amount = random(drop.min, drop.max) + (eliteBonus ? 1 : 0);
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
  const qualityMultiplier = { common: 1, rare: 2, "very-rare": 3, epic: 5 }[item.quality];
  const slotMaterial = item.slot === "weapon" ? "fang" : item.slot === "armor" ? "iron" : "shard";
  return {
    gold: Math.floor(18 * qualityMultiplier * (level + 1)),
    materials: {
      [slotMaterial]: 2 + level * qualityMultiplier,
      hide: item.slot === "armor" ? 1 + level : 0,
      shard: item.quality === "epic" ? 1 + level : 0,
    },
  };
}

function canUpgrade(item) {
  if ((item.upgrade || 0) >= 5) return false;
  const cost = upgradeCost(item);
  return state.gold >= cost.gold && Object.entries(cost.materials).every(([id, amount]) => (state.materials[id] || 0) >= amount);
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
  const upgraded = { ...item, upgrade: (item.upgrade || 0) + 1 };
  if (slot === "weapon") upgraded.damage += 2 + Math.ceil(upgraded.upgrade / 2);
  if (slot === "armor") upgraded.defense += 3 + upgraded.upgrade;
  if (slot === "ring") {
    upgraded.damage += 1 + Math.floor(upgraded.upgrade / 2);
    upgraded.defense += 1 + Math.ceil(upgraded.upgrade / 2);
  }
  upgraded.name = item.name.replace(/\s\+\d+$/, "") + ` +${upgraded.upgrade}`;
  state.customItems[upgraded.id] = upgraded;
  log(`${upgraded.name} beim Schmied verbessert.`, "drop");
  save();
  render();
}

function salvageValue(item) {
  const qualityAmount = { common: 1, rare: 3, "very-rare": 6, epic: 10 }[item.quality];
  const upgradeBonus = item.upgrade || 0;
  const result = {};
  if (item.slot === "weapon") {
    result.fang = qualityAmount + upgradeBonus;
    result.iron = Math.max(1, Math.floor(qualityAmount / 2));
  } else if (item.slot === "armor") {
    result.iron = qualityAmount + upgradeBonus;
    result.hide = Math.max(1, Math.floor(qualityAmount / 2));
  } else {
    result.shard = qualityAmount + upgradeBonus;
    result.fang = Math.max(1, Math.floor(qualityAmount / 3));
  }
  if (item.quality === "epic") {
    result.shard = (result.shard || 0) + 2;
  }
  return result;
}

function salvageInventoryItem(index) {
  const itemId = state.inventory[index];
  const item = getItem(itemId);
  if (!item) return;
  const materials = salvageValue(item);
  Object.entries(materials).forEach(([id, amount]) => {
    state.materials[id] = (state.materials[id] || 0) + amount;
  });
  state.inventory.splice(index, 1);
  const text = Object.entries(materials).map(([id, amount]) => `${amount} ${materialLabel[id]}`).join(", ");
  log(`${item.name} zerlegt. Erhalten: ${text}.`, "drop");
  save();
  render();
}

function salvageAllInventoryItems() {
  if (!state.inventory.length) return;
  const gained = {};
  let count = 0;

  state.inventory.forEach((itemId) => {
    const item = getItem(itemId);
    if (!item) return;
    count += 1;
    Object.entries(salvageValue(item)).forEach(([id, amount]) => {
      gained[id] = (gained[id] || 0) + amount;
      state.materials[id] = (state.materials[id] || 0) + amount;
    });
  });

  state.inventory = [];
  const text = Object.entries(gained).map(([id, amount]) => `${amount} ${materialLabel[id]}`).join(", ");
  log(`${count} Items zerlegt. Erhalten: ${text}.`, "drop");
  save();
  render();
}

function rest() {
  const cost = restCost();
  state.gold -= cost;
  syncDerivedStats();
  state.hp = state.maxHp;
  log(`Du rastest am Feuer. Leben vollständig erholt. Kosten: ${cost} Gold.`);
  save();
  render();
}

function repair() {
  const missing = 100 - state.durability;
  if (!missing) {
    log("Deine Ausrüstung ist bereits in gutem Zustand.");
    return;
  }
  const cost = repairCost();
  const repaired = Math.floor(cost / Math.max(1, 1 + state.level * 0.08));
  state.gold -= cost;
  state.durability = Math.min(100, state.durability + repaired);
  log(`Der Schmied repariert deine Ausrüstung um ${repaired} Punkte. Kosten: ${cost} Gold.`);
  save();
  render();
}

function riskFor(enemy) {
  const stats = totalStats();
  const score = stats.damage * 2.1 + stats.defense * 1.6 + state.hp * 0.42;
  const danger = enemy.hp * 0.42 + enemy.damage[1] * 3.1 + enemy.defense * 2;
  return score >= danger ? "Machbar" : score >= danger * 0.78 ? "Riskant" : "Tödlich";
}

function restCost() {
  return Math.min(state.gold, Math.max(4, Math.floor(state.level * 3)));
}

function repairCost() {
  const missing = 100 - state.durability;
  if (!missing) return 0;
  return Math.min(state.gold, Math.ceil(missing * (1 + state.level * 0.08)));
}

function render() {
  syncDerivedStats();
  const stats = totalStats();
  $("level").textContent = state.level;
  $("gold").textContent = state.gold;
  $("renown").textContent = state.renown;
  $("deaths").textContent = state.deaths;
  $("hpText").textContent = `${state.hp}/${state.maxHp}`;
  $("hpBar").style.width = `${Math.max(2, (state.hp / state.maxHp) * 100)}%`;
  const needed = state.level >= 20 ? 1 : xpForLevel(state.level);
  $("xpText").textContent = state.level >= 20 ? "Max" : `${state.xp}/${needed}`;
  $("xpBar").style.width = `${state.level >= 20 ? 100 : Math.max(2, (state.xp / needed) * 100)}%`;
  $("stats").innerHTML = [
    ["Schaden", stats.damage],
    ["Verteidigung", stats.defense],
    ["Haltbarkeit", `${state.durability}%`],
  ].map(([label, value]) => `<div class="stat"><span>${label}</span><strong>${value}</strong></div>`).join("");
  $("restBtn").innerHTML = `<span class="button-main">Rasten</span><span class="button-price">${restCost()} Gold</span>`;
  $("repairBtn").innerHTML = `<span class="button-main">Reparieren</span><span class="button-price">${repairCost()} Gold</span>`;

  renderEnemies();
  renderEquipment();
  renderInventory();
  renderLootChoices();
  renderQuests();
  renderQuestBoard();
  renderBestiary();
  renderSmith();
  renderSelectedEnemy();
  renderLog();
  $("fightBtn").textContent = isFighting ? (skipCombat ? "Überspringe..." : "Skip") : "Kampf starten";
  $("fightBtn").disabled = isFighting ? skipCombat : state.pendingLoot.length > 0;
}

function renderEnemies() {
  $("enemyList").innerHTML = zones[selectedZone].enemies.map((id) => {
    const enemy = getPreparedEncounter(id);
    const risk = riskFor(enemy);
    const ok = risk === "Machbar";
    const rarity = enemyRarity(enemy);
    return `<button class="enemy rarity-card rarity-${rarity} ${id === selectedEnemy ? "active" : ""}" type="button" data-enemy="${id}">
      <span><strong>${enemy.name}</strong><p><span class="quality-${rarity}">${rarityLabel[rarity]}</span> · Level ${enemy.level}${enemy.elite ? " · Elite" : ""} · ${enemy.xp} XP</p></span>
      <em class="risk ${ok ? "ok" : ""}">${risk}</em>
    </button>`;
  }).join("");

  document.querySelectorAll("[data-enemy]").forEach((button) => {
    button.addEventListener("click", () => {
      selectedEnemy = button.dataset.enemy;
      renderEnemies();
      renderSelectedEnemy();
    });
  });
}

function enemyRarity(enemy) {
  if (enemy.level >= 20) return "epic";
  if (enemy.elite || enemy.level >= 12) return "very-rare";
  if (enemy.level >= 6) return "rare";
  return "common";
}

function renderSelectedEnemy() {
  const enemy = getPreparedEncounter(selectedEnemy);
  $("selectedEnemyName").textContent = enemy.name;
  const eliteNote = enemy.eliteVariant
    ? "Bereit: Elite-Version."
    : enemy.elite
      ? "Elite-Gegner."
      : `Nach jedem Kampf ${Math.round(eliteEncounterChance * 100)}% Chance auf Elite-Version.`;
  $("selectedEnemyMeta").textContent = `Level ${enemy.level}, ${enemy.hp} Leben, Drop-Chancen niedrig, Risiko: ${riskFor(enemy)}. ${eliteNote}`;
  setBattleEnemyVisual(enemy);
  $("battleText").textContent = `${enemy.name} wartet.`;
}

function setBattleEnemyVisual(enemy) {
  $("enemySpriteName").textContent = enemy.name;
  $("enemySprite").className = `combatant enemy-sprite ${enemy.sprite}${enemy.eliteVariant ? " elite-variant" : ""}`;
}

function renderEquipment() {
  $("equipment").innerHTML = Object.entries(state.equipment).map(([slot, id]) => {
    const item = getItem(id);
    return `<div class="slot rarity-card rarity-${item.quality}">
      <strong>${slotLabel[slot]}</strong>
      <p class="quality-${item.quality}">${item.name} · ${qualityLabel[item.quality]} · +${item.upgrade || 0}</p>
      <p>+${item.damage} Schaden · +${item.defense} Verteidigung</p>
    </div>`;
  }).join("");
}

function renderSmith() {
  $("materials").innerHTML = Object.entries(materialLabel).map(([id, label]) =>
    `<div class="material"><span>${label}</span><strong>${state.materials[id] || 0}</strong></div>`
  ).join("");
  $("salvageAllBtn").disabled = !state.inventory.length;

  $("smithGrid").innerHTML = Object.entries(state.equipment).map(([slot, itemId]) => {
    const item = getItem(itemId);
    const cost = upgradeCost(item);
    const materialText = Object.entries(cost.materials)
      .filter(([, amount]) => amount > 0)
      .map(([id, amount]) => `${materialLabel[id]} ${state.materials[id] || 0}/${amount}`)
      .join(" · ");
    const maxed = (item.upgrade || 0) >= 5;
    return `<div class="smith-card rarity-card rarity-${item.quality}">
      <strong>${slotLabel[slot]} · <span class="quality-${item.quality}">${item.name}</span></strong>
      <p>Stufe +${item.upgrade || 0}/5 · +${item.damage} Schaden · +${item.defense} Verteidigung</p>
      <p>Kosten: ${cost.gold} Gold</p>
      <p>${materialText}</p>
      <button type="button" data-upgrade="${slot}" ${!canUpgrade(item) || maxed ? "disabled" : ""}>${maxed ? "Maximal" : "Verbessern"}</button>
    </div>`;
  }).join("");

  document.querySelectorAll("[data-upgrade]").forEach((button) => {
    button.addEventListener("click", () => upgradeEquipped(button.dataset.upgrade));
  });

  $("salvageList").innerHTML = state.inventory.length
    ? state.inventory.map((itemId, index) => {
        const item = getItem(itemId);
        const materials = Object.entries(salvageValue(item)).map(([id, amount]) => `${amount} ${materialLabel[id]}`).join(" · ");
        return `<div class="salvage-row rarity-card rarity-${item.quality}">
          <span><strong class="quality-${item.quality}">${item.name}</strong><small>${slotLabel[item.slot]} · ${qualityLabel[item.quality]} · ${materials}</small></span>
          <button type="button" data-salvage="${index}">Zerlegen</button>
        </div>`;
      }).join("")
    : `<div class="inventory-empty">Keine Items im Rucksack zum Zerlegen.</div>`;

  document.querySelectorAll("[data-salvage]").forEach((button) => {
    button.addEventListener("click", () => salvageInventoryItem(Number(button.dataset.salvage)));
  });
}

function renderInventory() {
  $("inventorySummary").innerHTML = `<span>Items: <strong>${state.inventory.length}</strong></span><span>Gold: <strong>${state.gold}</strong></span>`;
  $("sellAllBtn").disabled = !state.inventory.length;

  if (!state.inventory.length) {
    $("inventory").innerHTML = `<div class="inventory-empty">Noch keine Items im Inventar.</div>`;
    return;
  }

  $("inventory").innerHTML = state.inventory.map((itemId, index) => {
    const item = getItem(itemId);
    const current = getItem(state.equipment[item.slot]);
    const compare = compareLoot(item, current);
    return `<div class="inventory-item rarity-card rarity-${item.quality}">
      <strong class="quality-${item.quality}">${item.name}</strong>
      <p>${slotLabel[item.slot]} · ${qualityLabel[item.quality]} · Wert ${sellValue(item)} Gold</p>
      <p>+${item.damage} Schaden · +${item.defense} Verteidigung</p>
      <p class="${compare.powerClass}">${compare.powerText}</p>
      <div class="inventory-actions">
        <button type="button" data-equip="${index}">Ausrüsten</button>
        <button class="sell-button" type="button" data-sell="${index}">Verkaufen</button>
      </div>
    </div>`;
  }).join("");

  document.querySelectorAll("[data-equip]").forEach((button) => {
    button.addEventListener("click", () => equipInventoryItem(Number(button.dataset.equip)));
  });
  document.querySelectorAll("[data-sell]").forEach((button) => {
    button.addEventListener("click", () => sellInventoryItem(Number(button.dataset.sell)));
  });
}

function renderLootChoices() {
  const modal = $("lootModal");
  if (!state.pendingLoot.length) {
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
    $("lootChoices").innerHTML = "";
    return;
  }

  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
  const isQuestReward = state.pendingLoot.every((item) => item.sourceType === "quest");
  $("lootTitle").textContent = isQuestReward ? "Questbelohnung" : "Wähle ein Item";
  $("lootCounter").textContent = isQuestReward ? "Belohnung" : `1 von ${state.pendingLoot.length}`;
  $("lootChoices").innerHTML = state.pendingLoot.map((item, index) => {
    const current = getItem(state.equipment[item.slot]);
    const compare = compareLoot(item, current);
    const discovery = lootDiscoveryStatus(item);
    return `<div class="loot-card rarity-card rarity-${item.quality}">
      <strong class="quality-${item.quality}">${item.name}</strong>
      ${discovery ? `<span class="discovery-badge ${discovery.className}">${discovery.text}</span>` : ""}
      <p>${slotLabel[item.slot]} · ${qualityLabel[item.quality]}</p>
      <p>+${item.damage} Schaden · +${item.defense} Verteidigung</p>
      <p>Wert: ${sellValue(item)} Gold</p>
      <div class="loot-compare">
        <span class="${compare.powerClass}">${compare.powerText}</span>
        <span class="${compare.damageClass}">${compare.damageText}</span>
        <span class="${compare.defenseClass}">${compare.defenseText}</span>
      </div>
      <div class="loot-actions">
        <button type="button" data-loot="${index}">Ins Inventar</button>
        <button type="button" data-equip-loot="${index}">Ausrüsten</button>
      </div>
    </div>`;
  }).join("");

  document.querySelectorAll("[data-loot]").forEach((button) => {
    button.addEventListener("click", () => chooseLoot(Number(button.dataset.loot)));
  });
  document.querySelectorAll("[data-equip-loot]").forEach((button) => {
    button.addEventListener("click", () => chooseLoot(Number(button.dataset.equipLoot), true));
  });
}

function lootDiscoveryStatus(item) {
  if (item.sourceType === "quest") return { text: "Questbelohnung", className: "quest" };
  if (!item.sourceEnemy) return null;
  if (item.discoveryNew === true) return { text: "Neu entdeckt", className: "new" };
  const count = item.discoveryCount || 1;
  return { text: `Schon gefunden · ${count}x`, className: "known" };
}

function compareLoot(item, current) {
  const powerDiff = itemScore(item) - itemScore(current);
  const damageDiff = item.damage - current.damage;
  const defenseDiff = item.defense - current.defense;

  return {
    powerText: compareText("Gesamt", powerDiff, " Kraft"),
    powerClass: compareClass(powerDiff),
    damageText: compareText("Schaden", damageDiff, ""),
    damageClass: compareClass(damageDiff),
    defenseText: compareText("Verteidigung", defenseDiff, ""),
    defenseClass: compareClass(defenseDiff),
  };
}

function compareText(label, diff, suffix) {
  if (diff > 0) return `${label}: besser (+${diff.toFixed(diff % 1 ? 1 : 0)}${suffix})`;
  if (diff < 0) return `${label}: schlechter (${diff.toFixed(diff % 1 ? 1 : 0)}${suffix})`;
  return `${label}: gleich`;
}

function compareClass(diff) {
  if (diff > 0) return "compare-good";
  if (diff < 0) return "compare-bad";
  return "compare-even";
}

function renderQuests() {
  state.activeQuests = state.activeQuests.filter((id) => !state.completedQuests.includes(id));
  const active = state.activeQuests.map(getQuestById).filter(Boolean);

  if (!active.length) {
    $("quests").innerHTML = `<div class="inventory-empty">Keine aktive Quest. Öffne die Quest-Tafel.</div>`;
    return;
  }

  $("quests").innerHTML = active.map((quest) => {
    const value = Math.floor(state.quests[quest.id] || 0);
    const done = state.completedQuests.includes(quest.id);
    const rarity = quest.rarity || (quest.rare ? "epic" : "common");
    return `<div class="quest rarity-card rarity-${rarity} ${done ? "done" : ""}">
      <strong><span class="quality-${rarity}">${rarityLabel[rarity]}</span> · ${quest.name}</strong>
      <p>${quest.text}</p>
      <p>${done ? "Abgeschlossen" : `${value}/${quest.needed}`} · Belohnung: ${quest.rewardXp} XP, ${quest.rewardGold} Gold</p>
    </div>`;
  }).join("");
}

function renderQuestBoard() {
  state.questBoard = uniqueQuestIds(state.questBoard)
    .filter((id) => !state.completedQuests.includes(id))
    .filter((id) => getQuestById(id));
  const boardQuests = state.questBoard.map(getQuestById).filter(Boolean);

  if (!boardQuests.length) {
    $("questBoard").innerHTML = `<div class="inventory-empty">Die Tafel ist leer. Gewonnene Kämpfe bringen bald neue Aufträge.</div>`;
    return;
  }

  $("questBoard").innerHTML = boardQuests.map((quest) => {
    const active = isQuestActive(quest.id);
    const value = Math.floor(state.quests[quest.id] || 0);
    const progress = active ? `${value}/${quest.needed}` : "Noch nicht angenommen";
    const button = active
        ? `<button type="button" disabled>Angenommen</button>`
        : `<button type="button" data-accept-quest="${quest.id}">Quest annehmen</button>`;

    const rarity = quest.rarity || (quest.rare ? "epic" : "common");
    return `<div class="quest-offer rarity-card rarity-${rarity} ${active ? "active" : ""} ${quest.rare ? "rare" : ""}">
      <strong><span class="quality-${rarity}">${rarityLabel[rarity]}</span> · ${quest.name}</strong>
      <p>${quest.text}</p>
      <p>Status: ${progress}</p>
      <div class="reward-list">
        <span>Belohnung: ${quest.rewardXp} XP</span>
        <span>Gold: ${quest.rewardGold}</span>
        <span>Ruhm: 1</span>
        ${quest.rewardItem ? `<span>Item: ${quest.rare ? "episch" : "sehr selten"}</span>` : ""}
      </div>
      ${button}
    </div>`;
  }).join("");

  document.querySelectorAll("[data-accept-quest]").forEach((button) => {
    button.addEventListener("click", () => acceptQuest(button.dataset.acceptQuest));
  });
}

function acceptQuest(questId) {
  if (isQuestActive(questId) || state.completedQuests.includes(questId)) return;
  state.activeQuests.push(questId);
  state.quests[questId] = state.quests[questId] || 0;
  const quest = getQuestById(questId);
  log(`Quest angenommen: ${quest.name}.`, "drop");
  save();
  render();
}

function isQuestActive(questId) {
  return Array.isArray(state.activeQuests)
    ? state.activeQuests.includes(questId)
    : Boolean(state.quests?.[questId] || state.completedQuests.includes(questId));
}

function renderBestiary() {
  const entries = Object.entries(enemies);
  const detailEnemy = enemies[selectedBestiaryEnemy] || enemies.wolf;
  const fixedDrops = renderFixedDropRows(detailEnemy);
  const discoveredRows = renderDiscoveredLootRows(selectedBestiaryEnemy);

  $("bestiary").innerHTML = `<div class="bestiary-list">
    ${entries.map(([id, enemy]) => {
    const zoneName = zoneForEnemy(id);
    const completion = lootCompletion(id);
    return `<button class="bestiary-card ${id === selectedBestiaryEnemy ? "active" : ""}" type="button" data-bestiary="${id}">
      <strong>${enemy.name}</strong>
      <p>${zoneName} · Level ${enemy.level}${enemy.elite ? " · Elite" : ""}</p>
      <p>${enemy.hp} Leben · ${enemy.damage[0]}-${enemy.damage[1]} Schaden · ${enemy.defense} Rüstung</p>
      <p>Loot entdeckt: ${completion.found}/${completion.total} · ${completion.percent}%</p>
      <div class="completion-bar"><span style="width:${completion.percent}%"></span></div>
    </button>`;
  }).join("")}
  </div>
  <div class="bestiary-detail">
    <div class="detail-head">
      <div>
        <p class="eyebrow">${zoneForEnemy(selectedBestiaryEnemy)}</p>
        <h2>${detailEnemy.name}</h2>
      </div>
    </div>
    <p>Level ${detailEnemy.level}${detailEnemy.elite ? " · Elite" : ""} · ${detailEnemy.hp} Leben · ${detailEnemy.damage[0]}-${detailEnemy.damage[1]} Schaden · ${detailEnemy.defense} Rüstung</p>
    <h3>Feste seltene Drops</h3>
    <div class="drop-list">${fixedDrops}</div>
    <h3>Entdeckte Beute von diesem Gegner</h3>
    <div class="drop-list">${discoveredRows}</div>
    <p class="loot-note">Normale 3er-Beute erscheint nach jedem Sieg. Neue gefundene Items werden hier automatisch eingetragen.</p>
  </div>`;

  document.querySelectorAll("[data-bestiary]").forEach((button) => {
    button.addEventListener("click", () => {
      selectedBestiaryEnemy = button.dataset.bestiary;
      renderBestiary();
    });
  });

  attachFloatingTooltips();
}

function renderFixedDropRows(enemy) {
  return enemy.drops.length
    ? enemy.drops.map((drop) => {
        const item = getItem(drop.id);
        return `<div class="drop-row item-hover-row">
          <span class="quality-${item.quality}">${item.name}</span>
          <span>${formatChance(drop.chance)}</span>
          <template>${renderItemTooltip(item)}</template>
        </div>`;
      }).join("")
    : `<div class="drop-row"><span>Keine festen seltenen Drops</span><span>-</span></div>`;
}

function lootCompletion(enemyId) {
  const enemy = enemies[enemyId];
  const discovered = Object.keys(state.discoveredLoot[enemyId] || {}).length;
  const generatedPool = Object.values(lootNames).reduce((sum, byQuality) => {
    return sum + Object.values(byQuality).reduce((inner, names) => inner + names.length, 0);
  }, 0);
  const total = enemy.drops.length + generatedPool;
  const fixedFound = enemy.drops.filter((drop) => state.discoveredLoot[enemyId]?.[`fixed:${drop.id}`]).length;
  const generatedFound = Math.max(0, discovered - fixedFound);
  const found = Math.min(total, fixedFound + generatedFound);
  return {
    found,
    total,
    percent: Math.min(100, Math.round((found / total) * 100)),
  };
}

function renderDiscoveredLootRows(enemyId) {
  const discovered = Object.values(state.discoveredLoot[enemyId] || {});
  if (!discovered.length) {
    return `<div class="drop-row"><span>Noch nichts entdeckt</span><span>-</span></div>`;
  }

  return discovered
    .sort((a, b) => itemScore(b) - itemScore(a))
    .map((item) => `<div class="drop-row discovered-drop item-hover-row">
      <span><b class="quality-${item.quality}">${item.name}</b><small>${slotLabel[item.slot]} · +${item.damage} Schaden · +${item.defense} Vert.</small></span>
      <span>${qualityLabel[item.quality]} · x${item.count}</span>
      <template>${renderItemTooltip(item)}</template>
    </div>`)
    .join("");
}

function renderItemTooltip(item) {
  const current = getItem(state.equipment[item.slot]);
  const compare = compareLoot(item, current);
  return `<div class="item-tooltip">
    <strong class="quality-${item.quality}">${item.name}</strong>
    <span>${slotLabel[item.slot]} · ${qualityLabel[item.quality]}</span>
    <span>Schaden: ${item.damage} · Verteidigung: ${item.defense}</span>
    <span>Aktuell: ${current.name}</span>
    <span class="${compare.powerClass}">${compare.powerText}</span>
    <span class="${compare.damageClass}">${compare.damageText}</span>
    <span class="${compare.defenseClass}">${compare.defenseText}</span>
  </div>`;
}

function attachFloatingTooltips() {
  document.querySelectorAll(".item-hover-row").forEach((row) => {
    row.addEventListener("mouseenter", () => showFloatingTooltip(row));
    row.addEventListener("mousemove", (event) => positionFloatingTooltip(event));
    row.addEventListener("mouseleave", hideFloatingTooltip);
  });
}

function showFloatingTooltip(row) {
  const template = row.querySelector("template");
  if (!template) return;
  const tooltip = $("floatingTooltip");
  tooltip.innerHTML = template.innerHTML;
  tooltip.classList.add("open");
  tooltip.setAttribute("aria-hidden", "false");
}

function positionFloatingTooltip(event) {
  const tooltip = $("floatingTooltip");
  if (!tooltip.classList.contains("open")) return;

  const margin = 16;
  const offset = 18;
  const rect = tooltip.getBoundingClientRect();
  let left = event.clientX + offset;
  let top = event.clientY + offset;

  if (left + rect.width + margin > window.innerWidth) {
    left = event.clientX - rect.width - offset;
  }
  if (top + rect.height + margin > window.innerHeight) {
    top = event.clientY - rect.height - offset;
  }

  tooltip.style.left = `${Math.max(margin, left)}px`;
  tooltip.style.top = `${Math.max(margin, top)}px`;
}

function hideFloatingTooltip() {
  const tooltip = $("floatingTooltip");
  tooltip.classList.remove("open");
  tooltip.setAttribute("aria-hidden", "true");
}

function zoneKeyForEnemy(enemyId) {
  return Object.entries(zones).find(([, zone]) => zone.enemies.includes(enemyId))?.[0] || "meadow";
}

function zoneForEnemy(enemyId) {
  return zones[zoneKeyForEnemy(enemyId)].name;
}

function formatChance(chance) {
  return `${(chance * 100).toFixed(chance < 0.02 ? 1 : 0)}%`;
}

function renderLog() {
  $("log").innerHTML = state.log.map((entry, index) => {
    const type = entry.includes("Tod") ? "bad" : entry.includes("Seltener") || entry.includes("Quest") || entry.includes("ausgerüstet") ? "drop" : index === 0 ? "good" : "";
    return `<div class="${type}">${entry}</div>`;
  }).join("");
}

document.querySelectorAll("[data-zone]").forEach((button) => {
  button.addEventListener("click", () => {
    selectedZone = button.dataset.zone;
    selectedEnemy = zones[selectedZone].enemies[0];
    document.querySelectorAll("[data-zone]").forEach((zoneButton) => zoneButton.classList.toggle("active", zoneButton === button));
    render();
  });
});

$("fightBtn").addEventListener("click", () => {
  if (isFighting) {
    skipCombat = true;
    $("battleText").textContent = "Kampf wird übersprungen...";
    $("fightBtn").textContent = "Überspringe...";
    $("fightBtn").disabled = true;
    return;
  }

  fight();
});
$("restBtn").addEventListener("click", rest);
$("repairBtn").addEventListener("click", repair);
$("sellAllBtn").addEventListener("click", sellAllInventoryItems);
$("salvageAllBtn").addEventListener("click", salvageAllInventoryItems);
$("openBestiaryBtn").addEventListener("click", () => {
  openModal("bestiaryModal");
});
$("closeBestiaryBtn").addEventListener("click", closeBestiary);
$("bestiaryModal").addEventListener("click", (event) => {
  if (event.target.id === "bestiaryModal") closeBestiary();
});
$("openQuestBoardBtn").addEventListener("click", () => {
  openModal("questBoardModal");
});
$("closeQuestBoardBtn").addEventListener("click", closeQuestBoard);
$("questBoardModal").addEventListener("click", (event) => {
  if (event.target.id === "questBoardModal") closeQuestBoard();
});
$("openInventoryBtn").addEventListener("click", () => {
  openModal("inventoryModal");
});
$("closeInventoryBtn").addEventListener("click", closeInventory);
$("inventoryModal").addEventListener("click", (event) => {
  if (event.target.id === "inventoryModal") closeInventory();
});
$("openSmithBtn").addEventListener("click", () => {
  openModal("smithModal");
});
$("closeSmithBtn").addEventListener("click", closeSmith);
$("smithModal").addEventListener("click", (event) => {
  if (event.target.id === "smithModal") closeSmith();
});
$("resetBtn").addEventListener("click", () => {
  if (!confirm("Spielstand wirklich löschen?")) return;
  state = defaultState();
  selectedZone = "meadow";
  selectedEnemy = "wolf";
  save();
  render();
});

render();

function closeBestiary() {
  closeModal("bestiaryModal");
}

function closeQuestBoard() {
  closeModal("questBoardModal");
}

function closeInventory() {
  closeModal("inventoryModal");
}

function closeSmith() {
  closeModal("smithModal");
}

function openModal(id) {
  $(id).classList.add("open");
  $(id).setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
}

function closeModal(id) {
  $(id).classList.remove("open");
  $(id).setAttribute("aria-hidden", "true");
  const anyOpen = [...document.querySelectorAll(".modal-overlay")].some((modal) => modal.classList.contains("open"));
  document.body.classList.toggle("modal-open", anyOpen);
}

function setControlsDisabled(disabled) {
  document.querySelectorAll("button").forEach((button) => {
    if (button.id === "resetBtn") return;
    if (button.id === "fightBtn") return;
    if (button.id === "openBestiaryBtn") return;
    if (button.id === "closeBestiaryBtn") return;
    if (button.id === "openQuestBoardBtn") return;
    if (button.id === "closeQuestBoardBtn") return;
    if (button.id === "openInventoryBtn") return;
    if (button.id === "closeInventoryBtn") return;
    if (button.id === "openSmithBtn") return;
    if (button.id === "closeSmithBtn") return;
    if (button.dataset.loot !== undefined) return;
    if (button.dataset.equipLoot !== undefined) return;
    if (button.dataset.acceptQuest !== undefined) return;
    button.disabled = disabled;
  });
}

function waitCombat(ms) {
  if (skipCombat) return Promise.resolve();

  return new Promise((resolve) => {
    const started = performance.now();
    const timer = window.setInterval(() => {
      if (skipCombat || performance.now() - started >= ms) {
        window.clearInterval(timer);
        resolve();
      }
    }, 35);
  });
}

async function playCombatAnimation(enemy, events, playerWon) {
  const stage = $("battleStage");
  $("battleText").textContent = `${enemy.name} tritt vor.`;
  stage.classList.remove("victory", "defeat", "hero-attacks", "enemy-attacks", "hero-hit", "enemy-hit");
  await waitCombat(280);

  const visibleEvents = events.slice(0, 14);
  for (const event of visibleEvents) {
    if (skipCombat) break;
    const attackClass = event.actor === "hero" ? "hero-attacks enemy-hit" : "enemy-attacks hero-hit";
    const side = event.actor === "hero" ? "right" : "left";
    stage.className = `battle-stage ${attackClass}`;
    $("battleText").textContent = event.actor === "hero"
      ? `Du triffst für ${event.damage}.`
      : `${enemy.name} trifft für ${event.damage}.`;
    spawnDamage(event.damage, side);
    await waitCombat(470);
    stage.className = "battle-stage";
    await waitCombat(110);
  }

  if (!skipCombat && events.length > visibleEvents.length) {
    $("battleText").textContent = "Der Kampf zieht sich schwer und staubig hin.";
    await waitCombat(420);
  }

  stage.className = "battle-stage";
  stage.classList.add(playerWon ? "victory" : "defeat");
  $("battleText").textContent = playerWon ? "Sieg" : "Niederlage";
  await waitCombat(skipCombat ? 180 : 780);
}

function spawnDamage(amount, side) {
  const number = document.createElement("span");
  number.className = `damage-number ${side}`;
  number.textContent = `-${amount}`;
  $("battleStage").appendChild(number);
  window.setTimeout(() => number.remove(), 840);
}
