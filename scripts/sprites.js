// SVG-Figuren für Held und Gegner (Punkt 17).
// Jede Figur wird aus Teilen zusammengesetzt: Form (Mensch, Wolf, Keiler, Krähe, Schemen, Ratte),
// Kopf, Waffe, Nebenhand und Farben. Gezeichnet wird nach rechts schauend; Gegner werden gespiegelt.
// Geladen nach core.js, daher dürfen hier Konstanten stehen.

const spritePalettes = {
  steel: { main: "#5b6f8a", main2: "#475a73", dark: "#1f2a37", accent: "#3a5a9a", metal: "#c8d0dc", skin: "#e0b48f", glow: "#f1c96b" },
  wolf: { main: "#6b7480", main2: "#545c67", dark: "#2b323b", accent: "#a3acb6", metal: "#d9dee5", skin: "#6b7480", glow: "#f1c96b" }
};

// Grundform je Basis-Klasse, danach Feinschliff je Variante. Jede Klasse aus enemies[].sprite muss hier stehen (smoke.js prüft das).
const spriteVariants = {
  "enemy-wolf": { form: "wolf", colors: {} },
  "enemy-iron-hound": { colors: { main: "#7d8794", main2: "#646d79", accent: "#b0884a", glow: "#ff8a4c" }, extras: ["collar"] },
  "enemy-ember-stalker": { colors: { main: "#5a2c22", main2: "#46221b", dark: "#1e0f0c", accent: "#ff7a3a", glow: "#ffb347" }, extras: ["stripes"] },
  "enemy-bog-wolf": { colors: { main: "#4d5a3a", main2: "#3c472d", dark: "#1d2416", accent: "#8fae62", glow: "#b8f06a" }, extras: ["moss"] },
  "enemy-cinder-hound": { colors: { main: "#3a3434", main2: "#2c2727", dark: "#140f0f", accent: "#ff5a2a", glow: "#ffcf5a" }, extras: ["stripes", "collar"] },

  "enemy-bandit": { form: "humanoid", head: "hood", weapon: "sword", off: "none", colors: { main: "#6b4b33", main2: "#573d29", dark: "#2a1d14", accent: "#3d5a3f", metal: "#c9ced6", skin: "#d9a982", glow: "#f1c96b" } },
  "enemy-road-thief": { head: "mask", weapon: "knife", off: "knife", colors: { main: "#4a3b5c", main2: "#3a2e49", accent: "#2a2233" } },
  "enemy-ash-marauder": { head: "mask", weapon: "axe", colors: { main: "#4a3a36", main2: "#3b2e2b", accent: "#a8452f", glow: "#ff8a4c" } },
  "enemy-poacher": { head: "cap", weapon: "knife", off: "none", colors: { main: "#5b4a2e", main2: "#4a3c25", accent: "#6e7a3c" }, extras: ["quiver"] },
  "enemy-crossbow-brigand": { head: "hood", weapon: "crossbow", colors: { main: "#4b4a52", main2: "#3c3b42", accent: "#8a3a3a" } },

  "enemy-boar": { form: "boar", colors: { main: "#6a4a35", main2: "#563b2a", dark: "#2a1c13", accent: "#3b2a1f", metal: "#efe6cf", glow: "#ff6a4a" } },
  "enemy-crown-beast": { colors: { main: "#4a2f4a", main2: "#3a243a", accent: "#e2b855", metal: "#f4e7c0", glow: "#ff6ad5" }, extras: ["crown"], scale: 1.12 },

  "enemy-knight": { form: "humanoid", head: "helm", weapon: "sword", off: "shield", colors: { main: "#6a7380", main2: "#555d68", dark: "#1f252d", accent: "#4a6a8a", metal: "#b8c0ca", skin: "#d9a982", glow: "#f1c96b" } },
  "enemy-old-knight": { colors: { main: "#7a6a55", main2: "#635645", metal: "#8e969e", accent: "#4a6a8a" }, extras: ["plume"] },
  "enemy-crown-sentinel": { head: "crownHelm", weapon: "spear", off: "tower", colors: { main: "#5a4a2a", metal: "#d6c27a", accent: "#6a2f8a" } },
  "enemy-mercenary-captain": { colors: { main: "#5a4632", main2: "#47382a", accent: "#b8452f" }, extras: ["cape", "plume"] },
  "enemy-ashen-warlord": { head: "horns", weapon: "greatsword", off: "none", colors: { main: "#3a3434", main2: "#2d2828", dark: "#120e0e", metal: "#777b80", accent: "#ff6a2a", glow: "#ffb347" }, extras: ["cape"], scale: 1.08 },
  "enemy-tower-warden": { head: "helm", weapon: "hammer", off: "tower", colors: { main: "#3d3566", main2: "#2e2850", metal: "#a99ad6", accent: "#b089ff", glow: "#d5b8ff" }, extras: ["runes"], scale: 1.14 },
  "enemy-chain-warden": { weapon: "flail", colors: { main: "#4a4d52", metal: "#7a7f86", accent: "#b88a3a" }, extras: ["chains"], scale: 1.08 },
  "enemy-iron-duke": { head: "crownHelm", weapon: "greatsword", off: "none", colors: { main: "#6a7280", metal: "#b5bcc6", accent: "#8a2a3a", glow: "#ffcf5a" }, extras: ["cape"], scale: 1.12 },

  "enemy-acolyte": { form: "humanoid", head: "hood", weapon: "staff", off: "none", robe: true, colors: { main: "#3a3442", main2: "#2e2935", dark: "#141118", accent: "#6b5a8a", metal: "#9a8a6a", skin: "#c9b49a", glow: "#9af0ff" } },
  "enemy-plague-crow": { form: "crow", colors: { main: "#2d2f3a", main2: "#22242d", dark: "#0f1014", accent: "#6a8a3a", metal: "#c9a24a", glow: "#b8f06a" } },
  "enemy-field-wraith": { form: "wraith", colors: { main: "#8f9bae", main2: "#6b7789", dark: "#2a3140", accent: "#c7d2e2", glow: "#9af0ff" } },
  "enemy-bog-ghoul": { form: "wraith", colors: { main: "#4f6146", main2: "#3c4b35", dark: "#182014", accent: "#8fae62", glow: "#d6ff6a" }, extras: ["claws"] },
  "enemy-plague-witch": { head: "hat", colors: { main: "#33402c", main2: "#283322", accent: "#6a8a3a", skin: "#a9b98f", glow: "#b8f06a" }, extras: ["potion"] },
  "enemy-bone-acolyte": { head: "skull", colors: { main: "#3a3442", accent: "#c9c1ad", skin: "#ded6c0", glow: "#9af0ff" } },
  "enemy-ember-priest": { colors: { main: "#6a2a22", main2: "#55211b", accent: "#ffb347", metal: "#c98a3a", glow: "#ff7a3a" }, scale: 1.08 },

  "enemy-ratguard": { form: "rat", weapon: "spear", off: "shield", colors: { main: "#6a6f78", main2: "#565a62", dark: "#22252a", accent: "#8a5a3a", metal: "#a9b0b8", skin: "#8a7a6c", glow: "#ff5a5a" }, scale: 1.05 },

  "enemy-brute": { form: "humanoid", build: "brute", head: "bald", weapon: "hammer", off: "none", colors: { main: "#5a4a3c", main2: "#47392e", dark: "#1f1812", accent: "#8a6a4a", metal: "#8a8f96", skin: "#b08a6a", glow: "#ffcf5a" } },
  "enemy-crypt-brute": { colors: { main: "#4d564a", main2: "#3c443a", skin: "#8a9a86", accent: "#6a7466", glow: "#9af0ff" }, extras: ["chains"], scale: 1.1 },
  "enemy-oath-forger": { head: "helm", colors: { main: "#4a3a30", main2: "#3b2e26", accent: "#ff8a3a", metal: "#6f6a66", glow: "#ffb347" }, extras: ["apron"], scale: 1.12 },

  "enemy-champion": { form: "humanoid", build: "champion", head: "horns", weapon: "greatsword", off: "none", colors: { main: "#3b254d", main2: "#2e1d3c", dark: "#120a18", accent: "#d5a7ff", metal: "#f4df93", skin: "#cbb8d9", glow: "#34d5d8" }, extras: ["cape", "runes"] },
  "enemy-hollow-champion": { scale: 1.12 }
};

