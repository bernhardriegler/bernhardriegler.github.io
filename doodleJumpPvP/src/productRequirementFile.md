# Produktanforderungsdokument

## Übersicht
Dieses Dokument beschreibt die aktuellen Funktionen und Anforderungen des von Doodle Jump inspirierten Spiels. Es dient auch als Referenz für zukünftige Feature-Erweiterungen und Verbesserungen.

## Aktuelle Funktionen

### 1. Spielmechanik
- **Spielerbewegung**: Der Spieler kann sich mit den Pfeiltasten nach links und rechts bewegen.
- **Springen**: Der Spieler springt automatisch, wenn er auf einer Plattform landet.
- **Schwerkraft**: Der Spieler wird von der Schwerkraft beeinflusst, die ihn nach unten zieht.

### 2. Plattformen
- **Statische Plattformen**: Plattformen sind in verschiedenen Höhen positioniert und ermöglichen es dem Spieler zu springen.
- **Plattform-Generierung**: Neue Plattformen werden generiert, wenn sich der Spieler nach oben bewegt.

### 3. Punktestand
- **Punktestand-Verfolgung**: Das Spiel zählt die Anzahl der einzigartigen Plattformen, die erfolgreich übersprungen wurden.

### 4. Spielende
- **Spielende-Bildschirm**: Ein Spielende-Bildschirm wird angezeigt, wenn der Spieler vom Bildschirm fällt.
- **Neustart-Mechanismus**: Der Spieler kann das Spiel durch Drücken der Eingabetaste neu starten.

### 5. Visuals
- **Spieler-Grafik**: Der Spieler wird durch ein benutzerdefiniertes Bild (`player.png`) dargestellt.
- **Hintergrund**: Das Spiel verfügt über einen Farbverlauf im Hintergrund des Körpers und einen weißen Hintergrund für den Spielbereich.

### 6. Upgrades
- **Beschreibung**: Der Spieler kann verbesserungen finden, die ihm beim Fortschritt helfen.
- **Anforderungen**: 
  - Alle paar Plattformen (immer unterschiedlich viele - 5 bis 10) soll es Powerups geben.
  - Diese sollen als leuchtende Kugel dargestellt werden. 
  - Berührt der Spieler ein Powerup kann er sich aus einem Menü eine von drei Verbesserungen aussuchen
    - Mögliche Verbesserungen sind:
      - Düsenjetpack - der Spieler springt einmal 5x so hoch

### 7. Mehrspieler
- **Beschreibung**: Zwei Spieler könne gleichzeitig spielen
- **Anforderungen**:
  - Spieler zwei steuert mit A für links und D für rechts
  - Spieler spieler können sich gegenseitig blockieren - collision detection

- **Implementierungsnotizen**: [Spezifische Hinweise oder Überlegungen zur Implementierung]

## Zukünftige Funktionen
Dieser Abschnitt wird aktualisiert, sobald neue Funktionen geplant und implementiert werden.


### Vorlage für neue Funktionen
- **Beschreibung**: [Kurze Beschreibung des Features]
- **Anforderungen**: [Liste der Anforderungen für das Feature]
- **Implementierungsnotizen**: [Spezifische Hinweise oder Überlegungen zur Implementierung]