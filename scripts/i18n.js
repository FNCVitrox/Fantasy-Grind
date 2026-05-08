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
        "common.unknown": "Unbekannt",
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
        "common.enemies": "Gegner",
        "common.boss": "Boss",
        "common.bosses": "Bosse",
        "common.elite": "Elite",
        "common.free": "kostenlos",
        "common.value": "Wert",
        "common.reward": "Belohnung",
        "common.status": "Status",
        "common.chance": "Chance",
        "common.progress": "Fortschritt",
        "common.character": "Charakter",
        "common.current": "Aktuell",
        "common.activeCount": "{count} aktiv",
        "common.openCount": "{count} offen",
        "common.entries": "{count} Einträge",
        "common.page": "Seite",
        "common.previous": "Zurück",
        "common.next": "Weiter",
        "common.completed": "Erledigt",
        "common.ready": "Bereit",
        "common.claimed": "Erhalten",
        "common.claim": "Abholen",
        "common.noOpen": "Keine offen",
        "common.pieces": "Teile",
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
        "main.playerStats": "Spielerwerte",
        "main.currentStats": "Aktuelle Werte",
        "main.buildBonus": "Build-Bonus",
        "main.setBonuses": "Set-Boni",
        "main.noSetBonus": "Kein aktiver Set-Bonus",
        "main.total": "Gesamt",
        "build.changed": "Build gewechselt: {build}.",
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
        "combat.logEmptyLong": "Starte einen Kampf, dann erscheinen hier Schaden, Heilung und Effekte.",
        "combat.ready": "Bereit",
        "combat.stepForward": "{enemy} tritt vor.",
        "combat.dragsOn": "Der Kampf zieht sich schwer und staubig hin.",
        "combat.enemyDefeated": "{enemy} ist besiegt. Beute wird gesichert.",
        "combat.returnCamp": "Du kehrst angeschlagen ins Lager zurück.",
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
        "loot.questReward": "Questbelohnung",
        "loot.reward": "Belohnung",
        "loot.stats": "Werte",
        "loot.noStats": "Keine",
        "loot.noStatChange": "Keine Stat-Änderung",
        "loot.effect": "Effekt",
        "loot.enchantment": "Verzauberung",
        "inventory.title": "Rucksack",
        "inventory.modalTitle": "Inventar",
        "inventory.empty": "Dein Rucksack ist leer.",
        "inventory.emptyShort": "Noch keine Items im Inventar.",
        "inventory.sellAll": "Alles verkaufen",
        "inventory.equip": "Ausrüsten",
        "inventory.sell": "Verkaufen",
        "equipment.empty": "Kein Item ausgerüstet.",
        "equipment.repairCost": "{cost} Gold",
        "equipment.upgradeLevel": "Stufe +{level}/{limit}",
        "equipment.wornTitle": "Getragene Ausrüstung",
        "equipment.repairTitle": "Ausrüstung reparieren",
        "equipment.noGear": "Keine Ausrüstung",
        "equipment.fullyRepaired": "Vollständig",
        "equipment.repairAll": "Alles reparieren",
        "equipment.currentGold": "Aktuelles Gold",
        "equipment.repair": "Reparatur",
        "equipment.upgrade": "Verbesserung",
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
        "zone.travelEyebrow": "Reisekarte",
        "zone.travelTitle": "Reiseziel wählen",
        "zone.currentArea": "Aktuelles Gebiet",
        "quest.title": "Quest-Tafel",
        "quest.active": "Aktive Quests",
        "quest.none": "Keine aktive Quest. Öffne die Quest-Tafel.",
        "quest.accept": "Quest annehmen",
        "quest.accepted": "Angenommen",
        "quest.notAccepted": "Noch nicht angenommen",
        "quest.completed": "Abgeschlossen",
        "quest.newAvailable": "Neue Quest verfügbar",
        "quest.acceptLog": "Quest angenommen: {quest}.",
        "quest.emptyBoard": "Die Tafel ist leer. Gewonnene Kämpfe bringen bald neue Aufträge.",
        "quest.status": "Status",
        "quest.itemReward": "Item",
        "quest.legendary": "legendär",
        "quest.epic": "episch",
        "quest.notReadyArea": "Diese Quest passt noch nicht zu deinen freigeschalteten Gebieten.",
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
        "save.browserBlocked": "Browser-Speicher blockiert",
        "save.autoPathReady": "Automatisches Speichern hat mindestens einen funktionierenden Speicherweg.",
        "save.useDownload": "Bitte nutze regelmäßig Spielstand herunterladen.",
        "save.readFailed": "{label} konnte nicht gelesen werden: {error}",
        "save.recoveredFrom": "Aus {label} wiederhergestellt",
        "save.exported": "Spielstand als Datei gesichert.",
        "save.imported": "Spielstand erfolgreich importiert.",
        "save.importedFrom": "Spielstand aus {file} geladen.",
        "save.importInvalidJson": "Import fehlgeschlagen: Der Text ist kein gültiges JSON.",
        "save.importUnreadable": "Import fehlgeschlagen: Der Spielstand konnte nicht gelesen werden.",
        "save.importFileUnreadable": "Import fehlgeschlagen: Die Datei konnte nicht gelesen werden.",
        "save.loaded": "Geladen",
        "save.newGame": "Neuer Spielstand",
        "save.newAfterError": "Neuer Spielstand nach Ladefehler",
        "save.help": "Für sicheren Fortschritt regelmäßig herunterladen. Browser-Speicher kann bei Preview-Links oder gelöschten Website-Daten verloren gehen.",
        "achievements.title": "Erfolge",
        "achievements.progress": "{unlocked}/{total} freigeschaltet",
        "achievements.readyRewards": "Belohnungen",
        "achievements.claimReward": "Belohnung abholen",
        "achievements.claimed": "Abgeholt",
        "achievements.closed": "Noch offen",
        "bestiary.title": "Bestiarium",
        "bestiary.eyebrow": "Buch der Gegner",
        "bestiary.collection": "Sammlung: {found}/{total}",
        "bestiary.discovered": "entdeckt",
        "bestiary.details": "Details",
        "bestiary.clickDiscovery": "Klicke einen Fund an, um Details zu sehen.",
        "bestiary.unknownDrop": "Unbekannter Fund",
        "bestiary.fixedDrop": "Fester Drop",
        "bestiary.dropChance": "Drop-Chance",
        "bestiary.statsAfterDiscovery": "Stats werden nach dem ersten Fund freigeschaltet.",
        "bestiary.materials": "Materialien",
        "bestiary.materialForSmith": "Material fürs Schmieden",
        "bestiary.dropAmount": "Drop-Menge",
        "bestiary.usedForUpgrades": "Wird für Upgrades und Ausrüstung genutzt.",
        "bestiary.nothingDiscovered": "Noch nichts entdeckt",
        "bestiary.noFixedDrops": "Keine festen seltenen Drops",
        "bestiary.noMaterials": "Keine Materialien bekannt",
        "bestiary.categoryOverview": "Übersicht",
        "bestiary.categoryWeapons": "Waffen",
        "bestiary.categoryArmor": "Rüstung",
        "bestiary.categoryJewelry": "Schmuck",
        "bestiary.categoryFixed": "Feste Drops",
        "bestiary.categorySets": "Set-Items",
        "bestiary.filterAll": "Alle",
        "bestiary.filterNew": "Neu",
        "bestiary.filterEpic": "Episch+",
        "bestiary.filterIncomplete": "Noch nicht vollständig",
        "bestiary.search": "Item suchen",
        "bestiary.dungeonReward": "Dungeon-Belohnung",
        "bestiary.firstWin": "Erster Sieg",
        "bestiary.firstWinClaimed": "Erster Sieg bereits geholt",
        "bestiary.noSpecialReward": "Keine Sonderbelohnung",
        "bestiary.bossLoot": "Bossbeute",
        "bestiary.noBossLoot": "Keine feste Bossbeute",
        "bestiary.enemyAbilities": "Gegnerfähigkeiten",
        "bestiary.passive": "Passiv",
        "bestiary.active": "Aktiv",
        "bestiary.note": "Items werden zusammengefasst, seitenweise geladen und Details erscheinen direkt neben der Liste.",
        "smith.title": "Borin Glutbart",
        "smith.eyebrow": "Zwergenmeister der Grauwacht",
        "smith.upgrade": "Verbessern",
        "smith.salvage": "Zerlegen",
        "smith.repair": "Reparieren",
        "smith.salvageTitle": "Items zerlegen",
        "smith.salvageAll": "Alles zerlegen",
        "smith.upgradeText": "Ausrüstung mit Gold und Materialien verstärken.",
        "smith.salvageText": "Alte Items in Schmiedematerialien zerlegen.",
        "smith.repairText": "Ausrüstung beim Schmied für Gold instand setzen.",
        "smith.noSalvageItems": "Keine Items im Rucksack zum Zerlegen.",
        "smith.renownRank": "Ruhm {renown}",
        "smith.nextRenown": "Nächster Rang bei {renown} Ruhm: {benefit}",
        "smith.allRenownUnlocked": "Alle Ruhm-Vorteile freigeschaltet.",
        "smith.mastery": "Schmied-Meisterschaft",
        "smith.anvilSilent": "Der Amboss schweigt",
        "smith.hiddenWork": "Verborgene Arbeit",
        "smith.hiddenIntro": "Dein Stahl hat noch Luft. Bring mir erst ein Stück, das keinen einfachen Schlag mehr annimmt.",
        "smith.hiddenReward": "Borin verrät dir mehr, sobald deine Ausrüstung wirklich an ihre Grenze stößt.",
        "smith.masterMark": "Meisterzeichen der Grauwacht",
        "smith.masterDone": "Deine Ausrüstung trägt Borins stärkste Bindung. Mehr gibt der Amboss nicht her.",
        "smith.activeMission": "Aktiv: {name}",
        "smith.nextMission": "Nächster Auftrag: {name}",
        "smith.startMission": "Meisterauftrag beginnen",
        "smith.completeMission": "Meisterauftrag abschließen",
        "smith.afterUpgrade": "Nach Upgrade",
        "smith.limitReached": "Limit erreicht",
        "smith.masterworkDone": "Meisterarbeit vollendet",
        "smith.missionNeeded": "Meisterauftrag nötig",
        "smith.noFurtherBinding": "Borin kann dieses Stück nicht weiter binden.",
        "smith.unlockNextLimit": "Schalte das nächste globale Limit frei.",
        "smith.renownDiscount": "Ruhm-Rabatt aktiv",
        "smith.missionNeededAtBorin": "Meisterauftrag bei Borin nötig",
        "smith.bonus": "Bonus",
        "enchant.title": "Mira Nachtfaden",
        "enchant.eyebrow": "Arkanistin der Grauwacht",
        "enchant.action": "Verzaubern",
        "enchant.intro": "Elfen-Arkanistin der Grauwacht. \"Runen sind keine Farbe auf Stahl. Sie sind ein Versprechen, das beißt.\"",
        "enchant.check": "Arkane Prüfung",
        "enchant.unlocked": "Zugang geöffnet",
        "enchant.locked": "Noch verschlossen",
        "enchant.currentBinding": "Aktuelle Bindung: {slots} Runen-Slot{suffix} pro Item",
        "enchant.lockedFlavor": "Mira lässt dich zwar herein, aber ihre Runen hören noch nicht auf dich.",
        "enchant.unlockAt": "Freischaltung bei Level {level}. Aktuell: Level {current}.",
        "enchant.activeMission": "Aktiver Auftrag: {name}",
        "enchant.nextMission": "Nächster Auftrag: {name}",
        "enchant.allBindings": "Alle aktuellen Runenbindungen freigeschaltet.",
        "enchant.arcaneComplete": "Arkane Meisterschaft vollständig gebunden.",
        "enchant.mastery": "Arkane Meisterschaft",
        "enchant.circleComplete": "Miras Kreis ist vollständig",
        "enchant.arcane": "Arkan",
        "enchant.masterDone": "Alle Runen-Slots und arkane Verzauberungen sind freigeschaltet.",
        "enchant.masterMission": "Miras Meisterauftrag",
        "enchant.startMission": "Arkanen Auftrag beginnen",
        "enchant.completeMission": "Ritual vollenden",
        "enchant.shop": "Arkaner Laden",
        "enchant.lockedTitle": "Mira Nachtfaden hebt nur eine Augenbraue.",
        "enchant.lockedQuote": "Süß. Du willst Magie an Stahl binden, aber deine Seele stolpert noch über Kieselsteine. Komm wieder, wenn du nicht mehr nach Tutorial riechst.",
        "enchant.reachLevel": "Level {level} erreichen",
        "enchant.unlockSimpleRunes": "Danach einfache Runen freischalten",
        "enchant.lockedUntil": "Verzauberungen bleiben bis dahin gesperrt",
        "enchant.notEnchanted": "Noch nicht verzaubert.",
        "enchant.castRune": "Rune wirken",
        "enchant.noRune": "Keine passende Rune",
        "enchant.slotsFull": "Alle aktuellen Slots belegt.",
        "enchant.ritualCost": "Ritualkosten",
        "enchant.category.offense": "Offensiv",
        "enchant.category.defense": "Defensiv",
        "enchant.category.utility": "Utility",
        "log.title": "Protokoll",
        "log.eyebrow": "Kampfverlauf",
        "log.empty": "Noch keine Einträge.",
        "log.start": "Du erreichst das Lager Grauwacht. Der Grind beginnt langsam."
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