const heroSpriteLooks = {
  warrior: {
    base: { head: "helm", weapon: "sword", off: "buckler", colors: { main: "#5a5f6a", main2: "#474b54", dark: "#1c2028", accent: "#8a2f2f", metal: "#c8d0dc", skin: "#e0b48f", glow: "#f1c96b" } },
    tank: { off: "tower", extras: ["plume"], colors: { main: "#5b6f8a", main2: "#475a73", accent: "#3a5a9a" } },
    damage: { head: "horns", weapon: "greatsword", off: "none", colors: { main: "#7a2f2f", main2: "#622525", accent: "#d8ae4b" }, extras: ["cape"] },
    bruiser: {}
  },
  mage: {
    base: { head: "hat", weapon: "staff", off: "orb", robe: true, colors: { main: "#334a7a", main2: "#283b62", dark: "#121a2c", accent: "#d8ae4b", metal: "#b08a5a", skin: "#e0b48f", glow: "#9af0ff" } },
    tank: { colors: { main: "#3a5a6a", accent: "#9af0ff" } },
    damage: { colors: { main: "#6a2a5a", accent: "#ff8ad5", glow: "#ff8ad5" } },
    bruiser: {}
  },
  rogue: {
    base: { head: "hood", weapon: "knife", off: "knife", colors: { main: "#33383f", main2: "#272b31", dark: "#101215", accent: "#3a6a5a", metal: "#d6dbe2", skin: "#e0b48f", glow: "#7cf0b8" } },
    tank: { colors: { accent: "#5a5f6a" }, extras: ["cape"] },
    damage: { colors: { accent: "#8a2f2f" } },
    bruiser: {}
  },
  archer: {
    base: { head: "cap", weapon: "bow", off: "none", colors: { main: "#3e5a35", main2: "#30472a", dark: "#141d11", accent: "#8a6a3a", metal: "#b08a5a", skin: "#e0b48f", glow: "#f1c96b" }, extras: ["quiver"] },
    tank: { colors: { main: "#4a5a4a" }, extras: ["quiver", "cape"] },
    damage: { colors: { accent: "#b8452f" } },
    bruiser: {}
  }
};

