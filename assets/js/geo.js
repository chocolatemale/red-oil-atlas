/* Interactive maps. Leaflet is loaded only when a map is on screen.
 * Base tiles: Amap first (Chinese labels, works inside China, GCJ-02 datum),
 * CARTO/OpenStreetMap as fallback (WGS-84). Province outlines from data/map.json
 * are drawn as a vector layer, so the map still reads if no tiles load at all. */
import { db } from './core.js';

let loading;
export function leaflet() {
  if (window.L) return Promise.resolve(window.L);
  return (loading ||= new Promise((resolve, reject) => {
    const css = document.createElement('link');
    css.rel = 'stylesheet'; css.href = 'assets/vendor/leaflet/leaflet.css';
    document.head.append(css);
    const js = document.createElement('script');
    js.src = 'assets/vendor/leaflet/leaflet.js';
    js.onload = () => resolve(window.L);
    js.onerror = () => { loading = null; reject(new Error('leaflet')); };
    document.head.append(js);
  }));
}

/* WGS-84 → GCJ-02 (the standard published transform used by Chinese map tiles). */
const A = 6378245.0, EE = 0.00669342162296594323, PI = Math.PI;
const outside = (lat, lon) => lon < 72.004 || lon > 137.8347 || lat < 0.8293 || lat > 55.8271;
function tLat(x, y) {
  let r = -100 + 2 * x + 3 * y + 0.2 * y * y + 0.1 * x * y + 0.2 * Math.sqrt(Math.abs(x));
  r += (20 * Math.sin(6 * x * PI) + 20 * Math.sin(2 * x * PI)) * 2 / 3;
  r += (20 * Math.sin(y * PI) + 40 * Math.sin(y / 3 * PI)) * 2 / 3;
  r += (160 * Math.sin(y / 12 * PI) + 320 * Math.sin(y * PI / 30)) * 2 / 3;
  return r;
}
function tLon(x, y) {
  let r = 300 + x + 2 * y + 0.1 * x * x + 0.1 * x * y + 0.1 * Math.sqrt(Math.abs(x));
  r += (20 * Math.sin(6 * x * PI) + 20 * Math.sin(2 * x * PI)) * 2 / 3;
  r += (20 * Math.sin(x * PI) + 40 * Math.sin(x / 3 * PI)) * 2 / 3;
  r += (150 * Math.sin(x / 12 * PI) + 300 * Math.sin(x / 30 * PI)) * 2 / 3;
  return r;
}
export function wgs2gcj(lat, lon) {
  if (outside(lat, lon)) return [lat, lon];
  let dLat = tLat(lon - 105, lat - 35), dLon = tLon(lon - 105, lat - 35);
  const rad = lat / 180 * PI;
  let m = Math.sin(rad); m = 1 - EE * m * m;
  const s = Math.sqrt(m);
  dLat = (dLat * 180) / ((A * (1 - EE)) / (m * s) * PI);
  dLon = (dLon * 180) / (A / s * Math.cos(rad) * PI);
  return [lat + dLat, lon + dLon];
}

const PROVIDERS = [
  {
    id: 'amap', gcj: true,
    url: 'https://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}',
    opts: { subdomains: '1234', maxZoom: 18, attribution: '底图 © 高德地图' }
  },
  {
    id: 'carto', gcj: false,
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    opts: { subdomains: 'abcd', maxZoom: 19, attribution: '底图 © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> 贡献者 © CARTO' }
  }
];
let preferred = 0; // remembered for the session once a provider fails

/* map.json paths are absolute M/L/Z in a simple equirectangular projection. */
function outlines(project) {
  const m = db.MAP;
  if (!m?.proj || !m.regions) return [];
  const { lon0, lat1, k, cos } = m.proj;
  return m.regions.map((r) => {
    const rings = [];
    let ring = [];
    for (const [, cmd, x, y] of r.d.matchAll(/([MLZ])\s*(?:(-?[\d.]+)[ ,](-?[\d.]+))?/g)) {
      if (cmd === 'M') { if (ring.length) rings.push(ring); ring = []; }
      if (cmd === 'Z') { if (ring.length) rings.push(ring); ring = []; continue; }
      const lon = Number(x) / (k * cos) + lon0, lat = lat1 - Number(y) / k;
      ring.push(project(lat, lon));
    }
    if (ring.length) rings.push(ring);
    return { id: r.id, rings };
  });
}

/**
 * makeMap(el, { interactive, zoomControl, draw(ctx) }) → controller
 * draw receives { L, map, layer, ll(lat, lon) } and is re-run if the base map
 * switches datum, so overlays always line up with the tiles underneath.
 */
export async function makeMap(el, opts = {}) {
  const L = await leaflet();
  const interactive = opts.interactive !== false;
  const map = L.map(el, {
    zoomControl: false, attributionControl: true, dragging: interactive, touchZoom: interactive,
    doubleClickZoom: interactive, scrollWheelZoom: interactive && opts.wheel !== false, boxZoom: false,
    keyboard: interactive, tap: false, zoomSnap: 0.5, minZoom: 4
  });
  map.attributionControl.setPrefix('');
  if (opts.zoomControl) L.control.zoom({ position: opts.zoomPosition || 'bottomright', zoomInTitle: '放大', zoomOutTitle: '缩小' }).addTo(map);
  const near = () => el.classList.toggle('zoom-near', map.getZoom() >= 12);
  map.on('zoomend', near);

  let p = preferred, tiles = null;
  const outlineLayer = L.layerGroup().addTo(map);
  const layer = L.layerGroup().addTo(map);
  const ll = (lat, lon) => (PROVIDERS[p]?.gcj ? wgs2gcj(lat, lon) : [lat, lon]);
  const ctl = { L, map, layer, ll, provider: () => PROVIDERS[p]?.id || 'none' };

  const drawAll = () => {
    outlineLayer.clearLayers(); layer.clearLayers();
    const hi = opts.highlight || ['guizhou', 'yunnan'];
    for (const o of outlines(ll)) {
      L.polygon(o.rings, {
        className: hi.includes(o.id) ? 'prov prov-on' : 'prov', interactive: false, smoothFactor: 1.5
      }).addTo(outlineLayer);
    }
    opts.draw?.(ctl);
  };

  const useProvider = (i) => {
    if (tiles) { map.removeLayer(tiles); tiles = null; }
    p = i; preferred = i;
    el.dataset.tiles = PROVIDERS[i]?.id || 'none';
    if (!PROVIDERS[i]) { drawAll(); opts.onTilesFailed?.(); return; }
    let ok = false, errors = 0;
    tiles = L.tileLayer(PROVIDERS[i].url, { ...PROVIDERS[i].opts, className: 'base-tiles', detectRetina: false });
    tiles.on('tileload', () => { ok = true; });
    tiles.on('tileerror', () => { if (!ok && ++errors >= 4) useProvider(i + 1); });
    tiles.addTo(map); tiles.bringToBack();
    drawAll();
  };

  ctl.fit = (points, maxZoom = 13, pad = {}) => {
    const pts = points.filter(Boolean).map(([a, b]) => L.latLng(ll(a, b)));
    if (!pts.length) return;
    const bounds = pts.length === 1 ? pts[0].toBounds(1200) : L.latLngBounds(pts);
    map.fitBounds(bounds, { paddingTopLeft: pad.tl || [36, 36], paddingBottomRight: pad.br || [36, 36], maxZoom });
  };
  ctl.destroy = () => map.remove();
  ctl.redraw = drawAll;
  // Leaflet needs a view before tiles; draw() sets the real one with fit().
  map.setView([26.5, 104], 6);
  useProvider(p);
  return ctl;
}
