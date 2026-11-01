// Kampf: Klassen, Builds, Fähigkeiten, Kampfablauf (Auto/Manuell), Gegnerfähigkeiten, Kampf-Events, Kampf-Log, Belohnung/Niederlage.
// Wird vor core.js geladen; enthält nur Funktionen (Konstanten und Spielstand liegen in core.js).

// Erkennt Heilungen in Kampftexten (Deutsch und Englisch).
const healTextPattern = /\bheilt\b|\bheilen\b|\bheilung\b|\bheals?\b|\bhealed\b|\bhealing\b/i;
function activeClass() {
  return classCatalog[state.characterClass] || classCatalog.warrior;
}

function activeBuild() {
  return buildCatalog[state.build] || buildCatalog.damage;
}

function buildName(buildId, classId = state.characterClass) {
  const build = buildCatalog[buildId] || buildCatalog.damage;
  const active = classCatalog[classId] || classCatalog.warrior;
  const fallback = active.buildNames?.[buildId] || build.name;
  return t(`classBuild.${classId}.${buildId}.name`, fallback);
}

function buildDescription(buildId) {
  const build = buildCatalog[buildId] || buildCatalog.damage;
  const fallback = activeClass().buildDescriptions?.[buildId] || build.description;
  return t(`classBuild.${state.characterClass}.${buildId}.text`, fallback);
}

function knownClassAbilities() {
  return activeBuildAbilityIds().map((id) => [id, abilityCatalog[id]]).filter(([, ability]) => ability);
}

function activeBuildAbilityIds() {
  const build = activeBuild();
  const active = activeClass();
  return active.buildAbilities?.[state.build] || build.abilities || active.abilities || [];
}

function hasBuildAbility(id) {
  return activeBuildAbilityIds().includes(id);
}

function firstKnownAbility(ids) {
  return ids.find((id) => hasBuildAbility(id)) || "";
}

function firstAbilityInGroup(group) {
  return firstKnownAbility(classAbilityGroups[group] || []);
}

function abilityCombatName(abilityId) {
  const ability = abilityCatalog[abilityId];
  return entityName("ability", abilityId, ability?.name || abilityId);
}

function classResource() {
  const fallback = classResourceConfig.warrior;
  const config = classResourceConfig[state.characterClass] || fallback;
  return {
    ...config,
    label: t(`classResource.${state.characterClass}`, config.label),
  };
}

function combatAbilitySlots() {
  return activeBuildAbilityIds().slice(0, 3).map((abilityId, index) => ({
    id: `ability${index + 1}`,
    type: "ability",
    abilityId,
    index,
    unlockLevel: combatAbilityUnlockLevels[index] || 10,
    cost: abilityCatalog[abilityId]?.cost || combatAbilityCosts[index] || 4,
    cooldown: combatAbilityCooldowns[index] || 2,
  }));
}

function combatActionList(combat = activeCombatState) {
  const resource = classResource();
  const cooldowns = combat?.cooldowns || {};
  const currentResource = combat?.resource ?? 0;
  const playerTurn = Boolean(combat?.awaitingPlayerAction);
  const abilityActions = combatAbilitySlots().map((slot) => {
    const ability = abilityCatalog[slot.abilityId];
    const unlocked = state.level >= slot.unlockLevel;
    const cooldown = cooldowns[slot.abilityId] || 0;
    const disabledReason = !unlocked
      ? t("combat.unlocksAt", "Level {level}", { level: slot.unlockLevel })
      : cooldown > 0
        ? t("combat.cooldownShort", "{turns}R", { turns: cooldown })
        : currentResource < slot.cost
          ? t("combat.needResource", "{amount} {resource}", { amount: slot.cost, resource: resource.label })
          : "";
    return {
      ...slot,
      label: ability ? entityName("ability", slot.abilityId, ability.name) : t("combat.ability", "Fähigkeit"),
      detail: unlocked
        ? t("combat.actionCost", "{cost} {resource}", { cost: slot.cost, resource: resource.label })
        : t("combat.unlocksAt", "Level {level}", { level: slot.unlockLevel }),
      disabled: !playerTurn || Boolean(disabledReason),
      disabledReason,
    };
  });
  return [
    {
      id: "attack",
      type: "attack",
      label: t("combat.actionAttack", "Angriff"),
      detail: t("combat.actionAttackHint", "+{amount} {resource}", { amount: resource.attackGain || 1, resource: resource.label }),
      disabled: !playerTurn,
      disabledReason: "",
    },
    {
      id: "defend",
      type: "defend",
      label: t("combat.actionDefend", "Verteidigen"),
      detail: t("combat.actionDefendHint", "-50% Treffer, +{amount} {resource}", { amount: resource.defendGain || 2, resource: resource.label }),
      disabled: !playerTurn,
      disabledReason: "",
    },
    ...abilityActions,
  ];
}

function requestCombatAction(actionId) {
  if (!pendingCombatAction) return false;
  const action = combatActionList(activeCombatState).find((entry) => entry.id === actionId && !entry.disabled);
  if (!action) return false;
  const resolve = pendingCombatAction;
  pendingCombatAction = null;
  if (activeCombatState) activeCombatState.awaitingPlayerAction = false;
  renderCombatPanel();
  resolve(action);
  return true;
}

function waitForCombatAction() {
  return new Promise((resolve) => {
    pendingCombatAction = resolve;
    if (activeCombatState) activeCombatState.awaitingPlayerAction = true;
    renderCombatPanel();
  });
}

function setCharacterClass(classId) {
  if (!classCatalog[classId] || state.characterClass === classId) return;
  const hpRatio = state.maxHp > 0 ? state.hp / state.maxHp : 1;
  state.characterClass = classId;
  syncDerivedStats();
  state.hp = Math.max(1, Math.min(state.maxHp, Math.floor(state.maxHp * hpRatio)));
  log(() => t("class.changed", "Klasse gewechselt: {class}.", { class: entityName("class", classId, classCatalog[classId].name) }), "drop");
  save();
  render();
}

function setBuild(buildId) {
  if (!buildCatalog[buildId]) return;
  const hpRatio = state.maxHp > 0 ? state.hp / state.maxHp : 1;
  state.build = buildId;
  syncDerivedStats();
  state.hp = Math.max(1, Math.min(state.maxHp, Math.round(state.maxHp * hpRatio)));
  log(() => t("build.changed", "Build gewechselt: {build}.", { build: buildName(buildId) }), "drop");
  save();
  render();
}

