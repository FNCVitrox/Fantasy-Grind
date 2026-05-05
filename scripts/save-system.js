function load() {
  const candidates = [
    { key: saveKey, label: "Hauptspielstand" },
    { key: saveBackupKey, label: "Backup" },
    { key: savePreviousKey, label: "vorheriges Backup" },
  ];

  for (const candidate of candidates) {
    const raw = storageGet(candidate.key);
    if (!raw) continue;
    const loaded = parseSavedState(raw);
    if (!loaded) continue;
    if (candidate.key !== saveKey) restoreRecoveredSave(candidate.label, loaded);
    return loaded;
  }

  return defaultState();
}

function restoreRecoveredSave(label, loaded) {
  loaded.log = [
    `Spielstand aus ${label} wiederhergestellt.`,
    ...(loaded.log || []),
  ].slice(0, 40);
  const restored = JSON.stringify(loaded);
  storageSet(saveKey, restored);
  storageSet(saveBackupKey, restored);
}

function save() {
  syncUiState();
  const previous = storageGet(saveKey);
  const next = JSON.stringify(state);
  if (previous && previous !== next) {
    storageSet(savePreviousKey, previous);
  }
  storageSet(saveKey, next);
  storageSet(saveBackupKey, next);
}

function exportSaveData() {
  const exportedAt = state.lastSaveExportAt || new Date().toISOString();
  return JSON.stringify({
    game: "Fantasy Grind",
    version: saveExportVersion,
    exportedAt,
    metadata: buildSaveMetadata(exportedAt),
    save: state,
  }, null, 2);
}

function buildSaveMetadata(exportedAt = state.lastSaveExportAt || new Date().toISOString()) {
  const zone = zones[selectedZone]?.name || "Grauwacht";
  const needed = state.level >= 20 ? "Max" : xpForLevel(state.level);
  return {
    exportedAt,
    character: classCatalog[state.characterClass]?.name || "Krieger",
    build: buildCatalog[state.build]?.name || "Bruiser",
    level: state.level,
    xp: state.level >= 20 ? "Max" : `${state.xp}/${needed}`,
    gold: state.gold,
    renown: state.renown,
    deaths: state.deaths || 0,
    smithLimit: currentSmithMasteryLimit(),
    zone,
    equipment: equipmentSlots.reduce((result, slot) => {
      result[slot] = getItem(state.equipment[slot])?.name || "Leer";
      return result;
    }, {}),
    activeQuests: (state.activeQuests || []).length,
    inventoryItems: (state.inventory || []).length,
    pendingLoot: (state.pendingLoot || []).length,
  };
}

function saveFileName() {
  const zone = zones[selectedZone]?.name || "Grauwacht";
  const safeZone = zone
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  const stamp = new Date().toISOString().replace(/[:T]/g, "-").slice(0, 16);
  return `Fantasy-Grind-Level-${state.level}-Ruhm-${state.renown}-${safeZone}-${stamp}.json`;
}

function importSaveData(raw) {
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    log("Import fehlgeschlagen: Der Text ist kein gültiges JSON.", "bad");
    return false;
  }

  const rawSave = parsed?.save ? JSON.stringify(parsed.save) : JSON.stringify(parsed);
  const loaded = parseSavedState(rawSave);
  if (!loaded) {
    log("Import fehlgeschlagen: Der Spielstand konnte nicht gelesen werden.", "bad");
    return false;
  }

  state = loaded;
  restoreUiSelection();
  state.log = [
    "Spielstand erfolgreich importiert.",
    ...(state.log || []),
  ].slice(0, 40);
  save();
  render();
  return true;
}

function parseSavedState(raw) {
  try {
    const parsed = normalizeSavedText(JSON.parse(raw));
    const loaded = { ...defaultState(), ...parsed };
    normalizeLoadedQuests(loaded, parsed);
    normalizeLoadedCollections(loaded);
    normalizeLoadedCharacter(loaded);
    migrateEquipmentSlots(loaded);
    loaded.itemDurability = loaded.itemDurability || {};
    loaded.combatLog = Array.isArray(loaded.combatLog) ? loaded.combatLog : [];
    loaded.combatStats = normalizeCombatStats(loaded.combatStats);
    loaded.smithMastery = normalizeSmithMastery(loaded.smithMastery);
    loaded.materials = normalizeMaterials(loaded.materials);
    loaded.ui = normalizeSavedUi(loaded.ui);
    applyBalanceMigration(loaded);
    return loaded;
  } catch {
    return null;
  }
}

