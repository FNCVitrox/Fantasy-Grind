const achievementCatalog = [
  { id: "firstElite", category: "Kampf", name: "Erste Narbe", text: "Besiege deinen ersten Elite-Gegner.", metric: "eliteKills", target: 1, reward: { renown: 1, gold: 40 } },
  { id: "eliteBreaker", category: "Kampf", name: "Elitenbrecher", text: "Besiege 10 Elite-Gegner.", metric: "eliteKills", target: 10, reward: { renown: 2, materials: { oathSteel: 3 } } },
  { id: "firstBoss", category: "Kampf", name: "Tor zur Tiefe", text: "Besiege deinen ersten Dungeon-Boss.", metric: "bossKills", target: 1, reward: { renown: 2, materials: { graveSeal: 1 } } },
  { id: "bossHunter", category: "Kampf", name: "Bossjäger", text: "Besiege 5 Dungeon-Bosse.", metric: "bossKills", target: 5, reward: { renown: 3, materials: { crownAsh: 2 } } },
  { id: "tenWins", category: "Kampf", name: "Nicht kleinzukriegen", text: "Gewinne 10 Kämpfe.", metric: "wins", target: 10, reward: { gold: 70, materials: { leather: 2 } } },
  { id: "fiftyWins", category: "Kampf", name: "Grauwacht-Veteran", text: "Gewinne 50 Kämpfe.", metric: "wins", target: 50, reward: { renown: 2, gold: 250 } },

  { id: "tenItems", category: "Loot", name: "Sammlerblick", text: "Entdecke 10 verschiedene Items.", metric: "discoveredItems", target: 10, reward: { gold: 80, materials: { shard: 2 } } },
  { id: "twentyFiveItems", category: "Loot", name: "Schatzsucher", text: "Entdecke 25 verschiedene Items.", metric: "discoveredItems", target: 25, reward: { renown: 1, materials: { moonDust: 3 } } },
  { id: "legendaryFind", category: "Loot", name: "Legendärer Fund", text: "Finde ein legendäres Item.", metric: "legendaryItems", target: 1, reward: { renown: 2, materials: { emberCore: 2 } } },
  { id: "bossTrophy", category: "Loot", name: "Boss-Trophäe", text: "Finde einen festen Boss-Drop.", metric: "fixedBossDrops", target: 1, reward: { renown: 2, materials: { crownAsh: 1 } } },
  { id: "setHunter", category: "Loot", name: "Set-Jäger", text: "Entdecke ein Set-Item.", metric: "setItems", target: 1, reward: { renown: 1, materials: { sinew: 2 } } },

  { id: "anvilTrial", category: "Schmied", name: "Ambossprobe", text: "Bringe ein Item an dein aktuelles Upgrade-Limit.", metric: "itemAtLimit", target: 1, reward: { renown: 1, materials: { scrap: 3 } } },
  { id: "tenUpgrades", category: "Schmied", name: "Stahl will Arbeit", text: "Verbessere Ausrüstung 10-mal.", metric: "itemsUpgraded", target: 10, reward: { gold: 120, materials: { emberCore: 2 } } },
  { id: "smithLimit", category: "Schmied", name: "Meisterstahl", text: "Schalte ein neues Upgrade-Limit frei.", metric: "smithMasteries", target: 1, reward: { renown: 2, materials: { oathSteel: 3 } } },
  { id: "salvager", category: "Schmied", name: "Zerleger", text: "Zerlege 10 Items.", metric: "itemsSalvaged", target: 10, reward: { materials: { shard: 2, moonDust: 2 } } },

  { id: "firstEnchant", category: "Mira", name: "Runenfunke", text: "Verzaubere dein erstes Item.", metric: "itemsEnchanted", target: 1, reward: { materials: { shard: 2, moonDust: 1 } } },
  { id: "secondBinding", category: "Mira", name: "Zweite Bindung", text: "Schalte 2 Verzauberungs-Slots frei.", metric: "enchantSlots", target: 2, reward: { renown: 2, materials: { moonDust: 3 } } },
  { id: "rareEnchant", category: "Mira", name: "Arkane Spur", text: "Wirke oder trage eine seltene Verzauberung.", metric: "rareEnchantments", target: 1, reward: { renown: 1, materials: { shard: 2 } } },
  { id: "miraAlmostSmiles", category: "Mira", name: "Mira lächelt fast", text: "Schließe einen arkanen Auftrag ab.", metric: "enchantMasteries", target: 1, reward: { renown: 2, materials: { crownAsh: 1 } } },

  { id: "knownFighter", category: "Progression", name: "Bekannter Kämpfer", text: "Erreiche 10 Ruhm.", metric: "renown", target: 10, reward: { gold: 150, materials: { oathSteel: 2 } } },
];
