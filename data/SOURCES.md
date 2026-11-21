# Data sources

Everything in `data/` except `points.geojson` is rebuilt by `scripts/fetch-data.sh`.
Raw downloads are kept in `data/raw/`, their checksums in `data/checksums.sha256`.

## Raw files

| File in `data/raw/` | Source URL | Version / date | Licence |
| --- | --- | --- | --- |
| `ne_50m_admin_0_countries.geojson` | https://raw.githubusercontent.com/nvkelso/natural-earth-vector/v5.1.2/geojson/ne_50m_admin_0_countries.geojson | Natural Earth 5.1.2, Admin 0 countries, 1:50m | Public domain. Credit: "Made with Natural Earth" (naturalearthdata.com) |
| `municipalities.shp` / `.dbf` / `.shx` | https://unpkg.com/swiss-maps@4.7.0/2024/municipalities.shp (and `.dbf`, `.shx`) | swiss-maps 4.7.0, municipality boundaries as of 1.1.2024 | Geometries: Swiss Federal Statistical Office (BFS/OFS), ThemaKart generalised boundaries. Open data, free use with source attribution ("Source: BFS/OFS, ThemaKart"). Packaging: swiss-maps by Interactive Things, BSD-3-Clause |
| `bfs_levels_2024-01-01.csv` | https://www.agvchapp.bfs.admin.ch/api/communes/levels?date=01-01-2024 | BFS/OFS "Raumgliederungen der Schweiz" (spatial typologies), state of 1.1.2024. Column `SPRGEB2020` = language regions 2020 (1 German, 2 French, 3 Italian, 4 Romansh) | Open data, free use with source attribution ("Source: BFS/OFS") |

The BFS API URL is pinned by date, not by a release tag. If the office republishes
the table, the script warns that the checksum changed.

## Generated files

| File | Built from | What it is |
| --- | --- | --- |
| `francophone.geojson` | Natural Earth | Countries where French is an official language (code list at the top of `scripts/fetch-data.sh`). `both: true` marks countries that are also in the German list |
| `germanophone.geojson` | Natural Earth | Countries where German is an official language (DE, AT, CH, LI, LU, BE) |
| `world_land.geojson` | Natural Earth | Plain land outline, the backdrop when the basemap is unreachable |
| `ch_language_regions.geojson` | BFS municipalities + BFS language regions | Municipalities joined to `SPRGEB2020` and dissolved into four regions (`lang`: de, fr, it, rm) |
| `ch_language_border.geojson` | `ch_language_regions.geojson` | The line shared by the German and French regions |

## Hand-written

`points.geojson` is written by hand. Each feature has a `verified` property saying
where its coordinate comes from.
