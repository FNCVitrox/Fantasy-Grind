// Beute: Item-Bewertung, Item-Effekte und Sets, Loot-Erzeugung und -Auswahl, Inventar, Verkaufen, Material-Drops.
// Wird vor core.js geladen; enthält nur Funktionen (Konstanten und Spielstand liegen in core.js).

function itemEffect(item) {
  const effect = itemEffectCatalog[item?.effect];
  if (!effect) return null;
  if (!effect.slots?.includes(item.slot)) return null;
  return { id: item.effect, ...effect };
}

function equippedItemEffects() {
  return equipmentSlots
    .map((slot) => getItem(state.equipment[slot]))
    .map(itemEffect)
    .filter(Boolean);
}

function itemEffectSummary(effects = equippedItemEffects()) {
  return effects.reduce((summary, effect) => {
    summary.bleedChance += effect.bleedChance || 0;
    summary.poisonChance += effect.poisonChance || 0;
    summary.firstHitReduction = Math.max(summary.firstHitReduction, effect.firstHitReduction || 0);
    summary.thornsRatio = Math.min(0.18, summary.thornsRatio + (effect.thornsRatio || 0));
    summary.durabilityReduction = Math.min(0.45, summary.durabilityReduction + (effect.durabilityReduction || 0));
    summary.goldBonus = Math.min(0.25, summary.goldBonus + (effect.goldBonus || 0));
    summary.eliteCritChance += effect.eliteCritChance || 0;
    summary.eliteDamageBonus = Math.min(0.25, summary.eliteDamageBonus + (effect.eliteDamageBonus || 0));
    summary.postCombatHeal += effect.postCombatHeal || 0;
    summary.critHealRatio = Math.min(0.08, summary.critHealRatio + (effect.critHealRatio || 0));
    summary.enemyCritReduction = Math.min(0.08, summary.enemyCritReduction + (effect.enemyCritReduction || 0));
    summary.eliteArmorIgnore = Math.max(summary.eliteArmorIgnore, effect.eliteArmorIgnore || 0);
    summary.firstHitWeaken = Math.min(summary.firstHitWeaken, effect.firstHitWeaken || 1);
    summary.critBurn = summary.critBurn || Boolean(effect.critBurn);
    summary.firstStrikeBonus = Math.min(0.22, summary.firstStrikeBonus + (effect.firstStrikeBonus || 0));
    summary.lootBonus = Math.min(0.16, summary.lootBonus + (effect.lootBonus || 0));
    summary.xpBonus = Math.min(0.24, summary.xpBonus + (effect.xpBonus || 0));
    return summary;
  }, {
    bleedChance: 0,
    poisonChance: 0,
    firstHitReduction: 0,
    thornsRatio: 0,
    durabilityReduction: 0,
    goldBonus: 0,
    eliteCritChance: 0,
    eliteDamageBonus: 0,
    postCombatHeal: 0,
    critHealRatio: 0,
    enemyCritReduction: 0,
    eliteArmorIgnore: 0,
    firstHitWeaken: 1,
    critBurn: false,
    firstStrikeBonus: 0,
    lootBonus: 0,
    xpBonus: 0,
  });
}