function resetCombatLog() {
  state.combatLog = [];
  renderCombatLog();
}

function setCombatLog(enemy, events, playerWon, rounds) {
  const result = playerWon ? t("combat.victory", "Sieg") : t("combat.defeat", "Niederlage");
  const resultKey = playerWon ? "combat.victoryAgainst" : "combat.defeatAgainst";
  const summary = combatSummary(events);
  const enemyName = enemyDisplayName(enemy, enemy.baseId || selectedEnemy);
  const entries = [
    {
      type: playerWon ? "good" : "bad",
      text: [t(resultKey, `${result} gegen ${enemyName} nach ${rounds} Runden.`, { enemy: enemyName, rounds }), summary].filter(Boolean).join(" "),
    },
    ...events.map(combatLogEntry),
  ];
  state.combatLog = entries.slice(0, 80);
  renderCombatLog();
}

function isHealEvent(event) {
  return event?.heal === true || healTextPattern.test(event?.text || "");
}

function combatSummary(events) {
  const criticals = events.filter((event) => event.critical).length;
  const heals = events.filter(isHealEvent).length;
  const effects = events.filter((event) => event.damage === 0 && !event.critical && !isHealEvent(event)).length;
  const part = (count, oneKey, oneFallback, manyKey, manyFallback) => (count
    ? (count === 1 ? t(oneKey, oneFallback, { count }) : t(manyKey, manyFallback, { count }))
    : "");
  return [
    part(criticals, "combat.summaryCrit", "{count} Crit", "combat.summaryCrits", "{count} Crits"),
    part(heals, "combat.summaryHeal", "{count} Heilung", "combat.summaryHeals", "{count} Heilungen"),
    part(effects, "combat.summaryEffect", "{count} Effekt", "combat.summaryEffects", "{count} Effekte"),
  ].filter(Boolean).join(" · ");
}

function combatLogEntry(event) {
  const actor = event.actor === "hero" ? t("combat.you", "Du") : t("combat.enemy", "Gegner");
  let type = event.actor === "hero" ? "hero" : "enemy";
  if (event.critical) type = "critical";
  if (event.damage === 0) type = "effect";
  if (isHealEvent(event)) type = "heal";
  const roundText = event.round ? `R${event.round}` : t("combat.beforeFight", "Vor Kampf");
  return {
    type,
    text: `${roundText} · ${actor}: ${event.text || t("combat.attack", "Aktion ausgeführt.")}`,
  };
}

function abilityDamage(baseHit, multiplier) {
  return Math.max(1, Math.floor(baseHit * multiplier));
}

function rollPlayerCritical(hit, stats) {
  if (hit <= 0 || Math.random() >= (stats.critChance || 0)) {
    return { damage: hit, critical: false };
  }
  return {
    damage: Math.max(1, Math.floor(hit * (stats.critDamage || 1.5))),
    critical: true,
  };
}

function enemyCriticalStats(enemy) {
  if (enemy.critChance || enemy.critDamage) {
    return {
      critChance: enemy.critChance ?? 0.03,
      critDamage: enemy.critDamage ?? 1.5,
    };
  }
  if (enemy.boss) return { critChance: 0.09, critDamage: 1.7 };
  if (enemy.elite || enemy.eliteVariant) return { critChance: 0.06, critDamage: 1.6 };
  return { critChance: 0.03, critDamage: 1.5 };
}

function enemyDefenseMitigation(defense) {
  return Math.floor(defense * 0.42);
}

function enemyMinimumPressure(enemy) {
  const averageHit = (enemy.damage[0] + enemy.damage[1]) / 2;
  const pressure = enemy.boss ? 0.22 : enemy.elite ? 0.14 : 0.07;
  return Math.max(1, Math.floor(averageHit * pressure));
}

function enemyBaseDamageAfterDefense(enemy, defense) {
  const rolled = random(enemy.damage[0], enemy.damage[1]);
  return Math.max(enemyMinimumPressure(enemy), rolled - enemyDefenseMitigation(defense));
}

function rollEnemyCritical(hit, enemy, effectSummary = itemEffectSummary()) {
  const stats = enemyCriticalStats(enemy);
  const critChance = Math.max(0, stats.critChance - Math.min(0.08, effectSummary.enemyCritReduction || 0));
  if (hit <= 0 || Math.random() >= critChance) {
    return { damage: hit, critical: false };
  }
  return {
    damage: Math.max(1, Math.floor(hit * stats.critDamage)),
    critical: true,
  };
}

function criticalText(text, damage) {
  const forWord = t("combat.forWord", "für").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(`(^|\\s)${forWord} \\d+`);
  return pattern.test(text)
    ? text.replace(pattern, (match, space) => `${space}${t("combat.critFor", "kritisch für {damage}", { damage })}`)
    : `${text} ${t("combat.critAppend", "Kritischer Treffer für {damage}.", { damage })}`;
}

function enemyAbilityIds(enemy) {
  return [...new Set(enemy?.abilities || [])].filter((id) => enemyAbilityCatalog[id]);
}

function enemyPassiveIds(enemy) {
  return [...new Set(enemy?.passives || [])].filter((id) => enemyAbilityCatalog[id]);
}

function enemyAbilityEntries(enemy) {
  return [...enemyAbilityIds(enemy), ...enemyPassiveIds(enemy)]
    .map((id) => [id, enemyAbilityCatalog[id]])
    .filter(([, ability]) => ability);
}

function rollCombatEvent(enemy, roll = Math.random()) {
  if (!enemy || roll > combatEventChance) return null;
  const weight = enemy.boss || enemy.elite ? 2 : 1;
  const pool = combatEventPool(enemy).flatMap((event) => Array.from({ length: event.id === "grimOmen" ? weight : 1 }, () => event));
  return pool[random(0, pool.length - 1)];
}

function preparedCombatEventKey(enemyId = selectedEnemy) {
  const elite = state.nextEncounters?.[enemyId]?.elite ? 1 : 0;
  return `${selectedZone}:${enemyId}:${elite}`;
}

function prepareCombatEvent(enemy, enemyId = selectedEnemy) {
  const key = preparedCombatEventKey(enemyId);
  if (!preparedCombatEvents.has(key)) {
    preparedCombatEvents.set(key, rollCombatEvent(enemy));
  }
  return preparedCombatEvents.get(key);
}

function consumePreparedCombatEvent(enemy, enemyId = selectedEnemy) {
  const key = preparedCombatEventKey(enemyId);
  if (!preparedCombatEvents.has(key)) return rollCombatEvent(enemy);
  const combatEvent = preparedCombatEvents.get(key);
  preparedCombatEvents.delete(key);
  return combatEvent;
}

