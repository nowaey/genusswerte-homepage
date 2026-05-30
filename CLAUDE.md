# CLAUDE.md — Genusswerte Bonn Homepage

## Projekt

Statische Website für **Genusswerte Bonn**, eine hochwertige Feinkost- und Tasting-Boutique in Bonn-Poppelsdorf.

Die Website soll zunächst als statische HTML/CSS/JS-Seite fertiggestellt werden und später mit einem separaten Admin-/Gutschein-System verbunden werden.

**Tech-Stack Website:**

* Vanilla HTML
* Vanilla CSS
* Vanilla JavaScript
* Kein Framework
* Kein Build-Tool
* Deployment später via FTP / all-inkl.com

## Seitenstruktur

Aktuelle bzw. geplante Seiten:

* `index.html` — emotionale Startseite
* `tastings.html` — Tasting-Erlebnisse
* `gutscheine-boxen.html` — Gutscheine & Genussboxen
* `gutschein-einloesen.html` — Gutschein einlösen
* `kontakt.html` — Kontakt & Standort
* `impressum.html`
* `datenschutz.html`

## Geschäftsdaten

Name: Genusswerte Bonn
Adresse: Clemens-August-Straße 38–40, 53115 Bonn – Poppelsdorf
Telefon: 0228 2590 8928
Instagram: @genusswerte.bonn

Öffnungszeiten:

* Montag: geschlossen
* Dienstag: 12:00 – 19:00
* Mittwoch: 12:00 – 20:00
* Donnerstag: 10:00 – 21:00
* Freitag: 10:00 – 21:00
* Samstag: 10:00 – 21:00
* Sonntag: geschlossen

## Brand & Design

Claim: **Taste – Discover – Enjoy**

Designziel:
Die Seite soll hochwertig, warm, editorial und eigenständig wirken — nicht wie eine generische KI- oder Template-Website.

Die Website soll Besuchern sofort das Gefühl geben:
**„Wow, ich habe Lust auf ein Tasting.“**

Stilrichtung:

* Premium Feinkost-Boutique
* Tasting-Erlebniswelt
* Bonn-Poppelsdorf
* warm, persönlich, hochwertig
* modern, aber nicht generisch
* nicht zu luxuriös
* nicht verspielt
* kein klassischer Shop-Look

Visuelle Regeln:

* Dunkelgrün / Creme / dezentes Gold
* keine Apple Emojis
* keine generischen Standard-Cards
* keine übergroßen Buttons
* ruhige, bewusste Button-Hierarchie
* editorialer Aufbau statt Baukasten-Optik
* starke Bildwirkung
* weiche, saubere Übergänge zwischen Sections
* großzügiger, aber nicht leerer Weißraum
* mobile Ansicht immer mitdenken

## Design-Tokens

Die bestehenden CSS-Tokens in `assets/css/base.css` sollen weiterverwendet und nur behutsam angepasst werden.

Wichtige Farben:

* Creme-Hintergrund
* Dunkelgrün als Primärfarbe
* Gold als dezenter Akzent
* Schwarz/Anthrazit für Text

Schriften:

* Serif für Headlines
* Sans Serif für Navigation, Fließtext und UI

## Technische Grenzen

Nicht einbauen, außer ausdrücklich beauftragt:

* keine Stripe-Integration
* keine Supabase-Integration
* keine Resend-Integration
* keine Admin-Panel-Anbindung
* keine Backend-Logik
* kein neues Framework
* kein Build-Tool
* keine Checkout-Logik
* keine verbindliche Live-Terminbuchung

Jetzt geht es zuerst um:

* Design
* Struktur
* UX
* Texte
* statische Vorbereitung

## Spätere Systemlogik

Die Website soll später mit einem separaten System verbunden werden:

* Admin Panel: React / Vite / TypeScript
* Backend: Supabase
* Zahlung: Stripe Checkout
* E-Mail: Resend

Späterer Ablauf:

1. Kunde kauft einen Tasting-Gutschein über die Website.
2. Zahlung läuft über Stripe.
3. Nach erfolgreicher Zahlung wird ein Gutscheincode erzeugt.
4. Kunde erhält den Code per E-Mail.
5. Kunde löst den Code auf der Website ein.
6. Es werden verfügbare feste Tasting-Termine aus dem eigenen Kontingent angezeigt.
7. Kunde wählt einen Termin.
8. Platz wird blockiert.
9. Kunde erhält eine Bestätigung / ein Ticket per E-Mail.

Wichtig:
Diese Logik jetzt noch nicht technisch bauen.
Die Website soll nur gestalterisch und strukturell darauf vorbereitet sein.

## Gutschein- und Terminlogik

Keine alte Hauptlogik mit drei Wunschterminen mehr.

Neue Zielrichtung:

* Gutscheincode eingeben
* verfügbaren festen Termin auswählen
* Bestätigung per E-Mail erhalten

Bis zur späteren technischen Anbindung darf die Einlöseseite statisch vorbereitet sein, aber sie soll sprachlich bereits zur späteren festen Terminwahl passen.

Vermeiden:

* „3 Wunschtermine“
* „Wunschtermin anfragen“ als zentrale Hauptlogik
* Formulierungen, die nach manueller Notlösung wirken

Besser:

* „Gutschein einlösen“
* „Termin zur Einlösung auswählen“
* „Verfügbare Termine“
* „Bestätigung per E-Mail“

## Tastings

Tastings sind der emotionale Hauptanker der Website.

Die Startseite soll Lust auf Tastings machen, nicht wie ein Gutscheinportal wirken.

Tasting-Seite:

* Erlebnis editorial vorstellen
* keine reine Produktliste
* Atmosphäre, Genuss, Wein, Feinkost und gemeinsame Abende betonen
* Gruppen ab 7 Personen als Anfrage darstellen

## Genussboxen

Genussboxen sind wichtig, aber nicht der Hauptanker der Startseite.

Sie gehören auf die Seite:
`gutscheine-boxen.html`

Genussboxen bleiben zunächst Anfrage-/manuelle Produkte.
Keinen automatischen Checkout für Genussboxen bauen, außer ausdrücklich beauftragt.

## UX-Regeln

Navigation:

* Tastings
* Genussboxen / Gutscheine & Boxen
* Kontakt
* Gutschein einlösen

Startseite:

* emotionaler Hero
* Tastings deutlich sichtbar
* Feinkost-Boutique erklären
* Standort dezent zeigen
* klare CTA-Führung

Buttons:

* nicht zu groß
* nicht zu viele gleichwertige CTAs
* klare Hierarchie
* Hauptaktion auf Startseite: Tastings entdecken
* Gutschein einlösen sekundär, aber sichtbar

Cards:

* keine generischen Standard-Kacheln
* weniger Template-Look
* mehr Editorial-/Magazin-Anmutung
* Bilder und Texte hochwertig inszenieren

## Arbeitsweise

Immer step-by-step arbeiten.

Nicht ungefragt das komplette Projekt umbauen.
Nur den konkret beauftragten Bereich ändern.

Nach Änderungen kurz erklären:

* welche Dateien geändert wurden
* was verbessert wurde
* was bewusst nicht geändert wurde
* was als nächster kleiner Schritt sinnvoll wäre

Keine großen neuen Features ohne ausdrücklichen Auftrag.
