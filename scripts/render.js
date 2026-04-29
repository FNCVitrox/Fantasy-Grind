function render() {
  syncDerivedStats();
  const stats = totalStats();
  setText("level", state.level);
  setText("gold", state.gold);
  setText("renown", state.renown);
  const needed = state.level >= 20 ? 1 : xpForLevel(state.level);
  setText("xpText", state.level >= 20 ? "Max" : `${state.xp}/${needed}`);
  setBarWidth("xpBar", state.level >= 20 ? 100 : Math.max(2, (state.xp / needed) * 100));
  renderHeroBuildVisual();
  renderClassPanel();
  const currentRestCost = restCost();
  const restPrice = state.gold >= currentRestCost ? `${currentRestCost} Gold` : "kostenlos";
  const restLabel = state.hp >= state.maxHp
    ? `<span class="button-main">Lagerplatz</span>`
    : `<span class="button-main">Lagerplatz</span><span class="button-price">${restPrice}</span>`;
  renderCachedHtml("restBtn", `${state.hp >= state.maxHp ? "full" : restPrice}`, () => restLabel);
  setDisabled("restBtn", state.hp >= state.maxHp);

  renderMap();
  renderEnemies(stats);
  renderEquipment();
  renderLootChoices();
  renderQuests();
  if (isModalOpen("inventoryModal")) renderInventory();
  if (isModalOpen("questBoardModal")) renderQuestBoard();
  if (isModalOpen("smithModal")) renderSmith();
  if (isModalOpen("repairModal")) renderRepairModal();
  if (isModalOpen("equipmentModal")) renderEquipmentDetails();
  if (isModalOpen("playerStatsModal")) renderPlayerStatsDetails(stats);
  renderSelectedEnemy(stats);
  renderLog();
  setText("fightBtn", isFighting ? (skipCombat ? "Überspringe..." : "Skip") : "Kampf starten");
  setDisabled("fightBtn", isFighting ? skipCombat : state.pendingLoot.length > 0);
}

function setText(id, value) {
  const element = $(id);
  const text = String(value);
  if (element.textContent !== text) element.textContent = text;
}

function setBarWidth(id, value) {
  const width = `${Math.max(0, Math.min(100, value))}%`;
  if ($(id).style.width !== width) $(id).style.width = width;
}

function setDisabled(id, disabled) {
  const element = $(id);
  if (element.disabled !== disabled) element.disabled = disabled;
}

function renderCachedHtml(id, signature, htmlFactory) {
  const key = `html:${id}`;
  const nextSignature = String(signature);
  if (renderCache[key] === nextSignature) return false;
  $(id).innerHTML = htmlFactory();
  renderCache[key] = nextSignature;
  return true;
}

function renderHeroBuildVisual() {
  const build = ["tank", "damage", "bruiser"].includes(state.build) ? state.build : "bruiser";
  const className = `combatant hero-sprite hero-build-${build}`;
  if ($("heroSprite").className !== className) $("heroSprite").className = className;
}

function itemQuality(item) {
  return ["common", "rare", "epic", "legendary"].includes(item?.quality) ? item.quality : "common";
}

function itemSlot(item) {
  return equipmentSlots.includes(item?.slot) ? item.slot : "ring";
}

function labelFor(map, key, fallback = "Unbekannt") {
  return escapeHtml(map[key] || fallback);
}

function escapeToken(value, allowed, fallback) {
  return allowed.includes(value) ? value : fallback;
}

function renderMap() {
  const zoneData = zones[selectedZone] || zones.meadow;
  setText("activeZoneName", zoneData.name);
  setText("activeZoneRange", `${zoneKindLabel(zoneData)} · ${zoneData.range || "Unbekannt"}`);
  const mapSignature = `${selectedZone}|${zoneUnlockSignature()}`;
  if (renderCache.map === mapSignature) return;
  renderCache.map = mapSignature;
  document.querySelectorAll("[data-zone]").forEach((button) => {
    button.classList.toggle("active", button.dataset.zone === selectedZone);
    button.disabled = !isZoneUnlocked(button.dataset.zone);
  });
  renderZoneOptions();
}

function renderClassPanel() {
  setText("className", activeClass().name);
  const signature = `${state.characterClass}|${state.build}`;
  if (renderCache.classPanel === signature) return;
  renderCache.classPanel = signature;
  $("buildList").innerHTML = Object.entries(buildCatalog).map(([id, build]) => `
    <button class="${state.build === id ? "active" : ""}" type="button" data-build="${id}">
      <strong>${escapeHtml(build.name)}</strong>
      <span>${escapeHtml(build.description)}</span>
    </button>
  `).join("");
  $("abilityList").innerHTML = knownClassAbilities().map(([id, ability]) => `
    <div class="ability-chip" data-ability="${id}">
      <strong>${escapeHtml(ability.name)}</strong>
      <span>${escapeHtml(ability.text)}</span>
    </div>
  `).join("");
}

function renderPlayerStatsDetails(stats = totalStats()) {
  const needed = state.level >= 20 ? 1 : xpForLevel(state.level);
  const durabilityAverage = equippedDurabilityAverage();
  const setStats = activeSetBonusStats();
  const build = activeBuild();
  const signature = [
    state.level,
    state.xp,
    needed,
    state.hp,
    state.maxHp,
    state.gold,
    state.renown,
    state.build,
    stats.damage,
    stats.defense,
    stats.maxHp,
    stats.critChance,
    stats.critDamage,
    durabilityAverage,
    setStats.damage,
    setStats.defense,
    setStats.maxHp,
    equipmentSignature(),
  ].join("|");
  if (renderCache.playerStats === signature) return;
  renderCache.playerStats = signature;

  const xpPercent = state.level >= 20 ? 100 : Math.max(2, Math.min(100, (state.xp / needed) * 100));
  const hpPercent = Math.max(2, Math.min(100, (state.hp / state.maxHp) * 100));
  const buildDamage = Math.round(((build.damageMultiplier || 1) - 1) * 100);
  const buildDefense = Math.round(((build.defenseMultiplier || 1) - 1) * 100);
  const buildHp = Math.round(((build.maxHpMultiplier || 1) - 1) * 100);
  const setLines = Object.values(activeSetCounts())
    .filter(({ count }) => count >= 2)
    .map(({ id, count }) => `<span>${escapeHtml(setBonuses[id]?.name || id)} · ${count} Teile</span>`)
    .join("");

  $("playerStatsDetails").innerHTML = `
    <section class="player-stats-hero">
      <div>
        <p class="eyebrow">${escapeHtml(activeClass().name)} · ${escapeHtml(build.name)}</p>
        <h3>Level ${state.level}</h3>
      </div>
      <div class="player-stat-currency">
        <span>Gold <strong>${state.gold}</strong></span>
        <span>Ruhm <strong>${state.renown}</strong></span>
      </div>
    </section>
    <section class="player-progress-grid">
      <div class="player-progress-card">
        <div class="bar-label"><span>Leben</span><b>${state.hp}/${state.maxHp}</b></div>
        <div class="bar"><span style="width:${hpPercent}%"></span></div>
      </div>
      <div class="player-progress-card">
        <div class="bar-label"><span>XP</span><b>${state.level >= 20 ? "Max" : `${state.xp}/${needed}`}</b></div>
        <div class="bar xp"><span style="width:${xpPercent}%"></span></div>
      </div>
    </section>
    <section class="player-stat-grid">
      ${renderPlayerStat("Schaden", stats.damage)}
      ${renderPlayerStat("Verteidigung", stats.defense)}
      ${renderPlayerStat("Max. Leben", stats.maxHp)}
      ${renderPlayerStat("Haltbarkeit", `${durabilityAverage}%`)}
      ${renderPlayerStat("Crit Chance", formatPercent(stats.critChance))}
      ${renderPlayerStat("Crit Damage", formatPercent(stats.critDamage))}
    </section>
    <section class="player-stat-sources">
      <div>
        <strong>Build-Bonus</strong>
        <span>Schaden ${formatSignedPercent(buildDamage)}</span>
        <span>Verteidigung ${formatSignedPercent(buildDefense)}</span>
        <span>Leben ${formatSignedPercent(buildHp)}</span>
        <span>Crit ${formatSignedPercent(Math.round((build.critChanceBonus || 0) * 100))} Chance</span>
        <span>Crit ${formatSignedPercent(Math.round((build.critDamageBonus || 0) * 100))} Schaden</span>
      </div>
      <div>
        <strong>Set-Boni</strong>
        ${setLines || "<span>Kein aktiver Set-Bonus</span>"}
        <span>Gesamt: +${setStats.damage} Schaden · +${setStats.defense} Verteidigung · +${setStats.maxHp} Leben</span>
      </div>
    </section>
  `;
}

