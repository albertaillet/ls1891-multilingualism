#!/bin/sh
# Downloads the photos on the slides from Wikimedia Commons into assets/photos/,
# scaled down to at most 1280 pixels wide. Needs curl.
# Authors and licences: see data/SOURCES.md.
set -eu
cd "$(dirname "$0")/.."
mkdir -p assets/photos

# photo <local name> <file name on Commons, URL-encoded>
photo() {
  echo "fetch $1"
  curl -fL -sS --retry 5 --retry-delay 10 -A "map-presentation-fetch-data/1.0" \
    -o "assets/photos/$1" "https://commons.wikimedia.org/wiki/Special:FilePath/$2?width=1280"
  sleep 2
}

photo tissot-arena.jpg "Solarkraftwerk%20Tissot%20Arena.jpg"
photo hagneck.jpg "Neues%20Wasserkraftwerk%20Hagneck.jpg"
photo funicular.jpg "I09%20386%20Standseilbahn%20Leubringen%2C%20Wagen%201.jpg"
photo trolleybus.jpg "Trolleybus%20des%20TPB%20Bienne.JPG"
photo mobicat.jpg "MobiCat%20Ligerz.jpg"
photo swatch.jpg "Swatch-Bienne-10.jpg"
photo expo02.jpg "Tuerme%20auf%20der%20Arteplage%20Biel%20der%20Expo.02.jpg"
photo street-sign.jpg "2005-Biel-Quellgasse.jpg"
