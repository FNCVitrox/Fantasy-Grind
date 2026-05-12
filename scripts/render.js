function render() {
  const language = currentLanguage();
  if (renderCache.language && renderCache.language !== language) clearRenderCache();
  renderCache.language = language;
  applyStaticTranslations();
  syncDerivedStats();
  const stats = totalStats();
  renderPlayerHud(language);
  renderMainPanels(stats);
  renderOpenModals(stats);
  renderCombatPanel();
}

function renderPlayerHud(language = currentLanguage()) {
  setText("level", state.level);
  setText("gold", state.gold);
  setText("renown", state.renown);
  const needed = state.level >= 20 ? 1 : xpForLevel(state.level);
  setText("xpText", state.level >= 20 ? t("common.max", "Max") : `${state.xp}/${needed}`);
  setBarWidth("xpBar", state.level >= 20 ? 100 : Math.max(2, (state.xp / needed) * 100));
  renderHeroBuildVisual();
  renderClassPanel();
  const currentRestCost = restCost();
  const restPrice = state.gold >= currentRestCost ? `${currentRestCost} ${t("common.gold", "Gold")}` : t("common.free", "kostenlos");
  const restName = t("nav.camp", "Lagerplatz");
  const restLabel = state.hp >= state.maxHp
    ? `<span class="button-main">${restName}</span>`
    : `<span class="button-main">${restName}</span><span class="button-price">${restPrice}</span>`;
  renderCachedHtml("restBtn", `${language}|${state.hp >= state.maxHp ? "full" : restPrice}`, () => restLabel);
  setDisabled("restBtn", state.hp >= state.maxHp);
}

function renderMainPanels(stats = totalStats()) {
  renderMap();
  renderEnemies(stats);
  renderEquipment();
  renderLootChoices();
  renderQuestNotice();
  renderAchievementNotice();
  renderQuests();
  renderSelectedEnemy();
}

const modalRenderers = {
  inventoryModal: () => renderInventory(),
  questBoardModal: () => renderQuestBoard(),
  achievementsModal: () => renderAchievements(),
  smithModal: () => renderSmith(),
  saveModal: () => renderSaveSummary(),
  repairModal: () => renderRepairModal(),
  equipmentModal: () => renderEquipmentDetails(),
  playerStatsModal: (stats) => renderPlayerStatsDetails(stats),
  combatLogModal: () => renderCombatLog(),
};

function renderOpenModals(stats = totalStats()) {
  Object.entries(modalRenderers).forEach(([modalId, renderer]) => {
    if (isModalOpen(modalId)) renderer(stats);
  });
}

function renderCombatPanel() {
  renderCombatLogSummary();
  renderLog();
  setText("fightBtn", isFighting ? (skipCombat ? t("combat.skipping", "Überspringe...") : t("combat.skip", "Skip")) : t("combat.start", "Kampf starten"));
  setDisabled("fightBtn", isFighting ? skipCombat : state.pendingLoot.length > 0);
}

function setText(id, value) {
  const element = $(id);
  const text = String(value);
  if (element.textContent !== text) element.textContent = text;
}

function setBarWidth(id, value) {
  const width = `${Math.max(0, Math.min(100, value))}%`;
  if ($(id).style.width !== width) $(id).style.width = width;
}

function setDisabled(id, disabled) {
  const element = $(id);
  if (element.disabled !== disabled) element.disabled = disabled;
}

function setHidden(id, hidden) {
  const element = $(id);
  if (element.hidden !== hidden) element.hidden = hidden;
}

function renderCachedHtml(id, signature, htmlFactory) {
  const key = `html:${id}`;
  const nextSignature = String(signature);
  if (renderCache[key] === nextSignature) return false;
  $(id).innerHTML = htmlFactory();
  renderCache[key] = nextSignature;
  return true;
}

function renderHeroBuildVisual() {
  const build = ["tank", "damage", "bruiser"].includes(state.build) ? state.build : "bruiser";
  const className = `combatant hero-sprite hero-build-${build}`;
  if ($("heroSprite").className !== className) $("heroSprite").className = className;
}

function itemQuality(item) {
  return ["common", "rare", "epic", "legendary"].includes(item?.quality) ? item.quality : "common";
}

function itemSlot(item) {
  return equipmentSlots.includes(item?.slot) ? item.slot : "ring";
}

function labelFor(map, key, fallback = t("common.unknown", "Unbekannt")) {
  return escapeHtml(mapLabel(map, key, map[key] || fallback));
}

function escapeToken(value, allowed, fallback) {
  return allowed.includes(value) ? value : fallback;
}

function renderMap() {
  const zoneData = zones[selectedZone] || zones.meadow;
  setText("activeZoneName", zoneDisplayName(selectedZone));
  setText("activeZoneRange", `${zoneKindLabel(zoneData)} · ${zoneRangeText(selectedZone) || zoneData.range || t("common.unknown", "Unbekannt")}`);
  const mapSignature = `${currentLanguage()}|${selectedZone}|${zoneUnlockSignature()}`;
  if (renderCache.map === mapSignature) return;
  renderCache.map = mapSignature;
  document.querySelectorAll("[data-zone]").forEach((button) => {
    button.classList.toggle("active", button.dataset.zone === selectedZone);
    button.disabled = !isZoneUnlocked(button.dataset.zone);
  });
  renderZoneOptions();
}

function renderClassPanel() {
  setText("className", entityName("class", state.characterClass, activeClass().name));
  const signature = `${currentLanguage()}|${state.characterClass}|${state.build}`;
  if (renderCache.classPanel === signature) return;
  renderCache.classPanel = signature;
  $("buildList").innerHTML = Object.entries(buildCatalog).map(([id, build]) => `
    <button class="${state.build === id ? "active" : ""}" type="button" data-build="${id}">
      <strong>${escapeHtml(entityName("build", id, build.name))}</strong>
      <span>${escapeHtml(entityText("build", id, build.description))}</span>
    </button>
  `).join("");
  $("abilityList").innerHTML = knownClassAbilities().map(([id, ability]) => `
    <div class="ability-chip" data-ability="${id}">
      <strong>${escapeHtml(entityName("ability", id, ability.name))}</strong>
      <span>${escapeHtml(entityText("ability", id, ability.text))}</span>
    </div>
  `).join("");
}

function renderPlayerStatsDetails(stats = totalStats()) {
  const needed = state.level >= 20 ? 1 : xpForLevel(state.level);
  const durabilityAverage = equippedDurabilityAverage();
  const setStats = activeSetBonusStats();
  const build = activeBuild();
  const signature = [
    currentLanguage(),
    state.level,
    state.xp,
    needed,
    state.hp,
    state.maxHp,
    state.gold,
    state.renown,
    state.build,
    stats.damage,
    stats.defense,
    stats.maxHp,
    stats.critChance,
    stats.critDamage,
    durabilityAverage,
    setStats.damage,
    setStats.defense,
    setStats.maxHp,
    equipmentSignature(),
  ].join("|");
  if (renderCache.playerStats === signature) return;
  renderCache.playerStats = signature;

  const xpPercent = state.level >= 20 ? 100 : Math.max(2, Math.min(100, (state.xp / needed) * 100));
  const hpPercent = Math.max(2, Math.min(100, (state.hp / state.maxHp) * 100));
  const buildDamage = Math.round(((build.damageMultiplier || 1) - 1) * 100);
  const buildDefense = Math.round(((build.defenseMultiplier || 1) - 1) * 100);
  const buildHp = Math.round(((build.maxHpMultiplier || 1) - 1) * 100);
  const setLines = Object.values(activeSetCounts())
    .filter(({ count }) => count >= 2)
    .map(({ id, count }) => `<span>${escapeHtml(setBonuses[id]?.name || id)} · ${count} ${t("common.pieces", "Teile")}</span>`)
    .join("");
  const className = entityName("class", state.characterClass, activeClass().name);
  const buildName = entityName("build", state.build, build.name);

  $("playerStatsDetails").innerHTML = `
    <section class="player-stats-hero">
      <div>
        <p class="eyebrow">${escapeHtml(className)} · ${escapeHtml(buildName)}</p>
        <h3>${t("common.level", "Level")} ${state.level}</h3>
      </div>
      <div class="player-stat-currency">
        <span>${t("common.gold", "Gold")} <strong>${state.gold}</strong></span>
        <span>${t("common.renown", "Ruhm")} <strong>${state.renown}</strong></span>
      </div>
    </section>
    <section class="player-progress-grid">
      <div class="player-progress-card">
        <div class="bar-label"><span>${t("main.life", "Leben")}</span><b>${state.hp}/${state.maxHp}</b></div>
        <div class="bar"><span style="width:${hpPercent}%"></span></div>
      </div>
      <div class="player-progress-card">
        <div class="bar-label"><span>${t("common.xp", "XP")}</span><b>${state.level >= 20 ? t("common.max", "Max") : `${state.xp}/${needed}`}</b></div>
        <div class="bar xp"><span style="width:${xpPercent}%"></span></div>
      </div>
    </section>
    <section class="player-stat-grid">
      ${renderPlayerStat(t("main.damage", "Schaden"), stats.damage)}
      ${renderPlayerStat(t("main.defense", "Verteidigung"), stats.defense)}
      ${renderPlayerStat(t("stat.maxHp", "Max. Leben"), stats.maxHp)}
      ${renderPlayerStat(t("main.durability", "Haltbarkeit"), `${durabilityAverage}%`)}
      ${renderPlayerStat(t("stat.critChance", "Crit Chance"), formatPercent(stats.critChance))}
      ${renderPlayerStat(t("stat.critDamage", "Crit Damage"), formatPercent(stats.critDamage))}
    </section>
    <section class="player-stat-sources">
      <div>
        <strong>${t("main.buildBonus", "Build-Bonus")}</strong>
        <span>${t("main.damage", "Schaden")} ${formatSignedPercent(buildDamage)}</span>
        <span>${t("main.defense", "Verteidigung")} ${formatSignedPercent(buildDefense)}</span>
        <span>${t("main.life", "Leben")} ${formatSignedPercent(buildHp)}</span>
        <span>${t("stat.critChance", "Crit Chance")} ${formatSignedPercent(Math.round((build.critChanceBonus || 0) * 100))}</span>
        <span>${t("stat.critDamage", "Crit Damage")} ${formatSignedPercent(Math.round((build.critDamageBonus || 0) * 100))}</span>
      </div>
      <div>
        <strong>${t("main.setBonuses", "Set-Boni")}</strong>
        ${setLines || `<span>${t("main.noSetBonus", "Kein aktiver Set-Bonus")}</span>`}
        <span>${t("main.total", "Gesamt")}: +${setStats.damage} ${t("main.damage", "Schaden")} · +${setStats.defense} ${t("main.defense", "Verteidigung")} · +${setStats.maxHp} ${t("main.life", "Leben")}</span>
      </div>
    </section>
  `;
}

function renderPlayerStat(label, value) {
  return `<div class="player-stat-card"><span>${escapeHtml(label)}</span><strong>${value}</strong></div>`;
}

function formatSignedPercent(value) {
  if (value > 0) return `+${value}%`;
  if (value < 0) return `${value}%`;
  return "0%";
}

function formatPercent(value) {
  return `${Math.round((value || 0) * 100)}%`;
}

function itemCritText(item) {
  return [
    item.critChance ? `Crit ${formatPercent(item.critChance)}` : "",
    item.critDamage ? `${t("stat.critDamage", "Crit-Schaden")} +${formatPercent(item.critDamage)}` : "",
  ].filter(Boolean).join(" · ");
}

function itemEffectName(item) {
  return itemEffectCatalog[item?.effect]?.name || "";
}

function itemEffectText(item) {
  return itemEffectCatalog[item?.effect]?.text || "";
}

function renderItemEffectLine(item) {
  const name = itemEffectName(item);
  if (!name) return "";
  return `<span>${t("loot.effect", "Effekt")}: ${escapeHtml(name)} - ${escapeHtml(itemEffectText(item))}</span>`;
}

function itemEnchantmentsText(item) {
  const enchantments = activeItemEnchantments(item);
  if (!enchantments.length) return "";
  return `${t("loot.enchantment", "Verzauberung")}: ${enchantments.map((enchantment) => `${enchantment.name} (${enchantment.text})`).join(" · ")}`;
}

function renderItemEnchantmentLine(item) {
  const text = itemEnchantmentsText(item);
  return text ? `<span>${escapeHtml(text)}</span>` : "";
}

function itemStatEntries(item, labels = {}) {
  return [
    item.damage ? { key: "damage", label: labels.damage || t("stat.damage", "Angriff"), value: item.damage } : null,
    item.defense ? { key: "defense", label: labels.defense || t("stat.defense", "Verteidigung"), value: item.defense } : null,
    item.critChance ? { key: "critChance", label: labels.critChance || t("stat.critChance", "Crit-Chance"), value: formatPercent(item.critChance) } : null,
    item.critDamage ? { key: "critDamage", label: labels.critDamage || t("stat.critDamage", "Crit-Schaden"), value: `+${formatPercent(item.critDamage)}` } : null,
  ].filter(Boolean);
}

function itemStatText(item, labels = {}) {
  return itemStatEntries(item, labels)
    .map((entry) => typeof entry.value === "number" ? `${entry.label} +${entry.value}` : `${entry.label} ${entry.value}`)
    .join(" · ");
}

