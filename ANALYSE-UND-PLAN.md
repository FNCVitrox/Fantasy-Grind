# Fantasy Grind – Analyse & Arbeitsplan

Stand: 01.11.2026 · geprüfte Version: Alpha v0.8.121 (Commit „Bump asset version for equipment spacing“)

So wird gearbeitet: Die Punkte werden **von oben nach unten** abgearbeitet. Jeder Punkt nennt **Was**, **Wo**, **Wie** und **Fertig wenn**. Nach jedem Punkt: `npm test` muss grün sein, Version in `scripts/data.js` (`assetVersion`) wird erhöht, und der Punkt wird hier abgehakt.

---

## Teil A – Analyse (Kurzfassung)

### Code
- ~20'700 Zeilen, Vanilla HTML/CSS/JS, keine Abhängigkeiten. 393 Smoke-Tests bestehen, keine Konsolenfehler.
- Gut: Daten (Gegner, Items, Quests) sind von der Logik getrennt, Datenpakete werden bei Bedarf nachgeladen, Save-Import wird normalisiert, `escapeHtml`/`escapeAttr` sind vorhanden.
- Schwach:
  - `scripts/core.js` hat 4'592 Zeilen und 318 Funktionen: Kampf, Loot, Schmied, Mira, Quests und Erfolge stecken alle in einer Datei.
  - `legacyFight()` (core.js, ab Zeile 1912, **464 Zeilen**) wird nirgends aufgerufen und ist toter Code.
  - 29 globale Variablen (`state`, `selectedEnemy`, `isFighting` …) liegen offen im globalen Scope.
  - Einige Log-Texte sind fest auf Deutsch, ohne `t()` (z. B. core.js Zeile 1265 und 1280, „Level X erreicht…“).
  - Die Version ist doppelt gepflegt: README nennt v0.8.116, Code v0.8.121, dazu `?v=` in index.html.
  - CSS umfasst 7'200 Zeilen (`modals.css` allein 3'932), mit 32 doppelten Selektoren.

### UI
- Dunkles, stimmiges Theme, und die Navigation ist klar. Am Desktop funktioniert das Layout.
- Probleme:
  - **Sprachmix:** In index.html sind „Gebiet“ (Zeile 174, 179) und „Wechseln“ (Zeile 181) fest eingetragen. In der englischen Version bleiben sie deutsch, ebenso Log-Einträge.
  - **Desktop:** Die Ausrüstungs-Slots schneiden Texte ab („Wea…“, „Neck…“, „Traini…“).
  - **Mobile:** Das Reise-Modal ragt rechts über den Bildschirmrand hinaus.
  - **Mobile:** Der Kampf als Kern des Spiels liegt erst unterhalb der Ausrüstung. Die Seite ist 2'072 px hoch, man muss also scrollen, um zu kämpfen.
  - Das Spiel wirkt wie ein Dashboard: viele gleich aussehende Kacheln und wenig visuelle Hierarchie.
  - Die Grafik besteht aus CSS-Formen (Krieger, Wolf). Items sind reine Textkarten, ohne Icons.

### Gameplay
- Viele Systeme greifen gut ineinander: Builds, Haltbarkeit, Elite-Gegner, Boss-Passive, Schmied, Mira, Sets, Erfolge.
- Probleme:
  - **Wenig Inhalt:** nur 11 normale Gegner und 9 Bosse für 20 Level.
  - **Progression berechnet:** Bis Level 20 braucht man rund **860 Siege** gegen den jeweils besten Gegner. Bei ~3,3 s pro Kampf sind das gut 50 Minuten reine Kampfzeit, plus Rasten. Für ein Grind-Spiel ist das Endgame zu früh erreicht und danach zu leer.
  - **Loot blockiert:** Nach jedem Sieg muss Loot gewählt werden, sonst ist kein neuer Kampf möglich. Das bremst den Flow.
  - **Inventar ohne Limit:** In der Simulation lagen nach ~600 Kämpfen 173 Items im Inventar. Es gibt kein Auto-Verkaufen und keinen Junk-Filter.
  - **„Überspringen“** wartet trotzdem: `waitResult(900)` in `finishActionCombat` läuft immer. Dadurch dauert jeder Kampf mindestens ~1 s.
  - Kein Sound, keine Musik, kein Idle- oder Offline-Fortschritt. Das wäre für die Steam-Idle-Nische wichtig.

