const classCatalog = {
  warrior: {
    name: "Krieger",
    description: "Standhaft, direkt und stark mit Waffen.",
    statBonuses: {},
    buildDescriptions: {
      tank: "Mehr Leben und Verteidigung. Schildwall ist stärker.",
      damage: "Mehr Schaden, aber etwas weniger Leben.",
      bruiser: "Ausgewogen. Kampfrausch heilt stärker.",
    },
    abilities: ["battleRush", "shatter", "counterBlow"],
    buildAbilities: {
      tank: ["shieldWall", "tauntingBlow", "lastStand"],
      damage: ["heavyStrike", "bladeFlurry", "execute"],
      bruiser: ["battleRush", "shatter", "counterBlow"],
    },
  },
  mage: {
    name: "Magier",
    description: "Arkan, zerbrechlich und stark über Zauberfenster.",
    statBonuses: {
      damageMultiplier: 1.08,
      defenseMultiplier: 0.9,
      maxHpMultiplier: 0.9,
      critChanceBonus: 0.03,
      critDamageBonus: 0.18,
    },
    buildDescriptions: {
      tank: "Arkane Barrieren statt schwerer Rüstung.",
      damage: "Hohe Zauberspitzen, aber sehr verwundbar.",
      bruiser: "Runenfluss heilt und kontert mit Magie.",
    },
    abilities: ["spellRush", "runeCrush", "wardCounter"],
    buildAbilities: {
      tank: ["manaWard", "frostAegis", "lastSpark"],
      damage: ["arcaneBolt", "emberNova", "spellRend"],
      bruiser: ["spellRush", "runeCrush", "wardCounter"],
    },
  },
  rogue: {
    name: "Schurke",
    description: "Schnell, riskant und stark über Ausweichen und Finisher.",
    statBonuses: {
      damageMultiplier: 1.04,
      defenseMultiplier: 0.94,
      maxHpMultiplier: 0.94,
      critChanceBonus: 0.05,
      critDamageBonus: 0.22,
    },
    buildDescriptions: {
      tank: "Überlebt durch Ausweichen und Blendtricks.",
      damage: "Sehr hohe Crit-Fenster und starke Finisher.",
      bruiser: "Kontert, heilt leicht und ignoriert Rüstung.",
    },
    abilities: ["adrenaline", "armorPiercer", "riposte"],
    buildAbilities: {
      tank: ["shadowVeil", "blindside", "lastTrick"],
      damage: ["backstab", "dualCut", "finisher"],
      bruiser: ["adrenaline", "armorPiercer", "riposte"],
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
  arcaneBolt: {
    name: "Arkaner Schlag",
    text: "Jede 3. Runde: 170% Zauberschaden.",
  },
  emberNova: {
    name: "Glutnova",
    text: "Jede 4. Runde: ein zweiter Treffer mit 50% Schaden.",
  },
  spellRend: {
    name: "Risszauber",
    text: "Unter 30% Gegnerleben: 155% Schaden, höchstens alle 2 Runden.",
  },
  manaWard: {
    name: "Manawall",
    text: "Jede 4. Runde: nächster Gegentreffer -55%.",
  },
  frostAegis: {
    name: "Frostaegis",
    text: "Jede 3. Runde: Treffer und gegnerischer Schaden -25%.",
  },
  lastSpark: {
    name: "Letzter Funke",
    text: "Einmal unter 40% Leben: Heilung und kurze Schadensdämpfung.",
  },
  spellRush: {
    name: "Runenrausch",
    text: "Einmal unter 45% Leben: heilt 16% Leben.",
  },
  runeCrush: {
    name: "Runenbruch",
    text: "Jede 3. Runde: 130% Schaden und ein Teil der Rüstung wird ignoriert.",
  },
  wardCounter: {
    name: "Spiegelkonter",
    text: "Nach hartem Treffer: Konter mit 55% Schaden, höchstens alle 3 Runden.",
  },
  backstab: {
    name: "Rückenstich",
    text: "Jede 3. Runde: 168% Schaden.",
  },
  dualCut: {
    name: "Doppelschnitt",
    text: "Jede 4. Runde: ein zweiter Treffer mit 55% Schaden.",
  },
  finisher: {
    name: "Finaler Stich",
    text: "Unter 30% Gegnerleben: 160% Schaden, höchstens alle 2 Runden.",
  },
  shadowVeil: {
    name: "Schattenmantel",
    text: "Jede 4. Runde: nächster Gegentreffer -55%.",
  },
  blindside: {
    name: "Blendwurf",
    text: "Jede 3. Runde: Treffer und gegnerischer Schaden -25%.",
  },
  lastTrick: {
    name: "Letzter Trick",
    text: "Einmal unter 40% Leben: Heilung und kurze Schadensdämpfung.",
  },
  adrenaline: {
    name: "Adrenalin",
    text: "Einmal unter 45% Leben: heilt 15% Leben.",
  },
  armorPiercer: {
    name: "Panzerstecher",
    text: "Jede 3. Runde: 130% Schaden und ein Teil der Rüstung wird ignoriert.",
  },
  riposte: {
    name: "Riposte",
    text: "Nach hartem Treffer: Konter mit 60% Schaden, höchstens alle 3 Runden.",
  },
};
