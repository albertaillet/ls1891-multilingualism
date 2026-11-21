/* All text and camera stops of the presentation live in this file. */

const BIEL = [7.2468, 47.1369];

window.PRESENTATION = {
  // Labels of the points in data/points.geojson.
  pointLabels: {
    "biel": "Biel / Bienne",
    "language-border": "[STRONG: frontière linguistique] / [WEAK: Sprachgrenze]",
  },

  slides: [
    { id: "title",       camera: { center: [10, 30],         zoom: 1.7,  pitch: 0,  bearing: 0 },   duration: 3000, rotate: 3,  layers: [] },
    { id: "francophone", camera: { center: [8, 20],          zoom: 2.4,  pitch: 0,  bearing: 0 },   duration: 4500, layers: ["francophone"] },
    { id: "fr-de",       camera: { center: [9, 49],          zoom: 4.3,  pitch: 0,  bearing: 0 },   duration: 4500, layers: ["francophone", "germanophone"] },
    { id: "switzerland", camera: { center: [8.23, 46.8],     zoom: 7.4,  pitch: 0,  bearing: 0 },   duration: 6000, layers: ["ch-regions", "language-border"] },
    { id: "biel",        camera: { center: BIEL,             zoom: 12.3, pitch: 50, bearing: -20 }, duration: 8000, layers: ["terrain", { id: "ch-regions", opacity: 0.35 }, "language-border"], markers: ["biel", "language-border"] },
    { id: "energiestadt", camera: { center: BIEL,            zoom: 13.4, pitch: 60, bearing: 20 },  duration: 4000, rotate: 2, layers: [] },
    { id: "lake",        camera: { center: [7.2365, 47.1300], zoom: 14.8, pitch: 62, bearing: 45 }, duration: 5000, rotate: 2, layers: [] },
    { id: "solar",       camera: { center: [7.2816, 47.1556], zoom: 16.1, pitch: 62, bearing: -30 }, duration: 6000, rotate: 3, layers: [] },
    { id: "hagneck",     camera: { center: [7.1768, 47.0600], zoom: 15.2, pitch: 65, bearing: 130 }, duration: 7000, rotate: 2, layers: [] },
    { id: "summary",     camera: { center: BIEL,             zoom: 11.6, pitch: 45, bearing: 0 },   duration: 6000, rotate: 1, layers: [] },
    { id: "stance",      camera: { center: [7.17, 47.09],    zoom: 10.6, pitch: 35, bearing: -40 }, duration: 4000, layers: [] },
    { id: "sources",     camera: { center: [8.23, 46.8],     zoom: 5.2,  pitch: 0,  bearing: 0 },   duration: 5000, layers: [] },
  ],
};
