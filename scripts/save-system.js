const saveDiagnostics = {
  loadedFrom: "Noch nicht geladen",
  recoveredFrom: "",
  failedLoads: [],
  lastParseError: "",
  startedWithStoredSave: false,
};

function load() {
  const candidates = [
    { key: saveKey, label: "Hauptspielstand" },
    { key: saveBackupKey, label: "Backup" },
    { key: savePreviousKey, label: "vorheriges Backup" },
  ];
  let foundStoredSave = false;

  for (const candidate of candidates) {
    const raw = storageGet(candidate.key);
    if (!raw) continue;
    foundStoredSave = true;
    const loaded = parseSavedState(raw);
    if (!loaded) {
      saveDiagnostics.failedLoads.push({
        key: candidate.key,
        label: candidate.label,
        error: saveDiagnostics.lastParseError || "Unbekannter Ladefehler",
      });
      continue;
    }
    saveDiagnostics.loadedFrom = candidate.label;
    saveDiagnostics.startedWithStoredSave = true;
    if (candidate.key !== saveKey) {
      saveDiagnostics.recoveredFrom = candidate.label;
      restoreRecoveredSave(candidate.label, loaded);
    }
    return loaded;
  }

  // Wenn eine gespeicherte Datei gefunden wurde, aber alle Versuche fehlschlugen,
  // versuchen wir eine automatisierte Reparatur (z. B. abgeschnittene JSONs).
  if (foundStoredSave) {
    const recoveryKeys = [saveKey, saveBackupKey, savePreviousKey];
    for (const key of recoveryKeys) {
      const raw = storageGet(key);
      if (!raw) continue;
      const recovered = attemptRecoverSavedState(raw);
      if (recovered) {
        saveDiagnostics.loadedFrom = key === saveKey ? "Hauptspielstand (repariert)" : key === saveBackupKey ? "Backup (repariert)" : "Vorheriges Backup (repariert)";
        saveDiagnostics.recoveredFrom = saveDiagnostics.loadedFrom;
        saveDiagnostics.startedWithStoredSave = true;
        restoreRecoveredSave(saveDiagnostics.loadedFrom, recovered);
        return recovered;
      }
    }
  }

  saveDiagnostics.loadedFrom = foundStoredSave ? "Neuer Spielstand nach Ladefehler" : "Neuer Spielstand";
  saveDiagnostics.startedWithStoredSave = foundStoredSave;
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
    loaded.achievements = normalizeAchievements(loaded.achievements);
    loaded.smithMastery = normalizeSmithMastery(loaded.smithMastery, loaded);
    loaded.enchanting = normalizeEnchanting(loaded.enchanting);
    loaded.materials = normalizeMaterials(loaded.materials);
    loaded.ui = normalizeSavedUi(loaded.ui);
    applyBalanceMigration(loaded);
    saveDiagnostics.lastParseError = "";
    return loaded;
  } catch (error) {
    saveDiagnostics.lastParseError = error?.message || "Unbekannter Ladefehler";
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
  loaded.defeatedBosses = Array.isArray(loaded.defeatedBosses)
    ? [...new Set(loaded.defeatedBosses)].filter((id) => enemies[id]?.boss)
    : [];
  loaded.lootQueue = Array.isArray(loaded.lootQueue) ? loaded.lootQueue : [];
  loaded.nextEncounters = loaded.nextEncounters || {};
  loaded.lastSaveExportAt = loaded.lastSaveExportAt || "";
}

function normalizeLoadedCharacter(loaded) {
  loaded.characterClass = classCatalog[loaded.characterClass] ? loaded.characterClass : "warrior";
  loaded.build = buildCatalog[loaded.build] ? loaded.build : "damage";
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

function browserStorageStatus() {
  return {
    localStorage: testStorageStore("localStorage", typeof localStorage !== "undefined" ? localStorage : null),
    sessionStorage: testStorageStore("sessionStorage", typeof sessionStorage !== "undefined" ? sessionStorage : null),
    windowName: testWindowNameStore(),
    loadedFrom: saveDiagnostics.loadedFrom,
    recoveredFrom: saveDiagnostics.recoveredFrom,
    failedLoads: saveDiagnostics.failedLoads,
    hasStoredSave: Boolean(storageGet(saveKey)),
  };
}

function testStorageStore(label, store) {
  if (!store) {
    return { label, ok: false, message: "nicht verfuegbar" };
  }

  const testKey = "__fantasy_grind_storage_test__";
  try {
    store.setItem(testKey, "ok");
    const ok = store.getItem(testKey) === "ok";
    if (typeof store.removeItem === "function") store.removeItem(testKey);
    return { label, ok, message: ok ? "aktiv" : "Lesetest fehlgeschlagen" };
  } catch (error) {
    return { label, ok: false, message: error?.message || "blockiert" };
  }
}

function testWindowNameStore() {
  if (typeof window === "undefined") {
    return { label: "window.name", ok: false, message: "nicht verfuegbar" };
  }

  const testKey = "__fantasy_grind_window_test__";
  try {
    const store = readWindowNameStore();
    store[testKey] = "ok";
    writeWindowNameStore(store);
    const ok = readWindowNameStore()[testKey] === "ok";
    const cleanedStore = readWindowNameStore();
    delete cleanedStore[testKey];
    writeWindowNameStore(cleanedStore);
    return { label: "window.name", ok, message: ok ? "Fallback aktiv" : "Fallback blockiert" };
  } catch (error) {
    return { label, ok: false, message: error?.message || "blockiert" };
  }
}

function availableStorageStores() {
  return [
    typeof localStorage !== "undefined" ? localStorage : null,
    typeof sessionStorage !== "undefined" ? sessionStorage : null,
  ].filter(Boolean);
}

/**
 * Versucht, einen abgeschnittenen JSON-String zu reparieren und zu parsen.
 * Gibt das geladene State-Objekt zurück oder null.
 */
function attemptRecoverSavedState(raw) {
  if (!raw || typeof raw !== "string") return null;

  // 1) Direkter Parse Versuch (falls parseSavedState beim ersten Mal wegen anderer Gründe fehlschlug)
  const direct = parseSavedState(raw);
  if (direct) return direct;

  // 2) Versuche, fallengelassenes Ende zu reparieren, indem wir das letzte '}' finden und schrittweise kürzen.
  let idx = raw.lastIndexOf("}");
  while (idx > 0) {
    const candidate = raw.slice(0, idx + 1);
    try {
      // Testweise JSON.parse, um Syntaxfehler auszuschließen
      JSON.parse(candidate);
      const loaded = parseSavedState(candidate);
      if (loaded) return loaded;
    } catch {
      // ignore und weiter kürzen
    }
    idx = raw.lastIndexOf("}", idx - 1);
  }

  // 3) Kein Recovery möglich
  return null;
}
