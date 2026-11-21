/* ==========================================================================
   ALL text and camera stops of the presentation live in this file.

   Drafted text is wrapped in "[STRONG: ...]" (strong language) or
   "[WEAK: ...]" (weak language) so you can find and rewrite it. On screen the
   wrapper is removed and only the text inside is shown; when you have
   rewritten a text you can delete the wrapper or keep it.

   A slide looks like this (everything except id and camera is optional):

   {
     id: "solar",
     camera: { center: [lng, lat], zoom, pitch, bearing },
         // optional: fit: [west, south, east, north] picks center and zoom so
         // that this box fits in the space beside the panel
     duration: 3000,              // flight time to this slide, in ms
     rotate: 3,                   // slow rotation while shown, degrees/second
     layers: ["terrain", "buildings3d"],
         // francophone, germanophone, ch-regions, language-border,
         // terrain, buildings3d. Dim one with { id: "ch-regions", opacity: 0.3 }
     markers: ["tissot-arena"],   // ids from data/points.geojson
     legend: [{ swatch: "fr", strong: "...", weak: "..." }],
         // swatches: fr, de, both, it, rm, border
     panel: {
       layout: "side",            // "side" (default), "title" or "wide"
       kicker: "small line above the heading",
       heading: "...",
       bullets: ["...", "..."],   // 3-5 short keywords
       weakLanguage: ["..."],     // shown in italics with a language tag
       image: { src: "img/photo.jpg", alt: "...", caption: "..." },
       diagram: { type: "lake-energy", labels: { ... } },
       glossary: [{ strong: "...", weak: "..." }],
     },
     notes: ["speaking cue", "..."],   // only in the notes overlay (key N)
   }
   ========================================================================== */

// Language codes, used for the small language tags on screen.
const STRONG_LANG = "fr";
const WEAK_LANG = "de";

// true = show the "[STRONG: ...]" wrappers on screen, to see what is still a draft.
const SHOW_PLACEHOLDER_MARKS = false;

const BIEL = [7.2468, 47.1369];
const CLOSE_UP = ["terrain", "buildings3d"];

/* --------------------------------------------------------------------------
   Opening sequence (slides 1-5): from the world to Biel/Bienne
   -------------------------------------------------------------------------- */