function mergeSpriteSpec(...specs) {
  const out = { colors: {}, extras: [] };
  specs.filter(Boolean).forEach((spec) => {
    Object.entries(spec).forEach(([key, value]) => {
      if (key === "colors") Object.assign(out.colors, value);
      else if (key === "extras") out.extras = [...value];
      else out[key] = value;
    });
  });
  return out;
}

// Liefert die zusammengeführte Beschreibung für eine Gegner-Klassenliste wie "enemy-knight enemy-old-knight".
function enemySpriteSpec(spriteClasses) {
  const tokens = String(spriteClasses || "").split(/\s+/).filter(Boolean);
  const specs = tokens.map((token) => spriteVariants[token]).filter(Boolean);
  const spec = mergeSpriteSpec({ form: "humanoid", colors: spritePalettes.steel }, ...specs);
  if (spec.form === "wolf") spec.colors = { ...spritePalettes.wolf, ...specs.reduce((acc, s) => ({ ...acc, ...(s.colors || {}) }), {}) };
  return spec;
}

function heroSpriteSpec(characterClass, build) {
  const looks = heroSpriteLooks[characterClass] || heroSpriteLooks.warrior;
  return mergeSpriteSpec({ form: "humanoid" }, looks.base, looks[build] || {});
}

function spriteStyle(colors) {
  return ["main", "main2", "dark", "accent", "metal", "skin", "glow"]
    .map((key) => `--sp-${key}:${colors[key] || spritePalettes.steel[key]}`)
    .join(";");
}

