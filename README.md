# Biel/Bienne – map presentation

An interactive, map-based slide show about Biel/Bienne (bilingual city, "Cité de
l'énergie / Energiestadt"). One page, plain JavaScript, no build step.

## Run it

Start a static server in this folder and open the address in Chrome, Edge or Firefox:

```bash
python3 -m http.server 8000
```

Then open <http://localhost:8000>. (`npx serve` works just as well.) Opening
`index.html` directly from the file system does not work, because the browser
blocks loading the data files that way.

Internet is needed for the map tiles and the terrain. Everything else is in the repo.

While a slide is shown, an invisible second map loads the tiles of the next two
slides in the background, so pause a few seconds on a slide before moving on and
the next flight arrives without blank tiles.

## Controls

| Key | Action |
| --- | --- |
| `→` `↓` `Space` `PageDown` `Enter`, or a click on the map | next slide |
| `←` `↑` `PageUp` `Backspace` | previous slide |
| `Home` / `End` | first / last slide |
| `N` | speaker notes on/off |
| `F` | fullscreen on/off |

The `‹ ›` buttons bottom left do the same. `index.html#7` opens slide 7 directly.
Dragging or scrolling the map stops the automatic rotation of the current slide.

## Edit the content

Everything you say or show is in [`content.js`](content.js); the top of that file
describes the fields of a slide.

- **Languages**: `STRONG_LANG` and `WEAK_LANG` at the top set the small language tags.
- **Drafted text** is wrapped as `"[STRONG: ...]"` or `"[WEAK: ...]"`. On screen
  only the inner text is shown. Rewrite the text; keeping or deleting the wrapper
  is up to you. Set `SHOW_PLACEHOLDER_MARKS = true` to see the wrappers on screen.
- **Your slides 6–9** are the `MY_SLIDES` list. Reorder, delete or copy the blocks;
  the numbering and the navigation follow automatically.
- **Speaking cues** go in `notes` (shown only with `N`), not in `bullets`.
- **Glossary**: `glossary: [{ strong: "...", weak: "..." }]` per panel.
- **Weak-language keywords**: `weakLanguage: ["..."]` per panel; `weakPanel: true`
  marks a panel that is entirely in the weak language (the summary).
- **An image**: put the file in the repo (e.g. `img/photo.jpg`) and add
  `image: { src: "img/photo.jpg", alt: "...", caption: "..." }` to the panel.
- **Camera**: `camera: { center: [lng, lat], zoom, pitch, bearing }`, `duration` is
  the flight time in ms, `rotate` the slow rotation in degrees per second.
- **Labelled points** are in [`data/points.geojson`](data/points.geojson), their
  texts in `pointLabels`, and a slide shows them with `markers: ["id"]`.
- **Sources slide**: the `SOURCES` list. Content sources come first, then the map
  data; the full links are at the end of `SCRIPT.md`.

Files: `index.html` (page), `content.js` (text and camera stops), `app.js`
(engine), `style.css` (looks), `data/` (map data), `assets/` (MapLibre).

## Without internet

If the basemap cannot be loaded, the page shows a red "map offline" notice and
falls back to a plain globe drawn from the local data; slides, panels, legend,
glossary and notes keep working. `index.html?offline` shows this mode on purpose.
After the network is back, reload the page. See [FALLBACK.md](FALLBACK.md) for
recording a backup video.

## External services used at run time (all keyless, checked 2026-11-21)

| What | URL | Attribution |
| --- | --- | --- |
| Basemap style and vector tiles | `https://tiles.openfreemap.org/styles/liberty` (fallback: `.../styles/positron`) | OpenFreeMap, © OpenMapTiles, data from OpenStreetMap (ODbL) |
| Elevation for 3D terrain and hillshade | `https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png` | Terrain Tiles (Mapzen), AWS Open Data |

Committed to the repo:

| What | Version | Licence |
| --- | --- | --- |
| MapLibre GL JS (`assets/unpkg.com/maplibre-gl@5.24.1/`) | 5.24.1 | BSD-3-Clause |
| Natural Earth countries | 5.1.2 | public domain |
| BFS/OFS municipality boundaries and language regions | state of 1.1.2024 | open data, source attribution required |

Details and URLs of the data: [data/SOURCES.md](data/SOURCES.md). The credit line
at the bottom left of the map always names OpenFreeMap, OpenMapTiles and
OpenStreetMap, and adds the terrain tiles and BFS/OFS only on slides that show
that data. Natural Earth is public domain and is credited on the sources slide only.

## Rebuild from scratch

```bash
./scripts/fetch-deps.sh && ./scripts/fetch-data.sh
```

- `scripts/fetch-deps.sh` downloads the pinned MapLibre files into `assets/`.
- `scripts/fetch-data.sh` downloads the raw data into `data/raw/`, checks it
  against `data/checksums.sha256` (and warns if an upstream file changed), then
  rebuilds `data/*.geojson` with `npx mapshaper@0.8.6`. It needs Node.js.
- `data/points.geojson` is hand-written and not touched by the scripts.

Afterwards `git status` should show no changes.
