document.querySelectorAll("[data-zone]").forEach((button) => {
  button.addEventListener("click", () => {
    selectedZone = button.dataset.zone;
    selectedEnemy = zones[selectedZone].enemies[0];
    save();
    closeZone();
    render();
  });
});

$("enemyList").addEventListener("click", (event) => {
  const button = event.target.closest("[data-enemy]");
  if (!button) return;
  selectedEnemy = button.dataset.enemy;
  save();
  renderEnemies();
  renderSelectedEnemy();
});

$("inventory").addEventListener("click", (event) => {
  const lock = event.target.closest("[data-lock]");
  if (lock) {
    toggleInventoryItemLock(Number(lock.dataset.lock));
    return;
  }
  const equip = event.target.closest("[data-equip]");
  if (equip) {
    equipInventoryItem(Number(equip.dataset.equip));
    return;
  }
});

$("merchantList").addEventListener("click", (event) => {
  const lock = event.target.closest("[data-lock]");
  if (lock) {
    toggleInventoryItemLock(Number(lock.dataset.lock));
    return;
  }
  const sell = event.target.closest("[data-sell]");
  if (sell) sellInventoryItem(Number(sell.dataset.sell));
});

$("lootChoices").addEventListener("click", (event) => {
  const equipLoot = event.target.closest("[data-equip-loot]");
  if (equipLoot) {
    chooseLoot(Number(equipLoot.dataset.equipLoot), true);
    return;
  }
  const loot = event.target.closest("[data-loot]");
  if (loot) chooseLoot(Number(loot.dataset.loot));
});

$("questBoard").addEventListener("click", (event) => {
  const button = event.target.closest("[data-accept-quest]");
  if (button) acceptQuest(button.dataset.acceptQuest);
});

$("quests").addEventListener("click", (event) => {
  const button = event.target.closest("[data-cancel-quest]");
  if (button) cancelQuest(button.dataset.cancelQuest);
});

$("achievements").addEventListener("click", (event) => {
  const button = event.target.closest("[data-claim-achievement]");
  if (button) claimAchievement(button.dataset.claimAchievement);
});

$("bestiary").addEventListener("click", (event) => {
  const type = event.target.closest("[data-bestiary-type]");
  if (type) {
    selectedBestiaryType = type.dataset.bestiaryType;
    const firstZone = bestiaryZonesForType(selectedBestiaryType)[0];
    if (firstZone) {
      selectedBestiaryZone = firstZone[0];
      selectedBestiaryEnemy = firstZone[1].enemies[0] || selectedBestiaryEnemy;
    }
    selectedBestiaryCategory = "overview";
    selectedBestiaryFilter = "all";
    selectedBestiarySearch = "";
    selectedBestiaryPage = 0;
    selectedBestiaryItemKey = "";
    bestiaryListDirty = true;
    renderBestiary();
    return;
  }

  const zone = event.target.closest("[data-bestiary-zone]");
  if (zone) {
    selectedBestiaryZone = zone.dataset.bestiaryZone;
    selectedBestiaryType = zones[selectedBestiaryZone]?.type || "zone";
    selectedBestiaryEnemy = zones[selectedBestiaryZone]?.enemies[0] || selectedBestiaryEnemy;
    selectedBestiaryCategory = "overview";
    selectedBestiaryFilter = "all";
    selectedBestiarySearch = "";
    selectedBestiaryPage = 0;
    selectedBestiaryItemKey = "";
    bestiaryListDirty = true;
    renderBestiary();
    return;
  }

  const page = event.target.closest("[data-bestiary-page]");
  if (page) {
    selectedBestiaryPage += page.dataset.bestiaryPage === "next" ? 1 : -1;
    renderBestiaryDetail();
    return;
  }

  const filter = event.target.closest("[data-bestiary-filter]");
  if (filter) {
    selectedBestiaryFilter = filter.dataset.bestiaryFilter;
    selectedBestiaryPage = 0;
    selectedBestiaryItemKey = "";
    renderBestiaryDetail();
    return;
  }

  const material = event.target.closest("[data-bestiary-material]");
  if (material) {
    selectedBestiaryItemKey = `mat:${material.dataset.bestiaryMaterial}`;
    renderBestiaryDetail();
    return;
  }

  const item = event.target.closest("[data-bestiary-item]");
  if (item) {
    selectedBestiaryItemKey = item.dataset.bestiaryItem;
    renderBestiaryDetail();
    return;
  }

  const category = event.target.closest("[data-bestiary-category]");
  if (category) {
    selectedBestiaryCategory = category.dataset.bestiaryCategory;
    selectedBestiaryFilter = "all";
    selectedBestiarySearch = "";
    selectedBestiaryPage = 0;
    selectedBestiaryItemKey = "";
    renderBestiaryDetail();
    return;
  }

  const button = event.target.closest("[data-bestiary]");
  if (!button) return;
  selectedBestiaryEnemy = button.dataset.bestiary;
  selectedBestiaryZone = zoneKeyForEnemy(selectedBestiaryEnemy);
  selectedBestiaryType = zones[selectedBestiaryZone]?.type || "zone";
  selectedBestiaryCategory = "overview";
  selectedBestiaryFilter = "all";
  selectedBestiarySearch = "";
  selectedBestiaryPage = 0;
  selectedBestiaryItemKey = "";
  updateBestiaryActiveCard();
  renderBestiaryDetail();
});