function combatStatsWithItemEffects(stats, enemy, summary = itemEffectSummary()) {
  if (!enemy?.elite && !enemy?.boss) return stats;
  return {
    ...stats,
    critChance: Math.min(0.75, stats.critChance + summary.eliteCritChance),
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
  equipmentSlots.forEach((slot) => {
    const item = getItem(state.equipment[slot]);
    if (!item) return;
    if (!item.set) return;
    counts[item.set] = counts[item.set] || { id: item.set, count: 0 };
    counts[item.set].count += 1;
  });
  return counts;
}

function itemScore(item) {
  return itemBasePowerScore(item)
    + itemEffectScore(item)
    + itemEnchantmentScore(item);
}

function itemBasePowerScore(item) {
  const durabilityFactor = Math.max(0.65, Math.min(1, (item.durability ?? 100) / 100));
  return (item.damage * 1.5
    + item.defense
    + (item.critChance || 0) * 90
    + (item.critDamage || 0) * 28) * durabilityFactor;
}

function itemBalanceBudget(item) {
  const qualityIndex = qualityRank(item.quality);
  const caps = itemStatCap(item.slot, item.quality, item.upgrade || 0);
  const critCaps = itemCritBudget(item.slot, qualityIndex);
  return caps.damage * 1.5
    + caps.defense
    + critCaps.critChance * 90
    + critCaps.critDamage * 28
    + itemEffectBudget(item.quality);
}

function qualityRank(quality) {
  return { common: 0, rare: 1, epic: 2, legendary: 3 }[quality] || 0;
}

function itemCritBudget(slot, qualityIndex) {
  if (!itemSlotRules(slot).critChance && !itemSlotRules(slot).critDamage) {
    return { critChance: 0, critDamage: 0 };
  }
  const chanceBudget = {
    weapon: [0.02, 0.05, 0.08, 0.12],
    necklace: [0.01, 0.03, 0.06, 0.09],
    ring: [0.02, 0.04, 0.07, 0.1],
  }[slot] || [0.01, 0.03, 0.06, 0.09];
  const damageBudget = {
    weapon: [0.04, 0.12, 0.2, 0.36],
    necklace: [0.06, 0.14, 0.24, 0.36],
    ring: [0.03, 0.1, 0.18, 0.28],
  }[slot] || [0.03, 0.1, 0.18, 0.28];
  return {
    critChance: chanceBudget[qualityIndex] || 0,
    critDamage: damageBudget[qualityIndex] || 0,
  };
}

function itemEffectBudget(quality) {
  return [0, 8, 16, 24][qualityRank(quality)] || 0;
}

function itemEnchantmentScore(item) {
  return activeItemEnchantments(item).reduce((score, enchantment) => {
    const stats = enchantment.stats || {};
    return score
      + (stats.damage || 0) * 1.5
      + (stats.defense || 0)
      + (stats.maxHp || 0) * 0.12
      + (stats.critChance || 0) * 90
      + (stats.critDamage || 0) * 28
      + (stats.bossDamage || 0) * 45
      + (stats.damageReduction || 0) * 70
      + (stats.lootBonus || 0) * 42
      + (stats.goldBonus || 0) * 20
      + (stats.xpBonus || 0) * 18;
  }, 0);
}

function itemEffectScore(item) {
  const effect = itemEffect(item);
  if (!effect) return 0;
  const score =
    (effect.bleedChance || 0) * 80
    + (effect.poisonChance || 0) * 70
    + (effect.firstHitReduction || 0) * 55
    + (effect.thornsRatio || 0) * 85
    + (effect.durabilityReduction || 0) * 60
    + (effect.goldBonus || 0) * 70
    + (effect.eliteCritChance || 0) * 100
    + (effect.eliteDamageBonus || 0) * 90
    + (effect.postCombatHeal || 0) * 90
    + (effect.critHealRatio || 0) * 260
    + (effect.enemyCritReduction || 0) * 140
    + (effect.eliteArmorIgnore || 0) * 75
    + (effect.firstHitWeaken < 1 ? (1 - effect.firstHitWeaken) * 60 : 0)
    + (effect.critBurn ? 10 : 0)
    + (effect.firstStrikeBonus || 0) * 75
    + (effect.lootBonus || 0) * 60
    + (effect.xpBonus || 0) * 45;
  return Math.max(5, Math.min(16, Number(score.toFixed(2))));
}

function createLootChoices(enemy, enemyId) {
  const choices = [generateLootItem(enemy, enemyId), generateLootItem(enemy, enemyId), generateLootItem(enemy, enemyId)];
  addFixedDropChoices(choices, enemy, enemyId);

  markLootDiscovery(enemyId, choices);
  queueLootBatch(choices);
}

function addFixedDropChoices(choices, enemy, enemyId) {
  const fixedDrops = fixedDropRolls(enemy, enemyId);
  updateBossDropPity(enemy, enemyId, fixedDrops);
  const availableIndexes = choices.map((_, index) => index);
  fixedDrops.forEach((drop) => {
    if (!availableIndexes.length) return;
    const specialItem = getItem(drop.id);
    if (!specialItem) return;
    const slotIndex = random(0, availableIndexes.length - 1);
    const choiceIndex = availableIndexes.splice(slotIndex, 1)[0];
    choices[choiceIndex] = {
      ...specialItem,
      id: drop.id,
      fixed: true,
      sourceEnemy: enemyId,
    };
    const logKey = drop.guaranteed ? "loot.guaranteedBossDropLog" : "loot.rareChoiceLog";
    const fallback = drop.guaranteed
      ? "Beutedruck garantiert Bossbeute: {item} ({quality})."
      : "Seltener Fund in der Beuteauswahl: {item} ({quality}).";
    log(() => t(logKey, fallback, {
      item: itemDisplayName(specialItem, drop.id),
      quality: labelFor(qualityLabel, specialItem.quality),
    }), "drop");
  });
}

function fixedDropRolls(enemy, enemyId) {
  const drops = enemy.drops || [];
  const fixedDrops = drops.filter((drop) => Math.random() <= drop.chance);
  if (!enemy?.boss || fixedDrops.length || !drops.length) return fixedDrops;
  const bossId = enemy.baseId || enemyId;
  if (!bossDropPityReady(bossId)) return fixedDrops;
  return [{ ...drops[random(0, drops.length - 1)], guaranteed: true }];
}

function queueLootBatch(items) {
  const equipmentItems = items.filter((item) => item && equipmentSlots.includes(item.slot));
  if (!equipmentItems.length) return;
  if (typeof fxLootRain === "function") fxLootRain(equipmentItems);
  if (typeof audioPlay === "function") {
    const rank = { common: 0, rare: 1, epic: 2, legendary: 3 };
    audioPlay("loot", equipmentItems.reduce((best, item) => (rank[item.quality] || 0) > (rank[best] || 0) ? item.quality : best, "common"));
  }
  if (state.pendingLoot.length) {
    state.lootQueue.push(equipmentItems);
  } else {
    state.pendingLoot = equipmentItems;
  }
  if (state.settings?.autoLoot) resolveAutoLoot();
}

// --- Einstellungen, Rucksack-Limit und Auto-Loot (Punkt 11) ---

function defaultSettings() {
  return { autoLoot: false, autoSellCommon: false, autoFarmRestPercent: 50, reducedEffects: false, muted: false, soundVolume: 35, musicVolume: 20, combatSpeed: 1 };
}

function normalizeSettings(settings) {
  const source = settings && typeof settings === "object" ? settings : {};
  const defaults = defaultSettings();
  const ranges = { autoFarmRestPercent: [10, 90], soundVolume: [0, 100], musicVolume: [0, 100] };
  return Object.fromEntries(Object.keys(defaults).map((key) => {
    if (key === "combatSpeed") {
      const speed = Number(source[key]);
      return [key, [1, 2, 4].includes(speed) ? speed : defaults[key]];
    }
    if (typeof defaults[key] === "number") {
      const value = Number(source[key]);
      const [min, max] = ranges[key] || [0, 100];
      return [key, Number.isFinite(value) && source[key] !== null && source[key] !== "" ? Math.min(max, Math.max(min, Math.round(value))) : defaults[key]];
    }
    return [key, typeof source[key] === "boolean" ? source[key] : defaults[key]];
  }));
}

// Setzt eine Einstellung aus dem Einstellungsfenster (Werte kommen als Text aus data-value).
// options.live: beim Ziehen eines Reglers nur Wert übernehmen, ohne das Fenster neu aufzubauen.
function setSettingValue(key, rawValue, options = {}) {
  state.settings = normalizeSettings(state.settings);
  if (!(key in state.settings)) return;
  const current = state.settings[key];
  const value = typeof current === "boolean" ? rawValue === true || rawValue === "true" : Number(rawValue);
  state.settings = normalizeSettings({ ...state.settings, [key]: value });
  if (key === "autoLoot" && state.settings.autoLoot && state.pendingLoot.length) resolveAutoLoot();
  if (typeof audioApplyVolumes === "function") audioApplyVolumes();
  if (options.live) {
    queueSave();
    return;
  }
  save();
  render();
}

function toggleSetting(key) {
  state.settings = normalizeSettings(state.settings);
  if (typeof state.settings[key] !== "boolean") return;
  state.settings[key] = !state.settings[key];
  if (key === "autoLoot" && state.settings.autoLoot && state.pendingLoot.length) resolveAutoLoot();
  save();
  render();
}

function normalizeInventoryCapacity(value) {
  const capacity = Number.isFinite(value) ? Math.floor(value) : inventoryBaseCapacity;
  const clamped = Math.min(inventoryMaxCapacity, Math.max(inventoryBaseCapacity, capacity));
  return inventoryBaseCapacity + Math.round((clamped - inventoryBaseCapacity) / inventoryExpandStep) * inventoryExpandStep;
}

function inventoryCapacity() {
  return normalizeInventoryCapacity(state.inventoryCapacity);
}

function isInventoryFull() {
  return (state.inventory || []).length >= inventoryCapacity();
}

// Wie viel besser ein Item im Vergleich zum aktuell getragenen Teil desselben Slots ist (positiv = Verbesserung).
function lootUpgradeDelta(item) {
  const current = getItem(state.equipment[itemSlot(item)]);
  return itemScore(item) - (current ? itemScore(current) : 0);
}

function autoLootPickIndex(choices) {
  let bestIndex = 0;
  choices.forEach((item, index) => {
    const best = choices[bestIndex];
    const delta = lootUpgradeDelta(item);
    const bestDelta = lootUpgradeDelta(best);
    if (delta > bestDelta || (delta === bestDelta && sellValue(item) > sellValue(best))) bestIndex = index;
  });
  return bestIndex;
}

// Nimmt aus jedem offenen Beute-Angebot das beste Item; Verbesserungen werden angelegt, der Rest wandert in den Rucksack.
// Wie beim manuellen Wählen verfallen die übrigen Angebote.
function resolveAutoLoot() {
  let guard = 0;
  while (state.pendingLoot.length && guard < 50) {
    guard += 1;
    const index = autoLootPickIndex(state.pendingLoot);
    const item = state.pendingLoot[index];
    chooseLoot(index, lootUpgradeDelta(item) > 0, { auto: true });
  }
}

// Sofort verkaufen statt einlagern (voller Rucksack oder Junk-Filter). Liefert das erhaltene Gold.
function sellLootDirectly(item) {
  const value = sellValue(item);
  state.gold += value;
  delete state.customItems[item.id];
  delete state.itemDurability[item.id];
  return value;
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
  const critStats = rollCritStats(slot, quality);

  return {
    id,
    name: lootPick.name,
    slot,
    quality,
    damage: stats.damage,
    defense: stats.defense,
    ...critStats,
    effect: rollItemEffect(slot, quality, enemy),
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

function rollItemEffect(slot, quality, enemy = null) {
  const chance = { common: 0, rare: 0.32, epic: 0.78, legendary: 1 }[quality] || 0;
  if (Math.random() > chance) return null;
  const pool = itemEffectPool(slot, quality, enemy);
  if (!pool.length) return null;
  return pool[random(0, pool.length - 1)];
}

function itemEffectPool(slot, quality, enemy = null) {
  const pool = [];
  if (slot === "weapon") pool.push("bleedEdge", "venomEdge", "rendEdge", "huntingMark", "openingCut");
  if (["offhand", "chest"].includes(slot)) pool.push("guardBlock", "unbrokenOath", "thornGuard", "steadfastWard", "ironWard");
  if (slot === "pants") pool.push("unbrokenOath", "thornGuard", "steadfastWard", "ironWard");
  if (["pants", "boots"].includes(slot)) pool.push("steadyStep");
  if (slot === "boots") pool.push("wardedTread");
  if (["boots", "ring", "necklace"].includes(slot)) pool.push("luckyPouch", "pilgrimPace", "scavengerCharm");
  if (["ring", "necklace"].includes(slot)) pool.push("eliteHunter", "trophyHunter", "echoHeal", "soulAnchor", "mendersThread", "huntingMark", "openingCut", "battleLesson");

  if (quality === "epic" || quality === "legendary") {
    if (["weapon", "ring", "necklace"].includes(slot)) pool.push("duelistMark", "lifeSiphon");
    if (["weapon", "necklace"].includes(slot)) pool.push("ashTempo");
    if (["ring", "necklace"].includes(slot)) pool.push("revenantSeal");
    if (slot === "offhand") pool.push("soulAnchor");
  }

  if (enemy?.boss || quality === "legendary") {
    if (["weapon", "ring", "necklace"].includes(slot)) pool.push("crownBurn");
    if (["weapon", "offhand"].includes(slot)) pool.push("oathBreaker");
    if (["offhand", "ring", "necklace"].includes(slot)) pool.push("graveCurse");
  }

  if (enemy?.tags?.dungeon && ["offhand", "ring", "necklace"].includes(slot)) pool.push("graveCurse", "chainSnare");
  if (enemy?.tags?.elite && ["ring", "necklace"].includes(slot)) pool.push("eliteHunter");
  return pool.filter((id) => itemEffectCatalog[id]?.slots?.includes(slot));
}

function rollSlotStats(slot, base, power) {
  const profiles = {
    weapon: [1.35, 0],
    offhand: [0.4, 0.85],
    chest: [0, 1.45],
    pants: [0, 0.98],
    boots: [0, 0.78],
    necklace: [0.78, 0],
    ring: [0.62, 0],
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
  ui.bestiaryListDirty = true;
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
      critChance: bestItem.critChance || 0,
      critDamage: bestItem.critDamage || 0,
      effect: bestItem.effect || null,
      set: bestItem.set,
      fixed: bestItem.fixed,
      count: (existing?.count || 0) + 1,
    };
  });
  pruneBestiaryLoot(enemyId);
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
  const progressionBonus = Math.min(0.08, equippedEnchantmentSummary().lootBonus || 0);
  const itemBonus = Math.min(0.06, itemEffectSummary().lootBonus || 0);
  const bonus = eliteBonus + dungeonBonus + Math.min(0.025, enemy.level * 0.0013) + progressionBonus + itemBonus;

  if (roll > 0.996 - bonus) return "legendary";
  if (roll > 0.965 - bonus) return "epic";
  if (roll > 0.82 - bonus) return "rare";
  return "common";
}

function chooseLoot(index, equipNow = false, options = {}) {
  if (!state.pendingLoot[index]) return;
  const item = state.pendingLoot[index];
  const sellInstead = !equipNow && (isInventoryFull() || (state.settings?.autoSellCommon && itemQuality(item) === "common"));
  const sourceEnemy = item.sourceEnemy;
  if (!item.fixed) {
    state.customItems[item.id] = item;
  }
  if (sourceEnemy) {
    recordDiscoveredLoot(sourceEnemy, [item]);
  }
  setItemDurability(item.id, item.durability ?? 100);
  if (equipNow) {
    const previousId = state.equipment[item.slot];
    state.equipment[item.slot] = item.id;
    if (previousId && options.auto && isInventoryFull()) {
      // Auto-Loot bei vollem Rucksack: das ersetzte (schlechtere) Teil wird verkauft statt das Limit zu sprengen.
      const previous = getItem(previousId);
      const gold = previous ? sellValue(previous) : 0;
      state.gold += gold;
      delete state.customItems[previousId];
      delete state.itemDurability[previousId];
      log(() => t("loot.autoSoldReplacedLog", "Rucksack voll: ersetztes Teil {item} verkauft, +{gold} Gold.", { item: previous ? itemDisplayName(previous, previousId) : "?", gold }), "drop");
    } else if (previousId) {
      state.inventory.push(previousId);
    }
    log(() => t(options.auto ? "loot.autoEquippedLog" : "loot.chosenEquippedLog", "{item} gewählt und direkt ausgerüstet.", { item: itemDisplayName(item, item.id) }), "drop");
  } else if (sellInstead) {
    const gold = sellLootDirectly(item);
    const reasonKey = isInventoryFull() ? "loot.autoSoldFullLog" : "loot.autoSoldJunkLog";
    log(() => t(reasonKey, "{item} verkauft: +{gold} Gold.", { item: itemDisplayName(item, item.id), gold }), "drop");
  } else {
    state.inventory.push(item.id);
    log(() => t(options.auto ? "loot.autoInventoryLog" : "loot.chosenInventoryLog", "{item} gewählt und ins Inventar gelegt.", { item: itemDisplayName(item, item.id) }), "drop");
  }
  if (["epic", "legendary"].includes(itemQuality(item))) {
    remindSaveBackup(() => t("save.backupLootReason", "du hast {quality}e Beute erhalten.", { quality: labelFor(qualityLabel, itemQuality(item)) }));
  }
  notifyReadyAchievements();
  advanceLootQueue();
  if (options.auto) return;
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

  log(() => t("inventory.equipLog", "{item} ausgerüstet. {previous} liegt jetzt im Inventar.", {
    item: itemDisplayName(item, itemId),
    previous: previousId ? itemDisplayName(getItem(previousId), previousId) : t("inventory.oldItem", "Altes Teil"),
  }), "drop");
  save();
  render();
}

function sellInventoryItem(index) {
  const itemId = state.inventory[index];
  const item = getItem(itemId);
  if (!item) return;
  if (isInventoryItemLocked(itemId)) {
    log(() => t("merchant.lockedItemLog", "{item} ist geschützt und wird nicht verkauft.", { item: itemDisplayName(item, itemId) }), "bad");
    return;
  }

  const value = sellValue(item);
  state.inventory.splice(index, 1);
  unlockInventoryItem(itemId);
  delete state.itemDurability[itemId];
  state.gold += value;
  log(() => t("merchant.sellItemLog", "Tilda Münzhand kauft {item}. +{gold} Gold.", { item: itemDisplayName(item, itemId), gold: value }), "drop");
  save();
  render();
}

function sellAllInventoryItems() {
  if (!state.inventory.length) return;
  const total = inventorySellTotal();
  const soldItems = state.inventory.filter((itemId) => !isInventoryItemLocked(itemId));
  if (!soldItems.length) return;
  const count = soldItems.length;
  soldItems.forEach((itemId) => {
    delete state.itemDurability[itemId];
    unlockInventoryItem(itemId);
  });
  state.inventory = state.inventory.filter((itemId) => isInventoryItemLocked(itemId));
  state.gold += total;
  log(() => t("merchant.sellAllLog", "Tilda Münzhand kauft {count} Items. +{gold} Gold.", { count, gold: total }), "drop");
  save();
  render();
}

function inventorySellTotal() {
  return state.inventory.reduce((sum, itemId) => {
    const item = getItem(itemId);
    return item && !isInventoryItemLocked(itemId) ? sum + sellValue(item) : sum;
  }, 0);
}

function isInventoryItemLocked(itemId) {
  return (state.lockedItems || []).includes(itemId);
}

function lockInventoryItem(itemId) {
  state.lockedItems = [...new Set([...(state.lockedItems || []), itemId])];
}

function unlockInventoryItem(itemId) {
  state.lockedItems = (state.lockedItems || []).filter((id) => id !== itemId);
}

function toggleInventoryItemLock(index) {
  const itemId = state.inventory[index];
  const item = getItem(itemId);
  if (!item) return;
  if (isInventoryItemLocked(itemId)) {
    unlockInventoryItem(itemId);
    log(() => t("merchant.unlockItemLog", "{item} ist nicht mehr geschützt.", { item: itemDisplayName(item, itemId) }), "drop");
  } else {
    lockInventoryItem(itemId);
    log(() => t("merchant.lockItemLog", "{item} ist vor Verkauf geschützt.", { item: itemDisplayName(item, itemId) }), "drop");
  }
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

function materialAmountsText(amounts) {
  return Object.entries(amounts || {}).map(([id, amount]) => `${amount} ${labelFor(materialLabel, id)}`).join(", ");
}

function grantMaterials(enemyId, eliteBonus = false) {
  const drops = materialDrops[enemyId] || [];
  const gained = {};
  drops.forEach((drop) => {
    const amount = Math.max(0, random(drop.min, drop.max) + (eliteBonus && Math.random() < 0.65 ? 1 : 0) - (Math.random() < 0.22 ? 1 : 0));
    if (amount <= 0) return;
    state.materials[drop.id] = (state.materials[drop.id] || 0) + amount;
    gained[drop.id] = (gained[drop.id] || 0) + amount;
  });
  if (Object.keys(gained).length) {
    log(() => t("material.foundLog", "Material gefunden: {materials}.", { materials: materialAmountsText(gained) }), "drop");
  }
}