function renderPlayerStat(label, value) {
  return `<div class="player-stat-card"><span>${escapeHtml(label)}</span><strong>${value}</strong></div>`;
}

function formatSignedPercent(value) {
  if (value > 0) return `+${value}%`;
  if (value < 0) return `${value}%`;
  return "0%";
}

function formatPercent(value) {
  return `${Math.round((value || 0) * 100)}%`;
}

function itemCritText(item) {
  return [
    item.critChance ? `Crit ${formatPercent(item.critChance)}` : "",
    item.critDamage ? `Crit-Schaden +${formatPercent(item.critDamage)}` : "",
  ].filter(Boolean).join(" · ");
}

function renderEnemies(stats = totalStats()) {
  const signature = [
    selectedZone,
    selectedEnemy,
    state.hp,
    stats.damage,
    stats.defense,
    stats.maxHp,
    stats.critChance,
    stats.critDamage,
    zoneEncounterSignature(selectedZone),
  ].join("|");
  if (renderCache.enemies === signature) return;
  renderCache.enemies = signature;
  $("enemyList").innerHTML = zones[selectedZone].enemies.map((id) => {
    const enemy = getPreparedEncounter(id);
    const risk = riskFor(enemy, stats);
    const ok = risk === "Machbar";
    const rarity = enemyRarity(enemy);
    const safeRarity = escapeToken(rarity, ["common", "rare", "epic", "legendary"], "common");
    return `<button class="enemy rarity-card rarity-${safeRarity} ${id === selectedEnemy ? "active" : ""}" type="button" data-enemy="${id}">
      <span><strong>${escapeHtml(enemy.name)}</strong><p><span class="quality-${safeRarity}">${labelFor(rarityLabel, safeRarity)}</span> · Level ${enemy.level}${enemy.boss ? " · Boss" : enemy.elite ? " · Elite" : ""} · ${enemy.xp} XP</p></span>
      <em class="risk ${ok ? "ok" : ""}">${risk}</em>
    </button>`;
  }).join("");
}

function renderZoneOptions() {
  const container = document.getElementById("zoneOptions");
  if (!container) return;
  const section = (type, title) => {
    const entries = Object.entries(zones).filter(([, zone]) => zone.type === type);
    return `<section class="travel-section">
      <h3>${title}</h3>
      <div class="zone-options">
        ${entries.map(([id, zone]) => {
          const locked = !isZoneUnlocked(id);
          return `<button class="zone ${id === selectedZone ? "active" : ""}" type="button" data-zone="${id}" ${locked ? "disabled" : ""}>
            <span>${escapeHtml(zone.name)}</span>
            <small>${escapeHtml(zone.range || "")}</small>
            <em>${locked ? escapeHtml(zoneLockText(id)) : `${zone.enemies.length} ${type === "dungeon" ? "Bosse" : "Gegner"}`}</em>
          </button>`;
        }).join("")}
      </div>
    </section>`;
  };
  container.innerHTML = `${section("zone", "Normale Gebiete")}${section("dungeon", "Dungeons")}`;
}

function enemyRarity(enemy) {
  if (enemy.level >= 20) return "legendary";
  if (enemy.elite || enemy.level >= 12) return "epic";
  if (enemy.level >= 6) return "rare";
  return "common";
}

function renderSelectedEnemy(stats = totalStats()) {
  const signature = `${selectedEnemy}|${state.hp}|${state.maxHp}|${state.level}|${state.build}|${zoneEncounterSignature(selectedZone)}|${equipmentSignature()}`;
  if (renderCache.selectedEnemy === signature) return;
  renderCache.selectedEnemy = signature;
  const enemy = getPreparedEncounter(selectedEnemy);
  setText("selectedEnemyName", enemy.name);
  const eliteNote = enemy.eliteVariant
    ? "Bereit: Elite-Version."
    : enemy.boss
      ? "Dungeon-Boss mit besseren Belohnungen."
    : enemy.elite
      ? "Elite-Gegner."
      : `Nach jedem Kampf ${Math.round(eliteEncounterChance * 100)}% Chance auf Elite-Version.`;
  const abilityCount = enemyAbilityEntries(enemy).length;
  const enemyCrit = enemyCriticalStats(enemy);
  setText("selectedEnemyMeta", `Level ${enemy.level}, ${enemy.hp} Leben, ${abilityCount} Fähigkeiten, Crit ${formatPercent(enemyCrit.critChance)} / ${formatPercent(enemyCrit.critDamage)}, Risiko: ${riskFor(enemy, stats)}. ${eliteNote}`);
  setBattleEnemyVisual(enemy);
  $("battleText").textContent = `${enemy.name} wartet.`;
}

function setBattleEnemyVisual(enemy) {
  setText("enemySpriteName", enemy.name);
  const className = `combatant enemy-sprite ${enemy.sprite}${enemy.eliteVariant ? " elite-variant" : ""}`;
  if ($("enemySprite").className !== className) $("enemySprite").className = className;
  updateBattleHealth(state.hp, state.maxHp, enemy.hp, enemy.hp);
}

function updateBattleHealth(playerHp, playerMaxHp, enemyHp, enemyMaxHp) {
  updateCombatHealth("Hero", playerHp, playerMaxHp);
  updateCombatHealth("Enemy", enemyHp, enemyMaxHp);
}

function updateCombatHealth(side, current, max) {
  const text = $(`battle${side}HpText`);
  const bar = $(`battle${side}HpBar`);
  if (!text || !bar) return;

  const safeMax = Math.max(1, Math.floor(max || 1));
  const safeCurrent = Math.max(0, Math.min(safeMax, Math.floor(current || 0)));
  const percent = Math.max(0, Math.min(100, (safeCurrent / safeMax) * 100));
  text.textContent = `${safeCurrent}/${safeMax}`;
  bar.style.width = `${percent}%`;
  bar.parentElement.classList.toggle("low", percent <= 30);
}

function zoneUnlockSignature() {
  return Object.keys(zones).map((id) => `${id}:${isZoneUnlocked(id) ? 1 : 0}`).join(",");
}

function zoneEncounterSignature(zoneId) {
  return (zones[zoneId]?.enemies || [])
    .map((id) => `${id}:${state.nextEncounters[id]?.elite ? 1 : 0}`)
    .join(",");
}

function equipmentSignature() {
  return equipmentSlots
    .map((slot) => {
      const id = state.equipment[slot] || "";
      const item = getItem(id);
      return `${slot}:${id}:${item?.damage ?? ""}:${item?.defense ?? ""}:${item?.critChance ?? 0}:${item?.critDamage ?? 0}:${item?.upgrade ?? 0}:${state.itemDurability[id] ?? ""}`;
    })
    .join("|");
}

function renderEquipment() {
  const signature = `${equipmentSignature()}|${state.level}|${state.renown}`;
  if (renderCache.equipment === signature) {
    if (isModalOpen("equipmentModal")) renderEquipmentDetails();
    return;
  }
  renderCache.equipment = signature;
  const slots = equipmentSlots.map((slot) => [slot, state.equipment[slot]]);
  $("equipment").innerHTML = slots.map(([slot, id]) => {
    const item = getItem(id);
    if (!item) {
      return `<button class="equipment-chip empty-slot" type="button" data-open-equipment>
        <strong>${slotLabel[slot]}</strong>
        <span>Leer</span>
      </button>`;
    }
    const durability = itemDurability(id);
    const repairCost = repairCostForSlot(slot);
    const quality = itemQuality(item);
    const setName = item.set ? setBonuses[item.set]?.name || item.set : "";
    return `<button class="equipment-chip rarity-card rarity-${quality}" type="button" data-open-equipment>
      <strong>${labelFor(slotLabel, slot)}</strong>
      <span class="quality-${quality}">${escapeHtml(item.name)}</span>
      <small>${labelFor(qualityLabel, quality)} · +${item.upgrade || 0}</small>
      <small class="${durability <= 25 ? "durability-low" : ""}">${durability}% · ${repairCost} Gold</small>
      <span class="equipment-hover-detail" aria-hidden="true">
        <b class="quality-${quality}">${escapeHtml(item.name)}</b>
        <em>${labelFor(slotLabel, slot)} · ${labelFor(qualityLabel, quality)} · +${item.upgrade || 0}</em>
        <em>Schaden: ${item.damage || 0} · Verteidigung: ${item.defense || 0}</em>
        ${itemCritText(item) ? `<em>${itemCritText(item)}</em>` : ""}
        <em>Haltbarkeit: ${durability}%</em>
        <em>Reparatur: ${repairCost} Gold</em>
        ${setName ? `<em>Set: ${escapeHtml(setName)}</em>` : ""}
      </span>
    </button>`;
  }).join("");
  if (isModalOpen("equipmentModal")) renderEquipmentDetails();
}