function svgHead(type) {
  const eye = '<circle class="spr-eye" cx="65" cy="37" r="1.9"/>';
  const face = '<circle cx="60" cy="38" r="11" fill="var(--sp-skin)"/>';
  switch (type) {
    case "helm":
      return `<path d="M48 41a12 13 0 0 1 24 0v7q-12 3-24 0z" fill="var(--sp-metal)" stroke="var(--sp-dark)" stroke-width="1.5"/><rect x="58" y="38" width="13" height="3.4" rx="1" fill="var(--sp-dark)"/><circle class="spr-eye" cx="66" cy="39.7" r="1.4"/><path d="M60 28v20" stroke="var(--sp-dark)" stroke-width="1" opacity=".35"/>`;
    case "crownHelm":
      return `${svgHead("helm")}<path d="M49 30l3-7 4 5 4-7 4 7 4-5 3 7z" fill="var(--sp-accent)" stroke="var(--sp-dark)" stroke-width="1"/>`;
    case "horns":
      return `${svgHead("helm")}<path d="M50 31q-9-3-10-12q5 6 12 7zM70 31q9-3 10-12q-5 6-12 7z" fill="#e8dcc0" stroke="var(--sp-dark)" stroke-width="1"/>`;
    case "hood":
      return `${face}<path d="M46 47q-3-24 15-24q13 1 13 24l-5-2q1-10-8-10q-9 0-9 11z" fill="var(--sp-accent)" stroke="var(--sp-dark)" stroke-width="1.5"/><path d="M52 38q8-6 16 0v8H52z" fill="var(--sp-dark)" opacity=".55"/>${eye}`;
    case "mask":
      return `${svgHead("hood")}<rect x="54" y="40" width="18" height="6" rx="2" fill="var(--sp-dark)"/>`;
    case "cap":
      return `${face}<path d="M48 36q2-12 13-12q11 0 12 10l6 2-6 1q-12-4-25-1z" fill="var(--sp-accent)" stroke="var(--sp-dark)" stroke-width="1.2"/>${eye}`;
    case "hat":
      return `${face}<path d="M42 33q18-6 38 1q-18 3-38-1z" fill="var(--sp-main2)" stroke="var(--sp-dark)" stroke-width="1.2"/><path d="M50 32q6-20 20-24q-4 8-4 25z" fill="var(--sp-main)" stroke="var(--sp-dark)" stroke-width="1.2"/><path d="M51 31q9 2 16 0" stroke="var(--sp-accent)" stroke-width="2.4" fill="none"/>${eye}`;
    case "skull":
      return `<circle cx="60" cy="37" r="11" fill="var(--sp-skin)" stroke="var(--sp-dark)" stroke-width="1.2"/><rect x="55" y="44" width="11" height="5" rx="1.5" fill="var(--sp-skin)" stroke="var(--sp-dark)" stroke-width="1"/><circle cx="58.5" cy="37" r="2.8" fill="var(--sp-dark)"/><circle cx="66" cy="37" r="2.8" fill="var(--sp-dark)"/><circle class="spr-eye" cx="66" cy="37" r="1.3"/><path d="M46 46q-3-24 15-24q13 1 13 24l-4-3q0-13-9-13q-9 0-11 13z" fill="var(--sp-main)" stroke="var(--sp-dark)" stroke-width="1.2"/>`;
    case "bald":
      return `<circle cx="61" cy="39" r="10.5" fill="var(--sp-skin)" stroke="var(--sp-dark)" stroke-width="1.2"/><path d="M62 35l7-1" stroke="var(--sp-dark)" stroke-width="2"/><circle class="spr-eye" cx="66" cy="38" r="1.7"/>`;
    default:
      return `${face}${eye}`;
  }
}

