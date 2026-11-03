// Boss-Phasen (Punkt 23): Jeder Dungeon-Boss wechselt unter seiner Schwelle sichtbar in Phase 2.
// Daten liegen in data-world.js (bossPhases). Wird vor core.js geladen; enthält nur Funktionen.

function bossPhaseFor(enemy) {
  if (!enemy?.boss || typeof bossPhases === "undefined") return null;
  return bossPhases[enemy.baseId] || null;
}

function bossPhaseActive(combat) {
  return combat?.bossPhase === 2 ? bossPhaseFor(combat.enemy) : null;
}

function bossPhaseName(enemyId) {
  return t(`bossPhase.${enemyId}.name`, bossPhases[enemyId]?.name || "");
}

function bossPhaseText(enemyId) {
  return t(`bossPhase.${enemyId}.text`, bossPhases[enemyId]?.text || "");
}

// Wechsel in Phase 2, sobald der Boss unter die Schwelle fällt (ohne Anzeige, damit testbar).
// Gibt das Phasen-Ereignis zurück oder null, wenn kein Wechsel ansteht.
function applyBossPhaseShift(combat) {
  const phase = bossPhaseFor(combat.enemy);
  if (!phase || combat.bossPhase !== 1 || combat.enemyHp <= 0 || combat.playerHp <= 0) return null;
  if (combat.enemyHp > combat.enemy.hp * (phase.threshold || 0.5)) return null;
  combat.bossPhase = 2;
  const id = combat.enemy.baseId;
  const onEnter = phase.onEnter || {};
  if (onEnter.heal) {
    combat.enemyHp += Math.max(0, Math.min(combat.enemy.hp - combat.enemyHp, Math.floor(combat.enemy.hp * onEnter.heal)));
  }
  if (onEnter.shield) combat.enemyShield = { ...onEnter.shield };
  if (onEnter.curse) combat.playerDamageMultiplier = Math.min(combat.playerDamageMultiplier, onEnter.curse);
  if (onEnter.burn) {
    combat.playerDots.push({ name: t(`bossPhase.${id}.burn`, onEnter.burn.name), damage: Math.max(1, Math.ceil(combat.enemy.level * onEnter.burn.ratio)), turns: onEnter.burn.turns });
  }
  const phaseName = bossPhaseName(id);
  return {
    round: combat.rounds,
    actor: "enemy",
    damage: 0,
    phaseShift: true,
    phaseName,
    text: t("combat.bossPhase", "Phase 2! {enemy}: {phase}. {text}", { enemy: combat.enemyName, phase: phaseName, text: bossPhaseText(id) }),
  };
}

function bossPhaseStrikeDamage(combat) {
  const phase = bossPhaseFor(combat.enemy);
  if (!phase?.onEnter?.strike) return 0;
  const hit = Math.max(1, Math.floor(enemyBaseDamageAfterDefense(combat.enemy, combat.combatStats.defense) * phase.onEnter.strike * (phase.damage || 1) * combat.playerGuard));
  return Math.max(1, Math.floor(hit * (1 - Math.min(0.35, combat.enchantStats?.damageReduction || 0))));
}

// Zeigt den Wechsel und den möglichen Sofortschlag. Gibt true zurück, wenn der Held dabei fällt.
async function checkBossPhase(combat) {
  const event = applyBossPhaseShift(combat);
  if (!event) return false;
  await pushCombatEvent(combat, event);
  const hit = bossPhaseStrikeDamage(combat);
  if (!hit) return false;
  combat.playerHp -= hit;
  await pushCombatEvent(combat, {
    round: combat.rounds,
    actor: "enemy",
    damage: hit,
    text: t("combat.bossPhaseStrike", "{enemy} schlägt beim Phasenwechsel zu: {damage} Schaden.", { enemy: combat.enemyName, damage: hit }),
  });
  return combat.playerHp <= 0;
}