function renderEquipmentDetails() {
  $("equipmentDetails").innerHTML = equipmentSlots.map((slot) => {
    const id = state.equipment[slot];
    const item = getItem(id);
    if (!item) {
      return `<div class="slot empty-slot">
        <strong>${labelFor(slotLabel, slot)}</strong>
        <p>Leer</p>
      </div>`;
    }
    const setKey = item.set ? cacheSetTooltip(item.set) : "";
    const slotRepairCost = repairCostForSlot(slot);
    const quality = itemQuality(item);
    return `<div class="slot rarity-card rarity-${quality}">
      <strong>${labelFor(slotLabel, slot)}</strong>
      <p class="quality-${quality}">${escapeHtml(item.name)} · ${labelFor(qualityLabel, quality)} · +${item.upgrade || 0}</p>
      ${item.set ? `<p class="set-line set-hover-row"><span>${escapeHtml(setBonuses[item.set]?.name || item.set)}</span><span class="tooltip-source" data-set-tooltip-key="${setKey}"></span></p>` : ""}
      <p>+${item.damage} Schaden · +${item.defense} Verteidigung</p>
      ${itemCritText(item) ? `<p>${itemCritText(item)}</p>` : ""}
      <p class="${itemDurability(id) <= 25 ? "durability-low" : ""}">Haltbarkeit: ${itemDurability(id)}%</p>
      ${slotRepairCost ? `<p>Reparatur: ${slotRepairCost} Gold</p>` : ""}
    </div>`;
  }).join("");
}

function renderSmith() {
  renderSmithMaterials();
  renderSmithRenown();
  $("smithHome").hidden = smithView !== "home";
  $("smithUpgradeSection").hidden = smithView !== "upgrade";
  $("smithSalvageSection").hidden = smithView !== "salvage";

  if (smithView === "home") renderSmithHome();
  if (smithView === "upgrade") renderSmithUpgrade();
  if (smithView === "salvage") renderSmithSalvage();
}

const smithDialogues = {
  0: [
    {
      title: "Der Schmied hebt den Hammer.",
      text: "Bring mir Beute, Eisen und Splitter. Ich mache daraus etwas, das dich am Leben hält.",
    },
    {
      title: "Der Schmied mustert deine Ausrüstung.",
      text: "Neu hier? Dann hör gut zu: rostige Klingen gewinnen keine langen Kämpfe.",
    },
    {
      title: "Der Schmied nickt knapp.",
      text: "Gold auf den Tisch, Material daneben. Freundliche Worte härten keinen Stahl.",
    },
  ],
  5: [
    {
      title: "Der Schmied erkennt dich wieder.",
      text: "Du kommst öfter zurück, als ich erwartet habe. Gut. Deine Sachen halten schon mehr aus.",
    },
    {
      title: "Der Schmied legt neues Werkzeug bereit.",
      text: "Für dich nehme ich mir einen sauberen Amboss. Reparaturen werden etwas günstiger.",
    },
    {
      title: "Der Schmied schmunzelt trocken.",
      text: "Du überlebst. Das ist in Grauwacht fast schon ein Empfehlungsschreiben.",
    },
  ],
  10: [
    {
      title: "Der Schmied grüßt dich mit einem Nicken.",
      text: "Die Quest-Tafel hört auf deinen Namen. Mehr Aufträge bedeuten mehr Gründe für bessere Klingen.",
    },
    {
      title: "Der Schmied zeigt auf die Wandtafel.",
      text: "Ich habe den Boten gesagt, sie sollen dir mehr Arbeit bringen. Du kannst sie wohl gebrauchen.",
    },
    {
      title: "Der Schmied prüft eine Klinge im Licht.",
      text: "Verlässliche Hände bekommen verlässliche Aufträge. Such dir aus, was dich nicht umbringt.",
    },
  ],
  15: [
    {
      title: "Der Schmied nimmt sich Zeit.",
      text: "Aus Schrott kann man mehr holen, wenn man weiß, wo man schneiden muss. Ich helfe dir beim Zerlegen.",
    },
    {
      title: "Der Schmied sortiert deine Beute.",
      text: "Wegwerfen wäre Verschwendung. Gib mir die Teile, ich finde noch brauchbares Material darin.",
    },
    {
      title: "Der Schmied klopft gegen den Amboss.",
      text: "Du bringst mir gute Arbeit. Dafür hole ich dir aus altem Zeug ein bisschen mehr heraus.",
    },
  ],
  20: [
    {
      title: "Der Schmied wirkt zufrieden.",
      text: "Jetzt reden wir nicht mehr über Flickwerk. Deine Upgrades bekommen meinen besten Preis.",
    },
    {
      title: "Der Schmied legt die schweren Werkzeuge bereit.",
      text: "Held der Grauwacht, hm? Dann soll deine Ausrüstung auch danach klingen.",
    },
    {
      title: "Der Schmied lächelt fast.",
      text: "Ich feilsche nicht gern. Bei dir mache ich eine Ausnahme. Mach etwas Sinnvolles daraus.",
    },
  ],
  30: [
    {
      title: "Der Schmied senkt die Stimme.",
      text: "Elite-Gegner tragen bessere Spuren am Stahl. Bring sie mir, ich erkenne den Wert.",
    },
    {
      title: "Der Schmied prüft deine Narben.",
      text: "Wer Eliten jagt, braucht mehr als Mut. Deine Beute behandle ich entsprechend.",
    },
    {
      title: "Der Schmied arbeitet ohne aufzusehen.",
      text: "Du suchst die gefährlichen Kämpfe. Gut. Gefährliche Beute lässt sich besser verwerten.",
    },
  ],
  40: [
    {
      title: "Der Schmied spricht wie zu einem Verbündeten.",
      text: "Meister der Grauwacht. Für dich halte ich die seltenen Aufträge nicht mehr unter der Theke.",
    },
    {
      title: "Der Schmied reicht dir das beste Werkzeug.",
      text: "Du hast dir Vertrauen verdient. Wenn etwas Besonderes auftaucht, erfährst du es zuerst.",
    },
    {
      title: "Der Schmied schlägt den Hammer langsam an.",
      text: "Jetzt bauen wir nicht nur Ausrüstung. Jetzt bauen wir Legenden, Stück für Stück.",
    },
  ],
};

function smithDialogueForRank() {
  const rank = renownRank();
  const lines = smithDialogues[rank.threshold] || smithDialogues[0];
  const greeting = $("smithGreeting");
  const previous = Number(greeting?.dataset.dialogueIndex ?? -1);
  let index = random(0, lines.length - 1);
  if (lines.length > 1 && index === previous) index = (index + 1) % lines.length;
  return { ...lines[index], index };
}

function renderSmithGreeting() {
  const dialogue = smithDialogueForRank();
  $("smithGreetingText").innerHTML = `
    <strong>${escapeHtml(dialogue.title)}</strong>
    <p>"${escapeHtml(dialogue.text)}"</p>
  `;
  $("smithGreeting").dataset.dialogueIndex = String(dialogue.index);
}

function renderSmithMaterials() {
  $("materials").innerHTML = [
    `<div class="material gold-material"><span>Gold</span><strong>${state.gold}</strong></div>`,
    ...Object.entries(materialLabel).map(([id, label]) =>
      `<div class="material"><span>${label}</span><strong>${state.materials[id] || 0}</strong></div>`
    ),
  ].join("");
}

function renderSmithRenown() {
  const rank = renownRank();
  const next = nextRenownRank();
  $("smithRenown").innerHTML = `
    <div>
      <span>Ruhm ${state.renown}</span>
      <strong>${escapeHtml(rank.name)}</strong>
    </div>
    <p>${escapeHtml(rank.benefit)}</p>
    <small>${next ? `Nächster Rang bei ${next.threshold} Ruhm: ${escapeHtml(next.benefit)}` : "Alle Ruhm-Vorteile freigeschaltet."}</small>
  `;
}

