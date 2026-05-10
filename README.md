# Fantasy Grind

Fantasy Grind ist ein browserbasiertes Fantasy-Grind-RPG rund um Kampf, Loot, Ausruestung, Quests und langsame Progression. Du spielst einen Krieger der Grauwacht, kaempfst in normalen Gebieten und separaten Dungeons, sammelst Materialien und baust deine Ausruestung Schritt fuer Schritt aus.

Aktueller Stand: spielbarer Alpha-Prototyp.

## Version

<<<<<<< HEAD
Alpha v0.8.74
=======
Alpha v0.8.71
>>>>>>> parent of d1c58fd (Lazy data packs for optional game systems)

## Spielen

Fantasy Grind ist eine statische Browser-App.

1. Repository herunterladen oder klonen.
2. `index.html` im Browser oeffnen.
3. Spielen.

Es ist kein Server und keine Installation noetig.

## Tests

Im VS-Code-Terminal:

```powershell
npm test
```

Oder per Doppelklick:

```text
test-starten.bat
```

Wenn alles passt, steht am Ende `Smoke test passed` und `ALLE TESTS BESTANDEN`.

## Wichtig: Spielstand sichern

Der sicherste Weg ist die Sicherungsdatei:

1. Im Spiel auf `Spielstand` klicken.
2. `Spielstand herunterladen` auswaehlen.
3. Die JSON-Datei behalten.
4. Spaeter ueber `Spielstand laden` wieder importieren.

Der Browser versucht den Fortschritt zusaetzlich lokal zu speichern. Das ist bequem, aber nicht garantiert. Besonders GitHub-Preview-Links, private Browserfenster, geloeschte Website-Daten oder ein anderer Browser koennen den lokalen Speicher leer wirken lassen.

## Was aktuell spielbar ist

- Krieger mit Level, XP, Leben, Gold, Ruhm, Schaden, Verteidigung, Crit-Werten und Haltbarkeit
- Drei Builds: Tank, Schaden und Bruiser
- Drei automatische Faehigkeiten pro Build
- Eigene Build-Optik im Kampffeld
- Klickbares Charakterportraet mit Detailwerten
- Lagerplatz zum Heilen
- Normale Gebiete zum Farmen und Questen
- Separate Dungeons mit Boss-Reihen
- Gegner mit eigenen Faehigkeiten, Elite-Versionen und Boss-Passiven
- Dungeon-Bosse mit fester Bossbeute, sichtbaren Drop-Chancen und einmaligen Erstbesiegungs-Belohnungen
- Kampfanimationen mit HP-Balken, Schadenstexten, Sieg/Niederlage-Anzeige und Kampf-Log
- Gegner-Risiko mit Einschaetzung aus Leben, Schaden, Crits, Faehigkeiten, Effekten und Haltbarkeit
- Quest-Tafel mit passenden Quests pro Gebiet
- Neue Quests lassen den Quest-Button leuchten
- Angenommene Quests verschwinden aus der Quest-Tafel und stehen nur noch bei den aktiven Quests
- Bestiarium mit Gegnerwerten, Faehigkeiten, Drops, Materialien, Drop-Chancen und Sammlungsfortschritt
- Loot-Auswahl mit genauem Vergleich fuer Angriff, Verteidigung, Crit-Chance und Crit-Schaden
- Item-Stats folgen klaren Slot-Rollen
- 0-Werte werden auf Itemkarten ausgeblendet
- Inventar mit Ausruesten, Verkaufen und Zerlegen
- Set-Boni und besondere Item-Effekte
- Erfolge mit Fortschritt, Belohnungen und leuchtendem Hinweis bei abholbaren Erfolgen
- Smartphone-Layout mit groesseren Touch-Flaechen und kompakterer Navigation
- Sprachumschalter fuer Deutsch und Englisch

## Schmied und Arkanistin

Borin Glutbart ist der Zwergenmeister der Grauwacht. Bei ihm kannst du:

