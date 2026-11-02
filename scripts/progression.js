// Fortschritt: XP und Level, Ruhm, Boss-Belohnungen, Gebiete, Quests und Erfolge.
// Wird vor core.js geladen; enthält nur Funktionen (Konstanten und Spielstand liegen in core.js).

function gainXp(amount) {
  if (state.level >= 20) {
    state.renown += Math.max(1, Math.floor(amount / 30));
    gainParagonXp(amount);
    return;
  }

  state.xp += amount;
  while (state.level < 20 && state.xp >= xpForLevel(state.level)) {
    state.xp -= xpForLevel(state.level);
    state.level += 1;
    syncDerivedStats();
    state.hp = state.maxHp;
    const reachedLevel = state.level;
    log(() => t("progress.levelUpLog", "Level {level} erreicht. Deine Wunden schließen sich, aber der nächste Schritt wird schwerer.", { level: reachedLevel }), "good");
    remindSaveBackup(() => t("save.backupLevelReason", "du hast gerade ein Level geschafft."));
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
  return Math.min(0.35, (state.renown >= 5 ? 0.1 : 0) + smithMasteryRepairDiscount());
}

function renownUpgradeDiscount() {
  return Math.min(0.25, (state.renown >= 20 ? 0.08 : 0) + smithMasteryUpgradeDiscount());
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
  log(() => t("combat.renownLog", "Dein Ruf wächst: +1 Ruhm für den Sieg gegen {enemy}.", { enemy: enemyDisplayName(enemy, enemy.baseId || ui.selectedEnemy) }), "drop");
}

function bossFirstClearClaimed(enemyId) {
  return Array.isArray(state.defeatedBosses) && state.defeatedBosses.includes(enemyId);
}

function bossDropPityCount(enemyId) {
  if (!enemyId) return 0;
  const count = Math.floor(state.bossDropPity?.[enemyId] || 0);
  return Math.max(0, Math.min(bossDropPityGoal, count));
}

function bossDropPityReady(enemyId) {
  return bossDropPityCount(enemyId) >= bossDropPityGoal;
}

function bossDropPityText(enemyId, mode = "long") {
  const count = bossDropPityCount(enemyId);
  if (bossDropPityReady(enemyId)) {
    return t("bestiary.bossDropGuaranteedNext", "Nächster Sieg garantiert feste Bossbeute");
  }
  if (mode === "short") {
    return t("bestiary.bossDropPityCount", "Beutedruck {count}/{target}", { count, target: bossDropPityGoal });
  }
  return t("bestiary.bossDropPityHint", "Beutedruck {count}/{target}: feste Bossbeute wird nach Pech garantiert.", { count, target: bossDropPityGoal });
}

function updateBossDropPity(enemy, enemyId, fixedDrops) {
  if (!enemy?.boss) return;
  const bossId = enemy.baseId || enemyId;
  state.bossDropPity = state.bossDropPity && typeof state.bossDropPity === "object" ? state.bossDropPity : {};
  if (fixedDrops.length) {
    state.bossDropPity[bossId] = 0;
    return;
  }
  state.bossDropPity[bossId] = Math.min(bossDropPityGoal, bossDropPityCount(bossId) + 1);
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
  if (reward.renown) parts.push(`${reward.renown} ${t("common.renown", "Ruhm")}`);
  if (reward.gold) parts.push(`${reward.gold} Gold`);
  const materials = rewardMaterialText(reward.materials);
  if (materials) parts.push(materials);
  return parts.join(" · ");
}

function grantBossFirstClear(enemy, enemyId = ui.selectedEnemy) {
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
  if (state.renown < (unlock.renown || 0)) missing.push(`${unlock.renown} ${t("common.renown", "Ruhm")}`);
  return t("zone.lockNeeds", "Benötigt {requirements}", { requirements: missing.join(t("zone.lockAnd", " und ")) });
}

function selectZone(zoneId) {
  if (!zones[zoneId]) return false;
  if (!isZoneUnlocked(zoneId)) {
    log(() => t("zone.lockedLog", "{zone} ist noch gesperrt. {requirements}.", {
      zone: zoneDisplayName(zoneId),
      requirements: zoneLockText(zoneId),
    }), "bad");
    return false;
  }
  ui.selectedZone = zoneId;
  ui.selectedEnemy = zones[ui.selectedZone].enemies[0];
  save();
  return true;
}

function unlockedEnemyIds() {
  return Object.entries(zones)
    .filter(([zoneId]) => isZoneUnlocked(zoneId))
    .flatMap(([, zone]) => zone.enemies);
}

function questTargetAvailable(target) {
  if (target === "enemy") return false;
  return unlockedEnemyIds().some((enemyId) => {
    const enemy = enemies[enemyId];
    if (!enemy) return false;
    if (target === "elite") return Boolean(enemy.elite);
    if (target === "dungeon") return zones[questZoneIdForEnemy(enemyId)]?.type === "dungeon";
    return Boolean(enemy.tags?.[target]);
  });
}

function questAvailable(quest) {
  return Boolean(quest && questTargetAvailableForQuest(quest) && questRelevantForCurrentZone(quest));
}

function questTargetAvailableForQuest(quest) {
  const enemyIds = questEnemyIds(quest);
  if (enemyIds.length) return enemyIds.some((enemyId) => unlockedEnemyIds().includes(enemyId));
  return questTargetAvailable(quest.target);
}

function questRelevantForCurrentZone(quest) {
  if (!quest) return false;
  return questEnemyIdsForZone(quest, ui.selectedZone).length > 0;
}

function currentQuestEnemyId() {
  const zone = zones[ui.selectedZone];
  if (zone?.enemies?.includes(ui.selectedEnemy)) return ui.selectedEnemy;
  return zone?.enemies?.[0] || ui.selectedEnemy || "wolf";
}

function questRelevantForCurrentEnemy(quest) {
  return questMatchesEnemy(quest, currentQuestEnemyId());
}

function questMatchesEnemy(quest, enemyId) {
  const enemy = enemies[enemyId];
  if (!quest || !enemy) return false;
  const enemyIds = questEnemyIds(quest);
  if (enemyIds.length) return enemyIds.includes(enemyId);
  const zone = zones[questZoneIdForEnemy(enemyId)] || zones[ui.selectedZone];
  if (quest.target === "elite") return Boolean(enemy.elite);
  if (quest.target === "dungeon") return zone?.type === "dungeon";
  return Boolean(enemy.tags?.[quest.target]);
}

function questZoneIdForEnemy(enemyId) {
  return Object.entries(zones).find(([, zone]) => zone.enemies.includes(enemyId))?.[0] || ui.selectedZone;
}

function questEnemyIds(quest) {
  return Array.isArray(quest?.enemyIds) ? quest.enemyIds.filter((enemyId) => enemies[enemyId]) : [];
}

function questEnemyIdsForZone(quest, zoneId) {
  const zone = zones[zoneId];
  if (!zone) return [];
  const enemyIds = questEnemyIds(quest);
  if (enemyIds.length) return enemyIds.filter((enemyId) => zone.enemies.includes(enemyId));
  return zone.enemies.filter((enemyId) => {
    const enemy = enemies[enemyId];
    if (!enemy) return false;
    if (quest.target === "elite") return Boolean(enemy.elite);
    if (quest.target === "dungeon") return zone.type === "dungeon";
    return Boolean(enemy.tags?.[quest.target]);
  });
}

function questLevelRange(quest, zoneId = ui.selectedZone) {
  const matchingLevels = questEnemyIdsForZone(quest, zoneId)
    .map((enemyId) => enemies[enemyId]?.level)
    .filter((level) => Number.isFinite(level));
  if (!matchingLevels.length) return "";
  const min = Math.min(...matchingLevels);
  const max = Math.max(...matchingLevels);
  return min === max ? `Level ${min}` : `Level ${min}-${max}`;
}

function questLevelForCurrentEnemy(quest) {
  if (!questRelevantForCurrentEnemy(quest)) return questLevelRange(quest);
  const enemy = enemies[currentQuestEnemyId()];
  return enemy ? `Level ${enemy.level}` : questLevelRange(quest);
}

function isQuestCompletedPermanent(questId) {
  const quest = getQuestById(questId);
  return Boolean(quest && !quest.repeatable && state.completedQuests.includes(questId));
}

function updateQuestProgress(enemy, enemyId = ui.selectedEnemy) {
  state.activeQuests.map(getQuestById).filter(Boolean).forEach((quest) => {
    if (!isQuestActive(quest.id)) return;
    if (isQuestCompletedPermanent(quest.id)) return;
    const current = state.quests[quest.id] || 0;
    const gain = questProgressGain(quest, enemy, enemyId);
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
        log(() => t("quest.rewardLog", "Questbelohnung erhalten: {item} ({quality}).", {
          item: itemDisplayName(reward, reward.id),
          quality: labelFor(qualityLabel, reward.quality),
        }), "drop");
      }
      log(() => t("quest.completeLog", "Quest abgeschlossen: {quest}. +{xp} XP, +{gold} Gold, +{renown} Ruhm.", {
        quest: questDisplayName(quest),
        xp: quest.rewardXp,
        gold: quest.rewardGold,
        renown,
      }), "drop");
    }
  });
}