function renderSmithHome() {
  if ($("smithHome").dataset.rendered !== "true") {
    $("smithHome").innerHTML = `
    <div class="smith-greeting" id="smithGreeting">
      <div class="smith-avatar" aria-hidden="true"></div>
      <div id="smithGreetingText"></div>
    </div>
    <div class="smith-choice-grid">
      <button type="button" data-smith-view="upgrade">
        <strong>Verbessern</strong>
        <span>Ausrüstung mit Gold und Materialien verstärken.</span>
      </button>
      <button type="button" data-smith-view="salvage">
        <strong>Zerlegen</strong>
        <span>Alte Items in Schmiedematerialien zerlegen.</span>
      </button>
      <button type="button" data-open-repair>
        <strong>Reparieren</strong>
        <span>Ausrüstung beim Schmied für Gold instand setzen.</span>
      </button>
    </div>
  `;
    $("smithHome").dataset.rendered = "true";
  }
  renderSmithGreeting();
}

function renderSmithUpgrade() {
  $("smithGrid").innerHTML = equipmentSlots.map((slot) => {
    const itemId = state.equipment[slot];
    const item = getItem(itemId);
    if (!item) return "";
    const quality = itemQuality(item);
    const cost = upgradeCost(item);
    const preview = previewUpgradedItem(item);
    const damageGain = preview.damage - item.damage;
    const defenseGain = preview.defense - item.defense;
    const critChanceGain = (preview.critChance || 0) - (item.critChance || 0);
    const critDamageGain = (preview.critDamage || 0) - (item.critDamage || 0);
    const materialText = Object.entries(cost.materials)
      .filter(([, amount]) => amount > 0)
      .map(([id, amount]) => `${labelFor(materialLabel, id)} ${state.materials[id] || 0}/${amount}`)
      .join(" · ");
    const discountText = renownUpgradeDiscount() ? " · Ruhm-Rabatt aktiv" : "";
    const maxed = (item.upgrade || 0) >= 4;
    const disabled = maxed || !canPayUpgradeCost(cost);
    return `<div class="smith-card rarity-card rarity-${quality}">
      <div class="smith-item-main">
        <strong>${labelFor(slotLabel, slot)} · <span class="quality-${quality}">${escapeHtml(item.name)}</span></strong>
        <p>+${item.upgrade || 0}/4 · Dmg ${item.damage} · Def ${item.defense} · ${itemCritText(item) || "Kein Crit"} · Haltbarkeit ${itemDurability(itemId)}%</p>
      </div>
      <button class="upgrade-preview" type="button" data-upgrade="${slot}" ${disabled ? "disabled" : ""}>
        <span>${maxed ? "Maximal" : "Nach Upgrade"}</span>
        <strong>+${preview.upgrade}/4 · Dmg ${preview.damage}${damageGain ? ` <b>+${damageGain}</b>` : ""} · Def ${preview.defense}${defenseGain ? ` <b>+${defenseGain}</b>` : ""}</strong>
        <em>${itemCritText(preview) || "Kein Crit"}${critChanceGain ? ` <b>+${formatPercent(critChanceGain)}</b>` : ""}${critDamageGain ? ` <b>+${formatPercent(critDamageGain)}</b>` : ""}</em>
      </button>
      <div class="smith-cost-block">
        <p>${cost.gold} Gold${discountText}</p>
        <p class="smith-material-cost">${materialText}</p>
      </div>
    </div>`;
  }).join("");
}

function renderSmithSalvage() {
  $("salvageAllBtn").disabled = !state.inventory.length;
  $("salvageList").innerHTML = state.inventory.length
    ? state.inventory.map((itemId, index) => {
        const item = getItem(itemId);
        const quality = itemQuality(item);
        const slot = itemSlot(item);
        const materials = Object.entries(salvageValue(item)).map(([id, amount]) => `${amount} ${labelFor(materialLabel, id)}`).join(" · ");
        const bonusChance = Math.round(renownSalvageBonusChance(item) * 100);
        return `<div class="salvage-row rarity-card rarity-${quality}">
          <span><strong class="quality-${quality}">${escapeHtml(item.name)}</strong><small>${labelFor(slotLabel, slot)} · ${labelFor(qualityLabel, quality)} · ${materials}${bonusChance ? ` · ${bonusChance}% Bonus` : ""}</small></span>
          <button type="button" data-salvage="${index}">Zerlegen</button>
        </div>`;
      }).join("")
    : `<div class="inventory-empty">Keine Items im Rucksack zum Zerlegen.</div>`;

}

function renderInventory() {
  $("inventorySummary").innerHTML = `<span>Items: <strong>${state.inventory.length}</strong></span><span>Gold: <strong>${state.gold}</strong></span>`;
  $("sellAllBtn").disabled = !state.inventory.length;

  if (!state.inventory.length) {
    $("inventory").innerHTML = `<div class="inventory-empty">Noch keine Items im Inventar.</div>`;
    return;
  }

  $("inventory").innerHTML = state.inventory.map((itemId, index) => {
    const item = getItem(itemId);
    if (!item) return "";
    const quality = itemQuality(item);
    const slot = itemSlot(item);
    const current = getItem(state.equipment[slot]);
    const compare = compareLoot(item, current);
    return `<div class="inventory-item rarity-card rarity-${quality}">
      <strong class="quality-${quality}">${escapeHtml(item.name)}</strong>
      <p>${labelFor(slotLabel, slot)} · ${labelFor(qualityLabel, quality)} · Wert ${sellValue(item)} Gold</p>
      ${item.set ? `<p class="set-line">${escapeHtml(setBonuses[item.set]?.name || item.set)}</p>` : ""}
      <p>+${item.damage} Schaden · +${item.defense} Verteidigung</p>
      ${itemCritText(item) ? `<p>${itemCritText(item)}</p>` : ""}
      <p>Haltbarkeit: ${itemDurability(itemId)}%</p>
      <div class="loot-compare compact">
        <span class="${compare.powerClass}">${compare.powerText}</span>
        <span class="${compare.damageClass}">${compare.damageText}</span>
        <span class="${compare.defenseClass}">${compare.defenseText}</span>
      </div>
      <div class="inventory-actions">
        <button type="button" data-equip="${index}">Ausrüsten</button>
        <button class="sell-button" type="button" data-sell="${index}">Verkaufen</button>
      </div>
    </div>`;
  }).join("");

}

function renderLootChoices() {
  const modal = $("lootModal");
  if (!state.pendingLoot.length) {
    if (renderCache.lootChoices !== "empty") {
      modal.classList.remove("open");
      modal.setAttribute("aria-hidden", "true");
      $("lootChoices").innerHTML = "";
      renderCache.lootChoices = "empty";
    }
    return;
  }

  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
  const isQuestReward = state.pendingLoot.every((item) => item.sourceType === "quest");
  setText("lootTitle", isQuestReward ? "Questbelohnung" : "Wähle ein Item");
  setText("lootCounter", isQuestReward ? "Belohnung" : `1 von ${state.pendingLoot.length}`);
  const signature = lootChoicesSignature();
  if (renderCache.lootChoices === signature) return;
  renderCache.lootChoices = signature;
  $("lootChoices").innerHTML = state.pendingLoot.map((item, index) => {
    if (!item) return "";
    const quality = itemQuality(item);
    const slot = itemSlot(item);
    const current = getItem(state.equipment[slot]);
    const compare = compareLoot(item, current);
    const discovery = lootDiscoveryStatus(item);
    return `<div class="loot-card rarity-card rarity-${quality}">
      <strong class="loot-card-title quality-${quality}">${escapeHtml(item.name)}</strong>
      <div class="loot-card-badge">${discovery ? `<span class="discovery-badge ${discovery.className}">${discovery.text}</span>` : ""}</div>
      <p class="loot-card-meta">${labelFor(slotLabel, slot)} · ${labelFor(qualityLabel, quality)}</p>
      <p class="loot-card-set ${item.set ? "set-line" : "empty"}">${item.set ? escapeHtml(setBonuses[item.set]?.name || item.set) : "&nbsp;"}</p>
      <p class="loot-card-stats">+${item.damage} Schaden · +${item.defense} Verteidigung</p>
      <p class="loot-card-value">${itemCritText(item) || "Kein Crit-Bonus"}</p>
      <p class="loot-card-value">Haltbarkeit: ${item.durability ?? 100}%</p>
      <p class="loot-card-value">Wert: ${sellValue(item)} Gold</p>
      <div class="loot-compare">
        <span class="${compare.powerClass}">${compare.powerText}</span>
        <span class="${compare.damageClass}">${compare.damageText}</span>
        <span class="${compare.defenseClass}">${compare.defenseText}</span>
      </div>
      <div class="loot-actions">
        <button type="button" data-loot="${index}">Ins Inventar</button>
        <button type="button" data-equip-loot="${index}">Ausrüsten</button>
      </div>
    </div>`;
  }).join("");

}

