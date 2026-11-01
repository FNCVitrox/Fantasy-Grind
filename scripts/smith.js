// Schmied (Borin): Haltbarkeit, Reparatur, Upgrades, Zerlegen, Kosten und Schmied-Meisteraufträge.
// Wird vor core.js geladen; enthält nur Funktionen (Konstanten und Spielstand liegen in core.js).

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
    log(() => t("equipment.brokenLog", "{item} ist zerbrochen.", { item: itemDisplayName(item, itemId) }), "bad");
  });

  state.durability = equippedDurabilityAverage();
}

function smithMasteryRepairDiscount() {
  const completed = state.smithMastery?.completed || [];
  return (completed.includes("emberAnvil") ? 0.05 : 0) + (completed.includes("watchMastermark") ? 0.1 : 0);
}

function smithMasteryUpgradeDiscount() {
  return state.smithMastery?.completed?.includes("pressureSteel") ? 0.05 : 0;
}

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
    { label: `${t("common.level", "Level")} ${requirement.level}`, done: state.level >= (requirement.level || 1) },
    { label: `${requirement.renown} ${t("common.renown", "Ruhm")}`, done: state.renown >= (requirement.renown || 0) },
    { label: t("mastery.req.itemAtLimit", "ein ausgerüstetes Item am aktuellen Limit"), done: hasEquippedItemAtLimit() },
    { label: t("mastery.req.smithTrust", "Schmied vertraut dir genug"), done: smithRankMeets(requirement.rank || 0) },
    ...(requirement.bossKills ? [{ label: t("mastery.req.bossKills", "{count} Dungeon-Bosse besiegt", { count: requirement.bossKills }), done: (state.combatStats?.bossKills || 0) >= requirement.bossKills }] : []),
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
    log(() => t("smith.masteryBlockedLog", "Borin Glutbart schüttelt den Kopf. Für diesen Meisterauftrag fehlt dir noch etwas."), "bad");
    return;
  }
  state.smithMastery.discovered = true;
  state.smithMastery.active = rank.id;
  state.smithMastery.progress[rank.id] = { eliteKills: 0, bossKills: 0 };
  log(() => t("smith.masteryStartLog", "Meisterauftrag begonnen: {name}.", { name: smithMasteryName(rank) }), "drop");
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
    objectives.push({ label: t("mastery.obj.sacrifice.epic", "Episches Opferstück"), value: findSmithSacrificeItemId() ? 1 : 0, needed: 1 });
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
    log(() => t("smith.masteryIncompleteLog", "Borin Glutbart knurrt: Bring mir Erz, nicht Ausreden."), "bad");
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
  log(() => t("smith.masteryCompleteLog", "Borin Glutbart vollendet \"{name}\". Neues Upgrade-Limit: +{limit}. +{renown} Ruhm.", {
    name: smithMasteryName(rank),
    limit: rank.limit,
    renown: rank.rewardRenown,
  }), "drop");
  remindSaveBackup(() => t("save.backupSmithReason", "Borin hat seine Werkstatt erweitert."));
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

function findSmithSacrificeItemId() {
  return state.inventory.find((itemId) => {
    const item = getItem(itemId);
    return item && ["epic", "legendary"].includes(item.quality);
  });
}

function removeSmithSacrificeItem() {
  const itemId = findSmithSacrificeItemId();
  if (!itemId) return;
  state.inventory = state.inventory.filter((id) => id !== itemId);
  delete state.customItems[itemId];
  delete state.itemDurability[itemId];
}

function upgradeCost(item) {
  const targetLevel = (item.upgrade || 0) + 1;
  const step = upgradeCostSteps[targetLevel];
  if (!step) return { gold: 0, materials: {} };
  const slotMaterial = primaryMaterialForSlot(item.slot);
  const materials = { [slotMaterial]: step.basis };
  if (step.special) materials[specialUpgradeMaterialForItem(item)] = step.special;
  if (step.rare) materials[rareUpgradeMaterialForItem(item)] = step.rare;
  if (step.boss) materials[bossUpgradeMaterialForItem(item)] = step.boss;
  return {
    gold: Math.max(1, Math.floor(step.gold * (1 - renownUpgradeDiscount()))),
    materials: Object.fromEntries(Object.entries(materials).filter(([, amount]) => amount > 0)),
  };
}