function renderEnemies(stats = totalStats()) {
  const signature = [
    currentLanguage(),
    selectedZone,
    selectedEnemy,
    state.hp,
    stats.damage,
    stats.defense,
    stats.maxHp,
    stats.critChance,
    stats.critDamage,
    zoneEncounterSignature(selectedZone),
  ].join("|");
  if (renderCache.enemies === signature) return;
  renderCache.enemies = signature;
  $("enemyList").innerHTML = zones[selectedZone].enemies.map((id) => {
    const enemy = getPreparedEncounter(id);
    const risk = riskFor(enemy, stats);
    const rarity = enemyRarity(enemy);
    const safeRarity = escapeToken(rarity, ["common", "rare", "epic", "legendary"], "common");
    const enemyType = enemy.boss ? ` · ${t("common.boss", "Boss")}` : enemy.elite ? ` · ${t("common.elite", "Elite")}` : "";
    return `<button class="enemy rarity-card rarity-${safeRarity} ${id === selectedEnemy ? "active" : ""}" type="button" data-enemy="${id}">
      <span><strong>${escapeHtml(enemy.name)}</strong><p><span class="quality-${safeRarity}">${labelFor(rarityLabel, safeRarity)}</span> · ${t("common.level", "Level")} ${enemy.level}${enemyType} · ${enemy.xp} ${t("common.xp", "XP")}</p></span>
      <em class="risk ${riskLabelClass(risk)}">${riskLabel(risk)}</em>
    </button>`;
  }).join("");
}

function renderQuestNotice() {
  const notice = $("questNotice");
  const button = $("openQuestBoardBtn");
  const count = (state.unseenQuests || []).filter((id) => state.questBoard.includes(id)).length;
  if (button) button.classList.toggle("has-new-quests", count > 0);
  if (!notice) return;
  notice.hidden = true;
  setText("questNotice", count);
}

function renderAchievementNotice() {
  const notice = $("achievementNotice");
  const button = $("openAchievementsBtn");
  const count = readyAchievementCount();
  if (button) button.classList.toggle("has-new-achievements", count > 0);
  if (!notice) return;
  notice.hidden = count <= 0;
  setText("achievementNotice", count);
}

function renderAchievements() {
  const container = $("achievements");
  if (!container) return;
  const ready = readyAchievementCount();
  const claimed = claimedAchievementCount();
  const signature = `${currentLanguage()}|${claimed}|${ready}|${achievementCatalog.map((achievement) => `${achievement.id}:${achievementProgress(achievement).value}`).join(",")}|${state.gold}|${state.renown}|${materialsSignature()}`;
  if (renderCache.achievements === signature) return;
  renderCache.achievements = signature;

  const categories = [...new Set(achievementCatalog.map((achievement) => achievement.category))];
  container.innerHTML = `
    <section class="achievement-summary">
      <div><span>${t("common.completed", "Erledigt")}</span><strong>${claimed}/${achievementCatalog.length}</strong></div>
      <div><span>${t("common.ready", "Bereit")}</span><strong>${ready}</strong></div>
      <div><span>${t("achievements.readyRewards", "Belohnungen")}</span><strong>${ready ? t("common.claim", "Abholen") : t("common.noOpen", "Keine offen")}</strong></div>
    </section>
    ${categories.map((category) => renderAchievementCategory(category)).join("")}
  `;
}

function renderAchievementCategory(category) {
  const achievements = achievementCatalog.filter((achievement) => achievement.category === category);
  return `<section class="achievement-category">
    <h3>${escapeHtml(category)}</h3>
    <div class="achievement-grid">
      ${achievements.map(renderAchievementCard).join("")}
    </div>
  </section>`;
}

function renderAchievementCard(achievement) {
  const progress = achievementProgress(achievement);
  const claimed = isAchievementClaimed(achievement.id);
  const ready = progress.ready && !claimed;
  const stateClass = claimed ? "claimed" : ready ? "ready" : "";
  return `<article class="achievement-card ${stateClass}">
    <div class="achievement-card-head">
      <div>
        <strong>${escapeHtml(achievement.name)}</strong>
        <p>${escapeHtml(achievement.text)}</p>
      </div>
      <span>${claimed ? t("common.claimed", "Erhalten") : ready ? t("common.ready", "Bereit") : `${Math.min(progress.value, progress.target)}/${progress.target}`}</span>
    </div>
    <div class="achievement-progress" aria-label="${t("common.progress", "Fortschritt")} ${Math.min(progress.value, progress.target)} / ${progress.target}">
      <span style="width:${progress.percent}%"></span>
    </div>
    <div class="achievement-reward">
      <span>${t("common.reward", "Belohnung")}</span>
      <strong>${escapeHtml(achievementRewardText(achievement.reward))}</strong>
    </div>
    <button type="button" data-claim-achievement="${achievement.id}" ${ready ? "" : "disabled"}>
      ${claimed ? t("achievements.claimed", "Abgeholt") : ready ? t("achievements.claimReward", "Belohnung abholen") : t("achievements.closed", "Noch offen")}
    </button>
  </article>`;
}

function materialsSignature() {
  return Object.keys(materialLabel).map((id) => `${id}:${state.materials[id] || 0}`).join(",");
}

function riskLabelClass(risk) {
  if (risk === "Einfach" || risk === "Machbar") return "ok";
  if (risk === "Tödlich") return "deadly";
  return "";
}

function renderZoneOptions() {
  const container = document.getElementById("zoneOptions");
  if (!container) return;
  const section = (type, title) => {
    const entries = Object.entries(zones).filter(([, zone]) => zone.type === type);
    return `<section class="travel-section">
      <h3>${title}</h3>
      <div class="zone-options">
        ${entries.map(([id, zone]) => {
          const locked = !isZoneUnlocked(id);
          return `<button class="zone ${id === selectedZone ? "active" : ""}" type="button" data-zone="${id}" ${locked ? "disabled" : ""}>
            <span>${escapeHtml(zoneDisplayName(id))}</span>
            <small>${escapeHtml(zoneRangeText(id) || zone.range || "")}</small>
            <em>${locked ? escapeHtml(zoneLockText(id)) : `${zone.enemies.length} ${type === "dungeon" ? t("common.bosses", "Bosse") : t("common.enemies", "Gegner")}`}</em>
          </button>`;
        }).join("")}
      </div>
    </section>`;
  };
  container.innerHTML = `${section("zone", t("zone.normalZones", "Normale Gebiete"))}${section("dungeon", t("zone.dungeons", "Dungeons"))}`;
}

function enemyRarity(enemy) {
  if (enemy.level >= 20) return "legendary";
  if (enemy.elite || enemy.level >= 12) return "epic";
  if (enemy.level >= 6) return "rare";
  return "common";
}

function renderSelectedEnemy() {
  const bossRewardSignature = Array.isArray(state.defeatedBosses) ? state.defeatedBosses.join(",") : "";
  const signature = `${selectedEnemy}|${state.hp}|${state.maxHp}|${state.level}|${state.build}|${zoneEncounterSignature(selectedZone)}|${equipmentSignature()}|${bossRewardSignature}`;
  if (renderCache.selectedEnemy === signature) return;
  renderCache.selectedEnemy = signature;
  const enemy = getPreparedEncounter(selectedEnemy);
  resetBattleStageState();
  setText("selectedEnemyName", enemy.name);
  const meta = $("selectedEnemyMeta");
  const metaHtml = renderSelectedEnemyMeta(enemy, selectedEnemy);
  if (meta) {
    meta.hidden = !metaHtml;
    meta.innerHTML = metaHtml;
  }
  setBattleEnemyVisual(enemy);
  $("battleText").textContent = `${enemy.name} ${t("combat.waits", "wartet.")}`;
}

function renderSelectedEnemyMeta(enemy, enemyId = selectedEnemy) {
  if (!enemy?.boss) return "";
  const drops = (enemy.drops || []).map((drop) => {
    const item = getItem(drop.id);
    const quality = itemQuality(item);
    return `<span class="boss-meta-chip quality-${quality}">${escapeHtml(item.name)} ${formatChance(drop.chance)}</span>`;
  }).join("");
  const claimed = bossFirstClearClaimed(enemy.baseId || enemyId);
  const reward = bossFirstClearRewardText(enemy);
  return `
    <span class="boss-meta-row"><b>${t("bestiary.bossLoot", "Bossbeute")}</b>${drops || `<span>${t("bestiary.noBossLoot", "Keine feste Bossbeute")}</span>`}</span>
    <span class="boss-meta-row ${claimed ? "claimed" : ""}"><b>${claimed ? t("bestiary.firstWinClaimed", "Erster Sieg geholt") : t("bestiary.firstWin", "Erster Sieg")}</b>${escapeHtml(reward || t("bestiary.noSpecialReward", "Keine Sonderbelohnung"))}</span>
  `;
}

function resetBattleStageState() {
  if (isFighting) return;
  const stage = $("battleStage");
  if (stage.className !== "battle-stage") stage.className = "battle-stage";
  stage.querySelectorAll(".damage-number").forEach((number) => number.remove());
  const result = $("battleResult");
  if (result) result.className = "battle-result";
}

function setBattleEnemyVisual(enemy) {
  setText("enemySpriteName", enemy.name);
  const className = `combatant enemy-sprite ${enemy.sprite}${enemy.eliteVariant ? " elite-variant" : ""}`;
  if ($("enemySprite").className !== className) $("enemySprite").className = className;
  updateBattleHealth(state.hp, state.maxHp, enemy.hp, enemy.hp);
}

function updateBattleHealth(playerHp, playerMaxHp, enemyHp, enemyMaxHp) {
  updateCombatHealth("Hero", playerHp, playerMaxHp);
  updateCombatHealth("Enemy", enemyHp, enemyMaxHp);
}

function updateCombatHealth(side, current, max) {
  const text = $(`battle${side}HpText`);
  const bar = $(`battle${side}HpBar`);
  if (!text || !bar) return;

  const safeMax = Math.max(1, Math.floor(max || 1));
  const safeCurrent = Math.max(0, Math.min(safeMax, Math.floor(current || 0)));
  const percent = Math.max(0, Math.min(100, (safeCurrent / safeMax) * 100));
  text.textContent = `${safeCurrent}/${safeMax}`;
  bar.style.width = `${percent}%`;
  bar.parentElement.classList.toggle("low", percent <= 30);
}

function zoneUnlockSignature() {
  return Object.keys(zones).map((id) => `${id}:${isZoneUnlocked(id) ? 1 : 0}`).join(",");
}

function zoneEncounterSignature(zoneId) {
  return (zones[zoneId]?.enemies || [])
    .map((id) => `${id}:${state.nextEncounters[id]?.elite ? 1 : 0}`)
    .join(",");
}

function equipmentSignature() {
  return equipmentSlots
    .map((slot) => {
      const id = state.equipment[slot] || "";
      const item = getItem(id);
      return `${slot}:${id}:${item?.damage ?? ""}:${item?.defense ?? ""}:${item?.critChance ?? 0}:${item?.critDamage ?? 0}:${item?.upgrade ?? 0}:${(item?.enchantments || []).join(",")}:${state.itemDurability[id] ?? ""}`;
    })
    .join("|");
}

function itemRenderSignature(item, id = "") {
  if (!item) return id;
  return [
    id,
    item.name,
    item.slot,
    item.quality,
    item.damage || 0,
    item.defense || 0,
    item.critChance || 0,
    item.critDamage || 0,
    item.upgrade || 0,
    item.effect || "",
    item.set || "",
    (item.enchantments || []).join(","),
  ].join(":");
}

function inventorySignature() {
  return (state.inventory || [])
    .map((id, index) => `${index}:${itemRenderSignature(getItem(id), id)}:${state.itemDurability[id] ?? ""}`)
    .join("|");
}

function combatProgressSignature() {
  state.combatStats = normalizeCombatStats(state.combatStats);
  return [
    state.combatStats.eliteKills,
    state.combatStats.bossKills,
    state.combatStats.wins,
    state.combatStats.itemsUpgraded,
    state.combatStats.itemsSalvaged,
    state.combatStats.itemsEnchanted,
    state.combatStats.rareEnchantments,
  ].join(",");
}

function masteryProgressSignature(mastery) {
  return Object.entries(mastery?.progress || {})
    .map(([id, progress]) => `${id}:${progress.eliteKills || 0}:${progress.bossKills || 0}`)
    .sort()
    .join(",");
}

function smithMasterySignature() {
  return [
    currentLanguage(),
    state.level,
    state.renown,
    state.gold,
    materialsSignature(),
    equipmentSignature(),
    inventorySignature(),
    combatProgressSignature(),
    currentSmithMasteryLimit(),
    state.smithMastery?.active || "",
    (state.smithMastery?.completed || []).join(","),
    masteryProgressSignature(state.smithMastery),
    state.smithMastery?.discovered ? 1 : 0,
  ].join("|");
}

function enchantingSignature() {
  return [
    currentLanguage(),
    state.level,
    state.renown,
    state.gold,
    materialsSignature(),
    equipmentSignature(),
    inventorySignature(),
    combatProgressSignature(),
    currentEnchantSlotLimit(),
    state.enchanting?.active || "",
    (state.enchanting?.completed || []).join(","),
    masteryProgressSignature(state.enchanting),
    state.enchanting?.discovered ? 1 : 0,
    enchantmentsUnlocked() ? 1 : 0,
    arcaneMasteryUnlocked() ? 1 : 0,
  ].join("|");
}