function combatEventPool(enemy) {
  return combatEventCatalog.filter((event) => combatEventMatchesEnemy(event, enemy));
}

function combatEventMatchesEnemy(event, enemy) {
  const conditions = event.conditions || {};
  if (conditions.dungeon && !enemy.tags?.dungeon) return false;
  if (conditions.beast && !(enemy.tags?.beast || enemy.tags?.wolf)) return false;
  if (conditions.ash && !enemy.tags?.ash) return false;
  if (conditions.elite && !(enemy.elite || enemy.boss || enemy.tags?.elite)) return false;
  return true;
}

function combatEventTone(event) {
  if (!event) return "neutral";
  if (event.goldBonus) return "reward";
  const playerDamageBonus = event.playerDamageBonus || 0;
  const enemyDamageBonus = event.enemyDamageBonus || 0;
  if (playerDamageBonus > 0 && enemyDamageBonus <= 0) return "advantage";
  if (enemyDamageBonus > 0 && playerDamageBonus <= 0) return "danger";
  if (playerDamageBonus < 0 && enemyDamageBonus < 0) return "control";
  if (playerDamageBonus !== 0 || enemyDamageBonus !== 0) return "clash";
  return "neutral";
}

function combatEventLogText(event) {
  if (!event) return "";
  return t("combat.eventLog", "Kampfereignis - {event}: {text}", {
    event: combatEventName(event),
    text: combatEventText(event),
  });
}

function combatEventAnimationEntry(combatEvent, enemy, playerHp) {
  if (!combatEvent) return null;
  return {
    round: 0,
    actor: "hero",
    damage: 0,
    enemyHp: enemy.hp,
    playerHp,
    text: combatEventLogText(combatEvent),
    combatEventId: combatEvent.id,
    combatEventName: combatEventName(combatEvent),
    combatEventText: combatEventText(combatEvent),
    combatEventTone: combatEventTone(combatEvent),
  };
}

function eliteBonusAbilityFor(enemy) {
  if (enemy.tags?.beast || enemy.tags?.wolf) return "eliteFury";
  return "eliteGuard";
}

function enemyHealMultiplier(enemy, enemyHp) {
  const passives = enemyPassiveIds(enemy);
  let multiplier = 1;
  if (passives.includes("unholyRenewal") && enemyHp <= enemy.hp * 0.5) multiplier *= 1.45;
  if (passives.includes("graveBargain") && enemyHp <= enemy.hp * 0.5) multiplier *= 1.25;
  if (passives.includes("emberChoir")) multiplier *= 1.18;
  return multiplier;
}

function enemyDamagePassiveMultiplier(enemy, enemyHp) {
  const passives = enemyPassiveIds(enemy);
  let multiplier = 1;
  if (passives.includes("forgeFire") && enemyHp <= enemy.hp * 0.5) multiplier *= 1.15;
  if (passives.includes("oathHeat") && enemyHp <= enemy.hp * 0.5) multiplier *= 1.18;
  if (passives.includes("noblePride") && enemyHp <= enemy.hp * 0.4) multiplier *= 1.25;
  if (passives.includes("dukePride") && enemyHp <= enemy.hp * 0.45) multiplier *= 1.18;
  if (passives.includes("crownFrenzy") && enemyHp <= enemy.hp * 0.55) multiplier *= 1.16;
  if (passives.includes("secondPhase") && enemyHp <= enemy.hp * 0.5) multiplier *= 1.18;
  if (passives.includes("hollowSecondWind") && enemyHp <= enemy.hp * 0.5) multiplier *= 1.2;
  return multiplier;
}

function enemyDamageTakenMultiplier(enemy, enemyHp, rounds, hit) {
  const passives = enemyPassiveIds(enemy);
  let multiplier = 1;
  const defensive = [];

  enemyAbilityIds(enemy).forEach((id) => {
    if (id === "mistForm" && rounds % 4 === 0) {
      multiplier *= 0.55;
      defensive.push("Nebelform");
    }
    if (id === "emberDodge" && rounds % 3 === 0) {
      multiplier *= 0.7;
      defensive.push("Glutausweichen");
    }
    if (id === "crownShield" && rounds % 4 === 0) {
      multiplier *= 0.55;
      defensive.push("Kronenschild");
    }
    if (id === "guardStance" && rounds % 4 === 0) {
      multiplier *= 0.65;
      defensive.push("Schildhaltung");
    }
    if (id === "boneArmor" && rounds % 4 === 0) {
      multiplier *= 0.65;
      defensive.push("Knochenpanzer");
    }
    if (id === "hardenArmor" && rounds % 4 === 0) {
      multiplier *= 0.6;
      defensive.push("Rüstung härten");
    }
    if (id === "ironWall" && rounds % 4 === 0) {
      multiplier *= 0.55;
      defensive.push("Eisenwand");
    }
    if (id === "eliteGuard" && rounds % 4 === 0) {
      multiplier *= 0.75;
      defensive.push("Elite-Deckung");
    }
  });

  if (passives.includes("prisonDiscipline") && rounds % 5 === 0) {
    multiplier *= 0.75;
    defensive.push("Kerkerdisziplin");
  }
  if (passives.includes("cellAuthority") && (rounds <= 2 || rounds % 5 === 0)) {
    multiplier *= 0.86;
    defensive.push("Kerkerautorität");
  }
  if (passives.includes("graveBargain") && enemyHp <= enemy.hp * 0.5) {
    multiplier *= 0.92;
    defensive.push("Grabpakt");
  }
  if (passives.includes("lastGuard") && enemyHp <= enemy.hp * 0.3) {
    multiplier *= 0.8;
    defensive.push("Standhaft");
  }
  if (passives.includes("heavyBody") && hit <= enemy.level * 2) {
    multiplier *= 0.8;
    defensive.push("Schwerer Körper");
  }
  if (passives.includes("bruteBulk") && hit <= enemy.level * 2.6) {
    multiplier *= 0.78;
    defensive.push("Massiger Leib");
  }
  if (passives.includes("wardenPressure") && rounds % 4 === 0) {
    multiplier *= 0.8;
    defensive.push("Kettendruck");
  }
  if (passives.includes("oathHeat") && enemyHp <= enemy.hp * 0.5) {
    multiplier *= 0.9;
    defensive.push("Eidglut");
  }
  if (passives.includes("dukePride") && enemyHp <= enemy.hp * 0.45) {
    multiplier *= 0.9;
    defensive.push("Herzogsstolz");
  }
  if (passives.includes("royalHide")) {
    multiplier *= 0.9;
  }
  if (passives.includes("secondPhase") && enemyHp <= enemy.hp * 0.5) {
    multiplier *= 0.82;
    defensive.push("Zweite Phase");
  }

  if (passives.includes("hollowSecondWind") && enemyHp <= enemy.hp * 0.5) {
    multiplier *= 0.8;
    defensive.push("Leere zweite Phase");
  }

  return { multiplier: Math.max(0.25, multiplier), defensive };
}

