const saveDiagnostics = {
  loadedFrom: "",
  recoveredFrom: "",
  failedLoads: [],
  lastParseError: "",
  startedWithStoredSave: false,
  indexedDbMirror: "",
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
  loaded.quests = normalizeQuestProgress(loaded.quests);
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
  return Object.fromEntries(Object.entries(rareQuests)
    .map(([id, quest]) => normalizeLoadedRareQuest(id, quest))
    .filter(Boolean));
}

function normalizeLoadedRareQuest(id, quest) {
  const questId = safeSaveId(id, "");
  if (!questId || !quest || typeof quest !== "object" || Array.isArray(quest)) return null;
  const target = safeQuestTarget(quest.target);
  const enemyIds = Array.isArray(quest.enemyIds)
    ? uniqueQuestIds(quest.enemyIds.filter((enemyId) => enemies[enemyId]))
    : [];
  const normalized = {
    id: questId,
    key: safeSaveId(quest.key, target),
    name: safeSaveText(quest.name, "Seltene Quest", 80),
    rarity: safeRarity(quest.rarity, quest.rare ? "legendary" : "epic"),
    repeatable: quest.repeatable !== false,
    rare: true,
    text: safeSaveText(quest.text, "Erfülle den seltenen Auftrag.", 220),
    target,
    needed: boundedInteger(quest.needed, 1, 1, 99),
    rewardXp: boundedInteger(quest.rewardXp, 0, 0, 999999),
    rewardGold: boundedInteger(quest.rewardGold, 0, 0, 999999),
    rewardItem: Boolean(quest.rewardItem),
  };
  if (enemyIds.length) normalized.enemyIds = enemyIds;
  if (equipmentSlots.includes(quest.slot)) normalized.slot = quest.slot;
  return [questId, normalized];
}

function normalizeQuestProgress(quests) {
  if (!quests || typeof quests !== "object" || Array.isArray(quests)) return {};
  return Object.fromEntries(Object.entries(quests)
    .filter(([id]) => safeSaveId(id, ""))
    .map(([id, value]) => [id, boundedInteger(value, 0, 0, 999999)]));
}

function safeQuestTarget(target) {
  return ["wolf", "rust", "elite", "enemy", "dungeon", "bandit", "field", "ash"].includes(target)
    ? target
    : "enemy";
}

function getLoadedQuestById(loaded, questId) {
  return questCatalog.find((quest) => quest.id === questId) || loaded.rareQuests?.[questId];
}

function isLoadedQuestCompletedPermanent(loaded, questId) {
  const quest = getLoadedQuestById(loaded, questId);
  return Boolean(quest && !quest.repeatable && loaded.completedQuests.includes(questId));
}

function normalizeLoadedCollections(loaded) {
  loaded.customItems = normalizeSavedItemMap(loaded.customItems);
  loaded.itemDurability = plainObjectOrEmpty(loaded.itemDurability);
  loaded.discoveredLoot = normalizeDiscoveredLoot(loaded.discoveredLoot);
  loaded.defeatedBosses = Array.isArray(loaded.defeatedBosses)
    ? [...new Set(loaded.defeatedBosses)].filter((id) => enemies[id]?.boss)
    : [];
  loaded.bossDropPity = normalizeBossDropPity(loaded.bossDropPity);
  loaded.pendingLoot = normalizeSavedItemList(loaded.pendingLoot, "pending-loot");
  loaded.lootQueue = Array.isArray(loaded.lootQueue)
    ? loaded.lootQueue.map((items, index) => normalizeSavedItemList(items, `queued-loot-${index}`)).filter((items) => items.length)
    : [];
  loaded.nextEncounters = plainObjectOrEmpty(loaded.nextEncounters);
  loaded.inventory = Array.isArray(loaded.inventory)
    ? uniqueSaveIds(loaded.inventory).filter((id) => items[id] || loaded.customItems[id])
    : [];
  loaded.lockedItems = Array.isArray(loaded.lockedItems)
    ? uniqueSaveIds(loaded.lockedItems).filter((id) => loaded.inventory.includes(id))
    : [];
  loaded.log = Array.isArray(loaded.log) ? loaded.log : defaultState().log;
  loaded.lastSaveExportAt = loaded.lastSaveExportAt || "";
}

function normalizeSavedItemMap(value) {
  const source = plainObjectOrEmpty(value);
  return Object.fromEntries(Object.entries(source)
    .map(([id, item]) => {
      const itemId = safeSaveId(id, "");
      if (!itemId) return null;
      const normalized = normalizeSavedItem(item, itemId);
      return normalized ? [itemId, { ...normalized, id: itemId }] : null;
    })
    .filter(Boolean));
}

function normalizeSavedItemList(value, fallbackPrefix) {
  if (!Array.isArray(value)) return [];
  return value
    .map((item, index) => normalizeSavedItem(item, `${fallbackPrefix}-${index}`))
    .filter(Boolean);
}

function normalizeDiscoveredLoot(value) {
  const source = plainObjectOrEmpty(value);
  return Object.fromEntries(Object.entries(source)
    .filter(([enemyId]) => enemies[enemyId])
    .map(([enemyId, drops]) => [
      enemyId,
      Object.fromEntries(Object.entries(plainObjectOrEmpty(drops))
        .map(([key, item], index) => {
          const normalized = normalizeSavedItem(item, `discovered-${enemyId}-${index}`);
          return normalized ? [safeSaveText(key, `drop-${index}`, 180), normalized] : null;
        })
        .filter(Boolean)),
    ]));
}