function svgWeapon(type) {
  const wrap = (body, origin = "78px 74px") => `<g class="spr-weapon" style="transform-origin:${origin}">${body}</g>`;
  switch (type) {
    case "greatsword":
      return wrap('<path d="M77 72l22-50 6 3-21 51z" fill="var(--sp-metal)" stroke="var(--sp-dark)" stroke-width="1.4"/><path d="M71 68l16 8" stroke="var(--sp-accent)" stroke-width="5" stroke-linecap="round"/><path d="M75 78l-4 8" stroke="var(--sp-dark)" stroke-width="4" stroke-linecap="round"/><path d="M84 68l15-37" class="spr-shine" stroke-width="1.6"/>');
    case "axe":
      return wrap('<path d="M78 82l12-44" stroke="#6b4a2e" stroke-width="4" stroke-linecap="round"/><path d="M86 40q14-4 16 10q-8-4-14 0z" fill="var(--sp-metal)" stroke="var(--sp-dark)" stroke-width="1.4"/>');
    case "knife":
      return wrap('<path d="M78 74l10-16 3 2-9 16z" fill="var(--sp-metal)" stroke="var(--sp-dark)" stroke-width="1.2"/><path d="M75 72l7 5" stroke="var(--sp-accent)" stroke-width="3" stroke-linecap="round"/>');
    case "spear":
      return wrap('<path d="M74 92l26-78" stroke="#6b4a2e" stroke-width="3.4" stroke-linecap="round"/><path d="M98 8l6 12-8-2z" fill="var(--sp-metal)" stroke="var(--sp-dark)" stroke-width="1.2"/>');
    case "hammer":
      return wrap('<path d="M78 84l8-44" stroke="#5a3f28" stroke-width="4.5" stroke-linecap="round"/><rect x="74" y="26" width="24" height="15" rx="3" transform="rotate(10 86 33)" fill="var(--sp-metal)" stroke="var(--sp-dark)" stroke-width="1.5"/><path d="M78 30l18 3" stroke="var(--sp-accent)" stroke-width="2" opacity=".8"/>');
    case "flail":
      return wrap('<path d="M78 76l6-20" stroke="#5a3f28" stroke-width="4" stroke-linecap="round"/><path d="M84 56q8-6 10-14" stroke="var(--sp-metal)" stroke-width="1.6" stroke-dasharray="3 2" fill="none"/><circle cx="95" cy="40" r="6" fill="var(--sp-metal)" stroke="var(--sp-dark)" stroke-width="1.4"/><path d="M95 31v18M86 40h18" stroke="var(--sp-dark)" stroke-width="1.2"/>');
    case "staff":
      return wrap('<path d="M74 98l14-74" stroke="var(--sp-metal)" stroke-width="3.6" stroke-linecap="round"/><circle class="spr-orb" cx="89" cy="19" r="5.5"/><path d="M85 25q4-9 8-1" stroke="var(--sp-metal)" stroke-width="2" fill="none"/>');
    case "crossbow":
      return wrap('<path d="M70 70h28" stroke="#6b4a2e" stroke-width="4" stroke-linecap="round"/><path d="M93 58q6 12 0 24" stroke="var(--sp-dark)" stroke-width="3" fill="none"/><path d="M93 58l-12 12 12 12" stroke="var(--sp-metal)" stroke-width="1" fill="none"/><path d="M84 70h18" stroke="var(--sp-metal)" stroke-width="1.6"/>', "76px 70px");
    case "bow":
      return wrap('<path d="M84 40q16 30 0 60" stroke="#8a6a3a" stroke-width="3.4" fill="none" stroke-linecap="round"/><path d="M84 40v60" stroke="#e8dcc0" stroke-width="1"/><path d="M70 70h22" stroke="var(--sp-metal)" stroke-width="1.6"/><path d="M92 67l4 3-4 3" fill="var(--sp-metal)"/>', "80px 70px");
    case "sword":
    default:
      return wrap('<path d="M78 72l16-36 4 2-15 37z" fill="var(--sp-metal)" stroke="var(--sp-dark)" stroke-width="1.3"/><path d="M73 68l12 7" stroke="var(--sp-accent)" stroke-width="4" stroke-linecap="round"/><path d="M84 66l11-27" class="spr-shine" stroke-width="1.3"/>');
  }
}

function svgOffhand(type) {
  switch (type) {
    case "shield":
      return '<g class="spr-off"><circle cx="40" cy="64" r="12" fill="var(--sp-accent)" stroke="var(--sp-metal)" stroke-width="3"/><circle cx="40" cy="64" r="3" fill="var(--sp-metal)"/></g>';
    case "buckler":
      return '<g class="spr-off"><circle cx="41" cy="66" r="9" fill="var(--sp-main2)" stroke="var(--sp-metal)" stroke-width="2.6"/><circle cx="41" cy="66" r="2.6" fill="var(--sp-metal)"/></g>';
    case "tower":
      return '<g class="spr-off"><path d="M28 48h22v24q0 12-11 16q-11-4-11-16z" fill="var(--sp-accent)" stroke="var(--sp-metal)" stroke-width="3"/><path d="M39 52v32M31 64h16" stroke="var(--sp-metal)" stroke-width="2.4" opacity=".75"/></g>';
    case "orb":
      return '<g class="spr-off"><circle class="spr-orb" cx="40" cy="70" r="5"/></g>';
    case "knife":
      return '<g class="spr-off"><path d="M41 74l-6-15 3-1 5 15z" fill="var(--sp-metal)" stroke="var(--sp-dark)" stroke-width="1.1"/></g>';
    default:
      return "";
  }
}