### Performance
- Sehr gut im Moment:
  - Laden in 183 ms
  - `render()` braucht 0,33 ms
  - `save()` braucht 0,16 ms
  - ~520 DOM-Knoten, ~9,5 MB Heap
- Risiko: Der Spielstand wächst mit dem Inventar (1,6 KB → 81 KB nach 600 Kämpfen). `save()` schreibt ihn **dreimal** in den localStorage (Haupt-, Backup- und Vorgänger-Key), bei jedem Speichern. Bei sehr grossem Inventar wird das langsam und stösst irgendwann an das Speicherlimit von ~5 MB.

---

## Teil B – Arbeitsplan (in dieser Reihenfolge)

### Phase 1 – Sichtbare Bugs (sofort)

- [x] **1. Reise-Modal auf Mobile läuft über den Rand** ✅ erledigt in v0.8.122
  - Wo: `css/modals.css` (Modal-Breiten, z. B. Zeile 17 `width: min(920px, 100%)`, Zeile 227), `css/responsive.css`
  - Wie: Für alle Modals `box-sizing: border-box`, `max-width: calc(100vw - 24px)` und `left/right`-Zentrierung setzen. Grid-Karten mit `minmax(0, 1fr)` statt fester Breiten.
  - Fertig wenn: Bei 360, 390 und 430 px Breite gibt es keinen horizontalen Scroll, und kein Modal ist abgeschnitten (per Playwright-Screenshot geprüft).
  - Ergebnis:
    - Ursache war, dass das Overlay 18 px Rand hatte, die Fenster aber `100vw - 10px` (Handy) bzw. `100vw - 20/24px` (Schmied, Bestiarium) breit waren.
    - Neu legt das Overlay den Rand fest (`--modal-pad`: 18 / 9 / 5 px, inkl. Notch-Bereich), und eine Schutzregel begrenzt jedes Fenster auf den freien Platz.
    - Mitbehoben: Rucksack-Karten wurden bei vollem Inventar auf 20 px gestaucht, die Werte auf Beute-Karten wurden abgeschnitten („+13%“), und auf kleinen Handys gab es eine Mini-Scrollbox im Rucksack.
    - Geprüft: 15 Fenster × 14 Bildschirmgrössen (320×568 bis 1920×1080, auch Querformat), mit leerem und vollem Spielstand. Kein Überlauf, nichts abgeschnitten.
    - Absicherung: 6 neue Prüfungen in `npm test` und der neue Browser-Test `npm run test:ui`.

- [x] **2. Sprachmix beheben** ✅ erledigt in v0.8.123
  - Wo: `index.html` Zeile 174, 179 und 181. Dazu alle `log("…")`/`` log(`…`) `` ohne `t()` in `scripts/core.js` (u. a. Zeile 1265, 1280).
  - Wie: Für alle festen Texte `data-i18n`-Keys bzw. `t("key", "Fallback")` verwenden und die Keys in `i18n.js` (DE) und `i18n-en.js` (EN) ergänzen. Zusätzlich einen Test in `tests/smoke.js`: Mit EN aktiv darf kein sichtbarer Text bekannte deutsche Wörter enthalten („Gebiet“, „Wechseln“, „erreicht“, „Lager“).
  - Fertig wenn: In EN ist alles englisch und in DE alles deutsch, und der neue Test besteht.
  - Ergebnis:
    - Log-Einträge speichern jetzt beide Sprachen und ihren Typ und wechseln beim Umschalten mit, auch Einträge von vorher. Die Farbe kommt nicht mehr aus deutschen Wörtern.
    - Alte Spielstände bleiben lesbar.
    - Alle 42 `aria-label` und die festen Texte in `index.html` laufen über `data-i18n` / `data-i18n-aria`.
    - Behoben:
      - „Gebiet“, „Aktiv“, „Wechseln“
      - fehlender Key `common.health` („Leben“)
      - Kampftexte „nutzt“ und „Kritischer Treffer für“
      - Kampfzusammenfassung
      - Heilungen werden nur auf Deutsch erkannt
      - Level-up-Meldung
      - Backup-Tipp
      - Herkunft des Spielstands
      - Dateiname („Ruhm“ → „Renown“)
      - Material-Namen bei Erfolgs-Belohnungen
      - „1 Runden“ → „1 Runde“
    - Absicherung:
      - `npm test` prüft, dass jedes `aria-label` einen Key hat, dass jeder Key in DE und EN existiert und dass kein `log()` mit festem Text vorkommt.
      - `npm run test:ui` scannt alle Fenster in beiden Sprachen.

