#!/usr/bin/env node
// Versionsnummer an einer Stelle pflegen.
//
// Einzige Quelle: `assetVersion` in scripts/data.js.
// Dieses Skript überträgt sie in alle anderen Stellen:
//   - index.html: Cache-Busting `?v=...` bei CSS/JS und das sichtbare Badge `Alpha v...`
//   - README.md:  Abschnitt "Version" (`Alpha v...`)
//
// Nutzung:
//   npm run bump              -> Patch +1 (0.8.125 -> 0.8.126)
//   npm run bump -- minor     -> Minor +1 (0.8.125 -> 0.9.0)
//   npm run bump -- major     -> Major +1 (0.8.125 -> 1.0.0)
//   npm run bump -- 0.9.3     -> feste Version setzen
//   npm run version:check     -> nur prüfen, ob alles übereinstimmt (Exit-Code 1 bei Abweichung)

const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..", "..");
const files = {
  data: path.join(root, "scripts", "data.js"),
  html: path.join(root, "index.html"),
  readme: path.join(root, "README.md"),
};

const versionPattern = /^\d+\.\d+\.\d+$/;
const dataPattern = /const assetVersion = "(\d+\.\d+\.\d+)";/;

function read(file) {
  const raw = fs.readFileSync(file);
  const hasBom = raw[0] === 0xef && raw[1] === 0xbb && raw[2] === 0xbf;
  return { text: raw.toString("utf8").replace(/^﻿/, ""), hasBom };
}

function write(file, text, hasBom) {
  fs.writeFileSync(file, (hasBom ? "﻿" : "") + text, "utf8");
}

function currentVersion() {
  const match = read(files.data).text.match(dataPattern);
  if (!match) throw new Error("assetVersion wurde in scripts/data.js nicht gefunden.");
  return match[1];
}

function nextVersion(current, argument = "patch") {
  if (versionPattern.test(argument)) return argument;
  const [major, minor, patch] = current.split(".").map(Number);
  if (argument === "major") return `${major + 1}.0.0`;
  if (argument === "minor") return `${major}.${minor + 1}.0`;
  if (argument === "patch") return `${major}.${minor}.${patch + 1}`;
  throw new Error(`Unbekanntes Argument "${argument}". Erlaubt: patch, minor, major oder z. B. 0.9.0`);
}

// Liefert für jede Datei die gefundenen Versionen, damit Abweichungen sichtbar werden.
function collectVersions() {
  const html = read(files.html).text;
  const readme = read(files.readme).text;
  return {
    "scripts/data.js (assetVersion)": [currentVersion()],
    "index.html (?v=)": [...html.matchAll(/\?v=(\d+\.\d+\.\d+)/g)].map((match) => match[1]),
    "index.html (Badge)": [...html.matchAll(/Alpha v(\d+\.\d+\.\d+)/g)].map((match) => match[1]),
    "README.md (Version)": [...readme.matchAll(/^Alpha v(\d+\.\d+\.\d+)(?=[ \t]*\r?$)/gm)].map((match) => match[1]),
  };
}

function check() {
  const expected = currentVersion();
  const problems = [];
  Object.entries(collectVersions()).forEach(([place, versions]) => {
    if (!versions.length) problems.push(`${place}: keine Version gefunden`);
    versions.filter((version) => version !== expected).forEach((version) => problems.push(`${place}: ${version} statt ${expected}`));
  });
  return { expected, problems };
}

function apply(version) {
  const data = read(files.data);
  write(files.data, data.text.replace(dataPattern, `const assetVersion = "${version}";`), data.hasBom);

  const html = read(files.html);
  write(
    files.html,
    html.text
      .replace(/\?v=\d+\.\d+\.\d+/g, `?v=${version}`)
      .replace(/Alpha v\d+\.\d+\.\d+/g, `Alpha v${version}`),
    html.hasBom,
  );

  const readme = read(files.readme);
  write(files.readme, readme.text.replace(/^Alpha v\d+\.\d+\.\d+(?=[ \t]*\r?$)/gm, `Alpha v${version}`), readme.hasBom);
}

function main() {
  const argument = process.argv[2];
  if (argument === "--check") {
    const { expected, problems } = check();
    if (problems.length) {
      console.error(`Version passt nicht überall zu ${expected}:`);
      problems.forEach((problem) => console.error(`  - ${problem}`));
      process.exit(1);
    }
    console.log(`Version ${expected} ist überall gleich.`);
    return;
  }

  const current = currentVersion();
  const version = nextVersion(current, argument);
  apply(version);
  const { problems } = check();
  if (problems.length) {
    console.error("Nach dem Aktualisieren gibt es noch Abweichungen:");
    problems.forEach((problem) => console.error(`  - ${problem}`));
    process.exit(1);
  }
  console.log(`Version ${current} -> ${version} (scripts/data.js, index.html, README.md)`);
}

if (require.main === module) {
  try {
    main();
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}

module.exports = { nextVersion, collectVersions, check };
