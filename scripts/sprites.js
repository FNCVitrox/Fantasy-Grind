// Pixel-Art-Figuren (PNG-Sprite-Sheets aus tools/pixelart/build.py).
// Jedes Sheet hat 3 Frames à 64x64: Ruhe A, Ruhe B, Angriff. CSS wechselt die Frames.
// Geladen nach core.js, daher dürfen hier Konstanten stehen.

const spriteAssetVersion = typeof assetVersion === "string" ? assetVersion : "";
const heroSpriteBuilds = ["tank", "damage", "bruiser"];

function spriteUrl(file) {
  return `./assets/sprites/${file}.png${spriteAssetVersion ? `?v=${spriteAssetVersion}` : ""}`;
}

function heroSpriteFile(characterClass, build) {
  const safeClass = Object.prototype.hasOwnProperty.call(classCatalog, characterClass) ? characterClass : "warrior";
  const safeBuild = heroSpriteBuilds.includes(build) ? build : "bruiser";
  return `hero-${safeClass}-${safeBuild}`;
}

function enemySpriteFile(enemyId) {
  return `enemy-${Object.prototype.hasOwnProperty.call(enemies, enemyId) ? enemyId : "wolf"}`;
}

function pixelSpriteHtml(file, extraClass = "") {
  return `<span class="pixel-sprite${extraClass ? ` ${extraClass}` : ""}" style="background-image:url('${spriteUrl(file)}')" aria-hidden="true"></span>`;
}

function heroSpriteHtml(characterClass, build) {
  return pixelSpriteHtml(heroSpriteFile(characterClass, build));
}

function enemySpriteHtml(enemyId) {
  return pixelSpriteHtml(enemySpriteFile(enemyId));
}

// Hintergrund der Kampfbühne je Gebiet.
function zoneBackgroundUrl(zoneId) {
  const safeZone = Object.prototype.hasOwnProperty.call(zones, zoneId) ? zoneId : "meadow";
  return `./assets/backgrounds/${safeZone}.png${spriteAssetVersion ? `?v=${spriteAssetVersion}` : ""}`;
}
