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
        "nav.merchant": "Händler",
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
        "main.class": "Klasse",
        "main.build": "Build",
        "main.abilities": "Fähigkeiten",
        "main.target": "Ziel",
        "main.life": "Leben",
        "main.damage": "Schaden",
        "main.defense": "Verteidigung",
        "main.durability": "Haltbarkeit",
        "main.playerStats": "Spielerwerte",
        "main.changeClass": "Klasse wechseln",
        "main.currentStats": "Aktuelle Werte",
        "main.buildBonus": "Build-Bonus",
        "main.setBonuses": "Set-Boni",
        "main.noSetBonus": "Kein aktiver Set-Bonus",
        "main.total": "Gesamt",
        "class.changed": "Klasse gewechselt: {class}.",
        "build.changed": "Build gewechselt: {build}.",
        "combat.modeAuto": "Auto",
        "combat.modeManual": "Manuell",
        "combat.start": "Kampf starten",
        "combat.nextStep": "Nächster Schritt",
        "combat.showResult": "Abschluss anzeigen",
        "combat.finishStep": "Abschließen",
        "combat.skip": "Skip",
        "combat.skipping": "Überspringe...",
        "combat.skippingBattle": "Kampf wird übersprungen...",
        "combat.waits": "wartet.",
        "combat.ready": "Bereit",
        "combat.manualReady": "Manueller Kampf bereit.",
        "combat.autoReady": "Auto-Kampf läuft.",
        "combat.inProgress": "Kampf läuft",
        "combat.cannotFight": "Du bist kampfunfähig. Raste zuerst im Lager.",
        "combat.pickLootFirst": "Wähle zuerst deine Beute aus dem letzten Kampf.",
        "combat.finishError": "Der Kampfabschluss hatte einen Fehler, wurde aber sauber freigegeben.",
        "combat.manualLongFight": "Der Kampf zieht sich weiter. Zeige den Abschluss.",
        "combat.actionAttack": "Angriff",
        "combat.actionDefend": "Verteidigen",
        "combat.ability": "Fähigkeit",
        "combat.actionAttackHint": "+{amount} {resource}",
        "combat.actionDefendHint": "-50% Treffer, +{amount} {resource}",
        "combat.actionCost": "{cost} {resource}",
        "combat.unlocksAt": "Level {level}",
        "combat.cooldownShort": "{turns}R",
        "combat.needResource": "{amount} {resource}",
        "combat.defendText": "Du gehst in Deckung und sammelst {resource}.",
        "combat.dotDamage": "{effect} verursacht {damage} Schaden.",
        "combat.abilityGuardText": "{ability} stärkt deine Deckung und trifft für {damage}.",
        "combat.abilityHealText": "{ability} heilt {heal} Leben und trifft für {damage}.",
        "combat.abilityWeakenText": "{ability} schwächt den Gegner und trifft für {damage}.",
        "combat.abilityArmorText": "{ability} bricht Rüstung und trifft für {damage}.",
        "combat.abilityFlurryText": "{ability} setzt eine schnelle Serie für {damage}.",
        "combat.abilityExecuteText": "{ability} sucht die Schwachstelle und trifft für {damage}.",
        "combat.abilityCounterText": "{ability} bereitet einen Konter vor und trifft für {damage}.",
        "combat.abilityHeavyText": "{ability} trifft schwer für {damage}.",
        "classResource.warrior": "Wut",
        "classResource.mage": "Mana",
        "classResource.rogue": "List",
        "classResource.archer": "Fokus",
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
        "combat.beforeFight": "Vor Kampf",
        "combat.eventLog": "Kampfereignis - {event}: {text}",
        "combat.eventTone.advantage": "Vorteil",
        "combat.eventTone.reward": "Beute",
        "combat.eventTone.danger": "Gefahr",
        "combat.eventTone.control": "Tempo",
        "combat.eventTone.clash": "Duell",
        "combat.eventTone.neutral": "Event",
        "combat.winLog": "Sieg gegen {enemy} nach {rounds} Runden. +{xp} XP, +{gold} Gold.",
        "combat.rewardScaledLog": "Alte Gegner geben nur noch {percent}% Kampfbelohnung.",
        "combat.rewardScale": "Belohnung",
        "combat.rewardScaleText": "{percent}% XP/Gold wegen Levelabstand.",
        "combat.lossLog": "Tod gegen {enemy}. Du verlierst {xp} XP, {gold} Gold und kehrst angeschlagen ins Lager zurück.",
        "combat.renownLog": "Dein Ruf wächst: +1 Ruhm für den Sieg gegen {enemy}.",
        "combat.enemyAbilityHit": "{enemy}: {ability} trifft für {damage}.",
        "combat.heroHit": "Du triffst für {damage}.",
        "combat.enemyHit": "{enemy} trifft für {damage}.",
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
        "loot.rareChoiceLog": "Seltener Fund in der Beuteauswahl: {item} ({quality}).",
        "loot.guaranteedBossDropLog": "Beutedruck garantiert Bossbeute: {item} ({quality}).",
        "loot.chosenEquippedLog": "{item} gewählt und direkt ausgerüstet.",
        "loot.chosenInventoryLog": "{item} gewählt und ins Inventar gelegt.",
        "inventory.title": "Rucksack",
        "inventory.modalTitle": "Inventar",
        "inventory.empty": "Dein Rucksack ist leer.",
        "inventory.emptyShort": "Noch keine Items im Inventar.",
        "inventory.sellAll": "Alles verkaufen",
        "inventory.equip": "Ausrüsten",
        "inventory.sell": "Verkaufen",
        "inventory.sellHint": "Verkauf beim Händler",
        "merchant.eyebrow": "Handelsposten",
        "merchant.title": "Tilda Münzhand",
        "merchant.sellValue": "Verkaufswert",
        "merchant.noItems": "Tilda findet nichts Verkaufbares in deinem Rucksack.",
        "merchant.lockItem": "Schützen",
        "merchant.unlockItem": "Schutz entfernen",
        "merchant.lockedItem": "Geschützt",
        "merchant.lockedCount": "{count} geschützt",
        "merchant.lockItemLog": "{item} ist vor Verkauf geschützt.",
        "merchant.unlockItemLog": "{item} ist nicht mehr geschützt.",
        "merchant.lockedItemLog": "{item} ist geschützt und wird nicht verkauft.",
        "merchant.sellItemLog": "Tilda Münzhand kauft {item}. +{gold} Gold.",
        "merchant.sellAllLog": "Tilda Münzhand kauft {count} Items. +{gold} Gold.",
        "material.foundLog": "Material gefunden: {materials}.",
        "item.suffix.graywatch": "der Grauwacht",
        "inventory.equipLog": "{item} ausgerüstet. {previous} liegt jetzt im Inventar.",
        "inventory.oldItem": "Altes Teil",
        "equipment.brokenLog": "{item} ist zerbrochen.",
        "equipment.repairAllGoodLog": "Deine Ausrüstung ist bereits in gutem Zustand.",
        "equipment.repairMissingLog": "Für die Reparatur fehlen {gold} Gold.",
        "equipment.repairAllLog": "Der Schmied repariert deine ausgerüsteten Items vollständig. Kosten: {gold} Gold.",
        "equipment.repairSlotFullLog": "{item} ist bereits vollständig repariert.",
        "equipment.repairSlotMissingLog": "Für {item} fehlen {gold} Gold.",
        "equipment.repairSlotLog": "{item} repariert. Kosten: {gold} Gold.",
        "camp.alreadyRestedLog": "Du bist bereits vollständig erholt.",
        "camp.restPaidLog": "Du rastest am Lagerplatz. Leben vollständig erholt. Kosten: {gold} Gold.",
        "camp.restFreeLog": "Du rastest am Lagerplatz. Ohne genug Gold heilt dich die Grauwacht kostenlos.",
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
        "upgradeFrame.forged": "Geschmiedete Kante",
        "upgradeFrame.ember": "Goldverzierung",
        "upgradeFrame.runic": "Smaragdfassung",
        "upgradeFrame.oath": "Bluteid-Rahmen",
        "upgradeFrame.masterwork": "Diamantfassung",
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
        "material.shard": "Runensplitter",
        "material.moonDust": "Mondstaub",
        "material.oathSteel": "Eidstahl",
        "material.bone": "Knochenstücke",
        "material.shadowResin": "Schattenharz",
        "material.emberCore": "Glutkern",
        "material.packFang": "Rudelfang",
        "material.wolfFang": "Rudelfang",
        "material.oathmark": "Eidmarke",
        "material.oathMark": "Eidmarke",
        "material.graveSigil": "Grabessiegel",
        "material.graveSeal": "Grabessiegel",
        "material.crownAsh": "Kronenasche",
        "class.warrior.name": "Krieger",
        "class.warrior.text": "Standhaft, direkt und stark mit Waffen.",
        "class.mage.name": "Magier",
        "class.mage.text": "Arkan, zerbrechlich und stark über Zauberfenster.",
        "class.rogue.name": "Schurke",
        "class.rogue.text": "Schnell, riskant und stark über Ausweichen und Finisher.",
        "class.archer.name": "Bogenschütze",
        "class.archer.text": "Präzise, beweglich und stark über sichere Trefferfenster.",
        "classBuild.warrior.tank.name": "Wächter",
        "classBuild.warrior.tank.text": "Defensiver Tank mit viel Überleben.",
        "classBuild.warrior.damage.name": "Berserker",
        "classBuild.warrior.damage.text": "Aggressiver Nahkampf mit hohem Schaden.",
        "classBuild.warrior.bruiser.name": "Kriegsveteran",
        "classBuild.warrior.bruiser.text": "Balance aus Schaden und Defensive.",
        "classBuild.mage.tank.name": "Frostmagier",
        "classBuild.mage.tank.text": "Kontrolle und Defensive.",
        "classBuild.mage.damage.name": "Feuermagier",
        "classBuild.mage.damage.text": "Hoher Burst-Schaden mit Feuerzaubern.",
        "classBuild.mage.bruiser.name": "Dunkelmagier",
        "classBuild.mage.bruiser.text": "Lebensentzug und Schwächung.",
        "classBuild.rogue.tank.name": "Phantom",
        "classBuild.rogue.tank.text": "Ausweichen und schnelles Gameplay.",
        "classBuild.rogue.damage.name": "Assassine",
        "classBuild.rogue.damage.text": "Hoher Crit-Schaden gegen Einzelziele.",
        "classBuild.rogue.bruiser.name": "Giftläufer",
        "classBuild.rogue.bruiser.text": "Schaden über Zeit mit Gift-Effekten.",
        "classBuild.archer.tank.name": "Fallenjäger",
        "classBuild.archer.tank.text": "Kontrolle und sichere Kämpfe.",
        "classBuild.archer.damage.name": "Scharfschütze",
        "classBuild.archer.damage.text": "Langsame, aber extrem starke Treffer.",
        "classBuild.archer.bruiser.name": "Schnellfeuer",
        "classBuild.archer.bruiser.text": "Viele schnelle Angriffe.",
        "build.tank.name": "Tank",
        "build.tank.text": "Mehr Leben und Verteidigung. Schildwall ist stärker.",
        "build.damage.name": "Schaden",
        "build.damage.text": "Mehr Schaden, aber etwas weniger Leben.",
        "build.bruiser.name": "Bruiser",
        "build.bruiser.text": "Ausgewogen. Kampfrausch heilt stärker.",
        "ability.heavyStrike.name": "Wutschlag",
        "ability.heavyStrike.text": "Hoher Schaden.",
        "ability.bladeFlurry.name": "Blutrausch",
        "ability.bladeFlurry.text": "Mehr Schaden über mehrere Runden.",
        "ability.execute.name": "Hinrichtung",
        "ability.execute.text": "Extremer Schaden gegen Gegner unter 30% Leben.",
        "ability.shieldWall.name": "Schildschlag",
        "ability.shieldWall.text": "Kleiner Schaden und starke Deckung.",
        "ability.tauntingBlow.name": "Eisenhaut",
        "ability.tauntingBlow.text": "Reduziert erhaltenen Schaden.",
        "ability.lastStand.name": "Letzter Widerstand",
        "ability.lastStand.text": "Rettungsfähigkeit für tödliche Momente.",
        "ability.battleRush.name": "Kampfrausch",
        "ability.battleRush.text": "Heilt einen Teil deines Lebens.",
        "ability.shatter.name": "Zertrümmern",
        "ability.shatter.text": "Schaden und Rüstung des Gegners brechen.",
        "ability.counterBlow.name": "Titanenhieb",
        "ability.counterBlow.text": "Sehr hoher Einzelziel-Schaden.",
        "ability.battleFrenzy.name": "Kampfrausch",
        "ability.battleFrenzy.text": "Einmal unter 45% Leben: heilt 18% Leben.",
        "ability.crushingBlow.name": "Zerschmettern",
        "ability.crushingBlow.text": "Jede 3. Runde: 130% Schaden und ein Teil der Rüstung wird ignoriert.",
        "ability.counterStrike.name": "Konterschlag",
        "ability.counterStrike.text": "Nach hartem Treffer: Konter mit 50% Schaden, höchstens alle 3 Runden.",
        "ability.arcaneBolt.name": "Feuerball",
        "ability.arcaneBolt.text": "Starker magischer Feuerschaden.",
        "ability.emberNova.name": "Verbrennen",
        "ability.emberNova.text": "Brandschaden über mehrere Runden.",
        "ability.spellRend.name": "Inferno",
        "ability.spellRend.text": "Massiver Feuerschaden.",
        "ability.manaWard.name": "Eislanze",
        "ability.manaWard.text": "Schaden und Kontrolle.",
        "ability.frostAegis.name": "Eisrüstung",
        "ability.frostAegis.text": "Weniger Schaden erhalten.",
        "ability.lastSpark.name": "Frostgefängnis",
        "ability.lastSpark.text": "Kontrolliert den nächsten Gegnerzug.",
        "ability.spellRush.name": "Seelenraub",
        "ability.spellRush.text": "Schaden und Heilung gleichzeitig.",
        "ability.runeCrush.name": "Dunkler Fluch",
        "ability.runeCrush.text": "Schwächt gegnerischen Schaden.",
        "ability.wardCounter.name": "Schattenexplosion",
        "ability.wardCounter.text": "Großer Finisher-Schaden.",
        "ability.backstab.name": "Rückenstich",
        "ability.backstab.text": "Hoher Crit-Schaden.",
        "ability.dualCut.name": "Unsichtbarkeit",
        "ability.dualCut.text": "Nächster Angriff wird deutlich gefährlicher.",
        "ability.finisher.name": "Tödlicher Stich",
        "ability.finisher.text": "Massiver Einzelziel-Schaden.",
        "ability.shadowVeil.name": "Schattenrolle",
        "ability.shadowVeil.text": "Hohe Ausweichchance.",
        "ability.blindside.name": "Spiegelbild",
        "ability.blindside.text": "Chance, Angriffe komplett zu vermeiden.",
        "ability.lastTrick.name": "Phantomschlag",
        "ability.lastTrick.text": "Extra Schaden nach erfolgreichem Ausweichen.",
        "ability.adrenaline.name": "Giftklinge",
        "ability.adrenaline.text": "Vergiftet den Gegner.",
        "ability.armorPiercer.name": "Toxischer Schnitt",
        "ability.armorPiercer.text": "Mehr Schaden gegen geschwächte Gegner.",
        "ability.riposte.name": "Todesgift",
        "ability.riposte.text": "Sehr starker Gift-Effekt.",
        "ability.powerShot.name": "Präzisionsschuss",
        "ability.powerShot.text": "Hoher Schaden.",
        "ability.rapidVolley.name": "Fokussieren",
        "ability.rapidVolley.text": "Erhöht die Chance auf kritische Treffer.",
        "ability.heartpiercer.name": "Kopfschuss",
        "ability.heartpiercer.text": "Extremer Einzelziel-Schaden.",
        "ability.distanceGuard.name": "Bärenfalle",
        "ability.distanceGuard.text": "Kontrolliert den Gegner.",
        "ability.pinningShot.name": "Tarnung",
        "ability.pinningShot.text": "Mehr Ausweichen und Crit-Chance.",
        "ability.survivalInstinct.name": "Explosionsfalle",
        "ability.survivalInstinct.text": "Großer verzögerter Schaden.",
        "ability.hunterFocus.name": "Doppelschuss",
        "ability.hunterFocus.text": "Zwei schnelle Treffer.",
        "ability.piercingArrow.name": "Pfeilsturm",
        "ability.piercingArrow.text": "Mehrere schnelle Treffer.",
        "ability.snapShot.name": "Jagdrausch",
        "ability.snapShot.text": "Massive Angriffsgeschwindigkeit.",
        "zone.normalZones": "Gebiete",
        "zone.dungeons": "Dungeons",
        "zone.switch": "Wechseln",
        "zone.unlock": "Freischalten",
        "zone.meadow.name": "Grauwacht-Wald",
        "zone.road.name": "Banditenstraße",
        "zone.fields.name": "Verfluchte Felder",
        "zone.ashgrounds.name": "Aschegrund",
        "zone.ratcellar.name": "Rattenkeller",
        "zone.crypt.name": "Krypta der Grauwacht",
        "zone.ironhold.name": "Eisenfeste",
        "zone.ashcathedral.name": "Aschekathedrale",
        "zone.levelRange": "Level {min}-{max}",
        "zone.travelEyebrow": "Reisekarte",
        "zone.travelTitle": "Reiseziel wählen",
        "zone.currentArea": "Aktuelles Gebiet",
        "zone.lockedLog": "{zone} ist noch gesperrt. {requirements}.",
        "zone.lockNeeds": "Benötigt {requirements}",
        "zone.lockAnd": " und ",
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
        "quest.completeLog": "Quest abgeschlossen: {quest}. +{xp} XP, +{gold} Gold, +{renown} Ruhm.",
        "quest.rareFoundLog": "Seltene Quest-Schriftrolle gefunden: {quest}. Sie liegt auf der Quest-Tafel.",
        "quest.rewardLog": "Questbelohnung erhalten: {item} ({quality}).",
        "quest.emptyBoard": "Die Tafel ist leer. Gewonnene Kämpfe bringen bald neue Aufträge.",
        "quest.status": "Status",
        "quest.itemReward": "Item",
        "quest.legendary": "legendär",
        "quest.epic": "episch",
        "quest.notReadyArea": "Diese Quest passt noch nicht zu deinen freigeschalteten Gebieten.",
        "quest.wolves.name": "Sichere den Waldrand",
        "quest.wolves.text": "Töte 10 Waldwölfe.",
        "quest.rust.name": "Rost für den Schmied",
        "quest.rust.text": "Sammle 5 Rostsplitter von Wegräubern.",
        "quest.elites.name": "Mut unter Stein",
        "quest.elites.text": "Besiege 3 Elite-Gegner.",
        "quest.boars.name": "Dornen im Acker",
        "quest.boars.text": "Erlege 7 Dornenkeiler.",
        "quest.dungeon.name": "Licht unter Stein",
        "quest.dungeon.text": "Besiege 8 Dungeon-Gegner.",
        "quest.bandits.name": "Wege wieder sicher",
        "quest.bandits.text": "Besiege 9 Wegräuber.",
        "quest.fields.name": "Nebel über den Feldern",
        "quest.fields.text": "Vertreibe 6 Gegner aus den verfluchten Feldern.",
        "quest.ash.name": "Asche im Wind",
        "quest.ash.text": "Besiege 6 Gegner im Aschengrund.",
        "quest.ironHound.name": "Eiserne Fährte",
        "quest.ironHound.text": "Erlege 6 Eisenhunde auf der Räuberstraße.",
        "quest.plagueCrow.name": "Schwarze Federn",
        "quest.plagueCrow.text": "Vertreibe 6 Seuchenkrähen von den Feldern.",
        "quest.fieldWraith.name": "Schemen im Nebel",
        "quest.fieldWraith.text": "Banne 5 Feldschemen in den verfluchten Feldern.",
        "quest.emberStalker.name": "Glutpirscher-Fährte",
        "quest.emberStalker.text": "Jage 5 Glutpirscher im Aschengrund.",
        "quest.crownSentinel.name": "Wacht der Krone",
        "quest.crownSentinel.text": "Besiege 4 Kronenwächter im Aschengrund.",
        "quest.ratguard.name": "Riegel im Keller",
        "quest.ratguard.text": "Besiege 4 Kellergardisten in der Krypta.",
        "quest.boneAcolyte.name": "Knochenlitanei",
        "quest.boneAcolyte.text": "Unterbrich 4 Knochenakolythen in der Krypta.",
        "quest.cryptBrute.name": "Gruftbrecher",
        "quest.cryptBrute.text": "Bezwinge 3 Gruftschläger in der Krypta.",
        "quest.chainWarden.name": "Ketten lösen",
        "quest.chainWarden.text": "Bezwinge 3 Kettenaufseher in der Eisenbruch-Festung.",
        "quest.oathForger.name": "Amboss zum Schweigen",
        "quest.oathForger.text": "Besiege 3 Eidschmiede in der Eisenbruch-Festung.",
        "quest.ironDuke.name": "Herzogsfall",
        "quest.ironDuke.text": "Stürze Herzog Eisenbruch in seiner Festung.",
        "quest.emberPriest.name": "Glutchor brechen",
        "quest.emberPriest.text": "Besiege 3 Glutpriester in der Aschenkathedrale.",
        "quest.crownBeast.name": "Bestiensehnen",
        "quest.crownBeast.text": "Erlege die Bestie der Krone in der Aschenkathedrale.",
        "quest.hollowChampion.name": "Leere Krone",
        "quest.hollowChampion.text": "Besiege den Hohlen Champion der Aschenkathedrale.",
        "rareQuest.wolf.name": "Blutspur des Rudels",
        "rareQuest.wolf.text": "Jage 9 Waldwölfe für eine alte Jagdtrophäe.",
        "rareQuest.bandit.name": "Versiegelter Steckbrief",
        "rareQuest.bandit.text": "Besiege 8 Wegräuber und bringe den Steckbrief zurück.",
        "rareQuest.elite.name": "Schwur gegen die Gefallenen",
        "rareQuest.elite.text": "Bezwinge 4 Elite-Gegner für eine seltene Reliquie.",
        "rareQuest.dungeon.name": "Runen aus der Tiefe",
        "rareQuest.dungeon.text": "Besiege 7 Dungeon-Gegner und berge eine Runenbelohnung.",
        "rareQuest.ash.name": "Schwarzer Chor",
        "rareQuest.ash.text": "Bezwinge 5 Aschengegner für eine versengte Reliquie.",
        "achievement.category.Kampf": "Kampf",
        "achievement.category.Loot": "Loot",
        "achievement.category.Schmied": "Schmied",
        "achievement.category.Mira": "Mira",
        "achievement.category.Progression": "Progression",
        "achievement.firstElite.name": "Erste Narbe",
        "achievement.firstElite.text": "Besiege deinen ersten Elite-Gegner.",
        "achievement.eliteBreaker.name": "Elitenbrecher",
        "achievement.eliteBreaker.text": "Besiege 10 Elite-Gegner.",
        "achievement.firstBoss.name": "Tor zur Tiefe",
        "achievement.firstBoss.text": "Besiege deinen ersten Dungeon-Boss.",
        "achievement.bossHunter.name": "Bossjäger",
        "achievement.bossHunter.text": "Besiege 5 Dungeon-Bosse.",
        "achievement.tenWins.name": "Nicht kleinzukriegen",
        "achievement.tenWins.text": "Gewinne 10 Kämpfe.",
        "achievement.fiftyWins.name": "Grauwacht-Veteran",
        "achievement.fiftyWins.text": "Gewinne 50 Kämpfe.",
        "achievement.tenItems.name": "Sammlerblick",
        "achievement.tenItems.text": "Entdecke 10 verschiedene Items.",
        "achievement.twentyFiveItems.name": "Schatzsucher",
        "achievement.twentyFiveItems.text": "Entdecke 25 verschiedene Items.",
        "achievement.legendaryFind.name": "Legendärer Fund",
        "achievement.legendaryFind.text": "Finde ein legendäres Item.",
        "achievement.bossTrophy.name": "Boss-Trophäe",
        "achievement.bossTrophy.text": "Finde einen festen Boss-Drop.",
        "achievement.setHunter.name": "Set-Jäger",
        "achievement.setHunter.text": "Entdecke ein Set-Item.",
        "achievement.anvilTrial.name": "Ambossprobe",
        "achievement.anvilTrial.text": "Bringe ein Item an dein aktuelles Upgrade-Limit.",
        "achievement.tenUpgrades.name": "Stahl will Arbeit",
        "achievement.tenUpgrades.text": "Verbessere Ausrüstung 10-mal.",
        "achievement.smithLimit.name": "Meisterstahl",
        "achievement.smithLimit.text": "Schalte ein neues Upgrade-Limit frei.",
        "achievement.salvager.name": "Zerleger",
        "achievement.salvager.text": "Zerlege 10 Items.",
        "achievement.firstEnchant.name": "Runenfunke",
        "achievement.firstEnchant.text": "Verzaubere dein erstes Item.",
        "achievement.secondBinding.name": "Zweite Bindung",
        "achievement.secondBinding.text": "Schalte 2 Verzauberungs-Slots frei.",
        "achievement.rareEnchant.name": "Arkane Spur",
        "achievement.rareEnchant.text": "Wirke oder trage eine seltene Verzauberung.",
        "achievement.miraAlmostSmiles.name": "Mira lächelt fast",
        "achievement.miraAlmostSmiles.text": "Schließe einen arkanen Auftrag ab.",
        "achievement.knownFighter.name": "Bekannter Kämpfer",
        "achievement.knownFighter.text": "Erreiche 10 Ruhm.",
        "enemy.eliteName": "Elite-{enemy}",
        "enemy.nextEliteLog": "Der nächste {enemy} ist eine Elite-Version.",
        "enemy.wolf.name": "Waldwolf",
        "enemy.bandit.name": "Wegräuber",
        "enemy.roadThief.name": "Straßenräuber",
        "enemy.ironHound.name": "Eisenhund",
        "enemy.boar.name": "Dornenkeiler",
        "enemy.oldKnight.name": "Alter Grenzritter",
        "enemy.plagueCrow.name": "Seuchenkrähe",
        "enemy.fieldWraith.name": "Feldschemen",
        "enemy.ashMarauder.name": "Aschenmarodeur",
        "enemy.emberStalker.name": "Glutpirscher",
        "enemy.crownSentinel.name": "Kronenwächter",
        "enemy.ratguard.name": "Kellergardist",
        "enemy.boneAcolyte.name": "Knochenakolyth",
        "enemy.cryptBrute.name": "Gruftschläger",
        "enemy.chainWarden.name": "Kettenaufseher",
        "enemy.oathForger.name": "Eidschmied",
        "enemy.ironDuke.name": "Herzog Eisenbruch",
        "enemy.emberPriest.name": "Glutpriester",
        "enemy.crownBeast.name": "Bestie der Krone",
        "enemy.hollowChampion.name": "Hohler Champion",
        "combatEvent.clearOpening.name": "Klare Öffnung",
        "combatEvent.clearOpening.text": "Du erkennst eine Lücke in der Deckung. Dein Schaden ist in diesem Kampf leicht erhöht.",
        "combatEvent.looseGround.name": "Lockerer Grund",
        "combatEvent.looseGround.text": "Der Boden gibt nach. Beide Seiten treffen etwas vorsichtiger.",
        "combatEvent.merchantRumor.name": "Händlergerücht",
        "combatEvent.merchantRumor.text": "Tilda nannte dir vorher einen Käufer. Der Goldfund dieses Kampfes ist leicht besser.",
        "combatEvent.grimOmen.name": "Düsteres Omen",
        "combatEvent.grimOmen.text": "Die Luft wird schwer. Der Gegner schlägt in diesem Kampf etwas härter zu.",
        "combatEvent.ancientCache.name": "Altes Versteck",
        "combatEvent.ancientCache.text": "Zwischen den Steinen blitzt etwas Wertvolles. Der Goldfund dieses Kampfes ist besser.",
        "combatEvent.beastTracks.name": "Frische Fährten",
        "combatEvent.beastTracks.text": "Du liest die Spuren der Bestie. Dein Schaden ist leicht erhöht.",
        "combatEvent.ashfall.name": "Ascheregen",
        "combatEvent.ashfall.text": "Asche kratzt in den Augen. Beide Seiten treffen unsauberer.",
        "combatEvent.challengerRoar.name": "Herausforderung",
        "combatEvent.challengerRoar.text": "Der Gegner erzwingt ein hartes Duell. Beide Seiten schlagen entschlossener zu.",
        "save.title": "Spielstand",
        "save.download": "Spielstand herunterladen",
        "save.load": "Spielstand laden",
        "save.downloadText": "Speichert deinen Fortschritt als JSON-Datei.",
        "save.newRun": "Von Anfang an spielen",
        "save.newRunText": "Setzt den Fortschritt zurück und startet einen frischen Spielstand.",
        "save.newRunConfirm": "Wirklich von vorne anfangen? Dein aktueller Browser-Spielstand wird überschrieben. Lade vorher eine Sicherung herunter, wenn du ihn behalten willst.",
        "save.newRunLog": "Neuer Spielstand begonnen.",
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
        "achievements.claimLog": "Erfolg eingelöst: {achievement}. Belohnung: {reward}.",
        "achievements.readyLog": "Neuer Erfolg bereit: {achievement}.",
        "achievements.readyManyLog": "{count} neue Erfolge sind bereit.",
        "bestiary.title": "Bestiarium",
        "bestiary.eyebrow": "Buch der Gegner",
        "bestiary.typeTabs": "Bestiarium-Bereiche",
        "bestiary.tabZones": "Gebiete",
        "bestiary.tabDungeons": "Dungeons",
        "bestiary.sectionLabel": "Bereich",
        "bestiary.zoneSectionTitle": "Normale Gebiete",
        "bestiary.dungeonSectionTitle": "Dungeon-Bosse",
        "bestiary.zoneSectionHint": "Gegner, Materialien und Beute aus offenen Gebieten.",
        "bestiary.dungeonSectionHint": "Bossdaten, erste Siege und feste Drops.",
        "bestiary.enemyCount": "{count} Gegner",
        "bestiary.bossCount": "{count} Bosse",
        "bestiary.zones": "Gebiete",
        "bestiary.finds": "Funde",
        "bestiary.dungeonProgress": "Dungeon-Fortschritt",
        "bestiary.firstWins": "Erste Siege",
        "bestiary.bossKills": "Boss-Siege",
        "bestiary.fixedDropsShort": "Feste Drops",
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
        "bestiary.firstWinClaimedShort": "Erster Sieg geholt",
        "bestiary.firstWinOpen": "Erster Sieg offen",
        "bestiary.fixedDropCount": "{count} feste Drops",
        "bestiary.noSpecialReward": "Keine Sonderbelohnung",
        "bestiary.bossLoot": "Bossbeute",
        "bestiary.noBossLoot": "Keine feste Bossbeute",
        "bestiary.bossDropPity": "Beutedruck",
        "bestiary.bossDropPityCount": "Beutedruck {count}/{target}",
        "bestiary.bossDropPityHint": "Beutedruck {count}/{target}: feste Bossbeute wird nach Pech garantiert.",
        "bestiary.bossDropGuaranteedNext": "Nächster Sieg garantiert feste Bossbeute",
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
        "smith.masteryBlockedLog": "Borin Glutbart schüttelt den Kopf. Für diesen Meisterauftrag fehlt dir noch etwas.",
        "smith.masteryStartLog": "Meisterauftrag begonnen: {name}.",
        "smith.masteryIncompleteLog": "Borin Glutbart knurrt: Bring mir Erz, nicht Ausreden.",
        "smith.masteryCompleteLog": "Borin Glutbart vollendet \"{name}\". Neues Upgrade-Limit: +{limit}. +{renown} Ruhm.",
        "smith.limitLog": "Borin Glutbart knurrt: Der Stahl braucht erst bessere Bindung.",
        "smith.costMissingLog": "Borin Glutbart knurrt: Dem Amboss fehlen noch Material oder Gold.",
        "smith.upgradeLog": "{item} beim Schmied verbessert.",
        "smith.salvageBonusLog": "Sauber zerlegt: +{amount} {material}.",
        "smith.salvageLog": "{item} zerlegt. Erhalten: {materials}.",
        "smith.salvageAllLog": "{count} Items zerlegt. Erhalten: {materials}.",
        "smith.salvageAllBonusLog": "{count} Items wurden sauber zerlegt und gaben Bonus-Material.",
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
        "smith.focusLabel": "Borins Handwerksfokus",
        "smith.focusTitle": "Verl\u00e4ssliches Handwerk",
        "smith.focusText": "Borin macht Ausr\u00fcstung berechenbar st\u00e4rker: verbessern, reparieren, zerlegen.",
        "smith.focus.1": "Upgrades",
        "smith.focus.2": "Material",
        "smith.focus.3": "Reparatur",
        "enchant.title": "Mira Nachtfaden",
        "enchant.eyebrow": "Arkanistin der Grauwacht",
        "enchant.action": "Verzaubern",
        "enchant.focusLabel": "Miras arkaner Fokus",
        "enchant.focusTitle": "Runenrisiko",
        "enchant.focusText": "Mira ver\u00e4ndert Items mit Runen: seltene Effekte, Slot-Grenzen und arkane Meisterschaft.",
        "enchant.focus.1": "Runen",
        "enchant.focus.2": "Seltene Effekte",
        "enchant.focus.3": "Arkane Slots",
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
        "enchant.masteryBlockedLog": "Mira Nachtfaden lächelt spitz: Erst die Prüfung, dann das Ritual.",
        "enchant.masteryStartLog": "Arkaner Auftrag begonnen: {name}.",
        "enchant.masteryIncompleteLog": "Mira Nachtfaden tippt auf den Runenkreis. Er bleibt kalt.",
        "enchant.masteryCompleteLog": "Mira vollendet \"{name}\". {reward} +{renown} Ruhm.",
        "enchant.tooLowLog": "Mira Nachtfaden erscheint erst, wenn du erfahren genug bist.",
        "enchant.noSlotLog": "{item} hat aktuell keinen freien Verzauberungs-Slot.",
        "enchant.costMissingLog": "Mira Nachtfaden braucht mehr Gold, Runensplitter oder Mondstaub.",
        "enchant.noRuneForItemLog": "Für dieses Item passt in dieser Kategorie keine freie Verzauberung.",
        "enchant.successLog": "{item} verzaubert: {enchantment}.",
        "save.backupLootReason": "du hast {quality}e Beute erhalten.",
        "save.backupSmithReason": "Borin hat seine Werkstatt erweitert.",
        "save.backupEnchantReason": "Mira hat deine Runenbindung erweitert.",
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

