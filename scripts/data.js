const saveKey = "fantasy-grind-save-v1";

const xpForLevel = (level) => Math.floor(80 * Math.pow(level, 1.72) + level * 35);

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
    hp: 34,
    damage: [5, 9],
    defense: 1,
    xp: 18,
    gold: [2, 5],
    drops: [{ id: "wolfRing", chance: 0.035 }],
    tags: { wolf: 1 },
  },
  bandit: {
    name: "Wegräuber",
    sprite: "enemy-bandit",
    level: 3,
    hp: 54,
    damage: [8, 14],
    defense: 3,
    xp: 34,
    gold: [5, 11],
    drops: [{ id: "rustBlade", chance: 0.055 }],
    tags: { bandit: 1, rust: 0.32 },
  },
  boar: {
    name: "Dornenkeiler",
    sprite: "enemy-boar",
    level: 6,
    hp: 92,
    damage: [14, 22],
    defense: 5,
    xp: 72,
    gold: [8, 16],
    drops: [{ id: "hideArmor", chance: 0.045 }],
    tags: { beast: 1 },
  },
  oldKnight: {
    name: "Alter Grenzritter",
    sprite: "enemy-knight",
    level: 10,
    hp: 150,
    damage: [22, 34],
    defense: 10,
    xp: 145,
    gold: [18, 32],
    drops: [{ id: "oathRing", chance: 0.025 }, { id: "knightPlate", chance: 0.018 }],
    elite: true,
    tags: { elite: 1 },
  },
  ratguard: {
    name: "Kellergardist",
    sprite: "enemy-ratguard",
    level: 9,
    hp: 136,
    damage: [20, 31],
    defense: 8,
    xp: 126,
    gold: [13, 26],
    drops: [{ id: "guardAxe", chance: 0.04 }],
    tags: { dungeon: 1 },
  },
  boneAcolyte: {
    name: "Knochenakolyth",
    sprite: "enemy-acolyte",
    level: 12,
    hp: 184,
    damage: [28, 42],
    defense: 11,
    xp: 210,
    gold: [21, 39],
    drops: [{ id: "graveRing", chance: 0.035 }],
    tags: { dungeon: 1 },
  },
  cryptBrute: {
    name: "Gruftschläger",
    sprite: "enemy-brute",
    level: 15,
    hp: 260,
    damage: [38, 58],
    defense: 16,
    xp: 345,
    gold: [34, 62],
    drops: [{ id: "bruteMail", chance: 0.03 }],
    elite: true,
    tags: { elite: 1, dungeon: 1 },
  },
  hollowChampion: {
    name: "Hohler Champion",
    sprite: "enemy-champion",
    level: 20,
    hp: 420,
    damage: [58, 88],
    defense: 24,
    xp: 820,
    gold: [80, 150],
    drops: [{ id: "ashenGreatsword", chance: 0.018 }, { id: "crownShard", chance: 0.012 }],
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
  wolfRing: { name: "Ring des Rudels", slot: "ring", quality: "rare", damage: 3, defense: 2, set: "wolf" },
  rustBlade: { name: "Rostklinge", slot: "weapon", quality: "rare", damage: 10, defense: 0, set: "iron" },
  hideArmor: { name: "Dornenleder", slot: "chest", quality: "rare", damage: 0, defense: 11, set: "wolf" },
  oathRing: { name: "Eidring", slot: "ring", quality: "epic", damage: 5, defense: 5, set: "iron" },
  knightPlate: { name: "Grenzritterplatte", slot: "chest", quality: "epic", damage: 0, defense: 20, set: "iron" },
  guardAxe: { name: "Gardistenaxt", slot: "weapon", quality: "rare", damage: 15, defense: 0, set: "iron" },
  graveRing: { name: "Grablichtring", slot: "ring", quality: "epic", damage: 7, defense: 4, set: "crypt" },
  bruteMail: { name: "Schlägerkettenhemd", slot: "chest", quality: "epic", damage: 1, defense: 27, set: "crypt" },
  ashenGreatsword: { name: "Aschgraues Großschwert", slot: "weapon", quality: "legendary", damage: 34, defense: 0, set: "ashen" },
  crownShard: { name: "Splitter der Krone", slot: "ring", quality: "legendary", damage: 11, defense: 10, set: "ashen" },
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
  rare: 1.45,
  epic: 1.95,
  legendary: 2.65,
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
      2: { damage: 4, defense: 2, text: "+4 Schaden, +2 Verteidigung" },
      4: { damage: 7, defense: 6, text: "+7 Schaden, +6 Verteidigung" },
      6: { damage: 16, defense: 10, maxHp: 25, text: "+16 Schaden, +10 Verteidigung, +25 Leben" },
    },
  },
  iron: {
    name: "Grenzwacht",
    bonuses: {
      2: { defense: 8, text: "+8 Verteidigung" },
      4: { damage: 5, defense: 14, text: "+5 Schaden, +14 Verteidigung" },
      6: { damage: 10, defense: 30, maxHp: 35, text: "+10 Schaden, +30 Verteidigung, +35 Leben" },
    },
  },
  crypt: {
    name: "Gruftbund",
    bonuses: {
      2: { damage: 5, maxHp: 18, text: "+5 Schaden, +18 Leben" },
      4: { damage: 9, defense: 9, maxHp: 30, text: "+9 Schaden, +9 Verteidigung, +30 Leben" },
      6: { damage: 18, defense: 16, maxHp: 70, text: "+18 Schaden, +16 Verteidigung, +70 Leben" },
    },
  },
  ashen: {
    name: "Aschenkrone",
    bonuses: {
      2: { damage: 12, defense: 8, text: "+12 Schaden, +8 Verteidigung" },
      4: { damage: 20, defense: 16, maxHp: 45, text: "+20 Schaden, +16 Verteidigung, +45 Leben" },
      6: { damage: 42, defense: 28, maxHp: 90, text: "+42 Schaden, +28 Verteidigung, +90 Leben" },
    },
  },
};

