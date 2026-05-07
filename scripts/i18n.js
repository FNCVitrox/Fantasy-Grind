const languageStorageKey = "fantasy-grind-language";
const supportedLanguages = ["de", "en"];

const translations = {
    de: {
        "app.title": "Fantasy Grind",
        "nav.camp": "Lagerplatz",
        "nav.bestiary": "Bestiarium",
        "nav.quests": "Quest-Tafel",
        "nav.achievements": "Erfolge",
        "nav.inventory": "Rucksack",
        "nav.smith": "Schmied",
        "nav.enchant": "Arkanistin",
        "nav.save": "Spielstand",
        "nav.language": "Sprache",
        "language.value": "DE",
        "language.aria": "Sprache wechseln",
        "common.close": "Schließen",
        "common.back": "Zurück",
        "common.open": "Öffnen",
        "common.active": "Aktiv",
        "common.empty": "Leer",
        "common.none": "keine",
        "common.new": "Neu",
        "common.known": "Bekannt",
        "common.locked": "Gesperrt",
        "common.max": "Max",
        "common.level": "Level",
        "common.gold": "Gold",
        "common.renown": "Ruhm",
        "common.xp": "XP",
        "common.zone": "Gebiet",
        "common.dungeon": "Dungeon",
        "common.items": "Items",
        "common.item": "Item",
        "common.enemy": "Gegner",
        "common.boss": "Boss",
        "common.elite": "Elite",
        "common.free": "kostenlos",
        "common.value": "Wert",
        "common.reward": "Belohnung",
        "common.status": "Status",
        "common.chance": "Chance",
        "common.progress": "Fortschritt",
        "common.download": "herunterladen",
        "common.load": "laden",
        "main.equipment": "Ausrüstung",
        "main.belt": "Gürtel",
        "main.build": "Build",
        "main.abilities": "Fähigkeiten",
        "main.target": "Ziel",
        "main.life": "Leben",
        "main.damage": "Schaden",
        "main.defense": "Verteidigung",
        "main.durability": "Haltbarkeit",
        "combat.start": "Kampf starten",
        "combat.skip": "Skip",
        "combat.skipping": "Überspringe...",
        "combat.skippingBattle": "Kampf wird übersprungen...",
        "combat.waits": "wartet.",
        "combat.victory": "Sieg",
        "combat.defeat": "Niederlage",
        "combat.you": "Du",
        "combat.enemy": "Gegner",
        "combat.attack": "trifft",
        "combat.victoryAgainst": "Sieg gegen {enemy} nach {rounds} Runden.",
        "combat.defeatAgainst": "Niederlage gegen {enemy} nach {rounds} Runden.",
        "combat.resultWin": "Sieg!",
        "combat.resultLose": "Niederlage",
        "combat.log": "Kampf-Log",
        "combat.lastFight": "Letzter Kampf",
        "combat.logEmpty": "Noch leer",
        "risk.easy": "Einfach",
        "risk.machbar": "Machbar",
        "risk.risky": "Riskant",
        "risk.deadly": "Tödlich",
        "stat.damage": "Angriff",
        "stat.defense": "Verteidigung",
        "stat.maxHp": "Leben",
        "stat.health": "Leben",
        "stat.durability": "Haltbarkeit",
        "stat.critChance": "Crit-Chance",
        "stat.critDamage": "Crit-Schaden",
        "stat.attackSpeed": "Tempo",
        "stat.bossDamage": "Boss-Schaden",
        "compare.better": "besser",
        "compare.worse": "schlechter",
        "compare.equal": "gleich",
        "loot.eyebrow": "Beute erhalten",
        "loot.title": "Wähle ein Item",
        "loot.pickCount": "{current} von {total}",
        "loot.toInventory": "Ins Inventar",
        "loot.equip": "Ausrüsten",
        "loot.discoveryNew": "Neu",
        "loot.discoveryKnown": "Bekannt",
        "inventory.title": "Rucksack",
        "inventory.empty": "Dein Rucksack ist leer.",
        "inventory.equip": "Ausrüsten",
        "inventory.sell": "Verkaufen",
        "equipment.empty": "Kein Item ausgerüstet.",
        "equipment.repairCost": "{cost} Gold",
        "equipment.upgradeLevel": "Stufe +{level}/{limit}",
        "quality.common": "Gewöhnlich",
        "quality.rare": "Selten",
        "quality.epic": "Episch",
        "quality.legendary": "Legendär",
        "rarity.common": "Gewöhnlich",
        "rarity.rare": "Selten",
        "rarity.epic": "Episch",
        "rarity.legendary": "Legendär",
        "slot.weapon": "Waffe",
        "slot.offhand": "2. Hand",
        "slot.chest": "Brustpanzer",
        "slot.pants": "Hose",
        "slot.boots": "Stiefel",
        "slot.necklace": "Halskette",
        "slot.ring": "Ring",
        "material.scrap": "Eisenstücke",
        "material.leather": "Lederreste",
        "material.cloth": "Stofffetzen",
        "material.chain": "Kettenglieder",
        "material.sinew": "Bestiensehnen",
        "material.rune": "Runensplitter",
        "material.moonDust": "Mondstaub",
        "material.oathSteel": "Eidstahl",
        "material.bone": "Knochenstücke",
        "material.shadowResin": "Schattenharz",
        "material.emberCore": "Glutkern",
        "material.packFang": "Rudelfang",
        "material.oathmark": "Eidmarke",
        "material.graveSigil": "Grabessiegel",
        "material.crownAsh": "Kronenasche",
        "class.warrior.name": "Krieger",
        "build.tank.name": "Tank",
        "build.tank.text": "Mehr Leben und Verteidigung. Schildwall ist stärker.",
        "build.damage.name": "Schaden",
        "build.damage.text": "Mehr Schaden, aber etwas weniger Leben.",
        "build.bruiser.name": "Bruiser",
        "build.bruiser.text": "Ausgewogen. Kampfrausch heilt stärker.",
        "ability.heavyStrike.name": "Schwerer Hieb",
        "ability.heavyStrike.text": "Jede 3. Runde ein stärkerer Angriff.",
        "ability.shieldWall.name": "Schildwall",
        "ability.shieldWall.text": "Jede 4. Runde wird der Gegnertreffer reduziert.",
        "ability.battleFrenzy.name": "Kampfrausch",
        "ability.battleFrenzy.text": "Einmal unter 45% Leben: heilt 18% Leben.",
        "ability.crushingBlow.name": "Zerschmettern",
        "ability.crushingBlow.text": "Jede 3. Runde: 130% Schaden und ein Teil der Rüstung wird ignoriert.",
        "ability.counterStrike.name": "Konterschlag",
        "ability.counterStrike.text": "Nach hartem Treffer: Konter mit 50% Schaden, höchstens alle 3 Runden.",
        "zone.normalZones": "Gebiete",
        "zone.dungeons": "Dungeons",
        "zone.switch": "Wechseln",
        "zone.unlock": "Freischalten",
        "zone.meadow.name": "Grauwacht-Wald",
        "zone.road.name": "Banditenstraße",
        "zone.fields.name": "Verfluchte Felder",
        "zone.ashgrounds.name": "Aschegrund",
        "zone.ratcellar.name": "Rattenkeller",
        "zone.ironhold.name": "Eisenfeste",
        "zone.ashcathedral.name": "Aschekathedrale",
        "zone.levelRange": "Level {min}-{max}",
        "quest.title": "Quest-Tafel",
        "quest.active": "Aktive Quests",
        "quest.none": "Keine aktive Quest. Öffne die Quest-Tafel.",
        "quest.accept": "Quest annehmen",
        "quest.accepted": "Angenommen",
        "quest.notAccepted": "Noch nicht angenommen",
        "quest.completed": "Abgeschlossen",
        "quest.newAvailable": "Neue Quest verfügbar",
        "save.title": "Spielstand",
        "save.download": "Spielstand herunterladen",
        "save.load": "Spielstand laden",
        "save.downloadText": "Speichert deinen Fortschritt als JSON-Datei.",
        "save.loadText": "Lädt eine zuvor heruntergeladene JSON-Datei.",
        "save.last": "Letzte Sicherung",
        "save.notDownloaded": "Noch nicht heruntergeladen",
        "save.fileName": "Dateiname",
        "save.storageStatus": "Speicherstatus",
        "save.browserActive": "Browser-Speicher aktiv",
        "save.loaded": "Geladen",
        "save.newAfterError": "Neuer Spielstand nach Ladefehler",
        "save.help": "Für sicheren Fortschritt regelmäßig herunterladen. Browser-Speicher kann bei Preview-Links oder gelöschten Website-Daten verloren gehen.",
        "achievements.title": "Erfolge",
        "achievements.progress": "{unlocked}/{total} freigeschaltet",
        "bestiary.title": "Bestiarium",
        "bestiary.collection": "Sammlung {found}/{total}",
        "smith.title": "Borin Glutbart",
        "smith.eyebrow": "Zwergenmeister der Grauwacht",
        "smith.upgrade": "Verbessern",
        "smith.salvage": "Zerlegen",
        "smith.repair": "Reparieren",
        "enchant.title": "Mira Nachtfaden",
        "enchant.eyebrow": "Arkanistin der Grauwacht",
        "enchant.action": "Verzaubern",
        "log.start": "Du erreichst das Lager Grauwacht. Der Grind beginnt langsam."
    },
    en: {
        "app.title": "Fantasy Grind",
        "nav.camp": "Camp",
        "nav.bestiary": "Bestiary",
        "nav.quests": "Quest Board",
        "nav.achievements": "Achievements",
        "nav.inventory": "Backpack",
        "nav.smith": "Smith",
        "nav.enchant": "Arcanist",
        "nav.save": "Save",
        "nav.language": "Language",
        "language.value": "EN",
        "language.aria": "Switch language",
        "common.close": "Close",
        "common.back": "Back",
        "common.open": "Open",
        "common.active": "Active",
        "common.empty": "Empty",
        "common.none": "none",
        "common.new": "New",
        "common.known": "Known",
        "common.locked": "Locked",
        "common.max": "Max",
        "common.level": "Level",
        "common.gold": "Gold",
        "common.renown": "Renown",
        "common.xp": "XP",
        "common.zone": "Zone",
        "common.dungeon": "Dungeon",
        "common.items": "Items",
        "common.item": "Item",
        "common.enemy": "Enemy",
        "common.boss": "Boss",
        "common.elite": "Elite",
        "common.free": "free",
        "common.value": "Value",
        "common.reward": "Reward",
        "common.status": "Status",
        "common.chance": "Chance",
        "common.progress": "Progress",
        "common.download": "download",
        "common.load": "load",
        "main.equipment": "Equipment",
        "main.belt": "Belt",
        "main.build": "Build",
        "main.abilities": "Abilities",
        "main.target": "Target",
        "main.life": "Health",
        "main.damage": "Damage",
        "main.defense": "Defense",
        "main.durability": "Durability",
        "combat.start": "Start fight",
        "combat.skip": "Skip",
        "combat.skipping": "Skipping...",
        "combat.skippingBattle": "Skipping fight...",
        "combat.waits": "waits.",
        "combat.victory": "Victory",
        "combat.defeat": "Defeat",
        "combat.you": "You",
        "combat.enemy": "Enemy",
        "combat.attack": "hits",
        "combat.victoryAgainst": "Victory against {enemy} after {rounds} rounds.",
        "combat.defeatAgainst": "Defeat against {enemy} after {rounds} rounds.",
        "combat.resultWin": "Victory!",
        "combat.resultLose": "Defeat",
        "combat.log": "Combat Log",
        "combat.lastFight": "Last Fight",
        "combat.logEmpty": "Still empty",
        "risk.easy": "Easy",
        "risk.machbar": "Doable",
        "risk.risky": "Risky",
        "risk.deadly": "Deadly",
        "stat.damage": "Attack",
        "stat.defense": "Defense",
        "stat.maxHp": "Health",
        "stat.health": "Health",
        "stat.durability": "Durability",
        "stat.critChance": "Crit Chance",
        "stat.critDamage": "Crit Damage",
        "stat.attackSpeed": "Speed",
        "stat.bossDamage": "Boss Damage",
        "compare.better": "better",
        "compare.worse": "worse",
        "compare.equal": "same",
        "loot.eyebrow": "Loot gained",
        "loot.title": "Choose an item",
        "loot.pickCount": "{current} of {total}",
        "loot.toInventory": "To Backpack",
        "loot.equip": "Equip",
        "loot.discoveryNew": "New",
        "loot.discoveryKnown": "Known",
        "inventory.title": "Backpack",
        "inventory.empty": "Your backpack is empty.",
        "inventory.equip": "Equip",
        "inventory.sell": "Sell",
        "equipment.empty": "No item equipped.",
        "equipment.repairCost": "{cost} Gold",
        "equipment.upgradeLevel": "Level +{level}/{limit}",
        "quality.common": "Common",
        "quality.rare": "Rare",
        "quality.epic": "Epic",
        "quality.legendary": "Legendary",
        "rarity.common": "Common",
        "rarity.rare": "Rare",
        "rarity.epic": "Epic",
        "rarity.legendary": "Legendary",
        "slot.weapon": "Weapon",
        "slot.offhand": "Off Hand",
        "slot.chest": "Chest",
        "slot.pants": "Pants",
        "slot.boots": "Boots",
        "slot.necklace": "Necklace",
        "slot.ring": "Ring",
        "material.scrap": "Iron pieces",
        "material.leather": "Leather scraps",
        "material.cloth": "Cloth scraps",
        "material.chain": "Chain links",
        "material.sinew": "Beast sinew",
        "material.rune": "Rune shards",
        "material.moonDust": "Moon dust",
        "material.oathSteel": "Oathsteel",
        "material.bone": "Bone pieces",
        "material.shadowResin": "Shadow resin",
        "material.emberCore": "Ember core",
        "material.packFang": "Pack fang",
        "material.oathmark": "Oathmark",
        "material.graveSigil": "Grave sigil",
        "material.crownAsh": "Crown ash",
        "class.warrior.name": "Warrior",
        "build.tank.name": "Tank",
        "build.tank.text": "More health and defense. Shield Wall becomes stronger.",
        "build.damage.name": "Damage",
        "build.damage.text": "More damage, but slightly less health.",
        "build.bruiser.name": "Bruiser",
        "build.bruiser.text": "Balanced. Battle Frenzy heals more.",
        "ability.heavyStrike.name": "Heavy Strike",
        "ability.heavyStrike.text": "Every 3rd round lands a stronger attack.",
        "ability.shieldWall.name": "Shield Wall",
        "ability.shieldWall.text": "Every 4th round reduces the enemy hit.",
        "ability.battleFrenzy.name": "Battle Frenzy",
        "ability.battleFrenzy.text": "Once below 45% health: heals 18% health.",
        "ability.crushingBlow.name": "Crushing Blow",
        "ability.crushingBlow.text": "Every 3rd round: 130% damage and ignores part of armor.",
        "ability.counterStrike.name": "Counter Strike",
        "ability.counterStrike.text": "After a heavy hit: counter for 50% damage, at most every 3 rounds.",
        "zone.normalZones": "Zones",
        "zone.dungeons": "Dungeons",
        "zone.switch": "Switch",
        "zone.unlock": "Unlock",
        "zone.meadow.name": "Graywatch Forest",
        "zone.road.name": "Bandit Road",
        "zone.fields.name": "Cursed Fields",
        "zone.ashgrounds.name": "Ashen Grounds",
        "zone.ratcellar.name": "Rat Cellar",
        "zone.ironhold.name": "Ironhold",
        "zone.ashcathedral.name": "Ash Cathedral",
        "zone.levelRange": "Level {min}-{max}",
        "quest.title": "Quest Board",
        "quest.active": "Active Quests",
        "quest.none": "No active quest. Open the Quest Board.",
        "quest.accept": "Accept quest",
        "quest.accepted": "Accepted",
        "quest.notAccepted": "Not accepted yet",
        "quest.completed": "Completed",
        "quest.newAvailable": "New quest available",
        "save.title": "Save",
        "save.download": "Download save",
        "save.load": "Load save",
        "save.downloadText": "Stores your progress as a JSON file.",
        "save.loadText": "Loads a previously downloaded JSON file.",
        "save.last": "Last backup",
        "save.notDownloaded": "Not downloaded yet",
        "save.fileName": "File name",
        "save.storageStatus": "Storage status",
        "save.browserActive": "Browser storage active",
        "save.loaded": "Loaded",
        "save.newAfterError": "New save after load error",
        "save.help": "Download regularly for safe progress. Browser storage can be lost on preview links or cleared website data.",
        "achievements.title": "Achievements",
        "achievements.progress": "{unlocked}/{total} unlocked",
        "bestiary.title": "Bestiary",
        "bestiary.collection": "Collection {found}/{total}",
        "smith.title": "Borin Glutbart",
        "smith.eyebrow": "Dwarven Master of Graywatch",
        "smith.upgrade": "Upgrade",
        "smith.salvage": "Salvage",
        "smith.repair": "Repair",
        "enchant.title": "Mira Nightthread",
        "enchant.eyebrow": "Arcanist of Graywatch",
        "enchant.action": "Enchant",
        "log.start": "You reach the Graywatch camp. The grind begins slowly."
    }
};