const OPENING = [
  {
    id: "title",
    camera: { center: [10, 30], zoom: 1.7, pitch: 0, bearing: 0 },
    duration: 1500,
    rotate: 3,
    layers: [],
    panel: {
      layout: "title",
      kicker: "[STRONG: Villes et développement urbain durable]",
      heading: "Biel/Bienne",
      subheading: "[STRONG: Ville bilingue, ville de l'énergie]",
      weakLanguage: ["[WEAK: Zweisprachige Stadt, Energiestadt]"],
      names: "[STRONG: Prénom Nom · Prénom Nom · Prénom Nom]",
    },
    notes: ["[STRONG: saluer, présenter le groupe]", "[STRONG: thème + pourquoi Bienne]", "[STRONG: plan de l'exposé]"],
  },
  {
    id: "francophone",
    camera: { center: [8, 20], zoom: 2.4, pitch: 0, bearing: 0 },
    duration: 2500,
    layers: ["francophone"],
    legend: [
      { swatch: "fr", strong: "[STRONG: Français = langue officielle]", weak: "[WEAK: Französisch = Amtssprache]" },
    ],
    panel: {
      heading: "[STRONG: Le monde francophone]",
      bullets: [
        "[STRONG: langue officielle dans 26 pays]",
        "[STRONG: Europe, Afrique, Amérique, océan Indien]",
        "[STRONG: la majorité des francophones : en Afrique]",
      ],
      weakLanguage: ["[WEAK: Französisch – Amtssprache in 26 Ländern]"],
      glossary: [
        { strong: "la langue officielle", weak: "die Amtssprache" },
        { strong: "francophone", weak: "französischsprachig" },
      ],
    },
    notes: ["[STRONG: montrer la France, puis l'Afrique]", "[STRONG: langue officielle ≠ langue maternelle]"],
  },
  {
    id: "fr-de",
    camera: { center: [9, 49], zoom: 4.3, pitch: 0, bearing: 0 },
    duration: 2500,
    layers: ["francophone", "germanophone"],
    legend: [
      { swatch: "fr", strong: "[STRONG: Français officiel]", weak: "[WEAK: Französisch]" },
      { swatch: "de", strong: "[STRONG: Allemand officiel]", weak: "[WEAK: Deutsch]" },
      { swatch: "both", strong: "[STRONG: Les deux langues (rayé)]", weak: "[WEAK: Beide Sprachen (gestreift)]" },
    ],
    panel: {
      heading: "[STRONG: Français + allemand]",
      bullets: [
        "[STRONG: allemand : langue officielle dans 6 pays]",
        "[STRONG: les deux langues : Suisse, Belgique, Luxembourg]",
        "[STRONG: la Suisse : au point de rencontre]",
      ],
      weakLanguage: ["[WEAK: Deutsch und Französisch treffen sich in der Schweiz]"],
      glossary: [
        { strong: "germanophone", weak: "deutschsprachig" },
        { strong: "rayé", weak: "gestreift" },
      ],
    },
    notes: ["[STRONG: expliquer la légende : bleu, orange, rayé]", "[STRONG: trois pays avec les deux langues]"],
  },
  {
    id: "switzerland",
    // `fit` = [west, south, east, north]: the zoom is chosen so that this box
    // fits in the space the panel leaves free, on any screen size.
    camera: { center: [8.23, 46.8], zoom: 7.4, pitch: 0, bearing: 0, fit: [5.9, 45.75, 10.55, 47.85] },
    duration: 3000,
    layers: ["ch-regions", "language-border"],
    legend: [
      { swatch: "de", strong: "[STRONG: Allemand]", weak: "[WEAK: Deutsch]" },
      { swatch: "fr", strong: "[STRONG: Français]", weak: "[WEAK: Französisch]" },
      { swatch: "it", strong: "[STRONG: Italien]", weak: "[WEAK: Italienisch]" },
      { swatch: "rm", strong: "[STRONG: Romanche]", weak: "[WEAK: Rätoromanisch]" },
      { swatch: "border", strong: "[STRONG: Frontière allemand/français]", weak: "[WEAK: Deutsch-französische Sprachgrenze]" },
    ],
    panel: {
      heading: "[STRONG: La Suisse : quatre langues]",
      bullets: [
        "[STRONG: quatre régions linguistiques]",
        "[STRONG: allemand ≈ 62 %, français ≈ 23 %]",
        "[STRONG: italien ≈ 8 %, romanche ≈ 0,5 %]",
        "[STRONG: la frontière linguistique : le « Röstigraben »]",
      ],
      weakLanguage: ["[WEAK: vier Sprachgebiete, eine Sprachgrenze]"],
      glossary: [
        { strong: "la région linguistique", weak: "das Sprachgebiet" },
        { strong: "la frontière linguistique", weak: "die Sprachgrenze" },
        { strong: "le romanche", weak: "Rätoromanisch" },
      ],
    },
    notes: ["[STRONG: montrer les quatre couleurs]", "[STRONG: suivre la ligne pointillée jusqu'à Bienne]"],
  },
  {
    id: "biel",
    camera: { center: BIEL, zoom: 12.3, pitch: 50, bearing: -20 },
    duration: 4000,
    layers: ["terrain", { id: "ch-regions", opacity: 0.35 }, "language-border"],
    markers: ["biel", "language-border"],
    legend: [
      { swatch: "de", strong: "[STRONG: Région germanophone]", weak: "[WEAK: Deutsches Sprachgebiet]" },
      { swatch: "fr", strong: "[STRONG: Région francophone]", weak: "[WEAK: Französisches Sprachgebiet]" },
      { swatch: "border", strong: "[STRONG: Frontière linguistique]", weak: "[WEAK: Sprachgrenze]" },
    ],
    panel: {
      heading: "Biel/Bienne",
      bullets: [
        "[STRONG: plus grande ville officiellement bilingue de Suisse]",
        "[STRONG: env. 56 000 habitants]",
        "[STRONG: sur la frontière linguistique]",
        "[STRONG: entre le lac de Bienne et le Jura]",
      ],
      weakLanguage: ["[WEAK: grösste offiziell zweisprachige Stadt der Schweiz]"],
      glossary: [
        { strong: "bilingue", weak: "zweisprachig" },
        { strong: "le lac de Bienne", weak: "der Bielersee" },
        { strong: "l'habitant", weak: "der Einwohner" },
      ],
    },
    notes: ["[STRONG: nom double : Biel/Bienne]", "[STRONG: la frontière passe juste derrière la ville]", "[STRONG: transition → énergie]"],
  },
];

/* --------------------------------------------------------------------------
   MY CONTENT SLIDES (6-9): 3D close-ups.
   Add, remove or reorder the blocks below freely; the slide numbers follow.
   -------------------------------------------------------------------------- */
