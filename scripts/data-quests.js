const questCatalog = [
  { id: "wolves", name: "Sichere den Waldrand", rarity: "common", repeatable: true, text: "Töte 10 Waldwölfe.", target: "wolf", needed: 10, rewardXp: 70, rewardGold: 22 },
  { id: "rust", name: "Rost für den Schmied", rarity: "rare", repeatable: true, text: "Sammle 5 Rostsplitter von Wegräubern.", target: "rust", needed: 5, rewardXp: 135, rewardGold: 44 },
  { id: "elites", name: "Mut unter Stein", rarity: "epic", repeatable: true, text: "Besiege 3 Elite-Gegner.", target: "elite", needed: 3, rewardXp: 360, rewardGold: 95 },
  { id: "boars", name: "Dornen im Acker", rarity: "common", repeatable: true, text: "Erlege 7 Dornenkeiler.", target: "enemy", enemyIds: ["boar"], needed: 7, rewardXp: 190, rewardGold: 55 },
  { id: "dungeon", name: "Licht unter Stein", rarity: "epic", repeatable: true, text: "Besiege 8 Dungeon-Gegner.", target: "dungeon", needed: 8, rewardXp: 330, rewardGold: 88 },
  { id: "bandits", name: "Wege wieder sicher", rarity: "rare", repeatable: true, text: "Besiege 9 Wegräuber.", target: "bandit", needed: 9, rewardXp: 155, rewardGold: 50 },
  { id: "fields", name: "Nebel über den Feldern", rarity: "rare", repeatable: true, text: "Vertreibe 6 Gegner aus den verfluchten Feldern.", target: "field", needed: 6, rewardXp: 260, rewardGold: 78 },
  { id: "ash", name: "Asche im Wind", rarity: "epic", repeatable: true, text: "Besiege 6 Gegner im Aschengrund.", target: "ash", needed: 6, rewardXp: 520, rewardGold: 135 },
  { id: "ironHound", name: "Eiserne Fährte", rarity: "rare", repeatable: true, text: "Erlege 6 Eisenhunde auf der Räuberstraße.", target: "enemy", enemyIds: ["ironHound"], needed: 6, rewardXp: 230, rewardGold: 70 },
  { id: "plagueCrow", name: "Schwarze Federn", rarity: "rare", repeatable: true, text: "Vertreibe 6 Seuchenkrähen von den Feldern.", target: "enemy", enemyIds: ["plagueCrow"], needed: 6, rewardXp: 290, rewardGold: 82 },
  { id: "fieldWraith", name: "Schemen im Nebel", rarity: "epic", repeatable: true, text: "Banne 5 Feldschemen in den verfluchten Feldern.", target: "enemy", enemyIds: ["fieldWraith"], needed: 5, rewardXp: 390, rewardGold: 105 },
  { id: "emberStalker", name: "Glutpirscher-Fährte", rarity: "epic", repeatable: true, text: "Jage 5 Glutpirscher im Aschengrund.", target: "enemy", enemyIds: ["emberStalker"], needed: 5, rewardXp: 560, rewardGold: 145 },
  { id: "crownSentinel", name: "Wacht der Krone", rarity: "epic", repeatable: true, text: "Besiege 4 Kronenwächter im Aschengrund.", target: "enemy", enemyIds: ["crownSentinel"], needed: 4, rewardXp: 680, rewardGold: 170 },
  { id: "ratguard", name: "Riegel im Keller", rarity: "rare", repeatable: true, text: "Besiege 4 Kellergardisten in der Krypta.", target: "enemy", enemyIds: ["ratguard"], needed: 4, rewardXp: 300, rewardGold: 82 },
  { id: "boneAcolyte", name: "Knochenlitanei", rarity: "epic", repeatable: true, text: "Unterbrich 4 Knochenakolythen in der Krypta.", target: "enemy", enemyIds: ["boneAcolyte"], needed: 4, rewardXp: 410, rewardGold: 110 },
  { id: "cryptBrute", name: "Gruftbrecher", rarity: "epic", repeatable: true, text: "Bezwinge 3 Gruftschläger in der Krypta.", target: "enemy", enemyIds: ["cryptBrute"], needed: 3, rewardXp: 520, rewardGold: 140 },
  { id: "chainWarden", name: "Ketten lösen", rarity: "epic", repeatable: true, text: "Bezwinge 3 Kettenaufseher in der Eisenbruch-Festung.", target: "enemy", enemyIds: ["chainWarden"], needed: 3, rewardXp: 520, rewardGold: 145 },
  { id: "oathForger", name: "Amboss zum Schweigen", rarity: "epic", repeatable: true, text: "Besiege 3 Eidschmiede in der Eisenbruch-Festung.", target: "enemy", enemyIds: ["oathForger"], needed: 3, rewardXp: 650, rewardGold: 175 },
  { id: "ironDuke", name: "Herzogsfall", rarity: "legendary", repeatable: true, text: "Stürze Herzog Eisenbruch in seiner Festung.", target: "enemy", enemyIds: ["ironDuke"], needed: 2, rewardXp: 820, rewardGold: 230 },
  { id: "emberPriest", name: "Glutchor brechen", rarity: "epic", repeatable: true, text: "Besiege 3 Glutpriester in der Aschenkathedrale.", target: "enemy", enemyIds: ["emberPriest"], needed: 3, rewardXp: 760, rewardGold: 205 },
  { id: "crownBeast", name: "Bestiensehnen", rarity: "legendary", repeatable: true, text: "Erlege die Bestie der Krone in der Aschenkathedrale.", target: "enemy", enemyIds: ["crownBeast"], needed: 2, rewardXp: 900, rewardGold: 250 },
  { id: "hollowChampion", name: "Leere Krone", rarity: "legendary", repeatable: true, text: "Besiege den Hohlen Champion der Aschenkathedrale.", target: "enemy", enemyIds: ["hollowChampion"], needed: 2, rewardXp: 980, rewardGold: 280 },
];

const rareQuestTemplates = [
  { key: "wolf", name: "Blutspur des Rudels", rarity: "legendary", text: "Jage 9 Waldwölfe für eine alte Jagdtrophaee.", target: "wolf", needed: 9, rewardXp: 260, rewardGold: 75, slot: "necklace" },
  { key: "bandit", name: "Versiegelter Steckbrief", rarity: "legendary", text: "Besiege 8 Wegräuber und bringe den Steckbrief zurück.", target: "bandit", needed: 8, rewardXp: 310, rewardGold: 95, slot: "weapon" },
  { key: "elite", name: "Schwur gegen die Gefallenen", rarity: "legendary", text: "Bezwinge 4 Elite-Gegner für eine seltene Reliquie.", target: "elite", needed: 4, rewardXp: 620, rewardGold: 150, slot: "chest" },
  { key: "dungeon", name: "Runen aus der Tiefe", rarity: "legendary", text: "Besiege 7 Dungeon-Gegner und berge eine Runenbelohnung.", target: "dungeon", needed: 7, rewardXp: 540, rewardGold: 130, slot: "ring" },
  { key: "ash", name: "Schwarzer Chor", rarity: "legendary", text: "Bezwinge 5 Aschengegner für eine versengte Reliquie.", target: "ash", needed: 5, rewardXp: 760, rewardGold: 190, slot: "necklace" },
];

const allQuestIds = () => [
  ...questCatalog.map((quest) => quest.id),
  ...Object.keys(typeof state !== "undefined" && state?.rareQuests ? state.rareQuests : {}),
];
