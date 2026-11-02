const saveKey = "fantasy-grind-save-v1";
const saveBackupKey = `${saveKey}-backup`;
const savePreviousKey = `${saveKey}-previous`;
const saveExportVersion = 1;
const assetVersion = "0.8.142";
const bossDropPityGoal = 3;
const indexedDbName = "FantasyGrindSaves";
const indexedDbStoreName = "saves";

// Balancing (Punkt 15): Faktor auf die XP-Kurve, damit Level 20 nach etwa 2–4 Stunden erreicht wird (siehe tests/balance-sim.js).
const xpCurveMultiplier = 5;
const xpForLevel = (level) => Math.floor((115 * Math.pow(level, 1.78) + level * 48) * xpCurveMultiplier);

// Flüchtiger Oberflächen-Zustand (wird nicht 1:1 gespeichert). Der Spielstand selbst liegt in `state`.
// Wird hier in der zuerst geladenen Datei angelegt, damit alle anderen Skripte von Anfang an darauf zugreifen können.
const ui = {
  // Auswahl im Spiel
  selectedZone: "meadow",
  selectedEnemy: "wolf",
  // Bestiarium
  selectedBestiaryZone: "meadow",
  selectedBestiaryEnemy: "wolf",
  selectedBestiaryType: "zone",
  selectedBestiaryCategory: "overview",
  selectedBestiaryFilter: "all",
  selectedBestiarySearch: "",
  selectedBestiaryPage: 0,
  selectedBestiaryItemKey: "",
  bestiaryListDirty: true,
  bestiaryListHtml: "",
  bestiarySearchFrame: 0,
  // Schmied
  smithView: "home",
  // Kampf
  isFighting: false,
  skipCombat: false,
  combatWatchdog: 0,
  manualCombatStep: null,
  activeCombatState: null,
  pendingCombatAction: null,
  battleResultTimer: 0,
  autoFarm: false,
  autoFarmLosses: 0,
  // Tooltips
  tooltipFrame: 0,
  pendingTooltipEvent: null,
  activeTooltipKey: "",
  tooltipSize: null,
  lastTooltipPosition: { x: -9999, y: -9999 },
  // Sprache (z. B. um Log-Einträge in beiden Sprachen zu erzeugen)
  languageOverride: null,
};

let achievementCatalog = [];
let materialDrops = {};