function triggeredEnemyAbility(enemy, rounds, playerHp, playerMaxHp, enemyHp) {
  return enemyAbilityIds(enemy).map((id) => {
    if (id === "ambush" && rounds === 1) return { id, damageMultiplier: 1.55 };
    if (id === "bloodBite" && rounds % 3 === 0) return { id, damageMultiplier: 1.18, dot: { name: "Blutung", damage: Math.max(1, Math.ceil(enemy.level * 0.65)), turns: 2 } };
    if (id === "ironBite" && rounds % 3 === 0) return { id, damageMultiplier: 1.22, playerDamageMultiplier: 0.9 };
    if (id === "tuskCharge" && rounds % 4 === 0) return { id, damageMultiplier: 1.55 };
    if (id === "shieldBash" && rounds % 3 === 0) return { id, damageMultiplier: 1.1, playerDamageMultiplier: 0.8 };
    if (id === "guardBash" && rounds % 3 === 0) return { id, damageMultiplier: 1.25, playerDamageMultiplier: 0.88 };
    if (id === "chainHook" && rounds % 4 === 0) return { id, damageMultiplier: 1.2, playerDamageMultiplier: 0.82 };
    if (id === "poisonClaws" && rounds % 3 === 0) return { id, damageMultiplier: 1, dot: { name: "Gift", damage: Math.max(1, Math.ceil(enemy.level * 0.7)), turns: 3 } };
    if (id === "lifeDrain" && rounds % 4 === 0) return { id, damageMultiplier: 1.05, healRatio: 0.45 };
    if (id === "burningBlade" && rounds % 3 === 0) return { id, damageMultiplier: 1.25, dot: { name: "Brennen", damage: Math.max(1, Math.ceil(enemy.level * 0.75)), turns: 2 } };
    if (id === "flameBite" && rounds % 4 === 0) return { id, damageMultiplier: 1.4, dot: { name: "Brennen", damage: Math.max(1, Math.ceil(enemy.level * 0.85)), turns: 2 } };
    if (id === "judgementStrike" && playerHp <= playerMaxHp * 0.45 && rounds % 2 === 0) return { id, damageMultiplier: 1.45 };
    if (id === "boneCurse" && rounds % 3 === 0) return { id, damageMultiplier: 0.95, playerDamageMultiplier: 0.75 };
    if (id === "graveMend" && rounds % 4 === 0) return { id, damageMultiplier: 0.75, healFlatRatio: 0.08 };
    if (id === "crushingBlow" && rounds % 4 === 0) return { id, damageMultiplier: 1.65 };
    if (id === "forgeSmash" && rounds % 3 === 0) return { id, damageMultiplier: 1.45 };
    if (id === "emberChains" && rounds % 4 === 0) return { id, damageMultiplier: 1.15, playerDamageMultiplier: 0.82, dot: { name: "Brennen", damage: Math.max(1, Math.ceil(enemy.level * 0.85)), turns: 2 } };
    if (id === "dukeCommand" && rounds % 3 === 0) return { id, damageMultiplier: 1.35 };
    if (id === "executionOrder" && playerHp <= playerMaxHp * 0.42 && rounds % 2 === 0) return { id, damageMultiplier: 1.7 };
    if (id === "emberPrayer" && rounds % 4 === 0) return { id, damageMultiplier: 0.8, healFlatRatio: 0.07 };
    if (id === "ashNova" && rounds % 5 === 0) return { id, damageMultiplier: 1.45, dot: { name: "Aschebrand", damage: Math.max(1, Math.ceil(enemy.level * 0.9)), turns: 2 } };
    if (id === "crownMaul" && rounds % 4 === 0) return { id, damageMultiplier: 1.55 };
    if (id === "ashBlade" && rounds % 3 === 0) return { id, damageMultiplier: 1.35, dot: { name: "Brennen", damage: Math.max(1, Math.ceil(enemy.level * 0.95)), turns: 2 } };
    if (id === "hollowGaze" && rounds % 4 === 0) return { id, damageMultiplier: 0.9, playerDamageMultiplier: 0.7 };
    if (id === "championLeap" && rounds % 5 === 0) return { id, damageMultiplier: 1.75 };
    if (id === "eliteFury" && rounds % 4 === 0) return { id, damageMultiplier: 1.25 };
    if (id === "cellLockdown" && rounds % 5 === 0) return { id, damageMultiplier: 1.1, playerDamageMultiplier: 0.65 };
    if (id === "graveTithe" && rounds % 5 === 0) return { id, damageMultiplier: 0.95, healFlatRatio: 0.1, dot: { name: "Grabfrost", damage: Math.max(1, Math.ceil(enemy.level * 0.65)), turns: 2 } };
    if (id === "bruteRampage" && enemyHp <= enemy.hp * 0.55 && rounds % 3 === 0) return { id, damageMultiplier: 1.5 };
    if (id === "wardenVerdict" && rounds % 5 === 0) return { id, damageMultiplier: 1.35, playerDamageMultiplier: 0.7 };
    if (id === "anvilQuake" && rounds % 5 === 0) return { id, damageMultiplier: 1.55, dot: { name: "Brennen", damage: Math.max(1, Math.ceil(enemy.level * 0.8)), turns: 2 } };
    if (id === "dukeDuel" && rounds % 5 === 0) return { id, damageMultiplier: 1.45 };
    if (id === "emberHymn" && rounds % 5 === 0) return { id, damageMultiplier: 0.9, healFlatRatio: 0.1, dot: { name: "Aschebrand", damage: Math.max(1, Math.ceil(enemy.level * 0.85)), turns: 2 } };
    if (id === "royalGore" && enemyHp <= enemy.hp * 0.6 && rounds % 3 === 0) return { id, damageMultiplier: 1.45 };
    if (id === "hollowRift" && rounds % 5 === 0) return { id, damageMultiplier: 1.4, playerDamageMultiplier: 0.65 };
    return null;
  }).find(Boolean);
}

