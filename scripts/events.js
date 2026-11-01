document.querySelectorAll("[data-zone]").forEach((button) => {
  button.addEventListener("click", () => {
    ui.selectedZone = button.dataset.zone;
    ui.selectedEnemy = zones[ui.selectedZone].enemies[0];
    save();
    closeZone();
    render();
  });
});

$("enemyList").addEventListener("click", (event) => {
  const button = event.target.closest("[data-enemy]");
  if (!button) return;
  ui.selectedEnemy = button.dataset.enemy;
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

// Auto-Loot / Junk-Filter: Schalter im Rucksack und im Beute-Fenster
["inventorySummary", "lootSettings"].forEach((id) => {
  $(id).addEventListener("click", (event) => {
    const toggle = event.target.closest("[data-setting-toggle]");
    if (toggle) toggleSetting(toggle.dataset.settingToggle);
  });
});

$("smithHome").addEventListener("click", (event) => {
  if (event.target.closest("[data-expand-inventory]")) expandInventory();
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
    ui.selectedBestiaryType = type.dataset.bestiaryType;
    const firstZone = bestiaryZonesForType(ui.selectedBestiaryType)[0];
    if (firstZone) {
      ui.selectedBestiaryZone = firstZone[0];
      ui.selectedBestiaryEnemy = firstZone[1].enemies[0] || ui.selectedBestiaryEnemy;
    }
    ui.selectedBestiaryCategory = "overview";
    ui.selectedBestiaryFilter = "all";
    ui.selectedBestiarySearch = "";
    ui.selectedBestiaryPage = 0;
    ui.selectedBestiaryItemKey = "";
    ui.bestiaryListDirty = true;
    renderBestiary();
    return;
  }

  const zone = event.target.closest("[data-bestiary-zone]");
  if (zone) {
    ui.selectedBestiaryZone = zone.dataset.bestiaryZone;
    ui.selectedBestiaryType = zones[ui.selectedBestiaryZone]?.type || "zone";
    ui.selectedBestiaryEnemy = zones[ui.selectedBestiaryZone]?.enemies[0] || ui.selectedBestiaryEnemy;
    ui.selectedBestiaryCategory = "overview";
    ui.selectedBestiaryFilter = "all";
    ui.selectedBestiarySearch = "";
    ui.selectedBestiaryPage = 0;
    ui.selectedBestiaryItemKey = "";
    ui.bestiaryListDirty = true;
    renderBestiary();
    return;
  }

  const page = event.target.closest("[data-bestiary-page]");
  if (page) {
    ui.selectedBestiaryPage += page.dataset.bestiaryPage === "next" ? 1 : -1;
    renderBestiaryDetail();
    return;
  }

  const filter = event.target.closest("[data-bestiary-filter]");
  if (filter) {
    ui.selectedBestiaryFilter = filter.dataset.bestiaryFilter;
    ui.selectedBestiaryPage = 0;
    ui.selectedBestiaryItemKey = "";
    renderBestiaryDetail();
    return;
  }

  const material = event.target.closest("[data-bestiary-material]");
  if (material) {
    ui.selectedBestiaryItemKey = `mat:${material.dataset.bestiaryMaterial}`;
    renderBestiaryDetail();
    return;
  }

  const item = event.target.closest("[data-bestiary-item]");
  if (item) {
    ui.selectedBestiaryItemKey = item.dataset.bestiaryItem;
    renderBestiaryDetail();
    return;
  }

  const category = event.target.closest("[data-bestiary-category]");
  if (category) {
    ui.selectedBestiaryCategory = category.dataset.bestiaryCategory;
    ui.selectedBestiaryFilter = "all";
    ui.selectedBestiarySearch = "";
    ui.selectedBestiaryPage = 0;
    ui.selectedBestiaryItemKey = "";
    renderBestiaryDetail();
    return;
  }

  const button = event.target.closest("[data-bestiary]");
  if (!button) return;
  ui.selectedBestiaryEnemy = button.dataset.bestiary;
  ui.selectedBestiaryZone = zoneKeyForEnemy(ui.selectedBestiaryEnemy);
  ui.selectedBestiaryType = zones[ui.selectedBestiaryZone]?.type || "zone";
  ui.selectedBestiaryCategory = "overview";
  ui.selectedBestiaryFilter = "all";
  ui.selectedBestiarySearch = "";
  ui.selectedBestiaryPage = 0;
  ui.selectedBestiaryItemKey = "";
  updateBestiaryActiveCard();
  renderBestiaryDetail();
});

$("bestiary").addEventListener("input", (event) => {
  if (!event.target.matches("#bestiarySearch")) return;
  ui.selectedBestiarySearch = event.target.value;
  ui.selectedBestiaryPage = 0;
  ui.selectedBestiaryItemKey = "";
  if (ui.bestiarySearchFrame) cancelAnimationFrame(ui.bestiarySearchFrame);
  ui.bestiarySearchFrame = requestAnimationFrame(() => {
    ui.bestiarySearchFrame = 0;
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
  ui.smithView = button.dataset.smithView;
  renderSmith();
});

$("smithUpgradeSection").addEventListener("click", (event) => {
  const button = event.target.closest("[data-smith-view]");
  if (!button) return;
  ui.smithView = button.dataset.smithView;
  renderSmith();
});

$("smithSalvageSection").addEventListener("click", (event) => {
  const button = event.target.closest("[data-smith-view]");
  if (!button) return;
  ui.smithView = button.dataset.smithView;
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
  ui.smithView = button.dataset.smithView;
  renderSmith();
});

$("salvageList").addEventListener("click", (event) => {
  const button = event.target.closest("[data-salvage]");
  if (button) salvageInventoryItem(Number(button.dataset.salvage));
});

$("fightBtn").addEventListener("click", () => {
  if (ui.isFighting) {
    if (isManualCombatMode()) return;
    ui.skipCombat = true;
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
$("openClassModalBtn").addEventListener("click", () => {
  renderClassChoices();
  openModal("classModal");
});
$("openPlayerStatsBtn").addEventListener("click", () => {
  renderPlayerStatsDetails();
  openModal("playerStatsModal");
});
$("buildList").addEventListener("click", (event) => {
  const button = event.target.closest("[data-build]");
  if (button) setBuild(button.dataset.build);
});
$("classChoiceList").addEventListener("click", (event) => {
  const button = event.target.closest("[data-character-class]");
  if (!button) return;
  setCharacterClass(button.dataset.characterClass);
  closeClassModal();
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
  ui.smithView = "home";
  renderSmith();
  openModal("smithModal");
});
$("openEnchantBtn").addEventListener("click", () => {
  ui.smithView = "enchant";
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
  const button = event.target.closest("[data-build]");
  if (button) setBuild(button.dataset.build);
});
$("playerStatsModal").addEventListener("click", (event) => {
  if (event.target.id === "playerStatsModal") closePlayerStats();
});
$("closeClassModalBtn").addEventListener("click", closeClassModal);
$("classModal").addEventListener("click", (event) => {
  if (event.target.id === "classModal") closeClassModal();
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
$("newGameTopBtn").addEventListener("click", startNewGame);
$("importSaveTopBtn").addEventListener("click", importSave);
$("saveFileInput").addEventListener("change", importSaveFile);

void bootGame();
// Offenen Speichervorgang beim Verlassen sofort schreiben (pagehide/visibilitychange greifen auch auf dem Handy).
window.addEventListener("beforeunload", () => save());
window.addEventListener("pagehide", () => save());
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "hidden") save();
});
window.addEventListener("scroll", hideFloatingTooltip, { passive: true, capture: true });

async function bootGame() {
  setupStudioSplash();
  await ensureLanguagePack(currentLanguage());
  render();
  scheduleStudioSplashHide();
  // Englisch im Hintergrund nachladen, damit neue Log-Einträge sofort in beiden Sprachen gespeichert werden.
  void ensureLanguagePack("en");
}

function setupStudioSplash() {
  const splash = $("studioSplash");
  if (!splash) return;
  splash.addEventListener("click", hideStudioSplash, { once: true });
  splash.addEventListener("keydown", (event) => {
    if (event.key === "Escape" || event.key === "Enter" || event.key === " ") hideStudioSplash();
  });
}

function scheduleStudioSplashHide() {
  const splash = $("studioSplash");
  if (!splash) return;
  const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
  window.setTimeout(hideStudioSplash, reducedMotion ? 450 : 1500);
}

function hideStudioSplash() {
  const splash = $("studioSplash");
  if (!splash || splash.classList.contains("is-hidden")) return;
  splash.classList.add("is-hidden");
  window.setTimeout(() => splash.remove(), 520);
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

function closeClassModal() {
  closeModal("classModal");
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
  log(() => t("save.exported", "Spielstand als Datei gesichert."), "drop");
  render();
}

function importSave() {
  const input = $("saveFileInput");
  input.value = "";
  input.click();
}

function startNewGame() {
  const message = t(
    "save.newRunConfirm",
    "Wirklich von vorne anfangen? Dein aktueller Browser-Spielstand wird überschrieben. Lade vorher eine Sicherung herunter, wenn du ihn behalten willst.",
  );
  const confirmed = typeof window.confirm !== "function" || window.confirm(message);
  if (!confirmed) return;

  resetSaveData();
  closeSave();
  setControlsDisabled(false);
  render();
}

function importSaveFile(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    const imported = importSaveData(String(reader.result || ""));
    if (imported) log(() => t("save.importedFrom", "Spielstand aus {file} geladen.", { file: file.name }), "drop");
  };
  reader.onerror = () => {
    log(() => t("save.importFileUnreadable", "Import fehlgeschlagen: Die Datei konnte nicht gelesen werden."), "bad");
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
    if (button.id === "openClassModalBtn") return;
    if (button.id === "closePlayerStatsBtn") return;
    if (button.id === "closeClassModalBtn") return;
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
  if (ui.skipCombat) return Promise.resolve();

  return new Promise((resolve) => {
    const started = performance.now();
    const timer = window.setInterval(() => {
      if (ui.skipCombat || performance.now() - started >= ms) {
        window.clearInterval(timer);
        resolve();
      }
    }, 35);
  });
}

function waitResult(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
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
  clearBattleResultTimer();
  const detail = [
    rounds ? t("combat.roundsCount", "{count} Runden", { count: rounds }) : "",
    summary.criticals ? t(summary.criticals === 1 ? "combat.summaryCrit" : "combat.summaryCrits", "{count} Crits", { count: summary.criticals }) : "",
    summary.effects ? t(summary.effects === 1 ? "combat.summaryEffect" : "combat.summaryEffects", "{count} Effekte", { count: summary.effects }) : "",
  ].filter(Boolean).join(" · ");
  const baseText = playerWon
    ? t("combat.enemyDefeated", "{enemy} ist besiegt. Beute wird gesichert.", { enemy: enemyName })
    : t("combat.returnCamp", "Du kehrst angeschlagen ins Lager zurück.");
  $("battleResultText").textContent = detail ? `${baseText} ${detail}` : baseText;
  $("battleResult").className = `battle-result show ${playerWon ? "win" : "loss"}`;
}


function clearBattleResultTimer() {
  if (!ui.battleResultTimer) return;
  window.clearTimeout(ui.battleResultTimer);
  ui.battleResultTimer = 0;
}

function hideBattleResult() {
  clearBattleResultTimer();
  const result = $("battleResult");
  if (!result) return;
  result.className = "battle-result";
}

// Banner bleibt sichtbar, ohne den Spielablauf zu blockieren (z. B. nach "Überspringen").
function hideBattleResultLater(ms) {
  clearBattleResultTimer();
  ui.battleResultTimer = window.setTimeout(() => {
    ui.battleResultTimer = 0;
    hideBattleResult();
    if (typeof resetBattleStageState === "function") resetBattleStageState();
  }, ms);
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
