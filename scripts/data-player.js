const classCatalog = {
  warrior: {
    name: "Krieger",
    description: "Standhaft, direkt und stark mit Waffen.",
    statBonuses: {},
    buildNames: {
      tank: "Wächter",
      damage: "Berserker",
      bruiser: "Kriegsveteran",
    },
    buildDescriptions: {
      tank: "Defensiver Tank mit viel Überleben.",
      damage: "Aggressiver Nahkampf mit hohem Schaden.",
      bruiser: "Balance aus Schaden und Defensive.",
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
    buildNames: {
      tank: "Frostmagier",
      damage: "Feuermagier",
      bruiser: "Dunkelmagier",
    },
    buildDescriptions: {
      tank: "Kontrolle und Defensive.",
      damage: "Hoher Burst-Schaden mit Feuerzaubern.",
      bruiser: "Lebensentzug und Schwächung.",
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
    buildNames: {
      tank: "Phantom",
      damage: "Assassine",
      bruiser: "Giftläufer",
    },
    buildDescriptions: {
      tank: "Ausweichen und schnelles Gameplay.",
      damage: "Hoher Crit-Schaden gegen Einzelziele.",
      bruiser: "Schaden über Zeit mit Gift-Effekten.",
    },
    abilities: ["adrenaline", "armorPiercer", "riposte"],
    buildAbilities: {
      tank: ["shadowVeil", "blindside", "lastTrick"],
      damage: ["backstab", "dualCut", "finisher"],
      bruiser: ["adrenaline", "armorPiercer", "riposte"],
    },
  },
  archer: {
    name: "Bogenschütze",
    description: "Präzise, beweglich und stark über sichere Trefferfenster.",
    statBonuses: {
      damageMultiplier: 1.06,
      defenseMultiplier: 0.96,
      maxHpMultiplier: 0.96,
      critChanceBonus: 0.04,
      critDamageBonus: 0.16,
    },
    buildNames: {
      tank: "Fallenjäger",
      damage: "Scharfschütze",
      bruiser: "Schnellfeuer",
    },
    buildDescriptions: {
      tank: "Kontrolle und sichere Kämpfe.",
      damage: "Langsame, aber extrem starke Treffer.",
      bruiser: "Viele schnelle Angriffe.",
    },
    abilities: ["hunterFocus", "piercingArrow", "snapShot"],
    buildAbilities: {
      tank: ["distanceGuard", "pinningShot", "survivalInstinct"],
      damage: ["powerShot", "rapidVolley", "heartpiercer"],
      bruiser: ["hunterFocus", "piercingArrow", "snapShot"],
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
    name: "Wutschlag",
    text: "Hoher Schaden.",
    cost: 2,
  },
  bladeFlurry: {
    name: "Blutrausch",
    text: "Mehr Schaden über mehrere Runden.",
    cost: 4,
  },
  execute: {
    name: "Hinrichtung",
    text: "Extremer Schaden gegen Gegner unter 30% Leben.",
    cost: 6,
  },
  shieldWall: {
    name: "Schildschlag",
    text: "Kleiner Schaden und starke Deckung.",
    cost: 2,
  },
  tauntingBlow: {
    name: "Eisenhaut",
    text: "Reduziert erhaltenen Schaden.",
    cost: 3,
  },
  lastStand: {
    name: "Letzter Widerstand",
    text: "Rettungsfähigkeit für tödliche Momente.",
    cost: 6,
  },
  battleRush: {
    name: "Kampfrausch",
    text: "Heilt einen Teil deines Lebens.",
    cost: 2,
  },
  shatter: {
    name: "Zertrümmern",
    text: "Schaden und Rüstung des Gegners brechen.",
    cost: 3,
  },
  counterBlow: {
    name: "Titanenhieb",
    text: "Sehr hoher Einzelziel-Schaden.",
    cost: 5,
  },
  arcaneBolt: {
    name: "Feuerball",
    text: "Starker magischer Feuerschaden.",
    cost: 2,
  },
  emberNova: {
    name: "Verbrennen",
    text: "Brandschaden über mehrere Runden.",
    cost: 3,
  },
  spellRend: {
    name: "Inferno",
    text: "Massiver Feuerschaden.",
    cost: 6,
  },
  manaWard: {
    name: "Eislanze",
    text: "Schaden und Kontrolle.",
    cost: 2,
  },
  frostAegis: {
    name: "Eisrüstung",
    text: "Weniger Schaden erhalten.",
    cost: 3,
  },
  lastSpark: {
    name: "Frostgefängnis",
    text: "Kontrolliert den nächsten Gegnerzug.",
    cost: 5,
  },
  spellRush: {
    name: "Seelenraub",
    text: "Schaden und Heilung gleichzeitig.",
    cost: 2,
  },
  runeCrush: {
    name: "Dunkler Fluch",
    text: "Schwächt gegnerischen Schaden.",
    cost: 3,
  },
  wardCounter: {
    name: "Schattenexplosion",
    text: "Großer Finisher-Schaden.",
    cost: 6,
  },
  backstab: {
    name: "Rückenstich",
    text: "Hoher Crit-Schaden.",
    cost: 2,
  },
  dualCut: {
    name: "Unsichtbarkeit",
    text: "Nächster Angriff wird deutlich gefährlicher.",
    cost: 3,
  },
  finisher: {
    name: "Tödlicher Stich",
    text: "Massiver Einzelziel-Schaden.",
    cost: 6,
  },
  shadowVeil: {
    name: "Schattenrolle",
    text: "Hohe Ausweichchance.",
    cost: 2,
  },
  blindside: {
    name: "Spiegelbild",
    text: "Chance, Angriffe komplett zu vermeiden.",
    cost: 4,
  },
  lastTrick: {
    name: "Phantomschlag",
    text: "Extra Schaden nach erfolgreichem Ausweichen.",
    cost: 5,
  },
  adrenaline: {
    name: "Giftklinge",
    text: "Vergiftet den Gegner.",
    cost: 2,
  },
  armorPiercer: {
    name: "Toxischer Schnitt",
    text: "Mehr Schaden gegen geschwächte Gegner.",
    cost: 3,
  },
  riposte: {
    name: "Todesgift",
    text: "Sehr starker Gift-Effekt.",
    cost: 5,
  },
  powerShot: {
    name: "Präzisionsschuss",
    text: "Hoher Schaden.",
    cost: 2,
  },
  rapidVolley: {
    name: "Fokussieren",
    text: "Erhöht die Chance auf kritische Treffer.",
    cost: 3,
  },
  heartpiercer: {
    name: "Kopfschuss",
    text: "Extremer Einzelziel-Schaden.",
    cost: 6,
  },
  distanceGuard: {
    name: "Bärenfalle",
    text: "Kontrolliert den Gegner.",
    cost: 2,
  },
  pinningShot: {
    name: "Tarnung",
    text: "Mehr Ausweichen und Crit-Chance.",
    cost: 3,
  },
  survivalInstinct: {
    name: "Explosionsfalle",
    text: "Großer verzögerter Schaden.",
    cost: 5,
  },
  hunterFocus: {
    name: "Doppelschuss",
    text: "Zwei schnelle Treffer.",
    cost: 2,
  },
  piercingArrow: {
    name: "Pfeilsturm",
    text: "Mehrere schnelle Treffer.",
    cost: 4,
  },
  snapShot: {
    name: "Jagdrausch",
    text: "Massive Angriffsgeschwindigkeit.",
    cost: 5,
  },
};
