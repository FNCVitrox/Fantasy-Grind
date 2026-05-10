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
        "quest.delete": "Löschen",
        "quest.notAccepted": "Noch nicht angenommen",
        "quest.completed": "Abgeschlossen",
        "quest.newAvailable": "Neue Quest verfügbar",
        "quest.acceptLog": "Quest angenommen: {quest}.",
        "quest.cancelLog": "Quest gelöscht: {quest}.",
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
        "common.unknown": "Unknown",
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
        "common.enemies": "Enemies",
        "common.boss": "Boss",
        "common.bosses": "Bosses",
        "common.elite": "Elite",
        "common.free": "free",
        "common.value": "Value",
        "common.reward": "Reward",
        "common.status": "Status",
        "common.chance": "Chance",
        "common.progress": "Progress",
        "common.character": "Character",
        "common.current": "Current",
        "common.activeCount": "{count} active",
        "common.openCount": "{count} open",
        "common.entries": "{count} entries",
        "common.page": "Page",
        "common.previous": "Back",
        "common.next": "Next",
        "common.completed": "Done",
        "common.ready": "Ready",
        "common.claimed": "Claimed",
        "common.claim": "Claim",
        "common.noOpen": "None open",
        "common.pieces": "Pieces",
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
        "main.playerStats": "Player Stats",
        "main.currentStats": "Current Stats",
        "main.buildBonus": "Build Bonus",
        "main.setBonuses": "Set Bonuses",
        "main.noSetBonus": "No active set bonus",
        "main.total": "Total",
        "build.changed": "Build changed: {build}.",
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
        "combat.logEmptyLong": "Start a fight and damage, healing, and effects will appear here.",
        "combat.ready": "Ready",
        "combat.stepForward": "{enemy} steps forward.",
        "combat.dragsOn": "The fight drags on through dust and steel.",
        "combat.enemyDefeated": "{enemy} is defeated. Loot is secured.",
        "combat.returnCamp": "You return to camp battered.",
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
        "loot.questReward": "Quest reward",
        "loot.reward": "Reward",
        "loot.stats": "Stats",
        "loot.noStats": "None",
        "loot.noStatChange": "No stat change",
        "loot.effect": "Effect",
        "loot.enchantment": "Enchantment",
        "inventory.title": "Backpack",
        "inventory.modalTitle": "Inventory",
        "inventory.empty": "Your backpack is empty.",
        "inventory.emptyShort": "No items in inventory yet.",
        "inventory.sellAll": "Sell all",
        "inventory.equip": "Equip",
        "inventory.sell": "Sell",
        "equipment.empty": "No item equipped.",
        "equipment.repairCost": "{cost} Gold",
        "equipment.upgradeLevel": "Level +{level}/{limit}",
        "equipment.wornTitle": "Worn Equipment",
        "equipment.repairTitle": "Repair Equipment",
        "equipment.noGear": "No equipment",
        "equipment.fullyRepaired": "Fully repaired",
        "equipment.repairAll": "Repair all",
        "equipment.currentGold": "Current Gold",
        "equipment.repair": "Repair",
        "equipment.upgrade": "Upgrade",
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
        "zone.travelEyebrow": "Travel Map",
        "zone.travelTitle": "Choose Destination",
        "zone.currentArea": "Current Zone",
        "quest.title": "Quest Board",
        "quest.active": "Active Quests",
        "quest.none": "No active quest. Open the Quest Board.",
        "quest.accept": "Accept quest",
        "quest.accepted": "Accepted",
        "quest.notAccepted": "Not accepted yet",
        "quest.completed": "Completed",
        "quest.newAvailable": "New quest available",
        "quest.acceptLog": "Quest accepted: {quest}.",
        "quest.emptyBoard": "The board is empty. Won fights will bring new contracts soon.",
        "quest.status": "Status",
        "quest.itemReward": "Item",
        "quest.legendary": "legendary",
        "quest.epic": "epic",
        "quest.notReadyArea": "This quest does not match your unlocked zones yet.",
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
        "save.browserBlocked": "Browser storage blocked",
        "save.autoPathReady": "Autosave has at least one working storage path.",
        "save.useDownload": "Please use Download save regularly.",
        "save.readFailed": "{label} could not be read: {error}",
        "save.recoveredFrom": "Recovered from {label}",
        "save.exported": "Save downloaded as file.",
        "save.imported": "Save imported successfully.",
        "save.importedFrom": "Save loaded from {file}.",
        "save.importInvalidJson": "Import failed: The text is not valid JSON.",
        "save.importUnreadable": "Import failed: The save could not be read.",
        "save.importFileUnreadable": "Import failed: The file could not be read.",
        "save.loaded": "Loaded",
        "save.newGame": "New save",
        "save.newAfterError": "New save after load error",
        "save.help": "Download regularly for safe progress. Browser storage can be lost on preview links or cleared website data.",
        "achievements.title": "Achievements",
        "achievements.progress": "{unlocked}/{total} unlocked",
        "achievements.readyRewards": "Rewards",
        "achievements.claimReward": "Claim reward",
        "achievements.claimed": "Claimed",
        "achievements.closed": "Locked",
        "bestiary.title": "Bestiary",
        "bestiary.eyebrow": "Book of Enemies",
        "bestiary.collection": "Collection: {found}/{total}",
        "bestiary.discovered": "discovered",
        "bestiary.details": "Details",
        "bestiary.clickDiscovery": "Click a find to inspect details.",
        "bestiary.unknownDrop": "Unknown find",
        "bestiary.fixedDrop": "Fixed drop",
        "bestiary.dropChance": "Drop chance",
        "bestiary.statsAfterDiscovery": "Stats unlock after the first find.",
        "bestiary.materials": "Materials",
        "bestiary.materialForSmith": "Smithing material",
        "bestiary.dropAmount": "Drop amount",
        "bestiary.usedForUpgrades": "Used for upgrades and equipment.",
        "bestiary.nothingDiscovered": "Nothing discovered yet",
        "bestiary.noFixedDrops": "No fixed rare drops",
        "bestiary.noMaterials": "No known materials",
        "bestiary.categoryOverview": "Overview",
        "bestiary.categoryWeapons": "Weapons",
        "bestiary.categoryArmor": "Armor",
        "bestiary.categoryJewelry": "Jewelry",
        "bestiary.categoryFixed": "Fixed Drops",
        "bestiary.categorySets": "Set Items",
        "bestiary.filterAll": "All",
        "bestiary.filterNew": "New",
        "bestiary.filterEpic": "Epic+",
        "bestiary.filterIncomplete": "Incomplete",
        "bestiary.search": "Search item",
        "bestiary.dungeonReward": "Dungeon Reward",
        "bestiary.firstWin": "First Win",
        "bestiary.firstWinClaimed": "First win claimed",
        "bestiary.noSpecialReward": "No special reward",
        "bestiary.bossLoot": "Boss loot",
        "bestiary.noBossLoot": "No fixed boss loot",
        "bestiary.enemyAbilities": "Enemy abilities",
        "bestiary.passive": "Passive",
        "bestiary.active": "Active",
        "bestiary.note": "Items are grouped, paged, and detailed beside the list.",
        "smith.title": "Borin Glutbart",
        "smith.eyebrow": "Dwarven Master of Graywatch",
        "smith.upgrade": "Upgrade",
        "smith.salvage": "Salvage",
        "smith.repair": "Repair",
        "smith.salvageTitle": "Salvage Items",
        "smith.salvageAll": "Salvage all",
        "smith.upgradeText": "Improve equipment with gold and materials.",
        "smith.salvageText": "Break old items into smithing materials.",
        "smith.repairText": "Repair equipment at the smith for gold.",
        "smith.noSalvageItems": "No items in the backpack to salvage.",
        "smith.renownRank": "Renown {renown}",
        "smith.nextRenown": "Next rank at {renown} Renown: {benefit}",
        "smith.allRenownUnlocked": "All renown perks unlocked.",
        "smith.mastery": "Smith Mastery",
        "smith.anvilSilent": "The anvil is silent",
        "smith.hiddenWork": "Hidden craft",
        "smith.hiddenIntro": "Your steel still has room to grow. Bring me a piece that refuses a simple strike first.",
        "smith.hiddenReward": "Borin will tell you more once your gear truly reaches its edge.",
        "smith.masterMark": "Mastermark of Graywatch",
        "smith.masterDone": "Your equipment carries Borin's strongest binding. The anvil has no more to give.",
        "smith.activeMission": "Active: {name}",
        "smith.nextMission": "Next commission: {name}",
        "smith.startMission": "Begin master commission",
        "smith.completeMission": "Complete master commission",
        "smith.afterUpgrade": "After upgrade",
        "smith.limitReached": "Limit reached",
        "smith.masterworkDone": "Masterwork complete",
        "smith.missionNeeded": "Master commission needed",
        "smith.noFurtherBinding": "Borin cannot bind this piece any further.",
        "smith.unlockNextLimit": "Unlock the next global limit.",
        "smith.renownDiscount": "Renown discount active",
        "smith.missionNeededAtBorin": "Borin's master commission needed",
        "smith.bonus": "Bonus",
        "enchant.title": "Mira Nightthread",
        "enchant.eyebrow": "Arcanist of Graywatch",
        "enchant.action": "Enchant",
        "enchant.intro": "Elven arcanist of Graywatch. \"Runes are not paint on steel. They are a promise that bites.\"",
        "enchant.check": "Arcane Trial",
        "enchant.unlocked": "Access open",
        "enchant.locked": "Still locked",
        "enchant.currentBinding": "Current binding: {slots} rune slot{suffix} per item",
        "enchant.lockedFlavor": "Mira lets you in, but her runes still refuse to listen.",
        "enchant.unlockAt": "Unlocks at Level {level}. Current: Level {current}.",
        "enchant.activeMission": "Active commission: {name}",
        "enchant.nextMission": "Next commission: {name}",
        "enchant.allBindings": "All current rune bindings unlocked.",
        "enchant.arcaneComplete": "Arcane Mastery fully bound.",
        "enchant.mastery": "Arcane Mastery",
        "enchant.circleComplete": "Mira's circle is complete",
        "enchant.arcane": "Arcane",
        "enchant.masterDone": "All rune slots and arcane enchantments are unlocked.",
        "enchant.masterMission": "Mira's Master Commission",
        "enchant.startMission": "Begin arcane commission",
        "enchant.completeMission": "Complete ritual",
        "enchant.shop": "Arcane parlor",
        "enchant.lockedTitle": "Mira Nightthread only raises an eyebrow.",
        "enchant.lockedQuote": "Sweet. You want to bind magic to steel, but your soul still trips over pebbles. Come back when you stop smelling like a tutorial.",
        "enchant.reachLevel": "Reach Level {level}",
        "enchant.unlockSimpleRunes": "Unlock simple runes afterwards",
        "enchant.lockedUntil": "Enchantments stay locked until then",
        "enchant.notEnchanted": "Not enchanted yet.",
        "enchant.castRune": "Cast rune",
        "enchant.noRune": "No matching rune",
        "enchant.slotsFull": "All current slots are filled.",
        "enchant.ritualCost": "Ritual cost",
        "enchant.category.offense": "Offense",
        "enchant.category.defense": "Defense",
        "enchant.category.utility": "Utility",
        "log.title": "Log",
        "log.eyebrow": "Combat History",
        "log.empty": "No entries yet.",
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
    if (typeof tooltipHtmlCache !== "undefined") tooltipHtmlCache.clear();
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
    const range = zone.levelRange || parseLevelRange(zone.range) || [zone.level || 1, zone.level || 1];
    return t("zone.levelRange", zone.range || `Level ${range[0]}-${range[1]}`, {
        min: range[0],
        max: range[1]
    });
}

function parseLevelRange(rangeText = "") {
    const match = String(rangeText).match(/(\d+)\D+(\d+)/);
    return match ? [Number(match[1]), Number(match[2])] : null;
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
