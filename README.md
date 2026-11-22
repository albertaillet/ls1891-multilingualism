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
- **Your slides 6–11** (energy, transport) are the `MY_SLIDES` list, slide 12 is
  the German summary (`SUMMARY`) and **Payam's slides 13–15** are `PAYAM_SLIDES`.
  Reorder, delete or copy the blocks; the numbering and the navigation follow
  automatically.
- **The map** is satellite imagery only: Sentinel-2 for the whole world, and
  sharp swisstopo aerial photos that fade in over Switzerland from zoom 11.
  There are no roads, place names or building blocks. White country borders
  are drawn on top while the camera is far away (up to zoom 8.5).
- **Moving vehicles**: a slide with `"funiculars"`, `"trolleybuses"` or `"boat"`
  in `layers` shows those lines with vehicles moving along them. They are
  decoration and do not follow the timetable; their number and speed are set in
  `TRANSPORT` at the top of `app.js`.
- **Speaking cues** go in `notes` (shown only with `N`), not in `bullets`.
- **Glossary**: `glossary: [{ strong: "...", weak: "..." }]` per panel.
- **Weak-language keywords**: `weakLanguage: ["..."]` per panel; `weakPanel: true`
  marks a panel that is entirely in the weak language (the summary).
- **A photo**: put the file in `assets/photos/` and add
  `image: { src: "assets/photos/photo.jpg", alt: "...", caption: "..." }` to
  the panel (or a list of two). It appears in the text panel and shrinks if
  the panel would not fit on the screen. The photos now in use come from Wikimedia Commons;
  `scripts/fetch-photos.sh` downloads them again, and `data/SOURCES.md` lists
  their authors and licences.
- **Camera**: `camera: { center: [lng, lat], zoom, pitch, bearing }`, `duration` is
  the flight time in ms, `rotate` the slow rotation in degrees per second.
- **Labelled points** are in [`data/points.geojson`](data/points.geojson), their
  texts in `pointLabels`, and a slide shows them with `markers: ["id"]`.
- **Sources slide**: the `SOURCES` list, each entry with its clickable links.
  Content sources come first, then the map data.

Files: `index.html` (page), `content.js` (text and camera stops), `app.js`
(engine), `style.css` (looks), `data/` (map data), `assets/` (MapLibre).

## Without internet

If the basemap cannot be loaded, the page shows a red "map offline" notice and
falls back to a plain globe drawn from the local data; slides, panels, legend,
glossary and notes keep working. `index.html?offline` shows this mode on purpose.
After the network is back, reload the page. See [FALLBACK.md](FALLBACK.md) for
recording a backup video.

## External services used at run time (all keyless, checked 2026-11-22)

| What | URL | Attribution |
| --- | --- | --- |
| Satellite imagery of the world | `https://tiles.maps.eox.at/wmts/1.0.0/s2cloudless_3857/default/g/{z}/{y}/{x}.jpg` | Sentinel-2 cloudless 2016, s2maps.eu by EOX IT Services GmbH (contains modified Copernicus Sentinel data 2016 & 2017), CC BY 4.0 |
| Aerial photos of Switzerland (from zoom 11) | `https://wmts.geo.admin.ch/1.0.0/ch.swisstopo.swissimage/default/current/3857/{z}/{x}/{y}.jpeg` | © swisstopo (SWISSIMAGE, free use with source) |
| Elevation for 3D terrain | `https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png` | Terrain Tiles (Mapzen), AWS Open Data |

Committed to the repo:

| What | Version | Licence |
| --- | --- | --- |
| MapLibre GL JS (`assets/unpkg.com/maplibre-gl@5.24.1/`) | 5.24.1 | BSD-3-Clause |
| Natural Earth countries | 5.1.2 | public domain |
| BFS/OFS municipality boundaries and language regions | state of 1.1.2024 | open data, source attribution required |
| OpenStreetMap transport lines (funiculars, trolleybus, boat) | state of 1.11.2026 | ODbL, © OpenStreetMap contributors |

Details and URLs of the data: [data/SOURCES.md](data/SOURCES.md). The credit line
at the bottom left of the map always names the Sentinel-2 imagery, and adds
swisstopo, the terrain tiles, OpenStreetMap (transport lines) and BFS/OFS only
on slides that show that data. Natural Earth is public domain and is credited on the sources slide only.

## Rebuild from scratch

```bash
./scripts/fetch-deps.sh && ./scripts/fetch-data.sh && ./scripts/fetch-photos.sh
```

- `scripts/fetch-deps.sh` downloads the pinned MapLibre files into `assets/`.
- `scripts/fetch-photos.sh` downloads the slide photos into `assets/photos/`.
  They are not committed, so run it once after cloning.
- `scripts/fetch-data.sh` downloads the raw data into `data/raw/`, checks it
  against `data/checksums.sha256` (and warns if an upstream file changed), then
  rebuilds `data/*.geojson` with `npx mapshaper@0.8.6` and
  `scripts/osm-lines.mjs`. It needs Node.js.
- `data/points.geojson` is hand-written and not touched by the scripts.

Afterwards `git status` should show no changes.