- Ausruestung verbessern
- Ausruestung reparieren
- Items zerlegen
- Materialien und Gold direkt sehen
- Schmied-Meisterauftraege freischalten

Die Schmied-Meisterschaft erhoeht globale Upgrade-Limits fuer alle Ausruestungsteile:

- Start: +5
- Meisterauftrag 1: +10
- Meisterauftrag 2: +15
- Meisterauftrag 3: +20

Mira Nachtfaden ist die Elfen-Arkanistin der Grauwacht. Sie ist eine eigene Station und nicht Teil von Borins Schmiede. Bei ihr kannst du ab Level 8 Ausruestung verzaubern.

Miras Progression:

- Level 8: Arkanistin betrittbar, einfache Runen, 1 Runen-Slot
- Auftrag `Instabile Magie`: 2 Runen-Slots und seltene Verzauberungen
- Auftrag `Die verbotene Bibliothek`: 3 Runen-Slots und epische Verzauberungen
- Auftrag `Das Ritual der Leere`: Arkane Meisterschaft und sehr seltene arkane Verzauberungen

## Spielidee

Fantasy Grind soll sich wie ein stetiger Aufstieg anfuehlen. Fortschritt soll verdient sein: ein gutes Item, ein geschaffter Elite-Gegner, ein neues Gebiet oder ein abgeschlossener Dungeon soll wirklich etwas bedeuten.

Die wichtigsten Entscheidungen:

- Ist mein Leben hoch genug?
- Ist meine Ausruestung noch haltbar?
- Welcher Build passt zum Gegner?
- Lohnt sich der staerkere Gegner?
- Spare ich Gold oder verbessere ich ein Item?
- Repariere ich jetzt oder riskiere ich noch einen Kampf?

Tod ist kein kompletter Reset, aber er kostet Fortschritt. Dadurch bleiben Risiko, Haltbarkeit und Gold wichtig.

## Technik

Das Projekt ist bewusst einfach gehalten:

- HTML
- CSS
- JavaScript
- JSON-Save-Dateien
- Browser-Speicher als Komfortfunktion
- Keine externen Frameworks

Der Code ist zunehmend in Bereiche getrennt, damit das Projekt wartbarer bleibt:

- `scripts/data.js`: gemeinsame Save-Keys und Levelkurve
- `scripts/data-player.js`: Klassen, Builds und Spielerfaehigkeiten
- `scripts/data-world.js`: Gebiete, Gegner und Gegnerfaehigkeiten
- `scripts/data-items.js`: Items, Effekte, Verzauberungen und Sets
- `scripts/data-quests.js`: Quest-Daten
- `scripts/data-labels.js`: Anzeige-Labels fuer Seltenheiten und Materialien
- `scripts/data-achievements.js`: Erfolge und Belohnungen
- `scripts/data-drops.js`: Material-Drops
- `scripts/i18n.js`: Sprachumschaltung und UI-Texte
- `scripts/core.js`: Spiellogik
- `scripts/render.js`: Haupt-Rendering
- `scripts/render-loot.js`: Lootkarten und Vergleiche
- `scripts/save-system.js`: Speichern, Laden und Export
- `scripts/events.js`: UI-Events

## Roadmap

Naechste sinnvolle Schritte:

- Mira-Verzauberungen weiter balancieren
- Weitere Dungeon-Bosse, Phasen und klare Dungeon-Belohnungen
- Weitere Klassen: Magier, Schurke und Bogenschuetze
- Manuelles Kampfsystem als Alternative zum Auto-Kampf
- Item-Bilder statt reiner Textkarten
- Mehr Erfolge mit Titeln, Meilensteinen und Endgame-Zielen
- Mehr Endgame-Loot, Set-Items und besondere Effekte
- Anti-Farming-Regeln fuer zu schwache Gegner

## Status

Fantasy Grind ist noch in Entwicklung. Viele Systeme sind bereits spielbar, aber Balance, Inhalte und Komfort werden laufend verbessert.
