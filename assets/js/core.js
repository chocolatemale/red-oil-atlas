/* Red Oil Atlas · shared data, indexes and small HTML helpers. */
export const FX = 0.19; // CAD per CNY, approximate
// Data lives next to the page on GitHub Pages and locally; previews hosted elsewhere read the published copy.
export const DATA_BASE = /github\.io$|^localhost$|^127\.0\.0\.1$/.test(location.hostname) ? '' : 'https://chocolatemale.github.io/red-oil-atlas/';
export const PROV_ORDER = ['guizhou', 'yunnan', 'sichuan', 'chongqing', 'tibet'];
export const CATS = {
  breakfast: '早餐', noodles: '粉面', hotpot: '火锅', bbq: '烧烤', skewers: '串串', fish: '鱼',
  mushroom: '菌子', snack: '小吃', rice: '饭菜', soup: '汤', other: '其他'
};
export const STATUS = {
  corroborated: { mark: '●', label: '地址有交叉资料', short: '已交叉核对', rank: 0 },
  comment_only: { mark: '◐', label: '地址来自评论，待复核', short: '来自评论', rank: 1 },
  unresolved: { mark: '○', label: '店址还没锁定', short: '还没锁定', rank: 2 }
};

export const db = { D: null, MAP: null, video: {}, city: {}, dish: {}, prov: {}, shop: {}, shopsByCity: {}, shopsByDish: {}, bili: {} };

export async function load() {
  const [D, MAP] = await Promise.all([
    fetch(DATA_BASE + 'data/site.json?v=2026-10-19').then((r) => { if (!r.ok) throw new Error('site.json ' + r.status); return r.json(); }),
    fetch(DATA_BASE + 'data/map.json').then((r) => (r.ok ? r.json() : null)).catch(() => null)
  ]);
  db.D = D; db.MAP = MAP;
  D.videos.forEach((v) => (db.video[v.id] = v));
  D.provinces.forEach((p) => (db.prov[p.id] = p));
  D.dishes.forEach((d) => (db.dish[d.id] = d));
  D.cities.forEach((c) => (db.city[c.id] = c));
  (D.bilibili || []).forEach((b) => (db.bili[b.bvid] = b));
  for (const s of D.shops || []) {
    s.city = cityKey(s.city); s.province = provKey(s.province);
    db.shop[s.id] = s;
    (db.shopsByCity[s.city] ||= []).push(s);
    for (const id of s.dish_ids || []) (db.shopsByDish[id] ||= []).push(s);
  }
  Object.values(db.shopsByCity).forEach(sortShops);
  return db;
}

export const shops = () => db.D.shops || [];
export const provKey = (v) => db.D.provinces.find((p) => p.id === v || p.zh === v)?.id || v;
export const cityKey = (v) => db.D.cities.find((c) => c.id === v || c.zh === v)?.id || v;
export const isPseudoCity = (id) => /other|border/.test(id || '');
export const cityName = (id) => db.city[id]?.zh || id || '城市待核实';
export const cityShort = (id) => cityName(id).replace(/（.*）$/, '');
export const provName = (id) => db.prov[id]?.zh || id || '';
export const statusKey = (s) => (STATUS[s.address_status] ? s.address_status : 'unresolved');
export const status = (s) => STATUS[statusKey(s)];
export const hasPoint = (s) => {
  const l = s.location;
  return !!l && Number.isFinite(l.wgs84_lat ?? l.lat) && Number.isFinite(l.wgs84_lon ?? l.lon);
};
export const point = (s) => [s.location.wgs84_lat ?? s.location.lat, s.location.wgs84_lon ?? s.location.lon];
export const shopDishes = (s) => (s.dish_ids || []).map((id) => db.dish[id]).filter(Boolean);

export function sortShops(list) {
  const cityRank = (s) => (s.city === 'zunyi' ? 0 : 1);
  return list.sort((a, b) =>
    PROV_ORDER.indexOf(a.province) - PROV_ORDER.indexOf(b.province) ||
    cityRank(a) - cityRank(b) ||
    (db.shopsByCity[b.city]?.length || 0) - (db.shopsByCity[a.city]?.length || 0) ||
    cityName(a.city).localeCompare(cityName(b.city), 'zh-CN') ||
    status(a).rank - status(b).rank);
}

/* Cities with real places, Guizhou first, busiest first. */
export function realCities(prov) {
  return db.D.cities
    .filter((c) => !isPseudoCity(c.id) && (!prov || prov === 'all' || c.province === prov))
    .sort((a, b) => PROV_ORDER.indexOf(a.province) - PROV_ORDER.indexOf(b.province) ||
      (a.id === 'zunyi' ? -1 : b.id === 'zunyi' ? 1 : 0) ||
      (db.shopsByCity[b.id]?.length || 0) - (db.shopsByCity[a.id]?.length || 0) ||
      dishCount(b.id) - dishCount(a.id));
}
export const dishCount = (cityId) => db.D.dishes.filter((d) => d.city === cityId).length;