- [x] **3. Abgeschnittene Ausrüstungs-Slots (Desktop)** ✅ erledigt in v0.8.124
  - Wo: `css/base.css` (Equipment-Leiste), `scripts/render.js` (`renderEquipment`)
  - Wie: Die Leiste ab ~1100 px als 2-zeiliges Grid (4+4) statt 8 schmaler Spalten. Den vollen Slot-Namen zeigen, den Item-Namen mit `text-overflow: ellipsis` und `title`-Tooltip kürzen.
  - Fertig wenn: Bei 1280 und 1440 px sind Slot-Namen vollständig lesbar.
  - Ergebnis:
    - Zwischen 1061 und rund 1550 px waren die Slots nur 32–86 px breit.
    - Neu passt sich die Leiste dem Platz an (Container Query): 7 Slots in einer Reihe ab 640 px Leistenbreite, sonst 4 + 3.
    - Die Überschrift ist ein Etikett auf dem Rahmen und kostet keine eigene Zeile.
    - Kompakte Slots: Slot-Name, Item-Name und farbiger Haltbarkeitsbalken. Details gibt es beim Drüberfahren, sehr breite Bildschirme zeigen zusätzlich Textzeilen.
    - Lange Item-Namen werden mit „…“ gekürzt, der volle Name steht im Tooltip.
    - Nebeneffekte: Der Kampf-Button liegt bei 1366/1440 px höher als vorher, auf dem Handy ist die Leiste 38 % kürzer (439 → 272 px).
    - Absicherung: `tests/ui-layout.js` mit den längsten Item-Namen, 14 Bildschirmgrössen und beiden Sprachen. Geprüft werden: nichts abgeschnitten, Kampf-Button ab 1280×768 sichtbar, kein Überlauf.

- [ ] **4. „Überspringen“ wirklich sofort**
  - Wo: `scripts/core.js` → `finishActionCombat` (`await waitResult(900)`), dazu alle Wartezeiten in `pushCombatEvent`
  - Wie: Ist `skipCombat` aktiv, die Wartezeiten auf 0 setzen und die Ergebnis-Animation nur kurz einblenden (150 ms).
  - Fertig wenn: Ein übersprungener Kampf dauert unter 250 ms.

- [ ] **5. Version an einer Stelle pflegen**
  - Wo: `scripts/data.js` (`assetVersion`), `index.html` (`?v=`), `README.md`
  - Wie: Ein kleines Node-Skript `scripts/tools/bump-version.js` schreibt die Version in alle drei Dateien. Den Befehl `npm run bump` in `package.json` ergänzen.
  - Fertig wenn: Es gibt nur noch eine Quelle, und README und Spiel zeigen dieselbe Version.

### Phase 2 – Code aufräumen (Basis für alles Weitere)

