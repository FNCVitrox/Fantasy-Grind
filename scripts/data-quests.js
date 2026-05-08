const questCatalog = [
  { id: "wolves", name: "Sichere den Waldrand", rarity: "common", repeatable: true, text: "Töte 10 Waldwölfe.", target: "wolf", needed: 10, rewardXp: 70, rewardGold: 22 },
  { id: "rust", name: "Rost für den Schmied", rarity: "rare", repeatable: true, text: "Sammle 5 Rostsplitter von Wegräubern.", target: "rust", needed: 5, rewardXp: 135, rewardGold: 44 },
  { id: "elites", name: "Mut unter Stein", rarity: "epic", repeatable: true, text: "Besiege 3 Elite-Gegner.", target: "elite", needed: 3, rewardXp: 360, rewardGold: 95 },
  { id: "boars", name: "Dornen im Acker", rarity: "common", repeatable: true, text: "Erlege 7 Dornenkeiler.", target: "beast", needed: 7, rewardXp: 190, rewardGold: 55 },
  { id: "dungeon", name: "Licht unter Stein", rarity: "epic", repeatable: true, text: "Besiege 8 Dungeon-Gegner.", target: "dungeon", needed: 8, rewardXp: 330, rewardGold: 88 },
  { id: "bandits", name: "Wege wieder sicher", rarity: "rare", repeatable: true, text: "Besiege 9 Wegräuber.", target: "bandit", needed: 9, rewardXp: 155, rewardGold: 50 },
  { id: "fields", name: "Nebel über den Feldern", rarity: "rare", repeatable: true, text: "Vertreibe 6 Gegner aus den verfluchten Feldern.", target: "field", needed: 6, rewardXp: 260, rewardGold: 78 },
  { id: "ash", name: "Asche im Wind", rarity: "epic", repeatable: true, text: "Besiege 6 Gegner im Aschengrund.", target: "ash", needed: 6, rewardXp: 520, rewardGold: 135 },
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
