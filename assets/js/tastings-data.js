/* =========================================================
   TASTINGS-DATA.JS — Genusswerte Bonn
   Demo-Daten — wird später durch Supabase / Admin Panel ersetzt.
   Single source of truth für tastings.html (Cards + Modal).
   ========================================================= */

window.GW_TASTINGS = [
  {
    id: 'wein',
    title: 'Wein Tasting',
    category: 'Tasting-Format',
    description: 'Eine Reise durch fünf einzigartige Weine, fein abgestimmt auf ausgesuchte Käsespezialitäten. Auch als Naturwein, vegan oder alkoholfrei erhältlich.',
    image: 'assets/images/tasting-wein.jpg',
    pricePerPerson: 29.00,
    duration: 'ca. 2 Stunden',
    location: 'Genusswerte Bonn',
    availableDates: [
      { id: 'wein-2026-06-13', date: '2026-06-13', time: '19:30', availableSeats: 4 },
      { id: 'wein-2026-06-27', date: '2026-06-27', time: '19:30', availableSeats: 6 },
      { id: 'wein-2026-07-11', date: '2026-07-11', time: '19:30', availableSeats: 2 }
    ]
  },
  {
    id: 'afterwork',
    title: 'Afterwork Wein Tasting',
    category: 'Tasting-Format',
    description: 'Vier ausgewählte Weine und feine Häppchen aus der Feinkost machen deinen Feierabend zum Genuss. Entspannt, stilvoll, unvergesslich.',
    image: 'assets/images/tasting-afterwork.jpg',
    pricePerPerson: 19.00,
    duration: 'ca. 1,5 Stunden',
    location: 'Genusswerte Bonn',
    availableDates: [
      { id: 'afterwork-2026-06-18', date: '2026-06-18', time: '18:30', availableSeats: 6 },
      { id: 'afterwork-2026-07-02', date: '2026-07-02', time: '18:30', availableSeats: 4 },
      { id: 'afterwork-2026-07-16', date: '2026-07-16', time: '18:30', availableSeats: 6 }
    ]
  },
  {
    id: 'gin',
    title: 'Gin Tasting',
    category: 'Tasting-Format',
    description: 'Vier besondere Gins, begleitet von passenden Tonic Waters. Kein Fachgesimpel — einfach gutes Trinken, spannende Aromen und ein toller Abend.',
    image: 'assets/images/tasting-gin.jpg',
    pricePerPerson: 45.00,
    duration: 'ca. 2 Stunden',
    location: 'Genusswerte Bonn',
    availableDates: [
      { id: 'gin-2026-06-20', date: '2026-06-20', time: '20:00', availableSeats: 4 },
      { id: 'gin-2026-07-04', date: '2026-07-04', time: '20:00', availableSeats: 2 },
      { id: 'gin-2026-07-18', date: '2026-07-18', time: '20:00', availableSeats: 6 }
    ]
  },
  {
    id: 'champagner',
    title: 'Champagner & Popcorn',
    category: 'Tasting-Format',
    description: 'Fünf Champagner und Schaumweine treffen auf kreative Popcorn-Sorten. Eine Kombination, die überrascht und garantiert ein Lächeln zaubert.',
    image: 'assets/images/tasting-champagner.jpg',
    pricePerPerson: 39.00,
    duration: 'ca. 2 Stunden',
    location: 'Genusswerte Bonn',
    availableDates: [
      { id: 'champagner-2026-06-19', date: '2026-06-19', time: '20:00', availableSeats: 4 },
      { id: 'champagner-2026-07-03', date: '2026-07-03', time: '20:00', availableSeats: 6 },
      { id: 'champagner-2026-07-17', date: '2026-07-17', time: '20:00', availableSeats: 4 }
    ]
  },
  {
    id: 'trueffel',
    title: 'Trüffel & Champagner',
    category: 'Tasting-Format · Premium',
    description: 'Ein Aperitif zur Begrüßung, drei liebevoll komponierte Gänge — veredelt mit frischem Trüffel und abgestimmt auf edle Schaumweine. Kulinarische Eleganz pur.',
    image: 'assets/images/tasting-trueffel.png',
    pricePerPerson: 66.00,
    duration: 'ca. 3 Stunden',
    location: 'Genusswerte Bonn',
    availableDates: [
      { id: 'trueffel-2026-06-26', date: '2026-06-26', time: '19:30', availableSeats: 2 },
      { id: 'trueffel-2026-07-10', date: '2026-07-10', time: '19:30', availableSeats: 4 },
      { id: 'trueffel-2026-07-24', date: '2026-07-24', time: '19:30', availableSeats: 6 }
    ]
  },
  {
    id: 'whisky',
    title: 'Whisky Tasting',
    category: 'Tasting-Format',
    description: 'Fünf ausgewählte Whiskys, serviert mit gerösteten Salzmandeln und edler Schokolade — ein stilvoller Abend für alle, die guten Geschmack feiern.',
    image: 'assets/images/tasting-whisky.png',
    pricePerPerson: 45.00,
    duration: 'ca. 2,5 Stunden',
    location: 'Genusswerte Bonn',
    availableDates: [
      { id: 'whisky-2026-06-25', date: '2026-06-25', time: '20:00', availableSeats: 4 },
      { id: 'whisky-2026-07-09', date: '2026-07-09', time: '20:00', availableSeats: 2 },
      { id: 'whisky-2026-07-23', date: '2026-07-23', time: '20:00', availableSeats: 6 }
    ]
  },
  {
    id: 'craftbeer',
    title: 'Craft Beer Tasting',
    category: 'Tasting-Format',
    description: 'Einzigartige, handgebraute Biere aus der Region und aller Welt — von hopfig-fruchtig bis malzig-dunkel. Finde dein Lieblingsbier in guter Gesellschaft.',
    image: 'assets/images/tasting-craftbeer.jpg',
    pricePerPerson: 25.00,
    duration: 'ca. 2 Stunden',
    location: 'Genusswerte Bonn',
    availableDates: [
      { id: 'craftbeer-2026-06-12', date: '2026-06-12', time: '19:30', availableSeats: 6 },
      { id: 'craftbeer-2026-06-26', date: '2026-06-26', time: '19:30', availableSeats: 4 },
      { id: 'craftbeer-2026-07-10', date: '2026-07-10', time: '19:30', availableSeats: 6 }
    ]
  },
  {
    id: 'wagyu',
    title: 'Wagyu, Wein & Champagner',
    category: 'Tasting-Format · Highlight',
    description: 'Das beste Fleisch der Welt trifft auf drei erstklassige Weine und einen erfrischenden Champagner — eine Geschmacksexplosion, die nachhaltig beeindruckt.',
    image: 'assets/images/tasting-wagyu.jpg',
    pricePerPerson: 55.00,
    duration: 'ca. 2,5 Stunden',
    location: 'Genusswerte Bonn',
    availableDates: [
      { id: 'wagyu-2026-06-20', date: '2026-06-20', time: '19:30', availableSeats: 2 },
      { id: 'wagyu-2026-07-04', date: '2026-07-04', time: '19:30', availableSeats: 4 },
      { id: 'wagyu-2026-07-18', date: '2026-07-18', time: '19:30', availableSeats: 4 }
    ]
  },
  {
    id: 'apero',
    title: 'Apéro & Antipasti',
    category: 'Tasting-Format',
    description: 'Leckere Antipasti und perfekt abgestimmte Aperitif-Drinks — für jeden Geschmack etwas dabei. Auch in einer alkoholfreien Variante erhältlich.',
    image: 'assets/images/tasting-apero.jpg',
    pricePerPerson: 29.00,
    duration: 'ca. 1,5 Stunden',
    location: 'Genusswerte Bonn',
    availableDates: [
      { id: 'apero-2026-06-19', date: '2026-06-19', time: '18:30', availableSeats: 6 },
      { id: 'apero-2026-07-03', date: '2026-07-03', time: '18:30', availableSeats: 4 },
      { id: 'apero-2026-07-17', date: '2026-07-17', time: '18:30', availableSeats: 6 }
    ]
  }
];