function renderEquipment() {
  const signature = `${currentLanguage()}|${equipmentSignature()}|${state.level}|${state.renown}`;
  if (renderCache.equipment === signature) {
    if (isModalOpen("equipmentModal")) renderEquipmentDetails();
    return;
  }
  renderCache.equipment = signature;
  const slots = equipmentSlots.map((slot) => [slot, state.equipment[slot]]);
  $("equipment").innerHTML = slots.map(([slot, id]) => {
    const item = getItem(id);
    if (!item) {
      return `<button class="equipment-chip empty-slot" type="button" data-open-equipment>
        <strong>${labelFor(slotLabel, slot)}</strong>
        <span>${t("common.empty", "Leer")}</span>
      </button>`;
    }
    const durability = itemDurability(id);
    const repairCost = repairCostForSlot(slot);
    const quality = itemQuality(item);
    const setName = item.set ? setBonuses[item.set]?.name || item.set : "";
    const statText = itemStatText(item);
    const enchantText = itemEnchantmentsText(item);
    return `<button class="equipment-chip rarity-card rarity-${quality}" type="button" data-open-equipment>
      <strong>${labelFor(slotLabel, slot)}</strong>
      <span class="quality-${quality}">${escapeHtml(item.name)}</span>
      <small>${labelFor(qualityLabel, quality)} · +${item.upgrade || 0}</small>
      <small class="${durability <= 25 ? "durability-low" : ""}">${durability}% · ${repairCost} ${t("common.gold", "Gold")}</small>
      <span class="equipment-hover-detail" aria-hidden="true">
        <b class="quality-${quality}">${escapeHtml(item.name)}</b>
        <em>${labelFor(slotLabel, slot)} · ${labelFor(qualityLabel, quality)} · +${item.upgrade || 0}</em>
        ${statText ? `<em>${statText}</em>` : ""}
        ${enchantText ? `<em>${enchantText}</em>` : ""}
        <em>${t("main.durability", "Haltbarkeit")}: ${durability}%</em>
        <em>${t("equipment.repair", "Reparatur")}: ${repairCost} ${t("common.gold", "Gold")}</em>
        ${setName ? `<em>Set: ${escapeHtml(setName)}</em>` : ""}
      </span>
    </button>`;
  }).join("");
  if (isModalOpen("equipmentModal")) renderEquipmentDetails();
}

function renderEquipmentDetails() {
  const signature = `${currentLanguage()}|${equipmentSignature()}|${state.gold}`;
  if (renderCache.equipmentDetails === signature) return;
  renderCache.equipmentDetails = signature;
  $("equipmentDetails").innerHTML = equipmentSlots.map((slot) => {
    const id = state.equipment[slot];
    const item = getItem(id);
    if (!item) {
      return `<div class="slot empty-slot">
        <strong>${labelFor(slotLabel, slot)}</strong>
        <p>${t("common.empty", "Leer")}</p>
      </div>`;
    }
    const setKey = item.set ? cacheSetTooltip(item.set) : "";
    const slotRepairCost = repairCostForSlot(slot);
    const quality = itemQuality(item);
    const statText = itemStatText(item);
    const enchantText = itemEnchantmentsText(item);
    return `<div class="slot rarity-card rarity-${quality}">
      <strong>${labelFor(slotLabel, slot)}</strong>
      <p class="quality-${quality}">${escapeHtml(item.name)} · ${labelFor(qualityLabel, quality)} · +${item.upgrade || 0}</p>
      ${item.set ? `<p class="set-line set-hover-row"><span>${escapeHtml(setBonuses[item.set]?.name || item.set)}</span><span class="tooltip-source" data-set-tooltip-key="${setKey}"></span></p>` : ""}
      ${statText ? `<p>${statText}</p>` : ""}
      ${enchantText ? `<p>${enchantText}</p>` : ""}
      <p class="${itemDurability(id) <= 25 ? "durability-low" : ""}">${t("main.durability", "Haltbarkeit")}: ${itemDurability(id)}%</p>
      ${slotRepairCost ? `<p>${t("equipment.repair", "Reparatur")}: ${slotRepairCost} ${t("common.gold", "Gold")}</p>` : ""}
    </div>`;
  }).join("");
}

function renderSmith() {
  setText("smithEyebrow", smithView === "enchant" ? t("enchant.eyebrow", "Arkanistin der Grauwacht") : t("smith.eyebrow", "Zwergenmeister der Grauwacht"));
  setText("smithTitle", smithView === "enchant" ? t("enchant.title", "Mira Nachtfaden") : t("smith.title", "Borin Glutbart"));
  renderSmithMaterials();
  if (smithView === "enchant") {
    renderEnchantStatus();
  } else {
    renderSmithRenown();
  }
  setHidden("smithHome", smithView !== "home");
  setHidden("smithUpgradeSection", smithView !== "upgrade");
  setHidden("smithSalvageSection", smithView !== "salvage");
  setHidden("smithEnchantSection", smithView !== "enchant");

  if (smithView === "home") renderSmithHome();
  if (smithView === "upgrade") renderSmithUpgrade();
  if (smithView === "salvage") renderSmithSalvage();
  if (smithView === "enchant") renderSmithEnchant();
}

function formatSaveDate(value) {
  if (!value) return t("save.notDownloaded", "Noch nicht heruntergeladen");
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return t("common.unknown", "Unbekannt");
  return formatLocalizedDate(date);
}

function renderSaveSummary() {
  const signature = [
    currentLanguage(),
    state.lastSaveExportAt || "",
    state.characterClass,
    state.build,
    state.level,
    state.xp,
    state.gold,
    state.renown,
    selectedZone,
    (state.activeQuests || []).length,
    (state.inventory || []).length,
    (state.pendingLoot || []).length,
    storageStatusSignature(),
  ].join("|");
  if (renderCache.saveSummary === signature) return;
  renderCache.saveSummary = signature;

  const metadata = buildSaveMetadata(state.lastSaveExportAt || "");
  const activeQuestText = t("common.activeCount", "{count} aktiv", { count: metadata.activeQuests });
  const pendingLootText = metadata.pendingLoot ? t("common.openCount", "{count} offen", { count: metadata.pendingLoot }) : t("common.none", "keine");
  $("saveSummary").innerHTML = `
    <section class="save-profile">
      <div>
        <span>${t("common.character", "Charakter")}</span>
        <strong>${escapeHtml(metadata.character)} · ${escapeHtml(metadata.build)}</strong>
      </div>
      <div>
        <span>${t("common.progress", "Fortschritt")}</span>
        <strong>${t("common.level", "Level")} ${metadata.level} · ${t("common.xp", "XP")} ${escapeHtml(metadata.xp)}</strong>
      </div>
    </section>
    <section class="save-grid">
      <div><span>${t("common.gold", "Gold")}</span><strong>${metadata.gold}</strong></div>
      <div><span>${t("common.renown", "Ruhm")}</span><strong>${metadata.renown}</strong></div>
      <div><span>${t("common.zone", "Gebiet")}</span><strong>${escapeHtml(metadata.zone)}</strong></div>
      <div><span>${t("nav.quests", "Quests")}</span><strong>${activeQuestText}</strong></div>
      <div><span>${t("nav.inventory", "Rucksack")}</span><strong>${metadata.inventoryItems} ${t("common.items", "Items")}</strong></div>
      <div><span>${t("loot.eyebrow", "Beute")}</span><strong>${pendingLootText}</strong></div>
    </section>
    <section class="save-file-card">
      <div><span>${t("save.last", "Letzte Sicherung")}</span><strong>${escapeHtml(formatSaveDate(state.lastSaveExportAt))}</strong></div>
      <div><span>${t("save.fileName", "Dateiname")}</span><strong>${escapeHtml(saveFileName())}</strong></div>
    </section>
    ${renderStorageStatus()}
  `;
}

function storageStatusSignature() {
  const status = browserStorageStatus();
  const failedLoad = status.failedLoads[0];
  return [
    status.localStorage.ok ? 1 : 0,
    status.sessionStorage.ok ? 1 : 0,
    status.windowName.ok ? 1 : 0,
    status.loadedFrom || "",
    status.recoveredFrom || "",
    failedLoad ? `${failedLoad.label}:${failedLoad.error}` : "",
  ].join("|");
}

function renderStorageStatus() {
  const status = browserStorageStatus();
  const storageWorks = status.localStorage.ok;
  const fallbackWorks = status.sessionStorage.ok || status.windowName.ok;
  const failedLoad = status.failedLoads[0];
  const headline = storageWorks ? t("save.browserActive", "Browser-Speicher aktiv") : t("save.browserBlocked", "Browser-Speicher blockiert");
  const detail = failedLoad
    ? t("save.readFailed", "{label} konnte nicht gelesen werden: {error}", { label: failedLoad.label, error: failedLoad.error })
    : fallbackWorks
      ? t("save.autoPathReady", "Automatisches Speichern hat mindestens einen funktionierenden Speicherweg.")
      : t("save.useDownload", "Bitte nutze regelmaessig Spielstand herunterladen.");
  const loadedFrom = status.recoveredFrom
    ? t("save.recoveredFrom", "Aus {label} wiederhergestellt", { label: status.recoveredFrom })
    : status.loadedFrom;

  return `
    <section class="save-storage-card ${storageWorks ? "is-ok" : "is-warning"}">
      <div>
        <span>${t("save.storageStatus", "Speicherstatus")}</span>
        <strong>${escapeHtml(headline)}</strong>
      </div>
      <div>
        <span>${t("save.loaded", "Geladen")}</span>
        <strong>${escapeHtml(loadedFrom)}</strong>
      </div>
      <p>${escapeHtml(detail)}</p>
    </section>
  `;
}

const smithDialogues = {
  0: [
    {
      title: "Borin Glutbart hebt den Hammer.",
      text: "Bring mir Erz, nicht Ausreden.",
    },
    {
      title: "Borin mustert deine Ausrüstung.",
      text: "Eine Klinge lügt nicht. Entweder sie hält, oder sie bricht.",
    },
    {
      title: "Der Zwergenmeister nickt knapp.",
      text: "Gold auf den Tisch, Material daneben. Freundliche Worte härten keinen Stahl.",
    },
  ],
  5: [
    {
      title: "Borin erkennt dich wieder.",
      text: "Du kommst öfter zurück, als ich erwartet habe. Gut. Deine Sachen halten schon mehr aus.",
    },
    {
      title: "Borin legt neues Werkzeug bereit.",
      text: "Für dich nehme ich mir einen sauberen Amboss. Reparaturen werden etwas günstiger.",
    },
    {
      title: "Borin schmunzelt trocken.",
      text: "Du überlebst. Das ist in Grauwacht fast schon ein Empfehlungsschreiben.",
    },
  ],
  10: [
    {
      title: "Borin grüßt dich mit einem Nicken.",
      text: "Die Quest-Tafel hört auf deinen Namen. Mehr Aufträge bedeuten mehr Gründe für bessere Klingen.",
    },
    {
      title: "Borin zeigt auf die Wandtafel.",
      text: "Ich habe den Boten gesagt, sie sollen dir mehr Arbeit bringen. Du kannst sie wohl gebrauchen.",
    },
    {
      title: "Der Zwergenmeister prüft eine Klinge im Licht.",
      text: "Verlässliche Hände bekommen verlässliche Aufträge. Such dir aus, was dich nicht umbringt.",
    },
  ],
  15: [
    {
      title: "Borin nimmt sich Zeit.",
      text: "Aus Schrott kann man mehr holen, wenn man weiß, wo man schneiden muss. Ich helfe dir beim Zerlegen.",
    },
    {
      title: "Borin sortiert deine Beute.",
      text: "Wegwerfen wäre Verschwendung. Gib mir die Teile, ich finde noch brauchbares Material darin.",
    },
    {
      title: "Borin klopft gegen den Amboss.",
      text: "Du bringst mir gute Arbeit. Dafür hole ich dir aus altem Zeug ein bisschen mehr heraus.",
    },
  ],
  20: [
    {
      title: "Borin wirkt zufrieden.",
      text: "Jetzt reden wir nicht mehr über Flickwerk. Deine Upgrades bekommen meinen besten Preis.",
    },
    {
      title: "Borin legt die schweren Werkzeuge bereit.",
      text: "Held der Grauwacht, hm? Dann soll deine Ausrüstung auch danach klingen.",
    },
    {
      title: "Borin lächelt fast.",
      text: "Ich feilsche nicht gern. Bei dir mache ich eine Ausnahme. Mach etwas Sinnvolles daraus.",
    },
  ],
  30: [
    {
      title: "Borin senkt die Stimme.",
      text: "Elite-Gegner tragen bessere Spuren am Stahl. Bring sie mir, ich erkenne den Wert.",
    },
    {
      title: "Borin prüft deine Narben.",
      text: "Wer Eliten jagt, braucht mehr als Mut. Deine Beute behandle ich entsprechend.",
    },
    {
      title: "Borin arbeitet ohne aufzusehen.",
      text: "Du suchst die gefährlichen Kämpfe. Gut. Gefährliche Beute lässt sich besser verwerten.",
    },
  ],
  40: [
    {
      title: "Borin spricht wie zu einem Verbündeten.",
      text: "Meister der Grauwacht. Für dich halte ich die seltenen Aufträge nicht mehr unter der Theke.",
    },
    {
      title: "Borin reicht dir das beste Werkzeug.",
      text: "Du hast dir Vertrauen verdient. Wenn etwas Besonderes auftaucht, erfährst du es zuerst.",
    },
    {
      title: "Borin schlägt den Hammer langsam an.",
      text: "Jetzt bauen wir nicht nur Ausrüstung. Jetzt bauen wir Legenden, Stück für Stück.",
    },
  ],
};

function smithDialogueForRank(previous = -1) {
  const rank = renownRank();
  const lines = smithDialogues[rank.threshold] || smithDialogues[0];
  let index = random(0, lines.length - 1);
  if (lines.length > 1 && index === previous) index = (index + 1) % lines.length;
  return { ...lines[index], index };
}

function renderSmithGreetingMarkup() {
  const previous = Number($("smithGreeting")?.dataset.dialogueIndex ?? -1);
  const dialogue = smithDialogueForRank(previous);
  return `<div class="smith-greeting" id="smithGreeting" data-dialogue-index="${dialogue.index}">
    <div class="smith-avatar" aria-hidden="true"></div>
    <div>
      <strong>${escapeHtml(dialogue.title)}</strong>
      <p>"${escapeHtml(dialogue.text)}"</p>
    </div>
  </div>`;
}