function lootChoicesSignature() {
  return state.pendingLoot.map((item) => {
    if (!item) return "empty";
    return [
      item.id,
      item.name,
      item.slot,
      item.quality,
      item.damage,
      item.defense,
      item.critChance || 0,
      item.critDamage || 0,
      item.durability ?? 100,
      item.set || "",
      item.sourceType || "",
      item.discoveryNew ? 1 : 0,
      item.discoveryCount || 0,
    ].join(":");
  }).join("|");
}

function lootDiscoveryStatus(item) {
  if (item.sourceType === "quest") return { text: "Questbelohnung", className: "quest" };
  if (!item.sourceEnemy) return null;
  if (item.discoveryNew === true) return { text: "Neu entdeckt", className: "new" };
  const count = item.discoveryCount || 1;
  return { text: `Schon gefunden · ${count}x`, className: "known" };
}

function compareLoot(item, current) {
  current = current || { damage: 0, defense: 0 };
  const powerDiff = itemScore(item) - itemScore(current);
  const damageDiff = item.damage - current.damage;
  const defenseDiff = item.defense - current.defense;
  const critChanceDiff = (item.critChance || 0) - (current.critChance || 0);
  const critDamageDiff = (item.critDamage || 0) - (current.critDamage || 0);

  return {
    powerText: compareText("Gesamt", powerDiff, " Kraft"),
    powerClass: compareClass(powerDiff),
    damageText: compareText("Schaden", damageDiff, ""),
    damageClass: compareClass(damageDiff),
    defenseText: critChanceDiff || critDamageDiff
      ? `Crit: ${critChanceDiff >= 0 ? "+" : ""}${formatPercent(critChanceDiff)} / ${critDamageDiff >= 0 ? "+" : ""}${formatPercent(critDamageDiff)}`
      : compareText("Verteidigung", defenseDiff, ""),
    defenseClass: compareClass(defenseDiff + critChanceDiff * 80 + critDamageDiff * 20),
  };
}

function compareText(label, diff, suffix) {
  if (diff > 0) return `${label}: besser (+${diff.toFixed(diff % 1 ? 1 : 0)}${suffix})`;
  if (diff < 0) return `${label}: schlechter (${diff.toFixed(diff % 1 ? 1 : 0)}${suffix})`;
  return `${label}: gleich`;
}

function compareClass(diff) {
  if (diff > 0) return "compare-good";
  if (diff < 0) return "compare-bad";
  return "compare-even";
}

function renderQuests() {
  state.activeQuests = state.activeQuests.filter((id) => !state.completedQuests.includes(id));
  const active = state.activeQuests.map(getQuestById).filter(Boolean);
  const signature = active.map((quest) => `${quest.id}:${Math.floor(state.quests[quest.id] || 0)}:${state.completedQuests.includes(quest.id) ? 1 : 0}`).join("|") || "empty";
  if (renderCache.quests === signature) return;
  renderCache.quests = signature;

  if (!active.length) {
    $("quests").innerHTML = `<div class="inventory-empty">Keine aktive Quest. Öffne die Quest-Tafel.</div>`;
    return;
  }

  $("quests").innerHTML = active.map((quest) => {
    const value = Math.floor(state.quests[quest.id] || 0);
    const done = state.completedQuests.includes(quest.id);
    const rarity = escapeToken(quest.rarity || (quest.rare ? "legendary" : "common"), ["common", "rare", "epic", "legendary"], "common");
    return `<div class="quest rarity-card rarity-${rarity} ${done ? "done" : ""}">
      <strong><span class="quality-${rarity}">${labelFor(rarityLabel, rarity)}</span> · ${escapeHtml(quest.name)}</strong>
      <p>${escapeHtml(quest.text)}</p>
      <p>${done ? "Abgeschlossen" : `${value}/${quest.needed}`} · Belohnung: ${quest.rewardXp} XP, ${quest.rewardGold} Gold, ${questRenownReward(quest)} Ruhm</p>
    </div>`;
  }).join("");
}

function renderQuestBoard() {
  state.questBoard = uniqueQuestIds(state.questBoard)
    .filter((id) => !state.completedQuests.includes(id))
    .filter((id) => {
      const quest = getQuestById(id);
      return quest && (isQuestActive(id) || questAvailable(quest));
    });
  if (state.questBoard.length < renownQuestBoardSize()) {
    refreshQuestBoard(true);
  }
  const boardQuests = state.questBoard.map(getQuestById).filter(Boolean);
  const signature = boardQuests.map((quest) => {
    const active = isQuestActive(quest.id);
    return `${quest.id}:${active ? 1 : 0}:${Math.floor(state.quests[quest.id] || 0)}:${state.completedQuests.includes(quest.id) ? 1 : 0}`;
  }).join("|") || "empty";
  if (renderCache.questBoard === signature) return;
  renderCache.questBoard = signature;

  if (!boardQuests.length) {
    $("questBoard").innerHTML = `<div class="inventory-empty">Die Tafel ist leer. Gewonnene Kämpfe bringen bald neue Aufträge.</div>`;
    return;
  }

  $("questBoard").innerHTML = boardQuests.map((quest) => {
    const active = isQuestActive(quest.id);
    const value = Math.floor(state.quests[quest.id] || 0);
    const progress = active ? `${value}/${quest.needed}` : "Noch nicht angenommen";
    const button = active
        ? `<button type="button" disabled>Angenommen</button>`
        : `<button type="button" data-accept-quest="${quest.id}">Quest annehmen</button>`;

    const rarity = escapeToken(quest.rarity || (quest.rare ? "legendary" : "common"), ["common", "rare", "epic", "legendary"], "common");
    return `<div class="quest-offer rarity-card rarity-${rarity} ${active ? "active" : ""} ${quest.rare ? "rare" : ""}">
      <strong class="quest-offer-title"><span class="quality-${rarity}">${labelFor(rarityLabel, rarity)}</span> · ${escapeHtml(quest.name)}</strong>
      <div class="quest-offer-body">
        <p>${escapeHtml(quest.text)}</p>
        <p>Status: ${progress}</p>
      </div>
      <div class="reward-list">
        <span>Belohnung: ${quest.rewardXp} XP</span>
        <span>Gold: ${quest.rewardGold}</span>
        <span>Ruhm: ${questRenownReward(quest)}</span>
        ${quest.rewardItem ? `<span>Item: ${quest.rare ? "legendär" : "episch"}</span>` : ""}
      </div>
      <div class="quest-offer-action">${button}</div>
    </div>`;
  }).join("");

}

function acceptQuest(questId) {
  if (isQuestActive(questId) || state.completedQuests.includes(questId)) return;
  const quest = getQuestById(questId);
  if (!questAvailable(quest)) {
    log("Diese Quest passt noch nicht zu deinen freigeschalteten Gebieten.", "bad");
    render();
    return;
  }
  state.activeQuests.push(questId);
  state.quests[questId] = state.quests[questId] || 0;
  log(`Quest angenommen: ${quest.name}.`, "drop");
  save();
  render();
}

function isQuestActive(questId) {
  return Array.isArray(state.activeQuests)
    ? state.activeQuests.includes(questId)
    : Boolean(state.quests?.[questId] || state.completedQuests.includes(questId));
}

function renderBestiary() {
  const container = $("bestiary");
  if (bestiaryListDirty || !container.querySelector(".bestiary-list")) {
    bestiaryListHtml = renderBestiaryList();
    container.innerHTML = `${bestiaryListHtml}<div class="bestiary-detail" id="bestiaryDetail"></div>`;
    elementCache.delete("bestiaryDetail");
    renderCache.bestiaryDetail = "";
    bestiaryListDirty = false;
  }
  updateBestiaryActiveCard();
  renderBestiaryDetail();
}

