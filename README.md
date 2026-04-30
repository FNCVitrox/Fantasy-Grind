# Fantasy Grind

Fantasy Grind ist ein browserbasiertes Fantasy-Grind-RPG rund um Ausrüstung, Risiko, Loot und langsame Progression. Du spielst einen Krieger der Grauwacht, kämpfst dich durch normale Gebiete und separate Dungeons, sammelst Gold, Materialien und Ausrüstung, erledigst Quests und verbesserst deine Items beim Schmied.

Das Projekt ist aktuell ein spielbarer Alpha-Prototyp. Der Kern des Spiels steht bereits: Gegner wählen, Kampf starten, Belohnung bekommen, Ausrüstung prüfen, reparieren oder verbessern und den nächsten Schritt wagen.

## Aktuelle Version

Alpha v0.8.25

## Was Bereits Spielbar Ist

- Spielbarer Krieger mit Level, XP, Leben, Gold, Ruhm, Schaden, Verteidigung und Haltbarkeit
- Drei Krieger-Builds: Tank, Schaden und Bruiser
- Jeder Build hat drei automatische Fähigkeiten
- Jeder Build hat eine eigene kleine Charakteroptik im Kampffeld
- Klickbares Charakterporträt mit eigenem Spielerwerte-Fenster
- Lagerplatz in der oberen Leiste zum Heilen
- Crit Chance und Crit Damage als eigene Spieler- und Item-Werte
- Benutzte Spielerfähigkeiten leuchten während des Kampfes kurz in der linken Fähigkeitsliste auf
- Automatische Kämpfe mit Animationen, Schadenstexten, HP-Balken und Kampfprotokoll
- Breitere und kompaktere Haupt-UI mit mehr Platz für Kampf, Ausrüstung und Gegnerauswahl
- Ruhigere normale Menübuttons in der oberen Leiste
- Gegner haben eigene Fähigkeiten
- Normale Gegner haben einfache Fähigkeiten
- Elite-Gegner haben mehrere Fähigkeiten
- Dungeon-Bosse haben aktive Fähigkeiten und passive Effekte
- Normale Gebiete zum Farmen
- Separate Dungeons mit Boss-Reihen
- Freischaltungen über Level und Ruhm
- Quest-Tafel mit normalen und seltenen Quests
- Quests erscheinen nur, wenn die passenden Gegner schon erreichbar sind
- Bestiarium mit Gegnerwerten, Fähigkeiten, Drops, Materialien und entdecktem Loot
- Render-Optimierungen für flüssigere Schmied-, Quest-, Loot- und Bestiarium-Ansichten
- Loot-Pools pro Gegner sind begrenzt, damit das Bestiarium übersichtlich bleibt
- Ausrüstungsslots: Waffe, zweite Hand, Brustpanzer, Hose, Stiefel, Halskette und Ring
- Item-Qualitäten: Gewöhnlich, Selten, Episch und Legendär
- Set-Boni für besondere Ausrüstung
- Inventar mit Ausrüsten, Verkaufen und Zerlegen
- Schmied zum Verbessern, Zerlegen und Reparieren von Ausrüstung
- Materialsystem mit Eisenstücken, Lederresten, Runensplittern, Set-Materialien und seltenen Komponenten
- Schmied-Dialoge ändern sich je nach Ruhm-Rang und Beziehung zum Spieler
- Ein gemeinsamer Spielstand-Button bündelt Herunterladen und Laden von Sicherungen
- Spielstand-Fenster zeigt Level, Gold, Ruhm, Gebiet, letzte Sicherung und Dateiname
- Schönerer Sicherungs-Dateiname mit Level, Ruhm, Gebiet und Datum
- Dezente Sicherungs-Tipps nach Level-Up, sehr gutem Loot oder Dungeon-Boss
- Größere Protokoll-Vorschau ohne Neustart-Button im Kampfverlauf
- Loot-Auswahlkarten sind sauberer ausgerichtet, damit Vergleich und Buttons nicht überlappen
- Sicherungs- und Ladefunktion für Spielstände über eine JSON-Datei
- Empfehlung: Spielstand regelmäßig herunterladen, damit Fortschritt sicher erhalten bleibt
- Browser-Speicher wird genutzt, ist aber je nach Browser, GitHub-Preview-Link oder gelöschten Website-Daten nicht garantiert

## Spielidee

Fantasy Grind soll sich wie ein stetiger Aufstieg anfühlen. Fortschritt soll verdient sein: ein gutes Item, ein geschaffter Elite-Gegner, ein neues Gebiet oder ein abgeschlossener Dungeon soll wirklich etwas bedeuten.

Die wichtigste Entscheidung ist Vorbereitung:

- Ist mein Leben hoch genug?
- Ist meine Ausrüstung noch haltbar?
- Welcher Build passt zum Gegner?
- Lohnt sich der stärkere Gegner?
- Spare ich Gold oder verbessere ich ein Item?
- Repariere ich jetzt oder riskiere ich noch einen Kampf?