function renderSmithMaterials() {
  const signature = `${currentLanguage()}|${state.gold}|${materialsSignature()}`;
  renderCachedHtml("materials", `smithMaterials:${signature}`, () => [
    `<div class="material gold-material"><span>${t("common.gold", "Gold")}</span><strong>${state.gold}</strong></div>`,
    ...Object.entries(materialLabel).map(([id, label]) =>
      `<div class="material"><span>${labelFor(materialLabel, id, label)}</span><strong>${state.materials[id] || 0}</strong></div>`
    ),
  ].join(""));
}

function renderSmithRenown() {
  const rank = renownRank();
  const next = nextRenownRank();
  const signature = `${currentLanguage()}|${state.renown}|${rank.threshold}|${next?.threshold || "max"}`;
  renderCachedHtml("smithRenown", `smithRenown:${signature}`, () => `
    <div>
      <span>${t("smith.renownRank", "Ruhm {renown}", { renown: state.renown })}</span>
      <strong>${escapeHtml(rank.name)}</strong>
    </div>
    <p>${escapeHtml(rank.benefit)}</p>
    <small>${next
      ? t("smith.nextRenown", "Nächster Rang bei {renown} Ruhm: {benefit}", { renown: next.threshold, benefit: next.benefit })
      : t("smith.allRenownUnlocked", "Alle Ruhm-Vorteile freigeschaltet.")}</small>
  `);
}

function renderEnchantStatus() {
  const unlocked = enchantmentsUnlocked();
  const slotLimit = currentEnchantSlotLimit();
  const next = state.enchanting?.active
    ? enchantMasteryRankById(state.enchanting.active)
    : nextEnchantMasteryRank();
  const nextText = next
    ? state.enchanting?.active === next.id
      ? t("enchant.activeMission", "Aktiver Auftrag: {name}", { name: next.name })
      : t("enchant.nextMission", "Nächster Auftrag: {name}", { name: next.name })
    : arcaneMasteryUnlocked()
      ? t("enchant.arcaneComplete", "Arkane Meisterschaft vollständig gebunden.")
      : t("enchant.allBindings", "Alle aktuellen Runenbindungen freigeschaltet.");
  const signature = `${currentLanguage()}|${state.level}|${unlocked ? 1 : 0}|${slotLimit}|${state.enchanting?.active || ""}|${(state.enchanting?.completed || []).join(",")}|${arcaneMasteryUnlocked() ? 1 : 0}`;
  renderCachedHtml("smithRenown", `enchantStatus:${signature}`, () => `
    <div>
      <span>${t("enchant.check", "Arkane Prüfung")}</span>
      <strong>${unlocked ? t("enchant.unlocked", "Zugang geöffnet") : t("enchant.locked", "Noch verschlossen")}</strong>
    </div>
    <p>${unlocked
      ? t("enchant.currentBinding", "Aktuelle Bindung: {slots} Runen-Slot{suffix} pro Item", { slots: slotLimit, suffix: slotLimit === 1 ? "" : "s" })
      : t("enchant.lockedFlavor", "Mira lässt dich zwar herein, aber ihre Runen hören noch nicht auf dich.")}</p>
    <small>${unlocked
      ? escapeHtml(nextText)
      : t("enchant.unlockAt", "Freischaltung bei Level {level}. Aktuell: Level {current}.", { level: 8, current: state.level })}</small>
  `);
}

function renderSmithHome() {
  const shellChanged = renderCachedHtml("smithHome", `smithHome:${currentLanguage()}|${renownRank().threshold}`, () => `
    ${renderSmithGreetingMarkup()}
    <div class="smith-mastery" id="smithMastery"></div>
    <div class="smith-choice-grid">
      <button type="button" data-smith-view="upgrade">
        <strong>${t("smith.upgrade", "Verbessern")}</strong>
        <span>${t("smith.upgradeText", "Ausrüstung mit Gold und Materialien verstärken.")}</span>
      </button>
      <button type="button" data-smith-view="salvage">
        <strong>${t("smith.salvage", "Zerlegen")}</strong>
        <span>${t("smith.salvageText", "Alte Items in Schmiedematerialien zerlegen.")}</span>
      </button>
      <button type="button" data-open-repair>
        <strong>${t("smith.repair", "Reparieren")}</strong>
        <span>${t("smith.repairText", "Ausrüstung beim Schmied für Gold instand setzen.")}</span>
      </button>
    </div>
  `);
  if (shellChanged) elementCache.delete("smithMastery");
  renderSmithMastery();
}

function renderSmithMastery() {
  if (!$("smithMastery")) return;
  renderCachedHtml("smithMastery", `smithMastery:${smithMasterySignature()}`, renderSmithMasteryMarkup);
}

function renderSmithMasteryMarkup() {
  const limit = currentSmithMasteryLimit();
  const discovered = smithMasteryDiscovered();
  const active = smithMasteryRankById(state.smithMastery.active);
  const next = active || nextSmithMasteryRank();
  if (!discovered && next?.id === "emberAnvil") {
    return `
      <div class="smith-mastery-head">
        <div>
          <span>${t("smith.mastery", "Schmied-Meisterschaft")}</span>
          <strong>${t("smith.anvilSilent", "Der Amboss schweigt")}</strong>
        </div>
        <b>${t("smith.hiddenWork", "Verborgene Arbeit")}</b>
      </div>
      <p>"${t("smith.hiddenIntro", "Dein Stahl hat noch Luft. Bring mir erst ein Stück, das keinen einfachen Schlag mehr annimmt.")}"</p>
      <div class="smith-mastery-reward">${t("smith.hiddenReward", "Borin verrät dir mehr, sobald deine Ausrüstung wirklich an ihre Grenze stößt.")}</div>
    `;
  }
  if (!next) {
    return `
      <div class="smith-mastery-head">
        <div>
          <span>${t("smith.mastery", "Schmied-Meisterschaft")}</span>
          <strong>${t("smith.masterMark", "Meisterzeichen der Grauwacht")}</strong>
        </div>
        <b>Limit +${limit}</b>
      </div>
      <p>${t("smith.masterDone", "Deine Ausrüstung trägt Borins stärkste Bindung. Mehr gibt der Amboss nicht her.")}</p>
    `;
  }

  const isActive = state.smithMastery.active === next.id;
  const requirements = smithMasteryRequirementStatus(next);
  const objectives = smithMasteryObjectiveStatus(next);
  const readyToStart = canStartSmithMasteryMission(next);
  const readyToComplete = canCompleteSmithMasteryMission(next);
  const intro = {
    emberAnvil: "Dein Stahl ist an seiner Grenze. Mein Amboss braucht heißeres Feuer.",
    pressureSteel: "Du hast deinen Stahl weit gebracht. Jetzt braucht er Druck, nicht nur Feuer.",
    watchMastermark: "Jetzt reden wir nicht mehr über bessere Arbeit. Jetzt reden wir über einen Schwur im Metall.",
  }[next.id];
  return `
    <div class="smith-mastery-head">
      <div>
        <span>${t("smith.mastery", "Schmied-Meisterschaft")}</span>
        <strong>${escapeHtml(isActive
          ? t("smith.activeMission", "Aktiv: {name}", { name: next.name })
          : t("smith.nextMission", "Nächster Auftrag: {name}", { name: next.name }))}</strong>
      </div>
      <b>Limit +${limit} → +${next.limit}</b>
    </div>
    <p>"${escapeHtml(intro)}"</p>
    ${isActive ? renderSmithMasteryObjectives(objectives) : renderSmithMasteryRequirements(requirements)}
    <div class="smith-mastery-reward">${escapeHtml(next.reward)}</div>
    ${isActive
      ? `<button type="button" data-complete-smith-mission="${next.id}" ${readyToComplete ? "" : "disabled"}>${t("smith.completeMission", "Meisterauftrag abschließen")}</button>`
      : `<button type="button" data-start-smith-mission="${next.id}" ${readyToStart ? "" : "disabled"}>${t("smith.startMission", "Meisterauftrag beginnen")}</button>`}
  `;
}

function renderSmithMasteryRequirements(requirements) {
  return `<div class="smith-mastery-list">
    ${requirements.map((entry) => `<span class="${entry.done ? "done" : "missing"}">${entry.done ? "✓" : "•"} ${escapeHtml(entry.label)}</span>`).join("")}
  </div>`;
}

function renderSmithMasteryObjectives(objectives) {
  return `<div class="smith-mastery-list">
    ${objectives.map((entry) => {
      const done = entry.value >= entry.needed;
      return `<span class="${done ? "done" : "missing"}">${done ? "✓" : "•"} ${escapeHtml(entry.label)} ${Math.min(entry.value, entry.needed)}/${entry.needed}</span>`;
    }).join("")}
  </div>`;
}

function renderEnchantMasteryMarkup() {
  const active = enchantMasteryRankById(state.enchanting?.active);
  const next = active || nextEnchantMasteryRank();

  if (!next) {
    return `
      <div class="smith-mastery-head">
        <div>
          <span>${t("enchant.mastery", "Arkane Meisterschaft")}</span>
          <strong>${t("enchant.circleComplete", "Miras Kreis ist vollständig")}</strong>
        </div>
        <b>${t("enchant.arcane", "Arkan")}</b>
      </div>
      <p>"Jetzt hörst du es auch, oder? Stahl flüstert, wenn die Rune richtig sitzt."</p>
      <div class="smith-mastery-reward">${t("enchant.masterDone", "Alle Runen-Slots und arkane Verzauberungen sind freigeschaltet.")}</div>
    `;
  }

  const isActive = state.enchanting?.active === next.id;
  const requirements = enchantMasteryRequirementStatus(next);
  const objectives = enchantMasteryObjectiveStatus(next);
  const readyToStart = canStartEnchantMasteryMission(next);
  const readyToComplete = canCompleteEnchantMasteryMission(next);
  const intro = {
    unstableRunes: "Die erste Rune hält. Jetzt will ich sehen, ob sie auch unter Druck singt.",
    forbiddenLibrary: "Drei Bindungen brauchen Wissen, das man nicht offen liegen lässt.",
    voidRitual: "Die Leere beantwortet nur Fragen, die klug genug gestellt werden.",
  }[next.id] || "Magie ist kein Schmuck. Sie ist ein Handel.";
  const badge = next.arcaneMastery
    ? t("enchant.mastery", "Arkane Meisterschaft")
    : `Slots ${currentEnchantSlotLimit()} → ${next.slotLimit}`;

  return `
    <div class="smith-mastery-head">
      <div>
        <span>${t("enchant.masterMission", "Miras Meisterauftrag")}</span>
        <strong>${escapeHtml(isActive
          ? t("enchant.activeMission", "Aktiver Auftrag: {name}", { name: next.name })
          : t("enchant.nextMission", "Nächster Auftrag: {name}", { name: next.name }))}</strong>
      </div>
      <b>${escapeHtml(badge)}</b>
    </div>
    <p>"${escapeHtml(intro)}"</p>
    ${isActive ? renderEnchantMasteryObjectives(objectives) : renderEnchantMasteryRequirements(requirements)}
    <div class="smith-mastery-reward">${escapeHtml(next.reward)}</div>
    ${isActive
      ? `<button type="button" data-complete-enchant-mission="${next.id}" ${readyToComplete ? "" : "disabled"}>${t("enchant.completeMission", "Ritual vollenden")}</button>`
      : `<button type="button" data-start-enchant-mission="${next.id}" ${readyToStart ? "" : "disabled"}>${t("enchant.startMission", "Arkanen Auftrag beginnen")}</button>`}
  `;
}

function renderEnchantMasteryRequirements(requirements) {
  return `<div class="smith-mastery-list">
    ${requirements.map((entry) => `<span class="${entry.done ? "done" : "missing"}">${entry.done ? "✓" : "•"} ${escapeHtml(entry.label)}</span>`).join("")}
  </div>`;
}

function renderEnchantMasteryObjectives(objectives) {
  return `<div class="smith-mastery-list">
    ${objectives.map((entry) => {
      const done = entry.value >= entry.needed;
      return `<span class="${done ? "done" : "missing"}">${done ? "✓" : "•"} ${escapeHtml(entry.label)} ${Math.min(entry.value, entry.needed)}/${entry.needed}</span>`;
    }).join("")}
  </div>`;
}

