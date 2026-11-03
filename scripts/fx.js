// Spielgefühl im Kampf (Punkt 19): Wackeln, Partikel, Loot-Regen, Lichtsäule, hochzählende Zahlen.
// Alles läuft über reine CSS-Animationen auf kurzlebigen Elementen und wird bei reduzierten Effekten
// (Einstellung oder prefers-reduced-motion) übersprungen. Geladen nach core.js.

const fxQualityColors = { common: "#d5d0c0", rare: "#78aee4", epic: "#b78be0", legendary: "#e2b855" };
const fxQualityRank = { common: 0, rare: 1, epic: 2, legendary: 3 };
const fxCounters = {};

function fxReduced() {
  const setting = typeof normalizeSettings === "function" ? normalizeSettings(state?.settings).reducedEffects : false;
  const media = typeof window !== "undefined" && typeof window.matchMedia === "function"
    ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
    : false;
  return Boolean(setting || media);
}

function fxStage() {
  return typeof document !== "undefined" && document.getElementById ? document.getElementById("battleStage") : null;
}

function fxSpawn(parent, className, style, lifetime) {
  const node = document.createElement("span");
  node.className = className;
  Object.entries(style).forEach(([key, value]) => node.style.setProperty(key, value));
  parent.appendChild(node);
  window.setTimeout(() => node.remove(), lifetime);
  return node;
}

// Kurzes Wackeln der Kampfbühne (kritische Treffer, Boss-Treffer).
function fxShake(strength = 1) {
  const stage = fxStage();
  if (!stage || fxReduced()) return;
  stage.style.setProperty("--fx-shake", `${Math.round(4 + strength * 4)}px`);
  stage.classList.remove("fx-shake");
  void stage.offsetWidth;
  stage.classList.add("fx-shake");
  window.setTimeout(() => stage.classList.remove("fx-shake"), 380);
}

// Funken am getroffenen Ziel. side: "left" (Held getroffen) oder "right" (Gegner getroffen).
function fxHitParticles(side, critical = false) {
  const stage = fxStage();
  if (!stage || fxReduced()) return;
  const count = critical ? 14 : 7;
  const color = critical ? "#ff5a4a" : side === "right" ? "#f6df9b" : "#ff9a7a";
  for (let index = 0; index < count; index += 1) {
    const angle = (Math.PI * 2 * index) / count + Math.random() * 0.6;
    const distance = (critical ? 46 : 30) + Math.random() * 22;
    fxSpawn(stage, `fx-spark fx-${side}`, {
      "--dx": `${Math.round(Math.cos(angle) * distance)}px`,
      "--dy": `${Math.round(Math.sin(angle) * distance - 12)}px`,
      "--fx-color": color,
      "--fx-size": `${critical ? 6 : 4 + Math.round(Math.random() * 2)}px`,
    }, 650);
  }
}

// Ebene über allen Fenstern (das Beute-Fenster öffnet sofort nach dem Sieg und würde die Bühne verdecken).
function fxLayer() {
  if (typeof document === "undefined" || !document.body || !document.createElement) return null;
  let layer = document.getElementById("fxLayer");
  if (!layer) {
    layer = document.createElement("div");
    layer.id = "fxLayer";
    layer.className = "fx-layer";
    layer.setAttribute("aria-hidden", "true");
    document.body.appendChild(layer);
  }
  return layer;
}

// Beute fällt in der Farbe der besten Seltenheit von oben über den Bildschirm.
function fxLootRain(items) {
  const layer = fxLayer();
  if (!layer || fxReduced() || !Array.isArray(items) || !items.length) return;
  const best = items.reduce((top, item) => (fxQualityRank[item?.quality] || 0) > (fxQualityRank[top] || 0) ? item.quality : top, "common");
  const color = fxQualityColors[best] || fxQualityColors.common;
  const count = 14 + (fxQualityRank[best] || 0) * 8;
  for (let index = 0; index < count; index += 1) {
    fxSpawn(layer, `fx-loot fx-loot-${best}`, {
      "--x": `${20 + Math.random() * 60}%`,
      "--fall": `${45 + Math.random() * 45}vh`,
      "--drift": `${Math.round(Math.random() * 60 - 30)}px`,
      "--delay": `${Math.round(Math.random() * 450)}ms`,
      "--fx-color": color,
    }, 1800);
  }
  if (best === "legendary" || best === "epic") {
    fxSpawn(layer, `fx-loot-flash fx-loot-${best}`, { "--fx-color": color }, 1000);
  }
}