function svgHumanoid(spec) {
  const extras = new Set(spec.extras || []);
  const robe = spec.robe
    ? '<path d="M45 50q15-8 30 0l6 50H39z" fill="var(--sp-main)" stroke="var(--sp-dark)" stroke-width="1.5"/><path d="M60 54v46" stroke="var(--sp-accent)" stroke-width="3" opacity=".8"/>'
    : '<path d="M50 78h8v22H47zM62 78h8l3 22H62z" fill="var(--sp-dark)"/><path d="M47 97h11v4H45zM62 97h11l1 4H62z" fill="var(--sp-main2)"/><path d="M44 51q16-8 32 0l-2 29H46z" fill="var(--sp-main)" stroke="var(--sp-dark)" stroke-width="1.5"/><path d="M50 56q10 5 20 0" stroke="var(--sp-accent)" stroke-width="2" fill="none" opacity=".7"/><rect x="45" y="73" width="30" height="5" rx="2" fill="var(--sp-accent)"/>';
  const cape = extras.has("cape") ? '<path d="M46 50q-12 26-6 50h20l6-50z" fill="var(--sp-accent)" opacity=".85" stroke="var(--sp-dark)" stroke-width="1.2"/>' : "";
  const quiver = extras.has("quiver") ? '<path d="M44 50l-8 26 6 2 8-26z" fill="#6b4a2e" stroke="var(--sp-dark)" stroke-width="1"/><path d="M41 48l3-6M45 49l4-6" stroke="#e8dcc0" stroke-width="1.4"/>' : "";
  const plume = extras.has("plume") ? '<path d="M58 27q-4-12 8-14q-2 6 0 13z" fill="var(--sp-accent)" stroke="var(--sp-dark)" stroke-width="1"/>' : "";
  const apron = extras.has("apron") ? '<path d="M49 58h22l-2 26H51z" fill="#3a2a1f" stroke="var(--sp-dark)" stroke-width="1"/>' : "";
  const chains = extras.has("chains") ? '<path d="M45 56l30 18" stroke="var(--sp-metal)" stroke-width="2" stroke-dasharray="3 2"/>' : "";
  const runes = extras.has("runes") ? '<path class="spr-rune" d="M56 60l4-4 4 4-4 4zM52 68h16"/>' : "";
  const potion = extras.has("potion") ? '<g class="spr-off"><path d="M37 66h8l-1 4q4 3 2 8h-10q-2-5 2-8z" fill="var(--sp-glow)" opacity=".85" stroke="var(--sp-dark)" stroke-width="1"/></g>' : "";
  const backArm = '<rect x="38" y="53" width="9" height="24" rx="4.5" fill="var(--sp-main2)" stroke="var(--sp-dark)" stroke-width="1.2"/>';
  const frontArm = '<rect x="72" y="53" width="9" height="24" rx="4.5" fill="var(--sp-main2)" stroke="var(--sp-dark)" stroke-width="1.2"/><circle cx="77" cy="76" r="4" fill="var(--sp-skin)"/>';
  const twoHanded = spec.weapon === "greatsword" || spec.weapon === "bow" || spec.weapon === "crossbow";
  const off = twoHanded ? "" : (potion || svgOffhand(spec.off));
  let transform = "";
  if (spec.build === "brute") transform = "translate(60 101) scale(1.22 1.06) translate(-60 -101)";
  if (spec.build === "champion") transform = "translate(60 101) scale(1.04 1.1) translate(-60 -101)";
  return `<g ${transform ? `transform="${transform}"` : ""}>${cape}${quiver}${backArm}${off}${robe}${apron}${chains}${runes}<path d="M56 46h8v6h-8z" fill="var(--sp-skin)"/><g class="spr-head">${svgHead(spec.head)}${plume}</g>${svgWeapon(spec.weapon)}${frontArm}</g>`;
}