function renderSmithUpgrade() {
  const signature = [
    currentLanguage(),
    state.gold,
    state.renown,
    materialsSignature(),
    equipmentSignature(),
    currentSmithMasteryLimit(),
  ].join("|");
  if (renderCache.smithUpgrade === signature) return;
  renderCache.smithUpgrade = signature;

  $("smithGrid").innerHTML = equipmentSlots.map((slot) => {
    const itemId = state.equipment[slot];
    const item = getItem(itemId);
    if (!item) return "";
    const quality = itemQuality(item);
    const cost = upgradeCost(item);
    const preview = previewUpgradedItem(item);
    const damageGain = preview.damage - item.damage;
    const defenseGain = preview.defense - item.defense;
    const critChanceGain = (preview.critChance || 0) - (item.critChance || 0);
    const critDamageGain = (preview.critDamage || 0) - (item.critDamage || 0);
    const statText = itemStatText(item, { damage: "Dmg", defense: "Def" });
    const previewStatText = itemStatText(preview, { damage: "Dmg", defense: "Def" });
    const critGainText = [
      critChanceGain ? `Crit <b>+${formatPercent(critChanceGain)}</b>` : "",
      critDamageGain ? `${t("stat.critDamage", "Crit-Schaden")} <b>+${formatPercent(critDamageGain)}</b>` : "",
    ].filter(Boolean).join(" · ");
    const materialText = Object.entries(cost.materials)
      .filter(([, amount]) => amount > 0)
      .map(([id, amount]) => `${labelFor(materialLabel, id)} ${state.materials[id] || 0}/${amount}`)
      .join(" · ");
    const discountText = renownUpgradeDiscount() ? ` · ${t("smith.renownDiscount", "Ruhm-Rabatt aktiv")}` : "";
    const limit = currentSmithMasteryLimit();
    const maxed = (item.upgrade || 0) >= limit;
    const hardMaxed = (item.upgrade || 0) >= 20;
    const disabled = maxed || !canPayUpgradeCost(cost);
    const costHtml = maxed
      ? `<p>${hardMaxed ? t("smith.masterworkDone", "Meisterarbeit vollendet") : t("smith.missionNeeded", "Meisterauftrag nötig")}</p><p class="smith-material-cost">${hardMaxed ? t("smith.noFurtherBinding", "Borin kann dieses Stück nicht weiter binden.") : t("smith.unlockNextLimit", "Schalte das nächste globale Limit frei.")}</p>`
      : `<p>${cost.gold} ${t("common.gold", "Gold")}${discountText}</p><p class="smith-material-cost">${materialText}</p>`;
    return `<div class="smith-card rarity-card rarity-${quality}">
      <div class="smith-item-main">
        <strong>${labelFor(slotLabel, slot)} · <span class="quality-${quality}">${escapeHtml(item.name)}</span></strong>
        <p>+${item.upgrade || 0}/${limit}${statText ? ` · ${statText}` : ""} · ${t("main.durability", "Haltbarkeit")} ${itemDurability(itemId)}%</p>
      </div>
      <button class="upgrade-preview" type="button" data-upgrade="${slot}" ${disabled ? "disabled" : ""}>
        <span>${hardMaxed ? t("smith.masterworkDone", "Meisterarbeit vollendet") : maxed ? t("smith.limitReached", "Limit erreicht") : t("smith.afterUpgrade", "Nach Upgrade")}</span>
        <strong>${maxed ? `+${item.upgrade || 0}/${limit}` : `+${preview.upgrade}/${limit}${previewStatText ? ` · ${previewStatText}` : ""}`}</strong>
        <em>${[
          maxed && !hardMaxed ? t("smith.missionNeededAtBorin", "Meisterauftrag bei Borin nötig") : "",
          damageGain && !maxed ? `Dmg <b>+${damageGain}</b>` : "",
          defenseGain && !maxed ? `Def <b>+${defenseGain}</b>` : "",
          !maxed ? critGainText : "",
        ].filter(Boolean).join(" · ")}</em>
      </button>
      <div class="smith-cost-block">
        ${costHtml}
      </div>
    </div>`;
  }).join("");
}

function renderSmithEnchant() {
  const mastery = $("enchantMastery");
  if (!enchantmentsUnlocked()) {
    mastery.hidden = true;
    if (mastery.innerHTML) mastery.innerHTML = "";
    renderCache["html:enchantMastery"] = "";
    delete renderCache.enchantGrid;
    renderCachedHtml("enchantGrid", `enchantLocked:${currentLanguage()}|${state.level}`, () => `
      <div class="enchant-locked">
        <div>
          <span>${t("enchant.shop", "Arkaner Laden")}</span>
          <strong>${t("enchant.lockedTitle", "Mira Nachtfaden hebt nur eine Augenbraue.")}</strong>
        </div>
        <p>"${t("enchant.lockedQuote", "Süß. Du willst Magie an Stahl binden, aber deine Seele stolpert noch über Kieselsteine. Komm wieder, wenn du nicht mehr nach Tutorial riechst.")}"</p>
        <div class="enchant-lock-requirements">
          <span class="${state.level >= 8 ? "done" : "missing"}">${state.level >= 8 ? "✓" : "•"} ${t("enchant.reachLevel", "Level {level} erreichen", { level: 8 })}</span>
          <span class="missing">• ${t("enchant.unlockSimpleRunes", "Danach einfache Runen freischalten")}</span>
          <span class="missing">• ${t("enchant.lockedUntil", "Verzauberungen bleiben bis dahin gesperrt")}</span>
        </div>
      </div>
    `);
    return;
  }

  mastery.hidden = false;
  renderCache["html:enchantGrid"] = "";
  renderCachedHtml("enchantMastery", `enchantMastery:${enchantingSignature()}`, renderEnchantMasteryMarkup);
  const cost = enchantCost();
  const costText = `${cost.gold} Gold · ${Object.entries(cost.materials)
    .map(([id, amount]) => `${labelFor(materialLabel, id)} ${state.materials[id] || 0}/${amount}`)
    .join(" · ")}`;
  const slotLimit = currentEnchantSlotLimit();
  const gridSignature = [
    currentLanguage(),
    state.gold,
    materialsSignature(),
    equipmentSignature(),
    slotLimit,
    allowedEnchantRarities().join(","),
    arcaneMasteryUnlocked() ? 1 : 0,
  ].join("|");
  if (renderCache.enchantGrid === gridSignature) return;
  renderCache.enchantGrid = gridSignature;

  $("enchantGrid").innerHTML = equipmentSlots.map((slot) => {
    const itemId = state.equipment[slot];
    const item = getItem(itemId);
    if (!item) return "";
    const quality = itemQuality(item);
    const savedEnchantments = savedItemEnchantments(item);
    const enchantments = activeItemEnchantments(item);
    const inactiveEnchantments = inactiveItemEnchantments(item);
    const freeSlots = Math.max(0, slotLimit - savedEnchantments.length);
    const full = freeSlots <= 0;
    const cannotPay = !canPayCost(cost);
    const enchantmentText = enchantments.length
      ? enchantments.map((enchantment) => `${escapeHtml(enchantment.name)}: ${escapeHtml(enchantment.text)}`).join("<br>")
      : t("enchant.notEnchanted", "Noch nicht verzaubert.");
    const lockedText = inactiveEnchantments.length
      ? `<br><span class="muted">${t("enchant.lockedRunes", "Gesperrt bis höhere Bindung")}: ${inactiveEnchantments.map((enchantment) => escapeHtml(enchantment.name)).join(", ")}</span>`
      : "";
    return `<div class="enchant-card rarity-card rarity-${quality}">
      <div>
        <strong>${labelFor(slotLabel, slot)} · <span class="quality-${quality}">${escapeHtml(item.name)}</span></strong>
        <p>${labelFor(qualityLabel, quality)} · Slots ${Math.min(savedEnchantments.length, slotLimit)}/${slotLimit}${inactiveEnchantments.length ? ` · ${inactiveEnchantments.length} ${t("enchant.locked", "gesperrt")}` : ""}</p>
        <p>${enchantmentText}${lockedText}</p>
      </div>
      <div class="enchant-actions">
        ${Object.entries(enchantmentCategoryLabel).map(([category, label]) => {
          const hasPool = enchantmentPool(slot, category, item).length > 0;
          const disabled = full || cannotPay || !hasPool;
          const categoryLabel = t(`enchant.category.${category}`, label);
          return `<button type="button" data-enchant-slot="${slot}" data-enchant-category="${category}" ${disabled ? "disabled" : ""}>
            <strong>${escapeHtml(categoryLabel)}</strong>
            <span>${hasPool ? t("enchant.castRune", "Rune wirken") : t("enchant.noRune", "Keine passende Rune")}</span>
          </button>`;
        }).join("")}
      </div>
      <small>${full ? t("enchant.slotsFull", "Alle aktuellen Slots belegt.") : `${t("enchant.ritualCost", "Ritualkosten")}: ${costText}`}</small>
    </div>`;
  }).join("");
}

function renderSmithSalvage() {
  $("salvageAllBtn").disabled = !state.inventory.length;
  const signature = `${currentLanguage()}|${state.renown}|${inventorySignature()}`;
  if (renderCache.smithSalvage === signature) return;
  renderCache.smithSalvage = signature;

  $("salvageList").innerHTML = state.inventory.length
    ? state.inventory.map((itemId, index) => {
        const item = getItem(itemId);
        const quality = itemQuality(item);
        const slot = itemSlot(item);
        const materials = Object.entries(salvageValue(item)).map(([id, amount]) => `${amount} ${labelFor(materialLabel, id)}`).join(" · ");
        const bonusChance = Math.round(renownSalvageBonusChance(item) * 100);
        return `<div class="salvage-row rarity-card rarity-${quality}">
          <span><strong class="quality-${quality}">${escapeHtml(item.name)}</strong><small>${labelFor(slotLabel, slot)} · ${labelFor(qualityLabel, quality)} · ${materials}${bonusChance ? ` · ${bonusChance}% ${t("smith.bonus", "Bonus")}` : ""}</small></span>
          <button type="button" data-salvage="${index}">${t("smith.salvage", "Zerlegen")}</button>
        </div>`;
      }).join("")
    : `<div class="inventory-empty">${t("smith.noSalvageItems", "Keine Items im Rucksack zum Zerlegen.")}</div>`;

}

function renderInventory() {
  renderCachedHtml("inventorySummary", `${currentLanguage()}|${state.inventory.length}|${state.gold}`, () =>
    `<span>${t("common.items", "Items")}: <strong>${state.inventory.length}</strong></span><span>${t("common.gold", "Gold")}: <strong>${state.gold}</strong></span>`
  );
  $("sellAllBtn").disabled = !state.inventory.length;
  const signature = `${currentLanguage()}|${inventorySignature()}|${equipmentSignature()}`;
  if (renderCache.inventory === signature) return;
  renderCache.inventory = signature;

  if (!state.inventory.length) {
    $("inventory").innerHTML = `<div class="inventory-empty">${t("inventory.emptyShort", "Noch keine Items im Inventar.")}</div>`;
    return;
  }

  $("inventory").innerHTML = state.inventory.map((itemId, index) => {
    const item = getItem(itemId);
    if (!item) return "";
    const quality = itemQuality(item);
    const slot = itemSlot(item);
    const current = getItem(state.equipment[slot]);
    const compare = compareLoot(item, current);
    const statText = itemStatText(item);
    const enchantText = itemEnchantmentsText(item);
    return `<div class="inventory-item rarity-card rarity-${quality}">
      <strong class="quality-${quality}">${escapeHtml(item.name)}</strong>
      <p>${labelFor(slotLabel, slot)} · ${labelFor(qualityLabel, quality)} · ${t("common.value", "Wert")} ${sellValue(item)} ${t("common.gold", "Gold")}</p>
      ${item.set ? `<p class="set-line">${escapeHtml(setBonuses[item.set]?.name || item.set)}</p>` : ""}
      ${statText ? `<p>${statText}</p>` : ""}
      ${enchantText ? `<p>${enchantText}</p>` : ""}
      <p>${t("main.durability", "Haltbarkeit")}: ${itemDurability(itemId)}%</p>
      <div class="loot-compare compact">
        ${renderCompareSpans(compare, 3)}
      </div>
      <div class="inventory-actions">
        <button type="button" data-equip="${index}">${t("inventory.equip", "Ausrüsten")}</button>
        <button class="sell-button" type="button" data-sell="${index}">${t("inventory.sell", "Verkaufen")}</button>
      </div>
    </div>`;
  }).join("");

}

function renderQuests() {
  state.activeQuests = state.activeQuests.filter((id) => !state.completedQuests.includes(id));
  const active = state.activeQuests.map(getQuestById).filter(Boolean);
  const signature = `${currentLanguage()}|${active.map((quest) => `${quest.id}:${Math.floor(state.quests[quest.id] || 0)}:${state.completedQuests.includes(quest.id) ? 1 : 0}`).join("|") || "empty"}`;
  if (renderCache.quests === signature) return;
  renderCache.quests = signature;

  if (!active.length) {
    $("quests").innerHTML = `<div class="inventory-empty">${t("quest.none", "Keine aktive Quest. Öffne die Quest-Tafel.")}</div>`;
    return;
  }

  $("quests").innerHTML = active.map((quest) => {
    const value = Math.floor(state.quests[quest.id] || 0);
    const done = state.completedQuests.includes(quest.id);
    const rarity = escapeToken(quest.rarity || (quest.rare ? "legendary" : "common"), ["common", "rare", "epic", "legendary"], "common");
    return `<div class="quest rarity-card rarity-${rarity} ${done ? "done" : ""}">
      <div class="quest-head">
        <strong><span class="quality-${rarity}">${labelFor(rarityLabel, rarity)}</span> · ${escapeHtml(quest.name)}</strong>
        <button class="quest-delete" type="button" data-cancel-quest="${quest.id}">${t("quest.delete", "Löschen")}</button>
      </div>
      <p>${escapeHtml(quest.text)}</p>
      <p>${done ? t("quest.completed", "Abgeschlossen") : `${value}/${quest.needed}`} · ${t("common.reward", "Belohnung")}: ${quest.rewardXp} ${t("common.xp", "XP")}, ${quest.rewardGold} ${t("common.gold", "Gold")}, ${questRenownReward(quest)} ${t("common.renown", "Ruhm")}</p>
    </div>`;
  }).join("");
}

function questBoardSourceSignature() {
  return [
    currentQuestEnemyId(),
    state.renown,
    renownQuestBoardSize(),
    (state.questBoard || []).join(","),
    (state.activeQuests || []).join(","),
    (state.completedQuests || []).join(","),
    Object.keys(state.rareQuests || {}).sort().join(","),
  ].join("|");
}

function syncQuestBoardForRender() {
  const signature = questBoardSourceSignature();
  if (renderCache.questBoardSource === signature) return;

  state.questBoard = uniqueQuestIds(state.questBoard || [])
    .filter((id) => !isQuestCompletedPermanent(id))
    .filter((id) => !isQuestActive(id))
    .filter((id) => {
      const quest = getQuestById(id);
      return quest && questRelevantForCurrentEnemy(quest);
    });

  if (state.questBoard.length < renownQuestBoardSize()) {
    refreshQuestBoard(true);
  }

  renderCache.questBoardSource = questBoardSourceSignature();
}