/* ---------- formatting ---------- */
export const $ = (s, el = document) => el.querySelector(s);
export const $$ = (s, el = document) => [...el.querySelectorAll(s)];
export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const mmss = (t) => {
  t = Math.max(0, Math.round(t || 0));
  const h = Math.floor(t / 3600), m = Math.floor((t % 3600) / 60), s = t % 60;
  return (h ? h + ':' + String(m).padStart(2, '0') : m) + ':' + String(s).padStart(2, '0');
};
export const cad = (cny) => (cny == null ? '' : 'C$' + (cny * FX < 10 ? (cny * FX).toFixed(1) : Math.round(cny * FX)));
export const yt = (id, q = 'hqdefault') => `https://i.ytimg.com/vi/${id}/${q}.jpg`;
export const safeURL = (v) => { try { const u = new URL(v); return /^https?:$/.test(u.protocol) ? u.href : ''; } catch { return ''; } };
export const out = (url, label, cls = '') => (safeURL(url) ? `<a class="${cls}" href="${esc(safeURL(url))}" target="_blank" rel="noopener noreferrer">${esc(label)} <span aria-hidden="true">↗</span></a>` : '');
export const dots = (n, max = 5) => `<span class="dots" aria-hidden="true">${'<i class="on"></i>'.repeat(n)}${'<i></i>'.repeat(Math.max(0, max - n))}</span>`;
export const spice = (sp) => `<span class="spice" aria-label="麻 ${sp.ma}/5，辣 ${sp.la}/5"><span>麻${dots(sp.ma)}</span><span>辣${dots(sp.la)}</span></span>`;
export const price = (d) => (d.price_cny ? `¥${d.price_cny}` : d.price_cny === 0 ? '免费' : '');
export const priceFull = (d) => {
  const note = d.price_note_zh ? ` <small>${esc(d.price_note_zh)}</small>` : '';
  if (d.price_cny) return `<b>¥${d.price_cny}</b>${note} <small class="muted">约 ${cad(d.price_cny)}</small>`;
  if (d.price_cny === 0) return `<b>免费</b>${note}`;
  return note ? `<b>价格</b>${note}` : '<small class="muted">视频里没说价格</small>';
};
export const mark = (k) => `<i class="mark" data-status="${k}" aria-hidden="true"></i>`;
export const legend = () => Object.entries(STATUS).map(([k, v]) => `<span class="legend-item">${mark(k)}${v.label.replace('，待复核', '')}</span>`).join('');
export const shopHref = (s) => '#/shop/' + encodeURIComponent(s.id);
export const cityHref = (id) => '#/city/' + encodeURIComponent(id);

export function shopThumb(s) {
  const d = shopDishes(s).find((x) => x.img);
  if (d) return d.img.replace(/(sddefault|maxresdefault)\.jpg$/, 'hqdefault.jpg');
  const v = (s.videos || []).find((id) => db.video[id]);
  return v ? yt(v, 'mqdefault') : '';
}
export function thumb(src, label, cls = 'thumb') {
  return src
    ? `<span class="${cls}"><img src="${esc(src)}" alt="" loading="lazy" decoding="async" data-fallback="${esc(label)}"></span>`
    : `<span class="${cls} thumb-empty"><span>${esc(label)}</span></span>`;
}
export const seal = (id, cls = 'seal') => {
  const n = cityShort(id);
  return `<span class="${cls}" data-len="${n.length}" aria-hidden="true">${esc(n)}</span>`;
};

/* ---------- storage ---------- */
export const session = {
  get(k) { try { return sessionStorage.getItem(k); } catch { return null; } },
  set(k, v) { try { sessionStorage.setItem(k, v); } catch { /* storage unavailable */ } }
};

export function debounce(fn, ms = 200) {
  let t;
  const d = (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); };
  d.cancel = () => clearTimeout(t);
  return d;
}

/* Full-text match over a shop's useful fields. */
export function shopText(s) {
  return [s.name, s.address, s.relative_location, cityName(s.city), provName(s.province), ...(s.menu_notes || []), ...shopDishes(s).map((d) => d.zh)].join(' ').toLowerCase();
}
export function dishText(d) {
  return [d.zh, d.pinyin, d.what_zh, d.place_zh, cityName(d.city), CATS[d.category]].join(' ').toLowerCase();
}
