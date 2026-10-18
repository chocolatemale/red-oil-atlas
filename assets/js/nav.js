/* Navigation state shared by the router and the views. */
export const nav = { click: false, lastKey: '' };

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
  if (url !== location.hash) history.replaceState(history.state, '', url);
  nav.lastKey = url;
}

export function goto(hash) { nav.click = true; location.hash = hash; }
