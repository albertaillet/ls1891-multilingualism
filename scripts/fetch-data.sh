#!/bin/sh
# Rebuilds every generated file in data/ from pinned upstream sources.
# Needs curl, shasum, node and npx (Node.js). See data/SOURCES.md for licences.
set -eu
cd "$(dirname "$0")/.."

# Countries where French is an official language at national level
# (Natural Earth ADM0_A3 codes): France (incl. overseas departments), Belgium,
# Switzerland, Luxembourg, Monaco, Canada, Haiti, Benin, Burundi, Cameroon,
# Central African Rep., Chad, Comoros, Congo, DR Congo, Côte d'Ivoire, Djibouti,
# Equatorial Guinea, Gabon, Guinea, Madagascar, Rwanda, Senegal, Seychelles,
# Togo, Vanuatu.
# Left out on purpose: Mali (2023), Burkina Faso (2024) and Niger (2025) demoted
# French from official to working language.
FRANCOPHONE="FRA,BEL,CHE,LUX,MCO,CAN,HTI,BEN,BDI,CMR,CAF,TCD,COM,COG,COD,CIV,DJI,GNQ,GAB,GIN,MDG,RWA,SEN,SYC,TGO,VUT"

# Countries where German is an official language at national level:
# Germany, Austria, Switzerland, Liechtenstein, Luxembourg, Belgium.
GERMANOPHONE="DEU,AUT,CHE,LIE,LUX,BEL"

MAPSHAPER="npx -y mapshaper@0.8.6"

# Download one pinned file into data/raw/.
fetch() {
  echo "fetch $2"
  curl -fL -sS -o "data/raw/$1" "$2"
}

mkdir -p data/raw

# Natural Earth 1:50m countries, release v5.1.2
fetch ne_50m_admin_0_countries.geojson "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/v5.1.2/geojson/ne_50m_admin_0_countries.geojson"

# Swiss municipality boundaries as of 1.1.2024 (BFS/FSO ThemaKart generalised
# geometries, packaged by swiss-maps 4.7.0). Coordinates are LV95 (EPSG:2056).
fetch municipalities.shp "https://unpkg.com/swiss-maps@4.7.0/2024/municipalities.shp"
fetch municipalities.dbf "https://unpkg.com/swiss-maps@4.7.0/2024/municipalities.dbf"
fetch municipalities.shx "https://unpkg.com/swiss-maps@4.7.0/2024/municipalities.shx"

# BFS/FSO spatial typologies per municipality as of 1.1.2024. The column
# SPRGEB2020 is the language region: 1 German, 2 French, 3 Italian, 4 Romansh.
# (Three tiny areas that belong to no municipality have no entry and are dropped.)
fetch bfs_levels_2024-01-01.csv "https://www.agvchapp.bfs.admin.ch/api/communes/levels?date=01-01-2024"

# Funiculars, trolleybus lines 1, 3 and 4 and the Biel–Erlach boat route from
# OpenStreetMap, as they were on 2026-11-01 (the date in the query pins the
# data). Only the "elements" are kept, because the rest of the answer contains
# the time of the request.
OSM_QUERY='[out:json][timeout:90][date:"2026-11-01T00:00:00Z"];(way["railway"="funicular"](47.12,7.20,47.17,7.27);relation(id:1861122,12012146,2131075,18638227););out geom;'
echo "fetch OpenStreetMap transport lines (Overpass API)"
curl -fL -sS --retry 5 --retry-delay 20 -A "map-presentation-fetch-data/1.0" \
  -o data/raw/osm_transport.tmp --data-urlencode "data=$OSM_QUERY" https://overpass-api.de/api/interpreter
node -e '
  const fs = require("fs");
  const osm = JSON.parse(fs.readFileSync("data/raw/osm_transport.tmp", "utf8"));
  fs.writeFileSync("data/raw/osm_transport.json", JSON.stringify({ elements: osm.elements }) + "\n");
'
rm data/raw/osm_transport.tmp

# Compare the raw files with the recorded checksums (or record them the first time).
if [ -f data/checksums.sha256 ]; then
  shasum -a 256 -c data/checksums.sha256 || echo "WARNING: an upstream file changed since data/checksums.sha256 was written"
else
  shasum -a 256 data/raw/* > data/checksums.sha256
fi

echo "build data/francophone.geojson"
$MAPSHAPER data/raw/ne_50m_admin_0_countries.geojson \
  -simplify 35% keep-shapes \
  -filter "'$FRANCOPHONE'.split(',').includes(ADM0_A3)" \
  -each "iso = ADM0_A3, name = NAME, both = '$GERMANOPHONE'.split(',').includes(ADM0_A3)" \
  -filter-fields iso,name,both \
  -o precision=0.0001 data/francophone.geojson

echo "build data/germanophone.geojson"
$MAPSHAPER data/raw/ne_50m_admin_0_countries.geojson \
  -simplify 35% keep-shapes \
  -filter "'$GERMANOPHONE'.split(',').includes(ADM0_A3)" \
  -each "iso = ADM0_A3, name = NAME, both = '$FRANCOPHONE'.split(',').includes(ADM0_A3)" \
  -filter-fields iso,name,both \
  -o precision=0.0001 data/germanophone.geojson

# Plain land outline, used as the backdrop when the basemap cannot be loaded.
echo "build data/world_land.geojson"
$MAPSHAPER data/raw/ne_50m_admin_0_countries.geojson \
  -dissolve \
  -simplify 12% keep-shapes \
  -o precision=0.01 data/world_land.geojson

# Country borders (without the coastlines, which the imagery shows by itself).
echo "build data/world_borders.geojson"
$MAPSHAPER data/raw/ne_50m_admin_0_countries.geojson \
  -simplify 35% \
  -innerlines \
  -o precision=0.001 data/world_borders.geojson

echo "build data/ch_language_regions.geojson"
$MAPSHAPER data/raw/municipalities.shp \
  -proj wgs84 from=EPSG:2056 \
  -join data/raw/bfs_levels_2024-01-01.csv keys=id,BfsCode fields=SPRGEB2020 \
  -filter "SPRGEB2020 > 0" \
  -each "lang = ['de', 'fr', 'it', 'rm'][SPRGEB2020 - 1]" \
  -dissolve lang \
  -o precision=0.0001 data/ch_language_regions.geojson

# The German/French language border: the line shared by those two regions.
echo "build data/ch_language_border.geojson"
$MAPSHAPER data/ch_language_regions.geojson \
  -filter "lang == 'de' || lang == 'fr'" \
  -innerlines \
  -o precision=0.0001 data/ch_language_border.geojson

# One clean line per funicular, bus line and boat route (see the script).
echo "build data/transport.geojson"
node scripts/osm-lines.mjs data/raw/osm_transport.json data/transport.geojson

echo "done"
wc -c data/*.geojson
