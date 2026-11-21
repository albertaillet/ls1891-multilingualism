#!/bin/bash
# Downloads the pinned JS/CSS dependencies into assets/ (committed to the repo).
set -euo pipefail
cd "$(dirname "$0")/.."

fetch() {
  echo "fetch $1"
  mkdir -p "assets/$1"
  rmdir "assets/$1"
  curl -fL -o "assets/$1" "https://$1"
}

fetch "unpkg.com/maplibre-gl@5.24.1/dist/maplibre-gl.js"
fetch "unpkg.com/maplibre-gl@5.24.1/dist/maplibre-gl.css"
# add others here only if truly needed
