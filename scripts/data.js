const saveKey = "fantasy-grind-save-v1";

const xpForLevel = (level) => Math.floor(115 * Math.pow(level, 1.78) + level * 48);

const zones = {
  meadow: {
    name: "Startzone",
    enemies: ["wolf", "bandit", "boar", "oldKnight"],
  },
  dungeon: {
    name: "Dungeon",
    enemies: ["ratguard", "boneAcolyte", "cryptBrute", "hollowChampion"],
  },
};

const enemies = {
  wolf: {
    name: "Waldwolf",
    sprite: "enemy-wolf",
    level: 1,
    hp: 44,
    damage: [7, 12],
    defense: 2,
    xp: 16,
    gold: [2, 4],
    drops: [{ id: "wolfRing", chance: 0.024 }],
    tags: { wolf: 1 },
  },
  bandit: {
    name: "Wegräuber",
    sprite: "enemy-bandit",
    level: 3,
    hp: 72,
    damage: [12, 19],
    defense: 5,
    xp: 30,
    gold: [4, 9],
    drops: [{ id: "rustBlade", chance: 0.038 }],
    tags: { bandit: 1, rust: 0.32 },
  },
  boar: {
    name: "Dornenkeiler",
    sprite: "enemy-boar",
    level: 6,
    hp: 122,
    damage: [20, 31],
    defense: 8,
    xp: 62,
    gold: [7, 13],
    drops: [{ id: "hideArmor", chance: 0.032 }],
    tags: { beast: 1 },
  },
  oldKnight: {
    name: "Alter Grenzritter",
    sprite: "enemy-knight",
    level: 10,
    hp: 210,
    damage: [34, 50],
    defense: 17,
    xp: 120,
    gold: [14, 25],
    drops: [{ id: "oathRing", chance: 0.018 }, { id: "knightPlate", chance: 0.012 }],
    elite: true,
    tags: { elite: 1 },
  },
  ratguard: {
    name: "Kellergardist",
    sprite: "enemy-ratguard",
    level: 9,
    hp: 190,
    damage: [32, 47],
    defense: 14,
    xp: 105,
    gold: [11, 22],
    drops: [{ id: "guardAxe", chance: 0.026 }],
    tags: { dungeon: 1 },
  },
  boneAcolyte: {
    name: "Knochenakolyth",
    sprite: "enemy-acolyte",
    level: 12,
    hp: 270,
    damage: [43, 64],
    defense: 20,
    xp: 170,
    gold: [17, 32],
    drops: [{ id: "graveRing", chance: 0.024 }],
    tags: { dungeon: 1 },
  },
  cryptBrute: {
    name: "Gruftschläger",
    sprite: "enemy-brute",
    level: 15,
    hp: 390,
    damage: [62, 92],
    defense: 28,
    xp: 275,
    gold: [27, 48],
    drops: [{ id: "bruteMail", chance: 0.02 }],
    elite: true,
    tags: { elite: 1, dungeon: 1 },
  },
  hollowChampion: {
    name: "Hohler Champion",
    sprite: "enemy-champion",
    level: 20,
    hp: 680,
    damage: [95, 138],
    defense: 44,
    xp: 620,
    gold: [58, 105],
    drops: [{ id: "ashenGreatsword", chance: 0.012 }, { id: "crownShard", chance: 0.008 }],
    elite: true,
    tags: { elite: 1, dungeon: 1 },
  },
};

const items = {
  trainingSword: { name: "Übungsschwert", slot: "weapon", quality: "common", damage: 4, defense: 0 },
  wornBuckler: { name: "Abgenutzter Buckler", slot: "offhand", quality: "common", damage: 0, defense: 2 },
  paddedVest: { name: "Gepolsterte Weste", slot: "chest", quality: "common", damage: 0, defense: 3 },
  patchedTrousers: { name: "Geflickte Hose", slot: "pants", quality: "common", damage: 0, defense: 2 },
  travelBoots: { name: "Reisestiefel", slot: "boots", quality: "common", damage: 0, defense: 1 },
  twineNecklace: { name: "Kordelhalskette", slot: "necklace", quality: "common", damage: 1, defense: 0 },
  copperRing: { name: "Kupferring", slot: "ring", quality: "common", damage: 1, defense: 1 },
  wolfRing: { name: "Ring des Rudels", slot: "ring", quality: "rare", damage: 2, defense: 2, set: "wolf" },
  rustBlade: { name: "Rostklinge", slot: "weapon", quality: "rare", damage: 8, defense: 0, set: "iron" },
  hideArmor: { name: "Dornenleder", slot: "chest", quality: "rare", damage: 0, defense: 9, set: "wolf" },
  oathRing: { name: "Eidring", slot: "ring", quality: "epic", damage: 4, defense: 4, set: "iron" },
  knightPlate: { name: "Grenzritterplatte", slot: "chest", quality: "epic", damage: 0, defense: 16, set: "iron" },
  guardAxe: { name: "Gardistenaxt", slot: "weapon", quality: "rare", damage: 12, defense: 0, set: "iron" },
  graveRing: { name: "Grablichtring", slot: "ring", quality: "epic", damage: 5, defense: 4, set: "crypt" },
  bruteMail: { name: "Schlägerkettenhemd", slot: "chest", quality: "epic", damage: 0, defense: 22, set: "crypt" },
  ashenGreatsword: { name: "Aschgraues Großschwert", slot: "weapon", quality: "legendary", damage: 28, defense: 0, set: "ashen" },
  crownShard: { name: "Splitter der Krone", slot: "ring", quality: "legendary", damage: 8, defense: 8, set: "ashen" },
};