Tod ist kein kompletter Reset, aber er kostet Fortschritt. Dadurch bleiben Risiko, Haltbarkeit und Gold wichtig.

## Builds Und Fähigkeiten

Der Krieger hat aktuell drei Builds:

- Tank: mehr Leben und Verteidigung, defensive Fähigkeiten und Schadensdämpfung
- Schaden: mehr Angriffskraft, stärkere Treffer und Hinrichten bei schwachen Gegnern
- Bruiser: ausgewogener Build mit Heilung, Kontern und Rüstungsbruch

Die Fähigkeiten laufen im Auto-Kampf automatisch. Der Spieler muss also nicht jede Runde manuell klicken, aber die Build-Wahl verändert deutlich, wie sich Kämpfe anfühlen.

## Gegner Und Bosse

Gegner sind nicht nur Werteblöcke. Viele haben eigene Kampfmechaniken:

- Blutung, Gift und Brennen
- Starke Angriffe in bestimmten Runden
- Heilung
- Schadensreduktion
- Schwächung des nächsten Spielerangriffs
- Boss-Passiven wie zweite Phase, Standhaftigkeit oder stärkere Heilung

Normale Gegner bleiben einfacher. Elite-Gegner und Dungeon-Bosse sind gefährlicher und sollen Vorbereitung belohnen.

## Gebiete Und Dungeons

Das Spiel trennt normale Gebiete und Dungeons:

- Normale Gebiete sind zum Farmen, Leveln, Questen und Looten gedacht.
- Dungeons sind separate Herausforderungen mit Boss-Gegnern.
- Neue Ziele werden über Level und Ruhm freigeschaltet.

Das Ziel ist, dass sich jedes neue Gebiet wie ein sinnvoller Schritt nach vorne anfühlt.

## Schmied, Materialien Und Loot

Der Schmied ist ein wichtiger Teil der Progression:

- Items verbessern
- Ausrüstung reparieren
- Items zerlegen
- Materialien sammeln und ausgeben
- Gold und Materialien direkt im Schmied sehen

Items sollen nicht nur stärker werden, sondern auch Entscheidungen erzeugen: behalten, verkaufen, zerlegen oder verbessern.

## Spielstand

Der sichere Weg ist die Sicherungsdatei:

1. Im Spiel auf `Sichern` klicken.
2. Die heruntergeladene JSON-Datei behalten.
3. Später im Spiel auf `Laden` klicken und diese Datei auswählen.

Der Browser versucht den Fortschritt zusätzlich lokal zu speichern. Das ist bequem, aber nicht zuverlässig genug, um sich darauf zu verlassen. Besonders GitHub-Preview- oder Action-Links, private Browserfenster, gelöschte Website-Daten oder ein anderer Browser können dazu führen, dass der lokale Speicher leer ist.

Deshalb gilt: Wer seinen Fortschritt behalten möchte, sollte regelmäßig den Spielstand herunterladen.

## Spielen

Fantasy Grind ist eine statische Browser-App.

1. Repository herunterladen oder klonen.
2. `index.html` im Browser öffnen.
3. Spielen.

Es ist kein Server und keine Installation nötig.

## Technik

Das Projekt ist bewusst einfach gehalten:

- HTML
- CSS
- JavaScript
- `localStorage` für Spielstände
- Keine externen Frameworks

Dadurch lässt sich das Spiel direkt im Browser starten und leicht weiterentwickeln.

## Roadmap

Kurzfristig:

- Gegnerfähigkeiten weiter balancieren
- Bosskämpfe klarer voneinander unterscheiden
- Bestiarium weiter verbessern
- Mehr Übersicht bei Loot, Materialien und Ausrüstungsvergleichen
- UI weiter glätten

Mittelfristig:

- Weitere Klassen wie Magier, Schurke und Bogenschütze
- Drei passende Fähigkeiten pro Build
- Manuelles und automatisches Kampfsystem mit Wechselmöglichkeit
- Lernsystem für Fähigkeiten, z.B. Schule, Schriftrollen oder Zauberin
- Verzauberungssystem über eine Hexe oder Zauberin
- Achievements
- Item-Bilder statt nur Textdarstellung

Langfristig:

- Größere Welt mit mehr Gegnergruppen
- Mehr Dungeons mit eigenen Boss-Mechaniken
- Zufällige Ereignisse vor Kämpfen
- Ereignisse wie Lagerheilung, Artefakte, verfluchte Items, mehrere Gegner oder ein Shop
- Schutz gegen zu starkes Gold-Farming
- Mögliche Einschränkung, dass zu schwache Gegner vor sehr starken Spielern fliehen
- Spezialitems, mit denen alte Low-Level-Gegner trotzdem bekämpft werden können

## Status

Fantasy Grind ist noch in Entwicklung. Viele Systeme sind bereits spielbar, aber Balance, Inhalte und Komfort werden weiter ausgebaut.