function renderBestiaryList() {
  const zone = zones[selectedBestiaryZone] || zones.meadow;
  const entries = zone.enemies.map((id) => [id, enemies[id]]).filter(([, enemy]) => enemy);
  return `<div class="bestiary-list">
    <div class="bestiary-zone-tabs">
      ${Object.entries(zones).map(([id, zoneData]) => `<button class="${id === selectedBestiaryZone ? "active" : ""}" type="button" data-bestiary-zone="${id}">
        <strong>${escapeHtml(zoneData.name)}</strong>
        <span>${zoneData.enemies.length}</span>
      </button>`).join("")}
    </div>
    ${entries.map(([id, enemy]) => {
      const completion = lootCompletion(id);
      return `<button class="bestiary-card ${id === selectedBestiaryEnemy ? "active" : ""}" type="button" data-bestiary="${id}">
        <strong>${escapeHtml(enemy.name)}</strong>
        <p>Level ${enemy.level}${enemy.boss ? " · Boss" : enemy.elite ? " · Elite" : ""} · ${enemy.hp} Leben</p>
        <p>Loot entdeckt: ${completion.found}/${completion.total} · ${completion.percent}%</p>
        <div class="completion-bar"><span style="width:${completion.percent}%"></span></div>
      </button>`;
    }).join("")}
  </div>`;
}

function updateBestiaryActiveCard() {
  $("bestiary").querySelectorAll("[data-bestiary]").forEach((button) => {
    button.classList.toggle("active", button.dataset.bestiary === selectedBestiaryEnemy);
  });
}

function renderBestiaryDetail() {
  const detailEnemy = enemies[selectedBestiaryEnemy] || enemies.wolf;
  const discovered = groupedBestiaryLoot(selectedBestiaryEnemy);
  const detail = document.getElementById("bestiaryDetail");
  if (!detail) return;
  const signature = bestiaryDetailSignature(selectedBestiaryEnemy, detailEnemy, discovered);
  if (renderCache.bestiaryDetail === signature) return;
  renderCache.bestiaryDetail = signature;
  const categories = bestiaryCategories(selectedBestiaryEnemy, detailEnemy, discovered);
  const categoryRows = renderBestiaryCategoryRows(selectedBestiaryEnemy, detailEnemy, discovered);

  detail.innerHTML = `
    <div class="detail-head">
      <div>
        <p class="eyebrow">${escapeHtml(zoneForEnemy(selectedBestiaryEnemy))}</p>
        <h2>${escapeHtml(detailEnemy.name)}</h2>
      </div>
    </div>
    <p>Level ${detailEnemy.level}${detailEnemy.boss ? " · Boss" : detailEnemy.elite ? " · Elite" : ""} · ${detailEnemy.hp} Leben · ${detailEnemy.damage[0]}-${detailEnemy.damage[1]} Schaden · ${detailEnemy.defense} Rüstung · Crit ${formatPercent(enemyCriticalStats(detailEnemy).critChance)} / ${formatPercent(enemyCriticalStats(detailEnemy).critDamage)}</p>
    ${renderEnemyAbilities(detailEnemy)}
    <h3>Sammlung</h3>
    <div class="bestiary-category-grid">
      ${categories.map((category) => `<button class="bestiary-category ${selectedBestiaryCategory === category.id ? "active" : ""}" type="button" data-bestiary-category="${category.id}">
        <strong>${escapeHtml(category.label)}</strong>
        <span>${category.count}</span>
      </button>`).join("")}
    </div>
    ${selectedBestiaryCategory === "overview" ? "" : renderBestiaryFilters()}
    <div class="bestiary-content-grid">
      <div class="drop-list">${categoryRows}</div>
      ${renderBestiaryItemDetail(selectedBestiaryEnemy, detailEnemy, discovered)}
    </div>
    <p class="loot-note">Items werden zusammengefasst, seitenweise geladen und Details erscheinen direkt neben der Liste.</p>
  `;
}

function bestiaryDetailSignature(enemyId, enemy, discovered) {
  const discoveredSignature = discovered
    .map((item) => `${bestiaryItemKey(item)}:${item.count || 0}:${item.damage}:${item.defense}:${item.critChance || 0}:${item.critDamage || 0}:${item.set || ""}`)
    .join("|");
  return [
    enemyId,
    enemy.level,
    enemy.hp,
    enemy.damage?.join("-"),
    enemy.defense,
    enemyCriticalStats(enemy).critChance,
    enemyCriticalStats(enemy).critDamage,
    selectedBestiaryCategory,
    selectedBestiaryFilter,
    selectedBestiarySearch,
    selectedBestiaryPage,
    selectedBestiaryItemKey,
    discoveredSignature,
  ].join("~");
}

function renderEnemyAbilities(enemy) {
  const entries = enemyAbilityEntries(enemy);
  if (!entries.length) return "";
  return `<section class="enemy-ability-list" aria-label="Gegnerfähigkeiten">
    ${entries.map(([id, ability]) => `<div class="enemy-ability ${ability.type === "passive" ? "passive" : ""}" data-enemy-ability="${escapeAttr(id)}">
      <strong>${escapeHtml(ability.name)}</strong>
      <span>${ability.type === "passive" ? "Passiv" : "Aktiv"} · ${escapeHtml(ability.text)}</span>
    </div>`).join("")}
  </section>`;
}

function bestiaryCategories(enemyId, enemy, discovered = groupedBestiaryLoot(enemyId)) {
  const countGroup = (group) => discovered.filter((item) => bestiaryItemGroup(item) === group).length;
  return [
    { id: "overview", label: "Übersicht", count: discovered.length + enemy.drops.length },
    { id: "weapon", label: "Waffen", count: countGroup("weapon") },
    { id: "armor", label: "Rüstung", count: countGroup("armor") },
    { id: "jewelry", label: "Schmuck", count: countGroup("jewelry") },
    { id: "materials", label: "Materialien", count: (materialDrops[enemyId] || []).length },
    { id: "fixed", label: "Feste Drops", count: enemy.drops.length },
    { id: "sets", label: "Set-Items", count: discovered.filter((item) => item.set).length },
  ].filter((category) => category.id === "overview" || category.count > 0);
}

function renderBestiaryCategoryRows(enemyId, enemy, discovered = groupedBestiaryLoot(enemyId)) {
  if (selectedBestiaryCategory === "overview") {
    return renderBestiaryOverview(enemyId, enemy, discovered);
  }
  if (selectedBestiaryCategory === "fixed") {
    return renderFixedDropRows(enemy);
  }
  if (selectedBestiaryCategory === "materials") {
    return renderMaterialDropRows(enemyId);
  }
  return renderDiscoveredLootRows(enemyId, selectedBestiaryCategory, discovered);
}

function renderBestiaryOverview(enemyId, enemy, discovered = groupedBestiaryLoot(enemyId)) {
  return renderAllBestiaryRows(enemyId, enemy, discovered);
}

function renderAllBestiaryRows(enemyId, enemy, discovered = groupedBestiaryLoot(enemyId)) {
  const fixedRows = enemy.drops.map((drop) => {
    const item = getItem(drop.id);
    const quality = itemQuality(item);
    const slot = itemSlot(item);
    const key = `fixed:${drop.id}`;
    return `<button class="drop-row bestiary-item-row item-hover-row" type="button" data-bestiary-item="${escapeAttr(key)}" data-tooltip-key="${cacheTooltipItem(item)}">
      <span><b class="quality-${quality}">${escapeHtml(item.name)}</b><small>Fester Drop · ${labelFor(qualityLabel, quality)} · ${labelFor(slotLabel, slot)}</small></span>
      <span>${formatChance(drop.chance)}</span>
    </button>`;
  });
  const discoveredRows = discovered
    .slice()
    .sort((a, b) => bestiaryRowRank(b) - bestiaryRowRank(a) || b.count - a.count || a.name.localeCompare(b.name))
    .map((item) => {
      const quality = itemQuality(item);
      const slot = itemSlot(item);
      const key = bestiaryItemKey(item);
      return `<button class="drop-row discovered-drop bestiary-item-row item-hover-row" type="button" data-bestiary-item="${escapeAttr(key)}" data-tooltip-key="${cacheTooltipItem(item)}">
        <span><b class="quality-${quality}">${escapeHtml(item.name)}</b><small>${labelFor(qualityLabel, quality)} · ${labelFor(slotLabel, slot)}</small></span>
        <span>x${item.count}</span>
      </button>`;
    });
  const materialRows = (materialDrops[enemyId] || []).map((drop) => `<button class="drop-row bestiary-item-row material-hover-row" type="button" data-bestiary-material="${drop.id}" data-material-id="${drop.id}">
    <span><b>${labelFor(materialLabel, drop.id)}</b><small>Material fürs Schmieden</small></span>
    <span>${drop.min}-${drop.max}</span>
  </button>`);
  const rows = [...fixedRows, ...discoveredRows, ...materialRows];
  return rows.length ? rows.join("") : `<div class="drop-row"><span>Noch nichts entdeckt</span><span>-</span></div>`;
}

