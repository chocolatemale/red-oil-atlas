import { db, esc, CATS, PROV_ORDER, provName, cityShort, price, dots, thumb, dishText, debounce, realCities } from '../core.js';
import { icon } from '../icons.js';
import { setParams } from '../main.js';

const SORTS = { score: '好评', price: '便宜', heat: '最辣', city: '按城市' };

export default function menuView(params) {
  const st = {
    q: params.get('q') || '', cat: params.get('cat') || 'all', p: params.get('p') || 'all', city: params.get('city') || '',
    sort: SORTS[params.get('sort')] ? params.get('sort') : 'score', heat: Math.min(5, Math.max(0, Number(params.get('heat') ?? 5)))
  };
  if (st.city && !db.city[st.city]) st.city = '';
  const D = db.D;
  const cats = Object.keys(CATS).filter((k) => D.dishes.some((d) => d.category === k));
  const provs = PROV_ORDER.filter((p) => D.dishes.some((d) => d.province === p));

  return {
    name: 'menu', tab: 'menu', title: '菜单',
    html: `<div class="page-head sticky-head">
      <div class="wrap">
        <div class="title-row"><h1 class="h1">菜单</h1><span class="muted">${D.dishes.length} 道主播吃过的</span></div>
        <label class="search-box slim" for="menu-q">${icon.search}<span class="sr">搜索菜品</span>
          <input id="menu-q" type="search" placeholder="米线、火锅、折耳根……" value="${esc(st.q)}" autocomplete="off" enterkeyhint="search"></label>
        <div class="filter-grid">
          <div class="chips" role="group" aria-label="类别" data-chips="cat">
            ${['all', ...cats].map((c) => `<button type="button" class="chip" data-v="${c}">${c === 'all' ? '全部' : CATS[c]}</button>`).join('')}
          </div>
          <div class="filter-foot">
            <div class="seg seg-sm" role="group" aria-label="排序" data-seg="sort">
              ${Object.entries(SORTS).map(([k, v]) => `<button type="button" data-v="${k}">${v}</button>`).join('')}
            </div>
            <label class="heat-ctl" for="menu-heat">辣度 ≤ <output data-heat-out>${st.heat}</output>
              <input id="menu-heat" type="range" min="0" max="5" step="1" value="${st.heat}"></label>
          </div>
          <div class="chips chips-sm" role="group" aria-label="地方" data-chips="where">
            <button type="button" class="chip" data-p="all">全部地方</button>
            ${provs.map((p) => `<button type="button" class="chip" data-p="${p}">${esc(provName(p))}</button>`).join('')}
            ${realCities().filter((c) => D.dishes.some((d) => d.city === c.id)).map((c) => `<button type="button" class="chip" data-city="${c.id}">${esc(cityShort(c.id))}</button>`).join('')}
          </div>
        </div>
      </div>
    </div>
    <div class="wrap">
      <p class="muted count" aria-live="polite" data-count></p>
      <ul class="dish-grid" data-list></ul>
      <p class="fine muted">价格是拍摄时的；C$ 按 1 元约 0.19 加元换算。麻是花椒的麻，辣是辣椒的辣，都按主播在镜头前的反应打 0–5 分。</p>
    </div>`,
    mount(root) {
      const q = root.querySelector('#menu-q'), heat = root.querySelector('#menu-heat');
      const draw = () => {
        root.querySelectorAll('[data-chips="cat"] button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.v === st.cat)));
        root.querySelectorAll('[data-seg="sort"] button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.v === st.sort)));
        root.querySelectorAll('[data-chips="where"] button').forEach((b) => b.setAttribute('aria-pressed', String(st.city ? b.dataset.city === st.city : b.dataset.p === st.p)));
        root.querySelector('[data-heat-out]').textContent = st.heat;
        const needle = st.q.trim().toLowerCase();
        const list = D.dishes.filter((d) => (st.cat === 'all' || d.category === st.cat) && (st.city ? d.city === st.city : st.p === 'all' || d.province === st.p) &&
          d.spice.la <= st.heat && (!needle || dishText(d).includes(needle)));
        const by = {
          score: (a, b) => b.score - a.score || PROV_ORDER.indexOf(a.province) - PROV_ORDER.indexOf(b.province),
          price: (a, b) => (a.price_cny ?? 1e9) - (b.price_cny ?? 1e9),
          heat: (a, b) => (b.spice.la + b.spice.ma) - (a.spice.la + a.spice.ma),
          city: (a, b) => PROV_ORDER.indexOf(a.province) - PROV_ORDER.indexOf(b.province) || a.city.localeCompare(b.city)
        }[st.sort];
        list.sort(by);
        root.querySelector('[data-count]').textContent = `共 ${list.length} 道`;
        root.querySelector('[data-list]').innerHTML = list.length ? list.map((d) => `<li><button type="button" class="dish-card-sm" data-dish="${esc(d.id)}">
            ${thumb(d.img?.replace(/(sd|maxres)default\.jpg$/, 'hqdefault.jpg'), d.zh, 'thumb thumb-wide')}
            <strong>${esc(d.zh)}</strong>
            <span class="muted">${esc(cityShort(d.city))}${price(d) ? ' · ' + price(d) : ''}${db.shopsByDish[d.id] ? ' · 有店' : ''}</span>
            <span class="heat-line">辣 ${dots(d.spice.la)}</span>
          </button></li>`).join('')
          : '<li class="empty"><p>没有符合条件的菜。调高辣度上限，或者去掉一个筛选试试。</p></li>';
        setParams({ q: st.q.trim(), cat: st.cat === 'all' ? '' : st.cat, p: st.city || st.p === 'all' ? '' : st.p, city: st.city, sort: st.sort === 'score' ? '' : st.sort, heat: st.heat === 5 ? '' : st.heat });
      };
      root.addEventListener('click', (e) => {
        const cat = e.target.closest('[data-chips="cat"] button');
        if (cat) { st.cat = cat.dataset.v; draw(); return; }
        const sort = e.target.closest('[data-seg="sort"] button');
        if (sort) { st.sort = sort.dataset.v; draw(); return; }
        const w = e.target.closest('[data-chips="where"] button');
        if (w) { st.city = w.dataset.city || ''; st.p = w.dataset.p || (st.city ? db.city[st.city].province : 'all'); draw(); }
      });
      q.addEventListener('input', debounce(() => { st.q = q.value; draw(); }, 180));
      heat.addEventListener('input', () => { st.heat = Number(heat.value); draw(); });
      draw();
    }
  };
}