Object.assign(translations.de, {
    "renownRank.0.name": "Fremder",
    "renownRank.0.benefit": "Noch kein Vorteil",
    "renownRank.5.name": "Bekannter Kämpfer",
    "renownRank.5.benefit": "Reparaturen -10%",
    "renownRank.10.name": "Verlässliche Klinge",
    "renownRank.10.benefit": "Quest-Tafel hält 4 Aufträge bereit",
    "renownRank.15.name": "Schmiedefreund",
    "renownRank.15.benefit": "Zerlegen kann Bonus-Material geben",
    "renownRank.20.name": "Held der Grauwacht",
    "renownRank.20.benefit": "Upgrades -8% Goldkosten",
    "renownRank.30.name": "Eliteschrecken",
    "renownRank.30.benefit": "Elite-Gegner und Zerlegen geben bessere Chancen",
    "renownRank.40.name": "Meister der Grauwacht",
    "renownRank.40.benefit": "Seltene Aufträge erscheinen öfter",
    "smithMastery.emberAnvil.name": "Glut des Ambosses",
    "smithMastery.emberAnvil.text": "Ausrüstung kann bis +10 verbessert werden. Reparaturen dauerhaft -5%.",
    "smithMastery.pressureSteel.name": "Stahl unter Druck",
    "smithMastery.pressureSteel.text": "Ausrüstung kann bis +15 verbessert werden. Upgrade-Goldkosten dauerhaft -5%.",
    "smithMastery.watchMastermark.name": "Meisterzeichen der Grauwacht",
    "smithMastery.watchMastermark.text": "Ausrüstung kann bis +20 verbessert werden. Reparaturen dauerhaft zusätzlich -10%.",
    "enchantMastery.unstableRunes.name": "Instabile Magie",
    "enchantMastery.unstableRunes.text": "Mira öffnet den zweiten Runen-Slot und seltene Verzauberungen.",
    "enchantMastery.forbiddenLibrary.name": "Die verbotene Bibliothek",
    "enchantMastery.forbiddenLibrary.text": "Mira öffnet den dritten Runen-Slot und epische Verzauberungen.",
    "enchantMastery.voidRitual.name": "Das Ritual der Leere",
    "enchantMastery.voidRitual.text": "Arkane Meisterschaft freigeschaltet: extrem seltene instabile Verzauberungen können erscheinen.",
    "set.wolf.name": "Rudeljäger",
    "set.wolf.bonus.2": "+3 Schaden, +1 Verteidigung",
    "set.wolf.bonus.4": "+5 Schaden, +4 Verteidigung",
    "set.wolf.bonus.6": "+11 Schaden, +7 Verteidigung, +18 Leben",
    "set.iron.name": "Grenzwacht",
    "set.iron.bonus.2": "+5 Verteidigung",
    "set.iron.bonus.4": "+3 Schaden, +10 Verteidigung",
    "set.iron.bonus.6": "+7 Schaden, +20 Verteidigung, +26 Leben",
    "set.crypt.name": "Gruftbund",
    "set.crypt.bonus.2": "+4 Schaden, +12 Leben",
    "set.crypt.bonus.4": "+7 Schaden, +6 Verteidigung, +22 Leben",
    "set.crypt.bonus.6": "+13 Schaden, +11 Verteidigung, +48 Leben",
    "set.ashen.name": "Aschenkrone",
    "set.ashen.bonus.2": "+8 Schaden, +5 Verteidigung",
    "set.ashen.bonus.4": "+14 Schaden, +11 Verteidigung, +32 Leben",
    "set.ashen.bonus.6": "+28 Schaden, +19 Verteidigung, +64 Leben",
    "item.trainingSword.name": "Übungsschwert",
    "item.wornBuckler.name": "Abgenutzter Buckler",
    "item.paddedVest.name": "Gepolsterte Weste",
    "item.patchedTrousers.name": "Geflickte Hose",
    "item.travelBoots.name": "Reisestiefel",
    "item.twineNecklace.name": "Kordelhalskette",
    "item.copperRing.name": "Kupferring",
    "item.wolfRing.name": "Ring des Rudels",
    "item.rustBlade.name": "Rostklinge",
    "item.tollKnife.name": "Zollmesser",
    "item.houndGreaves.name": "Eisenhund-Stiefel",
    "item.hideArmor.name": "Dornenleder",
    "item.oathRing.name": "Eidring",
    "item.knightPlate.name": "Grenzritterplatte",
    "item.crowTalisman.name": "Seuchentalisman",
    "item.wraithLantern.name": "Schemenlaterne",
    "item.ashHook.name": "Aschenhaken",
    "item.emberClaw.name": "Glutklaue",
    "item.sentinelVisor.name": "Kronenvisier",
    "item.guardAxe.name": "Gardistenaxt",
    "item.cellkeeperBulwark.name": "Bollwerk des Zellhüters",
    "item.graveRing.name": "Grablichtring",
    "item.boneChalice.name": "Kelch der stillen Knochen",
    "item.bruteMail.name": "Schlägerkettenhemd",
    "item.cryptCrusher.name": "Gruftspalter",
    "item.wardenChain.name": "Kette des Aufsehers",
    "item.wardenShackle.name": "Aufseherfessel",
    "item.forgeHammer.name": "Hammer des Eidschmieds",
    "item.oathMantle.name": "Eidmantel",
    "item.dukeSignet.name": "Siegel des Herzogs",
    "item.ironCrownplate.name": "Eisenkronenplatte",
    "item.emberRosary.name": "Glutrosenkranz",
    "item.emberCenser.name": "Rauchfass der Glutmesse",
    "item.crownFang.name": "Kronenfang",
    "item.royalSpurs.name": "Königssporn",
    "item.ashenGreatsword.name": "Aschgraues Großschwert",
    "item.crownShard.name": "Splitter der Krone",
    "lootName.Kerbenschwert": "Kerbenschwert",
    "lootName.Feldbeil": "Feldbeil",
    "lootName.Wachklinge": "Wachklinge",
    "lootName.Runenklinge": "Runenklinge",
    "lootName.Blutrost-Axt": "Blutrost-Axt",
    "lootName.Silberfalchion": "Silberfalchion",
    "lootName.Eidbrecher": "Eidbrecher",
    "lootName.Sternstahlklinge": "Sternstahlklinge",
    "lootName.Gruftspalter": "Gruftspalter",
    "lootName.Königsschneide": "Königsschneide",
    "lootName.Aschenurteil": "Aschenurteil",
    "lootName.Drachenzahn": "Drachenzahn",
    "lootName.Holzschild": "Holzschild",
    "lootName.Parierdolch": "Parierdolch",
    "lootName.Rostbuckler": "Rostbuckler",
    "lootName.Wolfsbuckler": "Wolfsbuckler",
    "lootName.Gardistenschild": "Gardistenschild",
    "lootName.Hakenklinge": "Hakenklinge",
    "lootName.Eidwall": "Eidwall",
    "lootName.Runenfokus": "Runenfokus",
    "lootName.Gruftlaterne": "Gruftlaterne",
    "lootName.Sonnenschild": "Sonnenschild",
    "lootName.Aschenfokus": "Aschenfokus",
    "lootName.Splitterparade": "Splitterparade",
    "lootName.Lederwams": "Lederwams",
    "lootName.Kettenfetzen": "Kettenfetzen",
    "lootName.Reiserüstung": "Reiserüstung",
    "lootName.Wolfsleder": "Wolfsleder",
    "lootName.Schildplattenrock": "Schildplattenrock",
    "lootName.Schuppenpanzer": "Schuppenpanzer",
    "lootName.Eidhüterplatte": "Eidhüterplatte",
    "lootName.Nachtkettenhemd": "Nachtkettenhemd",
    "lootName.Runenharnisch": "Runenharnisch",
    "lootName.Krone der Bastion": "Krone der Bastion",
    "lootName.Aschenpanzer": "Aschenpanzer",
    "lootName.Sonnenharnisch": "Sonnenharnisch",
    "lootName.Leinenhose": "Leinenhose",
    "lootName.Wanderbeinlinge": "Wanderbeinlinge",
    "lootName.Kettenhose": "Kettenhose",
    "lootName.Wolfsbeinlinge": "Wolfsbeinlinge",
    "lootName.Schmiedeplatten": "Schmiedeplatten",
    "lootName.Räuberhose": "Räuberhose",
    "lootName.Eidbeinplatten": "Eidbeinplatten",
    "lootName.Grabstahl-Beinlinge": "Grabstahl-Beinlinge",
    "lootName.Runenbeinpanzer": "Runenbeinpanzer",
    "lootName.Aschenbeinplatten": "Aschenbeinplatten",
    "lootName.Königsgamaschen": "Königsgamaschen",
    "lootName.Sonnenbeinschutz": "Sonnenbeinschutz",
    "lootName.Lederstiefel": "Lederstiefel",
    "lootName.Marschschuhe": "Marschschuhe",
    "lootName.Eisenkappen": "Eisenkappen",
    "lootName.Fährtenstiefel": "Fährtenstiefel",
    "lootName.Wachstiefel": "Wachstiefel",
    "lootName.Dornenläufer": "Dornenläufer",
    "lootName.Eidtreter": "Eidtreter",
    "lootName.Gruftschritte": "Gruftschritte",
    "lootName.Runensohlen": "Runensohlen",
    "lootName.Aschenläufer": "Aschenläufer",
    "lootName.Sonnenstiefel": "Sonnenstiefel",
    "lootName.Kronenschritte": "Kronenschritte",
    "lootName.Holzamulett": "Holzamulett",
    "lootName.Kordelkette": "Kordelkette",
    "lootName.Kupfertalisman": "Kupfertalisman",
    "lootName.Wolfszahnkette": "Wolfszahnkette",
    "lootName.Rostmedaillon": "Rostmedaillon",
    "lootName.Wachhalsreif": "Wachhalsreif",
    "lootName.Eidamulett": "Eidamulett",
    "lootName.Grablichtkette": "Grablichtkette",
    "lootName.Runenhalsreif": "Runenhalsreif",
    "lootName.Aschenmedaillon": "Aschenmedaillon",
    "lootName.Sonnenanhänger": "Sonnenanhänger",
    "lootName.Kronentalisman": "Kronentalisman",
    "lootName.Zinnring": "Zinnring",
    "lootName.Feldreif": "Feldreif",
    "lootName.Schlichter Talisman": "Schlichter Talisman",
    "lootName.Blutsteinring": "Blutsteinring",
    "lootName.Wolfszeichen": "Wolfszeichen",
    "lootName.Wachtersiegel": "Wachtersiegel",
    "lootName.Grablichtreif": "Grablichtreif",
    "lootName.Eidsiegel": "Eidsiegel",
    "lootName.Sternsplitterring": "Sternsplitterring",
    "lootName.Splitterkrone": "Splitterkrone",
    "lootName.Ring des alten Feuers": "Ring des alten Feuers",
    "lootName.Königszeichen": "Königszeichen",
    "itemEffect.huntingMark.name": "Jagdsiegel",
    "itemEffect.huntingMark.text": "+3% Crit-Chance und +4% Schaden gegen Elite-Gegner und Bosse.",
    "itemEffect.ironWard.name": "Eisenwacht",
    "itemEffect.ironWard.text": "Der erste Gegentreffer wird um 8% reduziert und gegnerische Crit-Chance sinkt um 2%.",
    "itemEffect.pilgrimPace.name": "Pilgerschritt",
    "itemEffect.pilgrimPace.text": "Haltbarkeitsverlust -6% und nach Siegen +5% Gold.",
    "itemEffect.mendersThread.name": "Heilerfaden",
    "itemEffect.mendersThread.text": "Kritische Treffer heilen 1% Leben. Nach einem Sieg heilt 2% Leben.",
    "itemEffect.openingCut.name": "Eröffnungsschnitt",
    "itemEffect.openingCut.text": "Der erste Treffer im Kampf verursacht 10% mehr Schaden.",
    "itemEffect.scavengerCharm.name": "Fundglanz",
    "itemEffect.scavengerCharm.text": "+5% Beutequalität und nach Siegen +4% Gold.",
    "itemEffect.battleLesson.name": "Kampferfahrung",
    "itemEffect.battleLesson.text": "+6% XP nach Siegen und +2% Crit-Chance gegen Elite-Gegner und Bosse.",
    "itemEffect.ashTempo.name": "Aschentakt",
    "itemEffect.ashTempo.text": "Der erste Treffer verursacht 8% mehr Schaden. Kritische Treffer verursachen Brennen.",
    "itemEffect.revenantSeal.name": "Wiedergängersiegel",
    "itemEffect.revenantSeal.text": "Der erste Treffer schwächt den Gegenschlag. +5% XP nach Siegen und 2% Heilung nach Sieg.",
    "itemEffect.firstStrikeCombat": "Eröffnungsschnitt verstärkt den Treffer."
});

