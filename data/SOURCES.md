# Data sources

Everything in `data/` except `points.geojson` is rebuilt by `scripts/fetch-data.sh`.
Raw downloads are kept in `data/raw/`, their checksums in `data/checksums.sha256`.

## Raw files

| File in `data/raw/` | Source URL | Version / date | Licence |
| --- | --- | --- | --- |
| `ne_50m_admin_0_countries.geojson` | https://raw.githubusercontent.com/nvkelso/natural-earth-vector/v5.1.2/geojson/ne_50m_admin_0_countries.geojson | Natural Earth 5.1.2, Admin 0 countries, 1:50m | Public domain. Credit: "Made with Natural Earth" (naturalearthdata.com) |
| `municipalities.shp` / `.dbf` / `.shx` | https://unpkg.com/swiss-maps@4.7.0/2024/municipalities.shp (and `.dbf`, `.shx`) | swiss-maps 4.7.0, municipality boundaries as of 1.1.2024 | Geometries: Swiss Federal Statistical Office (BFS/OFS), ThemaKart generalised boundaries. Open data, free use with source attribution ("Source: BFS/OFS, ThemaKart"). Packaging: swiss-maps by Interactive Things, BSD-3-Clause |
| `bfs_levels_2024-01-01.csv` | https://www.agvchapp.bfs.admin.ch/api/communes/levels?date=01-01-2024 | BFS/OFS "Raumgliederungen der Schweiz" (spatial typologies), state of 1.1.2024. Column `SPRGEB2020` = language regions 2020 (1 German, 2 French, 3 Italian, 4 Romansh) | Open data, free use with source attribution ("Source: BFS/OFS") |
| `osm_transport.json` | https://overpass-api.de/api/interpreter (query at the top of the transport block in `scripts/fetch-data.sh`) | OpenStreetMap as of 2026-11-01 (pinned with `[date:...]` in the query): all `railway=funicular` ways around Biel/Bienne, trolleybus route relations 1861122 (line 1), 12012146 (line 3), 2131075 (line 4) and boat route relation 18638227 (Biel/Bienne – Erlach). Only the `elements` of the answer are kept | © OpenStreetMap contributors, ODbL |

The BFS API URL is pinned by date, not by a release tag. If the office republishes
the table, the script warns that the checksum changed.

## Generated files

| File | Built from | What it is |
| --- | --- | --- |
| `francophone.geojson` | Natural Earth | Countries where French is an official language (code list at the top of `scripts/fetch-data.sh`). `both: true` marks countries that are also in the German list |
| `germanophone.geojson` | Natural Earth | Countries where German is an official language (DE, AT, CH, LI, LU, BE) |
| `world_land.geojson` | Natural Earth | Plain land outline, the backdrop when the imagery is unreachable |
| `world_borders.geojson` | Natural Earth | Country borders without coastlines, drawn over the satellite imagery |
| `ch_language_regions.geojson` | BFS municipalities + BFS language regions | Municipalities joined to `SPRGEB2020` and dissolved into four regions (`lang`: de, fr, it, rm) |
| `ch_language_border.geojson` | `ch_language_regions.geojson` | The line shared by the German and French regions |
| `transport.geojson` | `osm_transport.json`, with `scripts/osm-lines.mjs` | One line per funicular, trolleybus line and boat route (`mode`: funicular, trolleybus, boat), along which the vehicles on the map move. The vehicles are decoration: they do not follow the timetable |

## Hand-written

`points.geojson` is written by hand. Each feature has a `verified` property saying
where its coordinate comes from.

## Photos on the slides (`assets/photos/`)

Downloaded from Wikimedia Commons by `scripts/fetch-photos.sh`, scaled down to
at most 1280 pixels wide. The files are not committed (`.gitignore`). The author and licence are shown under each photo,
and the sources slide links to each file page.

| File | Commons file | Author | Licence |
| --- | --- | --- | --- |
| `tissot-arena.jpg` | [Solarkraftwerk Tissot Arena.jpg](https://commons.wikimedia.org/wiki/File:Solarkraftwerk_Tissot_Arena.jpg) | ESB BielBienne | CC BY-SA 4.0 |
| `hagneck.jpg` | [Neues Wasserkraftwerk Hagneck.jpg](https://commons.wikimedia.org/wiki/File:Neues_Wasserkraftwerk_Hagneck.jpg) | Arkelin | CC BY 4.0 |
| `funicular.jpg` | [I09 386 Standseilbahn Leubringen, Wagen 1.jpg](https://commons.wikimedia.org/wiki/File:I09_386_Standseilbahn_Leubringen,_Wagen_1.jpg) | Falk2 | CC BY-SA 4.0 |
| `trolleybus.jpg` | [Trolleybus des TPB Bienne.JPG](https://commons.wikimedia.org/wiki/File:Trolleybus_des_TPB_Bienne.JPG) | VincentdeMorteau | CC BY-SA 3.0 |
| `mobicat.jpg` | [MobiCat Ligerz.jpg](https://commons.wikimedia.org/wiki/File:MobiCat_Ligerz.jpg) | Bielersee Schifffahrtsgesellschaft (BSG) | CC BY-SA 3.0 |
| `swatch.jpg` | [Swatch-Bienne-10.jpg](https://commons.wikimedia.org/wiki/File:Swatch-Bienne-10.jpg) | MHM55 | CC BY-SA 4.0 |
| `expo02.jpg` | [Tuerme auf der Arteplage Biel der Expo.02.jpg](https://commons.wikimedia.org/wiki/File:Tuerme_auf_der_Arteplage_Biel_der_Expo.02.jpg) | WikiNik (September 2002) | CC BY-SA 3.0 |
| `street-sign.jpg` | [2005-Biel-Quellgasse.jpg](https://commons.wikimedia.org/wiki/File:2005-Biel-Quellgasse.jpg) | Roland Zumbuehl | CC BY-SA 4.0 |
