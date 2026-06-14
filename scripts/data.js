const saveKey = "fantasy-grind-save-v1";
const saveBackupKey = `${saveKey}-backup`;
const savePreviousKey = `${saveKey}-previous`;
const saveExportVersion = 1;
const assetVersion = "0.8.121";
const bossDropPityGoal = 3;
const indexedDbName = "FantasyGrindSaves";
const indexedDbStoreName = "saves";

const xpForLevel = (level) => Math.floor(115 * Math.pow(level, 1.78) + level * 48);

let achievementCatalog = [];
let materialDrops = {};
