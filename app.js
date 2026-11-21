/* Presentation engine. All text and camera stops are in content.js. */
(() => {
  "use strict";

  const P = window.PRESENTATION;
  const slides = P.slides;
  const $ = (id) => document.getElementById(id);

  // Keyless basemap styles, tried in order.
  const STYLE_URLS = [
    "https://tiles.openfreemap.org/styles/liberty",
    "https://tiles.openfreemap.org/styles/positron",
  ];

  // Used when no basemap can be fetched: plain globe, local data only.
  const OFFLINE_STYLE = {
    version: 8,
    sources: {},
    layers: [{ id: "background", type: "background", paint: { "background-color": "#c9dcec" } }],
  };

  const COLORS = { fr: "#2f6fde", de: "#e8590c", it: "#2f9e44", rm: "#9c36b5" };
  const FADE = 1500; // ms, layer fade in/out

  // Names usable in a slide's `layers` list, and the map layers each one fades:
  // [map layer id, opacity property, opacity when fully shown]
  const LAYER_PARTS = {
    francophone: [["fr-fill", "fill-opacity", 0.55], ["fr-line", "line-opacity", 0.9]],
    germanophone: [["de-fill", "fill-opacity", 0.55], ["de-hatch", "fill-opacity", 1], ["de-line", "line-opacity", 0.9]],
  };

  let map;
  let offline = false;
  let current = -1;
  let navToken = 0; // invalidates pending "arrived" callbacks when the slide changes
  let rotateRaf = 0;

  /* ---------- start-up ---------- */

  async function fetchStyle() {
    for (const url of STYLE_URLS) {
      try {
        const res = await fetch(url, { signal: AbortSignal.timeout(6000) });
        if (res.ok) return await res.json();
      } catch (e) { /* try the next one */ }
    }
    return null;
  }

  async function init() {
    let style = await fetchStyle();
    if (!style) {
      offline = true;
      style = OFFLINE_STYLE;
    }
    style.projection = { type: "globe" };

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
    });
    map.on("error", onMapError);
    map.on("load", () => {
      addDataLayers();
      goTo(slideFromHash(), { instant: true });
    });
    // Any manual interaction stops the automatic rotation.
    for (const ev of ["mousedown", "touchstart", "wheel"]) map.on(ev, stopRotation);
    map.on("click", () => go(1));

    window.__map = map; // for debugging in the console
  }

  function onMapError() { /* tile errors are handled in the offline notice (see below) */ }

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
    // Our fills go below the basemap labels so that place names stay readable.
    const firstLabel = map.getStyle().layers.find((l) => l.type === "symbol");
    const below = firstLabel ? firstLabel.id : undefined;
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
      map.addSource("land", { type: "geojson", data: "data/world_land.geojson" });
      map.addLayer({ id: "land", type: "fill", source: "land", paint: { "fill-color": "#f3f1ea" } });
    }

    map.addSource("francophone", { type: "geojson", data: "data/francophone.geojson" });
    map.addSource("germanophone", { type: "geojson", data: "data/germanophone.geojson" });
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
  }

  // Fade every known layer to what this slide asks for. An entry is either a
  // name ("francophone") or { id: "francophone", opacity: 0.4 } to dim it.
  function applyLayers(slide) {
    const wanted = {};
    for (const entry of slide.layers || []) {
      if (typeof entry === "string") wanted[entry] = 1;
      else wanted[entry.id] = entry.opacity ?? 1;
    }
    for (const [name, parts] of Object.entries(LAYER_PARTS)) {
      for (const [layerId, prop, full] of parts) {
        if (map.getLayer(layerId)) map.setPaintProperty(layerId, prop, full * (wanted[name] || 0));
      }
    }
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
    if (index === current || !map) return;
    const from = slides[current];
    const slide = slides[index];
    const backwards = index < current;
    current = index;
    const token = ++navToken;
    stopRotation();

    $("counter").textContent = `${index + 1} / ${slides.length}`;
    history.replaceState(null, "", `#${index + 1}`);

    const cam = { ...slide.camera, padding: cameraPadding(slide) };
    // Going back replays the move we came by, so it takes the same time.
    const duration = instant ? 0 : backwards && from ? from.duration : slide.duration;

    beforeMove(slide, duration);
    if (duration === 0) {
      map.jumpTo(cam);
      arrived(slide, token);
    } else {
      map.flyTo({ ...cam, duration, curve: 1.5, essential: true, easing: easeInOutCubic });
      map.once("moveend", () => arrived(slide, token));
    }
  }

  function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  // Later steps hook into these three.
  function cameraPadding() { return { top: 0, bottom: 0, left: 0, right: 0 }; }
  function beforeMove(slide, duration) {
    // Cross-fade the layers part-way into the flight.
    const token = navToken;
    setTimeout(() => { if (token === navToken) applyLayers(slide); }, duration * 0.35);
  }
  function arrived(slide, token) {
    if (token !== navToken) return;
    startRotation(slide);
  }

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

  window.addEventListener("keydown", (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    switch (e.key) {
      case "ArrowRight": case "ArrowDown": case " ": case "PageDown": case "Enter":
        go(1); break;
      case "ArrowLeft": case "ArrowUp": case "PageUp": case "Backspace":
        go(-1); break;
      case "Home": goTo(0); break;
      case "End": goTo(slides.length - 1); break;
      case "f": case "F": toggleFullscreen(); break;
      default: return;
    }
    e.preventDefault();
  });
  // Typing e.g. #7 in the address bar jumps to that slide.
  window.addEventListener("hashchange", () => goTo(slideFromHash()));
  $("prev").addEventListener("click", () => go(-1));
  $("next").addEventListener("click", () => go(1));

  init();
})();