function questProgressGain(quest, enemy, enemyId = ui.selectedEnemy) {
  if (!quest || !enemy) return 0;
  const enemyIds = questEnemyIds(quest);
  if (enemyIds.length) return enemyIds.includes(enemyId) ? 1 : 0;
  if (quest.target === "elite") return enemy.elite ? 1 : 0;
  if (quest.target === "dungeon") return zones[questZoneIdForEnemy(enemyId)]?.type === "dungeon" ? 1 : 0;
  return enemy.tags?.[quest.target] || 0;
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
  log(() => t("quest.rareFoundLog", "Seltene Quest-Schriftrolle gefunden: {quest}. Sie liegt auf der Quest-Tafel.", { quest: questDisplayName(quest) }), "drop");
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
      return quest && questRelevantForCurrentEnemy(quest);
    });
  const hadVisibleQuest = state.questBoard.length > 0;

  if (!force && state.winsSinceQuestRefresh < 4) return;

  const candidates = [
    ...questCatalog.map((quest) => quest.id),
    ...Object.keys(state.rareQuests || {}),
  ]
    .filter((id) => !state.questBoard.includes(id))
    .filter((id) => !isQuestCompletedPermanent(id))
    .filter((id) => !state.activeQuests.includes(id))
    .filter((id) => questRelevantForCurrentEnemy(getQuestById(id)));

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