function rollCritStats(slot, quality) {
  const qualityIndex = { common: 0, rare: 1, epic: 2, legendary: 3 }[quality] || 0;
  const chanceBase = [0.01, 0.02, 0.04, 0.06][qualityIndex];
  const damageBase = [0.02, 0.06, 0.12, 0.2][qualityIndex];
  const [chanceScale, damageScale] = {
    weapon: [1.25, 1],
    offhand: [0, 0],
    chest: [0, 0],
    pants: [0, 0],
    boots: [0, 0],
    necklace: [0.55, 1.15],
    ring: [1, 0.75],
  }[slot] || [0, 0];
  const critChance = normalizePercentStep(chanceBase * chanceScale + random(0, qualityIndex) * 0.01);
  const critDamage = normalizePercentStep(damageBase * damageScale + random(0, qualityIndex) * 0.01);
  return {
    ...(critChance > 0 ? { critChance } : {}),
    ...(critDamage > 0 ? { critDamage } : {}),
  };
}

function primaryMaterialForSlot(slot) {
  if (slot === "weapon" || slot === "offhand") return "scrap";
  if (slot === "chest") return "chain";
  if (slot === "pants") return "cloth";
  if (slot === "boots") return "leather";
  return "moonDust";
}

function specialUpgradeMaterialForItem(item) {
  if (["weapon", "offhand"].includes(item.slot)) return "emberCore";
  if (["chest", "pants", "boots"].includes(item.slot)) return "sinew";
  return "shard";
}

function rareUpgradeMaterialForItem(item) {
  if (["weapon", "offhand"].includes(item.slot)) return "oathSteel";
  if (["chest", "pants", "boots"].includes(item.slot)) return item.set === "crypt" ? "shadowResin" : "wolfFang";
  return "graveSeal";
}

function bossUpgradeMaterialForItem(item) {
  if (item.set === "crypt") return "graveSeal";
  if (item.set === "iron") return "oathMark";
  return "crownAsh";
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
  if ((item.upgrade || 0) >= currentSmithMasteryLimit()) return false;
  const cost = upgradeCost(item);
  return canPayUpgradeCost(cost);
}

function canPayUpgradeCost(cost) {
  return state.gold >= cost.gold && Object.entries(cost.materials).every(([id, amount]) => (state.materials[id] || 0) >= amount);
}

function canPayCost(cost) {
  return state.gold >= cost.gold && Object.entries(cost.materials || {}).every(([id, amount]) => (state.materials[id] || 0) >= amount);
}

function spendCost(cost) {
  state.gold -= cost.gold || 0;
  Object.entries(cost.materials || {}).forEach(([id, amount]) => {
    state.materials[id] -= amount;
  });
}

function ensureCustomEquippedItem(slot) {
  const itemId = state.equipment[slot];
  const item = getItem(itemId);
  if (!item) return null;
  if (state.customItems[itemId]) return state.customItems[itemId];
  const custom = { ...item, id: itemId, enchantments: [...(item.enchantments || [])] };
  state.customItems[itemId] = custom;
  return custom;
}

function previewUpgradedItem(item) {
  const upgraded = { ...item, upgrade: (item.upgrade || 0) + 1 };
  const gain = upgradeGainMultiplier(upgraded.upgrade);
  if (item.slot === "weapon") upgraded.damage += Math.max(1, Math.round(2 * gain));
  if (item.slot === "offhand") {
    upgraded.damage += 1;
    upgraded.defense += Math.max(1, Math.round(2 * gain));
  }
  if (item.slot === "chest") upgraded.defense += Math.max(1, Math.round(3 * gain));
  if (item.slot === "pants" || item.slot === "boots") upgraded.defense += Math.max(1, Math.round(2 * gain));
  if (item.slot === "necklace" || item.slot === "ring") {
    upgraded.damage += 1;
  }
  if ((item.slot === "weapon" || item.slot === "ring") && shouldGainUpgradeCrit(upgraded.upgrade)) {
    upgraded.critChance = (upgraded.critChance || 0) + 0.01;
  }
  if (item.slot === "weapon" || item.slot === "necklace") upgraded.critDamage = (upgraded.critDamage || 0) + upgradeCritDamageGain(upgraded.upgrade);
  normalizeItemStatsForSlot(upgraded);
  upgraded.name = item.name.replace(/\s\+\d+$/, "") + ` +${upgraded.upgrade}`;
  return upgraded;
}

function upgradeGainMultiplier(upgrade) {
  if (upgrade > 20) return 0.35;
  if (upgrade > 10) return 0.6;
  return 1;
}

function shouldGainUpgradeCrit(upgrade) {
  if (upgrade <= 10) return true;
  if (upgrade <= 20) return upgrade % 2 === 0;
  return upgrade % 3 === 0;
}