$("bestiary").addEventListener("input", (event) => {
  if (!event.target.matches("#bestiarySearch")) return;
  selectedBestiarySearch = event.target.value;
  selectedBestiaryPage = 0;
  selectedBestiaryItemKey = "";
  if (bestiarySearchFrame) cancelAnimationFrame(bestiarySearchFrame);
  bestiarySearchFrame = requestAnimationFrame(() => {
    bestiarySearchFrame = 0;
    renderBestiaryDetail();
    const search = document.getElementById("bestiarySearch");
    search?.focus();
    search?.setSelectionRange(search.value.length, search.value.length);
  });
});

function bindFloatingTooltip(containerId, selector) {
  const container = $(containerId);
  container.addEventListener("mouseover", (event) => {
    const row = event.target.closest(selector);
    if (!row || row.contains(event.relatedTarget)) return;
    if (showFloatingTooltip(row)) positionFloatingTooltip(event);
  });
  container.addEventListener("mousemove", (event) => {
    if (event.target.closest(selector)) positionFloatingTooltip(event);
  }, { passive: true });
  container.addEventListener("mouseout", (event) => {
    const row = event.target.closest(selector);
    if (!row || row.contains(event.relatedTarget)) return;
    hideFloatingTooltip();
  });
}

bindFloatingTooltip("bestiary", ".item-hover-row, .material-hover-row");
bindFloatingTooltip("equipmentDetails", ".set-hover-row");

$("equipment").addEventListener("click", (event) => {
  if (!event.target.closest("[data-open-equipment]")) return;
  renderEquipmentDetails();
  openModal("equipmentModal");
});

bindFloatingTooltip("equipment", ".item-hover-row");

$("smithGrid").addEventListener("click", (event) => {
  const button = event.target.closest("[data-upgrade]");
  if (button) upgradeEquipped(button.dataset.upgrade);
});

$("smithHome").addEventListener("click", (event) => {
  const startMission = event.target.closest("[data-start-smith-mission]");
  if (startMission) {
    startSmithMasteryMission(startMission.dataset.startSmithMission);
    return;
  }
  const completeMission = event.target.closest("[data-complete-smith-mission]");
  if (completeMission) {
    completeSmithMasteryMission(completeMission.dataset.completeSmithMission);
    return;
  }
  if (event.target.closest("[data-open-repair]")) {
    renderRepairModal();
    openModal("repairModal");
    return;
  }
  const button = event.target.closest("[data-smith-view]");
  if (!button) return;
  smithView = button.dataset.smithView;
  renderSmith();
});

$("smithUpgradeSection").addEventListener("click", (event) => {
  const button = event.target.closest("[data-smith-view]");
  if (!button) return;
  smithView = button.dataset.smithView;
  renderSmith();
});

$("smithSalvageSection").addEventListener("click", (event) => {
  const button = event.target.closest("[data-smith-view]");
  if (!button) return;
  smithView = button.dataset.smithView;
  renderSmith();
});

