// Risiko-Einschätzung eines Gegners (Einfach/Machbar/Riskant/Tödlich) aus erwartetem Schaden und effektiven Lebenspunkten.
// Wird vor core.js geladen; enthält nur Funktionen (Konstanten und Spielstand liegen in core.js).

function riskFor(enemy, stats = totalStats()) {
  const estimate = combatRiskEstimate(enemy, stats);
  if (estimate.survivalRatio >= 2.05) return "Einfach";
  if (estimate.survivalRatio >= 1.18) return "Machbar";
  if (estimate.survivalRatio >= 0.72) return "Riskant";
  return "Tödlich";
}

function combatRiskEstimate(enemy, stats = totalStats()) {
  const effectSummary = itemEffectSummary();
  const combatStats = combatStatsWithItemEffects(stats, enemy, effectSummary);
  const playerDamagePerRound = expectedPlayerDamagePerRound(enemy, combatStats, effectSummary);
  const enemyDamagePerRound = expectedEnemyDamagePerRound(enemy, combatStats, effectSummary);
  const enemyEffectiveHp = expectedEnemyEffectiveHp(enemy, playerDamagePerRound);
  const playerEffectiveHp = expectedPlayerEffectiveHp(enemy, combatStats, effectSummary);
  const playerRoundsToWin = Math.max(1, enemyEffectiveHp / Math.max(1, playerDamagePerRound));
  const enemyRoundsToWin = Math.max(1, playerEffectiveHp / Math.max(1, enemyDamagePerRound));
  return {
    playerDamagePerRound,
    enemyDamagePerRound,
    playerRoundsToWin,
    enemyRoundsToWin,
    survivalRatio: enemyRoundsToWin / playerRoundsToWin,
  };
}

function expectedPlayerDamagePerRound(enemy, stats, effectSummary = itemEffectSummary()) {
  const enchantStats = equippedEnchantmentSummary();
  const critMultiplier = 1 + (stats.critChance || 0) * ((stats.critDamage || 1.5) - 1);
  const effectArmorIgnore = (enemy.elite || enemy.boss) ? enemy.defense * effectSummary.eliteArmorIgnore : 0;
  let baseHit = Math.max(1, stats.damage - Math.max(0, enemy.defense - effectArmorIgnore) * 1.08) * critMultiplier;
  if (enemy.elite || enemy.boss) baseHit *= 1 + enchantStats.bossDamage;
  if (enemy.elite || enemy.boss) baseHit *= 1 + effectSummary.eliteDamageBonus;
  baseHit *= 1 + Math.min(0.08, (effectSummary.firstStrikeBonus || 0) * 0.4);
  baseHit *= playerAbilityDamageMultiplier(enemy);
  baseHit *= enemyAverageDamageTakenMultiplier(enemy, baseHit);
  baseHit *= enemyPlayerDamageDebuffMultiplier(enemy);
  baseHit += stats.damage * Math.min(0.08, effectSummary.bleedChance * 0.22);
  baseHit += stats.damage * Math.min(0.07, effectSummary.poisonChance * 0.2);
  baseHit += stats.damage * Math.min(0.08, effectSummary.thornsRatio * 0.35);
  if (effectSummary.critBurn) baseHit += stats.damage * (stats.critChance || 0) * 0.14;
  return Math.max(1, baseHit);
}

function playerAbilityDamageMultiplier(enemy) {
  let multiplier = 1;
  if (firstAbilityInGroup("heavy")) multiplier += 0.72 / 3;
  if (firstAbilityInGroup("flurry")) multiplier += 0.5 / 4;
  if (firstAbilityInGroup("execute")) multiplier += 0.15;
  if (firstAbilityInGroup("armorBreak")) {
    const armorValue = enemy.defense > 0 ? Math.min(0.25, enemy.defense / Math.max(12, enemy.defense + state.level * 3)) : 0;
    multiplier += (0.3 + armorValue) / 3;
  }
  if (firstAbilityInGroup("counter")) multiplier += 0.09;
  return multiplier;
}

function enemyAverageDamageTakenMultiplier(enemy, hit) {
  let total = 0;
  const sampleRounds = 12;
  for (let round = 1; round <= sampleRounds; round += 1) {
    total += enemyDamageTakenMultiplier(enemy, enemy.hp * 0.6, round, hit).multiplier;
  }
  return total / sampleRounds;
}