function combatRewardScale(enemy) {
  const levelGap = Math.max(0, state.level - Math.floor(enemy?.level || 0));
  if (levelGap < 4) return 1;
  if (enemy?.boss) return levelGap >= 8 ? 0.6 : 0.8;
  if (levelGap >= 8) return 0.35;
  if (levelGap >= 6) return 0.5;
  return 0.75;
}

function scaledCombatReward(amount, enemy) {
  return Math.max(1, Math.floor(amount * combatRewardScale(enemy)));
}

function combatMode() {
  return state?.ui?.combatMode === "manual" ? "manual" : "auto";
}

function isManualCombatMode() {
  return combatMode() === "manual";
}

function setCombatMode(mode) {
  if (isFighting) return;
  const nextMode = mode === "manual" ? "manual" : "auto";
  state.ui = { ...(state.ui || {}), combatMode: nextMode };
  save();
  renderCombatPanel();
}

function clearManualCombatStep() {
  manualCombatStep = null;
}

async function fight() {
  if (isFighting) return;
  const enemy = getPreparedEncounter(selectedEnemy);
  const enemyName = enemyDisplayName(enemy, enemy.baseId || selectedEnemy);
  syncDerivedStats();

  if (state.hp <= 0) {
    log(() => t("combat.cannotFight", "Du bist kampfunfähig. Raste zuerst im Lager."), "bad");
    return;
  }

  if (state.pendingLoot.length) {
    log(() => t("combat.pickLootFirst", "Wähle zuerst deine Beute aus dem letzten Kampf."), "drop");
    return;
  }

  resetCombatLog();
  isFighting = true;
  skipCombat = false;
  setBattleEnemyVisual(enemy);
  setControlsDisabled(true);
  if (!isManualCombatMode()) armCombatWatchdog(30000);

  const combat = createActionCombat(enemy);
  activeCombatState = combat;
  renderCombatPanel();
  hideBattleResult();
  renderBattleEventBadge(combat.preparedEventEntry);
  updateBattleHealth(combat.playerHp, combat.combatStats.maxHp, combat.enemyHp, enemy.hp);
  $("battleText").textContent = isManualCombatMode()
    ? t("combat.manualReady", "Wähle deine Aktion.")
    : t("combat.autoReady", "Auto-Kampf läuft.");

  try {
    await runActionCombat(combat, isManualCombatMode());
    await finishActionCombat(combat);
  } catch (error) {
    console.error(error);
    log(() => t("combat.finishError", "Der Kampfabschluss hatte einen Fehler, wurde aber sauber freigegeben."), "bad");
  } finally {
    clearCombatWatchdog();
    clearManualCombatStep();
    pendingCombatAction = null;
    activeCombatState = null;
    isFighting = false;
    skipCombat = false;
    setControlsDisabled(false);
    resetFightButton();
    prepareNextEncounter(enemy.baseId || selectedEnemy);
    save();
    safeRender();
  }
}

function createActionCombat(enemy) {
  const stats = totalStats();
  const effectSummary = itemEffectSummary();
  const enchantStats = equippedEnchantmentSummary();
  const combatStats = combatStatsWithItemEffects(stats, enemy, effectSummary);
  const combatEvent = consumePreparedCombatEvent(enemy, enemy.baseId || selectedEnemy);
  const preparedEventEntry = combatEventAnimationEntry(combatEvent, enemy, state.hp);
  const resource = classResource();
  return {
    enemy,
    enemyName: enemyDisplayName(enemy, enemy.baseId || selectedEnemy),
    playerHp: state.hp,
    enemyHp: enemy.hp,
    rounds: 0,
    resource: Math.min(resource.max, state.level >= 3 ? 1 : 0),
    maxResource: resource.max,
    cooldowns: {},
    awaitingPlayerAction: false,
    playerGuard: 1,
    playerDamageMultiplier: 1,
    playerDots: [],
    enemyDots: [],
    events: preparedEventEntry ? [preparedEventEntry] : [],
    combatEvent,
    preparedEventEntry,
    stats,
    effectSummary,
    enchantStats,
    combatStats,
    lastActionId: "",
  };
}

async function runActionCombat(combat, manualMode) {
  await waitCombat(manualMode ? 80 : 260);
  while (combat.playerHp > 0 && combat.enemyHp > 0 && combat.rounds < 80) {
    combat.rounds += 1;
    reduceCombatCooldowns(combat);
    gainCombatResource(combat, classResource().turnGain || 0);
    renderCombatPanel();

    if (await applyCombatDots(combat, "player")) break;
    if (await applyCombatDots(combat, "enemy")) break;

    const action = manualMode ? await waitForCombatAction() : chooseAutoCombatAction(combat);
    combat.lastActionId = action.id;
    await executePlayerCombatAction(combat, action);
    if (combat.enemyHp <= 0 || combat.playerHp <= 0) break;
    await executeEnemyCombatAction(combat);
  }
}

async function applyCombatDots(combat, target) {
  const dots = target === "player" ? combat.playerDots : combat.enemyDots;
  if (!dots.length) return false;
  const damage = dots.reduce((sum, dot) => sum + dot.damage, 0);
  const names = [...new Set(dots.map((dot) => dot.name))].join(", ");
  if (target === "player") {
    combat.playerHp -= damage;
    combat.playerDots = dots.map((dot) => ({ ...dot, turns: dot.turns - 1 })).filter((dot) => dot.turns > 0);
  } else {
    combat.enemyHp -= damage;
    combat.enemyDots = dots.map((dot) => ({ ...dot, turns: dot.turns - 1 })).filter((dot) => dot.turns > 0);
  }
  await pushCombatEvent(combat, {
    round: combat.rounds,
    actor: target === "player" ? "enemy" : "hero",
    damage,
    text: t("combat.dotDamage", "{effect} verursacht {damage} Schaden.", { effect: names, damage }),
  });
  return combat.playerHp <= 0 || combat.enemyHp <= 0;
}