$("smithEnchantSection").addEventListener("click", (event) => {
  const startMission = event.target.closest("[data-start-enchant-mission]");
  if (startMission) {
    startEnchantMasteryMission(startMission.dataset.startEnchantMission);
    return;
  }
  const completeMission = event.target.closest("[data-complete-enchant-mission]");
  if (completeMission) {
    completeEnchantMasteryMission(completeMission.dataset.completeEnchantMission);
    return;
  }
  const enchant = event.target.closest("[data-enchant-slot]");
  if (enchant) {
    enchantEquipped(enchant.dataset.enchantSlot, enchant.dataset.enchantCategory);
    return;
  }
  const button = event.target.closest("[data-smith-view]");
  if (!button) return;
  smithView = button.dataset.smithView;
  renderSmith();
});

$("salvageList").addEventListener("click", (event) => {
  const button = event.target.closest("[data-salvage]");
  if (button) salvageInventoryItem(Number(button.dataset.salvage));
});

$("fightBtn").addEventListener("click", () => {
  if (isFighting) {
    if (isManualCombatMode()) return;
    skipCombat = true;
    $("battleText").textContent = t("combat.skippingBattle", "Kampf wird übersprungen...");
    $("fightBtn").textContent = t("combat.skipping", "Überspringe...");
    $("fightBtn").disabled = true;
    armCombatWatchdog(1800);
    return;
  }

  fight();
});

$("combatActions").addEventListener("click", (event) => {
  const button = event.target.closest("[data-combat-action]");
  if (button) requestCombatAction(button.dataset.combatAction);
});

$("combatModeToggle").addEventListener("click", (event) => {
  const button = event.target.closest("[data-combat-mode]");
  if (button) setCombatMode(button.dataset.combatMode);
});

function setMobileMenuOpen(isOpen) {
  const menu = $("topbarActions");
  const button = $("mobileMenuBtn");
  if (!menu || !button) return;
  menu.classList.toggle("open", isOpen);
  button.setAttribute("aria-expanded", isOpen ? "true" : "false");
}

$("mobileMenuBtn").addEventListener("click", (event) => {
  event.stopPropagation();
  setMobileMenuOpen(!$("topbarActions").classList.contains("open"));
});

$("topbarActions").addEventListener("click", (event) => {
  if (event.target.closest("button")) setMobileMenuOpen(false);
});

document.addEventListener("click", (event) => {
  if (event.target.closest("#topbarActions, #mobileMenuBtn")) return;
  setMobileMenuOpen(false);
});

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape") setMobileMenuOpen(false);
});