function enemyPlayerDamageDebuffMultiplier(enemy) {
  const ids = enemyAbilityIds(enemy);
  let multiplier = 1;
  if (ids.includes("ironBite")) multiplier *= 0.97;
  if (ids.includes("shieldBash")) multiplier *= 0.94;
  if (ids.includes("guardBash")) multiplier *= 0.97;
  if (ids.includes("chainHook")) multiplier *= 0.955;
  if (ids.includes("boneCurse")) multiplier *= 0.92;
  if (ids.includes("emberChains")) multiplier *= 0.955;
  if (ids.includes("hollowGaze")) multiplier *= 0.925;
  if (ids.includes("cellLockdown")) multiplier *= 0.93;
  if (ids.includes("wardenVerdict")) multiplier *= 0.94;
  if (ids.includes("hollowRift")) multiplier *= 0.93;
  return multiplier;
}

function expectedEnemyEffectiveHp(enemy, playerDamagePerRound) {
  let effectiveHp = enemy.hp;
  enemyAbilityIds(enemy).forEach((id) => {
    const ability = enemyAbilityCatalog[id];
    if (!ability) return;
    if (id === "lifeDrain") effectiveHp += Math.max(2, playerDamagePerRound * 0.45);
    if (id === "graveMend") effectiveHp += enemy.hp * 0.08;
    if (id === "emberPrayer") effectiveHp += enemy.hp * 0.07;
    if (id === "graveTithe") effectiveHp += enemy.hp * 0.1;
    if (id === "emberHymn") effectiveHp += enemy.hp * 0.1;
  });
  if (enemyPassiveIds(enemy).includes("unholyRenewal")) effectiveHp *= 1.08;
  if (enemyPassiveIds(enemy).includes("graveBargain")) effectiveHp *= 1.06;
  if (enemyPassiveIds(enemy).includes("emberChoir")) effectiveHp *= 1.07;
  if (enemyPassiveIds(enemy).includes("hollowSecondWind")) effectiveHp *= 1.12;
  const phase = riskBossPhase(enemy);
  if (phase) {
    const onEnter = phase.onEnter || {};
    const half = enemy.hp * (phase.threshold || 0.5);
    if (onEnter.heal) effectiveHp += enemy.hp * onEnter.heal;
    if (onEnter.shield) effectiveHp += playerDamagePerRound * (1 - onEnter.shield.multiplier) * onEnter.shield.turns;
    if (onEnter.curse) effectiveHp += playerDamagePerRound * (1 - onEnter.curse);
    if (phase.damageTaken > 1) effectiveHp -= half * (1 - 1 / phase.damageTaken);
  }
  return effectiveHp;
}

// Boss-Phase (Punkt 23) auch für Gegner aus der Datentabelle ohne baseId finden.
function riskBossPhase(enemy) {
  if (!enemy?.boss || typeof bossPhases === "undefined") return null;
  const id = enemy.baseId || Object.keys(enemies).find((key) => enemies[key] === enemy);
  return bossPhases[id] || null;
}

function expectedEnemyDamagePerRound(enemy, stats, effectSummary = itemEffectSummary()) {
  const enchantStats = equippedEnchantmentSummary();
  const averageHit = (enemy.damage[0] + enemy.damage[1]) / 2;
  const critStats = enemyCriticalStats(enemy);
  const enemyCritChance = Math.max(0, critStats.critChance - Math.min(0.08, effectSummary.enemyCritReduction || 0));
  const critMultiplier = 1 + enemyCritChance * (critStats.critDamage - 1);
  let hit = Math.max(enemyMinimumPressure(enemy), averageHit - enemyDefenseMitigation(stats.defense)) * critMultiplier;
  hit *= enemyAbilityDamageMultiplier(enemy);
  hit *= enemyDamagePassiveMultiplier(enemy, enemy.hp * 0.45);
  hit += enemyDotDamagePerRound(enemy);
  const phase = riskBossPhase(enemy);
  if (phase) {
    hit *= 1 + ((phase.damage || 1) - 1) * 0.5 + (phase.onEnter?.strike || 0) * 0.08;
    if (phase.onEnter?.burn) hit += (enemy.level * phase.onEnter.burn.ratio * phase.onEnter.burn.turns) / 8;
  }
  hit *= playerDefensiveAbilityMultiplier(stats);
  hit *= 1 - Math.min(0.35, enchantStats.damageReduction);
  hit *= 1 - Math.min(0.08, effectSummary.firstHitReduction / 8);
  hit *= effectSummary.firstHitWeaken < 1 ? 0.985 : 1;
  hit *= 1 - Math.min(0.04, effectSummary.critHealRatio * 0.3);
  return Math.max(1, hit);
}

function enemyAbilityDamageMultiplier(enemy) {
  let bonus = 0;
  enemyAbilityIds(enemy).forEach((id) => {
    const multiplier = enemyAbilityAverageMultiplier(id);
    if (multiplier !== 1) bonus += multiplier - 1;
  });
  return Math.max(0.75, 1 + bonus);
}