function ensureLanguagePack(language = currentLanguage()) {
    const normalized = normalizeLanguage(language);
    if (normalized === "en" && !translations.en && typeof loadDataPack === "function") {
        return typeof loadOptionalDataPack === "function" ? loadOptionalDataPack("i18nEn") : loadDataPack("i18nEn");
    }
    return Promise.resolve(true);
}

async function setLanguage(language) {
    await ensureLanguagePack(language);
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
    void setLanguage(currentLanguage() === "de" ? "en" : "de");
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
    return entityName("zone", zoneId, zones[zoneId]?.name || zoneId);
}

function zoneRangeText(zoneId) {
    const zone = zones[zoneId];
    if (!zone) return "";
    const range = zone.levelRange || [zone.level || 1, zone.level || 1];
    return t("zone.levelRange", zone.range || `Level ${range[0]}-${range[1]}`, {
        min: range[0],
        max: range[1]
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
    setStaticText("#restBtn span:first-child", "nav.camp");
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
    setStaticText("#zoneTitle", "zone.travelTitle");
    setStaticText("#bestiaryTitle", "bestiary.title");
    setStaticText("#questBoardTitle", "quest.title");
    setStaticText("#achievementsTitle", "achievements.title");
    setStaticText("#saveTitle", "save.title");
    setStaticText("#repairTitle", "equipment.repairTitle");
    setStaticText("#equipmentTitle", "equipment.wornTitle");
    setStaticText("#playerStatsTitle", "main.playerStats");
    setStaticText("#logTitle", "log.title");
    setStaticText("#combatLogEyebrow", "combat.log");
    setStaticText("#combatLogTitle", "combat.lastFight");
    setStaticText(".character-status div:nth-child(1) span", "common.level");
    setStaticText(".character-status div:nth-child(2) span", "common.gold");
    setStaticText(".character-status div:nth-child(3) span", "common.renown");
    setStaticText(".class-card > div:nth-child(1) h3", "main.build");
    setStaticText(".class-card > div:nth-child(2) h3", "main.abilities");
    setStaticText(".equipment-belt .eyebrow", "main.equipment");
    setStaticText(".equipment-belt h2", "main.belt");
    setStaticText(".target-card .eyebrow", "main.target");
    setStaticText(".combat-health-label span", "main.life");
    setStaticText(".map-card h2", "common.zone");
    setStaticText(".quest-panel h2", "quest.active");
    setStaticText(".log-panel h2", "log.title");
    setStaticText("#toggleLogBtn", "common.open");
    setStaticText(".loot-window .eyebrow", "loot.eyebrow");
    setStaticText("#zoneModal .eyebrow", "zone.travelEyebrow");
    setStaticText("#inventoryModal .eyebrow", "nav.inventory");
    setStaticText("#bestiaryModal .eyebrow", "bestiary.eyebrow");
    setStaticText("#questBoardModal .eyebrow", "nav.quests");
    setStaticText("#achievementsModal .eyebrow", "nav.achievements");
    setStaticText("#saveMenuModal .eyebrow", "save.title");
    setStaticText("#saveModal .eyebrow", "save.title");
    setStaticText("#repairModal .eyebrow", "smith.repair");
    setStaticText("#equipmentModal .eyebrow", "main.equipment");
    setStaticText("#playerStatsModal .eyebrow", "common.character");
    setStaticText("#logModal .eyebrow", "log.eyebrow");
    setStaticText("#combatLogModal .eyebrow", "combat.log");
    setStaticText("#exportSaveTopBtn strong", "save.download");
    setStaticText("#exportSaveTopBtn span", "save.downloadText");
    setStaticText("#importSaveTopBtn strong", "save.load");
    setStaticText("#importSaveTopBtn span", "save.loadText");
    setStaticText(".save-hint", "save.help");
    setStaticText("#sellAllBtn", "inventory.sellAll");
    setStaticText("#salvageAllBtn", "smith.salvageAll");
    setStaticText("#smithUpgradeSection h3", "smith.upgrade");
    setStaticText("#smithSalvageSection h3", "smith.salvageTitle");
    setStaticText("#smithEnchantSection h3", "enchant.action");
    setStaticText("#smithEnchantSection .enchant-intro strong", "enchant.title");
    setStaticText("#smithEnchantSection .enchant-intro p", "enchant.intro");
    setStaticText("[data-smith-view='home']", "common.back");
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