$("languageToggleBtn").addEventListener("click", toggleLanguage);
$("restBtn").addEventListener("click", rest);
$("openPlayerStatsBtn").addEventListener("click", () => {
  renderPlayerStatsDetails();
  openModal("playerStatsModal");
});
$("buildList").addEventListener("click", (event) => {
  const button = event.target.closest("[data-build]");
  if (button) setBuild(button.dataset.build);
});
$("classList").addEventListener("click", (event) => {
  const button = event.target.closest("[data-character-class]");
  if (button) setCharacterClass(button.dataset.characterClass);
});
$("sellAllBtn").addEventListener("click", sellAllInventoryItems);
$("salvageAllBtn").addEventListener("click", salvageAllInventoryItems);
$("openBestiaryBtn").addEventListener("click", async () => {
  await loadOptionalDataPack("drops");
  renderBestiary();
  openModal("bestiaryModal");
});
$("closeBestiaryBtn").addEventListener("click", closeBestiary);
$("bestiaryModal").addEventListener("click", (event) => {
  if (event.target.id === "bestiaryModal") closeBestiary();
});
$("openZoneBtn").addEventListener("click", () => openModal("zoneModal"));
$("closeZoneBtn").addEventListener("click", closeZone);
$("zoneModal").addEventListener("click", (event) => {
  const zone = event.target.closest("[data-zone]");
  if (zone) {
    if (selectZone(zone.dataset.zone)) closeZone();
    render();
    return;
  }
  if (event.target.id === "zoneModal") closeZone();
});
$("openQuestBoardBtn").addEventListener("click", () => {
  refreshQuestBoard(true);
  renderQuestBoard();
  openModal("questBoardModal");
});
$("closeQuestBoardBtn").addEventListener("click", closeQuestBoard);
$("questBoardModal").addEventListener("click", (event) => {
  if (event.target.id === "questBoardModal") closeQuestBoard();
});
$("openAchievementsBtn").addEventListener("click", async () => {
  await loadOptionalDataPack("achievements");
  state.achievements = normalizeAchievements(state.achievements);
  renderAchievements();
  openModal("achievementsModal");
});
$("closeAchievementsBtn").addEventListener("click", closeAchievements);
$("achievementsModal").addEventListener("click", (event) => {
  if (event.target.id === "achievementsModal") closeAchievements();
});
$("openInventoryBtn").addEventListener("click", () => {
  renderInventory();
  openModal("inventoryModal");
});
$("closeInventoryBtn").addEventListener("click", closeInventory);
$("inventoryModal").addEventListener("click", (event) => {
  if (event.target.id === "inventoryModal") closeInventory();
});
$("openMerchantBtn").addEventListener("click", () => {
  renderMerchant();
  openModal("merchantModal");
});
$("closeMerchantBtn").addEventListener("click", closeMerchant);
$("merchantModal").addEventListener("click", (event) => {
  if (event.target.id === "merchantModal") closeMerchant();
});
$("openSmithBtn").addEventListener("click", () => {
  smithView = "home";
  renderSmith();
  openModal("smithModal");
});
$("openEnchantBtn").addEventListener("click", () => {
  smithView = "enchant";
  renderSmith();
  openModal("smithModal");
});
$("closeSmithBtn").addEventListener("click", closeSmith);
$("smithModal").addEventListener("click", (event) => {
  if (event.target.id === "smithModal") closeSmith();
});
$("toggleLogBtn").addEventListener("click", () => {
  openModal("logModal");
  renderLog();
});
$("closeLogBtn").addEventListener("click", closeLog);
$("logModal").addEventListener("click", (event) => {
  if (event.target.id === "logModal") closeLog();
});
$("openCombatLogBtn").addEventListener("click", () => {
  openModal("combatLogModal");
  renderCombatLog();
});
$("closeCombatLogBtn").addEventListener("click", closeCombatLog);
$("combatLogModal").addEventListener("click", (event) => {
  if (event.target.id === "combatLogModal") closeCombatLog();
});
$("repairList").addEventListener("click", (event) => {
  const button = event.target.closest("[data-repair-slot]");
  if (button) repairSlot(button.dataset.repairSlot);
});
$("repairSummary").addEventListener("click", (event) => {
  if (event.target.closest("[data-repair-all]")) repair();
});
$("closeRepairBtn").addEventListener("click", closeRepair);
$("repairModal").addEventListener("click", (event) => {
  if (event.target.id === "repairModal") closeRepair();
});
$("closeEquipmentBtn").addEventListener("click", closeEquipment);
$("equipmentModal").addEventListener("click", (event) => {
  if (event.target.id === "equipmentModal") closeEquipment();
});
$("closePlayerStatsBtn").addEventListener("click", closePlayerStats);
$("playerStatsDetails").addEventListener("click", (event) => {
  const classButton = event.target.closest("[data-character-class]");
  if (classButton) {
    setCharacterClass(classButton.dataset.characterClass);
    return;
  }
  const button = event.target.closest("[data-build]");
  if (button) setBuild(button.dataset.build);
});
$("playerStatsModal").addEventListener("click", (event) => {
  if (event.target.id === "playerStatsModal") closePlayerStats();
});
$("openSaveMenuBtn").addEventListener("click", () => {
  renderSaveSummary();
  openModal("saveModal");
});
$("closeSaveBtn").addEventListener("click", closeSave);
$("saveModal").addEventListener("click", (event) => {
  if (event.target.id === "saveModal") closeSave();
});
$("exportSaveTopBtn").addEventListener("click", exportSave);
$("importSaveTopBtn").addEventListener("click", importSave);
$("saveFileInput").addEventListener("change", importSaveFile);

void bootGame();
window.addEventListener("beforeunload", save);
window.addEventListener("scroll", hideFloatingTooltip, { passive: true, capture: true });