function normalizeLoadedQuests(loaded, parsed) {
  loaded.completedQuests = (loaded.completedQuests || []).filter((id) => {
    const quest = getQuestById(id);
    return quest && !quest.repeatable;
  });
  if (!Array.isArray(parsed.activeQuests)) {
    loaded.activeQuests = questCatalog
      .filter((quest) => (loaded.quests?.[quest.id] || 0) > 0 || loaded.completedQuests.includes(quest.id))
      .map((quest) => quest.id);
  }
  loaded.activeQuests = loaded.activeQuests.filter((id) => !isQuestCompletedPermanent(id));
  loaded.questBoard = Array.isArray(loaded.questBoard) ? loaded.questBoard : ["wolves", "rust", "boars"];
  loaded.unseenQuests = Array.isArray(loaded.unseenQuests)
    ? uniqueQuestIds(loaded.unseenQuests).filter((id) => loaded.questBoard.includes(id))
    : [];
  loaded.rareQuests = loaded.rareQuests || {};
  loaded.winsSinceQuestRefresh = loaded.winsSinceQuestRefresh || 0;
}

function normalizeLoadedCollections(loaded) {
  loaded.discoveredLoot = loaded.discoveredLoot || {};
  loaded.lootQueue = Array.isArray(loaded.lootQueue) ? loaded.lootQueue : [];
  loaded.nextEncounters = loaded.nextEncounters || {};
  loaded.lastSaveExportAt = loaded.lastSaveExportAt || "";
}

function normalizeLoadedCharacter(loaded) {
  loaded.characterClass = classCatalog[loaded.characterClass] ? loaded.characterClass : "warrior";
  loaded.build = buildCatalog[loaded.build] ? loaded.build : "bruiser";
  loaded.knownAbilities = Array.isArray(loaded.knownAbilities)
    ? loaded.knownAbilities.filter((id) => abilityCatalog[id])
    : [];
}

function normalizeSavedUi(ui = {}) {
  const selectedZoneId = zones[ui.selectedZone] ? ui.selectedZone : "meadow";
  const zoneEnemies = zones[selectedZoneId]?.enemies || zones.meadow.enemies;
  const selectedEnemyId = zoneEnemies.includes(ui.selectedEnemy) ? ui.selectedEnemy : zoneEnemies[0];
  const bestiaryZoneId = zones[ui.selectedBestiaryZone] ? ui.selectedBestiaryZone : selectedZoneId;
  const bestiaryEnemies = zones[bestiaryZoneId]?.enemies || zoneEnemies;
  const bestiaryEnemyId = bestiaryEnemies.includes(ui.selectedBestiaryEnemy) ? ui.selectedBestiaryEnemy : bestiaryEnemies[0];
  return {
    selectedZone: selectedZoneId,
    selectedEnemy: selectedEnemyId,
    selectedBestiaryZone: bestiaryZoneId,
    selectedBestiaryEnemy: bestiaryEnemyId,
  };
}

function syncUiState() {
  state.ui = normalizeSavedUi({
    selectedZone,
    selectedEnemy,
    selectedBestiaryZone,
    selectedBestiaryEnemy,
  });
}

function restoreUiSelection() {
  const ui = normalizeSavedUi(state.ui);
  state.ui = ui;
  selectedZone = ui.selectedZone;
  selectedEnemy = ui.selectedEnemy;
  selectedBestiaryZone = ui.selectedBestiaryZone;
  selectedBestiaryEnemy = ui.selectedBestiaryEnemy;
}

function readWindowNameStore() {
  if (typeof window === "undefined") return {};
  try {
    const parsed = window.name ? JSON.parse(window.name) : {};
    return parsed && typeof parsed === "object" && parsed.__fantasyGrindSaves
      ? parsed.__fantasyGrindSaves
      : {};
  } catch {
    return {};
  }
}

function writeWindowNameStore(store) {
  if (typeof window === "undefined") return;
  try {
    window.name = JSON.stringify({ __fantasyGrindSaves: store });
  } catch {
    // Some preview/sandbox pages can block storage writes. Other stores may still work.
  }
}

function storageGet(key) {
  const stores = availableStorageStores();
  for (const store of stores) {
    try {
      const value = store.getItem(key);
      if (value) return value;
    } catch {
      // Continue with the next fallback store.
    }
  }

  return readWindowNameStore()[key] || null;
}

function storageSet(key, value) {
  const stores = availableStorageStores();
  for (const store of stores) {
    try {
      store.setItem(key, value);
    } catch {
      // Continue with the next fallback store.
    }
  }

  const windowStore = readWindowNameStore();
  windowStore[key] = value;
  writeWindowNameStore(windowStore);
}

function availableStorageStores() {
  return [
    typeof localStorage !== "undefined" ? localStorage : null,
    typeof sessionStorage !== "undefined" ? sessionStorage : null,
  ].filter(Boolean);
}