function normalizeLanguage(language) {
    return supportedLanguages.includes(language) ? language : "de";
}

function defaultLanguage() {
    const stored = readStoredLanguage();
    if (stored) return stored;
    if (typeof navigator !== "undefined" && navigator.language) {
        return navigator.language.toLowerCase().startsWith("de") ? "de" : "en";
    }
    return "de";
}

function currentLanguage() {
    if (typeof state !== "undefined" && state && state.language) {
        return normalizeLanguage(state.language);
    }
    return defaultLanguage();
}

function readStoredLanguage() {
    try {
        if (typeof localStorage === "undefined") return null;
        const stored = localStorage.getItem(languageStorageKey);
        return stored ? normalizeLanguage(stored) : null;
    } catch {
        return null;
    }
}

function writeStoredLanguage(language) {
    try {
        if (typeof localStorage !== "undefined") {
            localStorage.setItem(languageStorageKey, normalizeLanguage(language));
        }
    } catch {
        // Browser storage can be blocked on some preview links; language still works in memory.
    }
}

function t(key, fallback = key, params = {}) {
    const language = currentLanguage();
    const text = translations[language]?.[key] ?? translations.de[key] ?? fallback;
    return Object.entries(params).reduce(
        (result, [name, value]) => result.replaceAll(`{${name}}`, String(value)),
        text
    );
}

