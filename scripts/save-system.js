const saveDiagnostics = {
  loadedFrom: "",
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
        error: saveDiagnostics.lastParseError || t("common.unknown", "Unbekannter Ladefehler"),
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

  saveDiagnostics.loadedFrom = foundStoredSave ? t("save.newAfterError", "Neuer Spielstand nach Ladefehler") : t("save.newGame", "Neuer Spielstand");
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
  const zone = zoneDisplayName(selectedZone) || "Grauwacht";
  const needed = state.level >= 20 ? t("common.max", "Max") : xpForLevel(state.level);
  return {
    exportedAt,
    character: entityName("class", state.characterClass, classCatalog[state.characterClass]?.name || "Krieger"),
    build: entityName("build", state.build, buildCatalog[state.build]?.name || "Bruiser"),
    level: state.level,
    xp: state.level >= 20 ? t("common.max", "Max") : `${state.xp}/${needed}`,
    gold: state.gold,
    renown: state.renown,
    deaths: state.deaths || 0,
    smithLimit: currentSmithMasteryLimit(),
    zone,
    equipment: equipmentSlots.reduce((result, slot) => {
      result[slot] = getItem(state.equipment[slot])?.name || t("common.empty", "Leer");
      return result;
    }, {}),
    activeQuests: (state.activeQuests || []).length,
    inventoryItems: (state.inventory || []).length,
    pendingLoot: (state.pendingLoot || []).length,
  };
}

function saveFileName() {
  const zone = zoneDisplayName(selectedZone) || "Grauwacht";
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
    log(t("save.importInvalidJson", "Import fehlgeschlagen: Der Text ist kein gültiges JSON."), "bad");
    return false;
  }

  const rawSave = parsed?.save ? JSON.stringify(parsed.save) : JSON.stringify(parsed);
  const loaded = parseSavedState(rawSave);
  if (!loaded) {
    log(t("save.importUnreadable", "Import fehlgeschlagen: Der Spielstand konnte nicht gelesen werden."), "bad");
    return false;
  }

  state = loaded;
  restoreUiSelection();
  state.log = [
    t("save.imported", "Spielstand erfolgreich importiert."),
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
    normalizeLoadedCoreStats(loaded);
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

function normalizeLoadedCoreStats(loaded) {
  const defaults = defaultState();
  const invalidMaxHp = !Number.isFinite(Number(loaded.maxHp)) || Number(loaded.maxHp) <= 0;
  const invalidHp = !Number.isFinite(Number(loaded.hp)) || Number(loaded.hp) < 0;

  loaded.level = boundedInteger(loaded.level, defaults.level, 1, 20);
  loaded.xp = boundedInteger(loaded.xp, defaults.xp, 0, Number.MAX_SAFE_INTEGER);
  loaded.gold = boundedInteger(loaded.gold, defaults.gold, 0, Number.MAX_SAFE_INTEGER);
  loaded.renown = boundedInteger(loaded.renown, defaults.renown, 0, Number.MAX_SAFE_INTEGER);
  loaded.deaths = boundedInteger(loaded.deaths, defaults.deaths, 0, Number.MAX_SAFE_INTEGER);
  loaded.maxHp = invalidMaxHp ? defaults.maxHp : boundedInteger(loaded.maxHp, defaults.maxHp, 1, Number.MAX_SAFE_INTEGER);
  loaded.hp = invalidHp ? defaults.hp : boundedInteger(loaded.hp, defaults.hp, 0, Number.MAX_SAFE_INTEGER);

  if (invalidMaxHp && loaded.hp <= 0) {
    loaded.hp = defaults.hp;
  }
}

function boundedInteger(value, fallback, min, max) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.max(min, Math.min(max, Math.floor(number)));
}

function normalizeLoadedQuests(loaded, parsed) {
  loaded.quests = loaded.quests && typeof loaded.quests === "object" ? loaded.quests : {};
  loaded.rareQuests = normalizeLoadedRareQuests(loaded.rareQuests);
  loaded.completedQuests = (loaded.completedQuests || []).filter((id) => {
    const quest = getLoadedQuestById(loaded, id);
    return quest && !quest.repeatable;
  });
  if (!Array.isArray(parsed.activeQuests)) {
    loaded.activeQuests = questCatalog
      .filter((quest) => (loaded.quests?.[quest.id] || 0) > 0 || loaded.completedQuests.includes(quest.id))
      .map((quest) => quest.id);
  }
  loaded.activeQuests = uniqueQuestIds(Array.isArray(loaded.activeQuests) ? loaded.activeQuests : [])
    .filter((id) => getLoadedQuestById(loaded, id))
    .filter((id) => !isLoadedQuestCompletedPermanent(loaded, id));
  loaded.questBoard = Array.isArray(loaded.questBoard)
    ? uniqueQuestIds(loaded.questBoard)
        .filter((id) => getLoadedQuestById(loaded, id))
        .filter((id) => !loaded.activeQuests.includes(id))
        .filter((id) => !isLoadedQuestCompletedPermanent(loaded, id))
    : ["wolves", "rust", "boars"];
  loaded.unseenQuests = Array.isArray(loaded.unseenQuests)
    ? uniqueQuestIds(loaded.unseenQuests).filter((id) => loaded.questBoard.includes(id))
    : [];
  loaded.winsSinceQuestRefresh = loaded.winsSinceQuestRefresh || 0;
}

function normalizeLoadedRareQuests(rareQuests) {
  if (!rareQuests || typeof rareQuests !== "object" || Array.isArray(rareQuests)) return {};
  return rareQuests;
}

function getLoadedQuestById(loaded, questId) {
  return questCatalog.find((quest) => quest.id === questId) || loaded.rareQuests?.[questId];
}

function isLoadedQuestCompletedPermanent(loaded, questId) {
  const quest = getLoadedQuestById(loaded, questId);
  return Boolean(quest && !quest.repeatable && loaded.completedQuests.includes(questId));
}

function normalizeLoadedCollections(loaded) {
  loaded.customItems = plainObjectOrEmpty(loaded.customItems);
  loaded.itemDurability = plainObjectOrEmpty(loaded.itemDurability);
  loaded.discoveredLoot = plainObjectOrEmpty(loaded.discoveredLoot);
  loaded.defeatedBosses = Array.isArray(loaded.defeatedBosses)
    ? [...new Set(loaded.defeatedBosses)].filter((id) => enemies[id]?.boss)
    : [];
  loaded.pendingLoot = Array.isArray(loaded.pendingLoot) ? loaded.pendingLoot : [];
  loaded.lootQueue = Array.isArray(loaded.lootQueue) ? loaded.lootQueue : [];
  loaded.nextEncounters = plainObjectOrEmpty(loaded.nextEncounters);
  loaded.inventory = Array.isArray(loaded.inventory) ? loaded.inventory : [];
  loaded.log = Array.isArray(loaded.log) ? loaded.log : defaultState().log;
  loaded.lastSaveExportAt = loaded.lastSaveExportAt || "";
}

function plainObjectOrEmpty(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function normalizeLoadedCharacter(loaded) {
  loaded.language = normalizeLanguage(loaded.language || defaultLanguage());
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