function chooseAutoCombatAction(combat) {
  const wasAwaiting = combat.awaitingPlayerAction;
  combat.awaitingPlayerAction = true;
  const actions = combatActionList(combat);
  combat.awaitingPlayerAction = wasAwaiting;
  const readyAbilities = actions.filter((action) => action.type === "ability" && !action.disabled);
  const attack = actions.find((action) => action.id === "attack");
  const defend = actions.find((action) => action.id === "defend");
  const canDefend = defend && combat.lastActionId !== "defend" && combat.resource < combat.maxResource;
  const lowHp = combat.playerHp <= combat.combatStats.maxHp * 0.38;
  const defensive = readyAbilities.find((action) => ["guard", "lastStand", "battleRush", "weaken", "counter"].includes(abilityCombatGroup(action.abilityId)));
  if (lowHp && defensive) return defensive;
  const execute = readyAbilities.find((action) => abilityCombatGroup(action.abilityId) === "execute" && combat.enemyHp <= combat.enemy.hp * 0.35);
  if (execute) return execute;
  if (lowHp && canDefend) return defend;
  if (readyAbilities.length) return readyAbilities[readyAbilities.length - 1];
  if (combat.playerHp <= combat.combatStats.maxHp * 0.55 && canDefend) return defend;
  return attack || defend;
}

function reduceCombatCooldowns(combat) {
  Object.keys(combat.cooldowns).forEach((id) => {
    combat.cooldowns[id] = Math.max(0, (combat.cooldowns[id] || 0) - 1);
    if (combat.cooldowns[id] <= 0) delete combat.cooldowns[id];
  });
}

function gainCombatResource(combat, amount) {
  if (!amount) return;
  combat.resource = Math.max(0, Math.min(combat.maxResource, combat.resource + amount));
}

async function executePlayerCombatAction(combat, action) {
  if (action.type === "defend") {
    combat.playerGuard = 0.5;
    gainCombatResource(combat, classResource().defendGain || 2);
    await pushCombatEvent(combat, {
      round: combat.rounds,
      actor: "hero",
      damage: 0,
      text: t("combat.defendText", "Du gehst in Deckung und sammelst {resource}.", { resource: classResource().label }),
    });
    return;
  }

  let hit = playerBaseActionHit(combat);
  let text = t("combat.heroHit", "Du triffst für {damage}.", { damage: hit });
  let abilityId = "";
  if (action.type === "ability") {
    abilityId = action.abilityId;
    const result = applyPlayerAbilityAction(combat, action, hit);
    hit = result.hit;
    text = result.text;
  } else {
    gainCombatResource(combat, classResource().attackGain || 1);
  }

  if (combat.playerDamageMultiplier < 1) {
    hit = abilityDamage(hit, combat.playerDamageMultiplier);
    combat.playerDamageMultiplier = 1;
  }
  const defense = enemyDamageTakenMultiplier(combat.enemy, combat.enemyHp, combat.rounds, hit);
  if (defense.multiplier < 1) {
    hit = abilityDamage(hit, defense.multiplier);
    if (defense.defensive.length) {
      await pushCombatEvent(combat, {
        round: combat.rounds,
        actor: "enemy",
        damage: 0,
        text: t("combat.enemyUses", "{enemy} nutzt {abilities}.", { enemy: combat.enemyName, abilities: defense.defensive.join(" + ") }),
      });
    }
  }
  const crit = rollPlayerCritical(hit, combat.combatStats);
  hit = crit.damage;
  if (crit.critical) {
    text = criticalText(text, hit);
    gainCombatResource(combat, classResource().critGain || 0);
  }
  combat.enemyHp -= hit;
  await pushCombatEvent(combat, {
    round: combat.rounds,
    actor: "hero",
    abilityId,
    damage: hit,
    critical: crit.critical,
    text,
  });
  applyItemActionEffects(combat, crit.critical);
}

function playerBaseActionHit(combat) {
  const armorIgnore = (combat.enemy.elite || combat.enemy.boss) ? Math.floor(combat.enemy.defense * combat.effectSummary.eliteArmorIgnore) : 0;
  const effectiveDefense = Math.max(0, combat.enemy.defense - armorIgnore);
  let hit = Math.max(1, random(combat.combatStats.damage - 4, combat.combatStats.damage + 3) - Math.floor(effectiveDefense * 1.08));
  if (combat.combatEvent?.playerDamageBonus) hit = Math.max(1, Math.floor(hit * (1 + combat.combatEvent.playerDamageBonus)));
  if (combat.enemy.elite || combat.enemy.boss) hit = Math.max(1, Math.floor(hit * (1 + combat.enchantStats.bossDamage + combat.effectSummary.eliteDamageBonus)));
  if (combat.effectSummary.firstStrikeBonus > 0 && !combat.firstStrikeUsed) {
    hit = abilityDamage(hit, 1 + combat.effectSummary.firstStrikeBonus);
    combat.firstStrikeUsed = true;
  }
  return hit;
}

function applyPlayerAbilityAction(combat, action, baseHit) {
  combat.resource = Math.max(0, combat.resource - action.cost);
  combat.cooldowns[action.abilityId] = action.cooldown;
  const group = abilityCombatGroup(action.abilityId);
  const name = abilityCombatName(action.abilityId);
  if (group === "guard") {
    combat.playerGuard = 0.42;
    return { hit: abilityDamage(baseHit, 0.9), text: t("combat.abilityGuardText", "{ability} stärkt deine Deckung und trifft für {damage}.", { ability: name, damage: abilityDamage(baseHit, 0.9) }) };
  }
  if (group === "lastStand" || group === "battleRush") {
    const healRatio = group === "lastStand" ? 0.16 : 0.14;
    const heal = Math.min(combat.combatStats.maxHp - combat.playerHp, Math.max(6, Math.floor(combat.combatStats.maxHp * healRatio)));
    combat.playerHp += Math.max(0, heal);
    combat.playerGuard = Math.min(combat.playerGuard, 0.82);
    return { hit: abilityDamage(baseHit, 0.85), text: t("combat.abilityHealText", "{ability} heilt {heal} Leben und trifft für {damage}.", { ability: name, heal, damage: abilityDamage(baseHit, 0.85) }) };
  }
  if (group === "weaken") {
    combat.nextEnemyDamageMultiplier = Math.min(combat.nextEnemyDamageMultiplier || 1, 0.75);
    return { hit: abilityDamage(baseHit, 1.05), text: t("combat.abilityWeakenText", "{ability} schwächt den Gegner und trifft für {damage}.", { ability: name, damage: abilityDamage(baseHit, 1.05) }) };
  }
  if (group === "armorBreak") {
    return { hit: abilityDamage(baseHit + Math.floor(combat.enemy.defense * 0.32), 1.25), text: t("combat.abilityArmorText", "{ability} bricht Rüstung und trifft für {damage}.", { ability: name, damage: abilityDamage(baseHit + Math.floor(combat.enemy.defense * 0.32), 1.25) }) };
  }
  if (group === "flurry") {
    return { hit: abilityDamage(baseHit, 1.42), text: t("combat.abilityFlurryText", "{ability} setzt eine schnelle Serie für {damage}.", { ability: name, damage: abilityDamage(baseHit, 1.42) }) };
  }
  if (group === "execute") {
    const multiplier = combat.enemyHp <= combat.enemy.hp * 0.35 ? 1.8 : 1.35;
    return { hit: abilityDamage(baseHit, multiplier), text: t("combat.abilityExecuteText", "{ability} sucht die Schwachstelle und trifft für {damage}.", { ability: name, damage: abilityDamage(baseHit, multiplier) }) };
  }
  if (group === "counter") {
    combat.playerGuard = 0.75;
    return { hit: abilityDamage(baseHit, 1.28), text: t("combat.abilityCounterText", "{ability} bereitet einen Konter vor und trifft für {damage}.", { ability: name, damage: abilityDamage(baseHit, 1.28) }) };
  }
  return { hit: abilityDamage(baseHit, 1.65), text: t("combat.abilityHeavyText", "{ability} trifft schwer für {damage}.", { ability: name, damage: abilityDamage(baseHit, 1.65) }) };
}

