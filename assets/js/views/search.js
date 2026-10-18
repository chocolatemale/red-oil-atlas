import { db, esc, shops, sortShops, shopText, dishText, cityShort, cityHref, price, debounce } from '../core.js';
import { icon } from '../icons.js';
import { setParams } from '../nav.js';
import { shopRow } from './shops.js';

export default function searchView(params) {
  const st = { q: params.get('q') || '' };
  return {
    name: 'search', tab: '', title: '搜索',
    html: `<div class="wrap page-pad">
      <h1 class="h1">搜索</h1>
      <label class="search-box" for="search-q">${icon.search}<span class="sr">搜索店名、菜名或城市</span>
        <input id="search-q" type="search" placeholder="店名、菜名、城市、街道" value="${esc(st.q)}" autocomplete="off" enterkeyhint="search"></label>
      <div data-results aria-live="polite"></div>
    </div>`,
    mount(root) {
      const input = root.querySelector('#search-q'), out = root.querySelector('[data-results]');
      const draw = () => {
        const n = st.q.trim().toLowerCase();
        setParams({ q: st.q.trim() });
        if (!n) {
          out.innerHTML = `<p class="muted">试试：<button type="button" class="link-btn" data-try="羊肉粉">羊肉粉</button>、<button type="button" class="link-btn" data-try="酸汤">酸汤</button>、<button type="button" class="link-btn" data-try="菌子">菌子</button>、<button type="button" class="link-btn" data-try="遵义">遵义</button></p>`;
          return;
        }
        const cs = db.D.cities.filter((c) => [c.zh, c.en, ...(c.vibe_tags || []).map((t) => t.zh)].join(' ').toLowerCase().includes(n));
        const ss = sortShops(shops().filter((s) => shopText(s).includes(n)));
        const ds = db.D.dishes.filter((d) => dishText(d).includes(n)).sort((a, b) => b.score - a.score);
        out.innerHTML = (cs.length ? `<section class="block"><h2 class="h3">城市</h2><div class="pill-row">${cs.map((c) => `<a class="pill" href="${cityHref(c.id)}">${esc(cityShort(c.id))}</a>`).join('')}</div></section>` : '') +
          (ss.length ? `<section class="block"><h2 class="h3">店铺 · ${ss.length}</h2><ul class="shop-list">${ss.slice(0, 20).map(shopRow).join('')}</ul></section>` : '') +
          (ds.length ? `<section class="block"><h2 class="h3">菜 · ${ds.length}</h2><ul class="plain-list">${ds.slice(0, 20).map((d) => `<li><button type="button" class="link-btn" data-dish="${esc(d.id)}">${esc(d.zh)}</button> <span class="muted">${esc(cityShort(d.city))}${price(d) ? ' · ' + price(d) : ''}</span></li>`).join('')}</ul></section>` : '') ||
          `<p class="muted">没有找到“${esc(st.q.trim())}”。换个说法，比如只写菜名的一部分。</p>`;
      };
      const typed = debounce(() => { st.q = input.value; draw(); }, 150);
      input.addEventListener('input', typed);
      root.addEventListener('click', (e) => {
        const t = e.target.closest('[data-try]');
        if (t) { input.value = st.q = t.dataset.try; draw(); }
      });
      draw();
      if (!st.q) input.focus();
      return () => typed.cancel();
    }
  };
}
