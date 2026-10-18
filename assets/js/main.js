/* Red Oil Atlas · 红油地图 — hash router and app shell. */
import { $, $$, esc, load, session } from './core.js';
import { initSheet, openDish, openPlayer, closeSheet } from './ui.js';
import home from './views/home.js';
import shopsView from './views/shops.js';
import shopView from './views/shop.js';
import citiesView from './views/cities.js';
import cityView from './views/city.js';
import mapView from './views/map.js';
import menuView from './views/menu.js';
import videosView from './views/videos.js';
import tipsView from './views/tips.js';
import searchView from './views/search.js';

const ROUTES = [
  [/^\/$/, home], [/^\/shops$/, shopsView], [/^\/shop\/(.+)$/, shopView], [/^\/cities$/, citiesView],
  [/^\/city\/(.+)$/, cityView], [/^\/map$/, mapView], [/^\/menu$/, menuView], [/^\/videos$/, videosView],
  [/^\/tips$/, tipsView], [/^\/search$/, searchView]
];

/* Old single-page anchors (#shop/<id>, #shops, #notes, #city-<id>…) keep working. */
function legacy(h) {
  if (h.startsWith('/')) return null;
  if (h.startsWith('shop/')) return '/shop/' + h.slice(5);
  if (h.startsWith('city-')) return '/city/' + h.slice(5);
  const map = { '': '/', top: '/', shops: '/shops', map: '/map', cities: '/cities', menu: '/menu', videos: '/videos', notes: '/tips' };
  return map[h] ?? '/';
}

export function current() {
  const h = location.hash.replace(/^#/, '');
  const [path, qs = ''] = h.split('?');
  let p = path || '/';
  try { p = decodeURI(p); } catch { /* keep raw */ }
  return { path: p, params: new URLSearchParams(qs), key: location.hash || '#/' };
}

/* Filters live in the URL (replaceState: no extra history entries), so going
 * back to a list, sharing it or reloading it shows the same thing. */
export function setParams(obj) {
  const { path, params } = current();
  for (const [k, v] of Object.entries(obj)) {
    if (v === '' || v == null || v === false) params.delete(k); else params.set(k, v);
  }
  const qs = params.toString();
  const url = '#' + path + (qs ? '?' + qs : '');
  history.replaceState(history.state, '', url);
  lastKey = url;
}

let navClick = false, lastIdx = 0, lastKey = '', cleanup = null, saving = true;
export const goto = (hash) => { navClick = true; location.hash = hash; };

function render() {
  const { path, params, key } = current();
  const fixed = legacy(location.hash.replace(/^#/, ''));
  if (fixed != null) { history.replaceState(history.state, '', '#' + fixed); return render(); }

  // history index: lets "back" buttons use real history (keeping scroll) when there is one
  const st = history.state || {};
  if (st.idx == null) history.replaceState({ ...st, idx: navClick ? lastIdx + 1 : 0 }, '');
  lastIdx = history.state.idx;

  let view = null, match = null;
  for (const [re, v] of ROUTES) { match = path.match(re); if (match) { view = v; break; } }
  if (!view) { view = home; match = ['/']; }

  closeSheet(true);
  cleanup?.(); cleanup = null;
  saving = false;
  const out = view(params, ...match.slice(1));
  const root = $('#view');
  root.innerHTML = out.html;
  root.dataset.view = out.name || '';
  document.body.dataset.view = out.name || '';
  document.title = out.title ? `${out.title} · 红油地图` : '红油地图 · 跟着盗月社吃西南';
  $$('[data-tab]').forEach((a) => {
    const on = a.dataset.tab === out.tab;
    a.classList.toggle('on', on);
    if (on) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
  });
  cleanup = out.mount?.(root) || null;

  const y = navClick ? 0 : Number(session.get('y:' + key) || 0);
  const fromClick = navClick;
  navClick = false; lastKey = location.hash || '#/';
  requestAnimationFrame(() => {
    window.scrollTo(0, y);
    saving = true;
    if (fromClick) root.focus({ preventScroll: true });
  });
}

function wire() {
  history.scrollRestoration = 'manual';
  document.addEventListener('click', (e) => {
    if (e.defaultPrevented || e.button > 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const back = e.target.closest('[data-back]');
    if (back && (history.state?.idx || 0) > 0) { e.preventDefault(); history.back(); return; }
    const a = e.target.closest('a[href^="#/"]');
    if (a && a.getAttribute('href') !== location.hash) navClick = true;
    const dish = e.target.closest('[data-dish]');
    if (dish) { e.preventDefault(); openDish(dish.dataset.dish); return; }
    const play = e.target.closest('[data-play]');
    if (play && !play.closest('[data-inline-player]')) {
      e.preventDefault();
      openPlayer(play.dataset.play, Number(play.dataset.t || 0), { text: play.dataset.quote, who: play.dataset.who });
    }
  });
  // A missing thumbnail becomes a quiet labelled tile instead of a broken image.
  document.addEventListener('error', (e) => {
    const img = e.target;
    if (!(img instanceof HTMLImageElement) || !img.dataset.fallback) return;
    const box = img.parentElement;
    box.classList.add('thumb-empty');
    box.innerHTML = `<span>${esc(img.dataset.fallback)}</span>`;
  }, true);
  // YouTube answers a missing high-res cover with a 120×90 grey frame.
  document.addEventListener('load', (e) => {
    const img = e.target;
    if (img instanceof HTMLImageElement && img.naturalWidth <= 120 && /i\.ytimg\.com\/vi\/[^/]+\/(sd|maxres)default\.jpg/.test(img.src)) img.src = img.src.replace(/(sd|maxres)default\.jpg$/, 'hqdefault.jpg');
  }, true);
  let t;
  window.addEventListener('scroll', () => {
    if (!saving) return;
    clearTimeout(t);
    t = setTimeout(() => session.set('y:' + (location.hash || '#/'), String(Math.round(window.scrollY))), 120);
  }, { passive: true });
  window.addEventListener('hashchange', () => { if ((location.hash || '#/') !== lastKey) render(); });
  initSheet((to) => goto(to));
}

async function boot() {
  wire();
  try {
    await load();
  } catch (err) {
    console.error(err);
    $('#view').innerHTML = `<div class="wrap pad"><h1 class="h1">数据没有加载出来</h1><p>${esc(err.message)}。请刷新页面再试一次。</p></div>`;
    return;
  }
  render();
}
boot();