function abilityCombatGroup(abilityId) {
  return Object.entries(classAbilityGroups).find(([, ids]) => ids.includes(abilityId))?.[0] || "heavy";
}

function applyItemActionEffects(combat, critical) {
  if (combat.enemyHp <= 0) return;
  if (combat.effectSummary.bleedChance > 0 && Math.random() < Math.min(0.32, combat.effectSummary.bleedChance)) {
    combat.enemyDots.push({ name: "Blutung", damage: Math.max(1, Math.ceil(combat.combatStats.damage * 0.14)), turns: 2 });
  }
  if (combat.effectSummary.poisonChance > 0 && Math.random() < Math.min(0.3, combat.effectSummary.poisonChance)) {
    combat.enemyDots.push({ name: "Gift", damage: Math.max(1, Math.ceil(combat.combatStats.damage * 0.1)), turns: 3 });
  }
  if (critical && combat.effectSummary.critHealRatio > 0) {
    combat.playerHp += Math.min(combat.combatStats.maxHp - combat.playerHp, Math.max(1, Math.floor(combat.combatStats.maxHp * combat.effectSummary.critHealRatio)));
  }
}

async function executeEnemyCombatAction(combat) {
  const enemyBaseHit = enemyBaseDamageAfterDefense(combat.enemy, combat.combatStats.defense);
  const enemyAbility = triggeredEnemyAbility(combat.enemy, combat.rounds, combat.playerHp, combat.combatStats.maxHp, combat.enemyHp);
  const passiveMultiplier = enemyDamagePassiveMultiplier(combat.enemy, combat.enemyHp);
  const abilityMultiplier = enemyAbility?.damageMultiplier || 1;
  let multiplier = (combat.nextEnemyDamageMultiplier || 1) * combat.playerGuard * abilityMultiplier * passiveMultiplier;
  if (combat.combatEvent?.enemyDamageBonus) multiplier *= 1 + combat.combatEvent.enemyDamageBonus;
  let hit = Math.max(1, Math.floor(enemyBaseHit * multiplier));
  hit = Math.max(1, Math.floor(hit * (1 - Math.min(0.35, combat.enchantStats.damageReduction))));
  const crit = rollEnemyCritical(hit, combat.enemy, combat.effectSummary);
  hit = crit.damage;
  combat.playerHp -= hit;
  gainCombatResource(combat, classResource().hitGain || 0);
  combat.playerGuard = 1;
  combat.nextEnemyDamageMultiplier = 1;
  let text = enemyAbility
    ? t("combat.enemyAbilityHit", "{enemy}: {ability} trifft für {damage}.", {
      enemy: combat.enemyName,
      ability: enemyAbilityDisplayName(enemyAbilityCatalog[enemyAbility.id], enemyAbility.id),
      damage: hit,
    })
    : t("combat.enemyHit", "{enemy} trifft für {damage}.", { enemy: combat.enemyName, damage: hit });
  if (enemyAbility?.playerDamageMultiplier) combat.playerDamageMultiplier = Math.min(combat.playerDamageMultiplier, enemyAbility.playerDamageMultiplier);
  if (enemyAbility?.dot) combat.playerDots.push(enemyAbility.dot);
  if (enemyAbility?.healRatio || enemyAbility?.healFlatRatio) {
    const healBase = enemyAbility.healRatio ? hit * enemyAbility.healRatio : combat.enemy.hp * enemyAbility.healFlatRatio;
    combat.enemyHp += Math.min(combat.enemy.hp - combat.enemyHp, Math.max(1, Math.floor(healBase * enemyHealMultiplier(combat.enemy, combat.enemyHp))));
  }
  if (crit.critical) text = criticalText(text, hit);
  await pushCombatEvent(combat, {
    round: combat.rounds,
    actor: "enemy",
    damage: hit,
    critical: crit.critical,
    text,
  });
}

async function pushCombatEvent(combat, event) {
  const fullEvent = {
    ...event,
    playerHp: Math.max(0, combat.playerHp),
    enemyHp: Math.max(0, combat.enemyHp),
  };
  combat.events.push(fullEvent);
  updateBattleHealth(fullEvent.playerHp, combat.combatStats.maxHp, fullEvent.enemyHp, combat.enemy.hp);
  showCombatAnimationEvent($("battleStage"), fullEvent, combat.preparedEventEntry, combat.enemyName, combat.combatStats.maxHp, combat.enemy.hp);
  renderCombatPanel();
  await waitCombat(isManualCombatMode() ? 180 : 420);
  setBattleStageClass($("battleStage"), "", combat.preparedEventEntry);
}

async function finishActionCombat(combat) {
  if (combat.playerHp > 0 && combat.effectSummary.postCombatHeal > 0) {
    const heal = Math.min(combat.combatStats.maxHp - combat.playerHp, Math.max(1, Math.floor(combat.combatStats.maxHp * Math.min(0.18, combat.effectSummary.postCombatHeal))));
    combat.playerHp += heal;
  }
  hideBattleEventBadge();
  $("battleStage").className = "battle-stage";
  $("battleStage").classList.add(combat.playerHp > 0 ? "victory" : "defeat");
  showBattleResult(combat.playerHp > 0, combat.enemyName, combat.rounds, combatAnimationSummary(combat.events));
  if (skipCombat) {
    // Übersprungen: sofort weiter, Ergebnis-Banner blendet sich nebenher aus.
    hideBattleResultLater(1100);
  } else {
    await waitResult(900);
    hideBattleResult();
  }
  setCombatLog(combat.enemy, combat.events, combat.playerHp > 0, combat.rounds);
  damageEquippedItems(combat.enemy);
  if (combat.playerHp > 0) {
    await loadOptionalDataPack("drops");
    grantActionCombatRewards(combat);
  } else {
    applyActionCombatLoss(combat);
  }
}