function renderFixedDropRows(enemy) {
  return enemy.drops.length
    ? enemy.drops.map((drop) => {
        const item = getItem(drop.id);
        const quality = itemQuality(item);
        const slot = itemSlot(item);
        const key = `fixed:${drop.id}`;
        return `<button class="drop-row bestiary-item-row item-hover-row" type="button" data-bestiary-item="${escapeAttr(key)}" data-tooltip-key="${cacheTooltipItem(item)}">
          <span><b class="quality-${quality}">${escapeHtml(item.name)}</b><small>${labelFor(qualityLabel, quality)} · ${labelFor(slotLabel, slot)}</small></span>
          <span>${formatChance(drop.chance)}</span>
        </button>`;
      }).join("")
    : `<div class="drop-row"><span>Keine festen seltenen Drops</span><span>-</span></div>`;
}

function renderMaterialDropRows(enemyId) {
  const drops = materialDrops[enemyId] || [];
  return drops.length
    ? drops.map((drop) => `<button class="drop-row bestiary-item-row material-hover-row" type="button" data-bestiary-material="${drop.id}" data-material-id="${drop.id}">
        <span><b>${labelFor(materialLabel, drop.id)}</b><small>Material fürs Schmieden</small></span>
        <span>${drop.min}-${drop.max}</span>
      </button>`).join("")
    : `<div class="drop-row"><span>Keine Materialien bekannt</span><span>-</span></div>`;
}

function lootCompletion(enemyId) {
  const enemy = enemies[enemyId];
  const discovered = groupedBestiaryLoot(enemyId).length;
  const generatedLimit = generatedLootPoolCount(enemy);
  const total = enemy.drops.length + generatedLimit;
  const fixedFound = enemy.drops.filter((drop) => state.discoveredLoot[enemyId]?.[`fixed:${drop.id}`]).length;
  const generatedFound = Math.min(generatedLimit, discovered);
  const found = Math.min(total, fixedFound + generatedFound);
  return {
    found,
    total,
    percent: Math.min(100, Math.round((found / total) * 100)),
  };
}

function renderDiscoveredLootRows(enemyId, category, discovered = groupedBestiaryLoot(enemyId)) {
  const filtered = filterBestiaryLoot(discovered.filter((item) => {
    if (category === "sets") return item.set;
    return bestiaryItemGroup(item) === category;
  }));

  if (!filtered.length) {
    return `<div class="drop-row"><span>Noch nichts entdeckt</span><span>-</span></div>`;
  }

  const sorted = filtered.sort((a, b) => bestiaryRowRank(b) - bestiaryRowRank(a) || b.count - a.count || a.name.localeCompare(b.name));
  const pageSize = 15;
  const pageCount = Math.max(1, Math.ceil(sorted.length / pageSize));
  selectedBestiaryPage = Math.min(selectedBestiaryPage, pageCount - 1);
  const start = selectedBestiaryPage * pageSize;
  const visible = sorted.slice(start, start + pageSize);
  const rows = visible
    .map((item) => {
      const quality = itemQuality(item);
      const key = bestiaryItemKey(item);
      return `<button class="drop-row discovered-drop bestiary-item-row item-hover-row ${selectedBestiaryItemKey === key ? "active" : ""}" type="button" data-bestiary-item="${escapeAttr(key)}" data-tooltip-key="${cacheTooltipItem(item)}">
        <span><b class="quality-${quality}">${escapeHtml(item.name)}</b><small>${labelFor(qualityLabel, quality)}</small></span>
        <span>${labelFor(qualityLabel, quality)} · x${item.count}</span>
      </button>`;
    })
    .join("");

  if (pageCount <= 1) return rows;

  return `${rows}
    <div class="bestiary-pagination">
      <button type="button" data-bestiary-page="prev" ${selectedBestiaryPage === 0 ? "disabled" : ""}>Zurück</button>
      <span>Seite ${selectedBestiaryPage + 1}/${pageCount}</span>
      <button type="button" data-bestiary-page="next" ${selectedBestiaryPage >= pageCount - 1 ? "disabled" : ""}>Weiter</button>
    </div>`;
}

function groupedBestiaryLoot(enemyId) {
  const cached = bestiaryLootCache.get(enemyId);
  if (cached) return cached;
  pruneBestiaryLoot(enemyId);

  const groups = Object.values(state.discoveredLoot[enemyId] || {}).reduce((result, item) => {
    if (item.fixed) return result;
    const key = bestiaryItemKey(item);
    const existing = result.get(key);
    if (!existing || itemScore(item) > itemScore(existing)) {
      result.set(key, { ...item, count: (existing?.count || 0) + (item.count || 1) });
    } else {
      existing.count = (existing.count || 0) + (item.count || 1);
    }
    return result;
  }, new Map());
  const grouped = Array.from(groups.values());
  bestiaryLootCache.set(enemyId, grouped);
  return grouped;
}

function bestiaryRowRank(item) {
  const ranks = { legendary: 4, epic: 3, rare: 2, common: 1 };
  return ranks[item.quality] || 0;
}

function bestiaryItemKey(item) {
  return item.fixed ? `fixed:${item.id}` : `${item.name}|${item.slot}|${item.quality}`;
}

function bestiaryItemGroup(item) {
  if (["weapon", "offhand"].includes(item.slot)) return "weapon";
  if (["chest", "pants", "boots"].includes(item.slot)) return "armor";
  if (["necklace", "ring"].includes(item.slot)) return "jewelry";
  return "other";
}

function filterBestiaryLoot(items) {
  const search = selectedBestiarySearch.trim().toLowerCase();
  const searched = search ? items.filter((item) => item.name.toLowerCase().includes(search)) : items;
  if (selectedBestiaryFilter === "new") return searched.filter((item) => (item.count || 0) <= 1);
  if (selectedBestiaryFilter === "sets") return searched.filter((item) => item.set);
  if (selectedBestiaryFilter === "epic") return searched.filter((item) => item.quality === "epic" || item.quality === "legendary");
  if (selectedBestiaryFilter === "incomplete") return searched.filter((item) => (item.count || 0) <= 1 || item.quality === "epic" || item.quality === "legendary" || item.set);
  return searched;
}

function renderBestiaryFilters() {
  const filters = [
    ["all", "Alle"],
    ["new", "Neu"],
    ["sets", "Set-Items"],
    ["epic", "Episch+"],
    ["incomplete", "Noch nicht vollständig"],
  ];
  return `<div class="bestiary-filters">
    <input id="bestiarySearch" type="search" value="${escapeAttr(selectedBestiarySearch)}" placeholder="Item suchen">
    ${filters.map(([id, label]) => `<button class="${selectedBestiaryFilter === id ? "active" : ""}" type="button" data-bestiary-filter="${id}">${label}</button>`).join("")}
  </div>`;
}