const questCatalog = [
  { id: "wolves", name: "Sichere den Waldrand", rarity: "common", text: "Töte 8 Waldwölfe.", target: "wolf", needed: 8, rewardXp: 95, rewardGold: 35 },
  { id: "rust", name: "Rost für den Schmied", rarity: "rare", text: "Sammle 3 Rostsplitter von Wegräubern.", target: "rust", needed: 3, rewardXp: 180, rewardGold: 70 },
  { id: "elites", name: "Mut unter Stein", rarity: "epic", text: "Besiege 2 Elite-Gegner.", target: "elite", needed: 2, rewardXp: 520, rewardGold: 160 },
  { id: "boars", name: "Dornen im Acker", rarity: "common", text: "Erlege 5 Dornenkeiler.", target: "beast", needed: 5, rewardXp: 260, rewardGold: 90 },
  { id: "dungeon", name: "Licht unter Stein", rarity: "epic", text: "Besiege 6 Dungeon-Gegner.", target: "dungeon", needed: 6, rewardXp: 440, rewardGold: 140 },
  { id: "bandits", name: "Wege wieder sicher", rarity: "rare", text: "Besiege 7 Wegräuber.", target: "bandit", needed: 7, rewardXp: 210, rewardGold: 80 },
];

const rareQuestTemplates = [
  { key: "wolf", name: "Blutspur des Rudels", rarity: "legendary", text: "Jage 6 Waldwölfe für eine alte Jagdtrophaee.", target: "wolf", needed: 6, rewardXp: 360, rewardGold: 120, slot: "necklace" },
  { key: "bandit", name: "Versiegelter Steckbrief", rarity: "legendary", text: "Besiege 5 Wegräuber und bringe den Steckbrief zurück.", target: "bandit", needed: 5, rewardXp: 420, rewardGold: 160, slot: "weapon" },
  { key: "elite", name: "Schwur gegen die Gefallenen", rarity: "legendary", text: "Bezwinge 3 Elite-Gegner für eine seltene Reliquie.", target: "elite", needed: 3, rewardXp: 900, rewardGold: 260, slot: "chest" },
  { key: "dungeon", name: "Runen aus der Tiefe", rarity: "legendary", text: "Besiege 5 Dungeon-Gegner und berge eine Runenbelohnung.", target: "dungeon", needed: 5, rewardXp: 760, rewardGold: 220, slot: "ring" },
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