Object.assign(translations.de, {
    "smith.masteryIntro.emberAnvil": "Dein Stahl ist an seiner Grenze. Mein Amboss braucht heißeres Feuer.",
    "smith.masteryIntro.pressureSteel": "Du hast deinen Stahl weit gebracht. Jetzt braucht er Druck, nicht nur Feuer.",
    "smith.masteryIntro.watchMastermark": "Jetzt reden wir nicht mehr über bessere Arbeit. Jetzt reden wir über einen Schwur im Metall.",
    "enchant.completeQuote": "Jetzt hörst du es auch, oder? Stahl flüstert, wenn die Rune richtig sitzt.",
    "enchant.masteryIntro.unstableRunes": "Die erste Rune hält. Jetzt will ich sehen, ob sie auch unter Druck singt.",
    "enchant.masteryIntro.forbiddenLibrary": "Drei Bindungen brauchen Wissen, das man nicht offen liegen lässt.",
    "enchant.masteryIntro.voidRitual": "Die Leere beantwortet nur Fragen, die klug genug gestellt werden.",
    "enchant.masteryIntro.default": "Magie ist kein Schmuck. Sie ist ein Handel.",
    "smith.dialogue.0.0.title": "Borin mustert deine Ausrüstung.",
    "smith.dialogue.0.0.text": "Eine Klinge lügt nicht. Entweder sie hält, oder sie bricht.",
    "smith.dialogue.0.1.title": "Borin klopft auf den Amboss.",
    "smith.dialogue.0.1.text": "Gold auf den Tisch, Material daneben. Freundliche Worte härten keinen Stahl.",
    "smith.dialogue.5.0.title": "Borin nickt knapp.",
    "smith.dialogue.5.0.text": "Du kommst öfter zurück, als ich erwartet habe. Gut. Deine Sachen halten schon mehr aus.",
    "smith.dialogue.5.1.title": "Borin nimmt dein Schwert genauer.",
    "smith.dialogue.5.1.text": "Für dich nehme ich mir einen sauberen Amboss. Reparaturen werden etwas günstiger.",
    "smith.dialogue.5.2.title": "Borin schnaubt zufrieden.",
    "smith.dialogue.5.2.text": "Du überlebst. Das ist in Grauwacht fast schon ein Empfehlungsschreiben.",
    "smith.dialogue.10.0.title": "Borin grüßt dich mit einem Nicken.",
    "smith.dialogue.10.0.text": "Die Quest-Tafel hört auf deinen Namen. Mehr Aufträge bedeuten mehr Gründe für bessere Klingen.",
    "smith.dialogue.10.1.title": "Borin wischt Ruß von seinen Händen.",
    "smith.dialogue.10.1.text": "Verlässliche Hände bekommen verlässliche Aufträge. Such dir aus, was dich nicht umbringt.",
    "smith.dialogue.15.0.title": "Der Zwergenmeister prüft eine Klinge im Licht.",
    "smith.dialogue.15.0.text": "Aus Schrott kann man mehr holen, wenn man weiß, wo man schneiden muss. Ich helfe dir beim Zerlegen.",
    "smith.dialogue.15.1.title": "Borin sortiert deine Beute.",
    "smith.dialogue.15.1.text": "Wegwerfen wäre Verschwendung. Gib mir die Teile, ich finde noch brauchbares Material darin.",
    "smith.dialogue.15.2.title": "Borin legt Material beiseite.",
    "smith.dialogue.15.2.text": "Du bringst mir gute Arbeit. Dafür hole ich dir aus altem Zeug ein bisschen mehr heraus.",
    "smith.dialogue.20.0.title": "Borin zieht die Augenbraue hoch.",
    "smith.dialogue.20.0.text": "Jetzt reden wir nicht mehr über Flickwerk. Deine Upgrades bekommen meinen besten Preis.",
    "smith.dialogue.20.1.title": "Borin lächelt fast.",
    "smith.dialogue.20.1.text": "Held der Grauwacht, hm? Dann soll deine Ausrüstung auch danach klingen.",
    "smith.dialogue.30.0.title": "Borin senkt die Stimme.",
    "smith.dialogue.30.0.text": "Elite-Gegner tragen bessere Spuren am Stahl. Bring sie mir, ich erkenne den Wert.",
    "smith.dialogue.30.1.title": "Borin prüft deine Narben.",
    "smith.dialogue.30.1.text": "Wer Eliten jagt, braucht mehr als Mut. Deine Beute behandle ich entsprechend.",
    "smith.dialogue.30.2.title": "Borin arbeitet ohne aufzusehen.",
    "smith.dialogue.30.2.text": "Du suchst die gefährlichen Kämpfe. Gut. Gefährliche Beute lässt sich besser verwerten.",
    "smith.dialogue.40.0.title": "Borin spricht wie zu einem Verbündeten.",
    "smith.dialogue.40.0.text": "Meister der Grauwacht. Für dich halte ich die seltenen Aufträge nicht mehr unter der Theke.",
    "smith.dialogue.40.1.title": "Borin reicht dir das beste Werkzeug.",
    "smith.dialogue.40.1.text": "Du hast dir Vertrauen verdient. Wenn etwas Besonderes auftaucht, erfährst du es zuerst.",
    "smith.dialogue.40.2.title": "Borin schlägt den Hammer langsam an.",
    "smith.dialogue.40.2.text": "Jetzt bauen wir nicht nur Ausrüstung. Jetzt bauen wir Legenden, Stück für Stück."
});

