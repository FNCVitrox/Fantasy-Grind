// Arkanistin (Mira): Verzauberungs-Slots, Verzauberungen, Kosten und arkane Meisteraufträge.
// Wird vor core.js geladen; enthält nur Funktionen (Konstanten und Spielstand liegen in core.js).

function enchantmentsUnlocked() {
  return state.level >= 8;
}

function maxEnchantSlotsForLevel(level = state.level) {
  if (level < 8) return 0;
  return currentEnchantSlotLimit();
}

function currentEnchantSlotLimit() {
  if (!enchantmentsUnlocked()) return 0;
  const completed = state.enchanting?.completed || [];
  if (completed.includes("forbiddenLibrary")) return 3;
  if (completed.includes("unstableRunes")) return 2;
  return 1;
}

function arcaneMasteryUnlocked() {
  return Boolean(state.enchanting?.completed?.includes("voidRitual"));
}

function allowedEnchantRarities() {
  if (arcaneMasteryUnlocked()) return ["common", "rare", "epic", "arcane"];
  if (state.enchanting?.completed?.includes("forbiddenLibrary")) return ["common", "rare", "epic"];
  if (state.enchanting?.completed?.includes("unstableRunes")) return ["common", "rare"];
  return ["common"];
}

function savedItemEnchantments(item) {
  if (!item?.enchantments?.length) return [];
  return item.enchantments
    .map((id) => enchantmentCatalog[id] ? { ...enchantmentCatalog[id], id } : null)
    .filter((enchantment) => enchantment && enchantment.slots.includes(item.slot));
}

function activeEnchantSlotLimit() {
  if (typeof state === "undefined" || !state) return 3;
  return maxEnchantSlotsForLevel();
}

function activeItemEnchantments(item) {
  return savedItemEnchantments(item).slice(0, activeEnchantSlotLimit());
}

function inactiveItemEnchantments(item) {
  return savedItemEnchantments(item).slice(activeEnchantSlotLimit());
}

function equippedEnchantmentSummary() {
  const summary = equipmentSlots
    .map((slot) => getItem(state.equipment[slot]))
    .flatMap(activeItemEnchantments)
    .reduce((summary, enchantment) => addEnchantmentStats(summary, enchantment.stats), emptyEnchantmentSummary());
  return clampEnchantmentSummary(summary);
}

function emptyEnchantmentSummary() {
  return {
    damage: 0,
    defense: 0,
    maxHp: 0,
    critChance: 0,
    critDamage: 0,
    bossDamage: 0,
    damageReduction: 0,
    lowHpShield: 0,
    goldBonus: 0,
    xpBonus: 0,
    lootBonus: 0,
    durabilityReduction: 0,
  };
}

function addEnchantmentStats(summary, stats = {}) {
  Object.keys(summary).forEach((key) => {
    summary[key] += stats[key] || 0;
  });
  return summary;
}