function escapeAttr(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function renderBestiaryItemDetail(enemyId, enemy, discovered = groupedBestiaryLoot(enemyId)) {
  if (selectedBestiaryCategory === "overview") {
    return `<aside class="bestiary-selected-detail">
      <strong>Details</strong>
      <p>Wähle eine Kategorie und klicke ein Item an.</p>
    </aside>`;
  }

  if (selectedBestiaryCategory === "materials") {
    const material = (materialDrops[enemyId] || []).find((drop) => `mat:${drop.id}` === selectedBestiaryItemKey);
    return `<aside class="bestiary-selected-detail">
      <strong>Materialien</strong>
      ${material ? `<p>${labelFor(materialLabel, material.id)}</p><p>Drop-Menge: ${material.min}-${material.max}</p><p>Wird beim Schmied für Upgrades genutzt.</p>` : "<p>Klicke ein Material für Details.</p>"}
    </aside>`;
  }

  const item = selectedBestiaryItemKey.startsWith("fixed:")
    ? getItem(selectedBestiaryItemKey.replace("fixed:", ""))
    : discovered.find((entry) => bestiaryItemKey(entry) === selectedBestiaryItemKey);

  if (!item) {
    return `<aside class="bestiary-selected-detail">
      <strong>Details</strong>
      <p>Klicke ein Item für Stats und Vergleich.</p>
    </aside>`;
  }

  return `<aside class="bestiary-selected-detail">
    ${renderItemTooltip({ ...item, fixed: selectedBestiaryItemKey.startsWith("fixed:") })}
  </aside>`;
}

function cacheTooltipItem(item) {
  const key = item.fixed ? `fixed:${item.id}` : `${item.name}|${item.slot}|${item.quality}|${item.damage}|${item.defense}|${item.critChance || 0}|${item.critDamage || 0}`;
  tooltipItemCache.set(key, item);
  return escapeAttr(key);
}

function cacheSetTooltip(setId) {
  const key = `set:${setId}`;
  tooltipItemCache.set(key, { tooltipType: "set", setId });
  return key;
}

function renderSetTooltip(setId) {
  const set = setBonuses[setId];
  if (!set) return "";
  const count = activeSetCounts()[setId]?.count || 0;
  const bonuses = Object.entries(set.bonuses)
    .map(([needed, bonus]) => `<span class="${count >= Number(needed) ? "compare-good" : "compare-even"}">${needed} Teile: ${escapeHtml(bonus.text)}</span>`)
    .join("");
  return `<div class="item-tooltip">
    <strong>${escapeHtml(set.name)} (${Math.min(count, 6)}/6)</strong>
    ${bonuses}
  </div>`;
}

function renderItemTooltip(item) {
  const quality = itemQuality(item);
  const slot = itemSlot(item);
  const current = getItem(state.equipment[slot]) || { name: "Nichts", damage: 0, defense: 0 };
  const compare = compareLoot(item, current);
  const equippedId = state.equipment[slot];
  const isEquipped = equippedId && getItem(equippedId) === item;
  const durabilityLine = isEquipped ? `<span>Haltbarkeit: ${itemDurability(equippedId)}%</span>` : "";
  const repairLine = isEquipped ? `<span>Reparatur: ${repairCostForSlot(slot)} Gold</span>` : "";
  const upgradeLine = item.upgrade ? `<span>Verbesserung: +${item.upgrade}</span>` : "";
  return `<div class="item-tooltip">
    <strong class="quality-${quality}">${escapeHtml(item.name)}</strong>
    <span>${labelFor(slotLabel, slot)} · ${labelFor(qualityLabel, quality)}</span>
    ${item.set ? `<span>Set: ${escapeHtml(setBonuses[item.set]?.name || item.set)}</span>` : ""}
    ${upgradeLine}
    <span>Schaden: ${item.damage} · Verteidigung: ${item.defense}</span>
    ${itemCritText(item) ? `<span>${itemCritText(item)}</span>` : ""}
    ${durabilityLine}
    ${repairLine}
    <span>Aktuell: ${escapeHtml(current.name)}</span>
    <span class="${compare.powerClass}">${compare.powerText}</span>
    <span class="${compare.damageClass}">${compare.damageText}</span>
    <span class="${compare.defenseClass}">${compare.defenseText}</span>
  </div>`;
}

function renderMaterialTooltip(materialId) {
  const drop = (materialDrops[selectedBestiaryEnemy] || []).find((entry) => entry.id === materialId);
  return `<div class="item-tooltip">
    <strong>${labelFor(materialLabel, materialId, materialId)}</strong>
    <span>Material fürs Schmieden</span>
    ${drop ? `<span>Drop-Menge: ${drop.min}-${drop.max}</span>` : ""}
    <span>Wird für Upgrades und Ausrüstung genutzt.</span>
  </div>`;
}

function showFloatingTooltip(row) {
  const materialId = row.dataset.materialId;
  if (materialId) {
    const tooltip = $("floatingTooltip");
    tooltip.innerHTML = renderMaterialTooltip(materialId);
    tooltip.classList.add("open");
    tooltip.setAttribute("aria-hidden", "false");
    return;
  }
  const key = row.dataset.tooltipKey || row.querySelector("[data-tooltip-key]")?.dataset.tooltipKey || row.querySelector("[data-set-tooltip-key]")?.dataset.setTooltipKey;
  const item = tooltipItemCache.get(key);
  if (!item) return;
  const tooltip = $("floatingTooltip");
  tooltip.innerHTML = item.tooltipType === "set" ? renderSetTooltip(item.setId) : renderItemTooltip(item);
  tooltip.classList.add("open");
  tooltip.setAttribute("aria-hidden", "false");
}

function positionFloatingTooltip(event) {
  const tooltip = $("floatingTooltip");
  if (!tooltip.classList.contains("open")) return;

  pendingTooltipEvent = event;
  if (tooltipFrame) return;
  tooltipFrame = requestAnimationFrame(() => {
    tooltipFrame = 0;
    applyTooltipPosition(pendingTooltipEvent);
  });
}

let tooltipFrame = 0;
let pendingTooltipEvent = null;

function applyTooltipPosition(event) {
  const tooltip = $("floatingTooltip");
  if (!event || !tooltip.classList.contains("open")) return;

  const margin = 16;
  const offset = 18;
  const rect = tooltip.getBoundingClientRect();
  let left = event.clientX + offset;
  let top = event.clientY + offset;

  if (left + rect.width + margin > window.innerWidth) {
    left = event.clientX - rect.width - offset;
  }
  if (top + rect.height + margin > window.innerHeight) {
    top = event.clientY - rect.height - offset;
  }

  tooltip.style.left = `${Math.max(margin, left)}px`;
  tooltip.style.top = `${Math.max(margin, top)}px`;
}

function hideFloatingTooltip() {
  const tooltip = $("floatingTooltip");
  if (tooltipFrame) {
    cancelAnimationFrame(tooltipFrame);
    tooltipFrame = 0;
  }
  tooltip.classList.remove("open");
  tooltip.setAttribute("aria-hidden", "true");
}

function zoneKeyForEnemy(enemyId) {
  return Object.entries(zones).find(([, zone]) => zone.enemies.includes(enemyId))?.[0] || "meadow";
}

function zoneForEnemy(enemyId) {
  return zones[zoneKeyForEnemy(enemyId)].name;
}

function formatChance(chance) {
  return `${(chance * 100).toFixed(chance < 0.02 ? 1 : 0)}%`;
}

function renderLog() {
  const signature = state.log.slice(0, 18).join("\n") || "empty";
  if (renderCache.log === signature) return;
  renderCache.log = signature;
  setText("logPreview", state.log[0] || "Noch keine Einträge.");
  $("log").innerHTML = state.log.slice(0, 18).map((entry, index) => {
    const type = entry.includes("Tod") ? "bad" : entry.includes("Seltener") || entry.includes("Quest") || entry.includes("ausgerüstet") ? "drop" : index === 0 ? "good" : "";
    return `<div class="${type}">${escapeHtml(entry)}</div>`;
  }).join("") || `<div>Noch keine Einträge.</div>`;
}

function renderRepairModal() {
  const total = repairCost();
  $("repairSummary").innerHTML = `
    <div>
      <strong>${total} Gold</strong>
      <p>Aktuelles Gold: ${state.gold}</p>
    </div>
    <button type="button" data-repair-all ${total === 0 || state.gold < total ? "disabled" : ""}>Alles reparieren</button>
  `;
  $("repairList").innerHTML = equipmentSlots.map((slot) => {
    const itemId = state.equipment[slot];
    const item = getItem(itemId);
    if (!item) {
      return `<div class="repair-row empty-slot">
        <div>
          <strong>${labelFor(slotLabel, slot)}</strong>
          <p>Leer</p>
        </div>
        <button type="button" disabled>Keine Ausrüstung</button>
      </div>`;
    }
    const durability = itemDurability(itemId);
    const cost = repairCostForSlot(slot);
    const disabled = cost === 0 || state.gold < cost ? "disabled" : "";
    const label = cost === 0 ? "Vollständig" : `${cost} Gold`;
    const quality = itemQuality(item);
    return `<div class="repair-row rarity-card rarity-${quality}">
      <div>
        <strong class="quality-${quality}">${labelFor(slotLabel, slot)} · ${escapeHtml(item.name)}</strong>
        <p>${labelFor(qualityLabel, quality)} · Haltbarkeit: ${durability}% · Reparatur: ${cost} Gold</p>
      </div>
      <button type="button" data-repair-slot="${slot}" ${disabled}>${label}</button>
    </div>`;
  }).join("");
}