function enemyAbilityAverageMultiplier(id) {
  const multipliers = {
    ambush: 1.045,
    bloodBite: 1 + 0.18 / 3,
    ironBite: 1 + 0.22 / 3,
    tuskCharge: 1 + 0.55 / 4,
    shieldBash: 1 + 0.1 / 3,
    guardBash: 1 + 0.25 / 3,
    chainHook: 1 + 0.2 / 4,
    lifeDrain: 1 + 0.05 / 4,
    burningBlade: 1 + 0.25 / 3,
    flameBite: 1 + 0.4 / 4,
    judgementStrike: 1 + 0.45 / 5,
    boneCurse: 1 - 0.05 / 3,
    graveMend: 1 - 0.25 / 4,
    crushingBlow: 1 + 0.65 / 4,
    forgeSmash: 1 + 0.45 / 3,
    emberChains: 1 + 0.15 / 4,
    dukeCommand: 1 + 0.35 / 3,
    executionOrder: 1 + 0.7 / 5,
    emberPrayer: 1 - 0.2 / 4,
    ashNova: 1 + 0.45 / 5,
    crownMaul: 1 + 0.55 / 4,
    ashBlade: 1 + 0.35 / 3,
    hollowGaze: 1 - 0.1 / 4,
    championLeap: 1 + 0.75 / 5,
    eliteFury: 1 + 0.25 / 4,
    cellLockdown: 1 + 0.1 / 5,
    graveTithe: 1 - 0.05 / 5,
    bruteRampage: 1 + 0.5 / 6,
    wardenVerdict: 1 + 0.35 / 5,
    anvilQuake: 1 + 0.55 / 5,
    dukeDuel: 1 + 0.45 / 5,
    emberHymn: 1 - 0.1 / 5,
    royalGore: 1 + 0.45 / 5,
    hollowRift: 1 + 0.4 / 5,
  };
  return multipliers[id] || 1;
}

function enemyDotDamagePerRound(enemy) {
  const ids = enemyAbilityIds(enemy);
  let dot = 0;
  if (ids.includes("bloodBite")) dot += Math.max(1, Math.ceil(enemy.level * 0.65)) * 0.45;
  if (ids.includes("poisonClaws")) dot += Math.max(1, Math.ceil(enemy.level * 0.7)) * 0.75;
  if (ids.includes("burningBlade")) dot += Math.max(1, Math.ceil(enemy.level * 0.75)) * 0.5;
  if (ids.includes("flameBite")) dot += Math.max(1, Math.ceil(enemy.level * 0.85)) * 0.35;
  if (ids.includes("emberChains")) dot += Math.max(1, Math.ceil(enemy.level * 0.85)) * 0.45;
  if (ids.includes("ashNova")) dot += Math.max(1, Math.ceil(enemy.level * 0.9)) * 0.35;
  if (ids.includes("ashBlade")) dot += Math.max(1, Math.ceil(enemy.level * 0.95)) * 0.5;
  if (ids.includes("graveTithe")) dot += Math.max(1, Math.ceil(enemy.level * 0.65)) * 0.35;
  if (ids.includes("anvilQuake")) dot += Math.max(1, Math.ceil(enemy.level * 0.8)) * 0.35;
  if (ids.includes("emberHymn")) dot += Math.max(1, Math.ceil(enemy.level * 0.85)) * 0.35;
  return dot;
}

function playerDefensiveAbilityMultiplier(stats) {
  let multiplier = 1;
  if (firstAbilityInGroup("guard")) multiplier *= 0.9;
  if (firstAbilityInGroup("weaken")) multiplier *= 0.94;
  if (firstAbilityInGroup("lastStand")) multiplier *= 0.93;
  if (firstAbilityInGroup("battleRush")) multiplier *= 0.97;
  return multiplier;
}

function expectedPlayerEffectiveHp(enemy, stats, effectSummary = itemEffectSummary()) {
  const enchantStats = equippedEnchantmentSummary();
  let hp = Math.max(1, state.hp || stats.maxHp);
  if (firstAbilityInGroup("battleRush")) hp += stats.maxHp * 0.17;
  if (firstAbilityInGroup("lastStand")) hp += stats.maxHp * 0.14;
  if (firstAbilityInGroup("guard")) hp += stats.maxHp * 0.08;
  if (effectSummary.firstHitReduction > 0) hp += stats.maxHp * 0.04;
  if (effectSummary.postCombatHeal > 0) hp += stats.maxHp * Math.min(0.12, effectSummary.postCombatHeal);
  if (enchantStats.lowHpShield > 0) hp += stats.maxHp * Math.min(0.18, enchantStats.lowHpShield);
  if (enemyAbilityIds(enemy).some((id) => ["judgementStrike", "executionOrder"].includes(id))) hp *= 0.94;
  return hp;
}