- [ ] **6. Toten Code entfernen**
  - Wo: `scripts/core.js` → `legacyFight()` (ab Zeile 1912, 464 Zeilen)
  - Wie: Die Funktion löschen und mit `grep` prüfen, dass auch keine Hilfsfunktion mehr verwendet wird, die nur sie gebraucht hat. Diese Hilfsfunktionen ebenfalls löschen.
  - Fertig wenn: Die Tests sind grün, und core.js ist um mindestens 450 Zeilen kürzer.

- [ ] **7. core.js aufteilen**
  - Wie: Ohne Build-Tool, weiter als klassische `<script>`-Dateien, in dieser Reihenfolge eingebunden:
    - `scripts/combat.js`: Kampf, Fähigkeiten, Effekte, Belohnungen
    - `scripts/loot.js`: Loot-Erzeugung, Auswahl, Vergleich
    - `scripts/smith.js`: Schmied, Reparatur, Zerlegen, Meisterschaft
    - `scripts/arcanist.js`: Mira, Verzauberungen
    - `scripts/progression.js`: XP, Level, Ruhm, Quests, Erfolge
    - `core.js` behält nur State, Hilfsfunktionen und `init`.
  - Fertig wenn: Keine Datei ist länger als ~1'200 Zeilen, die Tests sind grün und das Spiel ist identisch spielbar. `package.json` → `test` kennt die neuen Dateien.

- [ ] **8. Globale UI-Variablen bündeln**
  - Wo: Die 22 `let`-Variablen oben in `render.js` / `core.js` (`selectedEnemy`, `isFighting`, `smithView` …)
  - Wie: Alles in ein Objekt `const ui = { … }` packen und die Zugriffe ersetzen. `state` bleibt der Save-State, `ui` ist flüchtig.
  - Fertig wenn: Ausser `state`, `ui` und den Daten-Katalogen gibt es keine globalen `let` mehr.

- [ ] **9. CSS entschlacken**
  - Wo: `css/modals.css`, `css/base.css`
  - Wie:
    - Die 32 doppelten Selektoren zusammenführen.
    - Wiederkehrende Werte als CSS-Variablen definieren (Farben, Radius, Abstände, Schatten).
    - Ungenutzte Klassen finden: Klassen aus dem CSS gegen `index.html` und `render*.js` abgleichen, ungenutzte löschen.
  - Fertig wenn: Das CSS ist mindestens 20 % kleiner und die Screenshots sehen unverändert aus.

- [ ] **10. Spielstand schlanker speichern**
  - Wo: `scripts/save-system.js` → `save()`
  - Wie:
    - Backup und Vorgänger-Save nur noch alle 5 Minuten oder bei Levelaufstieg schreiben, nicht bei jedem Speichern.
    - Häufige Speichervorgänge bündeln (300 ms Debounce).
  - Fertig wenn: Pro Aktion wird höchstens einmal in den localStorage geschrieben. Die bestehenden Save-Tests bleiben grün.

### Phase 3 – Gameplay-Flow

- [ ] **11. Auto-Loot und Inventarlimit**
  - Wo: `scripts/core.js` → `createLootChoices`, `chooseLoot` (Zeile 3391), Einstellungen im State
  - Wie:
    - Neue Option „Auto-Loot“: Das beste Item gemäss Vergleich wird automatisch genommen, der Rest wird nach Wahl zerlegt oder verkauft.
    - Inventarlimit von 60 Plätzen, das beim Schmied erweiterbar ist.
    - Junk-Filter: „Gewöhnliche Items automatisch verkaufen“.
    - Kämpfe sind nicht mehr blockiert, solange Auto-Loot aktiv ist.
  - Fertig wenn: 100 Kämpfe am Stück sind ohne Klick auf Loot möglich, und das Inventar bleibt unter dem Limit.

- [ ] **12. Mehr Gegner pro Gebiet**
  - Wo: `scripts/data-world.js`, `scripts/data-drops.js`, `scripts/i18n-en.js`
  - Wie: Pro Gebiet von 3 auf 5–6 Gegner erweitern, also etwa 12 neue Gegner. Jeder bekommt eine eigene Fähigkeit aus `enemyAbilityCatalog` oder eine neue, dazu eine Loot-Tabelle, Drops und einen Bestiarium-Eintrag.
  - Fertig wenn: Jedes Level von 1–20 hat mindestens 2 passende Gegner, und das Bestiarium zeigt alle an.

