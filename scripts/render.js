function render() {
  syncDerivedStats();
  const stats = totalStats();
  $("level").textContent = state.level;
  $("gold").textContent = state.gold;
  $("renown").textContent = state.renown;
  $("hpText").textContent = `${state.hp}/${state.maxHp}`;
  $("hpBar").style.width = `${Math.max(2, (state.hp / state.maxHp) * 100)}%`;
  const needed = state.level >= 20 ? 1 : xpForLevel(state.level);
  $("xpText").textContent = state.level >= 20 ? "Max" : `${state.xp}/${needed}`;
  $("xpBar").style.width = `${state.level >= 20 ? 100 : Math.max(2, (state.xp / needed) * 100)}%`;
  renderHeroBuildVisual();
  renderClassPanel();
  $("stats").innerHTML = [
    ["Schaden", stats.damage],
    ["Verteidigung", stats.defense],
    ["Haltbarkeit", `${equippedDurabilityAverage()}%`],
  ].map(([label, value]) => `<div class="stat"><span>${label}</span><strong>${value}</strong></div>`).join("");
  const currentRestCost = restCost();
  $("restBtn").innerHTML = `<span class="button-main">Rasten</span><span class="button-price">${currentRestCost} Gold</span>`;
  $("restBtn").disabled = state.gold < currentRestCost;

  renderMap();
  renderEnemies();
  renderEquipment();
  renderLootChoices();
  renderQuests();
  if (isModalOpen("inventoryModal")) renderInventory();
  if (isModalOpen("questBoardModal")) renderQuestBoard();
  if (isModalOpen("smithModal")) renderSmith();
  if (isModalOpen("repairModal")) renderRepairModal();
  if (isModalOpen("equipmentModal")) renderEquipmentDetails();
  renderSelectedEnemy();
  renderLog();
  $("fightBtn").textContent = isFighting ? (skipCombat ? "Überspringe..." : "Skip") : "Kampf starten";
  $("fightBtn").disabled = isFighting ? skipCombat : state.pendingLoot.length > 0;
}

function renderHeroBuildVisual() {
  const build = ["tank", "damage", "bruiser"].includes(state.build) ? state.build : "bruiser";
  $("heroSprite").className = `combatant hero-sprite hero-build-${build}`;
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
  $("activeZoneName").textContent = zoneData.name;
  $("activeZoneRange").textContent = `${zoneKindLabel(zoneData)} · ${zoneData.range || "Unbekannt"}`;
  document.querySelectorAll("[data-zone]").forEach((button) => {
    button.classList.toggle("active", button.dataset.zone === selectedZone);
    button.disabled = !isZoneUnlocked(button.dataset.zone);
  });
  renderZoneOptions();
}

function renderClassPanel() {
  $("className").textContent = activeClass().name;
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

function renderEnemies() {
  $("enemyList").innerHTML = zones[selectedZone].enemies.map((id) => {
    const enemy = getPreparedEncounter(id);
    const risk = riskFor(enemy);
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

function renderSelectedEnemy() {
  const enemy = getPreparedEncounter(selectedEnemy);
  $("selectedEnemyName").textContent = enemy.name;
  const eliteNote = enemy.eliteVariant
    ? "Bereit: Elite-Version."
    : enemy.boss
      ? "Dungeon-Boss mit besseren Belohnungen."
    : enemy.elite
      ? "Elite-Gegner."
      : `Nach jedem Kampf ${Math.round(eliteEncounterChance * 100)}% Chance auf Elite-Version.`;
  const abilityCount = enemyAbilityEntries(enemy).length;
  $("selectedEnemyMeta").textContent = `Level ${enemy.level}, ${enemy.hp} Leben, ${abilityCount} Fähigkeiten, Drop-Chancen niedrig, Risiko: ${riskFor(enemy)}. ${eliteNote}`;
  setBattleEnemyVisual(enemy);
  $("battleText").textContent = `${enemy.name} wartet.`;
}

function setBattleEnemyVisual(enemy) {
  $("enemySpriteName").textContent = enemy.name;
  $("enemySprite").className = `combatant enemy-sprite ${enemy.sprite}${enemy.eliteVariant ? " elite-variant" : ""}`;
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

function renderEquipment() {
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
  if ($("smithHome").dataset.rendered === "true") return;
  $("smithHome").innerHTML = `
    <div class="smith-greeting">
      <div class="smith-avatar" aria-hidden="true"></div>
      <div>
        <strong>Der Schmied hebt den Hammer.</strong>
        <p>"Bring mir Beute, Eisen und Splitter. Ich mache daraus etwas, das dich am Leben hält."</p>
      </div>
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
        <p>+${item.upgrade || 0}/4 · Dmg ${item.damage} · Def ${item.defense} · Haltbarkeit ${itemDurability(itemId)}%</p>
      </div>
      <button class="upgrade-preview" type="button" data-upgrade="${slot}" ${disabled ? "disabled" : ""}>
        <span>${maxed ? "Maximal" : "Nach Upgrade"}</span>
        <strong>+${preview.upgrade}/4 · Dmg ${preview.damage}${damageGain ? ` <b>+${damageGain}</b>` : ""} · Def ${preview.defense}${defenseGain ? ` <b>+${defenseGain}</b>` : ""}</strong>
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
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
    $("lootChoices").innerHTML = "";
    return;
  }

  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
  const isQuestReward = state.pendingLoot.every((item) => item.sourceType === "quest");
  $("lootTitle").textContent = isQuestReward ? "Questbelohnung" : "Wähle ein Item";
  $("lootCounter").textContent = isQuestReward ? "Belohnung" : `1 von ${state.pendingLoot.length}`;
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

  return {
    powerText: compareText("Gesamt", powerDiff, " Kraft"),
    powerClass: compareClass(powerDiff),
    damageText: compareText("Schaden", damageDiff, ""),
    damageClass: compareClass(damageDiff),
    defenseText: compareText("Verteidigung", defenseDiff, ""),
    defenseClass: compareClass(defenseDiff),
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
  const categories = bestiaryCategories(selectedBestiaryEnemy, detailEnemy, discovered);
  const categoryRows = renderBestiaryCategoryRows(selectedBestiaryEnemy, detailEnemy, discovered);

  const detail = document.getElementById("bestiaryDetail");
  if (!detail) return;

  detail.innerHTML = `
    <div class="detail-head">
      <div>
        <p class="eyebrow">${escapeHtml(zoneForEnemy(selectedBestiaryEnemy))}</p>
        <h2>${escapeHtml(detailEnemy.name)}</h2>
      </div>
    </div>
    <p>Level ${detailEnemy.level}${detailEnemy.boss ? " · Boss" : detailEnemy.elite ? " · Elite" : ""} · ${detailEnemy.hp} Leben · ${detailEnemy.damage[0]}-${detailEnemy.damage[1]} Schaden · ${detailEnemy.defense} Rüstung</p>
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
  const key = item.fixed ? `fixed:${item.id}` : `${item.name}|${item.slot}|${item.quality}|${item.damage}|${item.defense}`;
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
  $("logPreview").textContent = state.log[0] || "Noch keine Einträge.";
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

