// Turns the OpenStreetMap extract data/raw/osm_transport.json (Overpass
// "out geom" JSON) into data/transport.geojson: one clean line per funicular,
// trolleybus line, boat route and SBB main line, for the moving vehicles on
// the map.
// Usage: node scripts/osm-lines.mjs data/raw/osm_transport.json data/transport.geojson
import { readFileSync, writeFileSync } from "node:fs";

const [input, output] = process.argv.slice(2);
const osm = JSON.parse(readFileSync(input, "utf8"));

// OSM relation id -> what it is on our map.
const ROUTES = {
  1861122: { id: "bus-1", mode: "trolleybus", name: "1" },
  12012146: { id: "bus-3", mode: "trolleybus", name: "3" },
  2131075: { id: "bus-4", mode: "trolleybus", name: "4" },
  18638227: { id: "boat", mode: "boat", name: "Biel/Bienne – Erlach" },
};

const key = (p) => `${p.lon},${p.lat}`;
const metres = (a, b) => {
  const dx = (a.lon - b.lon) * 111320 * Math.cos((a.lat * Math.PI) / 180);
  const dy = (a.lat - b.lat) * 110540;
  return Math.hypot(dx, dy);
};

// The ways of a line as a graph of points; `connected` groups them.
function graphOf(ways) {
  const nodes = new Map(); // key -> { p, edges: [{ to, d }] }
  const node = (p) => {
    if (!nodes.has(key(p))) nodes.set(key(p), { p, edges: [] });
    return nodes.get(key(p));
  };
  for (const way of ways) {
    for (let i = 1; i < way.length; i++) {
      const a = node(way[i - 1]);
      const b = node(way[i]);
      const d = metres(a.p, b.p);
      a.edges.push({ to: b, d });
      b.edges.push({ to: a, d });
    }
  }
  return nodes;
}

// Shortest path through the graph from one point to another (Dijkstra).
function path(nodes, from, to) {
  const dist = new Map([[from, 0]]);
  const prev = new Map();
  const open = new Set([from]);
  while (open.size) {
    let best = null;
    for (const n of open) if (!best || dist.get(n) < dist.get(best)) best = n;
    open.delete(best);
    if (best === to) break;
    for (const { to: next, d } of best.edges) {
      const total = dist.get(best) + d;
      if (!dist.has(next) || total < dist.get(next)) {
        dist.set(next, total);
        prev.set(next, best);
        open.add(next);
      }
    }
  }
  if (!dist.has(to)) throw new Error("line has a gap");
  const line = [];
  for (let n = to; n; n = prev.get(n)) line.unshift(n.p);
  return line;
}

const round = (n) => Math.round(n * 1e5) / 1e5;
const feature = (properties, line) => ({
  type: "Feature",
  properties,
  geometry: { type: "LineString", coordinates: line.map((p) => [round(p.lon), round(p.lat)]) },
});

const features = [];

// Funiculars: all funicular ways, grouped into connected lines. Each line
// runs between its two end points that are farthest apart (this skips one
// side of the passing loop in the middle).
const funicularWays = osm.elements
  .filter((e) => e.type === "way" && e.tags && e.tags.railway === "funicular")
  .map((e) => e.geometry);
const all = graphOf(funicularWays);
const seen = new Set();
const funiculars = [];
for (const start of all.values()) {
  if (seen.has(start)) continue;
  const group = [];
  const todo = [start];
  seen.add(start);
  while (todo.length) {
    const n = todo.pop();
    group.push(n);
    for (const { to } of n.edges) if (!seen.has(to)) { seen.add(to); todo.push(to); }
  }
  const ends = group.filter((n) => n.edges.length === 1);
  let pair = null;
  for (const a of ends) for (const b of ends) {
    if (!pair || metres(a.p, b.p) > metres(pair[0].p, pair[1].p)) pair = [a, b];
  }
  if (pair && metres(pair[0].p, pair[1].p) > 300) funiculars.push(path(all, pair[0], pair[1]));
}
// Two lines leave Biel/Bienne: the western one climbs to Magglingen/Macolin,
// the eastern one to Leubringen/Evilard.
funiculars.sort((a, b) => Math.min(...a.map((p) => p.lon)) - Math.min(...b.map((p) => p.lon)));
if (funiculars.length !== 2) throw new Error(`expected 2 funiculars, found ${funiculars.length}`);
features.push(feature({ id: "funi-magglingen", mode: "funicular", name: "Magglingen/Macolin" }, funiculars[0]));
features.push(feature({ id: "funi-evilard", mode: "funicular", name: "Leubringen/Evilard" }, funiculars[1]));

// Bus and boat routes: follow the member ways from the first to the last.
for (const rel of osm.elements.filter((e) => e.type === "relation" && ROUTES[e.id])) {
  const ways = rel.members.filter((m) => m.type === "way" && m.geometry && m.role === "").map((m) => m.geometry);
  const nodes = graphOf(ways);
  // The start is the end of the first way that the second way does not touch.
  const outerEnd = (way, neighbour) => {
    const touching = new Set(neighbour.map(key));
    const end = touching.has(key(way[0])) ? way[way.length - 1] : way[0];
    return nodes.get(key(end));
  };
  const from = outerEnd(ways[0], ways[1]);
  const to = outerEnd(ways[ways.length - 1], ways[ways.length - 2]);
  features.push(feature(ROUTES[rel.id], path(nodes, from, to)));
}

// SBB lines around Biel/Bienne: the tracks as a graph, and the shortest way
// through it between two places. The Jura foot line uses main-line tracks
// only; the line to Bern is tagged as a branch line in OpenStreetMap.
function railLine(usages, from, to) {
  const ways = osm.elements
    .filter((e) => e.type === "way" && e.tags && e.tags.railway === "rail" && usages.includes(e.tags.usage))
    .map((e) => e.geometry);
  const nodes = graphOf(ways);
  const nearest = ([lon, lat]) => [...nodes.values()].reduce((a, b) => (metres(b.p, { lon, lat }) < metres(a.p, { lon, lat }) ? b : a));
  return path(nodes, nearest(from), nearest(to));
}
const STATION = [7.2428, 47.1329]; // Biel/Bienne station
const jura = [
  ...railLine(["main"], [7.0, 47.04], STATION), // from Neuchâtel and Geneva
  ...railLine(["main"], STATION, [7.5, 47.2]).slice(1), // on to Olten and Zurich
];
features.push(feature({ id: "rail-jura", mode: "train", name: "Jurasüdfuss" }, jura));
features.push(feature({ id: "rail-bern", mode: "train", name: "Biel/Bienne – Bern" }, railLine(["main", "branch"], STATION, [7.38, 47.02])));

writeFileSync(output, JSON.stringify({ type: "FeatureCollection", features }) + "\n");
for (const f of features) console.log(`  ${f.properties.id}: ${f.geometry.coordinates.length} points`);