- [ ] **13. Endgame nach Level 20**
  - Wie:
    - **Paragon-Level:** XP nach Level 20 geben Paragon-Punkte, die man in kleine Werte investieren kann.
    - **Endlos-Turm:** Stockwerke mit steigender Skalierung, Bestenliste lokal.
    - **Wöchentliche Herausforderungen:** zum Beispiel feste Modifikatoren pro Woche.
  - Fertig wenn: Nach Level 20 gibt es mindestens 2 Fortschrittsziele, die weiter belohnen.

- [ ] **14. Idle-/Offline-Fortschritt**
  - Wo: Neues Modul `scripts/idle.js`, Zeitstempel im State
  - Wie:
    - Beim Öffnen die Zeit seit dem letzten Spielen berechnen und Kämpfe gegen den gewählten Gegner simulieren (vereinfacht, ohne Animation, maximal 8 Stunden).
    - Ein Begrüssungs-Fenster zeigt den Ertrag.
    - Zusätzlich „Auto-Farmen“: Kämpfe laufen in Schleife, bis die Lebenspunkte unter einem einstellbaren Prozentsatz liegen, dann wird automatisch gerastet.
  - Fertig wenn: Nach 1 Stunde Pause gibt es einen plausiblen Ertrag, und Auto-Farmen stoppt sicher bei wenig Leben.

- [ ] **15. Balancing prüfen**
  - Wie: Ein Skript `tests/balance-sim.js` simuliert mit Node einen Spieler von Level 1–20, inklusive Quests, Loot und Rasten. Es gibt Kämpfe pro Level, Tode und Gold aus.
  - Ziel: 2–4 Stunden bis Level 20 statt ~50 Minuten. Keine Level-Stufe soll mehr als doppelt so lange dauern wie die vorherige.
  - Fertig wenn: Die Simulation liegt im Zielbereich und läuft als Teil von `npm test`, mit Warnung statt Fehler.

### Phase 4 – Grafik & Spielgefühl

- [ ] **16. Mobile: Kampf zuerst**
  - Wo: `css/responsive.css`, ggf. Reihenfolge in `index.html`
  - Wie:
    - Unter 700 px die Kampfbühne mit dem „Kampf starten“-Button ganz nach oben setzen.
    - Ausrüstung in einen einklappbaren Bereich oder einen eigenen Tab verschieben.
    - Eine untere Tab-Leiste (Kampf · Ausrüstung · Quests · Menü) einführen.
  - Fertig wenn: Auf einem 390×844-Bildschirm ist der Kampf ohne Scrollen startbar.

- [ ] **17. Charaktere und Gegner als SVG-Sprites**
  - Wo: Neuer Ordner `assets/sprites/`, `render.js` (`renderHeroBuildVisual`, `setBattleEnemyVisual`)
  - Wie:
    - Eigene SVG-Figuren im einheitlichen Stil für den Krieger (3 Build-Varianten) und alle Gegner und Bosse.
    - Animationen mit CSS: Idle-Atmen, Angriff, Treffer-Wackeln, Tod.
  - Fertig wenn: Kein Gegner nutzt mehr CSS-Grundformen, und alle Sprite-Tests in smoke.js sind angepasst und grün.

- [ ] **18. Item-Icons**
  - Wie:
    - Ein SVG-Icon pro Slot-Typ, dazu Varianten nach Seltenheit (Rahmenfarbe, Leuchten bei episch und legendär).
    - Die Icons auf Lootkarten, im Inventar, in der Ausrüstung und beim Schmied anzeigen.
  - Fertig wenn: Jede Itemkarte hat ein Icon.

