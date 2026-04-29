document.querySelectorAll("[data-zone]").forEach((button) => {
  button.addEventListener("click", () => {
    selectedZone = button.dataset.zone;
    selectedEnemy = zones[selectedZone].enemies[0];
    closeZone();
    render();
  });
});

$("enemyList").addEventListener("click", (event) => {
  const button = event.target.closest("[data-enemy]");
  if (!button) return;
  selectedEnemy = button.dataset.enemy;
  renderEnemies();
  renderSelectedEnemy();
});

$("inventory").addEventListener("click", (event) => {
  const equip = event.target.closest("[data-equip]");
  if (equip) {
    equipInventoryItem(Number(equip.dataset.equip));
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

$("bestiary").addEventListener("click", (event) => {
  const zone = event.target.closest("[data-bestiary-zone]");
  if (zone) {
    selectedBestiaryZone = zone.dataset.bestiaryZone;
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

$("bestiary").addEventListener("mouseover", (event) => {
  const row = event.target.closest(".item-hover-row, .material-hover-row");
  if (!row || row.contains(event.relatedTarget)) return;
  showFloatingTooltip(row);
  positionFloatingTooltip(event);
});

$("bestiary").addEventListener("mousemove", (event) => {
  if (event.target.closest(".item-hover-row, .material-hover-row")) {
    positionFloatingTooltip(event);
  }
});

$("bestiary").addEventListener("mouseout", (event) => {
  const row = event.target.closest(".item-hover-row, .material-hover-row");
  if (!row || row.contains(event.relatedTarget)) return;
  hideFloatingTooltip();
});

$("equipmentDetails").addEventListener("mouseover", (event) => {
  const row = event.target.closest(".set-hover-row");
  if (!row || row.contains(event.relatedTarget)) return;
  showFloatingTooltip(row);
  positionFloatingTooltip(event);
});

$("equipmentDetails").addEventListener("mousemove", (event) => {
  if (event.target.closest(".set-hover-row")) {
    positionFloatingTooltip(event);
  }
});

$("equipmentDetails").addEventListener("mouseout", (event) => {
  const row = event.target.closest(".set-hover-row");
  if (!row || row.contains(event.relatedTarget)) return;
  hideFloatingTooltip();
});

$("equipment").addEventListener("click", (event) => {
  if (!event.target.closest("[data-open-equipment]")) return;
  renderEquipmentDetails();
  openModal("equipmentModal");
});

$("equipment").addEventListener("mouseover", (event) => {
  const row = event.target.closest(".item-hover-row");
  if (!row || row.contains(event.relatedTarget)) return;
  showFloatingTooltip(row);
  positionFloatingTooltip(event);
});

$("equipment").addEventListener("mousemove", (event) => {
  if (event.target.closest(".item-hover-row")) {
    positionFloatingTooltip(event);
  }
});

$("equipment").addEventListener("mouseout", (event) => {
  const row = event.target.closest(".item-hover-row");
  if (!row || row.contains(event.relatedTarget)) return;
  hideFloatingTooltip();
});

$("smithGrid").addEventListener("click", (event) => {
  const button = event.target.closest("[data-upgrade]");
  if (button) upgradeEquipped(button.dataset.upgrade);
});

$("smithHome").addEventListener("click", (event) => {
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

$("salvageList").addEventListener("click", (event) => {
  const button = event.target.closest("[data-salvage]");
  if (button) salvageInventoryItem(Number(button.dataset.salvage));
});

$("fightBtn").addEventListener("click", () => {
  if (isFighting) {
    skipCombat = true;
    $("battleText").textContent = "Kampf wird übersprungen...";
    $("fightBtn").textContent = "Überspringe...";
    $("fightBtn").disabled = true;
    armCombatWatchdog(1800);
    return;
  }

  fight();
});
$("restBtn").addEventListener("click", rest);
$("buildList").addEventListener("click", (event) => {
  const button = event.target.closest("[data-build]");
  if (button) setBuild(button.dataset.build);
});
$("sellAllBtn").addEventListener("click", sellAllInventoryItems);
$("salvageAllBtn").addEventListener("click", salvageAllInventoryItems);
$("openBestiaryBtn").addEventListener("click", () => {
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
$("openInventoryBtn").addEventListener("click", () => {
  renderInventory();
  openModal("inventoryModal");
});
$("closeInventoryBtn").addEventListener("click", closeInventory);
$("inventoryModal").addEventListener("click", (event) => {
  if (event.target.id === "inventoryModal") closeInventory();
});
$("openSmithBtn").addEventListener("click", () => {
  smithView = "home";
  renderSmith();
  openModal("smithModal");
});
$("closeSmithBtn").addEventListener("click", closeSmith);
$("smithModal").addEventListener("click", (event) => {
  if (event.target.id === "smithModal") closeSmith();
});
$("toggleLogBtn").addEventListener("click", () => {
  renderLog();
  openModal("logModal");
});
$("closeLogBtn").addEventListener("click", closeLog);
$("logModal").addEventListener("click", (event) => {
  if (event.target.id === "logModal") closeLog();
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
$("exportSaveTopBtn").addEventListener("click", exportSave);
$("importSaveTopBtn").addEventListener("click", importSave);
$("saveFileInput").addEventListener("change", importSaveFile);
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

function closeZone() {
  closeModal("zoneModal");
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

function closeLog() {
  closeModal("logModal");
}

function closeRepair() {
  closeModal("repairModal");
}

function closeEquipment() {
  closeModal("equipmentModal");
}

function exportSave() {
  const blob = new Blob([exportSaveData()], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const stamp = new Date().toISOString().slice(0, 10);
  link.href = url;
  link.download = `fantasy-grind-save-${stamp}.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  log("Spielstand als Datei gesichert.", "drop");
  save();
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
    if (imported) log(`Spielstand aus ${file.name} geladen.`, "drop");
  };
  reader.onerror = () => {
    log("Import fehlgeschlagen: Die Datei konnte nicht gelesen werden.", "bad");
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
    if (button.id === "resetBtn") return;
    if (button.id === "exportSaveTopBtn") return;
    if (button.id === "importSaveTopBtn") return;
    if (button.id === "toggleLogBtn") return;
    if (button.id === "closeLogBtn") return;
    if (button.id === "closeRepairBtn") return;
    if (button.id === "closeEquipmentBtn") return;
    if (button.id === "fightBtn") return;
    if (button.id === "openBestiaryBtn") return;
    if (button.id === "closeBestiaryBtn") return;
    if (button.id === "openZoneBtn") return;
    if (button.id === "closeZoneBtn") return;
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

async function playCombatAnimation(enemy, events, playerWon, combatHealth = {}) {
  const stage = $("battleStage");
  const playerMaxHp = combatHealth.playerMaxHp || state.maxHp;
  const enemyMaxHp = combatHealth.enemyMaxHp || enemy.hp;
  const startPlayerHp = combatHealth.playerStartHp ?? state.hp;
  updateBattleHealth(startPlayerHp, playerMaxHp, enemyMaxHp, enemyMaxHp);
  $("battleText").textContent = `${enemy.name} tritt vor.`;
  stage.classList.remove("victory", "defeat", "hero-attacks", "enemy-attacks", "hero-hit", "enemy-hit");
  await waitCombat(280);

  const visibleEvents = events.slice(0, 14);
  for (const event of visibleEvents) {
    if (skipCombat) break;
    const attackClass = event.actor === "hero" ? "hero-attacks enemy-hit" : "enemy-attacks hero-hit";
    const side = event.actor === "hero" ? "right" : "left";
    stage.className = `battle-stage ${attackClass}`;
    $("battleText").textContent = event.text || (event.actor === "hero"
      ? `Du triffst für ${event.damage}.`
      : `${enemy.name} trifft für ${event.damage}.`);
    updateBattleHealth(event.playerHp, playerMaxHp, event.enemyHp, enemyMaxHp);
    highlightAbilityUse(event.abilityId);
    if (event.damage > 0) spawnDamage(event.damage, side);
    await waitCombat(470);
    stage.className = "battle-stage";
    await waitCombat(110);
  }

  if (!skipCombat && events.length > visibleEvents.length) {
    $("battleText").textContent = "Der Kampf zieht sich schwer und staubig hin.";
    await waitCombat(420);
  }

  const finalEvent = events[events.length - 1];
  if (finalEvent) {
    updateBattleHealth(finalEvent.playerHp, playerMaxHp, finalEvent.enemyHp, enemyMaxHp);
  }

  stage.className = "battle-stage";
  stage.classList.add(playerWon ? "victory" : "defeat");
  $("battleText").textContent = playerWon ? "Sieg" : "Niederlage";
  await waitCombat(skipCombat ? 180 : 780);
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

function spawnDamage(amount, side) {
  const number = document.createElement("span");
  number.className = `damage-number ${side}`;
  number.textContent = `-${amount}`;
  $("battleStage").appendChild(number);
  window.setTimeout(() => number.remove(), 840);
}

