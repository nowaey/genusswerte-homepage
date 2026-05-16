# CLAUDE.md — Genusswerte Bonn Homepage

## Projektübersicht

Statische Homepage für Genusswerte Bonn, eine Feinkost-Boutique in Bonn-Poppelsdorf.
Deploybar via FTP auf all-inkl.com. Kein Build-Tool, kein Backend, kein Framework.

**Tech-Stack:** Vanilla HTML · Vanilla CSS · Vanilla JavaScript

**Seiten:**
- `index.html` — Hauptseite
- `gutschein-einloesen.html` — Gutschein-Einlöseformular
- `impressum.html` — Platzhalter (Inhalt vom Betreiber ausfüllen)
- `datenschutz.html` — Platzhalter (Inhalt vom Betreiber ausfüllen)

---

## Bestätigte Geschäftsdaten

```
Name:      Genusswerte Bonn
Adresse:   Clemens-August-Straße 38–40, 53115 Bonn – Poppelsdorf
Telefon:   0228 2590 8928
WhatsApp:  https://wa.me/4922825908928
Instagram: @genusswerte.bonn

Öffnungszeiten:
  Mo  Geschlossen
  Di  12:00 – 19:00
  Mi  12:00 – 20:00
  Do  10:00 – 21:00
  Fr  10:00 – 21:00
  Sa  10:00 – 21:00
  So  Geschlossen
```

---

## Brand & Design

**Claim:** Taste – Discover – Enjoy
**Stil:** Premium Feinkost-Boutique — warm, elegant, hochwertig. Kein generisches Shopify-Look.

**Design-Tokens (`assets/css/base.css`):**
```css
--color-bg:          #FAF7F2   /* Creme-Hintergrund */
--color-bg-alt:      #F2EDE4
--color-green:       #2D4A3E   /* Dunkelgrün, Primärfarbe */
--color-green-light: #3D6356
--color-green-dark:  #1A3028
--color-gold:        #C9A96E   /* Gold, Akzentfarbe */
--color-text:        #1A1A1A
--color-text-muted:  #6B6B6B
--color-white:       #FFFFFF

--font-serif: 'Playfair Display', Georgia, serif
--font-sans:  'Inter', system-ui, sans-serif

--radius-card: 14px
--radius-btn:  8px
--max-width:   1200px
--section-gap: 5rem
```

**Logos:**
- `assets/images/genusswerte_bonn_logo_transparent.png` — Header, Hero, Footer (schwarze Lineart auf transparent)
- `assets/images/logo.png` — nur Favicon
- Auf dunklem Hintergrund (Hero, Footer): `filter: brightness(0) invert(1)` für weiße Darstellung

---

## Datei-Struktur

```
Genusswerte neue Hauptseite/
├── index.html
├── gutschein-einloesen.html
├── impressum.html
├── datenschutz.html
├── .htaccess
└── assets/
    ├── images/
    │   ├── genusswerte_bonn_logo_transparent.png
    │   ├── logo.png
    │   ├── hero-bg.png                  ← Hero-Hintergrundfoto
    │   ├── tasting-wein.jpg             ← Echte Bilder von genusswerte.com
    │   ├── tasting-afterwork.jpg
    │   ├── tasting-gin.jpg
    │   ├── tasting-champagner.jpg
    │   ├── tasting-trueffel.png
    │   ├── tasting-whisky.png
    │   ├── tasting-craftbeer.jpg
    │   ├── tasting-wagyu.jpg
    │   ├── tasting-apero.jpg
    │   ├── box-klassiker.svg            ← SVG-Platzhalter bis echte Fotos vorliegen
    │   ├── box-bella-italia.svg
    │   ├── box-aperitivo.svg
    │   ├── box-bonn.svg
    │   ├── box-date-night.svg
    │   ├── box-feierabend.svg
    │   └── placeholder-store.svg
    ├── css/
    │   ├── base.css        (Tokens, Reset, Typografie, Utilities)
    │   ├── components.css  (Buttons, Cards, Steps, Forms, Animationsklassen)
    │   └── layout.css      (Header, Hero, Sections, Grid, Footer, Responsive)
    └── js/
        ├── main.js         (Nav, Sticky Header, Smooth Scroll, Intro, Scroll-Animationen)
        └── voucher-form.js (Validierung + Formspree Submit)
```