function svgWolf(spec) {
  const extras = new Set(spec.extras || []);
  const stripes = extras.has("stripes") ? '<path class="spr-rune" d="M44 62l4 10M54 60l3 11M64 60l2 10"/>' : "";
  const collar = extras.has("collar") ? '<path d="M80 58q4 8 1 15" stroke="var(--sp-accent)" stroke-width="4" fill="none"/><path d="M83 60l4-2M84 66l4 0M83 71l4 2" stroke="var(--sp-metal)" stroke-width="2"/>' : "";
  const moss = extras.has("moss") ? '<path d="M40 58q6-4 10 0q6-4 10 0" stroke="var(--sp-accent)" stroke-width="3" fill="none" opacity=".85"/>' : "";
  return `<path class="spr-tail" d="M30 64q-14-4-18-16q8 8 20 8z" fill="var(--sp-main2)" stroke="var(--sp-dark)" stroke-width="1.3"/>
<path d="M36 76l-3 24h7l4-20zM46 78l1 22h7l-1-22zM70 78l-2 22h7l2-22zM80 74l3 26h7l-4-26z" fill="var(--sp-main2)" stroke="var(--sp-dark)" stroke-width="1.2"/>
<ellipse cx="58" cy="68" rx="28" ry="14" fill="var(--sp-main)" stroke="var(--sp-dark)" stroke-width="1.6"/>
<path d="M38 74q20 8 40 0" stroke="var(--sp-accent)" stroke-width="3" fill="none" opacity=".55"/>${stripes}${moss}${collar}
<g class="spr-head"><path d="M78 58l10-10 4-10 4 9 4 3 14 6-2 6-12 2-10 6q-10-2-12-12z" fill="var(--sp-main)" stroke="var(--sp-dark)" stroke-width="1.6"/><path d="M86 50l2-12 6 9z" fill="var(--sp-main2)"/><path d="M110 62l3 3-5 1z" fill="var(--sp-dark)"/><path d="M98 66l8 1-2 3z" fill="#f4efe4"/><circle class="spr-eye" cx="97" cy="54" r="2.1"/></g>`;
}

function svgBoar(spec) {
  const crown = (spec.extras || []).includes("crown") ? '<path d="M78 38l3-8 4 5 4-8 4 8 4-5 2 9z" fill="var(--sp-accent)" stroke="var(--sp-dark)" stroke-width="1"/>' : "";
  return `<path d="M34 76l-2 24h8l3-20zM46 80v20h8v-20zM70 80l-1 20h8l1-20zM82 76l2 24h8l-3-24z" fill="var(--sp-main2)" stroke="var(--sp-dark)" stroke-width="1.2"/>
<path d="M28 70q0-24 32-24q28 0 32 18q2 16-30 18q-34 2-34-12z" fill="var(--sp-main)" stroke="var(--sp-dark)" stroke-width="1.8"/>
<path d="M34 50l4-8 3 7 4-9 3 8 4-9 3 8 4-8 3 8 4-7 2 8" stroke="var(--sp-accent)" stroke-width="3" fill="none" stroke-linejoin="round"/>
<g class="spr-head"><path d="M82 52q18-4 24 14l4 6-8 4q-14 4-22-6z" fill="var(--sp-main)" stroke="var(--sp-dark)" stroke-width="1.6"/><ellipse cx="107" cy="72" rx="5" ry="4" fill="var(--sp-main2)" stroke="var(--sp-dark)" stroke-width="1.2"/><path d="M100 74q8 0 10-10q-2 8-10 6z" fill="var(--sp-metal)" stroke="var(--sp-dark)" stroke-width="1"/><path d="M86 52l2-9 6 7z" fill="var(--sp-main2)"/><circle class="spr-eye" cx="96" cy="60" r="2.2"/>${crown}</g>`;
}