const qualityLabel = {
  common: "Gewöhnlich",
  rare: "Selten",
  epic: "Episch",
  legendary: "Legendär",
};

const slotLabel = {
  weapon: "Waffe",
  offhand: "2. Hand",
  chest: "Brustpanzer",
  pants: "Hose",
  boots: "Stiefel",
  necklace: "Halskette",
  ring: "Ring",
};

const equipmentSlots = ["weapon", "offhand", "chest", "pants", "boots", "necklace", "ring"];
const lootSlots = [...equipmentSlots];

const qualityPower = {
  common: 1,
  rare: 1.28,
  epic: 1.62,
  legendary: 2.05,
};

const lootNames = {
  weapon: {
    common: ["Kerbenschwert", "Feldbeil", "Wachklinge"],
    rare: ["Runenklinge", "Blutrost-Axt", "Silberfalchion"],
    epic: ["Eidbrecher", "Sternstahlklinge", "Gruftspalter"],
    legendary: ["Königsschneide", "Aschenurteil", "Drachenzahn"],
  },
  offhand: {
    common: ["Holzschild", "Parierdolch", "Rostbuckler"],
    rare: ["Wolfsbuckler", "Gardistenschild", "Hakenklinge"],
    epic: ["Eidwall", "Runenfokus", "Gruftlaterne"],
    legendary: ["Sonnenschild", "Aschenfokus", "Splitterparade"],
  },
  chest: {
    common: ["Lederwams", "Kettenfetzen", "Reiserüstung"],
    rare: ["Wolfsleder", "Schildplattenrock", "Schuppenpanzer"],
    epic: ["Eidhüterplatte", "Nachtkettenhemd", "Runenharnisch"],
    legendary: ["Krone der Bastion", "Aschenpanzer", "Sonnenharnisch"],
  },
  pants: {
    common: ["Leinenhose", "Wanderbeinlinge", "Kettenhose"],
    rare: ["Wolfsbeinlinge", "Schmiedeplatten", "Räuberhose"],
    epic: ["Eidbeinplatten", "Grabstahl-Beinlinge", "Runenbeinpanzer"],
    legendary: ["Aschenbeinplatten", "Königsgamaschen", "Sonnenbeinschutz"],
  },
  boots: {
    common: ["Lederstiefel", "Marschschuhe", "Eisenkappen"],
    rare: ["Fährtenstiefel", "Wachstiefel", "Dornenläufer"],
    epic: ["Eidtreter", "Gruftschritte", "Runensohlen"],
    legendary: ["Aschenläufer", "Sonnenstiefel", "Kronenschritte"],
  },
  necklace: {
    common: ["Holzamulett", "Kordelkette", "Kupfertalisman"],
    rare: ["Wolfszahnkette", "Rostmedaillon", "Wachhalsreif"],
    epic: ["Eidamulett", "Grablichtkette", "Runenhalsreif"],
    legendary: ["Aschenmedaillon", "Sonnenanhänger", "Kronentalisman"],
  },
  ring: {
    common: ["Zinnring", "Feldreif", "Schlichter Talisman"],
    rare: ["Blutsteinring", "Wolfszeichen", "Wachtersiegel"],
    epic: ["Grablichtreif", "Eidsiegel", "Sternsplitterring"],
    legendary: ["Splitterkrone", "Ring des alten Feuers", "Königszeichen"],
  },
};