function clampEnchantmentSummary(summary) {
  const limits = {
    damage: [-10, 35],
    defense: [-12, 45],
    maxHp: [-80, 260],
    critChance: [0, 0.18],
    critDamage: [-0.18, 0.45],
    bossDamage: [0, 0.24],
    damageReduction: [0, 0.24],
    lowHpShield: [0, 0.25],
    goldBonus: [0, 0.35],
    xpBonus: [0, 0.35],
    lootBonus: [0, 0.24],
    durabilityReduction: [0, 0.35],
  };
  Object.entries(limits).forEach(([key, [min, max]]) => {
    summary[key] = Math.max(min, Math.min(max, summary[key] || 0));
  });
  return summary;
}

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
    { label: `${t("common.level", "Level")} ${requirement.level}`, done: state.level >= (requirement.level || 1) },
    { label: `${requirement.renown} ${t("common.renown", "Ruhm")}`, done: state.renown >= (requirement.renown || 0) },
    ...(requirement.enchantedItem ? [{ label: t("mastery.req.enchantedItem", "ein verzaubertes ausgerüstetes Item"), done: hasEnchantedEquippedItem() }] : []),
    ...(requirement.bossKills ? [{ label: t("mastery.req.bossKills", "{count} Dungeon-Bosse besiegt", { count: requirement.bossKills }), done: (state.combatStats?.bossKills || 0) >= requirement.bossKills }] : []),
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
    log(() => t("enchant.masteryBlockedLog", "Mira Nachtfaden lächelt spitz: Erst die Prüfung, dann das Ritual."), "bad");
    return;
  }
  state.enchanting.discovered = true;
  state.enchanting.active = rank.id;
  state.enchanting.progress[rank.id] = { eliteKills: 0, bossKills: 0 };
  log(() => t("enchant.masteryStartLog", "Arkaner Auftrag begonnen: {name}.", { name: enchantMasteryName(rank) }), "drop");
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
    objectives.push({ label: t("mastery.obj.elites", "Elite-Gegner"), value: progress.eliteKills || 0, needed: rank.progress.eliteKills });
  }
  if (rank.progress?.bossKills) {
    objectives.push({ label: t("mastery.obj.bosses", "Dungeon-Bosse"), value: progress.bossKills || 0, needed: rank.progress.bossKills });
  }
  Object.entries(rank.materials || {}).forEach(([id, needed]) => {
    objectives.push({ label: labelFor(materialLabel, id), value: state.materials[id] || 0, needed });
  });
  objectives.push({ label: "Gold", value: state.gold, needed: rank.gold });
  if (rank.sacrificeQuality) {
    objectives.push({ label: t(`mastery.obj.sacrifice.${rank.sacrificeQuality}`, `Opferstück (${labelFor(qualityLabel, rank.sacrificeQuality)})`), value: findEnchantSacrificeItemId(rank.sacrificeQuality) ? 1 : 0, needed: 1 });
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
    log(() => t("enchant.masteryIncompleteLog", "Mira Nachtfaden tippt auf den Runenkreis. Er bleibt kalt."), "bad");
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
  log(() => t("enchant.masteryCompleteLog", "Mira vollendet \"{name}\". {reward} +{renown} Ruhm.", {
    name: enchantMasteryName(rank),
    reward: enchantMasteryReward(rank),
    renown: rank.rewardRenown,
  }), "drop");
  remindSaveBackup(() => t("save.backupEnchantReason", "Mira hat deine Runenbindung erweitert."));
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

function findEnchantSacrificeItemId(quality) {
  const neededPower = qualityPower[quality] || 0;
  return state.inventory.find((itemId) => {
    const item = getItem(itemId);
    return item && (qualityPower[item.quality] || 0) >= neededPower;
  });
}

function removeEnchantSacrificeItem(quality) {
  const itemId = findEnchantSacrificeItemId(quality);
  if (!itemId) return;
  state.inventory = state.inventory.filter((id) => id !== itemId);
  delete state.customItems[itemId];
  delete state.itemDurability[itemId];
}

function enchantCost() {
  const slotLimit = maxEnchantSlotsForLevel();
  const rarityRank = currentEnchantRarityRank();
  const materials = {
    shard: 2 + slotLimit + rarityRank * 2,
    moonDust: 1 + rarityRank,
  };
  if (rarityRank >= 2) materials.emberCore = 1;
  if (rarityRank >= 3) materials.crownAsh = 1;
  return {
    gold: [90, 180, 320, 560][rarityRank] + slotLimit * 25,
    materials,
  };
}

function currentEnchantRarityRank() {
  return allowedEnchantRarities().reduce((highest, rarity) => Math.max(highest, enchantRarityRank(rarity)), 0);
}

function enchantRarityRank(rarity) {
  return { common: 0, rare: 1, epic: 2, arcane: 3 }[rarity] || 0;
}

function enchantmentPool(slot, category, item = null) {
  const allowedRarities = allowedEnchantRarities();
  const usedGroups = new Set(savedItemEnchantments(item).map((enchantment) => enchantment.group));
  return Object.entries(enchantmentCatalog)
    .filter(([, enchantment]) => enchantment.category === category)
    .filter(([, enchantment]) => enchantment.slots.includes(slot))
    .filter(([, enchantment]) => allowedRarities.includes(enchantment.rarity))
    .filter(([, enchantment]) => !usedGroups.has(enchantment.group))
    .map(([id]) => id);
}

function rollEnchantment(slot, category, item) {
  const pool = enchantmentPool(slot, category, item);
  if (!pool.length) return null;
  const weighted = pool.flatMap((id) => {
    const rarity = enchantmentCatalog[id].rarity;
    const weight = rarity === "arcane" ? 1 : rarity === "epic" ? 2 : rarity === "rare" ? 4 : 7;
    return Array.from({ length: weight }, () => id);
  });
  return weighted[random(0, weighted.length - 1)];
}

function enchantEquipped(slot, category) {
  if (!enchantmentsUnlocked()) {
    log(() => t("enchant.tooLowLog", "Mira Nachtfaden erscheint erst, wenn du erfahren genug bist."), "bad");
    return;
  }
  const item = ensureCustomEquippedItem(slot);
  if (!item) return;
  const limit = maxEnchantSlotsForLevel();
  if (savedItemEnchantments(item).length >= limit) {
    log(() => t("enchant.noSlotLog", "{item} hat aktuell keinen freien Verzauberungs-Slot.", { item: itemDisplayName(item, state.equipment[slot]) }), "bad");
    return;
  }
  const cost = enchantCost();
  if (!canPayCost(cost)) {
    log(() => t("enchant.costMissingLog", "Mira Nachtfaden braucht mehr Gold, Runensplitter oder Mondstaub."), "bad");
    return;
  }
  const enchantmentId = rollEnchantment(item.slot, category, item);
  const enchantment = enchantmentCatalog[enchantmentId];
  if (!enchantment) {
    log(() => t("enchant.noRuneForItemLog", "Für dieses Item passt in dieser Kategorie keine freie Verzauberung."), "bad");
    return;
  }
  spendCost(cost);
  item.enchantments = [...(item.enchantments || []), enchantmentId];
  state.combatStats = normalizeCombatStats(state.combatStats);
  state.combatStats.itemsEnchanted += 1;
  if (enchantRarityRank(enchantment.rarity) >= enchantRarityRank("rare")) {
    state.combatStats.rareEnchantments += 1;
  }
  log(() => t("enchant.successLog", "{item} verzaubert: {enchantment}.", {
    item: itemDisplayName(item, state.equipment[slot]),
    enchantment: enchantmentDisplayName(enchantment, enchantmentId),
  }), "drop");
  notifyReadyAchievements();
  save();
  render();
}
