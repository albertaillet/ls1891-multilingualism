/* Presentation engine. All text and camera stops are in content.js. */
(() => {
  "use strict";

  const P = window.PRESENTATION;
  const slides = P.slides;
  const $ = (id) => document.getElementById(id);
  const FRESH = window.FRESH || ""; // cache-buster for local files, set in index.html

  // The basemap is satellite imagery only, from two keyless services: the
  // whole world from Sentinel-2 (about 10 m per pixel), and sharp aerial
  // photos of Switzerland that fade in on top of it when we get close.
  const SATELLITE = {
    type: "raster",
    tiles: ["https://tiles.maps.eox.at/wmts/1.0.0/s2cloudless_3857/default/g/{z}/{y}/{x}.jpg"],
    tileSize: 256,
    maxzoom: 13,
    attribution: '<a href="https://s2maps.eu" target="_blank" rel="noopener">Sentinel-2 cloudless</a> by EOX (modified Copernicus Sentinel data 2016–17)',
  };
  const AERIAL = {
    type: "raster",
    tiles: ["https://wmts.geo.admin.ch/1.0.0/ch.swisstopo.swissimage/default/current/3857/{z}/{x}/{y}.jpeg"],
    tileSize: 256,
    maxzoom: 19,
    bounds: [5.9, 45.8, 10.5, 47.85], // Switzerland; no requests outside it
    attribution: "Photos aériennes : © swisstopo",
  };
  const AERIAL_FROM = 11; // zoom at which the aerial photos start to fade in
  const ONLINE_STYLE = {
    version: 8,
    sources: { satellite: SATELLITE, aerial: AERIAL },
    layers: [
      { id: "background", type: "background", paint: { "background-color": "#0b1420" } },
      { id: "satellite", type: "raster", source: "satellite" },
      {
        id: "aerial", type: "raster", source: "aerial", minzoom: AERIAL_FROM,
        paint: { "raster-opacity": ["interpolate", ["linear"], ["zoom"], AERIAL_FROM, 0, AERIAL_FROM + 1, 1] },
      },
    ],
  };

  // Used when the imagery cannot be fetched: plain globe, local data only.
  const OFFLINE_STYLE = {
    version: 8,
    sources: {},
    layers: [{ id: "background", type: "background", paint: { "background-color": "#c9dcec" } }],
  };

  const COLORS = { fr: "#2f6fde", de: "#e8590c", it: "#2f9e44", rm: "#9c36b5" };
  const FADE = 500; // ms, layer fade in/out

  // Names usable in a slide's `layers` list, and the map layers each one fades:
  // [map layer id, opacity property, opacity when fully shown]
  const LAYER_PARTS = {
    francophone: [["fr-fill", "fill-opacity", 0.55], ["fr-line", "line-opacity", 0.9]],
    germanophone: [["de-fill", "fill-opacity", 0.55], ["de-hatch", "fill-opacity", 1], ["de-line", "line-opacity", 0.9]],
    "ch-regions": [["ch-fill", "fill-opacity", 0.5], ["ch-line", "line-opacity", 0.7]],
    "language-border": [["border-casing", "line-opacity", 0.9], ["border-line", "line-opacity", 1]],
    funiculars: [["tr-funicular-casing", "line-opacity", 0.9], ["tr-funicular", "line-opacity", 1]],
    trolleybuses: [["tr-trolleybus-casing", "line-opacity", 0.9], ["tr-trolleybus", "line-opacity", 1]],
    boat: [["tr-boat-casing", "line-opacity", 0.9], ["tr-boat", "line-opacity", 1]],
  };

  // Public transport lines (data/transport.geojson). A slide that shows one of
  // these layers also gets its moving vehicles: `count` of them per line, each
  // taking `seconds` from one end of the line to the other and back.
  const TRANSPORT = {
    funicular: { layer: "funiculars", color: "#d6336c", count: 2, seconds: 16 },
    trolleybus: { layer: "trolleybuses", color: "#7048e8", count: 4, seconds: 70 },
    boat: { layer: "boat", color: "#0b7285", count: 2, seconds: 60, dash: [2, 1.5] },
  };

  // Credit lines appear on the map only while their data is on screen. Natural
  // Earth is public domain, so it is credited on the sources slide only.
  const BFS_CREDIT = "Régions linguistiques : OFS/BFS";

  // Keyless elevation tiles (Mapzen Terrarium on AWS Open Data).
  const DEM = {
    type: "raster-dem",
    tiles: ["https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png"],
    encoding: "terrarium",
    tileSize: 256,
    maxzoom: 14,
    attribution: "Terrain: Mapzen / AWS Open Data",
  };
  const TERRAIN_EXAGGERATION = 1.3;

  let map;
  let terrainOn = false;
  const markers = {}; // point id -> HTML element
  let offline = false;
  let current = -1;
  let navToken = 0; // invalidates pending "arrived" callbacks when the slide changes
  let rotateRaf = 0;
  let ready = false; // the map has loaded and slides can be shown

  /* ---------- start-up ---------- */

  // The satellite style if one of its tiles can be fetched, otherwise null.
  async function fetchStyle() {
    // index.html?offline pretends there is no network, to rehearse that case.
    if (new URLSearchParams(location.search).has("offline")) return null;
    try {
      const tile = SATELLITE.tiles[0].replace("{z}", 0).replace("{x}", 0).replace("{y}", 0);
      const res = await fetch(tile, { signal: AbortSignal.timeout(6000) });
      if (res.ok) return JSON.parse(JSON.stringify(ONLINE_STYLE));
    } catch (e) { /* no network */ }
    return null;
  }

  async function init() {
    let style = await fetchStyle();
    if (!style) {
      offline = true;
      style = OFFLINE_STYLE;
    }
    style.projection = { type: "globe" };
    style.sky = {
      "sky-color": "#7db3e8",
      "horizon-color": "#e4f0fb",
      "fog-color": "#eef3f6",
      "sky-horizon-blend": 0.7,
      "horizon-fog-blend": 0.7,
      "fog-ground-blend": 0.75,
      // Blue halo around the globe, fading out as we approach the ground.
      "atmosphere-blend": ["interpolate", ["linear"], ["zoom"], 0, 1, 5, 1, 8, 0],
    };

    const styleCopy = JSON.parse(JSON.stringify(style));

    const start = slides[slideFromHash()].camera;
    map = new maplibregl.Map({
      container: "map",
      style,
      center: start.center,
      zoom: start.zoom,
      pitch: start.pitch,
      bearing: start.bearing,
      maxPitch: 75,
      attributionControl: false,
      fadeDuration: 300,
      keyboard: false, // the arrow keys change slides, they must not pan the map
    });
    map.addControl(new maplibregl.AttributionControl({
      compact: false,
    }), "bottom-left");
    map.on("error", onMapError);
    map.on("data", onMapData);
    if (offline) showOffline(true);
    map.on("load", () => {
      addDataLayers();
      if (!offline) addTerrain();
      addTransport();
      if (!offline) map.once("idle", () => startPreloader(styleCopy));
      addMarkers();
      ready = true;
      goTo(slideFromHash(), { instant: true });
    });
    // Any manual interaction stops the automatic rotation.
    for (const ev of ["mousedown", "touchstart", "wheel"]) map.on(ev, stopRotation);
    map.on("click", () => go(1));

    window.__map = map; // for debugging in the console
    window.__goTo = goTo;
  }

  /* ---------- "map offline" notice ---------- */

  function showOffline(on) {
    $("offline").textContent = plain(P.ui.offline);
    $("offline").hidden = !on;
  }

  // Several failed tile requests within a few seconds = the network is gone.
  let recentErrors = [];
  function onMapError() {
    const now = Date.now();
    recentErrors = recentErrors.filter((t) => now - t < 15000);
    recentErrors.push(now);
    if (recentErrors.length >= 4) showOffline(true);
  }

  // A basemap tile arrived again: the network is back.
  function onMapData(e) {
    if (offline || !e.tile || !e.sourceId) return;
    const source = map.getSource(e.sourceId);
    if (!source || source.type === "geojson") return;
    recentErrors = [];
    showOffline(false);
  }

  /* ---------- data layers ---------- */

  // Diagonal stripes for countries that are in both language groups.
  function hatchImage(color) {
    const size = 24;
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext("2d");
    ctx.strokeStyle = color;
    ctx.lineWidth = 6;
    for (const offset of [-size, 0, size]) {
      ctx.beginPath();
      ctx.moveTo(offset, size);
      ctx.lineTo(offset + size, 0);
      ctx.stroke();
    }
    return ctx.getImageData(0, 0, size, size);
  }

  function addDataLayers() {
    const below = undefined; // on top of the imagery
    const fade = { duration: FADE };

    const fill = (id, source, color, filter) => map.addLayer({
      id, type: "fill", source, ...(filter ? { filter } : {}),
      paint: { "fill-color": color, "fill-opacity": 0, "fill-opacity-transition": fade },
    }, below);
    const line = (id, source, color, width, extra = {}) => map.addLayer({
      id, type: "line", source,
      layout: { "line-join": "round", "line-cap": "round" },
      paint: { "line-color": color, "line-width": width, "line-opacity": 0, "line-opacity-transition": fade, ...extra },
    }, below);

    if (offline) {
      map.addSource("land", { type: "geojson", data: "data/world_land.geojson" + FRESH });
      map.addLayer({ id: "land", type: "fill", source: "land", paint: { "fill-color": "#f3f1ea" } });
    }

    map.addSource("francophone", { type: "geojson", data: "data/francophone.geojson" + FRESH });
    map.addSource("germanophone", { type: "geojson", data: "data/germanophone.geojson" + FRESH });
    map.addImage("hatch-de", hatchImage(COLORS.de), { pixelRatio: 2 });

    fill("fr-fill", "francophone", COLORS.fr);
    line("fr-line", "francophone", COLORS.fr, 1.2);
    // German-only countries get a plain fill; countries in both groups keep the
    // French blue underneath and get German-coloured stripes on top.
    fill("de-fill", "germanophone", COLORS.de, ["!", ["get", "both"]]);
    map.addLayer({
      id: "de-hatch", type: "fill", source: "germanophone", filter: ["get", "both"],
      paint: { "fill-pattern": "hatch-de", "fill-opacity": 0, "fill-opacity-transition": fade },
    }, below);
    line("de-line", "germanophone", COLORS.de, 1.2);

    // Country borders (Natural Earth), always on while we are far away. They
    // are too coarse for close views, so they fade out there.
    map.addSource("borders", { type: "geojson", data: "data/world_borders.geojson" + FRESH });
    map.addLayer({
      id: "borders", type: "line", source: "borders", maxzoom: 8.5,
      layout: { "line-join": "round", "line-cap": "round" },
      paint: {
        "line-color": "#ffffff",
        "line-width": ["interpolate", ["linear"], ["zoom"], 1, 0.6, 6, 1.4],
        "line-opacity": ["interpolate", ["linear"], ["zoom"], 7, 0.75, 8.5, 0],
      },
    });

    map.addSource("ch-regions", { type: "geojson", data: "data/ch_language_regions.geojson" + FRESH, attribution: BFS_CREDIT });
    map.addSource("ch-border", { type: "geojson", data: "data/ch_language_border.geojson" + FRESH, attribution: BFS_CREDIT });
    fill("ch-fill", "ch-regions", ["match", ["get", "lang"], "de", COLORS.de, "fr", COLORS.fr, "it", COLORS.it, COLORS.rm]);
    line("ch-line", "ch-regions", "#ffffff", 1);
    // The German/French border: white casing with a dashed dark line on top.
    line("border-casing", "ch-border", "#ffffff", ["interpolate", ["linear"], ["zoom"], 6, 4, 13, 9]);
    line("border-line", "ch-border", "#14202e", ["interpolate", ["linear"], ["zoom"], 6, 2, 13, 4], { "line-dasharray": [2, 2] });
  }

  // Elevation for the 3D terrain.
  function addTerrain(m = map) {
    m.addSource("dem", DEM);
  }

  /* ---------- public transport: lines and moving vehicles ---------- */

  const vehicles = []; // { mode, el, marker, line, lengths, total, offset }

  async function addTransport() {
    const data = await (await fetch("data/transport.geojson" + FRESH)).json();
    map.addSource("transport", { type: "geojson", data, attribution: "Lignes : © OpenStreetMap" });
    const below = undefined;
    for (const [mode, t] of Object.entries(TRANSPORT)) {
      const layer = (id, color, width, extra = {}) => map.addLayer({
        id, type: "line", source: "transport", filter: ["==", ["get", "mode"], mode],
        layout: { "line-join": "round", "line-cap": "round", visibility: "none" },
        paint: { "line-color": color, "line-width": width, "line-opacity": 0, "line-opacity-transition": { duration: FADE }, ...extra },
      }, below);
      layer(`tr-${mode}-casing`, "#ffffff", 7);
      layer(`tr-${mode}`, t.color, 4, t.dash ? { "line-dasharray": t.dash } : {});
    }
    for (const f of data.features) {
      const t = TRANSPORT[f.properties.mode];
      const line = f.geometry.coordinates;
      // Distance from the start of the line to each of its points.
      const lengths = [0];
      for (let i = 1; i < line.length; i++) {
        const dx = (line[i][0] - line[i - 1][0]) * Math.cos((line[i][1] * Math.PI) / 180);
        lengths.push(lengths[i - 1] + Math.hypot(dx, line[i][1] - line[i - 1][1]));
      }
      for (let n = 0; n < t.count; n++) {
        const el = document.createElement("div");
        el.className = `vehicle vehicle-${f.properties.mode}`;
        el.append(document.createElement("i"));
        const marker = new maplibregl.Marker({ element: el }).setLngLat(line[0]).addTo(map);
        vehicles.push({ mode: f.properties.mode, el, marker, line, lengths, total: lengths[lengths.length - 1], offset: (2 * n) / t.count });
      }
    }
    if (slides[current]) { applyLayers(slides[current]); showVehicles(slides[current]); }
  }

  // Where a vehicle is: `phase` runs 0 → 1 (there) → 2 (back again).
  function vehiclePosition(v, phase) {
    const along = (phase <= 1 ? phase : 2 - phase) * v.total;
    let i = 1;
    while (i < v.lengths.length - 1 && v.lengths[i] < along) i++;
    const t = (along - v.lengths[i - 1]) / (v.lengths[i] - v.lengths[i - 1] || 1);
    const a = v.line[i - 1];
    const b = v.line[i];
    return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
  }

  let vehicleRaf = 0;
  function showVehicles(slide) {
    const names = ((slide && slide.layers) || []).map((l) => (typeof l === "string" ? l : l.id));
    let any = false;
    for (const v of vehicles) {
      const on = names.includes(TRANSPORT[v.mode].layer);
      v.el.classList.toggle("shown", on);
      any = any || on;
    }
    cancelAnimationFrame(vehicleRaf);
    if (!any) return;
    const step = (now) => {
      for (const v of vehicles) {
        if (!v.el.classList.contains("shown")) continue;
        const phase = (now / 1000 / TRANSPORT[v.mode].seconds + v.offset) % 2;
        v.marker.setLngLat(vehiclePosition(v, phase));
      }
      vehicleRaf = requestAnimationFrame(step);
    };
    vehicleRaf = requestAnimationFrame(step);
  }

  /* ---------- preloading the next slides ---------- */

  // A second, invisible map of the same size sits behind the real one. While
  // you talk on a slide it visits the camera positions of the next two
  // slides, so exactly the tiles they need (imagery, elevation) are
  // already in the browser cache when the real camera flies there.
  const PRELOAD_AHEAD = 2;
  let preMap = null;
  let preToken = 0;

  function startPreloader(style) {
    preMap = new maplibregl.Map({
      container: "preload",
      style,
      interactive: false,
      attributionControl: false,
      pixelRatio: 0.5, // same tiles, a quarter of the drawing work
      maxPitch: 75,
      fadeDuration: 0,
    });
    preMap.on("error", () => {});
    preMap.once("load", () => {
      addTerrain(preMap);
      preloadAhead();
    });
  }

  async function preloadAhead() {
    if (!preMap || !preMap.loaded()) return;
    const token = ++preToken;
    for (let i = current + 1; i <= current + PRELOAD_AHEAD && i < slides.length; i++) {
      const slide = slides[i];
      preMap.setTerrain(wantsTerrain(slide) ? { source: "dem", exaggeration: TERRAIN_EXAGGERATION } : null);
      preMap.setProjection({ type: slide.projection || "globe" });
      preMap.jumpTo(fitCamera({ ...slide.camera, padding: cameraPadding(slide) }));
      // Wait until everything for this view is loaded (or give up after 10 s).
      await new Promise((resolve) => {
        const timer = setTimeout(resolve, 10000);
        preMap.once("idle", () => { clearTimeout(timer); resolve(); });
      });
      if (token !== preToken) return; // the slide changed meanwhile
    }
  }

  function setTerrain(on) {
    if (offline || on === terrainOn) return;
    terrainOn = on;
    map.setTerrain(on ? { source: "dem", exaggeration: TERRAIN_EXAGGERATION } : null);
  }

  // Labelled points from data/points.geojson; the label texts are in content.js.
  async function addMarkers() {
    const points = await (await fetch("data/points.geojson" + FRESH)).json();
    for (const f of points.features) {
      const text = (P.pointLabels || {})[f.properties.id];
      if (!text) continue;
      const el = document.createElement("div");
      el.className = "marker";
      const label = document.createElement("span");
      label.textContent = plain(text);
      el.append(label);
      markers[f.properties.id] = el;
      new maplibregl.Marker({ element: el, anchor: "bottom" }).setLngLat(f.geometry.coordinates).addTo(map);
    }
    showMarkers(slides[current]);
  }

  function showMarkers(slide) {
    const wanted = (slide && slide.markers) || [];
    for (const [id, el] of Object.entries(markers)) el.classList.toggle("shown", wanted.includes(id));
    showVehicles(slide);
  }

  // Fade every known layer to what this slide asks for. An entry is either a
  // name ("francophone") or { id: "francophone", opacity: 0.4 } to dim it.
  function applyLayers(slide) {
    const wanted = {};
    for (const entry of slide.layers || []) {
      if (typeof entry === "string") wanted[entry] = 1;
      else wanted[entry.id] = entry.opacity ?? 1;
    }
    // ("terrain" is also a valid name; it is handled in setTerrain.)
    for (const [name, parts] of Object.entries(LAYER_PARTS)) {
      for (const [layerId, prop, full] of parts) {
        if (!map.getLayer(layerId)) continue;
        const opacity = full * (wanted[name] || 0);
        if (opacity > 0) map.setLayoutProperty(layerId, "visibility", "visible");
        map.setPaintProperty(layerId, prop, opacity);
      }
    }
    refreshTerrainDuringFade(slide);
  }

  // With 3D terrain on, MapLibre draws the flat layers into cached textures
  // and does not redraw them while an opacity fades, which leaves stale
  // colour patches. So we redraw the textures on every frame of the fade and,
  // when it is over, switch fully faded layers off (which also redraws them).
  function refreshTerrainDuringFade(slide) {
    const token = navToken;
    const end = performance.now() + FADE + 150;
    const frame = (now) => {
      if (token !== navToken) return;
      const cache = map.terrain && map.terrain.tileManager;
      if (cache && cache.freeRtt) { cache.freeRtt(); map.triggerRepaint(); }
      if (now < end) { requestAnimationFrame(frame); return; }
      for (const parts of Object.values(LAYER_PARTS)) {
        for (const [layerId, prop] of parts) {
          if (map.getLayer(layerId) && map.getPaintProperty(layerId, prop) === 0) {
            map.setLayoutProperty(layerId, "visibility", "none");
          }
        }
      }
    };
    requestAnimationFrame(frame);
  }

  /* ---------- navigation ---------- */

  function slideFromHash() {
    const n = parseInt(location.hash.slice(1), 10);
    return Number.isFinite(n) ? Math.min(Math.max(n - 1, 0), slides.length - 1) : 0;
  }

  function go(delta) {
    goTo(Math.min(Math.max(current + delta, 0), slides.length - 1));
  }

  function goTo(index, { instant = false } = {}) {
    if (index === current || !ready) return;
    const from = slides[current];
    const slide = slides[index];
    const backwards = index < current;
    current = index;
    const token = ++navToken;
    stopRotation();

    $("counter").textContent = `${index + 1} / ${slides.length}`;
    renderNotes();
    history.replaceState(null, "", `#${index + 1}`);

    const cam = fitCamera({ ...slide.camera, padding: cameraPadding(slide) });
    // Going back replays the move we came by, so it takes the same time.
    const duration = instant ? 0 : backwards && from ? from.duration : slide.duration;

    // Switch between globe and flat map while the camera is close to the
    // ground, where the two look the same: before the flight if we start
    // close, otherwise after it.
    const projection = slide.projection || "globe";
    const switchNow = map.getZoom() >= 7 || cam.zoom < 7;
    if (switchNow) setProjection(projection);

    beforeMove(slide, duration);
    if (duration === 0) {
      map.jumpTo(cam);
      arrived(slide, token);
    } else {
      map.flyTo({ ...cam, duration, curve: 1.5, essential: true, easing: easeInOutCubic });
      map.once("moveend", () => arrived(slide, token));
    }
  }

  // camera.fit = [west, south, east, north]: centre on that box and pick the
  // zoom at which it fits in the screen area left free by the padding.
  function fitCamera(cam) {
    if (!cam.fit) return cam;
    const [west, south, east, north] = cam.fit;
    const mercY = (lat) => (180 / Math.PI) * Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 360));
    const freeW = window.innerWidth - cam.padding.left - cam.padding.right;
    const freeH = window.innerHeight - cam.padding.top - cam.padding.bottom;
    const zoomFor = (pixels, degrees) => Math.log2((pixels * 360) / (degrees * 512));
    const { fit, ...rest } = cam;
    return {
      ...rest,
      center: [(west + east) / 2, (south + north) / 2],
      zoom: Math.min(zoomFor(freeW, east - west), zoomFor(freeH, mercY(north) - mercY(south))),
    };
  }

  function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  // Later steps hook into these three.
  let currentProjection = "globe";
  function setProjection(type) {
    if (type === currentProjection) return;
    currentProjection = type;
    map.setProjection({ type });
  }

  function wantsTerrain(slide) { return (slide.layers || []).includes("terrain"); }

  // Keep the camera target in the part of the screen the panel leaves free.
  function cameraPadding(slide) {
    const layout = slide.panel ? slide.panel.layout || "side" : "none";
    const w = window.innerWidth;
    return {
      top: 0,
      bottom: 0,
      // a fitted box also keeps clear of the legend in the top-left corner
      left: layout === "title" ? w * 0.42 : slide.camera.fit && slide.legend ? w * 0.13 : 0,
      right: layout === "side" ? w * 0.36 : layout === "wide" ? w * 0.46 : 0,
    };
  }
  function beforeMove(slide, duration) {
    // Cross-fade the layers part-way into the flight.
    const token = navToken;
    setTimeout(() => { if (token === navToken) applyLayers(slide); }, duration * 0.35);
    showMarkers(null);
    $("panel").classList.add("hidden");
    $("legend").classList.add("hidden");
    $("photos").classList.add("hidden");
    // Terrain is switched on before the flight and off only after it, so the
    // switch always happens far away from the ground where it is invisible.
    if (wantsTerrain(slide)) setTerrain(true);
  }
  function arrived(slide, token) {
    if (token !== navToken) return;
    setProjection(slide.projection || "globe");
    if (!wantsTerrain(slide)) setTerrain(false);
    showMarkers(slide);
    renderPanel(slide);
    renderLegend(slide);
    renderPhotos(slide);
    startRotation(slide);
    preloadAhead();
  }

  /* ---------- panel, legend, notes ---------- */

  // "[STRONG: text]" / "[WEAK: text]" -> "text" (unless SHOW_PLACEHOLDER_MARKS).
  function plain(text) {
    if (P.SHOW_PLACEHOLDER_MARKS) return text;
    return String(text).replace(/\[(?:STRONG|WEAK):\s*([^\]]*)\]/g, "$1");
  }

  // Small DOM helper: el("p", "class", "text" or [children]).
  function el(tag, className, content) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (Array.isArray(content)) node.append(...content.filter(Boolean));
    else if (content != null) node.textContent = plain(content);
    return node;
  }

  const langTag = (code) => el("span", "lang-tag", code.toUpperCase());

  function renderPanel(slide) {
    const panel = $("panel");
    const p = slide.panel;
    panel.replaceChildren();
    if (!p) return;
    panel.className = `layout-${p.layout || "side"}${p.weakPanel ? " weak-panel" : ""}`;

    if (p.kicker) panel.append(el("p", "kicker", p.kicker));
    if (p.heading) {
      panel.append(el("h1", "", [p.weakPanel && langTag(P.WEAK_LANG), document.createTextNode(plain(p.heading))]));
    }
    if (p.subheading) panel.append(el("p", "subheading", p.subheading));
    if (p.statement) panel.append(el("p", "statement", p.statement));
    if (p.bullets) panel.append(el("ul", "bullets", p.bullets.map((b) => el("li", "", b))));
    if (p.diagram && DIAGRAMS[p.diagram.type]) {
      const figure = el("figure", "diagram");
      figure.innerHTML = DIAGRAMS[p.diagram.type](p.diagram.labels || {});
      panel.append(figure);
    }
    if (p.weakLanguage) {
      const lines = [].concat(p.weakLanguage);
      panel.append(el("div", "weak", [langTag(P.WEAK_LANG), el("div", "", lines.map((l) => el("p", "", l)))]));
    }
    // A source is a text, or { text, links: [["shown name", "https://..."]] }.
    if (p.showSources) {
      panel.append(el("ol", "sources", P.sources.map((src) => {
        const item = el("li", "", typeof src === "string" ? src : src.text);
        for (const [name, url] of src.links || []) {
          const a = el("a", "", name);
          a.href = url;
          a.target = "_blank";
          a.rel = "noopener";
          item.append(" ", a);
        }
        return item;
      })));
    }
    if (p.names) panel.append(el("p", "names", p.names));
    if (p.glossary && p.glossary.length) {
      panel.append(el("div", "glossary", [
        el("h2", "", P.ui.glossary),
        el("dl", "", p.glossary.flatMap((g) => [
          el("dt", "", [langTag(P.STRONG_LANG), document.createTextNode(plain(g.strong))]),
          el("dd", "", [langTag(P.WEAK_LANG), document.createTextNode(plain(g.weak))]),
        ])),
      ]));
    }
    panel.classList.remove("hidden");
  }

  // Photos sit in their own card on the map: panel.image is one photo or a
  // list of two, each { src, alt, caption }.
  function renderPhotos(slide) {
    const box = $("photos");
    const images = [].concat((slide.panel && slide.panel.image) || []);
    box.replaceChildren(...images.map((image) => {
      const img = el("img");
      img.src = image.src;
      img.alt = plain(image.alt || "");
      return el("figure", "", [img, image.caption && el("figcaption", "", image.caption)]);
    }));
    if (images.length) box.classList.remove("hidden");
  }

  function renderLegend(slide) {
    const legend = $("legend");
    legend.replaceChildren();
    if (!slide.legend) return;
    for (const item of slide.legend) {
      legend.append(el("div", "legend-row", [
        el("span", `swatch swatch-${item.swatch}`),
        el("span", "legend-strong", item.strong),
        item.weak && el("span", "legend-weak", item.weak),
      ]));
    }
    legend.classList.remove("hidden");
  }

  // Speaker notes (key N): cues for this slide and the title of the next one.
  function renderNotes() {
    const slide = slides[current];
    const next = slides[current + 1];
    $("notes").replaceChildren(
      el("h2", "", `${plain(P.ui.notes)} ${current + 1} / ${slides.length}`),
      el("ul", "", (slide.notes || []).map((n) => el("li", "", n))),
      next && el("p", "notes-next", `${plain(P.ui.nextSlide)} : ${plain((next.panel && next.panel.heading) || next.id)}`),
    );
  }

  function esc(text) {
    return plain(text || "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  }

  // Schematic drawings, by diagram.type. The labels come from content.js.
  const DIAGRAMS = {
    "lake-energy": (t) => `
      <svg viewBox="0 0 520 250" role="img" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <marker id="arrow-cold" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0 0 10 5 0 10z" fill="#1971c2"/></marker>
          <marker id="arrow-hot" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0 0 10 5 0 10z" fill="#e03131"/></marker>
        </defs>
        <!-- lake -->
        <path d="M6 168 q14 -9 28 0 t28 0 t28 0 t28 0 t28 0 v72 h-140z" fill="#a5d8ff" stroke="#1971c2" stroke-width="2"/>
        <text x="76" y="215" text-anchor="middle" class="d-label">${esc(t.lake)}</text>
        <!-- lake water to the station -->
        <path d="M100 170 V112 H196" fill="none" stroke="#1971c2" stroke-width="5" marker-end="url(#arrow-cold)"/>
        <text x="92" y="100" text-anchor="middle" class="d-flow" fill="#1971c2">${esc(t.intake)}</text>
        <!-- heat-pump station -->
        <rect x="204" y="70" width="120" height="84" rx="10" fill="#fff" stroke="#14202e" stroke-width="2.5"/>
        <path d="M250 104 a15 15 0 1 1 15 15" fill="none" stroke="#e03131" stroke-width="4" marker-end="url(#arrow-hot)"/>
        <path d="M279 120 a15 15 0 1 1 -15 -15" fill="none" stroke="#1971c2" stroke-width="4" marker-end="url(#arrow-cold)"/>
        <text x="264" y="58" text-anchor="middle" class="d-label">${esc(t.station)}</text>
        <!-- heat to the buildings -->
        <path d="M324 96 H388" fill="none" stroke="#e03131" stroke-width="5" marker-end="url(#arrow-hot)"/>
        <text x="356" y="84" text-anchor="middle" class="d-flow" fill="#e03131">${esc(t.heat)}</text>
        <!-- buildings -->
        <g fill="#fff" stroke="#14202e" stroke-width="2.5">
          <path d="M398 154 V92 l24 -20 24 20 V154z"/>
          <path d="M452 154 V64 h50 V154z"/>
        </g>
        <g fill="#ffd8a8"><rect x="413" y="104" width="16" height="16"/><rect x="462" y="78" width="12" height="14"/><rect x="482" y="78" width="12" height="14"/><rect x="462" y="106" width="12" height="14"/><rect x="482" y="106" width="12" height="14"/></g>
        <text x="450" y="178" text-anchor="middle" class="d-label">${esc(t.buildings)}</text>
        <!-- cooled water back to the lake -->
        <path d="M388 136 H330" fill="none" stroke="#1971c2" stroke-width="3" stroke-dasharray="7 5" marker-end="url(#arrow-cold)"/>
        <path d="M250 154 V200 H156" fill="none" stroke="#1971c2" stroke-width="3" stroke-dasharray="7 5" marker-end="url(#arrow-cold)"/>
        <text x="262" y="222" text-anchor="start" class="d-flow" fill="#1971c2">${esc(t.back)}</text>
      </svg>`,
  };

  /* ---------- slow rotation while a slide is shown ---------- */

  // slide.rotate is in degrees per second. World views spin the globe,
  // close-ups orbit around the camera target.
  function startRotation(slide) {
    if (!slide.rotate) return;
    const spinGlobe = slide.camera.zoom < 4;
    let last = performance.now();
    const step = (now) => {
      const dt = Math.min(now - last, 100) / 1000;
      last = now;
      if (spinGlobe) {
        const c = map.getCenter();
        map.setCenter([c.lng + slide.rotate * dt, c.lat]);
      } else {
        map.setBearing(map.getBearing() + slide.rotate * dt);
      }
      rotateRaf = requestAnimationFrame(step);
    };
    rotateRaf = requestAnimationFrame(step);
  }

  function stopRotation() {
    cancelAnimationFrame(rotateRaf);
    rotateRaf = 0;
  }

  /* ---------- keyboard and buttons ---------- */

  function toggleFullscreen() {
    if (document.fullscreenElement) document.exitFullscreen();
    else document.documentElement.requestFullscreen().catch(() => {});
  }

  // Listening in the capture phase on the document, so the keys work no matter
  // what was clicked last (map, panel or a button).
  document.addEventListener("keydown", (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    switch (e.key) {
      case "ArrowRight": case "ArrowDown": case " ": case "Spacebar": case "PageDown": case "Enter":
        go(1); break;
      case "ArrowLeft": case "ArrowUp": case "PageUp": case "Backspace":
        go(-1); break;
      case "Home": goTo(0); break;
      case "End": goTo(slides.length - 1); break;
      case "f": case "F": toggleFullscreen(); break;
      case "n": case "N": $("notes").hidden = !$("notes").hidden; break;
      default: return;
    }
    e.preventDefault();
    e.stopPropagation();
  }, true);
  // Space is released on a focused button: do not let that "click" it as well.
  document.addEventListener("keyup", (e) => { if (e.key === " ") e.preventDefault(); }, true);
  // Typing e.g. #7 in the address bar jumps to that slide.
  window.addEventListener("hashchange", () => goTo(slideFromHash()));
  // (blur, so that Space/Enter afterwards does not also "click" the button)
  $("prev").addEventListener("click", (e) => { e.currentTarget.blur(); go(-1); });
  $("next").addEventListener("click", (e) => { e.currentTarget.blur(); go(1); });

  init();
})();
