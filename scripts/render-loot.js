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
  setText("lootTitle", isQuestReward ? t("loot.questReward", "Questbelohnung") : t("loot.title", "Wähle ein Item"));
  setText("lootCounter", isQuestReward ? t("loot.reward", "Belohnung") : t("loot.pickCount", "{current} von {total}", { current: 1, total: state.pendingLoot.length }));
}

function renderLootCard(item, index) {
  if (!item) return "";
  const quality = itemQuality(item);
  const slot = itemSlot(item);
  const current = getItem(state.equipment[slot]);
  const compare = compareLoot(item, current);
  const discovery = lootDiscoveryStatus(item);

  return `<div class="loot-card rarity-card rarity-${quality} ${itemUpgradeFrameClass(item)}">
    <div class="loot-card-head">
      <strong class="loot-card-title quality-${quality}">${escapeHtml(itemDisplayName(item, item.id))}</strong>
      <div class="loot-card-badge">${discovery ? `<span class="discovery-badge ${discovery.className}">${discovery.text}</span>` : ""}</div>
      <p class="loot-card-meta">${labelFor(slotLabel, slot)} · ${labelFor(qualityLabel, quality)}</p>
      <p class="loot-card-set ${item.set ? "set-line" : "empty"}">${item.set ? escapeHtml(setDisplayName(item.set)) : "&nbsp;"}</p>
    </div>
    <div class="loot-card-special">
      ${item.effect ? `<p class="loot-card-effect">${escapeHtml(itemEffectName(item))}: ${escapeHtml(itemEffectText(item))}</p>` : ""}
      ${renderItemEnchantmentLine(item)}
    </div>
    <div class="loot-card-stats">${renderLootStatGrid(item)}</div>
    <div class="loot-card-values">
      <p class="loot-card-value">${t("main.durability", "Haltbarkeit")}: ${item.durability ?? 100}%</p>
      <p class="loot-card-value">${t("common.value", "Wert")}: ${sellValue(item)} ${t("common.gold", "Gold")}</p>
    </div>
    ${renderLootCompare(compare)}
    <div class="loot-actions">
      <button type="button" data-loot="${index}">${t("loot.toInventory", "Ins Inventar")}</button>
      <button type="button" data-equip-loot="${index}">${t("loot.equip", "Ausrüsten")}</button>
    </div>
  </div>`;
}

function renderLootStatGrid(item) {
  const stats = itemStatEntries(item, {
    damage: t("stat.damage", "Angriff"),
    defense: t("stat.defense", "Verteidigung"),
    critChance: t("stat.critChance", "Crit-Chance"),
    critDamage: t("stat.critDamage", "Crit-Schaden"),
  });
  const content = stats.length
    ? stats.map((stat) => `<span><em>${stat.label}</em><strong>${stat.value}</strong></span>`).join("")
    : `<span><em>${t("loot.stats", "Werte")}</em><strong>${t("loot.noStats", "Keine")}</strong></span>`;
  return `<div class="loot-stat-grid" aria-label="Itemwerte">${content}</div>`;
}

function renderLootCompare(compare) {
  return `<div class="loot-compare">${renderCompareSpans(compare)}</div>`;
}

function renderCompareSpans(compare, limit = 0) {
  const entries = limit ? compare.entries.slice(0, limit) : compare.entries;
  return entries.map((entry) => `<span class="${entry.className}">${entry.text}</span>`).join("");
}

function lootChoicesSignature() {
  return `${currentLanguage()}|${state.pendingLoot.map((item) => {
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
      item.effect || "",
      (item.enchantments || []).join(","),
      item.durability ?? 100,
      item.set || "",
      item.sourceType || "",
      item.discoveryNew ? 1 : 0,
    ].join(":");
  }).join("|")}`;
}

function lootDiscoveryStatus(item) {
  if (item.sourceType === "quest") return { text: t("loot.questReward", "Questbelohnung"), className: "quest" };
  if (!item.sourceEnemy) return null;
  if (item.discoveryNew === true) return { text: t("loot.discoveryNew", "Neu"), className: "new" };
  return { text: t("loot.discoveryKnown", "Bekannt"), className: "known" };
}

function compareLoot(item, current) {
  current = current || { damage: 0, defense: 0 };
  const powerDiff = itemScore(item) - itemScore(current);
  const damageDiff = item.damage - current.damage;
  const defenseDiff = item.defense - current.defense;
  const critChanceDiff = (item.critChance || 0) - (current.critChance || 0);
  const critDamageDiff = (item.critDamage || 0) - (current.critDamage || 0);
  const entries = [
    compareEntry(t("stat.damage", "Angriff"), damageDiff, ""),
    compareEntry(t("stat.defense", "Verteidigung"), defenseDiff, ""),
    comparePercentEntry(t("stat.critChance", "Crit-Chance"), critChanceDiff),
    comparePercentEntry(t("stat.critDamage", "Crit-Schaden"), critDamageDiff),
  ].filter((entry) => entry.diff !== 0);
  if (!entries.length) {
    entries.push({ text: t("loot.noStatChange", "Keine Stat-Änderung"), className: "compare-even", diff: 0 });
  }

  return {
    powerText: compareText(t("main.total", "Gesamt"), powerDiff, " Kraft"),
    powerClass: compareClass(powerDiff),
    damageText: compareText(t("stat.damage", "Angriff"), damageDiff, ""),
    damageClass: compareClass(damageDiff),
    defenseText: compareText(t("stat.defense", "Verteidigung"), defenseDiff, ""),
    defenseClass: compareClass(defenseDiff),
    critChanceText: comparePercentText(t("stat.critChance", "Crit-Chance"), critChanceDiff),
    critChanceClass: compareClass(critChanceDiff),
    critDamageText: comparePercentText(t("stat.critDamage", "Crit-Schaden"), critDamageDiff),
    critDamageClass: compareClass(critDamageDiff),
    entries,
  };
}

function compareEntry(label, diff, suffix) {
  return {
    text: compareText(label, diff, suffix),
    className: compareClass(diff),
    diff,
  };
}

function comparePercentEntry(label, diff) {
  return {
    text: comparePercentText(label, diff),
    className: compareClass(diff),
    diff,
  };
}

function compareText(label, diff, suffix) {
  if (diff > 0) return `${label}: ${t("compare.better", "besser")} (+${diff.toFixed(diff % 1 ? 1 : 0)}${suffix})`;
  if (diff < 0) return `${label}: ${t("compare.worse", "schlechter")} (${diff.toFixed(diff % 1 ? 1 : 0)}${suffix})`;
  return `${label}: ${t("compare.equal", "gleich")}`;
}

function comparePercentText(label, diff) {
  if (diff > 0) return `${label}: ${t("compare.better", "besser")} (+${formatPercent(diff)})`;
  if (diff < 0) return `${label}: ${t("compare.worse", "schlechter")} (${formatPercent(diff)})`;
  return `${label}: ${t("compare.equal", "gleich")}`;
}

function compareClass(diff) {
  if (diff > 0) return "compare-good";
  if (diff < 0) return "compare-bad";
  return "compare-even";
}