function grantActionCombatRewards(combat) {
  state.hp = Math.max(1, combat.playerHp);
  const goldBonus = combat.enchantStats.goldBonus + combat.effectSummary.goldBonus + (combat.combatEvent?.goldBonus || 0);
  const rewardScale = combatRewardScale(combat.enemy);
  const gold = scaledCombatReward(Math.max(1, Math.floor(random(combat.enemy.gold[0], combat.enemy.gold[1]) * (1 + goldBonus))), combat.enemy);
  const xp = scaledCombatReward(Math.max(1, Math.floor(combat.enemy.xp * (1 + combat.enchantStats.xpBonus + combat.effectSummary.xpBonus))), combat.enemy);
  state.gold += gold;
  gainXp(xp);
  grantMaterials(combat.enemy.baseId || selectedEnemy, combat.enemy.eliteVariant);
  createLootChoices(combat.enemy, combat.enemy.baseId || selectedEnemy);
  state.combatStats = normalizeCombatStats(state.combatStats);
  state.combatStats.wins += 1;
  recordSmithMasteryBattle(combat.enemy);
  recordEnchantMasteryBattle(combat.enemy);
  updateQuestProgress(combat.enemy, combat.enemy.baseId || selectedEnemy);
  maybeGrantBattleRenown(combat.enemy);
  const firstClearReward = grantBossFirstClear(combat.enemy, combat.enemy.baseId || selectedEnemy);
  maybeDropRareQuest(combat.enemy);
  refreshQuestBoard(false);
  log(() => t("combat.winLog", "Sieg gegen {enemy} nach {rounds} Runden. +{xp} XP, +{gold} Gold.", { enemy: enemyDisplayName(combat.enemy, combat.enemy.baseId || selectedEnemy), rounds: combat.rounds, xp, gold }), "good");
  if (rewardScale < 1) {
    log(() => t("combat.rewardScaledLog", "Alte Gegner geben nur noch {percent}% Kampfbelohnung.", { percent: Math.round(rewardScale * 100) }), "drop");
  }
  if (firstClearReward) log(() => t("combat.firstClearLog", "Erster Dungeon-Sieg: {reward}.", { reward: bossFirstClearRewardText(combat.enemy) }), "drop");
  if (combat.enemy.boss) remindSaveBackup(() => t("save.backupBossReason", "du hast einen Dungeon-Boss besiegt."));
  notifyReadyAchievements();
}

function applyActionCombatLoss(combat) {
  const xpLoss = Math.min(state.xp, Math.ceil(xpForLevel(state.level) * 0.1));
  const goldLoss = Math.min(state.gold, Math.ceil(14 + state.level * 6));
  state.xp -= xpLoss;
  state.gold -= goldLoss;
  state.deaths += 1;
  state.hp = state.maxHp;
  damageEquippedItems(combat.enemy, 2);
  log(() => t("combat.lossLog", "Tod gegen {enemy}. Du verlierst {xp} XP, {gold} Gold und kehrst angeschlagen ins Lager zurück.", { enemy: enemyDisplayName(combat.enemy, combat.enemy.baseId || selectedEnemy), xp: xpLoss, gold: goldLoss }), "bad");
}

function armCombatWatchdog(ms) {
  clearCombatWatchdog();
  combatWatchdog = window.setTimeout(() => {
    if (isFighting) {
      forceUnlockCombat(() => t("combat.autoUnlockLog", "Der Kampf wurde automatisch freigegeben."));
    }
  }, ms);
}

function clearCombatWatchdog() {
  if (!combatWatchdog) return;
  window.clearTimeout(combatWatchdog);
  combatWatchdog = 0;
}

function forceUnlockCombat(message) {
  clearCombatWatchdog();
  isFighting = false;
  skipCombat = false;
  setControlsDisabled(false);
  resetFightButton();
  if (message) log(message, "bad");
  save();
  safeRender();
}

function resetFightButton() {
  $("fightBtn").textContent = t("combat.start", "Kampf starten");
  $("fightBtn").disabled = state.pendingLoot.length > 0;
}

function getPreparedEncounter(enemyId) {
  const base = enemies[enemyId];
  if (state.nextEncounters[enemyId]?.elite && !base.elite) {
    return createEliteEnemy(base, enemyId);
  }

  return { ...base, baseId: enemyId };
}

function prepareNextEncounter(enemyId) {
  const base = enemies[enemyId];
  if (!base || base.elite) {
    state.nextEncounters[enemyId] = { elite: false };
    return;
  }

  const elite = Math.random() <= eliteEncounterChance;
  state.nextEncounters[enemyId] = { elite };
  if (elite) {
    log(() => t("enemy.nextEliteLog", "Der nächste {enemy} ist eine Elite-Version.", { enemy: enemyDisplayName(base, enemyId) }), "bad");
  }
}

function createEliteEnemy(base, enemyId) {
  const bonusAbility = eliteBonusAbilityFor(base);
  const abilities = [...new Set([...(base.abilities || []), bonusAbility])].filter((id) => enemyAbilityCatalog[id]);
  return {
    ...base,
    baseId: enemyId,
    name: `Elite-${base.name}`,
    level: base.level + 2,
    hp: Math.ceil(base.hp * 1.72),
    damage: [Math.ceil(base.damage[0] * 1.42), Math.ceil(base.damage[1] * 1.5)],
    defense: Math.ceil(base.defense * 1.65 + 3),
    xp: Math.ceil(base.xp * 1.65),
    gold: [Math.ceil(base.gold[0] * 1.35), Math.ceil(base.gold[1] * 1.65)],
    drops: base.drops.map((drop) => ({ ...drop, chance: Math.min(0.12, drop.chance * 1.45) })),
    abilities,
    passives: [...new Set(base.passives || [])].filter((id) => enemyAbilityCatalog[id]),
    critChance: 0.06,
    critDamage: 1.6,
    elite: true,
    eliteVariant: true,
    tags: { ...base.tags, elite: 1 },
  };
}