function setLanguage(language) {
    if (typeof state !== "undefined" && state) {
        state.language = normalizeLanguage(language);
    }
    writeStoredLanguage(language);
    clearRenderCache();
    applyStaticTranslations();
    if (typeof save === "function") save();
    if (typeof render === "function") render();
}

function toggleLanguage() {
    setLanguage(currentLanguage() === "de" ? "en" : "de");
}

function clearRenderCache() {
    if (typeof renderCache === "undefined" || !renderCache) return;
    Object.keys(renderCache).forEach((key) => {
        delete renderCache[key];
    });
}

function mapLabel(map, key, fallback = key) {
    const group = labelGroupForMap(map);
    return group ? t(`${group}.${key}`, fallback) : fallback;
}

function labelGroupForMap(map) {
    if (typeof qualityLabel !== "undefined" && map === qualityLabel) return "quality";
    if (typeof rarityLabel !== "undefined" && map === rarityLabel) return "rarity";
    if (typeof slotLabel !== "undefined" && map === slotLabel) return "slot";
    if (typeof materialLabel !== "undefined" && map === materialLabel) return "material";
    return "";
}

function entityName(group, id, fallback = id) {
    return t(`${group}.${id}.name`, fallback);
}

function entityText(group, id, fallback = id) {
    return t(`${group}.${id}.text`, fallback);
}