function normalizeLanguage(language) {
    return supportedLanguages.includes(language) ? language : "de";
}

function syncGermanFallbackKeys() {
    if (!translations.en) return;
    Object.keys(translations.en).forEach((key) => {
        if (Object.prototype.hasOwnProperty.call(translations.de, key)) return;
        translations.de[key] = germanFallbackForTranslationKey(key) ?? translations.en[key];
    });
}

function germanFallbackForTranslationKey(key) {
    const entityMatch = key.match(/^(itemEffect|enchantment|item|enemyAbility|smithMastery|enchantMastery)\.([^.]+)\.(name|text)$/);
    if (entityMatch) {
        const [, group, id, field] = entityMatch;
        const sources = {
            itemEffect: typeof itemEffectCatalog !== "undefined" ? itemEffectCatalog : null,
            enchantment: typeof enchantmentCatalog !== "undefined" ? enchantmentCatalog : null,
            item: typeof items !== "undefined" ? items : null,
            enemyAbility: typeof enemyAbilityCatalog !== "undefined" ? enemyAbilityCatalog : null,
            smithMastery: typeof smithMasteryRanks !== "undefined" ? Object.fromEntries(smithMasteryRanks.map((rank) => [rank.id, rank])) : null,
            enchantMastery: typeof enchantMasteryRanks !== "undefined" ? Object.fromEntries(enchantMasteryRanks.map((rank) => [rank.id, rank])) : null,
        };
        return sources[group]?.[id]?.[field] || "";
    }
    const setMatch = key.match(/^set\.([^.]+)\.(name|bonus)\.?(\d+)?$/);
    if (setMatch && typeof setBonuses !== "undefined") {
        const [, setId, field, count] = setMatch;
        return field === "name" ? setBonuses[setId]?.name : setBonuses[setId]?.bonuses?.[count]?.text;
    }
    const rankMatch = key.match(/^renownRank\.(\d+)\.(name|benefit)$/);
    if (rankMatch && typeof renownRanks !== "undefined") {
        const [, threshold, field] = rankMatch;
        return renownRanks.find((rank) => String(rank.threshold) === threshold)?.[field];
    }
    if (key.startsWith("lootName.")) return key.slice("lootName.".length);
    return undefined;
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
    if (typeof tooltipHtmlCache !== "undefined") tooltipHtmlCache.clear();
    if (typeof bestiaryListDirty !== "undefined") bestiaryListDirty = true;
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

function enemyDisplayName(enemy, enemyId = "") {
    const id = enemyId || enemy?.baseId || enemyIdFor(enemy);
    const baseName = entityName("enemy", id, enemy?.name || id);
    return enemy?.eliteVariant ? t("enemy.eliteName", "Elite-{enemy}", { enemy: baseName }) : baseName;
}

function enemyIdFor(enemy) {
    if (!enemy || typeof enemies === "undefined") return "";
    return Object.entries(enemies).find(([, candidate]) => candidate === enemy)?.[0] || "";
}

function questDisplayName(quest) {
    if (quest?.key && quest?.id?.startsWith?.("rare-")) {
        return entityName("rareQuest", quest.key, quest.name || "");
    }
    return entityName("quest", quest?.id, quest?.name || "");
}

function questDisplayText(quest) {
    if (quest?.key && quest?.id?.startsWith?.("rare-")) {
        return entityText("rareQuest", quest.key, quest.text || "");
    }
    return entityText("quest", quest?.id, quest?.text || "");
}

function achievementCategoryName(category) {
    return t(`achievement.category.${category}`, category);
}

function achievementDisplayName(achievement) {
    return entityName("achievement", achievement?.id, achievement?.name || "");
}

function achievementDisplayText(achievement) {
    return entityText("achievement", achievement?.id, achievement?.text || "");
}

function knownObjectId(collection, value) {
    if (!collection || !value) return "";
    return Object.entries(collection).find(([, entry]) => entry === value)?.[0] || "";
}

function splitItemNameParts(name = "") {
    const upgrade = name.match(/\s\+\d+$/)?.[0] || "";
    let baseName = upgrade ? name.slice(0, -upgrade.length) : name;
    const graywatchSuffix = baseName.endsWith(" der Grauwacht");
    if (graywatchSuffix) baseName = baseName.slice(0, -" der Grauwacht".length);
    return { baseName, graywatchSuffix, upgrade };
}

function lootNameDisplayName(name = "") {
    return t(`lootName.${name}`, name);
}

function itemIdFor(item, itemId = "") {
    if (itemId && typeof items !== "undefined" && items[itemId]) return itemId;
    if (item?.id && typeof items !== "undefined" && items[item.id]) return item.id;
    return typeof items !== "undefined" ? knownObjectId(items, item) : "";
}

function itemDisplayName(item, itemId = "") {
    if (!item) return "";
    const fixedId = itemIdFor(item, itemId);
    if (fixedId) {
        const translated = entityName("item", fixedId, items[fixedId]?.name || item.name || fixedId);
        const upgrade = item.upgrade ? ` +${item.upgrade}` : item.name?.match(/\s\+\d+$/)?.[0] || "";
        return translated.endsWith(upgrade) ? translated : `${translated}${upgrade}`;
    }
    const { baseName, graywatchSuffix, upgrade } = splitItemNameParts(item.name || "");
    const suffix = graywatchSuffix ? ` ${t("item.suffix.graywatch", "der Grauwacht")}` : "";
    return `${lootNameDisplayName(baseName)}${suffix}${upgrade}`;
}

function itemEffectDisplayName(effectId) {
    const effect = typeof itemEffectCatalog !== "undefined" ? itemEffectCatalog[effectId] : null;
    return entityName("itemEffect", effectId, effect?.name || effectId || "");
}

function itemEffectDisplayText(effectId) {
    const effect = typeof itemEffectCatalog !== "undefined" ? itemEffectCatalog[effectId] : null;
    return entityText("itemEffect", effectId, effect?.text || "");
}

function enchantmentDisplayName(enchantment, enchantmentId = "") {
    const id = enchantmentId || enchantment?.id || (typeof enchantmentCatalog !== "undefined" ? knownObjectId(enchantmentCatalog, enchantment) : "");
    return entityName("enchantment", id, enchantment?.name || id || "");
}

function enchantmentDisplayText(enchantment, enchantmentId = "") {
    const id = enchantmentId || enchantment?.id || (typeof enchantmentCatalog !== "undefined" ? knownObjectId(enchantmentCatalog, enchantment) : "");
    return entityText("enchantment", id, enchantment?.text || "");
}

function setDisplayName(setId) {
    const set = typeof setBonuses !== "undefined" ? setBonuses[setId] : null;
    return entityName("set", setId, set?.name || setId || "");
}

function setBonusDisplayText(setId, count) {
    const bonus = typeof setBonuses !== "undefined" ? setBonuses[setId]?.bonuses?.[count] : null;
    return t(`set.${setId}.bonus.${count}`, bonus?.text || "");
}

function enemyAbilityDisplayName(ability, abilityId = "") {
    const id = abilityId || (typeof enemyAbilityCatalog !== "undefined" ? knownObjectId(enemyAbilityCatalog, ability) : "");
    return entityName("enemyAbility", id, ability?.name || id || "");
}

function enemyAbilityDisplayText(ability, abilityId = "") {
    const id = abilityId || (typeof enemyAbilityCatalog !== "undefined" ? knownObjectId(enemyAbilityCatalog, ability) : "");
    return entityText("enemyAbility", id, ability?.text || "");
}

function renownRankName(rank) {
    return t(`renownRank.${rank?.threshold}.name`, rank?.name || "");
}

function renownRankBenefit(rank) {
    return t(`renownRank.${rank?.threshold}.benefit`, rank?.benefit || "");
}

function smithMasteryName(rank) {
    return entityName("smithMastery", rank?.id, rank?.name || "");
}

function smithMasteryReward(rank) {
    return entityText("smithMastery", rank?.id, rank?.reward || "");
}

function enchantMasteryName(rank) {
    return entityName("enchantMastery", rank?.id, rank?.name || "");
}

function enchantMasteryReward(rank) {
    return entityText("enchantMastery", rank?.id, rank?.reward || "");
}

function combatEventName(event) {
    return entityName("combatEvent", event?.id, event?.name || "");
}

function combatEventText(event) {
    return entityText("combatEvent", event?.id, event?.text || "");
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
    setStaticText("#openMerchantBtn span", "nav.merchant");
    setStaticText("#openSmithBtn span", "nav.smith");
    setStaticText("#openEnchantBtn span", "nav.enchant");
    setStaticText("#openSaveMenuBtn span", "nav.save");
    setStaticText("#languageButtonLabel", "nav.language");
    setStaticText("#languageButtonValue", "language.value");
    setStaticText("#lootTitle", "loot.title");
    setStaticText("#inventoryTitle", "inventory.title");
    setStaticText("#merchantTitle", "merchant.title");
    setStaticText("#zoneTitle", "zone.travelTitle");
    setStaticText("#bestiaryTitle", "bestiary.title");
    setStaticText("#questBoardTitle", "quest.title");
    setStaticText("#achievementsTitle", "achievements.title");
    setStaticText("#saveTitle", "save.title");
    setStaticText("#repairTitle", "equipment.repairTitle");
    setStaticText("#equipmentTitle", "equipment.wornTitle");
    setStaticText("#playerStatsTitle", "main.playerStats");
    setStaticText("#classModalTitle", "main.changeClass");
    setStaticText("#openPlayerStatsBtn", "main.playerStats");
    setStaticText("#logTitle", "log.title");
    setStaticText("#combatLogEyebrow", "combat.log");
    setStaticText("#combatLogTitle", "combat.lastFight");
    setStaticText(".character-status div:nth-child(1) span", "common.level");
    setStaticText(".character-status div:nth-child(2) span", "common.gold");
    setStaticText(".character-status div:nth-child(3) span", "common.renown");
    setStaticText("#buildSectionTitle", "main.build");
    setStaticText("#abilitiesSectionTitle", "main.abilities");
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
    setStaticText("#merchantModal .eyebrow", "merchant.eyebrow");
    setStaticText("#bestiaryModal .eyebrow", "bestiary.eyebrow");
    setStaticText("#questBoardModal .eyebrow", "nav.quests");
    setStaticText("#achievementsModal .eyebrow", "nav.achievements");
    setStaticText("#saveMenuModal .eyebrow", "save.title");
    setStaticText("#saveModal .eyebrow", "save.title");
    setStaticText("#repairModal .eyebrow", "smith.repair");
    setStaticText("#equipmentModal .eyebrow", "main.equipment");
    setStaticText("#playerStatsModal .eyebrow", "common.character");
    setStaticText("#classModal .eyebrow", "common.character");
    setStaticText("#logModal .eyebrow", "log.eyebrow");
    setStaticText("#combatLogModal .eyebrow", "combat.log");
    setStaticText("#exportSaveTopBtn strong", "save.download");
    setStaticText("#exportSaveTopBtn span", "save.downloadText");
    setStaticText("#newGameTopBtn strong", "save.newRun");
    setStaticText("#newGameTopBtn span", "save.newRunText");
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
    setStaticAria("#openClassModalBtn", "main.changeClass");
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