const MY_SLIDES = [
  {
    id: "energiestadt",
    camera: { center: BIEL, zoom: 14.1, pitch: 60, bearing: 20 },
    duration: 2000,
    rotate: 2,
    layers: [...CLOSE_UP, "language-border"],
    markers: ["biel"],
    panel: {
      kicker: "Energiestadt",
      heading: "[STRONG: Bienne, Cité de l'énergie]",
      bullets: [
        "[STRONG: label « Cité de l'énergie » Gold depuis 2020]",
        "[STRONG: 2040 : administration municipale neutre en CO₂]",
        "[STRONG: 2050 : toute la ville climatiquement neutre]",
        "[STRONG: trois exemples : lac, soleil, eau]",
      ],
      weakLanguage: ["[WEAK: Energiestadt Gold seit 2020]", "[WEAK: klimaneutrale Stadt bis 2050]"],
      glossary: [
        { strong: "la Cité de l'énergie", weak: "die Energiestadt" },
        { strong: "climatiquement neutre", weak: "klimaneutral" },
        { strong: "l'administration municipale", weak: "die Stadtverwaltung" },
      ],
    },
    notes: ["[STRONG: qu'est-ce que le label ?]", "[STRONG: deux objectifs : 2040 et 2050]", "[STRONG: annoncer les trois exemples]"],
  },
  {
    id: "lake",
    camera: { center: [7.2365, 47.13], zoom: 14.8, pitch: 62, bearing: 45 },
    duration: 2500,
    rotate: 2,
    layers: CLOSE_UP,
    markers: ["lake-energy"],
    panel: {
      kicker: "Energieverbund Bielersee",
      heading: "[STRONG: L'énergie du lac]",
      bullets: [
        "[STRONG: l'eau du lac chauffe et refroidit des quartiers]",
        "[STRONG: une pompe à chaleur au lieu du mazout et du gaz]",
        "[STRONG: Bienne et Nidau, réseau de chauffage à distance]",
      ],
      diagram: {
        type: "lake-energy",
        labels: {
          lake: "[STRONG: lac de Bienne]",
          intake: "[STRONG: eau du lac]",
          station: "[STRONG: pompe à chaleur]",
          heat: "[STRONG: chaleur]",
          buildings: "[STRONG: bâtiments]",
          back: "[STRONG: eau refroidie]",
        },
      },
      weakLanguage: ["[WEAK: Seewasser → Wärmepumpe → Fernwärme]"],
      glossary: [
        { strong: "la pompe à chaleur", weak: "die Wärmepumpe" },
        { strong: "le chauffage à distance", weak: "die Fernwärme" },
        { strong: "le mazout", weak: "das Heizöl" },
      ],
    },
    notes: [
      "[STRONG: commenter le schéma de gauche à droite]",
      "[STRONG: lac → station → bâtiments → retour au lac]",
      "[STRONG: avantage : énergie locale et renouvelable]",
    ],
  },
  {
    id: "solar",
    camera: { center: [7.2816, 47.1556], zoom: 16.1, pitch: 62, bearing: -30 },
    duration: 3000,
    rotate: 3,
    layers: CLOSE_UP,
    markers: ["tissot-arena"],
    panel: {
      kicker: "Tissot Arena",
      heading: "[STRONG: Du soleil sur le toit]",
      bullets: [
        "[STRONG: stade de football et de hockey, ouvert en 2015]",
        "[STRONG: le toit : une grande centrale solaire]",
        "[STRONG: env. 2 MW de puissance]",
        "[STRONG: utiliser les surfaces qui existent déjà]",
      ],
      weakLanguage: ["[WEAK: Solarkraftwerk auf dem Stadiondach]"],
      glossary: [
        { strong: "le toit", weak: "das Dach" },
        { strong: "la centrale solaire", weak: "das Solarkraftwerk" },
        { strong: "la puissance", weak: "die Leistung" },
      ],
    },
    notes: ["[STRONG: montrer le toit du stade]", "[STRONG: pas besoin de nouveau terrain]"],
  },
  {
    id: "hagneck",
    camera: { center: [7.1768, 47.06], zoom: 15.2, pitch: 65, bearing: 130 },
    duration: 3500,
    rotate: 2,
    layers: CLOSE_UP,
    markers: ["hagneck"],
    panel: {
      kicker: "[STRONG: Canal de Hagneck]",
      heading: "[STRONG: La centrale hydroélectrique de Hagneck]",
      bullets: [
        "[STRONG: l'Aar arrive ici dans le lac de Bienne]",
        "[STRONG: nouvelle centrale depuis 2015]",
        "[STRONG: électricité renouvelable pour la région]",
        "[STRONG: passe à poissons : énergie + nature]",
      ],
      weakLanguage: ["[WEAK: Wasserkraftwerk am Hagneckkanal]"],
      glossary: [
        { strong: "la centrale hydroélectrique", weak: "das Wasserkraftwerk" },
        { strong: "la passe à poissons", weak: "die Fischtreppe" },
        { strong: "renouvelable", weak: "erneuerbar" },
      ],
    },
    notes: ["[STRONG: situer : au sud du lac]", "[STRONG: canal → centrale → lac]", "[STRONG: lien avec la ville de Bienne]"],
  },
];