function renderQuestBoard() {
  syncQuestBoardForRender();
  const boardQuests = state.questBoard.map(getQuestById).filter(Boolean);
  const signature = `${currentLanguage()}|${currentQuestEnemyId()}|${(state.unseenQuests || []).join(",")}|${boardQuests.map((quest) => {
    const active = isQuestActive(quest.id);
    return `${quest.id}:${active ? 1 : 0}:${Math.floor(state.quests[quest.id] || 0)}:${isQuestCompletedPermanent(quest.id) ? 1 : 0}`;
  }).join("|") || "empty"}`;
  if (renderCache.questBoard === signature) return;
  renderCache.questBoard = signature;

  if (!boardQuests.length) {
    $("questBoard").innerHTML = `<div class="inventory-empty">${t("quest.emptyBoard", "Die Tafel ist leer. Gewonnene Kämpfe bringen bald neue Aufträge.")}</div>`;
    return;
  }

  $("questBoard").innerHTML = boardQuests.map((quest) => {
    const active = isQuestActive(quest.id);
    const isNew = (state.unseenQuests || []).includes(quest.id);
    const value = Math.floor(state.quests[quest.id] || 0);
    const progress = active ? `${value}/${quest.needed}` : t("quest.notAccepted", "Noch nicht angenommen");
    const levelRange = questLevelForCurrentEnemy(quest);
    const button = active
        ? `<button type="button" disabled>${t("quest.accepted", "Angenommen")}</button>`
        : `<button type="button" data-accept-quest="${quest.id}">${t("quest.accept", "Quest annehmen")}</button>`;

    const rarity = escapeToken(quest.rarity || (quest.rare ? "legendary" : "common"), ["common", "rare", "epic", "legendary"], "common");
    return `<div class="quest-offer rarity-card rarity-${rarity} ${active ? "active" : ""} ${quest.rare ? "rare" : ""} ${isNew ? "new" : ""}">
      <strong class="quest-offer-title"><span class="quality-${rarity}">${labelFor(rarityLabel, rarity)}</span> · ${escapeHtml(quest.name)}${isNew ? `<em>${t("common.new", "Neu")}</em>` : ""}</strong>
      <div class="quest-offer-body">
        <p>${escapeHtml(quest.text)}</p>
        <p>${t("common.status", "Status")}: ${progress}</p>
      </div>
      <div class="reward-list">
        <span>${levelRange || t("zone.currentArea", "Aktuelles Gebiet")}</span>
        <span>${t("common.reward", "Belohnung")}: ${quest.rewardXp} ${t("common.xp", "XP")}</span>
        <span>${t("common.gold", "Gold")}: ${quest.rewardGold}</span>
        <span>${t("common.renown", "Ruhm")}: ${questRenownReward(quest)}</span>
        ${quest.rewardItem ? `<span>${t("quest.itemReward", "Item")}: ${quest.rare ? t("quest.legendary", "legendär") : t("quest.epic", "episch")}</span>` : ""}
      </div>
      <div class="quest-offer-action">${button}</div>
    </div>`;
  }).join("");

}

function acceptQuest(questId) {
  if (isQuestActive(questId) || state.completedQuests.includes(questId)) return;
  const quest = getQuestById(questId);
  if (!questAvailable(quest)) {
    log(t("quest.notReadyArea", "Diese Quest passt noch nicht zu deinen freigeschalteten Gebieten."), "bad");
    render();
    return;
  }
  state.activeQuests.push(questId);
  state.questBoard = state.questBoard.filter((id) => id !== questId);
  forgetNewQuest(questId);
  state.quests[questId] = state.quests[questId] || 0;
  log(t("quest.acceptLog", "Quest angenommen: {quest}.", { quest: quest.name }), "drop");
  save();
  render();
}

function isQuestActive(questId) {
  return Array.isArray(state.activeQuests)
    ? state.activeQuests.includes(questId)
    : Boolean(state.quests?.[questId] || state.completedQuests.includes(questId));
}

function renderBestiary() {
  const container = $("bestiary");
  if (bestiaryListDirty || !container.querySelector(".bestiary-list")) {
    bestiaryListHtml = renderBestiaryList();
    container.innerHTML = `${bestiaryListHtml}<div class="bestiary-detail" id="bestiaryDetail"></div>`;
    elementCache.delete("bestiaryDetail");
    renderCache.bestiaryDetail = "";
    bestiaryListDirty = false;
  }
  updateBestiaryActiveCard();
  renderBestiaryDetail();
}

function renderBestiaryList() {
  const zone = zones[selectedBestiaryZone] || zones.meadow;
  const entries = zone.enemies.map((id) => [id, enemies[id]]).filter(([, enemy]) => enemy);
  return `<div class="bestiary-list">
    <div class="bestiary-zone-tabs">
      ${Object.entries(zones).map(([id, zoneData]) => `<button class="${id === selectedBestiaryZone ? "active" : ""}" type="button" data-bestiary-zone="${id}">
        <strong>${escapeHtml(zoneDisplayName(id))}</strong>
        <span>${zoneData.enemies.length}</span>
      </button>`).join("")}
    </div>
    ${entries.map(([id, enemy]) => {
      const completion = lootCompletion(id);
      return `<button class="bestiary-card ${id === selectedBestiaryEnemy ? "active" : ""}" type="button" data-bestiary="${id}">
        <strong>${escapeHtml(enemy.name)}</strong>
        <p>${t("bestiary.collection", "Sammlung {found}/{total}", { found: completion.found, total: completion.total })} ${t("bestiary.discovered", "entdeckt")}</p>
        <div class="completion-bar" aria-label="Entdeckter Ausrüstungsfortschritt"><span style="width:${completion.percent}%"></span></div>
      </button>`;
    }).join("")}
  </div>`;
}

function updateBestiaryActiveCard() {
  $("bestiary").querySelectorAll("[data-bestiary]").forEach((button) => {
    button.classList.toggle("active", button.dataset.bestiary === selectedBestiaryEnemy);
  });
}

function renderBestiaryDetail() {
  const detailEnemy = enemies[selectedBestiaryEnemy] || enemies.wolf;
  const discovered = groupedBestiaryLoot(selectedBestiaryEnemy);
  const detail = document.getElementById("bestiaryDetail");
  if (!detail) return;
  const signature = bestiaryDetailSignature(selectedBestiaryEnemy, detailEnemy, discovered);
  if (renderCache.bestiaryDetail === signature) return;
  renderCache.bestiaryDetail = signature;
  const categories = bestiaryCategories(selectedBestiaryEnemy, detailEnemy, discovered);
  const categoryRows = renderBestiaryCategoryRows(selectedBestiaryEnemy, detailEnemy, discovered);

  detail.innerHTML = `
    <div class="detail-head">
      <div>
        <p class="eyebrow">${escapeHtml(zoneDisplayName(zoneKeyForEnemy(selectedBestiaryEnemy)))}</p>
        <h2>${escapeHtml(detailEnemy.name)}</h2>
      </div>
    </div>
    <p>${t("common.level", "Level")} ${detailEnemy.level}${detailEnemy.boss ? ` · ${t("common.boss", "Boss")}` : detailEnemy.elite ? ` · ${t("common.elite", "Elite")}` : ""} · ${detailEnemy.hp} ${t("main.life", "Leben")} · ${detailEnemy.damage[0]}-${detailEnemy.damage[1]} ${t("main.damage", "Schaden")} · ${detailEnemy.defense} ${t("main.defense", "Rüstung")} · Crit ${formatPercent(enemyCriticalStats(detailEnemy).critChance)} / ${formatPercent(enemyCriticalStats(detailEnemy).critDamage)} · Quest-Schriftrolle ${formatChance(rareQuestDropChance(detailEnemy))}</p>
    ${renderBossRewardPanel(selectedBestiaryEnemy, detailEnemy)}
    ${renderEnemyAbilities(detailEnemy)}
    <h3>${t("bestiary.collection", "Sammlung {found}/{total}", lootCompletion(selectedBestiaryEnemy))}</h3>
    <div class="bestiary-category-grid">
      ${categories.map((category) => `<button class="bestiary-category ${selectedBestiaryCategory === category.id ? "active" : ""}" type="button" data-bestiary-category="${category.id}">
        <strong>${escapeHtml(category.label)}</strong>
        <span>${category.count}</span>
      </button>`).join("")}
    </div>
    ${selectedBestiaryCategory === "overview" ? "" : renderBestiaryFilters()}
    <div class="bestiary-content-grid">
      <div class="drop-list">${categoryRows}</div>
      ${renderBestiaryItemDetail(selectedBestiaryEnemy, detailEnemy, discovered)}
    </div>
    <p class="loot-note">${t("bestiary.note", "Items werden zusammengefasst, seitenweise geladen und Details erscheinen direkt neben der Liste.")}</p>
  `;
}

function bestiaryDetailSignature(enemyId, enemy, discovered) {
  const discoveredSignature = discovered
    .map((item) => `${bestiaryItemKey(item)}:${item.damage}:${item.defense}:${item.critChance || 0}:${item.critDamage || 0}:${item.effect || ""}:${item.set || ""}`)
    .join("|");
  return [
    currentLanguage(),
    enemyId,
    enemy.level,
    enemy.hp,
    enemy.damage?.join("-"),
    enemy.defense,
    enemyCriticalStats(enemy).critChance,
    enemyCriticalStats(enemy).critDamage,
    Array.isArray(state.defeatedBosses) ? state.defeatedBosses.join(",") : "",
    (enemy.drops || []).map((drop) => `${drop.id}:${drop.chance}`).join(","),
    bossFirstClearRewardText(enemy),
    selectedBestiaryCategory,
    selectedBestiaryFilter,
    selectedBestiarySearch,
    selectedBestiaryPage,
    selectedBestiaryItemKey,
    discoveredSignature,
  ].join("~");
}

function renderBossRewardPanel(enemyId, enemy) {
  if (!enemy?.boss) return "";
  const reward = bossFirstClearRewardText(enemy);
  const claimed = bossFirstClearClaimed(enemyId);
  const drops = (enemy.drops || []).map((drop) => {
    const item = getItem(drop.id);
    const quality = itemQuality(item);
    return `<div class="boss-reward-drop">
      <strong class="quality-${quality}">${escapeHtml(item.name)}</strong>
      <span>${labelFor(qualityLabel, quality)} · ${labelFor(slotLabel, itemSlot(item))} · ${formatChance(drop.chance)}</span>
    </div>`;
  }).join("");

  return `<section class="boss-reward-panel">
    <div>
      <p class="eyebrow">${t("bestiary.dungeonReward", "Dungeon-Belohnung")}</p>
      <strong>${claimed ? t("bestiary.firstWinClaimed", "Erster Sieg bereits geholt") : t("bestiary.firstWin", "Erster Sieg")}</strong>
      <span>${escapeHtml(reward || t("bestiary.noSpecialReward", "Keine Sonderbelohnung"))}</span>
    </div>
    <div class="boss-reward-grid">
      ${drops || `<span>${t("bestiary.noBossLoot", "Keine feste Bossbeute")}</span>`}
    </div>
  </section>`;
}

function renderEnemyAbilities(enemy) {
  const entries = enemyAbilityEntries(enemy);
  if (!entries.length) return "";
  return `<section class="enemy-ability-list" aria-label="${t("bestiary.enemyAbilities", "Gegnerfähigkeiten")}">
    ${entries.map(([id, ability]) => `<div class="enemy-ability ${ability.type === "passive" ? "passive" : ""}" data-enemy-ability="${escapeAttr(id)}">
      <strong>${escapeHtml(ability.name)}</strong>
      <span>${ability.type === "passive" ? t("bestiary.passive", "Passiv") : t("bestiary.active", "Aktiv")} · ${escapeHtml(ability.text)}</span>
    </div>`).join("")}
  </section>`;
}

function bestiaryCategories(enemyId, enemy, discovered = groupedBestiaryLoot(enemyId)) {
  const generated = generatedBestiaryTemplates(enemy);
  const countGroup = (group) => generated.filter((item) => bestiaryItemGroup(item) === group).length;
  return [
    { id: "overview", label: t("bestiary.categoryOverview", "Übersicht"), count: generated.length + enemy.drops.length },
    { id: "weapon", label: t("bestiary.categoryWeapons", "Waffen"), count: countGroup("weapon") },
    { id: "armor", label: t("bestiary.categoryArmor", "Rüstung"), count: countGroup("armor") },
    { id: "jewelry", label: t("bestiary.categoryJewelry", "Schmuck"), count: countGroup("jewelry") },
    { id: "materials", label: t("bestiary.materials", "Materialien"), count: (materialDrops[enemyId] || []).length },
    { id: "fixed", label: t("bestiary.categoryFixed", "Feste Drops"), count: enemy.drops.length },
    { id: "sets", label: t("bestiary.categorySets", "Set-Items"), count: discovered.filter((item) => item.set).length },
  ].filter((category) => category.id === "overview" || category.count > 0);
}

function renderBestiaryCategoryRows(enemyId, enemy, discovered = groupedBestiaryLoot(enemyId)) {
  if (selectedBestiaryCategory === "overview") {
    return renderBestiaryOverview(enemyId, enemy, discovered);
  }
  if (selectedBestiaryCategory === "fixed") {
    return renderFixedDropRows(enemyId, enemy);
  }
  if (selectedBestiaryCategory === "materials") {
    return renderMaterialDropRows(enemyId);
  }
  return renderDiscoveredLootRows(enemyId, selectedBestiaryCategory, discovered);
}

function renderBestiaryOverview(enemyId, enemy, discovered = groupedBestiaryLoot(enemyId)) {
  return renderAllBestiaryRows(enemyId, enemy, discovered);
}

