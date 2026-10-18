/* Visible map previews. Province geometry and city references are local;
 * OSM tiles are requested only for the current visible viewport, never prefetched.
 * A city reference must never become a shop location. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.StoreMap = api;
})(typeof window === 'object' ? window : globalThis, function () {
  'use strict';
  const W = 640, H = 360;
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const finite = (lat, lon) => Number.isFinite(lat) && Number.isFinite(lon) && Math.abs(lat) <= 85 && Math.abs(lon) <= 180;
  const PROVINCES = {
    yunnan: { zh: '云南', lat: 25.0, lon: 101.5 },
    guizhou: { zh: '贵州', lat: 26.8, lon: 106.7 },
    sichuan: { zh: '四川', lat: 30.7, lon: 103.5 },
    chongqing: { zh: '重庆', lat: 29.6, lon: 107.0 },
    tibet: { zh: '西藏', lat: 30.0, lon: 90.0 }
  };

  function describe(shop, options = {}) {
    const cities = options.cities || [], provinces = options.provinces || [];
    const city = cities.find(c => c.id === shop.city || c.zh === shop.city);
    const province = provinces.find(p => p.id === shop.province || p.zh === shop.province || p.id === city?.province);
    const provinceId = province?.id || city?.province || (PROVINCES[shop.province] ? shop.province : '');
    const fallback = PROVINCES[provinceId] || { zh: '西南', lat: 27, lon: 103 };
    const provinceName = province?.zh || fallback.zh;
    const validCity = city && !/other|border/.test(city.id) && finite(city.lat, city.lon);
    const loc = shop.location;
    const hasLocation = loc && finite(loc.wgs84_lat, loc.wgs84_lon);
    const kind = hasLocation ? (['poi', 'street', 'area'].includes(loc.precision) ? loc.precision : 'area') : validCity ? 'city' : 'province';
    const exact = kind === 'poi';
    return {
      kind, exact, provinceId, provinceName, city: validCity ? city : null,
      lat: hasLocation ? loc.wgs84_lat : validCity ? city.lat : fallback.lat,
      lon: hasLocation ? loc.wgs84_lon : validCity ? city.lon : fallback.lon,
      zoom: exact ? 16 : kind === 'street' ? 14 : kind === 'area' ? 12 : kind === 'city' ? 11 : 7,
      label: exact ? '店铺位置' : kind === 'street' ? '街区参考 · 未标记店址' : kind === 'area' ? '区域参考 · 未标记店址' : kind === 'city' ? `${city.zh} · 城市范围，未标记店址` : `${provinceName}省域 · 未标记店址`,
      note: hasLocation ? (exact ? '店铺位置来自已核实的点位资料。' : '先看附近街区，具体门店入口请结合地址，在高德或点评核对。') : validCity ? `先看${city.zh}在${provinceName}的位置；道路底图可用时显示城市概览。店铺位置仍待核实，请结合上方地址线索查找。` : `目前仅能确定${provinceName}范围；此处展示省域位置，不把资料中的“其他地方”当作具体城市。`
    };
  }

  function regionBounds(region) {
    if (!region?.d || !/^[MmLlHhVvZz\d\s.,+\-]+$/.test(region.d)) return null;
    const nums = region.d.match(/-?\d+(?:\.\d+)?/g)?.map(Number) || [];
    if (nums.length < 6 || nums.length % 2) return null;
    const xs = nums.filter((_, i) => !(i % 2)), ys = nums.filter((_, i) => i % 2);
    return [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)];
  }

  function localMap(view, options) {
    const map = options.map, region = map?.regions?.find(r => r.id === view.provinceId);
    const box = regionBounds(region), projection = map?.proj;
    let geometry = '', project;
    if (box && projection && [projection.lon0, projection.lat1, projection.k, projection.cos].every(Number.isFinite) && projection.k > 0 && projection.cos > 0) {
      const scale = Math.min(500 / Math.max(1, box[2] - box[0]), 230 / Math.max(1, box[3] - box[1]));
      const tx = 320 - (box[0] + box[2]) / 2 * scale, ty = 181 - (box[1] + box[3]) / 2 * scale;
      project = (lon, lat) => [tx + (lon - projection.lon0) * projection.k * projection.cos * scale, ty + (projection.lat1 - lat) * projection.k * scale];
      geometry = `<g transform="translate(${tx} ${ty}) scale(${scale})">${map.regions.map(r => `<path d="${esc(r.d)}" class="${r.id === view.provinceId ? 'atlas-map-region-selected' : 'atlas-map-region'}" vector-effect="non-scaling-stroke"/>`).join('')}</g>`;
    } else {
      // Geographic graticule when boundaries are missing: no invented roads or coastlines.
      project = (lon, lat) => [320 + (lon - view.lon) * 35, 180 - (lat - view.lat) * 35];
      for (let x = 40; x <= 600; x += 70) geometry += `<path d="M${x} 46V304" class="atlas-map-grid"/>`;
      for (let y = 75; y <= 285; y += 70) geometry += `<path d="M30 ${y}H610" class="atlas-map-grid"/>`;
      geometry += `<text x="28" y="62" class="atlas-map-small">城市方位示意 · 无道路底图</text>`;
    }
    const cities = (options.cities || []).filter(c => c.province === view.provinceId && !/other|border/.test(c.id) && finite(c.lat, c.lon));
    const peers = cities.filter(c => c.id !== view.city?.id).sort((a, b) => Math.hypot(a.lon - view.lon, a.lat - view.lat) - Math.hypot(b.lon - view.lon, b.lat - view.lat)).slice(0, 5);
    const occupied = [];
    if (view.city) {
      const [x, y] = project(view.city.lon, view.city.lat);
      occupied.push([x, y]);
      geometry += `<g data-city-marker><circle cx="${x}" cy="${y}" r="17" class="atlas-map-city-halo"/><circle cx="${x}" cy="${y}" r="5" class="atlas-map-city-dot"/><text x="${Math.max(92, Math.min(548, x))}" y="${Math.max(75, y - 25)}" text-anchor="middle" class="atlas-map-city-name">${esc(view.city.zh.replace(/（.*）/, ''))} · 城市参考</text></g>`;
    }
    for (const city of peers) {
      const [x, y] = project(city.lon, city.lat);
      if (x < 45 || x > 565 || y < 72 || y > 285 || occupied.some(([a, b]) => Math.hypot(a - x, b - y) < 65)) continue;
      occupied.push([x, y]);
      geometry += `<circle cx="${x}" cy="${y}" r="3" class="atlas-map-peer"/><text x="${x + 8}" y="${y + 4}" class="atlas-map-peer-label">${esc(city.zh.replace(/（.*）/, ''))}</text>`;
    }
    geometry += `<text x="26" y="329" class="atlas-map-province">${esc(view.provinceName)} · ${view.city ? '城市位置示意' : '省域位置示意'}</text><text x="610" y="32" text-anchor="end" class="atlas-map-small">北 ↑</text>`;
    return geometry;
  }

  function render(shop, options = {}) {
    const view = describe(shop, options);
    const localLabel = `${view.city ? view.city.zh + ' · 城市位置示意' : view.provinceName + ' · 省域位置示意'}，未标记店址`;
    const url = `https://www.openstreetmap.org/${view.exact ? `?mlat=${view.lat}&mlon=${view.lon}` : ''}#map=${view.zoom}/${view.lat}/${view.lon}`;
    return `<figure class="atlas-map-preview" data-store-map data-lat="${view.lat}" data-lon="${view.lon}" data-zoom="${view.zoom}" data-kind="${view.kind}" data-map-state="local" data-road-label="${esc(view.label)}" data-road-aria="${esc(shop.name)}：${esc(view.label)}">
      <div class="atlas-map-canvas"><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(shop.name)}：${esc(localLabel)}"><g data-local-map>${localMap(view, options)}</g><g data-road-map style="display:none"></g></svg><span class="atlas-map-label">${esc(localLabel)}</span></div>
      <figcaption><span data-map-status>位置示意已显示</span><a href="${esc(url)}" target="_blank" rel="noopener noreferrer">打开${view.exact ? '位置' : '范围'}地图 ↗</a></figcaption>
      <p class="atlas-map-explanation">${esc(view.note)}</p>
      <p class="atlas-map-attribution">道路底图：<a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">© OpenStreetMap 贡献者</a> · 本地图形取自本站省界与城市资料</p>
    </figure>`;
  }

  function tilePlan(lat, lon, zoom) {
    if (!finite(lat, lon) || !Number.isInteger(zoom) || zoom < 1 || zoom > 18) return [];
    const n = 2 ** zoom, r = lat * Math.PI / 180;
    const cx = (lon + 180) / 360 * n * 256, cy = (1 - Math.asinh(Math.tan(r)) / Math.PI) / 2 * n * 256;
    const startX = cx - W / 2, startY = cy - H / 2, tiles = [];
    for (let y = Math.floor(startY / 256); y <= Math.floor((startY + H - 1) / 256); y++) {
      for (let x = Math.floor(startX / 256); x <= Math.floor((startX + W - 1) / 256); x++) {
        if (y < 0 || y >= n) continue;
        tiles.push({ url: `https://tile.openstreetmap.org/${zoom}/${((x % n) + n) % n}/${y}.png`, left: x * 256 - startX, top: y * 256 - startY });
      }
    }
    return tiles;
  }

  function mount(container) {
    if (!container || typeof window === 'undefined') return () => {};
    const cleanups = [];
    const load = figure => {
      if (figure.dataset.mapRequested || !figure.isConnected) return;
      figure.dataset.mapRequested = 'true';
      const plan = tilePlan(Number(figure.dataset.lat), Number(figure.dataset.lon), Number(figure.dataset.zoom));
      if (!plan.length) return;
      let done = false, loaded = 0;
      const images = [], status = figure.querySelector('[data-map-status]');
      const finish = success => {
        if (done) return;
        done = true; window.clearTimeout(timer);
        for (const image of images) { image.onload = null; image.onerror = null; }
        if (!figure.isConnected) return;
        figure.dataset.mapState = success ? 'roads' : 'local';
        status.textContent = success ? '道路底图已显示' : '道路底图暂不可用，显示位置示意';
        if (!success) return;
        const ns = 'http://www.w3.org/2000/svg', roads = figure.querySelector('[data-road-map]');
        for (const tile of plan) {
          const image = document.createElementNS(ns, 'image');
          image.setAttribute('href', tile.url); image.setAttribute('x', tile.left); image.setAttribute('y', tile.top);
          // A subpixel overlap avoids hairline seams when the SVG is scaled on mobile.
          image.setAttribute('width', 256.5); image.setAttribute('height', 256.5); image.setAttribute('class', 'atlas-map-tile'); roads.append(image);
        }
        if (figure.dataset.kind === 'poi') {
          const pin = document.createElementNS(ns, 'circle');
          for (const [key, value] of Object.entries({ cx: 320, cy: 180, r: 9, fill: '#b63e27', stroke: '#fff', 'stroke-width': 3, 'data-shop-pin': '' })) pin.setAttribute(key, value);
          roads.append(pin);
        }
        // Range references intentionally have no central pin or radius claiming a verified boundary.
        roads.style.display = ''; figure.querySelector('[data-local-map]').style.display = 'none';
        figure.querySelector('.atlas-map-label').textContent = figure.dataset.roadLabel;
        figure.querySelector('svg').setAttribute('aria-label', figure.dataset.roadAria);
      };
      const timer = window.setTimeout(() => finish(false), 9000);
      cleanups.push(() => { done = true; window.clearTimeout(timer); for (const image of images) { image.onload = null; image.onerror = null; } });
      for (const tile of plan) {
        const image = new window.Image(); images.push(image);
        image.referrerPolicy = 'strict-origin-when-cross-origin';
        image.onload = () => { loaded++; if (loaded === plan.length) finish(true); };
        image.onerror = () => finish(false);
        image.src = tile.url;
      }
    };
    const figures = [...container.querySelectorAll('[data-store-map]')].filter(el => !el.dataset.mapRequested);
    if ('IntersectionObserver' in window) {
      const observer = new window.IntersectionObserver(entries => {
        for (const entry of entries) if (entry.isIntersecting) { observer.unobserve(entry.target); load(entry.target); }
      }, { threshold: 0.01 });
      figures.forEach(figure => observer.observe(figure)); cleanups.push(() => observer.disconnect());
    } else figures.forEach(figure => { const rect = figure.getBoundingClientRect(); if (rect.top < window.innerHeight && rect.bottom > 0) load(figure); });
    return () => cleanups.forEach(cleanup => cleanup());
  }

  return { describe, render, mount, tilePlan };
});
