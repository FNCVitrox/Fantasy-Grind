const saveKey = "fantasy-grind-save-v1";
const saveBackupKey = `${saveKey}-backup`;
const savePreviousKey = `${saveKey}-previous`;
const saveExportVersion = 1;

const xpForLevel = (level) => Math.floor(115 * Math.pow(level, 1.78) + level * 48);
