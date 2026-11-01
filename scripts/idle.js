// Offline-Fortschritt und Auto-Farmen (Punkt 14).
// Wird vor core.js geladen; enthält nur Funktionen (Konstanten und Spielstand liegen in core.js).

// Siegchance aus der Risiko-Einschätzung: Überlebensverhältnis 0.5 -> 10 %, 2.05 -> 97 %.
function offlineWinChance(enemy, stats = totalStats()) {
  const ratio = combatRiskEstimate(enemy, stats).survivalRatio;
  if (ratio <= 0.5) return 0.1;
  if (ratio >= 2.05) return 0.98;
  return 0.1 + ((ratio - 0.5) / (2.05 - 0.5)) * 0.87;
}

// Offline wird gegen den gewählten Gegner gefarmt; Bosse und der Turm nicht, dann der stärkste passende normale Gegner.
function offlineFarmEnemyId() {
  const selected = enemies[ui.selectedEnemy];
  if (selected && !selected.boss && isZoneUnlocked(ui.selectedZone)) return ui.selectedEnemy;
  const candidates = Object.entries(zones)
    .filter(([zoneId, zone]) => zone.type === "zone" && isZoneUnlocked(zoneId))
    .flatMap(([, zone]) => zone.enemies)
    .filter((id) => enemies[id] && !enemies[id].boss && enemies[id].level <= state.level + 1);
  return candidates.sort((a, b) => enemies[b].level - enemies[a].level)[0] || "wolf";
}

// Reine Berechnung (ohne Änderung am Spielstand), damit sie testbar bleibt.
function calculateOfflineProgress(elapsedMs, enemyId = offlineFarmEnemyId()) {
  if (!Number.isFinite(elapsedMs) || elapsedMs < offlineMinMs) return null;
  const countedMs = Math.min(offlineMaxMs, elapsedMs);
  const enemy = enemies[enemyId];
  if (!enemy) return null;
  const fights = Math.floor(countedMs / 1000 / offlineSecondsPerFight);
  const winChance = offlineWinChance(enemy);
  const wins = Math.round(fights * winChance);
  const scale = combatRewardScale(enemy) * offlineEfficiency;
  const xp = Math.floor(wins * enemy.xp * scale);
  const gold = Math.floor(wins * ((enemy.gold[0] + enemy.gold[1]) / 2) * scale * (1 + paragonBonuses().gold));
  const materials = {};
  (materialDrops[enemyId] || []).forEach((drop) => {
    const amount = Math.floor(wins * ((drop.min + drop.max) / 2) * offlineEfficiency * 0.5);
    if (amount > 0) materials[drop.id] = amount;
  });
  return { elapsedMs, countedMs, capped: elapsedMs > offlineMaxMs, enemyId, fights, wins, xp, gold, materials };
}

function applyOfflineProgress(result) {
  if (!result || !result.wins) return;
  state.gold += result.gold;
  Object.entries(result.materials).forEach(([id, amount]) => {
    state.materials[id] = (state.materials[id] || 0) + amount;
  });
  const levelBefore = state.level;
  gainXp(result.xp);
  result.levelsGained = state.level - levelBefore;
  log(() => t("offline.log", "Während du weg warst: {wins} Siege gegen {enemy}, +{xp} XP, +{gold} Gold.", {
    wins: result.wins,
    enemy: enemyDisplayName(enemies[result.enemyId], result.enemyId),
    xp: result.xp,
    gold: result.gold,
  }), "good");
}

async function checkOfflineProgress() {
  if (typeof state === "undefined" || !state) return null;
  const last = state.lastActiveAt;
  const now = Date.now();
  if (!last) {
    state.lastActiveAt = now;
    return null;
  }
  const result = calculateOfflineProgress(now - last);
  if (!result) return null;
  if (typeof loadOptionalDataPack === "function") await loadOptionalDataPack("drops");
  const fresh = calculateOfflineProgress(now - last, result.enemyId);
  applyOfflineProgress(fresh);
  state.lastActiveAt = now;
  if (fresh?.wins) {
    renderOfflineSummary(fresh);
    openModal("offlineModal");
  }
  save({ touch: true });
  render();
  return fresh;
}

function formatDuration(ms) {
  const totalMinutes = Math.floor(ms / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return hours ? t("offline.durationHours", "{hours} Std. {minutes} Min.", { hours, minutes }) : t("offline.durationMinutes", "{minutes} Min.", { minutes });
}

// --- Auto-Farmen ---

function autoFarmStopReason() {
  if (state.pendingLoot.length && !state.settings?.autoLoot) return "loot";
  if (equippedDurabilityAverage() < 10) return "durability";
  if (ui.autoFarmLosses >= 3) return "losses";
  if (!isZoneUnlocked(ui.selectedZone)) return "locked";
  return "";
}

function stopAutoFarm(reason = "") {
  if (!ui.autoFarm) return;
  ui.autoFarm = false;
  if (reason) log(() => t(`autoFarm.stop.${reason}`, "Auto-Farmen gestoppt."), "bad");
  else log(() => t("autoFarm.stoppedLog", "Auto-Farmen beendet."));
  render();
}

function toggleAutoFarm() {
  if (ui.autoFarm) {
    stopAutoFarm();
    return;
  }
  if (isManualCombatMode()) return;
  ui.autoFarm = true;
  ui.autoFarmLosses = 0;
  log(() => t("autoFarm.startedLog", "Auto-Farmen gestartet: Kämpfe laufen automatisch, unter {percent}% Leben wird gerastet.", { percent: normalizeSettings(state.settings).autoFarmRestPercent }), "good");
  render();
  void runAutoFarm();
}

async function runAutoFarm() {
  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  while (ui.autoFarm) {
    if (ui.isFighting) {
      await wait(100);
      continue;
    }
    const reason = autoFarmStopReason();
    if (reason) {
      stopAutoFarm(reason);
      break;
    }
    const threshold = normalizeSettings(state.settings).autoFarmRestPercent / 100;
    if (state.hp < state.maxHp * threshold) rest();
    const winsBefore = state.combatStats?.wins || 0;
    const pending = fight();
    ui.skipCombat = true;
    await pending;
    ui.autoFarmLosses = (state.combatStats?.wins || 0) > winsBefore ? 0 : ui.autoFarmLosses + 1;
    await wait(autoFarmDelayMs);
  }
}

function setAutoFarmRestPercent(value) {
  state.settings = normalizeSettings({ ...state.settings, autoFarmRestPercent: Number(value) });
  save();
  render();
}
