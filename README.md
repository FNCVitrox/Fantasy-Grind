# Fantasy Grind

Fantasy Grind ist ein browserbasiertes Fantasy-Grind-RPG rund um Ausrüstung, Risiko und langsame Progression. Du spielst einen Krieger der Grauwacht, kämpfst gegen Gegner in verschiedenen Gebieten, sammelst Gold, Materialien und Ausrüstung, erledigst Quests und verbesserst deine Items beim Schmied.

Das Spiel ist aktuell ein spielbarer Alpha-Prototyp. Der Fokus liegt auf einem klaren Loop: Gegner wählen, Kampf starten, Belohnung bekommen, Ausrüstung prüfen, reparieren oder verbessern und dann den nächsten Schritt wagen.

## Aktueller Stand

- Spielbarer Krieger mit Level, XP, Leben, Gold, Ruhm, Schaden, Verteidigung und Haltbarkeit
- Krieger mit drei automatischen Fähigkeiten pro Build: Tank, Schaden und Bruiser
- Automatische Kämpfe mit Animationen, Schadenstexten und Kampfprotokoll
- Normale Gebiete zum Farmen und separate Dungeons mit Boss-Reihen
- Mehrere Gegner mit eigenen Werten, Materialien und begrenzten Loot-Pools
- Normale Gegner haben ungefähr 19 mögliche Items, stärkere Gegner bis zu 20
- Ausrüstungsslots: Waffe, zweite Hand, Brustpanzer, Hose, Stiefel, Halskette und Ring
- Item-Qualitäten: Gewöhnlich, Selten, Episch und Legendär
- Set-Boni für besondere Ausrüstung
- Bestiarium mit Gegnerinfos, Drops, Materialien und entdeckten Items
- Quest-Tafel mit normalen und seltenen Quests
- Inventar mit Ausrüsten, Verkaufen und Zerlegen
- Schmied zum Verbessern, Zerlegen und Reparieren von Ausrüstung
- Mehrteiliges Materialsystem mit Eisenstücken, Lederresten, Runensplittern, Set-Materialien und seltenen magischen Komponenten
- Lokaler Spielstand im Browser mit Sicherungs- und Ladefunktion
- Automatische Backup-Speicherung, damit Spielstände nicht so leicht verloren gehen
- Freischaltungen über Level und Ruhm, damit neue Gebiete und Dungeons schrittweise aufgehen
- Quest-Tafel bietet nur Aufgaben an, deren Gegner in freigeschalteten Reisezielen erreichbar sind

## Spielidee

Fantasy Grind soll kein schnelles Wegwerfspiel sein. Fortschritt soll sich verdient anfühlen. Ein gutes Item, ein geschaffter Elite-Gegner oder ein abgeschlossenes Questziel soll spürbar etwas bedeuten.

Die wichtigste Entscheidung ist nicht Reaktionsgeschwindigkeit, sondern Vorbereitung:

- Ist mein Leben hoch genug?
- Ist meine Ausrüstung noch haltbar?
- Lohnt sich der stärkere Gegner?
- Spare ich Gold oder verbessere ich ein Item?
- Repariere ich jetzt oder riskiere ich noch einen Kampf?

Tod ist kein kompletter Reset, aber er kostet Fortschritt. Dadurch soll Risiko wichtig bleiben.

## Spielen

Das Projekt ist eine statische Browser-App.

1. Repository herunterladen oder klonen.
2. `index.html` im Browser öffnen.
3. Spielen.

Es ist kein Server und keine Installation nötig.

## Spielstand

Der Fortschritt wird lokal im Browser gespeichert. Zusätzlich gibt es oben im Spiel Buttons zum Sichern und Laden.

Wichtig: Wenn Browserdaten gelöscht werden, kann der lokale Spielstand verschwinden. Deshalb ist die Sicherungsdatei nützlich, wenn du deinen Fortschritt behalten möchtest.

## Geplante Features

Die folgenden Ideen sind für spätere Versionen geplant oder werden noch getestet:

- Weitere Klassen wie Magier, Schurke und Bogenschütze
- Drei Fähigkeiten pro neuer Klasse
- Manuelles und automatisches Kampfsystem mit Wechselmöglichkeit
- Fähigkeiten, die im Auto-Modus automatisch eingesetzt werden
- Lernsystem für neue Fähigkeiten, zum Beispiel über Schule, Schriftrollen oder eine Zauberin
- Unterschiedliche Builds pro Klasse, zum Beispiel Tank, Schaden oder Bruiser beim Krieger
- Item-Bilder statt nur Textdarstellung
- Eine Hexe oder Zauberin zum Verzaubern von Items
- Achievements
- Zufällige Ereignisse vor Kämpfen
- Ereignisse wie Lagerheilung, einmalige Artefakte, verfluchte Items, mehrere Gegner oder ein Shop
- Neue Gebiete, die durch Level, Schlüssel oder besondere Anforderungen freigeschaltet werden
- Weitere Balance-Arbeit bei Items, Gegnern, Gold, Reparaturkosten und Upgrade-Kosten
- Schutz gegen zu starkes Gold-Farming
- Mögliche Einschränkung, dass sehr schwache Gegner vor zu starken Spielern fliehen
- Spezialitems, mit denen alte Low-Level-Gegner trotzdem bekämpft werden können

## Roadmap

### Kurzfristig

- Item- und Gegnerbalance weiter verbessern
- Bestiarium und Loot-Anzeige weiter verfeinern
- Mehr Klarheit bei Belohnungen, Materialien und Ausrüstungsvergleichen
- Kleine UI-Verbesserungen und bessere Lesbarkeit auf mobilen Geräten

### Mittelfristig

- Klassen und Fähigkeiten einführen
- Builds pro Klasse ermöglichen
- Verzauberungssystem entwickeln
- Achievements ergänzen
- Mehr Gebiete und Progressionshürden einbauen

### Langfristig

- Größere Welt mit mehr Gegnergruppen
- Tiefere Item-Systeme mit Bildern, Sets, Verzauberungen und Spezialeffekten
- Mehr Kampfentscheidungen für Spieler, ohne den Auto-Grind zu verlieren
- Besseres Balancing für lange Spielzeit

## Technik

Fantasy Grind ist aktuell bewusst einfach aufgebaut:

- HTML
- CSS
- JavaScript
- Lokale Speicherung über `localStorage`
- Keine externen Frameworks

Dadurch lässt sich das Spiel direkt im Browser starten und leicht weiterentwickeln.

## Status

Aktuelle Version: Alpha v0.8.6

Das Projekt ist noch in Entwicklung. Viele Systeme sind bereits spielbar, aber Balance, Inhalte und Komfort werden weiter ausgebaut.
