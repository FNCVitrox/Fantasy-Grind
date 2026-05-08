const classCatalog = {
  warrior: {
    name: "Krieger",
    description: "Standhaft, direkt und stark mit Waffen.",
    abilities: ["battleRush", "shatter", "counterBlow"],
    buildAbilities: {
      tank: ["shieldWall", "tauntingBlow", "lastStand"],
      damage: ["heavyStrike", "bladeFlurry", "execute"],
      bruiser: ["battleRush", "shatter", "counterBlow"],
    },
  },
};

const buildCatalog = {
  tank: {
    name: "Tank",
    description: "Mehr Leben und Verteidigung. Schildwall ist stärker.",
    damageMultiplier: 0.92,
    defenseMultiplier: 1.18,
    maxHpMultiplier: 1.16,
    critChanceBonus: 0.01,
    critDamageBonus: 0.05,
    abilities: ["shieldWall", "tauntingBlow", "lastStand"],
  },
  damage: {
    name: "Schaden",
    description: "Mehr Schaden, aber etwas weniger Leben.",
    damageMultiplier: 1.16,
    defenseMultiplier: 0.94,
    maxHpMultiplier: 0.94,
    critChanceBonus: 0.06,
    critDamageBonus: 0.25,
    abilities: ["heavyStrike", "bladeFlurry", "execute"],
  },
  bruiser: {
    name: "Bruiser",
    description: "Ausgewogen. Kampfrausch heilt stärker.",
    damageMultiplier: 1.06,
    defenseMultiplier: 1.06,
    maxHpMultiplier: 1.04,
    critChanceBonus: 0.03,
    critDamageBonus: 0.1,
    abilities: ["battleRush", "shatter", "counterBlow"],
  },
};

const abilityCatalog = {
  heavyStrike: {
    name: "Schwerer Hieb",
    text: "Jede 3. Runde: 175% Schaden.",
  },
  bladeFlurry: {
    name: "Klingenserie",
    text: "Jede 4. Runde: ein zweiter Treffer mit 45% Schaden.",
  },
  execute: {
    name: "Hinrichten",
    text: "Unter 30% Gegnerleben: 150% Schaden, höchstens alle 2 Runden.",
  },
  shieldWall: {
    name: "Schildwall",
    text: "Jede 4. Runde: nächster Gegentreffer -55%.",
  },
  tauntingBlow: {
    name: "Spottender Schlag",
    text: "Jede 3. Runde: Angriff und gegnerischer Schaden -25%.",
  },
  lastStand: {
    name: "Letztes Aufbäumen",
    text: "Einmal unter 40% Leben: Heilung und kurze Schadensdämpfung.",
  },
  battleRush: {
    name: "Kampfrausch",
    text: "Einmal unter 45% Leben: heilt 18% Leben.",
  },
  shatter: {
    name: "Zerschmettern",
    text: "Jede 3. Runde: 130% Schaden und ein Teil der Rüstung wird ignoriert.",
  },
  counterBlow: {
    name: "Konterschlag",
    text: "Nach hartem Treffer: Konter mit 50% Schaden, höchstens alle 3 Runden.",
  },
};