function upgradeCritDamageGain(upgrade) {
  if (upgrade > 20) return 0.01;
  if (upgrade > 10) return 0.02;
  return 0.03;
}

function upgradeEquipped(slot) {
  const item = getItem(state.equipment[slot]);
  if (item && (item.upgrade || 0) >= currentSmithMasteryLimit()) {
    log(() => t("smith.limitLog", "Borin Glutbart knurrt: Der Stahl braucht erst bessere Bindung."), "bad");
    return;
  }
  if (!item || !canUpgrade(item)) {
    log(() => t("smith.costMissingLog", "Borin Glutbart knurrt: Dem Amboss fehlen noch Material oder Gold."), "bad");
    return;
  }
  const cost = upgradeCost(item);
  state.gold -= cost.gold;
  Object.entries(cost.materials).forEach(([id, amount]) => {
    state.materials[id] -= amount;
  });
  const upgraded = previewUpgradedItem(item);
  upgraded.id = upgraded.id || state.equipment[slot];
  state.customItems[upgraded.id] = upgraded;
  if (upgraded.upgrade >= currentSmithMasteryLimit()) {
    state.smithMastery.discovered = true;
  }
  state.combatStats = normalizeCombatStats(state.combatStats);
  state.combatStats.itemsUpgraded += 1;
  log(() => t("smith.upgradeLog", "{item} beim Schmied verbessert.", { item: itemDisplayName(upgraded, upgraded.id) }), "drop");
  notifyReadyAchievements();
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
    amount,
    material,
    text: t("smith.salvageBonusLog", "Sauber zerlegt: +{amount} {material}.", { amount, material: labelFor(materialLabel, material) }),
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
  state.combatStats = normalizeCombatStats(state.combatStats);
  state.combatStats.itemsSalvaged += 1;
  log(() => t("smith.salvageLog", "{item} zerlegt. Erhalten: {materials}.", { item: itemDisplayName(item, itemId), materials: materialAmountsText(materials) }), "drop");
  if (bonus) log(() => t("smith.salvageBonusLog", "Sauber zerlegt: +{amount} {material}.", { amount: bonus.amount, material: labelFor(materialLabel, bonus.material) }), "drop");
  notifyReadyAchievements();
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
  state.combatStats = normalizeCombatStats(state.combatStats);
  state.combatStats.itemsSalvaged += count;
  log(() => t("smith.salvageAllLog", "{count} Items zerlegt. Erhalten: {materials}.", { count, materials: materialAmountsText(gained) }), "drop");
  if (bonusCount) log(() => t("smith.salvageAllBonusLog", "{count} Items wurden sauber zerlegt und gaben Bonus-Material.", { count: bonusCount }), "drop");
  notifyReadyAchievements();
  save();
  render();
}

function repair() {
  const cost = repairCost();
  if (!cost) {
    log(() => t("equipment.repairAllGoodLog", "Deine Ausrüstung ist bereits in gutem Zustand."));
    return;
  }
  if (state.gold < cost) {
    log(() => t("equipment.repairMissingLog", "Für die Reparatur fehlen {gold} Gold.", { gold: cost - state.gold }), "bad");
    return;
  }
  state.gold -= cost;
  equipmentSlots.forEach((slot) => {
    const itemId = state.equipment[slot];
    if (getItem(itemId)) setItemDurability(itemId, 100);
  });
  state.durability = equippedDurabilityAverage();
  log(() => t("equipment.repairAllLog", "Der Schmied repariert deine ausgerüsteten Items vollständig. Kosten: {gold} Gold.", { gold: cost }));
  save();
  render();
}

function repairSlot(slot) {
  const itemId = state.equipment[slot];
  const item = getItem(itemId);
  if (!item) return;
  const cost = repairCostForSlot(slot);
  if (!cost) {
    log(() => t("equipment.repairSlotFullLog", "{item} ist bereits vollständig repariert.", { item: itemDisplayName(item, itemId) }));
    return;
  }
  if (state.gold < cost) {
    log(() => t("equipment.repairSlotMissingLog", "Für {item} fehlen {gold} Gold.", { item: itemDisplayName(item, itemId), gold: cost - state.gold }), "bad");
    return;
  }
  state.gold -= cost;
  setItemDurability(itemId, 100);
  state.durability = equippedDurabilityAverage();
  log(() => t("equipment.repairSlotLog", "{item} repariert. Kosten: {gold} Gold.", { item: itemDisplayName(item, itemId), gold: cost }));
  save();
  render();
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