async function bootGame() {
  await ensureLanguagePack(currentLanguage());
  render();
}

function closeBestiary() {
  closeModal("bestiaryModal");
}

function closeZone() {
  closeModal("zoneModal");
}

function closeQuestBoard() {
  closeModal("questBoardModal");
}

function closeAchievements() {
  closeModal("achievementsModal");
}

function closeInventory() {
  closeModal("inventoryModal");
}

function closeMerchant() {
  closeModal("merchantModal");
}

function closeSmith() {
  closeModal("smithModal");
}

function closeLog() {
  closeModal("logModal");
}

function closeCombatLog() {
  closeModal("combatLogModal");
}

function closeRepair() {
  closeModal("repairModal");
}

function closeEquipment() {
  closeModal("equipmentModal");
}

function closePlayerStats() {
  closeModal("playerStatsModal");
}

function closeSave() {
  closeModal("saveModal");
}

function exportSave() {
  state.lastSaveExportAt = new Date().toISOString();
  save();
  const blob = new Blob([exportSaveData()], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = saveFileName();
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  log(t("save.exported", "Spielstand als Datei gesichert."), "drop");
  render();
}

function importSave() {
  const input = $("saveFileInput");
  input.value = "";
  input.click();
}

function importSaveFile(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    const imported = importSaveData(String(reader.result || ""));
    if (imported) log(t("save.importedFrom", "Spielstand aus {file} geladen.", { file: file.name }), "drop");
  };
  reader.onerror = () => {
    log(t("save.importFileUnreadable", "Import fehlgeschlagen: Die Datei konnte nicht gelesen werden."), "bad");
    render();
  };
  reader.readAsText(file);
}

function openModal(id) {
  $(id).classList.add("open");
  $(id).setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
}

function isModalOpen(id) {
  return $(id).classList.contains("open");
}

function closeModal(id) {
  $(id).classList.remove("open");
  $(id).setAttribute("aria-hidden", "true");
  const anyOpen = [...document.querySelectorAll(".modal-overlay")].some((modal) => modal.classList.contains("open"));
  document.body.classList.toggle("modal-open", anyOpen);
}