function normalizeSavedItem(item, fallbackId) {
  if (!item || typeof item !== "object" || Array.isArray(item)) return null;
  const normalized = { ...item };
  normalized.id = safeSaveId(normalized.id, fallbackId);
  normalized.name = safeSaveText(normalized.name, "", 90);
  normalized.slot = equipmentSlots.includes(normalized.slot) ? normalized.slot : "ring";
  normalized.quality = safeRarity(normalized.quality, "common");
  normalized.damage = boundedInteger(normalized.damage, 0, 0, 9999);
  normalized.defense = boundedInteger(normalized.defense, 0, 0, 9999);
  normalized.critChance = safePercent(normalized.critChance);
  normalized.critDamage = safePercent(normalized.critDamage);
  normalized.durability = boundedInteger(normalized.durability, 100, 0, 100);
  normalized.upgrade = boundedInteger(normalized.upgrade, 0, 0, 99);
  normalized.enchantments = normalizeItemEnchantments(normalized);
  if (!itemEffectCatalog[normalized.effect]?.slots?.includes(normalized.slot)) delete normalized.effect;
  if (!setBonuses[normalized.set]) delete normalized.set;
  if (!["quest"].includes(normalized.sourceType)) delete normalized.sourceType;
  if (normalized.sourceEnemy && !enemies[normalized.sourceEnemy]) delete normalized.sourceEnemy;
  if (normalized.sourceQuest) normalized.sourceQuest = safeSaveId(normalized.sourceQuest, "");
  normalizeItemSlot(normalized);
  return normalized;
}

function safeRarity(value, fallback = "common") {
  return ["common", "rare", "epic", "legendary"].includes(value) ? value : fallback;
}

function safePercent(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return 0;
  return Math.max(0, Math.min(5, Math.round(number * 100) / 100));
}

function uniqueSaveIds(ids) {
  return [...new Set(ids.map((id) => safeSaveId(id, "")).filter(Boolean))];
}

function safeSaveId(value, fallback) {
  const text = typeof value === "string" ? value : "";
  return /^[a-zA-Z0-9_-]{1,96}$/.test(text) ? text : fallback;
}

function safeSaveText(value, fallback = "", maxLength = 160) {
  return typeof value === "string" ? value.slice(0, maxLength) : fallback;
}

function plainObjectOrEmpty(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function normalizeBossDropPity(value) {
  const source = plainObjectOrEmpty(value);
  return Object.fromEntries(Object.entries(source)
    .filter(([id]) => enemies[id]?.boss)
    .map(([id, count]) => [id, Math.max(0, Math.min(bossDropPityGoal, Math.floor(count || 0)))]));
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
  const combatMode = ui.combatMode === "manual" ? "manual" : "auto";
  return {
    selectedZone: selectedZoneId,
    selectedEnemy: selectedEnemyId,
    selectedBestiaryZone: bestiaryZoneId,
    selectedBestiaryEnemy: bestiaryEnemyId,
    combatMode,
  };
}

function syncUiState() {
  state.ui = normalizeSavedUi({
    selectedZone,
    selectedEnemy,
    selectedBestiaryZone,
    selectedBestiaryEnemy,
    combatMode: state.ui?.combatMode,
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
  mirrorSaveToIndexedDb(key, value);
}

function browserStorageStatus() {
  return {
    localStorage: testStorageStore("localStorage", typeof localStorage !== "undefined" ? localStorage : null),
    sessionStorage: testStorageStore("sessionStorage", typeof sessionStorage !== "undefined" ? sessionStorage : null),
    indexedDB: testIndexedDbStore(),
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

function indexedDbAvailable() {
  return typeof indexedDB !== "undefined" && typeof indexedDB.open === "function";
}

function mirrorSaveToIndexedDb(key, value) {
  if (!indexedDbAvailable()) {
    saveDiagnostics.indexedDbMirror = "nicht verfuegbar";
    return;
  }

  try {
    const request = indexedDB.open(indexedDbName, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(indexedDbStoreName)) {
        db.createObjectStore(indexedDbStoreName, { keyPath: "key" });
      }
    };
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(indexedDbStoreName, "readwrite");
      transaction.objectStore(indexedDbStoreName).put({
        key,
        value,
        updatedAt: new Date().toISOString(),
      });
      transaction.oncomplete = () => {
        saveDiagnostics.indexedDbMirror = "aktiv";
        db.close();
      };
      transaction.onerror = () => {
        saveDiagnostics.indexedDbMirror = transaction.error?.message || "Schreibfehler";
        db.close();
      };
    };
    request.onerror = () => {
      saveDiagnostics.indexedDbMirror = request.error?.message || "blockiert";
    };
  } catch (error) {
    saveDiagnostics.indexedDbMirror = error?.message || "blockiert";
  }
}

function testIndexedDbStore() {
  if (!indexedDbAvailable()) {
    return { label: "IndexedDB", ok: false, message: "nicht verfuegbar" };
  }

  return {
    label: "IndexedDB",
    ok: true,
    message: saveDiagnostics.indexedDbMirror || "verfuegbar",
  };
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
