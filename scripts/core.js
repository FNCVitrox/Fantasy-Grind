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
let combatWatchdog = 0;
const tooltipItemCache = new Map();
const bestiaryLootCache = new Map();

const elementCache = new Map();
const $ = (id) => {
  if (!elementCache.has(id)) {
    elementCache.set(id, document.getElementById(id));
  }
  return elementCache.get(id);
};
const random = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const eliteEncounterChance = 0.09;
const maxBestiaryLootPerEnemy = 15;
const generatedLootPoolSize = maxBestiaryLootPerEnemy;
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
    migrateEquipmentSlots(loaded);
    loaded.itemDurability = loaded.itemDurability || {};
    loaded.materials = { ...defaultState().materials, ...(loaded.materials || {}) };
    loaded.questBoard = Array.isArray(loaded.questBoard) ? loaded.questBoard : ["wolves", "rust", "elites"];
    loaded.rareQuests = loaded.rareQuests || {};
    loaded.winsSinceQuestRefresh = loaded.winsSinceQuestRefresh || 0;
    return loaded;
  } catch {
    return defaultState();
  }
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
  normalizeItemQuality(item);
  return item;
}

function normalizeItemQuality(item) {
  if (!item) return item;
  if (item.quality === "very-rare") item.quality = "epic";
  const baseName = item.name?.replace(/\s\+\d+$/, "");
  const legendaryNames = new Set(Object.values(lootNames).flatMap((byQuality) => byQuality.legendary || []));
  if (item.quality === "epic" && (legendaryNames.has(baseName) || ["ashenGreatsword", "crownShard"].includes(item.id))) {
    item.quality = "legendary";
  }
  return item;
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
  const item = state.customItems[itemId] || items[itemId];
  return normalizeItemSlot(item);
}