function renderAllBestiaryRows(enemyId, enemy, discovered = groupedBestiaryLoot(enemyId)) {
  const fixedRows = enemy.drops.map((drop) => renderFixedDropRow(enemyId, drop));
  const discoveredLookup = discoveredLootLookup(discovered);
  const generatedRows = [...generatedBestiaryTemplates(enemy)]
    .sort((a, b) => bestiaryRowRank(b) - bestiaryRowRank(a) || a.name.localeCompare(b.name))
    .map((template) => renderGeneratedDropRow(template, discoveredLookup));
  const materialRows = (materialDrops[enemyId] || []).map((drop) => `<button class="drop-row bestiary-item-row material-hover-row" type="button" data-bestiary-material="${drop.id}" data-material-id="${drop.id}">
    <span><b>${labelFor(materialLabel, drop.id)}</b><small>${t("bestiary.materialForSmith", "Material fürs Schmieden")}</small></span>
    <span>${drop.min}-${drop.max}</span>
  </button>`);
  const rows = [...fixedRows, ...generatedRows, ...materialRows];
  return rows.length ? rows.join("") : `<div class="drop-row"><span>${t("bestiary.nothingDiscovered", "Noch nichts entdeckt")}</span><span>-</span></div>`;
}

function renderFixedDropRows(enemyId, enemy) {
  return enemy.drops.length
    ? enemy.drops.map((drop) => renderFixedDropRow(enemyId, drop)).join("")
    : `<div class="drop-row"><span>${t("bestiary.noFixedDrops", "Keine festen seltenen Drops")}</span><span>-</span></div>`;
}

function renderFixedDropRow(enemyId, drop) {
  const item = getItem(drop.id);
  const quality = itemQuality(item);
  const slot = itemSlot(item);
  const key = `fixed:${drop.id}`;
  const discovered = state.discoveredLoot[enemyId]?.[key];
  const known = Boolean(discovered);
  const status = known ? ((discovered.count || 0) <= 1 ? t("common.new", "Neu") : t("common.known", "Bekannt")) : t("common.unknown", "Unbekannt");
  return `<button class="drop-row bestiary-item-row ${known ? "item-hover-row" : "locked-drop"}" type="button" data-bestiary-item="${escapeAttr(key)}" ${known ? `data-tooltip-key="${cacheTooltipItem(item)}"` : ""}>
    <span><b class="quality-${quality}">${escapeHtml(item.name)}</b><small>${t("bestiary.fixedDrop", "Fester Drop")} · ${labelFor(qualityLabel, quality)} · ${labelFor(slotLabel, slot)} · ${t("common.chance", "Chance")} ${formatChance(drop.chance)}</small></span>
    <span>${status}</span>
  </button>`;
}

function renderMaterialDropRows(enemyId) {
  const drops = materialDrops[enemyId] || [];
  return drops.length
    ? drops.map((drop) => `<button class="drop-row bestiary-item-row material-hover-row" type="button" data-bestiary-material="${drop.id}" data-material-id="${drop.id}">
        <span><b>${labelFor(materialLabel, drop.id)}</b><small>${t("bestiary.materialForSmith", "Material fürs Schmieden")}</small></span>
        <span>${drop.min}-${drop.max}</span>
      </button>`).join("")
    : `<div class="drop-row"><span>${t("bestiary.noMaterials", "Keine Materialien bekannt")}</span><span>-</span></div>`;
}

function lootCompletion(enemyId) {
  const enemy = enemies[enemyId];
  const discovered = groupedBestiaryLoot(enemyId).length;
  const generatedLimit = generatedLootPoolCount(enemy);
  const total = enemy.drops.length + generatedLimit;
  const fixedFound = enemy.drops.filter((drop) => state.discoveredLoot[enemyId]?.[`fixed:${drop.id}`]).length;
  const generatedFound = Math.min(generatedLimit, discovered);
  const found = Math.min(total, fixedFound + generatedFound);
  return {
    found,
    total,
    percent: Math.min(100, Math.round((found / total) * 100)),
  };
}

function generatedLootPoolCount(enemy) {
  return generatedBestiaryTemplates(enemy).length;
}

function pruneBestiaryLoot(enemyId) {
  const enemy = enemies[enemyId];
  const drops = state.discoveredLoot[enemyId];
  if (!enemy || !drops) return;

  const fixedDrops = {};
  const generatedDrops = Object.entries(drops)
    .filter(([, item]) => {
      if (item?.fixed) {
        fixedDrops[`fixed:${item.id}`] = item;
        return false;
      }
      return true;
    })
    .sort(([, a], [, b]) => itemScore(b) - itemScore(a));

  const generatedLimit = generatedLootPoolCount(enemy);
  state.discoveredLoot[enemyId] = {
    ...fixedDrops,
    ...Object.fromEntries(generatedDrops.slice(0, generatedLimit)),
  };
}

function renderDiscoveredLootRows(enemyId, category, discovered = groupedBestiaryLoot(enemyId)) {
  const enemy = enemies[enemyId];
  const discoveredLookup = discoveredLootLookup(discovered);
  const possible = category === "sets"
    ? discovered.filter((item) => item.set)
    : generatedBestiaryTemplates(enemy).filter((item) => bestiaryItemGroup(item) === category);
  const filtered = filterBestiaryLoot(possible);

  if (!filtered.length) {
    return `<div class="drop-row"><span>${t("bestiary.nothingDiscovered", "Noch nichts entdeckt")}</span><span>-</span></div>`;
  }

  const sorted = filtered.sort((a, b) => bestiaryRowRank(b) - bestiaryRowRank(a) || a.name.localeCompare(b.name));
  const pageSize = 15;
  const pageCount = Math.max(1, Math.ceil(sorted.length / pageSize));
  selectedBestiaryPage = Math.min(selectedBestiaryPage, pageCount - 1);
  const start = selectedBestiaryPage * pageSize;
  const visible = sorted.slice(start, start + pageSize);
  const rows = visible
    .map((template) => renderGeneratedDropRow(template, discoveredLookup))
    .join("");

  if (pageCount <= 1) return rows;

  return `${rows}
    <div class="bestiary-pagination">
      <button type="button" data-bestiary-page="prev" ${selectedBestiaryPage === 0 ? "disabled" : ""}>${t("common.previous", "Zurück")}</button>
      <span>${t("common.page", "Seite")} ${selectedBestiaryPage + 1}/${pageCount}</span>
      <button type="button" data-bestiary-page="next" ${selectedBestiaryPage >= pageCount - 1 ? "disabled" : ""}>${t("common.next", "Weiter")}</button>
    </div>`;
}

function discoveredLootLookup(discovered) {
  return discovered.reduce((lookup, item) => {
    lookup.set(bestiaryItemKey(item), item);
    return lookup;
  }, new Map());
}

function renderGeneratedDropRow(template, discoveredLookup) {
  const found = discoveredLookup.get(bestiaryItemKey(template));
  const item = found || template;
  const quality = itemQuality(item);
  const slot = itemSlot(item);
  const key = found ? bestiaryItemKey(found) : `unknown:${bestiaryItemKey(template)}`;
  const status = found ? ((found.count || 0) <= 1 ? t("common.new", "Neu") : t("common.known", "Bekannt")) : t("common.unknown", "Unbekannt");
  const hoverClass = found ? "item-hover-row" : "locked-drop";
  return `<button class="drop-row discovered-drop bestiary-item-row ${hoverClass} ${selectedBestiaryItemKey === key ? "active" : ""}" type="button" data-bestiary-item="${escapeAttr(key)}" ${found ? `data-tooltip-key="${cacheTooltipItem(found)}"` : ""}>
    <span><b class="quality-${quality}">${escapeHtml(item.name)}</b><small>${labelFor(qualityLabel, quality)} · ${labelFor(slotLabel, slot)} · ${t("common.chance", "Chance")} ${formatChance(template.dropChance)}</small></span>
    <span>${status}</span>
  </button>`;
}

function generatedBestiaryTemplates(enemy) {
  const cacheKey = bestiaryTemplateCacheKey(enemy);
  const cached = bestiaryTemplateCache.get(cacheKey);
  if (cached) return cached;
  const profile = enemy.generatedLoot || {};
  const slots = (profile.slots || lootSlots).filter((slot) => lootSlots.includes(slot));
  const qualities = (profile.qualities || Object.keys(qualityPower)).filter((quality) => qualityPower[quality]);
  const allowedSlots = slots.length ? slots : lootSlots;
  const allowedQualities = qualities.length ? qualities : Object.keys(qualityPower);
  const templates = allowedSlots.flatMap((slot) => allowedQualities.flatMap((quality) => {
    const namePool = lootNames[slot][quality] || lootNames[slot].common;
    return namePool.slice(0, 3).map((name) => ({
      name,
      slot,
      quality,
      damage: 0,
      defense: 0,
      critChance: 0,
      critDamage: 0,
      fixed: false,
      unknown: true,
      dropChance: generatedTemplateDropChance(enemy, slot, quality, namePool.slice(0, 3).length, allowedSlots, allowedQualities),
    }));
  }));
  bestiaryTemplateCache.set(cacheKey, templates);
  return templates;
}

function bestiaryTemplateCacheKey(enemy) {
  const profile = enemy.generatedLoot || {};
  const slots = (profile.slots || lootSlots).join(",");
  const qualities = (profile.qualities || Object.keys(qualityPower)).join(",");
  return `${enemy.name}|${enemy.level}|${enemy.elite ? 1 : 0}|${enemy.tags?.dungeon ? 1 : 0}|${slots}|${qualities}`;
}

function generatedTemplateDropChance(enemy, slot, quality, nameCount, slots, qualities) {
  const slotChance = 1 / Math.max(1, slots.length);
  const qualityChance = effectiveQualityChance(enemy, quality, qualities);
  const nameChance = 1 / Math.max(1, nameCount);
  const singleChoice = slotChance * qualityChance * nameChance;
  return 1 - Math.pow(1 - singleChoice, 3);
}

function effectiveQualityChance(enemy, quality, allowedQualities) {
  return Object.entries(baseQualityChances(enemy)).reduce((sum, [rolled, chance]) => {
    return nearestAllowedQuality(rolled, allowedQualities) === quality ? sum + chance : sum;
  }, 0);
}

function nearestAllowedQuality(quality, allowedQualities) {
  if (allowedQualities.includes(quality)) return quality;
  const rank = { common: 0, rare: 1, epic: 2, legendary: 3 };
  const sourceRank = rank[quality] ?? 0;
  return [...allowedQualities].sort((a, b) =>
    Math.abs((rank[a] ?? 0) - sourceRank) - Math.abs((rank[b] ?? 0) - sourceRank)
    || (rank[a] ?? 0) - (rank[b] ?? 0)
  )[0] || "common";
}

function baseQualityChances(enemy) {
  const bonus = (enemy.elite ? 0.025 : 0) + (enemy.tags?.dungeon ? 0.015 : 0) + Math.min(0.025, enemy.level * 0.0013);
  return {
    common: Math.max(0, 0.82 - bonus),
    rare: 0.145,
    epic: 0.031,
    legendary: Math.min(1, 0.004 + bonus),
  };
}

function groupedBestiaryLoot(enemyId) {
  const cached = bestiaryLootCache.get(enemyId);
  if (cached) return cached;
  pruneBestiaryLoot(enemyId);

  const groups = Object.values(state.discoveredLoot[enemyId] || {}).reduce((result, item) => {
    if (item.fixed) return result;
    const key = bestiaryItemKey(item);
    const existing = result.get(key);
    if (!existing || itemScore(item) > itemScore(existing)) {
      result.set(key, { ...item, count: (existing?.count || 0) + (item.count || 1) });
    } else {
      existing.count = (existing.count || 0) + (item.count || 1);
    }
    return result;
  }, new Map());
  const grouped = Array.from(groups.values());
  bestiaryLootCache.set(enemyId, grouped);
  return grouped;
}

function bestiaryRowRank(item) {
  const ranks = { legendary: 4, epic: 3, rare: 2, common: 1 };
  return ranks[item.quality] || 0;
}

function bestiaryItemKey(item) {
  return item.fixed ? `fixed:${item.id}` : `${item.name}|${item.slot}|${item.quality}`;
}

function bestiaryItemGroup(item) {
  if (["weapon", "offhand"].includes(item.slot)) return "weapon";
  if (["chest", "pants", "boots"].includes(item.slot)) return "armor";
  if (["necklace", "ring"].includes(item.slot)) return "jewelry";
  return "other";
}

function filterBestiaryLoot(items) {
  const search = selectedBestiarySearch.trim().toLowerCase();
  const searched = search ? items.filter((item) => item.name.toLowerCase().includes(search)) : items;
  if (selectedBestiaryFilter === "new") return searched.filter((item) => (item.count || 0) <= 1);
  if (selectedBestiaryFilter === "sets") return searched.filter((item) => item.set);
  if (selectedBestiaryFilter === "epic") return searched.filter((item) => item.quality === "epic" || item.quality === "legendary");
  if (selectedBestiaryFilter === "incomplete") return searched.filter((item) => (item.count || 0) <= 1 || item.quality === "epic" || item.quality === "legendary" || item.set);
  return searched;
}

function renderBestiaryFilters() {
  const filters = [
    ["all", t("bestiary.filterAll", "Alle")],
    ["new", t("bestiary.filterNew", "Neu")],
    ["sets", t("bestiary.categorySets", "Set-Items")],
    ["epic", t("bestiary.filterEpic", "Episch+")],
    ["incomplete", t("bestiary.filterIncomplete", "Noch nicht vollständig")],
  ];
  return `<div class="bestiary-filters">
    <input id="bestiarySearch" type="search" value="${escapeAttr(selectedBestiarySearch)}" placeholder="${t("bestiary.search", "Item suchen")}">
    ${filters.map(([id, label]) => `<button class="${selectedBestiaryFilter === id ? "active" : ""}" type="button" data-bestiary-filter="${id}">${label}</button>`).join("")}
  </div>`;
}