---

## CSS-Klassen Referenz

**Buttons:**
- `.btn` — Basis
- `.btn--primary` — Dunkelgrün gefüllt
- `.btn--secondary` — Gold-Rahmen, grüner Text (auf hellem Hintergrund)
- `.btn--ghost` — Weißer Rahmen, weißer Text (auf dunklem Hintergrund)
- `.btn--hero-outline` — Gold-Rahmen, weißer Text (im Hero)
- `.btn--whatsapp` — Grün mit WhatsApp-Icon, volle Breite (auf Karten)
- `.btn--primary.btn--order` — „Bestellen"-Button auf Genussbox-Karten (ohne Funktion, öffnet Hinweis-Toast via `showOrderNote()`)

**Karten:**
- `.card > .card__image + .card__body`
- `.card__body > .card__eyebrow + .card__title + .card__description + .card__variants + .card__price + .card__action`
- `.variant-pill` — Varianten-Chips

**Sections:**
- `.section` / `.section--alt` / `.section--dark`
- `.section__header > .section__eyebrow + .section__title + .section__subtitle`
- `.card-grid` — `repeat(auto-fill, minmax(280px, 1fr))`
- `.card-grid--4` — 4 Spalten

**Animationen:**
- `.js-animate` — Ausgangszustand (opacity 0, translateY 32px)
- `.js-animate.is-visible` — Eingeblendet (wird per IntersectionObserver gesetzt)
- `data-delay="1"–"9"` — Gestaffelte Transition-Delays für Grid-Karten

---

## JavaScript (`main.js`)

Vier Funktionen in einem IIFE:

| Funktion | Was sie tut |
|---|---|
| `initPageIntro()` | Zeigt weißen Splash-Screen mit Logo, blendet nach 1 s aus |
| `initMobileNav()` | Hamburger-Toggle, ESC-Key, Outside-Click |
| `initStickyHeader()` | Fügt `.is-scrolled` ab 60 px Scroll hinzu |
| `initSmoothScroll()` | Sanftes Scrollen für alle `href="#..."` Links |
| `initScrollAnimations()` | IntersectionObserver setzt `.is-visible` auf `.js-animate` Elementen |

---

## Animations-Timing (Seitenaufruf)

| Zeit | Ereignis |
|---|---|
| 0 ms | Weißer Splash-Screen, Logo erscheint |
| ~150 ms | Logo skaliert ein (scale 0.82 → 1) |
| 1000 ms | JS setzt `.is-done` auf Overlay → Fade-Out beginnt |
| ~1550 ms | Overlay vollständig weg |
| 1650 ms | Nav-Logo eingeblendet |
| 1850 ms | Hero-Logo eingeblendet |
| 1850–2250 ms | H1, Subline, CTAs blenden gestaffelt ein |

---

## Business-Logik

Das Tasting-Buchungssystem wird vom Franchise-Partner betrieben.
Diese Website darf **keine verbindlichen Terminbuchungen** anbieten.

Ablauf:
1. Kunde kauft/fragt Tasting-Gutschein via WhatsApp an
2. Kunde löst Gutschein über das Formular ein und nennt Wunschtermine
3. Genusswerte Bonn prüft manuell und bestätigt persönlich

**Niemals verwenden:** Jetzt buchen · Sofort buchen · Platz sichern · Verbindlich buchen · Termin buchen

**Immer verwenden:** Tasting-Gutschein kaufen · Gutschein einlösen · Wunschtermin anfragen · Termin nach Verfügbarkeit · Persönliche Bestätigung · Wir melden uns persönlich

---

## Tasting-Gutscheine (9 Typen)