const setBonuses = {
  wolf: {
    name: "Rudeljäger",
    bonuses: {
      2: { damage: 3, defense: 1, text: "+3 Schaden, +1 Verteidigung" },
      4: { damage: 5, defense: 4, text: "+5 Schaden, +4 Verteidigung" },
      6: { damage: 11, defense: 7, maxHp: 18, text: "+11 Schaden, +7 Verteidigung, +18 Leben" },
    },
  },
  iron: {
    name: "Grenzwacht",
    bonuses: {
      2: { defense: 5, text: "+5 Verteidigung" },
      4: { damage: 3, defense: 10, text: "+3 Schaden, +10 Verteidigung" },
      6: { damage: 7, defense: 20, maxHp: 26, text: "+7 Schaden, +20 Verteidigung, +26 Leben" },
    },
  },
  crypt: {
    name: "Gruftbund",
    bonuses: {
      2: { damage: 4, maxHp: 12, text: "+4 Schaden, +12 Leben" },
      4: { damage: 7, defense: 6, maxHp: 22, text: "+7 Schaden, +6 Verteidigung, +22 Leben" },
      6: { damage: 13, defense: 11, maxHp: 48, text: "+13 Schaden, +11 Verteidigung, +48 Leben" },
    },
  },
  ashen: {
    name: "Aschenkrone",
    bonuses: {
      2: { damage: 8, defense: 5, text: "+8 Schaden, +5 Verteidigung" },
      4: { damage: 14, defense: 11, maxHp: 32, text: "+14 Schaden, +11 Verteidigung, +32 Leben" },
      6: { damage: 28, defense: 19, maxHp: 64, text: "+28 Schaden, +19 Verteidigung, +64 Leben" },
    },
  },
};

const questCatalog = [
  { id: "wolves", name: "Sichere den Waldrand", rarity: "common", text: "Töte 10 Waldwölfe.", target: "wolf", needed: 10, rewardXp: 70, rewardGold: 22 },
  { id: "rust", name: "Rost für den Schmied", rarity: "rare", text: "Sammle 5 Rostsplitter von Wegräubern.", target: "rust", needed: 5, rewardXp: 135, rewardGold: 44 },
  { id: "elites", name: "Mut unter Stein", rarity: "epic", text: "Besiege 3 Elite-Gegner.", target: "elite", needed: 3, rewardXp: 360, rewardGold: 95 },
  { id: "boars", name: "Dornen im Acker", rarity: "common", text: "Erlege 7 Dornenkeiler.", target: "beast", needed: 7, rewardXp: 190, rewardGold: 55 },
  { id: "dungeon", name: "Licht unter Stein", rarity: "epic", text: "Besiege 8 Dungeon-Gegner.", target: "dungeon", needed: 8, rewardXp: 330, rewardGold: 88 },
  { id: "bandits", name: "Wege wieder sicher", rarity: "rare", text: "Besiege 9 Wegräuber.", target: "bandit", needed: 9, rewardXp: 155, rewardGold: 50 },
];

const rareQuestTemplates = [
  { key: "wolf", name: "Blutspur des Rudels", rarity: "legendary", text: "Jage 9 Waldwölfe für eine alte Jagdtrophaee.", target: "wolf", needed: 9, rewardXp: 260, rewardGold: 75, slot: "necklace" },
  { key: "bandit", name: "Versiegelter Steckbrief", rarity: "legendary", text: "Besiege 8 Wegräuber und bringe den Steckbrief zurück.", target: "bandit", needed: 8, rewardXp: 310, rewardGold: 95, slot: "weapon" },
  { key: "elite", name: "Schwur gegen die Gefallenen", rarity: "legendary", text: "Bezwinge 4 Elite-Gegner für eine seltene Reliquie.", target: "elite", needed: 4, rewardXp: 620, rewardGold: 150, slot: "chest" },
  { key: "dungeon", name: "Runen aus der Tiefe", rarity: "legendary", text: "Besiege 7 Dungeon-Gegner und berge eine Runenbelohnung.", target: "dungeon", needed: 7, rewardXp: 540, rewardGold: 130, slot: "ring" },
];

const allQuestIds = () => [...questCatalog.map((quest) => quest.id), ...Object.keys(state?.rareQuests || {})];

const rarityLabel = {
  common: "Gewöhnlich",
  rare: "Selten",
  epic: "Episch",
  legendary: "Legendär",
};

const materialLabel = {
  hide: "Fell",
  fang: "Zähne",
  iron: "Eisenbarren",
  shard: "Runensplitter",
};

const materialDrops = {
  wolf: [{ id: "hide", min: 1, max: 2 }, { id: "fang", min: 0, max: 1 }],
  bandit: [{ id: "iron", min: 1, max: 2 }, { id: "shard", min: 0, max: 1 }],
  boar: [{ id: "hide", min: 2, max: 3 }, { id: "fang", min: 1, max: 2 }],
  oldKnight: [{ id: "iron", min: 2, max: 4 }, { id: "shard", min: 1, max: 2 }],
  ratguard: [{ id: "iron", min: 2, max: 3 }, { id: "shard", min: 0, max: 1 }],
  boneAcolyte: [{ id: "shard", min: 1, max: 3 }, { id: "fang", min: 1, max: 2 }],
  cryptBrute: [{ id: "iron", min: 3, max: 5 }, { id: "shard", min: 2, max: 3 }],
  hollowChampion: [{ id: "iron", min: 5, max: 8 }, { id: "shard", min: 4, max: 6 }, { id: "fang", min: 2, max: 4 }],
};