function escapeAttr(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function renderBestiaryItemDetail(enemyId, enemy, discovered = groupedBestiaryLoot(enemyId)) {
  if (selectedBestiaryCategory === "overview" && !selectedBestiaryItemKey) {
    return `<aside class="bestiary-selected-detail">
      <strong>${t("bestiary.details", "Details")}</strong>
      <p>${t("bestiary.clickDiscovery", "Klicke einen Fund an, um Details zu sehen.")}</p>
    </aside>`;
  }

  if (selectedBestiaryCategory === "materials") {
    const material = (materialDrops[enemyId] || []).find((drop) => `mat:${drop.id}` === selectedBestiaryItemKey);
    return `<aside class="bestiary-selected-detail">
      <strong>${t("bestiary.materials", "Materialien")}</strong>
      ${material ? `<p>${labelFor(materialLabel, material.id)}</p><p>${t("bestiary.dropAmount", "Drop-Menge")}: ${material.min}-${material.max}</p><p>${t("bestiary.usedForUpgrades", "Wird beim Schmied für Upgrades genutzt.")}</p>` : `<p>${t("bestiary.clickDiscovery", "Klicke ein Material für Details.")}</p>`}
    </aside>`;
  }

  if (selectedBestiaryItemKey.startsWith("unknown:")) {
    const key = selectedBestiaryItemKey.replace("unknown:", "");
    const template = generatedBestiaryTemplates(enemy).find((entry) => bestiaryItemKey(entry) === key);
    return `<aside class="bestiary-selected-detail">
      <strong>${t("bestiary.unknownDrop", "Unbekannter Fund")}</strong>
      ${template ? `<p>${escapeHtml(template.name)}</p><p>${labelFor(qualityLabel, template.quality)} · ${labelFor(slotLabel, template.slot)}</p><p>${t("bestiary.dropChance", "Drop-Chance")}: ${formatChance(template.dropChance)}</p><p>${t("bestiary.statsAfterDiscovery", "Stats werden nach dem ersten Fund freigeschaltet.")}</p>` : `<p>${t("bestiary.clickDiscovery", "Klicke ein Item für Details.")}</p>`}
    </aside>`;
  }

  if (selectedBestiaryItemKey.startsWith("fixed:")) {
    const itemId = selectedBestiaryItemKey.replace("fixed:", "");
    const drop = enemy.drops.find((entry) => entry.id === itemId);
    const item = getItem(itemId);
    const known = Boolean(state.discoveredLoot[enemyId]?.[selectedBestiaryItemKey]);
    if (!known) {
      return `<aside class="bestiary-selected-detail">
        <strong>${t("bestiary.fixedDrop", "Fester Drop")}</strong>
        <p>${escapeHtml(item.name)}</p>
        <p>${labelFor(qualityLabel, itemQuality(item))} · ${labelFor(slotLabel, itemSlot(item))}</p>
        <p>${t("bestiary.dropChance", "Drop-Chance")}: ${drop ? formatChance(drop.chance) : t("common.unknown", "Unbekannt")}</p>
        <p>${t("bestiary.statsAfterDiscovery", "Stats werden nach dem ersten Fund freigeschaltet.")}</p>
      </aside>`;
    }
    return `<aside class="bestiary-selected-detail">
      ${renderItemTooltip({ ...item, fixed: true })}
    </aside>`;
  }

  const item = discovered.find((entry) => bestiaryItemKey(entry) === selectedBestiaryItemKey);

  if (!item) {
    return `<aside class="bestiary-selected-detail">
      <strong>${t("bestiary.details", "Details")}</strong>
      <p>${t("bestiary.clickDiscovery", "Klicke ein Item für Stats und Vergleich.")}</p>
    </aside>`;
  }

  return `<aside class="bestiary-selected-detail">
    ${renderItemTooltip(item)}
  </aside>`;
}

function cacheTooltipItem(item) {
  const key = item.fixed ? `fixed:${item.id}` : `${item.name}|${item.slot}|${item.quality}|${item.damage}|${item.defense}|${item.critChance || 0}|${item.critDamage || 0}|${item.effect || ""}|${(item.enchantments || []).join(",")}`;
  tooltipItemCache.set(key, item);
  return escapeAttr(key);
}

function cacheSetTooltip(setId) {
  const key = `set:${setId}`;
  tooltipItemCache.set(key, { tooltipType: "set", setId });
  return key;
}

function renderSetTooltip(setId) {
  const set = setBonuses[setId];
  if (!set) return "";
  const count = activeSetCounts()[setId]?.count || 0;
  const bonuses = Object.entries(set.bonuses)
    .map(([needed, bonus]) => `<span class="${count >= Number(needed) ? "compare-good" : "compare-even"}">${needed} ${t("common.pieces", "Teile")}: ${escapeHtml(bonus.text)}</span>`)
    .join("");
  return `<div class="item-tooltip">
    <strong>${escapeHtml(set.name)} (${Math.min(count, 6)}/6)</strong>
    ${bonuses}
  </div>`;
}

function renderItemTooltip(item) {
  const quality = itemQuality(item);
  const slot = itemSlot(item);
  const current = getItem(state.equipment[slot]) || { name: t("common.none", "Nichts"), damage: 0, defense: 0 };
  const compare = compareLoot(item, current);
  const equippedId = state.equipment[slot];
  const isEquipped = equippedId && getItem(equippedId) === item;
  const durabilityLine = isEquipped ? `<span>${t("main.durability", "Haltbarkeit")}: ${itemDurability(equippedId)}%</span>` : "";
  const repairLine = isEquipped ? `<span>${t("equipment.repair", "Reparatur")}: ${repairCostForSlot(slot)} ${t("common.gold", "Gold")}</span>` : "";
  const upgradeLine = item.upgrade ? `<span>${t("equipment.upgrade", "Verbesserung")}: +${item.upgrade}</span>` : "";
  const statText = itemStatText(item);
  const enchantText = itemEnchantmentsText(item);
  return `<div class="item-tooltip">
    <strong class="quality-${quality}">${escapeHtml(item.name)}</strong>
    <span>${labelFor(slotLabel, slot)} · ${labelFor(qualityLabel, quality)}</span>
    ${item.set ? `<span>Set: ${escapeHtml(setBonuses[item.set]?.name || item.set)}</span>` : ""}
    ${upgradeLine}
    ${statText ? `<span>${statText}</span>` : ""}
    ${enchantText ? `<span>${escapeHtml(enchantText)}</span>` : ""}
    ${renderItemEffectLine(item)}
    ${durabilityLine}
    ${repairLine}
    <span>${t("common.current", "Aktuell")}: ${escapeHtml(current.name)}</span>
    ${renderCompareSpans(compare, 3)}
  </div>`;
}

function renderMaterialTooltip(materialId) {
  const drop = (materialDrops[selectedBestiaryEnemy] || []).find((entry) => entry.id === materialId);
  return `<div class="item-tooltip">
    <strong>${labelFor(materialLabel, materialId, materialId)}</strong>
    <span>${t("bestiary.materialForSmith", "Material fürs Schmieden")}</span>
    ${drop ? `<span>${t("bestiary.dropAmount", "Drop-Menge")}: ${drop.min}-${drop.max}</span>` : ""}
    <span>${t("bestiary.usedForUpgrades", "Wird für Upgrades und Ausrüstung genutzt.")}</span>
  </div>`;
}

function showFloatingTooltip(row) {
  const materialId = row.dataset.materialId;
  if (materialId) {
    const tooltip = $("floatingTooltip");
    tooltip.innerHTML = cachedTooltipHtml(`material:${selectedBestiaryEnemy}:${materialId}`, () => renderMaterialTooltip(materialId));
    tooltip.classList.add("open");
    tooltip.setAttribute("aria-hidden", "false");
    return;
  }
  const key = row.dataset.tooltipKey || row.querySelector("[data-tooltip-key]")?.dataset.tooltipKey || row.querySelector("[data-set-tooltip-key]")?.dataset.setTooltipKey;
  const item = tooltipItemCache.get(key);
  if (!item) return;
  const tooltip = $("floatingTooltip");
  const renderKey = tooltipCacheKey(key, item);
  tooltip.innerHTML = cachedTooltipHtml(renderKey, () => item.tooltipType === "set" ? renderSetTooltip(item.setId) : renderItemTooltip(item));
  tooltip.classList.add("open");
  tooltip.setAttribute("aria-hidden", "false");
}

function cachedTooltipHtml(key, htmlFactory) {
  if (tooltipHtmlCache.has(key)) return tooltipHtmlCache.get(key);
  const html = htmlFactory();
  tooltipHtmlCache.set(key, html);
  return html;
}

function tooltipCacheKey(key, item) {
  const itemDurabilityValue = item?.id ? itemDurability(item.id) : "";
  return `${currentLanguage()}|${key}|${equipmentSignature()}|${itemDurabilityValue}|${state.gold}`;
}

function positionFloatingTooltip(event) {
  const tooltip = $("floatingTooltip");
  if (!tooltip.classList.contains("open")) return;

  pendingTooltipEvent = event;
  if (tooltipFrame) return;
  tooltipFrame = requestAnimationFrame(() => {
    tooltipFrame = 0;
    applyTooltipPosition(pendingTooltipEvent);
  });
}

let tooltipFrame = 0;
let pendingTooltipEvent = null;

function applyTooltipPosition(event) {
  const tooltip = $("floatingTooltip");
  if (!event || !tooltip.classList.contains("open")) return;

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
  if (tooltipFrame) {
    cancelAnimationFrame(tooltipFrame);
    tooltipFrame = 0;
  }
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
  const previewSignature = `${currentLanguage()}|${state.log.slice(0, 5).join("\n") || "empty"}`;
  if (renderCache.logPreview !== previewSignature) {
    renderCache.logPreview = previewSignature;
    $("logPreview").innerHTML = state.log.length
      ? state.log.slice(0, 5).map(escapeHtml).join("<br>")
      : t("log.empty", "Noch keine Einträge.");
  }
  if (!isModalOpen("logModal")) {
    renderCache.log = "";
    return;
  }
  const signature = `${currentLanguage()}|${state.log.slice(0, 18).join("\n") || "empty"}`;
  if (renderCache.log === signature) return;
  renderCache.log = signature;
  $("log").innerHTML = state.log.slice(0, 18).map((entry, index) => {
    const type = entry.includes("Tod") ? "bad" : entry.includes("Seltener") || entry.includes("Quest") || entry.includes("ausgerüstet") ? "drop" : index === 0 ? "good" : "";
    return `<div class="${type}">${escapeHtml(entry)}</div>`;
  }).join("") || `<div>${t("log.empty", "Noch keine Einträge.")}</div>`;
}

function renderCombatLogSummary() {
  const entries = Array.isArray(state.combatLog) ? state.combatLog : [];
  const signature = `${currentLanguage()}|${entries.length}`;
  if (renderCache.combatLogSummary === signature) return;
  renderCache.combatLogSummary = signature;
  setText("combatLogSummary", entries.length ? t("common.entries", "{count} Einträge", { count: entries.length }) : t("combat.logEmpty", "Noch leer"));
}

function renderCombatLog() {
  const entries = Array.isArray(state.combatLog) ? state.combatLog : [];
  const signature = `${currentLanguage()}|${entries.map((entry) => `${entry.type}:${entry.text}`).join("\n") || "empty"}`;
  if (renderCache.combatLog === signature) return;
  renderCache.combatLog = signature;
  $("combatLog").innerHTML = entries.length
    ? entries.map((entry) => `<div class="combat-log-entry ${escapeToken(entry.type, ["hero", "enemy", "heal", "effect", "critical", "good", "bad"], "effect")}">${escapeHtml(entry.text)}</div>`).join("")
    : `<div class="combat-log-empty">${t("combat.logEmptyLong", "Starte einen Kampf, dann erscheinen hier Schaden, Heilung und Effekte.")}</div>`;
}

function renderRepairModal() {
  const total = repairCost();
  const signature = `${currentLanguage()}|${state.gold}|${total}|${equipmentSignature()}`;
  if (renderCache.repairModal === signature) return;
  renderCache.repairModal = signature;

  $("repairSummary").innerHTML = `
    <div>
      <strong>${total} ${t("common.gold", "Gold")}</strong>
      <p>${t("equipment.currentGold", "Aktuelles Gold")}: ${state.gold}</p>
    </div>
    <button type="button" data-repair-all ${total === 0 || state.gold < total ? "disabled" : ""}>${t("equipment.repairAll", "Alles reparieren")}</button>
  `;
  $("repairList").innerHTML = equipmentSlots.map((slot) => {
    const itemId = state.equipment[slot];
    const item = getItem(itemId);
    if (!item) {
      return `<div class="repair-row empty-slot">
        <div>
          <strong>${labelFor(slotLabel, slot)}</strong>
          <p>${t("common.empty", "Leer")}</p>
        </div>
        <button type="button" disabled>${t("equipment.noGear", "Keine Ausrüstung")}</button>
      </div>`;
    }
    const durability = itemDurability(itemId);
    const cost = repairCostForSlot(slot);
    const disabled = cost === 0 || state.gold < cost ? "disabled" : "";
    const label = cost === 0 ? t("equipment.fullyRepaired", "Vollständig") : `${cost} ${t("common.gold", "Gold")}`;
    const quality = itemQuality(item);
    return `<div class="repair-row rarity-card rarity-${quality}">
      <div>
        <strong class="quality-${quality}">${labelFor(slotLabel, slot)} · ${escapeHtml(item.name)}</strong>
        <p>${labelFor(qualityLabel, quality)} · ${t("main.durability", "Haltbarkeit")}: ${durability}% · ${t("equipment.repair", "Reparatur")}: ${cost} ${t("common.gold", "Gold")}</p>
      </div>
      <button type="button" data-repair-slot="${slot}" ${disabled}>${label}</button>
    </div>`;
  }).join("");
}
