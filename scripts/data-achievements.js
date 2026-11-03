achievementCatalog = [
  { id: "firstElite", category: "Kampf", name: "Erste Narbe", text: "Besiege deinen ersten Elite-Gegner.", metric: "eliteKills", target: 1, reward: { renown: 1, gold: 40 } },
  { id: "eliteBreaker", category: "Kampf", name: "Elitenbrecher", text: "Besiege 10 Elite-Gegner.", metric: "eliteKills", target: 10, reward: { renown: 2, materials: { oathSteel: 3 } } },
  { id: "firstBoss", category: "Kampf", name: "Tor zur Tiefe", text: "Besiege deinen ersten Dungeon-Boss.", metric: "bossKills", target: 1, reward: { renown: 2, materials: { graveSeal: 1 } } },
  { id: "bossHunter", category: "Kampf", name: "Bossjäger", text: "Besiege 5 Dungeon-Bosse.", metric: "bossKills", target: 5, title: "Bossjäger", reward: { renown: 3, materials: { crownAsh: 2 } } },
  { id: "tenWins", category: "Kampf", name: "Nicht kleinzukriegen", text: "Gewinne 10 Kämpfe.", metric: "wins", target: 10, reward: { gold: 70, materials: { leather: 2 } } },
  { id: "fiftyWins", category: "Kampf", name: "Grauwacht-Veteran", text: "Gewinne 50 Kämpfe.", metric: "wins", target: 50, title: "Veteran", reward: { renown: 2, gold: 250 } },

  { id: "tenItems", category: "Loot", name: "Sammlerblick", text: "Entdecke 10 verschiedene Items.", metric: "discoveredItems", target: 10, reward: { gold: 80, materials: { shard: 2 } } },
  { id: "twentyFiveItems", category: "Loot", name: "Schatzsucher", text: "Entdecke 25 verschiedene Items.", metric: "discoveredItems", target: 25, reward: { renown: 1, materials: { moonDust: 3 } } },
  { id: "legendaryFind", category: "Loot", name: "Legendärer Fund", text: "Finde ein legendäres Item.", metric: "legendaryItems", target: 1, title: "Glückspilz", reward: { renown: 2, materials: { emberCore: 2 } } },
  { id: "bossTrophy", category: "Loot", name: "Boss-Trophäe", text: "Finde einen festen Boss-Drop.", metric: "fixedBossDrops", target: 1, reward: { renown: 2, materials: { crownAsh: 1 } } },
  { id: "setHunter", category: "Loot", name: "Set-Jäger", text: "Entdecke ein Set-Item.", metric: "setItems", target: 1, reward: { renown: 1, materials: { sinew: 2 } } },

  { id: "anvilTrial", category: "Schmied", name: "Ambossprobe", text: "Bringe ein Item an dein aktuelles Upgrade-Limit.", metric: "itemAtLimit", target: 1, reward: { renown: 1, materials: { scrap: 3 } } },
  { id: "tenUpgrades", category: "Schmied", name: "Stahl will Arbeit", text: "Verbessere Ausrüstung 10-mal.", metric: "itemsUpgraded", target: 10, reward: { gold: 120, materials: { emberCore: 2 } } },
  { id: "smithLimit", category: "Schmied", name: "Meisterstahl", text: "Schalte ein neues Upgrade-Limit frei.", metric: "smithMasteries", target: 1, title: "Stahlformer", reward: { renown: 2, materials: { oathSteel: 3 } } },
  { id: "salvager", category: "Schmied", name: "Zerleger", text: "Zerlege 10 Items.", metric: "itemsSalvaged", target: 10, reward: { materials: { shard: 2, moonDust: 2 } } },

  { id: "firstEnchant", category: "Mira", name: "Runenfunke", text: "Verzaubere dein erstes Item.", metric: "itemsEnchanted", target: 1, reward: { materials: { shard: 2, moonDust: 1 } } },
  { id: "secondBinding", category: "Mira", name: "Zweite Bindung", text: "Schalte 2 Verzauberungs-Slots frei.", metric: "enchantSlots", target: 2, reward: { renown: 2, materials: { moonDust: 3 } } },
  { id: "rareEnchant", category: "Mira", name: "Arkane Spur", text: "Wirke oder trage eine seltene Verzauberung.", metric: "rareEnchantments", target: 1, reward: { renown: 1, materials: { shard: 2 } } },
  { id: "miraAlmostSmiles", category: "Mira", name: "Mira lächelt fast", text: "Schließe einen arkanen Auftrag ab.", metric: "enchantMasteries", target: 1, title: "Miras Liebling", reward: { renown: 2, materials: { crownAsh: 1 } } },

  { id: "knownFighter", category: "Progression", name: "Bekannter Kämpfer", text: "Erreiche 10 Ruhm.", metric: "renown", target: 10, reward: { gold: 150, materials: { oathSteel: 2 } } },

  // Punkt 24: weitere Erfolge, viele davon mit wählbarem Titel (title).
  { id: "hundredWins", category: "Kampf", name: "Hundert Siege", text: "Gewinne 100 Kämpfe.", metric: "wins", target: 100, title: "Kampferprobt", reward: { renown: 2, gold: 400 } },
  { id: "fiveHundredWins", category: "Kampf", name: "Schlachtenlenker", text: "Gewinne 500 Kämpfe.", metric: "wins", target: 500, title: "Schlachtenlenker", reward: { renown: 4, gold: 1500 } },
  { id: "thousandWins", category: "Kampf", name: "Tausend Narben", text: "Gewinne 1000 Kämpfe.", metric: "wins", target: 1000, title: "der Unermüdliche", reward: { renown: 6, materials: { crownAsh: 4 } } },
  { id: "fiftyElites", category: "Kampf", name: "Elitejäger", text: "Besiege 50 Elite-Gegner.", metric: "eliteKills", target: 50, title: "Elitejäger", reward: { renown: 3, materials: { oathSteel: 6 } } },
  { id: "manyCrits", category: "Kampf", name: "Scharfes Auge", text: "Lande 250 kritische Treffer.", metric: "crits", target: 250, title: "Scharfes Auge", reward: { renown: 2, materials: { emberCore: 3 } } },
  { id: "flawlessWin", category: "Kampf", name: "Ohne Kratzer", text: "Gewinne einen Kampf und verliere dabei höchstens 10 % Leben.", metric: "flawlessWins", target: 1, reward: { gold: 60 } },
  { id: "flawlessMany", category: "Kampf", name: "Unberührbar", text: "Gewinne 25 Kämpfe mit höchstens 10 % Lebensverlust.", metric: "flawlessWins", target: 25, title: "der Unberührbare", reward: { renown: 2, materials: { moonDust: 3 } } },
  { id: "tactician", category: "Kampf", name: "Taktiker", text: "Gewinne 25 Kämpfe im manuellen Modus.", metric: "manualWins", target: 25, title: "Taktiker", reward: { renown: 2, gold: 200 } },
  { id: "abilityAdept", category: "Kampf", name: "Kampfkünstler", text: "Setze im Kampf 100-mal Fähigkeiten ein.", metric: "abilitiesUsed", target: 100, reward: { renown: 1, gold: 150 } },
  { id: "survivor", category: "Kampf", name: "Stehaufmännchen", text: "Stehe nach 10 Niederlagen wieder auf.", metric: "deaths", target: 10, title: "Stehaufmännchen", reward: { gold: 120 } },

  { id: "bossTwenty", category: "Dungeon", name: "Bossbezwinger", text: "Besiege 20 Dungeon-Bosse.", metric: "bossKills", target: 20, title: "Bossbezwinger", reward: { renown: 3, materials: { graveSeal: 2 } } },
  { id: "bossHundred", category: "Dungeon", name: "Schrecken der Tiefe", text: "Besiege 100 Dungeon-Bosse.", metric: "bossKills", target: 100, title: "Schrecken der Tiefe", reward: { renown: 6, materials: { crownAsh: 5 } } },
  { id: "phaseBreaker", category: "Dungeon", name: "Phasenbrecher", text: "Besiege einen Boss in seiner zweiten Phase.", metric: "bossPhaseWins", target: 1, reward: { renown: 1, materials: { shard: 2 } } },
  { id: "phaseVeteran", category: "Dungeon", name: "Letzter Atem", text: "Besiege 25 Bosse in ihrer zweiten Phase.", metric: "bossPhaseWins", target: 25, title: "Phasenbrecher", reward: { renown: 3, materials: { emberCore: 3 } } },
  { id: "clearCrypt", category: "Dungeon", name: "Grufträumer", text: "Besiege alle 3 Bosse der Krypta der Grauwacht.", metric: "dungeonCleared", key: "crypt", target: 3, title: "Grufträumer", reward: { renown: 2, materials: { graveSeal: 2 } } },
  { id: "clearIronhold", category: "Dungeon", name: "Festungsstürmer", text: "Besiege alle 3 Bosse der Eisenbruch-Festung.", metric: "dungeonCleared", key: "ironhold", target: 3, title: "Festungsstürmer", reward: { renown: 3, materials: { oathMark: 2 } } },
  { id: "clearCathedral", category: "Dungeon", name: "Aschenheiliger", text: "Besiege alle 3 Bosse der Aschenkathedrale.", metric: "dungeonCleared", key: "ashcathedral", target: 3, title: "Aschenheiliger", reward: { renown: 4, materials: { crownAsh: 3 } } },
  { id: "allBosses", category: "Dungeon", name: "Bezwinger aller Bosse", text: "Besiege jeden Dungeon-Boss mindestens einmal.", metric: "distinctBosses", target: 10, title: "Bosstöter", reward: { renown: 5, gold: 1000 } },
  { id: "towerFive", category: "Dungeon", name: "Erste Stufen", text: "Erreiche Stockwerk 5 im Endlosen Turm.", metric: "towerBest", target: 5, reward: { renown: 2, materials: { oathSteel: 3 } } },
  { id: "towerTwenty", category: "Dungeon", name: "Turmkletterer", text: "Erreiche Stockwerk 20 im Endlosen Turm.", metric: "towerBest", target: 20, title: "Turmkletterer", reward: { renown: 4, materials: { emberCore: 4 } } },
  { id: "towerFifty", category: "Dungeon", name: "Herr des Turms", text: "Erreiche Stockwerk 50 im Endlosen Turm.", metric: "towerBest", target: 50, title: "Herr des Turms", reward: { renown: 8, materials: { crownAsh: 6 } } },

  { id: "fiftyItems", category: "Loot", name: "Kurator", text: "Entdecke 50 verschiedene Items.", metric: "discoveredItems", target: 50, reward: { renown: 1, materials: { moonDust: 2 } } },
  { id: "hundredItems", category: "Loot", name: "Großer Sammler", text: "Entdecke 100 verschiedene Items.", metric: "discoveredItems", target: 100, title: "Sammler", reward: { renown: 3, materials: { crownAsh: 2 } } },
  { id: "fiveLegendaries", category: "Loot", name: "Goldhand", text: "Entdecke 5 verschiedene legendäre Items.", metric: "legendaryCount", target: 5, title: "Goldhand", reward: { renown: 2, materials: { emberCore: 3 } } },
  { id: "setCollector", category: "Loot", name: "Set-Sammler", text: "Entdecke 10 verschiedene Set-Items.", metric: "setItemCount", target: 10, reward: { renown: 2, materials: { sinew: 4 } } },
  { id: "fullDungeonSet", category: "Loot", name: "Gerüstet für die Tiefe", text: "Trage ein vollständiges Dungeon-Set.", metric: "fullDungeonSet", target: 1, title: "Setmeister", reward: { renown: 3, materials: { graveSeal: 2 } } },
  { id: "goldBaron", category: "Loot", name: "Goldbaron", text: "Verdiene insgesamt 100.000 Gold im Kampf.", metric: "goldEarned", target: 100000, title: "Goldbaron", reward: { renown: 4 } },

  { id: "fiftyUpgrades", category: "Schmied", name: "Schmiedegeselle", text: "Verbessere Ausrüstung 50-mal.", metric: "itemsUpgraded", target: 50, title: "Schmiedegeselle", reward: { gold: 300, materials: { oathSteel: 3 } } },
  { id: "twoHundredUpgrades", category: "Schmied", name: "Meister am Amboss", text: "Verbessere Ausrüstung 200-mal.", metric: "itemsUpgraded", target: 200, title: "Meisterschmied", reward: { renown: 3, materials: { oathMark: 2 } } },
  { id: "salvageHundred", category: "Schmied", name: "Schrottkönig", text: "Zerlege 100 Items.", metric: "itemsSalvaged", target: 100, title: "Schrottkönig", reward: { renown: 1, materials: { scrap: 10, chain: 4 } } },

  { id: "tenEnchants", category: "Mira", name: "Runenschreiber", text: "Verzaubere 10 Items.", metric: "itemsEnchanted", target: 10, reward: { materials: { moonDust: 3, shard: 3 } } },
  { id: "fiftyEnchants", category: "Mira", name: "Runenweber", text: "Verzaubere 50 Items.", metric: "itemsEnchanted", target: 50, title: "Runenweber", reward: { renown: 3, materials: { moonDust: 6 } } },
  { id: "thirdBinding", category: "Mira", name: "Dritte Bindung", text: "Schalte 3 Verzauberungs-Slots frei.", metric: "enchantSlots", target: 3, title: "Runenvertrauter", reward: { renown: 3, materials: { crownAsh: 2 } } },

  { id: "levelTen", category: "Progression", name: "Halbe Strecke", text: "Erreiche Level 10.", metric: "level", target: 10, reward: { gold: 200 } },
  { id: "levelTwenty", category: "Progression", name: "Held der Grauwacht", text: "Erreiche Level 20.", metric: "level", target: 20, title: "Held der Grauwacht", reward: { renown: 3, gold: 800 } },
  { id: "paragonFive", category: "Progression", name: "Jenseits der Grenze", text: "Erreiche Paragon-Stufe 5.", metric: "paragonLevel", target: 5, reward: { renown: 2, materials: { emberCore: 2 } } },
  { id: "paragonTwentyFive", category: "Progression", name: "Paragon", text: "Erreiche Paragon-Stufe 25.", metric: "paragonLevel", target: 25, title: "Paragon", reward: { renown: 5, materials: { crownAsh: 4 } } },
  { id: "renownFifty", category: "Progression", name: "Berühmt", text: "Erreiche 50 Ruhm.", metric: "renown", target: 50, title: "der Berühmte", reward: { gold: 600 } },
  { id: "questsFifty", category: "Progression", name: "Verlässliche Klinge", text: "Schließe 50 Aufträge ab.", metric: "questsDone", target: 50, title: "Verlässlich", reward: { renown: 3, gold: 800 } },

  { id: "warriorWins", category: "Klasse", name: "Klingenmeister", text: "Gewinne 100 Kämpfe als Krieger.", metric: "warriorWins", target: 100, title: "Klingenmeister", reward: { renown: 2, gold: 300 } },
  { id: "mageWins", category: "Klasse", name: "Erzmagier", text: "Gewinne 100 Kämpfe als Magier.", metric: "mageWins", target: 100, title: "Erzmagier", reward: { renown: 2, gold: 300 } },
  { id: "bothClasses", category: "Klasse", name: "Zwei Wege", text: "Gewinne mit beiden Klassen je 10 Kämpfe.", metric: "bothClassWins", target: 10, reward: { renown: 2, materials: { moonDust: 2 } } },
];

if (typeof markDataPackLoaded === "function") markDataPackLoaded("achievements");
