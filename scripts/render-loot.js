function renderLootChoices() {
  const modal = $("lootModal");
  if (!state.pendingLoot.length) {
    closeLootModal(modal);
    return;
  }

  openLootModal(modal);
  updateLootHeader();

  const signature = lootChoicesSignature();
  if (renderCache.lootChoices === signature) return;
  renderCache.lootChoices = signature;
  $("lootChoices").innerHTML = state.pendingLoot.map(renderLootCard).join("");
}

function closeLootModal(modal) {
  if (renderCache.lootChoices === "empty") return;
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
  $("lootChoices").innerHTML = "";
  renderCache.lootChoices = "empty";
}

function openLootModal(modal) {
  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
}

function updateLootHeader() {
  const isQuestReward = state.pendingLoot.every((item) => item.sourceType === "quest");
  setText("lootTitle", isQuestReward ? "Questbelohnung" : "Wähle ein Item");
  setText("lootCounter", isQuestReward ? "Belohnung" : `1 von ${state.pendingLoot.length}`);
}

function renderLootCard(item, index) {
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
    ${renderLootStatGrid(item)}
    <p class="loot-card-value">Haltbarkeit: ${item.durability ?? 100}%</p>
    <p class="loot-card-value">Wert: ${sellValue(item)} Gold</p>
    ${renderLootCompare(compare)}
    <div class="loot-actions">
      <button type="button" data-loot="${index}">Ins Inventar</button>
      <button type="button" data-equip-loot="${index}">Ausrüsten</button>
    </div>
  </div>`;
}

function renderLootStatGrid(item) {
  return `<div class="loot-stat-grid" aria-label="Itemwerte">
    <span><em>Angriff</em><strong>${item.damage}</strong></span>
    <span><em>Verteidigung</em><strong>${item.defense}</strong></span>
    <span><em>Crit-Chance</em><strong>${formatPercent(item.critChance || 0)}</strong></span>
    <span><em>Crit-Schaden</em><strong>${formatPercent(item.critDamage || 0)}</strong></span>
  </div>`;
}

function renderLootCompare(compare) {
  return `<div class="loot-compare">
    <span class="${compare.damageClass}">${compare.damageText}</span>
    <span class="${compare.defenseClass}">${compare.defenseText}</span>
    <span class="${compare.critChanceClass}">${compare.critChanceText}</span>
    <span class="${compare.critDamageClass}">${compare.critDamageText}</span>
  </div>`;
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
    damageText: compareText("Angriff", damageDiff, ""),
    damageClass: compareClass(damageDiff),
    defenseText: compareText("Verteidigung", defenseDiff, ""),
    defenseClass: compareClass(defenseDiff),
    critChanceText: comparePercentText("Crit-Chance", critChanceDiff),
    critChanceClass: compareClass(critChanceDiff),
    critDamageText: comparePercentText("Crit-Schaden", critDamageDiff),
    critDamageClass: compareClass(critDamageDiff),
  };
}

function compareText(label, diff, suffix) {
  if (diff > 0) return `${label}: besser (+${diff.toFixed(diff % 1 ? 1 : 0)}${suffix})`;
  if (diff < 0) return `${label}: schlechter (${diff.toFixed(diff % 1 ? 1 : 0)}${suffix})`;
  return `${label}: gleich`;
}

function comparePercentText(label, diff) {
  if (diff > 0) return `${label}: besser (+${formatPercent(diff)})`;
  if (diff < 0) return `${label}: schlechter (${formatPercent(diff)})`;
  return `${label}: gleich`;
}

function compareClass(diff) {
  if (diff > 0) return "compare-good";
  if (diff < 0) return "compare-bad";
  return "compare-even";
}