function cancelQuest(questId) {
  const quest = getQuestById(questId);
  if (!quest || !isQuestActive(questId)) return;
  state.activeQuests = state.activeQuests.filter((id) => id !== questId);
  state.completedQuests = state.completedQuests.filter((id) => id !== questId);
  delete state.quests[questId];
  state.questBoard = state.questBoard.filter((id) => id !== questId);
  forgetNewQuest(questId);
  refreshQuestBoard(true);
  log(() => t("quest.cancelLog", "Quest gelöscht: {quest}.", { quest: questDisplayName(quest) }), "bad");
  save();
  render();
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
  if (reward.renown) parts.push(`${reward.renown} ${t("common.renown", "Ruhm")}`);
  Object.entries(reward.materials || {}).forEach(([id, amount]) => {
    parts.push(`${amount} ${mapLabel(materialLabel, id, materialLabel[id] || id)}`);
  });
  return parts.join(" · ") || t("achievements.noReward", "Keine Belohnung");
}

function claimAchievement(id) {
  const achievement = achievementById(id);
  if (!achievement || isAchievementClaimed(id) || !achievementProgress(achievement).ready) return false;
  state.achievements.claimed.push(id);
  grantAchievementReward(achievement.reward);
  log(() => t("achievements.claimLog", "Erfolg eingelöst: {achievement}. Belohnung: {reward}.", {
    achievement: achievementDisplayName(achievement),
    reward: achievementRewardText(achievement.reward),
  }), "drop");
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

function notifyReadyAchievements() {
  state.achievements = normalizeAchievements(state.achievements);
  const unseenReady = readyAchievements().filter((achievement) => !state.achievements.notified.includes(achievement.id));
  if (!unseenReady.length) return;
  state.achievements.notified = [...new Set([
    ...state.achievements.notified,
    ...unseenReady.map((achievement) => achievement.id),
  ])];
  const first = unseenReady[0];
  log(() => unseenReady.length === 1
    ? t("achievements.readyLog", "Neuer Erfolg bereit: {achievement}.", { achievement: achievementDisplayName(first) })
    : t("achievements.readyManyLog", "{count} neue Erfolge sind bereit.", { count: unseenReady.length }),
  "drop");
}

// --- Endgame (Punkt 13): Paragon-Stufen und Endloser Turm ---

function defaultParagon() {
  return { level: 0, xp: 0, unspent: 0, points: { might: 0, guard: 0, vitality: 0, fortune: 0 } };
}

function normalizeParagon(paragon) {
  const source = paragon && typeof paragon === "object" ? paragon : {};
  const whole = (value) => (Number.isFinite(value) && value > 0 ? Math.floor(value) : 0);
  const points = Object.fromEntries(Object.entries(paragonStats).map(([id, config]) => [id, Math.min(config.max, whole(source.points?.[id]))]));
  const level = whole(source.level);
  const spent = Object.values(points).reduce((sum, value) => sum + value, 0);
  return { level, xp: whole(source.xp), unspent: Math.max(0, Math.min(whole(source.unspent), level - spent)), points };
}

function paragonXpNeeded(level = state.paragon?.level || 0) {
  return (20000 + level * 1500) * xpCurveMultiplier;
}

function gainParagonXp(amount) {
  state.paragon = normalizeParagon(state.paragon);
  state.paragon.xp += Math.max(0, Math.floor(amount));
  while (state.paragon.xp >= paragonXpNeeded(state.paragon.level)) {
    state.paragon.xp -= paragonXpNeeded(state.paragon.level);
    state.paragon.level += 1;
    state.paragon.unspent += 1;
    const reached = state.paragon.level;
    log(() => t("paragon.levelUpLog", "Paragon-Stufe {level} erreicht. Ein neuer Punkt wartet in den Spielerwerten.", { level: reached }), "good");
    remindSaveBackup(() => t("save.backupParagonReason", "du hast eine Paragon-Stufe erreicht."));
  }
}

function spendParagonPoint(statId) {
  state.paragon = normalizeParagon(state.paragon);
  const config = paragonStats[statId];
  if (!config || state.paragon.unspent <= 0 || state.paragon.points[statId] >= config.max) return false;
  state.paragon.points[statId] += 1;
  state.paragon.unspent -= 1;
  syncDerivedStats();
  save();
  render();
  return true;
}

// Prozentuale Boni aus Paragon-Punkten (z. B. 0.1 = +10 %).
function paragonBonuses() {
  const paragon = normalizeParagon(state?.paragon);
  const bonus = (id) => paragon.points[id] * paragonStats[id].perPoint;
  return { damage: bonus("might"), defense: bonus("guard"), maxHp: bonus("vitality"), gold: bonus("fortune") };
}

function defaultTower() {
  return { floor: 1, best: 0 };
}

function normalizeTower(tower) {
  const source = tower && typeof tower === "object" ? tower : {};
  const floor = Number.isFinite(source.floor) && source.floor >= 1 ? Math.floor(source.floor) : 1;
  const best = Number.isFinite(source.best) && source.best > 0 ? Math.floor(source.best) : 0;
  return { floor, best: Math.max(best, floor - 1) };
}

// Turmwächter wird pro Stockwerk stärker; Belohnungen wachsen etwas schneller als die Gefahr.
function scaleTowerEnemy(base, floor = normalizeTower(state.tower).floor) {
  const step = Math.max(0, floor - 1);
  const power = 1 + step * 0.07;
  const reward = 1 + step * 0.1;
  return {
    ...base,
    hp: Math.round(base.hp * power),
    damage: base.damage.map((value) => Math.round(value * power)),
    defense: Math.round(base.defense * (1 + step * 0.04)),
    xp: Math.round(base.xp * reward),
    gold: base.gold.map((value) => Math.round(value * reward)),
    towerFloor: floor,
  };
}

function onTowerVictory() {
  state.tower = normalizeTower(state.tower);
  const cleared = state.tower.floor;
  state.tower.best = Math.max(state.tower.best, cleared);
  state.tower.floor = cleared + 1;
  if (cleared % 5 === 0) {
    const renown = 2;
    const gold = 150 * (cleared / 5);
    state.renown += renown;
    state.gold += gold;
    log(() => t("tower.milestoneLog", "Stockwerk {floor} bezwungen! Turmschatz: +{gold} Gold, +{renown} Ruhm.", { floor: cleared, gold, renown }), "drop");
    remindSaveBackup(() => t("save.backupTowerReason", "du hast einen Turm-Meilenstein erreicht."));
  } else {
    log(() => t("tower.floorLog", "Stockwerk {floor} bezwungen. Weiter nach oben!", { floor: cleared }), "good");
  }
}