function totalStats() {
  const equipped = Object.values(state.equipment)
    .map((id) => [id, getItem(id)])
    .filter(([, item]) => item);
  const itemDamage = equipped.reduce((sum, [id, item]) => sum + Math.floor(item.damage * itemDurabilityFactor(id)), 0);
  const itemDefense = equipped.reduce((sum, [id, item]) => sum + Math.floor(item.defense * itemDurabilityFactor(id)), 0);
  const setStats = activeSetBonusStats();
  return {
    damage: Math.floor(8 + state.level * 3 + itemDamage + setStats.damage),
    defense: Math.floor(3 + state.level * 2 + itemDefense + setStats.defense),
    maxHp: 92 + state.level * 8 + setStats.maxHp,
  };
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
  Object.values(state.equipment).map(getItem).filter(Boolean).forEach((item) => {
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
  return 0.55 + durability * 0.0045;
}

function equippedDurabilityAverage() {
  const ids = Object.values(state.equipment).filter((id) => getItem(id));
  if (!ids.length) return 100;
  return Math.round(ids.reduce((sum, id) => sum + itemDurability(id), 0) / ids.length);
}

function slotWearMultiplier(slot) {
  return {
    weapon: 1.2,
    offhand: 1.05,
    chest: 1.45,
    pants: 1.05,
    boots: 0.9,
    necklace: 0.55,
    ring: 0.5,
  }[slot] || 1;
}

function repairSlotMultiplier(slot) {
  return {
    weapon: 1.2,
    offhand: 1.05,
    chest: 1.55,
    pants: 1.15,
    boots: 0.95,
    necklace: 0.75,
    ring: 0.7,
  }[slot] || 1;
}

function damageEquippedItems(enemy, extraLoss = 0) {
  const broken = [];
  equipmentSlots.forEach((slot) => {
    const itemId = state.equipment[slot];
    const item = getItem(itemId);
    if (!item) return;
    const baseLoss = random(1, enemy.elite ? 5 : 3) + extraLoss;
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
  armCombatWatchdog(25000);
  try {
    await playCombatAnimation(enemy, events, playerHp > 0);

    damageEquippedItems(enemy);

    if (playerHp > 0) {
      state.hp = Math.max(1, playerHp);
      const gold = random(enemy.gold[0], enemy.gold[1]);
      state.gold += gold;
      gainXp(enemy.xp);
      grantMaterials(enemy.baseId || selectedEnemy, enemy.eliteVariant);
      createLootChoices(enemy, enemy.baseId || selectedEnemy);
      updateQuestProgress(enemy);
      maybeDropRareQuest(enemy);
      refreshQuestBoard(false);
      log(`Sieg gegen ${enemy.name} nach ${rounds} Runden. +${enemy.xp} XP, +${gold} Gold.`, "good");
    } else {
      const xpLoss = Math.min(state.xp, Math.ceil(xpForLevel(state.level) * 0.06));
      const goldLoss = Math.min(state.gold, Math.ceil(10 + state.level * 4));
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
  const quality = quest.rare ? "legendary" : "epic";
  const slot = quest.slot || lootSlots[random(0, lootSlots.length - 1)];
  const base = Math.max(6, Math.floor(quest.rewardXp / 80) + state.level);
  const power = qualityPower[quality];
  const namePool = lootNames[slot][quality];
  const stats = rollSlotStats(slot, base, power);

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
  const slot = lootSlots[random(0, lootSlots.length - 1)];
  const quality = rollQuality(enemy);
  const base = Math.max(1, enemy.level + random(-1, 2));
  const power = qualityPower[quality];
  const namePool = lootNames[slot][quality];
  const id = `loot-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const stats = rollSlotStats(slot, base, power);

  return {
    id,
    name: namePool[random(0, namePool.length - 1)],
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

function rollSlotStats(slot, base, power) {
  const profiles = {
    weapon: [1.65, 0],
    offhand: [0.55, 1.05],
    chest: [0, 1.85],
    pants: [0.15, 1.25],
    boots: [0.25, 0.85],
    necklace: [0.75, 0.45],
    ring: [0.55, 0.65],
  };
  const [damageScale, defenseScale] = profiles[slot] || profiles.ring;
  return {
    damage: damageScale ? Math.max(1, Math.floor(base * damageScale * power + random(0, 2))) : 0,
    defense: defenseScale ? Math.max(1, Math.floor(base * defenseScale * power + random(0, 3))) : 0,
  };
}

function rollItemSet(enemy, quality) {
  const chance = quality === "legendary" ? 0.75 : quality === "epic" ? 0.45 : quality === "rare" ? 0.22 : 0.05;
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
  const eliteBonus = enemy.elite ? 0.04 : 0;
  const dungeonBonus = enemy.tags.dungeon ? 0.025 : 0;
  const bonus = eliteBonus + dungeonBonus + Math.min(0.04, enemy.level * 0.002);

  if (roll > 0.992 - bonus) return "legendary";
  if (roll > 0.94 - bonus) return "epic";
  if (roll > 0.72 - bonus) return "rare";
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
    common: 6,
    rare: 18,
    epic: 45,
    legendary: 120,
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
  const qualityMultiplier = { common: 1, rare: 2, epic: 3, legendary: 5 }[item.quality];
  const slotMaterial = primaryMaterialForSlot(item.slot);
  return {
    gold: Math.floor(18 * qualityMultiplier * (level + 1)),
    materials: {
      [slotMaterial]: 2 + level * qualityMultiplier,
      hide: ["chest", "pants", "boots"].includes(item.slot) ? 1 + level : 0,
      shard: item.quality === "legendary" ? 1 + level : 0,
    },
  };
}

function primaryMaterialForSlot(slot) {
  if (slot === "weapon" || slot === "offhand") return "fang";
  if (["chest", "pants", "boots"].includes(slot)) return "iron";
  return "shard";
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
  if (slot === "offhand") {
    upgraded.damage += 1 + Math.floor(upgraded.upgrade / 2);
    upgraded.defense += 2 + upgraded.upgrade;
  }
  if (slot === "chest") upgraded.defense += 3 + upgraded.upgrade;
  if (slot === "pants" || slot === "boots") upgraded.defense += 2 + upgraded.upgrade;
  if (slot === "necklace" || slot === "ring") {
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
  const qualityAmount = { common: 1, rare: 3, epic: 6, legendary: 10 }[item.quality];
  const upgradeBonus = item.upgrade || 0;
  const result = {};
  if (item.slot === "weapon" || item.slot === "offhand") {
    result.fang = qualityAmount + upgradeBonus;
    result.iron = Math.max(1, Math.floor(qualityAmount / 2));
  } else if (["chest", "pants", "boots"].includes(item.slot)) {
    result.iron = qualityAmount + upgradeBonus;
    result.hide = Math.max(1, Math.floor(qualityAmount / 2));
  } else {
    result.shard = qualityAmount + upgradeBonus;
    result.fang = Math.max(1, Math.floor(qualityAmount / 3));
  }
  if (item.quality === "legendary") {
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
  delete state.itemDurability[itemId];
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

  state.inventory.forEach((itemId) => delete state.itemDurability[itemId]);
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
  return equipmentSlots.reduce((sum, slot) => sum + repairCostForSlot(slot), 0);
}

function repairCostForSlot(slot) {
  const itemId = state.equipment[slot];
  const item = getItem(itemId);
  if (!item) return 0;
  const missing = 100 - itemDurability(itemId);
  if (!missing) return 0;
  const qualityMultiplier = { common: 1, rare: 1.6, epic: 2.35, legendary: 3.4 }[item.quality] || 1;
  const upgradeMultiplier = 1 + (item.upgrade || 0) * 0.18;
  return Math.ceil(missing * repairSlotMultiplier(slot) * qualityMultiplier * upgradeMultiplier * (0.6 + state.level * 0.035));
}