/* --------------------------------------------------------------------------
   Closing slides: summary in the weak language, personal stance, sources
   -------------------------------------------------------------------------- */
const CLOSING = [
  {
    id: "summary",
    camera: { center: [7.225, 47.108], zoom: 11.4, pitch: 45, bearing: 0 },
    duration: 3000,
    layers: ["terrain", "language-border"],
    markers: ["lake-energy", "tissot-arena", "hagneck"],
    panel: {
      weakPanel: true, // the whole panel is in the weak language
      heading: "[WEAK: Zusammenfassung]",
      bullets: [
        "[WEAK: zweisprachige Stadt an der Sprachgrenze]",
        "[WEAK: Energiestadt Gold seit 2020]",
        "[WEAK: Seewasser, Sonne, Wasserkraft]",
        "[WEAK: Ziel: klimaneutral bis 2050]",
      ],
      glossary: [
        { strong: "le résumé", weak: "die Zusammenfassung" },
        { strong: "l'objectif", weak: "das Ziel" },
      ],
    },
    notes: ["[WEAK: langsam sprechen]", "[WEAK: drei Beispiele noch einmal nennen]"],
  },
  {
    id: "stance",
    camera: { center: [7.17, 47.09], zoom: 10.6, pitch: 35, bearing: -40 },
    duration: 2000,
    layers: ["terrain"],
    markers: ["biel"],
    panel: {
      heading: "[STRONG: Mon avis]",
      statement: "[STRONG: À mon avis, … (deux ou trois phrases courtes)]",
      bullets: ["[STRONG: ce qui me convainc : …]", "[STRONG: ce qui manque encore : …]"],
      weakLanguage: ["[WEAK: Meiner Meinung nach …]"],
    },
    notes: ["[STRONG: donner mon avis personnel]", "[STRONG: remercier, questions ?]"],
  },
  {
    id: "sources",
    camera: { center: [8.23, 46.8], zoom: 5.2, pitch: 0, bearing: 0 },
    duration: 2500,
    layers: ["ch-regions", "language-border"],
    panel: {
      layout: "wide",
      heading: "[STRONG: Sources]",
      kicker: "[WEAK: Quellen]",
      showSources: true, // lists SOURCES below
    },
    notes: ["[STRONG: merci de votre attention]"],
  },
];

/* --------------------------------------------------------------------------
   Sources slide. The data sources are filled in; add your content sources.
   -------------------------------------------------------------------------- */
const SOURCES = [
  "[STRONG: Source de contenu 1 – à compléter (auteur, titre, année, URL)]",
  "[STRONG: Source de contenu 2 – à compléter]",
  "[STRONG: Source de contenu 3 – à compléter]",
  "Office fédéral de la statistique (OFS/BFS) : régions linguistiques 2020 et limites communales généralisées (ThemaKart), état au 1.1.2024.",
  "Natural Earth 5.1.2 : Admin 0 – Countries, 1:50m (domaine public). naturalearthdata.com",
  "Fond de carte : OpenFreeMap, © OpenMapTiles, données © OpenStreetMap contributors.",
  "Relief : Terrain Tiles (Mapzen), AWS Open Data.",
];

window.PRESENTATION = {
  STRONG_LANG,
  WEAK_LANG,
  SHOW_PLACEHOLDER_MARKS,

  // Small fixed texts of the interface.
  ui: {
    glossary: "Glossaire / Glossar",
    notes: "[STRONG: Notes]",
    nextSlide: "[STRONG: Ensuite]",
    offline: "[STRONG: Carte hors ligne – les diapositives restent utilisables] · [WEAK: Karte offline]",
  },

  // Labels of the points in data/points.geojson.
  pointLabels: {
    "biel": "Biel / Bienne",
    "language-border": "[STRONG: frontière linguistique] / [WEAK: Sprachgrenze]",
    "lake-energy": "[STRONG: Énergie du lac]",
    "tissot-arena": "Tissot Arena",
    "hagneck": "[STRONG: Centrale de Hagneck]",
  },

  slides: [...OPENING, ...MY_SLIDES, ...CLOSING],
  sources: SOURCES,
};