function zoneDisplayName(zoneId) {
    return entityName("zone", zoneId, zoneCatalog[zoneId]?.name || zoneId);
}

function zoneRangeText(zoneId) {
    const zone = zoneCatalog[zoneId];
    if (!zone) return "";
    return t("zone.levelRange", `Level ${zone.levelRange[0]}-${zone.levelRange[1]}`, {
        min: zone.levelRange[0],
        max: zone.levelRange[1]
    });
}

function riskLabel(risk) {
    const keyByRisk = {
        Einfach: "risk.easy",
        Machbar: "risk.machbar",
        Riskant: "risk.risky",
        "Tödlich": "risk.deadly"
    };
    return t(keyByRisk[risk] || "risk.easy", risk);
}

function formatLocalizedDate(date) {
    const locale = currentLanguage() === "de" ? "de-CH" : "en-US";
    return new Intl.DateTimeFormat(locale, {
        dateStyle: "medium",
        timeStyle: "short"
    }).format(date);
}

function applyStaticTranslations() {
    if (typeof document === "undefined") return;
    if (document.documentElement) document.documentElement.lang = currentLanguage();
    setDocumentTitle();
    setStaticText("#openBestiaryBtn span", "nav.bestiary");
    setStaticText("#openQuestBoardBtn span", "nav.quests");
    setStaticText("#openAchievementsBtn span", "nav.achievements");
    setStaticText("#openInventoryBtn span", "nav.inventory");
    setStaticText("#openSmithBtn span", "nav.smith");
    setStaticText("#openEnchantBtn span", "nav.enchant");
    setStaticText("#openSaveMenuBtn span", "nav.save");
    setStaticText("#languageButtonLabel", "nav.language");
    setStaticText("#languageButtonValue", "language.value");
    setStaticText("#lootTitle", "loot.title");
    setStaticText("#inventoryTitle", "inventory.title");
    setStaticText("#zoneTitle", "common.zone");
    setStaticText("#bestiaryTitle", "bestiary.title");
    setStaticText("#questBoardTitle", "quest.title");
    setStaticText("#achievementsTitle", "achievements.title");
    setStaticText("#saveMenuTitle", "save.title");
    setStaticText("#combatLogEyebrow", "combat.log");
    setStaticText("#combatLogTitle", "combat.lastFight");
    setStaticText(".loot-window .eyebrow", "loot.eyebrow");
    setStaticText("#inventoryModal .eyebrow", "nav.inventory");
    setStaticText("#zoneModal .eyebrow", "common.zone");
    setStaticText("#bestiaryModal .eyebrow", "nav.bestiary");
    setStaticText("#questBoardModal .eyebrow", "nav.quests");
    setStaticText("#achievementsModal .eyebrow", "nav.achievements");
    setStaticText("#saveMenuModal .eyebrow", "save.title");
    setStaticText("#combatLogModal .eyebrow", "combat.log");
    setCloseButtons();
    setStaticAria("#languageToggleBtn", "language.aria");
}

function setDocumentTitle() {
    if (typeof document !== "undefined") {
        document.title = t("app.title", "Fantasy Grind");
    }
}

function setStaticText(selector, key) {
    if (!document.querySelectorAll) return;
    document.querySelectorAll(selector).forEach((element) => {
        element.textContent = t(key, element.textContent);
    });
}

function setStaticAria(selector, key) {
    if (!document.querySelectorAll) return;
    document.querySelectorAll(selector).forEach((element) => {
        element.setAttribute("aria-label", t(key, element.getAttribute("aria-label") || ""));
    });
}

function setCloseButtons() {
    if (!document.querySelectorAll) return;
    document.querySelectorAll(".modal-close").forEach((button) => {
        button.textContent = t("common.close", button.textContent);
        button.setAttribute("aria-label", t("common.close", button.getAttribute("aria-label") || ""));
    });
}