function setControlsDisabled(disabled) {
  document.querySelectorAll("button").forEach((button) => {
    if (button.id === "openSaveMenuBtn") return;
    if (button.id === "languageToggleBtn") return;
    if (button.id === "exportSaveTopBtn") return;
    if (button.id === "importSaveTopBtn") return;
    if (button.id === "closeSaveBtn") return;
    if (button.id === "toggleLogBtn") return;
    if (button.id === "closeLogBtn") return;
    if (button.id === "closeRepairBtn") return;
    if (button.id === "closeEquipmentBtn") return;
    if (button.id === "openPlayerStatsBtn") return;
    if (button.id === "closePlayerStatsBtn") return;
    if (button.id === "fightBtn") return;
    if (button.dataset.combatAction !== undefined) return;
    if (button.id === "openBestiaryBtn") return;
    if (button.id === "closeBestiaryBtn") return;
    if (button.id === "openZoneBtn") return;
    if (button.id === "closeZoneBtn") return;
    if (button.id === "openQuestBoardBtn") return;
    if (button.id === "closeQuestBoardBtn") return;
    if (button.id === "openAchievementsBtn") return;
    if (button.id === "closeAchievementsBtn") return;
    if (button.id === "openInventoryBtn") return;
    if (button.id === "closeInventoryBtn") return;
    if (button.id === "openSmithBtn") return;
    if (button.id === "openEnchantBtn") return;
    if (button.id === "closeSmithBtn") return;
    if (button.dataset.loot !== undefined) return;
    if (button.dataset.equipLoot !== undefined) return;
    if (button.dataset.acceptQuest !== undefined) return;
    if (button.dataset.claimAchievement !== undefined) return;
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

function waitResult(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

async function playCombatAnimation(enemy, events, playerWon, combatHealth = {}) {
  const stage = $("battleStage");
  const enemyName = enemyDisplayName(enemy, enemy.baseId || selectedEnemy);
  const playerMaxHp = combatHealth.playerMaxHp || state.maxHp;
  const enemyMaxHp = combatHealth.enemyMaxHp || enemy.hp;
  const startPlayerHp = combatHealth.playerStartHp ?? state.hp;
  const rounds = Math.max(0, ...events.map((event) => event.round || 0));
  const summary = combatAnimationSummary(events);
  const activeCombatEvent = events.find((event) => event.combatEventId);
  hideBattleResult();
  renderBattleEventBadge(activeCombatEvent);
  updateBattleHealth(startPlayerHp, playerMaxHp, enemyMaxHp, enemyMaxHp);
  $("battleText").textContent = t("combat.stepForward", "{enemy} tritt vor.", { enemy: enemyName });
  stage.classList.remove("victory", "defeat", "hero-attacks", "enemy-attacks", "hero-hit", "enemy-hit", "critical-event", "effect-event", "heal-event");
  setBattleStageClass(stage, "", activeCombatEvent);
  await waitCombat(280);

  const visibleEvents = events.slice(0, 14);
  for (const event of visibleEvents) {
    if (skipCombat) break;
    showCombatAnimationEvent(stage, event, activeCombatEvent, enemyName, playerMaxHp, enemyMaxHp);
    await waitCombat(470);
    setBattleStageClass(stage, "", activeCombatEvent);
    await waitCombat(110);
  }

  if (!skipCombat && events.length > visibleEvents.length) {
    $("battleText").textContent = t("combat.dragsOn", "Der Kampf zieht sich schwer und staubig hin.");
    await waitCombat(420);
  }

  const finalEvent = events[events.length - 1];
  if (finalEvent) {
    updateBattleHealth(finalEvent.playerHp, playerMaxHp, finalEvent.enemyHp, enemyMaxHp);
  }

  hideBattleEventBadge();
  stage.className = "battle-stage";
  stage.classList.add(playerWon ? "victory" : "defeat");
  showBattleResult(playerWon, enemyName, rounds, summary);
  await waitResult(skipCombat ? 850 : 1350);
  hideBattleResult();
}

async function playManualCombatAnimation(enemy, events, playerWon, combatHealth = {}) {
  const stage = $("battleStage");
  const enemyName = enemyDisplayName(enemy, enemy.baseId || selectedEnemy);
  const playerMaxHp = combatHealth.playerMaxHp || state.maxHp;
  const enemyMaxHp = combatHealth.enemyMaxHp || enemy.hp;
  const startPlayerHp = combatHealth.playerStartHp ?? state.hp;
  const rounds = Math.max(0, ...events.map((event) => event.round || 0));
  const summary = combatAnimationSummary(events);
  const activeCombatEvent = events.find((event) => event.combatEventId);
  hideBattleResult();
  renderBattleEventBadge(activeCombatEvent);
  updateBattleHealth(startPlayerHp, playerMaxHp, enemyMaxHp, enemyMaxHp);
  $("battleText").textContent = t("combat.manualReady", "Manueller Kampf bereit.");
  $("fightBtn").textContent = t("combat.nextStep", "Nächster Schritt");
  stage.classList.remove("victory", "defeat", "hero-attacks", "enemy-attacks", "hero-hit", "enemy-hit", "critical-event", "effect-event", "heal-event");
  setBattleStageClass(stage, "", activeCombatEvent);
  await waitManualCombatStep();

  const visibleEvents = events.slice(0, 24);
  for (const event of visibleEvents) {
    showCombatAnimationEvent(stage, event, activeCombatEvent, enemyName, playerMaxHp, enemyMaxHp);
    await waitManualCombatStep();
    setBattleStageClass(stage, "", activeCombatEvent);
  }

  if (events.length > visibleEvents.length) {
    $("battleText").textContent = t("combat.manualLongFight", "Der Kampf zieht sich weiter. Zeige den Abschluss.");
    $("fightBtn").textContent = t("combat.showResult", "Abschluss anzeigen");
    await waitManualCombatStep();
  }

  const finalEvent = events[events.length - 1];
  if (finalEvent) {
    updateBattleHealth(finalEvent.playerHp, playerMaxHp, finalEvent.enemyHp, enemyMaxHp);
  }

  hideBattleEventBadge();
  stage.className = "battle-stage";
  stage.classList.add(playerWon ? "victory" : "defeat");
  showBattleResult(playerWon, enemyName, rounds, summary);
  $("fightBtn").textContent = t("combat.finishStep", "Abschließen");
  await waitManualCombatStep();
  hideBattleResult();
}

function showCombatAnimationEvent(stage, event, activeCombatEvent, enemyName, playerMaxHp, enemyMaxHp) {
  const eventClass = combatEventClass(event);
  const attackClass = event.combatEventId ? "" : event.actor === "hero" ? "hero-attacks enemy-hit" : "enemy-attacks hero-hit";
  const side = event.actor === "hero" ? "right" : "left";
  setBattleStageClass(stage, `${attackClass} ${eventClass}`, activeCombatEvent);
  $("battleText").textContent = event.text || (event.actor === "hero"
    ? t("combat.heroHit", "Du triffst für {damage}.", { damage: event.damage })
    : t("combat.enemyHit", "{enemy} trifft für {damage}.", { enemy: enemyName, damage: event.damage }));
  updateBattleHealth(event.playerHp, playerMaxHp, event.enemyHp, enemyMaxHp);
  highlightAbilityUse(event.abilityId);
  if (event.damage > 0) spawnDamage(event.damage, side, event.critical);
}

function setBattleStageClass(stage, classNames = "", activeCombatEvent = null) {
  const tone = activeCombatEvent?.combatEventTone || "neutral";
  const eventClass = activeCombatEvent ? `event-tone-${tone}` : "";
  stage.className = `battle-stage ${eventClass} ${classNames}`.trim();
}

function combatEventClass(event) {
  if (event.critical) return "critical-event";
  if (/\bheilt\b|\bheilen\b|\bheilung\b/i.test(event.text || "")) return "heal-event";
  if (event.damage === 0) return "effect-event";
  return "";
}

function combatAnimationSummary(events) {
  const criticals = events.filter((event) => event.critical).length;
  const effects = events.filter((event) => event.damage === 0 && !/\bheilt\b|\bheilen\b|\bheilung\b/i.test(event.text || "")).length;
  return { criticals, effects };
}

function showBattleResult(playerWon, enemyName, rounds = 0, summary = {}) {
  $("battleText").textContent = playerWon ? t("combat.victory", "Sieg") : t("combat.defeat", "Niederlage");
  $("battleResultTitle").textContent = playerWon ? t("combat.resultWin", "Sieg!") : t("combat.resultLose", "Niederlage");
  const detail = [
    rounds ? `${rounds} ${rounds === 1 ? "Runde" : "Runden"}` : "",
    summary.criticals ? `${summary.criticals} Crit${summary.criticals === 1 ? "" : "s"}` : "",
    summary.effects ? `${summary.effects} Effekt${summary.effects === 1 ? "" : "e"}` : "",
  ].filter(Boolean).join(" · ");
  const baseText = playerWon
    ? t("combat.enemyDefeated", "{enemy} ist besiegt. Beute wird gesichert.", { enemy: enemyName })
    : t("combat.returnCamp", "Du kehrst angeschlagen ins Lager zurück.");
  $("battleResultText").textContent = detail ? `${baseText} ${detail}` : baseText;
  $("battleResult").className = `battle-result show ${playerWon ? "win" : "loss"}`;
}

function hideBattleResult() {
  const result = $("battleResult");
  if (!result) return;
  result.className = "battle-result";
}

function highlightAbilityUse(abilityId) {
  if (!abilityId) return;
  const chip = [...document.querySelectorAll("[data-ability]")]
    .find((entry) => entry.dataset.ability === abilityId);
  if (!chip) return;
  chip.classList.remove("ability-used");
  void chip.offsetWidth;
  chip.classList.add("ability-used");
  window.setTimeout(() => chip.classList.remove("ability-used"), 760);
}

function spawnDamage(amount, side, critical = false) {
  const number = document.createElement("span");
  number.className = `damage-number ${side}${critical ? " critical" : ""}`;
  number.innerHTML = critical ? `<b>CRIT</b><span>-${amount}</span>` : `-${amount}`;
  $("battleStage").appendChild(number);
  window.setTimeout(() => number.remove(), 840);
}
