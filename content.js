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
     projection: "mercator",      // flat map for this slide; default is the globe
     layers: ["terrain", "funiculars"],
         // francophone, germanophone, ch-regions, language-border,
         // terrain (3D relief),
         // funiculars, trolleybuses, boat, trains (lines with moving vehicles).
         // Dim one with { id: "ch-regions", opacity: 0.3 }
     markers: ["tissot-arena"],   // ids from data/points.geojson
     legend: [{ swatch: "fr", strong: "...", weak: "..." }],
         // swatches: fr, de, both, it, rm, border, funicular, trolleybus, boat
     panel: {
       layout: "side",            // "side" (default), "title" or "wide"
       kicker: "small line above the heading",
       heading: "...",
       bullets: ["...", "..."],   // 3-5 short keywords
       weakLanguage: ["..."],     // shown in italics with a language tag
       image: { src: "assets/photos/photo.jpg", alt: "...", caption: "..." },   // or a list of two; shown in the panel
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
// Close-ups: 3D terrain under the aerial photos (the imagery is always on).
const CLOSE_UP = ["terrain"];

/* --------------------------------------------------------------------------
   Opening sequence (slides 1-5): from the world to Biel/Bienne
   -------------------------------------------------------------------------- */
const OPENING = [
  {
    id: "title",
    // Flat, straight-down view of Biel/Bienne and its lake.
    camera: { center: BIEL, zoom: 11.3, pitch: 0, bearing: 0 },
    duration: 1000,
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
    // Flat map (not the globe), fitted to all of Canada, France and French-speaking Africa.
    projection: "mercator",
    camera: { center: [8, 20], zoom: 2.4, pitch: 0, bearing: 0, fit: [-160, -30, 55, 72] },
    duration: 2400,
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
    // Also flat, so the map does not bend between this slide and the last one.
    projection: "mercator",
    camera: { center: [9, 49], zoom: 4.3, pitch: 0, bearing: 0 },
    duration: 1400,
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
    duration: 1800,
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
    duration: 2200,
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
        "[STRONG: plus grande ville bilingue de Suisse]",
        "[STRONG: env. 56 000 habitants]",
        "[STRONG: en train : Berne ≈ 25 min, Zurich ≈ 1 h 10]",
        "[STRONG: sur la frontière linguistique, entre lac et Jura]",
      ],
      weakLanguage: ["[WEAK: grösste zweisprachige Stadt der Schweiz]"],
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
   MY CONTENT SLIDES (6-12): energy (6-9) and transport (10-12), 3D close-ups.
   Add, remove or reorder the blocks below freely; the slide numbers follow.
   -------------------------------------------------------------------------- */
const MY_SLIDES = [
  {
    id: "energiestadt",
    camera: { center: BIEL, zoom: 14.1, pitch: 60, bearing: 20 },
    duration: 1200,
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
    camera: { center: [7.2372, 47.1275], zoom: 14.7, pitch: 62, bearing: 45 },
    duration: 1400,
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
    camera: { center: [7.2822, 47.1558], zoom: 16.3, pitch: 62, bearing: -115 },   // as in the photo: from the north-east end
    duration: 1800,
    rotate: 0.5,
    layers: CLOSE_UP,
    markers: ["tissot-arena"],
    panel: {
      kicker: "Tissot Arena",
      heading: "[STRONG: Du soleil sur le toit]",
      image: { src: "assets/photos/tissot-arena.jpg", alt: "Tissot Arena", caption: "Photo : ESB BielBienne, CC BY-SA 4.0" },
      bullets: [
        "[STRONG: stade de football et de hockey]",
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
    camera: { center: [7.1772, 47.0599], zoom: 16.6, pitch: 58, bearing: 110 },   // as in the photo: from the footbridge
    duration: 2000,
    rotate: 0.5,
    layers: CLOSE_UP,
    markers: ["hagneck"],
    panel: {
      kicker: "[STRONG: Canal de Hagneck]",
      heading: "[STRONG: La centrale hydroélectrique de Hagneck]",
      image: { src: "assets/photos/hagneck.jpg", alt: "Hagneck", caption: "Photo : Arkelin, CC BY 4.0" },
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
  {
    id: "funiculars",
    camera: { center: [7.2290, 47.1420], zoom: 13.6, pitch: 60, bearing: -30 },   // from the city side, looking up the slope
    duration: 1800,
    rotate: 0.5,
    layers: [...CLOSE_UP, "funiculars"],
    markers: ["magglingen", "evilard"],
    legend: [{ swatch: "funicular", strong: "[STRONG: Funiculaire]", weak: "[WEAK: Standseilbahn]" }],
    panel: {
      kicker: "[STRONG: Transports]",
      heading: "[STRONG: Monter sans voiture]",
      image: { src: "assets/photos/funicular.jpg", alt: "Funiculaire Bienne–Évilard", caption: "Photo : Falk2, CC BY-SA 4.0" },
      bullets: [
        "[STRONG: deux funiculaires partent de la ville]",
        "[STRONG: Macolin : depuis 1887, 1,7 km]",
        "[STRONG: Évilard : depuis 1898, 7 minutes]",
      ],
      weakLanguage: ["[WEAK: Die Standseilbahn fährt in 7 Minuten nach Leubringen]"],
      glossary: [
        { strong: "le funiculaire", weak: "die Standseilbahn" },
        { strong: "Macolin / Évilard", weak: "Magglingen / Leubringen" },
      ],
    },
    notes: ["[STRONG: montrer les deux lignes et les cabines]", "[STRONG: plus de 120 ans : une vieille idée durable]"],
  },
  {
    id: "bus-boat",
    camera: { center: [7.2560, 47.1370], zoom: 12.9, pitch: 50, bearing: 15 },
    duration: 1600,
    rotate: 1,
    layers: ["terrain", "funiculars", "trolleybuses", "boat"],
    legend: [
      { swatch: "trolleybus", strong: "[STRONG: Trolleybus]", weak: "[WEAK: Trolleybus]" },
      { swatch: "boat", strong: "[STRONG: Bateau]", weak: "[WEAK: Schiff]" },
      { swatch: "funicular", strong: "[STRONG: Funiculaire]", weak: "[WEAK: Standseilbahn]" },
    ],
    panel: {
      kicker: "[STRONG: Transports]",
      heading: "[STRONG: Trolleybus et bateaux]",
      image: [
        { src: "assets/photos/trolleybus.jpg", alt: "Trolleybus", caption: "Photo : VincentdeMorteau, CC BY-SA 3.0" },
        { src: "assets/photos/mobicat.jpg", alt: "MobiCat", caption: "Photo : BSG, CC BY-SA 3.0" },
      ],
      bullets: [
        "[STRONG: trolleybus : bus électriques, depuis 1940]",
        "[STRONG: bateaux : Bienne – île Saint-Pierre – Erlach]",
        "[STRONG: le « MobiCat » : un catamaran solaire]",
      ],
      weakLanguage: ["[WEAK: Der Trolleybus fährt mit Strom]"],
      glossary: [
        { strong: "le bateau", weak: "das Schiff" },
        { strong: "l'électricité", weak: "der Strom" },
      ],
    },
    notes: ["[STRONG: suivre un bus et un bateau sur la carte]", "[STRONG: électricité au lieu du diesel]"],
  },
  {
    id: "train",
    camera: { center: [7.225, 47.115], zoom: 11.2, pitch: 45, bearing: -15 },
    duration: 1600,
    rotate: 0.5,
    layers: ["terrain", "trains"],
    markers: ["biel"],
    legend: [{ swatch: "train", strong: "[STRONG: Lignes CFF]", weak: "[WEAK: SBB-Linien]" }],
    panel: {
      kicker: "[STRONG: Transports]",
      heading: "[STRONG: Le train : la ligne du pied du Jura]",
      bullets: [
        "[STRONG: ligne Genève – Bienne – Zurich, et ligne vers Berne]",
        "[STRONG: depuis 2025 : 100 % d'électricité renouvelable, surtout hydraulique]",
        "[STRONG: au bord du lac : nouveau tunnel de Gléresse (2,1 km), prévu pour fin 2029]",
      ],
      weakLanguage: ["[WEAK: Die Züge der SBB fahren mit erneuerbarem Strom]"],
      glossary: [
        { strong: "la gare", weak: "der Bahnhof" },
        { strong: "les CFF", weak: "die SBB" },
        { strong: "la voie", weak: "das Gleis" },
      ],
    },
    notes: ["[STRONG: suivre un train le long du lac]", "[STRONG: CFF = SBB en allemand]", "[STRONG: transition → résumé en allemand]"],
  },
];

/* --------------------------------------------------------------------------
   PAYAM'S SLIDES: architecture and streets. Drafts, to be rewritten by Payam.
   -------------------------------------------------------------------------- */
const PAYAM_SLIDES = [
  {
    id: "swatch",
    camera: { center: [7.2606, 47.1437], zoom: 16.4, pitch: 65, bearing: 145 },   // as in the photo: along the street under the roof
    duration: 1800,
    rotate: 0.5,
    layers: CLOSE_UP,
    markers: ["swatch"],
    panel: {
      kicker: "[STRONG: Architecture]",
      heading: "[STRONG: Swatch et Omega : un siège en bois]",
      image: { src: "assets/photos/swatch.jpg", alt: "Swatch", caption: "Photo : MHM55, CC BY-SA 4.0" },
      bullets: [
        "[STRONG: Bienne : siège mondial de Swatch et d'Omega]",
        "[STRONG: siège de Swatch : 2019, architecte Shigeru Ban]",
        "[STRONG: 240 m de long, env. 4 600 poutres en bois]",
        "[STRONG: le bois : un matériau renouvelable]",
      ],
      weakLanguage: ["[WEAK: Der Hauptsitz von Swatch ist aus Holz]"],
      glossary: [
        { strong: "le siège", weak: "der Hauptsitz" },
        { strong: "le bois", weak: "das Holz" },
        { strong: "l'horlogerie", weak: "die Uhrenindustrie" },
      ],
    },
    notes: ["[STRONG: montrer le long bâtiment courbe]", "[STRONG: horlogerie = l'industrie de la ville]"],
  },
  {
    id: "expo",
    camera: { center: [7.2350, 47.1305], zoom: 14.6, pitch: 62, bearing: -45 },   // as in the photo: from the lake towards the Jura
    duration: 1600,
    rotate: 0.5,
    layers: CLOSE_UP,
    markers: ["lakeshore"],
    panel: {
      kicker: "Expo.02",
      heading: "[STRONG: L'héritage d'Expo.02 au bord du lac]",
      image: { src: "assets/photos/expo02.jpg", alt: "Expo.02", caption: "Photo (2002) : WikiNik, CC BY-SA 3.0" },
      bullets: [
        "[STRONG: 2002 : exposition nationale suisse, Expo.02]",
        "[STRONG: Bienne : une des « arteplages », au bord du lac]",
        "[STRONG: après l'expo : les bâtiments sont démontés]",
        "[STRONG: 2021 : le projet de quartier AGGLOlac est refusé]",
      ],
      weakLanguage: ["[WEAK: 2002 war die Landesausstellung Expo.02 in Biel]"],
      glossary: [
        { strong: "l'exposition nationale", weak: "die Landesausstellung" },
        { strong: "la rive du lac", weak: "das Seeufer" },
      ],
    },
    notes: ["[STRONG: montrer la rive entre Bienne et Nidau]", "[STRONG: question : que faire de ce terrain ?]"],
  },
  {
    id: "streets",
    camera: { center: BIEL, zoom: 15.8, pitch: 58, bearing: -20 },
    duration: 1500,
    rotate: 2,
    layers: CLOSE_UP,
    markers: ["central-square"],
    panel: {
      kicker: "[STRONG: Espace public]",
      heading: "[STRONG: Des rues en deux langues]",
      image: { src: "assets/photos/street-sign.jpg", alt: "Quellgasse / Rue de la Source", caption: "Photo : Roland Zumbuehl, CC BY-SA 4.0" },
      bullets: [
        "[STRONG: tous les noms de rue : en allemand et en français]",
        "[STRONG: habitants : 55 % allemand, 45 % français]",
        "[STRONG: le bilinguisme est inscrit dans le règlement de la ville (1996)]",
      ],
      weakLanguage: ["[WEAK: Alle Strassenschilder sind zweisprachig]"],
      glossary: [
        { strong: "le panneau de rue", weak: "das Strassenschild" },
        { strong: "le bilinguisme", weak: "die Zweisprachigkeit" },
      ],
    },
    notes: ["[STRONG: exemple : Place Centrale / Zentralplatz]", "[STRONG: transition → notre avis]"],
  },
];

/* --------------------------------------------------------------------------
   Summary of my part in the weak language (before Payam's slides)
   -------------------------------------------------------------------------- */
const SUMMARY = [
  {
    id: "summary",
    camera: { center: [7.225, 47.108], zoom: 11.4, pitch: 45, bearing: 0 },
    duration: 1800,
    layers: ["terrain", "language-border", "funiculars", "trolleybuses", "boat"],
    markers: ["lake-energy", "tissot-arena", "hagneck"],
    panel: {
      weakPanel: true, // the whole panel is in the weak language
      heading: "[WEAK: Zusammenfassung]",
      bullets: [
        "[WEAK: zweisprachige Stadt an der Sprachgrenze]",
        "[WEAK: Energie: Seewasser, Sonne, Wasserkraft]",
        "[WEAK: Verkehr: Standseilbahn, Trolleybus, Schiff]",
        "[WEAK: Ziel: klimaneutral bis 2050]",
      ],
      glossary: [
        { strong: "le résumé", weak: "die Zusammenfassung" },
        { strong: "l'objectif", weak: "das Ziel" },
      ],
    },
    notes: ["[WEAK: langsam sprechen]", "[WEAK: Energie und Verkehr noch einmal nennen]"],
  },
];

/* --------------------------------------------------------------------------
   Closing slides: one short personal stance each, then the sources
   -------------------------------------------------------------------------- */
const CLOSING = [
  {
    id: "stance",
    camera: { center: [7.17, 47.09], zoom: 10.6, pitch: 35, bearing: -40 },
    duration: 1200,
    layers: ["terrain"],
    markers: ["biel"],
    panel: {
      heading: "[STRONG: Notre avis]",
      bullets: [
        "[STRONG: Albert : à mon avis, … (une ou deux phrases)]",
        "[STRONG: Payam : à mon avis, … (une ou deux phrases)]",
      ],
      weakLanguage: ["[WEAK: Meiner Meinung nach …]"],
    },
    notes: ["[STRONG: chacun donne son avis, court]", "[STRONG: remercier, questions ?]"],
  },
  {
    id: "sources",
    camera: { center: [8.23, 46.8], zoom: 5.2, pitch: 0, bearing: 0 },
    duration: 1500,
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
   Sources slide: content sources first, then the map data.
   An entry is { text, links: [["shown name", "address"], ...] }.
   -------------------------------------------------------------------------- */
const SOURCES = [
  { text: "Ville de Bienne / Cité de l'énergie : fiche « Biel/Bienne », 14.12.2020 ; Stratégie climatique 2050, mai 2020.", links: [
    ["fiche", "https://www.biel-bienne.ch/public/upload/assets/12764/210113_Faktenblatt_Energiestadt_BielBienne_FR_Ansicht.pdf?fp=1"],
    ["stratégie", "https://www.biel-bienne.ch/public/upload/assets/10857/beu_umw_klimastrategie%202050_f.pdf?fp=2"]] },
  { text: "Energie Service Biel/Bienne (ESB) : Energieverbund Bielersee.", links: [["esb.ch", "https://www.esb.ch/de/energieverbund-bielersee"]] },
  { text: "Solar Agentur Schweiz : Prix solaire suisse 2017, Tissot Arena.", links: [["solaragentur.ch", "https://www.solaragentur.ch/files/solarpreis-gewinner/g-17-09-20_solarpreispublikation_2017_def_20-21_solareeissport-undfussballarenatissot.pdf"]] },
  { text: "BKW : Wasserkraftwerk Hagneck ; moneycab, 23.10.2015.", links: [
    ["bkw.ch", "https://bkw.ch/fileadmin/user_upload/03_Energie/03_05_Energieproduktion/Besucherzentren_PDF/Factsheet_Wasserkraftwerk_Hagneck_de.pdf"],
    ["moneycab.com", "https://www.moneycab.com/?p=1052571"]] },
  { text: "Funiculaires : horaires officiels 22.022 et 22.023 ; Wikipédia (années d'ouverture, trolleybus).", links: [
    ["Macolin", "https://www.tp-info.ch/sites/default/files/fap/2025/pdf/22.022.pdf"],
    ["Évilard", "https://oev-info.ch/sites/default/files/fap/2024/pdf/22.023.pdf"],
    ["trolleybus", "https://de.wikipedia.org/wiki/Trolleybus_Biel"]] },
  { text: "Bielersee-Schifffahrts-Gesellschaft (BSG) : réseau et MobiCat.", links: [
    ["bielersee.ch", "https://www.bielersee.ch/kursfahrten/streckennetz/bielersee"],
    ["MobiCat", "https://www.bielersee.ch/unternehmen/flotte/ems-mobicat"]] },
  { text: "CFF/SBB : énergie renouvelable (depuis 2025) ; tunnel de Gléresse/Ligerz : SRF, Plattform J (2023).", links: [
    ["sbb.ch", "https://company.sbb.ch/en/company/responsibility/sustainability/renewable-energy.html"],
    ["swissinfo.ch", "https://www.swissinfo.ch/eng/climate-change/sbb-trains-will-only-run-on-electricity-from-renewable-sources-from-2025/88603509"],
    ["srf.ch", "https://www.srf.ch/news/schweiz/neuer-bahntunnel-sbb-bohrt-sich-durch-die-jurasuedfusslinie-soll-schneller-werden"],
    ["plattformj.ch", "https://www.plattformj.ch/artikel/213576/"]] },
  { text: "Swatch Group : inauguration du siège, 3.10.2019.", links: [["swatchgroup.com", "https://www.swatchgroup.com/en/services/archive/2019/swatch-inaugurates-its-headquarters-biel"]] },
  { text: "Expo.02 : SRF, « 20 Jahre Expo.02 » ; AGGLOlac : cash.ch, 2021.", links: [
    ["srf.ch", "https://www.srf.ch/kultur/gesellschaft-religion/20-jahre-expo-02-wichtig-fuer-unsere-identitaet-oder-nur-teures-spektakel"],
    ["cash.ch", "https://www.cash.ch/news/politik/bieler-und-nidauer-stadtrat-versenken-grossprojekt-agglolac-465952"]] },
  { text: "Ville de Bienne : bilinguisme (chiffres au 31.12.2025).", links: [["biel-bienne.ch", "https://www.biel-bienne.ch/de/zweisprachigkeit.html/742"]] },
  { text: "DFAE : « Quatre langues, quatre cultures, mais un seul pays », 2020 ; OIF : La langue française dans le monde, 2026.", links: [
    ["eda.admin.ch", "https://www.eda.admin.ch/fr/quatre-langues-quatre-cultures-mais-un-seul-pays"],
    ["francophonie.org", "https://www.francophonie.org/sites/default/files/2026-04/Synthese_rapport_Langue_francaise_dans_le_monde_2026.pdf"]] },
  { text: "Cartes : OFS/BFS, régions linguistiques 2020 (état 1.1.2024) ; Natural Earth 5.1.2 ; lignes de transport et de train : OpenStreetMap (1.11.2026)." },
  {
    text: "Photos : Wikimedia Commons, auteurs et licences sous chaque photo.",
    links: [
      ["Tissot Arena", "https://commons.wikimedia.org/wiki/File:Solarkraftwerk_Tissot_Arena.jpg"],
      ["Hagneck", "https://commons.wikimedia.org/wiki/File:Neues_Wasserkraftwerk_Hagneck.jpg"],
      ["funiculaire", "https://commons.wikimedia.org/wiki/File:I09_386_Standseilbahn_Leubringen,_Wagen_1.jpg"],
      ["trolleybus", "https://commons.wikimedia.org/wiki/File:Trolleybus_des_TPB_Bienne.JPG"],
      ["MobiCat", "https://commons.wikimedia.org/wiki/File:MobiCat_Ligerz.jpg"],
      ["Swatch", "https://commons.wikimedia.org/wiki/File:Swatch-Bienne-10.jpg"],
      ["Expo.02", "https://commons.wikimedia.org/wiki/File:Tuerme_auf_der_Arteplage_Biel_der_Expo.02.jpg"],
      ["panneau de rue", "https://commons.wikimedia.org/wiki/File:2005-Biel-Quellgasse.jpg"],
    ],
  },
  {
    text: "Images satellite : Sentinel-2 cloudless, EOX (données Copernicus Sentinel 2016–2017, CC BY 4.0). Photos aériennes : © swisstopo. Relief : Terrain Tiles (Mapzen), AWS Open Data.",
    links: [["s2maps.eu", "https://s2maps.eu"]],
  },
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
    "lake-energy": "[STRONG: Centrale d'énergie du lac]",
    "tissot-arena": "Tissot Arena",
    "hagneck": "[STRONG: Centrale de Hagneck]",
    "magglingen": "Macolin / Magglingen",
    "evilard": "Évilard / Leubringen",
    "swatch": "Swatch / Omega",
    "lakeshore": "[STRONG: Rive du lac] / [WEAK: Seeufer]",
    "central-square": "Place Centrale / Zentralplatz",
  },

  slides: [...OPENING, ...MY_SLIDES, ...SUMMARY, ...PAYAM_SLIDES, ...CLOSING],
  sources: SOURCES,
};