function svgCrow() {
  return `<g class="spr-float"><path d="M50 84l-4 14M60 84l2 14" stroke="var(--sp-metal)" stroke-width="2.4"/>
<path d="M30 70q-8-2-14 6q10 0 16-2z" fill="var(--sp-main2)"/>
<ellipse cx="58" cy="68" rx="24" ry="17" fill="var(--sp-main)" stroke="var(--sp-dark)" stroke-width="1.6"/>
<path class="spr-wing" d="M44 60q-18-24-6-38q8 14 26 26z" fill="var(--sp-main2)" stroke="var(--sp-dark)" stroke-width="1.4" style="transform-origin:60px 58px"/>
<path d="M48 76q10 6 22 0" stroke="var(--sp-accent)" stroke-width="2.4" fill="none" opacity=".8"/>
<g class="spr-head"><circle cx="80" cy="52" r="11" fill="var(--sp-main)" stroke="var(--sp-dark)" stroke-width="1.6"/><path d="M89 49l16 5-16 4z" fill="var(--sp-metal)" stroke="var(--sp-dark)" stroke-width="1"/><circle class="spr-eye" cx="83" cy="50" r="2.3"/></g></g>`;
}

function svgWraith(spec) {
  const claws = (spec.extras || []).includes("claws") ? '<path d="M82 70l8 2-7 2 6 3-7 0" stroke="var(--sp-accent)" stroke-width="1.6" fill="none"/>' : "";
  return `<g class="spr-float"><path d="M40 46q20-30 40 0l6 44-8-6-6 10-6-8-6 10-6-10-6 8-6-10-8 6z" fill="var(--sp-main)" stroke="var(--sp-dark)" stroke-width="1.5" opacity=".92"/>
<path d="M46 50q14-16 28 0v18q-14 6-28 0z" fill="var(--sp-dark)" opacity=".8"/>
<path d="M74 58q8 2 10 12" stroke="var(--sp-main2)" stroke-width="7" stroke-linecap="round" fill="none"/>${claws}
<path d="M44 68q16 8 32 0" stroke="var(--sp-accent)" stroke-width="2" fill="none" opacity=".6"/>
<g class="spr-head"><circle class="spr-eye" cx="56" cy="56" r="2.6"/><circle class="spr-eye" cx="66" cy="56" r="2.6"/></g></g>`;
}

function svgRat(spec) {
  const body = svgHumanoid({ ...spec, head: "none" });
  const head = '<g class="spr-head"><path d="M50 40q0-14 12-14q10 0 18 12l6 4-6 4q-12 4-24 2z" fill="var(--sp-skin)" stroke="var(--sp-dark)" stroke-width="1.4"/><circle cx="54" cy="26" r="6" fill="var(--sp-skin)" stroke="var(--sp-dark)" stroke-width="1.2"/><circle cx="54" cy="26" r="3" fill="#d79a9a"/><circle cx="86" cy="42" r="2" fill="var(--sp-dark)"/><circle class="spr-eye" cx="70" cy="36" r="2"/><path d="M48 34a12 9 0 0 1 22-4" stroke="var(--sp-metal)" stroke-width="4" fill="none"/></g>';
  const tail = '<path class="spr-tail" d="M46 80q-20 4-30 16" stroke="#c99a8a" stroke-width="3" fill="none" stroke-linecap="round"/>';
  return `${tail}${body.replace(/<g class="spr-head">[\s\S]*?<\/g>(?=<g class="spr-weapon")/, head)}`;
}

// Baut das komplette <svg>. side = "hero" | "enemy" (Gegner werden gespiegelt, damit sie zum Helden schauen).
function buildSpriteSvg(spec, side) {
  const forms = { wolf: svgWolf, boar: svgBoar, crow: svgCrow, wraith: svgWraith, rat: svgRat, humanoid: svgHumanoid };
  const draw = forms[spec.form] || svgHumanoid;
  const scale = Number(spec.scale) > 0 ? Number(spec.scale) : 1;
  const flip = side === "enemy" ? "translate(120 0) scale(-1 1)" : "";
  const grow = scale !== 1 ? ` translate(60 102) scale(${scale}) translate(-60 -102)` : "";
  return `<svg class="sprite-svg form-${spec.form || "humanoid"}" viewBox="12 10 96 94" aria-hidden="true" focusable="false" style="${spriteStyle(spec.colors)}"><g transform="${flip}${grow}"><g class="spr-rig">${draw(spec)}</g></g></svg>`;
}

function enemySpriteSvg(spriteClasses) {
  return buildSpriteSvg(enemySpriteSpec(spriteClasses), "enemy");
}

function heroSpriteSvg(characterClass, build) {
  return buildSpriteSvg(heroSpriteSpec(characterClass, build), "hero");
}