| Tasting | Varianten | ab Preis |
|---|---|---|
| Wein Tasting | Klassisch / Alkoholfrei / Naturwein / Vegan | 29,00 € |
| Afterwork Wein Tasting | 1 / 2 Personen | 19,00 € |
| Gin Tasting | 1 / 2 Personen | 45,00 € |
| Champagner & Popcorn | 1 / 2 Personen | 39,00 € |
| Trüffel & Champagner | 1 / 2 Personen | 66,00 € |
| Whisky Tasting | 1 / 2 Personen | 45,00 € |
| Craft Beer Tasting | 1 / 2 Personen | 25,00 € |
| Wagyu, Wein & Champagner | 1 / 2 Personen | 55,00 € |
| Apéro & Antipasti | Klassisch / Alkoholfrei | 29,00 € |

**Button-Text:** „Tasting-Gutschein kaufen" → öffnet WhatsApp mit vorausgefüllter Nachricht

---

## Genussboxen (6 Typen, feste Preise)

| Box | Klein | Medium | Groß |
|---|---|---|---|
| Der Deutsche Klassiker | 29,90 € | 49,90 € | 79,90 € |
| Bella Italia Box | 34,90 € | 54,90 € | 89,90 € |
| Aperitivo Box | 34,90 € | 57,90 € | 89,90 € |
| Bonn Probierbox | 27,90 € | 44,90 € | 74,90 € |
| Date Night Box | 39,90 € | 64,90 € | 99,90 € |
| Feierabend Box | 24,90 € | 42,90 € | 67,90 € |

**Preise sind Platzhalter** — vor Launch bestätigen!
**Button-Text:** „Bestellen" (V1 ohne Funktion — öffnet Hinweis-Toast mit WhatsApp-Link via `showOrderNote()`)

---

## WhatsApp-Nachrichten

**Basis-URL:** `https://wa.me/4922825908928?text=...`

**Tasting-Gutschein:**
```
Hallo Genusswerte Bonn,

ich möchte einen Tasting-Gutschein.

Tasting: [NAME]
Variante:
Personenanzahl:
Name:
E-Mail:
Gewünschte Zustellung: digital / Abholung im Laden
Nachricht:
```

**Genussbox:**
```
Hallo Genusswerte Bonn,

ich möchte bestellen: [BOX NAME]

Größe:
Gewünschter Anlass:
Abholung oder Versand:
Name:
Nachricht:
```

---

## Gutschein-Einlöseformular

**Datei:** `gutschein-einloesen.html`
**Formspree-Endpoint:** `https://formspree.io/f/REPLACE_ME` ← vor Launch ersetzen!

Felder: Gutscheincode · Gutscheinart · Name · E-Mail · Telefon (optional) · Gewünschtes Tasting · Wunschtermin 1–3 · Personenanzahl · Nachricht

Datenschutz-Hinweis unter dem Formular ist Pflicht (DSGVO).

---

## Vor dem Launch — Checkliste

- [ ] Formspree-Endpoint in `gutschein-einloesen.html` ersetzen (`REPLACE_ME`)
- [ ] Box-Preise bestätigen (aktuell Platzhalter)
- [ ] Impressum-Inhalt ausfüllen (`impressum.html`)
- [ ] Datenschutzerklärung ausfüllen (`datenschutz.html`) — Generator: datenschutz-generator.de
- [ ] Echte Produktfotos für Genussboxen einbinden (SVGs ersetzen)
- [ ] WhatsApp-Nummer verifizieren: `4922825908928`
- [ ] Alle `<!-- REPLACE -->` Kommentare im HTML prüfen
- [ ] Mobile-Test: 320 px, 375 px, 768 px
- [ ] Desktop-Test: 1024 px, 1440 px

---

## Deployment

**Ziel:** all-inkl.com via FTP (FileZilla)
**Kein Build-Schritt** — alle Dateien direkt hochladen.

Upload-Inhalt:
```
index.html
gutschein-einloesen.html
impressum.html
datenschutz.html
.htaccess
assets/
```