- [ ] **19. „Juice“ im Kampf**
  - Wie:
    - Bildschirm-Wackeln bei kritischen Treffern
    - Partikel bei Treffern (CSS/Canvas)
    - Loot-Regen mit Seltenheitsfarbe
    - Levelaufstieg mit Lichtsäule
    - Zahlen beim Gold- und XP-Zuwachs hochzählen
    - Alles respektiert `prefers-reduced-motion`.
  - Fertig wenn: Jedes wichtige Ereignis hat sichtbares Feedback und es gibt einen Schalter für reduzierte Effekte.

- [ ] **20. Sound und Musik**
  - Wie:
    - Kleine Soundeffekte (Treffer, Krit, Loot, Levelaufstieg, Klick), mit der WebAudio-API erzeugt oder mit freien Lizenzen (CC0)
    - Eine ruhige Musikschleife pro Gebietstyp
    - Lautstärke-Regler und Stummschalten in den Einstellungen
  - Fertig wenn: Sound ist standardmässig an, aber leise, und die Einstellungen werden gespeichert.

- [ ] **21. Einstellungen-Menü**
  - Wie: Ein Menü für Sprache, Lautstärke, Effekte, Auto-Loot, Kampftempo (1×/2×/4×) und Spielstand.
  - Fertig wenn: Alle Optionen liegen an einem Ort und werden im Save gespeichert.

### Phase 5 – Mehr Inhalt

- [ ] **22. Zweite Klasse: Magier** (danach Schurke und Bogenschütze)
  - Wo: `scripts/data-player.js`
  - Wie: 3 Builds mit je 3 Fähigkeiten, eigene Werte wie Mana statt Wut, passende Items und eigene Sprites.
  - Fertig wenn: Die Klasse ist bei Spielstart wählbar und vollständig spielbar bis Level 20.

- [ ] **23. Boss-Phasen und Dungeon-Belohnungen**
  - Wie: Jeder Dungeon-Boss bekommt 2 Phasen mit einem sichtbaren Wechsel, dazu einzigartige Set-Items pro Dungeon.

- [ ] **24. Mehr Erfolge mit Titeln**
  - Wie: Von 20 auf rund 60 Erfolge erweitern. Titel sind wählbar und werden unter dem Namen angezeigt.

### Phase 6 – Steam-Vorbereitung

- [ ] **25. Desktop-App**
  - Wie:
    - Das Spiel mit **Electron** verpacken (einfacher für Steamworks; Tauri ist die leichtere Alternative).
    - Spielstände in einer Datei im Benutzerordner statt im localStorage speichern, mit automatischem Backup.
    - Vollbild, Fenstermodus und eine Mindestgrösse von 1280×720.
  - Fertig wenn: Builds für Windows (und optional Linux/Steam Deck) starten offline.

- [ ] **26. Steamworks**
  - Wie:
    - `steamworks.js` einbinden.
    - Steam-Erfolge mit den Spiel-Erfolgen verknüpfen.
    - Cloud-Saves nutzen.
    - Overlay testen.
  - Fertig wenn: Erfolge werden in einem Steam-Test-Build ausgelöst.

- [ ] **27. Steam-Deck- und Controller-Unterstützung**
  - Wie: Navigation per Gamepad (Fokus-Ring, Tasten-Hinweise), Mindestschriftgrösse für 1280×800.

- [ ] **28. Material für die Store-Seite**
  - Wie:
    - Capsule-Bilder in allen Steam-Grössen
    - 5 oder mehr Screenshots
    - Trailer (30–60 s)
    - Kurzbeschreibung und Tags (RPG, Idler, Loot, Fantasy, Singleplayer)
    - Demo-Build für das Steam Next Fest

---

## Fortschritt

| Phase | Punkte | Erledigt |
|---|---|---|
| 1 – Bugs | 1–5 | 3/5 |
| 2 – Code | 6–10 | 0/5 |
| 3 – Gameplay | 11–15 | 0/5 |
| 4 – Grafik & Gefühl | 16–21 | 0/6 |
| 5 – Inhalt | 22–24 | 0/3 |
| 6 – Steam | 25–28 | 0/4 |