// Lichtsäule über dem Helden und ein Banner beim Levelaufstieg (auch Paragon).
function fxLevelUp(label) {
  const layer = fxLayer();
  if (!layer) return;
  if (typeof audioPlay === "function") audioPlay("levelUp");
  const banner = fxSpawn(layer, "fx-level-banner", {}, 2200);
  banner.textContent = label;
  if (fxReduced()) return;
  const hero = document.getElementById("heroSprite")?.getBoundingClientRect?.();
  if (!hero || !hero.width) return;
  const centerX = `${Math.round(hero.left + hero.width / 2)}px`;
  fxSpawn(layer, "fx-level-pillar", { "--cx": centerX, "--bottom": `${Math.round(hero.bottom)}px`, "--height": `${Math.round(Math.min(hero.bottom, 320))}px` }, 1500);
  for (let index = 0; index < 14; index += 1) {
    fxSpawn(layer, "fx-level-mote", {
      "--cx": `calc(${centerX} + ${Math.round(Math.random() * 56 - 28)}px)`,
      "--bottom": `${Math.round(hero.bottom - 20)}px`,
      "--delay": `${Math.round(Math.random() * 600)}ms`,
      "--rise": `${90 + Math.random() * 80}px`,
    }, 1800);
  }
}

// Boss-Phasenwechsel (Punkt 23): Banner auf der Bühne, roter Blitz und starkes Wackeln.
function fxBossPhase(label) {
  const stage = fxStage();
  if (!stage) return;
  const banner = fxSpawn(stage, "fx-phase-banner", {}, 1900);
  banner.textContent = label;
  if (fxReduced()) return;
  fxSpawn(stage, "fx-phase-flash", {}, 900);
  fxShake(1.8);
}

// Kurzer schwebender Hinweis wie "+120 XP" neben einem Wert.
function fxFloatGain(id, text) {
  const element = typeof document !== "undefined" && document.getElementById ? document.getElementById(id) : null;
  if (!element || !element.parentElement) return;
  const gain = fxSpawn(element.parentElement, "fx-gain", {}, 1100);
  gain.textContent = text;
}

// Zahl im Element hochzählen (Gold, Ruhm, Level) und "+N" daneben zeigen.
function fxCountTo(id, value) {
  const element = typeof document !== "undefined" && document.getElementById ? document.getElementById(id) : null;
  if (!element) return;
  const target = Math.floor(Number(value) || 0);
  const previous = fxCounters[id];
  if (previous && previous.target === target) return;
  const from = previous ? previous.shown : target;
  if (previous?.frame) cancelAnimationFrame(previous.frame);
  const counter = { target, shown: from, frame: 0 };
  fxCounters[id] = counter;
  const diff = target - from;
  if (!previous || diff <= 0 || fxReduced() || typeof requestAnimationFrame !== "function") {
    counter.shown = target;
    element.textContent = String(target);
    return;
  }
  fxFloatGain(id, `+${diff}`);
  const start = performance.now();
  const duration = Math.min(900, 300 + diff * 4);
  const step = (now) => {
    const progress = Math.min(1, (now - start) / duration);
    const eased = 1 - Math.pow(1 - progress, 3);
    counter.shown = Math.round(from + diff * eased);
    element.textContent = String(counter.shown);
    counter.frame = progress < 1 ? requestAnimationFrame(step) : 0;
  };
  counter.frame = requestAnimationFrame(step);
}
